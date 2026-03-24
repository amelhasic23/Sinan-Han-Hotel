#!/usr/bin/env node

/**
 * Simple JavaScript minifier
 * Removes comments, whitespace, and basic optimizations
 */

const fs = require('fs');
const path = require('path');

function minifyJS(inputFile, outputFile) {
    try {
        // Read the file
        let code = fs.readFileSync(inputFile, 'utf8');

        // Remove single-line comments (except directives like shebang)
        code = code.replace(/^[\s]*\/\/.*$/gm, '');

        // Remove multi-line comments
        code = code.replace(/\/\*[\s\S]*?\*\//g, '');

        // Remove leading/trailing whitespace on each line
        code = code.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');

        // Remove extra newlines
        code = code.replace(/\n\s*\n/g, '\n');

        // Remove spaces around operators (carefully)
        code = code.replace(/\s*([=+\-*/%<>!&|^~?:;,.])\s*/g, '$1');

        // Add spaces back after keywords
        code = code.replace(/(if|else|for|while|function|return|var|let|const|switch|case|default)\(/g, '$1 (');
        code = code.replace(/(if|else|for|while|function|return|var|let|const|switch|case|default) \(/g, '$1 (');

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

// Minify both JS files
minifyJS('SiminHan.js', 'SiminHan.min.js');
minifyJS('sw.js', 'sw.min.js');

console.log('\n✓ JavaScript minification complete!');
