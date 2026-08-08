// One-off: recompress the two images Lighthouse flagged for oversized delivery.
// Run: node _recompress-lh-images.js
// Delete this file after running.
'use strict';
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const targets = [
    { file: 'Rooms/queen standard room/706475810-mobile.webp', quality: 35 },
    { file: 'Rooms/ea3336c4-76ab-4989-8cfa-51d2aaf569a6 (1)-medium.webp',  quality: 50 },
];

(async () => {
    for (const { file, quality } of targets) {
        const abs = path.join(__dirname, file);
        const before = fs.statSync(abs).size;
        // Read into buffer first — avoids Windows file-handle lock from a prior sharp run
        const inputBuf = fs.readFileSync(abs);
        const buf = await sharp(inputBuf).webp({ quality, lossless: false, effort: 6 }).toBuffer();
        const saved = before - buf.length;
        if (saved > 0) {
            fs.writeFileSync(abs, buf);
            console.log(`${file}\n  ${kb(before)} → ${kb(buf.length)}  (saved ${kb(saved)})\n`);
        } else {
            console.log(`${file}: already optimal — skipped\n`);
        }
    }
})().catch(err => { console.error('Error:', err.message); process.exit(1); });

function kb(b) { return (b / 1024).toFixed(1) + ' KB'; }
