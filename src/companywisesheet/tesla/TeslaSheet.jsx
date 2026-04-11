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

export default function TeslaSheet() {
    const navigate = useNavigate();
    const { page: pageParam } = useParams();
    const page = parseInt(pageParam) || 1;
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;

    useSEO({
        title: 'Tesla Interview Questions & Technical Prep Guide | Whizan AI',
        description: 'Vetted list of Tesla software engineer interview questions. Master Tesla technical rounds with curated Tesla Leetcode DSA questions.',
        canonical: '/company/tesla',
        keywords: 'Tesla software engineer interview questions, Tesla DSA prep, Tesla leetcode questions, Tesla interview roadmap, Tesla technical coding',
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "Tesla Technical Interview Preparation",
            "description": "Premium preparation guide for mastering Data Structures and Algorithms for Tesla software engineering roles.",
            "provider": {
                "@type": "Organization",
                "name": "Whizan AI",
                "sameAs": "https://whizan.xyz"
            },
            "url": "https://whizan.xyz/company/tesla"
        }
    });

    const [selectedTopics, setSelectedTopics] = useState([]);
    const { data: metadata = { topics: [], companies: [] } } = useQuery({ queryKey: queryKeys.metadata(), queryFn: fetchMetadata });
    const { data: statsResult } = useQuery({ queryKey: queryKeys.stats(uid), queryFn: () => fetchStats(uid), enabled: !!uid });
    const userStats = statsResult?.userStats ?? null;
    const { data: interviewsData } = useQuery({ queryKey: queryKeys.interviews(uid), queryFn: () => fetchInterviews(uid), enabled: !!uid });
    const validInterviews = (interviewsData || []).filter(inv => inv.overallScore || inv.scoreReport);

    const problemParams = { page, search: '', topics: selectedTopics.map(t => t.value), companies: ['Tesla'] };
    const { data: problemsData, isLoading: loading } = useQuery({
        queryKey: ['problems-tesla', problemParams],
        queryFn: () => fetchProblems(problemParams),
        staleTime: 1000 * 60 * 60 * 24,
        keepPreviousData: true,
    });

    const problems = problemsData?.problems ?? [];
    const totalPages = problemsData?.totalPages ?? 1;

    const handleSolve = (p) => navigate(`/solvingpage/${p.id}`, {
        state: { problemParams: { id: p.id, title: p.title, description: p.description, difficulty: p.difficulty, language: 'python' } }
    });

    const handlePageChange = (n) => { if (n >= 1 && n <= totalPages) navigate(`/company/tesla/${n}`); };

    return (
        <div style={{
            minHeight: '100vh', background: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(204, 0, 0, 0.08) 0%, transparent 60%), radial-gradient(circle at 100% 100%, rgba(204, 0, 0, 0.04) 0%, transparent 50%)',
            color: '#fff', fontFamily: "'Inter', sans-serif", paddingBottom: '4rem'
        }}>
            <style>{`
                .company-sheet-layout { display: grid; grid-template-columns: minmax(0, 1fr) 350px; gap: 2.5rem; align-items: start; }
                .right-sidebar { position: sticky; top: 100px; }
                @media (max-width: 1024px) { .company-sheet-layout { grid-template-columns: 1fr; } .right-sidebar { position: static; top: auto; } }
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px' }}>
                        {['Problems', 'DSA Interview', 'System Design', 'My Submissions'].map(label => (
                            <button key={label} onClick={() => navigate(label === 'Problems' ? '/dsaquestion' : label === 'DSA Interview' ? '/aiinterview' : label === 'System Design' ? '/systemdesign' : '/submissions')}
                                style={{ padding: '6px 14px', borderRadius: '7px', border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>{label}</button>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flex: '1 1 0' }}><NavProfile /></div>
            </nav>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(204, 0, 0, 0.2) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ 
                            display: 'inline-block', padding: '6px 16px', borderRadius: '20px', 
                            background: 'rgba(204, 0, 0, 0.15)', border: '1px solid rgba(204, 0, 0, 0.4)',
                            color: '#fee2e2', fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px'
                        }}>
                            <Building2 size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }}/> Tesla SDE Preparation
                        </div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 16px 0', letterSpacing: '-1.5px' }}>
                            <span style={{ color: '#CC0000' }}>Tesla</span> Interview Questions
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
                            Master the most frequently asked Data Structures and Algorithms questions for Tesla's rigorous technical rounds.
                        </p>
                    </div>
                </div>

                <div className="company-sheet-layout">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <Select isMulti options={metadata.topics} value={selectedTopics} onChange={sel => { setSelectedTopics(sel || []); navigate('/company/tesla/1'); }} placeholder="Filter by Topics…" styles={selectStyles} />
                        <div style={{ background: 'rgba(15,15,20,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 100px 90px 110px', padding: '16px 24px', background: 'rgba(255,255,255,0.03)', color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
                                <span>#</span><span>Problem Title</span><span>Difficulty</span><span>Acceptance</span><span style={{ textAlign: 'right' }}>Actions</span>
                            </div>
                            {loading ? <div style={{ padding: '5rem', textAlign: 'center' }}>Loading Tesla questions…</div> : problems.map((p, idx) => (
                                <div key={p.id} onClick={() => handleSolve(p)} style={{ display: 'grid', gridTemplateColumns: '56px 1fr 100px 90px 110px', alignItems: 'center', padding: '18px 24px', borderBottom: idx < problems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer' }}>
                                    <span style={{ color: '#64748b' }}>{p.id}</span>
                                    <span style={{ fontWeight: 600 }}>{p.title}</span>
                                    <span style={{ background: (DIFF_STYLE[p.difficulty] || DIFF_STYLE.Medium).bg, color: (DIFF_STYLE[p.difficulty] || DIFF_STYLE.Medium).color, fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px' }}>{p.difficulty}</span>
                                    <span>{p.acceptance_rate}%</span>
                                    <button style={{ background: '#CC0000', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }}>Solve</button>
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
    control: (b, s) => ({ ...b, background: 'rgba(255,255,255,0.04)', borderColor: s.isFocused ? '#CC0000' : 'rgba(255,255,255,0.15)', borderRadius: '12px' }),
    menu: b => ({ ...b, background: 'rgba(20,25,35,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }),
};
