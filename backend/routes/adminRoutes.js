// backend/routes/adminRoutes.js
const express = require('express');
const { admin } = require('../firebaseAdmin');
const { db } = require('../firebase');
const { collection, getDocs } = require('firebase/firestore');

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
        
        // For now, looking at the user's Firestore profile `isAdmin` flag:
        // Because the client SDK is already imported in server.js, we can also use admin SDK db
        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
            return res.status(403).json({ error: "Forbidden: User not found." });
        }
        
        const userData = userDoc.data();
        if (userData.role !== 'admin' && userData.isAdmin !== true && !['sD1yZ4068yO9a88xIeM3n7rU6hU2'].includes(uid)) {
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
    
    // We can use the firebase-admin firestore if initialized, else fallback to standard
    const firestore = admin.apps.length ? admin.firestore() : null;
    
    if (!firestore) {
         return res.status(501).json({ error: "Admin SDK not configured." });
    }

    try {
        const snapshot = await firestore.collection(collectionName).limit(limitCount).get();
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ collection: collectionName, count: docs.length, docs });
    } catch (error) {
        console.error(`Error reading collection ${collectionName}:`, error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
