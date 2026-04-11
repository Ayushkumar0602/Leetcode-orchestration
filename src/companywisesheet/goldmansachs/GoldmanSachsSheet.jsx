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

export default function GoldmanSachsSheet() {
    const navigate = useNavigate();
    const { page: pageParam } = useParams();
    const page = parseInt(pageParam) || 1;
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;

    useSEO({
        title: 'Goldman Sachs Interview Questions & Technical Prep | Whizan AI',
        description: 'Vetted list of Goldman Sachs software engineer interview questions. Master Goldman Sachs technical rounds with curated Leetcode DSA problems.',
        canonical: '/company/goldmansachs',
        keywords: 'Goldman Sachs software engineer interview questions, Goldman Sachs DSA prep, Goldman Sachs leetcode questions, Goldman Sachs interview roadmap, technical coding',
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "Goldman Sachs Technical Interview Preparation",
            "description": "Premium preparation roadmap for mastering Data Structures and Algorithms for Goldman Sachs software engineering roles.",
            "provider": { "@type": "Organization", "name": "Whizan AI", "sameAs": "https://whizan.xyz" },
            "url": "https://whizan.xyz/company/goldmansachs"
        }
    });

    const [selectedTopics, setSelectedTopics] = useState([]);
    const { data: metadata = { topics: [], companies: [] } } = useQuery({ queryKey: queryKeys.metadata(), queryFn: fetchMetadata });
    const { data: statsResult } = useQuery({ queryKey: queryKeys.stats(uid), queryFn: () => fetchStats(uid), enabled: !!uid });
    const userStats = statsResult?.userStats ?? null;
    const { data: interviewsData } = useQuery({ queryKey: queryKeys.interviews(uid), queryFn: () => fetchInterviews(uid), enabled: !!uid });
    const validInterviews = (interviewsData || []).filter(inv => inv.overallScore || inv.scoreReport);

    const problemParams = { page, search: '', topics: selectedTopics.map(t => t.value), companies: ['Goldman Sachs'] };
    const { data: problemsData, isLoading: loading } = useQuery({
        queryKey: ['problems-goldmansachs', problemParams],
        queryFn: () => fetchProblems(problemParams),
        staleTime: 1000 * 60 * 60 * 24,
        keepPreviousData: true,
    });

    const problems = problemsData?.problems ?? [];
    const totalPages = problemsData?.totalPages ?? 1;

    const handleSolve = (p) => navigate(`/solvingpage/${p.id}`, {
        state: { problemParams: { id: p.id, title: p.title, description: p.description, difficulty: p.difficulty, language: 'python' } }
    });

    const handlePageChange = (n) => { if (n >= 1 && n <= totalPages) navigate(`/company/goldmansachs/${n}`); };

    return (
        <div style={{
            minHeight: '100vh', background: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(115, 153, 198, 0.08) 0%, transparent 60%), radial-gradient(circle at 100% 100%, rgba(115, 153, 198, 0.04) 0%, transparent 50%)',
            color: '#fff', fontFamily: "'Inter', sans-serif", paddingBottom: '4rem'
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
                position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: '1 1 0' }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="Logo" style={{ height: '32px', width: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Whizan AI</span>
                </div>
                <div style={{ flex: 'auto', display: 'flex', justifyContent: 'center' }}>
                    <div className="pl-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flex: '1 1 0' }}><NavProfile /></div>
            </nav>

            <div className="sheet-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(115, 153, 198, 0.2) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ 
                            display: 'inline-block', padding: '6px 16px', borderRadius: '20px', 
                            background: 'rgba(115, 153, 198, 0.15)', border: '1px solid rgba(115, 153, 198, 0.4)',
                            color: '#e0f2fe', fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px'
                        }}>
                            <Building2 size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }}/> Premium Goldman Sachs Prep
                        </div>
                        <h1 className="hero-title">
                            <span style={{ color: '#7399C6' }}>Goldman Sachs</span>
                            <span style={{ color: '#fff' }}>{' '}Interview Questions</span>
                        </h1>
                        <p className="hero-subtitle">
                            Excel in Goldman Sachs engineering loops with our curated Data Structures and Algorithms collection.
                        </p>
                    </div>
                </div>

                <div className="company-sheet-layout">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <Select isMulti options={metadata.topics} value={selectedTopics} onChange={sel => { setSelectedTopics(sel || []); navigate('/company/goldmansachs/1'); }} placeholder="Filter by Topics…" styles={selectStyles} />
                        <div className="problems-container">
                            <div className="problems-grid" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--txt3)', fontSize: '0.75rem', fontWeight: 600 }}>
                                <span className="id-col">#</span><span>Problem Title</span><span>Difficulty</span><span className="acceptance-col">Acceptance</span><span style={{ textAlign: 'right' }}>Actions</span>
                            </div>
                            {loading ? <div style={{ padding: '5rem', textAlign: 'center' }}>Loading Goldman Sachs questions…</div> : problems.map((p, idx) => (
                                <div key={p.id} onClick={() => handleSolve(p)} className="problems-grid" style={{ borderBottom: idx < problems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer' }}>
                                    <span className="id-col" style={{ color: 'var(--txt3)' }}>{p.id}</span>
                                    <span style={{ fontWeight: 600 }}>{p.title}</span>
                                    <span style={{ background: (DIFF_STYLE[p.difficulty] || DIFF_STYLE.Medium).bg, color: (DIFF_STYLE[p.difficulty] || DIFF_STYLE.Medium).color, fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px', width: 'fit-content' }}>{p.difficulty}</span>
                                    <span className="acceptance-col">{p.acceptance_rate}%</span>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button style={{ background: '#7399C6', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Solve</button>
                                    </div>
                                </div>
                            ))}
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
    control: (b, s) => ({ ...b, background: 'rgba(255,255,255,0.04)', borderColor: s.isFocused ? '#7399C6' : 'rgba(255,255,255,0.15)', borderRadius: '12px' }),
    menu: b => ({ ...b, background: 'rgba(20,25,35,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }),
};
