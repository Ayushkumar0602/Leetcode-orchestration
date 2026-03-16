// src/admin/AdminNotificationAnalytics.jsx
import React, { useState, useEffect } from 'react';
import {
    BarChart2, Send, BookOpen, MousePointerClick, Megaphone,
    TrendingUp, RefreshCw, ChevronDown, Loader, AlertCircle
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://whizan-backend.onrender.com';

function StatCard({ icon: Icon, label, value, sub, color }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px', padding: '20px',
            display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
            <div style={{
                width: 40, height: 40, borderRadius: '12px',
                background: `${color}18`,
                border: `1px solid ${color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={18} color={color} />
            </div>
            <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{label}</div>
                {sub && <div style={{ fontSize: '0.72rem', color, marginTop: '3px', fontWeight: 600 }}>{sub}</div>}
            </div>
        </div>
    );
}

function RateBar({ label, value, color }) {
    return (
        <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
                <span style={{ fontWeight: 700, color }}>{value}%</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{
                    height: '100%',
                    width: `${Math.min(parseFloat(value), 100)}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}88)`,
                    borderRadius: '99px',
                    transition: 'width 1s ease',
                }} />
            </div>
        </div>
    );
}

export default function AdminNotificationAnalytics() {
    const [campaigns, setCampaigns] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [campaignsLoading, setCampaignsLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch campaigns for the selector
    useEffect(() => {
        fetch(`${BACKEND_URL}/api/notifications/campaigns`)
            .then(r => r.json())
            .then(d => {
                const activeCamps = (d.campaigns || []).filter(c => c.sentCount > 0);
                setCampaigns(activeCamps);
                if (activeCamps.length > 0) setSelectedId(activeCamps[0].id);
            })
            .catch(() => {})
            .finally(() => setCampaignsLoading(false));
    }, []);

    // Fetch analytics when campaign selected
    useEffect(() => {
        if (!selectedId) return;
        setLoading(true);
        setError('');
        setAnalytics(null);
        fetch(`${BACKEND_URL}/api/notifications/analytics/${selectedId}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setAnalytics(data);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [selectedId]);

    return (
        <div style={{ padding: '2rem', maxWidth: '900px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontWeight: 800, fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BarChart2 size={22} color="#60a5fa" /> Notification Analytics
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '4px' }}>
                        Campaign delivery performance and engagement metrics
                    </p>
                </div>
                {selectedId && (
                    <button
                        onClick={() => { const id = selectedId; setSelectedId(''); setTimeout(() => setSelectedId(id), 50); }}
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', borderRadius: '10px', padding: '8px 14px',
                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                    >
                        <RefreshCw size={13} /> Refresh
                    </button>
                )}
            </div>

            {/* Campaign Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Select Campaign
                </label>
                {campaignsLoading ? (
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Loading campaigns…</div>
                ) : campaigns.length === 0 ? (
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={14} /> No activated campaigns found. Activate a campaign first.
                    </div>
                ) : (
                    <div style={{ position: 'relative', maxWidth: '400px' }}>
                        <select
                            id="analytics-campaign-select"
                            value={selectedId}
                            onChange={e => setSelectedId(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '12px',
                                color: '#fff',
                                padding: '10px 40px 10px 14px',
                                fontSize: '0.88rem',
                                outline: 'none',
                                cursor: 'pointer',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                            }}
                        >
                            {campaigns.map(c => (
                                <option key={c.id} value={c.id} style={{ background: '#1a1a2e' }}>
                                    {c.title} ({c.status})
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)' }} />
                    </div>
                )}
            </div>

            {/* Analytics content */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>
                    <Loader size={28} style={{ animation: 'spin 0.8s linear infinite', marginBottom: '10px' }} />
                    <p>Fetching analytics data…</p>
                </div>
            )}

            {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '16px 20px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {analytics && !loading && (
                <>
                    {/* Campaign info banner */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(96,165,250,0.06), rgba(167,139,250,0.06))',
                        border: '1px solid rgba(96,165,250,0.15)',
                        borderRadius: '16px', padding: '16px 20px',
                        marginBottom: '1.5rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px',
                    }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Megaphone size={16} color="#a78bfa" />
                                {analytics.title}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: '4px' }}>
                                Activated: {analytics.activatedAt ? new Date(analytics.activatedAt).toLocaleString('en-IN') : 'N/A'}
                            </div>
                        </div>
                        <span style={{
                            background: analytics.status === 'active' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                            color: analytics.status === 'active' ? '#34d399' : '#fbbf24',
                            border: `1px solid ${analytics.status === 'active' ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)'}`,
                            borderRadius: '99px', fontSize: '0.76rem', fontWeight: 700, padding: '4px 12px',
                            textTransform: 'capitalize',
                        }}>
                            {analytics.status}
                        </span>
                    </div>

                    {/* Stat cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '1.5rem' }}>
                        <StatCard icon={Send} label="Total Sent" value={analytics.totalSent.toLocaleString()} color="#60a5fa" />
                        <StatCard icon={BookOpen} label="Total Read" value={analytics.totalRead.toLocaleString()} sub={`${analytics.readRate}% read rate`} color="#a78bfa" />
                        <StatCard icon={MousePointerClick} label="Clicked" value={analytics.totalClicked.toLocaleString()} sub={`${analytics.clickRate}% CTR`} color="#34d399" />
                    </div>

                    {/* Rate bars */}
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '16px', padding: '20px 24px',
                    }}>
                        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)' }}>
                            <TrendingUp size={16} color="#60a5fa" /> Engagement Rates
                        </h3>
                        <RateBar label="Delivery Rate" value="100.0" color="#60a5fa" />
                        <RateBar label="Read Rate" value={analytics.readRate} color="#a78bfa" />
                        <RateBar label="Click-Through Rate (CTR)" value={analytics.clickRate} color="#34d399" />
                    </div>
                </>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
