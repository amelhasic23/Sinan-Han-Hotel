const fs = require('fs');
const path = require('path');

// Read the CSS file
const inputFile = path.join(__dirname, 'SinanHan.css');
const outputFile = path.join(__dirname, 'SinanHan.min.css');

let css = fs.readFileSync(inputFile, 'utf8');

// Basic CSS minification
css = css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\n\s*/g, '') // Remove newlines and indentation
    .replace(/\s*{\s*/g, '{') // Remove spaces around {
    .replace(/\s*}\s*/g, '}') // Remove spaces around }
    .replace(/\s*:\s*/g, ':') // Remove spaces around :
    .replace(/\s*;\s*/g, ';') // Remove spaces around ;
    .replace(/\s*,\s*/g, ',') // Remove spaces around ,
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

// Write minified CSS
fs.writeFileSync(outputFile, css, 'utf8');

console.log('✓ CSS minified successfully');
console.log('  Input:  ' + (fs.statSync(inputFile).size / 1024).toFixed(2) + ' KB');
console.log('  Output: ' + (fs.statSync(outputFile).size / 1024).toFixed(2) + ' KB');
