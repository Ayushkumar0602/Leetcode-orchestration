import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GitEngine } from '../git/GitEngine';
import CommitTree from '../git/CommitTree';
import GitTerminal from '../git/GitTerminal';
import StagingArea from '../git/StagingArea';
import FileEditor from '../git/FileEditor';
import DiffViewer from '../git/DiffViewer';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import ToolsNavbar from '../components/ToolsNavbar';
import { GitBranch, Zap, Layers, Share2, History, Save, RotateCcw, BookOpen, X, ChevronDown, Loader2, Terminal } from 'lucide-react';

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
export default function ToolsGitPlayground() {
    const { currentUser } = useAuth();
    const userId = currentUser?.uid;
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
        if (!userId) { setLoading(false); return; }
        (async () => {
            try {
                const ref = doc(db, 'userProfiles', userId, 'standaloneTools', 'gitPlayground');
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    engine.fromJSON(snap.data().state);
                }
            } catch (_) {}
            setLoading(false);
            refresh();
        })();
    }, [userId]);

    // ── Save to Firestore
    const handleSave = async () => {
        if (!userId) {
            alert('Please sign in to save your repository state.');
            return;
        }
        setIsSaving(true);
        try {
            const ref = doc(db, 'userProfiles', userId, 'standaloneTools', 'gitPlayground');
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
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff' }}>
            <Helmet>
                <title>Free Online Git Simulator & Visual Playground | Master Git Logic | Whizan AI</title>
                <meta name="description" content="Master Git branching, merging, and commit graphs visually. Whizan AI's 100% Free interactive Git playground helps you learn version control through real-time visualization and AI guidance." />
                <meta name="keywords" content="online git simulator, visual git playground, learn git interactive, practice git commands online, git branching tutorial, version control sandbox, whizan ai, git graph visualizer, free dev tools" />
                <meta property="og:title" content="Whizan AI | Premium Visual Git Playground & Simulator" />
                <meta property="og:description" content="Stop memorizing Git commands. Start visualizing them. Experience the ultimate browser-based Git simulation for professional developers." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://whizan.xyz/tools/git-playground" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Interactive Visual Git Playground - 100% Free" />
                <meta name="twitter:description" content="Learn Git like a pro with real-time graph visualization. Branches, merges, and rebases made simple with Whizan AI." />
                <link rel="canonical" href="https://whizan.xyz/tools/git-playground" />
                <script type="application/ld+json">
                    {JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "WebApplication",
                      "name": "Whizan AI Git Playground",
                      "url": "https://whizan.xyz/tools/git-playground",
                      "description": "Visual Git simulator for learning version control through interactive branching and merging scenarios.",
                      "applicationCategory": "DeveloperTool",
                      "operatingSystem": "All",
                      "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD"
                      }
                    })}
                </script>
            </Helmet>

            <ToolsNavbar />

            <div style={{ padding: '100px 20px 40px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ padding: '0 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(236,72,153,0.1)', color: '#f472b6', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(236,72,153,0.2)' }}>
                            VERSION CONTROL
                        </span>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.2)' }}>
                            100% FREE
                        </span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
                        Visual Git Playground
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '800px', lineHeight: '1.6' }}>
                        Visualize your Git workflow in real-time. Learn complex concepts like rebase, cherry-pick, 
                        and merge conflict resolution with a beautiful, interactive graph.
                    </p>
                </div>
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

                {/* --- Extensive SEO / AIO Content Section (200+ Lines) --- */}
                <div style={{ 
                    marginTop: '60px', 
                    padding: '60px 40px', 
                    background: 'rgba(15, 23, 42, 0.3)', 
                    borderRadius: '32px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    lineHeight: '1.8',
                    color: '#94a3b8'
                }}>
                    {/* Section 1: The Importance of Visualizing Git */}
                    <section>
                        <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.5px' }}>
                            Master Version Control with our Interactive Online Git Playground
                        </h2>
                        <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
                            Git is the industry-standard version control system, essential for every software engineering 
                            role. However, its command-line interface and abstract concepts like the **commit graph**, 
                            **detached HEAD**, and **interactive rebase** can be incredibly daunting for beginners and 
                            even experienced developers. Whizan AI's **Online Git Simulator** is designed to bridge 
                            this gap by providing a real-time, visual representation of your repository's state.
                        </p>
                        <p style={{ marginBottom: '20px' }}>
                            Our playground is more than just a terminal. It's a high-fidelity simulator that reacts 
                            instantly to every command you type. Whether you are practicing for a **Git interview**, 
                            experimenting with a complex merge strategy, or teaching a team the basics of branching, 
                            our tool offers a 100% free, browser-based environment with zero setup required.
                        </p>
                    </section>

                    {/* Section 2: Core Simulation Features */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px', margin: '40px 0' }}>
                        <section>
                            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <GitBranch size={24} color="#6366f1" /> Live Branching & Merging
                            </h3>
                            <p style={{ marginBottom: '15px' }}>
                                Understand the "magic" of Git branches. Watch as the graph updates dynamically when 
                                you run <code>git branch</code> or <code>git checkout</code>. Our playground 
                                perfectly simulates fast-forward merges vs. 3-way merges, giving you a clear visual 
                                understanding of how your project history is structured and how to resolve conflicts 
                                like a pro.
                            </p>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '8px' }}>🔗 Recursive graph visualization</li>
                                <li style={{ marginBottom: '8px' }}>🔗 Conflict resolution training</li>
                                <li style={{ marginBottom: '8px' }}>🔗 Real-time HEAD pointer tracking</li>
                            </ul>
                        </section>

                        <section>
                            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Terminal size={24} color="#ec4899" /> Professional Terminal Experience
                            </h3>
                            <p style={{ marginBottom: '15px' }}>
                                Practice real-world commands in a safe, sandboxed environment. Our terminal supports 
                                a wide range of Git porcelain and plumbing commands. If you stay on the command line 
                                long enough, you will eventually encounter a mess—our simulator helps you learn how 
                                to clean it up using <code>reset</code>, <code>revert</code>, and <code>stash</code> 
                                without any risk to actual production code.
                            </p>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '8px' }}>💻 Support for common git aliases</li>
                                <li style={{ marginBottom: '8px' }}>💻 Integrated help for every command</li>
                                <li style={{ marginBottom: '8px' }}>💻 Persistent repo state across visits</li>
                            </ul>
                        </section>
                    </div>

                    {/* Section 3: Mastery Path */}
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '40px 0' }} />

                    <section>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>
                            Why Practice Git Online with Whizan AI?
                        </h3>
                        <p style={{ marginBottom: '20px' }}>
                            Traditional tutorials often leave students confused about the internal state of a 
                            repository. Our **Visual Git Simulator** is built to solve that problem through 
                            active learning and visual feedback. Here are the top benefits:
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <div>
                                <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '10px' }}>1. Zero Risk, Infinite Retries</h4>
                                <p>
                                    Have you ever been afraid to run `git reset --hard`? In our playground, you 
                                    are encouraged to. This is the ultimate "undo" lab where you can try the 
                                    most dangerous commands to understand exactly what they do to your objects 
                                    and references.
                                </p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '10px' }}>2. Interactive Scenario Based Learning</h4>
                                <p>
                                    Don't just run commands—solve problems. We include built-in scenarios like 
                                    "Feature Branching", "Fixing a Bug", and "Resolving Merge Conflicts". 
                                    Our system tracks your goals and provides a structured path to mastering 
                                    production-level Git workflows.
                                </p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '10px' }}>3. Visualize Complex Histories</h4>
                                <p>
                                    Easily understand the difference between **Merge vs. Rebase**. Seeing the 
                                    commits move on the graph is worth a thousand static blog posts. Master 
                                    linear history and clean graph structures used by high-performance engineering 
                                    teams world-wide.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Use Cases Table */}
                    <section style={{ marginTop: '60px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '25px' }}>
                            Who is this Git Simulator For?
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#94a3b8', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ textAlign: 'left', padding: '15px', color: '#fff' }}>User Profile</th>
                                        <th style={{ textAlign: 'left', padding: '15px', color: '#fff' }}>Value Proposition</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}>Job Seekers</td>
                                        <td style={{ padding: '15px' }}>Prepare for technical interviews by mastering Git internals and workflow theory.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}>DevOps Engineers</td>
                                        <td style={{ padding: '15px' }}>Simulate complex CI/CD branching strategies and multi-repo synchronization.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}>Students</td>
                                        <td style={{ padding: '15px' }}>Supplement university computer science courses with a hands-on lab environment.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}>Teachers & Mentors</td>
                                        <td style={{ padding: '15px' }}>Use the live graph to demonstrate version control concepts in real-time during lectures.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Section 5: Common Commands Reference */}
                    <section style={{ marginTop: '60px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>
                            Essential Git Command Quick Reference
                        </h3>
                        <p style={{ marginBottom: '20px' }}>
                            In our playground, you can practice these essential commands and see their visual impact:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            {[
                                { c: 'git commit', d: 'Creates a new snapshot of staged changes.' },
                                { c: 'git checkout', d: 'Switch branches or restore working tree files.' },
                                { c: 'git merge', d: 'Join two or more development histories together.' },
                                { c: 'git rebase', d: 'Reapply commits on top of another base tip.' },
                                { c: 'git log', d: 'Show commit logs visually on our graph.' },
                                { c: 'git status', d: 'Show the working tree and staging area state.' }
                            ].map(item => (
                                <div key={item.c} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <code style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>{item.c}</code>
                                    <p style={{ fontSize: '0.8rem' }}>{item.d}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 6: AI-Assisted Learning */}
                    <section style={{ marginTop: '60px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>
                            AI-Powered Support for Technical Growth
                        </h3>
                        <p style={{ marginBottom: '20px' }}>
                            Whizan AI is proud to offer the first **Git Sandbox** with integrated AI support. If 
                            you're stuck or your graph doesn't look the way you expected, our AI can analyze your 
                            history and suggest the correct command sequence to fix it. This is deep technical 
                            mentorship at its finest—available 24/7 inside your browser.
                        </p>
                    </section>

                    {/* Section 7: FAQ for SEO */}
                    <section style={{ marginTop: '60px', padding: '40px', background: 'rgba(0,0,0,0.2)', borderRadius: '24px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '30px' }}>
                            Frequently Asked Questions
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>Is this a real Git repository?</h4>
                                <p>It's a high-fidelity simulator that implements the core Git logic. It produces a real commit graph and mimics file state perfectly for educational purposes.</p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>Can I practice rebase and cherry-pick?</h4>
                                <p>Yes, we support advanced commands like rebase, cherry-pick, and interactive resets so you can practice production-level workflows.</p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>How do I save my work?</h4>
                                <p>Sign in with your Whizan AI account to save your Git repository state to the cloud. You can resume your practice on any device.</p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>Is there an offline version?</h4>
                                <p>The Git Playground is a web-based app for maximum accessibility, but it uses client-side logic for near-instant response times.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 8: CTA & Tags */}
                    <section style={{ marginTop: '60px', textAlign: 'center' }}>
                        <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, marginBottom: '25px' }}>
                            Ready to Master Git?
                        </h2>
                        <p style={{ marginBottom: '30px', maxWidth: '800px', margin: '0 auto 30px' }}>
                            Stop being afraid of the terminal. Start visualizing your success. Whizan AI's 
                            **Visual Git Playground** is the easiest way to learn version control. 
                            Join thousands of developers leveling up their careers today.
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginBottom: '40px' }}>
                            {[
                                'git-visualizer', 'learn-git', 'online-git-playground', 'git-simulator', 
                                'version-control-training', 'devops-tools', 'practice-git-online', 'git-branching',
                                'whizan-ai-git', 'coding-lab', 'software-engineering-prep', 'free-dev-tools'
                            ].map(tag => (
                                <span key={tag} style={{ fontSize: '0.8rem', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 15px', borderRadius: '30px' }}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        <button 
                            onClick={() => window.location.href = '/dashboard'}
                            style={{ 
                                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', 
                                color: '#fff', 
                                border: 'none', 
                                padding: '15px 40px', 
                                borderRadius: '16px', 
                                fontWeight: 800, 
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                boxShadow: '0 15px 30px -10px rgba(236,72,153,0.5)',
                                transition: 'transform 0.2s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Explore Masterclasses & AI Tools
                        </button>
                    </section>

                    {/* Section 9: Footer Disclaimer */}
                    <footer style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#475569' }}>
                        <p>
                            **Technical Note:** Whizan AI Git Playground is an educational simulation. While it captures 
                            the core logic of Git, it is not a direct port of the Git C-source. It is designed for 
                            speed, accessibility, and visual feedback in a web environment. Whizan AI is a 
                            platform dedicated to empowering the next generation of engineers.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
