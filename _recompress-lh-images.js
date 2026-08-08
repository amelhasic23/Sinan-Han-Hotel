// One-off: recompress the two images Lighthouse flagged for oversized delivery.
// Run: node _recompress-lh-images.js
// Delete this file after running.
'use strict';
const sharp = require('sharp');
const fs = require('fs');

const targets = [
    { file: 'Rooms/queen standard room/706475810-mobile.webp', quality: 45 },
    { file: 'Rooms/ea3336c4-76ab-4989-8cfa-51d2aaf569a6 (1)-medium.webp',  quality: 58 },
];

(async () => {
    for (const { file, quality } of targets) {
        const before = fs.statSync(file).size;
        const buf = await sharp(file).webp({ quality, lossless: false, effort: 6 }).toBuffer();
        const saved = before - buf.length;
        if (saved > 0) {
            fs.writeFileSync(file, buf);
            console.log(`${file}\n  ${kb(before)} → ${kb(buf.length)}  (saved ${kb(saved)})\n`);
        } else {
            console.log(`${file}: already optimal — skipped\n`);
        }
    }
})();

function kb(b) { return (b / 1024).toFixed(1) + ' KB'; }
