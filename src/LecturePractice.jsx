import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Code2, Search, Loader2, ChevronDown, ChevronUp, AlertCircle, X } from 'lucide-react';
import Dashboard from './Dashboard';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';
const DIFFICULTY_COLOR = { Easy: '#00b8a3', Medium: '#ffa116', Hard: '#ef4743' };

/**
 * LecturePractice — "Solve Relevant LeetCode" panel embedded in the lecture page.
 * Searches problems, then renders the full Dashboard (solving page) inline — no
 * navigation, no nested Router. Uses the initialProblem prop to pass data directly.
 */
export default function LecturePractice({ videoTitle }) {
    const [open, setOpen]               = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching]     = useState(false);
    const [searchError, setSearchError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedProblem, setSelectedProblem] = useState(null);

    const searchRef = useRef(null);

    // Pre-fill with video title keywords
    useEffect(() => {
        if (videoTitle && !searchQuery) {
            const clean = videoTitle.replace(/[^a-zA-Z0-9 ]/g, ' ').split(' ').slice(0, 4).join(' ');
            setSearchQuery(clean);
        }
    // eslint-disable-next-line
    }, [videoTitle]);

    // Focus on open
    useEffect(() => {
        if (open && !selectedProblem) setTimeout(() => searchRef.current?.focus(), 120);
    }, [open, selectedProblem]);

    // Reset on close
    useEffect(() => {
        if (!open) setSelectedProblem(null);
    }, [open]);

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        setSearchError('');
        setHasSearched(true);
        try {
            const res = await fetch(`${API_BASE}/api/problems/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setSearchResults(data.problems || []);
        } catch {
            setSearchError('Search failed. Please try again.');
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    }, [searchQuery]);

    const chooseProblem = (p) => {
        const lang = localStorage.getItem('whizan_lang') || 'cpp';
        setSelectedProblem({ ...p, language: lang });
    };

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
                    border: `1px solid ${open ? 'rgba(0,184,163,0.3)' : 'rgba(255,255,255,0.07)'}`,
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
                        {selectedProblem ? `Practicing: ${selectedProblem.title}` : 'Find and practice a problem related to this lecture'}
                    </div>
                </div>
                {open ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
            </button>

            {/* ── Panel ── */}
            {open && (
                <div style={{
                    marginTop: '10px',
                    background: '#050508',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    fontFamily: "'Inter', sans-serif",
                }}>

                    {/* ── Search View ── */}
                    {!selectedProblem && (
                        <div style={{ padding: '20px' }}>
                            <p style={{ margin: '0 0 14px', color: '#64748b', fontSize: '0.85rem' }}>
                                Search by problem name or number. Click a result to load it here inline.
                            </p>

                            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <Search size={15} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                    <input
                                        ref={searchRef}
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                        placeholder="e.g. 'Binary Search', '#704', 'two sum'"
                                        style={{
                                            width: '100%', background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                                            padding: '10px 14px 10px 36px', color: '#e2e8f0',
                                            fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box',
                                            fontFamily: 'inherit',
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'rgba(0,184,163,0.4)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={searching || !searchQuery.trim()}
                                    style={{
                                        background: 'linear-gradient(135deg, #00b8a3, #0891b2)',
                                        border: 'none', borderRadius: '10px', padding: '10px 18px',
                                        color: '#fff', cursor: searching || !searchQuery.trim() ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        fontSize: '0.88rem', fontWeight: 600, flexShrink: 0,
                                        opacity: !searchQuery.trim() ? 0.6 : 1,
                                    }}
                                >
                                    {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                                    Search
                                </button>
                            </div>

                            {searchError && (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#f87171', fontSize: '0.85rem', marginBottom: '10px' }}>
                                    <AlertCircle size={14} /> {searchError}
                                </div>
                            )}

                            {searchResults.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {searchResults.map(p => (
                                        <button
                                            key={p.id || p.title}
                                            onClick={() => chooseProblem(p)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '14px',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.07)',
                                                borderRadius: '10px', padding: '11px 16px',
                                                cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,184,163,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,184,163,0.25)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                                        >
                                            {p.id && (
                                                <span style={{ color: '#475569', fontSize: '0.78rem', minWidth: '32px', textAlign: 'right', fontFamily: 'monospace' }}>
                                                    #{p.id}
                                                </span>
                                            )}
                                            <span style={{ flex: 1, color: '#e2e8f0', fontSize: '0.88rem', fontWeight: 500 }}>{p.title}</span>
                                            {p.difficulty && (
                                                <span style={{
                                                    fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                                                    color: DIFFICULTY_COLOR[p.difficulty] || '#999',
                                                    background: `${DIFFICULTY_COLOR[p.difficulty] || '#999'}18`,
                                                    flexShrink: 0,
                                                }}>
                                                    {p.difficulty}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {hasSearched && !searching && searchResults.length === 0 && !searchError && (
                                <div style={{ textAlign: 'center', padding: '14px', color: '#64748b', fontSize: '0.85rem' }}>
                                    No matching problems found.
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Embedded Dashboard ── */}
                    {selectedProblem && (
                        <div>
                            {/* Back bar */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '10px 16px',
                                background: 'rgba(0,0,0,0.3)',
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <button
                                    onClick={() => setSelectedProblem(null)}
                                    style={{
                                        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#94a3b8', borderRadius: '7px', padding: '5px 12px',
                                        cursor: 'pointer', fontSize: '0.82rem',
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                    }}
                                >
                                    <X size={12} /> Back to search
                                </button>
                                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                                    Practicing: <strong style={{ color: '#e2e8f0' }}>{selectedProblem.title}</strong>
                                </span>
                            </div>

                            {/*
                             * Render Dashboard directly with embedded + initialProblem props.
                             * No nested Router — Dashboard bypasses useLocation/useParams
                             * when embedded=true and loads from initialProblem directly.
                             */}
                            <div style={{ height: '90vh', overflow: 'auto' }}>
                                <Dashboard embedded={true} initialProblem={selectedProblem} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
