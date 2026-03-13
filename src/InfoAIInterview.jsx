import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import {
    Brain, Layers, Clock, Calendar, CheckCircle,
    ChevronLeft, ChevronRight, ArrowRight, XCircle, AlertCircle, FileText
} from 'lucide-react';
import NavProfile from './NavProfile';
import { useQuery } from '@tanstack/react-query';
import { fetchInterviews, queryKeys } from './lib/api';

const styles = `
@keyframes slideUpFade {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
}
`;

export default function InfoAIInterview() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const { data: interviewsData, isLoading: loading } = useQuery({
        queryKey: queryKeys.interviews(currentUser?.uid),
        queryFn: () => fetchInterviews(currentUser.uid),
        enabled: !!currentUser,
        staleTime: 1000 * 60 * 3, // 3 min
    });

    const interviews = interviewsData || [];

    // Format date nicely
    const formatDate = (ds) => {
        if (!ds) return 'Unknown Date';
        const d = new Date(ds);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)',
            color: '#fff',
            fontFamily: "'Inter', sans-serif"
        }}>
            <style>{styles}</style>

            {/* ── Top Navigation ── */}
            <nav style={{
                height: '70px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 2rem',
                background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(12px)',
                position: 'sticky', top: 0, zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <img src="/logo.jpeg" alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.3px', color: '#fff' }}>CodeArena</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px', padding: '0 16px', height: '36px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            color: 'var(--txt2)', cursor: 'pointer', transition: 'all 0.2s',
                            fontSize: '0.85rem', fontWeight: 600
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--txt2)'; }}
                    >
                        <ChevronLeft size={16} /> Back
                    </button>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--txt3)' }}>|</span>
                    <span style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.3px', color: 'var(--txt)' }}>Interview Hub</span>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--txt3)' }}>|</span>
                    <NavProfile />
                </div>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: '3rem', animation: 'slideUpFade 0.5s ease-out' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 12px 0', letterSpacing: '-0.03em' }}>
                        Ready for your next <span style={{ color: '#a855f7' }}>Mock Interview</span>?
                    </h1>
                    <p style={{ color: 'var(--txt2)', fontSize: '1.1rem', margin: 0, maxWidth: '600px', lineHeight: 1.5 }}>
                        Choose between a technical Data Structures & Algorithms interview, or an architectural System Design session with an AI Staff Engineer.
                    </p>
                </div>

                {/* ── Quick Actions ── */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem',
                    marginBottom: '4rem', animation: 'slideUpFade 0.5s ease-out 0.1s both'
                }}>
                    {/* DSA Card */}
                    <div
                        onClick={() => navigate('/aiinterview')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
                            e.currentTarget.style.boxShadow = '0 12px 32px rgba(168,85,247,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
                        }}
                        style={{
                            background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
                            padding: '2rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            position: 'relative', overflow: 'hidden'
                        }}
                    >
                        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', background: '#a855f7', filter: 'blur(60px)', opacity: 0.1, borderRadius: '50%' }} />
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.05))', border: '1px solid rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', marginBottom: '1.5rem' }}>
                            <Brain size={28} />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>DSA Interview</h3>
                        <p style={{ color: 'var(--txt2)', fontSize: '0.95rem', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
                            Full 45-minute technical session. Face LeetCode algorithms with live coding, hints, and socratic evaluation.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '0.9rem', fontWeight: 600 }}>
                            Start Interview <ArrowRight size={16} />
                        </div>
                    </div>

                    {/* System Design Card */}
                    <div
                        onClick={() => navigate('/systemdesign')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
                            e.currentTarget.style.boxShadow = '0 12px 32px rgba(59,130,246,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
                        }}
                        style={{
                            background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
                            padding: '2rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            position: 'relative', overflow: 'hidden'
                        }}
                    >
                        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', background: '#3b82f6', filter: 'blur(60px)', opacity: 0.1, borderRadius: '50%' }} />
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '1.5rem' }}>
                            <Layers size={28} />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>System Design</h3>
                        <p style={{ color: 'var(--txt2)', fontSize: '0.95rem', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
                            Architect scalable distributed systems on an interactive whiteboard. Discuss trade-offs and databases.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '0.9rem', fontWeight: 600 }}>
                            Open Whiteboard <ArrowRight size={16} />
                        </div>
                    </div>
                </div>

                {/* ── Past Interviews ── */}
                <div style={{ animation: 'slideUpFade 0.5s ease-out 0.2s both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <FileText size={20} color="var(--txt2)" />
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Past Interviews</h2>
                    </div>

                    {!currentUser ? (
                        <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                            <p style={{ color: 'var(--txt3)', margin: 0 }}>Please sign in to view your past interviews.</p>
                            <button onClick={() => navigate('/login')} style={{ marginTop: '1rem', background: 'var(--accent)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Sign In</button>
                        </div>
                    ) : loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--txt3)' }}>Loading interview history...</div>
                    ) : interviews.length === 0 ? (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt3)' }}>
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 6px 0' }}>No Past Interviews</h3>
                                <p style={{ color: 'var(--txt3)', fontSize: '0.9rem', margin: 0 }}>You haven't completed any mock interviews yet. Start one above!</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '20px',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            maxHeight: '500px',
                            overflowY: 'auto',
                        }}
                            className="custom-scrollbar"
                        >
                            {interviews.map(inv => (
                                <div
                                    key={inv.id}
                                    onClick={() => navigate(`/aiinterview/${inv.id}`)}
                                    style={{
                                        background: 'rgba(20, 22, 30, 0.6)', backdropFilter: 'blur(12px)',
                                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
                                        padding: '1.25rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        flexShrink: 0
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30, 32, 40, 0.8)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20, 22, 30, 0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                                            {inv.problemTitle || 'Mock Interview'}
                                        </h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--txt3)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {formatDate(inv.createdAt)}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {inv.durationMinutes ? `${inv.durationMinutes} min` : 'Unknown'}</span>
                                            {inv.difficulty && (
                                                <span style={{
                                                    color: inv.difficulty === 'Easy' ? '#00b8a3' : inv.difficulty === 'Medium' ? '#ffa116' : '#ef4743'
                                                }}>
                                                    • {inv.difficulty}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {/* Hire Status Badge */}
                                            {inv.scoreReport?.hire && (
                                                <div style={{
                                                    padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                                                    background: inv.scoreReport.hire.includes('Strong Hire') ? 'rgba(16,185,129,0.1)' : inv.scoreReport.hire.includes('No Hire') ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                                    color: inv.scoreReport.hire.includes('Strong Hire') ? '#10b981' : inv.scoreReport.hire.includes('No Hire') ? '#ef4444' : '#f59e0b',
                                                    border: `1px solid ${inv.scoreReport.hire.includes('Strong Hire') ? 'rgba(16,185,129,0.2)' : inv.scoreReport.hire.includes('No Hire') ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`
                                                }}>
                                                    {inv.scoreReport.hire}
                                                </div>
                                            )}
                                            {/* Score Bubble */}
                                            <div style={{
                                                padding: '6px 12px', borderRadius: '10px',
                                                background: inv.overallScore >= 80 ? 'rgba(16,185,129,0.1)' : inv.overallScore >= 60 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                                color: inv.overallScore >= 80 ? '#10b981' : inv.overallScore >= 60 ? '#f59e0b' : '#ef4444',
                                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600
                                            }}>
                                                {inv.overallScore ? `${inv.overallScore}/100` : 'Unscored'}
                                            </div>
                                        </div>
                                        <ChevronRight size={18} color="var(--txt3)" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @media (max-width: 768px) {
                    .info-ai-content { padding: 2rem 1rem !important; }
                    .info-ai-header h1 { font-size: 1.8rem !important; }
                    .info-ai-header p { font-size: 0.95rem !important; }
                    .info-ai-cards { grid-template-columns: 1fr !important; }
                    .info-ai-past-item { flex-direction: column !important; align-items: flex-start !important; gap: 0.75rem !important; }
                }
                @media (max-width: 480px) {
                    .info-ai-content { padding: 1.25rem 0.75rem !important; }
                    .info-ai-header h1 { font-size: 1.4rem !important; }
                    .info-ai-meta { flex-direction: column !important; gap: 4px !important; }
                }
            `}</style>
        </div>
    );
}
