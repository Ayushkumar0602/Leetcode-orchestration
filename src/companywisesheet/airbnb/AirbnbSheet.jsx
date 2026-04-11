import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Zap, ArrowRight, Building2 } from 'lucide-react';
import Select from 'react-select';
import { useAuth } from '../../contexts/AuthContext';
import NavProfile from '../../NavProfile';
import { useQuery } from '@tanstack/react-query';
import { fetchMetadata, fetchStats, fetchProblems, fetchInterviews, queryKeys } from '../../lib/api';
import { useSEO } from '../../hooks/useSEO';
import DashboardRecommendations from '../../components/DashboardRecommendations';
import CompanyGrid from '../CompanyGrid';

const DIFF_STYLE = {
    'Easy': { bg: 'rgba(0,184,163,0.12)', color: '#00b8a3' },
    'Medium': { bg: 'rgba(255,161,22,0.12)', color: '#ffa116' },
    'Hard': { bg: 'rgba(239,71,67,0.12)', color: '#ef4743' },
};

export default function AirbnbSheet() {
    const navigate = useNavigate();
    const { page: pageParam } = useParams();
    const page = parseInt(pageParam) || 1;
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;

    useSEO({
        title: 'Airbnb Interview Questions & DSA Prep Roadmap | Whizan AI',
        description: 'Prepare for Airbnb software engineering interviews with curated Airbnb Leetcode questions. Master Airbnb DSA syllabus, distributed systems concepts, and marketplace engineering challenges.',
        canonical: '/company/airbnb',
        keywords: 'Airbnb software engineer interview questions, Airbnb DSA prep, Airbnb leetcode questions, Airbnb SDE roadmap, Airbnb technical coding rounds',
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "Airbnb Technical Interview Preparation",
            "description": "Comprehensive roadmap for mastering Data Structures and Algorithms specifically for Airbnb technical interviews.",
            "provider": {
                "@type": "Organization",
                "name": "Whizan AI",
                "sameAs": "https://whizan.xyz"
            },
            "url": "https://whizan.xyz/company/airbnb"
        }
    });

    const [selectedTopics, setSelectedTopics] = useState([]);
    
    const { data: metadata = { topics: [], companies: [] } } = useQuery({
        queryKey: queryKeys.metadata(),
        queryFn: fetchMetadata,
        staleTime: 1000 * 60 * 60 * 24,
    });

    const { data: statsResult } = useQuery({
        queryKey: queryKeys.stats(uid),
        queryFn: () => fetchStats(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 5,
    });
    const userStats = statsResult?.userStats ?? null;

    const { data: interviewsData } = useQuery({
        queryKey: queryKeys.interviews(uid),
        queryFn: () => fetchInterviews(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 3,
    });
    const validInterviews = (interviewsData || []).filter(inv => inv.overallScore || inv.scoreReport);

    const problemParams = {
        page,
        search: '',
        topics: selectedTopics.map(t => t.value),
        companies: ['Airbnb'],
    };

    const { data: problemsData, isLoading: loading } = useQuery({
        queryKey: ['problems-airbnb', problemParams],
        queryFn: () => fetchProblems(problemParams),
        staleTime: 1000 * 60 * 60 * 24,
        keepPreviousData: true,
    });

    const problems = problemsData?.problems ?? [];
    const totalPages = problemsData?.totalPages ?? 1;

    const handleSolve = (p) => navigate(`/solvingpage/${p.id}`, {
        state: { problemParams: { id: p.id, title: p.title, description: p.description, difficulty: p.difficulty, language: 'python' } }
    });

    const handlePageChange = (n) => { 
        if (n >= 1 && n <= totalPages) navigate(`/company/airbnb/${n}`); 
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255, 90, 95, 0.08) 0%, transparent 60%), radial-gradient(circle at 100% 100%, rgba(255, 90, 95, 0.04) 0%, transparent 50%)',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            paddingBottom: '4rem'
        }}>
            <style>{`
                .company-sheet-layout {
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
                    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
                    line-height: 1.1;
                }
                .hero-subtitle {
                    color: var(--txt2);
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
                    borderRadius: 20px;
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
                    .company-sheet-layout {
                        grid-template-columns: 1fr;
                    }
                    .right-sidebar {
                        position: static;
                        top: auto;
                    }
                }
                @media (max-width: 768px) {
                    .hero-title { font-size: 2.2rem !important; }
                    .hero-subtitle { font-size: 0.95rem !important; }
                    .problems-grid { 
                        grid-template-columns: 48px 1fr 90px 100px !important; 
                        padding: 14px 16px !important;
                    }
                    .acceptance-col { display: none; }
                    .sheet-content { padding: 2rem 1rem !important; }
                }
                @media (max-width: 480px) {
                    .hero-title { font-size: 1.8rem !important; }
                    .problems-grid { 
                        grid-template-columns: 1fr 80px 90px !important; 
                    }
                    .id-col { display: none; }
                }
            `}</style>
            
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
                        ].map(item => (
                            <button key={item.label} onClick={() => navigate(item.path)}
                                style={{
                                    padding: '6px 14px', borderRadius: '7px', border: 'none',
                                    background: 'transparent', color: 'var(--txt3)',
                                    fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--txt3)'; e.currentTarget.style.background = 'transparent'; }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flex: '1 1 0' }}>
                    <NavProfile />
                </div>
            </nav>

            <div className="sheet-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '1rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255, 90, 95, 0.2) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ 
                            display: 'inline-block', padding: '6px 16px', borderRadius: '20px', 
                            background: 'rgba(255, 90, 95, 0.15)', border: '1px solid rgba(255, 90, 95, 0.4)',
                            color: '#fff7ed', fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px',
                            boxShadow: '0 4px 14px rgba(255, 90, 95, 0.2)'
                        }}>
                            <Building2 size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle', marginTop: '-2px' }}/>
                            Airbnb Interview Prep
                        </div>
                        <h1 className="hero-title">
                            <span style={{ color: '#FF5A5F' }}>Airbnb</span>
                            <span style={{ color: '#fff' }}>{' '}Interview Questions</span>
                        </h1>
                        <p className="hero-subtitle">
                            Master the most frequently asked Data Structures and Algorithms questions for Airbnb SDE interviews.
                        </p>
                    </div>
                </div>

                <div className="company-sheet-layout">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                            <div style={{ flex: '1 1 300px', maxWidth: '100%' }}>
                                <Select 
                                    isMulti options={metadata.topics} value={selectedTopics}
                                    onChange={sel => { setSelectedTopics(sel || []); navigate('/company/airbnb/1'); }}
                                    placeholder="Filter by Topics (e.g. Array, Graphs)…" 
                                    styles={selectStyles} 
                                />
                            </div>
                        </div>

                        <div className="problems-container">
                            <div className="problems-grid" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                <span className="id-col">#</span><span>Problem Title</span><span>Difficulty</span><span className="acceptance-col">Acceptance</span><span style={{ textAlign: 'right' }}>Actions</span>
                            </div>

                            {loading ? (
                                <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--txt3)', fontSize: '0.95rem' }}>
                                    <Zap size={28} style={{ marginBottom: '12px', opacity: 0.5, animation: 'pulse 1.5s infinite' }} /><br />Loading Airbnb questions…
                                </div>
                            ) : problems.length === 0 ? (
                                <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--txt3)', fontSize: '0.95rem' }}>No Airbnb questions found.</div>
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
                                        <span className="id-col" style={{ fontSize: '0.85rem', color: 'var(--txt3)', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{p.id}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                            {solved ? <CheckCircle2 size={16} color="#00b8a3" style={{ flexShrink: 0 }} /> : attempting ? <Clock size={16} color="#ffa116" style={{ flexShrink: 0 }} /> : <div style={{ width: 16 }} />}
                                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                                        </div>
                                        <span style={{ display: 'inline-block', background: diff.bg, color: diff.color, fontSize: '0.75rem', fontWeight: 700, padding: '5px 12px', borderRadius: '999px', whiteSpace: 'nowrap', border: `1px solid ${diff.color}20` }}>{p.difficulty}</span>
                                        <span className="acceptance-col" style={{ fontSize: '0.9rem', color: 'var(--txt2)', fontWeight: 500 }}>{p.acceptance_rate}%</span>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                                            <button onClick={() => handleSolve(p)} style={{ background: 'linear-gradient(135deg, #FF5A5F, #ff8a8e)', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(255, 90, 95, 0.3)', transition: 'transform 0.15s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>Solve <ArrowRight size={14} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '0.5rem' }}>
                                <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: page <= 1 ? 'var(--txt3)' : '#fff', cursor: page <= 1 ? 'default' : 'pointer', opacity: page <= 1 ? 0.5 : 1 }}><ChevronLeft size={16} /> Previous</button>
                                <div style={{ fontSize: '0.9rem', color: 'var(--txt2)', fontWeight: 500 }}>Page {page} of {totalPages}</div>
                                <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: page >= totalPages ? 'var(--txt3)' : '#fff', cursor: page >= totalPages ? 'default' : 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}>Next <ChevronRight size={16} /></button>
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', padding: '2.5rem', background: 'linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(20,22,30,0.4) 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px' }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>Master Airbnb Software Engineer Interview Questions</h2>
                            <div style={{ color: 'var(--txt2)', fontSize: '0.95rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <p>Preparation for <strong>Airbnb mechanical engineering interviews</strong> (often Software) focuses on distributed systems, marketplace dynamics, and highly optimized DSA solutions. Airbnb interviewers evaluate your ability to think about scalability and reliability in a high-traffic environment.</p>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Airbnb DSA Preparation roadmap</h3>
                                <p>Expect a heavy focus on <strong>Arrays, Strings, and Graphs</strong>. Airbnb often uses scenarios involving booking logic or user behavior analysis to frame their technical challenges. Solving <strong>Airbnb Leetcode questions</strong> daily is the most efficient way to scale your problem-solving capabilities.</p>
                                <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <li>Focus on marketplace architecture—how your DSA solution fits into a larger Airbnb-scale system.</li>
                                    <li>Be prepared for iterative follow-ups—Airbnb interviewers often tweak problem constraints.</li>
                                    <li>Practice recursion and backtracking for navigating complex tree and graph data sets.</li>
                                </ul>
                            </div>
                        </div>

                        <CompanyGrid />
                    </div>
                    <div className="right-sidebar"><DashboardRecommendations userStats={userStats} interviews={validInterviews} /></div>
                </div>
            </div>
        </div>
    );
}

const selectStyles = {
    control: (b, s) => ({ ...b, background: 'rgba(255,255,255,0.04)', borderColor: s.isFocused ? '#FF5A5F' : 'rgba(255,255,255,0.15)', borderRadius: '12px', minHeight: '48px', boxShadow: s.isFocused ? '0 0 0 1px #FF5A5F' : 'none' }),
    menu: b => ({ ...b, background: 'rgba(20,25,35,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', zIndex: 100, overflow: 'hidden' }),
    option: (b, s) => ({ ...b, background: s.isFocused ? 'rgba(255, 90, 95, 0.15)' : 'transparent', color: s.isFocused ? '#fff' : '#ccc', cursor: 'pointer', fontSize: '0.9rem', padding: '10px 16px' }),
    multiValue: b => ({ ...b, backgroundColor: 'rgba(255, 90, 95, 0.15)', border: '1px solid rgba(255, 90, 95, 0.3)', borderRadius: '8px' }),
    multiValueLabel: b => ({ ...b, color: '#fff', fontSize: '0.85rem' }),
    multiValueRemove: b => ({ ...b, color: '#FF5A5F', cursor: 'pointer' }),
    input: b => ({ ...b, color: '#fff' }),
    placeholder: b => ({ ...b, color: 'var(--txt3)', fontSize: '0.95rem' }),
};
