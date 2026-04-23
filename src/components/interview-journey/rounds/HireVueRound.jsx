import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Camera, AlertTriangle, Loader2, Play, Square, RefreshCcw, Send } from 'lucide-react';
import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = 'https://vladmandic.github.io/face-api/model/';

export default function HireVueRound() {
    const { journeyId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    
    useEffect(() => {
        if (!location.state?.fromSetup) {
            navigate(`/interview-journey/${journeyId}/hirevue-setup`, { replace: true });
        }
    }, [location.state, navigate, journeyId]);
    
    const [journey, setJourney] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Timeline phases: 'initializing' | 'prep' | 'action' | 'review' | 'evaluating'
    const [phase, setPhase] = useState('initializing');
    const [timeLeft, setTimeLeft] = useState(30);
    
    // Media & Transcript
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [recordedBlobUrl, setRecordedBlobUrl] = useState(null);
    
    const recognitionRef = useRef(null);
    const [liveTranscript, setLiveTranscript] = useState('');
    const finalTranscriptRef = useRef('');

    // Proctoring
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const violationCountRef = useRef(0);
    const [proctorWarning, setProctorWarning] = useState('');

    useEffect(() => {
        if (!currentUser || !journeyId) return;
        const initSession = async () => {
            try {
                const jDoc = await getDoc(doc(db, 'interviewJourneys', journeyId));
                if (!jDoc.exists()) throw new Error("Journey not found");
                const data = jDoc.data();
                setJourney(data);

                const qs = data.hrDetails?.questions || [];
                if (qs.length === 0) throw new Error("No questions configured.");
                setQuestions(qs);
                
                // Load ML Models
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
                ]);
                setModelsLoaded(true);

                // Setup default camera for live feed
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                // If some evaluations exist, skip those
                const evaluations = data.hrDetails?.evaluations || {};
                const answeredCount = Object.keys(evaluations).length;
                if (answeredCount >= qs.length || data.hrDetails?.status === 'completed') {
                    navigate(`/interview-journey/${journeyId}/`, { replace: true });
                    return;
                } else {
                    setCurrentIndex(answeredCount);
                }
                
                setPhase('prep');
                setTimeLeft(30);

            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        initSession();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch(e){}
            }
        };
    }, []);

    // Main Timer Loop
    useEffect(() => {
        if (phase === 'prep' || phase === 'action') {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        if (phase === 'prep') {
                            startRecording();
                        } else if (phase === 'action') {
                            stopRecording();
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [phase]);

    // ProctorTracker Loop
    useEffect(() => {
        let isRunning = true;
        let streak = 0;

        const loop = async () => {
            if (!isRunning) return;
            if (phase === 'action' && modelsLoaded && videoRef.current && videoRef.current.readyState === 4) {
                try {
                    const detections = await faceapi.detectAllFaces(
                        videoRef.current, 
                        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 })
                    ).withFaceLandmarks();
                    
                    if (detections.length === 0) {
                        setProctorWarning('No face detected.');
                        streak++;
                    } else if (detections.length > 1) {
                        setProctorWarning('Multiple faces detected!');
                        streak++;
                    } else {
                        const landmarks = detections[0].landmarks;
                        const nose = landmarks.getNose()[3];
                        const leftEye = landmarks.getLeftEye()[0];
                        const rightEye = landmarks.getRightEye()[3];
                        
                        const leftDist = Math.abs(nose.x - leftEye.x);
                        const rightDist = Math.abs(nose.x - rightEye.x);
                        const yawRatio = Math.max(leftDist, rightDist) / (Math.min(leftDist, rightDist) + 1);

                        // Strict threshold for looking away
                        if (yawRatio > 2.5) {
                            streak++;
                            setProctorWarning('Please look at the screen.');
                        } else {
                            if (streak > 0) streak--;
                            if (streak === 0) setProctorWarning('');
                        }
                    }

                    // Register formal violation if streak holds
                    if (streak > 15) { // Roughly 3 seconds at 5fps
                        violationCountRef.current += 1;
                        streak = 0; // Reset streak to wait for another distinct block
                    }

                } catch (e) { }
            } else {
                setProctorWarning('');
            }

            setTimeout(() => {
                if(isRunning) requestAnimationFrame(loop);
            }, 200);
        };
        
        loop();
        return () => { isRunning = false; };
    }, [phase, modelsLoaded]);

    useEffect(() => {
        if ((phase === 'prep' || phase === 'action') && videoRef.current && streamRef.current) {
            if (videoRef.current.srcObject !== streamRef.current) {
                videoRef.current.srcObject = streamRef.current;
                videoRef.current.play().catch(e => console.log('Auto-play caught', e));
            }
        }
    }, [phase]);

    const startRecording = () => {
        setPhase('action');
        setTimeLeft(120); // 2 minutes max
        setLiveTranscript('');
        finalTranscriptRef.current = '';
        violationCountRef.current = 0;

        if (streamRef.current) {
            mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
            const chunks = [];
            
            mediaRecorderRef.current.ondataavailable = e => {
                if (e.data.size > 0) chunks.push(e.data);
            };
            
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                setRecordedBlobUrl(url);
                setPhase('review');
            };
            
            mediaRecorderRef.current.start();
        }

        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recog = new SpeechRecognition();
            recog.continuous = true;
            recog.interimResults = true;
            recog.onresult = (event) => {
                let interim = '';
                let final = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final += event.results[i][0].transcript + ' ';
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }
                if (final) {
                    finalTranscriptRef.current += final;
                }
                setLiveTranscript(finalTranscriptRef.current + interim);
            };
            recog.onerror = (e) => console.log('Speech recog error', e.error);
            recog.start();
            recognitionRef.current = recog;
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const handleReRecord = () => {
        setRecordedBlobUrl(null);
        setPhase('prep');
        setTimeLeft(30);
    };

    const handleSubmitResponse = async () => {
        if (phase !== 'review') return;
        setPhase('evaluating');
        
        try {
            const questionText = questions[currentIndex].description;
            const fullTranscript = liveTranscript || "No audio captured.";
            
            // Re-fetch journey for safety
            const jSnap = await getDoc(doc(db, 'interviewJourneys', journeyId));
            const resumeSnippet = jSnap.data().resumeDetails?.experience || '';

            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';
            const res = await fetch(`${API_BASE}/api/hirevue/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transcript: fullTranscript,
                    question: questionText,
                    proctorViolations: violationCountRef.current,
                    resumeSnippet: resumeSnippet
                })
            });

            if (!res.ok) throw new Error("Evaluation failed.");
            const scoreData = await res.json();
            
            const freshData = jSnap.data();
            const newEvals = { ...(freshData.hrDetails?.evaluations || {}) };
            newEvals[currentIndex] = {
                transcript: fullTranscript,
                proctorViolations: violationCountRef.current,
                ...scoreData
            };
            
            let isComplete = currentIndex === questions.length - 1;
            let totalScore = 0;
            if (isComplete) {
                // Calculate average composite
                const sum = Object.values(newEvals).reduce((acc, curr) => acc + (curr.clarity + curr.structure + curr.relevance + curr.confidence) / 4 * 10, 0);
                totalScore = sum / questions.length;
            }

            await updateDoc(doc(db, 'interviewJourneys', journeyId), {
                'hrDetails.evaluations': newEvals,
                ...(isComplete ? { 'hrDetails.status': 'completed', 'hrDetails.compositeScore': totalScore } : {}) // Update HR status
            });
            
            // Advance Pipeline if it's over
            if (isComplete) {
                if (totalScore >= 65) {
                    // Unlock Technical round automatically if hr-round was the active lock
                    const rounds = jSnap.data().rounds || [];
                    const updatedRounds = rounds.map(r => {
                        if (r.type === 'HR') return { ...r, status: 'completed' };
                        if (r.id === 'tech1' && r.locked) return { ...r, locked: false, status: 'pending' };
                        return r;
                    });
                    await updateDoc(doc(db, 'interviewJourneys', journeyId), { rounds: updatedRounds });
                } else {
                    const rounds = jSnap.data().rounds || [];
                    const updatedRounds = rounds.map(r => r.type === 'HR' ? { ...r, status: 'completed' } : r);
                    await updateDoc(doc(db, 'interviewJourneys', journeyId), { rounds: updatedRounds });
                }
                navigate(`/interview-journey/${journeyId}/hirevue-results`);
            } else {
                setCurrentIndex(prev => prev + 1);
                setLiveTranscript('');
                finalTranscriptRef.current = '';
                setPhase('prep');
                setTimeLeft(30);
                setRecordedBlobUrl(null);
            }

        } catch (err) {
            console.error("Submit Error:", err);
            alert("Failed to submit response. Please try again.");
            setPhase('review');
        }
    };


    if (loading || phase === 'initializing') return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={32} className="spin-animation" />
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin-animation { animation: spin 1s linear infinite; }`}</style>
        </div>
    );

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
            <style>{`.glass-panel { background: rgba(255,255,255,0.03); backdropFilter: blur(16px); border: 1px solid rgba(255,255,255,0.08); borderRadius: 20px; }`}</style>
            
            <header style={{ height: '70px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: phase === 'action' ? '#ef4444' : '#10b981', boxShadow: `0 0 10px ${phase === 'action' ? '#ef4444' : '#10b981'}` }} />
                    <span style={{ fontWeight: 700 }}>HireVue • Q{currentIndex + 1} of {questions.length}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', fontSize: '0.9rem', color: 'var(--txt2)' }}>
                    <Camera size={14} /> AI Proctor Active
                </div>
            </header>

            <div style={{ flex: 1, display: 'flex', padding: '2rem', gap: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                
                {/* Left Side: Question & Context */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', color: '#3b82f6', margin: '0 0 1rem 0', fontWeight: 700 }}>{questions[currentIndex]?.title}</h2>
                        <p style={{ fontSize: '1.6rem', lineHeight: 1.5, fontWeight: 500, margin: 0, letterSpacing: '-0.5px' }}>
                            {questions[currentIndex]?.description}
                        </p>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--txt2)', margin: '0 0 1rem 0' }}>Live Transcript</h3>
                        <div style={{ flex: 1, padding: '1.5rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', minHeight: '150px', border: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto' }}>
                            {liveTranscript ? (
                                <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.6, color: '#e5e7eb' }}>{liveTranscript}</p>
                            ) : (
                                <p style={{ margin: 0, fontSize: '1rem', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
                                    {phase === 'prep' ? 'Transcript will appear here once recording starts...' : 'Speak clearly into your microphone...'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Video & Controls */}
                <div style={{ width: '450px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ overflow: 'hidden', position: 'relative', height: '340px' }}>
                        {phase === 'review' ? (
                            <video key="playback" src={recordedBlobUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <video key="livecam" ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                        )}

                        {proctorWarning && phase === 'action' && (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '8px', background: 'rgba(239,68,68,0.9)', color: '#fff', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                                <AlertTriangle size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                                {proctorWarning}
                            </div>
                        )}
                        
                        {(phase === 'prep' || phase === 'action') && (
                            <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {phase === 'prep' ? 'Prep Time' : 'Recording'}
                                </div>
                                <div style={{ background: phase === 'action' ? 'rgba(239,68,68,0.8)' : 'rgba(59,130,246,0.8)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'monospace' }}>
                                    {formatTime(timeLeft)}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {phase === 'prep' && (
                            <>
                                <p style={{ margin: 0, textAlign: 'center', color: 'var(--txt2)', fontSize: '0.9rem' }}>Use this time to prepare your answer.</p>
                                <button onClick={startRecording} style={{ padding: '16px', background: '#fff', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Play size={18} fill="currentColor" /> Start Recording Early
                                </button>
                            </>
                        )}

                        {phase === 'action' && (
                            <>
                                <p style={{ margin: 0, textAlign: 'center', color: '#ef4444', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} /> Recording Answer
                                </p>
                                <button onClick={stopRecording} style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Square size={18} fill="currentColor" /> Done Answering
                                </button>
                            </>
                        )}

                        {phase === 'review' && (
                            <>
                                <p style={{ margin: 0, textAlign: 'center', color: 'var(--txt2)', fontSize: '0.9rem' }}>Review your response before submitting.</p>
                                <button onClick={handleSubmitResponse} style={{ padding: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
                                    <Send size={18} /> Submit Response
                                </button>
                                <button onClick={handleReRecord} style={{ padding: '14px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <RefreshCcw size={18} /> Re-Record
                                </button>
                            </>
                        )}

                        {phase === 'evaluating' && (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <Loader2 size={36} color="#3b82f6" className="spin-animation" style={{ margin: '0 auto 1rem auto' }} />
                                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Analyzing Response</h4>
                                <p style={{ margin: '8px 0 0 0', color: 'var(--txt2)', fontSize: '0.85rem' }}>AI is grading structure and confidence...</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.5); } 100% { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
}
