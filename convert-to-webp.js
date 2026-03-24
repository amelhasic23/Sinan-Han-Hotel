/**
 * WebP Image Conversion Script
 *
 * This script converts all JPG/JPEG/PNG images in the Rooms directory to WebP format
 * while preserving the original directory structure.
 *
 * Installation:
 * npm install sharp --save-dev
 *
 * Usage:
 * node convert-to-webp.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOMS_DIR = path.join(__dirname, 'Rooms');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];
const WEBP_QUALITY = 85; // Quality setting for WebP (0-100)

/**
 * Recursively find all image files in a directory
 */
function findImages(dir, imageList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findImages(filePath, imageList);
        } else if (IMAGE_EXTENSIONS.includes(path.extname(file))) {
            imageList.push(filePath);
        }
    });

    return imageList;
}

/**
 * Convert an image to WebP format
 */
async function convertToWebP(inputPath) {
    const ext = path.extname(inputPath);
    const outputPath = inputPath.replace(ext, '.webp');

    try {
        await sharp(inputPath)
            .webp({ quality: WEBP_QUALITY })
            .toFile(outputPath);

        const inputSize = fs.statSync(inputPath).size;
        const outputSize = fs.statSync(outputPath).size;
        const savings = ((1 - outputSize / inputSize) * 100).toFixed(2);

        console.log(`✓ Converted: ${path.relative(__dirname, inputPath)}`);
        console.log(`  Size: ${(inputSize / 1024).toFixed(2)}KB → ${(outputSize / 1024).toFixed(2)}KB (${savings}% reduction)\n`);

        return { inputPath, outputPath, inputSize, outputSize, savings };
    } catch (error) {
        console.error(`✗ Failed to convert: ${path.relative(__dirname, inputPath)}`);
        console.error(`  Error: ${error.message}\n`);
        return null;
    }
}

/**
 * Main conversion process
 */
async function main() {
    console.log('🔍 Scanning for images...\n');

    if (!fs.existsSync(ROOMS_DIR)) {
        console.error(`❌ Error: Rooms directory not found at ${ROOMS_DIR}`);
        console.error('Please make sure you run this script from the project root directory.');
        process.exit(1);
    }

    const images = findImages(ROOMS_DIR);

    if (images.length === 0) {
        console.log('ℹ️  No images found to convert.');
        return;
    }

    console.log(`📸 Found ${images.length} image(s) to convert.\n`);
    console.log('🚀 Starting conversion...\n');

    const results = [];
    for (const imagePath of images) {
        const result = await convertToWebP(imagePath);
        if (result) {
            results.push(result);
        }
    }

    // Print summary
    console.log('═'.repeat(60));
    console.log('📊 Conversion Summary');
    console.log('═'.repeat(60));

    const totalInputSize = results.reduce((sum, r) => sum + r.inputSize, 0);
    const totalOutputSize = results.reduce((sum, r) => sum + r.outputSize, 0);
    const totalSavings = ((1 - totalOutputSize / totalInputSize) * 100).toFixed(2);

    console.log(`✓ Successfully converted: ${results.length} / ${images.length} images`);
    console.log(`📦 Total original size: ${(totalInputSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📦 Total WebP size: ${(totalOutputSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`💾 Total space saved: ${((totalInputSize - totalOutputSize) / 1024 / 1024).toFixed(2)} MB (${totalSavings}%)`);
    console.log('═'.repeat(60));

    console.log('\n✅ Conversion complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your HTML to use WebP images with fallback to JPG');
    console.log('2. Use <picture> element for browser compatibility');
    console.log('3. Test images in different browsers');
    console.log('4. Consider deleting original images after verification (optional)');
}

// Run the script
main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
