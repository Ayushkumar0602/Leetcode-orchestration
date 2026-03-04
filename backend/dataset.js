const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

let problemsData = [];
let metadata = {
    topics: new Set(),
    companies: new Set()
};
let isLoaded = false;

// We look for the CSV up one level in the project root
const CSV_PATH = path.join(__dirname, '..', 'leetcode_dataset - lc.csv');

function loadDataset() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(CSV_PATH)) {
            console.error(`ERROR: Dataset not found at ${CSV_PATH}`);
            isLoaded = true; // Mark loaded to prevent infinite hangs, but empty
            return resolve();
        }

        const results = [];
        fs.createReadStream(CSV_PATH)
            .pipe(csv())
            .on('data', (data) => {
                results.push(data);

                // Extract unique topics
                if (data.related_topics) {
                    data.related_topics.split(',').forEach(t => {
                        const topic = t.trim();
                        if (topic) metadata.topics.add(topic);
                    });
                }

                // Extract unique companies
                if (data.companies) {
                    data.companies.split(',').forEach(c => {
                        const comp = c.trim();
                        if (comp) metadata.companies.add(comp);
                    });
                }
            })
            .on('end', () => {
                problemsData = results;
                isLoaded = true;
                console.log(`[Dataset] Successfully loaded ${problemsData.length} problems into memory.`);
                resolve();
            })
            .on('error', (err) => {
                console.error('[Dataset] Error loading CSV:', err);
                reject(err);
            });
    });
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

    // Company Filtering (applied on already-topic-filtered results for AND logic)
    if (filterCompanies.length > 0) {
        filtered = filtered.filter(p => {
            if (!p.companies) return false;
            const pComps = p.companies.split(',').map(c => c.trim());
            return filterCompanies.some(c => pComps.includes(c));
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

module.exports = {
    loadDataset,
    getProblems,
    getProblemById,
    getMetadata: () => ({
        topics: Array.from(metadata.topics).sort(),
        companies: Array.from(metadata.companies).sort()
    }),
    getTotalCounts,
    isDataLoaded: () => isLoaded
};
