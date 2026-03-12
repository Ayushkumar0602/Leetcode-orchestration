# 🧠 LeetCode Orchestration — AI Interview Platform

A full-stack AI-powered platform for **practicing LeetCode problems**, **conducting mock coding interviews**, and **system design interviews** — with real-time AI feedback, sandboxed code execution, and progress tracking.

![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61dafb?logo=react)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-6da55f?logo=node.js)
![Firebase](https://img.shields.io/badge/Database-Firebase%20Firestore-ffca28?logo=firebase)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google)
![Docker](https://img.shields.io/badge/Code%20Execution-Docker-2496ED?logo=docker)

---

## ✨ Features

### 🗂️ LeetCode Problem Browser
- Browse **1,825+ LeetCode problems** from a pre-loaded dataset
- Filter by **difficulty**, **topic tags**, and **company**
- Search by **problem title** or keyword
- View **live acceptance rates** — updated in real-time via Firebase Firestore

### 🖥️ In-Browser Code Editor
- Powered by **Monaco Editor** (the engine behind VS Code)
- Multi-language support: **Python, JavaScript, Java, C++, C**
- **Run code** against custom inputs or provided test cases
- **Submit** code against all test cases with real-time streaming progress (SSE)

### 🤖 AI Coding Interview Simulator
- Select a **target company**, **target role**, and **language**
- Choose a problem **manually** or let the AI pick a **random problem** by company
- AI Interviewer (powered by **Google Gemini**) guides you through the full interview
- Follows real interview phases: Opening → Problem Clarification → Coding → Follow-up
- **Real-time code analysis** — AI comments on your approach as you type
- **Voice support** using ElevenLabs TTS for a realistic interview feel
- **Automated scoring report** at the end (Communication, Problem Solving, Code Quality, etc.)

### 🏗️ System Design Interview Simulator
- Choose between **High-Level Design (HLD)** and **Low-Level Design (LLD)** interviews
- AI interviewer asks contextual follow-up questions about requirements, scalability, and trade-offs
- **Interactive whiteboard** text area for architecture notes
- Comprehensive **evaluation report** with scores across 6 dimensions

### 📊 User Dashboard
- Visual **activity calendar** showing your daily practice streaks
- Track problems **Solved** vs **Attempting**
- Stats breakdown by difficulty: Easy / Medium / Hard
- Full **submission history** per problem with code diffs

### 👤 Public Profile
- Shareable public profile page with your solve stats and activity
- View other users' profiles by username

### 🔖 Bookmarking & Lists
- Create **custom problem lists** (e.g., "Amazon Prep", "Graph Problems")
- Add / remove problems from any list
- Access your lists any time from the dashboard

### 🔗 LeetCode Profile Sync
- Sync your existing **LeetCode solved problems** by username
- Optional **authenticated mode** using your LeetCode session cookie for accurate data
- Scraper runs inside a **Docker container** for isolation and reliability

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Frontend                         │
│          React 19 + Vite + Monaco Editor             │
│  Routes: Landing / Dashboard / Problems /            │
│          Interview / System Design / Profile         │
└────────────────────┬────────────────────────────────┘
                     │  REST API + SSE
┌────────────────────▼────────────────────────────────┐
│                     Backend                          │
│              Node.js + Express                       │
│  ┌─────────────┐ ┌──────────┐ ┌────────────────┐   │
│  │  Dataset    │ │   AI     │ │    Scraper     │   │
│  │ (JSON cache)│ │ (Gemini) │ │  (Docker)      │   │
│  └─────────────┘ └──────────┘ └────────────────┘   │
│          │                                           │
│  ┌───────▼───────────────────────────────────────┐  │
│  │             Firebase Firestore                 │  │
│  │  Collections: submissions, problems, stats,   │  │
│  │               interviews, lists               │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
         │
┌────────▼────────┐
│  Docker Engine  │  ← Sandboxed code execution
│  (per language) │     Python / JS / Java / C++ / C
└─────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Monaco Editor |
| **Styling** | Custom CSS (no framework) |
| **Backend** | Node.js, Express 5 |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Authentication (Google Sign-In) |
| **AI** | Google Gemini API (`@google/genai`) |
| **TTS** | ElevenLabs API |
| **Code Execution** | Docker (sandboxed containers per language) |
| **Scraper** | Puppeteer in Docker |
| **Dataset** | JSON cache (1,825 LeetCode problems, converted from CSV) |

---

## 📁 Project Structure

```
.
├── src/                              # Frontend (React)
│   ├── App.jsx                       # Root app + routing
│   ├── LandingPage.jsx               # Public landing page
│   ├── Login.jsx                     # Firebase auth (Google Sign-In)
│   ├── Dashboard.jsx                 # Main dashboard shell
│   ├── DashboardHome.jsx             # Dashboard home with stats overview
│   ├── ProblemList.jsx               # Problem browser + filters
│   ├── ProfilePage.jsx               # Logged-in user's profile
│   ├── PublicProfile.jsx             # Shareable public profile by username
│   ├── AIInterviewSelect.jsx         # Interview type + config selection modal
│   ├── InfoAIInterview.jsx           # AI interview info / landing screen
│   ├── AIInterview.jsx               # AI coding interview simulator
│   ├── SystemDesign.jsx              # System design interview entry page
│   ├── SystemDesignInterview.jsx     # System design interview simulator
│   ├── SystemDesignHLD.jsx           # HLD-specific interview flow
│   ├── SystemDesignLLD.jsx           # LLD-specific interview flow
│   ├── AISystemDesignInterview.jsx   # AI-driven system design session
│   ├── InterviewEvaluation.jsx       # Score report viewer
│   ├── ActivityCalendar.jsx          # GitHub-style activity heatmap
│   ├── BookmarkModal.jsx             # Problem list management
│   ├── MySubmissions.jsx             # Submission history viewer
│   ├── ScraperPage.jsx               # LeetCode profile sync UI
│   ├── firebase.js                   # Firebase client config
│   ├── useInterviewSession.js        # Custom hook for interview session state
│   ├── index.css                     # Global styles
│   ├── components/                   # Shared UI components
│   ├── contexts/                     # React context providers
│   ├── profile/                      # Profile sub-components
│   └── assets/                       # Static assets
│
├── backend/                          # Backend (Node.js)
│   ├── server.js                     # Express API server (all routes)
│   ├── ai.js                         # Gemini AI: code generation + test cases
│   ├── interview.js                  # AI interviewer logic (coding + system design)
│   ├── executor.js                   # Docker-based sandboxed code execution
│   ├── dataset.js                    # Problem store: loads JSON cache (CSV fallback)
│   ├── convert-to-json.js            # One-time script: converts CSV → JSON cache
│   ├── scraper.js                    # LeetCode profile scraper (runs in Docker)
│   ├── resumeParser.js               # Resume parsing utility
│   ├── firebase.js                   # Firebase Admin SDK initialization
│   ├── data/                         # Generated dataset cache (gitignored)
│   │   └── leetcode.json             # Pre-parsed problem dataset (1,825 problems)
│   ├── leetcode_dataset - lc.csv     # Source CSV (gitignored after conversion)
│   └── .env                          # Environment variables (never commit)
│
├── index.html                        # Vite entry point
├── vite.config.js                    # Vite configuration
├── firebase.json                     # Firebase hosting config
├── render.yaml                       # Render deployment config
└── package.json                      # Frontend dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** 9+
- **Docker** (for code execution and scraper)
- A **Firebase** project with Firestore + Authentication enabled
- A **Google Gemini API** key
- An **ElevenLabs API** key (optional, for TTS voice support)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Ayushkumar0602/Leetcode-orchestration.git
cd Leetcode-orchestration
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
GEMINI_API_KEY=your_google_gemini_api_key

# Firebase Admin SDK credentials
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Optional
ELEVENLABS_API_KEY=your_elevenlabs_api_key
PORT=3001
```

#### ⚡ Generate the JSON dataset cache (one-time, ~5s)

```bash
node convert-to-json.js
# ✅ Written 1825 problems to backend/data/leetcode.json
```

> This pre-converts the CSV dataset to JSON so the server loads in milliseconds instead of parsing 50k rows on every start. You only need to run this once (or again if the CSV changes).

Start the backend server:

```bash
node server.js
# Server running on http://localhost:3001
```

### 3. Frontend Setup

```bash
# From the project root
npm install
npm run dev
# App runs on http://localhost:5173
```

### 4. Firebase Configuration

Update `src/firebase.js` with your Firebase project's config object (from the Firebase Console → Project Settings → Your Apps → Web App).

---

## 📡 API Reference

### Problem Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/problems` | List problems (pagination, search, filters) |
| `GET` | `/api/problems/:id` | Get single problem by ID |
| `GET` | `/api/problems/random/:company` | Get a random problem for a given company |
| `GET` | `/api/metadata` | Get dataset metadata (all topics & companies) |
| `GET` | `/api/stats` | Get total problem counts by difficulty |

### Code Execution Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/execute` | Run code in Docker (custom input) |
| `POST` | `/api/submit` | Submit against all test cases (SSE stream) |
| `POST` | `/api/generate` | AI-generate solution + test cases |

### Interview Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/interview/chat` | Send message to AI coding interviewer |
| `POST` | `/api/interview/analyze` | Analyze candidate's code in real-time |
| `POST` | `/api/interview/evaluate` | Generate final score report |
| `POST` | `/api/systemdesign/chat` | Send message to system design interviewer |
| `POST` | `/api/systemdesign/evaluate` | Evaluate system design interview |
| `POST` | `/api/interviews/save` | Save completed interview to Firestore |
| `GET` | `/api/interviews/:uid` | Get all interviews for a user |

### User & Stats Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats/user/:uid` | Get user solve stats (Easy/Medium/Hard) |
| `GET` | `/api/activity/:uid` | Get activity calendar data + streaks |
| `POST` | `/api/submissions/save` | Save a code submission |
| `GET` | `/api/submissions/:uid/:problemId` | Get submission history for a problem |
| `GET` | `/api/user-problems/:uid` | Get all attempted/solved problems for a user |

### Bookmark / Lists Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/lists` | Create a new problem list |
| `GET` | `/api/lists/:uid` | Get all lists for a user |
| `POST` | `/api/lists/:listId/add` | Add problem to a list |
| `DELETE` | `/api/lists/:listId/problems/:problemId` | Remove problem from a list |

### Scraper Route
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/scraper/run` | Sync LeetCode solved problems by username |

---

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key for all AI features |
| `FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | ✅ | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | ✅ | Firebase service account private key |
| `ELEVENLABS_API_KEY` | ⬜ | ElevenLabs key for TTS voice (optional) |
| `PORT` | ⬜ | Server port (defaults to `3001`) |

> ⚠️ Never commit your `.env` file. It is already listed in `backend/.gitignore`.

---

## 🐳 Docker & Code Execution

User code is run in isolated Docker containers with a strict timeout. Supported languages:

| Language | Docker Image |
|----------|-------------|
| Python | `python:3.11-slim` |
| JavaScript | `node:18-slim` |
| Java | `openjdk:17-slim` |
| C++ | `gcc:12` |
| C | `gcc:12` |

> Make sure Docker Desktop is running before starting the backend.

---

## 📦 Dataset

The problem dataset (`1,825 LeetCode problems`) is stored in two forms:

| File | Purpose |
|------|---------|
| `backend/leetcode_dataset - lc.csv` | Source file (gitignored) |
| `backend/data/leetcode.json` | Pre-parsed JSON cache (fast load) |

The server automatically loads from JSON if it exists, and falls back to CSV parsing if it doesn't. To regenerate the JSON cache:

```bash
cd backend
node convert-to-json.js
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgements

- [LeetCode](https://leetcode.com) for problem inspiration
- [Google Gemini](https://deepmind.google/technologies/gemini/) for AI capabilities
- [ElevenLabs](https://elevenlabs.io) for realistic TTS voices
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the VS Code-powered editor
- [Firebase](https://firebase.google.com) for auth and database infrastructure
