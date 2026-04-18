/**
 * Firebase Admin Shim for Web SDK Compatibility
 * 
 * This module exports bindings that precisely mimic the Firebase v9 Web SDK (e.g. getDoc, setDoc, doc)
 * but internally use the Firebase Admin SDK. This enables the backend to bypass restrictive Security Rules 
 * without rewriting thousands of lines of V9 modular database queries.
 */

const { admin } = require('./firebaseAdmin');

// Core Firebase Admin Instances
const db = admin.apps.length > 0 ? admin.firestore() : null;
const rtdb = admin.apps.length > 0 ? admin.database() : null;

// --- FIRESTORE SHIM ---

// Path normalization
const doc = (firestoreInstanceOrCollection, pathSegments, ...rest) => {
    // If first arg is a custom collection object from this shim
    if (firestoreInstanceOrCollection && firestoreInstanceOrCollection.isAdminCollection) {
        return firestoreInstanceOrCollection.doc(pathSegments);
    }
    // If first arg is db, second arg is path
    let fullPath = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;
    if (rest.length > 0) {
        fullPath += '/' + rest.join('/');
    }
    return db.doc(fullPath);
};

const collection = (firestoreInstance, pathSegments, ...rest) => {
    let fullPath = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;
    if (rest.length > 0) {
        fullPath += '/' + rest.join('/');
    }
    const coll = db.collection(fullPath);
    coll.isAdminCollection = true;
    return coll;
};

const getDoc = (docRef) => docRef.get();
const getDocs = (queryRef) => queryRef.get();

const setDoc = (docRef, data, options) => {
    if (options && options.merge) {
        return docRef.set(data, { merge: true });
    }
    return docRef.set(data);
};

const addDoc = (collectionRef, data) => collectionRef.add(data);
const deleteDoc = (docRef) => docRef.delete();

const query = (collectionRef, ...constraints) => {
    let q = collectionRef;
    for (const constraint of constraints) {
        if (constraint.type === 'where') {
            q = q.where(constraint.field, constraint.op, constraint.val);
        } else if (constraint.type === 'orderBy') {
            q = q.orderBy(constraint.field, constraint.dir);
        } else if (constraint.type === 'limit') {
            q = q.limit(constraint.val);
        }
    }
    return q;
};

const where = (field, op, val) => ({ type: 'where', field, op, val });
const orderBy = (field, dir = 'asc') => ({ type: 'orderBy', field, dir });
const limit = (val) => ({ type: 'limit', val });
const updateDoc = (docRef, data) => docRef.update(data);
const getCountFromServer = async (queryRef) => {
    const snap = await queryRef.count().get();
    return { data: () => ({ count: snap.data().count }) };
};

// FieldValue operations
const increment = (n) => admin.firestore.FieldValue.increment(n);
const arrayUnion = (...args) => admin.firestore.FieldValue.arrayUnion(...args);
const arrayRemove = (...args) => admin.firestore.FieldValue.arrayRemove(...args);

// --- RTDB SHIM ---

const rtdbRef = (databaseInstance, path) => rtdb.ref(path);

// The v9 `get(ref)` returns a snapshot. Admin RTDB `once('value')` also returns a snapshot.
const get = (dbRef) => dbRef.once('value');

// The v9 `set(ref, data)` is just `ref.set(data)` in admin
const set = (dbRef, data) => dbRef.set(data);

// The v9 `push(ref, data)` wrapper. If data is provided, it pushes, else returns a new reference
const push = (dbRef, data) => {
    if (data !== undefined) return dbRef.push(data);
    return dbRef.push();
};

const remove = (dbRef) => dbRef.remove();


module.exports = {
    db,
    rtdb,
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
    getCountFromServer,
    increment,
    arrayUnion,
    arrayRemove,
    rtdbRef,
    get,
    set,
    push,
    remove,
    admin
};
