// src/WebDevSandbox.jsx
import React, { useState, useEffect, useRef } from 'react';
import sdk from '@stackblitz/sdk';
import { Save, Bot, Loader2, RefreshCcw, Wand2, X, Terminal, PackageOpen } from 'lucide-react';
import { db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

// Default files for each template
const DEFAULT_FILES = {
    'create-react-app': {
        'src/index.js': `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);`,
        'src/App.js': `import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="app">
      <h1>AI Web Dev Kit 🚀</h1>
      <p>Your interactive workspace. Edit this file to start building!</p>
      <button onClick={() => setCount(c => c + 1)}>Clicked {count} times</button>
    </div>
  );
}`,
        'src/App.css': `.app {
  font-family: 'Segoe UI', sans-serif;
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  text-align: center;
}
h1 { color: #6366f1; }
button {
  margin-top: 16px;
  padding: 10px 24px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}
button:hover { background: #4f46e5; }`,
        'public/index.html': `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>AI Sandbox</title></head>
<body>
<div id="root"></div>
<script>
// Error bridge: forward preview errors to parent AI panel
window.onerror = function(msg, src, line, col, err) {
  window.parent.postMessage({ type: 'SANDBOX_ERROR', message: msg + (err ? ' at ' + src + ':' + line : '') }, '*');
};
window.addEventListener('unhandledrejection', function(e) {
  window.parent.postMessage({ type: 'SANDBOX_ERROR', message: 'Unhandled: ' + (e.reason?.message || e.reason) }, '*');
});
<\/script>
</body>
</html>`,
        'package.json': JSON.stringify({
            name: 'ai-sandbox',
            version: '1.0.0',
            dependencies: {
                react: '^18.0.0',
                'react-dom': '^18.0.0',
                'react-scripts': '^5.0.0'
            },
            scripts: { start: 'react-scripts start' }
        }, null, 2)
    },
    javascript: {
        'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>AI Sandbox</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div id="app">
    <h1>AI Web Dev Kit 🚀</h1>
    <p>Your interactive workspace.</p>
    <button id="btn">Click me!</button>
  </div>
  <script src="index.js"></script>
</body>
</html>`,
        'index.js': `const btn = document.getElementById('btn');
let count = 0;
btn.addEventListener('click', () => {
  count++;
  btn.textContent = \`Clicked \${count} times\`;
});
console.log('Vanilla workspace ready!');`,
        'style.css': `body {
  font-family: 'Segoe UI', sans-serif;
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  text-align: center;
}
h1 { color: #6366f1; }
button {
  margin-top: 16px;
  padding: 10px 24px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}`,
        'package.json': JSON.stringify({ name: 'vanilla-sandbox', version: '1.0.0', dependencies: {} }, null, 2)
    },
    node: {
        'index.js': `const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'AI Node.js Sandbox 🚀', status: 'running' });
});

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`,
        'package.json': JSON.stringify({
            name: 'node-sandbox',
            version: '1.0.0',
            main: 'index.js',
            dependencies: { express: '^4.18.2' },
            scripts: { start: 'node index.js', dev: 'node index.js' }
        }, null, 2)
    }
};

// ─── Toolbar ─────────────────────────────────────────────────────────────────
function SandboxToolbar({ userId, courseId, template, onTemplateChange, onReset, setCopilotOpen, vmRef, vmReady }) {
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState('Ready');

    const handleSave = async () => {
        if (!userId || !courseId || !vmRef.current) return;
        setIsSaving(true);
        setStatus('Saving...');
        try {
            const files = await vmRef.current.getFsSnapshot();
            const filteredFiles = {};
            for (const [path, content] of Object.entries(files)) {
                if (!path.startsWith('node_modules/') && content && content.length < 200000) {
                    filteredFiles[path] = content;
                }
            }
            // Save under templates/{template} sub-document
            await setDoc(
                doc(db, 'userProfiles', userId, 'webProjects', courseId, 'templates', template),
                { files: filteredFiles, updatedAt: new Date().toISOString() },
                { merge: true }
            );
            setStatus('Saved ✓');
            setTimeout(() => setStatus('Ready'), 3000);
        } catch (err) {
            console.error('Save error', err);
            setStatus('Error saving');
            setTimeout(() => setStatus('Ready'), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', padding: '10px 15px',
            background: '#0f172a', borderBottom: '1px solid #1e293b', alignItems: 'center',
            gap: '10px', flexWrap: 'wrap'
        }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select
                    value={template}
                    onChange={(e) => onTemplateChange(e.target.value)}
                    style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', padding: '6px 12px', borderRadius: '6px', outline: 'none', fontSize: '0.85rem' }}
                >
                    <option value="create-react-app">⚛️ React (CRA)</option>
                    <option value="javascript">🌐 Vanilla HTML/JS</option>
                    <option value="node">🟢 Node.js (Express)</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {!vmReady ? (
                        <>
                            <Loader2 size={13} color="#8b5cf6" className="animate-spin" />
                            <span style={{ fontSize: '0.78rem', color: '#8b5cf6' }}>Loading environment…</span>
                        </>
                    ) : (
                        <span style={{ fontSize: '0.78rem', color: '#10b981' }}>● {status}</span>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={() => setCopilotOpen(prev => !prev)}
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.83rem' }}
                >
                    <Wand2 size={13} /> AI Co-pilot
                </button>
                <button
                    onClick={onReset}
                    style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.83rem' }}
                >
                    <RefreshCcw size={13} /> Reset
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving || !vmReady}
                    style={{ background: isSaving || !vmReady ? '#1e293b' : '#059669', border: 'none', color: isSaving || !vmReady ? '#475569' : '#fff', padding: '6px 12px', borderRadius: '6px', cursor: isSaving || !vmReady ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.83rem' }}
                >
                    {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    Save Project
                </button>
            </div>
        </div>
    );
}

// ─── Diff Preview Modal ───────────────────────────────────────────────────────
function DiffModal({ operations, onApply, onReject }) {
    const [selected, setSelected] = useState(() =>
        Object.fromEntries(operations.map((_, i) => [i, true]))
    );
    const icons = { create: '✨', update: '📝', delete: '🗑️' };
    const colors = { create: '#10b981', update: '#6366f1', delete: '#ef4444' };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', width: '460px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '16px 18px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Bot size={16} color="#ec4899" />
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Review AI Changes</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#64748b' }}>{operations.length} file{operations.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {operations.map((op, i) => (
                        <label key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                            background: selected[i] ? 'rgba(99,102,241,0.08)' : 'transparent',
                            border: `1px solid ${selected[i] ? 'rgba(99,102,241,0.3)' : '#1e293b'}`,
                            marginBottom: '8px'
                        }}>
                            <input type="checkbox" checked={!!selected[i]}
                                onChange={e => setSelected(s => ({ ...s, [i]: e.target.checked }))}
                                style={{ accentColor: '#6366f1' }}
                            />
                            <span style={{ fontSize: '1rem' }}>{icons[op.type] || '📄'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ color: '#e2e8f0', fontSize: '0.83rem', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{op.path}</div>
                                <div style={{ color: colors[op.type] || '#94a3b8', fontSize: '0.73rem', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{op.type}</div>
                            </div>
                        </label>
                    ))}
                </div>
                <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b', display: 'flex', gap: '8px' }}>
                    <button onClick={onReject} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Reject All</button>
                    <button
                        onClick={() => onApply(operations.filter((_, i) => selected[i]))}
                        style={{ flex: 2, padding: '8px', background: '#6366f1', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
                    >Apply Selected ✓</button>
                </div>
            </div>
        </div>
    );
}

// ─── AI Copilot ───────────────────────────────────────────────────────────────
function AICopilotPanel({ isOpen, onClose, vmRef, template, vmReady, sandboxErrors, onClearErrors }) {
    const [prompt, setPrompt] = useState('');
    const [agentPhase, setAgentPhase] = useState('idle'); // idle | planning | writing | applying
    const [conversationHistory, setConversationHistory] = useState([]);
    const [pendingOps, setPendingOps] = useState(null); // waiting for diff approval
    const [packageAdded, setPackageAdded] = useState(false);
    const [openFile, setOpenFile] = useState('src/App.js');
    const bottomRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversationHistory, agentPhase]);

    const phaseLabel = { idle: null, planning: '🧠 Planning…', writing: '✍️ Writing code…', applying: '⚡ Applying changes…' };

    const applyOperations = async (ops) => {
        setAgentPhase('applying');
        const diff = { create: {}, destroy: [] };
        let hasPkgJson = false;
        ops.forEach(op => {
            const p = op.path.replace(/^\.?\//, '');
            if (op.type === 'update' || op.type === 'create') { diff.create[p] = op.content; }
            else if (op.type === 'delete') { diff.destroy.push(p); }
            if (p === 'package.json') hasPkgJson = true;
        });
        await vmRef.current.applyFsDiff(diff);
        if (hasPkgJson) {
            setPackageAdded(true);
            setTimeout(() => setPackageAdded(false), 45000);
        }
        setAgentPhase('idle');
    };

    const handleAskAi = async (overridePrompt) => {
        const userText = overridePrompt || prompt;
        if (!userText.trim() || agentPhase !== 'idle' || !vmRef.current) return;

        const newUserMsg = { role: 'user', content: userText };
        const updatedHistory = [...conversationHistory, newUserMsg];
        setConversationHistory(updatedHistory);
        setPrompt('');
        setAgentPhase('planning');

        try {
            const rawFiles = await vmRef.current.getFsSnapshot();
            const currentFiles = {};
            for (const [path, content] of Object.entries(rawFiles)) {
                if (content && typeof content === 'string' && !path.startsWith('node_modules/') && !path.includes('package-lock.json')) {
                    currentFiles[path] = content;
                }
            }

            setAgentPhase('writing');
            const res = await fetch(`${API_BASE}/api/web-ai-assist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedHistory,
                    template,
                    currentFiles,
                    errors: sandboxErrors,
                    openFile
                })
            });

            if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Request failed'); }
            const data = await res.json();

            const assistantMsg = {
                role: 'assistant',
                content: data.message,
                plan: data.plan,
                ops: data.operations || []
            };
            setConversationHistory(prev => [...prev, assistantMsg]);

            if (data.operations?.length > 0) {
                // Show diff preview — user must approve
                setPendingOps(data.operations);
            } else {
                setAgentPhase('idle');
            }
        } catch (err) {
            console.error(err);
            setConversationHistory(prev => [...prev, { role: 'assistant', content: `⚠️ ${err.message}` }]);
            setAgentPhase('idle');
        }
    };

    const handleDiffApply = async (approvedOps) => {
        setPendingOps(null);
        await applyOperations(approvedOps);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Diff Modal */}
            {pendingOps && (
                <DiffModal
                    operations={pendingOps}
                    onApply={handleDiffApply}
                    onReject={() => { setPendingOps(null); setAgentPhase('idle'); }}
                />
            )}

            <div style={{ width: '320px', background: '#0f172a', borderLeft: '1px solid #1e293b', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                {/* Header */}
                <div style={{ padding: '12px 14px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <Bot size={15} color="#ec4899" /> Agent Co-pilot
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {conversationHistory.length > 0 && (
                            <button onClick={() => setConversationHistory([])} title="Clear chat"
                                style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.7rem' }}>Clear</button>
                        )}
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={14} /></button>
                    </div>
                </div>

                {/* Error Banner */}
                {sandboxErrors.length > 0 && (
                    <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#f87171', fontSize: '0.75rem', flex: 1 }}>⚠️ {sandboxErrors.length} error{sandboxErrors.length > 1 ? 's' : ''} detected</span>
                        <button
                            onClick={() => handleAskAi(`Fix all current runtime errors: ${sandboxErrors.join('; ')}`)}
                            style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.73rem', cursor: 'pointer', fontWeight: 600 }}
                        >Fix Now</button>
                        <button onClick={onClearErrors} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={11} /></button>
                    </div>
                )}

                {/* Package Install Banner */}
                {packageAdded && (
                    <div style={{ padding: '8px 12px', background: 'rgba(234,179,8,0.1)', borderBottom: '1px solid rgba(234,179,8,0.2)' }}>
                        <span style={{ color: '#fbbf24', fontSize: '0.75rem' }}>📦 Installing packages… this may take up to 60s. Check the terminal.</span>
                    </div>
                )}

                {/* Messages */}
                <div style={{ flex: 1, padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }}>
                    {conversationHistory.length === 0 && (
                        <div style={{ color: '#334155', fontSize: '0.81rem', textAlign: 'center', marginTop: '40px', lineHeight: 1.7 }}>
                            <PackageOpen size={26} color="#1e293b" style={{ marginBottom: 8 }} /><br />
                            Describe your feature. I will plan, write, and apply code across your entire project.
                        </div>
                    )}
                    {conversationHistory.map((m, i) => (
                        <div key={i}>
                            <div style={{
                                background: m.role === 'user' ? '#1e293b' : 'transparent',
                                color: m.role === 'user' ? '#e2e8f0' : '#c4b5fd',
                                padding: '9px 11px', borderRadius: '8px', fontSize: '0.81rem', lineHeight: 1.55,
                                border: m.role === 'assistant' ? '1px solid rgba(124,58,237,0.25)' : 'none'
                            }}>
                                {m.content}
                            </div>
                            {m.plan && (
                                <div style={{ marginTop: 4, padding: '7px 10px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)', borderRadius: '6px', fontSize: '0.73rem', color: '#a3a3a3', lineHeight: 1.5 }}>
                                    🧠 {m.plan}
                                </div>
                            )}
                            {m.ops?.length > 0 && (
                                <div style={{ marginTop: 4, fontSize: '0.72rem', color: '#475569', paddingLeft: 4 }}>
                                    {m.ops.map((op, j) => <div key={j}>{op.type === 'delete' ? '🗑️' : op.type === 'create' ? '✨' : '📝'} {op.path}</div>)}
                                </div>
                            )}
                        </div>
                    ))}
                    {agentPhase !== 'idle' && (
                        <div style={{ color: '#7c3aed', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Loader2 size={12} className="animate-spin" /> {phaseLabel[agentPhase]}
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '10px', borderTop: '1px solid #1e293b' }}>
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="Build a login form, fix the navbar, add dark mode…"
                        disabled={agentPhase !== 'idle' || !vmReady}
                        style={{ width: '100%', boxSizing: 'border-box', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#e2e8f0', padding: '8px 10px', minHeight: '68px', resize: 'vertical', fontSize: '0.81rem', lineHeight: 1.5 }}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAskAi(); } }}
                    />
                    <button
                        onClick={() => handleAskAi()}
                        disabled={agentPhase !== 'idle' || !prompt.trim() || !vmReady}
                        style={{
                            width: '100%', marginTop: '7px', padding: '8px',
                            background: agentPhase !== 'idle' || !prompt.trim() || !vmReady ? '#1e293b' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            color: agentPhase !== 'idle' || !prompt.trim() || !vmReady ? '#475569' : '#fff',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700
                        }}
                    >
                        {agentPhase !== 'idle' ? phaseLabel[agentPhase] : '▶ Run Agent'}
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── Loading Overlay ──────────────────────────────────────────────────────────
function SandboxLoader({ message }) {
    return (
        <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a0a0f 0%, #0f172a 100%)',
            zIndex: 10, gap: '16px'
        }}>
            <div style={{ position: 'relative', width: 56, height: 56 }}>
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '3px solid transparent',
                    borderTopColor: '#6366f1', borderRightColor: '#8b5cf6',
                    animation: 'spin 0.9s linear infinite'
                }} />
                <Terminal size={22} color="#6366f1" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>{message}</div>
                <div style={{ color: '#475569', fontSize: '0.78rem' }}>Installing packages and booting WebContainers…</div>
            </div>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WebDevSandbox({ userId, courseId }) {
    const [template, setTemplate] = useState('create-react-app');
    const [initialFiles, setInitialFiles] = useState(null);
    const [firestoreLoading, setFirestoreLoading] = useState(true);
    const [vmReady, setVmReady] = useState(false);
    const [copilotOpen, setCopilotOpen] = useState(false);
    const [containerKey, setContainerKey] = useState(0);
    const [sandboxErrors, setSandboxErrors] = useState([]);
    const vmRef = useRef(null);
    const wrapperRef = useRef(null);

    // Capture runtime errors forwarded from the preview iframe
    useEffect(() => {
        const handleMessage = (e) => {
            if (e.data?.type === 'SANDBOX_ERROR' && e.data.message) {
                setSandboxErrors(prev => [...new Set([...prev, e.data.message])].slice(-5));
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // ── Helper: Firestore path per template
    const templateDocRef = (tmpl) =>
        doc(db, 'userProfiles', userId, 'webProjects', courseId, 'templates', tmpl);

    // ── Load a template's files from Firestore (returns files or null)
    const loadTemplateFiles = async (tmpl) => {
        if (!userId || !courseId) return null;
        try {
            const snap = await getDoc(templateDocRef(tmpl));
            if (snap.exists() && snap.data().files) return snap.data().files;
        } catch (err) {
            console.error('Load error:', err);
        }
        return null;
    };

    // ── Step 1: Load initial template's project from Firestore
    useEffect(() => {
        if (!userId || !courseId) { setFirestoreLoading(false); return; }
        (async () => {
            const files = await loadTemplateFiles(template);
            setInitialFiles(files); // null if no saved project → default template files used
            setFirestoreLoading(false);
        })();
    }, [userId, courseId]); // only on mount

    // ── Step 2: Mount StackBlitz after Firestore data is ready
    useEffect(() => {
        if (firestoreLoading) return;
        setVmReady(false);
        vmRef.current = null;
        // Increment key → React unmounts and remounts a fresh div → no stale DOM nodes
        setContainerKey(k => k + 1);
    }, [template, initialFiles, firestoreLoading]);

    // ── Step 3: Imperatively create a container div, append to wrapper, embed StackBlitz
    // This runs AFTER containerKey increment mounts a clean, child-free wrapperRef div.
    useEffect(() => {
        if (firestoreLoading || !wrapperRef.current) return;

        // Synchronously evict any previous iframe BEFORE the timeout fires.
        // This prevents two StackBlitz instances stacking on top of each other.
        vmRef.current = null;
        const wrapper = wrapperRef.current;
        while (wrapper.firstChild) wrapper.removeChild(wrapper.firstChild);

        const project = {
            title: 'AI Sandbox',
            description: 'Interactive Web Dev Kit',
            template,
            files: initialFiles || DEFAULT_FILES[template] || DEFAULT_FILES['javascript']
        };

        // Create the mount target outside React's purview
        const container = document.createElement('div');
        container.style.cssText = 'width:100%;height:100%;flex:1;';
        wrapper.appendChild(container);

        const timer = setTimeout(async () => {
            try {
                const vm = await sdk.embedProject(container, project, {
                    view: 'both',
                    terminalHeight: 45,
                    openFile: template === 'create-react-app'
                        ? 'src/App.js'
                        : template === 'node' ? 'index.js' : 'index.html',
                    showSidebar: true,
                    hideNavigation: false,
                    height: '100%',
                    startScript: template === 'node' ? 'dev' : undefined
                });
                vmRef.current = vm;
                setVmReady(true);
            } catch (err) {
                console.error('StackBlitz embed failed:', err);
                setVmReady(true);
            }
        }, 150);

        return () => {
            clearTimeout(timer);
        };
    }, [containerKey]);

    // ── Template switch: fetch that template's saved files, then remount
    const handleTemplateChange = async (newTemplate) => {
        if (newTemplate === template) return;
        if (!window.confirm('Switch to ' + newTemplate + '? Your current project is auto-saved.')) return;

        // 1. Save current work first
        if (vmRef.current) {
            try {
                const files = await vmRef.current.getFsSnapshot();
                const filtered = Object.fromEntries(
                    Object.entries(files).filter(([p, c]) => !p.startsWith('node_modules/') && c && c.length < 200000)
                );
                await setDoc(templateDocRef(template), { files: filtered, updatedAt: new Date().toISOString() }, { merge: true });
            } catch (_) {}
        }

        // 2. Show overlay while loading next template
        setVmReady(false);
        setFirestoreLoading(true);

        // 3. Fetch new template's saved files (or null → defaults)
        const files = await loadTemplateFiles(newTemplate);

        // 4. Swap state — useEffect will increment containerKey and remount cleanly
        setTemplate(newTemplate);
        setInitialFiles(files);
        setFirestoreLoading(false);
    };

    // ── Reset: delete Firestore doc for this template and remount with defaults
    const handleReset = async () => {
        if (!window.confirm(`Reset "${template}" template to defaults? This will permanently delete your saved project for this template.`)) return;

        setVmReady(false);
        setFirestoreLoading(true);

        // Delete saved Firestore document for this template
        if (userId && courseId) {
            try {
                await deleteDoc(templateDocRef(template));
            } catch (_) {}
        }

        // Mount with default files (null → DEFAULT_FILES used in embedProject)
        setInitialFiles(null);
        setFirestoreLoading(false);
    };

    const loaderMessage = firestoreLoading
        ? 'Loading your saved project…'
        : 'Starting WebContainers…';

    return (
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b', background: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>
            <SandboxToolbar
                userId={userId} courseId={courseId}
                template={template} onTemplateChange={handleTemplateChange}
                onReset={handleReset}
                setCopilotOpen={setCopilotOpen} vmRef={vmRef} vmReady={vmReady}
            />
            <div style={{ display: 'flex', height: '680px', width: '100%', position: 'relative' }}>
                {/* Loading Overlay — shown until VM is ready */}
                {(!vmReady || firestoreLoading) && <SandboxLoader message={loaderMessage} />}

                {/* React owns this wrapper but never inspects its children.
                    StackBlitz appends its iframe imperatively inside containerKey useEffect. */}
                <div
                    ref={wrapperRef}
                    style={{ flex: 1, height: '100%', background: '#1e1e2e', position: 'relative' }}
                />

                {/* AI Copilot slide-over */}
                <AICopilotPanel
                    isOpen={copilotOpen}
                    onClose={() => setCopilotOpen(false)}
                    vmRef={vmRef} template={template} vmReady={vmReady}
                    sandboxErrors={sandboxErrors}
                    onClearErrors={() => setSandboxErrors([])}
                />
            </div>
        </div>
    );
}
