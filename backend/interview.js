require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const getApiKeys = () => {
    const keys = [];
    for (const [key, value] of Object.entries(process.env)) {
        if (key.startsWith('GEMINI_API_KEY') && value.trim()) {
            keys.push(...value.split(',').map(v => v.trim()).filter(v => v));
        }
    }
    return [...new Set(keys)];
};

async function callGemini(prompt, jsonMode = false) {
    const keys = getApiKeys();
    if (keys.length === 0) throw new Error('No Gemini API keys found.');

    let lastError;
    for (let i = 0; i < keys.length; i++) {
        try {
            console.log(`[Interview AI] Attempting generation with API key ${i + 1}/${keys.length}...`);
            const genAI = new GoogleGenerativeAI(keys[i]);
            const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
            const result = await model.generateContent(prompt);
            console.log(`[Interview AI] Generation successful on key ${i + 1}.`);
            return result.response.text().trim();
        } catch (error) {
            lastError = error;
            console.error(`[Interview AI] Error with key ${i + 1}:`, error.message || error);

            if (error.message?.includes('429')) {
                console.warn(`[Interview AI] Rate limit hit on key ${i + 1}. Falling back to next key...`);
            } else {
                console.warn(`[Interview AI] Unexpected error on key ${i + 1}. Falling back to next key...`);
            }
            continue;
        }
    }

    console.error(`[Interview AI] All ${keys.length} API keys failed. Last error:`, lastError);
    throw new Error(`[Interview AI] Generation failed. Reason: ${lastError?.message || lastError}`);
}

// ─── Chat prompt ────────────────────────────────────────────────────────────
function buildChatPrompt(problem, role, company, interviewPhase, transcript, currentCode, language) {
    const transcriptText = transcript.length > 0
        ? transcript.map(m => `${m.role === 'ai' ? 'INTERVIEWER' : 'CANDIDATE'}: ${m.text}`).join('\n')
        : '(Interview just started)';

    const phaseInstructions = {
        opening: 'Greet the candidate warmly but professionally. Briefly introduce yourself as a senior engineer at the company. Ask them to read the problem statement and share their initial thoughts. Do not give any hints yet.',
        'brute-force': 'The candidate should now propose a naive or brute-force approach. Encourage them to think out loud. Ask them about the time and space complexity of their approach. If they jump straight to the optimal, ask them to first walk through a simpler approach.',
        optimization: 'Challenge the candidate to improve on their initial approach. Ask probing questions about bottlenecks. If stuck, use graduated hints: Level 1 vague (can we preprocess something?), Level 2 medium (which data structure gives O(1) lookup?), Level 3 specific (have you considered using a hash map?). Never reveal the optimal solution.',
        coding: 'The candidate is now writing code. Stay mostly quiet and let them code. Occasionally ask about edge cases (empty arrays, negative numbers, overflow). If they make a clear logical error, ask a question that guides them to notice it without pointing it out directly.',
        'wrap-up': 'The candidate has finished coding. Ask about their testing strategy, what edge cases they considered, and how they would handle this problem at scale (10^8 inputs, distributed system, etc.). Probe the depth of their understanding.',
    };

    return `You are a senior software engineer conducting a technical interview at ${company} for the ${role} position.

PROBLEM: ${problem.title} (${problem.difficulty})
DESCRIPTION: ${problem.description}
CONSTRAINTS: ${(problem.constraints || []).join(' | ')}

CURRENT INTERVIEW PHASE: ${interviewPhase}
PHASE GUIDANCE: ${phaseInstructions[interviewPhase] || 'Continue the interview naturally based on the conversation.'}

CONVERSATION HISTORY:
${transcriptText}

CANDIDATE'S CURRENT CODE (${language}):
${currentCode ? currentCode : '(No code written yet)'}

STRICT BEHAVIORAL RULES:
1. You are NEUTRAL — never confirm or deny if an approach is correct through your tone.
2. Ask ONLY ONE focused question per response. Keep it conversational.
3. Maximum 3-4 short sentences. Sound human, not robotic.
4. Never write code or pseudocode for the candidate.
5. Never use markdown, bullet points, or formatting symbols.
6. Evaluate reasoning PROCESS, not just the final answer.
7. If the candidate asks a yes/no question, redirect: "What do you think?" or "Walk me through your reasoning."

Respond as the interviewer, speaking naturally as if in a real video call:`;
}

// ─── Code analysis prompt ────────────────────────────────────────────────────
function buildCodeAnalysisPrompt(code, language, problem) {
    return `You are an expert code reviewer analyzing a candidate's in-progress interview code.

PROBLEM: ${problem.title}
LANGUAGE: ${language}

CURRENT CODE:
\`\`\`${language}
${code}
\`\`\`

Analyze this code. Respond ONLY with a valid JSON object, no markdown fences:
{
  "isOnRightTrack": <true|false — is the overall approach reasonable?>,
  "hasLogicalError": <true|false>,
  "errorDescription": "<one-line description of the most important error, or null>",
  "complexity": {
    "time": "<O(?) — best guess based on algorithm structure>",
    "space": "<O(?)>"
  },
  "suggestedHint": "<A gentle, non-revealing hint to move them forward, or null if code is fine>",
  "missingEdgeCases": ["<edge case 1 they haven't handled>"]
}`;
}

// ─── Evaluation prompt ───────────────────────────────────────────────────────
function buildEvaluationPrompt(problem, role, company, transcript, finalCode, language) {
    const transcriptText = transcript
        .map(m => `${m.role === 'ai' ? 'INTERVIEWER' : 'CANDIDATE'}: ${m.text}`)
        .join('\n');

    return `You are an expert technical interview evaluator. Assess this ${role} interview at ${company}.

PROBLEM: ${problem.title} (${problem.difficulty})
FINAL CODE (${language}):
\`\`\`${language}
${finalCode || '(No code submitted)'}
\`\`\`

FULL INTERVIEW TRANSCRIPT:
${transcriptText}

Generate a thorough evaluation. Respond ONLY with a valid JSON object, no markdown fences:
{
  "overallScore": <integer 0-100>,
  "hire": "<Strong Hire | Hire | No Hire | Strong No Hire>",
  "summary": "<3-sentence overall assessment describing the candidate's performance>",
  "skills": {
    "problemDecomposition": { "score": <1-5>, "comment": "<one concise sentence>" },
    "communication":        { "score": <1-5>, "comment": "<one concise sentence>" },
    "codeQuality":          { "score": <1-5>, "comment": "<one concise sentence>" },
    "edgeCases":            { "score": <1-5>, "comment": "<one concise sentence>" },
    "optimization":         { "score": <1-5>, "comment": "<one concise sentence>" },
    "algorithmicThinking":  { "score": <1-5>, "comment": "<one concise sentence>" }
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement area 1>", "<improvement area 2>"],
  "codeAnalysis": "<2-sentence analysis of the final code quality, correctness, and approach>",
  "redFlags": ["<any red flag observed, or empty array if none>"]
}`;
}

// ─── Exports ─────────────────────────────────────────────────────────────────
async function getInterviewerResponse(problem, role, company, interviewPhase, transcript, currentCode, language) {
    const prompt = buildChatPrompt(problem, role, company, interviewPhase, transcript, currentCode, language);
    return await callGemini(prompt);
}

async function analyzeCode(code, language, problem) {
    if (!code || code.trim().length < 15) return null;
    const prompt = buildCodeAnalysisPrompt(code, language, problem);
    const raw = await callGemini(prompt);
    try {
        const cleaned = raw
            .replace(/^```json\s*/i, '').replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '').trim();
        return JSON.parse(cleaned);
    } catch {
        return null;
    }
}

async function evaluateInterview(problem, role, company, transcript, finalCode, language) {
    const prompt = buildEvaluationPrompt(problem, role, company, transcript, finalCode, language);
    const raw = await callGemini(prompt);
    try {
        const cleaned = raw
            .replace(/^```json\s*/i, '').replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '').trim();
        return JSON.parse(cleaned);
    } catch {
        throw new Error('Failed to parse evaluation response: ' + raw.slice(0, 300));
    }
}

module.exports = { getInterviewerResponse, analyzeCode, evaluateInterview, callGemini };
