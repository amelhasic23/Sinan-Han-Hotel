#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const terserBin = path.join(
    rootDir,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'terser.cmd' : 'terser'
);

function minifyJS(inputFile, outputFile) {
    try {
        if (!fs.existsSync(terserBin)) {
            throw new Error(`Terser CLI not found: ${terserBin}`);
        }

        const resolvedInput = path.join(rootDir, inputFile);
        const resolvedOutput = path.join(rootDir, outputFile);
        const result = spawnSync(
            terserBin,
            [resolvedInput, '-c', 'passes=2', '-m', '-o', resolvedOutput],
            {
                encoding: 'utf8',
                stdio: 'pipe',
                shell: process.platform === 'win32'
            }
        );

        if (result.status !== 0) {
            throw new Error((result.stderr || result.stdout || `Terser failed with exit code ${result.status}`).trim());
        }

        const originalSize = fs.statSync(resolvedInput).size;
        const minifiedSize = fs.statSync(resolvedOutput).size;
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

function main() {
    minifyJS('SiminHan.js', 'SiminHan.min.js');
    minifyJS('lazy-templates.js', 'lazy-templates.min.js');
    minifyJS('booking-ui.js', 'booking-ui.min.js');
    minifyJS('sw.js', 'sw.min.js');
    console.log('\n✓ JavaScript minification complete!');
}

main();
