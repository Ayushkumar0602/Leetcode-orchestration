// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB9QzTprZANW1xR_9opdxsDczmy8QdVoCc",
    authDomain: "aiinterview-20512.firebaseapp.com",
    projectId: "aiinterview-20512",
    storageBucket: "aiinterview-20512.firebasestorage.app",
    messagingSenderId: "519073264832",
    appId: "1:519073264832:web:9b1c3085a4cf325697e925",
    measurementId: "G-BTHYBXR7Q1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db };
