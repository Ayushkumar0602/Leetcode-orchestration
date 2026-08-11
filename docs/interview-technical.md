# Interview — Technical Documentation

## Overview
The `backend/interview.js` module serves as the core orchestration layer for an AI-driven technical interview system. It encapsulates the logic for interacting with Google’s Gemini API, managing conversational state across multiple interview phases, performing real-time code analysis, and generating final performance evaluations.

## Architecture
This module acts as the **AI Service Provider** within the backend.
- **Dependencies:** `dotenv` (environment configuration) and `@google/generative-ai` (Gemini SDK).
- **Upstream:** It is consumed by controllers (likely WebSocket or HTTP handlers) that process candidate inputs and manage interview sessions.
- **Role:** It abstracts the complexity of prompt engineering and LLM communication, providing clean, function-based APIs for the rest of the application.

## Design Principles
- **Robustness (Resilient API Consumption):** The module implements an "API Key Pool" pattern. It automatically rotates through multiple provided keys if it encounters rate limits (HTTP 429) or transient errors, ensuring session continuity.
- **Separation of Concerns:** Prompt construction is decoupled from the execution logic, allowing for easy adjustment of personas and evaluation rubrics without modifying the core API communication code.
- **JSON-First Communication:** To ensure reliable downstream processing, the module enforces JSON output formatting from the AI, with internal logic designed to sanitize and parse these responses before passing them to the caller.

## API Reference

### `callGemini(prompt)`
*   **Purpose:** Low-level interface to the Gemini API.
*   **Parameters:** `prompt` (string).
*   **Returns:** `Promise<string>` (The AI's raw response).
*   **Logic:** Executes a fallback loop across all `GEMINI_API_KEY` environment variables.

### `getInterviewerResponse(...)`
*   **Purpose:** Generates the next conversational turn based on current interview state.
*   **Parameters:** `problem`, `role`, `company`, `interviewPhase`, `transcript`, `currentCode`, `language`.
*   **Returns:** `Promise<string>` (JSON-formatted string).

### `analyzeCode(code, language, problem)`
*   **Purpose:** Evaluates code in real-time to provide hints or detect logic errors.
*   **Returns:** `Promise<Object|null>` (The parsed JSON analysis or `null` if the code is too short/analysis fails).

### `evaluateInterview(...)`
*   **Purpose:** Post-interview analysis.
*   **Returns:** `Promise<Object>` (Structured evaluation object).

## Internal Logic
The module relies on a **state-machine approach** for the interview flow:
1.  **Phase Enforcement:** `buildChatPrompt` defines a sequence of phases (`opening` -> `brute-force` -> `optimization` -> `coding` -> `wrap-up` -> `end`).
2.  **State Transition:** The AI is provided with specific transition rules per phase. It determines whether to advance based on whether the user meets the criteria (e.g., "shared initial observations").
3.  **Prompt Engineering:** The prompt uses "Persona-based conditioning" (Senior Engineer) and strict constraints (Socratic questioning, non-disclosure of solutions) to ensure the AI behaves like a human interviewer.
4.  **UI Feedback:** The system leverages a custom `uiActions` protocol (highlight, cursor, banner, etc.) that the frontend can parse to update the IDE in real-time.

## Data Flow
1.  **Input:** Raw candidate transcript, code, and problem metadata are passed to the module.
2.  **Transformation:** Data is mapped into structured prompts designed for the `gemini-3.1-flash-lite-preview` model.
3.  **Execution:** The module attempts to fetch a completion. Upon 429 errors, it iterates to the next available key.
4.  **Parsing:** The raw string response is cleaned of Markdown code fences and passed through `JSON.parse`.
5.  **Output:** A clean JSON object is returned to the controller for dispatching to the client.

## Error Handling & Edge Cases
- **Rate Limiting:** If a key returns a `429` error, the module logs the event, flags the specific key, and immediately attempts the next key in the pool.
- **Parsing Failures:** `analyzeCode` and `evaluateInterview` include `try-catch` blocks with regex-based cleaning (`.replace(/^```json\s*/i, '')`) to ensure that even if the AI wraps JSON in markdown, it is still parsable.
- **Empty Keys:** If no API keys are found or configured in the environment, the module throws a hard error immediately.

## Usage Example

### Generating an Interview Response
```javascript
const response = await getInterviewerResponse(
    problem, 
    'Backend Engineer', 
    'Google', 
    'coding', 
    transcript, 
    code, 
    'javascript'
);
const data = JSON.parse(response);
// { "text": "...", "nextPhase": "wrap-up", "uiActions": [...] }
```

### Analyzing Candidate Code
```javascript
const analysis = await analyzeCode(code, 'python', problem);
if (analysis && analysis.hasLogicalError) {
    console.log("Hint:", analysis.suggestedHint);
}
```