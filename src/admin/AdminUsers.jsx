import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, UserX, ShieldBan, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

export default function AdminUsers() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

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

    const openUserPage = (uid) => {
        if (!uid) return;
        navigate(`/admin/users/${uid}`);
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
                            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}><Loader2 style={{ margin: '0 auto', color: '#3b82f6' }} /></td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--txt3)' }}>No users found.</td></tr>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr key={u.uid} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }} onClick={() => openUserPage(u.uid)}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <img
                                                    src={u.photoURL || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(u.displayName || 'U') + '&background=3b82f6&color=fff')}
                                                    style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                                                    alt=""
                                                />
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
                                                    onClick={(e) => { e.stopPropagation(); openUserPage(u.uid); }}
                                                    style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.22)', borderRadius: '6px', padding: '6px 10px', color: '#93c5fd', fontSize: '0.75rem', cursor: 'pointer' }}
                                                >
                                                    Open
                                                </button>
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
        </div>
    );
}
