import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import NavProfile from './NavProfile';
import { useQuery } from '@tanstack/react-query';
import { fetchStats, fetchInterviews, queryKeys } from './lib/api';
import { useSEO } from './hooks/useSEO';
import DashboardRecommendations from './components/DashboardRecommendations';
import CompanyGrid from './companywisesheet/CompanyGrid';
import { striverSDESheetData } from './data/striverSDESheetData';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Trophy, 
  Target, 
  Zap, 
  BookOpen, 
  ChevronDown,
  ChevronUp,
  Star,
  ShieldCheck,
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  Layout
} from 'lucide-react';

const DIFF_STYLE = {
    'Easy': { bg: 'rgba(0,184,163,0.12)', color: '#00b8a3' },
    'Medium': { bg: 'rgba(255,161,22,0.12)', color: '#ffa116' },
    'Hard': { bg: 'rgba(239,71,67,0.12)', color: '#ef4743' },
};

export default function StriverSDESheet() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;
    const [expandedDays, setExpandedDays] = useState([1]); // Default open Day 1

    useSEO({
        title: "Striver's SDE Sheet – Complete Placement Roadmap | Whizan AI",
        description: 'Master Data Structures and Algorithms with the legendary Striver SDE Sheet. 180+ curated problems across 30 days to ace MAANG interviews. Track your progress with Whizan AI.',
        canonical: '/striver-sde-sheet',
        keywords: 'striver sde sheet, striver dsa sheet, sde placement roadmap, coding interview questions, whizan ai sde prep',
        robots: 'index, follow',
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "Striver SDE Sheet Mastery",
            "description": "Comprehensive 30-day roadmap for software engineering interviews.",
            "provider": { "@type": "Organization", "name": "Whizan AI", "url": "https://whizan.xyz" }
        }
    });

    const { data: statsResult } = useQuery({ queryKey: queryKeys.stats(uid), queryFn: () => fetchStats(uid), enabled: !!uid });
    const userStats = statsResult?.userStats ?? null;
    const { data: interviewsData } = useQuery({ queryKey: queryKeys.interviews(uid), queryFn: () => fetchInterviews(uid), enabled: !!uid });
    const validInterviews = (interviewsData || []).filter(inv => inv.overallScore || inv.scoreReport);

    const solvedIds = userStats?.solvedIds || [];
    const totalProblems = striverSDESheetData.reduce((acc, day) => acc + day.problems.length, 0);
    const totalSolved = striverSDESheetData.reduce((acc, day) => {
        return acc + day.problems.filter(p => solvedIds.includes(String(p.id))).length;
    }, 0);
    const progressPercentage = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

    const toggleDay = (day) => {
        setExpandedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 60%), radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.04) 0%, transparent 50%)',
            color: '#fff', fontFamily: "'Inter', sans-serif", paddingBottom: '4rem'
        }}>
            <style>{`
                .striver-layout {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 350px;
                    gap: 2.5rem;
                    align-items: start;
                }
                .hero-title {
                    font-size: 3.5rem; font-weight: 800; margin-bottom: 16px; letter-spacing: -2px; line-height: 1.1;
                }
                .day-card {
                    background: rgba(15,15,20,0.6);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px;
                    margin-bottom: 20px; overflow: hidden;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .day-card.expanded {
                  border-color: rgba(59, 130, 246, 0.3);
                  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                .day-header {
                    padding: 20px 24px; cursor: pointer; display: flex; align-items: center; justify-content: space-between;
                    background: rgba(255,255,255,0.01);
                }
                .day-header:hover { background: rgba(255,255,255,0.03); }
                .problem-row {
                    display: grid; grid-template-columns: 48px 1fr 100px 100px; align-items: center;
                    padding: 14px 24px; border-top: 1px solid rgba(255,255,255,0.05); transition: background 0.15s;
                }
                .problem-row:hover { background: rgba(255,255,255,0.02); }
                .solve-btn {
                    background: #3b82f6; color: #fff; border: none; border-radius: 8px;
                    padding: 6px 14px; cursor: pointer; fontSize: 0.8rem; fontWeight: 700;
                    transition: all 0.2s;
                }
                .solve-btn:hover { background: #2563eb; transform: translateY(-1px); }
                @media (max-width: 1024px) { .striver-layout { grid-template-columns: 1fr; } }
            `}</style>

            <nav style={{
                position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: '1 1 0' }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="Logo" style={{ height: '32px', width: '32px', borderRadius: '8px' }} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Whizan AI</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flex: '1 1 0' }}><NavProfile /></div>
            </nav>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem' }}>
                <div style={{ textAlign: 'center', position: 'relative', marginBottom: '4rem' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', padding: '6px 18px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '24px', display: 'inline-block' }}>
                          <Layout size={14} style={{ display: 'inline', marginRight: '8px' }}/> Placement Essential
                        </div>
                        <h1 className="hero-title">Striver <span style={{ color: '#3b82f6' }}>SDE Sheet</span></h1>
                        <p style={{ color: '#888', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                          Master 180+ Data Structures and Algorithms problems curated by Striver. The gold standard roadmap practiced by thousands of engineers to land MAANG roles.
                        </p>
                    </div>
                </div>

                <div className="striver-layout">
                    <div>
                        {/* Global Progress Bar */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2rem', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                            <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
                              <svg viewBox="0 0 36 36" style={{ width: '90px', height: '90px', transform: 'rotate(-90deg)' }}>
                                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                <circle cx="18" cy="18" r="16" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray={`${progressPercentage}, 100`} />
                              </svg>
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{progressPercentage}%</div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: 700 }}>Overall Sheet Maturity</h3>
                              <p style={{ margin: '0 0 16px 0', color: '#888', fontSize: '0.9rem' }}>You've solved {totalSolved} out of {totalProblems} core problems. Consistently practicing 6 questions a day will complete the sheet in 30 days.</p>
                              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${progressPercentage}%`, height: '100%', background: '#3b82f6', transition: 'width 1s' }} />
                              </div>
                            </div>
                        </div>

                        {striverSDESheetData.map((dayData) => {
                            const isExpanded = expandedDays.includes(dayData.day);
                            const solvedInDay = dayData.problems.filter(p => solvedIds.includes(String(p.id))).length;
                            const totalInDay = dayData.problems.length;
                            
                            return (
                                <div key={dayData.day} className={`day-card ${isExpanded ? 'expanded' : ''}`}>
                                    <div className="day-header" onClick={() => toggleDay(dayData.day)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                                                {dayData.day.toString().padStart(2, '0')}
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{dayData.topic}</h3>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>{solvedInDay} / {totalInDay} Problems Solved</p>
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronUp size={20} color="#444" /> : <ChevronDown size={20} color="#444" />}
                                    </div>
                                    {isExpanded && (
                                        <div style={{ background: 'rgba(0,0,0,0.2)' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 100px 100px', padding: '12px 24px', fontSize: '0.7rem', fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                <span>#</span><span>Title</span><span>Difficulty</span><span style={{ textAlign: 'right' }}>Action</span>
                                            </div>
                                            {dayData.problems.map((p, idx) => {
                                                const isSolved = solvedIds.includes(String(p.id));
                                                return (
                                                    <div key={p.id} className="problem-row" onClick={() => navigate(`/solvingpage/${p.id}`)}>
                                                        <span style={{ color: isSolved ? '#10b981' : '#333', fontWeight: 800 }}>{idx + 1}</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            {isSolved && <CheckCircle2 size={14} color="#10b981" />}
                                                            <span style={{ fontWeight: 600, color: isSolved ? '#fff' : '#ddd' }}>{p.title}</span>
                                                        </div>
                                                        <span style={{ 
                                                            fontSize: '0.7rem', fontWeight: 800, 
                                                            color: DIFF_STYLE[p.difficulty].color,
                                                            background: DIFF_STYLE[p.difficulty].bg,
                                                            padding: '4px 8px', borderRadius: '4px', width: 'fit-content'
                                                        }}>{p.difficulty}</span>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <button className="solve-btn">Solve</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <CompanyGrid />

                        {/* SEO Authority Content */}
                        <article style={{ marginTop: '5rem', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', color: '#aaa', lineHeight: 1.8 }}>
                            <h2 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 800, marginBottom: '2rem' }}>Definitive Striver SDE Sheet Preparation Strategy</h2>
                            <p style={{ marginBottom: '1.5rem' }}>
                                The **Striver SDE Sheet** is widely recognized as one of the most effective resources for students and professionals aiming for software engineering roles in top product-based companies. Curated by Raj Vikramaditya (Striver), this list of ~190 problems isn't just a collection of code—it's a comprehensive architectural tour of computer science fundamentals.
                            </p>
                            
                            <h3 style={{ color: '#3b82f6', fontSize: '1.6rem', fontWeight: 800, marginTop: '3rem', marginBottom: '1.5rem' }}>Core Value Pillars</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                              <li style={{ marginBottom: '2rem' }}>
                                <strong style={{ color: '#fff', fontSize: '1.2rem', display: 'block', marginBottom: '8px' }}>1. Pattern Coverage</strong>
                                By solving these specific problems, you aren't just memorizing one solution; you're learning patterns like **Sliding Window**, **Two Pointers**, **Dynamic Programming**, and **Backtracking** that apply to hundreds of other variations.
                              </li>
                              <li style={{ marginBottom: '2rem' }}>
                                <strong style={{ color: '#fff', fontSize: '1.2rem', display: 'block', marginBottom: '8px' }}>2. Interview Relevance</strong>
                                These 180+ questions have been chosen because of their high frequency in actual interview loops at Meta, Amazon, Apple, and Google. They represent the "table stakes" of modern software engineering interviews.
                              </li>
                              <li style={{ marginBottom: '2rem' }}>
                                <strong style={{ color: '#fff', fontSize: '1.2rem', display: 'block', marginBottom: '8px' }}>3. Structured Progression</strong>
                                The 30-day schedule helps you manage cognitive load. You start with fundamental array concepts and gradually move into complex Graph Theory and Dynamic Programming, ensuring a solid foundation at every step.
                              </li>
                            </ul>

                            <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, marginTop: '3rem', marginBottom: '1.5rem' }}>Maximize Your Success</h3>
                            <p style={{ marginBottom: '1.5rem' }}>
                              To get the most out of this sheet on **Whizan AI**, we recommend solving each problem without looking at the optimal solution for at least 30 minutes. Use our internal code editor and debugger to step through your logic. If you get stuck, move to the next problem and return later—this "spaced repetition" helps solidify complex algorithms in your long-term memory.
                            </p>
                        </article>
                    </div>

                    <div className="right-sidebar">
                        <DashboardRecommendations userStats={userStats} interviews={validInterviews} />
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '20px' }}>
                            <Sparkles size={24} color="#3b82f6" style={{ marginBottom: '1rem' }} />
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 700 }}>AI Pairing</h4>
                            <p style={{ margin: 0, color: '#888', fontSize: '0.85rem', lineHeight: 1.5 }}>Use our AI co-pilot within the solving page to get optimized code explanations and complexity analysis as you work through the Striver roadmap.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const selectStyles = {
    control: (b, s) => ({ ...b, background: 'rgba(255,255,255,0.04)', borderColor: s.isFocused ? '#3b82f6' : 'rgba(255,255,255,0.15)', borderRadius: '12px' }),
    menu: b => ({ ...b, background: 'rgba(20,25,35,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }),
};
