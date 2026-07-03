# Add linkedin workflow — Technical Documentation

## Overview
`add_linkedin_workflow.js` is a utility script designed to seed the application's vector knowledge base with domain-specific instructions for LinkedIn job application automation. It bridges the gap between high-level user intent (e.g., "apply to this job") and specific, machine-executable UI interaction sequences required to navigate LinkedIn's dynamic DOM.

## Architecture
This module acts as a **Database Seeding/Initialization Script**. 
*   **Upstream:** It consumes environment configurations and the Google Generative AI SDK to generate vector embeddings.
*   **Downstream:** It populates the `knowledge_base` table in Supabase.
*   **Consumption:** The primary consumers of this data are the AI Agent modules that retrieve these instructions via vector similarity search when the user triggers a job application workflow.

## Design Principles
*   **Idempotency:** The script proactively deletes existing records matching the `title` "LinkedIn Apply Workflow" before insertion. This ensures that repeated execution does not result in duplicate entries or stale instruction sets.
*   **Separation of Concerns:** Prompt engineering (the domain logic) is decoupled from the execution engine. By storing instructions in the database, the agent can update its "behavior" without needing a codebase redeployment.
*   **Configuration Resilience:** Uses a fallback mechanism for the Supabase service key, ensuring the script remains operable even if specific environment variables are malformed, though this is primarily a development-time safety net.

## API Reference

### `run()`
An `async` function that executes the core logic of the module.
*   **Returns:** `Promise<void>`
*   **Side Effects:**
    1.  Communicates with Google Gemini API to generate embeddings for the LinkedIn workflow.
    2.  Performs a `DELETE` operation on the Supabase `knowledge_base` table.
    3.  Performs an `INSERT` operation to sync the latest prompt instructions to the vector database.

## Internal Logic
1.  **Environment Initialization:** Loads credentials for Supabase and Google Gemini. It parses multiple `GEMINI_API_KEY` variants to support rotation or multi-key configurations.
2.  **Prompt Definition:** Defines a rigid, step-by-step state machine logic ("LinkedIn Apply Workflow") to prevent the AI from hallucinating navigation steps.
3.  **Embedding Generation:** Uses `gemini-embedding-001` to convert the `embedText` ("...apply to jobs linkedin apply workflow...") into a vector. This vector is what allows the agent to retrieve this specific instruction set during a semantic search query.
4.  **Database Sync:** Synchronizes the instruction content and its corresponding vector into the `knowledge_base` table using a `randomUUID` for the primary key.

## Data Flow
1.  **Input:** Hardcoded logic strings and configuration environment variables.
2.  **Transformation:** The `content` (the prompt) is sent to Google's API to generate a high-dimensional embedding vector.
3.  **Storage:** The `content`, `embedding`, and metadata (`url`, `type`) are persisted in the Supabase PostgreSQL database.
4.  **Exit:** Logs success or failure to `stdout/stderr`.

## Error Handling & Edge Cases
*   **Missing API Keys:** If no `GEMINI_API_KEY` is detected, the script terminates execution (`process.exit(1)`) to prevent partial or broken deployment.
*   **Insertion Failures:** Database errors during the `insert` process are caught and logged to `console.error` to provide visibility for debugging without crashing the runtime environment.
*   **Prompt Stability:** The script explicitly uses an ID-based deletion (`.eq('title', title)`) to prevent collisions, as the table structure does not explicitly enforce a unique constraint on the title field.

## Usage Example
This script is intended to be run via the command line as part of a deployment pipeline or a manual setup task:

```bash
# Ensure .env is populated with SUPABASE_URL, SUPABASE_SERVICE_KEY, and GEMINI_API_KEY
node backend/add_linkedin_workflow.js
```

**As a dependency:**
While designed as a standalone script, the logic encapsulates the "source of truth" for the LinkedIn workflow. If you need to update the agent's behavior, modify the `content` string within the `run()` function and re-execute the script.