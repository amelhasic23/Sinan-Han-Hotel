#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

async function minifyJS(inputFile, outputFile) {
    try {
        const code = fs.readFileSync(inputFile, 'utf8');
        const result = await minify(code, {
            compress: {
                passes: 2,
                defaults: true
            },
            mangle: true,
            format: {
                comments: false
            }
        });

        if (!result.code) {
            throw new Error('Terser returned empty output');
        }

        fs.writeFileSync(outputFile, result.code);

        const originalSize = fs.statSync(inputFile).size;
        const minifiedSize = fs.statSync(outputFile).size;
        const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);

        console.log(`✓ Minified ${path.basename(inputFile)}`);
        console.log(`  Original: ${(originalSize / 1024).toFixed(2)} KB`);
        console.log(`  Minified: ${(minifiedSize / 1024).toFixed(2)} KB`);
        console.log(`  Savings: ${savings}%`);
    } catch (err) {
        console.error(`✗ Error minifying ${inputFile}:`, err.message);
        process.exitCode = 1;
    }
}

async function main() {
    await minifyJS('SiminHan.js', 'SiminHan.min.js');
    await minifyJS('booking-ui.js', 'booking-ui.min.js');
    await minifyJS('sw.js', 'sw.min.js');
    console.log('\n✓ JavaScript minification complete!');
}

main();
