import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Database, Search, Loader2, ArrowRight, ShieldAlert, FileJson } from 'lucide-react';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const COMMON_COLLECTIONS = ['users', 'userProfiles', 'interviews', 'problems', 'stats', 'submissions', 'admin_logs'];

export default function AdminDatabase() {
    const { currentUser } = useAuth();
    const [collectionName, setCollectionName] = useState('userProfiles');
    const [inputVal, setInputVal] = useState('userProfiles');
    const [selectedDoc, setSelectedDoc] = useState(null);

    const fetchCollection = async (colName) => {
        if (!currentUser || !colName) return [];
        const token = await currentUser.getIdToken();
        const res = await fetch(`${VITE_API_BASE_URL}/api/admin/db/${colName}?limit=100`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to fetch collection');
        }
        const data = await res.json();
        return data.docs || [];
    };

    const { data: docs = [], isLoading, error, refetch } = useQuery({
        queryKey: ['admin-db', collectionName],
        queryFn: () => fetchCollection(collectionName),
        enabled: !!currentUser && !!collectionName,
        retry: false
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (inputVal.trim()) {
            setCollectionName(inputVal.trim());
            setSelectedDoc(null);
        }
    };

    // Auto-detect columns based on first document keys, ignoring complex nested objects for table view
    const columns = React.useMemo(() => {
        if (!docs.length) return ['id'];
        const keys = new Set(['id']);
        docs.forEach(d => {
            Object.keys(d).forEach(k => {
                if (typeof d[k] !== 'object' || d[k] === null) keys.add(k);
            });
        });
        return Array.from(keys).slice(0, 6); // limit columns
    }, [docs]);

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' }}>Database Administration</h1>
                    <p style={{ color: 'var(--txt2)', margin: 0 }}>Browse Firestore collections securely.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: 0 }}>
                {/* Left: Collection Selector & Doc List */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Database size={16} color="var(--txt3)" />
                            <input 
                                value={inputVal} 
                                onChange={e => setInputVal(e.target.value)}
                                placeholder="Enter collection name..."
                                style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                            />
                        </div>
                        <button type="submit" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', padding: '0 16px', color: '#60a5fa', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            Load <ArrowRight size={14} />
                        </button>
                    </form>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--txt3)', display: 'flex', alignItems: 'center' }}>Common:</span>
                        {COMMON_COLLECTIONS.map(c => (
                            <button key={c} onClick={() => { setInputVal(c); setCollectionName(c); setSelectedDoc(null); }} style={{ background: collectionName === c ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)', border: collectionName === c ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.1)', color: collectionName === c ? '#c084fc' : 'var(--txt2)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                {c}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', color: '#fca5a5' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}><ShieldAlert size={18} /> Error loading collection</div>
                            <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>{error.message}</div>
                        </div>
                    )}

                    <div style={{ flex: 1, background: 'rgba(20, 22, 30, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflowY: 'auto' }}>
                        {isLoading ? (
                            <div style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: '#3b82f6' }} /></div>
                        ) : docs.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--txt3)' }}>No documents found in `{collectionName}`.</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                        {columns.map(col => (
                                            <th key={col} style={{ padding: '12px', textAlign: 'left', color: 'var(--txt3)', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.03)' }}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {docs.map(d => (
                                        <tr 
                                            key={d.id} 
                                            onClick={() => setSelectedDoc(d)}
                                            style={{ 
                                                borderBottom: '1px solid rgba(255,255,255,0.04)', 
                                                cursor: 'pointer',
                                                background: selectedDoc?.id === d.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            {columns.map(col => (
                                                <td key={col} style={{ padding: '12px', color: 'var(--txt2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                                                    {String(d[col] ?? '')}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Right: Document Viewer */}
                <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ flex: 1, background: 'rgba(20, 22, 30, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileJson size={18} color="#a855f7" />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Document Inspector</span>
                        </div>
                        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                            {selectedDoc ? (
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginBottom: '12px', fontFamily: 'monospace' }}>_id: {selectedDoc.id}</div>
                                    <pre style={{ margin: 0, fontSize: '0.8rem', color: '#e8e8e8', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                        {JSON.stringify(selectedDoc, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt3)', fontSize: '0.9rem', textAlign: 'center' }}>
                                    Select a document from the table<br/>to inspect its full JSON contents.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}
