#!/usr/bin/env node

/**
 * Copy static assets to build directory
 */

const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function copyDir(src, dest) {
    ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function copyFile(src, dest) {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
    const size = fs.statSync(dest).size;
    console.log(`✓ Copied ${path.basename(src)} (${(size / 1024).toFixed(2)} KB)`);
}

// Ensure dist folder exists
ensureDir('dist');

// Copy minified files to dist
if (fs.existsSync('SinanHan.min.html')) copyFile('SinanHan.min.html', 'dist/index.html');
if (fs.existsSync('SinanHan.min.css')) copyFile('SinanHan.min.css', 'dist/SinanHan.min.css');
if (fs.existsSync('SiminHan.min.js')) copyFile('SiminHan.min.js', 'dist/SiminHan.min.js');
if (fs.existsSync('sw.min.js')) copyFile('sw.min.js', 'dist/sw.js');
if (fs.existsSync('translations.json')) copyFile('translations.json', 'dist/translations.json');

// Copy room images
if (fs.existsSync('Rooms')) {
    copyDir('Rooms', 'dist/Rooms');
    console.log('✓ Copied Rooms directory');
}

// Copy server-side files
if (fs.existsSync('server.js')) copyFile('server.js', 'dist/server.js');
if (fs.existsSync('package.json')) copyFile('package.json', 'dist/package.json');
if (fs.existsSync('.env')) {
    console.log('⚠  Skipping .env (should be configured on server manually)');
}

// Check for .env.example
if (fs.existsSync('.env.example')) {
    copyFile('.env.example', 'dist/.env.example');
}

console.log('\n✓ Build complete! Files are in the /dist folder');
console.log('  Run: cd dist && npm install && npm start');
