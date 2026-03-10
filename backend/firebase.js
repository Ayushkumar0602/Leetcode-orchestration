// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getDatabase } = require("firebase/database");

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyB9QzTprZANW1xR_9opdxsDczmy8QdVoCc",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "aiinterview-20512.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "aiinterview-20512",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "aiinterview-20512.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "519073264832",
    appId: process.env.FIREBASE_APP_ID || "1:519073264832:web:9b1c3085a4cf325697e925",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-BTHYBXR7Q1",
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://aiinterview-20512-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);

module.exports = { db, rtdb };
