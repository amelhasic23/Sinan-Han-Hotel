#!/usr/bin/env node
/**
 * WebP Conversion Script
 * Converts all JPEG images in Rooms/ directory to WebP format
 * Maintains original dimensions and quality
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOMS_DIR = path.join(__dirname, '..', 'Rooms');
const QUALITY = 80; // WebP quality (0-100)
let convertedCount = 0;
let errorCount = 0;
let skippedCount = 0;

async function convertImagesToWebP() {
    console.log('\n🎨 Starting WebP Image Conversion\n');
    console.log('='.repeat(70));

    try {
        // Get all room subdirectories
        const roomDirs = fs.readdirSync(ROOMS_DIR);

        for (const roomDir of roomDirs) {
            const roomPath = path.join(ROOMS_DIR, roomDir);
            const stats = fs.statSync(roomPath);

            if (!stats.isDirectory()) continue;

            console.log(`\n📁 Processing: ${roomDir}`);

            // Get all JPEG files in room directory
            const files = fs.readdirSync(roomPath).filter(file =>
                /\.jpe?g$/i.test(file)
            );

            console.log(`   Found: ${files.length} JPEG images`);

            for (const file of files) {
                const inputPath = path.join(roomPath, file);
                const fileName = path.parse(file).name;
                const outputPath = path.join(roomPath, `${fileName}.webp`);

                // Skip if WebP already exists
                if (fs.existsSync(outputPath)) {
                    console.log(`   ⏭️  SKIP: ${fileName}.webp (already exists)`);
                    skippedCount++;
                    continue;
                }

                try {
                    // Get original image info
                    const metadata = await sharp(inputPath).metadata();
                    const originalSize = fs.statSync(inputPath).size;

                    // Convert to WebP
                    await sharp(inputPath)
                        .webp({ quality: QUALITY })
                        .toFile(outputPath);

                    const webpSize = fs.statSync(outputPath).size;
                    const savedBytes = originalSize - webpSize;
                    const savingPercent = ((savedBytes / originalSize) * 100).toFixed(1);

                    console.log(
                        `   ✓ ${fileName}.webp | ` +
                        `${(originalSize / 1024).toFixed(1)} KB → ${(webpSize / 1024).toFixed(1)} KB | ` +
                        `Saves ${savingPercent}%`
                    );
                    convertedCount++;
                } catch (error) {
                    console.log(`   ❌ ERROR: ${fileName} - ${error.message}`);
                    errorCount++;
                }
            }
        }

        // Summary
        console.log('\n' + '='.repeat(70));
        console.log('\n📊 CONVERSION SUMMARY:\n');
        console.log(`   ✅ Converted: ${convertedCount} images`);
        console.log(`   ⏭️  Skipped:   ${skippedCount} images (already WebP)`);
        console.log(`   ❌ Errors:    ${errorCount} images\n`);

        // Calculate total savings
        try {
            let totalOriginal = 0;
            let totalWebP = 0;

            const roomDirs2 = fs.readdirSync(ROOMS_DIR);
            for (const roomDir of roomDirs2) {
                const roomPath = path.join(ROOMS_DIR, roomDir);
                const stats = fs.statSync(roomPath);
                if (!stats.isDirectory()) continue;

                const files = fs.readdirSync(roomPath);
                for (const file of files) {
                    const filePath = path.join(roomPath, file);
                    const size = fs.statSync(filePath).size;

                    if (/\.jpe?g$/i.test(file)) {
                        totalOriginal += size;
                    } else if (/\.webp$/i.test(file)) {
                        totalWebP += size;
                    }
                }
            }

            const totalSavings = totalOriginal - totalWebP;
            const savingPercent = ((totalSavings / totalOriginal) * 100).toFixed(1);

            console.log(`   📈 Total JPEG Size:    ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   📉 Total WebP Size:    ${(totalWebP / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   💾 Total Savings:      ${(totalSavings / 1024 / 1024).toFixed(2)} MB (${savingPercent}%)\n`);
        } catch (error) {
            console.log(`   ⚠️  Could not calculate totals: ${error.message}\n`);
        }

        console.log('✨  WebP conversion complete!\n');
        console.log('Next: Update SinanHan.html to use <picture> tags with WebP fallback\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Check if sharp is installed
try {
    require('sharp');
} catch (e) {
    console.error('\n❌ sharp module not installed!');
    console.error('Install with: npm install sharp\n');
    process.exit(1);
}

// Run conversion
convertImagesToWebP().catch(error => {
    console.error('Conversion failed:', error);
    process.exit(1);
});
