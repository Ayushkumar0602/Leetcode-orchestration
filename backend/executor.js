const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// Map language to docker image and execution command
const languageConfig = {
    python: {
        image: 'python:3.11-alpine',
        extension: '.py',
        getCommand: (filename) => `python ${filename}`
    },
    javascript: {
        image: 'node:20-alpine',
        extension: '.js',
        getCommand: (filename) => `node ${filename}`
    },
    cpp: {
        image: 'gcc:13',
        extension: '.cpp',
        getCommand: (filename) => `g++ -O2 ${filename} -o /tmp/a.out && /tmp/a.out`
    },
    c: {
        image: 'gcc:13',
        extension: '.c',
        getCommand: (filename) => `gcc -O2 ${filename} -o /tmp/a.out && /tmp/a.out`
    },
    java: {
        image: 'eclipse-temurin:21-alpine',
        extension: '.java',
        getCommand: (filename) => `javac -d /tmp ${filename} && cd /tmp && java Main`
    },
    go: {
        image: 'golang:alpine',
        extension: '.go',
        getCommand: (filename) => `CGO_ENABLED=0 GO111MODULE=off GOCACHE=/tmp GOMODCACHE=/tmp go build -o /tmp/a.out ${filename} && /tmp/a.out`
    },
    rust: {
        image: 'rust:alpine',
        extension: '.rs',
        getCommand: (filename) => `TMPDIR=/tmp rustc ${filename} -o /tmp/a.out && /tmp/a.out`
    }
};

/**
 * Executes a piece of code in a secure Docker container
 */
async function executeCode(code, language, input, expectedOutput) {
    if (!languageConfig[language]) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const sessionId = uuidv4();
    const tempDir = path.join('/tmp', `code-exec-${sessionId}`);
    const config = languageConfig[language];
    const sourceFilename = (language === 'java') ? 'Main.java' : `main${config.extension}`;
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

        // 4. Construct execution script that redirects input
        let runCommand = config.getCommand(sourceFilename);
        const scriptContent = hasInput
            ? `#!/bin/sh\n${runCommand} < input.txt`
            : `#!/bin/sh\n${runCommand}`;

        const scriptPath = path.join(tempDir, 'run.sh');
        await fs.writeFile(scriptPath, scriptContent);
        await fs.chmod(scriptPath, '755');

        // 5. Construct secure Docker command
        // Flags:
        // --rm: remove container after exit
        // --read-only: mount container root fs as read only
        // --network=none: disable networking
        // --memory=100m: limit memory usage
        // --cpus=0.5: limit CPU usage
        // --pids-limit=64: limit number of processes (mitigate fork bombs)
        // --security-opt=no-new-privileges: prevent privilege escalation
        // -v: mount our temp dir as a volume read-only, except making it writable if really needed, but since we use read-only root, standard tmp is used.
        // Actually we only need read access to the source code, but language runtimes might need /tmp.
        // We mount tempDir to /code (read-only base)

        // We mount tempDir as read-only. We add an anonymous tmpfs for /tmp where runtimes write cache
        const dockerCmd = `
      docker run --rm \\
        --name code-exec-${sessionId} \\
        --read-only \\
        --network=none \\
        --memory=400m \\
        --cpus=1.0 \\
        --pids-limit=64 \\
        --security-opt=no-new-privileges \\
        --mount type=bind,source=${tempDir},target=/code,readonly \\
        --tmpfs /tmp:exec,mode=1777,size=200m \\
        -w /code \\
        ${config.image} \\
        ./run.sh
    `;

        // 6. Execute docker command with a rigid timeout on the host side
        let stdout, stderr;
        let executionError = null;

        try {
            const result = await execPromise(dockerCmd, { timeout: 15000, killSignal: 'SIGKILL' });
            stdout = result.stdout;
            stderr = result.stderr;
        } catch (err) {
            executionError = err;
            stdout = err.stdout;
            stderr = err.stderr;

            if (err.killed) {
                stderr = (stderr ? stderr + '\\n' : '') + 'Error: Execution Timed Out (Exceeded 15s)';
            }
        }

        // 7. Process output and compare
        const actualOutput = (stdout || '').trim();
        const expected = (expectedOutput || '').trim();

        let isSuccess = false;
        if (!executionError && expectedOutput !== undefined) {
            isSuccess = (actualOutput === expected);
        } else if (!executionError && !expectedOutput) {
            isSuccess = true; // No expectation, just ran
        }

        return {
            success: isSuccess,
            output: actualOutput,
            error: (stderr || '').trim() || (executionError ? executionError.message : null)
        };

    } finally {
        // 8. Cleanup temp directory and force kill the container if it's still running
        try {
            await execPromise(`docker kill code-exec-${sessionId}`).catch(() => { /* Ignore errors if already dead */ });
        } catch (e) { }

        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupErr) {
            console.error(`Failed to cleanup temp dir ${tempDir}:`, cleanupErr);
        }
    }
}

module.exports = { executeCode };
