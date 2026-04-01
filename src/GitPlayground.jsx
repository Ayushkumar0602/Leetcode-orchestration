// src/GitPlayground.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GitBranch, Save, RotateCcw, BookOpen, X, ChevronDown, Loader2 } from 'lucide-react';
import { GitEngine } from './git/GitEngine';
import CommitTree from './git/CommitTree';
import GitTerminal from './git/GitTerminal';
import StagingArea from './git/StagingArea';
import FileEditor from './git/FileEditor';
import DiffViewer from './git/DiffViewer';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ── Pre-built scenarios ────────────────────────────────────────────────────────
const SCENARIOS = [
    {
        id: 'blank',
        label: 'Blank Repo',
        icon: '🌱',
        description: 'Fresh repository. Start from scratch.',
        goals: [],
        setup: null,
    },
    {
        id: 'branch_merge',
        label: 'Branch & Merge',
        icon: '🌿',
        description: 'Create a feature branch, commit work, merge back to main.',
        goals: [
            'git checkout -b feature/login',
            'Edit a file and git add .',
            'git commit -m "add login"',
            'git checkout main',
            'git merge feature/login',
        ],
        setup: (engine) => {
            engine.reset();
            engine.workingTree['index.html'] = '<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>';
            engine.stagingArea = { ...engine.workingTree };
            engine.cmd_commit(['-m', 'initial setup']);
        },
    },
    {
        id: 'hotfix',
        label: 'Hotfix Workflow',
        icon: '🔥',
        description: 'A bug is in production! Branch off main, fix it, merge back fast.',
        goals: [
            'git checkout -b hotfix/typo',
            'Fix the typo in README.md',
            'git add README.md && git commit -m "fix: typo"',
            'git checkout main && git merge hotfix/typo',
        ],
        setup: (engine) => {
            engine.reset();
            engine.workingTree['README.md'] = '# My App\n\nWellcome to my app. This is a bug.\n';
            engine.stagingArea = { ...engine.workingTree };
            engine.cmd_commit(['-m', 'add readme with typo']);
        },
    },
    {
        id: 'conflict',
        label: 'Resolve Conflict',
        icon: '⚡',
        description: 'Two branches edited the same line. Resolve the merge conflict.',
        goals: [
            'git merge feature/colors',
            'Edit index.html to resolve the <<< conflict markers',
            'git add index.html',
            'git commit -m "resolve conflict"',
        ],
        setup: (engine) => {
            engine.reset();
            engine.workingTree['index.html'] = '<body>\n  <h1 style="color: blue">Hello</h1>\n</body>';
            engine.stagingArea = { ...engine.workingTree };
            engine.cmd_commit(['-m', 'initial']);

            // Create feature/colors branch with conflicting change
            engine.branches['feature/colors'] = engine.currentCommitHash();
            const baseHash = engine.currentCommitHash();
            const baseCommit = engine.commits[baseHash];
            const featureTree = { 'index.html': '<body>\n  <h1 style="color: red">Hello</h1>\n</body>' };
            const fh = 'feat' + Math.random().toString(36).slice(2, 6);
            engine.commits[fh] = { hash: fh, message: 'use red color', parent: baseHash, parents: [baseHash], tree: featureTree, author: 'Student', timestamp: Date.now() - 300, branch: 'feature/colors' };
            engine.branches['feature/colors'] = fh;

            // Main branch has its own conflicting change
            engine.workingTree['index.html'] = '<body>\n  <h1 style="color: green">Hello</h1>\n</body>';
            engine.stagingArea = { ...engine.workingTree };
            engine.cmd_commit(['-m', 'use green color on main']);
        },
    },
    {
        id: 'undo',
        label: 'Undo a Commit',
        icon: '↩️',
        description: 'Oops — you committed something wrong. Practice revert vs reset.',
        goals: [
            'Inspect git log',
            'Try: git revert HEAD to safely undo',
            'OR: git reset --hard HEAD~1 to erase',
        ],
        setup: (engine) => {
            engine.reset();
            engine.workingTree['app.js'] = 'console.log("v1")';
            engine.stagingArea = { ...engine.workingTree };
            engine.cmd_commit(['-m', 'v1 release']);
            engine.workingTree['app.js'] = 'console.log("v2 - BROKEN !")';
            engine.stagingArea = { ...engine.workingTree };
            engine.cmd_commit(['-m', 'v2 broken release']);
        },
    },
    {
        id: 'rebase',
        label: 'Rebase Workflow',
        icon: '🔁',
        description: 'Replay your feature commits on top of an updated main branch.',
        goals: [
            'git checkout feature/ui',
            'git rebase main',
            'git checkout main && git merge feature/ui (fast-forward)',
        ],
        setup: (engine) => {
            engine.reset();
            const base = engine.currentCommitHash();
            // feature/ui branch with a commit
            engine.branches['feature/ui'] = base;
            engine.workingTree['style.css'] = 'body { color: purple; }';
            engine.stagingArea = { ...engine.workingTree };
            const oldHead = engine.HEAD;
            engine.HEAD = 'feature/ui';
            engine.cmd_commit(['-m', 'feat: purple theme']);
            engine.HEAD = oldHead;
            engine.branches['main'] = base;
            // main has moved forward
            engine.workingTree = { ...engine.commits[base].tree, 'README.md': '# Updated README' };
            engine.stagingArea = { ...engine.workingTree };
            engine.cmd_commit(['-m', 'docs: update readme']);
        },
    },
];

// ── Main Component ──────────────────────────────────────────────────────────
export default function GitPlayground({ userId, courseId }) {
    const engineRef = useRef(() => new GitEngine());
    // Keep a real engine instance (not in state to avoid serialization issues)
    const [engine] = useState(() => new GitEngine());
    const [, forceUpdate] = useState(0);
    const refresh = useCallback(() => forceUpdate(n => n + 1), []);

    const [selectedHash, setSelectedHash] = useState(null);
    const [diffInfo, setDiffInfo] = useState(null); // { file, mode }
    const [scenario, setScenario] = useState(SCENARIOS[0]);
    const [showScenarios, setShowScenarios] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveMsg, setSaveMsg] = useState('');

    // ── Firestore load on mount
    useEffect(() => {
        if (!userId || !courseId) { setLoading(false); return; }
        (async () => {
            try {
                const ref = doc(db, 'userProfiles', userId, 'gitProjects', courseId);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    engine.fromJSON(snap.data().state);
                }
            } catch (_) {}
            setLoading(false);
            refresh();
        })();
    }, [userId, courseId]);

    // ── Save to Firestore
    const handleSave = async () => {
        if (!userId || !courseId) return;
        setIsSaving(true);
        try {
            const ref = doc(db, 'userProfiles', userId, 'gitProjects', courseId);
            await setDoc(ref, { state: engine.toJSON(), savedAt: new Date().toISOString() });
            setSaveMsg('Saved ✓');
            setTimeout(() => setSaveMsg(''), 3000);
        } catch (_) {
            setSaveMsg('Error saving');
        }
        setIsSaving(false);
    };

    // ── Scenario load
    const loadScenario = (sc) => {
        engine.reset();
        if (sc.setup) sc.setup(engine);
        setScenario(sc);
        setShowScenarios(false);
        setDiffInfo(null);
        setSelectedHash(null);
        refresh();
    };

    // ── File operations
    const onSaveFile = (path, content) => {
        engine.workingTree[path] = content;
        refresh();
    };
    const onCreateFile = (path) => {
        engine.workingTree[path] = '';
        refresh();
    };
    const onDeleteFile = (path) => {
        delete engine.workingTree[path];
        delete engine.stagingArea[path];
        refresh();
    };

    // ── Staging operations
    const onAdd = (pathOrDot) => {
        engine.run(`git add ${pathOrDot}`);
        refresh();
    };
    const onUnstage = (path) => {
        engine.run(`git restore --staged ${path}`);
        refresh();
    };
    const onShowDiff = (file, mode) => {
        setDiffInfo({ file, mode });
    };

    // ── Terminal command
    const onCommand = () => refresh();

    // ── Graph data (recomputed on every refresh)
    const graphData = engine.getGraphData();
    const status = engine.status();

    // ── Diff data for viewer
    const diffData = (() => {
        if (!diffInfo) return null;
        const { file, mode } = diffInfo;
        const base = engine.currentTree()[file] || '';
        const working = mode === 'staged' ? (engine.stagingArea[file] || '') : (engine.workingTree[file] || '');
        return { old: base, new: working, file };
    })();

    // ── Selected commit detail
    const selectedCommit = selectedHash ? engine.commits[selectedHash] : null;

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 600, background: '#0a0f1e', borderRadius: 12 }}>
                <Loader2 size={28} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} />
                <span style={{ color: '#64748b', marginLeft: 12 }}>Loading your git repo…</span>
            </div>
        );
    }

    return (
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #1e293b', background: '#0a0a0f', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
            {/* ── Toolbar ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: '#0f172a', borderBottom: '1px solid #1e293b', flexWrap: 'wrap' }}>
                <GitBranch size={16} style={{ color: '#6366f1' }} />
                <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.9rem', marginRight: 4 }}>Git Playground</span>

                {/* Branch indicator */}
                <div style={{ background: '#1e293b', borderRadius: 6, padding: '3px 10px', fontSize: '0.78rem', color: '#4ade80', fontFamily: 'monospace' }}>
                    {status.branch}
                </div>

                {/* Scenario picker */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowScenarios(v => !v)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}
                    >
                        <BookOpen size={12} /> {scenario.icon} {scenario.label} <ChevronDown size={11} />
                    </button>
                    {showScenarios && (
                        <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 100, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, minWidth: 240, boxShadow: '0 8px 32px #00000080' }}>
                            {SCENARIOS.map(sc => (
                                <div
                                    key={sc.id}
                                    onClick={() => loadScenario(sc)}
                                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #0f172a' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#334155'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>{sc.icon} {sc.label}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: 2 }}>{sc.description}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ flex: 1 }} />

                {/* Save */}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: saveMsg === 'Saved ✓' ? '#059669' : '#6366f1', border: 'none', color: '#fff', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                >
                    <Save size={12} /> {isSaving ? 'Saving…' : saveMsg || 'Save'}
                </button>

                {/* Reset */}
                <button
                    onClick={() => { if (window.confirm('Reset to fresh repo?')) { engine.reset(); setDiffInfo(null); setSelectedHash(null); refresh(); } }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem' }}
                >
                    <RotateCcw size={12} /> Reset
                </button>
            </div>

            {/* ── Goals banner ── */}
            {scenario.goals && scenario.goals.length > 0 && (
                <div style={{ padding: '8px 16px', background: '#0d1f3c', borderBottom: '1px solid #1e3a5f', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: '#60a5fa', fontSize: '0.72rem', fontWeight: 700 }}>GOALS:</span>
                    {scenario.goals.map((g, i) => (
                        <span key={i} style={{ color: '#94a3b8', fontSize: '0.72rem', fontFamily: 'monospace', background: '#1e3a5f', padding: '2px 8px', borderRadius: 4 }}>
                            {i + 1}. {g}
                        </span>
                    ))}
                </div>
            )}

            {/* ── Main split layout ── */}
            <div style={{ display: 'flex', height: 640, overflow: 'hidden' }}>

                {/* Left: File Editor */}
                <div style={{ width: '28%', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
                    <FileEditor
                        workingTree={engine.workingTree}
                        onSaveFile={onSaveFile}
                        onCreateFile={onCreateFile}
                        onDeleteFile={onDeleteFile}
                    />
                </div>

                {/* Center: Commit Tree + Commit detail */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e293b' }}>
                    {/* Commit tree */}
                    <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ padding: '5px 10px', background: '#0f172a', borderBottom: '1px solid #1e293b', fontSize: '0.7rem', color: '#475569', fontWeight: 700 }}>
                            COMMIT GRAPH
                        </div>
                        <div style={{ height: 'calc(100% - 28px)', overflow: 'auto' }}>
                            <CommitTree graphData={graphData} onSelectCommit={setSelectedHash} selectedHash={selectedHash} />
                        </div>
                    </div>

                    {/* Commit detail panel */}
                    {selectedCommit && (
                        <div style={{ borderTop: '1px solid #1e293b', background: '#0f172a', padding: '10px 14px', fontSize: '0.78rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{selectedCommit.message}</span>
                                <button onClick={() => setSelectedHash(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><X size={14} /></button>
                            </div>
                            <div style={{ color: '#64748b', marginTop: 4, fontFamily: 'monospace', fontSize: '0.72rem' }}>
                                {selectedHash} · {new Date(selectedCommit.timestamp).toLocaleString()} · {selectedCommit.author}
                            </div>
                            <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {Object.keys(selectedCommit.tree).map(f => (
                                    <span key={f} style={{ color: '#94a3b8', background: '#1e293b', padding: '1px 6px', borderRadius: 3, fontSize: '0.7rem' }}>{f}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Staging + Terminal (stacked), or DiffViewer */}
                <div style={{ width: '32%', display: 'flex', flexDirection: 'column' }}>
                    {diffInfo && diffData ? (
                        <DiffViewer
                            oldContent={diffData.old}
                            newContent={diffData.new}
                            filename={diffData.file}
                            onClose={() => setDiffInfo(null)}
                        />
                    ) : (
                        <>
                            {/* Staging area (top half) */}
                            <div style={{ height: '40%', borderBottom: '1px solid #1e293b', overflow: 'hidden' }}>
                                <StagingArea
                                    status={status}
                                    onAdd={onAdd}
                                    onUnstage={onUnstage}
                                    onShowDiff={onShowDiff}
                                />
                            </div>

                            {/* Terminal (bottom half) */}
                            <div style={{ height: '60%', overflow: 'hidden' }}>
                                <GitTerminal engine={engine} onCommand={onCommand} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
