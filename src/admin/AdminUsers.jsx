import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, UserX, ShieldBan, ShieldAlert, CheckCircle2, ExternalLink, FileJson, Save, X } from 'lucide-react';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

export default function AdminUsers() {
    const { currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUid, setSelectedUid] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [authEditor, setAuthEditor] = useState('');
    const [profileEditor, setProfileEditor] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchAdminUsers = async () => {
        if (!currentUser) return [];
        const token = await currentUser.getIdToken();
        const res = await fetch(`${VITE_API_BASE_URL}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to fetch users');
        }
        const data = await res.json();
        return data.users || [];
    };

    const { data: users = [], isLoading, error, refetch } = useQuery({
        queryKey: ['admin-users'],
        queryFn: fetchAdminUsers,
        enabled: !!currentUser,
        retry: false
    });

    const handleSuspend = async (uid, currentStatus) => {
        const confirmMsg = currentStatus 
            ? "Are you sure you want to reactivate this user?" 
            : "Are you sure you want to suspend this user? They will not be able to log in.";
        if (!window.confirm(confirmMsg)) return;

        try {
            const token = await currentUser.getIdToken();
            const res = await fetch(`${VITE_API_BASE_URL}/api/admin/users/${uid}/suspend`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ disabled: !currentStatus })
            });
            if (res.ok) refetch();
            else alert("Failed to update user status.");
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (uid) => {
        if (!window.confirm("CRITICAL WARNING: Are you sure you want to permamently delete this user from Firebase Auth? This cannot be undone.")) return;

        try {
            const token = await currentUser.getIdToken();
            const res = await fetch(`${VITE_API_BASE_URL}/api/admin/users/${uid}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) refetch();
            else alert("Failed to delete user.");
        } catch (err) {
            console.error(err);
        }
    };

    const filteredUsers = users.filter(u => 
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.uid.includes(searchTerm)
    );

    const openDetail = async (uid) => {
        if (!currentUser || !uid) return;
        setSelectedUid(uid);
        setDetail(null);
        setAuthEditor('');
        setProfileEditor('');
        setDetailLoading(true);
        try {
            const token = await currentUser.getIdToken();
            const res = await fetch(`${VITE_API_BASE_URL}/api/admin/users/${uid}/detail`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load user detail');
            setDetail(data);
            setAuthEditor(JSON.stringify(data.auth || {}, null, 2));
            setProfileEditor(JSON.stringify(data.profile || {}, null, 2));
        } catch (e) {
            alert(e.message);
        } finally {
            setDetailLoading(false);
        }
    };

    const saveDetail = async () => {
        if (!currentUser || !selectedUid) return;
        setSaving(true);
        try {
            const token = await currentUser.getIdToken();
            const auth = JSON.parse(authEditor || '{}');
            const profile = JSON.parse(profileEditor || '{}');
            const res = await fetch(`${VITE_API_BASE_URL}/api/admin/users/${selectedUid}/detail`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ auth, profile }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to save user');
            await refetch();
            await openDetail(selectedUid);
        } catch (e) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' }}>User Management</h1>
                    <p style={{ color: 'var(--txt2)', margin: 0 }}>View, suspend, or delete registered users.</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={16} color="var(--txt3)" />
                    <input 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search users..."
                        style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '200px', fontSize: '0.9rem' }}
                    />
                </div>
            </div>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', color: '#fca5a5', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}><ShieldAlert size={18} /> Access Error</div>
                    <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>{error.message}</div>
                    {error.message.includes('configured') && <div style={{ fontSize: '0.8rem', marginTop: '8px', opacity: 0.8 }}>Note: Firebase Admin SDK requires `FIREBASE_SERVICE_ACCOUNT_KEY` to list and modify Auth users.</div>}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: selectedUid ? '1.2fr 0.8fr' : '1fr', gap: 16, alignItems: 'start' }}>
                <div style={{ background: 'rgba(20, 22, 30, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--txt3)', fontSize: '0.8rem', fontWeight: 600 }}>User</th>
                                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--txt3)', fontSize: '0.8rem', fontWeight: 600 }}>UID</th>
                                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--txt3)', fontSize: '0.8rem', fontWeight: 600 }}>Created</th>
                                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--txt3)', fontSize: '0.8rem', fontWeight: 600 }}>Last Sign In</th>
                                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--txt3)', fontSize: '0.8rem', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '16px', textAlign: 'right', color: 'var(--txt3)', fontSize: '0.8rem', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto', color: '#3b82f6' }} /></td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--txt3)' }}>No users found.</td></tr>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr key={u.uid} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: selectedUid === u.uid ? 'rgba(59,130,246,0.10)' : 'transparent', cursor: 'pointer' }} onClick={() => openDetail(u.uid)}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName||'U'}&background=3b82f6&color=fff`} style={{ width: '36px', height: '36px', borderRadius: '50%' }} alt="" />
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.displayName || 'Unnamed User'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--txt3)' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--txt2)' }}>{u.uid}</td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--txt2)' }}>{new Date(u.creationTime).toLocaleDateString()}</td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--txt2)' }}>{u.lastSignInTime ? new Date(u.lastSignInTime).toLocaleDateString() : 'Never'}</td>
                                        <td style={{ padding: '16px' }}>
                                            {u.disabled
                                                ? <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ShieldBan size={12} /> Suspended</span>
                                                : <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Active</span>
                                            }
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleSuspend(u.uid, u.disabled); }}
                                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}
                                                >
                                                    {u.disabled ? 'Reactivate' : 'Suspend'}
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(u.uid); }}
                                                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', padding: '6px 10px', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <UserX size={12} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {selectedUid && (
                    <div style={{ background: 'rgba(20, 22, 30, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', position: 'sticky', top: 16 }}>
                        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
                                <FileJson size={16} color="#a855f7" /> User detail
                            </div>
                            <button onClick={() => { setSelectedUid(null); setDetail(null); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '6px 10px', color: '#fff', cursor: 'pointer', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <X size={14} /> Close
                            </button>
                        </div>
                        <div style={{ padding: 16 }}>
                            {detailLoading ? (
                                <div style={{ padding: 24, textAlign: 'center', color: 'var(--txt3)' }}>
                                    <Loader2 className="animate-spin" style={{ margin: '0 auto', color: '#3b82f6' }} />
                                    <div style={{ marginTop: 10 }}>Loading user…</div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--txt3)', fontFamily: 'monospace', marginBottom: 10 }}>uid: {selectedUid}</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                                        <div>
                                            <div style={{ fontWeight: 800, marginBottom: 6, color: '#93c5fd' }}>Auth (editable)</div>
                                            <textarea value={authEditor} onChange={e => setAuthEditor(e.target.value)} rows={10} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: 12, color: '#e8e8e8', outline: 'none', fontFamily: 'monospace', fontSize: '0.8rem' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, marginBottom: 6, color: '#6ee7b7' }}>Firestore userProfiles/{selectedUid} (editable)</div>
                                            <textarea value={profileEditor} onChange={e => setProfileEditor(e.target.value)} rows={12} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: 12, color: '#e8e8e8', outline: 'none', fontFamily: 'monospace', fontSize: '0.8rem' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <button onClick={saveDetail} disabled={saving} style={{ flex: 1, background: 'rgba(59,130,246,0.16)', border: '1px solid rgba(59,130,246,0.30)', borderRadius: 12, padding: '10px 12px', color: '#93c5fd', fontWeight: 900, cursor: saving ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                                <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
                                            </button>
                                            <button onClick={() => window.open(`/public/${selectedUid}`, '_blank')} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: '10px 12px', color: '#fff', fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                                <ExternalLink size={16} /> Public
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
