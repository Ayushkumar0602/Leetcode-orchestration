import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Database, Loader2, ArrowRight, ShieldAlert, FileJson, Save, Trash2, Plus, Filter, ArrowUpDown } from 'lucide-react';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

const COMMON_COLLECTIONS = ['users', 'userProfiles', 'interviews', 'problems', 'stats', 'submissions', 'admin_logs'];

export default function AdminDatabase() {
    const { currentUser } = useAuth();
    const [collectionName, setCollectionName] = useState('userProfiles');
    const [inputVal, setInputVal] = useState('userProfiles');
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [docEditor, setDocEditor] = useState('');
    const [docIdInput, setDocIdInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [whereField, setWhereField] = useState('');
    const [whereOp, setWhereOp] = useState('==');
    const [whereValue, setWhereValue] = useState('');
    const [whereType, setWhereType] = useState('string'); // string|number|boolean|null|json
    const [orderByField, setOrderByField] = useState('');
    const [orderDir, setOrderDir] = useState('desc');

    const fetchCollection = async (colName) => {
        if (!currentUser || !colName) return [];
        const token = await currentUser.getIdToken();
        const params = new URLSearchParams();
        params.set('limit', '100');
        if (whereField.trim()) {
            params.set('whereField', whereField.trim());
            params.set('whereOp', whereOp);
            params.set('whereValue', whereValue);
            params.set('whereType', whereType);
        }
        if (orderByField.trim()) {
            params.set('orderBy', orderByField.trim());
            params.set('orderDir', orderDir);
        }
        const res = await fetch(`${VITE_API_BASE_URL}/api/admin/db/${colName}?${params.toString()}`, {
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
        queryKey: ['admin-db', collectionName, whereField, whereOp, whereValue, whereType, orderByField, orderDir],
        queryFn: () => fetchCollection(collectionName),
        enabled: !!currentUser && !!collectionName,
        retry: false
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (inputVal.trim()) {
            setCollectionName(inputVal.trim());
            setSelectedDoc(null);
            setDocEditor('');
            setDocIdInput('');
        }
    };

    // Auto-detect columns based on first document keys, ignoring complex nested objects for table view
    const columns = useMemo(() => {
        if (!docs.length) return ['id'];
        const keys = new Set(['id']);
        docs.forEach(d => {
            Object.keys(d).forEach(k => {
                if (typeof d[k] !== 'object' || d[k] === null) keys.add(k);
            });
        });
        return Array.from(keys).slice(0, 6); // limit columns
    }, [docs]);

    const loadSelectedIntoEditor = (d) => {
        setSelectedDoc(d);
        setDocIdInput(d?.id || '');
        setDocEditor(JSON.stringify(d, null, 2));
    };

    const saveDoc = async () => {
        if (!currentUser || !collectionName) return;
        setSaving(true);
        try {
            const parsed = JSON.parse(docEditor || '{}');
            const id = String(docIdInput || parsed.id || '').trim();
            const payload = { ...parsed };
            delete payload.id;
            const token = await currentUser.getIdToken();

            if (id) {
                const res = await fetch(`${VITE_API_BASE_URL}/api/admin/db/${collectionName}/${id}`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: payload }),
                });
                if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to save doc');
            } else {
                const res = await fetch(`${VITE_API_BASE_URL}/api/admin/db/${collectionName}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: payload }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to create doc');
                if (data?.id) setDocIdInput(data.id);
            }
            await refetch();
        } catch (e) {
            alert(e.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const deleteDocById = async () => {
        if (!currentUser || !collectionName) return;
        const id = String(docIdInput || selectedDoc?.id || '').trim();
        if (!id) return;
        if (!window.confirm(`Delete document ${collectionName}/${id}? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            const token = await currentUser.getIdToken();
            const res = await fetch(`${VITE_API_BASE_URL}/api/admin/db/${collectionName}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to delete');
            setSelectedDoc(null);
            setDocEditor('');
            setDocIdInput('');
            await refetch();
        } catch (e) {
            alert(e.message || 'Failed to delete');
        } finally {
            setDeleting(false);
        }
    };

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

                    {/* Advanced Filters */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>
                            <Filter size={16} color="#a855f7" /> Filters & Sorting
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.6fr 1fr 0.7fr', gap: 8 }}>
                            <input value={whereField} onChange={e => setWhereField(e.target.value)} placeholder="where field (e.g. role)" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: '10px 12px', color: '#fff', outline: 'none' }} />
                            <select value={whereOp} onChange={e => setWhereOp(e.target.value)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: '10px 12px', color: '#fff', outline: 'none' }}>
                                {['==', '!=', '<', '<=', '>', '>=', 'array-contains'].map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                            <input value={whereValue} onChange={e => setWhereValue(e.target.value)} placeholder="value" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: '10px 12px', color: '#fff', outline: 'none' }} />
                            <select value={whereType} onChange={e => setWhereType(e.target.value)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: '10px 12px', color: '#fff', outline: 'none' }}>
                                {['string', 'number', 'boolean', 'null', 'json'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr auto', gap: 8, alignItems: 'center' }}>
                            <input value={orderByField} onChange={e => setOrderByField(e.target.value)} placeholder="orderBy field (optional)" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: '10px 12px', color: '#fff', outline: 'none' }} />
                            <select value={orderDir} onChange={e => setOrderDir(e.target.value)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: '10px 12px', color: '#fff', outline: 'none' }}>
                                <option value="desc">desc</option>
                                <option value="asc">asc</option>
                            </select>
                            <button onClick={() => refetch()} type="button" style={{ background: 'rgba(168,85,247,0.16)', border: '1px solid rgba(168,85,247,0.30)', borderRadius: 12, padding: '10px 12px', color: '#d8b4fe', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <ArrowUpDown size={14} /> Apply
                            </button>
                        </div>
                    </div>

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
                                            onClick={() => loadSelectedIntoEditor(d)}
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
                            <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                <button onClick={() => { setSelectedDoc(null); setDocEditor('{}'); setDocIdInput(''); }} style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.22)', borderRadius: 10, padding: '6px 10px', color: '#6ee7b7', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <Plus size={14} /> New
                                </button>
                            </span>
                        </div>
                        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                            {selectedDoc || docEditor ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <input value={docIdInput} onChange={e => setDocIdInput(e.target.value)} placeholder="doc id (leave blank to auto-create)" style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: '10px 12px', color: '#fff', outline: 'none', fontFamily: 'monospace', fontSize: '0.8rem' }} />
                                    </div>
                                    <textarea value={docEditor} onChange={e => setDocEditor(e.target.value)} rows={18} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: 12, color: '#e8e8e8', outline: 'none', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre' }} />
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button onClick={saveDoc} disabled={saving} style={{ flex: 1, background: 'rgba(59,130,246,0.16)', border: '1px solid rgba(59,130,246,0.30)', borderRadius: 12, padding: '10px 12px', color: '#93c5fd', fontWeight: 900, cursor: saving ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                            <Save size={16} /> {saving ? 'Saving…' : 'Save'}
                                        </button>
                                        <button onClick={deleteDocById} disabled={deleting || !docIdInput} style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.30)', borderRadius: 12, padding: '10px 12px', color: '#fca5a5', fontWeight: 900, cursor: deleting || !docIdInput ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                            <Trash2 size={16} /> {deleting ? 'Deleting…' : 'Delete'}
                                        </button>
                                    </div>
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
