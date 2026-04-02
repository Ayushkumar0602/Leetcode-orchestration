/**
 * Whizan AI — ML Recommendation Routes
 * ======================================
 * Express router mounted at /api/ml
 *
 * Endpoints:
 *   POST /api/ml/trigger/:uid       — trigger recommendation for one user
 *   POST /api/ml/trigger-all        — trigger for all users (batch)
 *   POST /api/ml/pause              — toggle pause/resume of global ML
 *   GET  /api/ml/status             — return ml_jobs/global state
 *   GET  /api/recommendations/:uid  — fetch stored recs for a user
 */

const express = require('express');
const router = express.Router();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// ─── Helper: Firestore refs ────────────────────────────────────────────────

let _db = null;
let _firestoreOps = null;

function getFirestore() {
    if (!_db) {
        const { db } = require('../firebase');
        const { doc, getDoc, setDoc, collection, getDocs } = require('firebase/firestore');
        _db = db;
        _firestoreOps = { doc, getDoc, setDoc, collection, getDocs };
    }
    return { db: _db, ..._firestoreOps };
}

// ─── GET /api/ml/status ────────────────────────────────────────────────────

router.get('/status', async (req, res) => {
    try {
        const { db, doc, getDoc } = getFirestore();
        const snap = await getDoc(doc(db, 'ml_jobs', 'global'));
        if (!snap.exists()) {
            return res.json({
                status: 'idle',
                lastRunAt: null,
                pausedAt: null,
                currentUid: null,
                processedCount: 0,
                totalCount: 0,
                errorLog: [],
            });
        }
        res.json(snap.data());
    } catch (err) {
        console.error('[ML] Failed to fetch status:', err);
        res.status(500).json({ error: 'Failed to fetch ML status' });
    }
});

// ─── POST /api/ml/pause ───────────────────────────────────────────────────

router.post('/pause', async (req, res) => {
    try {
        const { db, doc, getDoc, setDoc } = getFirestore();
        const ref = doc(db, 'ml_jobs', 'global');
        const snap = await getDoc(ref);
        const current = snap.exists() ? snap.data() : {};

        const isPaused = current.status === 'paused';
        const adminUid = req.body?.adminUid || 'admin';
        const now = new Date().toISOString();

        const update = isPaused
            ? { status: 'idle', pausedAt: null, pausedBy: null }
            : { status: 'paused', pausedAt: now, pausedBy: adminUid };

        await setDoc(ref, update, { merge: true });

        res.json({
            success: true,
            action: isPaused ? 'resumed' : 'paused',
            status: update.status,
        });
    } catch (err) {
        console.error('[ML] Pause toggle failed:', err);
        res.status(500).json({ error: 'Failed to toggle ML pause state' });
    }
});

// ─── POST /api/ml/trigger/:uid ────────────────────────────────────────────
//
// Node.js-native recommendation engine v2 — no Python dependency.
// 5-signal hybrid scorer with guaranteed difficulty distribution.

// Helper: parse strings like '8.7M', '1.2K', '904.7K' → number
function parseCount(str) {
    if (!str) return 0;
    const s = String(str).replace(/,/g, '').trim();
    const m = s.match(/^([\d.]+)\s*([KkMmBb]?)$/);
    if (!m) return parseInt(s, 10) || 0;
    const n = parseFloat(m[1]);
    const suffix = m[2].toUpperCase();
    if (suffix === 'K') return Math.round(n * 1_000);
    if (suffix === 'M') return Math.round(n * 1_000_000);
    if (suffix === 'B') return Math.round(n * 1_000_000_000);
    return Math.round(n);
}

router.post('/trigger/:uid', async (req, res) => {
    const { uid } = req.params;
    if (!uid) return res.status(400).json({ error: 'uid required' });

    try {
        const { db, doc, getDoc, setDoc, collection, getDocs } = getFirestore();

        // ── 0. Guard: globally paused? ───────────────────────────────────
        const jobSnap = await getDoc(doc(db, 'ml_jobs', 'global'));
        if (jobSnap.exists() && jobSnap.data().status === 'paused') {
            return res.status(409).json({ error: 'ML is globally paused. Resume before triggering.' });
        }

        await setDoc(doc(db, 'ml_jobs', 'global'), {
            status: 'running', currentUid: uid, lastRunAt: new Date().toISOString(),
        }, { merge: true });

        // ── 1. Load user data from Firestore ─────────────────────────────
        let adminSDK = null;
        try { adminSDK = require('../firebaseAdmin').admin; } catch (_) {}

        let interviews = [];
        let problemDocs = []; // 'problems' collection — the authoritative solved source
        let submissions = []; // 'submissions' collection — for recentIds and attempt tracking

        if (adminSDK && adminSDK.apps.length) {
            const afs = adminSDK.firestore();
            // NOTE: removing orderBy to avoid composite-index requirement;
            // we sort in-memory after fetching.
            const [intSnap, probSnap, subSnap] = await Promise.all([
                afs.collection('interviews').where('userId', '==', uid).limit(50).get().catch(() => ({ docs: [] })),
                afs.collection('problems').where('userId', '==', uid).get().catch(() => ({ docs: [] })),
                afs.collection('submissions').where('userId', '==', uid).limit(200).get().catch(() => ({ docs: [] })),
            ]);
            interviews    = intSnap.docs.map(d => d.data());
            problemDocs   = probSnap.docs.map(d => d.data());
            submissions   = subSnap.docs.map(d => d.data());
        } else {
            const [intSnap, probSnap, subSnap] = await Promise.all([
                getDocs(collection(db, 'interviews')).catch(() => ({ docs: [] })),
                getDocs(collection(db, 'problems')).catch(() => ({ docs: [] })),
                getDocs(collection(db, 'submissions')).catch(() => ({ docs: [] })),
            ]);
            interviews  = intSnap.docs.map(d => d.data()).filter(d => d.userId === uid);
            problemDocs = probSnap.docs.map(d => d.data()).filter(d => d.userId === uid);
            submissions = subSnap.docs.map(d => d.data()).filter(d => d.userId === uid);
        }

        // Sort all in-memory by createdAt desc (most recent first)
        interviews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        submissions.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));

        // ── 2. Compute rich user signals ─────────────────────────────────

        // 2a. Interview performance
        // Match dashboard filter: inv.overallScore > 0 OR inv.scoreReport present
        const validInterviews = interviews.filter(i =>
            (typeof i.overallScore === 'number' && i.overallScore > 0) || i.scoreReport
        );
        const totalInterviews = validInterviews.length; // matches dashboard's validInterviews.length
        const avgScore = validInterviews.length > 0
            ? validInterviews.reduce((s, i) => s + i.overallScore, 0) / validInterviews.length
            : 50;

        // 2b. Solved problems — from the 'problems' collection (authoritative source)
        //   Real schema: { userId, problemId, status:'Solved'/'Attempting', difficulty, submissionsCount }
        //   This matches exactly how /api/stats/user/:uid counts solved problems.
        const solvedSet    = new Set();
        const attemptedSet = new Set();
        const solvedByDiff = { Easy: 0, Medium: 0, Hard: 0 };

        for (const p of problemDocs) {
            const key = String(p.problemId || '').trim().toLowerCase();
            if (!key) continue;
            if (p.status === 'Solved') {
                solvedSet.add(key);
                const d = p.difficulty || 'Medium';
                if (solvedByDiff[d] !== undefined) solvedByDiff[d]++;
            } else if (p.status === 'Attempting') {
                attemptedSet.add(key);
            }
        }

        // Submission-level signals: attempt count per problem (for struggle detection)
        const submissionsByProblem = {};
        for (const s of submissions) {
            const key = String(s.problemId || '').trim().toLowerCase();
            if (!key) continue;
            submissionsByProblem[key] = (submissionsByProblem[key] || 0) + 1;
        }

        // Problems attempted >3x unsolved = persistent struggle
        const struggleIds = new Set(
            Object.entries(submissionsByProblem)
                .filter(([k, cnt]) => cnt > 3 && !solvedSet.has(k))
                .map(([k]) => k)
        );

        // Recently attempted (last 14 days) — de-prioritise in scoring
        const twoWeeksAgo = Date.now() - 14 * 24 * 3600_000;
        const recentIds = new Set(
            submissions
                .filter(s => new Date(s.submittedAt || 0).getTime() > twoWeeksAgo)
                .map(s => String(s.problemId || '').trim().toLowerCase())
                .filter(Boolean)
        );

        // Score trend (most recent 5 vs previous 5)
        const recent5   = validInterviews.slice(0, 5);
        const prev5     = validInterviews.slice(5, 10);
        const recentAvg = recent5.length ? recent5.reduce((s, i) => s + i.overallScore, 0) / recent5.length : avgScore;
        const prevAvg   = prev5.length   ? prev5.reduce((s, i) => s + i.overallScore, 0)   / prev5.length   : avgScore;
        const improving = recentAvg >= prevAvg;

        // 2c. Topic / skill weakness signals — from real scoreReport fields:
        //   scoreReport.improvements[] → areas to improve (string[])
        //   scoreReport.strengths[]    → areas excelled  (string[])
        //   scoreReport.skills{}       → { problemDecomposition:{score:1-5,comment}, communication, codeQuality,
        //                                  edgeCases, optimization, algorithmicThinking }
        const weakTopics   = {};
        const strongTopics = {};

        for (const inv of validInterviews) {
            const sr    = inv.scoreReport || {};
            const score = inv.overallScore || 0;

            // AI text lists from evaluation
            (sr.improvements || []).forEach(t => {
                const label = String(t).trim();
                if (label) weakTopics[label] = (weakTopics[label] || 0) + 1;
            });
            (sr.strengths || []).forEach(t => {
                const label = String(t).trim();
                if (label) strongTopics[label] = (strongTopics[label] || 0) + 1;
            });

            // Skill scores: each is { score: 1-5, comment: '...' }
            // Normalize 1-5 → 0-100 for threshold comparison
            if (sr.skills && typeof sr.skills === 'object') {
                for (const [skill, val] of Object.entries(sr.skills)) {
                    const rawScore = typeof val === 'object' ? val?.score : val;
                    if (typeof rawScore !== 'number') continue;
                    const normalized = rawScore * 20; // 1→20, 2→40, 3→60, 4→80, 5→100
                    const label = skill.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim();
                    if (normalized < 60) weakTopics[label]   = (weakTopics[label]   || 0) + (1 - normalized / 100);
                    if (normalized > 80) strongTopics[label] = (strongTopics[label] || 0) + (normalized / 100);
                }
            }

            // Low overall score → flag problem difficulty as a weakness
            if (score < 50 && inv.problemDifficulty) {
                weakTopics[inv.problemDifficulty] = (weakTopics[inv.problemDifficulty] || 0) + 0.5;
            }
        }

        // 2d. Adaptive target difficulty
        let targetDiff;
        if      (avgScore >= 70 && improving) targetDiff = 'Hard';
        else if (avgScore >= 70)              targetDiff = 'Medium';
        else if (avgScore >= 40)              targetDiff = 'Medium';
        else                                  targetDiff = 'Easy';

        if (struggleIds.size >= 5 && targetDiff === 'Hard')   targetDiff = 'Medium';
        if (struggleIds.size >= 5 && targetDiff === 'Medium') targetDiff = 'Easy';

        const diffRank = { Easy: 1, Medium: 2, Hard: 3 };
        const targetRank = diffRank[targetDiff] || 2;

        // ── 3. Load dataset & build global signals ────────────────────────
        const { getProblemsList } = require('../dataset');
        const allProblems = getProblemsList ? getProblemsList() : [];
        if (!allProblems.length) throw new Error('Dataset not loaded yet. Retry in a moment.');

        // Precompute global max frequency for normalization
        // Safe reduce instead of Math.max(...largeArray) which blows the call stack at 38k items
        const maxFreq = allProblems.reduce((m, p) => Math.max(m, parseFloat(p.frequency) || 0), 1);
        const maxRating = allProblems.reduce((m, p) => Math.max(m, parseFloat(p.rating) || 0), 1);
        const weakTopicMax = Object.values(weakTopics).reduce((m, v) => Math.max(m, v), 1);

        // ── 4. Score every problem ────────────────────────────────────────
        const scored = allProblems.map(p => {
            const diff = p.difficulty || 'Medium';
            const pRank = diffRank[diff] || 2;
            const id = String(p.id || p.question_id || '').toLowerCase();
            const titleKey = String(p.title || '').toLowerCase().replace(/\s+/g, '-');

            // Skip already solved
            if (solvedSet.has(id) || solvedSet.has(titleKey)) return null;

            const topics = String(p.related_topics || p.topics || '').split(',').map(t => t.trim()).filter(Boolean);
            const title = p.title || '';
            const freq = parseFloat(p.frequency) || 0;
            const acceptance = parseFloat(p.acceptance_rate) || 50;
            const rating = parseFloat(p.rating) || 50;
            const isFAANG = p.asked_by_faang === '1' || p.asked_by_faang === 1;

            // ── Signal 1: Difficulty fit (0-1) ──────────────────────────
            // Gaussian-like decay: perfect fit = 1.0, 1 step away = 0.6, 2 steps = 0.15
            const diffDist = Math.abs(pRank - targetRank);
            const diffFit = diffDist === 0 ? 1.0 : diffDist === 1 ? 0.6 : 0.15;

            // ── Signal 2: Interview frequency relevance (0-1) ────────────
            // High freq → high interview relevance
            const freqScore = freq / maxFreq;

            // ── Signal 3: Problem quality (0-1) ──────────────────────────
            // Use rating (community quality score) normalized
            const qualityScore = rating / maxRating;

            // ── Signal 4: FAANG / company signal (0-1) ──────────────────
            const faangScore = isFAANG ? 1.0 : 0.3;

            // ── Signal 5: Topic weakness alignment (0-1) ─────────────────
            let weakScore = 0;
            topics.forEach(t => {
                if (weakTopics[t]) weakScore += weakTopics[t] / weakTopicMax;
            });
            weakScore = Math.min(weakScore, 1.0);

            // ── Signal 6: Acceptance rate suitability ────────────────────
            // Lower acceptance = harder; we want acceptance aligned to target difficulty
            const targetAcceptance = targetDiff === 'Easy' ? 55 : targetDiff === 'Medium' ? 40 : 28;
            const acceptanceFit = 1 - Math.min(Math.abs(acceptance - targetAcceptance) / 50, 1);

            // ── Signal 7: Recent penalty ──────────────────────────────────
            const recentPenalty = (recentIds.has(id) || recentIds.has(titleKey)) ? 0.5 : 1.0;

            // ── Signal 8: Struggle bonus ──────────────────────────────────
            // Problems user has attempted many times but not solved → suggest easier alternative
            const isStruggle = struggleIds.has(id) || struggleIds.has(titleKey);
            const struggleMultiplier = isStruggle ? 0.3 : 1.0; // de-prioritize repeated struggles

            // ── Weighted hybrid score ────────────────────────────────────
            // Weights: difficulty fit (40%) > frequency (20%) > weakness (20%) > quality (10%) > FAANG (5%) > acceptance (5%)
            const hasWeakTopicData = Object.keys(weakTopics).length > 0;
            const topicWeight = hasWeakTopicData ? 0.20 : 0.05;
            const freqWeight = hasWeakTopicData ? 0.20 : 0.30;

            const raw = (
                0.40 * diffFit +
                freqWeight * freqScore +
                topicWeight * weakScore +
                0.10 * qualityScore +
                0.05 * faangScore +
                0.05 * acceptanceFit
            );
            const hybrid = raw * recentPenalty * struggleMultiplier;

            // ── Reason text ──────────────────────────────────────────────
            let reason;
            if (weakScore > 0.6 && hasWeakTopicData) {
                reason = `Targets your weak area in ${topics[0]} — directly aligned with your interview gaps`;
            } else if (isStruggle) {
                reason = `You have attempted this multiple times — revisit it after building up on ${topics[0] || diff} fundamentals`;
            } else if (freq >= 80 && isFAANG) {
                reason = `Extremely high interview frequency (${freq}%) — asked at top FAANG companies`;
            } else if (diffFit === 1.0 && improving) {
                reason = `Perfect ${diff} level match — you're improving (avg ${Math.round(avgScore)}%), keep the momentum`;
            } else if (diffFit === 1.0) {
                reason = `Ideal ${diff} difficulty for your current level (avg score: ${Math.round(avgScore)}%)`;
            } else {
                reason = `${isFAANG ? 'FAANG-asked ' : ''}${diff} problem with ${Math.round(acceptance)}% acceptance — solid practice`;
            }

            return {
                problemId: String(p.id || ''),
                title,
                difficulty: diff,
                topics: topics.slice(0, 5),
                reason,
                confidenceScore: Math.round(hybrid * 1000) / 1000,
                frequency: freq,
                acceptanceRate: acceptance,
                isFAANG,
                _hybrid: hybrid,
                _diffRank: pRank,
            };
        }).filter(Boolean);

        // ── 5. Guaranteed difficulty distribution ─────────────────────────
        // Ensure the final 10 have a sensible mix, not all-Hard or all-Easy
        // Distribution: when target=Easy → 5E 3M 2H; Medium → 2E 5M 3H; Hard → 1E 3M 6H
        // But always respect the highest-scoring problems within each bucket.
        const diffTarget = {
            Easy:   { Easy: 5, Medium: 3, Hard: 2 },
            Medium: { Easy: 2, Medium: 5, Hard: 3 },
            Hard:   { Easy: 1, Medium: 3, Hard: 6 },
        }[targetDiff] || { Easy: 2, Medium: 5, Hard: 3 };

        const byDiff = { Easy: [], Medium: [], Hard: [] };
        for (const p of scored.sort((a, b) => b._hybrid - a._hybrid)) {
            if (byDiff[p.difficulty] !== undefined) byDiff[p.difficulty].push(p);
        }

        const picks = [];
        for (const [diff, quota] of Object.entries(diffTarget)) {
            picks.push(...byDiff[diff].slice(0, quota));
        }

        // Fill remaining slots from the top scorers not already picked
        const pickedIds = new Set(picks.map(p => p.problemId));
        const overflow = scored.filter(p => !pickedIds.has(p.problemId));
        while (picks.length < 10 && overflow.length) picks.push(overflow.shift());

        // Sort final picks by hybrid score desc and strip internal fields
        const final10 = picks
            .sort((a, b) => b._hybrid - a._hybrid)
            .slice(0, 10)
            .map(({ _hybrid, _diffRank, ...rest }) => rest);


        // ── 6. Build analytics object ─────────────────────────────────────

        const scoreTrend = validInterviews.slice(0, 15).reverse().map(i => ({
            date: i.createdAt ? new Date(i.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '?',
            score: Math.round(i.overallScore || 0),
            difficulty: i.problemDifficulty || 'General',
        }));

        const topicWeaknesses = Object.entries(weakTopics)
            .sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t, c]) => ({ topic: t, score: Math.round(c * 10) / 10 }));
        const topicStrengths  = Object.entries(strongTopics)
            .sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t, c]) => ({ topic: t, score: Math.round(c * 10) / 10 }));

        // Readiness = weighted composite (max 100)
        const solvedScore     = Math.min(1, solvedSet.size / 50) * 20;  // up to 20pts for 50 solved
        const interviewScore  = Math.min(1, totalInterviews / 15) * 25; // up to 25pts for 15 interviews
        const avgScorePoints  = avgScore * 0.45;                         // up to 45pts from avg score
        const trendBonus      = improving ? 10 : 0;                      // 10pt bonus for upward trend
        const readinessScore  = Math.min(100, Math.round(avgScorePoints + solvedScore + interviewScore + trendBonus));

        const analytics = {
            avgScore:          Math.round(avgScore),
            totalInterviews,
            totalSolved:       solvedSet.size,
            totalAttempted:    attemptedSet.size,
            improving,
            recentAvg:         Math.round(recentAvg),
            prevAvg:           Math.round(prevAvg),
            targetDifficulty:  targetDiff,
            solvedByDiff,
            topicStrengths,
            topicWeaknesses,
            scoreTrend,
            readinessScore,
        };

        // ── 7. Write to Firestore ─────────────────────────────────────────
        const recData = {
            uid, items: final10, analytics,
            updatedAt: new Date().toISOString(),
            modelVersion: 'node-v2',
            avgScore: analytics.avgScore,
            targetDifficulty: targetDiff,
        };

        if (adminSDK && adminSDK.apps.length) {
            await adminSDK.firestore().collection('recommendations').doc(uid).set(recData, { merge: false });
        } else {
            await setDoc(doc(db, 'recommendations', uid), recData);
        }

        await setDoc(doc(db, 'ml_jobs', 'global'), { status: 'idle', currentUid: null }, { merge: true });

        res.json({ success: true, uid, count: final10.length, analytics, message: `Generated ${final10.length} recommendations for ${uid}` });

    } catch (err) {
        console.error(`[ML] Trigger failed for ${uid}:`, err);
        try {
            const { db, doc, setDoc } = getFirestore();
            await setDoc(doc(db, 'ml_jobs', 'global'), { status: 'idle', currentUid: null }, { merge: true });
        } catch (_) {}
        res.status(500).json({ error: 'Failed to trigger ML recommendation: ' + err.message, uid });
    }
});

// ─── GET /api/ml/analytics/:uid ──────────────────────────────────────────
// Returns the analytics object stored alongside recommendations

router.get('/analytics/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
        const { db, doc, getDoc } = getFirestore();
        const snap = await getDoc(doc(db, 'recommendations', uid));
        if (!snap.exists()) {
            return res.json({ analytics: null, uid, message: 'No data yet — trigger recommendations first' });
        }
        const data = snap.data();
        res.json({ analytics: data.analytics || null, updatedAt: data.updatedAt, uid });
    } catch (err) {
        console.error(`[ML] Failed to fetch analytics for ${uid}:`, err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});


// ─── POST /api/ml/trigger-all ─────────────────────────────────────────────

router.post('/trigger-all', async (req, res) => {
    try {
        const { db, doc, getDoc } = getFirestore();

        // Check pause + already-running guard
        const jobSnap = await getDoc(doc(db, 'ml_jobs', 'global'));
        if (jobSnap.exists()) {
            const s = jobSnap.data().status;
            if (s === 'paused') return res.status(409).json({ error: 'ML is globally paused.' });
            if (s === 'running') return res.status(409).json({ error: 'An ML batch job is already running.' });
        }

        // Tell Python to run for all users in background
        const mlRes = await fetch(`${ML_SERVICE_URL}/ml/recommend-all`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ triggeredBy: req.body?.triggeredBy || 'admin_trigger_all' }),
            signal: AbortSignal.timeout(10_000), // Just wait until Python acknowledges
        });

        const mlData = await mlRes.json();

        if (!mlRes.ok && mlData.status !== 'already_running') {
            return res.status(500).json({ error: mlData.error || 'Failed to start batch job' });
        }

        res.json({ success: true, message: 'Batch ML recommendation job started.' });
    } catch (err) {
        console.error('[ML] Trigger-all failed:', err);
        res.status(500).json({ error: 'Failed to start batch recommendation job: ' + err.message });
    }
});

// ─── GET /api/recommendations/:uid ───────────────────────────────────────

router.get('/recommendations/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
        const { db, doc, getDoc } = getFirestore();
        const snap = await getDoc(doc(db, 'recommendations', uid));

        if (!snap.exists()) {
            return res.json({ items: [], updatedAt: null, modelVersion: null, uid });
        }

        res.json(snap.data());
    } catch (err) {
        console.error(`[ML] Failed to fetch recommendations for ${uid}:`, err);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

module.exports = router;
