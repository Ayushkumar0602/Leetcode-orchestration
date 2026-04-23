import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { Lock, Play, CheckCircle, Clock, FileText, ChevronRight, X, BrainCircuit, Users, Code, Trophy, RotateCcw, AlertTriangle } from 'lucide-react';
import NavProfile from '../../NavProfile';
import { toast } from 'sonner';

export default function JourneyDashboard() {
    const { journeyId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [journey, setJourney] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [showRetakeModal, setShowRetakeModal] = useState(false);
    const [showRetakeHRModal, setShowRetakeHRModal] = useState(false);
    const [isRetaking, setIsRetaking] = useState(false);

    // TR1 Live Timer state
    const [tr1TimeLeft, setTr1TimeLeft] = useState(null);

    // Effect to tick countdown if TR1 is in progress
    useEffect(() => {
        if (!journey || !journey.tr1Details || journey.tr1Details.status !== 'in-progress' || !journey.tr1Details.expiresAt) {
            setTr1TimeLeft(null);
            return;
        }
        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.floor((journey.tr1Details.expiresAt - Date.now()) / 1000));
            setTr1TimeLeft(remaining);
            // Optionally, if reaches 0, we could auto-reload or let the setup component handle "expired" logic
        }, 1000);
        return () => clearInterval(interval);
    }, [journey]);

    const formatCountdown = (totalSeconds) => {
        if (totalSeconds === null) return '';
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const fetchJourney = async () => {
            if (!currentUser || !journeyId) return;
            try {
                const docRef = doc(db, 'interviewJourneys', journeyId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().userId === currentUser.uid) {
                    setJourney({ id: docSnap.id, ...docSnap.data() });
                } else {
                    toast.error("Journey not found or unauthorized.");
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error("Error fetching journey:", error);
                toast.error("Failed to load journey state.");
            } finally {
                setLoading(false);
            }
        };
        fetchJourney();
    }, [journeyId, currentUser, navigate]);

    // Handle starting or mocking a round completion
    const handleRoundAction = async (roundIndex, round) => {
        if (round.locked) return;
        
        if (round.type === 'OA') {
            // Always navigate to OASetup — it detects resume/fresh internally
            navigate(`/interview-journey/${journeyId}/oa-setup`);
        } else if (round.type === 'HR') {
            navigate(`/interview-journey/${journeyId}/hirevue-setup`);
        } else if (round.type === 'Tech') {
            if (round.id === 'tech1') {
                navigate(`/interview-journey/${journeyId}/tr1-setup`);
            } else if (round.id === 'tech2') {
                toast.info("Tech Round 2 is opening soon!");
            } else {
                toast.info("Tech Round coming soon!");
            }
        }
    };

    // Wipe all OA data and reset round status for a retake
    const handleRetakeOA = async () => {
        setIsRetaking(true);
        try {
            const jDoc = await getDoc(doc(db, 'interviewJourneys', journeyId));
            const data = jDoc.data();
            const updatedRounds = Array.isArray(data.rounds)
                ? data.rounds.map(r => r.type === 'OA'
                    ? { ...r, status: 'pending', locked: false }
                    : r)
                : data.rounds;

            await updateDoc(doc(db, 'interviewJourneys', journeyId), {
                oaDetails: {},   // wipe all OA data
                rounds: updatedRounds
            });

            setJourney(prev => ({ ...prev, oaDetails: {}, rounds: updatedRounds }));
            setShowRetakeModal(false);
            toast.success('OA data cleared. Starting fresh setup...');
            navigate(`/interview-journey/${journeyId}/oa-setup`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to reset OA round.');
        } finally {
            setIsRetaking(false);
        }
    };

    const handleRetakeHR = async () => {
        setIsRetaking(true);
        try {
            const jDoc = await getDoc(doc(db, 'interviewJourneys', journeyId));
            const data = jDoc.data();
            const updatedRounds = Array.isArray(data.rounds)
                ? data.rounds.map(r => {
                    if (r.type === 'HR') return { ...r, status: 'pending', locked: false };
                    if (r.type === 'Tech' && r.status === 'pending') return { ...r, locked: true }; // re-lock tech if HR wiped
                    return r;
                })
                : data.rounds;

            await updateDoc(doc(db, 'interviewJourneys', journeyId), {
                hrDetails: {},   // wipe all HR data
                rounds: updatedRounds
            });

            setJourney(prev => ({ ...prev, hrDetails: {}, rounds: updatedRounds }));
            setShowRetakeHRModal(false);
            toast.success('HireVue data cleared. Starting fresh setup...');
            navigate(`/interview-journey/${journeyId}/hirevue-setup`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to reset HireVue round.');
        } finally {
            setIsRetaking(false);
        }
    };

    const handleRetakeTR1 = async () => {
        setIsRetaking(true);
        try {
            const jDoc = await getDoc(doc(db, 'interviewJourneys', journeyId));
            const data = jDoc.data();
            const updatedRounds = Array.isArray(data.rounds)
                ? data.rounds.map(r => {
                    if (r.id === 'tech1') return { ...r, status: 'pending', locked: false };
                    if (r.id === 'tech2') return { ...r, locked: true, status: 'pending' }; // always re-lock tech2
                    return r;
                })
                : data.rounds;

            // deleteField() removes the entire tr1Details map completely (avoids stale sub-fields)
            await updateDoc(doc(db, 'interviewJourneys', journeyId), {
                tr1Details: deleteField(),
                rounds: updatedRounds
            });

            setJourney(prev => ({ ...prev, tr1Details: null, rounds: updatedRounds }));
            toast.success('TR1 data fully cleared — fresh start!');
            navigate(`/interview-journey/${journeyId}/tr1-setup`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to reset Technical Round 1.');
        } finally {
            setIsRetaking(false);
        }
    };

    // Helper: Mark a round as completed and unlock the next
    const completeRound = async (index) => {
        const updatedRounds = [...journey.rounds];
        updatedRounds[index].status = 'completed';
        
        // Unlock next round if exists
        if (index + 1 < updatedRounds.length) {
            updatedRounds[index + 1].locked = false;
        }

        try {
            await updateDoc(doc(db, 'interviewJourneys', journeyId), {
                rounds: updatedRounds
            });
            setJourney(prev => ({ ...prev, rounds: updatedRounds }));
        } catch (error) {
            toast.error("Error updating journey state.");
        }
    };

    const getRoundIcon = (type) => {
        switch(type) {
            case 'OA': return <Code size={24} />;
            case 'HR': return <Users size={24} />;
            case 'Tech': return <BrainCircuit size={24} />;
            default: return <Clock size={24} />;
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spin-animation"><Clock color="var(--txt3)" size={32} /></div>
            </div>
        );
    }

    if (!journey) return null;

    // Check if entire journey is complete
    const isJourneyComplete = Array.isArray(journey.rounds) && journey.rounds.every(r => r.status === 'completed');

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                padding: '0 1.5rem', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="Logo" style={{ height: '32px', width: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Whizan AI</span>
                </div>
                <div><NavProfile /></div>
            </nav>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
                
                {/* Header Profile Box */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', marginBottom: '4rem', animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={journey.companyLogo || 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg'} alt={journey.company} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>{journey.company}</h1>
                            <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: '1.1rem' }}>{journey.role}</span>
                            <span style={{ color: 'var(--txt3)', margin: '0 8px' }}>•</span>
                            <span style={{ color: 'var(--txt2)' }}>{journey.domain}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => setShowResumeModal(true)} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }} className="hover-btn">
                            <FileText size={18} /> View Context Resume
                        </button>
                    </div>
                </div>

                {/* Path Nodes Visual */}
                <div style={{ position: 'relative', animation: 'fadeIn 0.6s ease-out 0.1s both' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '3rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <Trophy color="#f59e0b" /> Interview Pipeline
                    </h2>
                    
                    <div style={{ position: 'absolute', left: '50px', top: '100px', bottom: '50px', width: '2px', background: 'linear-gradient(to bottom, rgba(59,130,246,0.5), rgba(168,85,247,0.5), rgba(255,255,255,0.1))', zIndex: 0 }} className="path-line-desktop" />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {Array.isArray(journey.rounds) ? journey.rounds.map((round, index) => {
                            let isCompleted = round.status === 'completed';
                            
                            // Self-healing heuristic: if we have evaluated all HR questions but the DB status failed to lock, treat it as completed visually
                            if (round.type === 'HR' && !isCompleted && journey?.hrDetails?.evaluations) {
                                const evalCount = Object.keys(journey.hrDetails.evaluations).length;
                                const totalQs = journey.hrDetails.questions?.length || 999;
                                if (evalCount >= totalQs) {
                                    isCompleted = true;
                                }
                            }

                            let isLocked = round.locked;
                            // Self-healing lock release: if tech round 1 is locked but HR score is passing, release lock
                            if (round.id === 'tech1' && isLocked && journey?.hrDetails?.compositeScore >= 65) {
                                isLocked = false;
                            }
                            
                            // Self-healing lock release: if tech round 2 is locked but TR1 score is passing, release lock
                            if (round.id === 'tech2' && isLocked && journey?.tr1Details?.scoreReport?.overallScore >= 65) {
                                isLocked = false;
                            }

                            const isPending = !isCompleted && round.status === 'pending' && !isLocked;
                            
                            // Determine accent color
                            let badgeColor = 'rgba(255,255,255,0.05)';
                            let badgeBorder = 'rgba(255,255,255,0.1)';
                            let iconColor = 'var(--txt3)';
                            
                            if (isCompleted) {
                                badgeColor = 'rgba(16,185,129,0.1)';
                                badgeBorder = 'rgba(16,185,129,0.3)';
                                iconColor = '#10b981';
                            } else if (isPending) {
                                badgeColor = 'rgba(59,130,246,0.1)';
                                badgeBorder = '#3b82f6';
                                iconColor = '#3b82f6';
                            }

                            return (
                                <div key={round.id} style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', position: 'relative', zIndex: 1, opacity: isLocked ? 0.6 : 1, transition: 'all 0.3s' }}>
                                    
                                    {/* Timeline Marker */}
                                    <div style={{ 
                                        width: '100px', display: 'flex', justifyContent: 'center',
                                        position: 'relative'
                                    }}>
                                        <div style={{ 
                                            width: '50px', height: '50px', borderRadius: '50%', background: badgeColor, border: `2px solid ${badgeBorder}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: isPending ? '0 0 20px rgba(59,130,246,0.5)' : 'none',
                                            transition: 'all 0.3s'
                                        }} className={isPending ? 'pulse-border' : ''}>
                                            {isCompleted ? <CheckCircle color="#10b981" size={24} /> : React.cloneElement(getRoundIcon(round.type), { color: iconColor })}
                                        </div>
                                    </div>

                                    {/* Card */}
                                    <div style={{ 
                                        flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem 2rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
                                        transform: isPending ? 'scale(1.01)' : 'scale(1)', transition: 'all 0.3s',
                                        boxShadow: isPending ? '0 10px 30px rgba(0,0,0,0.3)' : 'none'
                                    }} className="round-card">
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Round {index + 1}
                                                </span>
                                                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{round.title}</h3>
                                            </div>
                                            <p style={{ margin: 0, color: 'var(--txt2)', fontSize: '0.95rem' }}>{round.description}</p>
                                            
                                            {round.type === 'OA' && isPending && (
                                                <span style={{ display: 'inline-block', marginTop: '10px', fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '4px 8px', borderRadius: '4px' }}>Integration Phase Scheduled</span>
                                            )}
                                            {round.type === 'OA' && isCompleted && journey?.oaDetails && (
                                                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Trophy size={16} color="#f59e0b" />
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f59e0b' }}>
                                                        {(() => {
                                                            const oa = journey.oaDetails;
                                                            const probs = oa.problemDetails || [];
                                                            const scores = oa.scores || {};
                                                            const aiEvals = oa.aiEvaluations || {};
                                                            
                                                            let totalP = 0;
                                                            let totalM = 0;
                                                            
                                                            probs.forEach((p, idx) => {
                                                                const s = scores[idx] || { passed: 0, total: 10 };
                                                                const passed = s.passed || 0;
                                                                const total = s.total || 10;
                                                                const ai = aiEvals[idx];
                                                                
                                                                totalP += passed;
                                                                if (ai?.isValid) {
                                                                    totalP += Math.ceil((total - passed) / 2);
                                                                }
                                                                totalM += total;
                                                            });
                                                            
                                                            const perc = totalM > 0 ? Math.round((totalP / totalM) * 100) : 0;
                                                            return `Final Grade: ${perc}%`;
                                                        })()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div>
                                            {isLocked ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt3)', fontWeight: 600, background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '12px' }}>
                                                    <Lock size={18} /> Locked
                                                </div>
                                            ) : isCompleted ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.1)', fontWeight: 600, padding: '10px 16px', borderRadius: '12px', cursor: 'default' }}>
                                                        <CheckCircle size={18} /> Completed
                                                    </button>
                                                    {round.type === 'OA' && (
                                                        <>
                                                            <button 
                                                                onClick={() => navigate(`/interview-journey/${journeyId}/oa-results`)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', padding: '10px 16px', borderRadius: '12px', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}
                                                            >
                                                                View Results
                                                            </button>
                                                            <button
                                                                onClick={() => setShowRetakeModal(true)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', fontWeight: 600, padding: '10px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem' }}
                                                            >
                                                                <RotateCcw size={15} /> Retake OA
                                                            </button>
                                                        </>
                                                    )}
                                                    {round.type === 'HR' && (
                                                        <>
                                                            {journey?.hrDetails?.compositeScore !== undefined && (
                                                                <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)' }}>
                                                                    Score: <span style={{ color: journey.hrDetails.compositeScore >= 65 ? '#10b981' : '#f59e0b' }}>{Math.round(journey.hrDetails.compositeScore)}%</span>
                                                                </div>
                                                            )}
                                                            <button 
                                                                onClick={() => navigate(`/interview-journey/${journeyId}/hirevue-results`)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', padding: '10px 16px', borderRadius: '12px', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}
                                                            >
                                                                View Results
                                                            </button>
                                                            <button
                                                                onClick={() => setShowRetakeHRModal(true)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', fontWeight: 600, padding: '10px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem' }}
                                                            >
                                                                <RotateCcw size={15} /> Retake
                                                            </button>
                                                        </>
                                                    )}
                                                    {round.id === 'tech1' && (
                                                        <>
                                                            {journey?.tr1Details?.scoreReport?.overallScore !== undefined && (
                                                                <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)' }}>
                                                                    Score: <span style={{ color: journey.tr1Details.scoreReport.overallScore >= 65 ? '#10b981' : '#f59e0b' }}>{Math.round(journey.tr1Details.scoreReport.overallScore)}/100</span>
                                                                </div>
                                                            )}
                                                            <button 
                                                                onClick={() => navigate(`/interview-journey/${journeyId}/tc1-result`)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', padding: '10px 16px', borderRadius: '12px', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}
                                                            >
                                                                View Results
                                                            </button>
                                                            <button
                                                                onClick={handleRetakeTR1}
                                                                disabled={isRetaking}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', fontWeight: 600, padding: '10px 14px', borderRadius: '12px', cursor: isRetaking ? 'wait' : 'pointer', fontSize: '0.85rem' }}
                                                            >
                                                                <RotateCcw size={15} /> Retake
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                    {round.id === 'tech1' && journey?.tr1Details?.status === 'in-progress' && journey?.tr1Details?.expiresAt && tr1TimeLeft !== null && tr1TimeLeft > 0 && (
                                                        <div style={{ 
                                                            display: 'flex', alignItems: 'center', gap: '8px', 
                                                            padding: '10px 16px', borderRadius: '12px', 
                                                            background: tr1TimeLeft < 300 ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)', 
                                                            border: `1px solid ${tr1TimeLeft < 300 ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.4)'}`,
                                                            color: tr1TimeLeft < 300 ? '#ef4444' : '#3b82f6', 
                                                            fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem',
                                                            animation: tr1TimeLeft < 60 ? 'pulse 1s infinite' : 'none'
                                                        }}>
                                                            <Clock size={16} /> {formatCountdown(tr1TimeLeft)} remaining
                                                        </div>
                                                    )}
                                                    {round.id === 'tech1' && journey?.tr1Details?.status === 'expired' ? (
                                                        <>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontWeight: 600 }}>
                                                                <Clock size={16} /> Time Expired
                                                            </div>
                                                            <button
                                                                onClick={handleRetakeTR1}
                                                                disabled={isRetaking}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', fontWeight: 600, padding: '10px 14px', borderRadius: '12px', cursor: isRetaking ? 'wait' : 'pointer', fontSize: '0.85rem' }}
                                                            >
                                                                <RotateCcw size={15} /> Restart Round
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => handleRoundAction(index, round)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', background: '#3b82f6', border: 'none', fontWeight: 700, padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(59,130,246,0.4)' }} className="hover-btn primary">
                                                                {round.type === 'OA' && journey?.oaDetails?.problemDetails?.length > 0
                                                                    ? <><RotateCcw size={16} /> Resume OA</>
                                                                    : round.type === 'HR' && journey?.hrDetails?.questions?.length > 0
                                                                        ? <><RotateCcw size={16} /> Resume HireVue</>
                                                                        : round.id === 'tech1' && journey?.tr1Details?.status === 'in-progress' && tr1TimeLeft > 0
                                                                            ? <><RotateCcw size={16} /> Resume Technical</>
                                                                            : <>Enter Round <Play fill="currentColor" size={16} /></>}
                                                            </button>
                                                            {round.type === 'OA' && journey?.oaDetails?.problemDetails?.length > 0 && (
                                                                <button
                                                                    onClick={() => setShowRetakeModal(true)}
                                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', fontWeight: 600, padding: '10px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem' }}
                                                                >
                                                                    <RotateCcw size={15} /> Restart OA
                                                                </button>
                                                            )}
                                                            {round.type === 'HR' && journey?.hrDetails?.questions?.length > 0 && (
                                                                <button
                                                                    onClick={() => setShowRetakeHRModal(true)}
                                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', fontWeight: 600, padding: '10px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem' }}
                                                                >
                                                                    <RotateCcw size={15} /> Restart HireVue
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : <p style={{ color: '#ef4743' }}>Journey corrupted. Please create a new one.</p>}
                    </div>
                    
                    {isJourneyComplete && (
                        <div style={{ textAlign: 'center', marginTop: '4rem', padding: '3rem', background: 'rgba(16,185,129,0.05)', border: '1px dashed rgba(16,185,129,0.3)', borderRadius: '24px' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#10b981', margin: '0 auto 1.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(16,185,129,0.3)' }}>
                                <Trophy size={40} color="#fff" />
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Journey Concluded</h2>
                            <p style={{ color: 'var(--txt2)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>You have successfully navigated through all stages. The aggregated performance report is ready for your review.</p>
                            <button style={{ padding: '12px 32px', background: '#fff', color: '#000', fontWeight: 700, borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                                View Full Evaluation Report
                            </button>
                        </div>
                    )}
                </div>

                {/* Retake OA Confirmation Modal */}
                {showRetakeModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(8px)' }} onClick={() => !isRetaking && setShowRetakeModal(false)}>
                        <div style={{ maxWidth: '480px', width: '100%', background: '#111', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', padding: '2.5rem', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <AlertTriangle size={28} color="#ef4444" />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>Retake Online Assessment?</h3>
                            <p style={{ color: 'var(--txt2)', lineHeight: 1.6, marginBottom: '2rem', fontSize: '0.95rem' }}>
                                This will <strong style={{ color: '#ef4444' }}>permanently delete</strong> all OA data — your questions, saved code, scores, and AI evaluations. This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowRetakeModal(false)} disabled={isRetaking} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleRetakeOA} disabled={isRetaking} style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: isRetaking ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <RotateCcw size={16} />
                                    {isRetaking ? 'Clearing...' : 'Yes, Retake OA'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Retake HR Confirmation Modal */}
                {showRetakeHRModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(8px)' }} onClick={() => !isRetaking && setShowRetakeHRModal(false)}>
                        <div style={{ maxWidth: '480px', width: '100%', background: '#111', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', padding: '2.5rem', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <AlertTriangle size={28} color="#ef4444" />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>Retake HireVue Assessment?</h3>
                            <p style={{ color: 'var(--txt2)', lineHeight: 1.6, marginBottom: '2rem', fontSize: '0.95rem' }}>
                                This will <strong style={{ color: '#ef4444' }}>permanently delete</strong> all HireVue data — your behavioral questions, scores, and AI evaluations. This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowRetakeHRModal(false)} disabled={isRetaking} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleRetakeHR} disabled={isRetaking} style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: isRetaking ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <RotateCcw size={16} />
                                    {isRetaking ? 'Clearing...' : 'Yes, Retake'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resume Modal */}
                {showResumeModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(5px)' }} onClick={() => setShowResumeModal(false)}>
                        <div style={{ width: '100%', maxWidth: '800px', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
                            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText color="#3b82f6" /> {journey.resumeData.fileName}</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--txt3)' }}>Active Context Document</span>
                                </div>
                                <button onClick={() => setShowResumeModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, color: 'var(--txt2)', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }} className="custom-scrollbar">
                                {journey.resumeData.textContext || "No context data extracted."}
                            </div>
                            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                                <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--txt3)' }}>*This data is securely persisted and injected into upcoming interview stages.</p>
                                <button disabled style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', color: 'var(--txt3)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'not-allowed', width: '100%' }}>
                                    Replace Resume (Feature coming soon)
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin-animation { animation: spin 1s linear infinite; }
                
                @keyframes pulseBorder {
                    0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(59,130,246,0); }
                    100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
                }
                .pulse-border { animation: pulseBorder 2s infinite; }
                
                .hover-btn:hover { background: rgba(255,255,255,0.1) !important; transform: translateY(-2px); }
                .hover-btn.primary:hover { background: #2563eb !important; }
                
                @media (max-width: 768px) {
                    .path-line-desktop { left: 40px !important; }
                    .round-card { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
                    .round-card > div:last-child { width: 100%; display: flex; }
                    .round-card button { width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    );
}
