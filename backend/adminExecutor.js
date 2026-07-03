const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// A simple concurrency limiter to avoid melting the server
async function limitConcurrency(tasks, limit) {
    const results = [];
    const executing = [];
    for (const task of tasks) {
        const p = Promise.resolve().then(() => task());
        results.push(p);

        if (limit <= tasks.length) {
            const e = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }
    }
    return Promise.all(results);
}

/**
 * Isolated, high-performance executor ONLY for admin validation.
 * Uses "Compile Once, Run Many" strategy.
 * 
 * @param {string} code - The Merged C++ solution + wrapper code
 * @param {Array} testCases - Array of { label, input, expectedOutput }
 */
async function verifyCppSolution(code, testCases) {
    const sessionId = uuidv4();
    const tempDir = path.join('/tmp', `admin-verify-${sessionId}`);
    const sourceFilePath = path.join(tempDir, 'main.cpp');
    const outFilePath = path.join(tempDir, 'main.out');

    try {
        await fs.mkdir(tempDir, { recursive: true });
        await fs.writeFile(sourceFilePath, code);

        // 1. COMPILE ONCE
        let compileStdout, compileStderr;
        try {
            const compileResult = await execPromise(`g++ -O2 ${sourceFilePath} -o ${outFilePath}`, { timeout: 15000 });
            compileStdout = compileResult.stdout;
            compileStderr = compileResult.stderr;
        } catch (err) {
            // Compilation failed
            return {
                success: false,
                compileError: (err.stderr || err.message || '').trim(),
                results: []
            };
        }

        // 2. PARALLEL EXECUTION (15 max concurrency)
        const tasks = testCases.map((tc, index) => async () => {
            const inputFilePath = path.join(tempDir, `input_${index}.txt`);
            let hasInput = false;
            
            if (tc.input !== undefined && tc.input !== null) {
                await fs.writeFile(inputFilePath, tc.input);
                hasInput = true;
            }

            const cmd = hasInput ? `${outFilePath} < ${inputFilePath}` : outFilePath;
            const startTime = Date.now();
            let actualOutput = '';
            let executionError = null;

            try {
                const res = await execPromise(cmd, { 
                    timeout: 15000, // Strict 15s timeout
                    killSignal: 'SIGKILL'
                });
                actualOutput = (res.stdout || '').trim();
            } catch (err) {
                executionError = err;
                actualOutput = err.stdout || '';
                if (err.killed) {
                    executionError = 'Execution Timed Out (Exceeded 15s)';
                } else {
                    executionError = err.stderr || err.message;
                }
            }

            const expected = (tc.expectedOutput || '').trim();
            let isSuccess = false;
            
            if (!executionError && tc.expectedOutput !== undefined) {
                isSuccess = actualOutput === expected;
            } else if (!executionError && tc.expectedOutput === undefined) {
                isSuccess = true;
            }

            return {
                label: tc.label || `Test Case ${index + 1}`,
                input: tc.input,
                expectedOutput: expected,
                actualOutput: actualOutput.trim(),
                passed: isSuccess,
                error: (executionError || '').toString().trim(),
                durationMs: Date.now() - startTime
            };
        });

        const results = await limitConcurrency(tasks, 15);
        
        const passedCount = results.filter(r => r.passed).length;
        return {
            success: passedCount === results.length,
            compileError: null,
            total: results.length,
            passed: passedCount,
            results
        };

    } finally {
        // 3. CLEANUP
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (err) {
            console.error(`Admin Executor Cleanup Error: ${err.message}`);
        }
    }
}

module.exports = { verifyCppSolution };
