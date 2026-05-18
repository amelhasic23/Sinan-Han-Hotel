#!/usr/bin/env node
// Re-compress all WebP room images at quality 75 to reduce file sizes.
// Run once: npm install -D sharp && node compress-images.js
// Expected savings: ~170 KB across flagged images.

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOMS_DIR = path.join(__dirname, 'Rooms');
const QUALITY = 75;

function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.flatMap(e =>
        e.isDirectory()
            ? walkDir(path.join(dir, e.name))
            : path.join(dir, e.name)
    );
}

async function compressWebp(filePath) {
    const before = fs.statSync(filePath).size;
    const tmp = filePath + '.tmp';
    await sharp(filePath)
        .webp({ quality: QUALITY, lossless: false, effort: 6 })
        .toFile(tmp);
    const after = fs.statSync(tmp).size;
    if (after < before) {
        fs.renameSync(tmp, filePath);
        console.log(`${path.relative(__dirname, filePath)}: ${kb(before)} → ${kb(after)} (-${kb(before - after)})`);
    } else {
        fs.unlinkSync(tmp);
        console.log(`${path.relative(__dirname, filePath)}: skipped (already optimal)`);
    }
}

function kb(bytes) { return (bytes / 1024).toFixed(1) + ' KB'; }

(async () => {
    const files = walkDir(ROOMS_DIR).filter(f => f.endsWith('.webp'));
    console.log(`Compressing ${files.length} WebP files at quality ${QUALITY}…\n`);
    for (const f of files) await compressWebp(f);
    console.log('\nDone. Re-run Lighthouse to verify improvements.');
})();
