import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import NavProfile from './NavProfile';
import { useQuery } from '@tanstack/react-query';
import { fetchStats, fetchInterviews, queryKeys } from './lib/api';
import { useSEO } from './hooks/useSEO';
import DashboardRecommendations from './components/DashboardRecommendations';
import CompanyGrid from './companywisesheet/CompanyGrid';
import { top50InterviewData } from './data/top50InterviewData';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Trophy, 
  Target, 
  Zap, 
  BookOpen, 
  ChevronRight,
  Star,
  ShieldCheck,
  TrendingUp,
  Award,
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';

const DIFF_STYLE = {
    'Easy': { bg: 'rgba(0,184,163,0.12)', color: '#00b8a3' },
    'Medium': { bg: 'rgba(255,161,22,0.12)', color: '#ffa116' },
    'Hard': { bg: 'rgba(239,71,67,0.12)', color: '#ef4743' },
};

export default function Top50Interview() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;

    useSEO({
        title: 'Top 50 Interview Questions – Master Coding Interviews | Whizan AI',
        description: 'Prepare for top tech companies with our curated list of 50 high-frequency LeetCode questions. Track your progress, master DSA patterns, and ace your technical interviews.',
        canonical: '/top-50-interview-questions',
        keywords: 'top 50 leetcode questions, coding interview preparation, dsa roadmap, software engineer interview, technical interview guide, whizan ai',
        robots: 'index, follow',
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "Top 50 Technical Interview Preparation",
            "description": "Premium preparation guide for mastering Data Structures and Algorithms for top engineering roles.",
            "provider": {
                "@type": "Organization",
                "name": "Whizan AI",
                "url": "https://whizan.xyz"
            }
        }
    });

    const { data: statsResult } = useQuery({ queryKey: queryKeys.stats(uid), queryFn: () => fetchStats(uid), enabled: !!uid });
    const userStats = statsResult?.userStats ?? null;
    const { data: interviewsData } = useQuery({ queryKey: queryKeys.interviews(uid), queryFn: () => fetchInterviews(uid), enabled: !!uid });
    const validInterviews = (interviewsData || []).filter(inv => inv.overallScore || inv.scoreReport);

    const solvedIds = userStats?.solvedIds || [];
    const totalProblems = top50InterviewData.length;
    const totalSolved = top50InterviewData.filter(p => solvedIds.includes(String(p.id))).length;
    const progressPercentage = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

    return (
        <div style={{
            minHeight: '100vh', background: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.08) 0%, transparent 60%), radial-gradient(circle at 100% 100%, rgba(251, 191, 36, 0.04) 0%, transparent 50%)',
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
                    font-size: 3.5rem;
                    font-weight: 800;
                    margin: 0 0 16px 0;
                    letter-spacing: -2px;
                    text-shadow: 0 2px 20px rgba(0,0,0,0.8);
                    line-height: 1.1;
                }
                .hero-subtitle {
                    color: #888;
                    font-size: 1.1rem;
                    max-width: 700px;
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
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                }
                .problems-grid {
                    display: grid;
                    grid-template-columns: 56px 1fr 110px 100px;
                    align-items: center;
                    padding: 18px 24px;
                    transition: all 0.2s;
                }
                .problems-grid:hover:not(.header-grid) {
                    background: rgba(255,255,255,0.03);
                }
                .solve-btn {
                    background: #fbbf24;
                    color: #000;
                    border: none;
                    border-radius: 8px;
                    padding: 8px 16px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    font-weight: 700;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .solve-btn:hover {
                    background: #fcd34d;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
                }
                @media (max-width: 1024px) {
                    .company-sheet-layout { grid-template-columns: 1fr; }
                    .right-sidebar { position: static; top: auto; }
                }
                @media (max-width: 768px) {
                    .hero-title { font-size: 2.5rem !important; }
                    .problems-grid { grid-template-columns: 48px 1fr 90px !important; padding: 14px 16px !important; }
                    .actions-col { display: none; }
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
                                    background: 'transparent', color: '#888',
                                    fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent'; }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flex: '1 1 0' }}><NavProfile /></div>
            </nav>

            <div className="sheet-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <div style={{ textAlign: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ 
                            display: 'inline-block', padding: '6px 18px', borderRadius: '20px', 
                            background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)',
                            color: '#fbbf24', fontSize: '0.8rem', fontWeight: 800, marginBottom: '24px',
                            textTransform: 'uppercase', letterSpacing: '1px'
                        }}>
                            <Sparkles size={14} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}/> Premium Interview Prep
                        </div>
                        <h1 className="hero-title">
                            <span style={{ color: '#fbbf24' }}>Top 50</span>
                            <span style={{ color: '#fff' }}>{' '}Interview Questions</span>
                        </h1>
                        <p className="hero-subtitle">
                            Master the industry's most critical algorithmic patterns with our curated selection of high-frequency interview questions.
                        </p>
                    </div>
                </div>

                <div className="company-sheet-layout">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        
                        {/* Progress Overview Section */}
                        <div style={{ 
                          background: 'rgba(255,255,255,0.03)', 
                          border: '1px solid rgba(255,255,255,0.08)', 
                          borderRadius: '24px', 
                          padding: '2rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2.5rem'
                        }}>
                          <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                            <svg viewBox="0 0 36 36" style={{ width: '100px', height: '100px', transform: 'rotate(-90deg)' }}>
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray={`${progressPercentage}, 100`} />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>{progressPercentage}%</div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 700 }}>Your Roadmap Progress</h3>
                            <p style={{ margin: '0 0 16px 0', color: '#888', fontSize: '0.9rem' }}>You've mastered {totalSolved} out of {totalProblems} core patterns. Keep pushing to reach elite status.</p>
                            <div style={{ display: 'flex', gap: '2rem' }}>
                              <div><div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', textTransform: 'uppercase' }}>Solved</div><div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4ade80' }}>{totalSolved}</div></div>
                              <div><div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', textTransform: 'uppercase' }}>Remaining</div><div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{totalProblems - totalSolved}</div></div>
                              <div><div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', textTransform: 'uppercase' }}>Status</div><div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fbbf24' }}>{progressPercentage > 50 ? 'Advanced' : 'Prodigy'}</div></div>
                            </div>
                          </div>
                        </div>

                        <div className="problems-container">
                            <div className="problems-grid header-grid" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#555', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <span>#</span><span>Problem Title</span><span>Difficulty</span><span style={{ textAlign: 'right' }}>Actions</span>
                            </div>
                            {top50InterviewData.map((p, idx) => {
                                const isSolved = solvedIds.includes(String(p.id));
                                return (
                                  <div key={p.id} onClick={() => navigate(`/solvingpage/${p.id}`)} className="problems-grid" style={{ borderBottom: idx < top50InterviewData.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer' }}>
                                      <span style={{ color: isSolved ? '#4ade80' : '#444', fontWeight: 800 }}>{idx + 1}</span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {isSolved && <CheckCircle2 size={16} color="#4ade80" />}
                                        <span style={{ fontWeight: 600, color: isSolved ? '#fff' : '#ddd' }}>{p.title}</span>
                                      </div>
                                      <span style={{ 
                                        background: (DIFF_STYLE[p.difficulty] || DIFF_STYLE.Medium).bg, 
                                        color: (DIFF_STYLE[p.difficulty] || DIFF_STYLE.Medium).color, 
                                        fontSize: '0.7rem', padding: '4px 10px', borderRadius: '6px', 
                                        width: 'fit-content', fontWeight: 800, textTransform: 'uppercase' 
                                      }}>{p.difficulty}</span>
                                      <div style={{ display: 'flex', justifyContent: 'flex-end' }} className="actions-col">
                                          <button className="solve-btn">Solve</button>
                                      </div>
                                  </div>
                                );
                            })}
                        </div>
                        
                        <CompanyGrid />

                        {/* SEO Authority Content */}
                        <article style={{ color: '#aaa', lineHeight: 1.8, fontSize: '1.05rem', marginTop: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px' }}>
                            <h2 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 800, marginBottom: '2rem', letterSpacing: '-1px' }}>Mastering Technical Interviews: The Value of the Top 50</h2>
                            
                            <p style={{ marginBottom: '1.5rem' }}>
                                Success in coding interviews at companies like Tesla, Google, or Amazon isn't about memorizing solutions—it's about internalizing problem-solving patterns. This list of the <strong>Top 50 Interview Questions</strong> represents the distilled essence of software engineering algorithms. From array manipulation to complex graph traversals, these problems cover the entire spectrum of what top-tier firms expect from candidates.
                            </p>

                            <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem' }}>Efficiency Driven Preparation</h3>
                            <p style={{ marginBottom: '1.5rem' }}>
                                Most candidates waste hundreds of hours solving random problems. The Top 50 approach is different. It focuses on high-impact questions that teach you one or more core concepts. For example, solving <em>Two Sum</em> isn't just about an array; it's your introduction to the hash map optimization pattern. Master these, and you master the tools needed to solve thousands of other problems.
                            </p>

                            <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '1rem' }}>Pattern Breakdown</h3>
                            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyleType: 'square' }}>
                                <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fbbf24' }}>Two Pointers & Sliding Window:</strong> Crucial for linear data structures where efficiency is key.</li>
                                <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fbbf24' }}>Binary Search:</strong> The ultimate tool for O(log N) complexity in sorted datasets.</li>
                                <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fbbf24' }}>Dynamic Programming:</strong> Mastering sub-problem optimization for complex recursive tasks.</li>
                                <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#fbbf24' }}>Graph Algorithms:</strong> Understanding network connectivity and shortest paths (BFS/DFS).</li>
                            </ul>

                            <p style={{ marginBottom: '1.5rem' }}>
                                By utilizing Whizan AI's integrated solver and progress tracker, you can measure your growth daily. This roadmap isn't just a list; it's a proven path to securing your next senior or lead engineering role. Take the first step today by completing the first 5 easy problems and building your momentum.
                            </p>
                        </article>
                    </div>

                    <div className="right-sidebar">
                      <DashboardRecommendations 
                        userStats={userStats} 
                        interviews={validInterviews} 
                      />
                      
                      <div style={{ 
                        marginTop: '2rem', 
                        padding: '1.5rem', 
                        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), transparent)', 
                        border: '1px solid rgba(251, 191, 36, 0.2)', 
                        borderRadius: '20px' 
                      }}>
                        <Award size={24} color="#fbbf24" style={{ marginBottom: '1rem' }} />
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 700 }}>Exclusive Access</h4>
                        <p style={{ margin: 0, color: '#888', fontSize: '0.85rem', lineHeight: 1.5 }}>You are currently viewing the VIP curated list. Members get access to detailed video solutions and AI-powered step-by-step hints.</p>
                      </div>
                    </div>
                </div>
            </div>
            
            <footer style={{ marginTop: '6rem', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '4rem 2rem', textAlign: 'center', color: '#444', fontSize: '0.9rem' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                  <span style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#888'} onMouseLeave={e => e.currentTarget.style.color = '#444'}>Privacy Policy</span>
                  <span style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#888'} onMouseLeave={e => e.currentTarget.style.color = '#444'}>Terms of Service</span>
                  <span style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#888'} onMouseLeave={e => e.currentTarget.style.color = '#444'}>Contact Support</span>
                </div>
                <p>© 2026 Whizan AI. The ultimate destination for engineering excellence. Build your future today.</p>
              </div>
            </footer>
        </div>
    );
}

const selectStyles = {
    control: (b, s) => ({ ...b, background: 'rgba(255,255,255,0.04)', borderColor: s.isFocused ? '#fbbf24' : 'rgba(255,255,255,0.15)', borderRadius: '12px', boxShadow: 'none' }),
    menu: b => ({ ...b, background: 'rgba(20,25,35,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }),
};
