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
            let model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

            try {
                const result = await model.generateContent(prompt);
                console.log(`[Interview AI] Generation successful on key ${i + 1}.`);
                return result.response.text().trim();
            } catch (innerError) {
                // If 503 (Service Unavailable) or 429 (Too Many Requests), try the fallback model immediately with the same key
                if (innerError.message?.includes('503') || innerError.message?.includes('429')) {
                    console.warn(`[Interview AI] 503/429 error on key ${i + 1}. Falling back to gemini-3.1-flash-lite-preview...`);
                    model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
                    const fallbackResult = await model.generateContent(prompt);
                    console.log(`[Interview AI] Fallback generation successful on key ${i + 1}.`);
                    return fallbackResult.response.text().trim();
                }
                throw innerError; // Rethrow other errors to be caught by the outer block
            }
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
    // Trim to last 12 messages to reduce token usage while keeping recent context
    const recent = transcript.slice(-12);
    const transcriptText = recent.length > 0
        ? recent.map(m => `${m.role === 'ai' ? 'I' : 'C'}: ${m.text}`).join('\n')
        : '(Interview just started)';

    const PHASES = ['opening', 'brute-force', 'optimization', 'coding', 'wrap-up'];

    const phaseInstructions = {
        opening: 'Greet warmly, introduce yourself as a senior engineer. Ask candidate to read the problem and share initial thoughts. No hints yet.',
        'brute-force': 'Ask candidate to propose a naive/brute-force approach. Encourage thinking out loud. Ask about time/space complexity.',
        optimization: 'Challenge candidate to improve their approach. Ask probing questions about bottlenecks. Use graduated hints only if stuck. Never reveal the solution.',
        coding: 'Candidate is coding. Stay quiet, let them code. Occasionally probe edge cases. If logical error, ask leading questions — never point it out directly.',
        'wrap-up': 'Candidate finished coding. Ask about testing strategy, edge cases considered, and scalability (10^8 inputs, distributed system).',
    };

    const phaseTransitionRules = {
        opening: 'Advance to "brute-force" once candidate has acknowledged the problem and shared at least one initial observation or question about it.',
        'brute-force': 'Advance to "optimization" once candidate has clearly described a working naive/brute-force approach AND stated its time/space complexity.',
        optimization: 'Advance to "coding" once candidate has articulated a concrete optimized approach and is ready to implement it.',
        coding: 'Advance to "wrap-up" once the candidate explicitly states they are done coding, or if a code submission result was reported in the conversation.',
        'wrap-up': 'Do NOT advance. This is the final phase.',
    };

    const currentPhaseIndex = PHASES.indexOf(interviewPhase);
    const nextPhase = currentPhaseIndex < PHASES.length - 1 ? PHASES[currentPhaseIndex + 1] : null;

    return `You are a senior engineer interviewing a candidate at ${company} for ${role}.

PROBLEM: ${problem.title} (${problem.difficulty})
${problem.description}
CONSTRAINTS: ${(problem.constraints || []).join(' | ')}

PHASE: ${interviewPhase}
GUIDANCE: ${phaseInstructions[interviewPhase]}

TRANSCRIPT (I=Interviewer, C=Candidate):
${transcriptText}

CANDIDATE CODE (${language}): ${currentCode || '(none yet)'}
${currentCode ? `(${currentCode.split('\n').length} lines)` : ''}

RULES:
1. Be neutral — never confirm/deny correctness through tone.
2. Ask exactly ONE focused question per response. Sound human, not robotic.
3. Max 3-4 short sentences. No markdown, bullets, or code snippets.
4. Evaluate reasoning process, not just the answer.
5. If candidate asks yes/no, redirect: "What do you think?" or "Walk me through it."

PHASE TRANSITION:
- Next phase available: ${nextPhase || 'none (already in final phase)'}
- Transition rule: ${phaseTransitionRules[interviewPhase]}
- Set nextPhase to "${nextPhase}" ONLY if the transition rule is clearly satisfied. Otherwise null.
- STRICT RULE: If the transcript says "(Interview just started)", you MUST set nextPhase to null. Only greet the candidate. Do not advance.
- Never skip phases. Never go backwards.

UI ACTIONS (optional, only include when candidate has written code and it adds real value):
You may include a "uiActions" array to interact with the candidate's editor in real time.
Each action has a "type" field. Supported types:
- highlight: {"type":"highlight","startLine":<1-based>,"endLine":<1-based>,"color":"warning"|"error"|"info"|"success","message":"<short label>"}
- cursor: {"type":"cursor","line":<1-based>,"message":"<short tooltip>"}
- comment: {"type":"comment","line":<1-based>,"text":"<concise inline note, max 10 words>"}
- banner: {"type":"banner","text":"<hint or instruction, max 15 words>","level":"hint"|"warning"|"success"}
- codeUpdate: {"type":"codeUpdate","code":"<the exact string of code to insert or replace with>","startLine":<line to start replacement, or null to append>}
Rules:
- Include at most 2 actions per response — be surgical, not spammy.
- Only reference lines that plausibly exist (use line count above as a bound).
- Omit "uiActions" entirely (or set to []) if no code is written or no action is relevant.
- Never reveal the full solution through actions.

RESPONSE FORMAT — respond ONLY with this JSON, nothing else:
{"text":"<your natural spoken response>","nextPhase":"<phase or null>","uiActions":[]}

Replace nextPhase with the target phase name string (not quoted null) if advancing, else use null (no quotes).
Replace uiActions with an array of action objects, or [] if none.`;
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
