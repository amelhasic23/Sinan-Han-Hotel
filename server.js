try { require('dotenv').config({ path: require('path').resolve(__dirname, '.env') }); } catch (_) {}
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const nodemailer = require('nodemailer');
const https = require('https');

const app = express();
app.set('trust proxy', 1);
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

// Security headers — improves Lighthouse Best Practices score
app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'SAMEORIGIN');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});

// Explicit sw.js route — must be before static middleware to ensure correct
// Content-Type, no-cache headers, and Service-Worker-Allowed scope header
app.get('/sw.js', (req, res) => {
    res.set({
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Service-Worker-Allowed': '/'
    });
    res.sendFile(path.join(__dirname, 'sw.js'));
});

// Static file serving with cache headers — index:false ensures the explicit '/' route
// handles index.html so NODE_ENV injection works correctly
app.use(express.static(path.join(__dirname), {
    etag: false,
    index: false,
    setHeaders(res, filePath) {
        if (/\.(min\.css|min\.js)$/.test(filePath) || /fa-icons\.css$/.test(filePath)) {
            res.set('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (/share-modal\.js$/.test(filePath)) {
            res.set('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filePath)) {
            res.set('Cache-Control', 'public, max-age=31536000, immutable');
            res.set('Vary', 'Accept');
        } else if (/\.(woff2?|ttf|otf)$/i.test(filePath)) {
            res.set('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (/sw\.js$/.test(filePath)) {
            res.set('Cache-Control', 'no-store, no-cache');
        } else if (/\.js$/.test(filePath)) {
            res.set('Cache-Control', 'public, max-age=86400');
        } else {
            res.set('Cache-Control', 'public, max-age=86400');
        }
    }
}));

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
                '</SinanHan.min.css?v=6>; rel=preload; as=style; importance=high'
            ];
        } else if (req.url.includes('SinanHan.html')) {
            // Legacy landing page critical resources
            linkHeaders = [
                '</SinanHan.min.css?v=6>; rel=preload; as=style; importance=high'
            ];
        }

        if (linkHeaders.length > 0) {
            res.set('Link', linkHeaders.join(', '));
        }
    }
    next();
});

app.use(express.json({
    // Capture raw body for webhook signature verification (must stay in verify callback)
    verify: (req, res, buf) => {
        if (req.path && req.path.startsWith('/webhook/')) {
            req.rawBody = buf.toString('utf8');
        }
    }
}));
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

// === CSRF Token Management (stateless HMAC — survives server restarts) ===
const CSRF_SECRET = process.env.CSRF_SECRET || 'd05a27e534103197ff40d5328477fa8354eed4666d755688dedf357e3a825529';

function csrfGenerateToken(sessionId) {
    const nonce = crypto.randomBytes(16).toString('hex');
    const hmac = crypto.createHmac('sha256', CSRF_SECRET)
        .update(nonce + ':' + sessionId)
        .digest('hex');
    return `${nonce}.${hmac}`;
}

function csrfValidateToken(token, sessionId) {
    if (!token || !sessionId) return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [nonce, hmac] = parts;
    const expected = crypto.createHmac('sha256', CSRF_SECRET)
        .update(nonce + ':' + sessionId)
        .digest('hex');
    const a = Buffer.from(hmac);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}

// === CSRF Routes ===
app.get('/api/csrf-token', (req, res) => {
    // Reuse existing sessionId so multiple scripts on the same page don't
    // overwrite each other's cookie and invalidate already-fetched tokens.
    const sessionId = (req.cookies && req.cookies.sessionId) || crypto.randomBytes(16).toString('hex');
    const token = csrfGenerateToken(sessionId);

    res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 60 * 1000
    });

    res.json({ token });
});

// === CSRF Validation Middleware ===
const validateCSRF = (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const token = req.headers['x-csrf-token'] || (req.body && req.body.csrfToken);
    const sessionId = req.cookies && req.cookies.sessionId;

    if (!token || !sessionId) {
        return res.status(403).json({ error: 'CSRF token missing' });
    }

    if (!csrfValidateToken(token, sessionId)) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
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
const MONRI_ENVIRONMENT = process.env.MONRI_ENVIRONMENT || 'test';
const PAYMENT_CURRENCY = process.env.PAYMENT_CURRENCY || 'BAM';

// WebPay form digest per Monri docs: SHA512(key + order_number + amount + currency)
function calcWebPayDigest(key, orderNumber, amountCents, currency) {
    return crypto.createHash('sha512')
        .update(key + orderNumber + String(amountCents) + currency)
        .digest('hex');
}

// WP3-v2.1 auth used by ALL Monri REST APIs (Pay By Link, Components, Customer API)
// Per Monri docs: digest = sha512(merchant_key + timestamp + authenticity_token + fullpath + body)
// Header format: "WP3-v2.1 {authenticity_token} {timestamp} {digest}"
// For GET/DELETE requests pass bodyStr as empty string ''
function generateWP3Auth(merchantKey, authenticityToken, fullpath, bodyStr) {
    const timestamp = Math.floor(Date.now() / 1000);
    const digest = crypto.createHash('sha512')
        .update(merchantKey + String(timestamp) + authenticityToken + fullpath + (bodyStr || ''))
        .digest('hex');
    return {
        timestamp,
        header: `WP3-v2.1 ${authenticityToken} ${timestamp} ${digest}`
    };
}

// Verify Monri callback: Authorization = "WP3-callback sha512(merchant_key + raw_body)"
function verifyMonriCallback(authHeader, rawBody, merchantKey) {
    if (!authHeader || !authHeader.startsWith('WP3-callback ')) return false;
    const received = authHeader.slice('WP3-callback '.length).trim();
    const expected = crypto.createHash('sha512')
        .update(merchantKey + rawBody)
        .digest('hex');
    try {
        const a = Buffer.from(received, 'hex');
        const b = Buffer.from(expected, 'hex');
        if (a.length !== b.length) return false;
        return crypto.timingSafeEqual(a, b);
    } catch { return false; }
}

// Verify Monri success URL digest: SHA512(key + full_success_url_without_digest_param)
function verifySuccessDigest(key, fullUrl) {
    try {
        const urlObj = new URL(fullUrl);
        const returnedDigest = (urlObj.searchParams.get('digest') || '').replace(/\s/g, '');
        if (!returnedDigest) return false;
        urlObj.searchParams.delete('digest');
        const urlWithoutDigest = urlObj.toString();
        const expected = crypto.createHash('sha512')
            .update(key + urlWithoutDigest)
            .digest('hex');
        const a = Buffer.from(returnedDigest, 'hex');
        const b = Buffer.from(expected, 'hex');
        if (a.length !== b.length) return false;
        return crypto.timingSafeEqual(a, b);
    } catch { return false; }
}

// Generic HTTPS request for all Monri API calls (GET, POST, DELETE)
function httpsRequest(method, url, headers, bodyStr) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const hasBody = bodyStr && bodyStr.length > 0;
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: method.toUpperCase(),
            headers: { ...headers }
        };
        if (hasBody) options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
                } catch (e) {
                    reject(new Error(`Invalid JSON from Monri: ${data}`));
                }
            });
        });
        req.on('error', reject);
        if (hasBody) req.write(bodyStr);
        req.end();
    });
}
function httpsPost(url, headers, bodyStr) {
    return httpsRequest('POST', url, headers, bodyStr);
}

function validatePaymentInput(data) {
    const errors = [];
    if (!data.name || data.name.trim().length < 2) errors.push('Invalid name');
    if (!data.email || !data.email.includes('@')) errors.push('Invalid email');
    if (!data.checkin_date || !data.checkout_date) errors.push('Missing check-in or check-out date');
    const checkin = new Date(data.checkin_date);
    const checkout = new Date(data.checkout_date);
    if (isNaN(checkin.getTime()) || isNaN(checkout.getTime())) errors.push('Invalid date format');
    if (checkout <= checkin) errors.push('Check-out date must be after check-in date');
    // Compare date-only (strip time) so today is a valid checkout date regardless of server timezone
    const todayStr = new Date().toISOString().slice(0, 10);
    const checkoutStr = data.checkout_date.slice(0, 10);
    if (checkoutStr < todayStr) errors.push('Check-out date must not be in the past');
    if (!data.room_id || data.room_id.trim().length < 1) errors.push('Invalid room ID');
    if (!data.price || data.price <= 0) errors.push('Invalid price');
    if (!data.adults_number || data.adults_number < 1) errors.push('Invalid number of adults');
    return errors;
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
        const digest = calcWebPayDigest(MONRI_SECRET_KEY, orderNumber, amountCents, usedCurrency);

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

app.post('/api/payment/pay-by-link', async (req, res) => {
    try {
        const body = req.body;
        const bookingData = {
            name: (body.name || body.guestName || '').trim(),
            email: (body.email || '').trim(),
            phone: (body.phone || '').trim(),
            checkin_date: body.checkin_date || body.checkIn || body.checkInDate || '',
            checkout_date: body.checkout_date || body.checkOut || body.checkOutDate || '',
            room_id: body.room_id || body.roomType || '',
            hotel_id: body.hotel_id || 'sinan-han',
            adults_number: parseInt(body.adults_number || body.guests || 1),
            price: parseFloat(body.price || body.totalPrice || 0),
            currency: (body.currency || PAYMENT_CURRENCY).toUpperCase()
        };

        const validationErrors = validatePaymentInput(bookingData);
        if (validationErrors.length > 0) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: validationErrors });
        }

        if (!MONRI_MERCHANT_ID || !MONRI_SECRET_KEY) {
            return res.status(500).json({ success: false, error: 'Payment not configured' });
        }

        const orderNumber = 'SH-' + Date.now();
        const amountCents = Math.round(bookingData.price * 100);
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const monriBase = MONRI_ENVIRONMENT === 'test' ? 'https://ipgtest.monri.com' : 'https://ipg.monri.com';
        const fullpath = '/v2/terminal-entry/create-or-update';

        const monriBody = {
            transaction_type: 'purchase',
            amount: amountCents,
            currency: bookingData.currency,
            order_number: orderNumber,
            order_info: 'Hotel Sinan Han - Room Booking',
            language: 'en',
            ch_full_name: bookingData.name,
            ch_email: bookingData.email,
            ch_phone: bookingData.phone || '',
            ch_country: 'BA',
            supported_payment_methods: ['card'],
            success_url_override: `${baseUrl}/payment-success?order_number=${orderNumber}`,
            cancel_url_override: `${baseUrl}/payment-failed?order_number=${orderNumber}`,
            callback_url_override: `${baseUrl}/webhook/monri`
        };

        const bodyStr = JSON.stringify(monriBody);
        const auth = generateWP3Auth(MONRI_SECRET_KEY, MONRI_MERCHANT_ID, fullpath, bodyStr);

        console.log(`[Monri] ▶ POST ${monriBase}${fullpath}`);
        console.log(`[Monri] merchantId=${MONRI_MERCHANT_ID} env=${MONRI_ENVIRONMENT} timestamp=${auth.timestamp}`);
        console.log(`[Monri] auth header=${auth.header}`);
        console.log(`[Monri] request body=${bodyStr}`);

        const monriRes = await httpsPost(`${monriBase}${fullpath}`, {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': auth.header
        }, bodyStr);

        console.log(`[Monri] ◀ response status=${monriRes.status} body=${JSON.stringify(monriRes.body)}`);

        if (monriRes.status !== 200 || !monriRes.body.payment_url) {
            console.error(`[Monri] ✗ Payment URL not received. status=${monriRes.status} details=${JSON.stringify(monriRes.body)}`);
            return res.status(502).json({
                success: false,
                error: 'Monri API error',
                monriStatus: monriRes.status,
                details: monriRes.body.message || monriRes.body.status || monriRes.body.error || 'No details returned',
                monriBody: monriRes.body
            });
        }

        saveBooking({
            orderNumber,
            bookingId: orderNumber,
            guestName: bookingData.name,
            email: bookingData.email,
            phone: bookingData.phone,
            roomType: bookingData.room_id,
            checkIn: bookingData.checkin_date,
            checkOut: bookingData.checkout_date,
            guests: bookingData.adults_number,
            totalPrice: bookingData.price,
            currency: bookingData.currency,
            status: 'pending',
            paymentType: 'pay-by-link',
            submittedAt: new Date().toISOString()
        });

        console.log(`Monri payment_url created: ${monriRes.body.payment_url}`);
        res.json({ success: true, payment_url: monriRes.body.payment_url, order_number: orderNumber });

    } catch (error) {
        console.error('Pay By Link error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to create payment link', message: error.message });
    }
});

// Temporary debug endpoint — remove after Monri auth is confirmed working
app.get('/api/debug-monri', async (req, res) => {
    if (!MONRI_MERCHANT_ID || !MONRI_SECRET_KEY) {
        return res.json({ error: 'Monri env vars not set', MONRI_MERCHANT_ID: !!MONRI_MERCHANT_ID, MONRI_SECRET_KEY: !!MONRI_SECRET_KEY });
    }
    const fullpath = '/v2/terminal-entry/create-or-update';
    const testBody = JSON.stringify({
        transaction_type: 'purchase', amount: 100, currency: 'BAM',
        order_number: 'TEST-' + Date.now(), order_info: 'debug test',
        language: 'en', ch_full_name: 'Test User', ch_email: 'test@test.com',
        ch_phone: '', ch_country: 'BA', supported_payment_methods: ['card'],
        success_url_override: 'https://hotelsinanhan.com/payment-success',
        cancel_url_override: 'https://hotelsinanhan.com/payment-failed',
        callback_url_override: 'https://hotelsinanhan.com/webhook/monri'
    });
    const auth = generateWP3Auth(MONRI_SECRET_KEY, MONRI_MERCHANT_ID, fullpath, testBody);
    const monriBase = MONRI_ENVIRONMENT === 'test' ? 'https://ipgtest.monri.com' : 'https://ipg.monri.com';
    try {
        const monriRes = await httpsPost(`${monriBase}${fullpath}`, {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': auth.header
        }, testBody);
        res.json({
            environment: MONRI_ENVIRONMENT,
            monriUrl: `${monriBase}${fullpath}`,
            merchantId: MONRI_MERCHANT_ID,
            monriHttpStatus: monriRes.status,
            monriBody: monriRes.body
        });
    } catch (err) {
        res.json({ error: err.message });
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
        // Verify Monri callback signature (WP3-callback schema)
        const rawBody = req.rawBody || JSON.stringify(req.body);
        const authHeader = req.headers['authorization'] || req.headers['http_authorization'] || '';
        if (MONRI_SECRET_KEY && authHeader) {
            if (!verifyMonriCallback(authHeader, rawBody, MONRI_SECRET_KEY)) {
                console.warn('[Monri webhook] Invalid signature — request rejected');
                return res.status(401).json({ error: 'Invalid signature' });
            }
        }

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

// === Monri WebPay Form — generate form params for direct POST to Monri ===
app.post('/api/payment/webpay-form', async (req, res) => {
    try {
        const body = req.body;
        const bookingData = {
            name: ((body.name || body.guestName || '')).trim(),
            email: (body.email || '').trim(),
            phone: (body.phone || '').trim(),
            checkin_date: body.checkin_date || body.checkIn || '',
            checkout_date: body.checkout_date || body.checkOut || '',
            room_id: body.room_id || body.roomType || '',
            adults_number: parseInt(body.adults_number || body.guests || 1),
            price: parseFloat(body.price || body.totalPrice || 0),
            currency: (body.currency || PAYMENT_CURRENCY).toUpperCase()
        };

        const validationErrors = validatePaymentInput(bookingData);
        if (validationErrors.length > 0) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: validationErrors });
        }
        if (!MONRI_MERCHANT_ID || !MONRI_SECRET_KEY) {
            return res.status(500).json({ success: false, error: 'Payment not configured' });
        }

        const orderNumber = 'SH-' + Date.now();
        const amountCents = Math.round(bookingData.price * 100);
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const monriBase = MONRI_ENVIRONMENT === 'test' ? 'https://ipgtest.monri.com' : 'https://ipg.monri.com';
        const digest = calcWebPayDigest(MONRI_SECRET_KEY, orderNumber, amountCents, bookingData.currency);

        saveBooking({
            orderNumber, bookingId: orderNumber,
            guestName: bookingData.name, email: bookingData.email,
            phone: bookingData.phone, roomType: bookingData.room_id,
            checkIn: bookingData.checkin_date, checkOut: bookingData.checkout_date,
            guests: bookingData.adults_number,
            totalPrice: bookingData.price, currency: bookingData.currency,
            status: 'pending', paymentType: 'webpay-form',
            submittedAt: new Date().toISOString()
        });

        console.log(`[WebPay] order=${orderNumber} amount=${amountCents} currency=${bookingData.currency}`);
        res.json({
            success: true,
            action: `${monriBase}/v2/form`,
            fields: {
                authenticity_token: MONRI_MERCHANT_ID,
                order_number: orderNumber,
                amount: amountCents,
                currency: bookingData.currency,
                order_info: 'Hotel Sinan Han - Room Booking',
                ch_full_name: bookingData.name,
                ch_email: bookingData.email,
                ch_phone: bookingData.phone || '',
                ch_address: 'Mostar',
                ch_city: 'Mostar',
                ch_zip: '88000',
                ch_country: 'BA',
                language: 'en',
                transaction_type: 'purchase',
                digest,
                success_url_override: `${baseUrl}/payment-success?order_number=${orderNumber}`,
                cancel_url_override: `${baseUrl}/payment-failed?order_number=${orderNumber}`,
                callback_url_override: `${baseUrl}/webhook/monri`
            }
        });
    } catch (error) {
        console.error('WebPay form error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to prepare payment form', message: error.message });
    }
});

// === Monri Components API — create payment session (POST /v2/payment/new) ===
app.post('/api/payment/new', async (req, res) => {
    try {
        const body = req.body;
        const bookingData = {
            name: ((body.name || body.guestName || '')).trim(),
            email: (body.email || '').trim(),
            phone: (body.phone || '').trim(),
            checkin_date: body.checkin_date || body.checkIn || '',
            checkout_date: body.checkout_date || body.checkOut || '',
            room_id: body.room_id || body.roomType || '',
            adults_number: parseInt(body.adults_number || body.guests || 1),
            price: parseFloat(body.price || body.totalPrice || 0),
            currency: (body.currency || PAYMENT_CURRENCY).toUpperCase()
        };

        const validationErrors = validatePaymentInput(bookingData);
        if (validationErrors.length > 0) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: validationErrors });
        }
        if (!MONRI_MERCHANT_ID || !MONRI_SECRET_KEY) {
            return res.status(500).json({ success: false, error: 'Payment not configured' });
        }

        const orderNumber = 'SH-' + Date.now();
        const amountCents = Math.round(bookingData.price * 100);
        const monriBase = MONRI_ENVIRONMENT === 'test' ? 'https://ipgtest.monri.com' : 'https://ipg.monri.com';

        const monriBody = {
            amount: amountCents,
            order_number: orderNumber,
            currency: bookingData.currency,
            transaction_type: 'purchase',
            order_info: 'Hotel Sinan Han - Room Booking',
            scenario: 'charge',
            supported_payment_methods: ['card']
        };
        const bodyStr = JSON.stringify(monriBody);
        const auth = generateWP3Auth(MONRI_SECRET_KEY, MONRI_MERCHANT_ID, '/v2/payment/new', bodyStr);

        console.log(`[Components] ▶ POST ${monriBase}/v2/payment/new order=${orderNumber}`);
        const monriRes = await httpsPost(`${monriBase}/v2/payment/new`, {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': auth.header
        }, bodyStr);

        if (!monriRes.body || !monriRes.body.client_secret) {
            console.error(`[Components] /v2/payment/new failed: status=${monriRes.status} body=${JSON.stringify(monriRes.body)}`);
            return res.status(502).json({
                success: false,
                error: 'Monri API error',
                monriStatus: monriRes.status,
                details: monriRes.body
            });
        }

        saveBooking({
            orderNumber, bookingId: orderNumber,
            guestName: bookingData.name, email: bookingData.email,
            phone: bookingData.phone, roomType: bookingData.room_id,
            checkIn: bookingData.checkin_date, checkOut: bookingData.checkout_date,
            guests: bookingData.adults_number,
            totalPrice: bookingData.price, currency: bookingData.currency,
            status: 'pending', paymentType: 'components',
            submittedAt: new Date().toISOString()
        });

        console.log(`[Components] client_secret issued for order=${orderNumber}`);
        res.json({
            success: true,
            client_secret: monriRes.body.client_secret,
            order_number: orderNumber,
            authenticity_token: MONRI_MERCHANT_ID
        });
    } catch (error) {
        console.error('Components payment/new error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to create payment session', message: error.message });
    }
});

// === Verify Monri success URL digest (server-side) ===
app.post('/api/payment/verify-success', (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ valid: false, error: 'url required' });
        if (!MONRI_SECRET_KEY) return res.status(500).json({ valid: false, error: 'Payment not configured' });
        const urlObj = new URL(url);
        const orderNumber = urlObj.searchParams.get('order_number') || '';
        const isValid = verifySuccessDigest(MONRI_SECRET_KEY, url);
        res.json({ valid: isValid, order_number: orderNumber });
    } catch (err) {
        res.status(400).json({ valid: false, error: 'Invalid URL' });
    }
});

// === Monri Pay By Link — Show (retrieve) terminal entry ===
app.get('/api/payment/pay-by-link/:orderNumber', async (req, res) => {
    try {
        if (!MONRI_MERCHANT_ID || !MONRI_SECRET_KEY) {
            return res.status(500).json({ success: false, error: 'Payment not configured' });
        }
        const monriBase = MONRI_ENVIRONMENT === 'test' ? 'https://ipgtest.monri.com' : 'https://ipg.monri.com';
        const fullpath = `/v2/terminal-entry/${encodeURIComponent(req.params.orderNumber)}/show`;
        const auth = generateWP3Auth(MONRI_SECRET_KEY, MONRI_MERCHANT_ID, fullpath, '');
        const monriRes = await httpsRequest('GET', `${monriBase}${fullpath}`, {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': auth.header
        }, '');
        res.json({ success: monriRes.status === 200, data: monriRes.body });
    } catch (error) {
        console.error('Pay By Link show error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// === Monri Saved Card Payment — charge via pan_token (server-to-server) ===
app.post('/api/payment/saved-card', async (req, res) => {
    try {
        const body = req.body;
        const name = ((body.name || body.guestName || '')).trim();
        const email = (body.email || '').trim();
        const panToken = (body.pan_token || '').trim();
        const price = parseFloat(body.price || body.totalPrice || 0);
        const currency = (body.currency || PAYMENT_CURRENCY).toUpperCase();
        const transactionType = body.transaction_type || 'purchase';

        if (!panToken) return res.status(400).json({ success: false, error: 'pan_token required' });
        if (!email || !validators.email(email)) return res.status(400).json({ success: false, error: 'Invalid email' });
        if (price <= 0) return res.status(400).json({ success: false, error: 'Invalid price' });
        if (!MONRI_MERCHANT_ID || !MONRI_SECRET_KEY) {
            return res.status(500).json({ success: false, error: 'Payment not configured' });
        }

        const orderNumber = 'SH-' + Date.now();
        const amountCents = Math.round(price * 100);
        const digest = calcWebPayDigest(MONRI_SECRET_KEY, orderNumber, amountCents, currency);
        const monriBase = MONRI_ENVIRONMENT === 'test' ? 'https://ipgtest.monri.com' : 'https://ipg.monri.com';

        const txBodyStr = JSON.stringify({
            transaction: {
                transaction_type: transactionType,
                amount: amountCents,
                ip: (req.headers['x-forwarded-for'] || req.ip || '127.0.0.1').split(',')[0].trim(),
                order_info: 'Hotel Sinan Han - Room Booking',
                ch_address: body.address || 'Mostar',
                ch_city: body.city || 'Mostar',
                ch_country: body.country || 'BA',
                ch_email: email,
                ch_full_name: name,
                ch_phone: body.phone || '',
                ch_zip: body.zip || '88000',
                currency,
                digest,
                order_number: orderNumber,
                authenticity_token: MONRI_MERCHANT_ID,
                language: 'en',
                pan_token: panToken,
                moto: true
            }
        });

        console.log(`[SavedCard] order=${orderNumber} token=${panToken.slice(0, 8)}... amount=${amountCents} ${currency}`);
        const monriRes = await httpsPost(`${monriBase}/v2/transaction`, {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }, txBodyStr);

        const tx = (monriRes.body && monriRes.body.transaction) ? monriRes.body.transaction : monriRes.body;
        const approved = (tx.status || '').toLowerCase() === 'approved';

        saveBooking({
            orderNumber, bookingId: orderNumber,
            guestName: name, email,
            phone: body.phone || '',
            roomType: body.room_id || body.roomType || '',
            checkIn: body.checkin_date || body.checkIn || '',
            checkOut: body.checkout_date || body.checkOut || '',
            guests: parseInt(body.adults_number || body.guests || 1),
            totalPrice: price, currency,
            status: approved ? 'paid' : 'declined',
            paymentType: 'saved-card',
            transactionId: tx.id || '',
            submittedAt: new Date().toISOString()
        });

        console.log(`[SavedCard] order=${orderNumber} status=${tx.status}`);
        res.json({
            success: approved,
            status: tx.status,
            order_number: orderNumber,
            approval_code: tx.approval_code,
            transaction: tx
        });
    } catch (error) {
        console.error('Saved card payment error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// === Monri Customer API ===
function monriApiHeaders(fullpath, bodyStr) {
    const auth = generateWP3Auth(MONRI_SECRET_KEY, MONRI_MERCHANT_ID, fullpath, bodyStr);
    return { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': auth.header };
}

// Create customer
app.post('/api/payment/customer', async (req, res) => {
    try {
        if (!MONRI_MERCHANT_ID || !MONRI_SECRET_KEY) return res.status(500).json({ status: 'error', message: 'Payment not configured' });
        const monriBase = MONRI_ENVIRONMENT === 'test' ? 'https://ipgtest.monri.com' : 'https://ipg.monri.com';
        const fullpath = '/v2/customers';
        const bodyStr = JSON.stringify(req.body);
        const monriRes = await httpsPost(`${monriBase}${fullpath}`, monriApiHeaders(fullpath, bodyStr), bodyStr);
        res.status(monriRes.status === 200 ? 200 : monriRes.status).json(monriRes.body);
    } catch (error) { res.status(500).json({ status: 'error', message: error.message }); }
});

// List all customers
app.get('/api/payment/customers', async (req, res) => {
    try {
        if (!MONRI_MERCHANT_ID || !MONRI_SECRET_KEY) return res.status(500).json({ status: 'error', message: 'Payment not configured' });
        const monriBase = MONRI_ENVIRONMENT === 'test' ? 'https://ipgtest.monri.com' : 'https://ipg.monri.com';
        const qs = new URLSearchParams();
        if (req.query.limit) qs.set('limit', String(parseInt(req.query.limit)));
        if (req.query.offset) qs.set('offset', String(parseInt(req.query.offset)));
        const fullpath = '/v2/customers' + (qs.toString() ? '?' + qs.toString() : '');
        const monriRes = await httpsRequest('GET', `${monriBase}${fullpath}`, monriApiHeaders(fullpath, ''), '');
        res.json(monriRes.body);
    } catch (error) { res.status(500).json({ status: 'error', message: error.message }); }
});

// Get customer by merchant_customer_id (must be registered BEFORE /:uuid wildcard)
app.get('/api/payment/customer/by-merchant-id/:merchantCustomerId', async (req, res) => {
    try {
        if (!MONRI_MERCHANT_ID || !MONRI_SECRET_KEY) return res.status(500).json({ status: 'error', message: 'Payment not configured' });
        const monriBase = MONRI_ENVIRONMENT === 'test' ? 'https://ipgtest.monri.com' : 'https://ipg.monri.com';
        const fullpath = `/v2/merchants/customers/${encodeURIComponent(req.params.merchantCustomerId)}`;
        const monriRes = await httpsRequest('GET', `${monriBase}${fullpath}`, monriApiHeaders(fullpath, ''), '');
        res.json(monriRes.body);
    } catch (error) { res.status(500).json({ status: 'error', message: error.message }); }
});

// Get customer by UUID
app.get('/api/payment/customer/:uuid', async (req, res) => {
    try {
        if (!MONRI_MERCHANT_ID || !MONRI_SECRET_KEY) return res.status(500).json({ status: 'error', message: 'Payment not configured' });
        const monriBase = MONRI_ENVIRONMENT === 'test' ? 'https://ipgtest.monri.com' : 'https://ipg.monri.com';
        const fullpath = `/v2/customers/${encodeURIComponent(req.params.uuid)}`;
        const monriRes = await httpsRequest('GET', `${monriBase}${fullpath}`, monriApiHeaders(fullpath, ''), '');
        res.json(monriRes.body);
    } catch (error) { res.status(500).json({ status: 'error', message: error.message }); }
});

// Update customer
app.post('/api/payment/customer/:uuid', async (req, res) => {
    try {
        if (!MONRI_MERCHANT_ID || !MONRI_SECRET_KEY) return res.status(500).json({ status: 'error', message: 'Payment not configured' });
        const monriBase = MONRI_ENVIRONMENT === 'test' ? 'https://ipgtest.monri.com' : 'https://ipg.monri.com';
        const fullpath = `/v2/customers/${encodeURIComponent(req.params.uuid)}`;
        const bodyStr = JSON.stringify(req.body);
        const monriRes = await httpsPost(`${monriBase}${fullpath}`, monriApiHeaders(fullpath, bodyStr), bodyStr);
        res.json(monriRes.body);
    } catch (error) { res.status(500).json({ status: 'error', message: error.message }); }
});

// Delete customer
app.delete('/api/payment/customer/:uuid', async (req, res) => {
    try {
        if (!MONRI_MERCHANT_ID || !MONRI_SECRET_KEY) return res.status(500).json({ status: 'error', message: 'Payment not configured' });
        const monriBase = MONRI_ENVIRONMENT === 'test' ? 'https://ipgtest.monri.com' : 'https://ipg.monri.com';
        const fullpath = `/v2/customers/${encodeURIComponent(req.params.uuid)}`;
        const monriRes = await httpsRequest('DELETE', `${monriBase}${fullpath}`, monriApiHeaders(fullpath, ''), '');
        res.json(monriRes.body);
    } catch (error) { res.status(500).json({ status: 'error', message: error.message }); }
});

// List customer payment methods (saved cards / pan tokens)
app.get('/api/payment/customer/:uuid/payment-methods', async (req, res) => {
    try {
        if (!MONRI_MERCHANT_ID || !MONRI_SECRET_KEY) return res.status(500).json({ status: 'error', message: 'Payment not configured' });
        const monriBase = MONRI_ENVIRONMENT === 'test' ? 'https://ipgtest.monri.com' : 'https://ipg.monri.com';
        const qs = new URLSearchParams();
        if (req.query.limit) qs.set('limit', String(parseInt(req.query.limit)));
        if (req.query.offset) qs.set('offset', String(parseInt(req.query.offset)));
        const fullpath = `/v2/customers/${encodeURIComponent(req.params.uuid)}/payment-methods` +
            (qs.toString() ? '?' + qs.toString() : '');
        const monriRes = await httpsRequest('GET', `${monriBase}${fullpath}`, monriApiHeaders(fullpath, ''), '');
        res.json(monriRes.body);
    } catch (error) { res.status(500).json({ status: 'error', message: error.message }); }
});

// === Payment Result Redirect (Monri redirect_url handler) ===
app.get('/payment/result', (req, res) => {
    const status = (req.query.status || '').toLowerCase();
    const orderNumber = req.query.order_number || '';
    const approved = ['approved', 'success', 'paid'].includes(status);
    const page = approved ? 'payment-success.html' : 'payment-failed.html';
    res.redirect(`/${page}?order_number=${encodeURIComponent(orderNumber)}`);
});

// /payment-success — verify Monri WebPay success URL digest when digest param is present
app.get('/payment-success', (req, res) => {
    if (req.query.digest && MONRI_SECRET_KEY) {
        const proto = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.get('host');
        const fullUrl = `${proto}://${host}${req.url}`;
        const isValid = verifySuccessDigest(MONRI_SECRET_KEY, fullUrl);
        const orderNumber = req.query.order_number || '';
        if (!isValid) {
            console.warn(`[Monri] Success URL digest INVALID for order: ${orderNumber}`);
        } else if (orderNumber) {
            try {
                const bookings = loadBookings();
                const idx = bookings.findIndex(b => b.orderNumber === orderNumber || b.bookingId === orderNumber);
                if (idx !== -1 && bookings[idx].status === 'pending') {
                    bookings[idx].status = 'paid';
                    bookings[idx].monriDigestVerified = true;
                    bookings[idx].updatedAt = new Date().toISOString();
                    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
                    console.log(`✅ WebPay success verified — booking ${orderNumber} marked paid`);
                }
            } catch (err) {
                console.error('Error updating booking on success redirect:', err.message);
            }
        }
        const params = new URLSearchParams({ order_number: orderNumber, verified: isValid ? '1' : '0' });
        return res.redirect(`/payment-success.html?${params.toString()}`);
    }
    res.sendFile(path.join(__dirname, 'payment-success.html'));
});
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
    if (MONRI_MERCHANT_ID && MONRI_SECRET_KEY) {
        console.log(`💳 Monri: env=${MONRI_ENVIRONMENT} merchantId=${MONRI_MERCHANT_ID.slice(0, 12)}... ✓ credentials loaded`);
        console.log(`💳 Monri debug endpoint: GET /api/debug-monri`);
    } else {
        console.warn(`⚠️  Monri: MONRI_MERCHANT_ID or MONRI_SECRET_KEY not set — payments will fail`);
    }
});

module.exports = app;
