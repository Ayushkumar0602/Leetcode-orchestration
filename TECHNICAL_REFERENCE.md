# Whizan Technical Reference

This document provides definitive technical details for the Whizan platform's internals, intended for developers and system administrators.

---

## 📡 Exhaustive API Catalog

### 1. Core Logic & AI Services
| Method | Endpoint | Description | Payload Highlights |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/generate` | Generates solution stubs and test cases | `problemStatement`, `language`, `problemId` |
| `POST` | `/api/execute` | Executes code against custom input | `code`, `language`, `input` |
| `POST` | `/api/submit` | Runs code against exhaustive test cases | `code`, `language`, `problemId` (SSE stream) |
| `POST` | `/api/interview/chat` | AI Interviewer response generation | `transcript`, `currentCode`, `interviewPhase` |
| `POST` | `/api/interview/analyze` | Real-time code critique for interviews | `code`, `language`, `problem` |
| `POST` | `/api/interview/evaluate` | Final interview scoring and feedback | `transcript`, `finalCode`, `problem` |
| `POST` | `/api/resume/parse` | Gemini Vision resume extraction | `base64Data`, `mimeType` |
| `POST` | `/api/sarvam/tts` | Sarvam AI streaming audio proxy | `text`, `speaker` (manan, shreya, etc.) |

### 2. Admin Portal Services (Bearer Auth Required)
| Method | Endpoint | Description | Action |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | List all Firebase Auth users | Bulk retrieval |
| `POST` | `/api/admin/users/:uid/suspend` | Suspend/Activate a user | `disabled: true/false` |
| `GET` | `/api/admin/db/:col` | Generic Firestore collection reader | Query filters support |
| `PATCH` | `/api/admin/db/:col/:id` | Direct document editing | Partial matching |
| `GET` | `/api/admin/health` | Memory, CPU, and Uptime metrics | Runtime monitoring |
| `POST` | `/api/admin/notifications/campaigns` | Create marketing/system campaign | `type`, `target`, `content` |
| `POST` | `/api/admin/notifications/campaigns/:id/activate` | Send campaign push notifications | Fired via FCM |

---

## 🗄️ Database Logic & Data Models

### 1. Firestore Collections
- **`userProfiles`**: Persistent user data.
  - Fields: `displayName`, `email`, `plan` (Spark/Blaze), `planExpiresAt`, `resumeData` (Parsed JSON), `socialLinks`.
- **`interviews`**: DSA and System Design sessions.
  - Fields: `userId`, `topic`, `transcript` (Array), `scoreReport` (JSON), `overallScore`, `interviewType`.
- **`problems`**: Master problem cache.
  - Fields: `title`, `difficulty`, `description`, `code` (Object with language stubs), `wrapper` (Object with stdin drivers).
- **`submissions`**: Individual solution attempts.
  - Fields: `userId`, `problemId`, `code`, `status` (Accepted/Failed), `output`, `executionTime`.
- **`campaigns`**: Multi-channel broadcast management.
  - Fields: `name`, `type` (Feed/Popup), `status` (Active/Ended), `target` (Segments).

### 2. Realtime Database (RTDB) Paths
- **`sessions/{sessionId}/actions`**: Dynamic UI updates during interviews.
  - Objects: `highlight`, `cursor`, `comment`, `banner`.
- **`users/{uid}/sessions`**: Tracking active login instances and device tokens.
- **`connectRequests/{uid}`** & **`connections/{uid}`**: Social graph and networking requests.

---

## ⚙️ Core Engines & Lifecycles

### Code Execution Workflow
1. Client sends source code and language to `/api/execute`.
2. Backend creates a unique temporary directory in `/tmp/code-exec-{uuid}`.
3. Source file is written (e.g., `Main.java` or `main.py`).
4. Native command is built (e.g., `g++ ... && ./a.out`).
5. Execution runs with a **15s timeout**. Stdout/Stderr are captured.
6. Temporary directory is recursively deleted immediately after response.

### AI Interview State Machine
1. **Phases**: `Opening` → `Brute-force` → `Optimization` → `Coding` → `Wrap-up` → `End`.
2. **Phase Transitions**: Driven by LLM analysis of the transcript against predefined transition rules.
3. **Logic Enrichment**: AI injects `uiActions` into RTDB to highlight code mistakes or provide visual hits without breaking speech flow.

---

## 🌍 Environment Variable Master List
- **AI Keys**: `GEMINI_API_KEY_1` to `GEMINI_API_KEY_7` (Load balanced).
- **Voice**: `SARVAM_API_KEY` (Streaming TTS).
- **Payment**: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
- **Email**: `EMAILJS_PRIMARY_SERVICE_ID`, `EMAILJS_TEMPLATE_REMINDER`, etc. (Secondary account used for "Expired" notifications).
- **Firebase**: `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string for server-side admin SDK).

---

## 💻 Frontend Component Map
- **General**: `App.jsx` (Routing), `LandingPage.jsx`, `DashboardHome.jsx`.
- **DSA**: `ProblemList.jsx`, `Dashboard.jsx` (The Editor), `MySubmissions.jsx`.
- **Interviews**: `AIInterview.jsx` (DSA), `SystemDesignInterview.jsx` (Whiteboard).
- **Admin**: `AdminPortal.jsx` (Layout), `AdminUsers.jsx`, `AdminNotifications.jsx`.
- **Global UI Managers**: `NotificationPopupManager.jsx` (Handles different campaign types), `RouteTracker.jsx` (Analytics).
