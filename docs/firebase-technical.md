# Firebase — Technical Documentation

## Overview
The `backend/firebase.js` module serves as the centralized initialization layer for the Firebase SDK within the backend infrastructure. It abstracts the configuration and instantiation of Firebase services, ensuring that the application maintains a consistent singleton connection to Firestore and the Realtime Database (RTDB) across the entire server runtime.

## Architecture
This module acts as the **Infrastructure Provider** layer.
*   **Role:** It encapsulates the SDK initialization logic, preventing redundant connections and configuration boilerplate throughout the business logic layer.
*   **Dependencies:** Relies on `firebase/app`, `firebase/firestore`, and `firebase/database`.
*   **Dependents:** Imported by controller, repository, or service layers that require database persistence (e.g., user management, event logging, or real-time state synchronization).

## Design Principles
*   **Singleton Pattern:** By executing the initialization logic at the top level of the module, the application ensures that `initializeApp` is invoked exactly once upon process startup.
*   **Configuration Decoupling:** Environmental configuration is pulled strictly from `process.env`. This adheres to the **Twelve-Factor App** methodology, separating configuration from code and allowing for seamless transitions between development, staging, and production environments.
*   **Encapsulation:** The module hides the internal SDK configuration, exposing only the initialized service instances (`db` and `rtdb`). Consumers do not need to know how the connection is established, only how to interact with the database APIs.

## API Reference

### `db`
*   **Type:** `Firestore` instance
*   **Description:** The default Firestore database instance used for document-oriented storage and complex querying.

### `rtdb`
*   **Type:** `Database` instance
*   **Description:** The Firebase Realtime Database instance used for low-latency state synchronization and real-time updates.

## Internal Logic
1.  **Environment Loading:** The module maps `process.env` variables into the `firebaseConfig` object.
2.  **Initialization:** `initializeApp` is called using the defined configuration. This establishes the internal connection context.
3.  **Service Retrieval:** 
    *   `getFirestore(app)` is invoked to bind the Firestore service to the initialized app context.
    *   `getDatabase(app)` is invoked to bind the RTDB service to the initialized app context.
4.  **Export:** The initialized service instances are exported as a module object for consumption across the project.

## Data Flow
1.  **Entry:** Data enters via environment variables provided by the container or execution environment.
2.  **Transformation:** These raw strings are ingested into a configuration object required by the Firebase SDK schema.
3.  **Exit:** The SDK instances are exported, becoming the entry point for CRUD operations triggered by the application's service layer.

## Error Handling & Edge Cases
*   **Missing Configuration:** If required environment variables are absent, the Firebase SDK will throw an initialization error upon startup, causing the backend process to crash. This is intentional "Fail Fast" behavior, preventing the application from running in an unstable state.
*   **Network Partitioning:** This module does not handle transient network failures; those are managed internally by the Firebase SDK’s reconnection logic. The module simply guarantees that the *interface* is available for use by the application.

## Usage Example

### Accessing Firestore
```javascript
const { db } = require('./backend/firebase');
const { doc, getDoc } = require('firebase/firestore');

async function getUser(uid) {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    return snap.exists() ? snap.data() : null;
}
```

### Accessing Realtime Database
```javascript
const { rtdb } = require('./backend/firebase');
const { ref, get } = require('firebase/database');

async function getSystemStatus() {
    const statusRef = ref(rtdb, 'status/current');
    const snapshot = await get(statusRef);
    return snapshot.val();
}
```