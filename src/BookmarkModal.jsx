import { useState, useEffect, useRef } from 'react';
import { Bookmark, Plus, Check, X, Loader2 } from 'lucide-react';

export default function BookmarkModal({ problemId, userId, onClose }) {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newListName, setNewListName] = useState('');
    const [creating, setCreating] = useState(false);
    const [saving, setSaving] = useState({});
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    // Fetch user's lists
    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        fetch(`https://leetcode-orchestration.onrender.com/api/lists/${userId}`)
            .then(r => r.json())
            .then(data => setLists(data.lists || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

    const isInList = (list) => list.problemIds?.includes(String(problemId));

    const toggleList = async (list) => {
        setSaving(s => ({ ...s, [list.id]: true }));
        const inList = isInList(list);
        try {
            if (inList) {
                await fetch(`https://leetcode-orchestration.onrender.com/api/lists/${list.id}/problems/${problemId}`, { method: 'DELETE' });
                setLists(prev => prev.map(l => l.id === list.id ? { ...l, problemIds: l.problemIds.filter(id => id !== String(problemId)) } : l));
            } else {
                await fetch(`https://leetcode-orchestration.onrender.com/api/lists/${list.id}/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ problemId })
                });
                setLists(prev => prev.map(l => l.id === list.id ? { ...l, problemIds: [...(l.problemIds || []), String(problemId)] } : l));
            }
        } catch (err) { console.error(err); }
        setSaving(s => ({ ...s, [list.id]: false }));
    };

    const createList = async () => {
        if (!newListName.trim()) return;
        setCreating(true);
        try {
            const res = await fetch('https://leetcode-orchestration.onrender.com/api/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, name: newListName.trim() })
            });
            const newList = await res.json();
            if (newList.id) {
                setLists(prev => [...prev, newList]);
                setNewListName('');
            }
        } catch (err) { console.error(err); }
        setCreating(false);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div ref={ref} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', width: '360px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Bookmark size={18} color="var(--accent)" />
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--txt)' }}>Save to List</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--txt3)', cursor: 'pointer', padding: '4px' }}>
                        <X size={18} />
                    </button>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--txt3)', margin: 0 }}>Problem #{problemId}</p>

                {/* Lists */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', color: 'var(--txt3)', fontSize: '0.85rem', padding: '1rem' }}>Loading lists…</div>
                    ) : lists.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--txt3)', fontSize: '0.85rem', padding: '1rem' }}>No lists yet. Create one below!</div>
                    ) : lists.map(list => {
                        const inList = isInList(list);
                        return (
                            <button
                                key={list.id}
                                onClick={() => toggleList(list)}
                                disabled={saving[list.id]}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', background: inList ? 'rgba(var(--accent-rgb, 99,102,241),0.12)' : 'var(--surface2)', border: `1px solid ${inList ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '10px', padding: '10px 14px', cursor: 'pointer', transition: 'all 0.15s', color: 'var(--txt)', textAlign: 'left' }}
                            >
                                <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: inList ? 'var(--accent)' : 'var(--surface)', border: `1.5px solid ${inList ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {saving[list.id] ? <Loader2 size={12} className="spin" /> : inList ? <Check size={12} color="white" /> : null}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{list.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--txt3)' }}>{list.problemIds?.length || 0} problems</div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Create new list */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt2)', marginBottom: '8px' }}>Create new list</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            value={newListName}
                            onChange={e => setNewListName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && createList()}
                            placeholder="List name…"
                            style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', color: 'var(--txt)', fontSize: '0.85rem', outline: 'none' }}
                        />
                        <button
                            onClick={createList}
                            disabled={creating || !newListName.trim()}
                            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.8rem', opacity: creating || !newListName.trim() ? 0.5 : 1 }}
                        >
                            {creating ? <Loader2 size={14} className="spin" /> : <Plus size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
