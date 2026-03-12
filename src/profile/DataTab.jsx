import { useState } from 'react';
import { Download, Trash2, UserX, QrCode, Copy, ExternalLink, AlertTriangle } from 'lucide-react';

const glass = { background: 'rgba(20,22,30,0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem' };

export default function DataTab({ currentUser, userStats, interviews }) {
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deactivateConfirm, setDeactivateConfirm] = useState(false);
    const [copied, setCopied] = useState(false);

    const publicUrl = `${window.location.origin}/public/${currentUser?.uid}`;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(publicUrl)}&bgcolor=0d0d0d&color=a855f7&margin=10`;

    const downloadData = () => {
        const data = {
            exportedAt: new Date().toISOString(),
            user: { uid: currentUser?.uid, name: currentUser?.displayName, email: currentUser?.email },
            stats: userStats,
            interviews: interviews,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'codearena_data.json'; a.click();
        URL.revokeObjectURL(url);
    };

    const copy = () => { navigator.clipboard.writeText(publicUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* QR Code */}
            <div style={{ ...glass, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <QrCode size={16} color="#a855f7" /> Public Profile QR Code
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--txt3)', textAlign: 'center', margin: 0 }}>Anyone who scans this QR code can view your public profile, stats, and badges.</p>

                {/* QR image with glow frame */}
                <div style={{ padding: '12px', background: 'rgba(168,85,247,0.08)', border: '2px solid rgba(168,85,247,0.3)', borderRadius: '20px', boxShadow: '0 0 40px rgba(168,85,247,0.2)' }}>
                    <img src={qrSrc} alt="Profile QR Code" style={{ width: '180px', height: '180px', display: 'block', borderRadius: '12px' }} />
                </div>

                <div style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ flex: 1, fontSize: '0.72rem', color: 'var(--txt3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{publicUrl}</span>
                    <button onClick={copy} style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '7px', padding: '5px 10px', cursor: 'pointer', color: '#c084fc', fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <Copy size={11} />{copied ? 'Copied!' : 'Copy'}
                    </button>
                    <a href={publicUrl} target="_blank" rel="noreferrer" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '7px', padding: '5px 10px', color: '#60a5fa', fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', flexShrink: 0 }}>
                        <ExternalLink size={11} />Open
                    </a>
                </div>
            </div>

            {/* Data & Account management */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Download */}
                <div style={glass}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={16} color="#10b981" /> Data Export
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--txt3)', marginBottom: '1rem' }}>Download a complete copy of your CodeArena data including submissions, stats, and interview history (GDPR compliant).</p>
                    <button onClick={downloadData} style={{ width: '100%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '12px', color: '#34d399', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                        <Download size={16} /> Download My Data (JSON)
                    </button>
                </div>

                {/* Danger zone */}
                <div style={{ ...glass, border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                        <AlertTriangle size={16} /> Danger Zone
                    </div>

                    {/* Deactivate */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <UserX size={14} color="#f59e0b" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Deactivate Account</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--txt3)', margin: '0 0 10px 0' }}>Temporarily disable your account. You can reactivate it any time by signing in.</p>
                        {!deactivateConfirm ? (
                            <button onClick={() => setDeactivateConfirm(true)} style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '7px 16px', color: '#fbbf24', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Deactivate</button>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Are you sure?</span>
                                <button onClick={() => setDeactivateConfirm(false)} style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '8px', padding: '5px 12px', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Confirm</button>
                                <button onClick={() => setDeactivateConfirm(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '5px 12px', color: 'var(--txt3)', fontSize: '0.75rem', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        )}
                    </div>

                    {/* Delete */}
                    <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <Trash2 size={14} color="#ef4444" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>Delete Account</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--txt3)', margin: '0 0 10px 0' }}>Permanently delete your account and all data. This cannot be undone. Type <strong style={{ color: '#ef4444' }}>DELETE</strong> to confirm.</p>
                        <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder='Type "DELETE" to confirm...'
                            style={{ width: '100%', background: 'rgba(239,68,68,0.06)', border: `1px solid ${deleteConfirm === 'DELETE' ? '#ef4444' : 'rgba(239,68,68,0.2)'}`, borderRadius: '8px', padding: '8px 12px', color: '#ef4444', fontSize: '0.78rem', outline: 'none', marginBottom: '8px', boxSizing: 'border-box' }} />
                        <button disabled={deleteConfirm !== 'DELETE'} style={{ background: deleteConfirm === 'DELETE' ? '#ef4444' : 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '8px 16px', color: deleteConfirm === 'DELETE' ? '#fff' : '#ef4444', fontSize: '0.78rem', fontWeight: 700, cursor: deleteConfirm === 'DELETE' ? 'pointer' : 'not-allowed', opacity: deleteConfirm === 'DELETE' ? 1 : 0.6 }}>
                            Delete Account Permanently
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
