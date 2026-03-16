import { useState } from 'react';
import { Palette, Layout, Eye, Sun, Moon, BellRing } from 'lucide-react';

const glass = { background: 'rgba(20,22,30,0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem' };

const THEMES = [
    { name: 'Purple', accent: '#a855f7', gradient: 'linear-gradient(135deg, #a855f7, #6d28d9)' },
    { name: 'Blue', accent: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
    { name: 'Emerald', accent: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #065f46)' },
    { name: 'Amber', accent: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #b45309)' },
    { name: 'Rose', accent: '#f43f5e', gradient: 'linear-gradient(135deg, #f43f5e, #be123c)' },
    { name: 'Cyan', accent: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0e7490)' },
];

const LAYOUTS = ['Compact', 'Comfortable', 'Wide'];
const TEMPLATES = ['Signature', 'Cinematic', 'Interactive3D'];

export default function CustomizationTab({ preferences, onSave }) {
    const [prefs, setPrefs] = useState({
        theme: 'Purple', layout: 'Comfortable', darkMode: true, template: 'Signature',
        isPublic: true, showInterviews: true, showStats: true, showBadges: true, showActivity: true,
        enablePopups: true, enableFeed: true, muteCampaigns: false,
        ...preferences
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const upd = (k, v) => setPrefs(p => ({ ...p, [k]: v }));

    const save = async () => {
        setSaving(true);
        await onSave({ preferences: prefs });
        setSaving(false); setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Theme */}
            <div style={glass}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Palette size={16} color="#a855f7" /> Profile Theme
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth <= 480 ? 'repeat(3, 1fr)' : window.innerWidth <= 768 ? 'repeat(4, 1fr)' : 'repeat(6, 1fr)', gap: '10px' }}>
                    {THEMES.map(t => (
                        <div key={t.name} onClick={() => upd('theme', t.name)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: t.gradient, border: prefs.theme === t.name ? `3px solid #fff` : '3px solid transparent', transition: 'all 0.2s', boxShadow: prefs.theme === t.name ? `0 0 20px ${t.accent}60` : 'none' }} />
                            <span style={{ fontSize: '0.65rem', color: prefs.theme === t.name ? '#fff' : 'var(--txt3)', fontWeight: prefs.theme === t.name ? 700 : 400 }}>{t.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Layout, Template & Mode */}
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth <= 900 ? '1fr' : '1.2fr 0.9fr', gap: '1.5rem' }}>
                <div style={glass}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layout size={16} color="#3b82f6" /> Layout & Template
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* Layout selector */}
                        <div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--txt3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                Layout width
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {LAYOUTS.map(l => (
                                    <div key={l} onClick={() => upd('layout', l)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', background: prefs.layout === l ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${prefs.layout === l ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: prefs.layout === l ? '#60a5fa' : 'var(--txt2)' }}>{l}</span>
                                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${prefs.layout === l ? '#3b82f6' : 'rgba(255,255,255,0.2)'}`, background: prefs.layout === l ? '#3b82f6' : 'transparent' }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Template selector */}
                        <div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--txt3)', margin: '10px 0 6px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                Portfolio template
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {TEMPLATES.map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => upd('template', t)}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '999px',
                                            border: `1px solid ${prefs.template === t ? '#a855f7' : 'rgba(255,255,255,0.16)'}`,
                                            background: prefs.template === t ? 'rgba(168,85,247,0.18)' : 'rgba(15,23,42,0.6)',
                                            color: '#e5e7eb',
                                            fontSize: '0.78rem',
                                            fontWeight: prefs.template === t ? 700 : 500,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {t === 'Signature'
                                            ? 'Signature (default)'
                                            : t === 'Cinematic'
                                                ? 'Cinematic'
                                                : 'Interactive 3D'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={glass}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {prefs.darkMode ? <Moon size={16} color="#818cf8" /> : <Sun size={16} color="#f59e0b" />} Appearance
                    </div>
                    {[
                        { key: 'darkMode', label: 'Dark Mode', sub: 'Dark background and UI', icon: Moon },
                        { key: 'isPublic', label: 'Public Profile', sub: 'Others can view your profile', icon: Eye },
                    ].map(row => (
                        <div key={row.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <row.icon size={14} color="var(--txt3)" />
                                <div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{row.label}</div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--txt3)' }}>{row.sub}</div>
                                </div>
                            </div>
                            <div onClick={() => upd(row.key, !prefs[row.key])} style={{ width: 36, height: 20, borderRadius: '10px', cursor: 'pointer', background: prefs[row.key] ? '#a855f7' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s' }}>
                                <div style={{ position: 'absolute', top: '2px', left: prefs[row.key] ? '18px' : '2px', width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notification Preferences */}
            <div style={glass}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BellRing size={16} color="#fbbf24" /> Notification Preferences
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth <= 640 ? '1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
                    {[
                        { key: 'enablePopups', label: 'Popup Alerts', sub: 'In-app popup toasts', icon: Sun },
                        { key: 'enableFeed', label: 'Notif Feed', sub: 'Show in bell dropdown', icon: Layout },
                        { key: 'muteCampaigns', label: 'Mute Campaigns', sub: 'Hide global broadcasts', icon: Moon },
                    ].map(row => (
                        <div key={row.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{row.label}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--txt3)', marginTop: '2px' }}>{row.sub}</div>
                            </div>
                            <div onClick={() => upd(row.key, !prefs[row.key])} style={{ width: 34, height: 18, borderRadius: '9px', cursor: 'pointer', background: prefs[row.key] ? '#fbbf24' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                                <div style={{ position: 'absolute', top: '2px', left: prefs[row.key] ? '18px' : '2px', width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Public Profile widget pinning */}
            <div style={glass}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Eye size={16} color="#10b981" /> Featured Content (Public Profile)
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--txt3)', marginBottom: '1rem' }}>Choose what's visible on your public QR profile.</p>
                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth <= 480 ? '1fr' : '1fr 1fr', gap: '8px' }}>
                    {[{ key: 'showStats', label: 'Problem Stats' }, { key: 'showInterviews', label: 'Interview History' }, { key: 'showBadges', label: 'Achievements' }, { key: 'showActivity', label: 'Activity Calendar' }].map(row => (
                        <div key={row.key} onClick={() => upd(row.key, !prefs[row.key])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', background: prefs[row.key] ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${prefs[row.key] ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: prefs[row.key] ? '#34d399' : 'var(--txt3)' }}>{row.label}</span>
                            <div style={{ width: 16, height: 16, borderRadius: '4px', border: `2px solid ${prefs[row.key] ? '#10b981' : 'rgba(255,255,255,0.2)'}`, background: prefs[row.key] ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#fff' }}>{prefs[row.key] ? '✓' : ''}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={save} disabled={saving} style={{ background: saved ? '#10b981' : 'linear-gradient(135deg, #a855f7, #3b82f6)', border: 'none', borderRadius: '12px', padding: '12px 32px', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s' }}>
                    {saving ? 'Saving…' : saved ? '✓ Applied!' : 'Apply Changes'}
                </button>
            </div>
        </div>
    );
}
