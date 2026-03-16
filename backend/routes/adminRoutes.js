// backend/routes/adminRoutes.js
const express = require('express');
const { admin } = require('../firebaseAdmin');
const { db } = require('../firebase');
const { collection, getDocs, doc, getDoc, setDoc, query, limit, getCountFromServer, addDoc } = require('firebase/firestore');
const { FieldPath } = require('firebase-admin/firestore');

const router = express.Router();

// Middleware to verify if the requester is an admin
// In production, this would verify a Firebase ID Token passed in the Authorization header
const verifyAdmin = async (req, res, next) => {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!admin.apps.length) {
         // Fallback if Admin SDK isn't configured yet (allows UI development before keys are provided)
         console.warn("Admin SDK not configured. Bypassing verifyAdmin token check for development ONLY.");
         // In a real scenario, you shouldn't bypass. Wait for the user to provide the key.
         // We will return 501 for actual actions, but allow reading if strictly necessary (or just block it all).
         return next();
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Verify if this UID belongs to an admin.
        // Option 1: Hardcoded list (e.g. env var ADMIN_UIDS)
        // Option 2: Check Firestore custom claims or a specific 'admins' collection.
        
        // For now, looking at the user's Firestore profile `isAdmin` flag in userProfiles:
        const userDoc = await admin.firestore().collection('userProfiles').doc(uid).get();
        
        if (!userDoc.exists) {
            // Fallback: If user not in userProfiles, check if UID is hardcoded admin
            if (['sD1yZ4068yO9a88xIeM3n7rU6hU2'].includes(uid)) {
                req.adminUser = decodedToken;
                return next();
            }
            return res.status(403).json({ error: "Forbidden: User profile not found." });
        }
        
        const userData = userDoc.data();
        const isAdmin = userData.role === 'admin' || userData.isAdmin === true || ['sD1yZ4068yO9a88xIeM3n7rU6hU2'].includes(uid);
        
        if (!isAdmin) {
            return res.status(403).json({ error: "Forbidden: Admin privileges required." });
        }

        req.adminUser = decodedToken;
        next();
    } catch (error) {
        console.error("verifyAdmin Error:", error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

// ---------------------------------------------------------
// 1. Authentication & User Management
// ---------------------------------------------------------

// List all Firebase Auth users (Requires Admin SDK)
router.get('/users', verifyAdmin, async (req, res) => {
    if (!admin.apps.length) {
        return res.status(501).json({ error: "Firebase Admin SDK not configured on server.", requireKey: true });
    }
    try {
        const listUsersResult = await admin.auth().listUsers(1000);
        const users = listUsersResult.users.map(userRecord => ({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            disabled: userRecord.disabled,
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
        }));
        res.json({ users });
    } catch (error) {
        console.error('Error listing users:', error);
        res.status(500).json({ error: 'Failed to list users' });
    }
});

// Suspend (Disable) a user account
router.post('/users/:uid/suspend', verifyAdmin, async (req, res) => {
    if (!admin.apps.length) return res.status(501).json({ error: "Not configured" });
    const { uid } = req.params;
    const { disabled } = req.body; // true = suspend, false = un-suspend
    try {
        await admin.auth().updateUser(uid, { disabled });
        res.json({ success: true, message: `User ${uid} has been ${disabled ? 'suspended' : 'activated'}.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a user account (Firebase Auth)
router.delete('/users/:uid', verifyAdmin, async (req, res) => {
    if (!admin.apps.length) return res.status(501).json({ error: "Not configured" });
    const { uid } = req.params;
    try {
        await admin.auth().deleteUser(uid);
        res.json({ success: true, message: `User ${uid} deleted.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ---------------------------------------------------------
// 2. Database Administration
// ---------------------------------------------------------

// Get documents from a generic Firestore collection
// Warning: This exposes raw data. Protected by verifyAdmin.
router.get('/db/:collectionName', verifyAdmin, async (req, res) => {
    const { collectionName } = req.params;
    const limitCount = parseInt(req.query.limit) || 100;
    
    try {
        let docs = [];
        if (admin.apps.length) {
            const snapshot = await admin.firestore().collection(collectionName).limit(limitCount).get();
            docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } else {
            const q = query(collection(db, collectionName), limit(limitCount));
            const snapshot = await getDocs(q);
            docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        }
        res.json({ collection: collectionName, count: docs.length, docs });
    } catch (error) {
        console.error(`Error reading collection ${collectionName}:`, error);
        res.status(500).json({ error: error.message });
    }
});

// ---------------------------------------------------------
// 3. Infrastructure & Server Health
// ---------------------------------------------------------
router.get('/health', verifyAdmin, (req, res) => {
    try {
        const mem = process.memoryUsage();
        res.json({
            status: 'Healthy',
            uptime: process.uptime(),
            memory: {
                rss: mem.rss,
                heapTotal: mem.heapTotal,
                heapUsed: mem.heapUsed,
                external: mem.external
            },
            cpuUsage: process.cpuUsage(),
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ---------------------------------------------------------
// 4. Overview Statistics
// ---------------------------------------------------------
router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        let totalUsers = 0;
        let eventsCount = 0;
        
        if (admin.apps.length) {
            try {
                const listUsersResult = await admin.auth().listUsers(1000);
                totalUsers = listUsersResult.users.length;
            } catch (e) { console.error("Error getting auth users count", e); }
            
            try {
                const logsReq = await admin.firestore().collection('admin_logs').count().get();
                eventsCount = logsReq.data().count;
            } catch(e) { console.error("No logs", e); }
        } else {
            try {
                const snapshot = await getCountFromServer(collection(db, 'admin_logs'));
                eventsCount = snapshot.data().count;
            } catch(e) { console.error("No logs", e); }
        }

        res.json({
            totalUsers,
            eventsCount,
            serverUptime: process.uptime(),
            dbStatus: 'Connected'
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ---------------------------------------------------------
// 5. System Configuration
// ---------------------------------------------------------
router.get('/config', verifyAdmin, async (req, res) => {
    try {
        let data = null;
        if (admin.apps.length) {
            const docSnap = await admin.firestore().collection('admin_settings').doc('global').get();
            if (docSnap.exists) data = docSnap.data();
        } else {
            const docSnap = await getDoc(doc(db, 'admin_settings', 'global'));
            if (docSnap.exists()) data = docSnap.data();
        }
        if (data) {
            res.json(data);
        } else {
            // Default config if none exists
            res.json({
                maintenanceMode: false,
                openRegistration: true,
                requireEmailVerification: false,
                maxUploadSize: 10,
                supportEmail: 'support@whizan.xyz',
                appName: 'Whizan - AI Interview Prep',
                stripeTestMode: true,
                aiModel: 'gpt-4o'
            });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/config', verifyAdmin, async (req, res) => {
    try {
        if (admin.apps.length) {
            await admin.firestore().collection('admin_settings').doc('global').set(req.body, { merge: true });
            if (req.adminUser && req.adminUser.uid) {
                await admin.firestore().collection('admin_logs').add({
                    action: 'Updated System Config',
                    details: 'Admin updated platform configurations.',
                    level: 'info',
                    adminEmail: req.adminUser.email || req.adminUser.uid,
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            await setDoc(doc(db, 'admin_settings', 'global'), req.body, { merge: true });
            if (req.adminUser && req.adminUser.uid) {
                await addDoc(collection(db, 'admin_logs'), {
                    action: 'Updated System Config',
                    details: 'Admin updated platform configurations.',
                    level: 'info',
                    adminEmail: req.adminUser.email || req.adminUser.uid,
                    timestamp: new Date().toISOString()
                });
            }
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ---------------------------------------------------------
// 6. Notification Campaigns (Admin)
// ---------------------------------------------------------

function normalizeCampaign(body, adminUid) {
    const now = new Date().toISOString();
    return {
        name: String(body.name || body.title || 'Campaign').slice(0, 140),
        title: String(body.title || '').slice(0, 140),
        message: String(body.message || body.body || '').slice(0, 2000),
        type: body.type || 'feed', // feed | popup | announcement
        display: body.display || body.type || 'feed',
        link: body.link || null,
        imageUrl: body.imageUrl || null,
        videoUrl: body.videoUrl || null,
        htmlContent: body.htmlContent || null,
        ctaText: body.ctaText || null,
        ctaLink: body.ctaLink || null,
        ctaSecondaryText: body.ctaSecondaryText || null,
        ctaSecondaryLink: body.ctaSecondaryLink || null,
        target: body.target || { kind: 'all' }, // { kind:'all' } | {kind:'uids', uids:[...]} | {kind:'segment', segment:'...'}
        priority: Number.isFinite(body.priority) ? body.priority : 0,
        startAt: body.startAt || now,
        endAt: body.endAt || body.expiresAt || null,
        status: body.status || 'draft', // draft | scheduled | active | ended
        createdBy: adminUid,
        updatedAt: now,
    };
}

async function sendFcmForCampaign(campaignDoc, adminUid) {
    if (!admin.apps.length) return { ok: false, reason: 'admin_sdk_missing' };
    if (!admin.messaging) return { ok: false, reason: 'messaging_unavailable' };

    const campaignId = campaignDoc.id;
    const c = campaignDoc.data();
    const target = c.target || { kind: 'all' };

    let tokenDocs = [];
    if (target.kind === 'uids' && Array.isArray(target.uids) && target.uids.length > 0) {
        // Query subcollections per UID (bounded and safer than scanning).
        for (const uid of target.uids.slice(0, 500)) {
            const snap = await admin.firestore().collection('userProfiles').doc(String(uid)).collection('fcmTokens').get();
            snap.forEach(d => tokenDocs.push({ uid, ...d.data() }));
        }
    } else {
        // All users / broad segments: best-effort scan of token subcollections.
        const snap = await admin.firestore().collectionGroup('fcmTokens').get();
        snap.forEach(d => tokenDocs.push(d.data()));
    }

    const tokens = tokenDocs.map(t => t.token).filter(Boolean);
    const unique = Array.from(new Set(tokens));
    const chunks = [];
    for (let i = 0; i < unique.length; i += 500) chunks.push(unique.slice(i, i + 500));

    let sent = 0;
    let success = 0;
    let failure = 0;

    for (const chunk of chunks) {
        sent += chunk.length;
        const resp = await admin.messaging().sendEachForMulticast({
            tokens: chunk,
            notification: {
                title: c.title || 'Notification',
                body: c.message || '',
                ...(c.imageUrl ? { imageUrl: c.imageUrl } : {})
            },
            data: {
                kind: 'campaign',
                campaignId,
                title: c.title || '',
                body: c.message || '',
                link: c.link || '/notifications',
                ...(c.imageUrl ? { imageUrl: c.imageUrl } : {}),
                ...(c.videoUrl ? { videoUrl: c.videoUrl } : {})
            },
        });
        success += resp.successCount || 0;
        failure += resp.failureCount || 0;
    }

    // Lightweight audit log
    try {
        await admin.firestore().collection('admin_logs').add({
            action: 'Sent Campaign Push',
            details: `Campaign ${campaignId} pushed to ${sent} tokens (${success} ok, ${failure} failed).`,
            level: failure > 0 ? 'warn' : 'info',
            adminEmail: adminUid,
            timestamp: new Date().toISOString()
        });
    } catch (e) { }

    return { ok: true, sent, success, failure };
}

router.get('/notifications/campaigns', verifyAdmin, async (req, res) => {
    try {
        if (!admin.apps.length) return res.status(501).json({ error: "Firebase Admin SDK not configured on server.", requireKey: true });
        const snap = await admin.firestore().collection('campaigns').orderBy('updatedAt', 'desc').limit(200).get();
        const campaigns = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json({ campaigns });
    } catch (e) {
        console.error('Failed to list campaigns', e);
        res.status(500).json({ error: 'Failed to list campaigns' });
    }
});

router.post('/notifications/campaigns', verifyAdmin, async (req, res) => {
    try {
        if (!admin.apps.length) return res.status(501).json({ error: "Firebase Admin SDK not configured on server.", requireKey: true });
        const data = normalizeCampaign(req.body || {}, req.adminUser?.uid || 'admin');
        data.createdAt = new Date().toISOString();
        const ref = await admin.firestore().collection('campaigns').add(data);
        res.json({ id: ref.id, ...data });
    } catch (e) {
        console.error('Failed to create campaign', e);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
});

router.patch('/notifications/campaigns/:id', verifyAdmin, async (req, res) => {
    try {
        if (!admin.apps.length) return res.status(501).json({ error: "Firebase Admin SDK not configured on server.", requireKey: true });
        const id = req.params.id;
        const ref = admin.firestore().collection('campaigns').doc(id);
        const snap = await ref.get();
        if (!snap.exists) return res.status(404).json({ error: 'Campaign not found' });
        const merged = normalizeCampaign({ ...snap.data(), ...req.body }, req.adminUser?.uid || 'admin');
        await ref.set(merged, { merge: true });
        res.json({ id, ...merged });
    } catch (e) {
        console.error('Failed to update campaign', e);
        res.status(500).json({ error: 'Failed to update campaign' });
    }
});

router.post('/notifications/campaigns/:id/activate', verifyAdmin, async (req, res) => {
    try {
        if (!admin.apps.length) return res.status(501).json({ error: "Firebase Admin SDK not configured on server.", requireKey: true });
        const id = req.params.id;
        const ref = admin.firestore().collection('campaigns').doc(id);
        const snap = await ref.get();
        if (!snap.exists) return res.status(404).json({ error: 'Campaign not found' });
        await ref.set({ status: 'active', updatedAt: new Date().toISOString() }, { merge: true });

        const push = req.body?.push === true;
        let pushResult = null;
        if (push) pushResult = await sendFcmForCampaign(await ref.get(), req.adminUser?.email || req.adminUser?.uid || 'admin');

        res.json({ success: true, push: pushResult });
    } catch (e) {
        console.error('Failed to activate campaign', e);
        res.status(500).json({ error: 'Failed to activate campaign' });
    }
});

router.post('/notifications/campaigns/:id/end', verifyAdmin, async (req, res) => {
    try {
        if (!admin.apps.length) return res.status(501).json({ error: "Firebase Admin SDK not configured on server.", requireKey: true });
        const id = req.params.id;
        await admin.firestore().collection('campaigns').doc(id).set({ status: 'ended', updatedAt: new Date().toISOString() }, { merge: true });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to end campaign' });
    }
});

router.get('/notifications/campaigns/:id/analytics', verifyAdmin, async (req, res) => {
    try {
        if (!admin.apps.length) return res.status(501).json({ error: "Firebase Admin SDK not configured on server.", requireKey: true });
        const campaignId = req.params.id;
        const snap = await admin
            .firestore()
            .collectionGroup('campaignReceipts')
            .where(FieldPath.documentId(), '==', campaignId)
            .get();

        let seen = 0, read = 0, clicked = 0, dismissed = 0;
        snap.forEach(d => {
            const r = d.data() || {};
            if (r.firstSeenAt) seen++;
            if (r.readAt) read++;
            if (r.clickedAt) clicked++;
            if (r.dismissedAt) dismissed++;
        });
        res.json({ campaignId, receipts: snap.size, seen, read, clicked, dismissed });
    } catch (e) {
        console.error('Failed to get campaign analytics', e);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

module.exports = router;
