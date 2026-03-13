import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Server, Cpu, LogOut, ArrowRight, Layers, Layout, Zap, Database, GitBranch } from 'lucide-react';
import NavProfile from './NavProfile';

export default function SystemDesign() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)',
            color: 'var(--txt)',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* ── Navbar ─────────────────────────────────── */}
            <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="Logo" style={{ height: '28px', width: '28px', borderRadius: '6px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--txt)', letterSpacing: '-0.3px' }}>CodeArena</span>
                </div>

                <div className="sd-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px' }}>
                    {[
                        { label: 'Problems', path: '/dsaquestion' },
                        { label: 'System Design', path: '/systemdesign' },
                        { label: 'AI Interview', path: '/aiinterview' },
                        { label: 'My Submissions', path: '/submissions' },
                    ].map(item => (
                        <button key={item.label} onClick={() => navigate(item.path)}
                            style={{ padding: '6px 14px', borderRadius: '7px', border: 'none', background: item.path === '/systemdesign' ? 'rgba(255,255,255,0.1)' : 'transparent', color: item.path === '/systemdesign' ? 'var(--txt)' : 'var(--txt3)', fontSize: '0.82rem', fontWeight: item.path === '/systemdesign' ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                            {item.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <NavProfile />
                </div>
            </nav>

            <div className="sd-page-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 className="sd-hero-title" style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--txt)', marginBottom: '1rem', letterSpacing: '-1px' }}>
                        System Design <span style={{ color: 'var(--accent)' }}>Interviews</span>
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--txt2)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                        Master architectural patterns, scalability, and clean code. Choose your focus area below to access the complete syllabus.
                    </p>
                </div>

                <div className="sd-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    {/* HLD Card */}
                    <div
                        onClick={() => navigate('/systemdesign/hld')}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', display: 'flex', flexDirection: 'column' }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
                            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }}
                    >
                        <div style={{ height: '220px', background: 'rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                            <Server size={80} color="var(--accent)" style={{ opacity: 0.8 }} />
                        </div>
                        <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                <span style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>ARCHITECTURE</span>
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--txt)', marginBottom: '1rem' }}>High-Level Design (HLD)</h2>
                            <p style={{ color: 'var(--txt2)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', flex: 1 }}>
                                Learn how to design scalable, distributed systems. Covers traffic estimation, microservices, databases, caching, load balancing, and real-world system case studies.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--txt3)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Database size={16} /> Databases & Storage</span>
                                <span>•</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={16} /> Scalability</span>
                            </div>
                            <button style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', color: 'var(--txt)', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s' }}>
                                View Syllabus <ArrowRight size={18} color="var(--accent)" />
                            </button>
                        </div>
                    </div>

                    {/* LLD Card */}
                    <div
                        onClick={() => navigate('/systemdesign/lld')}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', display: 'flex', flexDirection: 'column' }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
                            e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }}
                    >
                        <div style={{ height: '220px', background: 'rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            <Cpu size={80} color="#a855f7" style={{ opacity: 0.8 }} />
                        </div>
                        <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                <span style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>CODE STRUCTURE</span>
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--txt)', marginBottom: '1rem' }}>Low-Level Design (LLD)</h2>
                            <p style={{ color: 'var(--txt2)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', flex: 1 }}>
                                Master object-oriented programming, design patterns, and clean code principles. Covers UML diagrams, API design, multithreading, and practical machine coding.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--txt3)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Layout size={16} /> Design Patterns</span>
                                <span>•</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><GitBranch size={16} /> API Design</span>
                            </div>
                            <button style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', color: 'var(--txt)', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s' }}>
                                View Syllabus <ArrowRight size={18} color="#a855f7" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
