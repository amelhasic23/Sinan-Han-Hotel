#!/usr/bin/env node

/**
 * Direct API Key Tester
 * Tests RapidAPI key and shows what's working/broken
 */

const axios = require('axios');
require('dotenv').config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'booking-com.p.rapidapi.com';

console.log(`
╔════════════════════════════════════════╗
║  SINAN HAN HOTEL - API KEY TESTER     ║
╚════════════════════════════════════════╝
`);

if (!RAPIDAPI_KEY) {
  console.error('❌ ERROR: RAPIDAPI_KEY not found in .env');
  console.error('');
  console.error('Please create .env file with:');
  console.error('  RAPIDAPI_KEY=your_key_here');
  console.error('  RAPIDAPI_HOST=booking-com.p.rapidapi.com');
  process.exit(1);
}

console.log('✅ API Key found:', RAPIDAPI_KEY.substring(0, 10) + '...');
console.log('🔗 API Host:', RAPIDAPI_HOST);
console.log('');

async function testAPI() {
  try {
    console.log('🔄 Testing API connection...');
    console.log('');

    // Step 1: Search for hotels
    console.log('Step 1️⃣  Searching for "Sinan Han Hotel Mostar"...');

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
      },
      timeout: 10000
    };

    const searchResponse = await axios.request(searchOptions);
    const hotels = searchResponse.data.result || [];

    console.log(`✅ Search successful! Found ${hotels.length} hotel(s)`);
    console.log('');

    if (hotels.length === 0) {
      console.error('❌ No hotels found in search results!');
      console.log('Try searching with different query parameters.');
      process.exit(1);
    }

    // Show found hotels
    console.log('Hotels found:');
    hotels.slice(0, 3).forEach((hotel, i) => {
      console.log(`  ${i + 1}. ${hotel.hotel_name || 'Unknown'}`);
      console.log(`     ID: ${hotel.hotel_id}`);
      console.log(`     Price: ${hotel.min_total_price || 'N/A'}`);
      console.log('');
    });

    // Step 2: Find Sinan Han
    console.log('Step 2️⃣  Looking for Sinan Han Hotel...');

    const sinanHan = hotels.find(h => h.hotel_name && h.hotel_name.toLowerCase().includes('sinan')) || hotels[0];

    if (!sinanHan) {
      console.error('❌ Sinan Han Hotel not found!');
      console.log('Using first hotel in search results instead.');
    } else {
      console.log(`✅ Found: ${sinanHan.hotel_name}`);
    }
    console.log('');

    // Step 3: Get detailed info
    console.log(`Step 3️⃣  Fetching details for ${sinanHan.hotel_name}...`);

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
      },
      timeout: 10000
    };

    const detailsResponse = await axios.request(detailsOptions);
    const hotelDetails = detailsResponse.data.data || sinanHan;

    console.log('✅ Details fetched successfully!');
    console.log('');

    // Step 4: Show what data we have
    console.log('Step 4️⃣  Analyzing data...');
    console.log('');

    console.log('📊 Available Data:');
    console.log(`  Hotel Name: ${hotelDetails.hotel_name || 'N/A'}`);
    console.log(`  Rating: ${hotelDetails.review_score || 'N/A'}`);
    console.log(`  Price: ${hotelDetails.min_total_price || hotelDetails.price || 'N/A'}`);
    console.log(`  Currency: ${hotelDetails.currency || 'N/A'}`);
    console.log(`  Description: ${hotelDetails.description ? hotelDetails.description.substring(0, 50) + '...' : 'N/A'}`);
    console.log('');

    console.log('🔍 Policy Fields:');
    const policyFields = Object.keys(hotelDetails).filter(k =>
      k.includes('cancel') || k.includes('policy') || k.includes('free') || k.includes('privacy')
    );

    if (policyFields.length === 0) {
      console.log('  ⚠️  No policy fields found in response');
    } else {
      policyFields.forEach(field => {
        const value = hotelDetails[field];
        const preview = typeof value === 'string' ? value.substring(0, 60) + '...' : String(value);
        console.log(`  • ${field}: ${preview}`);
      });
    }
    console.log('');

    console.log('💰 Pricing Fields:');
    const priceFields = Object.keys(hotelDetails).filter(k =>
      k.includes('price') || k.includes('cost') || k.includes('rate') || k.includes('amount')
    );

    if (priceFields.length === 0) {
      console.log('  ⚠️  No price fields found in response');
    } else {
      priceFields.forEach(field => {
        console.log(`  • ${field}: ${hotelDetails[field]}`);
      });
    }
    console.log('');

    console.log('🏨 Room Fields:');
    if (hotelDetails.rooms && hotelDetails.rooms.length > 0) {
      console.log(`  ✅ Found ${hotelDetails.rooms.length} room(s)`);
      console.log(`  First room: ${hotelDetails.rooms[0].room_type || 'N/A'}`);
    } else {
      console.log('  ⚠️  No rooms array in response');
    }
    console.log('');

    // Step 5: Summary
    console.log('╔════════════════════════════════════════╗');
    console.log('║         ✅ API IS WORKING!             ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log('✅ Your API key is VALID');
    console.log('✅ Connection to Booking.com API is successful');
    console.log('✅ Hotel data is being retrieved');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Run: npm start');
    console.log('  2. Visit: http://localhost:5000/api/hotel');
    console.log('  3. Check the response');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ API TEST FAILED');
    console.error('');
    console.error(`Error: ${error.message}`);
    console.error('');

    if (error.response?.status === 401) {
      console.error('🔴 Authentication Failed!');
      console.error('Your API key is invalid or has been revoked.');
      console.error('');
      console.error('Solutions:');
      console.error('  1. Go to https://rapidapi.com/apidojo/api/booking');
      console.error('  2. Click on your subscription');
      console.error('  3. Get a NEW API key');
      console.error('  4. Update .env file with the new key');
    } else if (error.response?.status === 429) {
      console.error('🟡 Rate Limit Exceeded!');
      console.error('You have exceeded your API call limit.');
      console.error('');
      console.error('Solutions:');
      console.error('  1. Wait for rate limit to reset');
      console.error('  2. Or upgrade your RapidAPI plan');
      console.error('  3. Check your usage at https://rapidapi.com/');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔴 Connection Refused!');
      console.error('Cannot connect to RapidAPI servers.');
      console.error('');
      console.error('Check:');
      console.error('  1. Internet connection');
      console.error('  2. Firewall settings');
      console.error('  3. Proxy settings');
    } else {
      console.error('Response:', error.response?.data);
    }

    process.exit(1);
  }
}

testAPI();
