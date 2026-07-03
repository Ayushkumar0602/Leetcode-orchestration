# Dataset — Technical Documentation

## Overview
The `dataset.js` module serves as the central data access layer for the LeetCode problem library within the backend. It provides an abstraction for loading, querying, and filtering problem sets, shielding the rest of the application from the underlying storage format (JSON or CSV). By prioritizing a memory-resident approach, it enables high-performance read operations suitable for search and filtering workloads.

## Architecture
This module acts as a **Data Access Object (DAO)**. 
*   **Data Flow:** It reads raw data from the filesystem during the bootstrap phase, processes it into memory, and exports synchronous accessor functions.
*   **Dependencies:** Uses Node.js native `fs` and `path` modules; relies on `csv-parser` for initial data ingestion.
*   **Consumers:** Used primarily by API route handlers that require problem lookups, search results, or metadata (topics/companies) for frontend dropdowns and aggregations.

## Design Principles
*   **Graceful Degradation:** The module prioritizes pre-processed JSON for performance but gracefully falls back to CSV parsing if the cache is missing.
*   **Lazy Indexing:** Metadata (topics and companies) is extracted during the initial load, minimizing the cost of metadata retrieval requests.
*   **Single Responsibility:** This module is strictly concerned with data hydration and querying; it does not handle HTTP request/response logic or business logic beyond data transformation.
*   **Predictable State:** The use of the `isLoaded` flag prevents race conditions where API callers might request data before the file system stream finishes.

## API Reference

### `loadDataset()`
*   **Description:** Asynchronous function to initialize the in-memory store.
*   **Returns:** `Promise<void>`

### `getProblems(page, limit, search, filterTopics, filterCompanies)`
*   **Parameters:** 
    *   `page` (Number): Current page index (1-based).
    *   `limit` (Number): Results per page.
    *   `search` (String): Search string for titles or IDs.
    *   `filterTopics` (Array<String>): List of topics to intersect.
    *   `filterCompanies` (Array<String>): List of companies to intersect.
*   **Returns:** `{ total: number, page: number, limit: number, totalPages: number, data: Array<Object> }`

### `getProblemById(id)`
*   **Description:** Retrieves a single record by ID.
*   **Returns:** `Object | undefined`

### `getMetadata()`
*   **Returns:** `{ topics: Array<String>, companies: Array<String> }` (Sorted lists).

### `getTotalCounts()`
*   **Returns:** `{ Easy: number, Medium: number, Hard: number, Total: number }`

---

## Internal Logic
1.  **Hydration:** On `loadDataset()`, the system checks for `leetcode.json`. 
    *   If present, it performs a blocking read for speed. 
    *   If absent, it streams `leetcode_dataset - lc.csv`, normalizing fields and building the global `problemsData` array.
2.  **Indexing:** During loading, `extractMetadata` iterates through each row once, updating `Set` objects for topics and companies to ensure unique values for frontend filters.
3.  **Filtering:** Filtering follows an "AND" logic for company filters and "OR" logic for individual topic inclusion. Search is global, checking `ID`, `Title`, `Topics`, and `Companies` fields.

## Data Flow
1.  **Input:** Raw `CSV` or `JSON` file from `data/`.
2.  **Processing:** In-memory `Array` of `problemsData`.
3.  **Transformation:** Queries filter the array, then perform a slice based on pagination parameters.
4.  **Output:** JSON-serializable objects sent to the client via HTTP.

## Error Handling & Edge Cases
*   **Missing Files:** If the CSV file is missing, the module logs a critical error and marks `isLoaded = true` with empty data to prevent the application from hanging indefinitely.
*   **Data Malformation:** The search and filter functions contain safe-navigation checks (e.g., `if (!p.related_topics) return false;`), preventing runtime crashes when dealing with sparse records in the source file.
*   **Pagination Boundaries:** `totalPages` is enforced with `Math.max(1, ...)` to ensure that even with zero results, the API returns a valid structure.

## Usage Example

### Bootstrapping the Server
```javascript
const dataset = require('./backend/dataset');

async function startServer() {
    await dataset.loadDataset();
    console.log("System ready for traffic.");
}
```

### Retrieving Paginated Problems
```javascript
const { getProblems } = require('./backend/dataset');

// Fetch Page 1, limit 10, filtered by 'Array' topic
const result = getProblems(1, 10, '', ['Array'], []);
console.log(`Page ${result.page} of ${result.totalPages} - Items: ${result.data.length}`);
```