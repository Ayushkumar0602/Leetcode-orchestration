# Executor — Technical Documentation

## Overview
The `executor.js` module serves as the primary runtime engine for executing arbitrary source code submitted by users. It provides a standardized interface to compile and run code across multiple languages (Python, JavaScript, C++, C, Java, Go, and Rust) within a sandboxed environment on the host filesystem. Designed specifically for environments like Render, it favors native execution over containerized approaches for lower overhead.

## Architecture
This module acts as a service layer component.
*   **Role:** It transforms raw strings of source code into executable processes and returns structured output (stdout, stderr, and success status).
*   **Dependencies:** Uses Node.js native `child_process` for execution and `fs` for filesystem interaction.
*   **Dependents:** Likely consumed by a controller or API route handler that receives raw code submissions via HTTP requests.

## Design Principles
*   **Strategy Pattern:** The `languageConfig` map abstracts the unique compilation and execution requirements of different languages (e.g., C++ needs a compile step with `g++`, while Python is interpreted).
*   **Resource Stewardship:** Uses `finally` blocks to ensure that temporary files and directory structures are purged after execution, preventing disk exhaustion.
*   **Fail-Fast/Defensive:** The module enforces a hard 15-second timeout and utilizes `SIGKILL` to prevent "zombie" processes or infinite loops from consuming system resources.
*   **Single Responsibility:** The module is strictly concerned with execution; it does not handle authentication, input validation, or database persistence.

## API Reference

### `executeCode(code, language, input, expectedOutput)`
Executes the provided code string in an isolated temporary directory.

*   **`code`** `(string)`: The raw source code to execute.
*   **`language`** `(string)`: The key identifying the language (must match `languageConfig` keys).
*   **`input`** `(string|null)`: Standard input (stdin) content provided to the process.
*   **`expectedOutput`** `(string|null)`: If provided, the module compares this against the code's stdout.
*   **Returns:** `Promise<Object>`:
    *   `success` (boolean): Whether execution finished without error and (if provided) matched expected output.
    *   `output` (string): The standard output of the process.
    *   `error` (string|null): Error logs from stderr or execution failure.

## Internal Logic
1.  **Environment Setup:** Generates a unique UUID and creates a path in `/tmp`.
2.  **Artifact Creation:** Writes source code to a file (Java is specially handled as `Main.java` to comply with naming requirements).
3.  **Command Construction:** Retrieves the specific shell command template via `languageConfig`.
4.  **Process Execution:** Uses `util.promisify(exec)` to run the command with a 15-second constraint.
5.  **Telemetry/Control:** Interfaces with optional global variables (`global.activeExecutions`, `global.codeExecStats`) to track system health and allow for administrative cancellation.
6.  **Cleanup:** The `finally` block ensures the temporary directory is deleted, regardless of whether the execution succeeded or threw an error.

## Data Flow
1.  **Input:** Raw code and metadata arrive from the API layer.
2.  **Transformation:** Code is written to a temporary filesystem.
3.  **Process:** An OS-level process is spawned. Data is piped from the input file into the process; stdout is captured.
4.  **Validation:** `executeCode` trims and compares the resulting stdout against `expectedOutput`.
5.  **Output:** A structured JSON object is returned to the caller, and temporary filesystem artifacts are destroyed.

## Error Handling & Edge Cases
*   **Timeouts:** If code takes >15 seconds, the process is terminated via `SIGKILL`, and a specific "Execution Timed Out" message is appended to the error output.
*   **Compilation Failures:** C/C++/Go/Java compile errors are caught, returning the compiler's diagnostic output via the `error` field in the response.
*   **Cleanup Failures:** If `fs.rm` fails, the error is logged to `console.error` but does not crash the main execution flow.
*   **Unsupported Languages:** Explicit check at the start of the function throws a hard error if the requested language mapping does not exist.

## Usage Example

```javascript
const { executeCode } = require('./backend/executor');

// Executing Python code with expected output
const result = await executeCode(
  'print(1 + 1)', 
  'python', 
  null, 
  '2'
);

if (result.success) {
  console.log('Test Passed:', result.output);
} else {
  console.error('Test Failed:', result.error);
}
```

```javascript
// Executing C++ code with input
const result = await executeCode(
  '#include <iostream>\nint main() { int i; std::cin >> i; std::cout << i; return 0; }',
  'cpp',
  '42',
  '42'
);
```