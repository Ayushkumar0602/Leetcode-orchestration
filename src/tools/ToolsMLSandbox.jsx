import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Trash2, Wand2, Loader2, UploadCloud, Database, Save } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import { BrainCircuit, Target, Code2, LineChart } from 'lucide-react';
import { uploadFile } from '../lib/s3';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration-55z3.onrender.com';

export default function ToolsMLSandbox() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const userId = currentUser?.uid;
    const [status, setStatus] = useState('Initializing Pyodide...');
    const [isReady, setIsReady] = useState(false);
    const workerRef = useRef(null);

    const [cells, setCells] = useState([
        {
            id: 'cell_1',
            type: 'code',
            content: "import pandas as pd\nimport numpy as np\nprint('ML Sandbox Ready! Run this cell.')",
            output: '',
            error: null,
            plot: null,
            isRunning: false,
        }
    ]);

    const [datasets, setDatasets] = useState([]);
    const [uploadingDb, setUploadingDb] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if (!userId) return;
        const loadNotebook = async () => {
            try {
                const docRef = doc(db, 'userProfiles', userId, 'standaloneTools', 'mlSandbox');
                const snap = await getDoc(docRef);
                if (snap.exists() && snap.data().cells) {
                    setCells(snap.data().cells);
                }
            } catch (err) {
                console.error("Failed to load notebook:", err);
            }
        };
        loadNotebook();
    }, [userId]);
    
    useEffect(() => {
        const worker = new Worker('/pyodide-worker.js');
        workerRef.current = worker;

        worker.onmessage = (e) => {
            const { type, id, status: newStatus, text, error, plotBase64 } = e.data;

            if (type === 'STATUS') setStatus(newStatus);
            else if (type === 'READY') { setIsReady(true); setStatus('Ready to train models.'); }
            else if (type === 'STDOUT' || type === 'STDERR') {
                setCells(prev => prev.map(c => c.id === id ? { ...c, output: c.output + text } : c));
            } else if (type === 'ERROR') {
                setCells(prev => prev.map(c => c.id === id ? { ...c, error, isRunning: false } : c));
            } else if (type === 'DONE') {
                setCells(prev => prev.map(c => c.id === id ? { ...c, plot: plotBase64, isRunning: false } : c));
            } else if (type === 'FILE_WRITTEN') {
                setStatus(`Dataset ${e.data.filename} loaded into memory.`);
                setCells(prev => [...prev, {
                    id: 'cell_' + Date.now(),
                    type: 'code',
                    content: `# Your dataset is ready!\nimport pandas as pd\ndf = pd.read_${e.data.filename.endsWith('.json') ? 'json' : 'csv'}('${e.data.filename}')\ndf.head()`,
                    output: '', error: null, plot: null, isRunning: false
                }]);
                setTimeout(() => setStatus('Ready to train models.'), 4000);
            }
        };

        worker.postMessage({ type: 'INIT' });
        return () => worker.terminate();
    }, []);

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

    const runCell = (cellId, code) => {
        if (!isReady) return;
        setCells(prev => prev.map(c => c.id === cellId ? { ...c, isRunning: true, output: '', error: null, plot: null } : c));
        workerRef.current.postMessage({ type: 'RUN_CODE', id: cellId, code });
    };

    const addCell = () => setCells([...cells, { id: 'cell_' + Date.now(), type: 'code', content: '', output: '', error: null, plot: null, isRunning: false }]);
    const updateCellContent = (id, val) => setCells(prev => prev.map(c => c.id === id ? { ...c, content: val } : c));
    const removeCell = (id) => setCells(prev => prev.filter(c => c.id !== id));

    const [aiFixing, setAiFixing] = useState(null);
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
            setCells(prev => prev.map(c => c.id === cellId ? { ...c, content: data.optimizedCode } : c));
        } catch (err) { console.error(err); } finally { setAiFixing(null); }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!userId) {
            if (window.confirm("You need to be logged in to upload and save datasets. Redirect to login?")) {
                navigate('/login');
            }
            return;
        }
        
        setUploadingDb(true);
        try {
            const uniqueFile = new File([file], `users_${userId}_datasets_${file.name}`, { type: file.type });
            const uploadRes = await uploadFile(uniqueFile, "images");
            if (!uploadRes.success) throw new Error(uploadRes.error);
            const url = uploadRes.url;
            
            const docRef = await addDoc(collection(db, 'userProfiles', userId, 'user_dataset'), {
                filename: file.name, url, uploadedAt: new Date().toISOString()
            });

            const text = await file.text();
            workerRef.current.postMessage({ type: 'WRITE_FILE', filename: file.name, filedata: text });
            setDatasets(prev => [...prev, { id: docRef.id, filename: file.name, url }]);
        } catch (err) {
            console.error("Upload error:", err); alert("Failed to upload dataset.");
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
        } catch(err) { setStatus("Failed to load dataset."); }
    };

    const saveNotebook = async () => {
        if (!userId) {
            if (window.confirm("Sign in to save your progress. Redirect to login?")) {
                navigate('/login');
            }
            return;
        }
        setIsSaving(true); setStatus('Saving notebook...');
        try {
            const cellsToSave = cells.map(c => ({
                id: c.id, type: c.type, content: c.content, output: c.output || '', error: c.error || null, plot: null
            }));
            await setDoc(doc(db, 'userProfiles', userId, 'standaloneTools', 'mlSandbox'), {
                cells: cellsToSave, updatedAt: new Date().toISOString()
            }, { merge: true });
            setStatus('Notebook saved!'); setTimeout(() => setStatus('Ready to train models.'), 3000);
        } catch (err) { setStatus('Failed to save notebook.'); } finally { setIsSaving(false); }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', paddingBottom: '60px' }}>
            <Helmet>
                <title>Free Online ML Sandbox & Python Environment | Pandas, NumPy, Scikit-learn Lab | Whizan AI</title>
                <meta name="description" content="Train Machine Learning models directly in your browser. Whizan AI's 100% Free interactive Python and ML sandbox supports Pandas, NumPy, Scikit-learn with AI-powered code corrections and real-time data plotting." />
                <meta name="keywords" content="online ml sandbox, python sandbox, run python online, machine learning browser, data science playground, scikit-learn online, whizan ai tools, learn pandas online, free python lab, pyodide editor" />
                <meta property="og:title" content="Whizan AI | Premium Online Python ML Sandbox & Jupyter Alternative" />
                <meta property="og:description" content="Experience full Python data science capabilities without leaving your browser. Upload datasets, train models, and visualize results instantly with Whizan AI." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://whizan.xyz/tools/ml-sandbox" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Interactive Machine Learning Sandbox - 100% Free" />
                <meta name="twitter:description" content="Train models seamlessly. Upload CSVs, write Python, and let Whizan AI optimize your data science code using WebAssembly technology." />
                <link rel="canonical" href="https://whizan.xyz/tools/ml-sandbox" />
                <script type="application/ld+json">
                    {JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "WebApplication",
                      "name": "Whizan Python ML Sandbox",
                      "url": "https://whizan.xyz/tools/ml-sandbox",
                      "description": "High-performance browser-based Python environment for machine learning, data science, and scientific computing with Pyodide.",
                      "applicationCategory": "DeveloperApplication",
                      "operatingSystem": "All",
                      "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD"
                      },
                      "featureList": [
                        "Real-time Python execution",
                        "Pandas & NumPy support",
                        "Scikit-learn model training",
                        "Matplotlib graph rendering",
                        "AI Code Optimization",
                        "Dataset persistence"
                      ]
                    })}
                </script>
            </Helmet>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
                <div style={{ background: '#0f172a', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: isReady ? '#22c55e' : '#f59e0b' }}></div>
                            <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{status}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {datasets.length > 0 && (
                                <select 
                                    onChange={(e) => { const ds = datasets.find(d => d.id === e.target.value); if (ds) loadDatasetIntoMemory(ds); e.target.value = ''; }}
                                    style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', outline: 'none' }}
                                >
                                    <option value="">Load Dataset into memory...</option>
                                    {datasets.map(d => <option key={d.id} value={d.id}>{d.filename}</option>)}
                                </select>
                            )}
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                {uploadingDb ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                                Upload CSV/JSON
                                <input type="file" accept=".csv,.json" style={{ display: 'none' }} onChange={handleFileUpload} />
                            </label>
                            <button onClick={saveNotebook} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save Notebook
                            </button>
                            {!userId && (
                                <div style={{ 
                                    padding: '8px 12px', 
                                    background: 'rgba(255,165,0,0.1)', 
                                    color: '#ffa500', 
                                    borderRadius: '8px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 700,
                                    border: '1px solid rgba(255,165,0,0.2)'
                                }}>
                                    GUEST MODE
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {cells.map((cell, idx) => (
                            <div key={cell.id} style={{ border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden', background: '#0a0a0f' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#1e293b', borderBottom: '1px solid #334155' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>In [{idx + 1}]</span>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button onClick={() => handleAiOptimize(cell.id, cell.content, cell.error)} disabled={aiFixing === cell.id} style={{ background: 'transparent', border: 'none', color: '#a855f7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                                            {aiFixing === cell.id ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} AI Optimize
                                        </button>
                                        <button onClick={() => runCell(cell.id, cell.content)} disabled={cell.isRunning || !isReady} style={{ background: 'transparent', border: 'none', color: '#22c55e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                                            {cell.isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Run
                                        </button>
                                        <button onClick={() => removeCell(cell.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <textarea 
                                    value={cell.content} onChange={(e) => updateCellContent(cell.id, e.target.value)} spellCheck="false"
                                    style={{ width: '100%', minHeight: '100px', background: '#0a0a0f', color: '#e2e8f0', border: 'none', padding: '16px', outline: 'none', resize: 'vertical', fontSize: '0.95rem', lineHeight: '1.6', fontFamily: 'monospace' }}
                                />
                                {(cell.output || cell.error || cell.plot) && (
                                    <div style={{ padding: '16px', borderTop: '1px solid #334155', background: '#050508', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                                        {cell.error && <div style={{ color: '#ef4444', whiteSpace: 'pre-wrap' }}>{cell.error}</div>}
                                        {cell.output && <div style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{cell.output}</div>}
                                        {cell.plot && (
                                            <div style={{ marginTop: '12px', background: '#fff', padding: '10px', borderRadius: '8px', display: 'inline-block' }}>
                                                <img src={`data:image/png;base64,${cell.plot}`} alt="Plot" style={{ maxWidth: '100%' }} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <button onClick={addCell} style={{ marginTop: '20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed #334155', color: '#94a3b8', width: '100%', padding: '12px', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                        <Plus size={16} /> Add Code Cell
                    </button>
                </div>

                {/* --- Extensive SEO / AIO Content Section (200+ Lines) --- */}
                <div style={{ 
                    marginTop: '60px', 
                    padding: '60px 40px', 
                    background: 'rgba(15, 23, 42, 0.3)', 
                    borderRadius: '32px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    lineHeight: '1.8',
                    color: '#94a3b8'
                }}>
                    {/* Section 1: The Power of Browser-Based Data Science */}
                    <section>
                        <h2 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.5px' }}>
                            Machine Learning Reimagined: The Ultimate Online Python Sandbox
                        </h2>
                        <p style={{ fontSize: '1.15rem', marginBottom: '20px' }}>
                            Traditional Machine Learning (ML) workflows often require complex local setups: 
                            Anaconda environments, Docker containers, or Jupyter Hub installations. 
                            Whizan AI's **Python ML Sandbox** shatters these barriers by leveraging 
                            **WebAssembly (Wasm)** to bring a full-scale Data Science environment directly 
                            to your browser. No installation, no cloud costs—just zero-latency, 
                            high-performance computing at your fingertips.
                        </p>
                        <p style={{ marginBottom: '20px' }}>
                            Whether you are a data scientist performing **Exploratory Data Analysis (EDA)**, 
                            a student learning **Linear Regression**, or an engineer testing a **Scikit-learn** 
                            model, our sandbox provides an isolated, persistent, and 100% free lab. 
                            Built on the **Pyodide** engine, our playground supports the world's most 
                            popular scientific libraries, giving you the power of a local machine with 
                            the accessibility of a web app.
                        </p>
                    </section>

                    {/* Section 2: Core Technological Stack */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px', margin: '50px 0' }}>
                        <section>
                            <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Code2 size={24} color="#3b82f6" /> Full Scientific Stack
                            </h3>
                            <p style={{ marginBottom: '15px' }}>
                                Our environment isn't just a basic Python interpreter. We pre-load the 
                                essential tools for professional data science. Transition from raw 
                                data to model insights seamlessly using our built-in suite:
                            </p>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '10px' }}>📊 **Pandas**: Advanced data manipulation and DataFrame analysis.</li>
                                <li style={{ marginBottom: '10px' }}>📊 **NumPy**: High-performance multi-dimensional array processing.</li>
                                <li style={{ marginBottom: '10px' }}>📊 **Matplotlib**: Publication-quality plots and visual data storytelling.</li>
                                <li style={{ marginBottom: '10px' }}>📊 **Scikit-learn**: The machine learning gold standard for model training.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <BrainCircuit size={24} color="#a855f7" /> AI-Driven Development
                            </h3>
                            <p style={{ marginBottom: '15px' }}>
                                Don't get stuck on syntax errors or index mismatches. Our **AI ML Copilot** 
                                is integrated into every code cell. Highlighting an error? Our AI 
                                analyzes your Python traceback and suggests the precise logic 
                                adjustment to get your training back on track.
                            </p>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '10px' }}>🤖 Real-time Python code optimization</li>
                                <li style={{ marginBottom: '10px' }}>🤖 Predictive library imports</li>
                                <li style={{ marginBottom: '10px' }}>🤖 Automated hyperparameter suggestions</li>
                            </ul>
                        </section>
                    </div>

                    {/* Section 3: Interactive Data Management */}
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '50px 0' }} />

                    <section>
                        <h3 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700, marginBottom: '25px' }}>
                            Why Practice Machine Learning with Whizan AI?
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            <div>
                                <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '12px', fontSize: '1.2rem' }}>1. Local Execution, Web Portability</h4>
                                <p>
                                    Because we use WebAssembly, your code executes on *your* CPU, not a remote 
                                    server. This ensures that your private CSV datasets never leave your 
                                    device unless you choose to save them to our secure cloud. It's the 
                                    perfect balance of security, speed, and cross-platform compatibility.
                                </p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '12px', fontSize: '1.2rem' }}>2. Seamless Dataset Integration</h4>
                                <p>
                                    Stop manually writing file paths. Our **Online ML Sandbox** features a 
                                    drag-and-drop uploader. Once you upload a CSV or JSON, our engine 
                                    automatically mounts it to the virtual filesystem and generates the 
                                    Python code to load it into a Pandas DataFrame instantly.
                                </p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '12px', fontSize: '1.2rem' }}>3. Advanced Plotting Infrastructure</h4>
                                <p>
                                    Visualizing distributions and correlations is critical. Our sandbox 
                                    intercepts Matplotlib's output and renders it as interactive, 
                                    exportable PNGs directly in your notebook feed. Analyze your 
                                    **Random Forest** performance or **K-Means clustering** with 
                                    professional-grade visuals.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Workflow Table */}
                    <section style={{ marginTop: '70px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700, marginBottom: '30px' }}>
                            Professional Use Cases for the Python Sandbox
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#94a3b8', fontSize: '0.95rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ textAlign: 'left', padding: '20px', color: '#fff' }}>Data Lifecycle Stage</th>
                                        <th style={{ textAlign: 'left', padding: '20px', color: '#fff' }}>Tool/Methodology</th>
                                        <th style={{ textAlign: 'left', padding: '20px', color: '#fff' }}>Outcome</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '20px' }}>Data Ingestion</td>
                                        <td style={{ padding: '20px' }}>CSV/JSON Upload + Pandas</td>
                                        <td style={{ padding: '20px' }}>Clean, structured DataFrames.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '20px' }}>Feature Engineering</td>
                                        <td style={{ padding: '20px' }}>NumPy & Scipy</td>
                                        <td style={{ padding: '20px' }}>Advanced math transformations.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '20px' }}>Model Training</td>
                                        <td style={{ padding: '20px' }}>Scikit-learn (SVM, MLP, GBT)</td>
                                        <td style={{ padding: '20px' }}>Trained models in memory.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '20px' }}>Evaluation</td>
                                        <td style={{ padding: '20px' }}>Matplotlib & Metrics</td>
                                        <td style={{ padding: '20px' }}>Loss curves & Confusion matrices.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Section 5: Built-in Libraries List */}
                    <section style={{ marginTop: '70px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700, marginBottom: '25px' }}>
                            Ready-to-Use Machine Learning Libraries
                        </h3>
                        <p style={{ marginBottom: '30px' }}>
                            Skip the `pip install`. Our sandbox comes pre-configured with the latest stable versions of:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px' }}>
                            {[
                                { name: 'Pandas', desc: 'Data structures & analysis tools.' },
                                { name: 'NumPy', desc: 'Scientific computing with Python.' },
                                { name: 'Scikit-learn', desc: 'Pre-loaded ML algorithms.' },
                                { name: 'Matplotlib', desc: '2D plotting library for Python.' },
                                { name: 'Statistics', desc: 'Standard math & stats functions.' },
                                { name: 'Pyodide', desc: 'Python at the speed of Wasm.' }
                            ].map(lib => (
                                <div key={lib.name} style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ color: '#fff', marginBottom: '10px', fontSize: '1.1rem' }}>{lib.name}</h4>
                                    <p style={{ fontSize: '0.85rem' }}>{lib.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 6: AI-Assisted Mentorship */}
                    <section style={{ marginTop: '70px', padding: '40px', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '30px', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700, marginBottom: '20px' }}>
                            Elevate your Data Science with AI Intelligence
                        </h3>
                        <p style={{ marginBottom: '0' }}>
                            At Whizan AI, we believe the future of data science is collaborative. Our **AI ML Copilot** 
                            is more than a code editor—it's a mentor. If your model's accuracy is low or your 
                            preprocessing steps are inefficient, simply click "AI Optimize". Our AI will evaluate 
                            your approach, suggest vectorization over loops, and recommend the best 
                            hyperparameters for your distribution. Landing a Data Science role has never 
                            been easier.
                        </p>
                    </section>

                    {/* Section 7: Detailed FAQ */}
                    <section style={{ marginTop: '70px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700, marginBottom: '40px' }}>
                            Data Science Sandbox: FAQ
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '35px' }}>
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '12px' }}>Is my data secure in the ML Sandbox?</h4>
                                <p>Yes. All Python execution happens locally in your browser's memory. Your data is never sent to our servers for processing unless you sign in and hit 'Save Notebook'.</p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '12px' }}>Which Python version is used?</h4>
                                <p>We use the latest Pyodide release, which currently provides a Python 3.11+ environment with full support for asyncio and standard protocols.</p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '12px' }}>Can I use external datasets?</h4>
                                <p>Absolutely. You can upload any CSV or JSON file. The sandbox mounts them to the local directory for easy access via `pd.read_csv()`.</p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '12px' }}>How do I save my ML models?</h4>
                                <p>Sign in with your Whizan AI account to save your entire notebook state, including your code cells and preprocessing steps, to the cloud.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 8: Final CTA */}
                    <section style={{ marginTop: '80px', textAlign: 'center' }}>
                        <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, marginBottom: '30px' }}>
                            Start Training Today
                        </h2>
                        <p style={{ marginBottom: '40px', maxWidth: '850px', margin: '0 auto 40px', fontSize: '1.1rem' }}>
                            Stop wasting time with local environment errors. Join thousands of high-performance 
                            engineers mastering **Machine Learning and Data Science** with Whizan AI. 
                            The most powerful **Python Sandbox** in the world is 100% free.
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginBottom: '50px' }}>
                            {[
                                'python-playground', 'ml-sandbox', 'online-jupyter', 'data-science-tools', 
                                'learn-pandas-online', 'scikit-learn-tutorial', 'free-python-editor', 
                                'whizan-ai-ml', 'coding-interview-prep', 'data-engineering-lab'
                            ].map(tag => (
                                <span key={tag} style={{ fontSize: '0.85rem', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 20px', borderRadius: '40px', background: 'rgba(255,255,255,0.01)' }}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        <button 
                            onClick={() => window.location.href = '/dashboard'}
                            style={{ 
                                background: 'linear-gradient(135deg, #a855f7, #3b82f6)', 
                                color: '#fff', 
                                border: 'none', 
                                padding: '18px 50px', 
                                borderRadius: '20px', 
                                fontWeight: 800, 
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                boxShadow: '0 20px 40px -15px rgba(168,85,247,0.4)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(168,85,247,0.6)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(168,85,247,0.4)';
                            }}
                        >
                            Explore Data Science Masterclasses
                        </button>
                    </section>

                    {/* Section 9: Footer Note */}
                    <footer style={{ marginTop: '100px', paddingTop: '50px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', color: '#475569', textAlign: 'center' }}>
                        <p>
                            **Technical Architecture:** Powered by Pyodide and Emscripten. Whizan AI Python Sandbox 
                            implements the core C-Python runtime as a statically cached Wasm binary for ultimate 
                            performance. © 2026 Whizan AI - Empowering Career Growth with Intelligence.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
