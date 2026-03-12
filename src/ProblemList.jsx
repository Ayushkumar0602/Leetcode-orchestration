import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronRight, Search, Brain, LogOut, CheckCircle2, Trophy,
    Clock, List as ListIcon, Plus, Bookmark, ChevronLeft,
    ArrowRight, Zap, Layers, Link2
} from 'lucide-react';
import Select from 'react-select';
import { useAuth } from './contexts/AuthContext';
import ActivityCalendar from './ActivityCalendar';
import BookmarkModal from './BookmarkModal';
import NavProfile from './NavProfile';

const LANG_OPTIONS = {
    'python': 'Python 3', 'javascript': 'JavaScript',
    'cpp': 'C++', 'c': 'C', 'java': 'Java', 'go': 'Go', 'rust': 'Rust'
};

const DIFF_STYLE = {
    'Easy': { bg: 'rgba(0,184,163,0.12)', color: '#00b8a3' },
    'Medium': { bg: 'rgba(255,161,22,0.12)', color: '#ffa116' },
    'Hard': { bg: 'rgba(239,71,67,0.12)', color: '#ef4743' },
};

export default function ProblemList() {
    const navigate = useNavigate();
    const { page: pageParam } = useParams();
    const page = parseInt(pageParam) || 1;
    const { currentUser, logout } = useAuth();

    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');

    const [metadata, setMetadata] = useState({ topics: [], companies: [] });
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState(
        () => localStorage.getItem('codearena_lang') || 'python'
    );

    const [userStats, setUserStats] = useState(null);
    const [totalCounts, setTotalCounts] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // Bookmark / List state
    const [userLists, setUserLists] = useState([]);
    const [activeList, setActiveList] = useState(null); // null = show all
    const [bookmarkModal, setBookmarkModal] = useState(null); // { problemId }
    const [showNewList, setShowNewList] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [creatingList, setCreatingList] = useState(false);

    // LinkedIn/LeetCode profile sync (temporary module)
    const [linkedInProfileId, setLinkedInProfileId] = useState('');
    const [showSyncModule, setShowSyncModule] = useState(false);

    // --- Data fetching ---
    useEffect(() => {
        fetch('https://leetcode-orchestration-55z3.onrender.com/api/metadata')
            .then(r => r.json())
            .then(data => {
                if (!data.error) setMetadata({
                    topics: data.topics.map(t => ({ value: t, label: t })),
                    companies: data.companies.map(c => ({ value: c, label: c }))
                });
            }).catch(console.error);
    }, []);

    useEffect(() => {
        if (!currentUser) { setStatsLoading(false); return; }
        setStatsLoading(true);
        fetch(`https://leetcode-orchestration-55z3.onrender.com/api/stats/user/${currentUser.uid}`)
            .then(r => r.json())
            .then(data => { if (!data.error) { setUserStats(data.userStats); setTotalCounts(data.totalCounts); } })
            .catch(console.error).finally(() => setStatsLoading(false));
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) return;
        fetch(`https://leetcode-orchestration-55z3.onrender.com/api/lists/${currentUser.uid}`)
            .then(r => r.json())
            .then(data => setUserLists(data.lists || []))
            .catch(console.error);
    }, [currentUser]);

    useEffect(() => {
        const t = setTimeout(() => {
            setLoading(true);
            const topicQuery = selectedTopics.map(t => t.value).join(',');
            const companyQuery = selectedCompanies.map(c => c.value).join(',');
            const params = new URLSearchParams({ page, limit: 20, search, topics: topicQuery, companies: companyQuery });
            fetch(`https://leetcode-orchestration-55z3.onrender.com/api/problems?${params}`)
                .then(r => r.json())
                .then(data => { if (data.data) { setProblems(data.data); setTotalPages(data.totalPages); } })
                .catch(console.error).finally(() => setLoading(false));
        }, 300);
        return () => clearTimeout(t);
    }, [page, search, selectedTopics, selectedCompanies]);

    // --- Handlers ---
    const handleSolve = (p) => navigate(`/solvingpage/${p.id}`, {
        state: { problemParams: { id: p.id, title: p.title, description: p.description, difficulty: p.difficulty, language: selectedLanguage } }
    });

    const handleLanguageSelect = (lang) => {
        setSelectedLanguage(lang);
        localStorage.setItem('codearena_lang', lang);
    };

    const handlePageChange = (n) => { if (n >= 1 && n <= totalPages) navigate(`/dsaquestion/${n}`); };

    const handleSyncSubmit = (e) => {
        e?.preventDefault();
        const trimmed = linkedInProfileId.trim();
        if (!trimmed || !currentUser) return;
        navigate(`/scraper?username=${encodeURIComponent(trimmed)}`);
    };

    const createList = async () => {
        if (!newListName.trim() || !currentUser) return;
        setCreatingList(true);
        try {
            const res = await fetch('https://leetcode-orchestration-55z3.onrender.com/api/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid, name: newListName.trim() })
            });
            const newList = await res.json();
            if (newList.id) { setUserLists(prev => [...prev, newList]); setNewListName(''); setShowNewList(false); }
        } catch (e) { console.error(e); }
        setCreatingList(false);
    };

    // Filter by active list
    const displayedProblems = activeList
        ? problems.filter(p => activeList.problemIds?.includes(String(p.id)))
        : problems;

    // --- Render ---
    return (
        <div style={{ minHeight: '100vh', background: '#080b14', color: 'var(--txt)', fontFamily: "'Inter', sans-serif" }}>
            {/* ── Navbar ─────────────────────────────────── */}
            <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logo.jpeg" alt="Logo" style={{ height: '28px', width: '28px', borderRadius: '6px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--txt)', letterSpacing: '-0.3px' }}>CodeArena</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px' }}>
                    {[
                        { label: 'Problems', path: '/dsaquestion' },
                        { label: 'DSA Interview', path: '/aiinterview' },
                        { label: 'System Design', path: '/systemdesign' },
                        { label: 'My Submissions', path: '/submissions' },
                    ].map(item => (
                        <button key={item.label} onClick={() => navigate(item.path)}
                            style={{ padding: '6px 14px', borderRadius: '7px', border: 'none', background: item.path === '/dsaquestion' ? 'rgba(255,255,255,0.1)' : 'transparent', color: item.path === '/dsaquestion' ? 'var(--txt)' : 'var(--txt3)', fontSize: '0.82rem', fontWeight: item.path === '/dsaquestion' ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                            {item.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select className="lc-lang-select-sm" value={selectedLanguage} onChange={e => handleLanguageSelect(e.target.value)}>
                        {Object.entries(LANG_OPTIONS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <NavProfile />
                </div>
            </nav>

            {/* ── Main layout ─────────────────────────────── */}
            <div className="problem-list-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

                {/* ── LEFT SIDEBAR ─────────────────── */}
                <div className="problem-list-sidebar" style={{ width: '340px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Progress Card */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
                            <Trophy size={18} color="var(--accent)" />
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--txt)' }}>Your Progress</span>
                        </div>
                        {!currentUser ? (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: 'var(--txt3)', fontSize: '0.82rem', marginBottom: '1rem' }}>Log in to track progress</p>
                                <button onClick={() => navigate('/login?redirect=/dsaquestion')} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>Sign In</button>
                            </div>
                        ) : statsLoading ? (
                            <div style={{ textAlign: 'center', color: 'var(--txt3)', fontSize: '0.82rem', padding: '1rem 0' }}>Loading…</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {/* Circular total */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    <div style={{ position: 'relative', width: '88px', height: '88px', flexShrink: 0 }}>
                                        <svg width="100%" height="100%" viewBox="0 0 36 36">
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray={`${((userStats?.Total || 0) / (totalCounts?.Total || 1)) * 100}, 100`} strokeLinecap="round" />
                                        </svg>
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--txt)', lineHeight: 1 }}>{userStats?.Total || 0}</span>
                                            <span style={{ fontSize: '0.58rem', color: 'var(--txt3)', marginTop: '2px' }}>SOLVED</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--txt3)', marginBottom: '2px' }}>Overall</div>
                                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--txt)', lineHeight: 1 }}>
                                            {(((userStats?.Total || 0) / (totalCounts?.Total || 1)) * 100).toFixed(1)}%
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--txt3)', marginTop: '2px' }}>of {totalCounts?.Total || 0} problems</div>
                                    </div>
                                </div>
                                {/* Difficulty bars */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {[
                                        { label: 'Easy', color: '#00b8a3', count: userStats?.Easy || 0, total: totalCounts?.Easy || 1 },
                                        { label: 'Medium', color: '#ffa116', count: userStats?.Medium || 0, total: totalCounts?.Medium || 1 },
                                        { label: 'Hard', color: '#ef4743', count: userStats?.Hard || 0, total: totalCounts?.Hard || 1 }
                                    ].map(d => (
                                        <div key={d.label}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '5px' }}>
                                                <span style={{ color: d.color, fontWeight: 600 }}>{d.label}</span>
                                                <span style={{ color: 'var(--txt2)' }}><strong>{d.count}</strong> <span style={{ color: 'var(--txt3)' }}>/ {d.total}</span></span>
                                            </div>
                                            <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(d.count / d.total) * 100}%`, height: '100%', background: d.color, borderRadius: '999px', transition: 'width 0.6s ease' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* My Lists */}
                    {currentUser && (
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ListIcon size={16} color="var(--accent)" />
                                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--txt)' }}>My Lists</span>
                                </div>
                                <button onClick={() => setShowNewList(s => !s)} title="New list" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', padding: '4px 8px', cursor: 'pointer', color: 'var(--txt2)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                                    <Plus size={13} /> New
                                </button>
                            </div>

                            {showNewList && (
                                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                                    <input autoFocus value={newListName} onChange={e => setNewListName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createList()} placeholder="List name…"
                                        style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '7px', padding: '6px 10px', color: 'var(--txt)', fontSize: '0.82rem', outline: 'none' }} />
                                    <button onClick={createList} disabled={creatingList} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '7px', padding: '0 10px', cursor: 'pointer', fontWeight: 700 }}>
                                        {creatingList ? '…' : '+'}
                                    </button>
                                </div>
                            )}

                            {/* "All Problems" button */}
                            <button onClick={() => setActiveList(null)}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '8px 10px', borderRadius: '9px', border: 'none', background: !activeList ? 'rgba(var(--accent-rgb,99,102,241),0.15)' : 'transparent', color: !activeList ? 'var(--accent)' : 'var(--txt2)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: !activeList ? 700 : 400, marginBottom: '4px', transition: 'all 0.15s' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={13} /> All Problems</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--txt3)' }}>{totalCounts?.Total || '–'}</span>
                            </button>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {userLists.length === 0 ? (
                                    <p style={{ fontSize: '0.78rem', color: 'var(--txt3)', textAlign: 'center', padding: '0.75rem 0' }}>No lists yet</p>
                                ) : userLists.map(list => (
                                    <button key={list.id} onClick={() => setActiveList(activeList?.id === list.id ? null : list)}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '9px', border: 'none', background: activeList?.id === list.id ? 'rgba(var(--accent-rgb,99,102,241),0.15)' : 'transparent', color: activeList?.id === list.id ? 'var(--accent)' : 'var(--txt2)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: activeList?.id === list.id ? 700 : 400, transition: 'all 0.15s', textAlign: 'left' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                                            <Bookmark size={13} style={{ flexShrink: 0 }} />
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{list.name}</span>
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--txt3)', flexShrink: 0, marginLeft: '4px' }}>{list.problemIds?.length || 0}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Activity Calendar */}
                    {currentUser && <ActivityCalendar uid={currentUser.uid} userStats={userStats} totalCounts={totalCounts} />}

                    {/* Import from LeetCode (temporary sync module) */}
                    {currentUser && (
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.25rem', overflow: 'hidden' }}>
                            <button onClick={() => setShowSyncModule(s => !s)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', color: 'var(--txt2)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700, padding: 0, marginBottom: showSyncModule ? '1rem' : 0 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Link2 size={16} color="var(--accent)" />
                                    Import from LeetCode
                                </span>
                                <ChevronRight size={16} style={{ transform: showSyncModule ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                            {showSyncModule && (
                                <form onSubmit={handleSyncSubmit}>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--txt3)', marginBottom: '10px' }}>
                                        Enter your LeetCode username to sync solved problems (one-time sync).
                                    </p>
                                    <input type="text" value={linkedInProfileId} onChange={e => setLinkedInProfileId(e.target.value)} placeholder="LeetCode username"
                                        style={{ width: '100%', display: 'block', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 12px', color: 'var(--txt)', fontSize: '0.82rem', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }} />
                                    <button type="submit" disabled={!linkedInProfileId.trim()} style={{ width: '100%', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '0.82rem', fontWeight: 600, cursor: linkedInProfileId.trim() ? 'pointer' : 'not-allowed', opacity: linkedInProfileId.trim() ? 1 : 0.5 }}>
                                        Sync & Continue
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                {/* ── RIGHT MAIN CONTENT ─────────────────── */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Hero + Search row */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div>
                                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--txt)', margin: 0, letterSpacing: '-0.5px' }}>
                                    {activeList ? `📌 ${activeList.name}` : 'Data Structure & Algorithm'}
                                </h1>
                                <p style={{ color: 'var(--txt3)', fontSize: '0.82rem', margin: '4px 0 0' }}>
                                    {activeList ? `${activeList.problemIds?.length || 0} saved problems` : `${totalCounts?.Total || '–'} problems · Page ${page} of ${totalPages}`}
                                </p>
                            </div>
                            {activeList && (
                                <button onClick={() => setActiveList(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 12px', color: 'var(--txt2)', cursor: 'pointer', fontSize: '0.8rem' }}>
                                    <ChevronLeft size={14} /> All Problems
                                </button>
                            )}
                        </div>

                        {/* Search + Filters */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: '1 1 220px' }}>
                                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt3)', pointerEvents: 'none' }} />
                                <input type="text" value={search} onChange={e => { setSearch(e.target.value); navigate('/dsaquestion/1'); }} placeholder="Search problems, topics…"
                                    style={{ width: '100%', padding: '9px 12px 9px 36px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'var(--txt)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
                                <Select isMulti options={metadata.topics} value={selectedTopics}
                                    onChange={sel => { setSelectedTopics(sel || []); navigate('/dsaquestion/1'); }}
                                    placeholder="Topics…" styles={selectStyles} />
                            </div>
                            <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
                                <Select isMulti options={metadata.companies} value={selectedCompanies}
                                    onChange={sel => { setSelectedCompanies(sel || []); navigate('/dsaquestion/1'); }}
                                    placeholder="Companies…" styles={selectStyles} />
                            </div>
                        </div>
                    </div>

                    {/* Problem List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
                        {/* Table header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 100px 90px 110px', padding: '10px 20px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--txt3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            <span>#</span>
                            <span>Title</span>
                            <span>Difficulty</span>
                            <span>Acceptance</span>
                            <span style={{ textAlign: 'right' }}>Actions</span>
                        </div>

                        {loading ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--txt3)', fontSize: '0.9rem' }}>
                                <Zap size={24} style={{ marginBottom: '8px', opacity: 0.5 }} /><br />Loading problems…
                            </div>
                        ) : displayedProblems.length === 0 ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--txt3)', fontSize: '0.9rem' }}>
                                {activeList ? `No problems saved in "${activeList.name}" yet` : `No problems found for "${search}"`}
                            </div>
                        ) : displayedProblems.map((p, idx) => {
                            const diff = DIFF_STYLE[p.difficulty] || DIFF_STYLE.Medium;
                            const solved = userStats?.solvedIds?.includes(String(p.id));
                            const attempting = userStats?.attemptingIds?.includes(String(p.id));
                            const inAnyList = userLists.some(l => l.problemIds?.includes(String(p.id)));

                            return (
                                <div key={p.id} onClick={() => handleSolve(p)}
                                    style={{ display: 'grid', gridTemplateColumns: '56px 1fr 100px 90px 110px', alignItems: 'center', padding: '14px 20px', borderBottom: idx < displayedProblems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    {/* # */}
                                    <span style={{ fontSize: '0.8rem', color: 'var(--txt3)', fontVariantNumeric: 'tabular-nums' }}>{p.id}</span>

                                    {/* Title + status */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                        {solved ? (
                                            <CheckCircle2 size={15} color="#00b8a3" style={{ flexShrink: 0 }} />
                                        ) : attempting ? (
                                            <Clock size={15} color="#ffa116" style={{ flexShrink: 0 }} />
                                        ) : <div style={{ width: 15 }} />}
                                        <span style={{ fontSize: '0.87rem', fontWeight: 500, color: 'var(--txt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                                    </div>

                                    {/* Difficulty */}
                                    <span style={{ display: 'inline-block', background: diff.bg, color: diff.color, fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                                        {p.difficulty}
                                    </span>

                                    {/* Acceptance */}
                                    <span style={{ fontSize: '0.82rem', color: 'var(--txt3)' }}>{p.acceptance_rate}%</span>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }} onClick={e => e.stopPropagation()}>
                                        <button
                                            title="Save to list"
                                            onClick={e => { e.stopPropagation(); setBookmarkModal({ problemId: p.id }); }}
                                            style={{ background: inAnyList ? 'rgba(var(--accent-rgb,99,102,241),0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${inAnyList ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', color: inAnyList ? 'var(--accent)' : 'var(--txt3)', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                                        >
                                            <Bookmark size={13} fill={inAnyList ? 'currentColor' : 'none'} />
                                        </button>
                                        <button
                                            onClick={e => { e.stopPropagation(); handleSolve(p); }}
                                            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '7px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                                        >
                                            Solve <ArrowRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {!activeList && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '1.5rem', paddingBottom: '3rem' }}>
                            <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: page <= 1 ? 'var(--txt3)' : 'var(--txt)', cursor: page <= 1 ? 'default' : 'pointer', fontSize: '0.85rem', opacity: page <= 1 ? 0.5 : 1 }}>
                                <ChevronLeft size={15} /> Prev
                            </button>

                            <div style={{ display: 'flex', gap: '4px' }}>
                                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                                    let p2 = i + 1;
                                    if (totalPages > 7) {
                                        if (page <= 4) p2 = i + 1;
                                        else if (page >= totalPages - 3) p2 = totalPages - 6 + i;
                                        else p2 = page - 3 + i;
                                    }
                                    return (
                                        <button key={p2} onClick={() => handlePageChange(p2)}
                                            style={{ width: '34px', height: '34px', border: 'none', borderRadius: '8px', background: p2 === page ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: p2 === page ? '#fff' : 'var(--txt2)', fontWeight: p2 === page ? 700 : 400, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                                            {p2}
                                        </button>
                                    );
                                })}
                            </div>

                            <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: page >= totalPages ? 'var(--txt3)' : 'var(--txt)', cursor: page >= totalPages ? 'default' : 'pointer', fontSize: '0.85rem', opacity: page >= totalPages ? 0.5 : 1 }}>
                                Next <ChevronRight size={15} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bookmark Modal */}
            {bookmarkModal && currentUser && (
                <BookmarkModal
                    problemId={bookmarkModal.problemId}
                    userId={currentUser.uid}
                    onClose={() => {
                        setBookmarkModal(null);
                        // Refresh lists to update bookmark indicators
                        fetch(`https://leetcode-orchestration-55z3.onrender.com/api/lists/${currentUser.uid}`)
                            .then(r => r.json()).then(d => setUserLists(d.lists || [])).catch(console.error);
                    }}
                />
            )}
        </div>
    );
}

// Dark react-select styles
const selectStyles = {
    control: (b, s) => ({ ...b, background: 'rgba(255,255,255,0.05)', borderColor: s.isFocused ? 'var(--accent)' : 'rgba(255,255,255,0.1)', borderRadius: '10px', minHeight: '40px', boxShadow: 'none', '&:hover': { borderColor: 'rgba(255,255,255,0.2)' } }),
    menu: b => ({ ...b, background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', zIndex: 100 }),
    option: (b, s) => ({ ...b, background: s.isFocused ? 'rgba(255,255,255,0.08)' : 'transparent', color: 'var(--txt)', cursor: 'pointer', fontSize: '0.85rem' }),
    multiValue: b => ({ ...b, backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '5px' }),
    multiValueLabel: b => ({ ...b, color: 'var(--txt)', fontSize: '0.8rem' }),
    multiValueRemove: b => ({ ...b, color: 'var(--txt3)', ':hover': { backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--txt)' } }),
    input: b => ({ ...b, color: 'var(--txt)' }),
    placeholder: b => ({ ...b, color: 'var(--txt3)', fontSize: '0.85rem' }),
};
