import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, Loader2, Eye, EyeOff, ChevronDown, ChevronUp, ShieldCheck, X, Check, Copy, RotateCcw, Code2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

// ── Simple markdown renderer (no extra deps) ─────────────────────────────────
function renderMarkdown(text) {
    const lines = text.split('\n');
    const blocks = [];
    let codeBuffer = [];
    let codeLang = '';
    let inCode = false;
    let key = 0;

    const flush = () => {
        if (codeBuffer.length) {
            blocks.push(
                <div key={key++} style={{ position: 'relative', margin: '10px 0' }}>
                    {codeLang && (
                        <div style={{
                            background: '#1e2433', color: '#7c86a2', fontSize: '0.7rem',
                            padding: '4px 12px', borderRadius: '6px 6px 0 0',
                            fontFamily: 'monospace', letterSpacing: '0.05em', textTransform: 'uppercase'
                        }}>{codeLang}</div>
                    )}
                    <pre style={{
                        background: '#0d1117', color: '#c9d1d9', padding: '12px 16px',
                        borderRadius: codeLang ? '0 6px 6px 6px' : '6px',
                        fontSize: '0.82rem', overflowX: 'auto', margin: 0,
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                        lineHeight: 1.6
                    }}>
                        <code>{codeBuffer.join('\n')}</code>
                    </pre>
                </div>
            );
            codeBuffer = [];
            codeLang = '';
        }
    };

    for (const line of lines) {
        if (line.startsWith('```')) {
            if (inCode) { flush(); inCode = false; }
            else { inCode = true; codeLang = line.slice(3).trim(); }
            continue;
        }
        if (inCode) { codeBuffer.push(line); continue; }

        // headings
        if (line.startsWith('### ')) { blocks.push(<h4 key={key++} style={{ margin: '10px 0 4px', color: '#e2e8f0', fontSize: '0.95rem' }}>{line.slice(4)}</h4>); continue; }
        if (line.startsWith('## '))  { blocks.push(<h3 key={key++} style={{ margin: '12px 0 4px', color: '#e2e8f0', fontSize: '1rem' }}>{line.slice(3)}</h3>); continue; }
        if (line.startsWith('# '))   { blocks.push(<h2 key={key++} style={{ margin: '14px 0 6px', color: '#e2e8f0', fontSize: '1.1rem' }}>{line.slice(2)}</h2>); continue; }

        // bullet
        if (line.startsWith('- ') || line.startsWith('* ')) {
            blocks.push(<li key={key++} style={{ color: '#b8c1cc', fontSize: '0.875rem', marginLeft: '14px', lineHeight: 1.6 }}>{inlineRender(line.slice(2))}</li>);
            continue;
        }
        // numbered
        if (/^\d+\. /.test(line)) {
            const content = line.replace(/^\d+\. /, '');
            blocks.push(<li key={key++} style={{ color: '#b8c1cc', fontSize: '0.875rem', marginLeft: '14px', lineHeight: 1.6 }}>{inlineRender(content)}</li>);
            continue;
        }
        // blank line
        if (!line.trim()) { blocks.push(<div key={key++} style={{ height: '6px' }} />); continue; }
        // normal paragraph
        blocks.push(<p key={key++} style={{ margin: '3px 0', color: '#b8c1cc', fontSize: '0.875rem', lineHeight: 1.7 }}>{inlineRender(line)}</p>);
    }
    if (inCode) flush();
    return <div>{blocks}</div>;
}

function inlineRender(text) {
    // bold + inline code
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} style={{ background: '#1e2433', color: '#7dd3fc', padding: '1px 5px', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'monospace' }}>{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} style={{ color: '#e2e8f0' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}

// ── Main Component ────────────────────────────────────────────────────────────
/**
 * LectureChatBot — completely isolated AI chatbot for the lecture page.
 *
 * Props:
 *   videoTitle          (string)    — current video title used as AI context
 *   getEditorCode       (function)  — () => { code, language } from VideoCodeEditor
 *   applyEditorCode     (function)  — (newCode) => void, apply suggested code to editor
 */
export default function LectureChatBot({ videoTitle, getEditorCode, applyEditorCode }) {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: `Hi! I'm your AI tutor for **"${videoTitle}"**. I can help you understand concepts, write code, debug issues, and more.\n\nWhat would you like to explore?`,
        }
    ]);
    const [input, setInput]             = useState('');
    const [loading, setLoading]         = useState(false);
    const [collapsed, setCollapsed]     = useState(false);

    // Code permission state
    const [codePermission, setCodePermission]   = useState(false); // has user granted permission?
    const [permRequested, setPermRequested]     = useState(false); // AI requested, awaiting user

    // Suggestion / diff state
    const [pendingSuggestion, setPendingSuggestion] = useState(null); // { original, suggested, language }

    const bottomRef = useRef(null);
    const inputRef  = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Reset fresh when video changes
    useEffect(() => {
        setMessages([{
            id: Date.now(),
            role: 'assistant',
            content: `Hi! I'm your AI tutor for **"${videoTitle}"**. I can help you understand concepts, write and debug code, and more. What would you like to explore?`,
        }]);
        setCodePermission(false);
        setPermRequested(false);
        setPendingSuggestion(null);
    }, [videoTitle]);

    const sendMessage = useCallback(async (textOverride) => {
        const text = (textOverride ?? input).trim();
        if (!text || loading) return;

        const userMsg = { id: Date.now(), role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Detect if AI needs code context and we don't have permission yet
        const codeKeywords = /\b(code|debug|fix|error|bug|optimize|improve|review|analyze|rewrite)\b/i;
        const wantsCode = codeKeywords.test(text) && !codePermission && getEditorCode;
        if (wantsCode && !permRequested) {
            setPermRequested(true);
            setLoading(false);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: '🔒 To help with your code, I need your permission to view what\'s currently in your editor. Would you like to **grant access** so I can provide tailored assistance?',
                type: 'permission_request',
            }]);
            return;
        }

        // Build code context
        let userCode = null;
        let language = null;
        if (codePermission && getEditorCode) {
            const editorState = getEditorCode();
            userCode = editorState?.code || null;
            language = editorState?.language || null;
        }

        try {
            const res = await fetch(`${API_BASE}/api/lecture-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoTitle,
                    messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
                    userCode,
                    language,
                    codePermissionGranted: codePermission,
                }),
            });

            if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
            const data = await res.json();

            // Check if response contains a code suggestion block we should extract
            const suggestionMatch = data.text.match(/```(\w+)?\n([\s\S]+?)```/);
            if (suggestionMatch && codePermission && applyEditorCode && userCode) {
                const suggested = suggestionMatch[2].trim();
                if (suggested !== userCode.trim()) {
                    setPendingSuggestion({ suggested, language: suggestionMatch[1] || language || 'code', original: userCode });
                }
            }

            setMessages(prev => [...prev, { id: Date.now() + 2, role: 'assistant', content: data.text }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                id: Date.now() + 3, role: 'assistant', content: `⚠️ Sorry, something went wrong: *${err.message}*. Please try again.`
            }]);
        } finally {
            setLoading(false);
        }
    }, [input, loading, messages, videoTitle, codePermission, permRequested, getEditorCode, applyEditorCode]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const grantPermission = () => {
        setCodePermission(true);
        setPermRequested(false);
        setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'assistant',
            content: '✅ **Code access granted.** I can now see your editor content to provide tailored help. Please resend your question!',
        }]);
    };

    const denyPermission = () => {
        setPermRequested(false);
        setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'assistant',
            content: '🔒 No problem! I\'ll help without accessing your editor. Just describe your code question and I\'ll do my best.',
        }]);
    };

    const applySuggestion = () => {
        if (pendingSuggestion && applyEditorCode) {
            applyEditorCode(pendingSuggestion.suggested);
            setPendingSuggestion(null);
            setMessages(prev => [...prev, {
                id: Date.now(), role: 'assistant',
                content: '✅ Code applied to your editor! Let me know if you need further changes.',
            }]);
        }
    };

    const resetChat = () => {
        setMessages([{
            id: Date.now(), role: 'assistant',
            content: `Hi! I'm your AI tutor for **"${videoTitle}"**. How can I help you?`,
        }]);
        setCodePermission(false);
        setPermRequested(false);
        setPendingSuggestion(null);
    };

    const copyToClipboard = (text) => { navigator.clipboard.writeText(text); };

    const quickActions = [
        { label: 'Explain this topic', prompt: `Can you explain the main concepts covered in "${videoTitle}"?` },
        { label: 'Give me an example', prompt: `Can you give me a practical code example related to "${videoTitle}"?` },
        { label: 'Quiz me', prompt: `Quiz me on the key concepts from "${videoTitle}" with 3 questions.` },
    ];

    return (
        <div style={{
            background: 'linear-gradient(145deg, #0d0f18, #111420)',
            borderRadius: '16px',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
            fontFamily: "'Inter', sans-serif",
            margin: '0 0 20px 0',
        }}>

            {/* ── Header ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px',
                background: 'linear-gradient(90deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '10px',
                        overflow: 'hidden', flexShrink: 0,
                        boxShadow: '0 0 12px rgba(139,92,246,0.4)',
                    }}>
                        <img src="/logo.jpeg" alt="Whizan AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            Whizan AI
                            {codePermission && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '2px 6px', borderRadius: '6px' }}>
                                    <ShieldCheck size={11} /> Code Access On
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>
                            Context: {videoTitle.length > 40 ? videoTitle.slice(0, 40) + '…' : videoTitle}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button onClick={resetChat} title="Reset conversation"
                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                        <RotateCcw size={14} />
                    </button>
                    <button onClick={() => setCollapsed(p => !p)} title={collapsed ? 'Expand' : 'Collapse'}
                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                        {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                </div>
            </div>

            {!collapsed && (
                <>
                    {/* ── Quick Actions (only when 1 message) ── */}
                    {messages.length === 1 && (
                        <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            {quickActions.map(qa => (
                                <button key={qa.label} onClick={() => sendMessage(qa.prompt)}
                                    style={{
                                        background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                                        color: '#a78bfa', borderRadius: '8px', padding: '5px 12px',
                                        fontSize: '0.78rem', cursor: 'pointer', fontWeight: 500,
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.16)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
                                >
                                    {qa.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── Code Suggestion Diff Banner ── */}
                    {pendingSuggestion && (
                        <div style={{
                            margin: '12px 16px', background: 'rgba(34,197,94,0.07)',
                            border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '12px',
                        }}>
                            <div style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Code2 size={14} /> AI Suggests a Code Change
                            </div>
                            <pre style={{
                                background: '#0d1117', color: '#c9d1d9', padding: '10px', borderRadius: '6px',
                                fontSize: '0.78rem', maxHeight: '120px', overflowY: 'auto', margin: '0 0 10px',
                                fontFamily: 'monospace',
                            }}>
                                {pendingSuggestion.suggested}
                            </pre>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={applySuggestion} style={{
                                    background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                                    color: '#4ade80', borderRadius: '7px', padding: '5px 14px',
                                    fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600,
                                }}>
                                    <Check size={13} /> Apply to Editor
                                </button>
                                <button onClick={() => { copyToClipboard(pendingSuggestion.suggested); }} style={{
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#94a3b8', borderRadius: '7px', padding: '5px 14px',
                                    fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                                }}>
                                    <Copy size={13} /> Copy
                                </button>
                                <button onClick={() => setPendingSuggestion(null)} style={{
                                    background: 'transparent', border: 'none', color: '#64748b',
                                    cursor: 'pointer', marginLeft: 'auto', display: 'flex', alignItems: 'center',
                                }}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Messages ── */}
                    <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                                {/* Avatar */}
                                <div style={{
                                    width: 30, height: 30, borderRadius: '8px', flexShrink: 0,
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                                        : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                                }}>
                                    {msg.role === 'user' ? 'U' : <Bot size={14} />}
                                </div>

                                {/* Bubble */}
                                <div style={{
                                    maxWidth: '82%',
                                    background: msg.role === 'user'
                                        ? 'rgba(59,130,246,0.15)'
                                        : 'rgba(255,255,255,0.04)',
                                    borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                                    border: `1px solid ${msg.role === 'user' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)'}`,
                                    padding: '10px 14px',
                                }}>
                                    {renderMarkdown(msg.content)}

                                    {/* Permission request buttons */}
                                    {msg.type === 'permission_request' && !codePermission && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                            <button onClick={grantPermission} style={{
                                                background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                                                color: '#a78bfa', borderRadius: '7px', padding: '5px 14px',
                                                fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600,
                                            }}>
                                                <ShieldCheck size={13} /> Grant Access
                                            </button>
                                            <button onClick={denyPermission} style={{
                                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#94a3b8', borderRadius: '7px', padding: '5px 14px',
                                                fontSize: '0.8rem', cursor: 'pointer',
                                            }}>
                                                No Thanks
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <div style={{ width: 30, height: 30, borderRadius: '8px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Bot size={14} color="#fff" />
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '4px 14px 14px 14px', border: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    {[0, 1, 2].map(i => (
                                        <div key={i} style={{
                                            width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6',
                                            animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
                                        }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* ── Input ── */}
                    <div style={{
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        padding: '12px 16px',
                        display: 'flex', gap: '10px', alignItems: 'flex-end',
                    }}>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Ask about "${videoTitle.length > 30 ? videoTitle.slice(0, 30) + '…' : videoTitle}"…`}
                            rows={1}
                            style={{
                                flex: 1, background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '10px', color: '#e2e8f0', padding: '10px 14px',
                                fontSize: '0.875rem', resize: 'none', outline: 'none',
                                fontFamily: 'inherit', lineHeight: 1.5,
                                maxHeight: '100px', overflowY: 'auto',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.4)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                            style={{
                                background: input.trim() && !loading
                                    ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                                    : 'rgba(255,255,255,0.06)',
                                border: 'none', borderRadius: '10px',
                                width: 40, height: 40, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s', flexShrink: 0,
                                boxShadow: input.trim() && !loading ? '0 0 12px rgba(139,92,246,0.3)' : 'none',
                            }}
                        >
                            {loading ? <Loader2 size={16} color="#fff" className="animate-spin" /> : <Send size={16} color={input.trim() ? '#fff' : '#555'} />}
                        </button>
                    </div>
                </>
            )}

            {/* ── Bounce animation ── */}
            <style>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
                    40% { transform: scale(1.2); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
