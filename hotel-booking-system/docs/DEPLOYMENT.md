# Hotel Booking System - Deployment Guide

## System Requirements

- **Node.js**: 16.0.0 or higher
- **npm**: 7.0.0 or higher (or yarn/pnpm)
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Client**: Windows, macOS, or Linux

### Required Services

- **Booking.com API** (via RapidAPI): For hotel data
- **Monri Payment Gateway**: For payment processing
- **SMTP Server**: For email notifications (Gmail, SendGrid, etc.)

---

## Quick Start (5 Minutes)

### 1. Clone & Install

```bash
git clone <repository-url>
cd hotel-booking-system
npm install
```

### 2. Configure Environment

```bash
cp docs/.env.example .env
# Edit .env with your credentials
nano .env
```

### 3. Start Backend

```bash
npm start
# Backend runs on http://localhost:5000
```

### 4. Open Frontend

```bash
# Use any HTTP server, e.g., Python
python -m http.server 8000 --directory frontend

# Or use Node's serve package
npx serve frontend -l 3000
```

Visit `http://localhost:3000` in your browser.

---

## Environment Variables

Create a `.env` file in the root directory with these variables:

```env
# Server
PORT=5000
HOST=localhost
NODE_ENV=production

# Booking.com API (RapidAPI)
BOOKING_API_KEY=your_rapidapi_key_here
BOOKING_API_HOST=booking-com15.p.rapidapi.com

# Monri Payment Gateway
MONRI_MERCHANT_ID=your_merchant_id
MONRI_MERCHANT_PASSWORD=your_merchant_password
MONRI_CHECKOUT_URL=https://gateway.monri.com/auth

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@example.com

# Google Analytics (Frontend)
GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional
DEBUG=false
CACHE_TTL=3600
```

### Obtaining Credentials

#### Booking.com API Key
1. Go to [RapidAPI](https://rapidapi.com)
2. Search for "Booking.com"
3. Subscribe to the free tier
4. Copy your API key from the dashboard

#### Monri Merchant Credentials
1. Contact Monri or visit [monri.com](https://monri.com)
2. Create a merchant account
3. Get your Merchant ID and password
4. Add callback URLs in dashboard

#### Gmail SMTP
1. Enable 2-Factor Authentication
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use app password in SMTP_PASS

#### Google Analytics
1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Copy Measurement ID (format: G-XXXXXXXXXX)
3. Set in GA4_MEASUREMENT_ID env var

---

## Standard Deployment (VPS/Server)

### 1. Server Setup (Ubuntu 20.04+)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2
```

### 2. Clone Repository

```bash
cd /var/www
git clone <repository-url> hotel-booking-system
cd hotel-booking-system
npm install --production
```

### 3. Setup Environment

```bash
cp docs/.env.example .env
nano .env  # Add all credentials
```

### 4. Setup SSL Certificate (Nginx + Let's Encrypt)

```bash
sudo apt install -y nginx certbot python3-certbot-nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/hotel-booking

# Configure with proxy to localhost:5000
# Then enable it
sudo ln -s /etc/nginx/sites-available/hotel-booking /etc/nginx/sites-enabled/

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

### 5. Start with PM2

```bash
pm2 start backend/server.js --name "hotel-booking"
pm2 startup
pm2 save

# View logs
pm2 logs hotel-booking
```

### 6. Setup Cron Job for Backups

```bash
# Backup bookings.json daily
0 2 * * * cp /var/www/hotel-booking-system/backend/bookings.json /backups/bookings-$(date +\%Y\%m\%d).json
```

---

## Docker Deployment

### Build and Run with Docker

```bash
# Build image
docker build -t hotel-booking-system .

# Run container
docker run -p 5000:5000 --env-file .env hotel-booking-system

# Or with Docker Compose
docker-compose up -d
```

### Docker Compose (Recommended)

```bash
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## SSL/TLS Certificate Setup

### Using Let's Encrypt (Free)

```bash
# With Certbot
certbot certonly --standalone -d yourdomain.com

# Result files:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem

# Auto-renewal
sudo certbot renew --dry-run
```

### Configure Node.js with SSL

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/fullchain.pem')
};

https.createServer(options, app).listen(443);
```

---

## Database Backups

The system uses JSON file storage (`bookings.json`). Regular backups are essential:

```bash
# Manual backup
cp backend/bookings.json backups/bookings-$(date +%Y%m%d-%H%M%S).json

# Automated backup (add to crontab)
0 */6 * * * cp /path/to/bookings.json /backups/bookings-$(date +\%Y\%m\%d-\%H\%M\%S).json
```

---

## Health Checks

Monitor your deployment with health endpoints:

```bash
# Basic health check
curl http://yourdomain.com/api/hotel

# Check specific booking
curl http://yourdomain.com/api/booking/ORDER_NUMBER

# Response indicates system status
```

---

## Monitoring & Logs

### PM2 Dashboard

```bash
pm2 web  # Access at http://localhost:9615
```

### Nginx Logs

```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Application Logs

```bash
pm2 logs hotel-booking
```

---

## Performance Optimization

1. **Enable Gzip Compression**
   ```nginx
   gzip on;
   gzip_types text/plain application/json;
   ```

2. **Set Cache Headers**
   ```javascript
   app.use(express.static('frontend', {
     maxAge: '1d'
   }));
   ```

3. **Load Balancing** (Nginx)
   ```nginx
   upstream app {
     server localhost:5000;
     server localhost:5001;
   }
   ```

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| Port 5000 already in use | Change PORT env var or kill process |
| API key invalid | Verify BOOKING_API_KEY in .env |
| Emails not sending | Check SMTP credentials and firewall |
| SSL certificate expired | Run `certbot renew` |

---

## Security Checklist

- [ ] Use strong passwords for service accounts
- [ ] Enable HTTPS/SSL on production
- [ ] Set NODE_ENV=production
- [ ] Keep dependencies updated: `npm audit`
- [ ] Limit API rate (implement in future)
- [ ] Validate all user inputs
- [ ] Use CORS appropriately
- [ ] Regular security backups

---

## Support & Rollback

### Keeping Backups

```bash
# Keep last 30 days of backups
find /backups -name "bookings-*.json" -mtime +30 -delete
```

### Quick Rollback

```bash
# Stop application
pm2 stop hotel-booking

# Restore backup
cp backups/bookings-20240615.json backend/bookings.json

# Restart
pm2 start hotel-booking
```

---

**Last Updated:** 2024
**Deployment Version:** 1.0
