# 🚀 WHIZAN AI - Intelligent Technical Interview Ecosystem

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org)
[![Firebase](https://img.shields.io/badge/Firebase-12.10.0-orange?logo=firebase)](https://firebase.google.com)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-Latest-red?logo=google)](https://ai.google.dev)

**Whizan AI** is a comprehensive, AI-first platform that bridges competitive programming and real-world technical interviews. It provides adaptive mock interviews, AI-powered code evaluation, system design practice, and career tools—all powered by Google Gemini, Sarvam AI, and Firebase infrastructure.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup & Development](#local-setup--development)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment Guide](#deployment-guide)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Whizan AI** transforms technical interview preparation by combining:

- **Adaptive AI Interviews** — State-machine-based mock interviews with Socratic hints
- **7-Language Code Execution** — Native compilation and execution (Python, JavaScript, C++, C, Java, Go, Rust)
- **Intelligent Problem Generation** — Auto-generates boilerplate code and 15+ test cases per problem
- **System Design Practice** — HLD (High-Level Design) and LLD (Low-Level Design) interview modules
- **Resume & Portfolio Intelligence** — Gemini Vision PDF parsing + GitHub README analysis
- **Enterprise Admin Portal** — Infrastructure monitoring, user management, omnichannel campaigns
- **Real-Time Voice Integration** — Sarvam AI TTS with video synchronization
- **Job Automation** — Autonomous browser-based job application system

### Mission

To democratize access to high-quality technical interview coaching and career advancement tools through AI-powered assistance.

---

## ✨ Key Features

### 🎙️ **Tier 1: Core Interview Features**

#### 1. Adaptive AI-Powered DSA Interviews
- **6-Phase Interview Flow**: Opening → Brute-Force → Optimization → Coding → Wrap-up → End
- **State-Machine Architecture**: Automatic phase transitions based on transcript analysis
- **Socratic Hinting**: AI provides graduated hints without revealing solutions
- **Real-Time Code Annotation**: Highlights, cursor tooltips, inline comments, banners
- **Live Code Analysis**: Detects logical errors, validates complexity, identifies edge cases
- **Comprehensive Scoring**: 6-dimension skill breakdown (Communication, Code Quality, Edge Cases, etc.)
- **Interview Evaluation Report**: Hire recommendation, strengths, improvements, red flags

**Configuration Options:**
- Select target company and role
- Choose from 1000+ DSA problems filtered by difficulty/topic
- Pick programming language (7 supported)
- Select AI voice personality (6 voice options with TTS preview)

#### 2. Multi-Language Native Code Execution Engine
- **7 Languages Supported**: Python, JavaScript, C++, C, Java, Go, Rust
- **Native Compilation**: Direct `gcc`, `g++`, `javac`, etc. (no Docker overhead)
- **Isolated Execution**: Each run gets unique `/tmp/code-exec-{UUID}` directory
- **15-Second Timeout**: SIGKILL enforcement prevents infinite loops
- **Stream-Based I/O**: stdin piping for test case validation
- **Automatic Cleanup**: Temp files deleted immediately after execution
- **Performance Monitoring**: Tracks job stats, latencies, failure rates

**Execution Pipeline:**
```
Source Code → Temp Directory → Compile (if needed) → 
Execute with stdin → Capture stdout/stderr → 
Compare with expectedOutput → Cleanup → Return result
```

#### 3. AI Problem & Test Case Generation
- **7-Language Boilerplate**: Generates idiomatic skeleton code for all 7 languages
- **STDIN/STDOUT Drivers**: Language-specific input parsing wrappers
- **Test Case Generation (15+ per problem)**:
  - 3 primary examples (human-readable display)
  - 10-15 submission test cases (normal, boundary, edge, stress tests)
- **Firestore Caching**: Instant retrieval for all languages (<100ms cache hit)
- **Gemini Fallback Strategy**: Rotates through 7 API keys on rate limits/errors
- **Exhaustive Edge Cases**: Covers empty inputs, max sizes, negative values, domain-specific cases

### 🏛️ **Tier 2: Advanced Interview Features**

#### 4. System Design Interview Module (HLD & LLD)
- **HLD Topics**: Scalability, distributed systems, caching, load balancing, microservices
- **LLD Topics**: OOP, design patterns, UML, multithreading, clean code, API design
- **Interactive Whiteboard**: Real-time component visualization and AI feedback
- **AI Evaluation**: Analyzes architectural decisions and code patterns
- **Structured Curriculum**: Module-based learning with progress tracking

#### 5. Interactive Learning Courses
- **Video Integration**: Embedded YouTube lectures with timestamps
- **Structured Curriculum**: Modules organized by skill level
- **Content Optimization**: AI auto-optimizes descriptions and syllabus
- **Enrollment System**: Blaze plan users get premium course access
- **Interactive Elements**: Code samples, quizzes, certificates

#### 6. DSA Problem Library
- **1000+ Problems**: Organized by difficulty and company tags
- **Topic-Based**: Arrays, LinkedList, Tree, Graph, DP, Greedy, etc.
- **Filters**: By difficulty, topic, company, acceptance rate
- **Submission Tracking**: View all past attempts with stats
- **Problem Statistics**: Acceptance rate, company frequency, complexity hints

### 📄 **Tier 3: Portfolio & Career Features**

#### 7. AI Resume Parser & Portfolio Intelligence
- **Vision-Based Parsing**: Gemini Vision extracts resume data from PDFs/images
- **GitHub Analysis**: Automatically fetches and analyzes README files
- **Public Profiles**: Share unique profile link with interview scores and projects
- **Portfolio Generation**: Professional project showcases from GitHub data

#### 8. Job Listing & Autonomous Job Applier
- **Web Scraping**: Playwright-powered browser automation
- **Platform Support**: LinkedIn, Indeed, Glassdoor, career pages
- **Autonomous Agent**: Gemini analyzes snapshots and decides actions
- **Smart Navigation**: Recognizes common platforms, skips to relevant sections
- **Application History**: Logs all applications with snapshots and decision logs

#### 9. Public Portfolio Landing Pages
- **Customizable Templates**: Minimal, Grid, Timeline layouts
- **Portfolio Elements**: Hero, projects, experience, skills, contact
- **Responsive Design**: Mobile-first optimization
- **Custom Domains**: Use your own domain

### 🛡️ **Tier 4: Platform Infrastructure**

#### 10. Enterprise-Grade Admin Portal
- **User Management**: List users, suspend/activate, bulk operations
- **Database Editor**: Direct Firestore document editor
- **Infrastructure Monitoring**: CPU, Memory, Uptime, DB latency tracking
- **Campaign Management**: Omnichannel notifications (Feed, Popup, Banner, FCM)
- **System Configuration**: Global settings, feature flags, rate limiting
- **Audit Logging**: All admin actions logged with timestamps

#### 11. Analytics & Real-Time Monitoring
- **Page Analytics**: Route tracking, view counts, referrer source
- **Event Tracking**: Problems solved, interviews completed, submissions, feature usage
- **User Analytics**: Interview progression, problem-solving trends, language distribution
- **Real-Time Dashboards**: Live user counts, active interviews, API latency

#### 12. Notification System (Multi-Channel)
- **Notification Types**: Feed, Popups, Banners, Push notifications (FCM)
- **Targeting**: All users, segments, role-based, engagement-based
- **Scheduling**: Immediate or future sends with optimal timing
- **Attribution**: Track read/click metrics per campaign

### 🎙️ **Tier 5: Voice & Accessibility**

#### 13. Sarvam AI Voice Integration
- **Multiple Speakers**: Manan, Shreya, Rohan, Jessica + more (6 options)
- **Low-Latency Streaming**: Real-time audio via MediaSource API
- **Video Sync**: Playback rate adjusted to audio amplitude
- **Fallback**: Browser speechSynthesis if Sarvam fails

### 🎮 **Tier 6: Interactive Learning Tools**

#### 14. Git Playground
- **6 Scenarios**: Branch/Merge, Hotfix, Conflict Resolution, Undo, Rebase, Stashing
- **Visual Feedback**: Commit graph, working tree visualization
- **Full Git Support**: All major commands supported
- **Goal-Based Learning**: Progressive complexity with objectives

#### 15. Web Development Sandbox
- **Templates**: Vanilla, React, Next.js, Node.js/Express
- **Live Editor**: Monaco Editor with hot reload
- **File System**: Create/edit/delete files
- **Persistence**: Auto-save to Firestore
- **Sharing**: Export as ZIP or share preview URLs

#### 16. Interactive Blog & Learning Content
- **SEO-Optimized Articles**: DSA, system design, career tips
- **Rich Content**: Code samples, diagrams, references
- **Schema Markup**: Google Rich Results support
- **Social Sharing**: OG tags for Twitter/LinkedIn

### 💰 **Tier 7: Monetization**

#### 17. Payment Integration (Razorpay)
- **Subscription Plans**: Spark (Free) vs Blaze (Premium)
- **Multiple Payment Methods**: Card, UPI, wallet, bank transfer
- **Email Notifications**: Receipts, expiry reminders, renewal confirmations
- **Plan Management**: Upgrade/downgrade, invoice history, cancellation

#### 18. Email Automation
- **EmailJS Integration**: Template-based emails
- **Types**: Welcome, payment receipts, expiry reminders, results, promotions
- **Multiple Accounts**: Redundancy and scalability
- **Scheduled Sends**: A/B testing and bounce handling

### 🤖 **Tier 8: Supplementary Features**

#### 19. Global AI Chat Agent (Jarvis)
- **Context-Aware**: Understands current page and user actions
- **RAG Integration**: Semantic search over knowledge base (Supabase pgvector)
- **Smart Actions**: Navigate pages, search courses, start interviews, schedule sessions
- **Personalization**: Reads user profile for tailored recommendations

#### 20. Social Connectivity
- **Connection System**: Add friends, follow users
- **Public Profiles**: View other users' achievements
- **Social Sharing**: Share results, portfolio links

---

## 🏗️ System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                       USER INTERFACE LAYER                           │
│  React 19.2 + Vite (Frontend)  |  Mobile Responsive  |  SPA Routing │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API & ORCHESTRATION LAYER                         │
│              Node.js/Express Backend Server (Render)                 │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Routes & Controllers                                       │   │
│  │  • Interview endpoints  • Code execution  • Admin routes    │   │
│  │  • Problem generation   • Payment hooks   • Notifications   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Core Services                                              │   │
│  │  ├─ interview.js       (Phase machine, scoring, evaluation)│   │
│  │  ├─ ai.js             (Gemini prompting, problem generation)│   │
│  │  ├─ executor.js       (Code compilation & execution)       │   │
│  │  ├─ scraper.js        (Web automation & job scraping)      │   │
│  │  └─ middleware/        (Auth, validation, error handling)  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Cron Jobs & Schedulers                                     ���   │
│  │  • Subscription expiry checks (9 AM IST daily)             │   │
│  │  • Keep-alive pings (every 12 mins)                        │   │
│  │  • Cache cleanup & optimization                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
    ┌────────────┐  ┌──────────┐  ┌────────────────┐
    │ DATABASES  │  │   APIs   │  │ EXTERNAL SVCS  │
    │            │  │          │  │                │
    │ Firebase:  │  │ • Gemini │  │ • Sarvam AI    │
    │ • Firestore│  │ • OpenAI │  │ • Razorpay     │
    │ • RTDB     │  │ • Supabase   │ • EmailJS      │
    │            │  │          │  │ • Firebase FCM │
    │ Supabase:  │  │ • SerpAPI    │ • AWS S3       │
    │ • PostgreSQL   │ • Playwright │ • Playwright   │
    │ • pgvector │  │          │  │                │
    └────────────┘  └──────────┘  └────────────────┘
```

### Component Interaction Flow

```
┌─────────────────┐
│  User Browser   │
└────────┬────────┘
         │ (HTTP/WebSocket)
         ▼
┌──────────────────────────────┐
│  React Frontend (Vite)       │
│  • Interview UI              │
│  • Code Editor               │
│  • Whiteboard                │
│  • Admin Dashboard           │
└────────┬─────────────────────┘
         │ (REST API / SSE)
         ▼
┌──────────────────────────────────────────────────────────┐
│  Express Backend Server                                  │
│                                                          │
│  Interview Flow:                                         │
│  1. User starts interview → Create Firestore doc        │
│  2. Send problem to Gemini → Get AI response            │
│  3. Inject UI actions to RTDB                           │
│  4. User submits code → Execute natively                │
│  5. Generate test results → SSE stream response         │
│  6. Evaluate interview → Calculate scores               │
│  7. Save report to Firestore                            │
└──────────────────────────────────────────────────────────┘
         │
    ┌────┴────┬──────────┬─────────────┬────────┐
    ▼         ▼          ▼             ▼        ▼
  Gemini  Firebase   Supabase     Sarvam   Razorpay
  (AI)    (Data)     (Vector DB)  (Voice)  (Payment)
```

### Data Flow Diagram - Interview Session

```
┌─────────────────────────────────────────────────────────────┐
│ Interview Session Lifecycle                                 │
└─────────────────────��───────────────────────────────────────┘

1. SETUP PHASE
   ┌─────────────┐
   │ User inputs:│
   │ • Role      │
   │ • Company   │
   │ • Problem   │
   │ • Language  │
   │ • Voice     │
   └──────┬──────┘
          │
          ▼
   ┌────────────────────────────────────────┐
   │ Backend creates interview session       │
   │ • Generate unique sessionId             │
   │ • Fetch problem boilerplate from cache  │
   │ • Create Firestore document             │
   │ • Initialize RTDB actions listener      │
   └────────────┬─────────────────────────────┘
                │
                ▼

2. INTERVIEW LOOP
   ┌────────────────────────────────────────┐
   │ Phase: OPENING                          │
   │ AI speaks problem statement             │
   │ → Sarvam TTS streams audio              │
   │ → Video plays with audio sync           │
   └────────────┬─────────────────────────────┘
                │
                ▼
   ┌────────────────────────────────────────┐
   │ User Input (Voice or Text)              │
   │ → Web Speech Recognition captures text  │
   │ → Added to transcript                   │
   │ → Sent to AI for response               │
   └────────────┬─────────────────────────────┘
                │
                ▼
   ┌────────────────────────────────────────┐
   │ AI Analysis & Response                  │
   │ • Parse transcript context              │
   │ • Determine phase transition            │
   │ • Generate UI actions                   │
   │ • Inject to RTDB for real-time updates  │
   │ • Response sent to Sarvam for TTS       │
   └────────────┬─────────────────────────────┘
                │
                ├─ Candidate types code
                │  └─ Real-time analysis (3s delay)
                │     • Detects errors
                │     • Calculates complexity
                │     • UI annotations injected
                │
                ├─ Candidate runs tests
                │  └─ Code execution
                │     • Compile & execute
                │     • Compare with expected
                │     • Stream results
                │
                └─ Phase transitions until "End"
                   └─ Loop repeats for each phase

3. EVALUATION PHASE
   ┌────────────────────────────────────────┐
   │ Interview Complete                      │
   │ • Transcript collected (all exchanges)  │
   │ • Final code captured                   │
   │ • Duration calculated                   │
   └────────────┬─────────────────────────────┘
                │
                ▼
   ┌────────────────────────────────────────┐
   │ Send Evaluation Request to Gemini       │
   │ • Problem statement                     │
   │ • Full transcript                       │
   │ • Final code                            │
   │ • Language & role context               │
   └────────────┬─────────────────────────────┘
                │
                ▼
   ┌────────────────────────────────────────┐
   │ Gemini Evaluation Response              │
   │ • Overall score (0-100)                 │
   │ • Hire recommendation                   │
   │ • Skill breakdown (6 dimensions)        │
   │ • Strengths & improvements              │
   │ • Code analysis                         │
   │ • Red flags (if any)                    │
   └────────────┬─────────────────────────────┘
                │
                ▼
   ┌────────────────────────────────────────┐
   │ Save to Firestore                       │
   │ • Store in interviews collection        │
   │ • Update user stats                     │
   │ • Trigger email notification            │
   └────────────┬─────────────────────────────┘
                │
                ▼
   ┌────────────────────────────────────────┐
   │ Display Score Report to User            │
   │ • Circular score badge                  │
   │ • Skill breakdown bars                  │
   │ • Transcript playback                   │
   │ • Download certificate                  │
   └────────────────────────────────────────┘
```

### Database Architecture

```
FIRESTORE (Document Store)
├── users/
│   └── {uid}
│       ├── displayName, email, plan, planExpiresAt
│       ├── resumeData (parsed from PDF)
│       ├── skills[], experience[], projects[]
│       └── preferredRole, bio, socialLinks
│
├── problems/
│   └── {problemId}
│       ├── title, difficulty, description
│       ├── constraints[], inputFormat, outputFormat
│       ├── code: {python, javascript, cpp, c, java, go, rust}
│       ├── wrapper: {python, javascript, cpp, c, java, go, rust}
│       ├── primaryTestCases[3]
│       └── submitTestCases[10-15]
│
├── interviews/
│   └── {interviewId}
│       ├── userId, role, company, language
│       ├── problemId, problemTitle, problemDifficulty
│       ├── transcript[] (messages with role, text, timestamp)
│       ├── scoreReport (evaluation result)
│       ├── status (in-progress, completed)
│       ├── notes, submissionCount, durationMinutes
│       └── createdAt, updatedAt
│
├── submissions/
│   └── {submissionId}
│       ├── userId, problemId, interviewId (optional)
│       ├── code, language, status (Accepted, WA, RE, TLE)
│       ├── output, expectedOutput, error
│       ├── executionTime, memoryUsed
│       └── createdAt
│
├── campaigns/
│   └── {campaignId}
│       ├── title, message, type (Feed, Popup, Banner)
│       ├── target (All, Premium, Inactive, etc.)
│       ├── status (Active, Ended, Scheduled)
│       ├── createdAt, endsAt, seenCount, clickCount
│       └── analytics (demographics, engagement)
│
├── admin_logs/
│   └── {logId}
│       ├── admin_uid, action, resource_type
│       ├── resource_id, old_value, new_value
│       ├── timestamp, ip_address
│       └── status (success, failure)
│
├── analytics_pageviews/
│   └── {viewId}
│       ├── user_id, path, referrer, timestamp
│       ├── device_type, os, browser
│       └── session_duration
│
└── youtubecourses/
    └── {courseId}
        ├── title, description, category
        ├── instructor, imageUrl, videoUrls[]
        ├── syllabus, prerequisites, timeline
        └── enrollments, ratings, reviews
```

### Real-Time Database (Firebase RTDB) Paths

```
sessions/
├── {sessionId}/
│   └── actions[]
│       ├── {action1}: {type: "highlight", startLine, endLine, color, message}
│       ├── {action2}: {type: "cursor", line, message}
│       ├── {action3}: {type: "comment", line, text}
│       ├── {action4}: {type: "banner", text, level}
│       └── {action5}: {type: "codeUpdate", code, startLine}
│
users/
├── {uid}/
│   ├── sessions[]  (active session tracking)
│   ├── deviceTokens[]  (FCM push tokens)
│   └── lastSeen (timestamp)
│
connectRequests/
├── {uid}/
│   ├── incoming[]  (connection requests received)
│   └── outgoing[]  (connection requests sent)
│
connections/
└── {uid}/
    └── connected[] (list of connected users)
```

---

## 💻 Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **Vite** | 7.3.1 | Build tool & dev server |
| **React Router DOM** | 7.13.1 | Client-side routing |
| **Tanstack React Query** | 5.90.21 | Data fetching & caching |
| **Monaco Editor** | 4.7.0 | Code editor integration |
| **Framer Motion** | 12.35.2 | Animations & transitions |
| **Lucide React** | 0.575.0 | Icon library |
| **Tailwind CSS / Custom CSS** | - | Styling |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | Runtime |
| **Express** | 5.2.1 | REST API framework |
| **Firebase Admin SDK** | 13.7.0 | Auth & database access |
| **@google/generative-ai** | 0.24.1 | Gemini API integration |
| **Supabase JS** | 2.100.1 | PostgreSQL + vector DB |
| **Playwright** | 1.59.1 | Browser automation |
| **Node-cron** | 4.2.1 | Scheduled jobs |
| **Razorpay** | 2.9.6 | Payment processing |
| **SerpAPI** | 2.2.1 | Search API |
| **UA-Parser-JS** | 2.0.9 | User-agent parsing |
| **ws** | 8.19.0 | WebSocket support |

### Infrastructure & Services
| Service | Purpose |
|---------|---------|
| **Firebase** | Authentication, Firestore, Realtime DB, Hosting, Cloud Messaging |
| **Render** | Backend server hosting, auto-scaling |
| **Supabase** | PostgreSQL database, pgvector for embeddings |
| **Gemini API** | AI interview, problem generation, evaluation |
| **Sarvam AI** | Text-to-speech with voice options |
| **AWS S3** | Resume & project file storage |
| **Razorpay** | Payment gateway & subscription management |
| **EmailJS** | Email automation & notifications |
| **Firebase FCM** | Push notifications |
| **GitHub Actions** | CI/CD & keep-alive automation |

---

## 📂 Project Structure

```
whizan-ai/
│
├── frontend/ (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIInterview.jsx           # Main interview interface
│   │   │   ├── Dashboard.jsx             # Code editor view
│   │   │   ├── ProblemList.jsx           # Problem directory
│   │   │   ├── SystemDesignBoard.jsx     # Whiteboard
│   │   │   ├── AdminPortal.jsx           # Admin dashboard
│   │   │   ├── NotificationManager.jsx   # Campaign manager
│   │   │   ├── ResumeOptimiser.jsx       # Resume parser
│   │   │   ├── JobApplier.jsx            # Job application UI
│   │   │   ├── Courses.jsx               # Course catalog
│   │   │   ├── GitPlayground.jsx         # Git learning simulator
│   │   │   ├── WebDevSandbox.jsx         # Cloud IDE
│   │   │   ├── BlogList.jsx              # Blog posts
│   │   │   ├── PortfolioLanding.jsx      # Portfolio builder
│   │   │   └── ...more components
│   │   │
│   │   ├── contexts/
│   │   │   ├── AuthContext.js            # User auth state
│   │   │   ├── TelemetryContext.js       # Analytics tracking
│   │   │   ├── AgentContext.js           # Global AI agent state
│   │   │   └── ...more contexts
│   │   │
│   │   ├── hooks/
│   │   │   ├── useInterviewSession.js    # Interview RTDB listener
│   │   │   ├── useTracking.js            # Analytics helper
│   │   │   ├── useDebounce.js            # Debounce utility
│   │   │   ├── useSEO.js                 # Meta tags & SEO
│   │   │   └── ...more hooks
│   │   │
│   │   ├── lib/
│   │   │   ├── api.js                    # API client with React Query
│   │   │   ├── firebase.js               # Firebase config
│   │   │   ├── fcm.js                    # Push notification setup
│   │   │   └── ...utilities
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminPortal.jsx           # Main admin layout
│   │   │   ├── AdminUsers.jsx            # User management
│   │   │   ├── AdminNotifications.jsx    # Campaign management
│   │   │   ├── AdminConfig.jsx           # System settings
│   │   │   └── AdminDashboard.jsx        # Health monitoring
│   │   │
│   │   ├── App.jsx                       # Main app + routing
│   │   ├── index.css                     # Global styles
│   │   ├── index.html
│   │   └── main.jsx
│   │
│   ├── public/
│   │   ├── female_speak1.mp4             # Jessica video
│   │   ├── male_manan.mp4                # Male voice videos
│   │   └── logo.jpeg
│   │
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── package.json
│   └── package-lock.json
│
├── backend/ (Node.js + Express)
│   ├── server.js                          # Express app entry point
│   │
│   ├── routes/
│   │   ├── interview.js                   # Interview endpoints
│   │   ├── problems.js                    # Problem generation endpoints
│   │   ├── execute.js                     # Code execution endpoints
│   │   ├── admin.js                       # Admin portal endpoints
│   │   ├── notifications.js               # Campaign endpoints
│   │   ├── payments.js                    # Razorpay webhook handlers
│   │   ├── auth.js                        # Firebase auth endpoints
│   │   └── users.js                       # User profile endpoints
│   │
│   ├── controllers/
│   │   ├── interviewController.js
│   │   ├── problemController.js
│   │   ├── executionController.js
│   │   └── adminController.js
│   │
│   ├── services/ (Core business logic)
│   │   ├── interview.js                   # Interview state machine, phase transitions
│   │   ├── ai.js                          # Gemini prompting, problem generation
│   │   ├── executor.js                    # Code compilation & execution
│   │   ├── evaluation.js                  # Interview scoring & reporting
│   │   ├── scraper.js                     # Web automation & job scraping
│   │   ├── email.js                       # Email service
│   │   ├── notification.js                # FCM push & campaign management
│   │   └── payment.js                     # Razorpay integration
│   │
│   ├── middleware/
│   │   ├── auth.js                        # Firebase token verification
│   │   ├── errorHandler.js                # Global error handling
│   │   ├── validation.js                  # Input validation
│   │   └── rateLimit.js                   # Rate limiting
│   │
│   ├── config/
│   │   ├── firebase.js                    # Firebase admin config
│   │   ├── supabase.js                    # Supabase config
│   │   ├── gemini.js                      # Gemini API config
│   │   └── env.js                         # Environment variables
│   │
│   ├── utils/
│   │   ├── logger.js                      # Logging utility
│   │   ├── errorCodes.js                  # Error constants
│   │   └── helpers.js                     # Helper functions
│   │
│   ├── cron/
│   ���   ├── subscriptionCheck.js           # Daily subscription expiry check
│   │   ├── keepAlive.js                   # Render sleep prevention
│   │   └── analytics.js                   # Periodic analytics aggregation
│   │
│   ├── models/
│   │   ├── schemas.js                     # Firestore schema definitions
│   │   └── validators.js                  # Data validation schemas
│   │
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── .github/workflows/
│   ├── deploy.yml                         # Deploy frontend to Firebase
│   ├── backend-deploy.yml                 # Deploy backend to Render
│   ├── keep-alive.yml                     # Ping Render every 12 minutes
│   └── tests.yml                          # Run tests on PR
│
├── docs/
│   ├── API_REFERENCE.md                   # Full API documentation
│   ├── DATABASE_SCHEMA.md                 # Detailed database structure
│   ├── DEPLOYMENT.md                      # Deployment guide
│   └── ARCHITECTURE.md                    # System architecture details
│
├── .env.example                           # Environment template
├── .gitignore
├── LICENSE
└── README.md (this file)
```

---

## ⚙️ Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Git**: 2.30.0 or higher
- **RAM**: 4GB minimum (8GB recommended)
- **Disk**: 2GB free space minimum

### Required Accounts & Services

1. **Firebase Project**
   - Firestore Database (enabled)
   - Realtime Database (enabled)
   - Authentication (Email/Password, Google, GitHub)
   - Cloud Messaging (for push notifications)
   - Storage (for file uploads)

2. **Google Cloud API Keys**
   - Gemini API enabled (at least 7 keys recommended for load balancing)
   - Vision API enabled (for resume parsing)

3. **Supabase Account**
   - PostgreSQL database
   - pgvector extension (for embeddings)

4. **External Service Credentials**
   - Sarvam AI API key
   - Razorpay API keys (test + live)
   - EmailJS account credentials
   - AWS S3 credentials (optional, for file storage)
   - Playwright dependencies (for web scraping)

### Browser Compatibility
- **Chrome/Chromium**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

---

## 🚀 Local Setup & Development

### Step 1: Clone the Repository

```bash
git clone https://github.com/Ayushkumar0602/Leetcode-orchestration.git
cd Leetcode-orchestration
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

This installs all frontend dependencies listed in root `package.json`.

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 4: Create Environment Files

#### Frontend `.env` (root directory)
```bash
# Copy example file (if available)
# Or create new file with:

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_API_BASE_URL=http://localhost:3001/api
VITE_ENV=development
```

#### Backend `.env` (backend directory)
```bash
# Gemini API Keys (load balanced - provide at least 3)
GEMINI_API_KEY_1=your_gemini_key_1
GEMINI_API_KEY_2=your_gemini_key_2
GEMINI_API_KEY_3=your_gemini_key_3
GEMINI_API_KEY_4=your_gemini_key_4
GEMINI_API_KEY_5=your_gemini_key_5
GEMINI_API_KEY_6=your_gemini_key_6
GEMINI_API_KEY_7=your_gemini_key_7

# Firebase
FIREBASE_SERVICE_ACCOUNT_KEY='{your_firebase_service_account_json_string}'

# Sarvam AI
SARVAM_API_KEY=your_sarvam_api_key

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# EmailJS
EMAILJS_PRIMARY_SERVICE_ID=your_service_id
EMAILJS_SECONDARY_SERVICE_ID=your_secondary_service_id
EMAILJS_TEMPLATE_REMINDER=your_template_id_1
EMAILJS_TEMPLATE_PAYMENT_SUCCESS=your_template_id_2
EMAILJS_TEMPLATE_PAYMENT_FAILED=your_template_id_3
EMAILJS_PUBLIC_KEY=your_public_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name

# Server Configuration
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug

# Session & Security
SESSION_SECRET=your_secure_random_string
JWT_SECRET=your_jwt_secret

# Render Server
RENDER_API_KEY=your_render_api_key (optional)
```

### Step 5: Initialize Firebase

```bash
# If using Firebase CLI (optional)
npm install -g firebase-tools
firebase login
firebase init
```

### Step 6: Database Setup (First Time)

The application uses Firestore with auto-initialization. First access will create collections. You can pre-populate test data:

```bash
cd backend
node scripts/seedDatabase.js  # (if seed script exists)
cd ..
```

---

## 🌍 Environment Variables

### Frontend Variables (`.env` in root)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase public API key | `AIzaSyC...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `my-project` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `my-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | `1:123456789:web:abc...` |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3001/api` |
| `VITE_ENV` | Environment (development/production) | `development` |

### Backend Variables (`.env` in backend)

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY_1-7` | Google Gemini API keys (min 3) | `AIzaSyC...` |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase service account JSON | `{...json...}` |
| `SARVAM_API_KEY` | Sarvam AI API key | `sarvam_...` |
| `SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJ...` |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret | `...secret...` |
| `EMAILJS_*` | EmailJS credentials | See EmailJS dashboard |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `...` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_S3_BUCKET` | S3 bucket name | `whizan-uploads` |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment | `development` |

---

## ▶️ Running the Application

### Development Mode (Full Stack)

#### Terminal 1: Start Backend Server

```bash
cd backend
npm start
```

Expected output:
```
[Backend] Server running on port 3001
[Backend] Firebase initialized
[Backend] Supabase connected
[Backend] Cron jobs scheduled
```

#### Terminal 2: Start Frontend Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v7.3.1  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Admin API Docs**: http://localhost:3001/api/docs (if swagger enabled)

### Development Tips

1. **Hot Module Replacement (HMR)**: Frontend automatically reloads on code changes
2. **Backend Auto-Restart**: Install `nodemon` for auto-restart on backend changes:
   ```bash
   npm install -g nodemon
   cd backend && nodemon server.js
   ```
3. **Debug Mode**: Set `LOG_LEVEL=debug` in `.env` for detailed logs
4. **Firebase Emulator** (Optional): For local Firebase testing:
   ```bash
   firebase emulators:start
   ```

---

## 📡 API Documentation

### Core API Endpoints

#### Authentication
```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
GET  /api/auth/current-user
```

#### Interview Management
```
POST   /api/interviews/save
GET    /api/interviews/{userId}
GET    /api/interviews/detail/{interviewId}
DELETE /api/interviews/{interviewId}
POST   /api/interview/chat
POST   /api/interview/analyze
POST   /api/interview/evaluate
```

**Interview Chat Request:**
```json
{
  "problem": {
    "title": "Two Sum",
    "description": "...",
    "difficulty": "Easy",
    "constraints": []
  },
  "role": "SDE-2",
  "company": "Google",
  "interviewPhase": "opening",
  "transcript": [
    {"role": "ai", "text": "..."},
    {"role": "user", "text": "..."}
  ],
  "currentCode": "...",
  "language": "python",
  "sessionId": "..."
}
```

**Interview Chat Response:**
```json
{
  "text": "Great approach! Now let's think about edge cases...",
  "nextPhase": "optimization",
  "uiActions": [
    {
      "type": "highlight",
      "startLine": 10,
      "endLine": 15,
      "color": "warning",
      "message": "Consider this section"
    }
  ]
}
```

#### Problem Management
```
GET    /api/problems
GET    /api/problems/{problemId}
POST   /api/generate
PATCH  /api/problems/{problemId}/regenerate
GET    /api/metadata
```

**Generate Problem Request:**
```json
{
  "problemStatement": "...",
  "language": "python",
  "problemId": 123
}
```

**Generate Problem Response:**
```json
{
  "problem": {
    "title": "...",
    "difficulty": "Medium",
    "description": "...",
    "constraints": [],
    "examples": []
  },
  "code": "class Solution:\n    def solve(self):\n        # Your code here\n        pass",
  "wrapper": "if __name__ == '__main__':\n    ...",
  "primaryTestCases": [...],
  "submitTestCases": [...]
}
```

#### Code Execution
```
POST /api/execute
POST /api/submit
GET  /api/execution/{jobId}
```

**Execute Code Request:**
```json
{
  "code": "print('Hello')",
  "language": "python",
  "input": "",
  "testCases": [
    {
      "input": "5",
      "expectedOutput": "Hello"
    }
  ]
}
```

**Execute Code Response:**
```json
{
  "results": [
    {
      "success": true,
      "output": "Hello",
      "error": null,
      "executionTime": 125,
      "memoryUsed": 8
    }
  ]
}
```

#### Admin Endpoints
```
GET    /api/admin/users
GET    /api/admin/users/{uid}
POST   /api/admin/users/{uid}/suspend
GET    /api/admin/db/{collection}
GET    /api/admin/db/{collection}/{docId}
PATCH  /api/admin/db/{collection}/{docId}
DELETE /api/admin/db/{collection}/{docId}
GET    /api/admin/health
GET    /api/admin/config
PATCH  /api/admin/config
POST   /api/admin/logs
```

**Health Check Response:**
```json
{
  "status": "healthy",
  "cpu": 25.5,
  "memory": {
    "rss": 256,
    "heap": 128,
    "heapUsed": 95
  },
  "uptime": 86400,
  "database": {
    "firestore": "connected",
    "rtdb": "connected",
    "supabase": "connected"
  },
  "timestamp": "2025-01-10T10:30:00Z"
}
```

#### Notification Endpoints
```
POST   /api/notifications/campaigns
GET    /api/notifications/campaigns
GET    /api/notifications/campaigns/{campaignId}
PATCH  /api/notifications/campaigns/{campaignId}
POST   /api/notifications/campaigns/{campaignId}/activate
GET    /api/notifications/campaigns/{campaignId}/analytics
DELETE /api/notifications/campaigns/{campaignId}
```

#### Payment Endpoints
```
POST /api/create-order
POST /api/verify-payment
GET  /api/payment-status
```

**Create Order Response:**
```json
{
  "success": true,
  "key_id": "rzp_live_...",
  "order": {
    "id": "order_...",
    "amount": 29900,
    "currency": "INR",
    "status": "created"
  }
}
```

---

## 🗄️ Database Schema

### Firestore Collections Overview

#### Users Collection
```javascript
{
  uid: "firebase_uid_123",
  displayName: "John Doe",
  email: "john@example.com",
  photoURL: "https://...",
  plan: "Blaze",  // Spark, Blaze
  planExpiresAt: Timestamp("2025-12-31"),
  createdAt: Timestamp("2024-01-01"),
  updatedAt: Timestamp("2024-12-31"),
  
  // Resume data (from PDF parsing)
  resumeData: {
    experience: [
      {
        company: "Google",
        role: "SDE-2",
        duration: "2020-2024",
        achievements: "..."
      }
    ],
    skills: ["Python", "React", "System Design"],
    education: {
      school: "IIT Delhi",
      degree: "BTech"
    },
    projects: [...]
  },
  
  // Profile
  preferredRole: "SDE-2",
  bio: "...",
  location: "San Francisco",
  socialLinks: {
    github: "https://github.com/...",
    linkedin: "https://linkedin.com/..."
  },
  
  // Stats
  interviewsCompleted: 15,
  problemsSolved: 234,
  totalScore: 1234,
  averageScore: 82.3,
  
  // Preferences
  theme: "dark",
  notifications: true,
  emailNotifications: true
}
```

#### Problems Collection
```javascript
{
  id: "problem_1",
  title: "Two Sum",
  difficulty: "Easy",
  description: "Given an array of integers nums...",
  
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9"
  ],
  
  inputFormat: "nums: Array of integers",
  outputFormat: "Index pair [i, j]",
  
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "nums[0] + nums[1] == 9"
    }
  ],
  
  code: {
    python: "class Solution:\n    def twoSum(self, nums, target):\n        # Your code here\n        pass",
    javascript: "var twoSum = function(nums, target) {\n    // Your code here\n};",
    cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n    }\n};",
    // ... other languages
  },
  
  wrapper: {
    python: "if __name__ == '__main__':\n    ...",
    javascript: "// wrapper code",
    // ... other languages
  },
  
  primaryTestCases: [
    {
      label: "Example 1",
      input: "2\n2 7 11 15\n9",
      expectedOutput: "0 1",
      displayInput: "nums = [2,7,11,15], target = 9"
    }
  ],
  
  submitTestCases: [
    {
      label: "Test 1 — normal",
      input: "...",
      expectedOutput: "...",
      displayInput: "..."
    },
    // ... 10-15 test cases total
  ],
  
  company: ["Google", "Meta", "Amazon"],
  topic: "Array",
  acceptanceRate: 47.3,
  submissions: 1234567,
  createdAt: Timestamp("2024-01-01"),
  updatedAt: Timestamp("2024-12-31")
}
```

#### Interviews Collection
```javascript
{
  id: "interview_abc123",
  userId: "user_123",
  role: "SDE-2",
  company: "Google",
  language: "python",
  interviewType: "DSA",  // DSA, SystemDesign
  
  // Problem details
  problemId: "problem_1",
  problemTitle: "Two Sum",
  problemDifficulty: "Easy",
  problemData: { /* full problem object */ },
  
  // Interview flow
  interviewPhase: "wrap-up",  // Current phase
  transcript: [
    {
      role: "ai",
      text: "Let's start with the problem statement...",
      timestamp: Timestamp("2024-12-31T10:00:00Z"),
      phase: "opening"
    },
    {
      role: "user",
      text: "We need to find two numbers that sum to target",
      timestamp: Timestamp("2024-12-31T10:00:15Z"),
      phase: "brute-force"
    }
    // ... more messages
  ],
  
  // Code submissions
  finalCode: "class Solution:\n    def twoSum(self, nums, target):\n        hashmap = {}\n        for i, num in enumerate(nums):\n            if target - num in hashmap:\n                return [hashmap[target - num], i]\n            hashmap[num] = i",
  submissionCount: 3,
  lastSubmission: Timestamp("2024-12-31T10:45:00Z"),
  
  // Evaluation
  scoreReport: {
    overallScore: 82,
    hire: "Hire",
    summary: "Strong problem-solving skills...",
    skills: {
      problemDecomposition: { score: 4, comment: "..." },
      communication: { score: 4, comment: "..." },
      codeQuality: { score: 3, comment: "..." },
      edgeCases: { score: 4, comment: "..." },
      optimization: { score: 4, comment: "..." },
      algorithmicThinking: { score: 5, comment: "..." }
    },
    strengths: ["Clear communication", "Good optimization..."],
    improvements: ["Consider more edge cases"],
    codeAnalysis: "The solution is correct and efficient...",
    redFlags: []
  },
  
  // Session data
  status: "completed",  // in-progress, completed
  notes: "Candidate explained approach well...",
  durationMinutes: 45,
  
  // Timestamps
  createdAt: Timestamp("2024-12-31T10:00:00Z"),
  updatedAt: Timestamp("2024-12-31T10:45:00Z"),
  
  // AI config
  selectedVoice: "manan",
  ttsEnabled: true
}
```

---

## 🌐 Deployment Guide

### Frontend Deployment (Firebase Hosting)

#### Prerequisites
```bash
npm install -g firebase-tools
firebase login
```

#### Deploy to Firebase

```bash
# Build frontend
npm run build

# Deploy
firebase deploy --only hosting
```

#### Auto-Deploy via GitHub Actions

Create `.github/workflows/firebase-deploy.yml`:
```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: your-project-id
```

### Backend Deployment (Render)

#### Deploy via Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Create new **Web Service**
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `npm install && npm run build` (if applicable)
   - **Start Command**: `node backend/server.js`
   - **Environment Variables**: Add all `.env` variables
5. Deploy

#### Configure Keep-Alive (Prevent Cold Starts)

Create `.github/workflows/render-keep-alive.yml`:
```yaml
name: Render Keep-Alive

on:
  schedule:
    - cron: '*/12 * * * *'  # Every 12 minutes

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Render API
        run: curl https://your-backend-url.onrender.com/api/health
```

#### Environment Variables on Render

Set all backend `.env` variables in Render Dashboard under "Environment":
```
GEMINI_API_KEY_1=...
FIREBASE_SERVICE_ACCOUNT_KEY=...
SARVAM_API_KEY=...
... (all other variables)
```

### Database Setup (Firestore & Supabase)

#### Firestore Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create/select project
3. Create Firestore Database (Start in production mode)
4. Create Realtime Database (optional, but recommended)
5. Enable Authentication methods
6. Download Service Account JSON → Add to backend `.env`

#### Supabase Setup
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project
3. Enable **pgvector** extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Create tables if needed
5. Get connection strings → Add to backend `.env`

### Infrastructure Monitoring

#### Monitor Render Backend
```bash
# Check server health
curl https://your-backend.onrender.com/api/health

# Response:
# {
#   "status": "healthy",
#   "cpu": 25.5,
#   "memory": {...},
#   "uptime": 86400,
#   "database": {...}
# }
```

#### Monitor Firebase
- Go to [Firebase Console](https://console.firebase.google.com)
- Check **Firestore Usage**, **Authentication**, **Storage**
- Monitor **Cloud Functions** (if used)

---

## ⚙️ Configuration

### Firebase Configuration

#### Firestore Rules
`firestore.rules`:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Problems are public read
    match /problems/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
    
    // Interviews: user can read own
    match /interviews/{interviewId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Admin logs: only admin can read
    match /admin_logs/{document=**} {
      allow read: if request.auth.token.admin == true;
    }
  }
}
```

#### Realtime Database Rules
`database.rules.json`:
```json
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": true,
        ".write": true
      }
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### Authentication Setup

#### Firebase Auth Providers
- Email/Password (enabled by default)
- Google OAuth (recommended)
- GitHub OAuth (recommended)
- GitHub Token for Render deployments

### API Rate Limiting

Edit `backend/middleware/rateLimit.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

module.exports = limiter;
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. **Backend won't start**

**Error**: `EADDRINUSE: address already in use :::3001`

**Solution**:
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm start
```

#### 2. **Gemini API rate limit exceeded**

**Error**: `429 Too Many Requests`

**Solution**:
- Add more API keys to `.env` (GEMINI_API_KEY_1-7)
- Reduce request frequency
- Implement request queuing (already done in backend)

#### 3. **Firebase connection error**

**Error**: `Error: Failed to get document because the client is offline.`

**Solution**:
```bash
# Check Firebase credentials
echo $FIREBASE_SERVICE_ACCOUNT_KEY | jq . > /dev/null

# Verify Firebase project settings
firebase projects:list
```

#### 4. **Code execution timeout**

**Error**: `Error: Execution Timed Out (Exceeded 15s)`

**Solution**:
- Increase timeout in `backend/executor.js` (not recommended)
- Optimize code logic
- Check for infinite loops in test input

#### 5. **MonacoEditor not loading**

**Error**: `Cannot find module @monaco-editor/react`

**Solution**:
```bash
cd frontend && npm install @monaco-editor/react --save
```

#### 6. **Firebase Emulator issues**

**Solution**:
```bash
# Clear emulator data
rm -rf ~/.cache/firebase/emulators/*

# Restart emulators
firebase emulators:start --clear
```

#### 7. **Supabase connection error**

**Error**: `ECONNREFUSED 127.0.0.1:5432`

**Solution**:
```bash
# Verify connection string in .env
# Format: postgresql://user:password@host:port/database

# Test connection
psql $SUPABASE_URL -U postgres
```

---

## 📚 Additional Documentation

- **[API Reference](./docs/API_REFERENCE.md)** — Detailed endpoint documentation
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** — Full Firestore/PostgreSQL structure
- **[Deployment Guide](./docs/DEPLOYMENT.md)** — Advanced deployment strategies
- **[Architecture Details](./docs/ARCHITECTURE.md)** — System design deep-dive

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Process

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Leetcode-orchestration.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make changes and commit**
   ```bash
   git commit -m 'Add amazing feature'
   ```

4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**

### Code Style

- **Frontend**: Follow React best practices, use functional components with hooks
- **Backend**: Use async/await, proper error handling, JSDoc comments
- **General**: 4-space indentation, meaningful variable names, no console.log in production

### Testing

```bash
# Frontend tests
npm run test

# Backend tests
cd backend && npm run test

# Linting
npm run lint
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini API** for AI capabilities
- **Firebase** for backend infrastructure
- **Sarvam AI** for voice integration
- **Render** for hosting
- **Supabase** for PostgreSQL + pgvector
- All contributors and users who help improve Whizan AI

---

## 📞 Support & Contact

- **Email**: support@whizan.xyz (if available)
- **GitHub Issues**: [Create an issue](https://github.com/Ayushkumar0602/Leetcode-orchestration/issues)
- **Discord**: [Join our community](link_to_discord) (if available)
- **Twitter**: [@WhizanAI](https://twitter.com/WhizanAI) (if available)

---

## 🚀 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] Collaborative coding sessions
- [ ] Video interview recordings & playback
- [ ] Advanced analytics dashboard
- [ ] ML-powered problem recommendations
- [ ] Integration with LeetCode API
- [ ] Leaderboards & gamification
- [ ] Mentorship matching system

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Active Development
