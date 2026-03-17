require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { executeCode } = require('./executor');
const { generateCodeAndTests, extractProjectDetails } = require('./ai');
const { loadDataset, getProblems, getProblemById, getMetadata, getTotalCounts, isDataLoaded } = require('./dataset');
const { runScraperInDocker } = require('./scraper');
const { parseResumeWithAI } = require('./resumeParser');
const { db, rtdb } = require('./firebase');
const { doc, setDoc, increment, collection, getDocs, getDoc, addDoc, query, orderBy, deleteDoc, arrayUnion, arrayRemove, where } = require('firebase/firestore');
const { ref: rtdbRef, push, set, remove, get } = require('firebase/database');
const UAParser = require('ua-parser-js');
const cron = require('node-cron');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const allowedOrigins = [
    'http://localhost:5173', // Vite default local
    'http://localhost:5174', // Vite alternative local
    'http://localhost:3000', // Alternative local
    'https://aiinterview-20512.web.app', // Firebase hosted app
    'https://aiinterview-20512.firebaseapp.com',
    'https://whizan.xyz',
    'https://www.whizan.xyz'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Admin Routes (Auth List/Delete, DB Browser, etc)
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

const Razorpay = require('razorpay');
const crypto = require('crypto');
const razorpayParams = {
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
};
const razorpay = new Razorpay(razorpayParams);

// --- Auth & Session Routes ---
app.post('/api/auth/session', async (req, res) => {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: 'uid required' });

    try {
        const parser = new UAParser(req.headers['user-agent']);
        const result = parser.getResult();

        let deviceType = 'Computer';
        if (result.device.type === 'mobile') deviceType = 'Smartphone';
        else if (result.device.type === 'tablet') deviceType = 'Tablet';

        const os = result.os.name || 'Unknown OS';
        const browser = result.browser.name || 'Unknown Browser';
        const deviceStr = `${browser} · ${os}`; // e.g. "Chrome · macOS"

        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown IP';
        const time = new Date().toISOString();

        const sessionData = {
            deviceStr,
            deviceType,
            ip,
            time,
            lastActive: time
        };

        const sessionsRef = rtdbRef(rtdb, `users/${uid}/sessions`);
        const newSessionRef = push(sessionsRef);
        await set(newSessionRef, sessionData);

        res.json({ success: true, sessionId: newSessionRef.key, sessionData });
    } catch (err) {
        console.error("Session creation failed", err);
        res.status(500).json({ success: false, error: "Session creation failed" });
    }
});

app.delete('/api/auth/session/:uid/:sessionId', async (req, res) => {
    const { uid, sessionId } = req.params;
    try {
        const sessionRef = rtdbRef(rtdb, `users/${uid}/sessions/${sessionId}`);
        await remove(sessionRef);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to remove session" });
    }
});

app.delete('/api/auth/sessions/other/:uid/:currentSessionId', async (req, res) => {
    const { uid, currentSessionId } = req.params;
    try {
        const sessionsRef = rtdbRef(rtdb, `users/${uid}/sessions`);
        const snapshot = await get(sessionsRef);

        if (snapshot.exists()) {
            const sessions = snapshot.val();
            const promises = [];

            for (const [key, _] of Object.entries(sessions)) {
                if (key !== currentSessionId) {
                    const sessionRef = rtdbRef(rtdb, `users/${uid}/sessions/${key}`);
                    promises.push(remove(sessionRef));
                }
            }

            await Promise.all(promises);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to remove other sessions" });
    }
});

// --- Payment Routes ---
app.post('/api/create-order', async (req, res) => {
    try {
        const options = {
            amount: 30 * 100, // ₹30
            currency: "INR",
            receipt: "receipt_" + Math.random().toString(36).substring(7),
        };
        const order = await razorpay.orders.create(options);
        res.status(200).json({
            success: true,
            order,
            key_id: razorpayParams.key_id
        });
    } catch (err) {
        console.error("Order creation failed", err);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

app.post('/api/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, uid } = req.body;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto.createHmac("sha256", razorpayParams.key_secret)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment verified - update Firestore
            const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            await setDoc(doc(db, "userProfiles", uid), {
                plan: "Blaze",
                planExpiresAt: expiryDate
            }, { merge: true });

            res.status(200).json({ success: true, message: "Payment verified successfully", expiryDate });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (err) {
        console.error("Payment verification failed", err);
        res.status(500).json({ success: false, message: "Verification failed" });
    }
});


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

app.get('/api/problems/random', async (req, res) => {
    if (!isDataLoaded()) {
        return res.status(503).json({ error: 'Dataset is still loading or unavailable.' });
    }
    const { company } = req.query;

    const result = getProblems(1, 5000, '', [], company ? [String(company).trim()] : []);
    let matchingProblems = result.data;
    let usedFallback = false;

    // If no problems matched the company, fall back to the full dataset
    if (!matchingProblems || matchingProblems.length === 0) {
        const fallbackResult = getProblems(1, 5000, '', [], []);
        matchingProblems = fallbackResult.data;
        usedFallback = true;
    }

    if (!matchingProblems || matchingProblems.length === 0) {
        return res.status(503).json({ error: 'Dataset is empty.' });
    }

    const randomIndex = Math.floor(Math.random() * matchingProblems.length);
    let problem = matchingProblems[randomIndex];
    problem = { ...problem, fallback: usedFallback }; // avoid mutating dataset

    try {
        const snap = await getDoc(doc(db, "stats", String(problem.id)));
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
        }
    } catch (err) {
        console.error("Failed to fetch live stats", err);
    }

    res.json(problem);
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
            // Execute all test cases sequentially
            const results = [];
            for (const tc of testCases) {
                const result = await executeCode(code, language, tc.input, tc.expectedOutput);
                results.push(result);
            }
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

// Save or Update a completed/ongoing interview session
app.post('/api/interviews/save', async (req, res) => {
    const { id, userId, role, company, language, problemId, problemTitle, problemDifficulty,
        finalCode, transcript, scoreReport, submissionCount, durationMinutes, problemData, notes } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    try {
        const now = new Date().toISOString();
        const interviewData = {
            userId: String(userId), role: role || '', company: company || '',
            language: language || 'python', problemId: String(problemId || ''),
            problemTitle: problemTitle || '', problemDifficulty: problemDifficulty || '',
            problemData: problemData || null,
            finalCode: finalCode || '', transcript: transcript || [],
            notes: typeof notes === 'string' ? notes : '',
            scoreReport: scoreReport || null,
            submissionCount: submissionCount || 0,
            durationMinutes: durationMinutes || 0,
            overallScore: scoreReport?.overallScore ?? null,
            status: scoreReport ? 'completed' : 'in-progress',
            lastUpdatedAt: now
        };

        let targetId = id;
        if (targetId) {
            // Update existing interview
            await setDoc(doc(db, 'interviews', targetId), interviewData, { merge: true });
        } else {
            // Create new interview
            interviewData.createdAt = now;
            const docRef = await addDoc(collection(db, 'interviews'), interviewData);
            targetId = docRef.id;
        }

        res.json({ id: targetId });
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

// Delete an interview by document ID
app.delete('/api/interviews/:id', async (req, res) => {
    try {
        await deleteDoc(doc(db, 'interviews', req.params.id));
        res.json({ success: true });
    } catch (err) {
        console.error('Failed to delete interview:', err);
        res.status(500).json({ error: 'Failed to delete interview' });
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

// --- Resume Parse Route ---
app.post('/api/resume/parse', async (req, res) => {
    try {
        const { base64Data, mimeType } = req.body;
        if (!base64Data || !mimeType) {
            return res.status(400).json({ error: 'base64Data and mimeType are required' });
        }
        const parsedProfile = await parseResumeWithAI(base64Data, mimeType);
        res.json({ profile: parsedProfile });
    } catch (err) {
        console.error('Failed to parse resume:', err);
        res.status(500).json({ error: 'Failed to extract data from resume: ' + err.message });
    }
});

// --- User Profile Routes ---
app.get('/api/profile/:uid', async (req, res) => {
    try {
        const profileRef = doc(db, 'userProfiles', req.params.uid);
        const snap = await getDoc(profileRef);
        if (!snap.exists()) return res.json({ profile: {} });

        let profileData = snap.data();

        // Auto-downgrade logic if plan is expired
        if (profileData.plan === 'Blaze' && profileData.planExpiresAt) {
            const now = new Date();
            const expires = new Date(profileData.planExpiresAt);
            if (now > expires) {
                profileData = { ...profileData, plan: 'Spark' };
                await setDoc(profileRef, { plan: 'Spark' }, { merge: true }); // Downgrade in Firestore
            }
        }

        res.json({ profile: profileData });
    } catch (err) {
        console.error('Failed to fetch profile:', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

app.post('/api/profile/:uid', async (req, res) => {
    try {
        const profileRef = doc(db, 'userProfiles', req.params.uid);
        await setDoc(profileRef, { ...req.body, updatedAt: new Date().toISOString() }, { merge: true });
        res.json({ success: true });
    } catch (err) {
        console.error('Failed to save profile:', err);
        res.status(500).json({ error: 'Failed to save profile' });
    }
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

            // Extract Local Date keys
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const dStr = String(date.getDate()).padStart(2, '0');

            const dayKey = `${y}-${m}-${dStr}`;
            const monthKey = `${y}-${m}`;

            dailyCounts[dayKey] = (dailyCounts[dayKey] || 0) + 1;
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        });

        // Calculate streaks based on local boundaries
        const sortedDays = Object.keys(dailyCounts).sort();
        let currentStreak = 0, longestStreak = 0, tempStreak = 0;

        const today = new Date();
        const yT = today.getFullYear(), mT = String(today.getMonth() + 1).padStart(2, '0'), dT = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yT}-${mT}-${dT}`;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yY = yesterday.getFullYear(), mY = String(yesterday.getMonth() + 1).padStart(2, '0'), dY = String(yesterday.getDate()).padStart(2, '0');
        const yesterdayStr = `${yY}-${mY}-${dY}`;

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
                const cy = checkDate.getFullYear(), cm = String(checkDate.getMonth() + 1).padStart(2, '0'), cd = String(checkDate.getDate()).padStart(2, '0');
                const key = `${cy}-${cm}-${cd}`;
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

// --- Project AI Extraction Route ---
app.post('/api/project/extract-readme', async (req, res) => {
    const { githubUrl } = req.body;
    if (!githubUrl) return res.status(400).json({ error: 'githubUrl is required' });

    try {
        // 1. Extract owner/repo
        // Supports: https://github.com/owner/repo or github.com/owner/repo
        const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) return res.status(400).json({ error: 'Invalid GitHub URL' });

        const owner = match[1];
        const repo = match[2].replace(/\.git$/, '');

        // 2. Fetch README from GitHub API (or raw content)
        // We'll try common branches: main, master
        let readmeText = '';
        const branches = ['main', 'master'];
        for (const branch of branches) {
            try {
                const response = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`);
                if (response.ok) {
                    readmeText = await response.text();
                    break;
                }
            } catch (e) { }
        }

        if (!readmeText) {
            return res.status(404).json({ error: 'README.md not found in main/master branch. Please ensure it exists.' });
        }

        // 3. Extract with AI
        const projectData = await extractProjectDetails(readmeText);
        res.json({ projectData });

    } catch (err) {
        console.error('Failed to extract GitHub README:', err);
        res.status(500).json({ error: 'AI Extraction failed: ' + err.message });
    }
});

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
    const { problem, role, company, interviewPhase, transcript, currentCode, language, sessionId } = req.body;
    if (!problem || !role || !company) {
        return res.status(400).json({ error: 'problem, role, and company are required.' });
    }
    try {
        const response = await getInterviewerResponse(
            problem, role, company, interviewPhase || 'opening',
            transcript || [], currentCode || '', language || 'python'
        );

        // Write uiActions to Realtime Database if any exist and we have a sessionId
        if (sessionId) {
            try {
                const cleanedResponse = response.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
                const parsed = JSON.parse(cleanedResponse);
                if (parsed && Array.isArray(parsed.uiActions) && parsed.uiActions.length > 0) {
                    const actionsRef = rtdbRef(rtdb, `sessions/${sessionId}/actions`);
                    // Push a new record with the timestamp and actions
                    push(actionsRef, {
                        timestamp: Date.now(),
                        actions: parsed.uiActions
                    }).catch(err => console.error('Failed to write RTDB actions (async):', err));
                }
            } catch (e) {
                // Ignore parse errors here; frontend handles fallback
            }
        }

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



// --- Sarvam AI TTS Proxy (streaming) ---
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

app.post('/api/sarvam/tts', async (req, res) => {
    const { text, speaker } = req.body;  // speaker: 'manan' | 'ratan' | 'rohan' | 'shreya' | 'roopa'
    if (!text || !speaker) return res.status(400).json({ error: 'text and speaker are required.' });

    const validSpeakers = ['manan', 'ratan', 'rohan', 'shreya', 'roopa'];
    const safeSpeaker = validSpeakers.includes(speaker) ? speaker : 'manan';

    try {
        const response = await fetch('https://api.sarvam.ai/text-to-speech/stream', {
            method: 'POST',
            headers: {
                'api-subscription-key': SARVAM_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                target_language_code: 'en-IN',
                speaker: safeSpeaker,
                model: 'bulbul:v3',
                pace: 1.1,
                speech_sample_rate: 22050,
                output_audio_codec: 'mp3',
                enable_preprocessing: true
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Sarvam TTS error:', response.status, errText);
            return res.status(response.status).json({ error: 'Sarvam TTS failed: ' + errText });
        }

        // Stream MP3 chunks directly to client
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Transfer-Encoding', 'chunked');

        const { Readable } = require('stream');
        const nodeStream = Readable.from(response.body);
        nodeStream.pipe(res);
        nodeStream.on('error', (err) => {
            console.error('Sarvam stream error:', err.message);
            res.end();
        });

    } catch (err) {
        console.error('Sarvam TTS exception:', err.message);
        return res.status(500).json({ error: 'Sarvam TTS request failed: ' + err.message });
    }
});



// --- Analytics Routes -------------------------------------------------------
// These endpoints accept tracking data from the frontend and store it in Firestore.
// They always return 204 immediately to be non-blocking.

/**
 * POST /api/analytics/pageview
 * Body: { event, timestamp, session_id, user_id, page, query_params, utm, referrer, browser }
 */
app.post('/api/analytics/pageview', async (req, res) => {
    // Respond immediately — analytics must never slow down the user.
    res.status(204).end();

    try {
        const { session_id, user_id, page, query_params, utm, referrer, browser, timestamp } = req.body;

        // Strip any sensitive query params before storage
        const safeQueryParams = { ...query_params };
        ['password', 'token', 'secret', 'key'].forEach(k => delete safeQueryParams[k]);

        const analyticsRef = collection(db, 'analytics_pageviews');
        await addDoc(analyticsRef, {
            session_id: session_id || null,
            user_id: user_id || null,
            path: page?.path || '/',
            url: page?.url || '',
            title: page?.title || '',
            query_params: safeQueryParams || {},
            utm: utm || null,
            referrer: referrer || null,
            browser: browser || null,
            server_ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null,
            timestamp: timestamp || new Date().toISOString(),
        });
    } catch (err) {
        console.error('[Analytics] Failed to save pageview:', err.message);
    }
});

/**
 * POST /api/analytics/event
 * Body: { event, timestamp, session_id, user_id, page, utm, referrer, ...eventProps }
 */
app.post('/api/analytics/event', async (req, res) => {
    res.status(204).end();

    try {
        const { event, session_id, user_id, page, utm, referrer, timestamp, ...props } = req.body;
        if (!event) return;

        const analyticsRef = collection(db, 'analytics_events');
        await addDoc(analyticsRef, {
            event: event,
            session_id: session_id || null,
            user_id: user_id || null,
            path: page?.path || '/',
            utm: utm || null,
            referrer: referrer || null,
            props: props || {},
            timestamp: timestamp || new Date().toISOString(),
        });
    } catch (err) {
        console.error('[Analytics] Failed to save event:', err.message);
    }
});

/**
 * GET /api/analytics/summary (optional — for internal dashboards)
 * Returns a lightweight summary of recent traffic.
 */
app.get('/api/analytics/summary', async (req, res) => {
    try {
        const [pvSnap, evSnap] = await Promise.all([
            getDocs(collection(db, 'analytics_pageviews')),
            getDocs(collection(db, 'analytics_events')),
        ]);

        const pageviews = [];
        pvSnap.forEach(d => pageviews.push(d.data()));

        // Tally by path
        const pathCounts = {};
        const referrerCounts = {};
        const utmSources = {};

        pageviews.forEach(pv => {
            const path = pv.path || '/';
            pathCounts[path] = (pathCounts[path] || 0) + 1;
            const src = pv.referrer?.source || 'direct';
            referrerCounts[src] = (referrerCounts[src] || 0) + 1;
            if (pv.utm?.utm_source) {
                utmSources[pv.utm.utm_source] = (utmSources[pv.utm.utm_source] || 0) + 1;
            }
        });

        res.json({
            total_pageviews: pvSnap.size,
            total_events: evSnap.size,
            top_pages: Object.entries(pathCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([p, c]) => ({ path: p, count: c })),
            traffic_sources: Object.entries(referrerCounts).sort((a, b) => b[1] - a[1]).map(([s, c]) => ({ source: s, count: c })),
            utm_sources: Object.entries(utmSources).sort((a, b) => b[1] - a[1]).map(([s, c]) => ({ source: s, count: c })),
        });
    } catch (err) {
        console.error('[Analytics] Summary failed:', err);
        res.status(500).json({ error: 'Failed to fetch analytics summary' });
    }
});
// ---------------------------------------------------------------------------


// ── Subscription Expiry Email Cron ───────────────────────────────────────────

const EMAILJS_REST_URL     = 'https://api.emailjs.com/api/v1.0/email/send';

// Primary EmailJS Account (Expiry Reminder)
const PRIMARY_SERVICE_ID   = process.env.EMAILJS_PRIMARY_SERVICE_ID;
const PRIMARY_PUBLIC_KEY   = process.env.EMAILJS_PRIMARY_PUBLIC_KEY;
const TEMPLATE_REMINDER    = process.env.EMAILJS_TEMPLATE_REMINDER;

// Secondary EmailJS Account (Subscription Ended)
const SECONDARY_SERVICE_ID = process.env.EMAILJS_SECONDARY_SERVICE_ID;
const SECONDARY_PUBLIC_KEY = process.env.EMAILJS_SECONDARY_PUBLIC_KEY;
const TEMPLATE_EXPIRED     = process.env.EMAILJS_TEMPLATE_EXPIRED;

function formatDateNice(iso) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function sendEmailViaREST(serviceId, templateId, publicKey, params) {
    try {
        const res = await fetch(EMAILJS_REST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id:  serviceId,
                template_id: templateId,
                user_id:     publicKey,
                template_params: params,
            }),
        });
        const text = await res.text();
        console.log(`[EmailJS] ${templateId} → ${params.to_email} : ${text}`);
    } catch (err) {
        console.error(`[EmailJS] Failed to send ${templateId}:`, err.message);
    }
}

async function runExpiryCheck() {
    console.log('[Cron] Running subscription expiry check...');
    try {
        const snapshot = await getDocs(collection(db, 'userProfiles'));
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        let reminders = 0, expired = 0;

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            if (data.plan !== 'Blaze' || !data.planExpiresAt) continue;

            const expiresAt = new Date(data.planExpiresAt);
            const name       = data.displayName || data.email?.split('@')[0] || 'there';
            const email      = data.email;

            if (!email) continue;

            // ── Already expired ──────────────────────────────────────────────
            if (now > expiresAt) {
                // Only send once: track with `expiredEmailSent` flag
                if (!data.expiredEmailSent) {
                    await sendEmailViaREST(SECONDARY_SERVICE_ID, TEMPLATE_EXPIRED, SECONDARY_PUBLIC_KEY, {
                        to_name:    name,
                        to_email:   email,
                        expired_on: formatDateNice(data.planExpiresAt),
                        from_name:  'Whizan Team',
                        reply_to:   'whizanai@gmail.com',
                    });
                    await setDoc(doc(db, 'userProfiles', docSnap.id), {
                        plan: 'Spark',
                        expiredEmailSent: true,
                    }, { merge: true });
                    expired++;
                }
            }
            // ── Expires within 3 days ────────────────────────────────────────
            else if (expiresAt <= threeDaysFromNow) {
                // Only send once: track with `reminderEmailSent` flag
                if (!data.reminderEmailSent) {
                    await sendEmailViaREST(PRIMARY_SERVICE_ID, TEMPLATE_REMINDER, PRIMARY_PUBLIC_KEY, {
                        to_name:     name,
                        to_email:    email,
                        expiry_date: formatDateNice(data.planExpiresAt),
                        from_name:   'Whizan Team',
                        reply_to:    'whizanai@gmail.com',
                    });
                    await setDoc(doc(db, 'userProfiles', docSnap.id), {
                        reminderEmailSent: true,
                    }, { merge: true });
                    reminders++;
                }
            }
        }

        console.log(`[Cron] Done — ${reminders} reminders sent, ${expired} expired & downgraded.`);
        return { reminders, expired };
    } catch (err) {
        console.error('[Cron] Expiry check failed:', err);
        return { error: err.message };
    }
}

// Run daily at 9:00 AM IST (3:30 AM UTC)
cron.schedule('30 3 * * *', runExpiryCheck, { timezone: 'UTC' });
console.log('[Cron] Subscription expiry check scheduled — daily at 9:00 AM IST');

// Manual trigger endpoint for testing
app.get('/api/cron/check-expiry', async (req, res) => {
    const result = await runExpiryCheck();
    res.json(result);
});

// ─────────────────────────────────────────────────────────────────────────────

// Start loading the dataset
loadDataset();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

