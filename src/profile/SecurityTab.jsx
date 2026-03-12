import { useState } from 'react';
import { Shield, Lock, Clock, Monitor, Smartphone, Key, AlertTriangle } from 'lucide-react';

const glass = { background: 'rgba(20,22,30,0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem' };

const Row = ({ icon: Icon, color, label, sub, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 34, height: 34, borderRadius: '9px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={15} color={color} /></div>
            <div><div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{label}</div><div style={{ fontSize: '0.7rem', color: 'var(--txt3)' }}>{sub}</div></div>
        </div>
        {children}
    </div>
);

export default function SecurityTab({ currentUser }) {
    const [twoFA, setTwoFA] = useState(false);
    const [sessionWipe, setSessionWipe] = useState(false);

    const isGoogle = currentUser?.providerData?.[0]?.providerId === 'google.com';

    const loginHistory = [
        { device: 'Chrome · macOS', time: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), icon: Monitor },
        { device: 'Chrome · macOS', time: 'Yesterday', icon: Monitor },
        { device: 'Safari · iOS', time: '2 days ago', icon: Smartphone },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Password & 2FA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={glass}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lock size={16} color="#a855f7" /> Authentication
                    </div>

                    {isGoogle ? (
                        <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <Shield size={14} color="#3b82f6" />
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#60a5fa' }}>Managed by Google</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--txt3)', margin: 0 }}>Your account is secured by Google OAuth. Password management and 2FA are handled by Google directly.</p>
                        </div>
                    ) : (
                        <Row icon={Key} color="#a855f7" label="Change Password" sub="Last changed recently">
                            <button style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '8px', padding: '6px 14px', color: '#c084fc', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Update</button>
                        </Row>
                    )}

                    <Row icon={Shield} color="#06b6d4" label="Two-Factor Authentication" sub={twoFA ? '2FA is enabled' : '2FA is disabled — turn on for security'}>
                        <div onClick={() => setTwoFA(p => !p)} style={{ width: 36, height: 20, borderRadius: '10px', cursor: 'pointer', background: twoFA ? '#06b6d4' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s' }}>
                            <div style={{ position: 'absolute', top: '2px', left: twoFA ? '18px' : '2px', width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                        </div>
                    </Row>

                    <Row icon={Key} color="#10b981" label="Recovery Email" sub={currentUser?.email || '—'}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--txt3)', background: 'rgba(16,185,129,0.1)', borderRadius: '6px', padding: '3px 8px' }}>Verified</span>
                    </Row>
                </div>

                {/* Active Sessions */}
                <div style={glass}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Monitor size={16} color="#f59e0b" /> Active Sessions
                    </div>
                    <Row icon={Monitor} color="#10b981" label="Current Session" sub="Chrome · macOS · India">
                        <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', borderRadius: '6px', padding: '3px 8px' }}>Active</span>
                    </Row>
                    <button onClick={() => setSessionWipe(true)} style={{ width: '100%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px', color: '#ef4444', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
                        Sign Out All Other Sessions
                    </button>
                    {sessionWipe && <p style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '8px', textAlign: 'center' }}>✓ All other sessions have been revoked.</p>}
                </div>
            </div>

            {/* Login History */}
            <div style={glass}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="#3b82f6" /> Login History
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--txt3)', marginBottom: '1rem' }}>Recent sign-in activity</p>
                {loginHistory.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: i === 0 ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${i === 0 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)'}`, marginBottom: '8px' }}>
                        <entry.icon size={14} color={i === 0 ? '#10b981' : 'var(--txt3)'} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{entry.device}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--txt3)' }}>{entry.time}</div>
                        </div>
                        {i === 0 && <span style={{ fontSize: '0.65rem', color: '#10b981', background: 'rgba(16,185,129,0.12)', borderRadius: '6px', padding: '2px 8px', fontWeight: 700 }}>Current</span>}
                    </div>
                ))}

                {/* Security tips */}
                <div style={{ marginTop: '1.5rem', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <AlertTriangle size={14} color="#f59e0b" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24' }}>Security Tips</span>
                    </div>
                    {['Enable 2FA for extra account security.', 'Always sign out on shared devices.', 'Never share your account credentials.'].map(tip => (
                        <p key={tip} style={{ fontSize: '0.72rem', color: 'var(--txt3)', margin: '0 0 4px 0' }}>• {tip}</p>
                    ))}
                </div>
            </div>
        </div>
    );
}
