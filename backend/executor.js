const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// Map language to native execution command (no Docker — runs natively on Render)
const languageConfig = {
    python: {
        extension: '.py',
        getCommand: (filepath, inputPath) =>
            inputPath ? `python3 ${filepath} < ${inputPath}` : `python3 ${filepath}`
    },
    javascript: {
        extension: '.js',
        getCommand: (filepath, inputPath) =>
            inputPath ? `node ${filepath} < ${inputPath}` : `node ${filepath}`
    },
    cpp: {
        extension: '.cpp',
        getCommand: (filepath, inputPath) => {
            const outPath = filepath.replace('.cpp', '.out');
            const run = inputPath ? `${outPath} < ${inputPath}` : outPath;
            return `g++ -O2 ${filepath} -o ${outPath} && ${run}`;
        }
    },
    c: {
        extension: '.c',
        getCommand: (filepath, inputPath) => {
            const outPath = filepath.replace('.c', '.out');
            const run = inputPath ? `${outPath} < ${inputPath}` : outPath;
            return `gcc -O2 ${filepath} -o ${outPath} && ${run}`;
        }
    },
    java: {
        extension: '.java',
        getCommand: (filepath, inputPath) => {
            const dir = path.dirname(filepath);
            const run = inputPath
                ? `javac -d ${dir} ${filepath} && java -cp ${dir} Main < ${inputPath}`
                : `javac -d ${dir} ${filepath} && java -cp ${dir} Main`;
            return run;
        }
    },
    go: {
        extension: '.go',
        getCommand: (filepath, inputPath) => {
            const outPath = filepath.replace('.go', '.out');
            const run = inputPath ? `${outPath} < ${inputPath}` : outPath;
            return `go build -o ${outPath} ${filepath} && ${run}`;
        }
    },
    rust: {
        extension: '.rs',
        getCommand: (filepath, inputPath) => {
            const outPath = filepath.replace('.rs', '.out');
            const run = inputPath ? `${outPath} < ${inputPath}` : outPath;
            return `rustc ${filepath} -o ${outPath} && ${run}`;
        }
    }
};

/**
 * Executes a piece of code natively (without Docker) — suitable for Render deployment.
 */
async function executeCode(code, language, input, expectedOutput) {
    if (!languageConfig[language]) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const sessionId = uuidv4();
    const tempDir = path.join('/tmp', `code-exec-${sessionId}`);
    const config = languageConfig[language];
    const sourceFilename = language === 'java' ? 'Main.java' : `main${config.extension}`;
    const sourceFilePath = path.join(tempDir, sourceFilename);
    const inputFilePath = path.join(tempDir, 'input.txt');

    try {
        // 1. Create temp directory
        await fs.mkdir(tempDir, { recursive: true });

        // 2. Write source code file
        await fs.writeFile(sourceFilePath, code);

        // 3. Write input file if provided
        let hasInput = false;
        if (input) {
            await fs.writeFile(inputFilePath, input);
            hasInput = true;
        }

        // 4. Build the native execution command
        const cmd = config.getCommand(sourceFilePath, hasInput ? inputFilePath : null);

        // 5. Execute with a 15-second timeout
        let stdout, stderr;
        let executionError = null;

        const ac = typeof AbortController !== 'undefined' ? new AbortController() : null;
        if (ac && global.activeExecutions) {
            global.activeExecutions.set(sessionId, () => ac.abort('Admin killed execution'));
        }

        if (global.codeExecStats) {
            global.codeExecStats.totalJobs++;
            global.codeExecStats.recentJobs.push(Date.now());
        }

        try {
            const result = await execPromise(cmd, { 
                timeout: 15000, 
                killSignal: 'SIGKILL',
                ...(ac ? { signal: ac.signal } : {})
            });
            stdout = result.stdout;
            stderr = result.stderr;
        } catch (err) {
            executionError = err;
            stdout = err.stdout;
            stderr = err.stderr;

            if (err.killed) {
                stderr = (stderr ? stderr + '\n' : '') + 'Error: Execution Timed Out (Exceeded 15s)';
            }
        }

        // 6. Process output and compare
        const actualOutput = (stdout || '').trim();
        const expected = (expectedOutput || '').trim();

        let isSuccess = false;
        if (!executionError && expectedOutput !== undefined) {
            isSuccess = actualOutput === expected;
        } else if (!executionError && !expectedOutput) {
            isSuccess = true; // No expectation — just ran successfully
        }

        return {
            success: isSuccess,
            output: actualOutput,
            error: (stderr || '').trim() || (executionError ? executionError.message : null)
        };

    } finally {
        if (global.activeExecutions) {
            global.activeExecutions.delete(sessionId);
        }
        if (executionError && global.codeExecStats) {
            global.codeExecStats.failedJobs++;
        }
        // 7. Cleanup temp directory
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupErr) {
            console.error(`Failed to cleanup temp dir ${tempDir}:`, cleanupErr);
        }
    }
}

module.exports = { executeCode };
