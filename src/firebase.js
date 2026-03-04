import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyB9QzTprZANW1xR_9opdxsDczmy8QdVoCc",
    authDomain: "aiinterview-20512.firebaseapp.com",
    projectId: "aiinterview-20512",
    storageBucket: "aiinterview-20512.firebasestorage.app",
    messagingSenderId: "519073264832",
    appId: "1:519073264832:web:9b1c3085a4cf325697e925",
    measurementId: "G-BTHYBXR7Q1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize analytics only if in browser
let analytics;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

export { auth, googleProvider };
