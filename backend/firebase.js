/**
 * backend/firebase.js — Firebase Admin SDK Shim
 * ================================================
 * This module initializes Firebase using the Admin SDK (service account)
 * which bypasses ALL Firestore/RTDB Security Rules — essential for server-side operations.
 *
 * It also exports polyfill wrappers that EXACTLY mirror the Firebase v9 Web SDK
 * function names (getDoc, setDoc, collection, etc.) so that the rest of the
 * server codebase requires ZERO changes to business logic.
 */

/**
 * backend/firebase.js — Firebase Admin SDK Shim
 * ================================================
 * This module initializes Firebase using the Admin SDK (service account)
 * which bypasses ALL Firestore/RTDB Security Rules — essential for server-side operations.
 *
 * It also exports polyfill wrappers that EXACTLY mirror the Firebase v9 Web SDK
 * function names (getDoc, setDoc, collection, etc.) so that the rest of the
 * server codebase requires ZERO changes to business logic.
 */

'use strict';

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

// ─── 1. Initialize Firebase Admin SDK ────────────────────────────────────────

const admin = require('firebase-admin');

if (!admin.apps.length) {
    let serviceAccount;
    try {
        const localKeyPath = path.join(__dirname, 'aiinterview-20512-firebase-adminsdk-fbsvc-f44ebbdc72.json');
        if (fs.existsSync(localKeyPath)) {
            serviceAccount = require('./aiinterview-20512-firebase-adminsdk-fbsvc-f44ebbdc72.json');
            console.log('[Firebase Shim] ✅ Loaded Admin key from local JSON file.');
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
            serviceAccount = JSON.parse(raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf-8'));
            console.log('[Firebase Shim] ✅ Loaded Admin key from environment variable.');
        } else {
            console.warn('[Firebase Shim] ⚠️  No service account key found. Admin SDK may not work properly.');
        }
    } catch (err) {
        console.error('[Firebase Shim] ❌ Failed to load service account key:', err.message);
    }

    admin.initializeApp({
        credential: serviceAccount
            ? admin.credential.cert(serviceAccount)
            : admin.credential.applicationDefault(),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
}

// ─── 2. Get DB handles (Admin SDK) ───────────────────────────────────────────

const _afs = admin.firestore();

// Lazy RTDB — only initialized if FIREBASE_DATABASE_URL is present
let _rtdb = null;
function getRtdb() {
    if (!_rtdb) {
        if (!process.env.FIREBASE_DATABASE_URL) {
            throw new Error('[Firebase Shim] FIREBASE_DATABASE_URL is not set. RTDB operations are unavailable.');
        }
        _rtdb = admin.database();
    }
    return _rtdb;
}

// Expose raw handles (Firestore is always available, RTDB requires env var)
const db   = _afs;
// rtdb is a Proxy that lazy-inits on first access
const rtdb = new Proxy({}, {
    get(_, prop) { return getRtdb()[prop]; },
    set(_, prop, val) { getRtdb()[prop] = val; return true; },
});

// ─── 3. Firestore v9 Web SDK Polyfills  ──────────────────────────────────────

/**
 * Returns an Admin Firestore DocumentReference, mimicking:
 *   doc(db, 'collection', 'docId')          → _afs.doc('collection/docId')
 *   doc(db, 'collection/docId')              → _afs.doc('collection/docId')
 *   doc(collectionRef, 'docId')              → collectionRef.doc('docId')
 */
function doc(dbOrRef, ...pathSegments) {
    const typeName = dbOrRef && dbOrRef.constructor && dbOrRef.constructor.name;

    // If first arg is a CollectionReference (type name = 'CollectionReference')
    if (typeName === 'CollectionReference') {
        return dbOrRef.doc(pathSegments[0]);
    }

    // If first arg is a DocumentReference (type name = 'DocumentReference')
    // then caller wants a sub-collection doc: doc(docRef, 'subcol', 'subId')
    if (typeName === 'DocumentReference') {
        const subPath = pathSegments.join('/');
        return dbOrRef.collection(subPath.split('/')[0]).doc(subPath.split('/')[1] || '');
    }

    // Otherwise it's the Firestore instance — build path from all segments
    const fullPath = pathSegments.join('/');
    return _afs.doc(fullPath);
}

/**
 * Returns an Admin Firestore CollectionReference, mimicking:
 *   collection(db, 'collectionPath')
 *   collection(docRef, 'subcollection')
 */
function collection(dbOrRef, collectionPath) {
    const typeName = dbOrRef && dbOrRef.constructor && dbOrRef.constructor.name;

    // If first arg is a DocumentReference, return sub-collection
    if (typeName === 'DocumentReference') {
        return dbOrRef.collection(collectionPath);
    }

    // Otherwise it's the Firestore instance
    return _afs.collection(collectionPath);
}


/** getDoc(docRef) → { exists(), data(), id } */
async function getDoc(docRef) {
    const snap = await docRef.get();
    return {
        exists: () => snap.exists,
        data: () => snap.data(),
        id: snap.id,
        ref: snap.ref,
    };
}

/** getDocs(queryOrCollection) → { docs: [{exists(), data(), id}] } */
async function getDocs(queryOrCollection) {
    const snap = await queryOrCollection.get();
    return {
        docs: snap.docs.map(d => ({
            exists: () => d.exists,
            data: () => d.data(),
            id: d.id,
            ref: d.ref,
        })),
        size: snap.size,
        empty: snap.empty,
        forEach: (fn) => snap.docs.forEach(d => fn({ exists: () => d.exists, data: () => d.data(), id: d.id, ref: d.ref })),
    };
}

/** setDoc(docRef, data, options?) */
async function setDoc(docRef, data, options = {}) {
    if (options.merge) {
        return docRef.set(data, { merge: true });
    }
    return docRef.set(data);
}

/** addDoc(collectionRef, data) → { id } */
async function addDoc(collectionRef, data) {
    const ref = await collectionRef.add(data);
    return { id: ref.id, ...ref };
}

/** deleteDoc(docRef) */
async function deleteDoc(docRef) {
    return docRef.delete();
}

/** updateDoc(docRef, data) */
async function updateDoc(docRef, data) {
    return docRef.update(data);
}

/** query(collectionRef, ...queryConstraints) — returns constrained query */
function query(colRef, ...constraints) {
    let q = colRef;
    for (const constraint of constraints) {
        q = constraint(q);
    }
    return q;
}

/** where(field, op, value) — returns constraint function */
function where(field, op, value) {
    return (q) => q.where(field, op, value);
}

/** orderBy(field, direction?) — returns constraint function */
function orderBy(field, direction = 'asc') {
    return (q) => q.orderBy(field, direction);
}

/** limit(n) — returns constraint function */
function limit(n) {
    return (q) => q.limit(n);
}

/** startAfter(docSnap) — returns constraint function */
function startAfter(docSnapOrValue) {
    return (q) => q.startAfter(docSnapOrValue);
}

/** increment(n) — Admin SDK FieldValue.increment */
function increment(n) {
    return admin.firestore.FieldValue.increment(n);
}

/** arrayUnion(...items) — Admin SDK FieldValue.arrayUnion */
function arrayUnion(...items) {
    return admin.firestore.FieldValue.arrayUnion(...items);
}

/** arrayRemove(...items) — Admin SDK FieldValue.arrayRemove */
function arrayRemove(...items) {
    return admin.firestore.FieldValue.arrayRemove(...items);
}

/** serverTimestamp() — Admin SDK FieldValue.serverTimestamp */
function serverTimestamp() {
    return admin.firestore.FieldValue.serverTimestamp();
}

/**
 * getCountFromServer(queryOrCollection) → { data: () => ({ count }) }
 * Admin SDK doesn't have this directly; we use .count().get()
 */
async function getCountFromServer(queryOrCollection) {
    const agg = await queryOrCollection.count().get();
    return {
        data: () => ({ count: agg.data().count }),
    };
}

// ─── 4. RTDB Polyfills ────────────────────────────────────────────────────────

/** ref(rtdb, path) */
function ref(database, path) {
    return getRtdb().ref(path);
}

/** get(ref) → { exists(), val() } */
async function get(refOrQuery) {
    const snap = await refOrQuery.once('value');
    return {
        exists: () => snap.exists(),
        val: () => snap.val(),
    };
}

/** set(ref, data) */
async function set(ref, data) {
    return ref.set(data);
}

/** push(ref, data?) */
function push(ref, data) {
    if (data !== undefined) return ref.push(data);
    return ref.push();
}

/** remove(ref) */
async function remove(ref) {
    return ref.remove();
}

// ─── 5. Exports ───────────────────────────────────────────────────────────────

module.exports = {
    // DB handles
    db,
    rtdb,
    admin,

    // Firestore polyfills
    doc,
    collection,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    deleteDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    increment,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    getCountFromServer,

    // RTDB polyfills
    ref,
    get,
    set,
    push,
    remove,
};
