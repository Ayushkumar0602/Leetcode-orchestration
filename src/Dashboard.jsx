import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
    Play, Send, Loader2, CheckCircle2, XCircle,
    AlertCircle, Sparkles, ChevronDown, ChevronUp,
    Terminal, Trophy, AlertTriangle, Clock, ArrowLeft,
    RotateCcw, AlignLeft, LogOut, Bookmark
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import BookmarkModal from './BookmarkModal';
import NavProfile from './NavProfile';

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const LANGUAGE_TEMPLATES = {
    python: 'class Solution:\n    def solve(self):\n        # Your code here\n        pass',
    javascript: 'var solve = function() {\n    // Your code here\n};',
    cpp: '#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        // Your code here\n    }\n};',
    c: '#include <stdio.h>\n\nvoid solve() {\n    // Your code here\n}',
    java: 'class Solution {\n    public void solve() {\n        // Your code here\n    }\n}',
    go: 'package main\n\nimport "fmt"\n\nfunc solve() {\n    fmt.Println("Hello")\n}',
    rust: 'struct Solution;\n\nimpl Solution {\n    pub fn solve() {\n        // Your code here\n    }\n}'
};

const LANGUAGE_WRAPPERS = {
    python: '\nif __name__ == "__main__":\n    solution = Solution()\n    solution.solve()',
    javascript: '\nsolve();',
    cpp: '\nint main() {\n    Solution solution;\n    solution.solve();\n    return 0;\n}',
    c: '\nint main() {\n    solve();\n    return 0;\n}',
    java: '\npublic class Main {\n    public static void main(String[] args) {\n        Solution solution = new Solution();\n        solution.solve();\n    }\n}',
    go: '\nfunc main() {\n    solve()\n}',
    rust: '\nfn main() {\n    Solution::solve();\n}'
};

const LANG_LABEL = {
    python: 'Python 3', javascript: 'JavaScript', cpp: 'C++',
    c: 'C', java: 'Java', go: 'Go', rust: 'Rust'
};

const DIFFICULTY_COLOR = { Easy: '#00b8a3', Medium: '#ffa116', Hard: '#ef4743' };

export default function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const { id: routeId } = useParams();
    const { currentUser, logout } = useAuth();

    const [language, setLanguage] = useState(
        () => localStorage.getItem('codearena_lang') || 'python'
    );
    const [code, setCode] = useState(LANGUAGE_TEMPLATES.python);
    const [isRouted, setIsRouted] = useState(false);

    // UX Features State
    const [leftWidth, setLeftWidth] = useState(500);
    const [isDragging, setIsDragging] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const editorRef = useRef(null);
    const timerIntervalRef = useRef(null);

    // Problem
    const [problemStatement, setProblemStatement] = useState('');
    const [problemTitle, setProblemTitle] = useState('Problem Statement');
    const [difficulty, setDifficulty] = useState('Medium');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [aiWrapper, setAiWrapper] = useState(null);
    const [problemData, setProblemData] = useState(null); // structured AI problem object
    const [aiPanelOpen, setAiPanelOpen] = useState(true);
    const [liveStats, setLiveStats] = useState(null); // live Firestore stats

    // Test cases
    const [primaryCases, setPrimaryCases] = useState([
        { id: 1, label: 'Example 1', input: '', expectedOutput: '' }
    ]);
    const [submitCases, setSubmitCases] = useState([]);
    const [activeTab, setActiveTab] = useState(0); // index in primaryCases

    // Results
    const [runResults, setRunResults] = useState(null);   // array matching primaryCases
    const [submitResult, setSubmitResult] = useState(null);
    const [submitProgress, setSubmitProgress] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [consoleOpen, setConsoleOpen] = useState(false);
    const [bookmarkOpen, setBookmarkOpen] = useState(false);

    // Submission History
    const [consoleTab, setConsoleTab] = useState('testcase'); // 'testcase' | 'submissions'
    const [submissionHistory, setSubmissionHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [expandedSub, setExpandedSub] = useState(null); // submission id whose code is visible

    const getWrapper = () => aiWrapper !== null ? aiWrapper : (LANGUAGE_WRAPPERS[language] || '');

    // ─── UX Handlers & Effects ──────────────────────────────────────
    useEffect(() => {
        if (isTimerRunning) {
            timerIntervalRef.current = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerIntervalRef.current);
        }
        return () => clearInterval(timerIntervalRef.current);
    }, [isTimerRunning]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const newWidth = Math.max(300, Math.min(e.clientX, window.innerWidth - 300));
            setLeftWidth(newWidth);
        };
        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleFormat = async () => {
        if (!editorRef.current) return;
        const currentCode = editorRef.current.getValue();

        try {
            let formatted = currentCode;

            if (language === 'javascript') {
                // Use Prettier for JS
                const prettier = await import('prettier');
                const babelPlugin = await import('prettier/plugins/babel');
                const estreePlugin = await import('prettier/plugins/estree');
                formatted = await prettier.format(currentCode, {
                    parser: 'babel',
                    plugins: [babelPlugin.default, estreePlugin.default],
                    semi: true,
                    singleQuote: true,
                    tabWidth: 4,
                    printWidth: 100,
                });
            } else if (['cpp', 'c', 'java', 'go', 'rust'].includes(language)) {
                // Smart brace reformatter for C-family languages
                const lines = currentCode.split('\n');
                let indent = 0;
                const indentStr = '    ';
                formatted = lines.map(raw => {
                    const line = raw.trim();
                    if (!line) return '';
                    // Decrease indent before closing braces
                    if (line.startsWith('}') || line.startsWith(')') || line.startsWith(']')) {
                        indent = Math.max(0, indent - 1);
                    }
                    const result = indentStr.repeat(indent) + line;
                    // Increase indent after opening braces
                    if (line.endsWith('{') || line.endsWith('(') || line.endsWith('[')) {
                        indent++;
                    }
                    return result;
                }).join('\n');
            } else if (language === 'python') {
                // Normalize Python indentation (trim trailing spaces per line)
                formatted = currentCode.split('\n').map(l => l.trimEnd()).join('\n');
            }

            // Push the formatted code back into Monaco without triggering onChange artifacts
            const model = editorRef.current.getModel();
            if (model) {
                model.pushEditOperations(
                    [],
                    [{ range: model.getFullModelRange(), text: formatted }],
                    () => null
                );
            }
        } catch (err) {
            console.error('Format failed:', err);
        }
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset your code to the default template? All changes will be lost.")) {
            // If AI generated a problem, we should ideally reset to that exact code, not the raw boilerplate.
            // Since we haven't stored the original AI code, falling back to the language template is the safest choice unless 
            // the user explicitly asked for the generated AI code. To fix "the template stored for selected language",
            // we will reset it to `LANGUAGE_TEMPLATES[language]`. But if there's AI boilerplate, it should prefer that.
            // We'll store `originalCode` on AI generation to enable a true reset.
            if (problemData && problemData._originalCode) {
                setCode(problemData._originalCode);
            } else {
                setCode(LANGUAGE_TEMPLATES[language]);
            }
        }
    };

    // ─── Language Change ───────────────────────────────────────────
    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        localStorage.setItem('codearena_lang', lang);
        setRunResults(null);
        setSubmitResult(null);

        // If a problem is loaded via routing (has a problemId), fetch the
        // corresponding AI boilerplate directly from Firestore cache.
        const activeProblemId = routeId || location.state?.problemParams?.id;
        if (activeProblemId && problemStatement.trim()) {
            // Re-trigger AI generate which will hit the Firestore cache for this language.
            handleAIGenerate(problemStatement, lang, activeProblemId);
        } else {
            // No problem loaded — just switch to blank template
            setCode(LANGUAGE_TEMPLATES[lang]);
            setAiWrapper(null);
        }
    };

    // ─── AI Generate ──────────────────────────────────────────────
    const handleAIGenerate = async (overrideProblem, overrideLanguage, overrideId) => {
        const textToUse = overrideProblem || problemStatement;
        const langToUse = overrideLanguage || language;

        if (!textToUse.trim()) return;
        setIsGenerating(true);
        setAiError(null);
        setAiPanelOpen(true);
        try {
            const res = await fetch('https://leetcode-orchestration-55z3.onrender.com/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ problemStatement: textToUse, language: langToUse, problemId: overrideId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'AI generation failed.');

            if (data.code) {
                setCode(data.code);
            }
            if (data.wrapper) setAiWrapper(data.wrapper);
            else setAiWrapper(null);

            if (data.primaryTestCases?.length) {
                setPrimaryCases(data.primaryTestCases.map((tc, i) => ({ id: Date.now() + i, ...tc })));
                setActiveTab(0);
            }
            if (data.submitTestCases?.length) {
                setSubmitCases(data.submitTestCases.map((tc, i) => ({ id: Date.now() + 1000 + i, ...tc })));
            }
            // Use structured problem data if available, else fallback to first line
            if (data.problem) {
                setProblemData({ ...data.problem, _originalCode: data.code || LANGUAGE_TEMPLATES[langToUse] });
                setProblemTitle(data.problem.title || 'Custom Problem');
                setDifficulty(data.problem.difficulty || 'Medium');
            } else {
                setProblemData(null);
                const firstLine = problemStatement.split('\n')[0].replace(/^[^a-zA-Z]*/, '').substring(0, 60);
                setProblemTitle(firstLine || 'Custom Problem');
            }
            setRunResults(null);
            setSubmitResult(null);
            setAiPanelOpen(false);
            setConsoleOpen(false);
        } catch (err) {
            setAiError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // ─── Auto Trigger from Router State or Fetch by ID ─────────────
    useEffect(() => {
        const loadProblem = async () => {
            // Case 1: Navigated from ProblemList (has state)
            if (location.state?.problemParams) {
                const params = location.state.problemParams;
                const savedLang = localStorage.getItem('codearena_lang') || 'python';
                const langToUse = params.language || savedLang;
                setProblemStatement(params.description || '');
                setProblemTitle(params.title || 'Problem');
                setDifficulty(params.difficulty || 'Medium');
                setLanguage(langToUse);

                // Fetch live stats in background
                if (params.id) {
                    fetch(`https://leetcode-orchestration-55z3.onrender.com/api/problems/${params.id}`)
                        .then(r => r.json())
                        .then(d => {
                            if (d.acceptance_rate || d.live_submissions !== undefined) {
                                setLiveStats({
                                    submissions: d.live_submissions || 0,
                                    accepted: d.live_accepted || 0,
                                    rate: d.acceptance_rate || "0.0"
                                });
                            }
                        }).catch(console.error);
                }

                if (params.description) {
                    setIsRouted(true);
                    handleAIGenerate(params.description, langToUse, params.id);
                }

                // Clear state so it doesn't re-trigger on hot reloads
                navigate('.', { replace: true, state: {} });
            }
            // Case 2: Direct link visit with an ID in the URL
            else if (routeId && !problemData && !isGenerating) {
                setIsRouted(true);
                try {
                    // Fetch the problem description from the backend dataset
                    const res = await fetch(`https://leetcode-orchestration-55z3.onrender.com/api/problems/${routeId}`);
                    if (!res.ok) throw new Error("Problem not found");

                    const problem = await res.json();
                    setProblemStatement(problem.description);
                    setProblemTitle(problem.title);
                    setDifficulty(problem.difficulty);

                    if (problem.acceptance_rate || problem.live_submissions !== undefined) {
                        setLiveStats({
                            submissions: problem.live_submissions || 0,
                            accepted: problem.live_accepted || 0,
                            rate: problem.acceptance_rate || "0.0"
                        });
                    }

                    // Trigger AI generation (which will hit Firestore cache)
                    handleAIGenerate(problem.description, language, routeId);
                } catch (err) {
                    console.error("Failed to fetch problem by ID:", err);
                    setAiError("Problem not found in dataset.");
                }
            }
        };

        loadProblem();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state, routeId]);

    // ─── Run (primary 3 cases concurrently) ──────────────────────
    const handleRun = async () => {
        if (!currentUser) {
            const redirectPath = routeId ? `/solvingpage/${routeId}` : '/dsaquestion';
            navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
            return;
        }

        setIsRunning(true);
        setRunResults(null);
        setSubmitResult(null);
        setConsoleOpen(true);
        try {
            const fullCode = code + '\n' + getWrapper();
            const res = await fetch('https://leetcode-orchestration-55z3.onrender.com/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: fullCode, language, testCases: primaryCases })
            });
            const data = await res.json();
            setRunResults(data.results || []);

            // Save run submission to tracking system (silent)
            if (currentUser) {
                const activeProblemId = routeId || location.state?.problemParams?.id;
                const diff = difficulty || location.state?.problemParams?.difficulty;
                if (activeProblemId) {
                    const allPassed = (data.results || []).every(r => r.success);
                    fetch('https://leetcode-orchestration-55z3.onrender.com/api/submissions/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: currentUser.uid,
                            problemId: activeProblemId,
                            difficulty: diff,
                            code,
                            language,
                            status: allPassed ? 'Accepted' : 'Wrong Answer',
                            testResults: data.results || []
                        })
                    }).catch(console.error);
                }
            }
        } catch {
            setRunResults([{ success: false, output: '', error: 'Connection failed.' }]);
        } finally {
            setIsRunning(false);
        }
    };

    // ─── Submit (sequential, stop on first fail, streaming via SSE) ──
    const handleSubmit = async () => {
        if (!currentUser) {
            const redirectPath = routeId ? `/solvingpage/${routeId}` : '/dsaquestion';
            navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
            return;
        }

        setIsSubmitting(true);
        setRunResults(null);
        setSubmitResult(null);
        setSubmitProgress(null);
        setConsoleOpen(true);
        try {
            const fullCode = code + '\n' + getWrapper();
            const allCases = [...primaryCases, ...submitCases];
            const res = await fetch('https://leetcode-orchestration-55z3.onrender.com/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: fullCode, language, testCases: allCases })
            });

            if (!res.ok) {
                throw new Error("HTTP error " + res.status);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                let boundary = buffer.indexOf('\n\n');

                while (boundary !== -1) {
                    const eventString = buffer.slice(0, boundary);
                    buffer = buffer.slice(boundary + 2);

                    if (eventString.startsWith('data: ')) {
                        const data = JSON.parse(eventString.slice(6));

                        if (data.type === 'progress') {
                            setSubmitProgress({ passed: data.passed, total: data.total });
                        } else if (data.type === 'done') {
                            setSubmitResult(data);
                            setSubmitProgress(null);

                            if (data.accepted) {
                                setIsTimerRunning(false);
                            }

                            // ── 1. Update the global aggregate stats ──
                            const activeProblemId = routeId || location.state?.problemParams?.id;
                            const d = difficulty || location.state?.problemParams?.difficulty;
                            if (activeProblemId) {
                                fetch('https://leetcode-orchestration-55z3.onrender.com/api/stats/submit', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ problemId: activeProblemId, isAccepted: data.accepted })
                                }).then(() => {
                                    // Optimistic UI update
                                    setLiveStats(prev => {
                                        if (!prev) return prev;
                                        const newSubs = prev.submissions + 1;
                                        const newAcc = prev.accepted + (data.accepted ? 1 : 0);
                                        const newRate = ((newAcc / newSubs) * 100).toFixed(1);
                                        return { submissions: newSubs, accepted: newAcc, rate: newRate };
                                    });
                                }).catch(console.error);

                                // ── 2. Save personal submission record ──
                                if (currentUser) {
                                    const finalStatus = data.accepted ? 'Accepted'
                                        : data.results?.[data.failedAt]?.error?.includes('time')
                                            ? 'Time Limit Exceeded'
                                            : data.results?.[data.failedAt]?.error
                                                ? 'Runtime Error'
                                                : 'Wrong Answer';

                                    fetch('https://leetcode-orchestration-55z3.onrender.com/api/submissions/save', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            userId: currentUser.uid,
                                            problemId: activeProblemId,
                                            difficulty: d,
                                            code,
                                            language,
                                            status: finalStatus,
                                            testResults: data.results || []
                                        })
                                    }).catch(console.error);
                                }
                            }

                        } else if (data.type === 'error') {
                            throw new Error(data.error);
                        }
                    }
                    boundary = buffer.indexOf('\n\n');
                }
            }
        } catch {
            setSubmitResult({ accepted: false, failedLabel: 'Connection Error', results: [] });
            setSubmitProgress(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLoading = isRunning || isSubmitting || isGenerating;
    const passCount = runResults ? runResults.filter(r => r.success).length : 0;

    // ─── Fetch Submission History ──────────────────────────────────
    const fetchSubmissionHistory = async () => {
        if (!currentUser) return;
        const activeProblemId = routeId || location.state?.problemParams?.id;
        if (!activeProblemId) return;
        setHistoryLoading(true);
        try {
            const res = await fetch(`https://leetcode-orchestration-55z3.onrender.com/api/submissions/${currentUser.uid}/${activeProblemId}`);
            const data = await res.json();
            setSubmissionHistory(data.submissions || []);
        } catch (err) {
            console.error('Failed to load submission history', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    return (
        <div className="lc-root" style={{
            background: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)',
            minHeight: '100vh',
            color: '#fff'
        }}>
            {/* ── Top Nav ───────────────────────────────────────────── */}
            <nav className="lc-nav" style={{
                background: 'rgba(5,5,5,0.85)',
                backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
                <div className="lc-nav-left">
                    <button
                        onClick={() => navigate('/dsaquestion')}
                        style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: '8px' }}
                        title="Back to Problems"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="lc-logo" onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <img src="/logo.jpeg" alt="CodeArena Logo" style={{ height: '24px', width: '24px', borderRadius: '4px', objectFit: 'contain' }} />
                        <span className="lc-logo-text">CodeArena</span>
                    </div>
                </div>
                <div className="lc-nav-center">
                    <span className="lc-problem-title">{problemTitle}</span>
                    <span className="lc-difficulty-badge" style={{ color: DIFFICULTY_COLOR[difficulty] || DIFFICULTY_COLOR.Medium }}>
                        {difficulty}
                    </span>
                </div>
                <div className="lc-nav-right">
                    <div className="lc-timer" style={{ marginRight: '8px', cursor: 'pointer' }} onClick={() => setIsTimerRunning(!isTimerRunning)} title={isTimerRunning ? "Pause timer" : "Start timer"}>
                        <Clock size={13} color={isTimerRunning ? "var(--pass)" : "var(--txt2)"} />
                        <span style={{ color: isTimerRunning ? "var(--pass)" : "var(--txt)", transition: 'color 0.2s' }}>
                            {formatTime(timeElapsed)}
                        </span>
                    </div>
                    <button className="lc-run-btn" onClick={handleRun} disabled={isLoading}>
                        {isRunning ? <Loader2 size={15} className="spin" /> : <Play size={15} />}
                        Run
                    </button>
                    <button className="lc-submit-btn" onClick={handleSubmit} disabled={isLoading}>
                        {isSubmitting ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
                        Submit
                    </button>
                    {currentUser && routeId && (
                        <button
                            onClick={() => setBookmarkOpen(true)}
                            title="Save to list"
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border)', borderRadius: '7px', padding: '6px 10px', cursor: 'pointer', color: 'var(--txt2)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', marginLeft: '4px' }}
                        >
                            <Bookmark size={14} /> Save
                        </button>
                    )}
                    {currentUser && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px', paddingLeft: '12px', borderLeft: '1px solid var(--border)' }}>
                            <button onClick={() => navigate('/systemdesign')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, padding: '4px 8px', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                System Design
                            </button>
                            <button onClick={() => navigate('/submissions')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, padding: '4px 8px', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                My Submissions
                            </button>
                            <NavProfile />
                            <button onClick={logout} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }} title="Log out">
                                <LogOut size={15} />
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* ── Main Layout ───────────────────────────────────────── */}
            <div className="lc-main" style={{ position: 'relative' }}>

                {isGenerating && isRouted && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'var(--bg)', zIndex: 50,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{
                            background: 'var(--surface)', padding: '2.5rem', borderRadius: '16px',
                            border: '1px solid var(--border)', textAlign: 'center',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', maxWidth: '450px'
                        }}>
                            <Loader2 size={40} className="spin" color="var(--accent)" style={{ marginBottom: '1.5rem' }} />
                            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem' }}>Hold tight! 🚀</h2>
                            <p style={{ margin: 0, color: 'var(--txt2)', lineHeight: '1.5' }}>
                                We're preparing <strong>{problemTitle}</strong>.
                                <br /><br />
                                Our AI is writing the optimal boilerplate code and generating a comprehensive suite of hidden test cases to evaluate your solution. This will just take a little bit...
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Left Panel ─────────── */}
                <div className="lc-left-panel" style={{ width: leftWidth }}>
                    {/* AI Generator (Hidden if routed from problems list) */}
                    {!isRouted && (
                        <div className="lc-ai-card">
                            <button className="lc-ai-header" onClick={() => setAiPanelOpen(!aiPanelOpen)}>
                                <span className="lc-ai-title">
                                    <Sparkles size={15} className="ai-sparkle" /> AI Problem Generator
                                    <span className="lc-ai-badge">Gemini 3 Flash</span>
                                </span>
                                {aiPanelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            {aiPanelOpen && (
                                <div className="lc-ai-body">
                                    <textarea
                                        className="lc-problem-input"
                                        value={problemStatement}
                                        onChange={e => setProblemStatement(e.target.value)}
                                        placeholder={"Describe your problem, e.g.:\nWrite a function reverse(int x) that reverses digits of an integer.\n\nAI will generate boilerplate + test cases."}
                                        rows={4}
                                    />
                                    {aiError && (
                                        <div className="lc-ai-error">
                                            <AlertTriangle size={13} /> {aiError}
                                        </div>
                                    )}
                                    <div className="lc-ai-controls">
                                        <select className="lc-lang-select-sm" value={language} onChange={e => handleLanguageChange(e.target.value)}>
                                            {Object.entries(LANG_LABEL).map(([val, label]) =>
                                                <option key={val} value={val}>{label}</option>
                                            )}
                                        </select>
                                        <select className="lc-lang-select-sm" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                        <button className="lc-ai-gen-btn" onClick={() => handleAIGenerate()} disabled={isGenerating || !problemStatement.trim()}>
                                            {isGenerating ? <><Loader2 size={13} className="spin" /> Generating…</> : <><Sparkles size={13} /> Generate</>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Problem Description */}
                    <div className="lc-problem-desc">
                        {problemData ? (
                            <div className="lc-prob-container">
                                <div className="lc-prob-header">
                                    <h1 className="lc-prob-title">{problemData.title}</h1>
                                    <div className="lc-prob-stats">
                                        <span className="lc-diff-badge" style={{ color: DIFFICULTY_COLOR[difficulty], borderColor: `${DIFFICULTY_COLOR[difficulty]}40`, background: `${DIFFICULTY_COLOR[difficulty]}10` }}>
                                            {difficulty}
                                        </span>
                                        {liveStats && (
                                            <>
                                                <span className="lc-prob-stat-item">
                                                    <CheckCircle2 size={14} color="var(--pass)" /> {liveStats.accepted} <span style={{ color: 'var(--txt3)', fontSize: '0.75rem', fontWeight: 'normal' }}>Accepted</span>
                                                </span>
                                                <span className="lc-prob-stat-item">
                                                    <Terminal size={14} color="var(--txt2)" /> {liveStats.submissions} <span style={{ color: 'var(--txt3)', fontSize: '0.75rem', fontWeight: 'normal' }}>Submissions</span>
                                                </span>
                                                <span className="lc-prob-stat-item">
                                                    <Trophy size={14} color="var(--accent)" /> {liveStats.rate}% <span style={{ color: 'var(--txt3)', fontSize: '0.75rem', fontWeight: 'normal' }}>Rate</span>
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="lc-problem-body">{problemData.description}</div>

                                {/* Input / Output Format */}
                                <div className="lc-io-section">
                                    <div className="lc-io-block lc-io-input">
                                        <div className="lc-io-label">Input Format</div>
                                        <pre className="lc-io-content">{problemData.inputFormat}</pre>
                                    </div>
                                    <div className="lc-io-block lc-io-output">
                                        <div className="lc-io-label">Output Format</div>
                                        <pre className="lc-io-content">{problemData.outputFormat}</pre>
                                    </div>
                                </div>

                                {/* Constraints */}
                                {problemData.constraints?.length > 0 && (
                                    <div className="lc-constraints">
                                        <div className="lc-section-title">Constraints</div>
                                        <ul className="lc-constraint-list">
                                            {problemData.constraints.map((c, i) => (
                                                <li key={i}><code>{c}</code></li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Examples */}
                                {problemData.examples?.map((ex, i) => (
                                    <div key={i} className="lc-example">
                                        <div className="lc-section-title">Example {i + 1}</div>
                                        <div className="lc-example-row">
                                            <div className="lc-example-io">
                                                <span className="lc-io-tag lc-io-tag-in">Input</span>
                                                <pre className="lc-example-code">{ex.input}</pre>
                                            </div>
                                            <div className="lc-example-io">
                                                <span className="lc-io-tag lc-io-tag-out">Output</span>
                                                <pre className="lc-example-code">{ex.output}</pre>
                                            </div>
                                        </div>
                                        {ex.explanation && (
                                            <p className="lc-example-note">💡 {ex.explanation}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : problemStatement ? (
                            <div className="lc-prob-container">
                                <div className="lc-prob-header">
                                    <h1 className="lc-prob-title">{problemTitle}</h1>
                                    <div className="lc-prob-stats">
                                        <span className="lc-diff-badge" style={{ color: DIFFICULTY_COLOR[difficulty], borderColor: `${DIFFICULTY_COLOR[difficulty]}40`, background: `${DIFFICULTY_COLOR[difficulty]}10` }}>
                                            {difficulty}
                                        </span>
                                        {liveStats && (
                                            <>
                                                <span className="lc-prob-stat-item">
                                                    <CheckCircle2 size={14} color="var(--pass)" /> {liveStats.accepted} <span style={{ color: 'var(--txt3)', fontSize: '0.75rem', fontWeight: 'normal' }}>Accepted</span>
                                                </span>
                                                <span className="lc-prob-stat-item">
                                                    <Terminal size={14} color="var(--txt2)" /> {liveStats.submissions} <span style={{ color: 'var(--txt3)', fontSize: '0.75rem', fontWeight: 'normal' }}>Submissions</span>
                                                </span>
                                                <span className="lc-prob-stat-item">
                                                    <Trophy size={14} color="var(--accent)" /> {liveStats.rate}% <span style={{ color: 'var(--txt3)', fontSize: '0.75rem', fontWeight: 'normal' }}>Rate</span>
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="lc-problem-body">{problemStatement}</div>
                            </div>
                        ) : (
                            <div className="lc-empty-problem">
                                <AlertCircle size={28} opacity={0.3} />
                                <p>Use the AI generator above to load a problem, or write your code directly.</p>
                            </div>
                        )}

                        {/* Test case overview badges */}
                        {submitCases.length > 0 && (
                            <div className="lc-tc-summary">
                                <span className="lc-tc-badge lc-tc-primary">
                                    <Play size={11} /> {primaryCases.length} Example Cases
                                </span>
                                <span className="lc-tc-badge lc-tc-submit">
                                    <Send size={11} /> {submitCases.length} Hidden Test Cases
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Resizer ── */}
                <div className="lc-resizer" onMouseDown={() => setIsDragging(true)} />

                {/* ── Right Panel ─────────── */}
                <div className="lc-right-panel">
                    {/* Editor Header */}
                    <div className="lc-editor-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.75rem 0 0' }}>
                        <select
                            value={language}
                            onChange={e => handleLanguageChange(e.target.value)}
                            style={{
                                background: 'var(--surface2)',
                                color: 'var(--txt)',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                padding: '0.35rem 0.7rem',
                                fontSize: '0.82rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                margin: '0.5rem 0 0.5rem 0.75rem',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        >
                            {Object.entries(LANG_LABEL).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="lc-toolbar-btn" onClick={handleFormat} title="Format Code"><AlignLeft size={13} /> Format</button>
                            <button className="lc-toolbar-btn" onClick={handleReset} title="Reset to template"><RotateCcw size={13} /> Reset</button>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="lc-editor-area">
                        <Editor
                            onMount={editor => { editorRef.current = editor; }}
                            height="100%"
                            language={language === 'cpp' ? 'cpp' : language}
                            theme="vs-dark"
                            value={code}
                            onChange={v => { if (v !== undefined) setCode(v); }}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono','Fira Code',monospace",
                                padding: { top: 14, bottom: 14 },
                                scrollBeyondLastLine: false,
                                smoothScrolling: true,
                                quickSuggestions: true,
                                suggestOnTriggerCharacters: true,
                                wordBasedSuggestions: 'currentDocument',
                                lineNumbers: 'on',
                                renderLineHighlight: 'line',
                                bracketPairColorization: { enabled: true },
                            }}
                        />
                    </div>

                    {/* Console/Results Panel */}
                    <div className={`lc-console ${consoleOpen ? 'open' : ''}`}>
                        <div className="lc-console-header" onClick={() => setConsoleOpen(!consoleOpen)}>
                            <span className="lc-console-title">
                                <Terminal size={14} /> Console
                            </span>
                            <div className="lc-console-header-right">
                                {runResults && (
                                    <span className={`lc-mini-badge ${passCount === primaryCases.length ? 'pass' : 'fail'}`}>
                                        {passCount}/{primaryCases.length} passed
                                    </span>
                                )}
                                {submitResult && (
                                    <span className={`lc-mini-badge ${submitResult.accepted ? 'pass' : 'fail'}`}>
                                        {submitResult.accepted ? '✓ Accepted' : '✗ Wrong Answer'}
                                    </span>
                                )}
                                {consoleOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                            </div>
                        </div>

                        {consoleOpen && (
                            <div className="lc-console-body">
                                {/* Tab switcher */}
                                <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '12px' }}>
                                    <button
                                        onClick={() => setConsoleTab('testcase')}
                                        style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: consoleTab === 'testcase' ? 'var(--accent)' : 'var(--surface2)', color: consoleTab === 'testcase' ? '#fff' : 'var(--txt2)' }}
                                    >
                                        Test Cases
                                    </button>
                                    <button
                                        onClick={() => { setConsoleTab('submissions'); fetchSubmissionHistory(); }}
                                        style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: consoleTab === 'submissions' ? 'var(--accent)' : 'var(--surface2)', color: consoleTab === 'submissions' ? '#fff' : 'var(--txt2)' }}
                                    >
                                        Submissions
                                    </button>
                                </div>
                                {/* ── Submissions History Tab ── */}
                                {consoleTab === 'submissions' && (
                                    <div className="lc-run-results">
                                        {historyLoading ? (
                                            <div className="lc-console-loading"><Loader2 size={18} className="spin" /><span>Loading history…</span></div>
                                        ) : !currentUser ? (
                                            <div style={{ color: 'var(--txt3)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>Sign in to view your submission history.</div>
                                        ) : submissionHistory.length === 0 ? (
                                            <div style={{ color: 'var(--txt3)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>No submissions yet for this problem.</div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {submissionHistory.map(sub => {
                                                    const isAccepted = sub.status === 'Accepted';
                                                    const isExpanded = expandedSub === sub.id;
                                                    return (
                                                        <div key={sub.id} style={{ border: `1px solid ${isAccepted ? 'var(--pass)' : 'var(--fail)'}22`, borderRadius: '8px', overflow: 'hidden' }}>
                                                            <div
                                                                onClick={() => setExpandedSub(isExpanded ? null : sub.id)}
                                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', cursor: 'pointer', background: isAccepted ? '#00b8a311' : '#ef474311' }}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isAccepted ? 'var(--pass)' : sub.status === 'Wrong Answer' ? 'var(--fail)' : 'var(--warn)' }}>{sub.status}</span>
                                                                    <span style={{ fontSize: '0.75rem', color: 'var(--txt3)' }}>{sub.language}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <span style={{ fontSize: '0.72rem', color: 'var(--txt3)' }}>{new Date(sub.submittedAt).toLocaleString()}</span>
                                                                    {isExpanded ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                                                                </div>
                                                            </div>
                                                            {isExpanded && (
                                                                <pre style={{ margin: 0, padding: '12px', background: 'var(--surface)', fontSize: '0.78rem', color: 'var(--txt2)', overflowX: 'auto', maxHeight: '260px', overflowY: 'auto' }}>{sub.code}</pre>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Test Case Tab ── */}
                                {consoleTab === 'testcase' && (
                                    <>
                                        {/* Loading state */}
                                        {(isRunning || isSubmitting) && (
                                            <div className="lc-console-loading">
                                                <Loader2 size={20} className="spin" />
                                                <span>
                                                    {isRunning ? 'Running test cases…' :
                                                        isSubmitting ? (submitProgress ? `Evaluating… ${submitProgress.passed} / ${submitProgress.total} test cases passed` : 'Submitting…') : ''}
                                                </span>
                                            </div>
                                        )}

                                        {/* Run Results */}
                                        {runResults && !isRunning && (
                                            <div className="lc-run-results">
                                                {/* Tabs */}
                                                <div className="lc-tc-tabs">
                                                    {primaryCases.map((tc, i) => {
                                                        const res = runResults[i];
                                                        return (
                                                            <button
                                                                key={tc.id}
                                                                className={`lc-tc-tab ${activeTab === i ? 'active' : ''} ${res ? (res.success ? 'tab-pass' : 'tab-fail') : ''}`}
                                                                onClick={() => setActiveTab(i)}
                                                            >
                                                                {res ? (res.success ? <CheckCircle2 size={12} /> : <XCircle size={12} />) : null}
                                                                {tc.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {/* Active case result */}
                                                {(() => {
                                                    const tc = primaryCases[activeTab];
                                                    const res = runResults[activeTab];
                                                    if (!tc || !res) return null;
                                                    return (
                                                        <div className="lc-case-detail">
                                                            <div className="lc-detail-row">
                                                                <span className="lc-detail-label">Input</span>
                                                                <pre className="lc-code-box">{tc.input || '(none)'}</pre>
                                                            </div>
                                                            <div className="lc-detail-row">
                                                                <span className="lc-detail-label">Expected Output</span>
                                                                <pre className="lc-code-box">{tc.expectedOutput || '(none)'}</pre>
                                                            </div>
                                                            <div className="lc-detail-row">
                                                                <span className="lc-detail-label">Your Output</span>
                                                                <pre className={`lc-code-box ${res.success ? 'box-pass' : 'box-fail'}`}>{res.output || '(none)'}</pre>
                                                            </div>
                                                            {res.error && (
                                                                <div className="lc-detail-row">
                                                                    <span className="lc-detail-label">Stderr</span>
                                                                    <pre className="lc-code-box box-err">{res.error}</pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}

                                        {/* Submit Result */}
                                        {submitResult && !isSubmitting && (
                                            <div className="lc-submit-result">
                                                {submitResult.accepted ? (
                                                    <div className="lc-verdict lc-verdict-pass">
                                                        <Trophy size={28} />
                                                        <div>
                                                            <div className="lc-verdict-title">Accepted</div>
                                                            <div className="lc-verdict-sub">All {submitResult.results?.length} test cases passed</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="lc-verdict lc-verdict-fail">
                                                        <XCircle size={28} />
                                                        <div>
                                                            <div className="lc-verdict-title">Wrong Answer</div>
                                                            <div className="lc-verdict-sub">Failed on: <strong>{submitResult.failedLabel}</strong></div>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Show failing case details */}
                                                {!submitResult.accepted && submitResult.results?.length > 0 && (() => {
                                                    const failed = submitResult.results[submitResult.results.length - 1];
                                                    const allCases = [...primaryCases, ...submitCases];
                                                    const tc = allCases[submitResult.failedAt] || {};
                                                    return (
                                                        <div className="lc-case-detail" style={{ marginTop: '1rem' }}>
                                                            <div className="lc-detail-row">
                                                                <span className="lc-detail-label">Input</span>
                                                                <pre className="lc-code-box">{tc.input || '(hidden)'}</pre>
                                                            </div>
                                                            <div className="lc-detail-row">
                                                                <span className="lc-detail-label">Expected Output</span>
                                                                <pre className="lc-code-box">{tc.expectedOutput || '(hidden)'}</pre>
                                                            </div>
                                                            <div className="lc-detail-row">
                                                                <span className="lc-detail-label">Your Output</span>
                                                                <pre className="lc-code-box box-fail">{failed.output || '(none)'}</pre>
                                                            </div>
                                                            {failed.error && (
                                                                <div className="lc-detail-row">
                                                                    <span className="lc-detail-label">Stderr</span>
                                                                    <pre className="lc-code-box box-err">{failed.error}</pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}

                                        {/* Editable primary test cases */}
                                        {!runResults && !submitResult && !isRunning && !isSubmitting && (
                                            <div className="lc-tc-editor">
                                                <div className="lc-tc-tabs">
                                                    {primaryCases.map((tc, i) => (
                                                        <button
                                                            key={tc.id}
                                                            className={`lc-tc-tab ${activeTab === i ? 'active' : ''}`}
                                                            onClick={() => setActiveTab(i)}
                                                        >
                                                            {tc.label}
                                                        </button>
                                                    ))}
                                                    <button className="lc-tc-add" onClick={() => {
                                                        const id = Date.now();
                                                        setPrimaryCases([...primaryCases, { id, label: `Example ${primaryCases.length + 1}`, input: '', expectedOutput: '' }]);
                                                        setActiveTab(primaryCases.length);
                                                    }}>+</button>
                                                </div>
                                                {(() => {
                                                    const tc = primaryCases[activeTab];
                                                    if (!tc) return null;
                                                    return (
                                                        <div className="lc-case-detail">
                                                            <div className="lc-detail-row">
                                                                <span className="lc-detail-label">Input</span>
                                                                <textarea className="lc-tc-textarea" value={tc.input}
                                                                    onChange={e => {
                                                                        const n = [...primaryCases]; n[activeTab].input = e.target.value; setPrimaryCases(n);
                                                                    }} placeholder="stdin input..." />
                                                            </div>
                                                            <div className="lc-detail-row">
                                                                <span className="lc-detail-label">Expected Output</span>
                                                                <textarea className="lc-tc-textarea" value={tc.expectedOutput}
                                                                    onChange={e => {
                                                                        const n = [...primaryCases]; n[activeTab].expectedOutput = e.target.value; setPrimaryCases(n);
                                                                    }} placeholder="expected stdout..." />
                                                            </div>
                                                            {primaryCases.length > 1 && (
                                                                <button className="lc-remove-case" onClick={() => {
                                                                    setPrimaryCases(primaryCases.filter((_, i) => i !== activeTab));
                                                                    setActiveTab(Math.max(0, activeTab - 1));
                                                                }}>Remove Case</button>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {bookmarkOpen && currentUser && routeId && (
                <BookmarkModal
                    problemId={routeId}
                    userId={currentUser.uid}
                    onClose={() => setBookmarkOpen(false)}
                />
            )}
            <style>{`
                @media (max-width: 900px) {
                    .lc-problem-title { max-width: 140px !important; }
                }
                @media (max-width: 680px) {
                    .lc-nav-center { display: none !important; }
                    .lc-problem-desc { padding: 1.25rem !important; }
                    .lc-prob-stats { flex-wrap: wrap; gap: 0.5rem; }
                    .lc-io-section { flex-direction: column; }
                }
                @media (max-width: 480px) {
                    .lc-logo-text { display: none !important; }
                    .lc-run-btn, .lc-submit-btn { padding: 0.4rem 0.5rem !important; font-size: 0.75rem !important; }
                    .lc-timer { display: none !important; }
                }
            `}</style>
        </div>
    );
}
