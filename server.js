require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const axios = require('axios');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// === Middleware ===
// Enable gzip compression for all responses
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6, // Balance between compression ratio and speed
    threshold: 1000 // Only compress responses > 1KB
}));

// Static file serving with cache headers
app.use(express.static(path.join(__dirname), {
    maxAge: '1d', // Default cache control
    etag: false
}));

// Cache minified assets with long expiration (immutable)
app.get('*.min.css', (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    next();
});

app.get('*.min.js', (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    next();
});

// Cache images longer
app.get(/\.(jpg|jpeg|png|gif|webp|svg)$/i, (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=604800'); // 7 days
    res.set('Vary', 'Accept'); // Support content negotiation for WebP
    next();
});

// HTTP/2 Server Push - Preload critical resources
app.use((req, res, next) => {
    // Send Link headers for server push on HTML requests
    if (req.url === '/' || req.url.endsWith('.html')) {
        let linkHeaders = [];

        // Push critical CSS and JS for optimal performance
        // These will be automatically fetched by HTTP/2 clients
        if (req.url === '/' || req.url.includes('index.html')) {
            // Frontend booking system critical resources
            linkHeaders = [
                '</js/api.js>; rel=preload; as=script; importance=high',
                '</js/main.js>; rel=preload; as=script; importance=high'
            ];
        } else if (req.url.includes('SinanHan.html')) {
            // Legacy landing page critical resources
            linkHeaders = [
                '</SinanHan.min.css>; rel=preload; as=style; importance=high',
                '</SiminHan.min.js>; rel=preload; as=script; importance=high'
            ];
        }

        if (linkHeaders.length > 0) {
            res.set('Link', linkHeaders.join(', '));
        }
    }
    next();
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000'],
    credentials: true
}));

// === CSRF Token Management ===
const csrf = {
    secret: process.env.CSRF_SECRET || 'change_me_to_random_32_char_string',

    generateToken: () => {
        return crypto.randomBytes(32).toString('hex');
    },

    validateToken: (token, storedToken) => {
        if (!token || !storedToken) return false;
        return crypto.timingSafeEqual(
            Buffer.from(token),
            Buffer.from(storedToken)
        );
    }
};

// Store CSRF tokens in memory (for production, use Redis or database)
const csrf_tokens = new Map();

// === CSRF Routes ===
app.get('/api/csrf-token', (req, res) => {
    const token = csrf.generateToken();
    const sessionId = crypto.randomBytes(16).toString('hex');

    // Store token temporarily (30 minutes)
    csrf_tokens.set(sessionId, {
        token,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000
    });

    res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 60 * 1000
    });

    res.json({ token, sessionId });
});

// === CSRF Validation Middleware ===
const validateCSRF = (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const token = req.headers['x-csrf-token'] || req.body.csrfToken;
    const sessionId = req.cookies.sessionId;

    if (!token || !sessionId) {
        return res.status(403).json({ error: 'CSRF token missing' });
    }

    const storedData = csrf_tokens.get(sessionId);
    if (!storedData) {
        return res.status(403).json({ error: 'Invalid CSRF session' });
    }

    // Check expiration
    if (Date.now() > storedData.expiresAt) {
        csrf_tokens.delete(sessionId);
        return res.status(403).json({ error: 'CSRF token expired' });
    }

    // Validate token
    try {
        if (!csrf.validateToken(token, storedData.token)) {
            return res.status(403).json({ error: 'Invalid CSRF token' });
        }
    } catch (err) {
        return res.status(403).json({ error: 'CSRF validation failed' });
    }

    next();
};

app.use('/api/', validateCSRF);

// === Input Validation Utilities ===
const validators = {
    email: (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    phone: (phone) => {
        // Accept +XXX format or 10+ digits
        const regex = /^[\d\s\-\+]{10,}$/;
        return regex.test(phone.replace(/\s/g, ''));
    },

    dates: (checkIn, checkOut) => {
        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return inDate >= today && outDate > inDate;
    },

    guestCount: (count) => {
        const num = parseInt(count);
        return num >= 1 && num <= 8;
    },

    sanitize: (input) => {
        if (typeof input !== 'string') return input;
        return input
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .trim();
    }
};

// === Booking API Proxy ===
app.post('/api/bookings', async (req, res) => {
    try {
        const { guestName, email, phone, checkIn, checkOut, roomType, guests } = req.body;

        // Validate inputs
        if (!validators.email(email)) {
            return res.status(400).json({ error: 'Invalid email' });
        }

        if (!validators.phone(phone)) {
            return res.status(400).json({ error: 'Invalid phone number' });
        }

        if (!validators.dates(checkIn, checkOut)) {
            return res.status(400).json({ error: 'Invalid dates' });
        }

        if (!validators.guestCount(guests)) {
            return res.status(400).json({ error: 'Invalid guest count' });
        }

        // Sanitize text inputs
        const cleanData = {
            guestName: validators.sanitize(guestName),
            email: validators.sanitize(email),
            phone: validators.sanitize(phone),
            checkIn,
            checkOut,
            roomType: validators.sanitize(roomType),
            guests
        };

        // Forward to Booking.com API (use your actual implementation)
        const bookingComResponse = await axios.post(
            `${process.env.BOOKING_COM_BASE_URL}/bookings`,
            cleanData,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.BOOKING_COM_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(bookingComResponse.data);
    } catch (error) {
        console.error('Booking error:', error.message);
        res.status(500).json({
            error: 'Failed to process booking',
            message: error.message
        });
    }
});

// === Payment API Proxy ===
app.post('/api/payments', async (req, res) => {
    try {
        const {
            bookingId,
            amount,
            currency,
            paymentMethod,
            cardHolder,
            cardLastFour,
            expiryDate,
            billingAddress
        } = req.body;

        // Basic validation
        if (!bookingId || !amount || !paymentMethod) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Forward to payment API (sensitive card info should not be logged)
        const paymentResponse = await axios.post(
            `${process.env.MORI_BASE_URL}/payments`,
            {
                bookingId,
                amount,
                currency,
                paymentMethod,
                cardLastFour, // Only last 4 digits
                billingAddress: validators.sanitize(JSON.stringify(billingAddress))
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.MORI_API_KEY}`,
                    'X-Merchant-ID': process.env.MORI_MERCHANT_ID,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            success: true,
            transactionId: paymentResponse.data.transactionId,
            status: paymentResponse.data.status
        });
    } catch (error) {
        console.error('Payment error:', error.message);
        res.status(500).json({
            error: 'Payment processing failed',
            message: 'Please try again or contact support'
        });
    }
});

// === Health Check ===
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// === Error Handler ===
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// === Start Server ===
app.listen(PORT, () => {
    console.log(`🚀 Sinan Han Hotel Server running at http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
