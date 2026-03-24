import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import Editor from '@monaco-editor/react';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Play, Save, RotateCcw, CheckCircle, AlertCircle, Loader2, Terminal, ChevronDown } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

const LANGUAGES = [
    { id: 'cpp',        label: 'C++',        monaco: 'cpp' },
    { id: 'java',       label: 'Java',       monaco: 'java' },
    { id: 'python',     label: 'Python',     monaco: 'python' },
    { id: 'javascript', label: 'JavaScript', monaco: 'javascript' },
    { id: 'c',          label: 'C',          monaco: 'c' },
    { id: 'go',         label: 'Go',         monaco: 'go' },
    { id: 'rust',       label: 'Rust',       monaco: 'rust' },
];

const DEFAULT_CODE = {
    cpp:
`#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your code here
    cout << "Hello, World!" << endl;
    return 0;
}`,
    java:
`public class Main {
    public static void main(String[] args) {
        // Write your code here
        System.out.println("Hello, World!");
    }
}`,
    python:
`# Write your code here
print("Hello, World!")`,
    javascript:
`// Write your code here
console.log("Hello, World!");`,
    c:
`#include <stdio.h>

int main() {
    // Write your code here
    printf("Hello, World!\\n");
    return 0;
}`,
    go:
`package main

import "fmt"

func main() {
    // Write your code here
    fmt.Println("Hello, World!")
}`,
    rust:
`fn main() {
    // Write your code here
    println!("Hello, World!");
}`,
};

/**
 * Completely isolated code editor scoped to a specific course video.
 * Saves code per (userId, courseId, videoId, language) to Firestore.
 * Does NOT interact with the main DSA editor or test-case execution system.
 * Exposes getEditorCode() and applyEditorCode() via ref for AI chatbot integration.
 */
const VideoCodeEditor = forwardRef(function VideoCodeEditor({ userId, courseId, videoId }, ref) {
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState(DEFAULT_CODE['cpp']);
    const [stdin, setStdin] = useState('');
    const [output, setOutput] = useState(null); // { success, output, error }
    const [running, setRunning] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const [loadingCode, setLoadingCode] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const [terminalOpen, setTerminalOpen] = useState(true);
    const editorRef = useRef(null);

    // Bridge for AI chatbot — expose current code and language read/write
    useImperativeHandle(ref, () => ({
        getEditorCode: () => ({ code, language }),
        applyEditorCode: (newCode) => setCode(newCode),
    }), [code, language]);

    const firestoreKey = useCallback(() => {
        if (!userId || !courseId || !videoId) return null;
        // Path: userProfiles/{userId}/courseCode/{courseId}_{videoId}_{language}
        return doc(db, 'userProfiles', userId, 'courseCode', `${courseId}_${videoId}_${language}`);
    }, [userId, courseId, videoId, language]);

    // Load saved code when videoId or language changes
    useEffect(() => {
        const load = async () => {
            const ref = firestoreKey();
            if (!ref) return;
            setLoadingCode(true);
            try {
                const snap = await getDoc(ref);
                if (snap.exists() && snap.data().code) {
                    setCode(snap.data().code);
                } else {
                    setCode(DEFAULT_CODE[language] || '');
                }
            } catch (e) {
                setCode(DEFAULT_CODE[language] || '');
            } finally {
                setLoadingCode(false);
            }
        };
        load();
        setOutput(null);
        // eslint-disable-next-line
    }, [videoId, language, courseId]);

    const saveCode = useCallback(async (codeToSave) => {
        const ref = firestoreKey();
        if (!ref) return;
        setSaving(true);
        try {
            await setDoc(ref, {
                code: codeToSave,
                language,
                courseId,
                videoId,
                savedAt: new Date().toISOString(),
            }, { merge: true });
            setSaveMsg('Saved ✓');
            setTimeout(() => setSaveMsg(''), 2000);
        } catch (e) {
            setSaveMsg('Save failed');
            setTimeout(() => setSaveMsg(''), 2000);
        } finally {
            setSaving(false);
        }
    }, [firestoreKey, language, courseId, videoId]);

    const handleCodeChange = (val) => {
        setCode(val || '');
    };

    const handleRun = async () => {
        if (!code.trim()) return;
        setRunning(true);
        setOutput(null);
        setTerminalOpen(true);
        try {
            const res = await fetch(`${API_BASE}/api/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language, input: stdin }),
            });
            const data = await res.json();
            setOutput(data);
        } catch (e) {
            setOutput({ success: false, output: '', error: 'Network error: could not reach execution server.' });
        } finally {
            setRunning(false);
        }
    };

    const handleReset = () => {
        setCode(DEFAULT_CODE[language] || '');
        setOutput(null);
    };

    const switchLanguage = (langId) => {
        setLanguage(langId);
        setLangMenuOpen(false);
    };

    const currentLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', height: '100%',
            background: '#0d0d14', color: '#fff', fontFamily: "'Inter', sans-serif",
            border: '1px solid rgba(255,255,255,0.05)',
        }}>
            {/* ── Toolbar ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, flexWrap: 'wrap'
            }}>
                {/* Language Picker */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setLangMenuOpen(o => !o)}
                        style={{
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                            color: '#fff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600
                        }}
                    >
                        {currentLang.label} <ChevronDown size={14} />
                    </button>
                    {langMenuOpen && (
                        <div style={{
                            position: 'absolute', top: '110%', left: 0, zIndex: 200,
                            background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px', overflow: 'hidden', minWidth: '130px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                        }}>
                            {LANGUAGES.map(l => (
                                <button
                                    key={l.id}
                                    onClick={() => switchLanguage(l.id)}
                                    style={{
                                        display: 'block', width: '100%', textAlign: 'left',
                                        padding: '9px 14px', background: language === l.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                                        border: 'none', color: language === l.id ? '#60a5fa' : '#ccc',
                                        cursor: 'pointer', fontSize: '0.85rem', fontWeight: language === l.id ? 700 : 400
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

                <div style={{ flex: 1 }} />

                {/* Save status */}
                {saveMsg && (
                    <span style={{ fontSize: '0.8rem', color: saveMsg.includes('fail') ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                        {saveMsg}
                    </span>
                )}

                {/* Reset */}
                <button
                    onClick={handleReset}
                    title="Reset to default template"
                    style={{
                        background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#888', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem'
                    }}
                >
                    <RotateCcw size={13} /> Reset
                </button>

                {/* Save manually */}
                <button
                    onClick={() => saveCode(code)}
                    disabled={saving}
                    style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#ccc', padding: '6px 10px', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem'
                    }}
                >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
                </button>

                {/* Run */}
                <button
                    onClick={handleRun}
                    disabled={running || !code.trim()}
                    style={{
                        background: running ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        border: 'none', color: '#fff', padding: '7px 16px', borderRadius: '8px',
                        cursor: running ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '0.85rem', fontWeight: 700,
                        boxShadow: running ? 'none' : '0 4px 12px rgba(59,130,246,0.35)'
                    }}
                >
                    {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                    {running ? 'Running...' : 'Run'}
                </button>
            </div>

            {/* ── Monaco Editor ── */}
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                {loadingCode && (
                    <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(13,13,20,0.8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
                    }}>
                        <Loader2 size={28} className="animate-spin" color="#3b82f6" />
                    </div>
                )}
                <Editor
                    height="100%"
                    language={currentLang.monaco}
                    value={code}
                    onChange={handleCodeChange}
                    onMount={(editor) => { editorRef.current = editor; }}
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        folding: true,
                        automaticLayout: true,
                        padding: { top: 12, bottom: 12 },
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                        fontLigatures: true,
                        cursorSmoothCaretAnimation: 'on',
                        smoothScrolling: true,
                    }}
                />
            </div>

            {/* ── Stdin Input ── */}
            <div style={{ padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '5px', fontWeight: 600, letterSpacing: '0.5px' }}>
                    STDIN (optional)
                </div>
                <textarea
                    value={stdin}
                    onChange={e => setStdin(e.target.value)}
                    rows={2}
                    placeholder="Provide custom input..."
                    style={{
                        width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#ccc', borderRadius: '6px', padding: '7px 10px', fontSize: '0.85rem',
                        fontFamily: 'monospace', resize: 'none', outline: 'none', boxSizing: 'border-box'
                    }}
                />
            </div>

            {/* ── Terminal Output ── */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <button
                    onClick={() => setTerminalOpen(o => !o)}
                    style={{
                        width: '100%', padding: '8px 14px', background: 'rgba(0,0,0,0.25)',
                        border: 'none', color: '#888', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600
                    }}
                >
                    <Terminal size={14} color="#a855f7" />
                    Output Terminal
                    <ChevronDown size={14} style={{ marginLeft: 'auto', transform: terminalOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {terminalOpen && (
                    <div style={{
                        maxHeight: '180px', overflowY: 'auto', padding: '12px 14px',
                        background: '#050508', fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontSize: '0.82rem', lineHeight: 1.7
                    }}>
                        {!output && !running && (
                            <span style={{ color: '#444' }}>Press Run to execute your code...</span>
                        )}
                        {running && (
                            <span style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Loader2 size={14} className="animate-spin" /> Executing...
                            </span>
                        )}
                        {output && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                    {output.success
                                        ? <CheckCircle size={14} color="#10b981" />
                                        : <AlertCircle size={14} color="#ef4444" />}
                                    <span style={{ color: output.success ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '0.78rem' }}>
                                        {output.success ? 'Execution Successful' : 'Execution Failed'}
                                    </span>
                                </div>
                                {output.output && (
                                    <pre style={{ margin: '0 0 8px 0', color: '#e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {output.output}
                                    </pre>
                                )}
                                {output.error && (
                                    <pre style={{ margin: 0, color: '#fca5a5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {output.error}
                                    </pre>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

export default VideoCodeEditor;
