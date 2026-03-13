import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ArrowLeft, CheckCircle2, Clock, Loader2, Trophy, Terminal } from 'lucide-react';
import NavProfile from './NavProfile';

const DIFFICULTY_COLOR = { Easy: '#00b8a3', Medium: '#ffa116', Hard: '#ef4743' };

export default function MySubmissions() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        fetch(`https://leetcode-orchestration.onrender.com/api/user-problems/${currentUser.uid}`)
            .then(res => res.json())
            .then(data => {
                setProblems(data.problems || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load user problems:", err);
                setLoading(false);
            });
    }, [currentUser]);

    if (!currentUser) {
        return (
            <div className="lc-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'var(--surface)', padding: '3rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <h2 style={{ color: 'var(--txt)', marginBottom: '1rem' }}>Sign In Required</h2>
                    <p style={{ color: 'var(--txt2)', marginBottom: '1.5rem' }}>You must be logged in to view your submissions.</p>
                    <button className="lc-run-btn" onClick={() => navigate('/login?redirect=/submissions')}>
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    const solvedCount = problems.filter(p => p.status === 'Solved').length;

    return (
        <div className="lc-root" style={{
            background: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)',
            minHeight: '100vh',
            overflowY: 'auto'
        }}>
            {/* ── Navbar ── */}
            <nav className="lc-nav" style={{
                background: 'rgba(5,5,5,0.85)',
                backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
                <div className="lc-nav-left">
                    <button onClick={() => navigate('/dsaquestion')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <div className="lc-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginRight: '16px' }} onClick={() => navigate('/dashboard')}>
                        <img src="/logo.jpeg" alt="CodeArena Logo" style={{ height: '24px', width: '24px', borderRadius: '4px', objectFit: 'contain' }} />
                        <span className="lc-logo-text">CodeArena</span>
                    </div>
                    <button onClick={() => navigate('/systemdesign')} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--txt)', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}>
                        System Design
                    </button>
                </div>
                <div className="lc-nav-center">
                    <h1 style={{ fontSize: '1rem', color: 'var(--txt)', margin: 0, fontWeight: 500 }}>My Submissions</h1>
                </div>
                <div className="lc-nav-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <NavProfile />
                    <button onClick={logout} className="lc-toolbar-btn">Log out</button>
                </div>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', width: '100%' }}>

                {/* Header Stats Box */}
                <div style={{ background: 'var(--surface)', padding: '1.5rem 2rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ margin: 0, color: 'var(--txt)', fontSize: '1.4rem' }}>Submission History</h2>
                        <p style={{ margin: '0.5rem 0 0', color: 'var(--txt2)', fontSize: '0.9rem' }}>Track all your problem-solving progress across the platform.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--txt)' }}>{problems.length}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attempted</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--pass)' }}>{solvedCount}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Solved</div>
                        </div>
                    </div>
                </div>

                {/* Submissions Table */}
                <div style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 0', color: 'var(--txt2)' }}>
                            <Loader2 size={32} className="spin" style={{ marginBottom: '1rem', color: 'var(--accent)' }} />
                            Loading your submissions...
                        </div>
                    ) : problems.length === 0 ? (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <Terminal size={48} style={{ color: 'var(--txt3)', margin: '0 auto 1rem', opacity: 0.5 }} />
                            <h3 style={{ color: 'var(--txt)', margin: '0 0 0.5rem' }}>No Submissions Yet</h3>
                            <p style={{ color: 'var(--txt2)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>You haven't attempted any problems. Start your coding journey today!</p>
                            <button className="lc-run-btn" onClick={() => navigate('/dsaquestion')}>
                                Browse Problems
                            </button>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-soft)', backgroundColor: 'var(--surface2)' }}>
                                    <th style={{ padding: '1rem', color: 'var(--txt3)', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1rem', color: 'var(--txt3)', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase' }}>Title</th>
                                    <th style={{ padding: '1rem', color: 'var(--txt3)', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase' }}>Difficulty</th>
                                    <th style={{ padding: '1rem', color: 'var(--txt3)', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'center' }}>Attempts</th>
                                    <th style={{ padding: '1rem', color: 'var(--txt3)', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {problems.map(p => (
                                    <tr
                                        key={p.id}
                                        style={{ borderBottom: '1px solid var(--border-soft)', cursor: 'pointer', transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        onClick={() => navigate(`/solvingpage/${p.id}`)}
                                    >
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {p.status === 'Solved' ? (
                                                <div style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: '4px', background: '#00b8a315', color: 'var(--pass)', fontSize: '0.75rem', fontWeight: 600, alignItems: 'center', gap: '4px' }}>
                                                    <CheckCircle2 size={14} /> Solved
                                                </div>
                                            ) : (
                                                <div style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: '4px', background: '#ffa11615', color: 'var(--warn)', fontSize: '0.75rem', fontWeight: 600, alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={14} /> Attempting
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--txt)', fontSize: '0.9rem' }}>
                                            {p.id}. {p.title}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ color: DIFFICULTY_COLOR[p.difficulty] || 'var(--txt2)', fontSize: '0.8rem', fontWeight: 500 }}>
                                                {p.difficulty}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--txt2)', fontSize: '0.85rem' }}>
                                            {p.submissionsCount || 1}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--txt3)', fontSize: '0.8rem' }}>
                                            {new Date(p.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
            <style>{`
                @media (max-width: 768px) {
                    .subs-table-col-attempts { display: none; }
                    .subs-table-col-date { display: none; }
                    .subs-content { padding: 1rem !important; }
                    .subs-header-box { flex-direction: column !important; align-items: flex-start !important; }
                    .subs-stats-row { gap: 1rem !important; }
                }
                @media (max-width: 480px) {
                    .subs-content { padding: 0.75rem !important; }
                    .subs-header-title { font-size: 1.1rem !important; }
                    .subs-table-col-difficulty { display: none; }
                }
            `}</style>
        </div>
    );
}
