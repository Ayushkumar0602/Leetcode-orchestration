import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyB9QzTprZANW1xR_9opdxsDczmy8QdVoCc",
    authDomain: "aiinterview-20512.firebaseapp.com",
    projectId: "aiinterview-20512",
    storageBucket: "aiinterview-20512.firebasestorage.app",
    messagingSenderId: "519073264832",
    appId: "1:519073264832:web:9b1c3085a4cf325697e925",
    measurementId: "G-BTHYBXR7Q1",
    databaseURL: "https://aiinterview-20512-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const rtdb = getDatabase(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize analytics only if in browser
let analytics;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

async function getMessagingIfSupported() {
    if (typeof window === 'undefined') return null;
    const supported = await isMessagingSupported();
    if (!supported) return null;
    return getMessaging(app);
}

export { auth, googleProvider, githubProvider, rtdb, db, storage, analytics, getMessagingIfSupported };
