import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Loader2, CheckCircle2, User, Building, Code2,
    Brain, Volume2, Play, AlertCircle, ArrowLeft, Terminal, LayoutTemplate,
    ChevronDown, ChevronUp, Shuffle
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

const LANG_OPTIONS = { python: 'Python 3', javascript: 'JavaScript', cpp: 'C++', c: 'C', java: 'Java', go: 'Go', rust: 'Rust' };
const DIFFICULTY_COLOR = { Easy: '#00b8a3', Medium: '#ffa116', Hard: '#ef4743' };

const VOICE_TEMPLATES = [
    { id: 'manan', speaker: 'manan', name: 'Manan', gender: 'Male', accent: 'Indian', tag: 'Authoritative', emoji: '🎙️' },
    { id: 'ratan', speaker: 'ratan', name: 'Ratan', gender: 'Male', accent: 'Indian', tag: 'Calm', emoji: '🔊' },
    { id: 'rohan', speaker: 'rohan', name: 'Rohan', gender: 'Male', accent: 'Indian', tag: 'Deep', emoji: '🎧' },
    { id: 'jessica', speaker: 'shreya', name: 'Jessica', gender: 'Female', accent: 'Indian', tag: 'Articulate', emoji: '✨' },
    { id: 'shreya', speaker: 'shreya', name: 'Shreya', gender: 'Female', accent: 'Indian', tag: 'Warm', emoji: '🎤' },
    { id: 'roopa', speaker: 'roopa', name: 'Roopa', gender: 'Female', accent: 'Indian', tag: 'Professional', emoji: '🎙️' },
];
const PREVIEW_TEXT = "Hello! I'm your AI interviewer today. Let's get started!";

export default function AIInterviewSelect() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // Config state
    const [role, setRole] = useState('');
    const [company, setCompany] = useState('');
    const [language, setLanguage] = useState('python');
    const [selectedVoice, setSelectedVoice] = useState(VOICE_TEMPLATES[0]);
    const [previewLoading, setPreviewLoading] = useState(null);

    // Metadata + DB fetching
    const [metadataCompanies, setMetadataCompanies] = useState([]);
    const [companySearch, setCompanySearch] = useState('');
    const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);

    // Problem mode: 'random' | 'manual'
    const [problemMode, setProblemMode] = useState('random');

    // Manual problem state
    const [problemSearch, setProblemSearch] = useState('');
    const [problems, setProblems] = useState([]);
    const [problemsLoading, setProblemsLoading] = useState(false);
    const [selectedProblem, setSelectedProblem] = useState(null);

    // UI state
    const [setupError, setSetupError] = useState('');
    const [setupNotice, setSetupNotice] = useState('');
    const [isDsaModalOpen, setIsDsaModalOpen] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login?redirect=/aiinterviewselect');
        }
    }, [currentUser, navigate]);

    // Fetch Metadata for companies
    useEffect(() => {
        fetch('https://leetcode-orchestration-55z3.onrender.com/api/metadata')
            .then(r => r.json())
            .then(d => {
                if (d.companies) setMetadataCompanies(d.companies);
            })
            .catch(console.error);
    }, []);

    // Load initial manual problems
    useEffect(() => {
        if (isDsaModalOpen && problemMode === 'manual') {
            setProblemsLoading(true);
            fetch('https://leetcode-orchestration-55z3.onrender.com/api/problems?page=1&limit=50')
                .then(r => r.json())
                .then(d => { if (d.data) setProblems(d.data); })
                .catch(console.error)
                .finally(() => setProblemsLoading(false));
        }
    }, [isDsaModalOpen, problemMode]);

    // Search manual problems delay
    useEffect(() => {
        if (isDsaModalOpen && problemMode === 'manual') {
            const t = setTimeout(() => {
                fetch(`https://leetcode-orchestration-55z3.onrender.com/api/problems?page=1&limit=50&search=${encodeURIComponent(problemSearch)}`)
                    .then(r => r.json())
                    .then(d => { if (d.data) setProblems(d.data); })
                    .catch(console.error);
            }, 300);
            return () => clearTimeout(t);
        }
    }, [problemSearch, isDsaModalOpen, problemMode]);

    // Handle outside click for company dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setCompanyDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCompanies = metadataCompanies.filter(c => c.toLowerCase().includes(companySearch.toLowerCase()));
    const filteredProblems = problems.filter(p => !problemSearch || p.title.toLowerCase().includes(problemSearch.toLowerCase()));

    const handleStartSimulation = async () => {
        if (!role.trim()) { setSetupError('Please enter a job role.'); return; }
        if (!company.trim()) { setSetupError('Please select a company.'); return; }

        let problemToUse = null;

        if (problemMode === 'manual') {
            if (!selectedProblem) { setSetupError('Please manually select a problem.'); return; }
            problemToUse = selectedProblem;
        } else {
            // Random mode - fetch from API
            try {
                setIsStarting(true);
                const res = await fetch(`https://leetcode-orchestration-55z3.onrender.com/api/problems/random?company=${encodeURIComponent(company)}`);
                const data = await res.json();

                if (data.error) {
                    setSetupError('Failed to fetch a random problem. Please try again.');
                    setIsStarting(false);
                    return;
                }

                if (data.fallback) {
                    setSetupNotice(`No dataset problems found specifically for "${company}" — assigned a random problem instead.`);
                } else {
                    setSetupNotice('');
                }

                problemToUse = data;
            } catch (err) {
                console.error("Error fetching random problem:", err);
                setSetupError('Failed to fetch a random problem. Please try again.');
                setIsStarting(false);
                return;
            }
        }

        setSetupError('');

        // Push config to AIInterview
        navigate('/aiinterview', {
            state: {
                setupParams: {
                    role, company, language, selectedProblem: problemToUse, selectedVoice
                }
            }
        });
    };

    return (
        <div style={{ minHeight: '100vh', background: '#050505', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)', color: '#fff', position: 'relative' }}>
            {/* Top Navigation */}
            <nav style={{ height: '64px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={20} color="var(--txt2)" />
                        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--txt2)' }}>Back to Dashboard</span>
                    </div>
                </div>
            </nav>

            {/* Main Selection Area */}
            <div style={{ padding: '4rem 1.5rem', maxWidth: '1000px', margin: '0 auto', width: '100%', animation: 'fadeUp 0.4s ease-out' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.1))', border: '1px solid rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 30px rgba(168,85,247,0.15)' }}>
                        <Brain size={32} color="#a855f7" />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Choose Interview Type</h1>
                    <p style={{ color: 'var(--txt2)', fontSize: '1.05rem' }}>Select the format of the AI mock interview you want to practice.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    {/* DSA Card */}
                    <div
                        onClick={() => setIsDsaModalOpen(true)}
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2.5rem 2rem', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#a855f7'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(168,85,247,0.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
                        <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <Terminal size={40} color="#a855f7" strokeWidth={1.5} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>Data Structures & Algorithms</h2>
                        <p style={{ color: 'var(--txt2)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>Tackle coding challenges live in a browser IDE with an interactive AI giving you real-time hints, feedback, and edge-case testing.</p>
                        <div style={{ marginTop: 'auto', padding: '8px 24px', borderRadius: '99px', background: 'rgba(255,255,255,0.05)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt)' }}>Start DSA Practice &rarr;</div>
                    </div>

                    {/* System Design Card */}
                    <div
                        onClick={() => navigate('/systemdesign')}
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2.5rem 2rem', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(59,130,246,0.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
                        <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <LayoutTemplate size={40} color="#3b82f6" strokeWidth={1.5} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>System Design</h2>
                        <p style={{ color: 'var(--txt2)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>Draw on an infinite canvas, drag components, and architect scalable systems while the AI critiques your HLD and bottlenecks.</p>
                        <div style={{ marginTop: 'auto', padding: '8px 24px', borderRadius: '99px', background: 'rgba(255,255,255,0.05)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt)' }}>Start System Design &rarr;</div>
                    </div>
                </div>
            </div>

            {/* --- DSA CONFIGURATION MODAL --- */}
            {isDsaModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setIsDsaModalOpen(false)} />

                    <div style={{ position: 'relative', width: '100%', maxWidth: '700px', background: '#0a0a0a', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Terminal size={20} color="#a855f7" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Configure DSA Interview</h2>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--txt3)' }}>Setup your target role and problem constraints</div>
                                </div>
                            </div>
                            <button onClick={() => setIsDsaModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--txt3)', cursor: 'pointer', padding: '8px' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--txt3)'}>
                                <ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                        </div>

                        <div style={{ padding: '2rem', overflowY: 'auto' }}>

                            {/* Role & Company Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--txt2)', marginBottom: '0.6rem', fontWeight: 600 }}>
                                        <User size={14} /> Target Job Role
                                    </label>
                                    <input type="text" placeholder="e.g. SDE-2, ML Engineer"
                                        value={role} onChange={e => setRole(e.target.value)}
                                        style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                                        onFocus={e => e.target.style.borderColor = '#a855f7'}
                                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                    />
                                </div>

                                <div ref={dropdownRef} style={{ position: 'relative' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--txt2)', marginBottom: '0.6rem', fontWeight: 600 }}>
                                        <Building size={14} /> Target Company
                                    </label>
                                    <div
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'text', borderColor: companyDropdownOpen ? '#a855f7' : 'var(--border)', transition: 'border-color 0.2s' }}
                                        onClick={() => setCompanyDropdownOpen(true)}
                                    >
                                        <input
                                            type="text"
                                            placeholder="e.g. Google, Amazon"
                                            value={companyDropdownOpen ? companySearch : company}
                                            onChange={e => { setCompanySearch(e.target.value); if (!companyDropdownOpen) setCompanyDropdownOpen(true); }}
                                            onFocus={() => { setCompanyDropdownOpen(true); setCompanySearch(company); }}
                                            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.95rem', outline: 'none', width: '100%' }}
                                        />
                                        <ChevronDown size={16} color="var(--txt3)" style={{ transform: companyDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                                    </div>

                                    {companyDropdownOpen && (
                                        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#111', border: '1px solid var(--border)', borderRadius: '12px', maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                                            {filteredCompanies.length === 0 ? (
                                                <div style={{ padding: '0.8rem 1rem', color: 'var(--txt3)', fontSize: '0.85rem' }}>No companies found. Type to use custom.</div>
                                            ) : (
                                                filteredCompanies.map(c => (
                                                    <div key={c}
                                                        onClick={() => { setCompany(c); setCompanySearch(c); setCompanyDropdownOpen(false); }}
                                                        style={{ padding: '0.75rem 1rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--txt)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.1)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        {c}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Problem Selection Mechanism */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--txt2)', marginBottom: '0.8rem', fontWeight: 600 }}>
                                    <Brain size={14} /> Problem Selection
                                </label>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                                    <button
                                        onClick={() => setProblemMode('random')}
                                        style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: problemMode === 'random' ? 'rgba(168,85,247,0.1)' : 'var(--bg)', border: `1px solid ${problemMode === 'random' ? '#a855f7' : 'var(--border)'} `, color: problemMode === 'random' ? '#fff' : 'var(--txt2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}
                                    >
                                        <div style={{ width: 36, height: 36, borderRadius: '8px', background: problemMode === 'random' ? '#a855f7' : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Shuffle size={18} color={problemMode === 'random' ? '#fff' : 'var(--txt3)'} />
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>Surprise Me (Random)</div>
                                            <div style={{ fontSize: '0.75rem', color: problemMode === 'random' ? 'rgba(255,255,255,0.7)' : 'var(--txt3)' }}>AI assigns a problem asked at {company || 'the company'}.</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setProblemMode('manual')}
                                        style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: problemMode === 'manual' ? 'rgba(168,85,247,0.1)' : 'var(--bg)', border: `1px solid ${problemMode === 'manual' ? '#a855f7' : 'var(--border)'} `, color: problemMode === 'manual' ? '#fff' : 'var(--txt2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}
                                    >
                                        <div style={{ width: 36, height: 36, borderRadius: '8px', background: problemMode === 'manual' ? '#a855f7' : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Search size={18} color={problemMode === 'manual' ? '#fff' : 'var(--txt3)'} />
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>Manual Selection</div>
                                            <div style={{ fontSize: '0.75rem', color: problemMode === 'manual' ? 'rgba(255,255,255,0.7)' : 'var(--txt3)' }}>Browse dataset to choose a specific problem.</div>
                                        </div>
                                    </button>
                                </div>

                                {/* Manual Selector Render */}
                                {problemMode === 'manual' && (
                                    <div style={{ padding: '1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', animation: 'fadeIn 0.2s' }}>
                                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                            <Search size={16} color="var(--txt3)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                            <input
                                                type="text"
                                                placeholder="Search specific problems by title..."
                                                value={problemSearch}
                                                onChange={e => setProblemSearch(e.target.value)}
                                                style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.25rem', background: '#111', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                                            />
                                        </div>
                                        <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                            {problemsLoading ? (
                                                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--txt3)' }}><Loader2 size={16} className="spin" /></div>
                                            ) : filteredProblems.length === 0 ? (
                                                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--txt3)', fontSize: '0.85rem' }}>No problems found.</div>
                                            ) : (
                                                filteredProblems.slice(0, 30).map(p => (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => setSelectedProblem(p)}
                                                        style={{ padding: '0.7rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)', background: selectedProblem?.id === p.id ? 'rgba(168,85,247,0.15)' : 'transparent', borderLeft: selectedProblem?.id === p.id ? '3px solid #a855f7' : '3px solid transparent' }}
                                                    >
                                                        <span style={{ fontSize: '0.85rem', fontWeight: selectedProblem?.id === p.id ? 600 : 400, color: selectedProblem?.id === p.id ? '#a855f7' : 'var(--txt2)' }}>{p.title}</span>
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: DIFFICULTY_COLOR[p.difficulty] }}>{p.difficulty}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Voice & Lang Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--txt2)', marginBottom: '0.6rem', fontWeight: 600 }}>
                                        <Volume2 size={14} /> AI Interviewer Voice
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                        {VOICE_TEMPLATES.map(voice => (
                                            <div
                                                key={voice.id}
                                                onClick={() => setSelectedVoice(voice)}
                                                style={{ border: `1px solid ${selectedVoice.id === voice.id ? '#a855f7' : 'var(--border)'} `, borderRadius: '8px', padding: '0.5rem 0.75rem', cursor: 'pointer', background: selectedVoice.id === voice.id ? 'rgba(168,85,247,0.1)' : 'var(--bg)', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}
                                            >
                                                <span>{voice.emoji}</span>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: selectedVoice.id === voice.id ? '#a855f7' : 'var(--txt)' }}>{voice.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--txt2)', marginBottom: '0.6rem', fontWeight: 600 }}>
                                        <Code2 size={14} /> Language
                                    </label>
                                    <select value={language} onChange={e => setLanguage(e.target.value)}
                                        style={{ width: '100%', padding: '0.85rem 1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}>
                                        {Object.entries(LANG_OPTIONS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                    </select>
                                </div>
                            </div>

                            {setupNotice && (
                                <div style={{ marginTop: '0.5rem', padding: '0.8rem 1rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '12px', fontSize: '0.85rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={16} /> {setupNotice}
                                </div>
                            )}
                            {setupError && (
                                <div style={{ marginTop: '0.5rem', padding: '0.8rem 1rem', background: 'var(--fail-dim)', border: '1px solid rgba(239,71,67,0.3)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--fail)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={16} /> {setupError}
                                </div>
                            )}

                        </div>

                        <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--border)', background: 'var(--surface)', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button onClick={() => setIsDsaModalOpen(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border)', color: '#fff', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            <button
                                onClick={handleStartSimulation}
                                disabled={isStarting}
                                style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, cursor: isStarting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: isStarting ? 0.7 : 1, boxShadow: '0 4px 14px rgba(168,85,247,0.3)' }}
                            >
                                {isStarting ? <><Loader2 size={16} className="spin" /> Deploying Environment...</> : <><Play size={16} fill="currentColor" /> Start Interview</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                    .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.96) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                `}</style>
        </div>
    );
}
