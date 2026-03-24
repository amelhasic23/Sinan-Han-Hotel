#!/bin/bash

# ============================================
# QUICK TROUBLESHOOTING SCRIPT
# ============================================

echo "🔍 Testing Sinan Han Hotel Booking System..."
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ ERROR: .env file not found!"
    echo "Please create .env with your RAPIDAPI_KEY"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Check if server is running
echo "🔄 Testing server connection..."
if ! curl -s http://localhost:5000 > /dev/null 2>&1; then
    echo "❌ Server is not running!"
    echo "Start server with: npm start"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Test debug endpoint
echo "📡 Testing API with /api/debug endpoint..."
echo ""

curl -s http://localhost:5000/api/debug | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/debug

echo ""
echo "---"
echo "If you see an error above:"
echo "  • API key might be invalid"
echo "  • Rate limit might be exceeded"
echo "  • Network connection issue"
echo ""
echo "Check these:"
echo "  1. Go to https://rapidapi.com/apidojo/api/booking"
echo "  2. Verify your subscription is ACTIVE"
echo "  3. Check API key hasn't been revoked"
echo "  4. Verify rate limit:"
echo "     - Free plan: 30/month"
echo "     - Check dashboard for usage"
