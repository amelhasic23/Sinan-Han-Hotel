# 🔍 API Testing & Debugging Guide

## Quick Start - Test the Real API

### Step 1: Start the Server
```bash
cd hotel-booking-system
npm install
npm start
```

You should see a message like:
```
🌐 Server: http://localhost:5000
📡 RapidAPI Integration: Active
```

### Step 2: Test the API (Choose one method)

#### Option A: Using Your Browser
Open these URLs in your browser:

1. **Test Connection:**
   ```
   http://localhost:5000/api/hotel
   ```

2. **See Raw API Response (Debug Mode):**
   ```
   http://localhost:5000/api/debug
   ```

3. **Get Prices:**
   ```
   http://localhost:5000/api/hotel/prices
   ```

4. **Get Policies:**
   ```
   http://localhost:5000/api/hotel/policies
   ```

#### Option B: Using Command Line (Windows PowerShell)

```powershell
# Test hotel data
curl http://localhost:5000/api/hotel

# See debug information
curl http://localhost:5000/api/debug

# Get prices
curl http://localhost:5000/api/hotel/prices

# Get policies
curl http://localhost:5000/api/hotel/policies
curl http://localhost:5000/api/hotel/cancellation
curl http://localhost:5000/api/hotel/privacy
```

#### Option C: Using curl in Git Bash

```bash
# Test hotel data
curl http://localhost:5000/api/hotel

# See what fields are available
curl http://localhost:5000/api/debug

# Get prices
curl http://localhost:5000/api/hotel/prices

# Get cancellation policy
curl http://localhost:5000/api/hotel/cancellation

# Get privacy policy
curl http://localhost:5000/api/hotel/privacy
```

---

## 🐛 Troubleshooting

### Issue: "Cannot GET /api/hotel"
**Solution:** Make sure the server is running. Check console for any errors.

### Issue: "ERROR: RAPIDAPI_KEY not found"
**Solution:**
1. Check that `.env` file exists in `hotel-booking-system/` folder
2. Verify it contains: `RAPIDAPI_KEY=87d2065897msh270d1f53bb9a7c9p1d1bc8jsn726a0c5db75f`
3. Restart the server

### Issue: API returns empty or null values
**Solution:**
1. Check `/api/debug` endpoint to see raw data
2. Verify API key is still valid on RapidAPI website
3. Check if rate limit has been exceeded

### Issue: "Unauthorized" error
**Solution:**
- Your API key is invalid or expired
- Go to https://rapidapi.com/apidojo/api/booking
- Check your subscription status
- Generate a new key and update `.env`

---

## 📊 What to Expect

### Successful Response Example:

```json
{
  "name": "Sinan Han Hotel",
  "rating": 9.7,
  "pricePerNight": 75.50,
  "currency": "EUR",
  "policies": {
    "checkIn": "14:00",
    "checkOut": "11:00"
  },
  "cancellationPolicy": {
    "title": "Cancellation Policy",
    "description": "...",
    "freeCancel": "Yes",
    "deadline": "24 hours before check-in"
  },
  "privacyPolicy": {
    "title": "Privacy & Data Protection Policy",
    "description": "...",
    "dataCollection": "...",
    "dataProtection": "..."
  },
  "rooms": [
    {
      "type": "Standard Double Room",
      "price": 75.50,
      "currency": "EUR",
      "capacity": 2
    }
  ]
}
```

---

## 🔧 Using the Debug Endpoint

The `/api/debug` endpoint shows you exactly what fields are available:

```bash
curl http://localhost:5000/api/debug
```

This will display:
- Hotel name
- All available fields in the API response
- Sample data from key fields
- The complete raw response

**Use this to identify which fields contain the pricing and policy information.**

---

## 📝 Testing Checklist

- [ ] Server starts without errors
- [ ] Can access http://localhost:5000/api/hotel
- [ ] Hotel name appears in response
- [ ] Price shows in pricePerNight field
- [ ] Cancellation policy has description
- [ ] Privacy policy has description
- [ ] Rooms array has at least one room
- [ ] Rating shows 9.7 or higher

---

## 💡 If Prices Are Missing

The API might return prices in different fields. Check the debug endpoint:

```bash
# See what's actually in the response
curl http://localhost:5000/api/debug

# Look for these fields in the response:
# - min_total_price
# - price
# - price_min
# - per_night
# - amount
```

Then let me know what fields you see, and I'll update the code to extract them correctly.

---

## 🔐 API Key Verification

To verify your API key is working:

1. Visit: https://rapidapi.com/apidojo/api/booking
2. Click "Test Endpoint"
3. Try the Search endpoint with:
   - query: "Sinan Han Hotel Mostar"
   - Check-in: (today's date)
   - Check-out: (tomorrow's date)

If you see hotel data, the key is valid. If you get an error, you need to update it.

---

## 📞 Next Steps

1. **Run the test commands above** to see what data you get
2. **Check the `/api/debug` response** to identify missing fields
3. **Share the debug output** if prices/policies aren't showing
4. **I'll update the code** to extract the right fields

---

**Server will show detailed logs when you test the endpoints!** Check the terminal window where you ran `npm start` to see what's happening.
