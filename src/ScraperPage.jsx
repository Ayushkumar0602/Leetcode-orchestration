import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

const DIFF_STYLE = {
    Easy: { bg: 'rgba(0,184,163,0.12)', color: '#00b8a3' },
    Medium: { bg: 'rgba(255,161,22,0.12)', color: '#ffa116' },
    Hard: { bg: 'rgba(239,71,67,0.12)', color: '#ef4743' },
};

export default function ScraperPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const username = searchParams.get('username') || '';
    const { currentUser } = useAuth();

    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [useAuthMode, setUseAuthMode] = useState(false);
    const [leetcodeSession, setLeetcodeSession] = useState('');
    const [csrfToken, setCsrfToken] = useState('');

    const runSync = useCallback(() => {
        if (!currentUser) {
            const redirectPath = username ? `/scraper?username=${encodeURIComponent(username)}` : '/scraper';
            navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
            return;
        }
        if (!username.trim()) {
            navigate('/dsaquestion/1');
            return;
        }

        setStatus('loading');
        setError(null);

        const body = {
            userId: currentUser.uid,
            username: username.trim(),
        };

        if (useAuthMode && leetcodeSession.trim() && csrfToken.trim()) {
            body.mode = 'auth';
            body.leetcodeSession = leetcodeSession.trim();
            body.csrfToken = csrfToken.trim();
        }

        fetch('https://leetcode-orchestration-api.onrender.com/api/scraper/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
            .then(async (r) => {
                const text = await r.text();
                let data;
                try {
                    data = text ? JSON.parse(text) : {};
                } catch {
                    throw new Error(r.ok ? 'Invalid response from server' : `Server error (${r.status}). Ensure the backend is running on port 3001.`);
                }
                if (!r.ok) throw new Error(data.error || 'Scraping failed');
                return data;
            })
            .then((data) => {
                setResult(data);
                setStatus('success');
            })
            .catch((err) => {
                setError(err.message || 'An error occurred');
                setStatus('error');
            });
    }, [currentUser, username, navigate, useAuthMode, leetcodeSession, csrfToken]);

    useEffect(() => {
        runSync();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!currentUser) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#080b14', color: 'var(--txt)', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <button onClick={() => navigate('/dsaquestion/1')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--txt3)', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    <ChevronLeft size={18} /> Back to Problems
                </button>

                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem' }}>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>LeetCode Profile Sync</h1>
                    <p style={{ color: 'var(--txt3)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                        Syncing solved problems for <strong style={{ color: 'var(--txt)' }}>{username}</strong>
                    </p>

                    {/* Authenticated full-sync toggle */}
                    <div style={{ marginBottom: '1.25rem', padding: '0.85rem 0.9rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={useAuthMode}
                                onChange={(e) => setUseAuthMode(e.target.checked)}
                                style={{ marginTop: 3 }}
                            />
                            <span style={{ fontSize: '0.8rem', color: 'var(--txt2)' }}>
                                <strong>Use authenticated full sync (recommended for accurate counts)</strong>
                                <br />
                                Paste your <code>LEETCODE_SESSION</code> and <code>csrftoken</code> cookies from your logged-in LeetCode browser session.
                                They are sent only for this sync and are not stored.
                            </span>
                        </label>

                        {useAuthMode && (
                            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <input
                                    type="password"
                                    placeholder="LEETCODE_SESSION"
                                    value={leetcodeSession}
                                    onChange={(e) => setLeetcodeSession(e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '8px',
                                        padding: '6px 10px',
                                        color: 'var(--txt)',
                                        fontSize: '0.8rem',
                                        boxSizing: 'border-box',
                                    }}
                                />
                                <input
                                    type="password"
                                    placeholder="csrftoken"
                                    value={csrfToken}
                                    onChange={(e) => setCsrfToken(e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '8px',
                                        padding: '6px 10px',
                                        color: 'var(--txt)',
                                        fontSize: '0.8rem',
                                        boxSizing: 'border-box',
                                    }}
                                />
                                <p style={{ fontSize: '0.7rem', color: 'var(--txt3)', margin: 0 }}>
                                    We only use these tokens to talk to LeetCode on your behalf for this one sync. They are not stored or logged.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Manual re-sync button */}
                    <button
                        onClick={runSync}
                        disabled={status === 'loading'}
                        style={{
                            width: '100%',
                            background: status === 'loading' ? 'rgba(255,255,255,0.08)' : 'var(--accent)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: status === 'loading' ? 'default' : 'pointer',
                            marginBottom: '1rem',
                            opacity: status === 'loading' ? 0.7 : 1,
                        }}
                    >
                        {status === 'loading' ? 'Syncing…' : 'Sync / Re-sync now'}
                    </button>

                    {status === 'loading' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0' }}>
                            <Loader2 size={40} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
                            <p style={{ color: 'var(--txt3)', fontSize: '0.9rem' }}>Scraping profile and updating your progress…</p>
                            <p style={{ color: 'var(--txt3)', fontSize: '0.78rem' }}>This may take up to a minute.</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '1rem', background: 'rgba(239,71,67,0.1)', border: '1px solid rgba(239,71,67,0.3)', borderRadius: '12px', marginBottom: '1rem' }}>
                            <AlertCircle size={20} color="#ef4743" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <p style={{ fontWeight: 600, color: '#ef4743', marginBottom: '4px' }}>Sync failed</p>
                                <p style={{ fontSize: '0.88rem', color: 'var(--txt2)' }}>{error}</p>
                            </div>
                        </div>
                    )}

                    {status === 'success' && result && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#00b8a3' }}>
                                <CheckCircle2 size={24} />
                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Sync completed</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem' }}>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Total synced</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--txt)' }}>{result.totalSynced ?? result.totalSolved ?? 0}</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem' }}>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Filtered out</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--txt3)' }}>{result.filteredOut ?? 0}</div>
                                </div>
                            </div>

                            {result.breakdown && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {['Easy', 'Medium', 'Hard'].map((d) => {
                                        const style = DIFF_STYLE[d];
                                        const count = result.breakdown[d] ?? 0;
                                        return (
                                            <div key={d} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: style.color, fontWeight: 600, fontSize: '0.88rem' }}>{d}</span>
                                                <span style={{ color: 'var(--txt2)', fontWeight: 600 }}>{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <button onClick={() => navigate('/dsaquestion/1')} style={{ width: '100%', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}>
                                Back to Problems
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
