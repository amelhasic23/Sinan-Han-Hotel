# Monri Payment Integration - Testing Guide

## ✅ Configuration Complete

Your Sinan Han Hotel booking system is now configured with Monri payment gateway credentials:

**Credentials:**
- **Merchant ID**: `key-e44802b0354106a6c00a380a3c614bf7`
- **Secret Key**: `34c501f4170bf70c2b0828fc90707a87f23319e9`
- **Environment**: TEST MODE
- **Currency**: BAM (Bosnian Convertible Mark)

## 🚀 Testing the Integration

### Method 1: Using the Test Page

1. **Start the backend server** (if not already running):
   ```bash
   cd c:\Users\ABC\Desktop\SinanHan\hotel-booking-system\backend
   node server.js
   ```

2. **Open the test page** in your browser:
   ```
   c:\Users\ABC\Desktop\SinanHan\hotel-booking-system\test-payment.html
   ```

3. **Click "Initialize Test Payment"** button

4. **Monri Lightbox will open** - You can use test card credentials provided by Monri

5. **Watch the console** for payment status updates

### Method 2: Using the Main Application

1. Start the backend server (port 5000)

2. Open the main booking system:
   ```
   c:\Users\ABC\Desktop\SinanHan\hotel-booking-system\frontend\index.html
   ```

3. Fill in the booking form:
   - Select check-in/check-out dates
   - Enter number of adults
   - Click "Search Available Rooms"

4. Select a room from the results

5. Click "Proceed to Payment"

6. Complete the payment in the Monri Lightbox

### Method 3: API Testing with cURL

Test the payment initialization endpoint directly:

```bash
curl -X POST http://localhost:5000/api/payment/init \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "hotel_id": "127621",
    "room_id": "room_1",
    "checkin_date": "2026-03-20",
    "checkout_date": "2026-03-22",
    "adults_number": 2,
    "price": 150.50,
    "currency": "BAM"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "merchantId": "key-e44802b0354106a6c00a380a3c614bf7",
  "amount": 15050,
  "currency": "BAM",
  "orderNumber": "BK1742290476532",
  "digest": "BASE64_ENCODED_HMAC_SHA256",
  "timestamp": 1742290476,
  "message": "Payment initialized. Complete payment on Monri Lightbox"
}
```

## 🧪 Monri Test Cards (TEST MODE)

When testing, use these test card numbers:

| Card Type | Card Number | CVV | Expiry | Result |
|-----------|-------------|-----|--------|--------|
| Visa | 4111 1111 1111 1111 | 123 | Any future date | Success |
| Mastercard | 5555 5555 5555 4444 | 123 | Any future date | Success |
| Declined | 4000 0000 0000 0002 | 123 | Any future date | Declined |

**Note**: In TEST MODE, no real money is charged!

## 📡 API Endpoints

### Payment Initialization
**POST** `/api/payment/init`

Request body:
```json
{
  "name": "Guest Name",
  "email": "guest@example.com",
  "hotel_id": "127621",
  "room_id": "room_1",
  "checkin_date": "2026-03-20",
  "checkout_date": "2026-03-22",
  "adults_number": 2,
  "price": 150.50,
  "currency": "BAM"
}
```

### Webhook (Monri Callback)
**POST** `/webhook/monri`

This endpoint receives payment notifications from Monri when payment status changes.

### Check Booking StatusBackend Server:** http://localhost:5000
**POST** `/api/booking/:orderNumber`

Check the status of a booking by order number.

## 🔐 How It Works

1. **Frontend** sends booking data to `/api/payment/init`

2. **Backend** generates:
   - Unique order number (e.g., `BK1742290476532`)
   - HMAC-SHA256 digest for security
   - Saves booking with "pending" status

3. **Frontend** receives payment data and opens Monri Lightbox

4. **User** completes payment in Monri's secure form

5. **Monri** sends webhook notification to `/webhook/monri`

6. **Backend** updates booking status to "paid"

7. **Frontend** polls `/api/booking/:orderNumber` and shows success

8. **Email** confirmation sent (if EMAIL_USER configured in .env)

## 📊 Server Configuration

Current server settings from `.env`:

```env
# Monri Payment Gateway
MONRI_MERCHANT_ID=key-e44802b0354106a6c00a380a3c614bf7
MONRI_SECRET_KEY=34c501f4170bf70c2b0828fc90707a87f23319e9
MONRI_ENVIRONMENT=test
MONRI_TEST_MODE=true
PAYMENT_CURRENCY=BAM

# Server
PORT=5000
NODE_ENV=development
```

## 🔄 Switching to Production Mode

When ready to accept real payments:

1. **Update `.env` file:**
   ```env
   MONRI_TEST_MODE=false
   MONRI_ENVIRONMENT=production
   ```

2. **Update frontend** (index.html line 33):
   ```html
   <!-- Change from test to production -->
   <script src="https://ipg.monri.com/v2/monri.js"></script>
   ```

3. **Get production credentials** from Monri

4. **Update merchant ID and secret** in `.env`

5. **Restart the server**

## 🐛 Debugging

### Check Server Logs

The backend server logs all payment events:
- `🔐 Payment initialized for...` - Payment request received
- `🔔 Monri webhook received` - Payment status update
- `✅ Booking status updated` - Database updated

### Common Issues

**Issue**: "Payment system is not available"
- **Solution**: Check that Monri SDK is loaded in HTML

**Issue**: "Invalid digest" error from Monri
- **Solution**: Verify SECRET_KEY matches your Monri account

**Issue**: Webhook not received
- **Solution**: In production, ensure notification_url is publicly accessible (use ngrok for testing)

**Issue**: Port 5000 already in use
- **Solution**: Kill the process or change PORT in .env

## 📝 Production Checklist

Before going live:

- [ ] Get production Monri credentials
- [ ] Update MONRI_MERCHANT_ID and MONRI_SECRET_KEY
- [ ] Set MONRI_TEST_MODE=false
- [ ] Update Monri SDK URL to production
- [ ] Configure EMAIL_USER and EMAIL_PASSWORD for confirmations
- [ ] Set up proper SSL/HTTPS for webhook URL
- [ ] Test with small real transaction
- [ ] Set up monitoring for failed payments
- [ ] Configure RAPIDAPI_KEY if using Booking.com integration

## 📞 Support

**Monri Documentation**: https://ipg.monri.com/en/documentation
**Monri Support**: support@monri.com

## 🎉 You're All Set!

Your Monri payment integration is configured and ready to test. Open `test-payment.html` in your browser to try it out!
