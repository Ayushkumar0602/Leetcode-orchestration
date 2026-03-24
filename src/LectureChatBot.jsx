import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, Loader2, Eye, EyeOff, ShieldCheck, X, Check, Copy, RotateCcw, Code2, ChevronUp, ChevronDown, Maximize2, Highlighter } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

// ── Simple markdown renderer ──────────────────────────────────────────────────
function renderMarkdown(text) {
    const lines = text.split('\n');
    const blocks = [];
    let codeBuffer = [], codeLang = '', inCode = false, key = 0;
    const flush = () => {
        if (codeBuffer.length) {
            blocks.push(
                <div key={key++} style={{ position: 'relative', margin: '10px 0' }}>
                    {codeLang && <div style={{ background: '#1e2433', color: '#7c86a2', fontSize: '0.7rem', padding: '4px 12px', borderRadius: '6px 6px 0 0', fontFamily: 'monospace', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{codeLang}</div>}
                    <pre style={{ background: '#0d1117', color: '#c9d1d9', padding: '12px 16px', borderRadius: codeLang ? '0 6px 6px 6px' : '6px', fontSize: '0.82rem', overflowX: 'auto', margin: 0, fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace", lineHeight: 1.6 }}>
                        <code>{codeBuffer.join('\n')}</code>
                    </pre>
                </div>
            );
            codeBuffer = []; codeLang = '';
        }
    };
    for (const line of lines) {
        if (line.startsWith('```')) { if (inCode) { flush(); inCode = false; } else { inCode = true; codeLang = line.slice(3).trim(); } continue; }
        if (inCode) { codeBuffer.push(line); continue; }
        if (line.startsWith('### ')) { blocks.push(<h4 key={key++} style={{ margin: '10px 0 4px', color: '#e2e8f0', fontSize: '0.95rem' }}>{line.slice(4)}</h4>); continue; }
        if (line.startsWith('## '))  { blocks.push(<h3 key={key++} style={{ margin: '12px 0 4px', color: '#e2e8f0', fontSize: '1rem' }}>{line.slice(3)}</h3>); continue; }
        if (line.startsWith('# '))   { blocks.push(<h2 key={key++} style={{ margin: '14px 0 6px', color: '#e2e8f0', fontSize: '1.1rem' }}>{line.slice(2)}</h2>); continue; }
        if (line.startsWith('- ') || line.startsWith('* ')) { blocks.push(<li key={key++} style={{ color: '#b8c1cc', fontSize: '0.875rem', marginLeft: '14px', lineHeight: 1.6 }}>{inlineRender(line.slice(2))}</li>); continue; }
        if (/^\d+\. /.test(line)) { const c = line.replace(/^\d+\. /, ''); blocks.push(<li key={key++} style={{ color: '#b8c1cc', fontSize: '0.875rem', marginLeft: '14px', lineHeight: 1.6 }}>{inlineRender(c)}</li>); continue; }
        if (!line.trim()) { blocks.push(<div key={key++} style={{ height: '6px' }} />); continue; }
        blocks.push(<p key={key++} style={{ margin: '3px 0', color: '#b8c1cc', fontSize: '0.875rem', lineHeight: 1.7 }}>{inlineRender(line)}</p>);
    }
    if (inCode) flush();
    return <div>{blocks}</div>;
}

function inlineRender(text) {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) return <code key={i} style={{ background: '#1e2433', color: '#7dd3fc', padding: '1px 5px', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'monospace' }}>{part.slice(1, -1)}</code>;
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} style={{ color: '#e2e8f0' }}>{part.slice(2, -2)}</strong>;
        return part;
    });
}

// Parse "highlight: L5-L10" or "highlight: 5-10" annotations from AI text
function parseHighlight(text) {
    const m = text.match(/highlight:\s*[Ll]?(\d+)[–\-]?[Ll]?(\d+)/);
    if (m) return [parseInt(m[1]), parseInt(m[2])];
    const s = text.match(/highlight:\s*[Ll]?(\d+)/);
    if (s) return [parseInt(s[1]), parseInt(s[1])];
    return null;
}

// Extract first code block from AI text
function extractCodeBlock(text) {
    const m = text.match(/```(\w+)?\n([\s\S]+?)```/);
    if (m) return { code: m[2].trim(), lang: m[1] || null };
    return null;
}

// ── Main Component ────────────────────────────────────────────────────────────
/**
 * LectureChatBot
 * Props:
 *   videoTitle       (string)
 *   getEditorCode    () => { code, language }
 *   applyEditorCode  (newCode) => void
 *   highlightLines   (start, end) => void
 *   clearHighlights  () => void
 *   switchToEditor   () => void   — switches sidebar to Code Editor tab
 *   onExpandChange   (bool) => void
 */
export default function LectureChatBot({
    videoTitle,
    getEditorCode,
    applyEditorCode,
    highlightLines,
    clearHighlights,
    switchToEditor,
    onExpandChange,
}) {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([{
        id: 1, role: 'assistant',
        content: `Hi! I'm your AI tutor for **"${videoTitle}"**.\n\nI can see your code editor, help you write, debug and optimize code, and highlight relevant lines for you.\n\nWhat would you like to explore?`,
    }]);
    const [input, setInput]       = useState('');
    const [loading, setLoading]   = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    // Code access — auto-granted (editor is always available)
    const [codePermission, setCodePermission] = useState(false);
    const [permRequested, setPermRequested]   = useState(false);

    // Pending code suggestion from AI
    const [pendingSuggestion, setPendingSuggestion] = useState(null);

    // Live editor state shown in the header
    const [editorInfo, setEditorInfo] = useState({ language: '', hasCode: false });

    const bottomRef = useRef(null);
    const inputRef  = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

    // Poll editor info for the header indicator
    useEffect(() => {
        const tick = () => {
            const info = getEditorCode?.();
            if (info) setEditorInfo({ language: info.language || '', hasCode: !!(info.code?.trim()) });
        };
        tick();
        const id = setInterval(tick, 2000);
        return () => clearInterval(id);
    }, [getEditorCode]);

    // Reset on video change — keep permission state
    useEffect(() => {
        setMessages([{
            id: Date.now(), role: 'assistant',
            content: `Hi! I'm your AI tutor for **"${videoTitle}"**. I can see your code editor and help you with any topic. What would you like to explore?`,
        }]);
        setPendingSuggestion(null);
        clearHighlights?.();
    // eslint-disable-next-line
    }, [videoTitle]);

    const toggleCollapsed = () => {
        const next = !collapsed;
        setCollapsed(next);
        onExpandChange?.(!next);
    };

    const sendMessage = useCallback(async (textOverride) => {
        const text = (textOverride ?? input).trim();
        if (!text || loading) return;

        const userMsg = { id: Date.now(), role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Detect code-related intent & ask permission if not granted
        const codeKeywords = /\b(code|debug|fix|error|bug|optimize|improve|review|analyze|rewrite|highlight|line|function|loop|variable)\b/i;
        const wantsCode = codeKeywords.test(text) && !codePermission && getEditorCode;
        if (wantsCode && !permRequested) {
            setPermRequested(true);
            setLoading(false);
            setMessages(prev => [...prev, {
                id: Date.now() + 1, role: 'assistant',
                content: '🔒 To help with your code, I need your permission to view the editor. Would you like to **grant access**?',
                type: 'permission_request',
            }]);
            return;
        }

        // Build code context
        let userCode = null, language = null;
        if (codePermission && getEditorCode) {
            const s = getEditorCode();
            userCode = s?.code || null;
            language = s?.language || null;
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
            const aiText = data.text;

            // Parse highlight annotation
            const hlRange = parseHighlight(aiText);
            const codeBlock = extractCodeBlock(aiText);

            // Auto-highlight if AI specifies lines
            if (hlRange && codePermission && highlightLines) {
                highlightLines(hlRange[0], hlRange[1]);
            }

            // Show suggestion banner if AI suggests a code change
            if (codeBlock && codePermission && applyEditorCode) {
                const currentCode = userCode || '';
                if (codeBlock.code !== currentCode.trim()) {
                    setPendingSuggestion({ suggested: codeBlock.code, language: codeBlock.lang || language || 'code', original: currentCode, hlRange });
                }
            }

            setMessages(prev => [...prev, { id: Date.now() + 2, role: 'assistant', content: aiText, hlRange }]);
        } catch (err) {
            setMessages(prev => [...prev, { id: Date.now() + 3, role: 'assistant', content: `⚠️ Sorry, something went wrong: *${err.message}*. Please try again.` }]);
        } finally {
            setLoading(false);
        }
    }, [input, loading, messages, videoTitle, codePermission, permRequested, getEditorCode, applyEditorCode, highlightLines]);

    const handleKeyDown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

    const grantPermission = () => {
        setCodePermission(true);
        setPermRequested(false);
        setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: '✅ **Code access granted.** I can now see your editor. Please resend your question!' }]);
    };
    const denyPermission = () => {
        setPermRequested(false);
        setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: '🔒 No problem! Describe your code and I\'ll help without accessing the editor.' }]);
    };

    const applySuggestion = () => {
        if (!pendingSuggestion || !applyEditorCode) return;
        applyEditorCode(pendingSuggestion.suggested);
        if (pendingSuggestion.hlRange && highlightLines) highlightLines(pendingSuggestion.hlRange[0], pendingSuggestion.hlRange[1]);
        setPendingSuggestion(null);
        setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: '✅ Code applied to your editor!' }]);
    };

    const resetChat = () => {
        setMessages([{ id: Date.now(), role: 'assistant', content: `Hi! I'm your AI tutor for **"${videoTitle}"**. How can I help?` }]);
        setCodePermission(false); setPermRequested(false); setPendingSuggestion(null);
        clearHighlights?.();
    };

    const copyToClipboard = text => navigator.clipboard.writeText(text);

    const quickActions = [
        { label: 'Explain this topic', prompt: `Explain the main concepts in "${videoTitle}".` },
        { label: 'Code example', prompt: `Give a practical code example for "${videoTitle}".` },
        { label: 'Review my code', prompt: `Please review my current code and suggest improvements.` },
        { label: 'Quiz me', prompt: `Quiz me on the key concepts from "${videoTitle}" with 3 questions.` },
    ];

    return (
        <div style={{
            background: 'linear-gradient(145deg, #0d0f18, #111420)',
            border: '1px solid rgba(139,92,246,0.15)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            fontFamily: "'Inter',sans-serif",
            display: 'flex', flexDirection: 'column', height: '100%',
        }}>

            {/* ── Header ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', flexShrink: 0,
                background: 'linear-gradient(90deg,rgba(139,92,246,0.12),rgba(59,130,246,0.08))',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '10px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 12px rgba(139,92,246,0.4)' }}>
                        <img src="/logo.jpeg" alt="Whizan AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            Whizan AI
                            {codePermission && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '2px 6px', borderRadius: '6px' }}>
                                    <ShieldCheck size={10} /> Code Access
                                </span>
                            )}
                            {codePermission && editorInfo.language && (
                                <span style={{ fontSize: '0.7rem', color: '#93c5fd', background: 'rgba(59,130,246,0.12)', padding: '2px 7px', borderRadius: '6px' }}>
                                    {editorInfo.language}
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '1px' }}>
                            {videoTitle.length > 38 ? videoTitle.slice(0, 38) + '…' : videoTitle}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {codePermission && clearHighlights && (
                        <button onClick={() => clearHighlights()} title="Clear editor highlights"
                            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                            <Highlighter size={13} />
                        </button>
                    )}
                    <button onClick={resetChat} title="Reset conversation"
                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                        <RotateCcw size={13} />
                    </button>
                    <button onClick={toggleCollapsed} title={collapsed ? 'Expand' : 'Collapse'}
                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                        {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                </div>
            </div>

            {!collapsed && (
                <>
                    {/* ── Quick Actions ── */}
                    {messages.length === 1 && (
                        <div style={{ display: 'flex', gap: '6px', padding: '10px 14px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 }}>
                            {quickActions.map(qa => (
                                <button key={qa.label} onClick={() => sendMessage(qa.prompt)}
                                    style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa', borderRadius: '8px', padding: '4px 11px', fontSize: '0.76rem', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.16)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
                                >{qa.label}</button>
                            ))}
                        </div>
                    )}

                    {/* ── Code Suggestion Banner ── */}
                    {pendingSuggestion && (
                        <div style={{ margin: '10px 14px', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '12px', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Code2 size={13} /> AI Suggests a Code Change
                            </div>
                            <pre style={{ background: '#0d1117', color: '#c9d1d9', padding: '10px', borderRadius: '6px', fontSize: '0.78rem', maxHeight: '110px', overflowY: 'auto', margin: '0 0 10px', fontFamily: 'monospace' }}>
                                {pendingSuggestion.suggested}
                            </pre>
                            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                                <button onClick={applySuggestion} style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', borderRadius: '7px', padding: '5px 13px', fontSize: '0.79rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                                    <Check size={12} /> Apply to Editor
                                </button>
                                {switchToEditor && (
                                    <button onClick={() => { switchToEditor(); highlightLines?.(1,1); }} style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa', borderRadius: '7px', padding: '5px 13px', fontSize: '0.79rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Maximize2 size={12} /> View in Editor
                                    </button>
                                )}
                                <button onClick={() => copyToClipboard(pendingSuggestion.suggested)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '7px', padding: '5px 13px', fontSize: '0.79rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Copy size={12} /> Copy
                                </button>
                                <button onClick={() => setPendingSuggestion(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                                    <X size={15} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Messages ── */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '8px', flexShrink: 0, background: msg.role === 'user' ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff', overflow: 'hidden' }}>
                                    {msg.role === 'user' ? (
                                        currentUser?.photoURL ? 
                                            <img src={currentUser.photoURL} alt="User" referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> 
                                            : (currentUser?.displayName?.[0]?.toUpperCase() || 'U')
                                    ) : (
                                        <img src="/logo.jpeg" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    )}
                                </div>
                                <div style={{ maxWidth: '84%', background: msg.role === 'user' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px', border: `1px solid ${msg.role === 'user' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)'}`, padding: '10px 13px' }}>
                                    {renderMarkdown(msg.content)}

                                    {/* Highlight button for messages with line ranges */}
                                    {msg.hlRange && codePermission && highlightLines && (
                                        <button
                                            onClick={() => { highlightLines(msg.hlRange[0], msg.hlRange[1]); switchToEditor?.(); }}
                                            style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                            <Highlighter size={11} /> Highlight L{msg.hlRange[0]}–{msg.hlRange[1]} in Editor
                                        </button>
                                    )}

                                    {/* Permission request buttons */}
                                    {msg.type === 'permission_request' && !codePermission && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                            <button onClick={grantPermission} style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa', borderRadius: '7px', padding: '5px 13px', fontSize: '0.79rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                                                <ShieldCheck size={12} /> Grant Access
                                            </button>
                                            <button onClick={denyPermission} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '7px', padding: '5px 13px', fontSize: '0.79rem', cursor: 'pointer' }}>
                                                No Thanks
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '8px', flexShrink: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <img src="/logo.jpeg" alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '4px 14px 14px 14px', border: '1px solid rgba(255,255,255,0.06)', padding: '11px 14px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                                    {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', animation: `bounce 1.2s ${i*0.2}s infinite ease-in-out` }} />)}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* ── Input ── */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '10px 14px', display: 'flex', gap: '9px', alignItems: 'flex-end', flexShrink: 0 }}>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Ask about "${videoTitle.length > 28 ? videoTitle.slice(0, 28) + '…' : videoTitle}"…`}
                            rows={1}
                            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e2e8f0', padding: '9px 13px', fontSize: '0.875rem', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, maxHeight: '100px', overflowY: 'auto', transition: 'border-color 0.2s' }}
                            onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.4)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                            style={{ background: input.trim() && !loading ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', width: 38, height: 38, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0, boxShadow: input.trim() && !loading ? '0 0 12px rgba(139,92,246,0.3)' : 'none' }}
                        >
                            {loading ? <Loader2 size={15} color="#fff" className="animate-spin" /> : <Send size={15} color={input.trim() ? '#fff' : '#555'} />}
                        </button>
                    </div>
                </>
            )}

            <style>{`
                @keyframes bounce {
                    0%,80%,100% { transform:scale(0.8);opacity:0.4; }
                    40% { transform:scale(1.2);opacity:1; }
                }
            `}</style>
        </div>
    );
}
