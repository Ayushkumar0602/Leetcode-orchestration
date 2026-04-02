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

router.post('/trigger/:uid', async (req, res) => {
    const { uid } = req.params;
    if (!uid) return res.status(400).json({ error: 'uid required' });

    try {
        // Check if globally paused
        const { db, doc, getDoc, setDoc } = getFirestore();
        const jobSnap = await getDoc(doc(db, 'ml_jobs', 'global'));
        if (jobSnap.exists() && jobSnap.data().status === 'paused') {
            return res.status(409).json({ error: 'ML is globally paused. Resume before triggering.' });
        }

        // Update status to show current UID being processed
        await setDoc(doc(db, 'ml_jobs', 'global'), {
            status: 'running',
            currentUid: uid,
            lastRunAt: new Date().toISOString(),
        }, { merge: true });

        // Call Python ML microservice (fire-and-forget style — wrap response)
        const mlRes = await fetch(`${ML_SERVICE_URL}/ml/recommend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, triggeredBy: req.body?.triggeredBy || 'admin_trigger' }),
            signal: AbortSignal.timeout(120_000), // 2 min timeout
        });

        const mlData = await mlRes.json();

        // Reset status to idle after single-user trigger
        await setDoc(doc(db, 'ml_jobs', 'global'), {
            status: 'idle',
            currentUid: null,
        }, { merge: true });

        if (!mlRes.ok) {
            return res.status(500).json({ error: mlData.error || 'ML microservice error', uid });
        }

        res.json({ success: true, uid, count: mlData.count, message: `Recommendations generated for user ${uid}` });
    } catch (err) {
        console.error(`[ML] Trigger failed for ${uid}:`, err);

        // Reset status on error
        try {
            const { db, doc, setDoc } = getFirestore();
            await setDoc(doc(db, 'ml_jobs', 'global'), { status: 'idle', currentUid: null }, { merge: true });
        } catch (_) {}

        res.status(500).json({ error: 'Failed to trigger ML recommendation: ' + err.message, uid });
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
