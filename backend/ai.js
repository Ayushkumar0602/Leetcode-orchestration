require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('./firebase');
const { doc, getDoc, setDoc } = require('firebase/firestore');

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
    { "label": "Example 1", "input": "exact stdin string", "expectedOutput": "exact stdout string" },
    { "label": "Example 2", "input": "...", "expectedOutput": "..." },
    { "label": "Example 3", "input": "...", "expectedOutput": "..." }
  ],
  "submitTestCases": [
    { "label": "Test 1 — normal", "input": "...", "expectedOutput": "..." },
    { "label": "Test 2 — edge: empty / min", "input": "...", "expectedOutput": "..." },
    { "label": "Test 3 — corner: max size", "input": "...", "expectedOutput": "..." },
    { "label": "Test n — [generate all possible edge and corner cases]", "input": "...", "expectedOutput": "..." }
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
        return {
          problem: cached.problem,
          primaryTestCases: cached.primaryTestCases,
          submitTestCases: cached.submitTestCases,
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

      let result;
      try {
        result = await model.generateContent(prompt);
      } catch (innerError) {
        if (innerError.message?.includes('503') || innerError.message?.includes('429')) {
          console.warn(`[AI] 503/429 error on key ${i + 1}. Falling back to gemini-3.1-flash-lite-preview...`);
          model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
          result = await model.generateContent(prompt);
          console.log(`[AI] Fallback generation successful on key ${i + 1}.`);
        } else {
          throw innerError;
        }
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
          primaryTestCases: parsed.primaryTestCases,
          submitTestCases: parsed.submitTestCases,
          code: parsed.code[language],
          wrapper: parsed.wrapper[language]
        };

      } catch (e) {
        throw new Error('Gemini returned invalid JSON: ' + text.slice(0, 300));
      }
    } catch (error) {
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

module.exports = { generateCodeAndTests, extractProjectDetails };
