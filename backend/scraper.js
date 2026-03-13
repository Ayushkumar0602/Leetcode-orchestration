/**
 * LeetCode profile scraper - runs in isolated Docker container.
 * Container is short-lived and terminated immediately after scraping.
 * Falls back to direct Node execution if Docker is unavailable (e.g. dev).
 */

import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import util from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execPromise = util.promisify(exec);

const SCRIPT_PATH = path.join(__dirname, 'scraper-script.js');
const TIMEOUT_MS = 90000; // 90 seconds for scraping + network

/**
 * Run the scraper script directly with Node (no Docker).
 * Used when Docker is unavailable.
 */
async function runScraperDirect(username, options = {}) {
    const { authMode, leetcodeSession, csrfToken } = options;
    const env = {
        ...process.env,
        AUTH_MODE: authMode === 'full' ? 'full' : 'public',
    };
    if (authMode === 'full' && leetcodeSession && csrfToken) {
        env.LEETCODE_SESSION = leetcodeSession;
        env.LEETCODE_CSRFTOKEN = csrfToken;
    }

    const cmd = `node "${SCRIPT_PATH}" "${username.replace(/"/g, '\\"')}"`;
    const { stdout } = await execPromise(cmd, {
        timeout: TIMEOUT_MS,
        maxBuffer: 2 * 1024 * 1024,
        env,
    });
    return JSON.parse(stdout.trim());
}

/**
 * Run the scraper script inside a temporary Docker container.
 * Container has network access (to reach leetcode.com) and is removed after exit.
 * @param {string} username - LeetCode username
 * @param {object} options - { authMode?: 'full'|'public', leetcodeSession?: string, csrfToken?: string }
 * @returns {Promise<object>} Scraped data: { totalSolved, breakdown, solvedIds, totalSynced, filteredOut }
 */
async function runScraperInDocker(username, options = {}) {
    const { authMode, leetcodeSession, csrfToken } = options;
    const tempDir = path.join(__dirname, 'scraper-temp');
    await fs.mkdir(tempDir, { recursive: true });

    try {
        const scriptInTemp = path.join(tempDir, 'scraper-script.js');
        await fs.copyFile(SCRIPT_PATH, scriptInTemp);

        const envArgs = [];
        if (authMode === 'full') {
            envArgs.push('-e', 'AUTH_MODE=full');
        }
        if (authMode === 'full' && leetcodeSession && csrfToken) {
            envArgs.push(
                '-e',
                `LEETCODE_SESSION=${leetcodeSession.replace(/"/g, '\\"')}`,
                '-e',
                `LEETCODE_CSRFTOKEN=${csrfToken.replace(/"/g, '\\"')}`
            );
        }

        const dockerCmd = [
            'docker run --rm',
            `--name leetcode-scraper-${Date.now()}`,
            '--network=default',
            '--memory=256m',
            '--cpus=0.5',
            `-v "${tempDir}:/app:ro"`,
            '-w /app',
            envArgs.join(' '),
            'node:20-alpine',
            `node scraper-script.js "${username.replace(/"/g, '\\"')}"`
        ].join(' \\\n          ');

        const { stdout, stderr } = await execPromise(dockerCmd, {
            timeout: TIMEOUT_MS,
            killSignal: 'SIGKILL',
            maxBuffer: 2 * 1024 * 1024,
        });

        if (stderr && !stdout) {
            throw new Error(stderr.trim() || 'Scraper produced no output');
        }

        return JSON.parse(stdout.trim());
    } catch (err) {
        const msg = (err.message || '').toLowerCase();
        if (msg.includes('docker') || msg.includes('command not found') || msg.includes('econnrefused')) {
            console.warn('[Scraper] Docker unavailable, falling back to direct execution');
            return runScraperDirect(username, options);
        }
        throw err;
    } finally {
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (e) {
            // ignore
        }
    }
}

export { runScraperInDocker };
