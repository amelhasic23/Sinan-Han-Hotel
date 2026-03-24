#!/usr/bin/env node
/**
 * HTML Image Updater
 * Converts <img> tags to <picture> tags with WebP support
 */

const fs = require('fs');
const path = require('path');

const htmlFile = path.join(__dirname, '..', 'SinanHan.html');

let content = fs.readFileSync(htmlFile, 'utf-8');
let updatedCount = 0;

// Pattern to match <img src="Rooms/..."> tags
const imgPattern = /<img\s+src="(Rooms\/[^"]+\.jpg)"\s+([^>]*)>/gi;

content = content.replace(imgPattern, (match, src, attrs) => {
    // Convert .jpg to .webp
    const webpSrc = src.replace(/\.jpg$/i, '.webp');

    // Create picture tag with WebP and JPEG fallback
    const pictureTag = `<picture>
                    <source srcset="${webpSrc}" type="image/webp">
                    <img src="${src}" ${attrs}>
                </picture>`;

    updatedCount++;
    return pictureTag;
});

// Write updated content back
fs.writeFileSync(htmlFile, content, 'utf-8');

console.log(`\n✅ Updated ${updatedCount} image tags to use WebP with fallback\n`);
console.log('Sample output:');
console.log('<picture>');
console.log('    <source srcset="Rooms/..../image.webp" type="image/webp">');
console.log('    <img src="Rooms/..../image.jpg" ...>');
console.log('</picture>');
console.log('\n✨ HTML update complete!\n');
