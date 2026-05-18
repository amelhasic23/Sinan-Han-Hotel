#!/usr/bin/env node
// Re-compress all WebP room images at quality 75 to reduce file sizes.
// Run once: npm install -D sharp && node compress-images.js
// Expected savings: ~170 KB across flagged images.

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOMS_DIR = path.join(__dirname, 'Rooms');
const QUALITY_SMALL = 60;
const QUALITY_DEFAULT = 75;

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
    const quality = filePath.endsWith('-small.webp') ? QUALITY_SMALL : QUALITY_DEFAULT;
    const inputBuf = fs.readFileSync(filePath);
    const buf = await sharp(inputBuf)
        .webp({ quality, lossless: false, effort: 6 })
        .toBuffer();
    if (buf.length < before) {
        try {
            fs.writeFileSync(filePath, buf);
            console.log(`${path.relative(__dirname, filePath)}: ${kb(before)} → ${kb(buf.length)} (-${kb(before - buf.length)})`);
        } catch (e) {
            console.log(`${path.relative(__dirname, filePath)}: SKIPPED (locked) — ${e.code}`);
        }
    } else {
        console.log(`${path.relative(__dirname, filePath)}: skipped (already optimal)`);
    }
}

function kb(bytes) { return (bytes / 1024).toFixed(1) + ' KB'; }

(async () => {
    const files = walkDir(ROOMS_DIR).filter(f => f.endsWith('.webp'));
    console.log(`Compressing ${files.length} WebP files (small@${QUALITY_SMALL}, others@${QUALITY_DEFAULT})…\n`);
    for (const f of files) await compressWebp(f);
    console.log('\nDone. Re-run Lighthouse to verify improvements.');
})();
