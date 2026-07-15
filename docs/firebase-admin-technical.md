# Firebase admin — Technical Documentation

## Overview
The `firebaseAdmin.js` module serves as the central configuration and initialization point for the Firebase Admin SDK within the backend ecosystem. Its primary purpose is to authenticate the server-side application with Google Cloud/Firebase services, enabling privileged administrative operations such as user management, token verification, and database interactions that go beyond client-side SDK capabilities.

## Architecture
This file acts as a **singleton infrastructure provider**. It sits at the foundation of the backend dependency graph.
*   **Role:** Configuration and Initialization.
*   **Dependencies:** `firebase-admin` (SDK), `fs` (Node.js file system), `path` (Node.js path utilities).
*   **Consumers:** Any service requiring administrative access (e.g., authentication middleware, user management controllers, or database sync services). By exporting the `admin` object, it ensures all consuming modules share the same initialized instance.

## Design Principles
*   **Defensive Initialization:** The module implements a robust strategy to handle credentials. It supports multiple input formats (local JSON file vs. environment-encoded strings) to ensure portability between local development, staging, and production (CI/CD) environments.
*   **Graceful Degradation:** The module does not crash the application if credentials are missing. Instead, it logs a warning and leaves the `admin` instance uninitialized. This allows the application to start even if non-essential admin features are disabled, promoting high availability.
*   **Singleton Pattern:** By checking `!admin.apps.length` before initialization, it prevents the common "Firebase already initialized" error during hot reloads or multi-module dependency chains.

## API Reference
### Exports
*   **`admin`** (`Object`): The initialized Firebase Admin SDK instance. Provides full access to `admin.auth()`, `admin.firestore()`, etc.

## Internal Logic
The initialization follows a strict priority waterfall:
1.  **Local File Check:** Searches `__dirname` for a hardcoded service account JSON file. This is intended for local development environments where external environment variables may be cumbersome.
2.  **Environment Variable Check:** If no local file is found, it attempts to resolve `FIREBASE_SERVICE_ACCOUNT_KEY` from `process.env`.
    *   **Format Detection:** It intelligently detects if the environment variable is a raw JSON string (starts with `{`) or a Base64-encoded string (common in GitHub Actions/Heroku secrets).
3.  **SDK Initialization:** If credentials are parsed successfully and no previous app instances exist, `admin.initializeApp` is invoked with the parsed credentials and the optional `databaseURL` provided via environment variables.

## Data Flow
1.  **Input:** Reads from `process.env` or local `.json` filesystem.
2.  **Transformation:** Parses credentials into a JSON object via `JSON.parse` (and optionally `Buffer` decoding).
3.  **Injection:** The `admin` instance is configured with these credentials.
4.  **Output:** The ready-to-use `admin` instance is exported as a module, available for import throughout the Node.js runtime.

## Error Handling & Edge Cases
*   **Missing Credentials:** If no valid credentials are found, the module catches the error, logs a `501 Not Implemented` warning, and exports an uninitialized instance. Consuming modules are responsible for checking if `admin.apps.length > 0` before executing administrative calls.
*   **Malformed JSON:** The `try...catch` block wraps the entire parsing logic to ensure that a syntax error in the configuration does not trigger a process exit during startup.

## Usage Example

### Basic Import
```javascript
const { admin } = require('./backend/firebaseAdmin');

async function getUser(uid) {
  if (admin.apps.length === 0) {
    throw new Error('Firebase Admin SDK is not initialized.');
  }
  return await admin.auth().getUser(uid);
}
```

### Middleware Integration
```javascript
const { admin } = require('./backend/firebaseAdmin');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    res.status(401).send('Unauthorized');
  }
};
```