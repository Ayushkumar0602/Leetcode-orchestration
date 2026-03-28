require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('./firebase');
const { doc, getDoc, setDoc, collection, getDocs, query, where } = require('firebase/firestore');

// Get all API keys from environment variables
const getApiKeys = () => {
  const keys = [];
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('GEMINI_API_KEY') && value.trim()) {
      keys.push(...value.split(',').map(v => v.trim()).filter(v => v));
    }
  }
  return [...new Set(keys)];
};

/**
 * Builds a strict, structured prompt for Gemini to parse a problem statement
 * and return boilerplate code + test cases as JSON for ALL languages at once.
 */
function buildPrompt(problemStatement) {
  const langInstructions = {
    python: `
- Use a class named "Solution" with all required instance methods.
- Each method parameter must use Python type hints (int, str, List[int], List[List[int]], etc.).
- The method body should contain "pass" and a comment "# Your code here".
- Do NOT include if __name__ == "__main__" or any execution wrapper.
`.trim(),
    javascript: `
- Use a plain JavaScript object literal or individual "var funcName = function(...) {}" function expressions for each required function.
- Use standard JS types (no TypeScript).
- Function body should contain "// Your code here".
- Do NOT include any invocation / driver code.
`.trim(),
    cpp: `
- ALWAYS start with ALL required #include headers for the problem (e.g. #include <vector>, #include <string>, #include <algorithm>, #include <unordered_map>, etc.).
- ALWAYS add "using namespace std;" immediately after the includes.
- Declare a class named "Solution" with all required public methods.
- Use proper C++ types (int, long long, string, vector<int>, vector<vector<int>>, etc.).
- Method body should contain "// Your code here" and a dummy return.
- Do NOT include int main() or any execution wrapper.
`.trim(),
    c: `
- ALWAYS start with ALL required #include headers (e.g. #include <stdio.h>, #include <stdlib.h>, #include <string.h>, etc.) needed for the problem.
- Declare standalone functions (no class).
- Use proper C types (int, long, char*, int[], etc.).
- Function body should contain "// Your code here" and a dummy return.
- Do NOT include int main() or any execution wrapper.
`.trim(),
    java: `
- Declare a class named "Solution" with all required public methods.
- Use proper Java types (int, long, String, int[], int[][], List<Integer>, etc.).
- Method body should contain "// Your code here".
- Do NOT include public class Main or any execution wrapper.
`.trim(),
    go: `
- Declare package main and any required imports.
- Declare standalone functions (no struct or class).
- Use proper Go types (int, int64, string, []int, [][]int, etc.).
- Function body should contain "// Your code here".
- Do NOT include func main() or any execution wrapper.
`.trim(),
    rust: `
- Declare a struct named "Solution" and impl block with all required pub fn methods.
- Use proper Rust types (i32, i64, String, &str, Vec<i32>, Vec<Vec<i32>>, etc.).
- Function body should contain "// Your code here".
- Do NOT include fn main() or any execution wrapper.
`.trim(),
  };

  return `
You are an expert competitive programming assistant. Analyze the following problem statement and respond ONLY with a valid JSON object — no markdown, IMP - > no code blocks, IMP - > no explanation.

⛔ DO NOT SOLVE THE PROBLEM. Do NOT write any algorithm, logic, or implementation in the "code" field.
   The "code" field must ONLY contain empty function stubs with a dummy return and a comment saying "// Your code here".
   The human user will write the actual solution themselves.

PROBLEM STATEMENT:
"""
${problemStatement}
"""

TARGET LANGUAGES: python, javascript, cpp, c, java, go, rust

LANGUAGE-SPECIFIC RULES FOR "code" FIELD:
You must generate the SKELETON code for EVERY listed language. Follow these idiomatic patterns:
Python: ${langInstructions.python}
JavaScript: ${langInstructions.javascript}
C++: ${langInstructions.cpp}
C: ${langInstructions.c}
Java: ${langInstructions.java}
Go: ${langInstructions.go}
Rust: ${langInstructions.rust}

─── CRITICAL RULES FOR "wrapper" FIELD ───────────────────────────────────────
The "wrapper" is the driver code that is appended DIRECTLY after "code" to form a complete, runnable program.
You must generate the wrapper for EVERY listed language.

⚠️  MOST IMPORTANT RULE: The wrapper MUST READ ALL INPUTS FROM STDIN — it must NEVER hardcode any values.
The "input" field of each test case is piped to the program's stdin. The wrapper must parse exactly that format.

Input format convention (follow strictly):
- A 2D array [[1,2],[3,4]] is given as:
    Line 1: number of rows
    Line 2: space-separated values of row 0
    Line 3: space-separated values of row 1
    etc.
- A 1D array [1,2,3] is given as: space-separated values on a single line
- A single int/string is given as a single line
- Multiple parameters are given as multiple consecutive lines in order

Output format convention:
- Print each result element on one line (or space-separated on one line for arrays)
- For 2D arrays: print each row as space-separated values on its own line

Language-specific wrapper implementation:
Python: Start with: if __name__ == "__main__":, use sys.stdin.read() or input() to parse ALL inputs from stdin
JavaScript: Use process.stdin to read ALL inputs from stdin
C++: Write a complete int main() that uses std::cin to parse ALL inputs
C: Write a complete int main() that uses scanf to parse ALL inputs
Java: Write: public class Main { public static void main(String[] args) ... }, use Scanner(System.in)
Go: Write: func main() { ... }, use fmt.Scan or bufio.Scanner
Rust: Write: fn main() { ... }, use std::io::BufRead

─── TEST CASE FORMAT ───────────────────────────────────────────────────────────
The "input" field of each test case must use the EXACT same format the wrapper reads from stdin.
The "expectedOutput" must be the EXACT stdout the wrapper prints for a correct solution.

RESPONSE FORMAT (pure JSON — no markdown wrapping):
{
  "problem": {
    "title": "Short descriptive problem title (e.g. 'Set Matrix Zeroes')",
    "difficulty": "Easy | Medium | Hard",
    "description": "Clear 2-3 sentence description of what the function(s) should do, written in plain English.",
    "inputFormat": "Describe each parameter and its type on a new line, e.g.: 'matrix: 2D integer array (m x n)'",
    "outputFormat": "Describe what should be returned or printed",
    "constraints": [
      "1 <= m, n <= 200",
      "-2^31 <= matrix[i][j] <= 2^31 - 1"
    ],
    "examples": [
      {
        "input": "matrix = [[1,1,1],[1,0,1],[1,1,1]]",
        "output": "[[1,0,1],[0,0,0],[1,0,1]]",
        "explanation": "Since matrix[1][1] == 0, its entire row and column are set to 0."
      }
    ]
  },
  "functions": [
    {
      "name": "functionName",
      "signature": "full function signature in target language",
      "paramTypes": ["type1", "type2"],
      "paramNames": ["param1", "param2"],
      "returnType": "returnType"
    }
  ],
  "code": {
    "python": "complete python SKELETON class/function",
    "javascript": "complete javascript SKELETON function",
    "cpp": "complete cpp SKELETON class/function",
    "c": "complete c SKELETON function",
    "java": "complete java SKELETON class/function",
    "go": "complete go SKELETON function",
    "rust": "complete rust SKELETON struct/impl"
  },
  "wrapper": {
    "python": "stdin-parsing driver code for python",
    "javascript": "stdin-parsing driver code for javascript",
    "cpp": "stdin-parsing driver code for cpp",
    "c": "stdin-parsing driver code for c",
    "java": "stdin-parsing driver code for java",
    "go": "stdin-parsing driver code for go",
    "rust": "stdin-parsing driver code for rust"
  },
  "primaryTestCases": [
    { "label": "Example 1", "input": "exact stdin string", "expectedOutput": "exact stdout string", "displayInput": "A beautifully formatted string explicitly showing parameter names and values, e.g. 'nums = [1, 2, 3], k = 1'" },
    { "label": "Example 2", "input": "...", "expectedOutput": "...", "displayInput": "..." },
    { "label": "Example 3", "input": "...", "expectedOutput": "...", "displayInput": "..." }
  ],
  "submitTestCases": [
    { "label": "Test 1 — normal", "input": "...", "expectedOutput": "...", "displayInput": "..." },
    { "label": "Test 2 — edge: empty / min", "input": "...", "expectedOutput": "...", "displayInput": "..." },
    { "label": "Test 3 — corner: max size", "input": "...", "expectedOutput": "...", "displayInput": "..." },
    { "label": "Test n — [generate all possible edge and corner cases]", "input": "...", "expectedOutput": "...", "displayInput": "..." }
  ]
}

ABSOLUTE RULES:
1. "wrapper" MUST read from stdin — NEVER hardcode any value. Wrong answer = hardcoded wrapper.
2. "primaryTestCases" MUST have EXACTLY 3 readable examples.
3. "submitTestCases" MUST BE EXHAUSTIVE. Generate as many cases as needed (at least 10-15) to cover EVERY possible edge case, corner case, constraint boundary, negative value, and stress scenario.
4. "input" and "expectedOutput" must be 100% consistent with what the stdin-reading wrapper produces.
5. "code" MUST be a SKELETON ONLY — function signatures + dummy return + "// Your code here" comment. NO algorithm, NO logic, NO solution whatsoever.
6. VIOLATION: If "code" contains any real algorithm or loop that solves the problem, that is a CRITICAL ERROR.
7. Return ONLY valid JSON. No markdown fences, no extra text whatsoever.
`.trim();
}

/**
 * Calls Gemini to generate boilerplate code + test cases for the given problem.
 * Utilizes Firebase Firestore to cache the results for all languages for instant loading.
 */
async function generateCodeAndTests(problemStatement, language, problemId) {
  // 1. Check Cache first
  if (problemId) {
    try {
      const docRef = doc(db, "problems", String(problemId));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log(`[Cache Hit] Returning cached problem ${problemId} for language: ${language}`);
        const cached = docSnap.data();
        const sanitizeLabel = (tc, i, prefix) => {
          const raw = tc.label || tc.name || '';
          return (raw && raw !== '-' && raw.trim()) ? raw : `${prefix} ${i + 1}`;
        };
        return {
          problem: cached.problem,
          primaryTestCases: (cached.primaryTestCases || []).map((tc, i) => ({
            ...tc,
            label: sanitizeLabel(tc, i, 'Example'),
          })),
          submitTestCases: (cached.submitTestCases || []).map((tc, i) => ({
            ...tc,
            label: sanitizeLabel(tc, i, 'Test'),
          })),
          code: cached.code[language],
          wrapper: cached.wrapper[language],
        };
      }
    } catch (err) {
      console.error("[Cache Error] Failed to read from Firestore:", err);
    }
  }

  // 2. Cache Miss - Generate with AI
  const keys = getApiKeys();
  if (keys.length === 0) {
    throw new Error("No Gemini API keys found in .env");
  }

  const prompt = buildPrompt(problemStatement);
  let lastError;

  for (let i = 0; i < keys.length; i++) {
    const currentKey = keys[i];
    try {
      console.log(`[AI] Attempting generation with API key ${i + 1}/${keys.length}...`);
      const genAI = new GoogleGenerativeAI(currentKey);
      let model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

      const startTime = Date.now();
      let result;
      try {
        if (global.aiStats) global.aiStats.totalCalls++;
        result = await model.generateContent(prompt);
      } catch (innerError) {
        if (innerError.message?.includes('503') || innerError.message?.includes('429')) {
          console.warn(`[AI] 503/429 error on key ${i + 1}. Falling back to gemini-3.1-flash-lite-preview...`);
          model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
          if (global.aiStats) global.aiStats.totalCalls++;
          result = await model.generateContent(prompt);
          console.log(`[AI] Fallback generation successful on key ${i + 1}.`);
        } else {
          throw innerError;
        }
      }

      if (global.aiStats) {
        const latency = Date.now() - startTime;
        global.aiStats.recentLatencies.push(latency);
        if (global.aiStats.recentLatencies.length > 50) global.aiStats.recentLatencies.shift();
      }

      const text = result.response.text().trim();

      const cleaned = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
        console.log(`[AI] Generation successful on key ${i + 1}.`);

        // 3. Save to Cache
        if (problemId) {
          try {
            const docRef = doc(db, "problems", String(problemId));
            await setDoc(docRef, parsed);
            console.log(`[Cache Miss -> Saved] Problem ${problemId} cached in Firestore.`);
          } catch (err) {
            console.error("[Cache Save Error] Failed to write to Firestore:", err);
          }
        }

        // Return only the requested language
        return {
          problem: parsed.problem,
          primaryTestCases: parsed.primaryTestCases.map(tc => ({
            label: tc.label || 'Example',
            input: String(tc.input),
            expectedOutput: String(tc.expectedOutput),
            displayInput: tc.displayInput ? String(tc.displayInput) : undefined
          })),
          submitTestCases: parsed.submitTestCases.map(tc => ({
            label: tc.label || 'Submit Test',
            input: String(tc.input),
            expectedOutput: String(tc.expectedOutput),
            displayInput: tc.displayInput ? String(tc.displayInput) : undefined
          })),
          code: parsed.code[language],
          wrapper: parsed.wrapper[language]
        };

      } catch (e) {
        throw new Error('Gemini returned invalid JSON: ' + text.slice(0, 300));
      }
    } catch (error) {
      if (global.aiStats) global.aiStats.failedCalls++;
      lastError = error;
      console.error(`[AI] Error with key ${i + 1}:`, error.message || error);
      if (error.message && error.message.includes('429')) {
        console.warn(`[AI] Rate limit hit on key ${i + 1}. Falling back to next key...`);
      } else {
        console.warn(`[AI] Unexpected error on key ${i + 1}. Falling back to next key...`);
      }
      continue;
    }
  }

  console.error(`[AI] All ${keys.length} API keys failed. Last error:`, lastError);
  throw new Error(`AI generation failed after trying all ${keys.length} API keys. Last error: ${lastError?.message || lastError}`);
}

/**
 * Extracts structured project details from a GitHub README using Gemini.
 */
async function extractProjectDetails(readmeText) {
  const keys = getApiKeys();
  if (keys.length === 0) throw new Error("No Gemini API keys found");

  const prompt = `
You are a technical project analyzer. Analyze the provided GitHub README content and extract structured data for a professional portfolio.
Respond ONLY with a valid JSON object. Do not include markdown blocks or any other text.

README CONTENT:
"""
${readmeText.slice(0, 15000)}
"""

STRUCTURED JSON FORMAT (Return exactly this):
{
  "name": "Project Name",
  "tagline": "A one-sentence catchy tagline",
  "overview": "Detailed 2-3 paragraph overview of the project",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "techStack": ["Tech 1", "Tech 2"],
  "installation": ["Step 1", "Step 2"],
  "usage": "Brief usage instructions",
  "screenshots": [],
  "demoUrl": "link if found",
  "highlights": ["Notable accomplishment or complexity solved"],
  "projectStructure": [
    { "name": "src", "type": "folder", "children": [ { "name": "App.js", "type": "file" } ] },
    { "name": "package.json", "type": "file" }
  ]
}

Rules:
1. If content is missing for a field, provide a reasonable summary or leave empty array/null.
2. Keep the overview professional and engaging.
3. TechStack should be the main languages/frameworks.
`.trim();

  let lastError;
  for (let i = 0; i < keys.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(keys[i]);
      const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' }); // Use flash for speed/cost
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      lastError = error;
      console.warn(`[AI Project] Key ${i + 1} failed:`, error.message);
      continue;
    }
  }
  throw new Error(`AI Project Extraction failed: ${lastError?.message}`);
}

/**
 * Regenerates or modifies specific parts of a problem using Gemini.
 */
async function regenerateProblemData(instruction, originalData) {
  const keys = getApiKeys();
  if (keys.length === 0) throw new Error("No Gemini API keys found");

  const prompt = `
You are an expert competitive programming assistant.
An administrator wants to modify an existing coding problem.

ORIGINAL PROBLEM JSON:
"""
${JSON.stringify(originalData, null, 2)}
"""

INSTRUCTION FROM ADMIN:
"""
${instruction}
"""

You must return the ENTIRE updated problem JSON in the exact same schema.
Apply the admin's requested changes (e.g., adding edge cases, fixing typos, changing the story).
Do NOT include any markdown blocks or explanation. ONLY return valid JSON.
`.trim();

  let lastError;
  for (let i = 0; i < keys.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(keys[i]);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      // Map displayInput explicitly just like generation
      if (parsed.primaryTestCases) {
        parsed.primaryTestCases = parsed.primaryTestCases.map(tc => ({
          label: tc.label || 'Example',
          input: String(tc.input),
          expectedOutput: String(tc.expectedOutput),
          displayInput: tc.displayInput ? String(tc.displayInput) : undefined
        }));
      }
      if (parsed.submitTestCases) {
        parsed.submitTestCases = parsed.submitTestCases.map(tc => ({
          label: tc.label || 'Submit Test',
          input: String(tc.input),
          expectedOutput: String(tc.expectedOutput),
          displayInput: tc.displayInput ? String(tc.displayInput) : undefined
        }));
      }

      return parsed;
    } catch (error) {
      lastError = error;
      console.warn(`[AI Regenerate] Key ${i + 1} failed:`, error.message);
      continue;
    }
  }
  throw new Error(`AI Regeneration failed: ${lastError?.message}`);
}

/**
 * Optimizes course content fields using Gemini.
 */
async function optimizeCourseContent(text, field) {
  const keys = getApiKeys();
  if (keys.length === 0) throw new Error("No Gemini API keys found");

  let formatInstruction = "";
  if (field === 'description') {
    formatInstruction = "Format as an engaging 2-3 paragraph overview highlighting the core value proposition.";
  } else if (field === 'timeline') {
    formatInstruction = "Format as a clean markdown list using emojis (e.g., ⏱ **Total Duration:**, 📅 **Suggested Timeline:**).";
  } else if (field === 'flow') {
    formatInstruction = "Format as a structured list of modules. Use '### 📌 Module X: [Title]' followed by a bulleted list of topics.";
  } else if (field === 'syllabus') {
    formatInstruction = "Format as a detailed curriculum breakdown. Use '#### 1. [Section]' followed by bullet points with emojis for each topic.";
  } else if (field === 'prerequisite') {
    formatInstruction = "Format as a bulleted checklist using ✅ for each requirement.";
  }

  const prompt = `
You are an expert instructional designer and technical course creator.
Please optimize the following ${field} for a new professional YouTube course.

INSTRUCTIONS:
1. Make the text engaging, well-structured, clear, and professional.
2. ${formatInstruction}
3. Do not add any Markdown code block wrappers like \`\`\` around the entire response. Just return the optimized text directly.

ORIGINAL TEXT:
"""
${text}
"""
`.trim();

  let lastError;
  for (let i = 0; i < keys.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(keys[i]);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
      const result = await model.generateContent(prompt);
      let optimizedText = result.response.text().trim();

      // Remove generic markdown code wrappers if ai includes them 
      optimizedText = optimizedText.replace(/^```[a-zA-Z]*\n/i, '').replace(/\n```$/i, '').trim();

      return optimizedText;
    } catch (error) {
      lastError = error;
      console.warn(`[AI Optimize Course Content] Key ${i + 1} failed:`, error.message);
      continue;
    }
  }
  throw new Error(`AI Optimization failed: ${lastError?.message}`);
}

/**
 * Global AI Agent Chat
 * Allows the user to chat with the Whizan AI agent with context of their current page.
 */
async function chatWithAgent(messages, contextUrl, pageActions = [], pageContent = null) {
  const keys = getApiKeys();
  if (keys.length === 0) throw new Error("No Gemini API keys found");

  const systemInstruction = `
You are Jarvis, the global omniscient AI agent for Whizan AI.
Your purpose is to help the user with anything they need inside the platform.
The user is currently viewing this URL path: "${contextUrl}".
${pageContent ? `
--- CURRENT PAGE VISION ---
Here is a text snapshot of what the user is currently seeing on their screen:
"""
${pageContent.text || "No text available"}
"""

And here are some clickable links currently visible to them:
${JSON.stringify(pageContent.links || [])}
---------------------------
` : ""}
Use this context to understand what they might be asking about.
Be extremely helpful, concise, and friendly.
Always respond in beautifully formatted Markdown.

If the user explicitly asks to go to a page or you determine the best way to help them is by navigating, you MUST use the navigate_to_page tool.
Available routes on Whizan AI include:
- /: Landing Page
- /login: Login & Signup
- /dashboard: User Dashboard (Stats/Progress)
- /profile: Settings & Profile Management
- /chat: Global Chat
- /dsaquestion: DSA Problem Directory
- /solvingpage/:id: DSA Code Editor(ex -/solvingpage/1)(1-twosum , 2- add two numbers , and similary like leetcode numbering )
- /submissions: Previous Code Submissions
- /aiinterviewselect: Setup Mock AI Interview
- /aiinterview/:id: AI Mock Interview Room
- /infoaiinterview: Past Interview History
- /evaluation/:interviewId: Interview Score Report
- /systemdesign: System Design Homepage
- /systemdesign/hld: High-Level Design Topics
- /systemdesign/lld: Low-Level Design Topics
- /revise/systemdesign/hld/:topicId: HLD Study Content
- /aisystemdesigninterview/:id: AI System Design Mock
- /courses: Full Course Catalog
- /courses/:slug: Course Info Page
- /learn/:slug:/lecture: lecture page(where course lectures comes )->only enrolled user 
- /portfolio: Public Portfolio Landing
- /public/:uid: User Public Profile
- /blog: Blog List Feed
`.trim();

  const navigateTool = {
    name: "navigate_to_page",
    description: "Navigate the user to a specific page or route in the application.",
    parameters: {
      type: "OBJECT",
      properties: {
        path: {
          type: "STRING",
          description: "The exact URL path to navigate to, e.g. /profile, /courses, /systemdesign/hld",
        },
      },
      required: ["path"],
    },
  };

  const searchCoursesTool = {
    name: "search_courses",
    description: "Search for available courses in the database by keyword or topic.",
    parameters: {
      type: "OBJECT",
      properties: {
        keyword: {
          type: "STRING",
          description: "The search keyword, e.g. 'system design', 'react', 'algorithms'."
        }
      },
      required: ["keyword"]
    }
  };

  const allFunctionDeclarations = [navigateTool, searchCoursesTool];
  if (Array.isArray(pageActions) && pageActions.length > 0) {
    allFunctionDeclarations.push(...pageActions);
  }

  let lastError;
  for (let i = 0; i < keys.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(keys[i]);
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.1-flash-lite-preview',
        systemInstruction: systemInstruction,
        tools: [{ functionDeclarations: allFunctionDeclarations }]
      });

      // Gemini expects format: { role: "user" | "model", parts: [{text: "..."}] }
      const formattedHistory = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const latestMessage = messages[messages.length - 1]?.content || "";

      const chat = model.startChat({
        history: formattedHistory,
      });

      let result = await chat.sendMessage(latestMessage);

      let maxLoops = 5;
      while (maxLoops > 0) {
        maxLoops--;
        const functionCalls = result.response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
          const call = functionCalls[0];

          if (call.name === 'navigate_to_page') {
            return {
              type: 'action',
              action: 'navigate',
              path: call.args.path,
              message: `Taking you to ${call.args.path}...`
            };
          } else if (call.name === 'search_courses') {
            // Execute backend tool natively
            try {
              const snap = await getDocs(collection(db, 'youtubecourses'));
              const courses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
              const kw = (call.args.keyword || "").toLowerCase();
              const matches = courses.filter(c =>
                (c.title && c.title.toLowerCase().includes(kw)) ||
                (c.description && c.description.toLowerCase().includes(kw)) ||
                (c.category && c.category.toLowerCase().includes(kw))
              ).slice(0, 5); // Return top 5 matches

              const simplifiedResponse = matches.map(c => ({
                title: c.title,
                description: c.description,
                instructor: c.instructor,
                url: `/learn/${c.slug || c.id}`
              }));

              // Send the result back to Gemini implicitly
              result = await chat.sendMessage([{
                functionResponse: {
                  name: 'search_courses',
                  response: { courses: simplifiedResponse }
                }
              }]);
            } catch (err) {
              result = await chat.sendMessage([{
                functionResponse: {
                  name: 'search_courses',
                  response: { error: err.message }
                }
              }]);
            }
          } else {
            // It's a dynamic page action execution (frontend)
            return {
              type: 'action',
              action: 'page_action',
              functionName: call.name,
              args: call.args,
              message: `Executing action: ${call.name.split('_').join(' ')}...`
            };
          }
        } else {
          // No function calls, just text
          return result.response.text();
        }
      }

      return result.response.text();

    } catch (error) {
      lastError = error;
      console.warn(`[AI Agent Chat] Key ${i + 1} failed:`, error.message);
      continue;
    }
  }
  throw new Error(`AI Agent Chat failed: ${lastError?.message}`);
}

module.exports = { generateCodeAndTests, extractProjectDetails, regenerateProblemData, optimizeCourseContent, chatWithAgent };
