import React, { useState, useRef, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
    Code2, Search, X, Loader2, Play, Send, CheckCircle2,
    XCircle, ChevronDown, ChevronUp, AlertCircle, Sparkles,
    Terminal, Trophy, RotateCcw, BookOpen, Hash
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

const DIFFICULTY_COLOR = { Easy: '#00b8a3', Medium: '#ffa116', Hard: '#ef4743' };

const LANGUAGES = [
    { id: 'cpp',        label: 'C++' },
    { id: 'java',       label: 'Java' },
    { id: 'python',     label: 'Python' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'c',          label: 'C' },
    { id: 'go',         label: 'Go' },
    { id: 'rust',       label: 'Rust' },
];

const DEFAULT_CODE = {
    cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}',
    java: 'class Solution {\n    public void solve() {\n        // Write your solution here\n    }\n}',
    python: '# Write your solution here\n',
    javascript: '// Write your solution here\n',
    c: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your solution here\n}',
    rust: 'fn main() {\n    // Write your solution here\n}',
};

/**
 * LecturePractice — isolated practice panel for lecture page.
 * Adds a "Solve Relevant LeetCode" section that lets users find a problem,
 * load an editor with test cases, and run/submit — mirroring the DSA page.
 * Does NOT modify or interact with any existing editor, execution, or test systems.
 */
export default function LecturePractice({ videoTitle }) {
    // Panel state
    const [open, setOpen]                   = useState(false);
    const [step, setStep]                   = useState('search'); // 'search' | 'loading' | 'practice'

    // Problem search state
    const [searchQuery, setSearchQuery]     = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching]         = useState(false);
    const [searchError, setSearchError]     = useState('');
    const [hasSearched, setHasSearched]     = useState(false);

    // Problem / practice state
    const [problem, setProblem]             = useState(null); // structured problem data from /api/generate
    const [language, setLanguage]           = useState('cpp');
    const [code, setCode]                   = useState(DEFAULT_CODE['cpp']);
    const [aiWrapper, setAiWrapper]         = useState(null);
    const [primaryCases, setPrimaryCases]   = useState([]);
    const [submitCases, setSubmitCases]     = useState([]);
    const [activeCase, setActiveCase]       = useState(0);
    const [generating, setGenerating]       = useState(false);
    const [genError, setGenError]           = useState('');

    // Run / submit state
    const [runResults, setRunResults]       = useState(null);
    const [submitResult, setSubmitResult]   = useState(null);
    const [submitProgress, setSubmitProgress] = useState(null);
    const [isRunning, setIsRunning]         = useState(false);
    const [isSubmitting, setIsSubmitting]   = useState(false);
    const [consoleOpen, setConsoleOpen]     = useState(false);
    const [langMenuOpen, setLangMenuOpen]   = useState(false);

    const editorRef = useRef(null);
    const searchRef = useRef(null);

    const getWrapper = () => aiWrapper || '';

    // ── Auto-populate search with video title ─────────────────────────────────
    useEffect(() => {
        if (videoTitle && !searchQuery) {
            // Extract concise keyword from title (first few words)
            const clean = videoTitle.replace(/[^a-zA-Z0-9 ]/g, ' ').split(' ').slice(0, 3).join(' ');
            setSearchQuery(clean);
        }
    // eslint-disable-next-line
    }, [videoTitle]);

    // ── Search for problems ───────────────────────────────────────────────────
    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        setSearchError('');
        setHasSearched(true);
        try {
            const q = searchQuery.trim();

            // If it looks like a problem number, fetch directly
            const asNumber = parseInt(q, 10);
            if (!isNaN(asNumber) && String(asNumber) === q) {
                const res = await fetch(`${API_BASE}/api/problems/${asNumber}`);
                if (res.ok) {
                    const p = await res.json();
                    setSearchResults(p && p.id ? [p] : []);
                } else {
                    setSearchResults([]);
                }
                setSearching(false);
                return;
            }

            // Text search using the existing /api/problems?search= endpoint
            const res = await fetch(`${API_BASE}/api/problems?search=${encodeURIComponent(q)}&limit=8`);
            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();
            // /api/problems returns { data: [...], total, page }
            setSearchResults(Array.isArray(data) ? data : (data.data || data.problems || []));
        } catch (e) {
            setSearchError('Search failed. Please try again.');
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    }, [searchQuery]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    // ── Load a problem by ID or description ──────────────────────────────────
    const loadProblem = useCallback(async (problemMeta) => {
        setStep('loading');
        setGenError('');
        try {
            const res = await fetch(`${API_BASE}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problemStatement: problemMeta.description || problemMeta.title,
                    language,
                    problemId: problemMeta.id,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Generation failed');

            setProblem({ ...data.problem, _id: problemMeta.id, _originalCode: data.code });
            setCode(data.code || DEFAULT_CODE[language]);
            setAiWrapper(data.wrapper || null);
            setPrimaryCases((data.primaryTestCases || []).map((tc, i) => ({ id: i, ...tc })));
            setSubmitCases((data.submitTestCases || []).map((tc, i) => ({ id: i, ...tc })));
            setActiveCase(0);
            setRunResults(null);
            setSubmitResult(null);
            setStep('practice');
        } catch (e) {
            setGenError(e.message);
            setStep('search');
        }
    }, [language]);

    // ── Handle manual description (custom problem) ────────────────────────────
    const loadCustomProblem = useCallback(async () => {
        if (!searchQuery.trim()) return;
        await loadProblem({ description: searchQuery, title: searchQuery, id: null });
    }, [searchQuery, loadProblem]);

    // ── Language change ───────────────────────────────────────────────────────
    const handleLanguageChange = async (lang) => {
        setLanguage(lang);
        setLangMenuOpen(false);
        if (problem) {
            setGenerating(true);
            try {
                const res = await fetch(`${API_BASE}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        problemStatement: problem.description || problem.title,
                        language: lang,
                        problemId: problem._id,
                    }),
                });
                const data = await res.json();
                if (res.ok && data.code) {
                    setCode(data.code);
                    setAiWrapper(data.wrapper || null);
                }
            } catch (_) {}
            setGenerating(false);
        } else {
            setCode(DEFAULT_CODE[lang]);
        }
        setRunResults(null);
        setSubmitResult(null);
    };

    // ── Run ───────────────────────────────────────────────────────────────────
    const handleRun = async () => {
        if (!code.trim() || isRunning) return;
        setIsRunning(true);
        setRunResults(null);
        setSubmitResult(null);
        setConsoleOpen(true);
        try {
            const fullCode = code + '\n' + getWrapper();
            const res = await fetch(`${API_BASE}/api/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: fullCode, language, testCases: primaryCases }),
            });
            const data = await res.json();
            if (!res.ok || (data.error && !data.results)) {
                setRunResults(primaryCases.map(() => ({ success: false, output: '', error: data.error || 'Server error' })));
            } else {
                setRunResults(data.results || primaryCases.map(() => ({ success: false, output: '', error: 'No result' })));
            }
        } catch (e) {
            setRunResults(primaryCases.map(() => ({ success: false, output: '', error: 'Connection failed.' })));
        } finally {
            setIsRunning(false);
        }
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!code.trim() || isSubmitting) return;
        setIsSubmitting(true);
        setRunResults(null);
        setSubmitResult(null);
        setSubmitProgress(null);
        setConsoleOpen(true);
        try {
            const fullCode = code + '\n' + getWrapper();
            const allCases = [...primaryCases, ...submitCases];
            const res = await fetch(`${API_BASE}/api/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: fullCode, language, testCases: allCases }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Server error (${res.status})`);
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
                        if (data.type === 'progress') setSubmitProgress({ passed: data.passed, total: data.total });
                        else if (data.type === 'done') { setSubmitResult(data); setSubmitProgress(null); }
                        else if (data.type === 'error') throw new Error(data.error);
                    }
                    boundary = buffer.indexOf('\n\n');
                }
            }
        } catch (e) {
            setSubmitResult({ accepted: false, failedLabel: e.message, results: [] });
            setSubmitProgress(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const passCount = runResults ? runResults.filter(r => r.success).length : 0;
    const currentCase = primaryCases[activeCase];
    const currentResult = runResults ? runResults[activeCase] : null;

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ margin: '0 0 20px 0' }}>

            {/* ── Toggle Button ── */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    background: open
                        ? 'linear-gradient(90deg, rgba(0,184,163,0.12), rgba(59,130,246,0.08))'
                        : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${open ? 'rgba(0,184,163,0.25)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '14px', padding: '14px 20px',
                    color: '#e2e8f0', cursor: 'pointer',
                    transition: 'all 0.25s', fontFamily: "'Inter', sans-serif",
                    boxShadow: open ? '0 4px 20px rgba(0,184,163,0.1)' : 'none',
                }}
            >
                <div style={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: 'linear-gradient(135deg, #00b8a3, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 12px rgba(0,184,163,0.3)', flexShrink: 0,
                }}>
                    <Code2 size={18} color="#fff" />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Solve Relevant LeetCode</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        {problem ? `Practicing: ${problem.title}` : 'Find and practice a problem related to this lecture'}
                    </div>
                </div>
                {open ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
            </button>

            {/* ── Panel Body ── */}
            {open && (
                <div style={{
                    marginTop: '12px',
                    background: '#0d0f18',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    fontFamily: "'Inter', sans-serif",
                }}>

                    {/* ── STEP: Search ── */}
                    {step === 'search' && (
                        <div style={{ padding: '24px' }}>
                            <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>
                                Find a Problem
                            </h3>
                            <p style={{ margin: '0 0 18px', color: '#64748b', fontSize: '0.85rem' }}>
                                Search by problem name or number, or describe a topic to generate a custom problem.
                            </p>

                            {genError && (
                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <AlertCircle size={14} /> {genError}
                                </div>
                            )}

                            {/* Search box */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <Search size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        ref={searchRef}
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="e.g. 'Two Sum', '#1', or 'binary search tree'"
                                        style={{
                                            width: '100%', background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                                            padding: '10px 14px 10px 38px', color: '#e2e8f0',
                                            fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                                            fontFamily: 'inherit',
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'rgba(0,184,163,0.4)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        autoFocus
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={searching || !searchQuery.trim()}
                                    style={{
                                        background: 'linear-gradient(135deg, #00b8a3, #0891b2)',
                                        border: 'none', borderRadius: '10px', padding: '10px 18px',
                                        color: '#fff', cursor: searching ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        fontSize: '0.9rem', fontWeight: 600,
                                    }}
                                >
                                    {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                                    Search
                                </button>
                            </div>

                            {/* Search results */}
                            {searchResults.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                    {searchResults.map(p => (
                                        <button
                                            key={p.id || p.title}
                                            onClick={() => loadProblem(p)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '14px',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.07)',
                                                borderRadius: '10px', padding: '12px 16px',
                                                cursor: 'pointer', textAlign: 'left',
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,184,163,0.08)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                        >
                                            {p.id && (
                                                <span style={{ color: '#475569', fontSize: '0.8rem', minWidth: '32px', textAlign: 'right', fontFamily: 'monospace' }}>
                                                    #{p.id}
                                                </span>
                                            )}
                                            <span style={{ flex: 1, color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 500 }}>
                                                {p.title}
                                            </span>
                                            {p.difficulty && (
                                                <span style={{
                                                    fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                                                    color: DIFFICULTY_COLOR[p.difficulty] || '#999',
                                                    background: `${DIFFICULTY_COLOR[p.difficulty] || '#999'}18`,
                                                }}>
                                                    {p.difficulty}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {hasSearched && searchResults.length === 0 && !searching && !searchError && (
                                <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '0.85rem' }}>
                                    No results found.
                                </div>
                            )}

                            {searchError && (
                                <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '12px' }}>{searchError}</div>
                            )}

                            {/* Divider + custom generate */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                                <span style={{ color: '#475569', fontSize: '0.78rem' }}>or generate a custom problem</span>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                            </div>

                            <button
                                onClick={loadCustomProblem}
                                disabled={!searchQuery.trim()}
                                style={{
                                    width: '100%', background: 'rgba(139,92,246,0.08)',
                                    border: '1px dashed rgba(139,92,246,0.3)', borderRadius: '10px',
                                    padding: '12px', color: '#a78bfa', cursor: searchQuery.trim() ? 'pointer' : 'not-allowed',
                                    fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    transition: 'all 0.2s', fontFamily: 'inherit',
                                }}
                                onMouseEnter={e => { if (searchQuery.trim()) e.currentTarget.style.background = 'rgba(139,92,246,0.14)'; }}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
                            >
                                <Sparkles size={15} /> Generate custom problem from "{searchQuery.slice(0, 40)}"
                            </button>
                        </div>
                    )}

                    {/* ── STEP: Loading ── */}
                    {step === 'loading' && (
                        <div style={{ padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <Loader2 size={40} className="animate-spin" color="#00b8a3" />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>Preparing Problem…</div>
                                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                    AI is generating boilerplate code and test cases
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP: Practice ── */}
                    {step === 'practice' && problem && (
                        <div>
                            {/* Problem header */}
                            <div style={{
                                padding: '16px 20px',
                                background: 'rgba(255,255,255,0.02)',
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                            }}>
                                <button
                                    onClick={() => { setStep('search'); setProblem(null); setRunResults(null); setSubmitResult(null); }}
                                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', padding: '4px 0' }}
                                >
                                    ← Back
                                </button>
                                <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.95rem' }}>{problem.title}</span>
                                    {problem.difficulty && (
                                        <span style={{
                                            marginLeft: '10px', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                                            color: DIFFICULTY_COLOR[problem.difficulty] || '#999',
                                            background: `${DIFFICULTY_COLOR[problem.difficulty] || '#999'}18`,
                                        }}>
                                            {problem.difficulty}
                                        </span>
                                    )}
                                </div>

                                {/* Language picker */}
                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setLangMenuOpen(o => !o)}
                                        style={{
                                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                            color: '#e2e8f0', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.83rem', fontWeight: 600,
                                        }}
                                    >
                                        {LANGUAGES.find(l => l.id === language)?.label} <ChevronDown size={13} />
                                    </button>
                                    {langMenuOpen && (
                                        <div style={{
                                            position: 'absolute', top: '110%', right: 0, zIndex: 200,
                                            background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '10px', overflow: 'hidden', minWidth: '130px',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                        }}>
                                            {LANGUAGES.map(l => (
                                                <button
                                                    key={l.id}
                                                    onClick={() => handleLanguageChange(l.id)}
                                                    style={{
                                                        display: 'block', width: '100%', textAlign: 'left',
                                                        padding: '9px 14px', background: language === l.id ? 'rgba(0,184,163,0.15)' : 'transparent',
                                                        border: 'none', color: language === l.id ? '#00b8a3' : '#ccc',
                                                        cursor: 'pointer', fontSize: '0.85rem', fontWeight: language === l.id ? 700 : 400,
                                                    }}
                                                    onMouseEnter={e => { if (language !== l.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                                    onMouseLeave={e => { if (language !== l.id) e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    {l.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Run / Submit */}
                                <button
                                    onClick={handleRun}
                                    disabled={isRunning || isSubmitting || generating}
                                    style={{
                                        background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                                        color: '#60a5fa', borderRadius: '8px', padding: '6px 14px',
                                        cursor: isRunning ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', fontWeight: 600,
                                    }}
                                >
                                    {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} fill="currentColor" />}
                                    Run
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isRunning || isSubmitting || generating}
                                    style={{
                                        background: 'linear-gradient(135deg, #00b8a3, #0891b2)',
                                        border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 14px',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', fontWeight: 700,
                                        boxShadow: '0 0 12px rgba(0,184,163,0.25)',
                                    }}
                                >
                                    {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                    Submit
                                </button>
                                <button
                                    onClick={() => { setCode(problem._originalCode || DEFAULT_CODE[language]); setRunResults(null); setSubmitResult(null); }}
                                    title="Reset code"
                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.83rem' }}
                                >
                                    <RotateCcw size={13} /> Reset
                                </button>
                            </div>

                            {/* Two column: description + editor */}
                            <div style={{ display: 'flex', height: '520px' }}>

                                {/* Left: Problem description */}
                                <div style={{ width: '38%', borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', padding: '16px 20px' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '12px', lineHeight: 1.7 }}>
                                        {problem.description}
                                    </div>

                                    {problem.inputFormat && (
                                        <div style={{ marginBottom: '12px' }}>
                                            <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>Input Format</div>
                                            <pre style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '8px 10px', color: '#94a3b8', fontSize: '0.8rem', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{problem.inputFormat}</pre>
                                        </div>
                                    )}

                                    {problem.outputFormat && (
                                        <div style={{ marginBottom: '12px' }}>
                                            <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>Output Format</div>
                                            <pre style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '8px 10px', color: '#94a3b8', fontSize: '0.8rem', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{problem.outputFormat}</pre>
                                        </div>
                                    )}

                                    {problem.constraints?.length > 0 && (
                                        <div style={{ marginBottom: '12px' }}>
                                            <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>Constraints</div>
                                            <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
                                                {problem.constraints.map((c, i) => (
                                                    <li key={i} style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '3px' }}>
                                                        <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace' }}>{c}</code>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {problem.examples?.map((ex, i) => (
                                        <div key={i} style={{ marginBottom: '12px' }}>
                                            <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>Example {i + 1}</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <div>
                                                    <span style={{ fontSize: '0.72rem', color: '#00b8a3', fontWeight: 700, marginRight: '6px' }}>Input</span>
                                                    <pre style={{ background: 'rgba(0,184,163,0.06)', borderRadius: '6px', padding: '6px 10px', color: '#94a3b8', fontSize: '0.8rem', margin: '4px 0 0 0', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{ex.input}</pre>
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 700, marginRight: '6px' }}>Output</span>
                                                    <pre style={{ background: 'rgba(59,130,246,0.06)', borderRadius: '6px', padding: '6px 10px', color: '#94a3b8', fontSize: '0.8rem', margin: '4px 0 0 0', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{ex.output}</pre>
                                                </div>
                                                {ex.explanation && (
                                                    <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '4px 0 0 0', lineHeight: 1.5 }}>💡 {ex.explanation}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Right: Editor + console */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#0b0d14' }}>
                                    {generating ? (
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Loader2 size={28} className="animate-spin" color="#00b8a3" />
                                        </div>
                                    ) : (
                                        <Editor
                                            height="100%"
                                            language={language === 'cpp' ? 'cpp' : language === 'javascript' ? 'javascript' : language}
                                            value={code}
                                            onChange={v => setCode(v || '')}
                                            onMount={e => { editorRef.current = e; }}
                                            theme="vs-dark"
                                            options={{
                                                fontSize: 13,
                                                minimap: { enabled: false },
                                                scrollBeyondLastLine: false,
                                                wordWrap: 'on',
                                                automaticLayout: true,
                                                padding: { top: 10, bottom: 10 },
                                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                                fontLigatures: true,
                                                folding: true,
                                                lineNumbers: 'on',
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Console Section */}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                                {/* Test case tabs */}
                                <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 16px', background: 'rgba(0,0,0,0.2)', alignItems: 'center' }}>
                                    <button
                                        onClick={() => setConsoleOpen(o => !o)}
                                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '10px 0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, marginRight: '16px' }}
                                    >
                                        <Terminal size={13} color="#a855f7" /> Console
                                        {consoleOpen ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                                    </button>

                                    {primaryCases.map((tc, i) => {
                                        const res = runResults?.[i];
                                        return (
                                            <button
                                                key={tc.id}
                                                onClick={() => { setActiveCase(i); setConsoleOpen(true); }}
                                                style={{
                                                    background: 'transparent', border: 'none',
                                                    borderBottom: activeCase === i && consoleOpen ? '2px solid #00b8a3' : '2px solid transparent',
                                                    padding: '10px 14px', cursor: 'pointer',
                                                    color: activeCase === i && consoleOpen ? '#e2e8f0' : '#64748b',
                                                    fontSize: '0.82rem', fontWeight: activeCase === i && consoleOpen ? 600 : 400,
                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                }}
                                            >
                                                {res && (res.success ? <CheckCircle2 size={12} color="#00b8a3" /> : <XCircle size={12} color="#ef4444" />)}
                                                {tc.label || `Case ${i + 1}`}
                                            </button>
                                        );
                                    })}

                                    {/* Submit progress / result pill */}
                                    {submitProgress && (
                                        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Loader2 size={12} className="animate-spin" /> {submitProgress.passed}/{submitProgress.total} passed
                                        </span>
                                    )}
                                    {submitResult && !submitProgress && (
                                        <span style={{
                                            marginLeft: 'auto', fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px',
                                            color: submitResult.accepted ? '#00b8a3' : '#ef4444',
                                            background: submitResult.accepted ? 'rgba(0,184,163,0.1)' : 'rgba(239,68,68,0.1)',
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                        }}>
                                            {submitResult.accepted ? <><Trophy size={12} /> Accepted</> : <><XCircle size={12} /> {submitResult.failedLabel || 'Wrong Answer'}</>}
                                        </span>
                                    )}

                                    {/* Run result summary */}
                                    {runResults && !submitResult && !submitProgress && (
                                        <span style={{
                                            marginLeft: 'auto', fontSize: '0.78rem', fontWeight: 600,
                                            color: passCount === primaryCases.length ? '#00b8a3' : '#ffa116',
                                        }}>
                                            {passCount}/{primaryCases.length} test cases passed
                                        </span>
                                    )}
                                </div>

                                {/* Console body */}
                                {consoleOpen && (
                                    <div style={{ padding: '14px 20px', background: '#07090f', minHeight: '120px', maxHeight: '200px', overflowY: 'auto' }}>
                                        {!runResults && !submitResult && !isRunning && !isSubmitting && (
                                            <span style={{ color: '#334155', fontSize: '0.84rem', fontFamily: 'monospace' }}>
                                                Press Run to execute with sample test cases, or Submit to run all hidden tests.
                                            </span>
                                        )}

                                        {(isRunning || isSubmitting) && (
                                            <div style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontFamily: 'monospace' }}>
                                                <Loader2 size={14} className="animate-spin" /> {isSubmitting ? 'Judging...' : 'Executing...'}
                                            </div>
                                        )}

                                        {/* Current test case details */}
                                        {runResults && currentCase && (
                                            <div style={{ fontFamily: 'monospace', fontSize: '0.84rem' }}>
                                                <div style={{ marginBottom: '10px' }}>
                                                    <span style={{ color: '#475569', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Input</span>
                                                    <pre style={{ margin: '4px 0 0', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '8px', whiteSpace: 'pre-wrap' }}>
                                                        {currentCase.displayInput || currentCase.input}
                                                    </pre>
                                                </div>
                                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <span style={{ color: '#475569', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected</span>
                                                        <pre style={{ margin: '4px 0 0', color: '#00b8a3', background: 'rgba(0,184,163,0.06)', borderRadius: '6px', padding: '8px', whiteSpace: 'pre-wrap' }}>
                                                            {currentCase.expectedOutput}
                                                        </pre>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <span style={{ color: '#475569', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Got</span>
                                                        <pre style={{ margin: '4px 0 0', color: currentResult?.success ? '#00b8a3' : '#f87171', background: currentResult?.success ? 'rgba(0,184,163,0.06)' : 'rgba(239,68,68,0.06)', borderRadius: '6px', padding: '8px', whiteSpace: 'pre-wrap' }}>
                                                            {currentResult?.output || currentResult?.error || '—'}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit detailed result */}
                                        {submitResult && !isSubmitting && (
                                            <div style={{ fontFamily: 'monospace', fontSize: '0.84rem' }}>
                                                {submitResult.accepted ? (
                                                    <div style={{ color: '#00b8a3', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                                                        <Trophy size={16} /> All test cases passed! Great job! 🎉
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div style={{ color: '#f87171', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <XCircle size={14} /> {submitResult.failedLabel || 'Wrong Answer'}
                                                        </div>
                                                        {submitResult.results?.[submitResult.failedAt] && (
                                                            <div>
                                                                <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Failed on:</div>
                                                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ color: '#475569', fontSize: '0.72rem', marginBottom: '4px' }}>Expected</div>
                                                                        <pre style={{ color: '#00b8a3', background: 'rgba(0,184,163,0.06)', borderRadius: '6px', padding: '8px', whiteSpace: 'pre-wrap', margin: 0 }}>
                                                                            {submitResult.results[submitResult.failedAt]?.expectedOutput || '—'}
                                                                        </pre>
                                                                    </div>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ color: '#475569', fontSize: '0.72rem', marginBottom: '4px' }}>Got</div>
                                                                        <pre style={{ color: '#f87171', background: 'rgba(239,68,68,0.06)', borderRadius: '6px', padding: '8px', whiteSpace: 'pre-wrap', margin: 0 }}>
                                                                            {submitResult.results[submitResult.failedAt]?.output || submitResult.results[submitResult.failedAt]?.error || '—'}
                                                                        </pre>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
