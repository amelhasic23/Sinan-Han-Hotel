const fs = require('fs');
let code = fs.readFileSync('booking-ui.js', 'utf8');
code = code
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .join('\n');
fs.writeFileSync('booking-ui.min.js', code);
const orig = fs.statSync('booking-ui.js').size;
const min = fs.statSync('booking-ui.min.js').size;
console.log('booking-ui.min.js rebuilt: ' + (orig/1024).toFixed(1) + 'KB -> ' + (min/1024).toFixed(1) + 'KB');
