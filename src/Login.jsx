import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Brain, LogIn, Sparkles, Code2, AlertCircle } from 'lucide-react';

export default function Login() {
    const { loginWithGoogle, currentUser } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Where did the user come from? (e.g., /solvingpage/123 or /aiinterview)
    const params = new URLSearchParams(location.search);
    const redirectUrl = params.get('redirect') || '/dashboard';

    // If already logged in, redirect them back aggressively
    if (currentUser) {
        navigate(redirectUrl, { replace: true });
        return null;
    }

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            navigate(redirectUrl, { replace: true });
        } catch (err) {
            setError('Failed to log in with Google. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                padding: '2.5rem',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
            }}>

                {/* Logo & Branding */}
                <div style={{
                    width: '64px', height: '64px', borderRadius: '16px',
                    background: 'var(--ai-dim)', border: '1px solid var(--ai)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <img src="/logo.jpeg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '15px' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                    <Brain size={32} color="var(--ai)" style={{ display: 'none' }} />
                </div>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--txt)', margin: '0 0 0.5rem 0' }}>Welcome to CodeArena</h1>
                <p style={{ color: 'var(--txt2)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2.5rem' }}>
                    Sign in to practice coding, run tests, and experience full AI interviews.
                </p>

                {error && (
                    <div style={{
                        width: '100%', padding: '0.75rem', marginBottom: '1.5rem',
                        background: 'var(--fail-dim)', border: '1px solid rgba(239,71,67,0.3)',
                        borderRadius: '12px', color: 'var(--fail)', fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left'
                    }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Google Sign In Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                        width: '100%', padding: '0.85rem 1rem',
                        background: 'white', color: '#333',
                        border: 'none', borderRadius: '12px',
                        fontSize: '0.95rem', fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'transform 0.1s, box-shadow 0.1s',
                        opacity: loading ? 0.7 : 1
                    }}
                    onMouseOver={e => !loading && (e.target.style.transform = 'translateY(-1px)')}
                    onMouseOut={e => !loading && (e.target.style.transform = 'translateY(0)')}
                >
                    <svg width="20" height="20" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                    </svg>
                    Continue with Google
                </button>

                <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-soft)', width: '100%', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: 'var(--txt3)' }}>
                        <Code2 size={16} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>Write Code</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: 'var(--txt3)' }}>
                        <Sparkles size={16} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>AI Feedback</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: 'var(--txt3)' }}>
                        <Brain size={16} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>Mock Interviews</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
