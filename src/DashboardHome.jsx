import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import {
    Brain, Code2, Layers, TrendingUp,
    Award, Target, ArrowRight, User, ExternalLink, Menu, X, BookOpen
} from 'lucide-react';
import ActivityCalendar from './ActivityCalendar';
import NavProfile from './NavProfile';
import NotificationBell from './components/NotificationBell';
import { useQuery } from '@tanstack/react-query';
import { fetchStats, fetchInterviews, fetchProfile, queryKeys } from './lib/api';
import { useSEO } from './hooks/useSEO';

const DashboardCard = ({ title, value, subtitle, icon: Icon, color, delay }) => (
    <div style={{
        background: 'rgba(20, 22, 30, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden',
        animation: `cardAppear 0.5s ease-out ${delay}s both`,
        height: '100%',
        boxSizing: 'border-box'
    }}>
        <div style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '100px', height: '100px',
            background: color, filter: 'blur(50px)', opacity: 0.15,
            borderRadius: '50%'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600 }}>{title}</span>
            <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color
            }}>
                <Icon size={18} />
            </div>
        </div>
        <div>
            <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
            <div style={{ color: 'var(--txt3)', fontSize: '0.8rem', marginTop: '4px' }}>{subtitle}</div>
        </div>
    </div>
);

const QuickActionCard = ({ title, desc, icon: Icon, color, onClick, cta }) => (
    <div
        onClick={onClick}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = `${color}50`;
            e.currentTarget.style.boxShadow = `0 12px 32px ${color}20`;
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
        }}
        style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}
    >
        <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: `linear-gradient(135deg, ${color}20, ${color}05)`,
            border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color
        }}>
            <Icon size={24} />
        </div>
        <div>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 6px 0' }}>{title}</h3>
            <p style={{ color: 'var(--txt2)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{desc}</p>
        </div>
        <div style={{
            marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)',
            color: color, fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
        }}>
            {cta} <ArrowRight size={14} />
        </div>
    </div>
);

// ─── Responsive Styles ───
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

@keyframes cardAppear {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeScale {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}

.dash-body { font-family: 'Inter', system-ui, sans-serif; }
.dash-content { max-width: 1200px; margin: 0 auto; padding: 3rem 2rem; }
.dash-header h1 { font-size: 2.5rem; }
.dash-header p { font-size: 1.1rem; }

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-bottom: 3rem;
}
.problems-card {
    grid-column: span 2;
}
.actions-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
}
.nav-logo-text { display: inline; }
.nav-profile-label { display: inline; }

/* Tablet */
@media (max-width: 1024px) {
    .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .problems-card {
        grid-column: span 2;
    }
    .actions-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Mobile */
@media (max-width: 768px) {
    .dash-content { padding: 1.5rem 1rem; }
    .dash-header h1 { font-size: 1.75rem !important; }
    .dash-header p { font-size: 0.95rem !important; }
    .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
    .problems-card {
        grid-column: span 2;
    }
    .actions-grid {
        grid-template-columns: 1fr;
    }
}

/* Small mobile */
@media (max-width: 480px) {
    .dash-content { padding: 1rem 0.75rem; }
    .dash-header h1 { font-size: 1.4rem !important; }
    .metrics-grid {
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
    }
    .problems-card {
        grid-column: span 2;
    }
    .nav-logo-text { display: none; }
    .nav-profile-label { display: none; }
    .actions-grid { gap: 1rem; }
    .dash-nav-links { display: none !important; }
    .dash-featured-inner { flex-direction: column !important; align-items: flex-start !important; }
    .mobile-nav-toggle { display: flex !important; }
}

.mobile-nav-overlay {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(5,5,5,0.95);
    backdrop-filter: blur(20px);
    z-index: 99;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.mobile-nav-link {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1.2rem;
    font-weight: 600;
    text-align: left;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
}

/* Extra small */
@media (max-width: 400px) {
    .dash-header h1 { font-size: 1.2rem !important; }
    .metrics-grid { grid-template-columns: 1fr !important; }
    .problems-card { grid-column: span 1 !important; }
}

    /* Specific Fix for Mobile Toggle Visibility */
    @media (max-width: 768px) {
        .mobile-nav-toggle { display: block !important; }
        .nav-links { display: none !important; }
        .desktop-nav-profile { display: none !important; }
        .metrics-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem;
        }
        .problems-card {
            grid-column: span 1 !important;
        }
    }
}
`;

export default function DashboardHome() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useSEO({
        title: 'Dashboard – Whizan AI',
        description: 'Your Whizan AI coding dashboard. Track DSA progress, view interview history, and start AI mock interviews.',
        canonical: '/dashboard',
        robots: 'noindex, nofollow',
    });

    const uid = currentUser?.uid;

    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: queryKeys.stats(uid),
        queryFn: () => fetchStats(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 5,
    });

    const { data: interviewsData } = useQuery({
        queryKey: queryKeys.interviews(uid),
        queryFn: () => fetchInterviews(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 3,
    });

    const { data: profile } = useQuery({
        queryKey: queryKeys.profile(uid),
        queryFn: () => fetchProfile(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 5,
    });

    const userStats = statsData?.userStats ?? null;
    const totalCounts = statsData?.totalCounts ?? null;

    const allInterviews = interviewsData || [];
    const validInterviews = allInterviews.filter(inv => inv.overallScore || inv.scoreReport);
    const totalInterviews = validInterviews.length;
    const scored = validInterviews.filter(i => i.overallScore > 0);
    const avgScore = scored.length > 0
        ? Math.round(scored.reduce((s, i) => s + i.overallScore, 0) / scored.length)
        : null;

    return (
        <div className="dash-body" style={{
            minHeight: '100vh',
            background: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)',
            color: '#fff',
        }}>
            <style>{styles}</style>

            {/* ── Top Navigation ── */}
            <nav style={{
                height: '64px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 1.5rem',
                background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)',
                position: 'sticky', top: 0, zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: '1 1 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <img src="/logo.jpeg" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                        <span className="nav-logo-text" style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Whizan AI</span>
                    </div>
                </div>

                <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 0', justifyContent: 'center' }}>
                    <button className="dash-nav-links" onClick={() => navigate('/dsaquestion')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--txt2)'}>
                        DSA Practice
                    </button>
                    <button className="dash-nav-links" onClick={() => navigate('/aiinterviewselect')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--txt2)'}>
                        AI Interview
                    </button>
                    <button className="dash-nav-links" onClick={() => navigate('/systemdesign')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--txt2)'}>
                        System Design
                    </button>
                    <button className="dash-nav-links" onClick={() => navigate('/courses')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--txt2)'}>
                        Courses
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 0', justifyContent: 'flex-end' }}>
                    <NotificationBell />
                    <div className="desktop-nav-profile">
                        <NavProfile />
                    </div>
                    <button
                        className="mobile-nav-toggle"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{
                            display: 'none',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            padding: '8px',
                            zIndex: 110
                        }}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    {/* Only show NavProfile on mobile if logged out (Sign In button) */}
                    {!currentUser && (
                        <div className="mobile-nav-toggle" style={{ display: 'none' }}>
                            <NavProfile />
                        </div>
                    )}
                </div>
            </nav>

            {/* ── Mobile Menu Overlay ── */}
            {isMenuOpen && (
                <div className="mobile-nav-overlay">
                    <button className="mobile-nav-link" onClick={() => { navigate('/dsaquestion'); setIsMenuOpen(false); }}>DSA Practice</button>
                    <button className="mobile-nav-link" onClick={() => { navigate('/aiinterviewselect'); setIsMenuOpen(false); }}>AI Interview</button>
                    <button className="mobile-nav-link" onClick={() => { navigate('/systemdesign'); setIsMenuOpen(false); }}>System Design</button>
                    <button className="mobile-nav-link" onClick={() => { navigate('/courses'); setIsMenuOpen(false); }}>Courses</button>
                    {currentUser && (
                        <>
                            <button className="mobile-nav-link" onClick={() => { navigate(`/public/${currentUser.uid}`); setIsMenuOpen(false); }}>Public Portfolio</button>
                            <button className="mobile-nav-link" onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}>My Profile</button>
                        </>
                    )}
                    {!currentUser && (
                        <button className="mobile-nav-link" onClick={() => { navigate('/login'); setIsMenuOpen(false); }}>Sign In</button>
                    )}
                </div>
            )}

            {/* ── Main Content ── */}
            <div className="dash-content">

                {/* Header Section */}
                <div className="dash-header" style={{ marginBottom: '2.5rem', animation: 'fadeScale 0.6s ease-out' }}>
                    <h1 style={{ fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.03em' }}>
                        Welcome back, <span style={{ color: '#60a5fa' }}>{currentUser?.displayName?.split(' ')[0] || 'Developer'}</span>! 👋
                    </h1>
                    <p style={{ color: 'var(--txt2)', margin: 0 }}>Here's your interview preparation progress.</p>
                </div>

                {/* Metrics Grid */}
                <div className="metrics-grid">
                    <div
                        onClick={() => navigate('/infoaiinterview')}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.9'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1'; }}
                        style={{ cursor: 'pointer', transition: 'transform 0.2s', display: 'flex' }}
                        title="Click to view all past mock interviews"
                    >
                        <div style={{ flex: 1 }}>
                            <DashboardCard
                                title="Total Interviews" value={statsLoading ? '–' : totalInterviews} subtitle="View all history"
                                icon={Target} color="#3b82f6" delay={0.1}
                            />
                        </div>
                    </div>

                    <DashboardCard
                        title="Avg. Performance" value={statsLoading ? '–' : avgScore ? `${avgScore}%` : 'N/A'} subtitle="Based on mock interviews"
                        icon={TrendingUp} color="#10b981" delay={0.2}
                    />

                    {/* Dynamic Problems Solved Widget */}
                    <div className="problems-card"
                        onClick={() => navigate('/dsaquestion')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
                            e.currentTarget.style.boxShadow = '0 12px 32px rgba(168,85,247,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
                        }}
                        style={{
                            background: 'rgba(20, 22, 30, 0.6)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                            animation: 'cardAppear 0.5s ease-out 0.3s both',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
                            <Code2 size={18} color="#a855f7" />
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--txt)' }}>Problems Solved</span>
                        </div>

                        {statsLoading ? (
                            <div style={{ textAlign: 'center', color: 'var(--txt3)', fontSize: '0.82rem', padding: '1rem 0' }}>Loading stats…</div>
                        ) : !currentUser ? (
                            <div style={{ textAlign: 'center', color: 'var(--txt3)', fontSize: '0.82rem', padding: '1rem 0' }}>Sign in to view stats</div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                {/* Circular total */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                                    <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                                        <svg width="100%" height="100%" viewBox="0 0 36 36">
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#a855f7" strokeWidth="2.5"
                                                strokeDasharray={`${((userStats?.Total || 0) / (totalCounts?.Total || 1)) * 100}, 100`}
                                                strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease-out' }} />
                                        </svg>
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--txt)', lineHeight: 1 }}>{userStats?.Total || 0}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--txt3)', marginBottom: '2px' }}>Overall Completion</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--txt)', lineHeight: 1 }}>
                                            {(((userStats?.Total || 0) / (totalCounts?.Total || 1)) * 100).toFixed(1)}%
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--txt3)', marginTop: '2px' }}>of {totalCounts?.Total || 0} problems</div>
                                    </div>
                                </div>
                                {/* Difficulty bars */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '160px', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '1.5rem' }}>
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
                                                <div style={{ width: `${(d.count / d.total) * 100}%`, height: '100%', background: d.color, borderRadius: '999px', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity Heatmap */}
                <div style={{
                    background: 'rgba(20, 22, 30, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    padding: '1.5rem',
                    animation: 'cardAppear 0.5s ease-out 0.5s both',
                    overflow: 'hidden',
                    marginBottom: '3rem'
                }}>
                    <ActivityCalendar
                        uid={currentUser?.uid}
                        userStats={userStats}
                        totalCounts={totalCounts}
                        containerStyle={{ background: 'transparent', border: 'none', padding: 0 }}
                    />
                </div>

                {/* Quick Actions Grid */}
                <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 1.5rem 0', animation: 'cardAppear 0.5s ease-out 0.6s both' }}>Start Practicing</h2>
                    <div className="actions-grid" style={{ animation: 'cardAppear 0.5s ease-out 0.7s both' }}>
                        <QuickActionCard
                            title="Mock AI Interview"
                            desc="Full technical interview covering DSA, algorithms, and a final scoring report."
                            icon={Brain} color="#a855f7"
                            cta="Start Interview"
                            onClick={() => navigate('/aiinterviewselect')}
                        />
                        <QuickActionCard
                            title="System Design"
                            desc="Practice scalable architecture design with an AI Staff Engineer on a whiteboard."
                            icon={Layers} color="#3b82f6"
                            cta="Open Whiteboard"
                            onClick={() => navigate('/systemdesign')}
                        />
                        <QuickActionCard
                            title="DSA Practice"
                            desc="Solve LeetCode-style questions with a live Monaco editor and instant evaluation."
                            icon={Code2} color="#00b8a3"
                            cta="View Problem List"
                            onClick={() => navigate('/dsaquestion')}
                        />
                        <QuickActionCard
                            title="Course Library"
                            desc="Comprehensive learning materials and lecture dashboards."
                            icon={BookOpen} color="#10b981"
                            cta="Browse Courses"
                            onClick={() => navigate('/courses')}
                        />
                    </div>
                </div>

                {/* Featured Interview Section */}
                <div style={{ marginTop: '3rem', animation: 'cardAppear 0.5s ease-out 0.8s both' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 1.5rem 0' }}>Practice Like a Pro</h2>
                    <div
                        onClick={() => navigate('/aiinterview')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(168,85,247,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
                        }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(59,130,246,0.1))',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '24px',
                            padding: '2rem',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2rem',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Background glow effects */}
                        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'rgba(168,85,247,0.2)', filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: '-50%', left: '-10%', width: '300px', height: '300px', background: 'rgba(59,130,246,0.15)', filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }} />

                        <div style={{
                            width: '64px', height: '64px', borderRadius: '16px',
                            background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', flexShrink: 0, boxShadow: '0 8px 20px rgba(168,85,247,0.3)'
                        }}>
                            <Brain size={32} />
                        </div>

                        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, margin: '0 0 8px 0' }}>Practice DSA in Interview Format</h3>
                            <p style={{ color: 'var(--txt2)', fontSize: '1rem', lineHeight: 1.6, margin: 0, maxWidth: '600px' }}>
                                Experience a realistic technical interview environment with our AI Staff Engineer. Get real-time feedback, behavioral analysis, and a comprehensive performance report.
                            </p>
                        </div>

                        <div style={{
                            padding: '12px 24px', borderRadius: '12px', background: '#fff', color: '#000',
                            fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'all 0.2s', flexShrink: 0, zIndex: 1
                        }}>
                            Go to Interview <ArrowRight size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
