// backend/firebaseAdmin.js
const admin = require('firebase-admin');

// We expect FIREBASE_SERVICE_ACCOUNT_KEY in the environment
// If it's a JSON string, we parse it. If it's a base64 encoded string, we decode and parse it.
const fs = require('fs');
const path = require('path');

let serviceAccount;
try {
  const localKeyPath = path.join(__dirname, 'aiinterview-20512-firebase-adminsdk-fbsvc-f44ebbdc72.json');
  if (fs.existsSync(localKeyPath)) {
      serviceAccount = require('./aiinterview-20512-firebase-adminsdk-fbsvc-f44ebbdc72.json');
      console.log("Loaded Firebase key from local JSON file.");
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY.startsWith('{')) {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } else {
          // Assume base64
          const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8');
          serviceAccount = JSON.parse(decoded);
      }
      console.log("Loaded Firebase key from environment variables.");
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
