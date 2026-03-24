/**
 * Responsive Image Generator
 *
 * Creates multiple sizes of each image for responsive loading
 *
 * Installation:
 * npm install sharp --save-dev
 *
 * Usage:
 * node create-responsive-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOMS_DIR = path.join(__dirname, 'Rooms');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];

// Define responsive sizes
const SIZES = [
    { suffix: '-small', width: 400, quality: 80 },   // Mobile
    { suffix: '-medium', width: 800, quality: 85 },  // Tablet
    { suffix: '-large', width: 1200, quality: 85 }   // Desktop
];

/**
 * Find all images in directory
 */
function findImages(dir, imageList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findImages(filePath, imageList);
        } else if (IMAGE_EXTENSIONS.includes(path.extname(file))) {
            // Skip already processed responsive images
            if (!/-small|-medium|-large/.test(file)) {
                imageList.push(filePath);
            }
        }
    });

    return imageList;
}

/**
 * Create responsive versions of an image
 */
async function createResponsiveVersions(inputPath) {
    const ext = path.extname(inputPath);
    const basePath = inputPath.replace(ext, '');
    const results = [];

    console.log(`\n📷 Processing: ${path.relative(__dirname, inputPath)}`);

    for (const size of SIZES) {
        const outputPathWebP = `${basePath}${size.suffix}.webp`;
        const outputPathJPG = `${basePath}${size.suffix}.jpg`;

        try {
            // Create WebP version
            await sharp(inputPath)
                .resize(size.width, null, { withoutEnlargement: true })
                .webp({ quality: size.quality })
                .toFile(outputPathWebP);

            // Create JPG fallback
            await sharp(inputPath)
                .resize(size.width, null, { withoutEnlargement: true })
                .jpeg({ quality: size.quality })
                .toFile(outputPathJPG);

            const webpSize = fs.statSync(outputPathWebP).size;
            const jpgSize = fs.statSync(outputPathJPG).size;

            console.log(`  ✓ ${size.suffix.replace('-', '').toUpperCase()}: WebP ${(webpSize / 1024).toFixed(2)}KB | JPG ${(jpgSize / 1024).toFixed(2)}KB`);

            results.push({ size: size.suffix, webpSize, jpgSize });
        } catch (error) {
            console.error(`  ✗ Failed to create ${size.suffix} version: ${error.message}`);
        }
    }

    return results;
}

/**
 * Main process
 */
async function main() {
    console.log('🔍 Scanning for images...\n');

    if (!fs.existsSync(ROOMS_DIR)) {
        console.error(`❌ Error: Rooms directory not found at ${ROOMS_DIR}`);
        process.exit(1);
    }

    const images = findImages(ROOMS_DIR);

    if (images.length === 0) {
        console.log('ℹ️  No images found to process.');
        return;
    }

    console.log(`📸 Found ${images.length} image(s) to process.`);
    console.log('🚀 Creating responsive versions...\n');

    let processedCount = 0;
    for (const imagePath of images) {
        await createResponsiveVersions(imagePath);
        processedCount++;
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📊 Summary');
    console.log('═'.repeat(60));
    console.log(`✓ Processed: ${processedCount} images`);
    console.log(`✓ Created: ${processedCount * SIZES.length * 2} files (WebP + JPG fallbacks)`);
    console.log('═'.repeat(60));

    console.log('\n✅ Responsive images created successfully!');
    console.log('\n📝 Next step: Update your HTML to use srcset');
    console.log('See IMAGE-OPTIMIZATION-GUIDE.md for implementation details.');
}

// Run the script
main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
