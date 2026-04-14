import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import NavProfile from './NavProfile';
import { Building2, Search, Play, Clock, Terminal, History, Trash2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { COMPANIES } from './companywisesheet/companyData';
import { db } from './firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function OARoundSelect() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [activeTab, setActiveTab] = useState('start'); // 'start' | 'history'
    const [historySessions, setHistorySessions] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchHistory = async () => {
        if (!currentUser) return;
        setLoadingHistory(true);
        try {
            const q = query(collection(db, 'oa_sessions'), where('userId', '==', currentUser.uid));
            const snapshot = await getDocs(q);
            const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            sessions.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
            setHistorySessions(sessions);
        } catch (err) {
            console.error("Failed to load history", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    React.useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab, currentUser]);

    const handleDelete = async (e, sessionId) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this OA record?")) {
            try {
                await deleteDoc(doc(db, 'oa_sessions', sessionId));
                setHistorySessions(prev => prev.filter(s => s.id !== sessionId));
            } catch (err) {
                console.error("Failed to delete session", err);
            }
        }
    };

    const handleContinue = (session) => {
        navigate(`/oaround/${session.id}`, { state: { company: session.company } });
    };

    const filteredAvailable = COMPANIES.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStartOA = () => {
        if (!currentUser) {
            navigate('/login?redirect=/oaround');
            return;
        }
        if (!selectedCompany) return;

        const roomId = crypto.randomUUID();
        // Redirect to the OA round passing the company name in state
        navigate(`/oaround/${roomId}`, { state: { company: selectedCompany.name } });
    };

    return (
        <div style={{ minHeight: '100vh', background: '#050505', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)', color: '#fff', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {/* Standard App Navbar */}
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

            <div style={{ padding: '4rem 1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%', animation: 'fadeUp 0.4s ease-out', flex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(239,71,67,0.2), rgba(255,161,22,0.1))', border: '1px solid rgba(239,71,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 30px rgba(239,71,67,0.15)' }}>
                        <Terminal size={32} color="#ef4743" />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Online Assessment (OA)</h1>
                    <p style={{ color: 'var(--txt2)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>Choose a company to take a 1-hour timed coding challenge with mid-to-hard level questions generated live. Our AI proctor grades your submission.</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', width: 'fit-content', margin: '0 auto 3rem auto' }}>
                    <button
                        onClick={() => setActiveTab('start')}
                        style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'start' ? 'rgba(239,71,67,0.1)' : 'transparent', color: activeTab === 'start' ? '#fff' : 'var(--txt3)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', border: `1px solid ${activeTab === 'start' ? 'rgba(239,71,67,0.3)' : 'transparent'}` }}
                    >
                        <Play size={16} /> New Assessment
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'history' ? 'rgba(239,71,67,0.1)' : 'transparent', color: activeTab === 'history' ? '#fff' : 'var(--txt3)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', border: `1px solid ${activeTab === 'history' ? 'rgba(239,71,67,0.3)' : 'transparent'}` }}
                    >
                        <History size={16} /> Past Assessments
                    </button>
                </div>

                {activeTab === 'start' && (
                    <>
                        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto 3rem auto' }}>
                            <Search color="var(--txt3)" size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search top tech companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%', padding: '14px 16px 14px 48px', borderRadius: '14px',
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff', fontSize: '1rem', outline: 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = '#ef4743'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                            />
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '6px', height: '20px', borderRadius: '3px', background: '#ef4743' }} />
                                Select Company
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                                {filteredAvailable.map(company => (
                                    <div
                                        key={company.slug}
                                        onClick={() => setSelectedCompany(company)}
                                        style={{
                                            background: selectedCompany?.slug === company.slug ? 'rgba(239,71,67,0.1)' : 'rgba(255,255,255,0.01)',
                                            border: `1px solid ${selectedCompany?.slug === company.slug ? '#ef4743' : 'rgba(255,255,255,0.1)'}`,
                                            padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.2s', cursor: 'pointer',
                                            transform: selectedCompany?.slug === company.slug ? 'scale(1.02)' : 'none'
                                        }}
                                        onMouseEnter={e => { if (selectedCompany?.slug !== company.slug) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                        onMouseLeave={e => { if (selectedCompany?.slug !== company.slug) e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; }}
                                    >
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                                            <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <span style={{ fontWeight: selectedCompany?.slug === company.slug ? 700 : 600, fontSize: '0.95rem', color: selectedCompany?.slug === company.slug ? '#fff' : 'var(--txt2)', textAlign: 'center' }}>
                                            {company.name}
                                        </span>
                                    </div>
                                ))}
                                {filteredAvailable.length === 0 && (
                                    <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--txt3)' }}>
                                        No companies found matching "{searchQuery}".
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--txt2)', fontSize: '0.9rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} color="#ffa116" /> 60 Minutes</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Terminal size={16} color="#00b8a3" /> 2 Questions (Mid/Hard)</div>
                                </div>
                                <button
                                    onClick={handleStartOA}
                                    disabled={!selectedCompany}
                                    style={{
                                        background: selectedCompany ? 'linear-gradient(135deg, #ef4743, #d32f2f)' : 'rgba(255,255,255,0.1)',
                                        color: selectedCompany ? '#fff' : 'var(--txt3)',
                                        border: 'none', borderRadius: '12px', padding: '12px 24px', fontSize: '1rem', fontWeight: 700,
                                        cursor: selectedCompany ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px',
                                        transition: 'all 0.2s', boxShadow: selectedCompany ? '0 8px 20px rgba(239,71,67,0.3)' : 'none'
                                    }}
                                >
                                    Start Assessment <Play size={18} fill="currentColor" />
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'history' && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '6px', height: '20px', borderRadius: '3px', background: '#ef4743' }} />
                            Your Assessment Records
                        </h3>

                        {loadingHistory && <div style={{ color: 'var(--txt3)', textAlign: 'center', padding: '2rem' }}>Loading records...</div>}
                        {!loadingHistory && historySessions.length === 0 && (
                            <div style={{ color: 'var(--txt3)', textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                                You have no past online assessments.
                            </div>
                        )}
                        {!loadingHistory && historySessions.map(session => {
                            const isCompleted = session.isFinished;

                            let percent = session.aiTotalScore !== undefined
                                ? session.aiTotalScore
                                : Math.round(((session.q1Score?.passed || 0) + (session.q2Score?.passed || 0)) / Math.max((session.q1Score?.total || 1) + (session.q2Score?.total || 1), 1) * 100);

                            const formattedDate = new Date(session.updatedAt || session.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric'
                            });

                            return (
                                <div key={session.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => handleContinue(session)} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isCompleted ? 'rgba(0,184,163,0.1)' : 'rgba(255,161,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {isCompleted ? <CheckCircle2 size={24} color="#00b8a3" /> : <Clock size={24} color="#ffa116" />}
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem', marginBottom: '4px' }}>{session.company || 'Unknown'} OA</div>
                                            <div style={{ color: 'var(--txt3)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {formattedDate} •
                                                <span style={{ color: isCompleted ? '#00b8a3' : '#ffa116' }}>{isCompleted ? 'Completed' : 'In Progress'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                        {isCompleted && (
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ color: percent >= 70 ? '#00b8a3' : '#ef4743', fontWeight: 700, fontSize: '1.1rem' }}>Score: {percent}%</div>
                                                {session.aiRecommendation && (
                                                    <div style={{ color: session.aiRecommendation.includes('Proceed') ? '#00b8a3' : '#ef4743', fontSize: '0.85rem', fontWeight: 600 }}>{session.aiRecommendation}</div>
                                                )}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button
                                                onClick={(e) => handleDelete(e, session.id)}
                                                style={{ background: 'transparent', border: '1px solid rgba(239,71,67,0.3)', color: '#ef4743', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,71,67,0.1)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                title="Delete Record"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button
                                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            >
                                                {isCompleted ? 'View Feedback' : 'Continue'} <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
