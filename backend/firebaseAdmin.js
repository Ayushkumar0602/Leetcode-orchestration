// backend/firebaseAdmin.js
const admin = require('firebase-admin');

// We expect FIREBASE_SERVICE_ACCOUNT_KEY in the environment
// If it's a JSON string, we parse it. If it's a base64 encoded string, we decode and parse it.
let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY.startsWith('{')) {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } else {
          // Assume base64
          const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8');
          serviceAccount = JSON.parse(decoded);
      }
  }
} catch (error) {
  console.warn("⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Admin SDK features will be disabled.", error.message);
}

if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    console.log("✅ Firebase Admin SDK Initialized Successfully.");
} else if (!serviceAccount) {
    console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT_KEY is missing. Admin features (listing/deleting users) will return 501 Not Implemented.");
}

module.exports = { admin };
