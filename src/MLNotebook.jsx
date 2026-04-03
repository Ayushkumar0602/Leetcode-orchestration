import React, { useState, useEffect, useRef } from 'react';
import { Play, Plus, Trash2, Wand2, Loader2, UploadCloud, Database, Save } from 'lucide-react';
import { db } from './firebase'; // Adjust if auth/firebase contexts differ
import { collection, addDoc, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { uploadFile } from './lib/s3';

const API_BASE = 'https://leetcode-orchestration-55z3.onrender.com';

export default function MLNotebook({ userId, courseId }) {
    const [status, setStatus] = useState('Initializing Pyodide...');
    const [isReady, setIsReady] = useState(false);
    const workerRef = useRef(null);

    const [cells, setCells] = useState([
        {
            id: 'cell_1',
            type: 'code',
            content: "import pandas as pd\nimport numpy as np\nprint('ML Notebook Ready!')",
            output: '',
            error: null,
            plot: null,
            isRunning: false,
        }
    ]);

    const [datasets, setDatasets] = useState([]);
    const [uploadingDb, setUploadingDb] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Load Notebook state on mount
    useEffect(() => {
        if (!userId || !courseId) return;
        const loadNotebook = async () => {
            try {
                const docRef = doc(db, 'userProfiles', userId, 'mlNotebooks', courseId);
                const snap = await getDoc(docRef);
                if (snap.exists() && snap.data().cells) {
                    setCells(snap.data().cells);
                }
            } catch (err) {
                console.error("Failed to load notebook:", err);
            }
        };
        loadNotebook();
    }, [userId, courseId]);
    
    // Setup Pyodide Worker
    useEffect(() => {
        const worker = new Worker('/pyodide-worker.js');
        workerRef.current = worker;

        worker.onmessage = (e) => {
            const { type, id, status: newStatus, text, error, plotBase64 } = e.data;

            if (type === 'STATUS') {
                setStatus(newStatus);
            } else if (type === 'READY') {
                setIsReady(true);
                setStatus('Ready to train models.');
            } else if (type === 'STDOUT' || type === 'STDERR') {
                setCells(prev => prev.map(c => 
                    c.id === id ? { ...c, output: c.output + text } : c
                ));
            } else if (type === 'ERROR') {
                setCells(prev => prev.map(c => 
                    c.id === id ? { ...c, error, isRunning: false } : c
                ));
            } else if (type === 'DONE') {
                setCells(prev => prev.map(c => 
                    c.id === id ? { ...c, plot: plotBase64, isRunning: false } : c
                ));
            } else if (type === 'FILE_WRITTEN') {
                setStatus(`Dataset ${e.data.filename} loaded into memory.`);
                
                // Auto-inject a new cell to show the user exactly how to use the dataset
                setCells(prev => [...prev, {
                    id: 'cell_' + Date.now(),
                    type: 'code',
                    content: `# Your dataset is ready in the virtual filesystem!\nimport pandas as pd\ndf = pd.read_${e.data.filename.endsWith('.json') ? 'json' : 'csv'}('${e.data.filename}')\ndf.head()`,
                    output: '', error: null, plot: null, isRunning: false
                }]);
                
                setTimeout(() => setStatus('Ready to train models.'), 4000);
            }
        };

        worker.postMessage({ type: 'INIT' });

        return () => worker.terminate();
    }, []);

    // Load available user datasets
    useEffect(() => {
        if (!userId) return;
        const loadDatasets = async () => {
            try {
                const snap = await getDocs(collection(db, 'userProfiles', userId, 'user_dataset'));
                const list = [];
                snap.forEach(d => list.push({ id: d.id, ...d.data() }));
                setDatasets(list);
            } catch (err) {
                console.error("Failed to load datasets:", err);
            }
        };
        loadDatasets();
    }, [userId]);

    // Helpers
    const runCell = (cellId, code) => {
        if (!isReady) return;
        setCells(prev => prev.map(c => 
            c.id === cellId ? { ...c, isRunning: true, output: '', error: null, plot: null } : c
        ));
        workerRef.current.postMessage({ type: 'RUN_CODE', id: cellId, code });
    };

    const addCell = () => {
        setCells([...cells, { id: 'cell_' + Date.now(), type: 'code', content: '', output: '', error: null, plot: null, isRunning: false }]);
    };

    const updateCellContent = (id, val) => {
        setCells(prev => prev.map(c => c.id === id ? { ...c, content: val } : c));
    };

    const removeCell = (id) => {
        setCells(prev => prev.filter(c => c.id !== id));
    };

    // AI Optimize individual cell
    const [aiFixing, setAiFixing] = useState(null); // id of cell currently fixing
    const handleAiOptimize = async (cellId, code, errorMsg) => {
        if (!code.trim()) return;
        setAiFixing(cellId);
        try {
            const res = await fetch(`${API_BASE}/api/ml-ai-optimize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, error: errorMsg || '' })
            });
            if (!res.ok) throw new Error('AI optimize failed');
            const data = await res.json();
            
            setCells(prev => prev.map(c => 
                c.id === cellId ? { ...c, content: data.optimizedCode } : c
            ));
        } catch (err) {
            console.error(err);
        } finally {
            setAiFixing(null);
        }
    };

    // Dataset Management
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !userId) return;
        
        setUploadingDb(true);
        try {
            // Upload to Supabase S3 bucket (using existing logic)
            // Creating a unique name to prevent collisions
            const uniqueFile = new File([file], `users_${userId}_datasets_${file.name}`, { type: file.type });
            const uploadRes = await uploadFile(uniqueFile, "images"); // Using the default 'images' bucket or a generic one
            
            if (!uploadRes.success) throw new Error(uploadRes.error);
            const url = uploadRes.url;
            
            // Save metadata to Firestore (acting as the 'collection')
            const docRef = await addDoc(collection(db, 'userProfiles', userId, 'user_dataset'), {
                filename: file.name,
                url,
                uploadedAt: new Date().toISOString()
            });

            // Write into Pyodide's virtual filesystem instantly
            const text = await file.text();
            workerRef.current.postMessage({ type: 'WRITE_FILE', filename: file.name, filedata: text });

            setDatasets(prev => [...prev, { id: docRef.id, filename: file.name, url }]);
        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload dataset.");
        } finally {
            setUploadingDb(false);
            e.target.value = '';
        }
    };

    const loadDatasetIntoMemory = async (dataset) => {
        setStatus(`Loading ${dataset.filename}...`);
        try {
            const res = await fetch(dataset.url);
            const text = await res.text();
            workerRef.current.postMessage({ type: 'WRITE_FILE', filename: dataset.filename, filedata: text });
        } catch(err) {
            console.error("Failed to fetch dataset to memory:", err);
            setStatus("Failed to load dataset.");
        }
    };

    // Save Notebook state
    const saveNotebook = async () => {
        if (!userId || !courseId) return;
        setIsSaving(true);
        setStatus('Saving notebook...');
        try {
            // Keep only essential data to save space, omit huge base64 plots
            const cellsToSave = cells.map(c => ({
                id: c.id,
                type: c.type,
                content: c.content,
                output: c.output || '',
                error: c.error || null,
                plot: null // Don't save base64 strings to Firestore to avoid quota limits
            }));
            await setDoc(doc(db, 'userProfiles', userId, 'mlNotebooks', courseId), {
                cells: cellsToSave,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            
            setStatus('Notebook saved successfully!');
            setTimeout(() => setStatus('Ready to train models.'), 3000);
        } catch (err) {
            console.error("Failed to save notebook:", err);
            setStatus('Failed to save notebook.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ padding: '20px', background: '#0a0a0f', borderRadius: '12px', color: '#fff', fontFamily: "monospace" }}>
            
            {/* Header & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: isReady ? '#22c55e' : '#f59e0b' }}></div>
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{status}</span>
                </div>

                {/* Dataset Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {datasets.length > 0 && (
                        <select 
                            onChange={(e) => {
                                const ds = datasets.find(d => d.id === e.target.value);
                                if (ds) loadDatasetIntoMemory(ds);
                                e.target.value = '';
                            }}
                            style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '6px 12px', borderRadius: '6px', outline: 'none' }}
                        >
                            <option value="">Load Dataset into memory...</option>
                            {datasets.map(d => <option key={d.id} value={d.id}>{d.filename}</option>)}
                        </select>
                    )}
                    
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: '#3b82f6', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        {uploadingDb ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                        Upload CSV/JSON
                        <input type="file" accept=".csv,.json" style={{ display: 'none' }} onChange={handleFileUpload} />
                    </label>
                    <button 
                        onClick={saveNotebook}
                        disabled={isSaving}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save Code
                    </button>
                </div>
            </div>

            {/* Cells */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {cells.map((cell, idx) => (
                    <div key={cell.id} style={{ border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden', background: '#0f172a' }}>
                        
                        {/* Cell Toolbar */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#1e293b', borderBottom: '1px solid #334155' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>In [{idx + 1}]</span>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => handleAiOptimize(cell.id, cell.content, cell.error)}
                                    disabled={aiFixing === cell.id}
                                    style={{ background: 'transparent', border: 'none', color: '#a855f7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                                >
                                    {aiFixing === cell.id ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                                    AI Optimize
                                </button>
                                <button 
                                    onClick={() => runCell(cell.id, cell.content)}
                                    disabled={cell.isRunning || !isReady}
                                    style={{ background: 'transparent', border: 'none', color: '#22c55e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                                >
                                    {cell.isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                                    Run
                                </button>
                                <button 
                                    onClick={() => removeCell(cell.id)}
                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Code Editor Area */}
                        <textarea 
                            value={cell.content}
                            onChange={(e) => updateCellContent(cell.id, e.target.value)}
                            spellCheck="false"
                            style={{ 
                                width: '100%', minHeight: '80px', background: '#0f172a', color: '#e2e8f0', 
                                border: 'none', padding: '12px', outline: 'none', resize: 'vertical',
                                fontSize: '0.9rem', lineHeight: '1.5'
                            }}
                        />

                        {/* Output Area */}
                        {(cell.output || cell.error || cell.plot) && (
                            <div style={{ padding: '12px', borderTop: '1px solid #334155', background: '#000', fontSize: '0.85rem' }}>
                                {cell.error && <div style={{ color: '#ef4444', whiteSpace: 'pre-wrap' }}>{cell.error}</div>}
                                {cell.output && <div style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{cell.output}</div>}
                                {cell.plot && (
                                    <div style={{ marginTop: '10px' }}>
                                        <img src={`data:image/png;base64,${cell.plot}`} alt="Matplotlib Plot" style={{ maxWidth: '100%', background: '#fff' }} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button 
                onClick={addCell}
                style={{ marginTop: '20px', background: '#1e293b', border: '1px dashed #334155', color: '#94a3b8', width: '100%', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
                <Plus size={16} /> Add Code Cell
            </button>
        </div>
    );
}
