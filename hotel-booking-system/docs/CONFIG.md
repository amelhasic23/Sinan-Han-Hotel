# Hotel Booking System - Configuration Reference

## Frontend Configuration

### main.js CONFIG Object

Located in `frontend/js/main.js` (lines 5-20):

```javascript
const CONFIG = {
  HOTEL_NAME: 'Sinan Han',           // Hotel display name
  HOTEL_YEAR: 2024,                   // Establishment year
  TOAST_SHOW_DELAY: 10,               // ms for animation trigger
  TOAST_AUTO_HIDE_DURATION: 4000,     // ms before auto-hide
  TOAST_FADE_DURATION: 300,           // ms for fade animation
  RESIZE_DEBOUNCE: 250,               // ms for resize handler
  SCROLL_THRESHOLD_NAVBAR: 50,        // px for navbar style change
  SCROLL_THRESHOLD_BACK_TO_TOP: 300,  // px for button visibility
  SCROLL_THRESHOLD_NAV_ACTIVE: 200,   // px offset for active section
  PARALLAX_ANIMATION_DURATION: 300,   // ms
  MODAL_CLOSE_ANIMATION: 300,         // ms
  AOS_DURATION: 800,                  // Animate On Scroll duration
  LANGUAGES: ['en', 'bs', 'de', 'fr', 'it'],  // Supported languages
  DEFAULT_LANGUAGE: 'en'              // Default language
};
```

### Translation Files

Located in `frontend/languages/`:
- `en.json` - English (Primary)
- `de.json` - German
- `bs.json` - Bosnian
- `fr.json` - French (future)
- `it.json` - Italian (future)

**Adding a New Language:**

1. Create `frontend/languages/xx.json`
2. Add language code to CONFIG.LANGUAGES array
3. Add translation keys (copy from en.json)
4. Language will be available in selector

### Analytics Configuration

Google Analytics 4 initialization is in `frontend/index.html` (line 462):

```javascript
const measurementId = 'G-R0Z8HFEEVT'; // Replace with your GA4 ID
```

**To update:**
1. Get your GA4 Measurement ID from Google Analytics console
2. Replace the placeholder in index.html
3. Redeploy the application

---

## Backend Configuration

### Environment Variables (.env)

```env
# Server Configuration
PORT=5000                          # Express server port
HOST=localhost                     # Server hostname
NODE_ENV=production                # development | production
DEBUG=false                        # Enable debug logging

# Booking.com API (RapidAPI)
BOOKING_API_KEY=xxx               # Your RapidAPI key
BOOKING_API_HOST=booking-com15.p.rapidapi.com

# Monri Payment Gateway
MONRI_MERCHANT_ID=xxx              # Merchant ID from Monri
MONRI_MERCHANT_PASSWORD=xxx        # Merchant password
MONRI_CHECKOUT_URL=https://gateway.monri.com/auth  # Monri endpoint

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com           # SMTP server
SMTP_PORT=587                      # SMTP port (TLS)
SMTP_USER=your_email@gmail.com     # Sender email
SMTP_PASS=your_app_password        # App password (not account password!)
SMTP_FROM=noreply@example.com      # From address

# Caching
CACHE_TTL=3600                     # Cache time-to-live (seconds)

# Google Analytics
GA4_MEASUREMENT_ID=G-XXXXXXXXXX    # Frontend GA4 ID
```

### Server Configuration (server.js)

Key settings in `backend/server.js`:

```javascript
const PORT = process.env.PORT || 5000;
const HOTEL_ID = 127621;           // Primary hotel ID
const CACHE_DURATION = 3600000;    // 1 hour cache
const API_TIMEOUT = 10000;         // API request timeout
```

### Database Schema (bookings.json)

Stores booking records (one record per booking):

```json
{
  "order_number": "BK1234567890",
  "status": "pending|paid|declined",
  "name": "John Doe",
  "email": "john@example.com",
  "hotel_id": 127621,
  "room_id": "101",
  "checkin_date": "2024-06-15",
  "checkout_date": "2024-06-18",
  "adults_number": 2,
  "price": 450.00,
  "currency": "BAM",
  "transaction_id": "monri_transaction_id",
  "created_at": "2024-06-15T10:00:00Z",
  "paid_at": "2024-06-15T10:30:00Z"
}
```

---

## Service Worker Configuration

### Cache Settings (frontend/sw.js)

```javascript
const CACHE_NAME = 'sinan-han-v1.1.0';  // Increment version for cache clear
const OFFLINE_PAGE = '/offline.html';    // Offline fallback page

const STATIC_ASSETS = [
  // Files to pre-cache on install
  '/',
  '/index.html',
  '/offline.html',
  '/js/*.js',
  '/manifest.json',
  '/languages/*.json',
  'https://cdn.tailwindcss.com'
];
```

### Update Service Worker

1. Increment `CACHE_NAME` version (e.g., v1.0.0 → v1.1.0)
2. Add new assets to `STATIC_ASSETS` array
3. Service Worker will auto-update on next page reload
4. Users see update notification

---

##Analytics Configuration

### Google Analytics 4 Events

Tracked events (in analytics.js):

| Event | Fires When | Data |
|-------|-----------|------|
| `form_start` | User enters name/email | User starts booking |
| `room_search` | User searches availability | Number of rooms found |
| `room_selected` | User selects a room | Room ID, price, name |
| `payment_init` | User clicks Pay button | Amount, currency |
| `payment_complete` | Payment successful | Amount, transaction ID |
| `payment_failed` | Payment declined | Failure reason |

### User Properties Tracked

```javascript
{
  'language': 'en|de|bs',           // Selected language
  'stay_duration': 3,               // Number of nights
  'room_type': 'standard|suite|...' // Room category
}
```

---

## Manifest Configuration (frontend/manifest.json)

PWA manifest settings:

```json
{
  "name": "Sinan Han Hotel Booking System",
  "start_url": "/",
  "display": "standalone|minimal-ui|fullscreen",
  "theme_color": "#4f46e5",
  "background_color": "#ffffff",
  "categories": ["travel", "business"]
}
```

---

## API Rate Limiting (Future)

Currently disabled. To implement:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                    // 100 requests per window
});

app.use('/api/', limiter);
```

---

## Logging Configuration

### Console Logging

Enabled by default. Control with DEBUG env var:

```bash
DEBUG=true npm start  # Verbose logging
DEBUG=false npm start # Minimal logging (default)
```

### Log Levels (Future)

```javascript
// Implement with winston or pino
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

---

## Security Configuration

### CORS Setup

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
}));
```

### Helmet Headers (Future)

```javascript
const helmet = require('helmet');
app.use(helmet());  // Secure HTTP headers
```

### Input Validation

All POST endpoints validate inputs:

```javascript
// Example validation
if (!req.body.email || !req.body.email.includes('@')) {
  return res.status(400).json({ error: 'Invalid email' });
}
```

---

## Database Maintenance

### Automatic Cleanup

Add to cron job (runs daily):

```bash
# Remove paid bookings older than 90 days
0 2 * * * node scripts/cleanup-bookings.js --days 90
```

### Manual Cleanup

```javascript
// In backend/server.js
function cleanupOldBookings(days = 90) {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  bookings = bookings.filter(b => new Date(b.created_at) > cutoff);
}
```

---

## Testing Configuration

### Unit Tests (Future)

```javascript
// tests/api.test.js
const request = require('supertest');
const app = require('../server');

describe('GET /api/hotel', () => {
  it('should return hotel info', (done) => {
    request(app)
      .get('/api/hotel')
      .expect(200, done);
  });
});
```

Run tests:
```bash
npm test
```

---

## Development vs Production

| Setting | Development | Production |
|---------|-------------|-----------|
| NODE_ENV | development | production |
| DEBUG | true | false |
| CORS | * | specific domains |
| Cache | disabled | enabled |
| SSL/TLS | no | yes (required) |
| Rate Limit | no | yes (5xx requests) |

---

**Last Updated:** 2024
**Configuration Version:** 1.0
