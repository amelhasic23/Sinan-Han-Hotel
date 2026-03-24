# Mobile Performance Optimization Guide

## Optimizations Applied (2026-03-21)

### 1. ✅ Font-Display Optimization
**Issue**: Font-display not set, causing text visibility issues during font loading.

**Fix Applied**:
- Added Tailwind config with font-display configuration
- Added custom CSS with `font-display: swap` for system fonts
- Location: `index.html` lines 33-42

**Impact**: Improves text visibility during page load, prevents FOIT (Flash of Invisible Text)

---

### 2. ✅ JavaScript Minification
**Issue**: JavaScript files were not minified (40KB main.js, 3.9KB api.js, 6.7KB analytics.js)

**Fix Applied**:
- Updated HTML to load `.min.js` versions
- Rebuilt `main.min.js` (40KB → 21KB, 47% reduction)
- Updated service worker to cache minified versions
- Bumped cache version to v1.6.0

**Impact**:
- **main.js**: 40KB → 21KB (47% smaller)
- **api.js**: 3.9KB → 2.2KB (44% smaller)
- **analytics.js**: 6.7KB → 3.5KB (48% smaller)
- **Total savings**: ~28KB reduction

---

### 3. ✅ Image Loading Optimization
**Issue**: Images loaded without lazy loading or async decoding

**Fix Applied**:
- Added `loading="lazy"` to all dynamically created room images
- Added `decoding="async"` for non-blocking image rendering
- Location: `frontend/js/main.js` lines 821-822, 1026-1027

**Impact**: Images load only when needed, reduces initial page load time

---

### 4. ⏳ CSS Optimization (Partial)
**Issue**: Tailwind CDN loads ~4MB of CSS, most unused (Lighthouse reports significant unused CSS)

**Setup Complete**:
- ✅ Created `tailwind.config.js` with content paths
- ✅ Created `frontend/css/input.css` with base styles
- ✅ Added build scripts to `package.json`
- ❌ **Action Required**: Install Tailwind CLI and build custom CSS

**To Complete CSS Optimization**:

```bash
# 1. Install Tailwind CSS CLI
npm install -D tailwindcss@3.4.0 postcss autoprefixer

# 2. Build optimized CSS (typical output: ~40KB vs 4MB CDN)
npm run build:css

# 3. Update index.html to use built CSS instead of CDN
# Replace:
#   <script src="https://cdn.tailwindcss.com"></script>
# With:
#   <link rel="stylesheet" href="/css/output.css">

# 4. Remove inline Tailwind config from index.html (lines 33-37)

# 5. Update service worker (sw.js) to cache the new CSS file
# Add to STATIC_ASSETS:
#   '/css/output.css',
# Remove:
#   'https://cdn.tailwindcss.com',

# 6. Bump service worker cache version to v1.7.0
```

**Expected Impact**:
- CSS size: 4MB → ~40KB (99% reduction)
- Lighthouse "Unused CSS" warning: FIXED
- Performance score: +10-15 points

---

## Current File Sizes

### JavaScript (Minified)
- `main.min.js`: 21KB (was 40KB)
- `api.min.js`: 2.2KB (was 3.9KB)
- `analytics.min.js`: 3.5KB (was 6.7KB)
- **Total JS**: ~27KB gzipped to ~10KB with server compression

### CSS
- **Current** (CDN): ~4MB (40KB gzipped)
- **After build**: ~40KB (12KB gzipped) - **99% reduction**

### Images
- Room images cached: ~300KB total
- Loaded with lazy loading + async decoding
- **Recommendation**: Convert to WebP format for additional 25-35% savings

---

## Performance Improvements

### Before Optimization
- Performance Score: 72/100
- JavaScript: 51KB unminified
- CSS: 4MB from CDN
- Images: Eager loading, blocking render

### After Current Optimizations
- Performance Score: **~82/100** (estimated)
- JavaScript: 27KB minified (47% reduction)
- CSS: Still using CDN (awaiting build)
- Images: Lazy loaded, async decoded

### After CSS Build (Final)
- Performance Score: **85-92/100** (estimated)
- JavaScript: 27KB minified
- CSS: 40KB custom build (99% reduction from CDN)
- Images: Lazy loaded, optimized

---

## Additional Recommendations

### 1. WebP Image Conversion
Convert all JPEG images to WebP format for ~30% file size reduction:

```bash
# Install WebP tools
# Windows: Download from https://developers.google.com/speed/webp/download

# Convert images (example)
cwebp -q 85 input.jpg -o output.webp
```

### 2. Image Resizing
The image `713093570.jpg` is 576x768px but displayed smaller. Consider:
- Creating responsive image variants (small, medium, large)
- Using `<picture>` element with multiple sources
- Serving correctly sized images for mobile/desktop

### 3. Enable Text Compression
Already configured on backend servers (ports 3000 & 5000) ✅

### 4. Add Resource Hints
Consider adding to `<head>`:

```html
<!-- Preconnect to external resources -->
<link rel="preconnect" href="https://www.googletagmanager.com">
<link rel="preconnect" href="https://ipgtest.monri.com">

<!-- Preload critical assets -->
<link rel="preload" href="/css/output.css" as="style">
<link rel="preload" href="/js/main.min.js" as="script">
```

---

## Testing Instructions

### Test with Lighthouse
```bash
# Desktop
npx lighthouse http://localhost:3000 --view

# Mobile
npx lighthouse http://localhost:3000 --preset=mobile --view
```

### Expected Scores After Full Optimization
- **Performance**: 85-92/100
- **Accessibility**: 95-98/100
- **Best Practices**: 90-95/100
- **SEO**: 95-100/100

---

## Files Modified

1. `frontend/index.html`
   - Added font-display optimization
   - Switched to minified JS files

2. `frontend/js/main.js`
   - Added lazy loading to images
   - Added async decoding

3. `frontend/sw.js`
   - Updated to cache minified JS files
   - Bumped version to v1.6.0

4. `package.json`
   - Added CSS build scripts

5. **New Files Created**:
   - `tailwind.config.js` (Tailwind configuration)
   - `frontend/css/input.css` (CSS source file)

---

## Next Steps

1. Install Tailwind CLI: `npm install -D tailwindcss@3.4.0`
2. Build CSS: `npm run build:css`
3. Update `index.html` to use built CSS (see instructions above)
4. Test with Lighthouse mobile preset
5. Deploy and verify improvements

**Estimated Total Performance Gain**: +13-20 points (72 → 85-92/100)
