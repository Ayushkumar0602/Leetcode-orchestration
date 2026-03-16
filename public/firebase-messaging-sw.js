/* eslint-disable no-undef */
// Firebase Messaging Service Worker (Web Push)
// This is intentionally minimal; the app can still function without FCM.
//
// You must set VITE_FIREBASE_VAPID_KEY in the frontend env and
// configure "Cloud Messaging" for Web in Firebase console to use push.

importScripts('https://www.gstatic.com/firebasejs/12.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.10.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB9QzTprZANW1xR_9opdxsDczmy8QdVoCc",
  authDomain: "aiinterview-20512.firebaseapp.com",
  projectId: "aiinterview-20512",
  storageBucket: "aiinterview-20512.firebasestorage.app",
  messagingSenderId: "519073264832",
  appId: "1:519073264832:web:9b1c3085a4cf325697e925",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || payload?.data?.title || 'Notification';
  const body = payload?.notification?.body || payload?.data?.body || '';

  self.registration.showNotification(title, {
    body,
    data: payload?.data || {},
  });
});

