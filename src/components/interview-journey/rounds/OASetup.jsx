import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Camera, Mic, ShieldAlert, Loader2, CheckCircle, ChevronRight, Lock, RotateCcw } from 'lucide-react';
import NavProfile from '../../../NavProfile';
import { fetchProblems } from '../../../lib/api';

export default function OASetup() {
    const { journeyId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [journey, setJourney] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Resume mode: problems already exist, skip T&C + generation
    const [isResumeMode, setIsResumeMode] = useState(false);

    // Setup States — start at step 1 unless resuming
    const [step, setStep] = useState(1); // 1: T&C, 2: Permissions, 3: Generation/Ready
    const [agreedTNC, setAgreedTNC] = useState(false);
    const [camGranted, setCamGranted] = useState(false);
    const [micGranted, setMicGranted] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedProblems, setSelectedProblems] = useState([]);

    useEffect(() => {
        if (!currentUser || !journeyId) return;
        const fetchJourney = async () => {
            try {
                const jDoc = await getDoc(doc(db, 'interviewJourneys', journeyId));
                if (jDoc.exists()) {
                    const data = jDoc.data();
                    setJourney(data);

                    // If problems are already generated — resume mode
                    if (data.oaDetails?.problemDetails?.length > 0) {
                        setIsResumeMode(true);
                        setStep(2); // Jump straight to permissions step
                    }
                } else {
                    setError("Interview journey not found.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchJourney();
    }, [currentUser, journeyId]);

    const requestHardware = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCamGranted(true);
            setMicGranted(true);
        } catch (err) {
            console.error("Hardware permission denied", err);
            alert("Camera and Microphone access are required for proctoring.");
        }
    };

    const stopHardware = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    useEffect(() => {
        return () => stopHardware(); // Cleanup on unmount
    }, []);

    const handleBootstrapProblems = async () => {
        setStep(3);
        setIsGenerating(true);
        try {
            // 1. Fetch pool
            const data = await fetchProblems({ companies: [journey.company], page: 1 });
            let pool = data.problems || [];
            if (pool.length < 2) {
                const fallback = await fetchProblems({ page: 1 });
                pool = fallback.problems || [];
            }
            
            // 2. Filter logic based on role
            const role = journey.role.toLowerCase();
            const isIntern = role.includes('intern');
            
            let p1, p2;
            if (isIntern) {
                const mediums = pool.filter(p => p.difficulty === 'Medium');
                mediums.sort(() => 0.5 - Math.random());
                p1 = mediums[0] || pool[0];
                p2 = mediums[1] || pool[1];
            } else {
                const mediums = pool.filter(p => p.difficulty === 'Medium');
                const hards = pool.filter(p => p.difficulty === 'Hard');
                mediums.sort(() => 0.5 - Math.random());
                hards.sort(() => 0.5 - Math.random());
                p1 = mediums[0] || pool[0];
                p2 = hards[0] || pool[1];
            }
            
            const picked = [p1, p2];
            setSelectedProblems(picked);

            // 3. Sequential backend generation (Warming up the cache)
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
            for (let prob of picked) {
                await fetch(`${API_BASE}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        problemStatement: prob.description || prob.title, 
                        language: 'python', 
                        problemId: prob.id 
                    })
                });
            }

            // 4. Persist selected problems to oaDetails
            await updateDoc(doc(db, 'interviewJourneys', journeyId), {
                'oaDetails.problemIds': picked.map(p => p.id),
                'oaDetails.problemDetails': picked
            });

            setIsGenerating(false);

        } catch (err) {
            console.error("Bootstrapping failed:", err);
            setIsGenerating(false);
        }
    };

    const handleEnterExam = async () => {
        stopHardware();
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen().catch(err => {
                console.warn("Fullscreen request denied, continuing anyway", err);
            });
        }
        navigate(`/interview-journey/${journeyId}/oa-round`);
    };

    // In resume mode, permissions granted → go directly to enter exam (skip generation)
    const handleResumeEnterExam = async () => {
        stopHardware();
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen().catch(err => {
                console.warn("Fullscreen request denied, continuing anyway", err);
            });
        }
        navigate(`/interview-journey/${journeyId}/oa-round`);
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={32} className="spin-animation" />
        </div>
    );
    if (error || !journey) return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Error: {error}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#050505', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                .spin-animation { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
                .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; }
                .resume-banner { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; margin-bottom: 1.5rem; }
            `}</style>
            
            <nav style={{ height: '70px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.3px' }}>Whizan OA Server</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--txt2)', fontWeight: 600 }}>{journey.company} • {journey.role}</span>
                    <NavProfile />
                </div>
            </nav>

            <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem' }}>
                <div className="glass-card" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />

                    {/* ── STEP 1: T&C (only for fresh start, not resume) ── */}
                    {step === 1 && !isResumeMode && (
                        <div className="animation-fade-in">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                <ShieldAlert size={28} color="#3b82f6" />
                                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Online Assessment Initialization</h1>
                            </div>
                            <p style={{ color: 'var(--txt2)', lineHeight: 1.6, marginBottom: '2rem' }}>
                                You are about to begin a secure technical assessment for the <strong>{journey.role}</strong> position at <strong>{journey.company}</strong>. The assessment consists of 2 technical problems and has a strict duration of 60 minutes.
                            </p>
                            
                            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0' }}>Code of Conduct</h3>
                                <ul style={{ color: 'var(--txt2)', fontSize: '0.9rem', paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li>I will not consult any external sources, copilot tools, or other individuals.</li>
                                    <li>I agree to use a webcam and microphone for ML proctoring during the entire session.</li>
                                    <li>I understand that exiting Full-Screen mode will be logged as a violation.</li>
                                </ul>
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '2rem', fontSize: '0.95rem' }}>
                                <input type="checkbox" checked={agreedTNC} onChange={e => setAgreedTNC(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                I agree to the terms and Code of Conduct.
                            </label>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button disabled={!agreedTNC} onClick={() => setStep(2)} style={{ padding: '12px 28px', background: '#fff', border: 'none', borderRadius: '12px', color: '#000', fontWeight: 700, cursor: agreedTNC ? 'pointer' : 'not-allowed', opacity: agreedTNC ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                                    Continue <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Permissions (shared by fresh start & resume) ── */}
                    {step === 2 && (
                        <div className="animation-fade-in">
                            {/* Resume Banner */}
                            {isResumeMode && (
                                <div className="resume-banner">
                                    <RotateCcw size={18} color="#f59e0b" />
                                    <div>
                                        <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.95rem' }}>Resuming Previous Session</span>
                                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(245,158,11,0.7)' }}>Your saved progress and questions will be restored. Grant proctoring permissions to continue.</p>
                                    </div>
                                </div>
                            )}

                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px 0' }}>Device Verification</h2>
                                <p style={{ color: 'var(--txt2)' }}>We need to verify your camera and microphone for the ML proctoring system.</p>
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                                <div style={{ flex: 1, height: '240px', background: '#000', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative' }}>
                                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                                    {!camGranted && (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt3)' }}>
                                            Camera Feed
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: camGranted ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', borderRadius: '12px', border: `1px solid ${camGranted ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                                        <Camera size={20} color={camGranted ? "#10b981" : "#fff"} />
                                        <span style={{ fontWeight: 600, color: camGranted ? "#10b981" : "#fff" }}>Camera Access</span>
                                        {camGranted && <CheckCircle size={16} color="#10b981" style={{ marginLeft: 'auto' }} />}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: micGranted ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', borderRadius: '12px', border: `1px solid ${micGranted ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                                        <Mic size={20} color={micGranted ? "#10b981" : "#fff"} />
                                        <span style={{ fontWeight: 600, color: micGranted ? "#10b981" : "#fff" }}>Microphone Access</span>
                                        {micGranted && <CheckCircle size={16} color="#10b981" style={{ marginLeft: 'auto' }} />}
                                    </div>
                                    {!camGranted && (
                                        <button onClick={requestHardware} style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                                            Allow Permissions
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                {/* Back button only for fresh start */}
                                {!isResumeMode ? (
                                    <button onClick={() => setStep(1)} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', cursor: 'pointer' }}>Back</button>
                                ) : (
                                    <button onClick={() => navigate(`/interview-journey/${journeyId}`)} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', cursor: 'pointer' }}>← Pipeline</button>
                                )}
                                
                                {isResumeMode ? (
                                    /* Resume mode → skip generation, enter directly */
                                    <button
                                        disabled={!camGranted || !micGranted}
                                        onClick={handleResumeEnterExam}
                                        style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: (camGranted && micGranted) ? 'pointer' : 'not-allowed', opacity: (camGranted && micGranted) ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
                                        <RotateCcw size={18} /> Resume Exam
                                    </button>
                                ) : (
                                    /* Fresh start → generate new problems */
                                    <button
                                        disabled={!camGranted || !micGranted}
                                        onClick={handleBootstrapProblems}
                                        style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: (camGranted && micGranted) ? 'pointer' : 'not-allowed', opacity: (camGranted && micGranted) ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}>
                                        Initialize Environment <ChevronRight size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Generation + Enter (fresh start only) ── */}
                    {step === 3 && (
                        <div className="animation-fade-in" style={{ textAlign: 'center', padding: '3rem 0' }}>
                            {isGenerating ? (
                                <>
                                    <Loader2 size={48} color="#3b82f6" className="spin-animation" style={{ margin: '0 auto 1.5rem auto' }} />
                                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 12px 0' }}>Preparing Secure Exam Hall</h2>
                                    <p style={{ color: 'var(--txt2)', maxWidth: '400px', margin: '0 auto' }}>Initializing problem set, booting up Docker containers, and finalizing sandbox isolations. Please wait...</p>
                                    <div style={{ marginTop: '2rem', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', width: '60%', margin: '2rem auto 0 auto' }}>
                                        <div style={{ height: '100%', width: '50%', background: '#3b82f6', animation: 'progress 2s ease-in-out infinite' }} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', margin: '0 auto 1.5rem auto' }}>
                                        <CheckCircle size={32} />
                                    </div>
                                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 12px 0' }}>Environment Ready</h2>
                                    <p style={{ color: 'var(--txt2)', marginBottom: '2rem' }}>You will be entering Full-Screen mode. The 60-minute timer starts immediately.</p>
                                    <button onClick={handleEnterExam} style={{ padding: '14px 40px', background: '#fff', border: 'none', borderRadius: '12px', color: '#000', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                        <Lock size={18} /> Enter Exam Hall
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
