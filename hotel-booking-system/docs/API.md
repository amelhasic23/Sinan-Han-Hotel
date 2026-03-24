# Hotel Booking System - API Documentation

## Overview

This API documentation covers all endpoints available in the Sinan Han Hotel Booking System. The backend is built with Express.js and integrates with the Booking.com API via RapidAPI.

**Base URL:** `http://localhost:5000` (default, configurable via PORT environment variable)
**API Version:** 1.0
**Response Format:** JSON

---

## Authentication

Currently, the API does not require authentication for public endpoints. Future versions will implement API key authentication for sensitive operations.

---

## Hotel Information Endpoints

### Get Hotel Information
Retrieves comprehensive hotel details including pricing, policies, and amenities.

```
GET /api/hotel
```

**Response:**
```json
{
  "hotel_id": 127621,
  "name": "Sinan Han Hotel",
  "description": "...",
  "rating": 4.5,
  "currency": "BAM",
  "policies": { ... },
  "amenities": [...],
  "archived": false
}
```

**Status Codes:** 200, 500

---

### Get Hotel Prices
Fetch current pricing information.

```
GET /api/hotel/prices
```

**Response:** JSON object with room prices and availability

---

### Get Hotel Policies
Retrieve check-in/out times, cancellation, and house rules.

```
GET /api/hotel/policies
```

**Response:**
```json
{
  "checkInTime": "15:00",
  "checkOutTime": "11:00",
  "cancellationPolicy": "Free cancellation ...",
  "petPolicy": "Pets allowed",
  "smokingPolicy": "Non-smoking"
}
```

---

## Room Search & Booking Endpoints

### Search Available Rooms
Search for available rooms based on booking parameters.

```
POST /api/rooms
Content-Type: application/json

{
  "hotel_id": 127621,
  "checkin_date": "2024-06-15",
  "checkout_date": "2024-06-18",
  "adults_number": 2
}
```

**Response:**
```json
{
  "rooms": [
    {
      "room_id": "101",
      "room_name": "Standard Double",
      "description": "Comfortable room with queen bed",
      "price": 450.00,
      "currency": "BAM",
      "capacity": 2,
      "amenities": ["WiFi", "TV", "AC"]
    }
  ],
  "checkInDate": "2024-06-15",
  "checkOutDate": "2024-06-18",
  "nights": 3
}
```

**Status Codes:** 200, 400, 500

**Errors:**
- `400`: Missing required parameters
- `500`: Hotel API error

---

## Payment Endpoints

### Initialize Payment
Create a new booking and initialize Monri payment gateway.

```
POST /api/payment/init
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "hotel_id": 127621,
  "room_id": "101",
  "checkin_date": "2024-06-15",
  "checkout_date": "2024-06-18",
  "adults_number": 2,
  "price": 450.00,
  "currency": "BAM"
}
```

**Response:**
```json
{
  "orderNumber": "BK1234567890",
  "merchantId": "...",
  "amount": 45000,
  "currency": "BAM",
  "digest": "...",
  "status": "pending"
}
```

**Status Codes:** 200, 400, 500

---

### Get Booking Status
Check the current status of a booking.

```
GET /api/booking/:orderNumber
```

**Response:**
```json
{
  "booking": {
    "order_number": "BK1234567890",
    "status": "paid|pending|declined",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "price": 450.00,
    "paid_at": "2024-06-15T10:30:00Z"
  }
}
```

**Status Codes:** 200, 404, 500

---

## Webhook Endpoints

### Monri Payment Notification
Receives payment status updates from Monri gateway.

```
POST /webhook/monri

{
  "status": "approved|declined",
  "transaction_id": "...",
  "order_number": "BK1234567890",
  "amount": 45000
}
```

**Note:** This endpoint is called by Monri's servers, not directly by clients.

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error description",
  "success": false,
  "status": 400
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (missing/invalid parameters) |
| 404 | Not Found |
| 500 | Server Error |
| 503 | Service Unavailable (offline mode) |

---

## Rate Limiting

- Current implementation: No rate limiting
- Future: Plan to implement 100 requests per minute per IP

---

## Caching

- **Hotel data**: 1-hour cache
- **Room availability**: Real-time (no cache)
- **API responses**: Cached via Service Worker (offline support)

---

## Example Usage

### Complete Booking Flow

```bash
# 1. Search for available rooms
curl -X POST http://localhost:5000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "hotel_id": 127621,
    "checkin_date": "2024-06-15",
    "checkout_date": "2024-06-18",
    "adults_number": 2
  }'

# 2. Initialize payment
curl -X POST http://localhost:5000/api/payment/init \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "hotel_id": 127621,
    "room_id": "101",
    "checkin_date": "2024-06-15",
    "checkout_date": "2024-06-18",
    "adults_number": 2,
    "price": 450.00,
    "currency": "BAM"
  }'

# 3. Poll booking status
curl http://localhost:5000/api/booking/BK1234567890
```

---

## Support

For issues or questions, contact the development team or submit an issue on GitHub.

**Last Updated:** 2024
**API Version:** 1.0
