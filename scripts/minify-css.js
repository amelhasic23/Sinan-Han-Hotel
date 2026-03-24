#!/usr/bin/env node

/**
 * Simple CSS minifier
 * Removes comments and unnecessary whitespace
 */

const fs = require('fs');
const path = require('path');

function minifyCSS(inputFile, outputFile) {
    try {
        // Read the file
        let code = fs.readFileSync(inputFile, 'utf8');

        // Remove comments
        code = code.replace(/\/\*[\s\S]*?\*\//g, '');

        // Remove newlines and extra spaces
        code = code.replace(/\n\s*/g, '');
        code = code.replace(/\s*([:;,{}])\s*/g, '$1');
        code = code.replace(/;\}/g, '}');

        // Trim
        code = code.trim();

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

// Minify CSS
minifyCSS('SinanHan.css', 'SinanHan.min.css');

console.log('\n✓ CSS minification complete!');
