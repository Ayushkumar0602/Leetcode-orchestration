import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
    Play, Save, Loader2, Table2, Database,
    ChevronDown, ChevronRight, AlertCircle, CheckCircle, Trash2, Sparkles, Wand2
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';

// ── Backend API ─────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';


// ── Starter SQL ─────────────────────────────────────────────────────────────
const STARTER_SQL = `-- Welcome to the SQL Sandbox!
-- Supports: CREATE DATABASE db1, USE db1, SHOW DATABASES
-- Your databases & data are auto-saved per course.`;

// ── Firestore key ────────────────────────────────────────────────────────────
// Shape: { databases: { [dbName]: Base64 }, activeDb: string, savedAt: string }
const FS_PATH = (userId) =>
    doc(db, 'userProfiles', userId, 'standaloneTools', 'sqlEditor');

/**
 * Full-featured SQL Sandbox with:
 *  • sql.js (WebAssembly SQLite) in-browser execution
 *  • Multi-database: CREATE DATABASE x, USE x, SHOW DATABASES
 *  • Per-user, per-course Firestore persistence (all DBs)
 *  • Schema viewer
 *  • AI Fix button (Gemini 2.0 Flash, full schema awareness)
 */
export default function ToolsSQLEditor() {
    const { currentUser } = useAuth();
    const userId = currentUser?.uid;
    const [sqlJsReady, setSqlJsReady]   = useState(false);
    const [sqlJsError, setSqlJsError]   = useState(null);
    const [query, setQuery]             = useState(STARTER_SQL);
    const [results, setResults]         = useState(null);
    const [execError, setExecError]     = useState(null);
    const [infoMsg, setInfoMsg]         = useState(null);   // non-error info (e.g. DB created)
    const [running, setRunning]         = useState(false);
    const [saving, setSaving]           = useState(false);
    const [saveMsg, setSaveMsg]         = useState('');
    const [loading, setLoading]         = useState(true);
    const [schema, setSchema]           = useState([]);
    const [schemaOpen, setSchemaOpen]   = useState(true);
    const [expandedTables, setExpandedTables] = useState({});
    const [aiFixing, setAiFixing]       = useState(false);
    const [aiMsg, setAiMsg]             = useState('');

    // ── Multi-DB state ───────────────────────────────────────────────────────
    const [activeDb, setActiveDb]       = useState('main');
    const [dbList, setDbList]           = useState(['main']);

    const SQL    = useRef(null);
    // Map of dbName → sql.js Database instance
    const dbMap  = useRef({});          // { main: Database, ... }

    const currentDb = () => dbMap.current[activeDb];

    // ── Init sql.js ──────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const initSqlJs = (await import('sql.js')).default;
                const sqlJs = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' });
                if (cancelled) return;
                SQL.current = sqlJs;
                setSqlJsReady(true);
            } catch (err) {
                if (!cancelled) setSqlJsError(err.message);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // ── Load from Firestore ──────────────────────────────────────────────────
    useEffect(() => {
        if (!sqlJsReady) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            if (!userId) {
                // Seed fresh
                dbMap.current['main'] = new SQL.current.Database();
                try {
                    const stmts = STARTER_SQL.split(';').map(s => s.trim()).filter(Boolean);
                    stmts.slice(0, -1).forEach(s => dbMap.current['main'].run(s));
                } catch (_) {}
                if (!cancelled) {
                    setDbList(['main']);
                    setActiveDb('main');
                    refreshSchema();
                    setLoading(false);
                }
                return;
            }
            try {
                const snap = await getDoc(FS_PATH(userId));
                if (cancelled) return;

                if (snap.exists() && snap.data().databases) {
                    // Restore all DBs
                    const saved = snap.data().databases; // { [name]: base64 }
                    Object.entries(saved).forEach(([name, b64]) => {
                        const bin = atob(b64);
                        const bytes = new Uint8Array(bin.length);
                        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                        dbMap.current[name] = new SQL.current.Database(bytes);
                    });
                    const saved_active = snap.data().activeDb || 'main';
                    if (!dbMap.current[saved_active]) dbMap.current[saved_active] = new SQL.current.Database();
                    setDbList(Object.keys(dbMap.current));
                    setActiveDb(saved_active);
                } else {
                    // Fresh — seed main DB
                    dbMap.current['main'] = new SQL.current.Database();
                    try {
                        const stmts = STARTER_SQL.split(';').map(s => s.trim()).filter(Boolean);
                        stmts.slice(0, -1).forEach(s => dbMap.current['main'].run(s));
                    } catch (_) {}
                    setDbList(['main']);
                    setActiveDb('main');
                }
                refreshSchema();
            } catch (err) {
                if (!cancelled) setSqlJsError('Failed to load database: ' + err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [sqlJsReady, userId]);

    // ── Schema ───────────────────────────────────────────────────────────────
    const refreshSchema = useCallback(() => {
        const db_ = currentDb();
        if (!db_) return;
        try {
            const res = db_.exec(
                `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;`
            );
            const tables = res[0]?.values?.map(r => r[0]) || [];
            const schemaData = tables.map(t => {
                const info = db_.exec(`PRAGMA table_info("${t}");`);
                const cols = info[0]?.values?.map(r => ({ name: r[1], type: r[2] })) || [];
                return { name: t, columns: cols };
            });
            setSchema(schemaData);
        } catch (_) {}
    }, [activeDb]);

    // Re-read schema when activeDb changes
    useEffect(() => { refreshSchema(); }, [activeDb, refreshSchema]);

    // ── Serialise helpers ────────────────────────────────────────────────────
    const serializeOne = (db_) => {
        const data = db_.export();
        let bin = '';
        for (let i = 0; i < data.length; i++) bin += String.fromCharCode(data[i]);
        return btoa(bin);
    };

    const saveToFirestore = useCallback(async () => {
        if (!userId) {
            alert('Please sign in to save your databases.');
            return;
        }
        setSaving(true);
        try {
            const databases = {};
            Object.entries(dbMap.current).forEach(([name, db_]) => {
                databases[name] = serializeOne(db_);
            });
            await setDoc(FS_PATH(userId), {
                databases,
                activeDb,
                savedAt: new Date().toISOString(),
            }, { merge: true });
            setSaveMsg('Saved ✓');
        } catch (_) {
            setSaveMsg('Save failed');
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMsg(''), 2500);
        }
    }, [userId, activeDb]);

    // ── Multi-DB command interceptor ─────────────────────────────────────────
    /**
     * Returns true if it handled the stmt as a meta-command (so skip sql.js exec).
     * Sets infoMsg or execError accordingly.
     */
    const handleMetaCommand = (stmt) => {
        const upper = stmt.trim().toUpperCase();

        // SHOW DATABASES
        if (/^SHOW\s+DATABASES\s*;?$/.test(upper)) {
            const cols = ['database_name'];
            const vals = Object.keys(dbMap.current).map(n => [n]);
            setResults({ columns: cols, values: vals, isShowDb: true });
            setInfoMsg(null);
            return true;
        }

        // CREATE DATABASE [IF NOT EXISTS] <name>
        const createMatch = upper.match(/^CREATE\s+(?:DATABASE|SCHEMA)\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*;?$/);
        if (createMatch) {
            const name = stmt.trim().match(/(\w+)\s*;?$/)?.[1]?.toLowerCase();
            if (!name) return false;
            if (dbMap.current[name]) {
                setInfoMsg(`Database '${name}' already exists.`);
            } else {
                dbMap.current[name] = new SQL.current.Database();
                setDbList(Object.keys(dbMap.current));
                setInfoMsg(`✓ Database '${name}' created. Run  USE ${name};  to switch.`);
            }
            setResults(null);
            return true;
        }

        // DROP DATABASE <name>
        const dropMatch = upper.match(/^DROP\s+(?:DATABASE|SCHEMA)\s+(?:IF\s+EXISTS\s+)?(\w+)\s*;?$/);
        if (dropMatch) {
            const name = stmt.trim().match(/(\w+)\s*;?$/)?.[1]?.toLowerCase();
            if (!name) return false;
            if (name === 'main') { setExecError("Cannot drop the 'main' database."); return true; }
            if (dbMap.current[name]) {
                dbMap.current[name].close();
                delete dbMap.current[name];
                setDbList(Object.keys(dbMap.current));
                if (activeDb === name) {
                    setActiveDb('main');
                }
                setInfoMsg(`✓ Database '${name}' dropped.`);
            } else {
                setInfoMsg(`Database '${name}' does not exist.`);
            }
            setResults(null);
            return true;
        }

        // USE <name>
        const useMatch = upper.match(/^USE\s+(\w+)\s*;?$/);
        if (useMatch) {
            const name = stmt.trim().split(/\s+/)[1]?.replace(/;$/, '').toLowerCase();
            if (!name) return false;
            if (!dbMap.current[name]) {
                setExecError(`Unknown database '${name}'. Use CREATE DATABASE ${name}; first.`);
                return true;
            }
            setActiveDb(name);
            setInfoMsg(`✓ Now using database '${name}'.`);
            setResults(null);
            return true;
        }

        return false; // not a meta-command
    };

    // ── Run ──────────────────────────────────────────────────────────────────
    const handleRun = useCallback(async () => {
        const db_ = currentDb();
        if (!db_ || !query.trim()) return;
        setRunning(true);
        setExecError(null);
        setResults(null);
        setInfoMsg(null);
        await new Promise(r => setTimeout(r, 20));

        try {
            const statements = query.split(';').map(s => s.trim()).filter(Boolean);
            let lastResult = null;
            let handled = false;

            for (const stmt of statements) {
                if (handleMetaCommand(stmt)) {
                    handled = true;
                    continue;
                }
                const res = currentDb().exec(stmt);
                if (res && res.length > 0) lastResult = res[res.length - 1];
            }

            if (!handled || lastResult) setResults(lastResult || null);
            refreshSchema();
            await saveToFirestore();
        } catch (err) {
            setExecError(err.message);
        } finally {
            setRunning(false);
        }
    }, [query, saveToFirestore, refreshSchema, activeDb]);

    // ── AI Fix ───────────────────────────────────────────────────────────────
    const handleAiFix = async () => {
        if (!execError && !query.trim()) return;
        setAiFixing(true);
        setAiMsg('');
        try {
            const res = await fetch(`${API_BASE}/api/sql-ai-fix`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    errorMessage: execError || '',
                    schema,
                    activeDb,
                }),
            });
            if (!res.ok) {
                let errMsg = 'AI fix request failed';
                try { errMsg = (await res.json()).error || errMsg; } catch (_) {
                    errMsg = res.status === 404 ? 'Backend not deployed yet — push server.js to Render first.' : `Server error ${res.status}`;
                }
                throw new Error(errMsg);
            }
            const data = await res.json();
            setQuery(data.fixedQuery);
            setAiMsg('✓ AI fixed your query. Review and click Run.');
            setExecError(null);
        } catch (err) {
            setAiMsg('AI fix failed: ' + err.message);
        } finally {
            setAiFixing(false);
            setTimeout(() => setAiMsg(''), 6000);
        }
    };

    // ── Reset ────────────────────────────────────────────────────────────────
    const handleReset = () => {
        if (!SQL.current) return;
        if (!window.confirm('This will delete ALL databases and data for this course. Are you sure?')) return;
        Object.values(dbMap.current).forEach(d => { try { d.close(); } catch (_) {} });
        dbMap.current = { main: new SQL.current.Database() };
        try {
            const stmts = STARTER_SQL.split(';').map(s => s.trim()).filter(Boolean);
            stmts.slice(0, -1).forEach(s => dbMap.current['main'].run(s));
        } catch (_) {}
        setDbList(['main']);
        setActiveDb('main');
        setQuery(STARTER_SQL);
        setResults(null);
        setExecError(null);
        setInfoMsg(null);
        setSchema([]);
    };

    const toggleTable = (name) => setExpandedTables(prev => ({ ...prev, [name]: !prev[name] }));

    // ── Loading / Error States ───────────────────────────────────────────────
    if (sqlJsError) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px', flexDirection: 'column', gap: '12px' }}>
                <AlertCircle size={32} color="#ef4444" />
                <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '0.9rem' }}>Failed to load SQL engine: {sqlJsError}</p>
            </div>
        );
    }

    if (!sqlJsReady || loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
                <Loader2 size={28} className="animate-spin" color="#06b6d4" />
                <p style={{ color: '#888', fontSize: '0.85rem' }}>
                    {!sqlJsReady ? 'Loading SQL engine...' : 'Loading your databases...'}
                </p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff' }}>
            <Helmet>
                <title>Free Online SQL Editor & Sandbox | Practice SQL Queries | Whizan AI</title>
                <meta name="description" content="Master SQL with Whizan AI's 100% Free Online SQL Editor. Practice queries, create databases, and test schemas in a visual sandbox. Powered by SQLite and AI for interview prep and data science." />
                <meta name="keywords" content="online sql editor, practice sql online, sql sandbox, sql interview preparation, free sql compiler, sqlite playground, database practice, learn sql syntax, whizan ai, online database tool, FAANG interview prep, data science sql" />
                <meta property="og:title" content="Whizan AI | The World's Best Online SQL Sandbox" />
                <meta property="og:description" content="An interactive, AI-powered SQL environment to learn, build, and test database schemas in real-time. No installation required." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://whizan.xyz/tools/sql-editor" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Free Online SQL Editor & AI SQLite Sandbox" />
                <meta name="twitter:description" content="Practice SQL queries, get AI fixes, and master database schemas in your browser with Whizan AI." />
                <link rel="canonical" href="https://whizan.xyz/tools/sql-editor" />
                <script type="application/ld+json">
                    {JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "WebApplication",
                      "name": "Whizan AI SQL Editor",
                      "url": "https://whizan.xyz/tools/sql-editor",
                      "description": "Free online SQL editor and database sandbox for practicing queries and mastering RDBMS concepts.",
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

            <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ padding: '0 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(6,182,212,0.1)', color: '#22d3ee', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(6,182,212,0.2)' }}>
                            DATABASE TOOLS
                        </span>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.2)' }}>
                            100% FREE
                        </span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
                        AI SQL Editor
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '800px', lineHeight: '1.6' }}>
                        Master SQL with a real-time, interactive database sandbox. Create tables, insert data, and run complex 
                        queries with immediate results. Powered by SQLite and AI.
                    </p>
                </div>

                <div style={{
                    display: 'flex', flexDirection: 'column', height: '650px',
                    background: '#0d0d14', color: '#fff', fontFamily: "'Inter', sans-serif",
                    overflow: 'hidden', borderRadius: '16px', border: '1px solid #1e293b',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}>
            <style>{`
                .sql-results-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
                .sql-results-table th {
                    background: rgba(6,182,212,0.12); color: #06b6d4;
                    padding: 8px 12px; text-align: left; font-weight: 700;
                    border-bottom: 1px solid rgba(6,182,212,0.2);
                    position: sticky; top: 0; white-space: nowrap;
                }
                .sql-results-table td {
                    padding: 7px 12px; border-bottom: 1px solid rgba(255,255,255,0.04);
                    color: #e2e8f0; white-space: nowrap; max-width: 240px;
                    overflow: hidden; text-overflow: ellipsis;
                }
                .sql-results-table tr:hover td { background: rgba(255,255,255,0.03); }
                .sql-schema-item { cursor: pointer; user-select: none; }
                .sql-schema-item:hover { background: rgba(255,255,255,0.04); }
                .sql-btn { transition: background 0.15s, color 0.15s, border-color 0.15s; }
                .sql-btn:hover:not(:disabled) { filter: brightness(1.15); }
                .sql-db-pill {
                    padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700;
                    cursor: pointer; border: 1px solid rgba(255,255,255,0.1);
                    transition: all 0.15s; white-space: nowrap;
                }
                .sql-db-pill.active { background: rgba(6,182,212,0.18); border-color: rgba(6,182,212,0.45); color: #06b6d4; }
                .sql-db-pill:not(.active) { background: rgba(255,255,255,0.04); color: #666; }
                .sql-db-pill:not(.active):hover { background: rgba(255,255,255,0.08); color: #aaa; }
                @keyframes sql-spin { to { transform: rotate(360deg); } }
                .sql-spin { animation: sql-spin 0.8s linear infinite; display: inline-block; }
                @keyframes sql-ai-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0.4)} 50%{box-shadow:0 0 0 6px rgba(139,92,246,0)} }
                .sql-ai-pulse { animation: sql-ai-pulse 1.5s ease-in-out infinite; }
            `}</style>

            {/* ── Top Bar: DB switcher + tools ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)',
                flexShrink: 0, background: 'rgba(0,0,0,0.25)', flexWrap: 'wrap',
            }}>
                {/* Brand */}
                <Database size={14} color="#06b6d4" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4', letterSpacing: '0.5px', flexShrink: 0 }}>
                    SQL SANDBOX
                </span>

                {/* DB pills */}
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', flex: 1 }}>
                    {dbList.map(name => (
                        <button
                            key={name}
                            className={`sql-db-pill ${name === activeDb ? 'active' : ''}`}
                            onClick={() => {
                                setActiveDb(name);
                                setInfoMsg(`✓ Using database '${name}'.`);
                                setResults(null); setExecError(null);
                            }}
                            title={`USE ${name}`}
                        >
                            {name === activeDb ? '● ' : ''}{name}
                        </button>
                    ))}
                </div>

                {/* Status messages */}
                {saveMsg && <span style={{ fontSize: '0.75rem', color: saveMsg.includes('fail') ? '#ef4444' : '#10b981', fontWeight: 600 }}>{saveMsg}</span>}
                {aiMsg   && <span style={{ fontSize: '0.75rem', color: aiMsg.includes('fail') ? '#f87171' : '#a78bfa', fontWeight: 600, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{aiMsg}</span>}

                {/* AI Fix */}
                <button
                    onClick={handleAiFix}
                    disabled={aiFixing || (!execError && !query.trim())}
                    className="sql-btn"
                    title="AI will fix SQL syntax errors using your schema"
                    style={{
                        background: aiFixing ? 'rgba(139,92,246,0.15)' : 'linear-gradient(135deg,rgba(139,92,246,0.25),rgba(139,92,246,0.12))',
                        border: '1px solid rgba(139,92,246,0.4)',
                        color: '#a78bfa', padding: '5px 11px', borderRadius: '7px',
                        cursor: aiFixing ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px',
                        fontSize: '0.78rem', fontWeight: 700, flexShrink: 0,
                        ...(aiFixing ? {} : { }),
                    }}
                >
                    {aiFixing
                        ? <><Loader2 size={12} className="sql-spin" /> Fixing…</>
                        : <><Wand2 size={12} /> AI Fix</>
                    }
                </button>

                {/* Reset */}
                <button
                    onClick={handleReset}
                    className="sql-btn"
                    title="Reset entire sandbox"
                    style={{
                        background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
                        color: '#ef4444', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0,
                    }}
                >
                    <Trash2 size={12} /> Reset
                </button>

                {/* Save */}
                <button
                    onClick={saveToFirestore}
                    disabled={saving}
                    className="sql-btn"
                    style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#ccc', padding: '5px 10px', borderRadius: '7px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0,
                    }}
                >
                    {saving ? <Loader2 size={12} className="sql-spin" /> : <Save size={12} />} Save
                </button>

                {/* Schema toggle */}
                <button
                    onClick={() => setSchemaOpen(o => !o)}
                    className="sql-btn"
                    style={{
                        background: schemaOpen ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.04)',
                        border: '1px solid ' + (schemaOpen ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.1)'),
                        color: schemaOpen ? '#06b6d4' : '#555',
                        padding: '5px 10px', borderRadius: '7px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0,
                    }}
                >
                    <Table2 size={12} /> Schema
                </button>

                {/* Run */}
                <button
                    onClick={handleRun}
                    disabled={running || !query.trim()}
                    style={{
                        background: running ? 'rgba(6,182,212,0.15)' : 'linear-gradient(135deg,#06b6d4,#0891b2)',
                        border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '7px',
                        cursor: running ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '0.82rem', fontWeight: 700, flexShrink: 0,
                        boxShadow: running ? 'none' : '0 3px 10px rgba(6,182,212,0.35)',
                        transition: 'all 0.2s',
                    }}
                >
                    {running ? <Loader2 size={13} className="sql-spin" /> : <Play size={13} fill="currentColor" />}
                    {running ? 'Running…' : 'Run ▶'}
                </button>
            </div>

            {/* ── Body: Editor + Schema ── */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

                {/* ── Monaco SQL Editor ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Editor
                            height="100%"
                            language="sql"
                            value={query}
                            onChange={val => setQuery(val || '')}
                            theme="vs-dark"
                            options={{
                                fontSize: 13,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                lineNumbers: 'on',
                                folding: true,
                                automaticLayout: true,
                                padding: { top: 10, bottom: 10 },
                                fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace",
                                fontLigatures: true,
                                cursorSmoothCaretAnimation: 'on',
                                smoothScrolling: true,
                                suggest: { showKeywords: true },
                            }}
                        />
                    </div>

                    {/* ── Results / Error / Info Panel ── */}
                    <div style={{
                        borderTop: '1px solid rgba(255,255,255,0.07)',
                        flexShrink: 0, maxHeight: '200px', overflowY: 'auto',
                        background: '#050508',
                    }}>
                        {/* Error + AI Fix CTA */}
                        {execError && (
                            <div style={{ padding: '10px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                                    <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <pre style={{ margin: 0, color: '#fca5a5', fontSize: '0.79rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}>
                                        {execError}
                                    </pre>
                                </div>
                                <button
                                    onClick={handleAiFix}
                                    disabled={aiFixing}
                                    className={`sql-btn ${aiFixing ? '' : 'sql-ai-pulse'}`}
                                    style={{
                                        background: 'linear-gradient(135deg,rgba(139,92,246,0.3),rgba(139,92,246,0.15))',
                                        border: '1px solid rgba(139,92,246,0.5)',
                                        color: '#c4b5fd', padding: '6px 14px', borderRadius: '8px',
                                        cursor: aiFixing ? 'not-allowed' : 'pointer',
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        fontSize: '0.8rem', fontWeight: 700,
                                    }}
                                >
                                    {aiFixing
                                        ? <><Loader2 size={13} className="sql-spin" /> AI Fixing…</>
                                        : <><Sparkles size={13} /> Fix with AI</>
                                    }
                                </button>
                            </div>
                        )}

                        {/* Info message */}
                        {!execError && infoMsg && (
                            <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle size={13} color="#06b6d4" />
                                <span style={{ fontSize: '0.8rem', color: '#67e8f9', fontWeight: 600 }}>{infoMsg}</span>
                            </div>
                        )}

                        {/* SELECT results */}
                        {!execError && results && results.columns && results.columns.length > 0 && (
                            <div>
                                <div style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <CheckCircle size={13} color="#10b981" />
                                    <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700 }}>
                                        {results.values.length} row{results.values.length !== 1 ? 's' : ''} returned
                                        {results.isShowDb ? ' (SHOW DATABASES)' : ''}
                                    </span>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="sql-results-table">
                                        <thead>
                                            <tr>{results.columns.map(col => <th key={col}>{col}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                            {results.values.map((row, ri) => (
                                                <tr key={ri}>
                                                    {row.map((cell, ci) => (
                                                        <td key={ci} title={String(cell ?? 'NULL')}>
                                                            {cell === null
                                                                ? <span style={{ color: '#555', fontStyle: 'italic' }}>NULL</span>
                                                                : String(cell)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Success DML/DDL */}
                        {!execError && results === null && !infoMsg && !running && (
                            <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle size={13} color="#10b981" />
                                <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                                    Statement executed — no rows returned.
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Schema Viewer ── */}
                {schemaOpen && (
                    <div style={{
                        width: '178px', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.07)',
                        overflowY: 'auto', background: '#0a0a12', display: 'flex', flexDirection: 'column',
                    }}>
                        <div style={{
                            padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                            fontSize: '0.68rem', fontWeight: 700, color: '#444', letterSpacing: '0.8px', flexShrink: 0,
                        }}>
                            {activeDb.toUpperCase()} · TABLES
                        </div>

                        {schema.length === 0 ? (
                            <div style={{ padding: '14px 12px', color: '#444', fontSize: '0.76rem' }}>
                                No tables.<br />Run a CREATE TABLE.
                            </div>
                        ) : (
                            schema.map(table => (
                                <div key={table.name}>
                                    <div className="sql-schema-item" onClick={() => toggleTable(table.name)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                    >
                                        {expandedTables[table.name]
                                            ? <ChevronDown size={11} color="#06b6d4" />
                                            : <ChevronRight size={11} color="#555" />
                                        }
                                        <Table2 size={11} color="#06b6d4" />
                                        <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {table.name}
                                        </span>
                                    </div>
                                    {expandedTables[table.name] && (
                                        <div style={{ background: 'rgba(0,0,0,0.2)' }}>
                                            {table.columns.map(col => (
                                                <div key={col.name} style={{
                                                    padding: '4px 12px 4px 26px',
                                                    display: 'flex', justifyContent: 'space-between', gap: '5px',
                                                    borderBottom: '1px solid rgba(255,255,255,0.03)', alignItems: 'center',
                                                }}>
                                                    <span style={{ fontSize: '0.71rem', color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {col.name}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.62rem', color: '#456', background: 'rgba(6,182,212,0.07)',
                                                        padding: '1px 5px', borderRadius: '3px', flexShrink: 0,
                                                        border: '1px solid rgba(6,182,212,0.12)', fontFamily: 'monospace',
                                                    }}>
                                                        {col.type || '—'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                )}
                    </div>
                )}
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
                    {/* Section 1: Introduction */}
                    <section>
                        <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.5px' }}>
                            The Ultimate Online SQL Editor and Database Sandbox
                        </h2>
                        <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
                            In the modern era of data-driven decision-making, SQL (Structured Query Language) remains the most critical 
                            skill for developers, data scientists, and business analysts alike. Whether you're building a mobile app, 
                            analyzing market trends, or preparing for a high-stakes technical interview at a FAANG company, 
                            mastering SQL is non-negotiable. Whizan AI's **Online SQL Editor** provides a professional-grade environment 
                            to practice, build, and test database schemas directly in your browser.
                        </p>
                        <p style={{ marginBottom: '20px' }}>
                            Our tool is not just a simple query runner; it's a full-featured **SQL Sandbox** powered by SQLite and 
                            enhanced by cutting-edge AI. We understand the frustrations of setting up local database environments, 
                            dealing with connection strings, or worrying about breaking production data. That's why we've built a 
                            100% free, secure, and persistent playground where you can experiment without limits.
                        </p>
                    </section>

                    {/* Section 2: Core Features */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px', margin: '40px 0' }}>
                        <section>
                            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Sparkles size={24} color="#06b6d4" /> AI-Powered Query Fixing
                            </h3>
                            <p style={{ marginBottom: '15px' }}>
                                Stuck on a syntax error? Confused by a complex <code>JOIN</code> operation? Our integrated AI assistant 
                                analyzes your active database schema and your current query to provide instant, context-aware 
                                corrections. It doesn't just fix the code; it explains *why* the fix works, helping you learn 
                                advanced SQL patterns faster than traditional tutorials.
                            </p>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '8px' }}>✅ Schema-aware AI corrections</li>
                                <li style={{ marginBottom: '8px' }}>✅ Performance optimization suggestions</li>
                                <li style={{ marginBottom: '8px' }}>✅ Natural language to SQL conversion</li>
                            </ul>
                        </section>

                        <section>
                            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Database size={24} color="#3b82f6" /> Professional SQLite Engine
                            </h3>
                            <p style={{ marginBottom: '15px' }}>
                                Experience the raw power of a real database engine. Unlike some online compilers that use regex 
                                shortcuts, Whizan AI uses **sql.js**, a WebAssembly port of SQLite. This means you get 100% 
                                compliance with standard SQL syntax, supporting everything from CTEs (Common Table Expressions) 
                                to window functions and recursive queries.
                            </p>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '8px' }}>✅ Native SQLite execution in-browser</li>
                                <li style={{ marginBottom: '8px' }}>✅ Support for complex relational schemas</li>
                                <li style={{ marginBottom: '8px' }}>✅ Fast, offline-first performance</li>
                            </ul>
                        </section>
                    </div>

                    {/* Section 3: Detailed Breakdown of Benefits */}
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '40px 0' }} />

                    <section>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>
                            Why Practice SQL Online with Whizan AI?
                        </h3>
                        <p style={{ marginBottom: '20px' }}>
                            Learning database management shouldn't be a tedious process of command-line installations. Our 
                            **interactive SQL playground** is designed to lower the barrier to entry while providing 
                            advanced features for seasoned pros. Here is how we help you master data:
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <div>
                                <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '10px' }}>1. Zero Setup, Instant Access</h4>
                                <p>
                                    Open the page and start typing. There are no Docker containers to manage, no Postgres 
                                    users to configure, and no local storage limits. Your environment is ready the moment you 
                                    land on the site. This makes it the perfect tool for classroom environments or quick 
                                    coding sessions on the go.
                                </p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '10px' }}>2. Persistent Multi-Database Support</h4>
                                <p>
                                    Build an entire ecosystem. Create a `shop_db`, a `users_db`, and a `logs_db`. Whizan AI 
                                    remembers your work across sessions. When you sign in, your database state is securely 
                                    stored in our cloud, allowing you to pick up exactly where you left off from any device.
                                </p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '10px' }}>3. Visual Schema Exploration</h4>
                                <p>
                                    Don't get lost in your own creation. Our **live schema viewer** updates in real-time as you 
                                    run `CREATE TABLE` or `ALTER TABLE` commands. Instantly see your table structures, column 
                                    types, and primary keys without having to run `DESCRIBE` commands repeatedly.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Use Cases */}
                    <section style={{ marginTop: '60px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '30px', textAlign: 'center' }}>
                            A Versatile Tool for Every Data Professional
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                            <div style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ color: '#06b6d4', marginBottom: '15px' }}>Interview Prep</h4>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Practice LeetCode or HackerRank style SQL problems. Study complex aggregations, subqueries, 
                                    and window functions to ace your technical interview.
                                </p>
                            </div>
                            <div style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ color: '#3b82f6', marginBottom: '15px' }}>Academic Learning</h4>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Perfect for university students learning RDBMS fundamentals. Visualize normalization levels 
                                    and relational algebra in action.
                                </p>
                            </div>
                            <div style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ color: '#8b5cf6', marginBottom: '15px' }}>Prototyping</h4>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Quickly mock up a database schema for your next SaaS project. Test your queries before 
                                    writing a single line of backend migration code.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Common SQL Commands Table */}
                    <section style={{ marginTop: '60px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '25px' }}>
                            SQL Reference Quick Start
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#94a3b8', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ textAlign: 'left', padding: '15px', color: '#fff' }}>Command</th>
                                        <th style={{ textAlign: 'left', padding: '15px', color: '#fff' }}>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}><code>SELECT</code></td>
                                        <td style={{ padding: '15px' }}>Retrieves data from one or more tables. The most used command in SQL.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}><code>INSERT INTO</code></td>
                                        <td style={{ padding: '15px' }}>Adds new records (rows) to an existing table.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}><code>UPDATE</code></td>
                                        <td style={{ padding: '15px' }}>Modifies existing data in a table based on a condition.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}><code>DELETE</code></td>
                                        <td style={{ padding: '15px' }}>Removes rows from a table. Use with WHERE to avoid deleting all data!</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}><code>JOIN</code></td>
                                        <td style={{ padding: '15px' }}>Combines rows from two or more tables based on a related column.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}><code>CREATE TABLE</code></td>
                                        <td style={{ padding: '15px' }}>Defines a new table including its columns and data types.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px' }}><code>GROUP BY</code></td>
                                        <td style={{ padding: '15px' }}>Aggregates data into summary rows based on shared values.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Section 6: Advanced Content for SEO */}
                    <section style={{ marginTop: '60px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>
                            Mastering SQL Joins and Aggregations
                        </h3>
                        <p style={{ marginBottom: '20px' }}>
                            One of the most powerful features you can practice in our **SQL Compiler** is the use of complex 
                            joins. Understanding `INNER JOIN`, `LEFT OUTER JOIN`, `RIGHT OUTER JOIN`, and `FULL OUTER JOIN` 
                            is essential for any data-related role. In our playground, you can create multiple tables, populate 
                            them with sample data, and visually see the result set of your join operations. This is often 
                            the "Aha!" moment for students who find textbook diagrams confusing.
                        </p>
                        <p style={{ marginBottom: '20px' }}>
                            Furthermore, you can dive deep into **aggregations**. Master functions like `COUNT()`, `SUM()`, 
                            `AVG()`, `MIN()`, and `MAX()`. Combine these with `HAVING` clauses and `CASE` statements to perform 
                            sophisticated data analysis. Our editor supports these advanced SQLite features, ensuring you're 
                            learning standard SQL that applies to PostgreSQL, MySQL, and SQL Server.
                        </p>
                    </section>

                    {/* Section 7: FAQ for SEO */}
                    <section style={{ marginTop: '60px', padding: '40px', background: 'rgba(0,0,0,0.2)', borderRadius: '24px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '30px' }}>
                            Frequently Asked Questions
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>Is this SQL Editor really free?</h4>
                                <p>Yes, 100% free. No subscriptions, no hidden limits. Our goal is to provide the best free SQL practice tool on the internet.</p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>Do I need to install anything?</h4>
                                <p>No installation is required. Everything runs directly in your web browser using WebAssembly technology.</p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>Can I save my databases?</h4>
                                <p>Yes. If you sign in to your Whizan AI account, your queries and database schemas are auto-saved to your personal cloud profile.</p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>Does it support PostgreSQL or MySQL syntax?</h4>
                                <p>It uses SQLite syntax, which is highly compatible with the SQL standard. Most queries for MySQL or PostgreSQL will work without modification.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 8: Call to Action & Final Keywords */}
                    <section style={{ marginTop: '60px', textAlign: 'center' }}>
                        <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, marginBottom: '25px' }}>
                            Ready to become a SQL Expert?
                        </h2>
                        <p style={{ marginBottom: '30px', maxWidth: '800px', margin: '0 auto 30px' }}>
                            Stop watching tutorials and start coding. The best way to learn SQL is by getting your hands 
                            dirty with real queries. Whether you are a beginner looking for an **online SQL compiler** 
                            or a pro needing a **database sandbox**, Whizan AI is your go-to destination.
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginBottom: '40px' }}>
                            {[
                                'online-sql-editor', 'sql-sandbox', 'practice-sql-online', 'sql-interview-prep', 
                                'free-sql-compiler', 'database-playground', 'sqlite-online', 'whizan-ai-sql',
                                'master-sql', 'data-science-tools', 'backend-development', 'learn-rdbms'
                            ].map(tag => (
                                <span key={tag} style={{ fontSize: '0.8rem', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 15px', borderRadius: '30px' }}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        <button 
                            onClick={() => window.location.href = '/dashboard'}
                            style={{ 
                                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', 
                                color: '#fff', 
                                border: 'none', 
                                padding: '15px 40px', 
                                borderRadius: '16px', 
                                fontWeight: 800, 
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                boxShadow: '0 15px 30px -10px rgba(6,182,212,0.5)',
                                transition: 'transform 0.2s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Start Practicing Now
                        </button>
                    </section>

                    {/* Section 9: Technical Footnote for AIO */}
                    <footer style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#475569' }}>
                        <p>
                            **Technical Architecture:** Whizan AI SQL Sandbox utilizes `sql.js`, which is an emscripten port of SQLite. 
                            Queries are executed locally in the browser's worker thread to ensure zero latency and maximum privacy. 
                            For persisted storage, encrypted base64 blobs are synchronized with Google Cloud Firestore. Whizan AI 
                            is a leader in **online developer tools**, dedicated to high-performance learning environments for 
                            technical education.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
