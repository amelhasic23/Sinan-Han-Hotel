#!/usr/bin/env node
'use strict';

const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const INPUT = path.join(ROOT, 'LOGO SINAN HAN_page-0001.jpg');

const outputs = [
    { file: 'logo-58.webp',  size: 58,  format: 'webp', quality: 85 },
    { file: 'logo-116.webp', size: 116, format: 'webp', quality: 85 },
    { file: 'logo-116.jpg',  size: 116, format: 'jpeg', quality: 85 },
];

(async () => {
    for (const { file, size, format, quality } of outputs) {
        const out = path.join(ROOT, file);
        await sharp(INPUT)
            .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            [format]({ quality })
            .toFile(out);
        const bytes = require('fs').statSync(out).size;
        console.log(`✓ ${file}  ${(bytes / 1024).toFixed(1)} KB`);
    }
    console.log('\nLogo optimisation complete. Commit the three new files.');
})().catch(err => { console.error(err.message); process.exit(1); });
