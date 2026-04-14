# Whizan AI - LLM Context

This document is designed to provide Large Language Models with context about the Whizan AI codebase, features, and platform goals. 

## 1. Advanced AI Interview Features (Source Context: llm_reefer.md)

Whizan AI is an advanced AI-driven interview preparation platform designed to simulate authentic FAANG-level technical interviews. It includes modules for both Data Structures & Algorithms (DSA) and System Design.

### Strictness Modes & Proctoring
The platform enforces interview authenticity via 4 escalating strictness levels:
1. **Low Mode**: Chill & helpful. Focuses on learning. No proctoring.
2. **Mid Mode**: Balanced feedback. Blocks right-click and penalizes alt-tabs or print screens.
3. **Strict Mode**: Requires mandatory fullscreen. AI Proctor active (face/object detection). UI blurs for 5 seconds upon cheating attempts. Exiting fullscreen yields a malpractice strike.
4. **Real Interview Mode**: Strict constraints plus early termination for multiple violations. Represents real-world interview pressure.

### AI Proctor: Real-Time Violation Detection
- **Face & Head Pose Analysis**: Powered by TinyFaceDetector + FaceLandmark68Net. Detects if there's no face, multiple faces, or excessive head turns/looking away (using yaw/pitch ratio). Flags warnings.
- **Object Detection**: Powered by COCO-SSD (MobileNet-V2). Actively searches for prohibited items like phones, tablets, or books with a 30% confidence rate.
- **OS/Browser Monitoring**: Blurs screen and logs malpractice if it intercepts PrintScreen, `document.visibilitychange` blur, or mouse leaving the viewport.

### Real-Time AI Feedback (Editor Actions)
Using Firebase Realtime Database (RTDB), the AI actively injects feedback directly into the candidate's editor UI:
- **Highlights**: Highlights code lines to warn of bugs or praise good practices.
- **AI Cursor**: A specific pointer indicating logical errors with hints.
- **Inline Comments**: Floating socratic hints for specific blocks of code.
- **Banners**: Temporary 8-second global alerts (warnings, success).
- **Code Updates**: Injecting boilerplate code dynamically into the user's view.

### Live Code Analysis
The platform analyzes user code automatically. Triggers after 3 seconds of no typing:
- Analyzes Time and Space complexity.
- Checks edge cases and structural promises.

### Real-Time Interaction (Speech & Video)
- **6-Phase Flow**: Opening -> Brute-Force -> Optimization -> Coding -> Wrap-up -> End.
- **Speech**: AI speaks using Sarvam TTS (6 different character voices). The user's input is captured via Web Speech Recognition.
- **Avatar Sync**: Avatar UI syncs playback rate against real-time Audio RMS chunks for natural lip-syncing.

### DSA vs System Design
- **DSA Mock**: Auto-generated 15+ test cases. Evaluates on 6 axes: Problem Decomposition, Communication, Code Quality, Edge Case Handling, Optimization, Algorithmic Thinking.
- **System Design Mock**: Covers HLD (scalability) and LLD (design patterns). Features an Interactive Whiteboard with AI architecture probing.

### Comprehensive Evaluation Report
Generates a detailed scorecard indicating:
- Hire Recommendation (e.g., STRONG HIRE).
- Score out of 100 with 6-dimension breakdown.
- Detailed strengths, weaknesses, and red flags.
- Comprehensive transcription of the voice dialogue and final code complexity analysis.

## 2. Project Architecture & Pages (Context: Codebase src/)

Whizan's AI Interview ecosystem relies on several specialized React components within the `src/` directory. These modular files represent the distinct stages of the mock interview lifecycle.

### Core Interview Pages (In-Session)
- **`AIInterview.jsx`**: The main DSA mock interview workspace. Hosts the primary code editor panel, the AI avatar video feed, AI proctoring components, and Firebase RTDB listeners for live feedback injections.
- **`SystemDesignInterview.jsx` & **`AISystemDesignInterview.jsx`**: Specialized pages for System Design (HLD & LLD). Features a specialized Interactive Whiteboard designed for architecture diagramming while receiving real-time audio probing from the AI.
- **`OARound.jsx`**: The Online Assessment simulator. Primarily relies on the strictness mode architecture but shifts focus aggressively toward test-case validation and rigid numeric scoring instead of conversational flow.

### Interview Routing & Configuration
- **`AIInterviewSelect.jsx` & `CompanyInterviewSelect.jsx`**: The discovery hubs where students configure their targets. Users select a role, filter by target company (e.g., Google, Amazon), or pick an algorithmic roadmap to initiate their customized interview pipeline.
- **`AIInterviewSchedule.jsx`**: The orchestrator for custom interview sequences. Defines the chronological flow for candidates (e.g., Stage 1: OA -> Stage 2: Technical Round -> Stage 3: System Design).
- **`OARoundSelect.jsx`**: Targeted selection interface for picking distinct online assessments tied to specific companies or topics.

### Analytics & Results
- **`InterviewEvaluation.jsx`**: The post-interview analytic dashboard. Visualizes the final 6-axis performance scorecard (using radial/bar charts), surfaces the text transcript from the voice session, evaluates final code blocks, and returns the formal Hire/No-Hire verdict.
- **`InfoAIInterview.jsx`**: An informational splash component meant to preemptively educate users regarding the 4 strictness modes, microphone permissions, and the penalty system prior to booting the AI proctor.
