try { require('dotenv').config(); } catch (_) {}
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 10000;

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
            // Landing page critical resources
            linkHeaders = [
                '</SinanHan.min.css>; rel=preload; as=style; importance=high',
                '</SiminHan.min.js>; rel=preload; as=script; importance=high'
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
    origin: [
        'http://localhost:3000',
        'http://localhost:8000',
        'https://sinan-han-hotel-mostar.onrender.com',
        'https://sinan-han-hotel.onrender.com',
        'https://hotelsinanhan.com',
        'https://www.hotelsinanhan.com'
    ],
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

// === Booking API ===
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

function loadBookings() {
    if (!fs.existsSync(BOOKINGS_FILE)) return [];
    try { return JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8')); } catch { return []; }
}

function saveBooking(booking) {
    const bookings = loadBookings();
    bookings.push(booking);
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

function createMailTransporter() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;
    if (!user || !pass || user.includes('your_')) return null;
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: { user, pass }
    });
}

app.post('/api/bookings', async (req, res) => {
    try {
        const { guestName, email, phone, checkIn, checkOut, roomType, guests, totalPrice, currency } = req.body;

        if (!validators.email(email)) {
            return res.status(400).json({ error: 'Invalid email' });
        }
        if (!validators.dates(checkIn, checkOut)) {
            return res.status(400).json({ error: 'Invalid dates' });
        }
        if (!validators.guestCount(guests)) {
            return res.status(400).json({ error: 'Invalid guest count' });
        }

        const bookingId = 'SH-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();
        const booking = {
            bookingId,
            guestName: validators.sanitize(guestName || ''),
            email: validators.sanitize(email),
            phone: validators.sanitize(phone || ''),
            checkIn,
            checkOut,
            roomType: validators.sanitize(roomType || ''),
            guests,
            totalPrice,
            currency: currency || 'BAM',
            submittedAt: new Date().toISOString()
        };

        saveBooking(booking);

        const hotelEmail = process.env.BOOKING_REQUEST_EMAIL || 'about@hotelsinanhan.com';
        const transporter = createMailTransporter();

        if (transporter) {
            const hotelHtml = `
                <h2>New Booking Request — Sinan Han Hotel</h2>
                <table style="border-collapse:collapse;width:100%">
                    <tr><td style="padding:8px;border:1px solid #ddd"><strong>Booking ID</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.bookingId}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd"><strong>Guest Name</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.guestName}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd"><strong>Guest Email</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.email}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd"><strong>Phone</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.phone || 'N/A'}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd"><strong>Room</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.roomType}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd"><strong>Check-in</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.checkIn}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd"><strong>Check-out</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.checkOut}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd"><strong>Guests</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.guests}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd"><strong>Total Price</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.totalPrice ? booking.totalPrice + ' ' + booking.currency : 'N/A'}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd"><strong>Submitted</strong></td><td style="padding:8px;border:1px solid #ddd">${new Date(booking.submittedAt).toLocaleString()}</td></tr>
                </table>
                <p>Please reply to the guest at <a href="mailto:${booking.email}">${booking.email}</a> to confirm the reservation.</p>
            `;

            const guestHtml = `
                <h2>Booking Request Received — Sinan Han Hotel</h2>
                <p>Dear ${booking.guestName},</p>
                <p>Thank you for choosing Sinan Han Hotel in Mostar. We have received your booking request and will confirm it shortly.</p>
                <table style="border-collapse:collapse;width:100%">
                    <tr><td style="padding:8px;border:1px solid #ddd"><strong>Booking ID</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.bookingId}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd"><strong>Room</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.roomType}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd"><strong>Check-in</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.checkIn}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd"><strong>Check-out</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.checkOut}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd"><strong>Guests</strong></td><td style="padding:8px;border:1px solid #ddd">${booking.guests}</td></tr>
                </table>
                <p>If you have any questions, contact us at <a href="mailto:${hotelEmail}">${hotelEmail}</a>.</p>
                <p>Warm regards,<br>Sinan Han Hotel Team<br>Mostar, Bosnia &amp; Herzegovina</p>
            `;

            try {
                await transporter.sendMail({
                    from: `"Sinan Han Hotel Booking" <${process.env.EMAIL_USER}>`,
                    to: hotelEmail,
                    replyTo: booking.email,
                    subject: `New Booking Request from ${booking.guestName} — ${booking.bookingId}`,
                    html: hotelHtml
                });
                await transporter.sendMail({
                    from: `"Sinan Han Hotel" <${process.env.EMAIL_USER}>`,
                    to: booking.email,
                    subject: `Booking Request Received — Sinan Han Hotel (${booking.bookingId})`,
                    html: guestHtml
                });
                console.log(`✅ Emails sent for booking ${bookingId}`);
            } catch (mailErr) {
                console.error('⚠️ Email send failed (booking still saved):', mailErr.message);
            }
        } else {
            console.warn('⚠️ Email not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env to enable email notifications.');
        }

        res.json({ success: true, bookingId });
    } catch (error) {
        console.error('Booking error:', error.message);
        res.status(500).json({ error: 'Failed to process booking', message: error.message });
    }
});

// === Monri Payment Endpoints ===
const MONRI_MERCHANT_ID = process.env.MONRI_MERCHANT_ID;
const MONRI_SECRET_KEY = process.env.MONRI_SECRET_KEY;
const PAYMENT_CURRENCY = process.env.PAYMENT_CURRENCY || 'BAM';

function generateMonriDigest(merchantId, amountCents, currency, orderNumber, timestamp) {
    const data = `${merchantId}|${amountCents}|${currency}|${orderNumber}|${timestamp}`;
    return crypto.createHmac('sha256', MONRI_SECRET_KEY).update(data).digest('hex');
}

app.post('/api/payment/init', async (req, res) => {
    try {
        const { guestName, email, checkIn, checkOut, roomType, guests, totalPrice, currency } = req.body;

        if (!email || !validators.email(email)) {
            return res.status(400).json({ error: 'Invalid email' });
        }
        if (!totalPrice || totalPrice <= 0) {
            return res.status(400).json({ error: 'Invalid price' });
        }
        if (!MONRI_MERCHANT_ID || !MONRI_SECRET_KEY) {
            return res.status(500).json({ error: 'Payment not configured' });
        }

        const orderNumber = 'SH-' + Date.now();
        const amountCents = Math.round(parseFloat(totalPrice) * 100);
        const timestamp = Math.floor(Date.now() / 1000);
        const usedCurrency = currency || PAYMENT_CURRENCY;
        const digest = generateMonriDigest(MONRI_MERCHANT_ID, amountCents, usedCurrency, orderNumber, timestamp);

        const booking = {
            orderNumber,
            bookingId: orderNumber,
            guestName: validators.sanitize(guestName || ''),
            email: validators.sanitize(email),
            checkIn,
            checkOut,
            roomType: validators.sanitize(roomType || ''),
            guests,
            totalPrice,
            currency: usedCurrency,
            status: 'pending',
            submittedAt: new Date().toISOString()
        };
        saveBooking(booking);

        console.log(`🔐 Payment init: ${orderNumber} — ${guestName} — ${totalPrice} ${usedCurrency}`);

        res.json({
            success: true,
            merchantId: MONRI_MERCHANT_ID,
            amount: amountCents,
            currency: usedCurrency,
            orderNumber,
            digest,
            timestamp,
            guestName: booking.guestName,
            email: booking.email
        });
    } catch (error) {
        console.error('Payment init error:', error.message);
        res.status(500).json({ error: 'Failed to initialize payment', message: error.message });
    }
});

app.get('/api/booking/:orderNumber', (req, res) => {
    const bookings = loadBookings();
    const booking = bookings.find(b => b.orderNumber === req.params.orderNumber || b.bookingId === req.params.orderNumber);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ status: booking.status, bookingId: booking.orderNumber });
});

app.post('/webhook/monri', async (req, res) => {
    try {
        const { order_number, status, transaction_id } = req.body;
        if (!order_number) return res.status(400).json({ error: 'Missing order_number' });

        const bookings = loadBookings();
        const idx = bookings.findIndex(b => b.orderNumber === order_number || b.bookingId === order_number);
        if (idx === -1) return res.status(404).json({ error: 'Booking not found' });

        const approved = ['approved', 'success', 'paid'].includes((status || '').toLowerCase());
        bookings[idx].status = approved ? 'paid' : 'declined';
        if (transaction_id) bookings[idx].transactionId = transaction_id;
        bookings[idx].updatedAt = new Date().toISOString();
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));

        if (approved) {
            const b = bookings[idx];
            const hotelEmail = process.env.BOOKING_REQUEST_EMAIL || 'about@hotelsinanhan.com';
            const transporter = createMailTransporter();
            if (transporter) {
                const confirmHtml = `<h2>Payment Confirmed — Sinan Han Hotel</h2><p>Booking <strong>${b.orderNumber}</strong> has been paid.</p><p>Guest: ${b.guestName} &lt;${b.email}&gt;</p><p>Room: ${b.roomType} | Check-in: ${b.checkIn} | Check-out: ${b.checkOut}</p><p>Amount: ${b.totalPrice} ${b.currency}</p>${transaction_id ? '<p>Transaction ID: ' + transaction_id + '</p>' : ''}`;
                try {
                    await transporter.sendMail({ from: `"Sinan Han Hotel" <${process.env.EMAIL_USER}>`, to: hotelEmail, subject: `✅ Payment Confirmed — ${b.orderNumber}`, html: confirmHtml });
                    await transporter.sendMail({ from: `"Sinan Han Hotel" <${process.env.EMAIL_USER}>`, to: b.email, subject: `Your booking is confirmed — Sinan Han Hotel (${b.orderNumber})`, html: `<h2>Booking Confirmed!</h2><p>Dear ${b.guestName},</p><p>Your payment was successful. Booking ID: <strong>${b.orderNumber}</strong></p><p>Room: ${b.roomType} | Check-in: ${b.checkIn} | Check-out: ${b.checkOut}</p><p>We look forward to welcoming you!<br>Sinan Han Hotel, Mostar</p>` });
                } catch (mailErr) {
                    console.error('⚠️ Webhook email failed:', mailErr.message);
                }
            }
            console.log(`✅ Payment confirmed: ${order_number}`);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// === Payment Result Redirect (Monri redirect_url handler) ===
app.get('/payment/result', (req, res) => {
    const status = (req.query.status || '').toLowerCase();
    const orderNumber = req.query.order_number || '';
    const approved = ['approved', 'success', 'paid'].includes(status);
    const page = approved ? 'payment-success.html' : 'payment-failed.html';
    res.redirect(`/${page}?order_number=${encodeURIComponent(orderNumber)}`);
});

// Explicit routes for payment result pages (linkable from Render.io console)
app.get('/payment-success', (req, res) => res.sendFile(path.join(__dirname, 'payment-success.html')));
app.get('/payment-failed', (req, res) => res.sendFile(path.join(__dirname, 'payment-failed.html')));

// === Serve index.html with injected environment ===
app.get('/', (req, res) => {
    try {
        const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')
            .replace("'REPLACE_WITH_NODE_ENV'", JSON.stringify(process.env.NODE_ENV || 'development'));
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (err) {
        res.sendFile(path.join(__dirname, 'index.html'));
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sinan Han Hotel Server running on 0.0.0.0:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
