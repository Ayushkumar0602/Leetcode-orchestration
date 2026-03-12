import React, { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function AISystemDesignInterview() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const topic = searchParams.get('topic') || 'System Design';
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate('/login?redirect=/systemdesign', { replace: true });
        }
    }, [currentUser, navigate]);

    if (!currentUser) return null;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)',
            color: 'var(--txt)',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* ── Navbar ─────────────────────────────────── */}
            <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <img src="/logo.jpeg" alt="Logo" style={{ height: '24px', width: '24px', borderRadius: '4px', objectFit: 'contain' }} />
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--txt)' }}>CodeArena</span>
                    </div>
                    <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--txt2)', fontWeight: 500 }}>System Design Interview</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
                            {(currentUser.displayName?.[0] || 'U').toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--txt)', fontWeight: 500 }}>{currentUser.displayName?.split(' ')[0] || 'User'}</span>
                    </div>
                </div>
            </nav>

            {/* ── Main Content Placeholder ─────────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '4rem', maxWidth: '600px', width: '100%' }}>
                    <Loader2 size={48} color="var(--accent)" className="spin" style={{ margin: '0 auto 2rem' }} />
                    <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '6px 14px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1rem', textTransform: 'uppercase' }}>
                        INITIALIZING ENVIRONMENT
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--txt)', marginBottom: '1rem', letterSpacing: '-0.5px' }}>Topic-Wise Interview</h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--txt2)', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Preparing AI interviewer and generating questions strictly restricted to: <br />
                        <strong style={{ color: 'var(--txt)', fontSize: '1.2rem', display: 'block', marginTop: '0.5rem' }}>"{topic}"</strong>
                    </p>
                    <div style={{ fontSize: '0.85rem', color: 'var(--txt3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <span>Session ID: {id}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
