import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Clock, ShieldAlert, AlertTriangle, LayoutDashboard, Send, FileCode2 } from 'lucide-react';
import AIProctor from '../../AIProctor';
import Dashboard from '../../../Dashboard';

const TOTAL_MINUTES = 60;
const AUTO_SAVE_INTERVAL_MS = 5 * 60 * 1000;

export default function OARound() {
    const { journeyId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [journey, setJourney] = useState(null);
    const [problems, setProblems] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [codes, setCodes] = useState({ 0: '', 1: '' });
    const [scores, setScores] = useState({ 0: null, 1: null });
    
    // Timer
    const [timeLeft, setTimeLeft] = useState(TOTAL_MINUTES * 60);
    const [isTimeUp, setIsTimeUp] = useState(false);
    
    // Security
    const [isFullscreen, setIsFullscreen] = useState(true);
    const [warnings, setWarnings] = useState([]);
    const [proctorError, setProctorError] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!currentUser || !journeyId) return;
        const fetchJourney = async () => {
            const jDoc = await getDoc(doc(db, 'interviewJourneys', journeyId));
            if (jDoc.exists()) {
                const data = jDoc.data();
                setJourney(data);
                if (data.oaDetails?.problemDetails) {
                    setProblems(data.oaDetails.problemDetails);
                    // Extract previously saved codes if they exist
                    const savedCodes = data.oaDetails.savedCodes || {};
                    setCodes({
                        0: savedCodes[0] || '',
                        1: savedCodes[1] || ''
                    });
                    const existingScores = data.oaDetails.scores || {};
                    setScores({
                        0: existingScores[0] || null,
                        1: existingScores[1] || null
                    });
                }
            }
        };
        fetchJourney();
    }, [currentUser, journeyId]);

    // Timer Effect
    useEffect(() => {
        if (!journey) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setIsTimeUp(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [journey]);

    // Trigger auto submission when time is up
    useEffect(() => {
        if (isTimeUp) {
            handleFinalSubmit();
        }
    }, [isTimeUp]);

    // Fullscreen Guard
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
                handleAddWarning("Exited Full-Screen Mode");
            } else {
                setIsFullscreen(true);
            }
        };
        
        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleAddWarning("Tab switched or hidden");
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // 5-Minute Auto Save
    useEffect(() => {
        if (!journey) return;
        const autosave = setInterval(async () => {
            try {
                await updateDoc(doc(db, 'interviewJourneys', journeyId), {
                    'oaDetails.savedCodes': codes
                });
            } catch (err) {
                console.error("Autosave failed", err);
            }
        }, AUTO_SAVE_INTERVAL_MS);
        return () => clearInterval(autosave);
    }, [journey, codes, journeyId]);

    const handleAddWarning = async (reason) => {
        const newWarning = { time: new Date().toISOString(), reason };
        setWarnings(prev => [...prev, newWarning]);
        try {
            await updateDoc(doc(db, 'interviewJourneys', journeyId), {
                'oaDetails.warnings': [...warnings, newWarning]
            });
        } catch (e) {}
    };

    const handleProctorViolation = (reason) => {
        handleAddWarning("Proctor ML: " + reason);
    };

    const handleRequestFullscreen = () => {
        document.documentElement.requestFullscreen().catch(err => {
            console.error("Fullscreen error", err);
        });
    };

    const handleCodeChange = React.useCallback((newCode) => {
        setCodes(prev => ({ ...prev, [activeTab]: newCode }));
    }, [activeTab]);

    const handleScoreUpdate = async (scoreData) => {
        const newScores = { ...scores, [activeTab]: scoreData };
        setScores(newScores);
        // Persist to FB immediately
        try {
            await updateDoc(doc(db, 'interviewJourneys', journeyId), {
                'oaDetails.scores': newScores
            });
        } catch(e) {}
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            const jDoc = await getDoc(doc(db, 'interviewJourneys', journeyId));
            const data = jDoc.data();
            const rawRounds = data.rounds;
            const hasValidRounds = Array.isArray(rawRounds) && rawRounds.length > 0;

            // Build update payload — always save OA details
            const updatePayload = {
                'oaDetails.savedCodes': codes,
                'oaDetails.scores': scores,
                'oaDetails.status': 'completed',
                'oaDetails.warnings': warnings,
                'oaDetails.completedAt': new Date(),
            };

            // Only touch rounds if they are a valid array (not corrupted)
            if (hasValidRounds) {
                const updatedRounds = [...rawRounds];
                const oaIdx = updatedRounds.findIndex(r => r.type === 'OA');
                if (oaIdx !== -1) {
                    updatedRounds[oaIdx].status = 'completed';
                    // Unlock the very next round after OA
                    if (oaIdx + 1 < updatedRounds.length) {
                        updatedRounds[oaIdx + 1].locked = false;
                    }
                }
                updatePayload.rounds = updatedRounds;
            }

            await updateDoc(doc(db, 'interviewJourneys', journeyId), updatePayload);
            
            // Exit fullscreen safely
            if (document.fullscreenElement) {
                await document.exitFullscreen().catch(e => {});
            }
            
            navigate(`/interview-journey/${journeyId}/oa-results`);
        } catch (err) {
            console.error(err);
            alert("Error submitting assessment. Attempting again...");
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const activeProblem = React.useMemo(() => {
        if (!problems.length) return null;
        return {
            id: problems[activeTab]?.id,
            title: problems[activeTab]?.title,
            description: problems[activeTab]?.description,
            difficulty: problems[activeTab]?.difficulty,
            language: 'python'
        };
    }, [problems, activeTab]);

    if (!problems.length) return <div style={{ background: '#050505', minHeight: '100vh' }}></div>;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#050505', color: '#fff' }}>
            {/* Top Bar */}
            <header style={{ height: '56px', background: 'rgba(5,5,5,0.9)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt2)' }}>
                        <LayoutDashboard size={18} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Secure Assessment</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {problems.map((p, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                style={{
                                    background: activeTab === idx ? 'rgba(59,130,246,0.15)' : 'transparent',
                                    border: activeTab === idx ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                                    color: activeTab === idx ? '#3b82f6' : 'var(--txt2)',
                                    padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                                    fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <FileCode2 size={14} /> Question {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239,71,67,0.1)', border: '1px solid rgba(239,71,67,0.2)', padding: '6px 14px', borderRadius: '8px', color: '#ef4743', fontWeight: 700 }}>
                        <Clock size={16} /> 
                        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeLeft)}</span>
                    </div>
                    
                    <button onClick={handleFinalSubmit} disabled={isSubmitting} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Send size={14} /> Finish Exam
                    </button>
                </div>
            </header>

            {/* Warning Overlay */}
            {!isFullscreen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#1a1a1a', padding: '3rem', borderRadius: '16px', border: '1px solid #ef4743', textAlign: 'center', maxWidth: '500px' }}>
                        <ShieldAlert size={48} color="#ef4743" style={{ margin: '0 auto 1.5rem auto' }} />
                        <h2 style={{ color: '#fff', margin: '0 0 1rem 0' }}>Security Violation</h2>
                        <p style={{ color: 'var(--txt2)', lineHeight: 1.5, marginBottom: '2rem' }}>You have exited the secure full-screen mode or switched tabs. This violation has been recorded. Returning to full-screen is required to continue.</p>
                        <button onClick={handleRequestFullscreen} style={{ background: '#ef4743', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                            Return to Exam
                        </button>
                    </div>
                </div>
            )}

            {/* ML Proctor instance */}
            <AIProctor onViolationDetected={handleProctorViolation} />

            {/* Main Editor Space */}
            <div style={{ flex: 1, position: 'relative' }}>
                <Dashboard 
                    key={activeTab} // Forces remount on tab switch
                    embedded={true} 
                    initialProblem={activeProblem} 
                    initialCode={codes[activeTab]}
                    onCodeChange={handleCodeChange}
                    onScoreUpdate={handleScoreUpdate}
                    onSaveCode={() => {
                        // Manual save trigger to FB
                        updateDoc(doc(db, 'interviewJourneys', journeyId), {
                            'oaDetails.savedCodes': codes
                        });
                    }}
                />
            </div>
            
            {/* Minimal Warning HUD */}
            {warnings.length > 0 && (
                <div style={{ position: 'fixed', bottom: 200, right: 30, background: 'rgba(239,71,67,0.9)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', zIndex: 9000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', pointerEvents: 'none' }}>
                    <AlertTriangle size={14} />
                    {warnings.length} Violation{warnings.length > 1 ? 's' : ''} Logged
                </div>
            )}
        </div>
    );
}
