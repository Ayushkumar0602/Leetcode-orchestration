require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { executeCode } = require('./executor');
const { generateCodeAndTests } = require('./ai');
const { loadDataset, getProblems, getProblemById, getMetadata, getTotalCounts, isDataLoaded } = require('./dataset');
const { runScraperInDocker } = require('./scraper');
const { db } = require('./firebase');
const { doc, setDoc, increment, collection, getDocs, getDoc, addDoc, query, orderBy, deleteDoc, arrayUnion, arrayRemove, where } = require('firebase/firestore');

const app = express();
app.use(cors());
app.use(express.json());

// --- Dataset & Stats Routes ---
app.get('/api/metadata', (req, res) => {
    if (!isDataLoaded()) {
        return res.status(503).json({ error: 'Dataset is still loading or unavailable.' });
    }
    res.json(getMetadata());
});

app.get('/api/problems', async (req, res) => {
    if (!isDataLoaded()) {
        return res.status(503).json({ error: 'Dataset is still loading or unavailable.' });
    }
    const { page, limit, search, topics, companies } = req.query;

    // Parse comma-separated array strings back to arrays
    const filterTopics = topics ? topics.split(',') : [];
    const filterCompanies = companies ? companies.split(',') : [];

    const result = getProblems(page || 1, limit || 20, search || '', filterTopics, filterCompanies);

    try {
        // Fetch all global stats to merge into the paginated results
        const statsSnapshot = await getDocs(collection(db, "stats"));
        const statsMap = {};
        statsSnapshot.forEach(doc => {
            statsMap[doc.id] = doc.data();
        });

        // Merge live stats overriding static dataset stats
        result.data = result.data.map(p => {
            const liveStats = statsMap[String(p.id)];
            if (liveStats) {
                const total = liveStats.submissions || 0;
                const accepted = liveStats.accepted || 0;
                const rate = total > 0 ? ((accepted / total) * 100).toFixed(1) : "0.0";
                return { ...p, acceptance_rate: rate, live_submissions: total, live_accepted: accepted };
            }
            return p;
        });
    } catch (err) {
        console.error("Failed to fetch live stats from Firestore, falling back to static.", err);
    }

    res.json(result);
});

app.get('/api/problems/:id', async (req, res) => {
    if (!isDataLoaded()) {
        return res.status(503).json({ error: 'Dataset is still loading or unavailable.' });
    }
    let problem = getProblemById(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Duplicate problem strictly so we don't mutate memory
    problem = { ...problem };

    try {
        const statDoc = await getDocs(collection(db, "stats"));
        // alternatively just getDoc(doc(db, "stats", String(req.params.id)))
        const snap = await getDoc(doc(db, "stats", String(req.params.id)));
        if (snap.exists()) {
            const data = snap.data();
            const total = data.submissions || 0;
            const accepted = data.accepted || 0;
            problem.acceptance_rate = total > 0 ? ((accepted / total) * 100).toFixed(1) : "0.0";
            problem.live_submissions = total;
            problem.live_accepted = accepted;
        } else {
            problem.live_submissions = 0;
            problem.live_accepted = 0;
            problem.acceptance_rate = "0.0";
        }
    } catch (err) {
        console.error("Failed to fetch individual problem stat", err);
    }

    res.json(problem);
});

app.post('/api/execute', async (req, res) => {
    const { code, language, input, expectedOutput, testCases } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: 'Code and language are required.' });
    }

    try {
        if (testCases && Array.isArray(testCases)) {
            // Execute all test cases concurrently in separate Docker containers
            const results = await Promise.all(
                testCases.map((tc) => executeCode(code, language, tc.input, tc.expectedOutput))
            );
            return res.json({ results });
        } else {
            // Fallback for single execution
            const result = await executeCode(code, language, input, expectedOutput);
            return res.json(result);
        }
    } catch (error) {
        console.error('Execution Error:', error);
        res.status(500).json({ error: 'Internal server error during execution.' });
    }
});

// Submit: runs test cases SEQUENTIALLY — stops and returns immediately on first failure
// Uses Server-Sent Events (SSE) to stream progress back to the frontend
app.post('/api/submit', async (req, res) => {
    const { code, language, testCases } = req.body;
    if (!code || !language || !Array.isArray(testCases)) {
        return res.status(400).json({ error: 'code, language, and testCases array are required.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const results = [];
        let passedCount = 0;

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            const result = await executeCode(code, language, tc.input, tc.expectedOutput);

            const resultData = { ...result, label: tc.label || `Case ${i + 1}`, index: i };
            results.push(resultData);

            if (result.success) {
                passedCount++;
                // Stream progress update
                res.write(`data: ${JSON.stringify({ type: 'progress', passed: passedCount, total: testCases.length })}\n\n`);
            } else {
                // Stop immediately on first failure
                res.write(`data: ${JSON.stringify({ type: 'done', accepted: false, failedAt: i, failedLabel: tc.label || `Case ${i + 1}`, results })}\n\n`);
                return res.end();
            }
        }

        // All test cases passed
        res.write(`data: ${JSON.stringify({ type: 'done', accepted: true, results })}\n\n`);
        return res.end();

    } catch (error) {
        console.error('Submit Error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', error: 'Internal server error during submission.' })}\n\n`);
        return res.end();
    }
});

// --- Interview History Routes ---

// Save a completed interview session
app.post('/api/interviews/save', async (req, res) => {
    const { userId, role, company, language, problemId, problemTitle, problemDifficulty,
        finalCode, transcript, scoreReport, submissionCount, durationMinutes } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    try {
        const now = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'interviews'), {
            userId: String(userId), role: role || '', company: company || '',
            language: language || 'python', problemId: String(problemId || ''),
            problemTitle: problemTitle || '', problemDifficulty: problemDifficulty || '',
            finalCode: finalCode || '', transcript: transcript || [],
            scoreReport: scoreReport || null,
            submissionCount: submissionCount || 0,
            durationMinutes: durationMinutes || 0,
            overallScore: scoreReport?.overallScore ?? null,
            createdAt: now
        });
        res.json({ id: docRef.id });
    } catch (err) {
        console.error('Failed to save interview:', err);
        res.status(500).json({ error: 'Failed to save interview' });
    }
});

// Fetch a single interview by document ID
app.get('/api/interviews/detail/:id', async (req, res) => {
    try {
        const docSnap = await getDoc(doc(db, 'interviews', req.params.id));
        if (!docSnap.exists()) return res.status(404).json({ error: 'Interview not found' });
        res.json({ id: docSnap.id, ...docSnap.data() });
    } catch (err) {
        console.error('Failed to fetch interview:', err);
        res.status(500).json({ error: 'Failed to fetch interview' });
    }
});

// Fetch all interviews for a user (lightweight list)
app.get('/api/interviews/:uid', async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, 'interviews'));
        const interviews = [];
        snapshot.forEach(d => {
            const data = d.data();
            if (data.userId === String(req.params.uid)) {
                interviews.push({ id: d.id, ...data });
            }
        });
        interviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json({ interviews });
    } catch (err) {
        console.error('Failed to fetch interviews:', err);
        res.status(500).json({ error: 'Failed to fetch interviews' });
    }
});

// --- Bookmark List Routes ---


// Create a new list
app.post('/api/lists', async (req, res) => {
    const { userId, name } = req.body;
    if (!userId || !name) return res.status(400).json({ error: 'userId and name required' });
    try {
        const now = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'lists'), {
            userId: String(userId), name, problemIds: [],
            createdAt: now, updatedAt: now
        });
        res.json({ id: docRef.id, userId, name, problemIds: [], createdAt: now });
    } catch (err) {
        console.error('Failed to create list:', err);
        res.status(500).json({ error: 'Failed to create list' });
    }
});

// Fetch all lists for a user
app.get('/api/lists/:uid', async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, 'lists'));
        const lists = [];
        snapshot.forEach(d => {
            const data = d.data();
            if (data.userId === String(req.params.uid)) {
                lists.push({ id: d.id, ...data });
            }
        });
        lists.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        res.json({ lists });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch lists' }); }
});

// Add a problem to a list
app.post('/api/lists/:listId/add', async (req, res) => {
    const { problemId } = req.body;
    if (!problemId) return res.status(400).json({ error: 'problemId required' });
    try {
        const ref = doc(db, 'lists', req.params.listId);
        await setDoc(ref, { problemIds: arrayUnion(String(problemId)), updatedAt: new Date().toISOString() }, { merge: true });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Failed to add to list' }); }
});

// Remove a problem from a list
app.delete('/api/lists/:listId/problems/:problemId', async (req, res) => {
    try {
        const ref = doc(db, 'lists', req.params.listId);
        await setDoc(ref, { problemIds: arrayRemove(String(req.params.problemId)), updatedAt: new Date().toISOString() }, { merge: true });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Failed to remove from list' }); }
});

// --- Activity Calendar Route ---
app.get('/api/activity/:uid', async (req, res) => {
    try {
        const uid = req.params.uid;
        const submissionsRef = collection(db, "submissions");
        const snapshot = await getDocs(submissionsRef);

        const dailyCounts = {};
        const monthlyData = {};
        let totalSubmissions = 0;

        snapshot.forEach(d => {
            const data = d.data();
            if (data.userId !== String(uid)) return;
            totalSubmissions++;

            const date = new Date(data.submittedAt);
            if (isNaN(date.getTime())) return;

            const dayKey = date.toISOString().slice(0, 10); // "YYYY-MM-DD"
            const monthKey = date.toISOString().slice(0, 7); // "YYYY-MM"

            dailyCounts[dayKey] = (dailyCounts[dayKey] || 0) + 1;
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        });

        // Calculate streaks
        const sortedDays = Object.keys(dailyCounts).sort();
        let currentStreak = 0, longestStreak = 0, tempStreak = 0;
        const todayStr = new Date().toISOString().slice(0, 10);
        const yesterdayStr = (() => {
            const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10);
        })();

        // Longest streak calculation
        let prevDay = null;
        for (const day of sortedDays) {
            if (prevDay) {
                const prev = new Date(prevDay);
                const curr = new Date(day);
                const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
                tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
            } else {
                tempStreak = 1;
            }
            if (tempStreak > longestStreak) longestStreak = tempStreak;
            prevDay = day;
        }

        // Current streak — count backwards from today/yesterday
        const startDay = dailyCounts[todayStr] ? todayStr : (dailyCounts[yesterdayStr] ? yesterdayStr : null);
        if (startDay) {
            let checkDate = new Date(startDay);
            while (true) {
                const key = checkDate.toISOString().slice(0, 10);
                if (!dailyCounts[key]) break;
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }

        const totalActiveDays = sortedDays.length;

        res.json({ dailyCounts, monthlyData, currentStreak, longestStreak, totalActiveDays, totalSubmissions });
    } catch (err) {
        console.error("Failed to fetch activity data:", err);
        res.status(500).json({ error: "Failed to fetch activity data" });
    }
});

// --- Submission Tracking Routes ---


// Save a submission (called after Run or Submit)
app.post('/api/submissions/save', async (req, res) => {
    const { userId, problemId, difficulty, code, language, status, testResults } = req.body;
    if (!userId || !problemId) return res.status(400).json({ error: "userId and problemId required" });

    try {
        const now = new Date().toISOString();

        // 1. Save the individual submission record to top-level 'submissions' collection
        const submissionsRef = collection(db, "submissions");
        await addDoc(submissionsRef, {
            userId: String(userId),
            problemId: String(problemId),
            difficulty: difficulty || 'Unknown',
            code: code || '',
            language: language || 'python',
            status: status || 'Unknown',
            testResults: testResults || [],
            submittedAt: now
        });

        // 2. Update the per-problem status doc in top-level 'problems' collection
        const problemDocRef = doc(db, "problems", `${userId}_${problemId}`);
        const existingDoc = await getDoc(problemDocRef);
        const alreadySolved = existingDoc.exists() && existingDoc.data().status === 'Solved';

        await setDoc(problemDocRef, {
            userId: String(userId),
            problemId: String(problemId),
            status: alreadySolved ? 'Solved' : (status === 'Accepted' ? 'Solved' : 'Attempting'),
            difficulty: difficulty || 'Unknown',
            lastCode: code || '',
            submissionsCount: increment(1),
            updatedAt: now
        }, { merge: true });

        res.json({ success: true });
    } catch (err) {
        console.error("Failed to save submission:", err);
        res.status(500).json({ error: "Failed to save submission" });
    }
});

// Get all submissions for a user + problem, newest first
app.get('/api/submissions/:uid/:problemId', async (req, res) => {
    try {
        const { uid, problemId } = req.params;
        const submissionsRef = collection(db, "submissions");
        // Query top-level collection by userId
        const q = query(submissionsRef); // For small-scale we can fetch all and filter, or just use Firestore where
        const snapshot = await getDocs(q);

        const results = [];
        snapshot.forEach(d => {
            const data = d.data();
            if (data.userId === String(uid) && data.problemId === String(problemId)) {
                results.push({ id: d.id, ...data });
            }
        });

        // Sort newest-first in JS (avoids needing Firestore index)
        results.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        res.json({ submissions: results });
    } catch (err) {
        console.error("Failed to fetch submissions:", err);
        res.status(500).json({ error: "Failed to fetch submissions" });
    }
});

// Get aggregated list of all user's solved/attempted problems for dashboard
app.get('/api/user-problems/:uid', async (req, res) => {
    try {
        const uid = req.params.uid;
        const problemsRef = collection(db, "problems");
        const snapshot = await getDocs(problemsRef);

        const results = [];

        snapshot.forEach(d => {
            const data = d.data();
            if (data.userId !== String(uid)) return; // filter by user

            const pid = parseInt(data.problemId, 10);
            const meta = getProblemById(pid) || {};

            results.push({
                id: pid || data.problemId,
                docId: d.id,
                title: meta.title || data.title || `Problem ${pid || data.problemId}`,
                status: data.status, // 'Solved' or 'Attempting'
                difficulty: data.difficulty,
                submissionsCount: data.submissionsCount || 0,
                updatedAt: data.updatedAt
            });
        });

        // Sort by most recently updated
        results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        res.json({ problems: results });
    } catch (err) {
        console.error("Failed to fetch user problems:", err);
        res.status(500).json({ error: "Failed to fetch user problems" });
    }
});

// --- Execution & AI Routes ---
app.post('/api/stats/submit', async (req, res) => {
    const { problemId, isAccepted } = req.body;
    if (!problemId) return res.status(400).json({ error: "problemId required" });

    try {
        // Update global aggregated stats only
        const statsRef = doc(db, "stats", String(problemId));
        await setDoc(statsRef, {
            submissions: increment(1),
            accepted: increment(isAccepted ? 1 : 0)
        }, { merge: true });
        res.json({ success: true });
    } catch (err) {
        console.error("Failed to update stats in Firestore:", err);
        res.status(500).json({ error: "Failed to update stats" });
    }
});

app.get('/api/stats/user/:uid', async (req, res) => {
    try {
        const uid = req.params.uid;
        // Read from top-level problems collection
        const problemsRef = collection(db, "problems");
        const snapshot = await getDocs(problemsRef);

        const userStats = { Easy: 0, Medium: 0, Hard: 0, Total: 0, solvedIds: [], attemptingIds: [] };
        snapshot.forEach(d => {
            const data = d.data();
            if (data.userId !== String(uid)) return;

            if (data.status === 'Solved') {
                userStats.solvedIds.push(data.problemId);
                userStats.Total++;

                if (data.difficulty === 'Easy') userStats.Easy++;
                else if (data.difficulty === 'Medium') userStats.Medium++;
                else if (data.difficulty === 'Hard') userStats.Hard++;
            } else if (data.status === 'Attempting') {
                userStats.attemptingIds.push(data.problemId);
            }
        });

        const totalCounts = getTotalCounts();
        res.json({ userStats, totalCounts });
    } catch (err) {
        console.error("Failed to fetch user stats", err);
        res.status(500).json({ error: "Failed to fetch user stats" });
    }
});

// --- LeetCode Profile Scraper (temporary sync module) ---
const MAX_VALID_PROBLEM_ID = 1825;

app.post('/api/scraper/run', async (req, res) => {
    const { userId, username, leetcodeSession, csrfToken, mode } = req.body;
    if (!userId || !username || typeof username !== 'string') {
        return res.status(400).json({ error: 'userId and username are required.' });
    }

    try {
        const useAuth = mode === 'auth' && leetcodeSession && csrfToken;
        const scraped = await runScraperInDocker(username.trim(), useAuth ? {
            authMode: 'full',
            leetcodeSession,
            csrfToken
        } : {});
        const solvedIds = Array.isArray(scraped.solvedIds) ? scraped.solvedIds : [];
        const validIds = solvedIds.filter((id) => {
            const num = parseInt(id, 10);
            return !isNaN(num) && num >= 1 && num <= MAX_VALID_PROBLEM_ID;
        });

        const now = new Date().toISOString();
        const breakdown = { Easy: 0, Medium: 0, Hard: 0 };

        for (const problemId of validIds) {
            const meta = getProblemById(problemId);
            const difficulty = meta?.difficulty || 'Unknown';
            if (difficulty in breakdown) breakdown[difficulty]++;

            const problemDocRef = doc(db, 'problems', `${userId}_${problemId}`);
            await setDoc(problemDocRef, {
                userId: String(userId),
                problemId: String(problemId),
                status: 'Solved',
                difficulty,
                lastCode: '',
                submissionsCount: 0,
                updatedAt: now,
            }, { merge: true });
        }

        res.json({
            totalSynced: validIds.length,
            filteredOut: solvedIds.length - validIds.length,
            breakdown,
            solvedIds: validIds,
        });
    } catch (err) {
        console.error('Scraper error:', err);
        res.status(500).json({ error: err.message || 'Scraping failed.' });
    }
});

app.post('/api/generate', async (req, res) => {
    const { problemStatement, language, problemId } = req.body;

    if (!problemStatement || !language) {
        return res.status(400).json({ error: 'problemStatement and language are required.' });
    }

    try {
        const result = await generateCodeAndTests(problemStatement, language, problemId);
        res.json(result);
    } catch (error) {
        console.error('AI Generation Error:', error.message);
        res.status(500).json({ error: error.message || 'AI generation failed.' });
    }
});

// --- AI Interview Routes ---
const { getInterviewerResponse, analyzeCode: analyzeInterviewCode, evaluateInterview, callGemini } = require('./interview');

// --- System Design Interview Routes ---

// AI chat for system design interviews
app.post('/api/systemdesign/chat', async (req, res) => {
    const { topic, role, company, transcript, code, whiteboardText, phase } = req.body;
    if (!topic || !role) {
        return res.status(400).json({ error: 'topic and role are required.' });
    }
    const transcriptText = (transcript || [])
        .map(m => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.text}`)
        .join('\n');

    const systemPrompt = `You are a senior Staff Engineer conducting a rigorous System Design interview at a top tech company.

INTERVIEW CONTEXT:
- Topic: ${topic}
- Candidate's Target Role: ${role}
- Target Company: ${company || 'a top tech company'}
- Interview Phase: ${phase || 'discussion'}

CANDIDATE'S CURRENT CODE (if any):
\`\`\`
${code || 'No code written yet'}
\`\`\`

CANDIDATE'S WHITEBOARD (text description):
${whiteboardText || 'Whiteboard is empty'}

CONVERSATION SO FAR:
${transcriptText || 'Interview just started'}

INSTRUCTIONS:
- Stay strictly on-topic: only discuss "${topic}" and directly related system design concepts
- Ask focused questions about: requirements gathering, capacity estimation, high-level architecture, component design, data flow, scalability, fault tolerance, trade-offs
- Give constructive hints when the candidate is stuck — never give the full answer directly
- Comment on what you see in their code and whiteboard
- Keep responses concise (2-4 sentences max usually). Be conversational, professional, and encouraging
- If the candidate hasn't started, give a warm opening prompt and ask them to begin walking through the problem
- DO NOT mix in unrelated topics

Respond as the Interviewer now:`;

    try {
        const text = await callGemini(systemPrompt);
        res.json({ text });
    } catch (error) {
        console.error('System Design Chat Error:', error.message);
        res.status(500).json({ error: error.message || 'System design AI response failed.' });
    }
});

// Save system design interview session to Firestore (same collection as regular interviews)
app.post('/api/systemdesign/save', async (req, res) => {
    const { userId, role, company, topic, language, finalCode, whiteboardText, transcript, scoreReport, durationMinutes } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    try {
        const now = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'interviews'), {
            userId: String(userId),
            role: role || '',
            company: company || '',
            topic: topic || '',
            language: language || 'python',
            problemTitle: topic || 'System Design',
            problemDifficulty: 'Medium',
            finalCode: finalCode || '',
            whiteboardText: whiteboardText || '',
            transcript: transcript || [],
            scoreReport: scoreReport || null,
            submissionCount: 0,
            durationMinutes: durationMinutes || 0,
            overallScore: scoreReport?.overallScore ?? null,
            interviewType: 'system_design',
            createdAt: now
        });
        res.json({ id: docRef.id });
    } catch (err) {
        console.error('Failed to save system design interview:', err);
        res.status(500).json({ error: 'Failed to save interview' });
    }
});

// Evaluate a completed system design interview
app.post('/api/systemdesign/evaluate', async (req, res) => {
    const { topic, role, company, transcript, finalCode, whiteboardText } = req.body;
    if (!topic || !role) {
        return res.status(400).json({ error: 'topic and role are required.' });
    }
    const transcriptText = (transcript || [])
        .map(m => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.text}`)
        .join('\n');

    const evalPrompt = `You are evaluating a System Design interview. Score the candidate and return a JSON object.

TOPIC: ${topic}
ROLE: ${role}
COMPANY: ${company || 'a top tech company'}
TRANSCRIPT:
${transcriptText}
FINAL CODE:
${finalCode || 'None'}
WHITEBOARD NOTES:
${whiteboardText || 'None'}

Return ONLY a valid JSON object (no markdown, no extra text) exactly like this:
{
  "overallScore": <0-100 integer>,
  "verdict": "<Hire | Maybe | No Hire>",
  "skills": {
    "requirementsGathering": <0-100>,
    "architectureDesign": <0-100>,
    "scalabilityThinking": <0-100>,
    "tradeoffAnalysis": <0-100>,
    "communication": <0-100>,
    "technicalDepth": <0-100>
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"],
  "summary": "<2-3 sentence overall summary>"
}`;

    try {
        let text = await callGemini(evalPrompt);
        text = text.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
        const report = JSON.parse(text);
        res.json(report);
    } catch (error) {
        console.error('System Design Evaluation Error:', error.message);
        res.status(500).json({ error: error.message || 'Evaluation failed.' });
    }
});

// Send a message to the AI interviewer
app.post('/api/interview/chat', async (req, res) => {
    const { problem, role, company, interviewPhase, transcript, currentCode, language } = req.body;
    if (!problem || !role || !company) {
        return res.status(400).json({ error: 'problem, role, and company are required.' });
    }
    try {
        const response = await getInterviewerResponse(
            problem, role, company, interviewPhase || 'opening',
            transcript || [], currentCode || '', language || 'python'
        );
        res.json({ text: response });
    } catch (error) {
        console.error('Interview Chat Error:', error.message);
        res.status(500).json({ error: error.message || 'Interview response failed.' });
    }
});

// Analyze the candidate's current code in real-time
app.post('/api/interview/analyze', async (req, res) => {
    const { code, language, problem } = req.body;
    if (!code || !language || !problem) {
        return res.status(400).json({ error: 'code, language, and problem are required.' });
    }
    try {
        const analysis = await analyzeInterviewCode(code, language, problem);
        res.json(analysis || {});
    } catch (error) {
        console.error('Code Analysis Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Generate the final interview score report
app.post('/api/interview/evaluate', async (req, res) => {
    const { problem, role, company, transcript, finalCode, language } = req.body;
    if (!problem || !role || !company) {
        return res.status(400).json({ error: 'problem, role, and company are required.' });
    }
    try {
        const report = await evaluateInterview(
            problem, role, company,
            transcript || [], finalCode || '', language || 'python'
        );
        res.json(report);
    } catch (error) {
        console.error('Evaluation Error:', error.message);
        res.status(500).json({ error: error.message || 'Evaluation failed.' });
    }
});


// --- ElevenLabs TTS Proxy (with fallback key rotation) ---
const ELEVENLABS_API_KEYS = [
    'sk_a81c2067650eaac5c6941b49d898dd92cf92a0847f993f43', // primary
    'sk_a26008b0b6cb47c5accfbba23c99d9c1a404280907f9c3b9', // fallback 1
    'sk_b71753e3015e104d6e085d0f4284e1366c0b4479b941837a', // fallback 2
    'sk_3472258d1839fbbfc9a3c3f92a94b4d6de6eb620a2b10d1d', // fallback 3
];

app.post('/api/elevenlabs/tts', async (req, res) => {
    const { text, voiceId } = req.body;
    if (!text || !voiceId) {
        return res.status(400).json({ error: 'text and voiceId are required.' });
    }

    let lastError = null;
    for (let i = 0; i < ELEVENLABS_API_KEYS.length; i++) {
        const apiKey = ELEVENLABS_API_KEYS[i];
        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg'
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_turbo_v2',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        style: 0.3,
                        use_speaker_boost: true
                    }
                })
            });

            // On rate-limit or auth error, try the next key
            if (response.status === 429 || response.status === 401) {
                const errBody = await response.text();
                console.warn(`ElevenLabs key #${i + 1} failed (${response.status}), trying next...`);
                lastError = `Key #${i + 1} error ${response.status}: ${errBody}`;
                continue;
            }

            if (!response.ok) {
                const err = await response.text();
                console.error('ElevenLabs error:', err);
                return res.status(response.status).json({ error: 'ElevenLabs API error: ' + err });
            }

            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Cache-Control', 'no-cache');
            const arrayBuffer = await response.arrayBuffer();
            return res.send(Buffer.from(arrayBuffer));

        } catch (err) {
            console.warn(`ElevenLabs key #${i + 1} threw error:`, err.message);
            lastError = err.message;
        }
    }

    console.error('All ElevenLabs API keys exhausted:', lastError);
    return res.status(503).json({ error: 'All ElevenLabs API keys are currently unavailable.' });
});


const PORT = process.env.PORT || 3001;

// Load dataset first, then start listening
loadDataset().then(() => {
    app.listen(PORT, () => {
        console.log(`Code Execution Server listening on port ${PORT}`);
    });
}).catch(err => {
    console.error("Failed to load dataset, starting server anyway...", err);
    // Even if dataset fails to load, start the server so execution still works
    app.listen(PORT, () => {
        console.log(`Code Execution Server listening on port ${PORT} (Dataset Unavailable)`);
    });
});
