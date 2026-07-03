# Ai — Technical Documentation

## Overview
The `backend/ai.js` module serves as the central AI orchestration layer for the Whizan AI platform. It encapsulates all interactions with Google’s Gemini API, providing specialized services for code generation, pedagogical content optimization, project analysis, and an autonomous browser-based agent ("Jarvis") for web-based task automation.

## Architecture
This module acts as a service provider within the backend, sitting between API routes and external AI infrastructure.

*   **Dependencies:**
    *   `@google/generative-ai`: Core LLM integration.
    *   `firebase/firestore`: Used for caching generated problem data and user interview schedules.
    *   `@supabase/supabase-js`: Facilitates RAG (Retrieval-Augmented Generation) by querying vector-embedded knowledge bases.
    *   `axios`: External HTTP communication for model fallbacks (e.g., NVIDIA/Mistral).
*   **Dependents:** Used by Express controllers/routes responsible for DSA question management, portfolio generation, course management, and the automated browser agent interface.

## Design Principles
*   **Resiliency & Multi-Key Rotation:** The system employs an array-based key rotation strategy. If one API key reaches a quota limit (HTTP 429) or returns a transient error (HTTP 503), the service automatically attempts the next available key and model fallback.
*   **Caching First:** Firestore acts as a primary cache to minimize latency and AI costs for repeat requests (e.g., standard coding problems).
*   **Tool-Augmented Generation:** Uses Gemini’s function-calling capabilities to bridge the AI model with database operations and external navigation.
*   **Grounded Logic:** Employs RAG to provide context-specific information, ensuring the agent uses accurate "platform knowledge" rather than hallucinations.

## API Reference

### `generateCodeAndTests(problemStatement, language, problemId)`
Generates language-specific code stubs and test cases.
*   **Parameters:** `problemStatement` (string), `language` (string), `problemId` (string).
*   **Returns:** A Promise resolving to an object containing problem metadata, code skeletons, and test cases.

### `chatWithAgent(messages, contextUrl, pageActions, pageContent, userProfile)`
An omniscient conversational agent providing real-time platform assistance.
*   **Key Capability:** Uses function calling to trigger `navigate_to_page`, `search_courses`, and interview scheduling.

### `evaluateBrowserSnapshot(snapshot, previousActions, userPrompt, selectedModel)`
The brain of the autonomous browser agent. Evaluates DOM snapshots to determine the next action (click, type, navigate, etc.).
*   **Key Capability:** Implements an "Anti-Loop Guard" to detect repeated action patterns and force re-snapshots to prevent execution deadlocks.

## Internal Logic
1.  **Generation Pipeline:** AI requests are wrapped in a `try-catch` loop that iterates through all `GEMINI_API_KEY_*` variables in `process.env`.
2.  **RAG Integration:** Before hitting the model, user prompts are converted to embeddings. These are compared against Supabase's `match_knowledge` RPC function to retrieve relevant system documentation or workflows, which are then injected into the `systemInstruction`.
3.  **JSON Sanitization:** The module strictly enforces pure JSON output, stripping Markdown fencing (` ```json `) before parsing.
4.  **Browser Agent Lifecycle:** The agent operates on a `(Snapshot -> Decision -> Action)` cycle. Decisions are validated against an `ALLOWED_ACTIONS` whitelist to ensure safety and system integrity.

## Data Flow
1.  **Input:** User request (text or DOM snapshot) enters via API route.
2.  **Transformation:**
    *   **Context injection:** Adds user profile, RAG results, and system instructions.
    *   **Generation:** Model returns a raw response.
    *   **Sanitization:** String manipulation removes Markdown markers.
3.  **Persistence:** Cached results are persisted to Firestore; browser state changes trigger navigation or tool executions.
4.  **Output:** Structured JSON is returned to the client or the acting service.

## Error Handling & Edge Cases
*   **Rate Limits:** Detects 429/503 errors and attempts model fallback (e.g., `gemini-3-flash` to `gemini-3.1-flash-lite`).
*   **Ungrounded Actions:** Browser agent rejects actions that use non-existent DOM selectors (e.g., selectors not prefixed with `el-`).
*   **Action Loops:** If the model suggests the same action signature multiple times, the system injects a `wait` (re-snapshot) command to break the cycle.

## Usage Example

### Generating Problem Data
```javascript
const ai = require('./backend/ai');
const data = await ai.generateCodeAndTests(
    "Implement a function to find the sum of two integers.", 
    "python", 
    "101"
);
console.log(data.code); // Returns the Python skeleton
```

### Engaging the Browser Agent
```javascript
const decision = await ai.evaluateBrowserSnapshot({
    url: "https://google.com",
    snapshotText: "..."
}, [], "Search for jobs in London");
// Returns: { thought: "...", actions: [{action: 'navigate', value: '...'}] }
```