#!/usr/bin/env node

/**
 * Simple HTML minifier
 * Removes comments and unnecessary whitespace
 */

const fs = require('fs');
const path = require('path');

function minifyHTML(inputFile, outputFile) {
    try {
        // Read the file
        let code = fs.readFileSync(inputFile, 'utf8');

        // Remove HTML comments (not conditional comments)
        code = code.replace(/<!--(?!\[if)[\s\S]*?-->/g, '');

        // Remove whitespace between tags
        code = code.replace(/>\s+</g, '><');

        // Remove leading/trailing whitespace on lines
        code = code.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('');

        // Fix script/style links to point to minified versions
        code = code.replace(/SiminHan\.js/g, 'SiminHan.min.js');
        code = code.replace(/SinanHan\.css/g, 'SinanHan.min.css');

        // Write minified file
        fs.writeFileSync(outputFile, code);

        const originalSize = fs.statSync(inputFile).size;
        const minifiedSize = fs.statSync(outputFile).size;
        const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);

        console.log(`✓ Minified ${path.basename(inputFile)}`);
        console.log(`  Original: ${(originalSize / 1024).toFixed(2)} KB`);
        console.log(`  Minified: ${(minifiedSize / 1024).toFixed(2)} KB`);
        console.log(`  Savings: ${savings}%`);
    } catch (err) {
        console.error(`✗ Error minifying ${inputFile}:`, err.message);
    }
}

// Minify HTML
minifyHTML('index.html', 'index.min.html');

console.log('\n✓ HTML minification complete!');
