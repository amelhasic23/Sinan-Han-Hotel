#!/bin/bash

# Mobile Performance Optimization - Final Step
# Run this script to complete CSS optimization

echo "🚀 Sinan Han Hotel - Mobile Performance Optimization"
echo "=================================================="
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   (hotel-booking-system folder)"
    exit 1
fi

echo "Step 1: Installing Tailwind CSS CLI..."
npm install -D tailwindcss@3.4.0 postcss autoprefixer

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Tailwind CSS"
    exit 1
fi

echo ""
echo "✅ Tailwind CSS installed successfully"
echo ""

echo "Step 2: Building optimized CSS..."
npm run build:css

if [ $? -ne 0 ]; then
    echo "❌ Failed to build CSS"
    exit 1
fi

echo ""
echo "✅ CSS built successfully!"
echo ""

# Get file size
if [ -f "frontend/css/output.css" ]; then
    SIZE=$(ls -lh frontend/css/output.css | awk '{print $5}')
    echo "📦 Generated CSS file: $SIZE (vs ~4MB from CDN)"
fi

echo ""
echo "=================================================="
echo "⚠️  MANUAL STEPS REQUIRED"
echo "=================================================="
echo ""
echo "1. Update frontend/index.html:"
echo "   Replace:"
echo "     <script src=\"https://cdn.tailwindcss.com\"></script>"
echo "     <script>"
echo "       // Tailwind config..."
echo "     </script>"
echo ""
echo "   With:"
echo "     <link rel=\"stylesheet\" href=\"/css/output.css\">"
echo ""
echo "2. Update frontend/sw.js:"
echo "   - Change CACHE_NAME to 'sinan-han-v1.7.0'"
echo "   - Add '/css/output.css' to STATIC_ASSETS"
echo "   - Remove 'https://cdn.tailwindcss.com' from STATIC_ASSETS"
echo ""
echo "3. Test the site:"
echo "   npm start"
echo "   Open http://localhost:3000"
echo ""
echo "4. Run Lighthouse test:"
echo "   npx lighthouse http://localhost:3000 --preset=mobile --view"
echo ""
echo "Expected Performance Score: 85-92/100 🎉"
echo ""
