import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let problemsData = [];
let metadata = {
    topics: new Set(),
    companies: new Set()
};
let isLoaded = false;

// Prefer pre-converted JSON for instant startup (~10x faster).
// Fall back to CSV parsing if JSON not yet generated.
const JSON_PATH = path.join(__dirname, 'data', 'leetcode.json');
const CSV_PATH = path.join(__dirname, 'leetcode_dataset - lc.csv');

// ── Helper: extract metadata from a single row ──────────────────────────────
function extractMetadata(data) {
    if (data.related_topics) {
        data.related_topics.split(',').forEach(t => {
            const topic = t.trim();
            if (topic) metadata.topics.add(topic);
        });
    }
    if (data.companies) {
        data.companies.split(',').forEach(c => {
            const comp = c.trim();
            if (comp) metadata.companies.add(comp);
        });
    }
}

// ── Load from JSON (preferred) ───────────────────────────────────────────────
function loadFromJSON() {
    return new Promise((resolve, reject) => {
        try {
            console.log('[Dataset] Loading from JSON cache...');
            const raw = fs.readFileSync(JSON_PATH, 'utf-8');
            const data = JSON.parse(raw);
            data.forEach(row => extractMetadata(row));
            problemsData = data;
            isLoaded = true;
            console.log(`[Dataset] ✅ Loaded ${problemsData.length} problems from JSON.`);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

// ── Load from CSV (fallback) ─────────────────────────────────────────────────
function loadFromCSV() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(CSV_PATH)) {
            console.error(`ERROR: Dataset not found at ${CSV_PATH}`);
            isLoaded = true; // Prevent infinite hangs; data will be empty
            return resolve();
        }

        console.log('[Dataset] JSON cache not found — parsing CSV (first run). Run `node convert-to-json.js` to speed up future starts.');
        const results = [];

        fs.createReadStream(CSV_PATH)
            .pipe(csv())
            .on('data', (data) => {
                results.push(data);
                extractMetadata(data);
            })
            .on('end', () => {
                problemsData = results;
                isLoaded = true;
                console.log(`[Dataset] ✅ Loaded ${problemsData.length} problems from CSV.`);
                resolve();
            })
            .on('error', (err) => {
                console.error('[Dataset] Error loading CSV:', err);
                reject(err);
            });
    });
}

// ── Public loader ────────────────────────────────────────────────────────────
function loadDataset() {
    if (fs.existsSync(JSON_PATH)) {
        return loadFromJSON();
    }
    return loadFromCSV();
}

function getProblems(page = 1, limit = 20, search = '', filterTopics = [], filterCompanies = []) {
    let filtered = problemsData;

    // Topic Filtering (passes if item has at least one of the selected topics)
    if (filterTopics.length > 0) {
        filtered = filtered.filter(p => {
            if (!p.related_topics) return false;
            const pTopics = p.related_topics.split(',').map(t => t.trim());
            return filterTopics.some(t => pTopics.includes(t));
        });
    }

    // Company Filtering (case-insensitive, AND logic with topics)
    if (filterCompanies.length > 0) {
        const lowerFilterCompanies = filterCompanies.map(c => c.toLowerCase());
        filtered = filtered.filter(p => {
            if (!p.companies) return false;
            const pComps = p.companies.split(',').map(c => c.trim().toLowerCase());
            return lowerFilterCompanies.some(c => pComps.includes(c));
        });
    }

    // Free Text Search
    if (search) {
        const lowerSearch = search.toLowerCase();
        filtered = filtered.filter(p =>
            (p.title && p.title.toLowerCase().includes(lowerSearch)) ||
            (p.related_topics && p.related_topics.toLowerCase().includes(lowerSearch)) ||
            (p.companies && p.companies.toLowerCase().includes(lowerSearch))
        );
    }

    const lim = parseInt(limit);
    const pg = parseInt(page);
    const startIndex = (pg - 1) * lim;
    const paginatedItems = filtered.slice(startIndex, startIndex + lim);

    return {
        total: filtered.length,
        page: pg,
        limit: lim,
        totalPages: Math.max(1, Math.ceil(filtered.length / lim)),
        data: paginatedItems
    };
}

function getProblemById(id) {
    return problemsData.find(p => String(p.id) === String(id));
}

function getTotalCounts() {
    const counts = { Easy: 0, Medium: 0, Hard: 0, Total: problemsData.length };
    problemsData.forEach(p => {
        if (p.difficulty === 'Easy') counts.Easy++;
        else if (p.difficulty === 'Medium') counts.Medium++;
        else if (p.difficulty === 'Hard') counts.Hard++;
    });
    return counts;
}

const getMetadata = () => ({
    topics: Array.from(metadata.topics).sort(),
    companies: Array.from(metadata.companies).sort()
});

const isDataLoaded = () => isLoaded;

export {
    loadDataset,
    getProblems,
    getProblemById,
    getMetadata,
    getTotalCounts,
    isDataLoaded
};
