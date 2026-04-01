// src/WebDevSandbox.jsx
import React, { useState, useEffect, useRef } from 'react';
import sdk from '@stackblitz/sdk';
import { Save, Bot, Loader2, RefreshCcw, Wand2, X, Terminal, PackageOpen } from 'lucide-react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
<body><div id="root"></div></body>
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
function SandboxToolbar({ userId, courseId, template, onTemplateChange, setCopilotOpen, vmRef, vmReady }) {
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState('Ready');

    const handleSave = async () => {
        if (!userId || !courseId || !vmRef.current) return;
        setIsSaving(true);
        setStatus('Saving...');
        try {
            // getFsSnapshot captures ALL files including package.json and node_modules manifest
            const files = await vmRef.current.getFsSnapshot();
            // Filter out node_modules contents (too large), keep package.json
            const filteredFiles = {};
            for (const [path, content] of Object.entries(files)) {
                if (!path.startsWith('node_modules/') && content && content.length < 200000) {
                    filteredFiles[path] = content;
                }
            }
            await setDoc(doc(db, 'userProfiles', userId, 'webProjects', courseId), {
                template,
                files: filteredFiles,
                updatedAt: new Date().toISOString()
            }, { merge: true });
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
                    onClick={() => {
                        if (window.confirm('Reset all files to template defaults?')) {
                            onTemplateChange(template, true);
                        }
                    }}
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

// ─── AI Copilot ───────────────────────────────────────────────────────────────
function AICopilotPanel({ isOpen, onClose, vmRef, template, vmReady }) {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [messages, setMessages] = useState([]);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isGenerating]);

    const handleAskAi = async () => {
        if (!prompt.trim() || isGenerating || !vmRef.current) return;

        const userMsg = { role: 'user', text: prompt };
        setMessages(prev => [...prev, userMsg]);
        setPrompt('');
        setIsGenerating(true);

        try {
            const rawFiles = await vmRef.current.getFsSnapshot();
            const currentFiles = {};
            for (const [path, content] of Object.entries(rawFiles)) {
                if (
                    content && typeof content === 'string' &&
                    content.length < 50000 &&
                    !path.startsWith('node_modules/') &&
                    !path.includes('package-lock.json')
                ) {
                    currentFiles[path] = content;
                }
            }

            const res = await fetch(`${API_BASE}/api/web-ai-assist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userMsg.text, template, currentFiles })
            });

            if (!res.ok) throw new Error('AI request failed');
            const data = await res.json();

            setMessages(prev => [...prev, { role: 'assistant', text: data.message }]);

            if (data.operations && Array.isArray(data.operations)) {
                const diff = { create: {}, destroy: [] };
                data.operations.forEach(op => {
                    let p = op.path.replace(/^\.\//, '').replace(/^\//, '');
                    if (op.type === 'update' || op.type === 'create') {
                        diff.create[p] = op.content;
                    } else if (op.type === 'delete') {
                        diff.destroy.push(p);
                    }
                });
                await vmRef.current.applyFsDiff(diff);
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Connection error. Please try again.' }]);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ width: '300px', background: '#0f172a', borderLeft: '1px solid #1e293b', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '12px 15px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={16} color="#ec4899" /> Agent Co-pilot
                </span>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={15} /></button>
            </div>

            <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }}>
                {messages.length === 0 && (
                    <div style={{ color: '#475569', fontSize: '0.82rem', textAlign: 'center', marginTop: '30px', lineHeight: 1.6 }}>
                        <PackageOpen size={28} color="#334155" style={{ marginBottom: 8 }} />
                        <br />Describe what you want to build. I will read all your files and make the changes automatically.
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} style={{
                        background: m.role === 'user' ? '#1e293b' : 'rgba(124,58,237,0.1)',
                        color: m.role === 'user' ? '#e2e8f0' : '#c4b5fd',
                        padding: '9px 12px', borderRadius: '8px', fontSize: '0.82rem', lineHeight: 1.5,
                        border: m.role === 'assistant' ? '1px solid rgba(124,58,237,0.25)' : 'none'
                    }}>
                        {m.text}
                    </div>
                ))}
                {isGenerating && (
                    <div style={{ color: '#7c3aed', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Loader2 size={12} className="animate-spin" /> Reasoning and writing code…
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div style={{ padding: '12px', borderTop: '1px solid #1e293b' }}>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="E.g. Add a dark mode toggle navbar"
                    disabled={!vmReady}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff', padding: '9px', minHeight: '72px', resize: 'vertical', fontSize: '0.83rem' }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAskAi(); } }}
                />
                <button
                    onClick={handleAskAi}
                    disabled={isGenerating || !prompt.trim() || !vmReady}
                    style={{ width: '100%', marginTop: '8px', background: isGenerating || !prompt.trim() || !vmReady ? '#1e293b' : '#2563eb', color: isGenerating || !prompt.trim() || !vmReady ? '#475569' : '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                >
                    {isGenerating ? 'Generating…' : 'Send to Co-pilot'}
                </button>
            </div>
        </div>
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
    const [firestoreLoading, setFirestoreLoading] = useState(true); // waiting for DB
    const [vmReady, setVmReady] = useState(false);                  // waiting for StackBlitz
    const [copilotOpen, setCopilotOpen] = useState(false);
    const vmRef = useRef(null);

    // ── Step 1: Load saved project from Firestore
    useEffect(() => {
        if (!userId || !courseId) { setFirestoreLoading(false); return; }
        (async () => {
            try {
                const snap = await getDoc(doc(db, 'userProfiles', userId, 'webProjects', courseId));
                if (snap.exists() && snap.data().files) {
                    setTemplate(snap.data().template || 'create-react-app');
                    setInitialFiles(snap.data().files);
                }
            } catch (err) {
                console.error('Failed to load web project', err);
            } finally {
                setFirestoreLoading(false);
            }
        })();
    }, [userId, courseId]);

    // ── Step 2: Mount StackBlitz after Firestore data is ready
    useEffect(() => {
        if (firestoreLoading) return;
        setVmReady(false);

        const container = document.getElementById('stackblitz-container');
        if (!container) return;

        // Clear previous VM if re-mounting on template change
        container.innerHTML = '';
        vmRef.current = null;

        const project = {
            title: 'AI Sandbox',
            description: 'Interactive Web Dev Kit',
            template,
            files: initialFiles || DEFAULT_FILES[template] || DEFAULT_FILES['javascript']
        };

        const timer = setTimeout(async () => {
            try {
                const vm = await sdk.embedProject('stackblitz-container', project, {
                    // Always show both code editor AND preview
                    view: 'both',
                    // Keep terminal visible at a generous height
                    terminalHeight: 45,
                    // Open relevant entry file
                    openFile: template === 'create-react-app'
                        ? 'src/App.js'
                        : template === 'node'
                        ? 'index.js'
                        : 'index.html',
                    showSidebar: true,
                    hideNavigation: false,
                    height: '100%',
                    // Do NOT collapse the terminal by default
                    startScript: template === 'node' ? 'dev' : undefined
                });
                vmRef.current = vm;
                setVmReady(true);
            } catch (err) {
                console.error('StackBlitz embed failed:', err);
                setVmReady(true); // Unblock the UI even if it fails
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [template, initialFiles, firestoreLoading]);

    const handleTemplateChange = (newTemplate, forceReset = false) => {
        if (forceReset || window.confirm('Changing templates will reset all current files. Continue?')) {
            setTemplate(newTemplate);
            setInitialFiles(null);
        }
    };

    const loaderMessage = firestoreLoading
        ? 'Loading your saved project…'
        : 'Starting WebContainers…';

    return (
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b', background: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>
            <SandboxToolbar
                userId={userId} courseId={courseId}
                template={template} onTemplateChange={handleTemplateChange}
                setCopilotOpen={setCopilotOpen} vmRef={vmRef} vmReady={vmReady}
            />
            <div style={{ display: 'flex', height: '680px', width: '100%', position: 'relative' }}>
                {/* Loading Overlay — shown until VM is ready */}
                {(!vmReady || firestoreLoading) && <SandboxLoader message={loaderMessage} />}

                {/* StackBlitz iframe mount target */}
                <div id="stackblitz-container" style={{ flex: 1, height: '100%', background: '#1e1e2e' }} />

                {/* AI Copilot slide-over */}
                <AICopilotPanel
                    isOpen={copilotOpen}
                    onClose={() => setCopilotOpen(false)}
                    vmRef={vmRef} template={template} vmReady={vmReady}
                />
            </div>
        </div>
    );
}
