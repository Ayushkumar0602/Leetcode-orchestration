import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { Camera, Mic, ShieldAlert, Loader2, CheckCircle, ChevronRight, Lock, RotateCcw, AlertTriangle, Clock, ArrowLeft } from 'lucide-react';
import NavProfile from '../../../NavProfile';
import { fetchProblems } from '../../../lib/api';
import { toast } from 'sonner';

const EXAM_DURATION_MS = 50 * 60 * 1000; // 50 minutes

export default function TR1Setup() {
    const { journeyId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [journey, setJourney] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isResumeMode, setIsResumeMode] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const [remainingTime, setRemainingTime] = useState(null); // seconds remaining for resume banner

    const [step, setStep] = useState(1);
    const [agreedTNC, setAgreedTNC] = useState(false);
    const [camGranted, setCamGranted] = useState(false);
    const [micGranted, setMicGranted] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isRestarting, setIsRestarting] = useState(false);

    useEffect(() => {
        if (!currentUser || !journeyId) return;
        const fetchJourney = async () => {
            try {
                const jDoc = await getDoc(doc(db, 'interviewJourneys', journeyId));
                if (jDoc.exists()) {
                    const data = jDoc.data();
                    setJourney(data);

                    // ── Completion Lockout ──
                    if (data.tr1Details?.status === 'completed') {
                        navigate(`/interview-journey/${journeyId}`, { replace: true });
                        return;
                    }

                    // ── Expired detection ──
                    if (data.tr1Details?.expiresAt && Date.now() > data.tr1Details.expiresAt && data.tr1Details?.status !== 'completed') {
                        // Mark as expired in Firestore if not already
                        if (data.tr1Details.status !== 'expired') {
                            await updateDoc(doc(db, 'interviewJourneys', journeyId), {
                                'tr1Details.status': 'expired'
                            });
                        }
                        setIsExpired(true);
                        return;
                    }

                    // ── Resume mode detection ──
                    if (data.tr1Details?.problemId && data.tr1Details?.status === 'in-progress') {
                        setIsResumeMode(true);
                        setStep(2);
                        // Compute remaining time for the banner
                        if (data.tr1Details?.expiresAt) {
                            const secs = Math.max(0, Math.floor((data.tr1Details.expiresAt - Date.now()) / 1000));
                            setRemainingTime(secs);
                        }
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
    }, [currentUser, journeyId, navigate]);

    // Tick remaining time for the resume banner
    useEffect(() => {
        if (!isResumeMode || remainingTime === null || remainingTime <= 0) return;
        const interval = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setIsExpired(true);
                    setIsResumeMode(false);
                    // Write expired status
                    updateDoc(doc(db, 'interviewJourneys', journeyId), {
                        'tr1Details.status': 'expired'
                    }).catch(console.error);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isResumeMode, remainingTime, journeyId]);

    const formatCountdown = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

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
            toast.error("Camera and Microphone access are required for proctoring.");
        }
    };

    const stopHardware = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    useEffect(() => {
        return () => stopHardware();
    }, []);

    const handleBootstrapProblems = async () => {
        setStep(3);
        setIsGenerating(true);
        try {
            // Fetch single problem bounded to the company
            const data = await fetchProblems({ companies: [journey.company], page: 1 });
            let pool = data.problems || [];
            if (pool.length === 0) {
                const fallback = await fetchProblems({ page: 1 });
                pool = fallback.problems || [];
            }
            
            // Randomly select one problem
            const picked = pool[Math.floor(Math.random() * pool.length)];

            await updateDoc(doc(db, 'interviewJourneys', journeyId), {
                'tr1Details.problemId': picked.id,
                'tr1Details.problemTitle': picked.title,
                'tr1Details.problemDifficulty': picked.difficulty,
                'tr1Details.status': 'in-progress'
            });

            setIsGenerating(false);

        } catch (err) {
            console.error("Bootstrapping failed:", err);
            toast.error("Failed to initialize problem. Try again.");
            setIsGenerating(false);
            setStep(2); // Go back to hardware step
        }
    };

    const handleEnterExam = async () => {
        stopHardware();
        // Fullscreen — best effort, non-blocking
        try {
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch (e) {
            console.warn("Fullscreen request denied", e);
        }
        
        // Write fresh timer — only on first entry, NOT on resume
        try {
            const now = Date.now();
            await updateDoc(doc(db, 'interviewJourneys', journeyId), {
                'tr1Details.startedAt': now,
                'tr1Details.expiresAt': now + EXAM_DURATION_MS
            });
        } catch(e) {
            console.error("Timer write failed", e);
        }

        navigate(`/interview-journey/${journeyId}/tr1-round`, { state: { fromSetup: true } });
    };

    const handleResumeEnterExam = async () => {
        stopHardware();
        // Fullscreen — best effort, non-blocking
        try {
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch (e) {
            console.warn("Fullscreen request denied", e);
        }
        // Do NOT overwrite expiresAt — timer keeps burning from original startedAt
        navigate(`/interview-journey/${journeyId}/tr1-round`, { state: { fromSetup: true } });
    };

    const handleRestart = async () => {
        setIsRestarting(true);
        try {
            const jSnap = await getDoc(doc(db, 'interviewJourneys', journeyId));
            const data = jSnap.data();
            const updatedRounds = Array.isArray(data.rounds)
                ? data.rounds.map(r => {
                    if (r.id === 'tech1') return { ...r, status: 'pending', locked: false };
                    if (r.id === 'tech2') return { ...r, locked: true };
                    return r;
                })
                : data.rounds;

            // deleteField() fully removes tr1Details — prevents any stale data from prior attempts
            await updateDoc(doc(db, 'interviewJourneys', journeyId), {
                tr1Details: deleteField(),
                rounds: updatedRounds
            });

            toast.success('TR1 fully reset — fresh start!');
            window.location.reload();
        } catch (err) {
            console.error(err);
            toast.error("Failed to restart round.");
        } finally {
            setIsRestarting(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
    if (error || !journey) return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Error: {error}
        </div>
    );

    // ── Expired state render ──
    if (isExpired) {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(239,68,68,0.08) 0%, transparent 50%)', color: '#fff', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                <nav style={{ height: '70px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(12px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate(`/interview-journey/${journeyId}`)}>
                        <ArrowLeft size={18} /> <span style={{ fontWeight: 600 }}>Back to Pipeline</span>
                    </div>
                    <NavProfile />
                </nav>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ maxWidth: '520px', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
                            <AlertTriangle size={36} color="#ef4444" />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 1rem 0' }}>Session Timed Out</h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                            Your 50-minute Technical Round 1 window has expired. No evaluation was generated because the interview was not submitted before the deadline.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={handleRestart}
                                disabled={isRestarting}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '14px', color: '#ef4444', fontWeight: 700, fontSize: '1rem', cursor: isRestarting ? 'wait' : 'pointer' }}
                            >
                                {isRestarting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <RotateCcw size={18} />}
                                Restart Technical Round
                            </button>
                            <button
                                onClick={() => navigate(`/interview-journey/${journeyId}`)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', color: '#fff', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
                            >
                                <ArrowLeft size={18} /> Return to Pipeline
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#050505', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; }
                .resume-banner { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; margin-bottom: 1.5rem; }
                .animation-fade-in { animation: fadeIn 0.4s ease-out; }
            `}</style>
            
            <nav style={{ height: '70px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.3px' }}>Whizan Technical Server</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--txt2)', fontWeight: 600 }}>{journey.company} • {journey.role}</span>
                    <NavProfile />
                </div>
            </nav>

            <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem' }}>
                <div className="glass-card" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />

                    {step === 1 && !isResumeMode && (
                        <div className="animation-fade-in">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                <ShieldAlert size={28} color="#3b82f6" />
                                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Technical Round 1 Initialization</h1>
                            </div>
                            <p style={{ color: 'var(--txt2)', lineHeight: 1.6, marginBottom: '2rem' }}>
                                You are about to begin the Technical Round 1 for the <strong>{journey.role}</strong> position at <strong>{journey.company}</strong>. This focuses heavily on data structures and algorithms via live AI pair programming.
                            </p>
                            
                            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0' }}>Strict Exam Rules</h3>
                                <ul style={{ color: 'var(--txt2)', fontSize: '0.9rem', paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li>AI Proctoring is absolute. Exiting fullscreen or suspicious device interaction is immediately flagged.</li>
                                    <li>Continuous live audio and video feeds are strictly required.</li>
                                    <li>The clock enforces a hard <strong>50-minute</strong> countdown, unaffected by refreshing or closing the tab.</li>
                                    <li>When time expires, your interview is auto-submitted for evaluation.</li>
                                    <li>All violations are recorded and factor into your final evaluation.</li>
                                </ul>
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '2rem', fontSize: '0.95rem' }}>
                                <input type="checkbox" checked={agreedTNC} onChange={e => setAgreedTNC(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                I agree to the exam terms and proctoring constraints.
                            </label>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button disabled={!agreedTNC} onClick={() => setStep(2)} style={{ padding: '12px 28px', background: '#fff', border: 'none', borderRadius: '12px', color: '#000', fontWeight: 700, cursor: agreedTNC ? 'pointer' : 'not-allowed', opacity: agreedTNC ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                                    Continue <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animation-fade-in">
                            {isResumeMode && (
                                <div className="resume-banner">
                                    <RotateCcw size={18} color="#f59e0b" />
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.95rem' }}>Resuming Previous Session</span>
                                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(245,158,11,0.7)' }}>Your saved test continuity will be enforced.</p>
                                    </div>
                                    {remainingTime !== null && remainingTime > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '6px 14px', borderRadius: '8px', fontWeight: 800, fontFamily: 'monospace', fontSize: '1.1rem', color: remainingTime < 300 ? '#ef4444' : '#f59e0b' }}>
                                            <Clock size={16} /> {formatCountdown(remainingTime)}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px 0' }}>Hardware Calibration</h2>
                                <p style={{ color: 'var(--txt2)' }}>Verify local peripherals to engage AI proctoring services.</p>
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                                <div style={{ flex: 1, height: '240px', background: '#000', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative' }}>
                                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                                    {!camGranted && (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt3)' }}>
                                            Camera Feed Unlocked Post-Auth
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
                                {!isResumeMode ? (
                                    <button onClick={() => setStep(1)} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', cursor: 'pointer' }}>Back</button>
                                ) : (
                                    <button onClick={() => navigate(`/interview-journey/${journeyId}`)} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', cursor: 'pointer' }}>← Pipeline</button>
                                )}
                                
                                {isResumeMode ? (
                                    <button
                                        disabled={!camGranted || !micGranted}
                                        onClick={handleResumeEnterExam}
                                        style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: (camGranted && micGranted) ? 'pointer' : 'not-allowed', opacity: (camGranted && micGranted) ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
                                        <RotateCcw size={18} /> Resume Technical
                                    </button>
                                ) : (
                                    <button
                                        disabled={!camGranted || !micGranted}
                                        onClick={handleBootstrapProblems}
                                        style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: (camGranted && micGranted) ? 'pointer' : 'not-allowed', opacity: (camGranted && micGranted) ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}>
                                        Initialize Problem Engine <ChevronRight size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animation-fade-in" style={{ textAlign: 'center', padding: '3rem 0' }}>
                            {isGenerating ? (
                                <>
                                    <Loader2 size={48} color="#3b82f6" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem auto', display: 'block' }} />
                                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 12px 0' }}>Securing TR1 Problem Set</h2>
                                    <p style={{ color: 'var(--txt2)', maxWidth: '400px', margin: '0 auto' }}>Querying backend datasets targeted at {journey.company} expectations. Initializing sandboxed terminal environments...</p>
                                    <div style={{ marginTop: '2rem', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', width: '60%', margin: '2rem auto 0 auto' }}>
                                        <div style={{ height: '100%', width: '50%', background: '#3b82f6', animation: 'progress 2s ease-in-out infinite' }} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', margin: '0 auto 1.5rem auto' }}>
                                        <CheckCircle size={32} />
                                    </div>
                                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 12px 0' }}>Environment Encrypted & Ready</h2>
                                    <p style={{ color: 'var(--txt2)', marginBottom: '0.5rem' }}>You will jump into full pair-programming. Your continuous AI technical interview begins immediately.</p>
                                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', marginBottom: '2rem' }}>⏱ 50 minutes · Absolute countdown · Auto-submit on expiry</p>
                                    <button onClick={handleEnterExam} style={{ padding: '14px 40px', background: '#fff', border: 'none', borderRadius: '12px', color: '#000', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                        <Lock size={18} /> Embark on Technical Round
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
