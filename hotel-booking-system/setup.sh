#!/bin/bash

# ============================================
# SINAN HAN HOTEL BOOKING SYSTEM - SETUP
# ============================================

echo "🏨 Setting up Sinan Han Hotel Booking System..."
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "   ⚠️  Please add your RAPIDAPI_KEY to .env"
else
    echo "✅ .env file already exists"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║     🎉 Setup Complete! 🎉              ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Update .env with your RAPIDAPI_KEY"
echo "  2. Run: npm start"
echo "  3. Open: http://localhost:5000"
echo ""
echo "For more info, see README.md"
