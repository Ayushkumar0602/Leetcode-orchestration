import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Brain, Play, Pause, RotateCcw, User, AlertTriangle,
    CheckCircle, Clock, Zap, ChevronRight, Search, X, Activity
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration-55z3.onrender.com';

// ─── Helpers ──────────────────────────────────────────────────────────────

const diffColor = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };
const statusColor = {
    idle: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
    running: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
    paused: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
};

function StatusBadge({ status }) {
    const s = statusColor[status] || statusColor.idle;
    const icons = {
        idle: <CheckCircle size={13} />,
        running: <Activity size={13} style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />,
        paused: <Pause size={13} />,
    };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: s.bg, color: s.text, border: `1px solid ${s.border}`,
            borderRadius: '999px', padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
            {icons[status] || icons.idle}
            {status}
        </span>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function AdminML() {
    const { currentUser } = useAuth();
    const [jobStatus, setJobStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');
    const [toast, setToast] = useState(null);
    const [userSearch, setUserSearch] = useState('');
    const [userList, setUserList] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const pollRef = useRef(null);

    // Helper: get bearer token
    const getToken = useCallback(async () => {
        if (!currentUser) return null;
        try { return await currentUser.getIdToken(); } catch { return null; }
    }, [currentUser]);

    // Toast helper
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // Fetch ML Status
    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/ml/status`);
            const data = await res.json();
            setJobStatus(data);
        } catch (e) {
            console.error('[AdminML] Status fetch failed:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Poll while running
    useEffect(() => {
        fetchStatus();
        pollRef.current = setInterval(() => {
            fetchStatus();
        }, 4000);
        return () => clearInterval(pollRef.current);
    }, [fetchStatus]);

    // Load users for search — uses auth token + ?search= for exact email lookup
    const loadUsers = async (search) => {
        if (!search.trim()) { setUserList([]); return; }
        setUsersLoading(true);
        try {
            const token = await getToken();
            if (!token) {
                showToast('Not authenticated — please reload', 'error');
                setUserList([]);
                return;
            }
            const url = `${BASE_URL}/api/admin/users?search=${encodeURIComponent(search.trim())}`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.status === 401 || res.status === 403) {
                showToast('Admin access required', 'error');
                setUserList([]);
                return;
            }
            const data = await res.json();
            setUserList(data.users || []);
        } catch (e) {
            setUserList([]);
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => loadUsers(userSearch), 400);
        return () => clearTimeout(timer);
    }, [userSearch]);

    // Run All
    const handleRunAll = async () => {
        setActionLoading('run-all');
        try {
            const res = await fetch(`${BASE_URL}/api/ml/trigger-all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ triggeredBy: 'admin_manual' }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Batch ML job started for all users!');
                fetchStatus();
            } else {
                showToast(data.error || 'Failed to start batch job', 'error');
            }
        } catch (e) {
            showToast('Network error: ' + e.message, 'error');
        } finally {
            setActionLoading('');
        }
    };

    // Pause / Resume
    const handlePauseToggle = async () => {
        setActionLoading('pause');
        try {
            const res = await fetch(`${BASE_URL}/api/ml/pause`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminUid: 'admin' }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast(`ML ${data.action === 'paused' ? 'paused' : 'resumed'} successfully.`);
                fetchStatus();
            } else {
                showToast(data.error || 'Failed to toggle pause', 'error');
            }
        } catch (e) {
            showToast('Network error: ' + e.message, 'error');
        } finally {
            setActionLoading('');
        }
    };

    // Trigger for one user
    const handleTriggerUser = async (uid, label) => {
        setActionLoading(`user-${uid}`);
        try {
            const res = await fetch(`${BASE_URL}/api/ml/trigger/${uid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ triggeredBy: 'admin_user_trigger' }),
            });
            const data = await res.json();
            if (res.ok) {
                showToast(`Generated ${data.count} recommendations for ${label || uid}!`);
                setUserSearch('');
                setUserList([]);
                fetchStatus();
            } else {
                showToast(data.error || 'Trigger failed', 'error');
            }
        } catch (e) {
            showToast('Network error: ' + e.message, 'error');
        } finally {
            setActionLoading('');
        }
    };

    const progress = jobStatus && jobStatus.totalCount > 0
        ? Math.round((jobStatus.processedCount / jobStatus.totalCount) * 100)
        : 0;

    const isPaused = jobStatus?.status === 'paused';
    const isRunning = jobStatus?.status === 'running';

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', color: '#fff' }}>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
                    background: toast.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(16,185,129,0.95)',
                    color: '#fff', borderRadius: '12px', padding: '12px 20px',
                    fontSize: '0.9rem', fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    animation: 'slideIn 0.3s ease',
                }}>
                    {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                    width: 48, height: 48, borderRadius: '14px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                }}>
                    <Brain size={24} color="#fff" />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>ML Recommendations</h1>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--txt2)' }}>
                        Personalized problem recommendation engine control
                    </p>
                </div>
            </div>

            {/* Status Card */}
            <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px', padding: '1.5rem', marginBottom: '1.5rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <p style={{ margin: '0 0 6px', fontSize: '0.8rem', color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Engine Status
                        </p>
                        {loading ? (
                            <div style={{ width: 120, height: 28, borderRadius: 999, background: 'rgba(255,255,255,0.06)' }} />
                        ) : (
                            <StatusBadge status={jobStatus?.status || 'idle'} />
                        )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: 'var(--txt2)' }}>Last Run</p>
                        <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>
                            {jobStatus?.lastRunAt
                                ? new Date(jobStatus.lastRunAt).toLocaleString()
                                : '—'}
                        </p>
                    </div>
                </div>

                {/* Progress Bar — only visible while running */}
                {(isRunning || (jobStatus?.processedCount > 0 && jobStatus?.totalCount > 0)) && (
                    <div style={{ marginTop: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--txt2)' }}>
                                {isRunning ? `Processing: ${jobStatus?.currentUid || '...'}` : 'Last batch progress'}
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa' }}>
                                {jobStatus?.processedCount || 0} / {jobStatus?.totalCount || 0} users ({progress}%)
                            </span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                            <div style={{
                                width: `${progress}%`, height: '100%', borderRadius: 999,
                                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                                transition: 'width 0.5s ease',
                                boxShadow: isRunning ? '0 0 8px rgba(99,102,241,0.6)' : 'none',
                            }} />
                        </div>
                    </div>
                )}

                {/* Error log toggle */}
                {jobStatus?.errorLog?.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                        <button
                            onClick={() => setShowErrors(v => !v)}
                            style={{
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                                color: '#f87171', borderRadius: '8px', padding: '6px 14px',
                                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px',
                            }}
                        >
                            <AlertTriangle size={13} />
                            {jobStatus.errorLog.length} Error{jobStatus.errorLog.length !== 1 ? 's' : ''}
                            {showErrors ? ' — Hide' : ' — Show'}
                        </button>
                        {showErrors && (
                            <div style={{
                                marginTop: '8px', background: 'rgba(239,68,68,0.05)',
                                border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px',
                                padding: '0.75rem', maxHeight: '150px', overflowY: 'auto',
                            }}>
                                {jobStatus.errorLog.map((e, i) => (
                                    <p key={i} style={{ margin: '0 0 4px', fontSize: '0.78rem', color: '#f87171', fontFamily: 'monospace' }}>{e}</p>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Global Controls */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem',
            }}>
                {/* Run All */}
                <button
                    disabled={isRunning || actionLoading === 'run-all' || isPaused}
                    onClick={handleRunAll}
                    style={{
                        background: isRunning || isPaused
                            ? 'rgba(255,255,255,0.05)'
                            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: '1px solid rgba(99,102,241,0.3)',
                        color: isRunning || isPaused ? 'var(--txt2)' : '#fff',
                        borderRadius: '14px', padding: '1rem 1.5rem',
                        fontSize: '0.9rem', fontWeight: 700, cursor: isRunning || isPaused ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'all 0.2s', boxShadow: isRunning || isPaused ? 'none' : '0 4px 20px rgba(99,102,241,0.3)',
                    }}
                >
                    <Zap size={16} />
                    {actionLoading === 'run-all' ? 'Starting…' : 'Run for All Users'}
                </button>

                {/* Pause / Resume */}
                <button
                    disabled={actionLoading === 'pause'}
                    onClick={handlePauseToggle}
                    style={{
                        background: isPaused ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        border: `1px solid ${isPaused ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                        color: isPaused ? '#10b981' : '#f59e0b',
                        borderRadius: '14px', padding: '1rem 1.5rem',
                        fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'all 0.2s',
                    }}
                >
                    {isPaused ? <><Play size={16} /> Resume ML</> : <><Pause size={16} /> Pause ML</>}
                </button>
            </div>

            {/* Per-user Trigger */}
            <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px', padding: '1.5rem',
            }}>
                <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} color="#60a5fa" />
                    Trigger for Specific User
                </h2>

                {/* Search input */}
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <Search size={16} style={{
                        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--txt2)', pointerEvents: 'none',
                    }} />
                    <input
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        placeholder="Search by email or UID…"
                        style={{
                            width: '100%', background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', borderRadius: '12px',
                            padding: '10px 40px 10px 40px', fontSize: '0.9rem',
                            outline: 'none', boxSizing: 'border-box',
                        }}
                    />
                    {userSearch && (
                        <X size={16} style={{
                            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--txt2)', cursor: 'pointer',
                        }} onClick={() => { setUserSearch(''); setUserList([]); }} />
                    )}
                </div>

                {/* User results */}
                {usersLoading && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--txt2)', textAlign: 'center', padding: '0.5rem' }}>
                        Searching…
                    </p>
                )}

                {userList.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {userList.map(user => (
                            <div key={user.uid} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '12px', padding: '10px 14px',
                            }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>
                                        {user.displayName || user.email || 'Unknown'}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--txt2)' }}>
                                        {user.email} · {user.uid?.slice(0, 12)}…
                                    </p>
                                </div>
                                <button
                                    disabled={actionLoading === `user-${user.uid}` || isPaused}
                                    onClick={() => handleTriggerUser(user.uid, user.email || user.displayName)}
                                    style={{
                                        background: isPaused ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.15)',
                                        border: '1px solid rgba(99,102,241,0.3)',
                                        color: isPaused ? 'var(--txt2)' : '#818cf8',
                                        borderRadius: '10px', padding: '6px 14px',
                                        fontSize: '0.8rem', fontWeight: 700, cursor: isPaused ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                    }}
                                >
                                    {actionLoading === `user-${user.uid}`
                                        ? 'Running…'
                                        : <><Zap size={13} /> Trigger</>}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {userSearch && !usersLoading && userList.length === 0 && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--txt2)', textAlign: 'center', padding: '0.5rem' }}>
                        No users found for "<strong>{userSearch}</strong>"
                    </p>
                )}

                {isPaused && (
                    <div style={{
                        marginTop: '1rem', background: 'rgba(245,158,11,0.08)',
                        border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px',
                        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: '0.83rem', color: '#fbbf24',
                    }}>
                        <Pause size={14} />
                        ML is globally paused. Resume to trigger jobs.
                    </div>
                )}
            </div>

            {/* Schedule Info */}
            <div style={{
                marginTop: '1.5rem',
                background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: '14px', padding: '1rem 1.5rem',
                display: 'flex', alignItems: 'center', gap: '12px',
            }}>
                <Clock size={18} color="#818cf8" style={{ flexShrink: 0 }} />
                <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Automatic Weekly Schedule</p>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--txt2)' }}>
                        Recommendations are automatically regenerated every <strong>Sunday at 2:00 AM</strong> (server time).
                        Respects global pause flag.
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes slideIn {
                    from { transform: translateX(20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                input::placeholder { color: var(--txt2); }
            `}</style>
        </div>
    );
}
