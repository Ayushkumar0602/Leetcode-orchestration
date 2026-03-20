import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Loader2, Sparkles, 
    Save, Play, FileCode2, AlignLeft, RefreshCw, AlertTriangle 
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

const LANGUAGES = ['python', 'javascript', 'cpp', 'c', 'java', 'go', 'rust'];

export default function AdminProblemControl() {
    const { currentUser } = useAuth();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Editor State
    const [editingProblem, setEditingProblem] = useState(null); 
    const [activeTab, setActiveTab] = useState('details'); // details, code, tests
    const [activeLang, setActiveLang] = useState('python');
    const [generating, setGenerating] = useState(false);
    const [validating, setValidating] = useState(false);
    const [validationResults, setValidationResults] = useState(null);

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        setLoading(true);
        try {
            const token = await currentUser?.getIdToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/problems`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.problems) setProblems(data.problems);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setEditingProblem({
            title: '', description: '', difficulty: 'Easy',
            inputFormat: '', outputFormat: '', constraints: [],
            code: {}, wrapper: {}, primaryTestCases: [], submitTestCases: []
        });
        setActiveTab('details');
        setValidationResults(null);
    };

    const handleSave = async () => {
        if (!editingProblem.title) return alert("Title required");
        
        try {
            const token = await currentUser?.getIdToken();
            const isNew = !editingProblem.id;
            const url = isNew 
                ? `${API_BASE_URL}/api/admin/problems` 
                : `${API_BASE_URL}/api/admin/problems/${editingProblem.id}`;
            const method = isNew ? 'POST' : 'PUT';
            
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editingProblem)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            alert(`Saved successfully. Version: ${data.version}`);
            setEditingProblem(null);
            fetchProblems();
        } catch (e) {
            alert('Failed to save: ' + e.message);
        }
    };

    const handleGenerateAI = async () => {
        const prompt = window.prompt("Enter problem name or short prompt for AI Generation:");
        if (!prompt) return;
        
        setGenerating(true);
        try {
            const token = await currentUser?.getIdToken();
            const res = await fetch(`${API_BASE_URL}/api/admin/problems/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ prompt, language: activeLang })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setEditingProblem(prev => ({
                ...prev,
                title: data.problem?.title || prev.title,
                description: data.problem?.description || prev.description,
                difficulty: data.problem?.difficulty || prev.difficulty,
                inputFormat: data.problem?.inputFormat || prev.inputFormat,
                outputFormat: data.problem?.outputFormat || prev.outputFormat,
                constraints: data.problem?.constraints || prev.constraints,
                primaryTestCases: data.primaryTestCases || prev.primaryTestCases,
                submitTestCases: data.submitTestCases || prev.submitTestCases,
                code: { ...prev.code, [activeLang]: data.code },
                wrapper: { ...prev.wrapper, [activeLang]: data.wrapper }
            }));
            alert(`AI generation successful for ${activeLang}. Note: Other languages need manual wrappers or another generation.`);
        } catch (e) {
            alert('AI Generation Failed: ' + e.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleValidate = async () => {
        const p = editingProblem;
        if (!p.code?.[activeLang] || !p.wrapper?.[activeLang]) {
            return alert(`Missing code stub or wrapper for ${activeLang}`);
        }
        
        setValidating(true);
        setValidationResults(null);
        try {
            const token = await currentUser?.getIdToken();
            const allTests = [...(p.primaryTestCases||[]), ...(p.submitTestCases||[])];
            if (!allTests.length) throw new Error("No test cases defined");

            const res = await fetch(`${API_BASE_URL}/api/admin/problems/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    language: activeLang,
                    code: p.code[activeLang],
                    wrapper: p.wrapper[activeLang],
                    testCases: allTests
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setValidationResults(data.results);
        } catch (e) {
            alert('Validation Failed: ' + e.message);
        } finally {
            setValidating(false);
        }
    };

    const inputStyle = {
        width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff', borderRadius: '8px', padding: '10px', marginTop: '5px'
    };

    if (editingProblem) {
        return (
            <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>{editingProblem.id ? 'Edit Problem' : 'Create New Problem'}</h2>
                        <span style={{ color: 'var(--txt2)', fontSize: '0.9rem' }}>
                            {editingProblem.id ? `ID: ${editingProblem.id} · Version: ${editingProblem.version}` : 'Unsaved Draft'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setEditingProblem(null)} 
                            style={{ background: 'transparent', color: '#fff', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
                            Cancel
                        </button>
                        <button onClick={handleSave} 
                            style={{ background: '#3b82f6', color: '#fff', padding: '8px 16px', borderRadius: '8px', border: 'none', display: 'flex', gap: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                            <Save size={18} /> Save & Version Up
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
                    {/* Left: Tabs Content */}
                    <div style={{ flex: 3, background: 'rgba(20,22,30,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['details', 'code', 'tests'].map(t => (
                                <div key={t} onClick={() => setActiveTab(t)} 
                                    style={{ padding: '15px 20px', cursor: 'pointer', borderBottom: activeTab === t ? '2px solid #3b82f6' : '2px solid transparent', color: activeTab === t ? '#fff' : 'var(--txt2)', textTransform: 'capitalize', fontWeight: 'bold' }}>
                                    {t}
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                            {activeTab === 'details' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div>
                                        <label>Title</label>
                                        <input style={inputStyle} value={editingProblem.title || ''} onChange={e => setEditingProblem({...editingProblem, title: e.target.value})} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label>Difficulty</label>
                                            <select style={inputStyle} value={editingProblem.difficulty || 'Easy'} onChange={e => setEditingProblem({...editingProblem, difficulty: e.target.value})}>
                                                <option>Easy</option><option>Medium</option><option>Hard</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label>Description</label>
                                        <textarea style={{...inputStyle, minHeight: '150px'}} value={editingProblem.description || ''} onChange={e => setEditingProblem({...editingProblem, description: e.target.value})} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label>Input Format</label>
                                            <textarea style={{...inputStyle, minHeight: '80px'}} value={editingProblem.inputFormat || ''} onChange={e => setEditingProblem({...editingProblem, inputFormat: e.target.value})} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label>Output Format</label>
                                            <textarea style={{...inputStyle, minHeight: '80px'}} value={editingProblem.outputFormat || ''} onChange={e => setEditingProblem({...editingProblem, outputFormat: e.target.value})} />
                                        </div>
                                    </div>
                                    <div>
                                        <label>Constraints (One per line)</label>
                                        <textarea style={{...inputStyle, minHeight: '100px'}} 
                                            value={(editingProblem.constraints || []).join('\n')} 
                                            onChange={e => setEditingProblem({...editingProblem, constraints: e.target.value.split('\n').map(s=>s.trim()).filter(Boolean)})} 
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'code' && (
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                        {LANGUAGES.map(l => (
                                            <button key={l} onClick={() => setActiveLang(l)} 
                                                style={{ padding: '6px 12px', borderRadius: '6px', background: activeLang === l ? '#3b82f6' : 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', cursor: 'pointer', textTransform: 'capitalize' }}>
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', flex: 1, gap: '20px' }}>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <label style={{ marginBottom: '5px' }}>User Code Stub ({activeLang})</label>
                                            <textarea style={{...inputStyle, flex: 1, fontFamily: 'monospace', whiteSpace: 'pre'}} 
                                                value={editingProblem.code?.[activeLang] || ''} 
                                                onChange={e => setEditingProblem({
                                                    ...editingProblem, 
                                                    code: { ...editingProblem.code, [activeLang]: e.target.value } 
                                                })} 
                                                placeholder="// Stub here..."
                                            />
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <label style={{ marginBottom: '5px' }}>Hidden Wrapper / Stdin Parser ({activeLang})</label>
                                            <textarea style={{...inputStyle, flex: 1, fontFamily: 'monospace', whiteSpace: 'pre'}} 
                                                value={editingProblem.wrapper?.[activeLang] || ''} 
                                                onChange={e => setEditingProblem({
                                                    ...editingProblem, 
                                                    wrapper: { ...editingProblem.wrapper, [activeLang]: e.target.value } 
                                                })} 
                                                placeholder="// Driver code here..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'tests' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                        <h3 style={{ margin: 0 }}>Test Cases</h3>
                                    </div>
                                    
                                    <h4 style={{ color: 'var(--txt2)' }}>Primary (Visible)</h4>
                                    {(editingProblem.primaryTestCases || []).map((tc, i) => (
                                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                                            <input style={{...inputStyle, marginBottom: '10px'}} value={tc.label || ''} placeholder="Label" 
                                                onChange={e => {
                                                    const newTc = [...editingProblem.primaryTestCases];
                                                    newTc[i].label = e.target.value;
                                                    setEditingProblem({...editingProblem, primaryTestCases: newTc});
                                                }} />
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <textarea style={{...inputStyle, flex: 1, minHeight: '60px', fontFamily: 'monospace'}} placeholder="Input (stdin)" value={tc.input || ''} 
                                                    onChange={e => {
                                                        const newTc = [...editingProblem.primaryTestCases];
                                                        newTc[i].input = e.target.value;
                                                        setEditingProblem({...editingProblem, primaryTestCases: newTc});
                                                    }} />
                                                <textarea style={{...inputStyle, flex: 1, minHeight: '60px', fontFamily: 'monospace'}} placeholder="Expected Output (stdout)" value={tc.expectedOutput || ''} 
                                                    onChange={e => {
                                                        const newTc = [...editingProblem.primaryTestCases];
                                                        newTc[i].expectedOutput = e.target.value;
                                                        setEditingProblem({...editingProblem, primaryTestCases: newTc});
                                                    }} />
                                            </div>
                                        </div>
                                    ))}

                                    <h4 style={{ color: 'var(--txt2)', marginTop: '20px' }}>Submit (Hidden)</h4>
                                    {(editingProblem.submitTestCases || []).map((tc, i) => (
                                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <textarea style={{...inputStyle, flex: 1, minHeight: '60px', fontFamily: 'monospace'}} placeholder="Input (stdin)" value={tc.input || ''} 
                                                    onChange={e => {
                                                        const newTc = [...editingProblem.submitTestCases];
                                                        newTc[i].input = e.target.value;
                                                        setEditingProblem({...editingProblem, submitTestCases: newTc});
                                                    }} />
                                                <textarea style={{...inputStyle, flex: 1, minHeight: '60px', fontFamily: 'monospace'}} placeholder="Expected Output (stdout)" value={tc.expectedOutput || ''} 
                                                    onChange={e => {
                                                        const newTc = [...editingProblem.submitTestCases];
                                                        newTc[i].expectedOutput = e.target.value;
                                                        setEditingProblem({...editingProblem, submitTestCases: newTc});
                                                    }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Controls Sidebar */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ background: 'rgba(20,22,30,0.8)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <h3 style={{ margin: '0 0 15px 0' }}>Advanced Controls</h3>
                            
                            <button onClick={handleGenerateAI} disabled={generating}
                                style={{ width: '100%', padding: '10px', background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px', cursor: generating ? 'not-allowed' : 'pointer' }}>
                                {generating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                Auto-Generate with AI
                            </button>

                            <button onClick={handleValidate} disabled={validating}
                                style={{ width: '100%', padding: '10px', background: 'rgba(34,197,94,0.2)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px', cursor: validating ? 'not-allowed' : 'pointer' }}>
                                {validating ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                                Validate Test Cases
                            </button>

                            {editingProblem.id && (
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', cursor: 'pointer', color: editingProblem.disabled ? '#ef4444' : '#fff' }}>
                                    <input type="checkbox" checked={editingProblem.disabled === true} onChange={e => setEditingProblem({...editingProblem, disabled: e.target.checked})} />
                                    Soft Disable Problem
                                </label>
                            )}
                        </div>

                        {validationResults && (
                            <div style={{ background: 'rgba(20,22,30,0.8)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', flex: 1, overflowY: 'auto' }}>
                                <h3 style={{ margin: '0 0 15px 0' }}>Validation Results</h3>
                                {validationResults.map((r, i) => (
                                    <div key={i} style={{ padding: '10px', background: r.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', borderLeft: `3px solid ${r.success ? '#4ade80' : '#ef4444'}`, marginBottom: '5px', borderRadius: '4px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{r.label} - {r.success ? 'Passed' : 'Failed'}</div>
                                        {!r.success && <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--txt2)', marginTop: '5px' }}>{r.error || `Output: ${r.output}`}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Problem Management</h1>
                    <p style={{ color: 'var(--txt2)', margin: '5px 0 0 0' }}>Create and manage custom problems for the AI platform.</p>
                </div>
                <button onClick={handleCreateNew} 
                    style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <Plus size={18} /> New Problem
                </button>
            </div>

            <div style={{ background: 'rgba(20,22,30,0.8)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt2)' }}>Loading problems...</div>
                ) : problems.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt2)' }}>No custom problems found. Create one above.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--txt2)' }}>
                                <th style={{ padding: '15px 20px', fontWeight: 600 }}>ID</th>
                                <th style={{ padding: '15px 20px', fontWeight: 600 }}>Title</th>
                                <th style={{ padding: '15px 20px', fontWeight: 600 }}>Difficulty</th>
                                <th style={{ padding: '15px 20px', fontWeight: 600 }}>Version</th>
                                <th style={{ padding: '15px 20px', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '15px 20px', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {problems.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '15px 20px', color: 'var(--txt2)' }}>{p.id}</td>
                                    <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{p.title}</td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                            background: p.difficulty === 'Easy' ? 'rgba(34,197,94,0.1)' : p.difficulty === 'Medium' ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)',
                                            color: p.difficulty === 'Easy' ? '#4ade80' : p.difficulty === 'Medium' ? '#facc15' : '#ef4444' 
                                        }}>
                                            {p.difficulty}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px', color: 'var(--txt2)' }}>v{p.version || 1}</td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <span style={{ color: p.disabled ? '#ef4444' : '#4ade80' }}>
                                            {p.disabled ? 'Disabled' : 'Active'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <button onClick={() => {
                                            setEditingProblem(JSON.parse(JSON.stringify(p)));
                                            setActiveTab('details');
                                            setValidationResults(null);
                                        }} 
                                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Edit2 size={14} /> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
