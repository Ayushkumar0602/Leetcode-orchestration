import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, List, Shield, Filter, RefreshCw } from 'lucide-react';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

export default function AdminLogs() {
    const { currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState('all');

    const fetchLogs = async () => {
        if (!currentUser) return [];
        const token = await currentUser.getIdToken();
        // Uses the generic DB browser endpoint to fetch the admin_logs collection
        const res = await fetch(`${VITE_API_BASE_URL}/api/admin/db/admin_logs?limit=250`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            console.warn("Failed to fetch real admin_logs or collection is empty.");
            return [];
        }
        
        const data = await res.json();
        if (!data.docs || data.docs.length === 0) {
            return []; 
        }
        
        // Sort newest first
        return data.docs.sort((a,b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));
    };

    const { data: logs = [], isLoading, error, refetch } = useQuery({
        queryKey: ['admin-logs'],
        queryFn: fetchLogs,
        enabled: !!currentUser,
        retry: false
    });

    const filteredLogs = logs.filter(l => {
        const matchesSearch = 
            (l.action || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
            (l.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.adminEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesLevel = levelFilter === 'all' || l.level === levelFilter;
        return matchesSearch && matchesLevel;
    });

    const getLevelColor = (level) => {
        switch(level) {
            case 'info': return { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa' };
            case 'warning': return { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' };
            case 'critical': return { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#f87171' };
            default: return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: '#e2e8f0' };
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' }}>Activity Logs</h1>
                    <p style={{ color: 'var(--txt2)', margin: 0 }}>Audit trail of administrative actions and system events.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={16} color="var(--txt3)" />
                        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.9rem', appearance: 'none', paddingRight: '20px' }}>
                            <option value="all" style={{ background: '#1a1b26' }}>All Levels</option>
                            <option value="info" style={{ background: '#1a1b26' }}>Info</option>
                            <option value="warning" style={{ background: '#1a1b26' }}>Warning</option>
                            <option value="critical" style={{ background: '#1a1b26' }}>Critical</option>
                        </select>
                    </div>
                    
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={16} color="var(--txt3)" />
                        <input 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search logs..."
                            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '200px', fontSize: '0.9rem' }}
                        />
                    </div>
                    
                    <button onClick={() => refetch()} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0 16px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            <div style={{ background: 'rgba(20, 22, 30, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--txt3)', fontWeight: 600, width: '160px' }}>Timestamp</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--txt3)', fontWeight: 600, width: '100px' }}>Level</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--txt3)', fontWeight: 600, width: '250px' }}>Action</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--txt3)', fontWeight: 600 }}>Details</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--txt3)', fontWeight: 600 }}>Admin Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: '#3b82f6' }} /></td></tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--txt3)' }}>No audit logs match criteria.</td></tr>
                        ) : (
                            filteredLogs.map(log => {
                                const colors = getLevelColor(log.level || 'info');
                                return (
                                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '16px', color: 'var(--txt3)' }}>
                                        {new Date(log.timestamp || log.createdAt).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ 
                                            background: colors.bg, 
                                            border: `1px solid ${colors.border}`, 
                                            color: colors.text, 
                                            padding: '4px 8px', 
                                            borderRadius: '6px', 
                                            fontSize: '0.7rem', 
                                            fontWeight: 700,
                                            textTransform: 'uppercase'
                                        }}>
                                            {log.level || 'info'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', color: '#fff', fontWeight: 600 }}>
                                        {log.action}
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--txt2)' }}>
                                        {log.details}
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--txt3)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                        {log.adminEmail || log.uid || 'System Action'}
                                    </td>
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}
