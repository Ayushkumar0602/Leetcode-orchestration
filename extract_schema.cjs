const fs = require('fs');
const path = require('path');

const rootDir = '/Users/ayushjaiswal/Desktop/AI INTERVIEW  main  ';
const ignoreFolders = ['node_modules', '.git', 'dist', 'build', '.cache'];

let collections = new Set();
let rtdbPaths = new Set();

function scrapeDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (ignoreFolders.includes(file)) continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scrapeDir(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // collection(db, 'name')
            const collMatches = content.matchAll(/collection\s*\(\s*db\s*,\s*['"`](.*?)['"`]/g);
            for (const match of collMatches) collections.add(match[1]);

            // doc(db, 'collection', ...)
            const docMatches = content.matchAll(/doc\s*\(\s*db\s*,\s*['"`](.*?)['"`]/g);
            for (const match of docMatches) collections.add(match[1]);

            // rtdbRef(rtdb, 'path') or ref(rtdb, 'path')
            const refMatches = content.matchAll(/ref\s*\(\s*rtdb\s*,\s*[`'"](.*?)[`'"]/g);
            for (const match of refMatches) rtdbPaths.add(match[1]);
            
            const rtdbRefMatches = content.matchAll(/rtdbRef\s*\(\s*rtdb\s*,\s*[`'"](.*?)[`'"]/g);
            for (const match of rtdbRefMatches) rtdbPaths.add(match[1]);
        }
    }
}

scrapeDir(rootDir);

console.log("=== FIRESTORE COLLECTIONS ===");
console.log(Array.from(collections).sort().join('\n'));
console.log("\n=== RTDB PATHS ===");
console.log(Array.from(rtdbPaths).sort().join('\n'));
