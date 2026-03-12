import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.join(__dirname, 'src');
const oldUrlRegex = /http:\/\/localhost:3001/g;
const newUrl = 'https://leetcode-orchestration-55z3.onrender.com';

function updateUrlsInDirectory(dirPath) {
    fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error(`Error reading directory ${dirPath}:`, err);
            return;
        }

        files.forEach(file => {
            const fullPath = path.join(dirPath, file.name);

            if (file.isDirectory()) {
                updateUrlsInDirectory(fullPath);
            } else if (file.isFile() && /\.(js|jsx|ts|tsx)$/.test(file.name)) {
                fs.readFile(fullPath, 'utf8', (err, data) => {
                    if (err) {
                        console.error(`Error reading file ${fullPath}:`, err);
                        return;
                    }

                    if (oldUrlRegex.test(data)) {
                        const updatedData = data.replace(oldUrlRegex, newUrl);
                        fs.writeFile(fullPath, updatedData, 'utf8', err => {
                            if (err) {
                                console.error(`Error writing file ${fullPath}:`, err);
                            } else {
                                console.log(`Updated URLs in: ${fullPath}`);
                            }
                        });
                    }
                });
            }
        });
    });
}

console.log('Starting URL update...');
updateUrlsInDirectory(directoryPath);
