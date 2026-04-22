import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Camera, Mic, ShieldAlert, Loader2, CheckCircle, ChevronRight, Video, RotateCcw } from 'lucide-react';
import NavProfile from '../../../NavProfile';

const HARDCODED_QUESTIONS = [
    {
        id: 'q1',
        title: 'Challenging Problem',
        description: 'Tell me about a time you solved a challenging technical problem. What was your approach and what was the outcome?'
    },
    {
        id: 'q2',
        title: 'Motivation and Fit',
        description: 'Why are you interested in this role and what makes you a strong fit for the position?'
    }
];

export default function HireVueSetup() {
    const { journeyId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [journey, setJourney] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isResumeMode, setIsResumeMode] = useState(false);

    const [step, setStep] = useState(1);
    const [agreedTNC, setAgreedTNC] = useState(false);
    const [camGranted, setCamGranted] = useState(false);
    const [micGranted, setMicGranted] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (!currentUser || !journeyId) return;
        const fetchJourney = async () => {
            try {
                const jDoc = await getDoc(doc(db, 'interviewJourneys', journeyId));
                if (jDoc.exists()) {
                    const data = jDoc.data();
                    setJourney(data);

                    if (data.hrDetails?.questions?.length > 0) {
                        setIsResumeMode(true);
                        setStep(2); 
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
            alert("Camera and Microphone access are required for the HireVue interview.");
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

    const handleInitializeSession = async () => {
        setStep(3);
        setIsGenerating(true);
        try {
            await updateDoc(doc(db, 'interviewJourneys', journeyId), {
                'hrDetails.questions': HARDCODED_QUESTIONS,
                'hrDetails.status': 'in-progress'
            });
            setTimeout(() => {
                setIsGenerating(false);
            }, 1500); 
        } catch (err) {
            console.error("Initialization failed:", err);
            setIsGenerating(false);
        }
    };

    const handleEnterInterview = async () => {
        stopHardware();
        navigate(`/interview-journey/${journeyId}/hirevue-round`);
    };

    const handleResumeInterview = async () => {
        stopHardware();
        navigate(`/interview-journey/${journeyId}/hirevue-round`);
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
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.3px' }}>Whizan AI HireVue</span>
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
                                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>HireVue Interview Initialization</h1>
                            </div>
                            <p style={{ color: 'var(--txt2)', lineHeight: 1.6, marginBottom: '2rem' }}>
                                You are about to begin a video-based behavioral assessment for the <strong>{journey.role}</strong> position at <strong>{journey.company}</strong>. The assessment consists of 2 behavioral questions.
                            </p>
                            
                            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0' }}>Video Session Guidelines</h3>
                                <ul style={{ color: 'var(--txt2)', fontSize: '0.9rem', paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li>Ensure you are in a quiet and well-lit environment.</li>
                                    <li>You must maintain eye contact with the camera. The system will aggressively monitor your engagement.</li>
                                    <li>You will have the option to review your video response before final submission and re-record if needed.</li>
                                </ul>
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '2rem', fontSize: '0.95rem' }}>
                                <input type="checkbox" checked={agreedTNC} onChange={e => setAgreedTNC(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                I agree to the terms and guidelines.
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
                                    <div>
                                        <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.95rem' }}>Resuming Previous Session</span>
                                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(245,158,11,0.7)' }}>Your saved progress and questions will be restored.</p>
                                    </div>
                                </div>
                            )}

                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px 0' }}>Device Verification</h2>
                                <p style={{ color: 'var(--txt2)' }}>We need to verify your camera and microphone for video recording.</p>
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
                                {!isResumeMode ? (
                                    <button onClick={() => setStep(1)} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', cursor: 'pointer' }}>Back</button>
                                ) : (
                                    <button onClick={() => navigate(`/interview-journey/${journeyId}`)} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', cursor: 'pointer' }}>← Pipeline</button>
                                )}
                                
                                {isResumeMode ? (
                                    <button
                                        disabled={!camGranted || !micGranted}
                                        onClick={handleResumeInterview}
                                        style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: (camGranted && micGranted) ? 'pointer' : 'not-allowed', opacity: (camGranted && micGranted) ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
                                        <RotateCcw size={18} /> Resume Interview
                                    </button>
                                ) : (
                                    <button
                                        disabled={!camGranted || !micGranted}
                                        onClick={handleInitializeSession}
                                        style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: (camGranted && micGranted) ? 'pointer' : 'not-allowed', opacity: (camGranted && micGranted) ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}>
                                        Initialize Interview <ChevronRight size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animation-fade-in" style={{ textAlign: 'center', padding: '3rem 0' }}>
                            {isGenerating ? (
                                <>
                                    <Loader2 size={48} color="#3b82f6" className="spin-animation" style={{ margin: '0 auto 1.5rem auto' }} />
                                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 12px 0' }}>Preparing Interview Room</h2>
                                    <p style={{ color: 'var(--txt2)', maxWidth: '400px', margin: '0 auto' }}>Setting up questions, initializing proctoring models, and calibrating environments. Please wait...</p>
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
                                    <p style={{ color: 'var(--txt2)', marginBottom: '2rem' }}>Ready to proceed to the HireVue Interview Environment.</p>
                                    <button onClick={handleEnterInterview} style={{ padding: '14px 40px', background: '#fff', border: 'none', borderRadius: '12px', color: '#000', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                        <Video size={18} /> Enter Virtual Interview Room
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
