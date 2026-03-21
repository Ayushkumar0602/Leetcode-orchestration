import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search, Loader2, ArrowRight, Save, Trash2, Plus, Sparkles, History, Check, X, Code, RefreshCcw } from 'lucide-react';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

export default function AdminQuestions() {
    const { currentUser } = useAuth();
    const [searchVal, setSearchVal] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Editor State
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showVersions, setShowVersions] = useState(false);
    
    // AI Loading
    const [aiLoadingField, setAiLoadingField] = useState(null);

    const fetchProblems = async () => {
        if (!currentUser) return [];
        const token = await currentUser.getIdToken();
        const params = new URLSearchParams();
        params.set('limit', '500');
        if (difficultyFilter) {
            params.set('whereField', 'difficulty');
            params.set('whereOp', '==');
            params.set('whereValue', difficultyFilter);
        }
        
        const res = await fetch(`${VITE_API_BASE_URL}/api/admin/db/problems?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch problems');
        const data = await res.json();
        return data.docs || [];
    };

    const { data: problems = [], isLoading, refetch } = useQuery({
        queryKey: ['admin-problems', difficultyFilter],
        queryFn: fetchProblems,
        enabled: !!currentUser
    });

    const filteredProblems = problems.filter(p => (p.problem?.title || p.title || '').toLowerCase().includes(searchVal.toLowerCase()) || String(p.id || '').includes(searchVal));

    const handleSelect = (p) => {
        setSelectedProblem(p);
        setEditData({ ...p });
        setIsEditing(true);
        setShowVersions(false);
    };

    const handleCreateNew = () => {
        const newProb = {
            id: '',
            title: 'New Problem',
            difficulty: 'Easy',
            topicTags: [],
            status: 'enabled',
            problem: '',
            primaryTestCases: [],
            submitTestCases: [],
            code: '',
            wrapper: ''
        };
        setSelectedProblem(null);
        setEditData(newProb);
        setIsEditing(true);
        setShowVersions(false);
    };

    const handleSave = async () => {
        if (!currentUser || !editData) return;
        setSaving(true);
        try {
            const token = await currentUser.getIdToken();
            const idToSave = editData.id || `custom-${Date.now()}`;
            const payload = { ...editData, id: idToSave };
            
            // 1. Snapshot previous version first
            if (selectedProblem && selectedProblem.id) {
                await fetch(`${VITE_API_BASE_URL}/api/admin/problems/${selectedProblem.id}/versions`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: selectedProblem }),
                });
            }

            // 2. Save new version
            const res = await fetch(`${VITE_API_BASE_URL}/api/admin/db/problems/${idToSave}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: payload }),
            });
            
            if (!res.ok) throw new Error('Failed to save');
            
            await refetch();
            setSelectedProblem(payload);
            setEditData({ ...payload });
            alert("Saved successfully!");
        } catch (e) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAIGenerate = async (instruction, fieldKeys) => {
        if (!currentUser || !editData) return;
        setAiLoadingField(fieldKeys.join(','));
        try {
            const token = await currentUser.getIdToken();
            const res = await fetch(`${VITE_API_BASE_URL}/api/admin/problems/${editData.id || 'new'}/regenerate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ instruction, originalData: editData }),
            });
            const { data, error } = await res.json();
            if (error) throw new Error(error);
            
            // Merge response back
            const newData = { ...editData };
            for (const k of fieldKeys) {
                if (data[k] !== undefined) newData[k] = data[k];
            }
            setEditData(newData);
        } catch (e) {
            alert("AI Generation failed: " + e.message);
        } finally {
            setAiLoadingField(null);
        }
    };

    const renderTestCases = (cases, type) => {
        return (
            <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0 }}>{type === 'primary' ? 'Example Test Cases' : 'Validation Test Cases'}</h4>
                    <button type="button" onClick={() => {
                        const arr = [...editData[type === 'primary' ? 'primaryTestCases' : 'submitTestCases']];
                        arr.push({ input: '', expectedOutput: '', displayInput: '' });
                        setEditData({ ...editData, [type === 'primary' ? 'primaryTestCases' : 'submitTestCases']: arr });
                    }} style={{ background: 'rgba(59,130,246,0.2)', border: 'none', color: '#60a5fa', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem' }}>+ Add Row</button>
                </div>
                {cases?.map((tc, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '8px' }}>
                        <div style={{flex: 1}}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--txt3)' }}>Raw Input (Execution)</div>
                            <input value={tc.input || ''} onChange={(e) => {
                                const arr = [...cases]; arr[idx].input = e.target.value;
                                setEditData({ ...editData, [type === 'primary' ? 'primaryTestCases' : 'submitTestCases']: arr });
                            }} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '4px', fontFamily: 'monospace' }} />
                        </div>
                        <div style={{flex: 1}}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--txt3)' }}>Display Input (UI Label)</div>
                            <input value={tc.displayInput || ''} onChange={(e) => {
                                const arr = [...cases]; arr[idx].displayInput = e.target.value;
                                setEditData({ ...editData, [type === 'primary' ? 'primaryTestCases' : 'submitTestCases']: arr });
                            }} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '4px', fontFamily: 'monospace' }} />
                        </div>
                        <div style={{flex: 1}}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--txt3)' }}>Expected Output</div>
                            <input value={tc.expectedOutput || ''} onChange={(e) => {
                                const arr = [...cases]; arr[idx].expectedOutput = e.target.value;
                                setEditData({ ...editData, [type === 'primary' ? 'primaryTestCases' : 'submitTestCases']: arr });
                            }} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px', borderRadius: '4px', fontFamily: 'monospace' }} />
                        </div>
                        <button type="button" onClick={() => {
                            const arr = [...cases]; arr.splice(idx, 1);
                            setEditData({ ...editData, [type === 'primary' ? 'primaryTestCases' : 'submitTestCases']: arr });
                        }} style={{ alignSelf: 'flex-end', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}><Trash2 size={16} /></button>
                    </div>
                ))}
                <button type="button" onClick={() => handleAIGenerate(`Add 3 more diverse ${type} test cases, particularly focusing on edge cases.`, [type === 'primary' ? 'primaryTestCases' : 'submitTestCases'])} disabled={aiLoadingField === (type === 'primary' ? 'primaryTestCases' : 'submitTestCases')} style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', color: '#d8b4fe', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                    {aiLoadingField === (type === 'primary' ? 'primaryTestCases' : 'submitTestCases') ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Auto-generate Test Cases via AI
                </button>
            </div>
        );
    };

    const VersionsPanel = () => {
        const fetchVersions = async () => {
            const token = await currentUser.getIdToken();
            const res = await fetch(`${VITE_API_BASE_URL}/api/admin/problems/${selectedProblem.id}/versions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return (await res.json()).versions || [];
        };
        const { data: versions = [], isLoading: vLoad } = useQuery({
            queryKey: ['prob-versions', selectedProblem?.id],
            queryFn: fetchVersions,
            enabled: !!selectedProblem?.id
        });

        if (vLoad) return <div>Loading versions...</div>;

        return (
            <div style={{ background: 'rgba(20,22,30,0.8)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginTop: '1rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}><History size={18} /> Version History</h3>
                {versions.length === 0 ? <p style={{ color: 'var(--txt3)', fontSize: '0.9rem' }}>No previous versions found.</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {versions.map(v => (
                            <div key={v.versionId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#fff' }}>{new Date(v.versionCreatedAt).toLocaleString()}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--txt3)' }}>By: {v.versionCreatedBy}</div>
                                </div>
                                <button onClick={() => {
                                    if(window.confirm('Roll back to this version?')) {
                                        setEditData({ ...v, id: selectedProblem.id });
                                        alert('Version loaded in editor. Click Save to persist.');
                                    }
                                }} style={{ background: 'rgba(59,130,246,0.2)', border: 'none', color: '#60a5fa', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Rollback Option</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' }}>Questions & Test Cases</h1>
                    <p style={{ color: 'var(--txt2)', margin: 0 }}>Manage problem sets, modify generation, and debug execution test cases.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: 0 }}>
                {/* Left: Problem List */}
                <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Search size={16} color="var(--txt3)" />
                            <input 
                                value={searchVal} onChange={e => setSearchVal(e.target.value)} 
                                placeholder="Search problems..." style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '8px', outline: 'none', fontSize: '0.85rem' }}>
                            <option value="">All Difficulties</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                        <button onClick={handleCreateNew} style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                            <Plus size={16} /> New
                        </button>
                    </div>

                    <div style={{ flex: 1, background: 'rgba(20, 22, 30, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflowY: 'auto' }}>
                        {isLoading ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={24} style={{ margin: '0 auto', color: '#3b82f6' }} /></div>
                        ) : filteredProblems.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--txt3)' }}>No problems found.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {filteredProblems.map(p => (
                                    <button key={p.id} onClick={() => handleSelect(p)} style={{ background: selectedProblem?.id === p.id ? 'rgba(59,130,246,0.1)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '16px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginBottom: '4px' }}>{p.problem?.title || p.title || p.id}</div>
                                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
                                            <span style={{ color: p.difficulty==='Easy'?'#4ade80':p.difficulty==='Medium'?'#facc15':'#f87171' }}>{p.difficulty}</span>
                                            <span style={{ color: 'var(--txt3)' }}>•</span>
                                            <span style={{ color: p.status === 'disabled' ? '#ef4444' : 'var(--txt3)' }}>{p.status === 'disabled' ? 'Disabled' : 'Active'}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Problem Editor */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    {isEditing && editData ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(20, 22, 30, 0.6)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                                    {editData.id ? `Editing: ${editData.problem?.title || editData.title || editData.id}` : 'Creating New Problem'}
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {editData.id && (
                                        <button onClick={() => setShowVersions(!showVersions)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <History size={16} /> Versions
                                        </button>
                                    )}
                                    <button onClick={handleSave} disabled={saving} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '8px', cursor: saving?'wait':'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                                    </button>
                                </div>
                            </div>

                            {showVersions ? (
                                <VersionsPanel />
                            ) : (
                                <div style={{ background: 'rgba(20, 22, 30, 0.6)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--txt3)', marginBottom: '4px' }}>Problem ID (leave blank to auto-generate)</label>
                                            <input value={editData.id || ''} onChange={e => setEditData({...editData, id: e.target.value})} disabled={!!selectedProblem} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--txt3)', marginBottom: '4px' }}>Title</label>
                                            <input value={editData.problem?.title || editData.title || ''} onChange={e => {
                                                if (editData.problem) setEditData({...editData, problem: {...editData.problem, title: e.target.value}});
                                                else setEditData({...editData, title: e.target.value});
                                            }} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--txt3)', marginBottom: '4px' }}>Difficulty</label>
                                            <select value={editData.difficulty || 'Easy'} onChange={e => setEditData({...editData, difficulty: e.target.value})} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px' }}>
                                                <option>Easy</option><option>Medium</option><option>Hard</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--txt3)', marginBottom: '4px' }}>Status</label>
                                            <select value={editData.status || 'enabled'} onChange={e => setEditData({...editData, status: e.target.value})} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px' }}>
                                                <option value="enabled">Enabled</option><option value="disabled">Disabled</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <label style={{ fontSize: '0.8rem', color: 'var(--txt3)' }}>Problem Description (Markdown + LaTeX)</label>
                                            <button type="button" onClick={() => {
                                                const instruction = prompt("How should AI modify this description? (e.g. 'Make the story about pirates', 'Fix grammar')");
                                                if(instruction) handleAIGenerate(instruction, ['problem']);
                                            }} disabled={aiLoadingField === 'problem'} style={{ background: 'transparent', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {aiLoadingField === 'problem' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Rewrite via AI
                                            </button>
                                        </div>
                                        <textarea value={editData.problem?.description || editData.problem || ''} onChange={e => {
                                            if (typeof editData.problem === 'object') setEditData({...editData, problem: {...editData.problem, description: e.target.value}});
                                            else setEditData({...editData, problem: e.target.value});
                                        }} rows={12} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8e8e8', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem' }} />
                                    </div>

                                    <div style={{ marginBottom: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
                                        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Code size={18} /> Execution Code Wrappers</h3>
                                        {['javascript', 'python', 'cpp', 'java'].map(lang => (
                                            <div key={lang} style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--txt3)', marginBottom: '4px', textTransform: 'capitalize' }}>{lang} Wrapper</div>
                                                <textarea value={editData.wrapper?.[lang] || ''} onChange={e => setEditData({...editData, wrapper: {...(editData.wrapper||{}), [lang]: e.target.value}})} rows={3} style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', color: '#93c5fd', padding: '10px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre' }} />
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
                                        <h3 style={{ margin: '0 0 1rem 0' }}>Test Cases</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--txt2)' }}>Primary cases show up as examples. Submit cases are hidden execution validations.</p>
                                        
                                        {renderTestCases(editData.primaryTestCases, 'primary')}
                                        <div style={{ marginTop: '2rem' }}></div>
                                        {renderTestCases(editData.submitTestCases, 'submit')}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt3)', background: 'rgba(20, 22, 30, 0.4)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <div style={{ textAlign: 'center' }}>
                                <BookOpen size={48} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 16px' }} />
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--txt2)' }}>Select a problem to edit</div>
                                <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>Or create a new one to get started.</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}
