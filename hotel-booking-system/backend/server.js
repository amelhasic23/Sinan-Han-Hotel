// ============================================
// SINAN HAN HOTEL - BOOKING SYSTEM BACKEND
// ============================================

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');
const crypto = require('crypto');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

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

app.use(cors());
app.use(express.json());

// Static file serving with cache headers
app.use(express.static(path.join(__dirname, '../frontend'), {
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

// Cache images longer (7 days)
app.get(/\.(jpg|jpeg|png|gif|webp|svg)$/i, (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=604800');
    res.set('Vary', 'Accept'); // Support content negotiation for WebP
    next();
});

// Cache language files (JSON)
app.get(/languages\/.*\.json$/i, (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=604800');
    next();
});

// HTTP/2 Server Push - Preload critical resources
app.use((req, res, next) => {
    // Send Link headers for server push on HTML requests
    if (req.url === '/' || req.url === '/index.html') {
        // Frontend booking system critical resources
        const linkHeaders = [
            '</js/api.js>; rel=preload; as=script; importance=high',
            '</js/main.js>; rel=preload; as=script; importance=high'
        ];
        res.set('Link', linkHeaders.join(', '));
    }
    next();
});

// ============================================
// API CONFIGURATION
// ============================================

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'booking-com.p.rapidapi.com';

// Monri Payment Configuration
const MONRI_MERCHANT_ID = process.env.MONRI_MERCHANT_ID || 'your_merchant_id';
const MONRI_SECRET_KEY = process.env.MONRI_SECRET_KEY || 'your_secret_key';
const MONRI_ENVIRONMENT = process.env.MONRI_ENVIRONMENT || 'test';
const MONRI_TEST_MODE = process.env.MONRI_TEST_MODE === 'true';
const PAYMENT_CURRENCY = process.env.PAYMENT_CURRENCY || 'BAM';

// Bookings database file path
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

if (!RAPIDAPI_KEY) {
  console.error('ERROR: RAPIDAPI_KEY not found in .env file');
  console.error('Please create a .env file with RAPIDAPI_KEY set');
  process.exit(1);
}

// ============================================
// EMAIL NOTIFICATION SETUP
// ============================================

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const BOOKING_REQUEST_EMAIL = process.env.BOOKING_REQUEST_EMAIL || 'about@hotelsinanhan.com';

// Initialize email transporter
let transporter = null;

if (EMAIL_USER && EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    }
  });

  console.log('✅ Email transporter configured with Gmail SMTP');
} else {
  console.warn('⚠️ Email configuration incomplete. Bookings will not send emails.');
  console.warn('Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
}

// ============================================
// HOTEL DATA CACHE
// ============================================

let hotelDataCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Fetch hotel data from Booking.com API
 * Includes prices, policies, and cancellation information
 */
async function fetchHotelData() {
  try {
    // Check if cache is still valid
    if (hotelDataCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      console.log('📦 Using cached hotel data');
      return hotelDataCache;
    }

    console.log('🔄 Fetching hotel data from Booking.com API...');

    // API Call to search for hotels in Mostar
    const searchOptions = {
      method: 'GET',
      url: 'https://booking-com.p.rapidapi.com/v1/hotels/search',
      params: {
        query: 'Sinan Han Hotel Mostar',
        checkin_date: new Date().toISOString().split('T')[0],
        checkout_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        adults_number: 1,
        room_number: 1,
        order_by: 'price'
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    };

    const searchResponse = await axios.request(searchOptions);
    const hotels = searchResponse.data.result || [];

    if (hotels.length === 0) {
      console.warn('⚠️ No hotels found in API response');
      return null;
    }

    // Find Sinan Han Hotel
    const sinanHan = hotels.find(hotel =>
      hotel.hotel_name && hotel.hotel_name.toLowerCase().includes('sinan')
    );

    if (sinanHan) {
      console.log('✅ Found Sinan Han Hotel');

      // Fetch detailed information including policies
      const detailsOptions = {
        method: 'GET',
        url: `https://booking-com.p.rapidapi.com/v1/hotels/details`,
        params: {
          hotel_id: sinanHan.hotel_id,
          checkin_date: new Date().toISOString().split('T')[0],
          checkout_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          adults_number: 1
        },
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      };

      const detailsResponse = await axios.request(detailsOptions);
      const hotelDetails = detailsResponse.data.data || sinanHan;

      // Cache the data
      hotelDataCache = {
        name: hotelDetails.hotel_name || 'Sinan Han Hotel',
        rating: hotelDetails.review_score || 9.7,
        pricePerNight: hotelDetails.min_total_price || 0,
        currency: hotelDetails.currency || 'EUR',
        description: hotelDetails.description || 'Boutique Hotel in Mostar',
        policies: extractPolicies(hotelDetails),
        cancellationPolicy: extractCancellationPolicy(hotelDetails),
        privacyPolicy: extractPrivacyPolicy(hotelDetails),
        rooms: extractRoomData(hotelDetails),
        amenities: extractAmenities(hotelDetails)
      };

      cacheTimestamp = Date.now();
      return hotelDataCache;
    } else {
      console.warn('⚠️ Sinan Han Hotel not found in search results');
      return null;
    }

  } catch (error) {
    console.error('❌ Error fetching hotel data:', error.message);
    if (error.response?.status === 401) {
      console.error('API Key Error: Unauthorized. Check your RAPIDAPI_KEY in .env');
    } else if (error.response?.status === 429) {
      console.error('API Rate Limit: Too many requests');
    }
    return null;
  }
}

/**
 * Extract policy information from hotel details
 */
function extractPolicies(hotelDetails) {
  return {
    checkIn: hotelDetails.hotel_policy?.check_in_start_time || '14:00',
    checkOut: hotelDetails.hotel_policy?.check_out_time || '11:00',
    petPolicy: hotelDetails.hotel_policy?.pets || 'Not specified',
    smoking: hotelDetails.hotel_policy?.smoking || 'Non-smoking rooms available'
  };
}

/**
 * Extract cancellation policy from hotel details
 */
function extractCancellationPolicy(hotelDetails) {
  console.log('🔍 Available cancellation policy fields:', Object.keys(hotelDetails).filter(k =>
    k.includes('cancel') || k.includes('policy') || k.includes('free')
  ));

  // Try multiple ways to find cancellation info
  let cancelDescription = '';
  let freeCancel = 'No';

  // Check various possible fields
  if (hotelDetails.cancellation_policy) {
    cancelDescription = hotelDetails.cancellation_policy;
  } else if (hotelDetails.free_cancellation !== undefined) {
    freeCancel = hotelDetails.free_cancellation ? 'Yes' : 'No';
    cancelDescription = hotelDetails.free_cancellation
      ? 'Free cancellation available'
      : 'Non-refundable rate';
  } else if (hotelDetails.policies && Array.isArray(hotelDetails.policies)) {
    const cancelPolicy = hotelDetails.policies.find(p => p.type?.includes('cancel'));
    if (cancelPolicy) {
      cancelDescription = cancelPolicy.text || cancelPolicy.description || '';
    }
  }

  // Fallback to real hotel info
  if (!cancelDescription) {
    cancelDescription = 'Sinan Han Hotel offers flexible cancellation options depending on your room rate. Standard rates may require advance notice for cancellation. Free cancellation may be available on select rates. Please check your specific booking for details.';
  }

  return {
    title: 'Cancellation Policy',
    description: cancelDescription,
    freeCancel: freeCancel,
    deadline: hotelDetails.cancellation_deadline || 'Varies by rate type',
    note: 'For full details, please check at the time of booking'
  };
}

/**
 * Extract privacy policy information from Booking.com or hotel data
 */
function extractPrivacyPolicy(hotelDetails) {
  console.log('🔍 Available privacy policy fields:', Object.keys(hotelDetails).filter(k =>
    k.includes('privacy') || k.includes('policy') || k.includes('data') || k.includes('gdpr')
  ));

  let privacyText = hotelDetails.privacy_policy ||
                   hotelDetails.data_protection ||
                   hotelDetails.gdpr_policy || '';

  if (!privacyText) {
    privacyText = `Sinan Han Hotel respects your privacy. We collect personal information such as your name, email, phone number, and payment details for booking purposes and to provide excellent service. Your information is:

• Used solely for your stay and customer service
• Protected with industry-standard encryption
• Never shared with third parties without your consent
• Stored securely in compliance with data protection laws

You have the right to access, modify, or delete your personal information at any time. For a complete privacy policy, please visit our website or contact us directly.`;
  }

  return {
    title: 'Privacy & Data Protection Policy',
    description: privacyText,
    dataCollection: 'We collect contact information, payment details, and booking preferences to process your reservation.',
    dataProtection: 'All data is encrypted and stored securely on protected servers.',
    guestRights: 'You have the right to access, modify, or request deletion of your personal data at any time.',
    contact: 'For privacy inquiries, contact: info@sinanhanhotel.com'
  };
}

/**
 * Extract room information with pricing
 */
function extractRoomData(hotelDetails) {
  const rooms = hotelDetails.rooms || hotelDetails.hotel_facilities?.rooms || [];

  console.log('🔍 Available room fields:', {
    hasRooms: !!hotelDetails.rooms,
    hasFacilities: !!hotelDetails.hotel_facilities,
    roomCount: rooms.length,
    minTotalPrice: hotelDetails.min_total_price,
    currency: hotelDetails.currency
  });

  // If no rooms found, create default room with available pricing
  if (rooms.length === 0) {
    return [{
      type: 'Standard Double Room',
      size: '18 m²',
      price: hotelDetails.min_total_price || hotelDetails.price_min || 0,
      currency: hotelDetails.currency || 'EUR',
      capacity: 2,
      amenities: ['Air Conditioning', 'Private Bathroom', 'Flat-Screen TV'],
      rating: hotelDetails.review_score || 9.7
    }];
  }

  return rooms.map(room => ({
    type: room.room_type || room.name || 'Standard Room',
    size: room.room_size || room.size || '18-45 m²',
    price: room.min_price || room.price || hotelDetails.min_total_price || 0,
    currency: hotelDetails.currency || 'EUR',
    capacity: room.capacity || room.number_of_beds || 2,
    amenities: room.amenities || room.facilities || [],
    rating: hotelDetails.review_score || 9.7
  }));
}

/**
 * Extract amenities from hotel details
 */
function extractAmenities(hotelDetails) {
  const amenitiesList = hotelDetails.hotel_facilities?.amenities || [];
  return amenitiesList.slice(0, 8).map(amenity => ({
    name: amenity.name || amenity,
    icon: getAmenityIcon(amenity.name || amenity)
  }));
}

/**
 * Get icon for amenity
 */
function getAmenityIcon(amenityName) {
  const icons = {
    'wifi': '📶',
    'restaurant': '🍽️',
    'pool': '🏊',
    'gym': '💪',
    'spa': '🧖',
    'parking': '🅿️',
    'air': '❄️',
    'tv': '📺'
  };

  const key = Object.keys(icons).find(k =>
    amenityName.toLowerCase().includes(k)
  );

  return icons[key] || '✓';
}

// ============================================
// DATABASE FUNCTIONS FOR PAYMENT
// ============================================

/**
 * Load bookings from file
 */
function loadBookings() {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return { bookings: [] };
  } catch (error) {
    console.error('Error reading bookings file:', error.message);
    return { bookings: [] };
  }
}

/**
 * Save bookings to file
 */
function saveBookings(data) {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing bookings file:', error.message);
    return false;
  }
}

/**
 * Save a new booking with pending status
 */
function saveBooking(orderNumber, bookingData) {
  const data = loadBookings();
  const booking = {
    order_number: orderNumber,
    status: 'pending',
    ...bookingData,
    created_at: new Date().toISOString(),
    paid_at: null,
    transaction_id: null
  };
  data.bookings.push(booking);
  saveBookings(data);
  console.log('✅ Booking saved:', orderNumber);
  return booking;
}

/**
 * Get booking by order number
 */
function getBooking(orderNumber) {
  const data = loadBookings();
  return data.bookings.find(b => b.order_number === orderNumber) || null;
}

/**
 * Update booking status
 */
function updateBookingStatus(orderNumber, status, transactionId = null) {
  const data = loadBookings();
  const booking = data.bookings.find(b => b.order_number === orderNumber);

  if (booking) {
    booking.status = status;
    if (transactionId) {
      booking.transaction_id = transactionId;
    }
    if (status === 'paid') {
      booking.paid_at = new Date().toISOString();
    }
    saveBookings(data);
    console.log('✅ Booking status updated:', orderNumber, 'Status:', status);
    return booking;
  }
  return null;
}

/**
 * Generate HMAC-SHA256 digest for Monri
 * Format: merchant|amount|currency|order_number|timestamp
 */
function generateMonriDigest(amount, currency, orderNumber, timestamp) {
  const digestInput = `${MONRI_MERCHANT_ID}|${amount}|${currency}|${orderNumber}|${timestamp}`;
  const digest = crypto
    .createHmac('sha256', MONRI_SECRET_KEY)
    .update(digestInput)
    .digest('base64');
  return digest;
}

/**
 * Validate input for payment initialization
 */
function validatePaymentInput(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Invalid name');
  }

  if (!data.email || !data.email.includes('@')) {
    errors.push('Invalid email');
  }

  if (!data.checkin_date || !data.checkout_date) {
    errors.push('Missing check-in or check-out date');
  }

  const checkin = new Date(data.checkin_date);
  const checkout = new Date(data.checkout_date);

  if (checkout <= checkin) {
    errors.push('Check-out date must be after check-in date');
  }

  if (checkout < new Date()) {
    errors.push('Check-out date must be in the future');
  }

  if (!data.room_id || data.room_id.trim().length < 1) {
    errors.push('Invalid room ID');
  }

  if (!data.price || data.price <= 0) {
    errors.push('Invalid price');
  }

  if (!data.adults_number || data.adults_number < 1) {
    errors.push('Invalid number of adults');
  }

  return errors;
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * GET /api/hotel
 * Returns complete hotel information including prices, policies, and cancellation details
 */
app.get('/api/hotel', async (req, res) => {
  try {
    const hotelData = await fetchHotelData();

    if (!hotelData) {
      return res.status(404).json({
        error: 'Hotel data not found',
        message: 'Unable to fetch hotel information from Booking.com API'
      });
    }

    res.json(hotelData);
  } catch (error) {
    console.error('Hotel endpoint error:', error);
    res.status(500).json({
      error: 'Failed to fetch hotel data',
      message: error.message
    });
  }
});

/**
 * GET /api/hotel/prices
 * Returns room prices and availability
 */
app.get('/api/hotel/prices', async (req, res) => {
  try {
    const hotelData = await fetchHotelData();

    if (!hotelData) {
      return res.status(404).json({ error: 'Hotel data not found' });
    }

    res.json({
      pricePerNight: hotelData.pricePerNight,
      currency: hotelData.currency,
      rooms: hotelData.rooms
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/hotel/policies
 * Returns all hotel policies
 */
app.get('/api/hotel/policies', async (req, res) => {
  try {
    const hotelData = await fetchHotelData();

    if (!hotelData) {
      return res.status(404).json({ error: 'Hotel data not found' });
    }

    res.json({
      policies: hotelData.policies,
      cancellation: hotelData.cancellationPolicy,
      privacy: hotelData.privacyPolicy
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/hotel/cancellation
 * Returns cancellation policy
 */
app.get('/api/hotel/cancellation', async (req, res) => {
  try {
    const hotelData = await fetchHotelData();

    if (!hotelData) {
      return res.status(404).json({ error: 'Hotel data not found' });
    }

    res.json(hotelData.cancellationPolicy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/hotel/privacy
 * Returns privacy policy
 */
app.get('/api/hotel/privacy', async (req, res) => {
  try {
    const hotelData = await fetchHotelData();

    if (!hotelData) {
      return res.status(404).json({ error: 'Hotel data not found' });
    }

    res.json(hotelData.privacyPolicy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/bookings
 * Save booking information
 */
app.post('/api/bookings', express.json(), async (req, res) => {
  try {
    const booking = req.body;

    if (!booking.guestName || !booking.email || !booking.checkIn || !booking.checkOut) {
      return res.status(400).json({
        error: 'Invalid booking data',
        message: 'Missing required fields'
      });
    }

    // Generate booking ID
    const bookingId = 'BK' + Date.now();

    // Save booking to JSON file
    const bookingsData = loadBookings();
    const bookingRecord = {
      id: bookingId,
      guestName: booking.guestName,
      email: booking.email,
      phone: booking.phone || 'N/A',
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      roomType: booking.roomType || 'N/A',
      guests: booking.guests || 'N/A',
      message: booking.message || 'No message provided',
      status: 'pending',
      createdAt: new Date().toISOString(),
      notificationEmail: 'about@hotelsinanhan.com'
    };

    bookingsData.bookings = bookingsData.bookings || [];
    bookingsData.bookings.unshift(bookingRecord); // Add to beginning of array
    saveBookings(bookingsData);

    // Log booking details to console
    console.log('\n========================================');
    console.log('📧 NEW BOOKING REQUEST');
    console.log('========================================');
    console.log(`Booking ID: ${bookingId}`);
    console.log(`Guest: ${booking.guestName}`);
    console.log(`Email: ${booking.email}`);
    console.log(`Phone: ${booking.phone || 'N/A'}`);
    console.log(`Check-in: ${booking.checkIn}`);
    console.log(`Check-out: ${booking.checkOut}`);
    console.log(`Room: ${booking.roomType || 'N/A'}`);
    console.log(`Guests: ${booking.guests || 'N/A'}`);
    console.log(`Message: ${booking.message || 'No message'}`);
    console.log(`Send notification to: about@hotelsinanhan.com`);
    console.log('========================================\n');

    // Send email if transporter is configured
    let emailSent = false;
    if (transporter) {
      try {
        // Email to hotel manager
        await transporter.sendMail({
          from: EMAIL_USER,
          to: BOOKING_REQUEST_EMAIL,
          subject: `New Booking Request from ${booking.guestName}`,
          html: `
            <h2>New Booking Request</h2>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Guest Name:</strong> ${booking.guestName}</p>
            <p><strong>Email:</strong> ${booking.email}</p>
            <p><strong>Phone:</strong> ${booking.phone || 'N/A'}</p>
            <p><strong>Check-in:</strong> ${booking.checkIn}</p>
            <p><strong>Check-out:</strong> ${booking.checkOut}</p>
            <p><strong>Room Type:</strong> ${booking.roomType || 'N/A'}</p>
            <p><strong>Number of Guests:</strong> ${booking.guests || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <p>${booking.message || 'No message provided'}</p>
            <hr>
            <p>Please reply directly to the guest email address above to confirm the reservation.</p>
          `
        });

        // Confirmation email to guest
        await transporter.sendMail({
          from: EMAIL_USER,
          to: booking.email,
          subject: 'Booking Request Received - Sinan Han Hotel',
          html: `
            <h2>Dear ${booking.guestName},</h2>
            <p>Thank you for your booking request at <strong>Sinan Han Hotel</strong>!</p>
            <p>We have received your reservation inquiry with the following details:</p>
            <ul>
              <li><strong>Booking ID:</strong> ${bookingId}</li>
              <li><strong>Check-in:</strong> ${booking.checkIn}</li>
              <li><strong>Check-out:</strong> ${booking.checkOut}</li>
              <li><strong>Room Type:</strong> ${booking.roomType || 'N/A'}</li>
              <li><strong>Number of Guests:</strong> ${booking.guests || 'N/A'}</li>
            </ul>
            <p>Our team will review your request and contact you shortly to confirm your reservation and discuss payment details.</p>
            <p>If you have any questions in the meantime, please feel free to contact us at <strong>about@hotelsinanhan.com</strong> or call us.</p>
            <p>Best regards,<br>
            <strong>Sinan Han Hotel Team</strong><br>
            Mostar, Bosnia and Herzegovina</p>
          `
        });

        emailSent = true;
        console.log('✅ Confirmation emails sent to guest and hotel');
      } catch (emailError) {
        console.error('❌ Error sending email:', emailError.message);
        console.log('⚠️  Booking saved but email not sent. Check bookings.json file or visit /api/bookings/list');
      }
    } else {
      console.log('⚠️  Email not configured. Booking saved to bookings.json');
      console.log('💡 To view all bookings, visit: http://localhost:5000/api/bookings/list');
    }

    res.json({
      success: true,
      message: emailSent
        ? 'Booking received and confirmation email sent to about@hotelsinanhan.com'
        : 'Booking received and saved. Check console or /api/bookings/list for details.',
      bookingId: bookingId,
      savedToFile: true,
      emailSent: emailSent
    });
  } catch (error) {
    console.error('❌ Booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get detailed room specifications based on room type
 */
function getRoomSpecifications(roomType, index) {
  const specs = {
    'Superior Apartment': {
      room_type_id: 'superior-apartment',
      bedrooms: 'Bedroom 1: 1 queen bed, Bedroom 2: 1 queen bed',
      living_room: 'Living room: 1 sofa bed',
      size: '65',
      capacity: 6,
      amenities: ['Free WiFi', 'Air Conditioning', 'Private Kitchen', 'Flat-screen TV', 'Mountain View', 'City View', 'Terrace', 'Coffee Machine', 'Minibar'],
      specifications: [
        'Entire apartment: 65 m²',
        'Private kitchen with full amenities',
        'Attached bathroom with bathtub/shower',
        'Garden, mountain, and city views',
        'Air conditioning throughout',
        'Flat-screen TV with satellite channels',
        'Soundproof walls',
        'Patio and terrace access',
        'Coffee machine and minibar',
        'Free WiFi and toiletries included',
        'Safe, bidet, and walk-in closet',
        'Hardwood/parquet floors',
        'Desk and sitting area',
        'Electric kettle and dining area',
        'Hairdryer and iron available'
      ]
    },
    'Two Bedroom Deluxe': {
      room_type_id: 'two-bedroom-deluxe',
      bedrooms: 'Bedroom 1: 1 queen bed, Bedroom 2: 1 queen bed',
      living_room: 'Living room: 1 sofa bed',
      size: '65',
      capacity: 6,
      price: 262,
      regularPrice: 297,
      discountPrice: 262,
      touristTax: 4,
      currency: 'BAM',
      amenities: [
        'Private Kitchen',
        'Attached Bathroom',
        'Garden View',
        'Mountain View',
        'City View',
        'Inner Courtyard View',
        'Air Conditioning',
        'Patio',
        'Flat-screen TV',
        'Soundproof',
        'Terrace',
        'Coffee Machine',
        'Minibar',
        'Free WiFi',
        'Free Toiletries',
        'Safe',
        'Bidet',
        'Bathtub or Shower',
        'Hardwood/Parquet Floors',
        'Hypoallergenic',
        'Desk',
        'High Chair',
        'Sitting Area',
        'Private Entrance',
        'Slippers',
        'Refrigerator',
        'Satellite Channels',
        'Tea/Coffee Maker',
        'Iron',
        'Interconnecting Rooms Available',
        'Heating',
        'Hairdryer',
        'Kitchenware',
        'Kitchenette',
        'Walk-in Closet',
        'Carpeted',
        'Electric Kettle',
        'Outdoor Furniture',
        'Cable Channels',
        'Wake-up Service',
        'Wardrobe or Closet',
        'Oven',
        'Stovetop',
        'Dining Area',
        'Dining Table',
        'Upper Floors Accessible by Stairs Only',
        'Clothes Rack',
        'Toilet Paper',
        'Books, DVDs or Music for Children',
        'Single-room AC for Guest Accommodation',
        'Hand Sanitizer'
      ],
      specifications: [
        'Entire apartment: 65 m²',
        'Two queen bedrooms plus living room with sofa bed',
        'Private kitchen with full appliances',
        'Attached bathroom with bathtub or shower',
        'Multiple views: Garden, Mountain, City, and Inner Courtyard',
        'Air conditioning and heating throughout',
        'Flat-screen TV with satellite and cable channels',
        'Soundproof walls for privacy',
        'Patio and terrace with outdoor furniture',
        'Coffee machine, minibar, and electric kettle',
        'Free WiFi and safe storage',
        'Free toiletries, bidet, and hairdryer',
        'Walk-in closet and wardrobes',
        'Hardwood/parquet floors',
        'Work desk and comfortable sitting area',
        'Full kitchenware, oven, and stovetop',
        'Dining area with dining table',
        'Iron, slippers, and hypoallergenic bedding',
        'Private entrance and interconnecting rooms',
        'Wake-up service and hand sanitizer provided',
        'Electric kettle and dining area for 6',
        'Hairdryer, iron, and premium amenities'
      ]
    },
    'Standard Double Room': {
      room_type_id: 'standard-double',
      bedrooms: '1 double bed',
      size: '18',
      capacity: 2,
      amenities: ['Free WiFi', 'Air Conditioning', 'Private Bathroom', 'Flat-screen TV', 'City View'],
      specifications: [
        'Room size: 18 m²',
        'Private bathroom with shower',
        'Air conditioning',
        'Flat-screen TV',
        'Free WiFi',
        'Desk',
        'Wardrobe',
        'City view'
      ]
    },
    'Superior Suite': {
      room_type_id: 'superior-suite',
      bedrooms: '1 king bed',
      size: '35',
      capacity: 3,
      amenities: ['Free WiFi', 'Air Conditioning', 'Private Bathroom', 'Flat-screen TV', 'Old Bridge View', 'Balcony', 'Sitting Area'],
      specifications: [
        'Suite size: 35 m²',
        'Stunning Old Bridge view',
        'Private balcony',
        'Separate sitting area',
        'King-size bed',
        'Air conditioning',
        'Flat-screen TV',
        'Free WiFi',
        'Minibar',
        'Coffee machine',
        'Private bathroom with bathtub'
      ]
    },
    'Double Room with Terrace': {
      room_type_id: 'double-terrace',
      bedrooms: '1 queen bed',
      size: '25',
      capacity: 2,
      amenities: ['Free WiFi', 'Air Conditioning', 'Private Terrace', 'Flat-screen TV', 'Garden View'],
      specifications: [
        'Room size: 25 m²',
        'Private terrace',
        'Garden view',
        'Queen-size bed',
        'Air conditioning',
        'Flat-screen TV',
        'Free WiFi',
        'Private bathroom with shower',
        'Outdoor furniture'
      ]
    },
    'Standard Queen Room': {
      room_type_id: 'standard-queen',
      bedrooms: '1 queen bed',
      size: '20',
      capacity: 2,
      amenities: ['Free WiFi', 'Air Conditioning', 'Private Bathroom', 'Flat-screen TV'],
      specifications: [
        'Room size: 20 m²',
        'Queen-size bed',
        'Private bathroom',
        'Air conditioning',
        'Flat-screen TV',
        'Free WiFi',
        'Desk and chair',
        'Wardrobe'
      ]
    },
    'Two-Bedroom Deluxe Apartment': {
      room_type_id: 'two-bedroom-deluxe',
      bedrooms: 'Bedroom 1: 1 queen bed, Bedroom 2: 1 queen bed',
      living_room: 'Living room: 1 sofa bed',
      size: '65',
      capacity: 6,
      price: 262,
      regularPrice: 297,
      discountPrice: 262,
      touristTax: 4,
      currency: 'BAM',
      amenities: ['Free WiFi', 'Air Conditioning', 'Private Kitchen', 'Flat-screen TV', 'Mountain View', 'City View', 'Garden View', 'Terrace', 'Coffee Machine', 'Minibar', 'Soundproof'],
      specifications: [
        'Entire apartment: 65 m²',
        'Private kitchen with full amenities',
        'Attached bathroom with bathtub/shower',
        'Garden, mountain, and city views',
        'Air conditioning throughout',
        'Flat-screen TV with satellite channels',
        'Soundproof walls',
        'Patio and terrace access',
        'Coffee machine and minibar',
        'Free WiFi and toiletries included',
        'Safe, bidet, and walk-in closet',
        'Hardwood/parquet floors',
        'Desk and sitting area',
        'Private entrance',
        'Electric kettle and dining area',
        'Hairdryer and iron available'
      ]
    }
  };

  // Match room type or use default
  const matchedSpec = specs[roomType] || specs['Standard Double Room'];
  return matchedSpec;
}

/**
 * POST /api/rooms
 * Search available rooms by dates and guest count
 */
app.post('/api/rooms', express.json(), async (req, res) => {
  try {
    const { hotel_id, checkin_date, checkout_date, adults_number } = req.body;

    // Input validation
    if (!hotel_id || !checkin_date || !checkout_date || !adults_number) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: hotel_id, checkin_date, checkout_date, adults_number'
      });
    }

    // Fetch hotel data
    const hotelData = await fetchHotelData();

    if (!hotelData || !hotelData.rooms) {
      return res.status(404).json({
        success: false,
        error: 'Hotel data not found or no rooms available'
      });
    }

    // Calculate number of nights
    const checkin = new Date(checkin_date);
    const checkout = new Date(checkout_date);
    const nights = (checkout - checkin) / (1000 * 60 * 60 * 24);

    if (nights <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Check-out date must be after check-in date'
      });
    }

    // Process rooms - calculate price based on nights and guest count
    const rooms = hotelData.rooms.map((room, index) => {
      let basePrice = room.price || hotelData.pricePerNight || 100;

      // Adjust price based on number of guests (add 10% per extra guest after first 2)
      let guestFactor = 1;
      if (adults_number > 2) {
        guestFactor = 1 + ((adults_number - 2) * 0.1);
      }

      const totalPrice = basePrice * nights * guestFactor;

      // Get detailed specifications for each room type
      const roomSpecs = getRoomSpecifications(room.type || `Room ${index + 1}`, index);

      return {
        room_id: `room_${index + 1}`,
        room_type_id: roomSpecs.room_type_id,
        room_name: room.type || `Room ${index + 1}`,
        description: `${room.size || roomSpecs.size} - Capacity: ${room.capacity || roomSpecs.capacity} guests`,
        price: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
        currency: hotelData.currency || 'BAM',
        availability: true,
        basePrice: basePrice,
        nights: nights,
        pricePerNight: room.price || hotelData.pricePerNight,
        ...roomSpecs
      };
    });

    console.log(`✅ Found ${rooms.length} rooms for ${checkin_date} to ${checkout_date} (${nights} nights, ${adults_number} adults)`);

    res.json({
      success: true,
      rooms: rooms
    });

  } catch (error) {
    console.error('Room search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search rooms',
      message: error.message
    });
  }
});

/**
 * POST /api/payment/init
 * Initialize Monri payment and save booking
 */
app.post('/api/payment/init', express.json(), async (req, res) => {
  try {
    const bookingData = req.body;

    // Validate input
    const validationErrors = validatePaymentInput(bookingData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }

    // Generate unique order number
    const orderNumber = `BK${Date.now()}`;

    // Calculate amount in cents (for Monri)
    const amount = Math.round(bookingData.price * 100);

    // Generate timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    // Generate HMAC-SHA256 digest
    const digest = generateMonriDigest(
      amount,
      bookingData.currency || PAYMENT_CURRENCY,
      orderNumber,
      timestamp
    );

    // Save booking with pending status
    const savedBooking = saveBooking(orderNumber, {
      name: bookingData.name,
      email: bookingData.email,
      hotel_id: bookingData.hotel_id,
      room_id: bookingData.room_id,
      checkin_date: bookingData.checkin_date,
      checkout_date: bookingData.checkout_date,
      adults_number: bookingData.adults_number,
      price: bookingData.price,
      currency: bookingData.currency || PAYMENT_CURRENCY
    });

    console.log(`🔐 Payment initialized for ${bookingData.email} - Order: ${orderNumber}`);

    res.json({
      success: true,
      merchantId: MONRI_MERCHANT_ID,
      amount: amount,
      currency: bookingData.currency || PAYMENT_CURRENCY,
      orderNumber: orderNumber,
      digest: digest,
      timestamp: timestamp,
      message: 'Payment initialized. Complete payment on Monri Lightbox'
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize payment',
      message: error.message
    });
  }
});

/**
 * POST /webhook/monri
 * Handle payment notification from Monri
 */
app.post('/webhook/monri', express.json(), async (req, res) => {
  try {
    const { order_number, status, transaction_id, amount, currency } = req.body;

    console.log('🔔 Monri webhook received:', {
      order_number,
      status,
      transaction_id
    });

    if (!order_number) {
      return res.status(400).json({ success: false, error: 'Missing order_number' });
    }

    // Get booking
    const booking = getBooking(order_number);
    if (!booking) {
      console.warn('⚠️ Webhook for unknown booking:', order_number);
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Update booking status based on payment status
    let bookingStatus = 'pending';
    if (status === 'approved' || status === 'success' || status === 'paid') {
      bookingStatus = 'paid';
    } else if (status === 'declined' || status === 'failed') {
      bookingStatus = 'declined';
    }

    // Update booking with payment status
    const updatedBooking = updateBookingStatus(
      order_number,
      bookingStatus,
      transaction_id
    );

    // Send confirmation email on successful payment
    if (bookingStatus === 'paid' && transporter) {
      try {
        // Email to guest
        const checkin = new Date(booking.checkin_date).toLocaleDateString();
        const checkout = new Date(booking.checkout_date).toLocaleDateString();

        await transporter.sendMail({
          from: EMAIL_USER,
          to: booking.email,
          subject: '✅ Booking Confirmed - Sinan Han Hotel',
          html: `
            <h2>Booking Confirmation</h2>
            <p>Dear ${booking.name},</p>
            <p>Your payment has been successfully received! Your booking is now confirmed.</p>
            <h3>Booking Details</h3>
            <ul>
              <li><strong>Order Number:</strong> ${order_number}</li>
              <li><strong>Check-in:</strong> ${checkin}</li>
              <li><strong>Check-out:</strong> ${checkout}</li>
              <li><strong>Room:</strong> ${booking.room_id}</li>
              <li><strong>Guests:</strong> ${booking.adults_number} Adult(s)</li>
              <li><strong>Total Paid:</strong> ${booking.price} ${booking.currency}</li>
              <li><strong>Transaction ID:</strong> ${transaction_id}</li>
            </ul>
            <p>Our team at Sinan Han Hotel looks forward to welcoming you!</p>
            <p>If you have any questions, please contact us at <strong>about@hotelsinanhan.com</strong></p>
            <p>Best regards,<br>
            <strong>Sinan Han Hotel Team</strong></p>
          `
        });

        // Email to hotel manager
        await transporter.sendMail({
          from: EMAIL_USER,
          to: BOOKING_REQUEST_EMAIL,
          subject: `✅ Payment Received - Booking #${order_number}`,
          html: `
            <h2>Payment Confirmed - New Booking</h2>
            <p><strong>Guest Name:</strong> ${booking.name}</p>
            <p><strong>Email:</strong> ${booking.email}</p>
            <p><strong>Order Number:</strong> ${order_number}</p>
            <p><strong>Check-in:</strong> ${new Date(booking.checkin_date).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> ${new Date(booking.checkout_date).toLocaleDateString()}</p>
            <p><strong>Amount Paid:</strong> ${booking.price} ${booking.currency}</p>
            <p><strong>Transaction ID:</strong> ${transaction_id}</p>
            <p>Booking is confirmed and ready for check-in.</p>
          `
        });

        console.log('✅ Confirmation emails sent for booking:', order_number);
      } catch (emailError) {
        console.error('⚠️ Error sending confirmation email:', emailError.message);
        // Don't fail the webhook response if email fails
      }
    }

    res.json({ success: true, message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
      message: error.message
    });
  }
});

/**
 * GET /api/bookings/list
 * View all booking requests (for hotel staff)
 */
app.get('/api/bookings/list', (req, res) => {
  try {
    const bookingsData = loadBookings();
    const allBookings = bookingsData.bookings || [];

    // Filter to show only booking requests (not payment orders)
    const bookingRequests = allBookings.filter(b => b.guestName && !b.order_number);

    // Create HTML response for easy viewing
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sinan Han - Booking Requests</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          h1 { color: #2c3e50; }
          .booking { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .booking h3 { margin-top: 0; color: #3498db; }
          .detail { margin: 8px 0; }
          .label { font-weight: bold; color: #555; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; }
          .status-pending { background: #f39c12; color: white; }
          .status-confirmed { background: #27ae60; color: white; }
          .email-link { color: #3498db; text-decoration: none; }
          .count { color: #888; font-size: 14px; }
        </style>
      </head>
      <body>
        <h1>📧 Booking Requests - about@hotelsinanhan.com</h1>
        <p class="count">Total requests: ${bookingRequests.length}</p>
        ${bookingRequests.length === 0 ? '<p>No booking requests yet.</p>' : ''}
        ${bookingRequests.map(booking => `
          <div class="booking">
            <h3>${booking.guestName} <span class="status status-${booking.status}">${booking.status}</span></h3>
            <div class="detail"><span class="label">Booking ID:</span> ${booking.id}</div>
            <div class="detail"><span class="label">Email:</span> <a href="mailto:${booking.email}" class="email-link">${booking.email}</a></div>
            <div class="detail"><span class="label">Phone:</span> ${booking.phone}</div>
            <div class="detail"><span class="label">Check-in:</span> ${booking.checkIn}</div>
            <div class="detail"><span class="label">Check-out:</span> ${booking.checkOut}</div>
            <div class="detail"><span class="label">Room:</span> ${booking.roomType}</div>
            <div class="detail"><span class="label">Guests:</span> ${booking.guests}</div>
            <div class="detail"><span class="label">Message:</span> ${booking.message}</div>
            <div class="detail"><span class="label">Received:</span> ${new Date(booking.createdAt).toLocaleString()}</div>
          </div>
        `).join('')}
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.error('Error loading bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/booking/:orderNumber
 * Get booking status by order number (used by frontend polling)
 */
app.get('/api/booking/:orderNumber', (req, res) => {
  try {
    const { orderNumber } = req.params;

    const booking = getBooking(orderNumber);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking: {
        order_number: booking.order_number,
        status: booking.status,
        transaction_id: booking.transaction_id,
        name: booking.name,
        email: booking.email,
        room_id: booking.room_id,
        checkin_date: booking.checkin_date,
        checkout_date: booking.checkout_date,
        total_price: booking.price,
        currency: booking.currency,
        created_at: booking.created_at,
        paid_at: booking.paid_at
      }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve booking',
      message: error.message
    });
  }
});

/**
 * GET /api/debug
 * Shows raw API response for debugging
 */
app.get('/api/debug', async (req, res) => {
  try {
    console.log('🐛 Debug endpoint called - fetching raw API data...');

    const searchOptions = {
      method: 'GET',
      url: 'https://booking-com.p.rapidapi.com/v1/hotels/search',
      params: {
        query: 'Sinan Han Hotel Mostar',
        checkin_date: new Date().toISOString().split('T')[0],
        checkout_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        adults_number: 1,
        room_number: 1,
        order_by: 'price'
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    };

    const searchResponse = await axios.request(searchOptions);
    const hotels = searchResponse.data.result || [];

    const sinanHan = hotels.find(hotel =>
      hotel.hotel_name && hotel.hotel_name.toLowerCase().includes('sinan')
    ) || hotels[0];

    if (!sinanHan) {
      return res.status(404).json({
        error: 'No hotels found',
        searchResults: hotels.slice(0, 5)
      });
    }

    const detailsOptions = {
      method: 'GET',
      url: 'https://booking-com.p.rapidapi.com/v1/hotels/details',
      params: {
        hotel_id: sinanHan.hotel_id,
        checkin_date: new Date().toISOString().split('T')[0],
        checkout_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        adults_number: 1
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    };

    const detailsResponse = await axios.request(detailsOptions);
    const hotelDetails = detailsResponse.data.data || sinanHan;

    res.json({
      message: 'Raw API response - check these fields',
      hotelName: hotelDetails.hotel_name || sinanHan.hotel_name,
      hotelId: sinanHan.hotel_id,
      availableFields: Object.keys(hotelDetails).sort(),
      sampleData: {
        pricing: {
          min_total_price: hotelDetails.min_total_price,
          price: hotelDetails.price,
          currency: hotelDetails.currency
        },
        policies: {
          cancellation_policy: hotelDetails.cancellation_policy,
          free_cancellation: hotelDetails.free_cancellation,
          check_in: hotelDetails.check_in,
          check_out: hotelDetails.check_out
        },
        rating: hotelDetails.review_score,
        rooms: hotelDetails.rooms?.length || 0,
        facilities: hotelDetails.hotel_facilities?.amenities?.length || 0
      },
      fullResponse: hotelDetails
    });

  } catch (error) {
    res.status(500).json({
      error: 'Debug fetch failed',
      message: error.message,
      details: error.response?.data || error.config?.url
    });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   SINAN HAN HOTEL BOOKING SYSTEM      ║
║   Backend Server Running              ║
╚════════════════════════════════════════╝

  🌐 Server: http://localhost:${PORT}
  📡 RapidAPI Integration: Active
  💳 Monri Payment: ${MONRI_TEST_MODE ? 'TEST MODE' : 'PRODUCTION'}
  🏨 Hotel: Sinan Han, Mostar
  ⭐ Rating: 9.7/10

Available Endpoints:
  📍 Hotel Information:
  • GET  /api/hotel              - Full hotel data
  • GET  /api/hotel/prices       - Room prices
  • GET  /api/hotel/policies     - All policies
  • GET  /api/hotel/cancellation - Cancellation policy
  • GET  /api/hotel/privacy      - Privacy policy

  💳 Payment & Booking:
  • POST /api/rooms              - Search available rooms
  • POST /api/payment/init       - Initialize Monri payment
  • POST /webhook/monri          - Monri payment webhook
  • GET  /api/booking/:orderNum  - Get booking status
  • POST /api/bookings           - Create booking request
  • GET  /api/bookings/list      - View all booking requests

📡 Debug Endpoints (for development):
  • GET  /api/debug              - Show raw API response

Test in your browser:
  ✓ http://localhost:${PORT}/api/hotel
  ✓ http://localhost:${PORT}/api/hotel/prices
  ✓ http://localhost:${PORT}/api/debug
  `);
});

module.exports = app;
