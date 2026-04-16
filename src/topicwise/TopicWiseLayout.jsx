import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Zap, ArrowRight, Layers, Search, Brain, Trophy, List as ListIcon, Plus, Bookmark, Link2 } from 'lucide-react';
import Select from 'react-select';
import { useAuth } from '../contexts/AuthContext';
import NavProfile from '../NavProfile';
import { useQuery } from '@tanstack/react-query';
import { fetchMetadata, fetchStats, fetchProblems, fetchInterviews, queryKeys } from '../lib/api';
import { useSEO } from '../hooks/useSEO';
import DashboardRecommendations from '../components/DashboardRecommendations';

const DIFF_STYLE = {
    'Easy': { bg: 'rgba(0,184,163,0.12)', color: '#00b8a3' },
    'Medium': { bg: 'rgba(255,161,22,0.12)', color: '#ffa116' },
    'Hard': { bg: 'rgba(239,71,67,0.12)', color: '#ef4743' },
};

export default function TopicWiseLayout({ topicTitle, topicDescription, seoMetadata, seoContent, apiTopics = [], accentColor = '#6366f1' }) {
    const navigate = useNavigate();
    const { page: pageParam } = useParams();
    const page = parseInt(pageParam) || 1;
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;

    useSEO(seoMetadata);

    const [selectedTopics, setSelectedTopics] = useState([]);
    
    // Helper to get rgba from hex
    const getRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Metadata query for topics
    const { data: metadata = { topics: [], companies: [] } } = useQuery({
        queryKey: queryKeys.metadata(),
        queryFn: fetchMetadata,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        refetchOnWindowFocus: false,
    });

    // User stats query
    const { data: statsResult } = useQuery({
        queryKey: queryKeys.stats(uid),
        queryFn: () => fetchStats(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 5,
    });
    const userStats = statsResult?.userStats ?? null;

    // User interviews query
    const { data: interviewsData } = useQuery({
        queryKey: queryKeys.interviews(uid),
        queryFn: () => fetchInterviews(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 3,
    });
    const validInterviews = (interviewsData || []).filter(inv => inv.overallScore || inv.scoreReport);

    // Problems query
    const problemParams = {
        page,
        search: '',
        topics: [...apiTopics, ...selectedTopics.map(t => t.value)],
    };

    const { data: problemsData, isLoading: loading } = useQuery({
        queryKey: [`problems-${topicTitle.toLowerCase().replace(/\s+/g, '-')}`, problemParams],
        queryFn: () => fetchProblems(problemParams),
        staleTime: 1000 * 60 * 60 * 24,
        keepPreviousData: true,
        refetchOnWindowFocus: false,
    });

    const problems = problemsData?.problems ?? [];
    const totalPages = problemsData?.totalPages ?? 1;

    const handleSolve = (p) => navigate(`/solvingpage/${p.id}`, {
        state: { problemParams: { id: p.id, title: p.title, description: p.description, difficulty: p.difficulty, language: 'python' } }
    });

    const handlePageChange = (n) => { 
        if (n >= 1 && n <= totalPages) {
            const currentPath = window.location.pathname.split('/').slice(0, 3).join('/');
            navigate(`${currentPath}/${n}`); 
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#050505',
            backgroundImage: `radial-gradient(circle at 50% 0%, ${getRgba(accentColor, 0.08)} 0%, transparent 60%), radial-gradient(circle at 100% 100%, ${getRgba(accentColor, 0.04)} 0%, transparent 50%)`,
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            paddingBottom: '4rem'
        }}>
            <style>{`
                .topic-sheet-layout {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 350px;
                    gap: 2.5rem;
                    align-items: start;
                }
                .right-sidebar {
                    position: sticky;
                    top: 100px;
                }
                .hero-title {
                    font-size: 3rem;
                    font-weight: 800;
                    margin: 0 0 16px 0;
                    letter-spacing: -1.5px;
                    background: linear-gradient(to right, #fff, rgba(255,255,255,0.7));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    line-height: 1.1;
                }
                .hero-subtitle {
                    color: rgba(255,255,255,0.6);
                    font-size: 1.05rem;
                    max-width: 650px;
                    margin: 0 auto;
                    line-height: 1.6;
                }
                .problems-container {
                    display: flex;
                    flex-direction: column;
                    background: rgba(15,15,20,0.6);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                }
                .problems-grid {
                    display: grid;
                    grid-template-columns: 56px 1fr 100px 90px 110px;
                    align-items: center;
                    padding: 16px 24px;
                }
                @media (max-width: 1024px) {
                    .topic-sheet-layout {
                        grid-template-columns: 1fr;
                    }
                    .right-sidebar {
                        position: static;
                        top: auto;
                    }
                }
                @media (max-width: 768px) {
                    .hero-title { font-size: 2rem !important; }
                    .hero-subtitle { font-size: 0.95rem !important; }
                    .problems-grid { 
                        grid-template-columns: 48px 1fr 90px 100px !important; 
                        padding: 14px 16px !important;
                    }
                    .acceptance-col { display: none; }
                    .sheet-content { padding: 2rem 1rem !important; }
                }
                @media (max-width: 480px) {
                    .hero-title { font-size: 1.75rem !important; }
                    .problems-grid { 
                        grid-template-columns: 1fr 80px 90px !important; 
                    }
                    .id-col { display: none; }
                }
                code {
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                    color: #fff;
                    font-size: 0.9em;
                }
            `}</style>
            
            {/* Navbar */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                padding: '0 1.5rem', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: '1 1 0' }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="Logo" style={{ height: '32px', width: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Whizan AI</span>
                </div>
                
                <div style={{ flex: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <div className="pl-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
                        {[
                            { label: 'Problems', path: '/dsaquestion' },
                            { label: 'DSA Interview', path: '/aiinterview' },
                            { label: 'System Design', path: '/systemdesign' },
                            { label: 'My Submissions', path: '/submissions' },
                        ].map(item => {
                            return (
                                <button key={item.label} onClick={() => navigate(item.path)}
                                    style={{
                                        padding: '6px 14px', borderRadius: '7px', border: 'none',
                                        background: 'transparent',
                                        color: 'rgba(255,255,255,0.6)',
                                        fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flex: '1 1 0' }}>
                    <NavProfile />
                </div>
            </nav>

            <div className="sheet-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                
                {/* Hero Section */}
                <div style={{ textAlign: 'center', marginBottom: '1rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ 
                            display: 'inline-block', padding: '6px 16px', borderRadius: '20px', 
                            background: getRgba(accentColor, 0.1), border: `1px solid ${getRgba(accentColor, 0.3)}`,
                            color: '#fff', fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px',
                            boxShadow: `0 4px 14px ${getRgba(accentColor, 0.1)}`
                        }}>
                            <Layers size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle', marginTop: '-2px' }}/>
                            Topic-Wise Mastery Series
                        </div>
                        <h1 className="hero-title">{topicTitle}</h1>
                        <p className="hero-subtitle">{topicDescription}</p>
                    </div>
                </div>

                {/* 2-Column Layout */}
                <div className="topic-sheet-layout">
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Filters */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                            <div style={{ flex: '1 1 300px', maxWidth: '100%' }}>
                                <Select 
                                    isMulti 
                                    options={metadata.topics.filter(t => !apiTopics.includes(t.value))} 
                                    value={selectedTopics}
                                    onChange={sel => { setSelectedTopics(sel || []); navigate(window.location.pathname.split('/').slice(0, 3).join('/') + '/1'); }}
                                    placeholder="Add sub-topics filter…" 
                                    styles={selectStyles} 
                                />
                            </div>
                        </div>

                        {/* Problems Table */}
                        <div className="problems-container">
                            <div className="problems-grid" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                <span className="id-col">#</span>
                                <span>Problem Title</span>
                                <span>Difficulty</span>
                                <span className="acceptance-col">Acceptance</span>
                                <span style={{ textAlign: 'right' }}>Actions</span>
                            </div>

                            {loading ? (
                                <div style={{ padding: '5rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem' }}>
                                    <Zap size={28} style={{ marginBottom: '12px', opacity: 0.5 }} /><br />Loading high-impact questions…
                                </div>
                            ) : problems.length === 0 ? (
                                <div style={{ padding: '5rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem' }}>
                                    No questions found for this topic series yet.
                                </div>
                            ) : problems.map((p, idx) => {
                                const diff = DIFF_STYLE[p.difficulty] || DIFF_STYLE.Medium;
                                const solved = userStats?.solvedIds?.includes(String(p.id));
                                const attempting = userStats?.attemptingIds?.includes(String(p.id));

                                return (
                                    <div key={p.id} onClick={() => handleSolve(p)}
                                        className="problems-grid"
                                        style={{ borderBottom: idx < problems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <span className="id-col" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{p.id}</span>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                            {solved ? (
                                                <CheckCircle2 size={16} color="#00b8a3" style={{ flexShrink: 0 }} />
                                            ) : attempting ? (
                                                <Clock size={16} color="#ffa116" style={{ flexShrink: 0 }} />
                                            ) : <div style={{ width: 16 }} />}
                                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                                        </div>

                                        <span style={{ display: 'inline-block', width: 'fit-content', background: diff.bg, color: diff.color, fontSize: '0.75rem', fontWeight: 700, padding: '5px 12px', borderRadius: '999px', whiteSpace: 'nowrap', border: `1px solid ${diff.color}20` }}>
                                            {p.difficulty}
                                        </span>

                                        <span className="acceptance-col" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{p.acceptance_rate}%</span>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={e => { e.stopPropagation(); handleSolve(p); }}
                                                style={{ background: `linear-gradient(135deg, ${accentColor}, ${getRgba(accentColor, 0.8)})`, color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', boxShadow: `0 4px 10px ${getRgba(accentColor, 0.2)}`, transition: 'all 0.2s' }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 14px ${getRgba(accentColor, 0.3)}`; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 10px ${getRgba(accentColor, 0.2)}`; }}
                                            >
                                                Solve <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '0.5rem' }}>
                                <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: page <= 1 ? 'rgba(255,255,255,0.3)' : '#fff', cursor: page <= 1 ? 'default' : 'pointer', fontSize: '0.9rem', fontWeight: 600, opacity: page <= 1 ? 0.5 : 1, transition: 'all 0.2s' }}
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>
                                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                                    Page {page} of {totalPages}
                                </div>
                                <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: page >= totalPages ? 'rgba(255,255,255,0.3)' : '#fff', cursor: page >= totalPages ? 'default' : 'pointer', fontSize: '0.9rem', fontWeight: 600, opacity: page >= totalPages ? 0.5 : 1, transition: 'all 0.2s' }}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}

                        {/* SEO Text Details Section */}
                        <div style={{ 
                            marginTop: '2rem', padding: '2.5rem', background: 'linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(20,22,30,0.4) 100%)', 
                            border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px' 
                        }}>
                            {seoContent}
                        </div>
                    </div>
                    
                    {/* Right column */}
                    <div className="right-sidebar">
                        <DashboardRecommendations userStats={userStats} interviews={validInterviews} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Dark react-select styles
const selectStyles = {
    control: (b, s) => ({ 
        ...b, 
        background: 'rgba(255,255,255,0.04)', 
        borderColor: s.isFocused ? '#6366f1' : 'rgba(255,255,255,0.1)', 
        borderRadius: '12px', minHeight: '48px', boxShadow: s.isFocused ? '0 0 0 1px #6366f1' : 'none', 
        '&:hover': { borderColor: s.isFocused ? '#6366f1' : 'rgba(255,255,255,0.2)' },
        transition: 'all 0.2s'
    }),
    menu: b => ({ ...b, background: 'rgba(20,25,35,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', zIndex: 100, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }),
    option: (b, s) => ({ ...b, background: s.isFocused ? 'rgba(99,102,241,0.1)' : 'transparent', color: s.isFocused ? '#fff' : '#ccc', cursor: 'pointer', fontSize: '0.9rem', padding: '10px 16px' }),
    multiValue: b => ({ ...b, backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px' }),
    multiValueLabel: b => ({ ...b, color: '#e0e7ff', fontSize: '0.85rem', fontWeight: 500, padding: '4px 8px' }),
    multiValueRemove: b => ({ ...b, color: '#6366f1', cursor: 'pointer', ':hover': { backgroundColor: 'rgba(99,102,241,0.2)', color: '#fff' } }),
    input: b => ({ ...b, color: '#fff' }),
    placeholder: b => ({ ...b, color: 'rgba(255,255,255,0.3)', fontSize: '0.95rem' }),
};
