// src/admin/AdminCampaigns.jsx
import React, { useState, useEffect } from 'react';
import {
    Megaphone, Plus, Play, Pause, Trash2, BarChart2,
    X, Check, AlertCircle, Users, Clock, Tag,
    Globe, ChevronDown, Loader
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://whizan-backend.onrender.com';

const STATUS_CONFIG = {
    draft:   { bg: 'rgba(255,255,255,0.06)', color: '#9ca3af', label: 'Draft' },
    active:  { bg: 'rgba(52,211,153,0.1)',   color: '#34d399', label: 'Active' },
    paused:  { bg: 'rgba(251,191,36,0.1)',   color: '#fbbf24', label: 'Paused' },
    expired: { bg: 'rgba(239,68,68,0.1)',    color: '#ef4444', label: 'Expired' },
};

const TYPE_OPTIONS  = ['popup', 'feed', 'announcement'];
const TARGET_OPTIONS = ['all_users', 'free_users', 'paid_users'];
const PRIORITY_OPTIONS = ['low', 'normal', 'high', 'urgent'];
const DISPLAY_OPTIONS = ['popup', 'feed'];

function Badge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    return (
        <span style={{
            background: cfg.bg, color: cfg.color,
            borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700,
            padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px',
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
            {cfg.label}
        </span>
    );
}

function FieldGroup({ label, children }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
            </label>
            {children}
        </div>
    );
}

const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
    color: '#fff', padding: '10px 14px', fontSize: '0.88rem',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
    fontFamily: 'Inter, system-ui, sans-serif',
};

const selectStyle = { ...inputStyle, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' };

function CreateModal({ onClose, onCreated }) {
    const [form, setForm] = useState({
        title: '', message: '', type: 'feed', target: 'all_users',
        displayType: 'feed', link: '', priority: 'normal',
        startAt: '', expiresAt: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.message.trim()) {
            setError('Title and message are required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const res = await fetch(`${BACKEND_URL}/api/notifications/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create');
            onCreated(data);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
            <div style={{
                background: 'rgba(16,18,26,0.99)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px', width: '100%', maxWidth: '540px',
                maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
            }}>
                {/* Modal header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '10px',
                            background: 'rgba(167,139,250,0.12)',
                            border: '1px solid rgba(167,139,250,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Megaphone size={16} color="#a78bfa" />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '1rem' }}>New Campaign</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', color: '#ef4444', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    <FieldGroup label="Campaign Title *">
                        <input id="camp-title" style={inputStyle} placeholder="e.g. New Feature Release" value={form.title} onChange={e => set('title', e.target.value)} />
                    </FieldGroup>

                    <FieldGroup label="Message *">
                        <textarea id="camp-message" style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Enter the notification message…" value={form.message} onChange={e => set('message', e.target.value)} />
                    </FieldGroup>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <FieldGroup label="Campaign Type">
                            <div style={{ position: 'relative' }}>
                                <select id="camp-type" style={selectStyle} value={form.type} onChange={e => { set('type', e.target.value); set('displayType', e.target.value === 'announcement' ? 'feed' : e.target.value); }}>
                                    {TYPE_OPTIONS.map(t => <option key={t} value={t} style={{ background: '#1a1a2e' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                </select>
                                <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)' }} />
                            </div>
                        </FieldGroup>
                        <FieldGroup label="Display As">
                            <div style={{ position: 'relative' }}>
                                <select id="camp-display" style={selectStyle} value={form.displayType} onChange={e => set('displayType', e.target.value)}>
                                    {DISPLAY_OPTIONS.map(d => <option key={d} value={d} style={{ background: '#1a1a2e' }}>{d === 'popup' ? 'Popup Toast' : 'Notification Feed'}</option>)}
                                </select>
                                <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)' }} />
                            </div>
                        </FieldGroup>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <FieldGroup label="Target Audience">
                            <div style={{ position: 'relative' }}>
                                <select id="camp-target" style={selectStyle} value={form.target} onChange={e => set('target', e.target.value)}>
                                    {TARGET_OPTIONS.map(t => <option key={t} value={t} style={{ background: '#1a1a2e' }}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                                </select>
                                <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)' }} />
                            </div>
                        </FieldGroup>
                        <FieldGroup label="Priority">
                            <div style={{ position: 'relative' }}>
                                <select id="camp-priority" style={selectStyle} value={form.priority} onChange={e => set('priority', e.target.value)}>
                                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p} style={{ background: '#1a1a2e' }}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                                </select>
                                <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)' }} />
                            </div>
                        </FieldGroup>
                    </div>

                    <FieldGroup label="Action Link (optional)">
                        <input id="camp-link" style={inputStyle} placeholder="/dashboard/feature" value={form.link} onChange={e => set('link', e.target.value)} />
                    </FieldGroup>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <FieldGroup label="Start Date (optional)">
                            <input id="camp-start" type="datetime-local" style={inputStyle} value={form.startAt} onChange={e => set('startAt', e.target.value)} />
                        </FieldGroup>
                        <FieldGroup label="Expiry Date (optional)">
                            <input id="camp-expiry" type="datetime-local" style={inputStyle} value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
                        </FieldGroup>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', padding: '9px 18px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button
                        id="camp-save-btn"
                        onClick={handleSubmit}
                        disabled={saving}
                        style={{
                            background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                            border: 'none', color: '#fff', borderRadius: '10px',
                            padding: '9px 20px', fontSize: '0.85rem', fontWeight: 700,
                            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', gap: '7px',
                        }}
                    >
                        {saving ? <><Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving…</> : <><Check size={14} /> Save Campaign</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminCampaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activating, setActivating] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchCampaigns = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/notifications/campaigns`);
            const data = await res.json();
            setCampaigns(data.campaigns || []);
        } catch (err) {
            console.error('Failed to fetch campaigns:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCampaigns(); }, []);

    const handleActivate = async (campaignId) => {
        setActivating(campaignId);
        try {
            const res = await fetch(`${BACKEND_URL}/api/notifications/campaigns/${campaignId}/activate`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Activation failed');
            showToast(`✅ Campaign activated! Sent to ${data.sentCount} users.`);
            fetchCampaigns();
        } catch (err) {
            showToast(`❌ ${err.message}`, 'error');
        } finally {
            setActivating(null);
        }
    };

    const handlePause = async (campaignId) => {
        try {
            await fetch(`${BACKEND_URL}/api/notifications/campaigns/${campaignId}/pause`, { method: 'POST' });
            showToast('⏸ Campaign paused.');
            fetchCampaigns();
        } catch (err) {
            showToast(`❌ Failed to pause.`, 'error');
        }
    };

    const handleDelete = async (campaignId) => {
        if (!window.confirm('Delete this campaign? This cannot be undone.')) return;
        try {
            await fetch(`${BACKEND_URL}/api/notifications/campaigns/${campaignId}`, { method: 'DELETE' });
            showToast('🗑 Campaign deleted.');
            setCampaigns(prev => prev.filter(c => c.id !== campaignId));
        } catch (err) {
            showToast(`❌ Failed to delete.`, 'error');
        }
    };

    const handleCreated = (newCamp) => {
        setCampaigns(prev => [{ ...newCamp, id: newCamp.campaignId }, ...prev]);
        showToast('✅ Campaign created! Activate it to send notifications.');
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px' }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '24px', right: '24px', zIndex: 99999,
                    background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(52,211,153,0.12)',
                    border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(52,211,153,0.25)'}`,
                    borderRadius: '14px', padding: '12px 20px',
                    color: toast.type === 'error' ? '#ef4444' : '#34d399',
                    fontWeight: 600, fontSize: '0.88rem',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(12px)',
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontWeight: 800, fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Megaphone size={22} color="#a78bfa" /> Campaign Management
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '4px' }}>
                        Create and manage notification campaigns for your users
                    </p>
                </div>
                <button
                    id="new-campaign-btn"
                    onClick={() => setShowModal(true)}
                    style={{
                        background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                        border: 'none', color: '#fff', borderRadius: '12px',
                        padding: '10px 18px', fontSize: '0.88rem', fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    }}
                >
                    <Plus size={16} /> New Campaign
                </button>
            </div>

            {/* Stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '2rem' }}>
                {[
                    { label: 'Total', value: campaigns.length, icon: Tag, color: '#a78bfa' },
                    { label: 'Active', value: campaigns.filter(c => c.status === 'active').length, icon: Globe, color: '#34d399' },
                    { label: 'Draft', value: campaigns.filter(c => c.status === 'draft').length, icon: Clock, color: '#fbbf24' },
                ].map(s => (
                    <div key={s.label} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '14px', padding: '16px 18px',
                        display: 'flex', gap: '12px', alignItems: 'center',
                    }}>
                        <s.icon size={20} color={s.color} />
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.4rem', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: '2px' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Campaign list */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>
                    <Loader size={28} style={{ animation: 'spin 0.8s linear infinite', marginBottom: '10px' }} />
                    <p>Loading campaigns…</p>
                </div>
            ) : campaigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Megaphone size={40} color="rgba(167,139,250,0.3)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, margin: '0 0 8px' }}>No campaigns yet</h3>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Create your first campaign to start reaching users.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {campaigns.map(camp => (
                        <div key={camp.id} style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '16px', padding: '18px 20px',
                            display: 'flex', gap: '16px', alignItems: 'flex-start',
                        }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{camp.title}</span>
                                    <Badge status={camp.status} />
                                    <span style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '6px', fontSize: '0.7rem', padding: '2px 8px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'capitalize' }}>
                                        {camp.type}
                                    </span>
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.83rem', margin: '0 0 10px', lineHeight: 1.5 }}>
                                    {camp.message}
                                </p>
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                                    <span><Users size={11} style={{ verticalAlign: 'middle' }} /> {camp.target?.replace(/_/g, ' ')}</span>
                                    <span><Clock size={11} style={{ verticalAlign: 'middle' }} /> {camp.createdAt ? new Date(camp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                                    {camp.sentCount > 0 && <span>📨 Sent to {camp.sentCount} users</span>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                                {camp.status !== 'active' && (
                                    <button
                                        id={`activate-${camp.id}`}
                                        onClick={() => handleActivate(camp.id)}
                                        disabled={activating === camp.id}
                                        style={{
                                            background: 'rgba(52,211,153,0.1)',
                                            border: '1px solid rgba(52,211,153,0.25)',
                                            color: '#34d399', borderRadius: '10px',
                                            padding: '7px 14px', fontSize: '0.78rem',
                                            fontWeight: 700, cursor: activating === camp.id ? 'wait' : 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                        }}
                                    >
                                        {activating === camp.id ? <Loader size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Play size={12} />}
                                        Activate
                                    </button>
                                )}
                                {camp.status === 'active' && (
                                    <button
                                        onClick={() => handlePause(camp.id)}
                                        style={{
                                            background: 'rgba(251,191,36,0.1)',
                                            border: '1px solid rgba(251,191,36,0.25)',
                                            color: '#fbbf24', borderRadius: '10px',
                                            padding: '7px 14px', fontSize: '0.78rem',
                                            fontWeight: 700, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                        }}
                                    >
                                        <Pause size={12} /> Pause
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(camp.id)}
                                    style={{
                                        background: 'rgba(239,68,68,0.08)',
                                        border: '1px solid rgba(239,68,68,0.15)',
                                        color: '#ef4444', borderRadius: '10px',
                                        padding: '7px 10px', fontSize: '0.78rem',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    }}
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && <CreateModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
