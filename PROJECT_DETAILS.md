# Technical Documentation: Whizan Platform Architecture

This document provides a deep dive into the internal systems, API contracts, and database architecture of the Whizan platform.

## 🧠 AI & Interview Logic

### Problem Generation (`backend/ai.js`)
The system uses Google Gemini to transform raw problem descriptions into structured programming challenges.
- **Skeleton Code**: Generates idiomatic code stubs for 7 languages.
- **Driver Wrappers**: Generates boilerplate code to parse STDIN according to specified problem constraints.
- **Test Cases**: Generates a standard set (3) for initial testing and an exhaustive set (10+) for full submission verification.

### AI Interviewer (`backend/interview.js`)
The interviewer operates as a stateful agent with the following phases:
1. `opening`: Introduction and problem review.
2. `brute-force`: Discussion of naive solutions.
3. `optimization`: Bottleneck analysis and optimization hints.
4. `coding`: Implementation monitoring.
5. `wrap-up`: Post-coding questions.
6. `end`: Final sign-off.

**Real-time Interaction**:
The AI can trigger "UI Actions" stored in the Realtime Database (`sessions/{sessionId}/actions`):
- `highlight`: Visual cues on specific lines.
- `cursor`: Tooltips at specific editor positions.
- `comment`: Inline code notes.
- `banner`: Top-level status alerts/hints.

---

## 💻 Code Execution Engine (`backend/executor.js`)
Runs natively on the host system to minimize overhead.
- **Security**: Uses a unique session UUID for every run; results are contained within `/tmp`.
- **Cleanup**: Automatic removal of source and binary files after each execution.
- **Timeout**: Hard 15-second SIGKILL timeout to prevent infinite loops.

---

## 🏗 Database Schema (Firestore)

### Core Collections
| Collection | Description | Key Fields |
| :--- | :--- | :--- |
| `userProfiles` | User metadata & auth | `uid`, `plan`, `planExpiresAt`, `isAdmin` |
| `problems` | Cached problem data | `title`, `description`, `code` (map), `wrapper` (map) |
| `interviews` | All interview attempts | `userId`, `transcript`, `scoreReport`, `interviewType` |
| `submissions` | User code submissions | `userId`, `problemId`, `code`, `status` |
| `stats` | Problem aggregations | `submissions`, `accepted` |
| `campaigns` | Notification broadcasts | `title`, `message`, `type`, `target` |

### Platform Activity
- `admin_logs`: Audit trail for all actions taken in the Admin Portal.
- `admin_settings`: Global configuration document (`global`).
- `analytics_pageviews` / `analytics_events`: Raw tracking data for platform usage.

---

## 📡 API Reference (Simplified)

### Core API
- `POST /api/execute`: Run code against custom input.
- `POST /api/submit`: Sequentially run code against submission-grade test cases (SSE Stream).
- `POST /api/interview/chat`: Exchange messages with the AI Interviewer.
- `POST /api/generate`: Generate boilerplate for a new problem.

### Admin API (Protected)
- `GET /api/admin/users`: List all authenticated users.
- `GET /api/admin/config`: Fetch global system settings.
- `PATCH /api/admin/db/:col/:id`: Direct Document Editing.
- `GET /api/admin/health`: System memory, CPU, and uptime metrics.

### Notification API
- `POST /api/notifications/campaigns`: Create a new broadcast.
- `GET /api/notifications/campaigns/:id/analytics`: View seen/read/clicked metrics.

---

## 🚦 Deployment & Infrastructure
- **Hosting**: Backend on **Render**, Frontend on **Firebase Hosting**.
- **Cron Jobs**: 
  - Subscription Expiry Check (Daily at 9:00 AM IST).
  - External Keep-Alive Ping (Every 12 mins via GitHub Actions/UptimeRobot).
- **Audio Output**: Integration with **Sarvam AI** for low-latency streaming TTS during interviews.
