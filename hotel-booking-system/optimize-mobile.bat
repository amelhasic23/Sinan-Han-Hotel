@echo off
REM Mobile Performance Optimization - Final Step
REM Run this script to complete CSS optimization

echo.
echo 🚀 Sinan Han Hotel - Mobile Performance Optimization
echo ==================================================
echo.

REM Check if in correct directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    echo    (hotel-booking-system folder)
    exit /b 1
)

echo Step 1: Installing Tailwind CSS CLI...
call npm install -D tailwindcss@3.4.0 postcss autoprefixer

if errorlevel 1 (
    echo ❌ Failed to install Tailwind CSS
    exit /b 1
)

echo.
echo ✅ Tailwind CSS installed successfully
echo.

echo Step 2: Building optimized CSS...
call npm run build:css

if errorlevel 1 (
    echo ❌ Failed to build CSS
    exit /b 1
)

echo.
echo ✅ CSS built successfully!
echo.

REM Check file size
if exist "frontend\css\output.css" (
    for %%A in (frontend\css\output.css) do (
        echo 📦 Generated CSS file: %%~zA bytes (vs ~4MB from CDN)
    )
)

echo.
echo ==================================================
echo ⚠️  MANUAL STEPS REQUIRED
echo ==================================================
echo.
echo 1. Update frontend/index.html:
echo    Replace:
echo      ^<script src="https://cdn.tailwindcss.com"^>^</script^>
echo      ^<script^>
echo        // Tailwind config...
echo      ^</script^>
echo.
echo    With:
echo      ^<link rel="stylesheet" href="/css/output.css"^>
echo.
echo 2. Update frontend/sw.js:
echo    - Change CACHE_NAME to 'sinan-han-v1.7.0'
echo    - Add '/css/output.css' to STATIC_ASSETS
echo    - Remove 'https://cdn.tailwindcss.com' from STATIC_ASSETS
echo.
echo 3. Test the site:
echo    npm start
echo    Open http://localhost:3000
echo.
echo 4. Run Lighthouse test:
echo    npx lighthouse http://localhost:3000 --preset=mobile --view
echo.
echo Expected Performance Score: 85-92/100 🎉
echo.
pause
