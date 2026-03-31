import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
    Play, Save, Loader2, Table2, Database,
    ChevronDown, ChevronRight, AlertCircle, CheckCircle, Trash2, Sparkles, Wand2
} from 'lucide-react';

// ── Backend API ─────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';


// ── Starter SQL ─────────────────────────────────────────────────────────────
const STARTER_SQL = `-- Welcome to the SQL Sandbox!
-- Supports: CREATE DATABASE db1, USE db1, SHOW DATABASES
-- Your databases & data are auto-saved per course.`;

// ── Firestore key ────────────────────────────────────────────────────────────
// Shape: { databases: { [dbName]: Base64 }, activeDb: string, savedAt: string }
const FS_PATH = (userId, courseId) =>
    doc(db, 'userProfiles', userId, 'sqlDatabases', courseId);

/**
 * Full-featured SQL Sandbox with:
 *  • sql.js (WebAssembly SQLite) in-browser execution
 *  • Multi-database: CREATE DATABASE x, USE x, SHOW DATABASES
 *  • Per-user, per-course Firestore persistence (all DBs)
 *  • Schema viewer
 *  • AI Fix button (Gemini 2.0 Flash, full schema awareness)
 */
export default function LectureSQLEditor({ userId, courseId }) {
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
        if (!sqlJsReady || !userId || !courseId) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const snap = await getDoc(FS_PATH(userId, courseId));
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
    }, [sqlJsReady, userId, courseId]);

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
        if (!userId || !courseId) return;
        setSaving(true);
        try {
            const databases = {};
            Object.entries(dbMap.current).forEach(([name, db_]) => {
                databases[name] = serializeOne(db_);
            });
            await setDoc(FS_PATH(userId, courseId), {
                databases,
                activeDb,
                savedAt: new Date().toISOString(),
                courseId,
            }, { merge: true });
            setSaveMsg('Saved ✓');
        } catch (_) {
            setSaveMsg('Save failed');
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMsg(''), 2500);
        }
    }, [userId, courseId, activeDb]);

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
        <div style={{
            display: 'flex', flexDirection: 'column', height: '100%',
            background: '#0d0d14', color: '#fff', fontFamily: "'Inter', sans-serif",
            overflow: 'hidden',
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
    );
}
