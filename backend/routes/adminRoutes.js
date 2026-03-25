// backend/routes/adminRoutes.js
const express = require('express');
const { admin } = require('../firebaseAdmin');
const { db } = require('../firebase');
const { rtdb } = require('../firebase');
const { collection, getDocs, doc, getDoc, setDoc, query, limit, getCountFromServer, addDoc, deleteDoc, updateDoc } = require('firebase/firestore');
const { FieldPath } = require('firebase-admin/firestore');
const { ref: rtdbRef, get: rtdbGet } = require('firebase/database');
const { optimizeCourseContent } = require('../ai');

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

        // Check Custom Claims first (Zero DB Hits)
        if (['sD1yZ4068yO9a88xIeM3n7rU6hU2'].includes(uid) || decodedToken.admin === true || decodedToken.isAdmin === true) {
            req.adminUser = decodedToken;
            return next();
        }
        
        // Fallback: Check Firestore profile. 
        // If they are an admin, we will stamp their Firebase Auth with a custom claim 
        // so future requests scale effortlessly without Firestore reads.
        const userDoc = await admin.firestore().collection('userProfiles').doc(uid).get();
        
        if (!userDoc.exists) {
            return res.status(403).json({ error: "Forbidden: User profile not found." });
        }
        
        const userData = userDoc.data();
        const isAdmin = userData.role === 'admin' || userData.isAdmin === true;
        
        if (!isAdmin) {
            return res.status(403).json({ error: "Forbidden: Admin privileges required." });
        }

        // Attach custom claim for future requests
        try {
            const { aud, auth_time, exp, iat, iss, sub, uid: tokenUid, firebase, ...customClaims } = decodedToken;
            await admin.auth().setCustomUserClaims(uid, { ...customClaims, isAdmin: true });
        } catch (claimErr) {
            console.warn("Could not set custom claim for admin", claimErr);
        }

        req.adminUser = decodedToken;
        next();
    } catch (error) {
        console.error("verifyAdmin Error:", error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

// ---------------------------------------------------------
// Global Cache for Dashboard Stats
// ---------------------------------------------------------
let statsCache = null;
let statsCacheTimestamp = 0;
const STATS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ---------------------------------------------------------
// 1. Authentication & User Management
// ---------------------------------------------------------

// List all Firebase Auth users (Requires Admin SDK)
router.get('/users', verifyAdmin, async (req, res) => {
    if (!admin.apps.length) {
        return res.status(501).json({ error: "Firebase Admin SDK not configured on server.", requireKey: true });
    }
    try {
        const pageToken = req.query.pageToken;
        const limitCount = Math.min(parseInt(req.query.limit) || 1000, 1000);
        const searchQuery = req.query.search ? String(req.query.search).trim() : null;

        if (searchQuery) {
            // Attempt exact O(1) matches before falling back to listing
            let userRecord = null;
            try {
                if (searchQuery.includes('@')) {
                    userRecord = await admin.auth().getUserByEmail(searchQuery);
                } else {
                    userRecord = await admin.auth().getUser(searchQuery).catch(() => null);
                }
            } catch (e) {
                // Ignore if not found by exact match
            }
            if (userRecord) {
                return res.json({
                    users: [{
                        uid: userRecord.uid,
                        email: userRecord.email,
                        displayName: userRecord.displayName,
                        photoURL: userRecord.photoURL,
                        disabled: userRecord.disabled,
                        creationTime: userRecord.metadata.creationTime,
                        lastSignInTime: userRecord.metadata.lastSignInTime,
                    }],
                    nextPageToken: null,
                });
            }

            // Fallback for partial/name searches: search within a limited list. 
            // Warning: Admin Auth doesn't support substring 'name' searches natively. 
            // In a fully scaled system, we would query Firestore 'userProfiles' or Algolia here.
            // For now, if exact matches fail, we fallback to a standard list to let client filter if it really wants to.
        }

        const listUsersResult = await admin.auth().listUsers(limitCount, pageToken);
        const users = listUsersResult.users.map(userRecord => ({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            disabled: userRecord.disabled,
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
        }));
        res.json({ users, nextPageToken: listUsersResult.pageToken });
    } catch (error) {
        console.error('Error listing users:', error);
        res.status(500).json({ error: 'Failed to list users' });
    }
});

// ---------------------------------------------------------
// 1.b) AI Optimization for YouTube Courses
// ---------------------------------------------------------

router.post('/optimize-text', verifyAdmin, async (req, res) => {
    try {
        const { text, field } = req.body;
        if (!text || !field) {
            return res.status(400).json({ error: 'Text and field are required.' });
        }
        const optimizedText = await optimizeCourseContent(text, field);
        res.json({ optimizedText });
    } catch (error) {
        console.error('Text Optimization Error:', error);
        res.status(500).json({ error: 'AI optimization failed: ' + error.message });
    }
});

// ---------------------------------------------------------
// 1.c) YouTube Courses Management
// ---------------------------------------------------------

// One-time slug backfill: patches all existing courses missing a slug field
router.post('/courses/backfill-slugs', verifyAdmin, async (req, res) => {
    try {
        let patched = 0;
        if (admin.apps.length) {
            const snap = await admin.firestore().collection('youtubecourses').get();
            const batch = admin.firestore().batch();
            snap.docs.forEach(d => {
                const data = d.data();
                if (!data.slug && data.title) {
                    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    batch.update(d.ref, { slug });
                    patched++;
                }
            });
            if (patched > 0) await batch.commit();
        } else {
            const snap = await getDocs(collection(db, 'youtubecourses'));
            for (const d of snap.docs) {
                const data = d.data();
                if (!data.slug && data.title) {
                    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    await setDoc(doc(db, 'youtubecourses', d.id), { slug }, { merge: true });
                    patched++;
                }
            }
        }
        res.json({ success: true, patched, message: `Backfilled slugs for ${patched} course(s).` });
    } catch (error) {
        res.status(500).json({ error: 'Backfill failed: ' + error.message });
    }
});

router.get('/courses', verifyAdmin, async (req, res) => {
    try {
        let docs = [];
        if (admin.apps.length) {
            const snapshot = await admin.firestore().collection('youtubecourses').orderBy('createdAt', 'desc').get();
            docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } else {
            const snapshot = await getDocs(query(collection(db, 'youtubecourses')));
            docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        res.json({ courses: docs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses: ' + error.message });
    }
});

router.post('/courses', verifyAdmin, async (req, res) => {
    try {
        const data = { ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        // Always generate slug from title — this is the canonical approach
        if (data.title) {
            data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }
        
        if (admin.apps.length) {
            const ref = await admin.firestore().collection('youtubecourses').add(data);
            res.json({ success: true, id: ref.id, slug: data.slug });
        } else {
            const ref = await addDoc(collection(db, 'youtubecourses'), data);
            res.json({ success: true, id: ref.id, slug: data.slug });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to create course: ' + error.message });
    }
});

router.patch('/courses/:id', verifyAdmin, async (req, res) => {
    try {
        const data = { ...req.body, updatedAt: new Date().toISOString() };
        // Always re-derive slug from title to keep it in sync
        if (data.title) {
            data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        if (admin.apps.length) {
            await admin.firestore().collection('youtubecourses').doc(req.params.id).set(data, { merge: true });
        } else {
            await setDoc(doc(db, 'youtubecourses', req.params.id), data, { merge: true });
        }
        res.json({ success: true, slug: data.slug });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update course: ' + error.message });
    }
});

router.delete('/courses/:id', verifyAdmin, async (req, res) => {
    try {
        if (admin.apps.length) {
            await admin.firestore().collection('youtubecourses').doc(req.params.id).delete();
        } else {
            await deleteDoc(doc(db, 'youtubecourses', req.params.id));
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete course: ' + error.message });
    }
});

// Course Materials Management
router.get('/courses/:id/materials', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        let docs = [];
        if (admin.apps.length) {
            const snapshot = await admin.firestore().collection('course_materials').where('courseId', '==', id).orderBy('uploadedAt', 'desc').get();
            docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } else {
            const snapshot = await getDocs(query(collection(db, 'course_materials'), where('courseId', '==', id)));
            docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        }
        res.json({ materials: docs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch course materials: ' + error.message });
    }
});

router.post('/courses/:id/materials', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const data = { 
            ...req.body, 
            courseId: id,
            uploadedAt: new Date().toISOString() 
        };
        
        if (admin.apps.length) {
            const ref = await admin.firestore().collection('course_materials').add(data);
            res.json({ success: true, id: ref.id, material: { id: ref.id, ...data } });
        } else {
            const ref = await addDoc(collection(db, 'course_materials'), data);
            res.json({ success: true, id: ref.id, material: { id: ref.id, ...data } });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to add course material: ' + error.message });
    }
});

router.delete('/courses/:id/materials/:materialId', verifyAdmin, async (req, res) => {
    try {
        const { id, materialId } = req.params;

        // ── Step 1: Fetch the material doc to get its storage URL ──────────────
        let materialData = null;
        try {
            if (admin.apps.length) {
                const snap = await admin.firestore().collection('course_materials').doc(materialId).get();
                if (snap.exists) materialData = snap.data();
            } else {
                const snap = await getDoc(doc(db, 'course_materials', materialId));
                if (snap.exists()) materialData = snap.data();
            }
        } catch (fetchErr) {
            console.warn('Could not fetch material before delete:', fetchErr.message);
        }

        // ── Step 2: Delete from Supabase Storage bucket ────────────────────────
        if (materialData?.url) {
            try {
                const SUPABASE_URL    = 'https://vnnkhcqswoeqnghztpvh.supabase.co';
                const SUPABASE_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZubmtoY3Fzd29lcW5naHp0cHZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzA5NzQxNiwiZXhwIjoyMDU4NjczNDE2fQ.oB12xaGIBkJEX1fwWaaxhzZKPHTJdFt1b5BaRIWBF2c'; // service_role key
                const BUCKET          = 'course_material';
                const storageBase     = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

                // Extract the storage key from the public URL
                let rawUrl = materialData.url.split('?')[0]; // strip query params
                let objectKey = null;
                if (rawUrl.includes(`/object/public/${BUCKET}/`)) {
                    objectKey = decodeURIComponent(rawUrl.split(`/object/public/${BUCKET}/`)[1]);
                }

                if (objectKey) {
                    const deleteRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(objectKey).replace(/%2F/g, '/')}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${SUPABASE_KEY}`,
                            'Content-Type': 'application/json',
                        }
                    });
                    if (!deleteRes.ok) {
                        const errBody = await deleteRes.text().catch(() => '');
                        console.warn(`Supabase storage delete warning (${deleteRes.status}):`, errBody);
                        // Non-fatal — proceed to delete Firestore doc anyway
                    } else {
                        console.log(`Deleted from Supabase bucket: ${objectKey}`);
                    }
                }
            } catch (storageErr) {
                console.warn('Supabase storage delete failed (non-fatal):', storageErr.message);
                // Non-fatal — still delete the Firestore record
            }
        }

        // ── Step 3: Delete Firestore document ─────────────────────────────────
        if (admin.apps.length) {
            await admin.firestore().collection('course_materials').doc(materialId).delete();
        } else {
            await deleteDoc(doc(db, 'course_materials', materialId));
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete course material: ' + error.message });
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
    const limitCount = Math.min(parseInt(req.query.limit) || 100, 500);
    const offsetCount = parseInt(req.query.offset) || 0;
    const startAfterDocId = req.query.startAfterDocId ? String(req.query.startAfterDocId) : null;
    
    try {
        let docs = [];
        const whereField = req.query.whereField ? String(req.query.whereField) : null;
        const whereOp = req.query.whereOp ? String(req.query.whereOp) : null;
        const whereValueRaw = req.query.whereValue;
        const whereType = req.query.whereType ? String(req.query.whereType) : 'string'; // string|number|boolean|null|json
        const orderByField = req.query.orderBy ? String(req.query.orderBy) : null;
        const orderDir = (req.query.orderDir === 'asc' ? 'asc' : 'desc');

        const parseValue = () => {
            if (whereValueRaw === undefined) return undefined;
            if (whereType === 'number') return Number(whereValueRaw);
            if (whereType === 'boolean') return String(whereValueRaw) === 'true';
            if (whereType === 'null') return null;
            if (whereType === 'json') {
                try { return JSON.parse(String(whereValueRaw)); } catch { return String(whereValueRaw); }
            }
            return String(whereValueRaw);
        };
        const whereValue = parseValue();

        if (admin.apps.length) {
            let q = admin.firestore().collection(collectionName);
            if (whereField && whereOp && whereValueRaw !== undefined) {
                q = q.where(whereField, whereOp, whereValue);
            }
            if (orderByField) {
                q = q.orderBy(orderByField, orderDir);
            }
            if (startAfterDocId) {
                const docSnap = await admin.firestore().collection(collectionName).doc(startAfterDocId).get();
                if (docSnap.exists) {
                    q = q.startAfter(docSnap);
                }
            } else if (offsetCount > 0) {
                q = q.offset(offsetCount);
            }
            const snapshot = await q.limit(limitCount).get();
            docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        } else {
            // Client SDK fallback: supports only no-filter queries here.
            // (Most admin actions require Admin SDK on production server.)
            const q = query(collection(db, collectionName), limit(limitCount));
            const snapshot = await getDocs(q);
            docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        }
        res.json({ collection: collectionName, count: docs.length, offset: offsetCount, docs });
    } catch (error) {
        console.error(`Error reading collection ${collectionName}:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Get a single document
router.get('/db/:collectionName/:docId', verifyAdmin, async (req, res) => {
    const { collectionName, docId } = req.params;
    try {
        if (admin.apps.length) {
            const snap = await admin.firestore().collection(collectionName).doc(docId).get();
            if (!snap.exists) return res.status(404).json({ error: 'Doc not found' });
            return res.json({ id: snap.id, ...snap.data() });
        }
        const snap = await getDoc(doc(db, collectionName, docId));
        if (!snap.exists()) return res.status(404).json({ error: 'Doc not found' });
        return res.json({ id: snap.id, ...snap.data() });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Create a document (auto-id or specified via docId)
router.post('/db/:collectionName', verifyAdmin, async (req, res) => {
    const { collectionName } = req.params;
    const docId = req.body?.id ? String(req.body.id) : null;
    const data = req.body?.data && typeof req.body.data === 'object' ? req.body.data : req.body;
    try {
        if (admin.apps.length) {
            const col = admin.firestore().collection(collectionName);
            const ref = docId ? col.doc(docId) : col.doc();
            await ref.set(data, { merge: false });
            return res.json({ success: true, id: ref.id });
        }
        if (docId) {
            await setDoc(doc(db, collectionName, docId), data, { merge: false });
            return res.json({ success: true, id: docId });
        }
        const ref = await addDoc(collection(db, collectionName), data);
        return res.json({ success: true, id: ref.id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update a document (merge)
router.patch('/db/:collectionName/:docId', verifyAdmin, async (req, res) => {
    const { collectionName, docId } = req.params;
    const data = req.body?.data && typeof req.body.data === 'object' ? req.body.data : req.body;
    try {
        if (admin.apps.length) {
            await admin.firestore().collection(collectionName).doc(docId).set(data, { merge: true });
            return res.json({ success: true });
        }
        await setDoc(doc(db, collectionName, docId), data, { merge: true });
        return res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete a document
router.delete('/db/:collectionName/:docId', verifyAdmin, async (req, res) => {
    const { collectionName, docId } = req.params;
    try {
        if (admin.apps.length) {
            await admin.firestore().collection(collectionName).doc(docId).delete();
            return res.json({ success: true });
        }
        await deleteDoc(doc(db, collectionName, docId));
        return res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Detailed user view (Auth + Firestore profile + RTDB connections/requests)
router.get('/users/:uid/detail', verifyAdmin, async (req, res) => {
    const { uid } = req.params;
    if (!admin.apps.length) {
        return res.status(501).json({ error: "Firebase Admin SDK not configured on server.", requireKey: true });
    }
    try {
        const userRecord = await admin.auth().getUser(uid);
        const profileSnap = await admin.firestore().collection('userProfiles').doc(uid).get();

        const connectionsSnap = await admin.firestore().collection('connections').doc(uid).get().catch(() => null);
        // RTDB: connectRequests/{uid}
        const reqSnap = await rtdbGet(rtdbRef(rtdb, `connectRequests/${uid}`)).catch(() => null);

        res.json({
            auth: {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                photoURL: userRecord.photoURL,
                disabled: userRecord.disabled,
                metadata: userRecord.metadata,
                customClaims: userRecord.customClaims || {},
                providerData: userRecord.providerData || [],
            },
            profile: profileSnap.exists ? profileSnap.data() : null,
            connections: connectionsSnap && connectionsSnap.exists ? connectionsSnap.data() : null,
            connectRequests: reqSnap && reqSnap.exists() ? reqSnap.val() : null,
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update user profile + auth fields
router.patch('/users/:uid/detail', verifyAdmin, async (req, res) => {
    const { uid } = req.params;
    if (!admin.apps.length) {
        return res.status(501).json({ error: "Firebase Admin SDK not configured on server.", requireKey: true });
    }
    const authPatch = req.body?.auth && typeof req.body.auth === 'object' ? req.body.auth : null;
    const profilePatch = req.body?.profile && typeof req.body.profile === 'object' ? req.body.profile : null;
    try {
        if (authPatch) {
            const allowed = {};
            if (authPatch.displayName !== undefined) allowed.displayName = String(authPatch.displayName);
            if (authPatch.photoURL !== undefined) allowed.photoURL = String(authPatch.photoURL);
            if (authPatch.disabled !== undefined) allowed.disabled = !!authPatch.disabled;
            if (authPatch.email !== undefined) allowed.email = String(authPatch.email);
            await admin.auth().updateUser(uid, allowed);
        }
        if (profilePatch) {
            await admin.firestore().collection('userProfiles').doc(uid).set(profilePatch, { merge: true });
        }
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Full user data (Auth + multiple Firestore collections + RTDB)
router.get('/users/:uid/full', verifyAdmin, async (req, res) => {
    const { uid } = req.params;
    if (!admin.apps.length) {
        return res.status(501).json({ error: "Firebase Admin SDK not configured on server.", requireKey: true });
    }
    try {
        const afs = admin.firestore();

        const [userRecord, profileSnap] = await Promise.all([
            admin.auth().getUser(uid),
            afs.collection('userProfiles').doc(uid).get(),
        ]);

        // Firestore collections keyed by userId (best-effort, bounded)
        const [interviewsSnap, submissionsSnap, listsSnap, notificationsSnap, receiptsSnap] = await Promise.all([
            afs.collection('interviews').where('userId', '==', String(uid)).limit(200).get().catch(() => ({ docs: [] })),
            afs.collection('submissions').where('userId', '==', String(uid)).limit(200).get().catch(() => ({ docs: [] })),
            afs.collection('lists').where('userId', '==', String(uid)).limit(200).get().catch(() => ({ docs: [] })),
            afs.collection('users').doc(uid).collection('notifications').orderBy('createdAt', 'desc').limit(200).get().catch(() => ({ docs: [] })),
            afs.collection('users').doc(uid).collection('campaignReceipts').limit(200).get().catch(() => ({ docs: [] })),
        ]);

        // RTDB bits
        const [sessionsSnap, connectReqSnap, connectionsSnap] = await Promise.all([
            rtdbGet(rtdbRef(rtdb, `users/${uid}/sessions`)).catch(() => null),
            rtdbGet(rtdbRef(rtdb, `connectRequests/${uid}`)).catch(() => null),
            rtdbGet(rtdbRef(rtdb, `connections/${uid}`)).catch(() => null),
        ]);

        const interviews = (interviewsSnap.docs || []).map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        const submissions = (submissionsSnap.docs || []).map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0));
        const lists = (listsSnap.docs || []).map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
        const notifications = (notificationsSnap.docs || []).map(d => ({ id: d.id, ...d.data() }));
        const campaignReceipts = (receiptsSnap.docs || []).map(d => ({ id: d.id, ...d.data() }));

        res.json({
            auth: {
                uid: userRecord.uid,
                email: userRecord.email,
                emailVerified: userRecord.emailVerified,
                displayName: userRecord.displayName,
                photoURL: userRecord.photoURL,
                disabled: userRecord.disabled,
                metadata: userRecord.metadata,
                providerData: userRecord.providerData || [],
                customClaims: userRecord.customClaims || {},
            },
            userProfiles: {
                id: uid,
                data: profileSnap.exists ? profileSnap.data() : null,
            },
            interviews,
            submissions,
            lists,
            notifications,
            campaignReceipts,
            rtdb: {
                sessions: sessionsSnap?.exists() ? sessionsSnap.val() : null,
                connectRequests: connectReqSnap?.exists() ? connectReqSnap.val() : null,
                connections: connectionsSnap?.exists() ? connectionsSnap.val() : null,
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.patch('/users/:uid/full', verifyAdmin, async (req, res) => {
    const { uid } = req.params;
    if (!admin.apps.length) {
        return res.status(501).json({ error: "Firebase Admin SDK not configured on server.", requireKey: true });
    }
    try {
        const authPatch = req.body?.auth && typeof req.body.auth === 'object' ? req.body.auth : null;
        const profilePatch = req.body?.userProfiles && typeof req.body.userProfiles === 'object'
            ? (req.body.userProfiles.data || req.body.userProfiles)
            : (req.body?.profile && typeof req.body.profile === 'object' ? req.body.profile : null);

        if (authPatch) {
            const allowed = {};
            if (authPatch.displayName !== undefined) allowed.displayName = String(authPatch.displayName);
            if (authPatch.photoURL !== undefined) allowed.photoURL = String(authPatch.photoURL);
            if (authPatch.disabled !== undefined) allowed.disabled = !!authPatch.disabled;
            if (authPatch.email !== undefined) allowed.email = String(authPatch.email);
            await admin.auth().updateUser(uid, allowed);
        }
        if (profilePatch) {
            await admin.firestore().collection('userProfiles').doc(uid).set(profilePatch, { merge: true });
        }

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
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
        const now = Date.now();
        // Return cached stats if valid, to prevent heavy RTDB / Firestore scans
        if (statsCache && (now - statsCacheTimestamp < STATS_CACHE_TTL_MS)) {
            // Re-merge live memory stats overriding cached memory stats
            statsCache.execLoad = {
                jobsPerMin: global.codeExecStats ? global.codeExecStats.recentJobs.length : 0,
                failedJobs: global.codeExecStats ? global.codeExecStats.failedJobs : 0,
                totalJobs: global.codeExecStats ? global.codeExecStats.totalJobs : 0
            };
            let avgLatency = 0;
            if (global.aiStats && global.aiStats.recentLatencies.length > 0) {
                avgLatency = Math.round(global.aiStats.recentLatencies.reduce((a, b) => a + b, 0) / global.aiStats.recentLatencies.length);
            }
            statsCache.aiUsage = {
                totalCalls: global.aiStats ? global.aiStats.totalCalls : 0,
                failedCalls: global.aiStats ? global.aiStats.failedCalls : 0,
                avgLatencyMs: avgLatency
            };
            statsCache.serverUptime = process.uptime();
            return res.json(statsCache);
        }

        let totalUsers = 0;
        let eventsCount = 0;
        let activeUsers = 0;
        let runningInterviews = 0;
        
        if (admin.apps.length) {
            try {
                const listUsersResult = await admin.auth().listUsers(1000);
                totalUsers = listUsersResult.users.length;
            } catch (e) { console.error("Error getting auth users count", e); }
            
            try {
                const logsReq = await admin.firestore().collection('admin_logs').count().get();
                eventsCount = logsReq.data().count;
            } catch(e) { console.error("No logs", e); }

            try {
                const queryRef = admin.firestore().collection('interviews').where('status', '==', 'in-progress');
                const snap = await queryRef.count().get();
                runningInterviews = snap.data().count;
            } catch(e) {}
        } else {
            try {
                const snapshot = await getCountFromServer(collection(db, 'admin_logs'));
                eventsCount = snapshot.data().count;
            } catch(e) { console.error("No logs", e); }

            try {
                const q = query(collection(db, 'interviews'), where('status', '==', 'in-progress'));
                const snap = await getCountFromServer(q);
                runningInterviews = snap.data().count;
            } catch(e) {}
        }

        try {
            // RTDB count active sessions ($O(1)$ lookup to prevent scaling crashes)
            if (admin.apps.length && admin.database) {
                const countSnap = await admin.database().ref('stats/active_user_count').once('value');
                activeUsers = countSnap.val() || 0;
            } else {
                const countSnap = await rtdbGet(rtdbRef(rtdb, 'stats/active_user_count'));
                activeUsers = countSnap.exists() ? countSnap.val() : 0;
            }
        } catch (e) {
            console.error("Error fetching active users from RTDB", e);
        }

        // Execution Load
        const execLoad = {
            jobsPerMin: global.codeExecStats ? global.codeExecStats.recentJobs.length : 0,
            failedJobs: global.codeExecStats ? global.codeExecStats.failedJobs : 0,
            totalJobs: global.codeExecStats ? global.codeExecStats.totalJobs : 0
        };

        // AI Usage
        let avgLatency = 0;
        if (global.aiStats && global.aiStats.recentLatencies.length > 0) {
            avgLatency = Math.round(global.aiStats.recentLatencies.reduce((a, b) => a + b, 0) / global.aiStats.recentLatencies.length);
        }
        const aiUsage = {
            totalCalls: global.aiStats ? global.aiStats.totalCalls : 0,
            failedCalls: global.aiStats ? global.aiStats.failedCalls : 0,
            avgLatencyMs: avgLatency
        };

        // Live Revenue Calculation
        let activePlans = 0;
        try {
            if (admin.apps.length) {
                const queryRef = admin.firestore().collection('userProfiles').where('plan', '==', 'Blaze');
                const snap = await queryRef.count().get();
                activePlans = snap.data().count;
            } else {
                const q = query(collection(db, 'userProfiles'), where('plan', '==', 'Blaze'));
                const snap = await getCountFromServer(q);
                activePlans = snap.data().count;
            }
        } catch(e) {
            console.error("Error fetching active plans", e);
        }

        const revenueSnapshot = {
            plansActive: activePlans,
            estimatedMRR: activePlans * 30 // Cost is 30 INR per plan
        };

        statsCache = {
            totalUsers,
            eventsCount,
            activeUsers,
            runningInterviews,
            execLoad,
            aiUsage,
            revenueSnapshot,
            serverUptime: process.uptime(),
            dbStatus: 'Connected'
        };
        statsCacheTimestamp = Date.now();

        res.json(statsCache);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Kill active executions
router.post('/executions/kill-all', verifyAdmin, async (req, res) => {
    try {
        let killed = 0;
        if (global.activeExecutions) {
            for (const [id, killFn] of global.activeExecutions.entries()) {
                killFn();
                killed++;
            }
            global.activeExecutions.clear();
        }
        res.json({ success: true, killed });
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

router.post('/maintenance/prune-logs', verifyAdmin, async (req, res) => {
    try {
        if (!admin.apps.length) return res.status(501).json({ error: "Require Admin SDK" });
        const days = parseInt(req.body.days) || 90;
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        
        // Bounded query to avoid memory overload
        const snap = await admin.firestore().collection('admin_logs').where('timestamp', '<', cutoff).limit(500).get();
        const batch = admin.firestore().batch();
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();

        res.json({ success: true, prunedCount: snap.size, moreRemaining: snap.size === 500 });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
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
        target: body.target || { kind: 'all' }, // { kind:'all' } | {kind:'individual', userIds:[...]} | {kind:'group', groups:[...]}
        targetPage: body.targetPage || '',
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
    if (target.kind === 'individual' && Array.isArray(target.userIds) && target.userIds.length > 0) {
        // Query global collection by UID (fast and bounded).
        for (const uid of target.userIds.slice(0, 500)) {
            const snap = await admin.firestore().collection('global_fcm_tokens').where('uid', '==', String(uid)).get();
            snap.forEach(d => tokenDocs.push({ uid, ...d.data() }));
        }
    } else if (target.kind === 'group' && Array.isArray(target.groups) && target.groups.length > 0) {
        // Fetch all profiles to filter by plan/role
        const profilesSnap = await admin.firestore().collection('userProfiles').get();
        const validUids = new Set();
        profilesSnap.forEach(doc => {
            const data = doc.data() || {};
            const plan = (data.plan || 'free').toLowerCase();
            const role = (data.role || 'user').toLowerCase();
            const isAdmin = data.isAdmin === true;
            const isBeta = data.isBeta === true;
            let match = false;
            
            target.groups.forEach(g => {
                const group = String(g).toLowerCase();
                if (plan === group || role === group) match = true;
                if (group === 'admin' && isAdmin) match = true;
                if (group === 'beta' && isBeta) match = true;
            });

            if (match) validUids.add(doc.id);
        });

        // Now fetch all tokens and filter by validUids
        const snap = await admin.firestore().collection('global_fcm_tokens').get();
        snap.forEach(d => {
            const data = d.data();
            if (data.uid && validUids.has(data.uid)) {
                tokenDocs.push(data);
            }
        });
    } else if (target.kind === 'all') {
        // Broad campaigns: single scan of flattened list.
        const snap = await admin.firestore().collection('global_fcm_tokens').get();
        snap.forEach(d => tokenDocs.push(d.data()));
    } else {
        console.warn('Unknown or empty campaign target:', target);
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
                targetPage: c.targetPage || '',
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

router.delete('/notifications/campaigns/:id', verifyAdmin, async (req, res) => {
    try {
        if (!admin.apps.length) return res.status(501).json({ error: "Firebase Admin SDK not configured on server.", requireKey: true });
        const id = req.params.id;
        await admin.firestore().collection('campaigns').doc(id).delete();
        res.json({ success: true });
    } catch (e) {
        console.error('Failed to delete campaign', e);
        res.status(500).json({ error: 'Failed to delete campaign' });
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

        // Fast path: use atomic counters directly
        const campSnap = await admin.firestore().collection('campaigns').doc(campaignId).get();
        const counters = campSnap.data()?.counters;
        
        if (counters) {
            return res.json({ 
                campaignId, 
                receipts: (counters.seen||0) + (counters.read||0) + (counters.clicked||0) + (counters.dismissed||0), 
                seen: counters.seen || 0, 
                read: counters.read || 0, 
                clicked: counters.clicked || 0, 
                dismissed: counters.dismissed || 0 
            });
        }

        // Legacy/Fallback Path: expensive collectionGroup scan for old campaigns
        const snap = await admin
            .firestore()
            .collectionGroup('campaignReceipts')
            .where(admin.firestore.FieldPath.documentId(), '==', campaignId)
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

// ---------------------------------------------------------
// 7. Question & Test Case Management (Admin)
// ---------------------------------------------------------

router.post('/problems/:id/versions', verifyAdmin, async (req, res) => {
    try {
        if (!admin.apps.length) return res.status(501).json({ error: "Require Admin SDK" });
        const { id } = req.params;
        const problemData = req.body.data || req.body;
        
        // Save current snapshot to versions subcollection
        const versionRef = admin.firestore().collection('problems').doc(id).collection('versions').doc();
        await versionRef.set({
            ...problemData,
            versionCreatedAt: new Date().toISOString(),
            versionCreatedBy: req.adminUser?.email || req.adminUser?.uid || 'admin'
        });
        
        res.json({ success: true, versionId: versionRef.id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/problems/:id/versions', verifyAdmin, async (req, res) => {
    try {
        if (!admin.apps.length) return res.status(501).json({ error: "Require Admin SDK" });
        const { id } = req.params;
        const snap = await admin.firestore().collection('problems').doc(id).collection('versions')
            .orderBy('versionCreatedAt', 'desc').limit(20).get();
        const versions = snap.docs.map(d => ({ versionId: d.id, ...d.data() }));
        res.json({ versions });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/problems/:id/regenerate', verifyAdmin, async (req, res) => {
    try {
        if (!admin.apps.length) return res.status(501).json({ error: "Require Admin SDK" });
        const { instruction, originalData } = req.body;
        if (!instruction || !originalData) return res.status(400).json({ error: "Missing instruction or originalData" });

        const { regenerateProblemData } = require('../ai');
        const newData = await regenerateProblemData(instruction, originalData);
        res.json({ success: true, data: newData });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
