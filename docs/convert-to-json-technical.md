# Convert to JSON — Technical Documentation

## Overview
`convert-to-json.js` is a utility script designed to optimize the startup performance of the backend service. It performs a one-time transformation of a large LeetCode problem dataset from CSV format to a structured JSON file. By pre-serializing the data, the application avoids the high latency overhead of parsing ~50k CSV rows during runtime initialization.

## Architecture
This script acts as a **build-time preparation tool** rather than a runtime service component. 
*   **Role:** It bridges the gap between raw data acquisition (CSV) and the persistence layer expected by the application.
*   **Dependencies:** Relies on the `csv-parser` package for streaming input processing.
*   **System Impact:** The resulting `leetcode.json` file serves as a static data source, reducing runtime memory pressure and significantly decreasing cold-start times.

## Design Principles
*   **Performance Optimization:** By moving data transformation from runtime to build-time, we shift the computational cost away from the end-user experience.
*   **Single Responsibility:** The script focuses exclusively on I/O transformation, keeping the primary application logic clean and devoid of ETL (Extract, Transform, Load) code.
*   **Streaming I/O:** Uses Node.js Streams to handle the 50k-row dataset efficiently, preventing heap overflows that might occur if loading the entire file into memory at once without a streaming parser.

## API Reference
This script is intended for CLI execution and exposes no exports.

### Constants
*   `CSV_PATH`: The resolved path to the source dataset `leetcode_dataset - lc.csv`.
*   `OUT_DIR`: The destination directory for the generated JSON.
*   `OUT_PATH`: The destination file path `backend/data/leetcode.json`.

## Internal Logic
1.  **Environment Validation:** Checks if the source CSV exists; if missing, terminates with a non-zero exit code.
2.  **Environment Preparation:** Ensures the `data/` directory exists using `fs.mkdirSync` with `recursive: true`.
3.  **Stream Orchestration:**
    *   Opens a readable stream on the CSV file.
    *   Pipes the stream into `csv-parser` to transform CSV rows into JavaScript objects.
    *   Collects chunks into the `results` array via the `'data'` event.
4.  **Serialization:** Upon the `'end'` event, the accumulated array is stringified (with 2-space indentation for readability) and written to the filesystem.
5.  **Audit:** Logs the total record count and the final file size in MB to verify output integrity.

## Data Flow
1.  **Input:** `leetcode_dataset - lc.csv` (File System).
2.  **Processing:** Stream $\rightarrow$ `csv-parser` (Buffer) $\rightarrow$ `results` (Array).
3.  **Output:** `JSON.stringify` $\rightarrow$ `leetcode.json` (File System).

## Error Handling & Edge Cases
*   **Missing File:** Uses `fs.existsSync` to fail fast before attempting to open streams.
*   **Stream Errors:** The `'error'` listener on the read stream catches I/O interruptions, logs the stack trace, and exits the process, preventing partial or corrupted file writes.
*   **Directory Management:** Uses the `{ recursive: true }` flag to gracefully handle scenarios where the `data/` directory has not been created in the environment.

## Usage Example

### Execution
Run the conversion script from the root of the backend directory:
```bash
node convert-to-json.js
```

### Consumption
In the main application, replace the legacy CSV parser with a direct require:
```javascript
// Instead of: const data = await parseCSV('leetcode.csv');
// Use:
const leetcodeData = require('./data/leetcode.json');

console.log(`Loaded ${leetcodeData.length} problems instantly.`);
```