/**
 * One-time conversion script: CSV → JSON
 * Run once with: node convert-to-json.js
 *
 * This generates backend/data/leetcode.json which is loaded instantly
 * at startup, replacing the slower CSV parse (~50k rows).
 */

const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const CSV_PATH = path.join(__dirname, 'leetcode_dataset - lc.csv');
const OUT_DIR = path.join(__dirname, 'data');
const OUT_PATH = path.join(OUT_DIR, 'leetcode.json');

if (!fs.existsSync(CSV_PATH)) {
    console.error(`ERROR: CSV not found at ${CSV_PATH}`);
    process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

const results = [];

console.log('Converting CSV → JSON, please wait...');

fs.createReadStream(CSV_PATH)
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('end', () => {
        fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2), 'utf-8');
        console.log(`✅ Done! Written ${results.length} problems to ${OUT_PATH}`);
        console.log(`   File size: ${(fs.statSync(OUT_PATH).size / 1024 / 1024).toFixed(2)} MB`);
    })
    .on('error', (err) => {
        console.error('Error during conversion:', err);
        process.exit(1);
    });
