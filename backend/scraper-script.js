#!/usr/bin/env node
/**
 * LeetCode profile scraper - runs inside Docker container.
 * Fetches solved problems via GraphQL API and outputs JSON to stdout.
 * Usage: node scraper-script.js <username>
 */

const USERNAME = process.argv[2];
const MAX_PROBLEM_ID = 1825;
const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function graphql(query, variables = {}, operationName = null) {
    const body = { query, variables };
    if (operationName) body.operationName = operationName;
    const res = await fetch(LEETCODE_GRAPHQL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://leetcode.com/',
            'Origin': 'https://leetcode.com',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`LeetCode returned HTTP ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        throw new Error('LeetCode returned a non-JSON response (possible rate limit or captcha). Try again later.');
    }
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error');
    return json.data;
}

async function main() {
    if (!USERNAME) {
        process.stderr.write('Usage: node scraper-script.js <username>\n');
        process.exit(1);
    }

    try {
        const AUTH_MODE = process.env.AUTH_MODE || 'public';

        // 1. Fetch user session progress (total + difficulty counts)
        const sessionQuery = `
            query userSessionProgress($username: String!) {
                allQuestionsCount { difficulty count }
                matchedUser(username: $username) {
                    submitStats {
                        acSubmissionNum { difficulty count submissions }
                    }
                }
            }
        `;
        const sessionData = await graphql(sessionQuery, { username: USERNAME }, 'userSessionProgress');
        await sleep(300);
        const matchedUser = sessionData?.matchedUser;
        if (!matchedUser) {
            throw new Error('User not found');
        }

        const acSubs = matchedUser.submitStats?.acSubmissionNum || [];
        const totalSolved = acSubs.reduce((s, d) => s + (d.count || 0), 0);
        const difficultyCounts = {};
        acSubs.forEach((d) => {
            const diff = d.difficulty || 'Unknown';
            difficultyCounts[diff] = d.count || 0;
        });

        // 2. Fetch problemset to build titleSlug -> frontendQuestionId map
        const problemsetQuery = `
            query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
                problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
                    questions: data {
                        frontendQuestionId: questionFrontendId
                        titleSlug
                        difficulty
                    }
                }
            }
        `;
        const slugToId = {};
        const slugToDifficulty = {};
        const solvedIds = new Set();
        const solvedWithDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
        let filteredOut = 0;
        let skip = 0;
        const limit = 100;
        let hasMore = true;
        while (hasMore) {
            const filters = AUTH_MODE === 'full' ? { status: 'AC' } : {};
            const psData = await graphql(
                problemsetQuery,
                { categorySlug: '', limit, skip, filters },
                'problemsetQuestionList'
            );
            const questions = psData?.problemsetQuestionList?.questions || [];
            if (questions.length === 0) break;
            questions.forEach((q) => {
                const id = parseInt(q.frontendQuestionId, 10);
                if (!isNaN(id) && q.titleSlug) {
                    slugToId[q.titleSlug] = id;
                    slugToDifficulty[q.titleSlug] = q.difficulty || 'Unknown';
                }

                // In authenticated mode, question list with status: AC already represents solved problems.
                if (AUTH_MODE === 'full' && !isNaN(id)) {
                    if (id > MAX_PROBLEM_ID) {
                        filteredOut++;
                        return;
                    }
                    solvedIds.add(id);
                    const diff = q.difficulty || 'Unknown';
                    if (diff in solvedWithDifficulty) solvedWithDifficulty[diff]++;
                }
            });
            skip += limit;
            if (questions.length < limit) hasMore = false;
            await sleep(200);
        }

        // 3. If not in authenticated mode, fall back to recent AC submissions
        if (AUTH_MODE !== 'full') {
            const submissionsQuery = `
                query recentAcSubmissions($username: String!, $limit: Int!) {
                    recentAcSubmissionList(username: $username, limit: $limit) {
                        titleSlug
                    }
                }
            `;
            await sleep(300);
            const submissionsData = await graphql(
                submissionsQuery,
                { username: USERNAME, limit: 2500 },
                'recentAcSubmissions'
            );
            const recentSubs = submissionsData?.recentAcSubmissionList || [];

            for (const sub of recentSubs) {
                const slug = sub.titleSlug;
                const id = slugToId[slug];
                if (id === undefined) continue;
                if (id > MAX_PROBLEM_ID) {
                    filteredOut++;
                    continue;
                }
                solvedIds.add(id);
                const diff = slugToDifficulty[slug] || 'Unknown';
                if (diff in solvedWithDifficulty) solvedWithDifficulty[diff]++;
            }
        }

        const validIds = Array.from(solvedIds).sort((a, b) => a - b);

        const output = {
            totalSolved: totalSolved,
            rawBreakdown: difficultyCounts,
            breakdown: solvedWithDifficulty,
            solvedIds: validIds,
            totalSynced: validIds.length,
            filteredOut,
        };
        process.stdout.write(JSON.stringify(output));
    } catch (err) {
        process.stderr.write(err.message || String(err));
        process.exit(1);
    }
}

main();
