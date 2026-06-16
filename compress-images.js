#!/usr/bin/env node
// Re-compress WebP room images, optionally limiting work to mobile-only derivatives.
// Run once: npm install -D sharp && node compress-images.js --mobile-only
// Expected savings are highest on the mobile-only bucket.

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOMS_DIR = path.join(__dirname, 'Rooms');
const QUALITY_SMALL = 60;
const QUALITY_MOBILE = 60;
const QUALITY_DEFAULT = 75;
const mobileOnly = process.argv.includes('--mobile-only');

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
    let quality = QUALITY_DEFAULT;
    if (filePath.endsWith('-small.webp')) {
        quality = QUALITY_SMALL;
    } else if (filePath.endsWith('-mobile.webp')) {
        quality = QUALITY_MOBILE;
    }
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
    const files = walkDir(ROOMS_DIR).filter(f => f.endsWith('.webp') && (!mobileOnly || f.endsWith('-mobile.webp')));
    console.log(`Compressing ${files.length} WebP files (${mobileOnly ? `mobile-only@${QUALITY_MOBILE}` : `small@${QUALITY_SMALL}, mobile@${QUALITY_MOBILE}, others@${QUALITY_DEFAULT}`})…\n`);
    for (const f of files) await compressWebp(f);
    console.log('\nDone. Re-run Lighthouse to verify improvements.');
})();
