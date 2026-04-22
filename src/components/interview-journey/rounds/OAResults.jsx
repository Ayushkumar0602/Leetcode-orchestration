import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Trophy, CheckCircle2, XCircle, AlertCircle, Bot, Loader2, FileCode2, ChevronRight, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export default function OAResults() {
    const { journeyId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [journey, setJourney] = useState(null);
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState([]);
    
    // AI Appeal
    const [isAppealing, setIsAppealing] = useState(false);
    const [appealedIndexes, setAppealedIndexes] = useState({});

    useEffect(() => {
        if (!currentUser || !journeyId) return;
        const fetchJourney = async () => {
            const jDoc = await getDoc(doc(db, 'interviewJourneys', journeyId));
            if (jDoc.exists()) {
                const data = jDoc.data();
                setJourney(data);
                
                const oa = data.oaDetails || {};
                const problems = oa.problemDetails || [];
                const scores = oa.scores || {};
                const codes = oa.savedCodes || {};
                const aiEvals = oa.aiEvaluations || {};
                
                const formattedResults = problems.map((prob, idx) => {
                    const score = scores[idx] || { passed: 0, total: 10 }; // Provide fallback
                    const passed = score.passed || 0;
                    const total = score.total || 10;
                    const rawCode = codes[idx] || '';
                    const aiEval = aiEvals[idx] || null;
                    
                    return {
                        id: prob.id,
                        title: prob.title,
                        description: prob.description,
                        passed,
                        total,
                        rawCode,
                        aiEval
                    };
                });
                
                setResults(formattedResults);
            }
            setLoading(false);
        };
        fetchJourney();
    }, [currentUser, journeyId]);

    const handleAppeal = async (idx) => {
        setIsAppealing(true);
        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
            const res = await fetch(`${API_BASE}/api/oa-appeal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: results[idx].rawCode,
                    problem: results[idx].description,
                    language: 'python'
                })
            });
            const evalData = await res.json();
            
            // Save to FB
            const jDoc = await getDoc(doc(db, 'interviewJourneys', journeyId));
            const data = jDoc.data();
            const oa = data.oaDetails || {};
            const aiEvals = oa.aiEvaluations || {};
            aiEvals[idx] = evalData;
            
            await updateDoc(doc(db, 'interviewJourneys', journeyId), {
                'oaDetails.aiEvaluations': aiEvals
            });
            
            // Update UI
            const updated = [...results];
            updated[idx].aiEval = evalData;
            setResults(updated);
            setAppealedIndexes(prev => ({ ...prev, [idx]: true }));
            
        } catch (err) {
            console.error(err);
            alert("Failed to reach AI evaluator.");
        } finally {
            setIsAppealing(false);
        }
    };

    if (loading) return <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="spin-animation" color="#3b82f6" size={32} /></div>;
    
    // Calculate final metrics
    const totalPassed = results.reduce((acc, curr) => acc + curr.passed + (curr.aiEval?.isValid ? Math.ceil((curr.total - curr.passed) / 2) : 0), 0);
    const totalMax = results.reduce((acc, curr) => acc + curr.total, 0);
    const finalScorePerc = totalMax > 0 ? Math.round((totalPassed / totalMax) * 100) : 0;
    
    // Auto advance if passed threshold
    const passThreshold = 60; // 60% requirement 
    const isPassed = finalScorePerc >= passThreshold;

    const proceedToNextRound = () => {
        // Here we could unlock the next round natively
        navigate(`/dashboard`);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', padding: '4rem 2rem', fontFamily: "'Inter', sans-serif" }}>
            <style>{`.spin-animation { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div style={{ padding: '20px', borderRadius: '50%', background: isPassed ? 'rgba(16,185,129,0.1)' : 'rgba(239,71,67,0.1)', border: `2px solid ${isPassed ? 'rgba(16,185,129,0.3)' : 'rgba(239,71,67,0.3)'}` }}>
                        <Trophy size={48} color={isPassed ? "#10b981" : "#ef4743"} />
                    </div>
                </div>
                
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem 0' }}>Online Assessment Completed</h1>
                    <p style={{ color: 'var(--txt2)', fontSize: '1.1rem' }}>Overall Score: <span style={{ color: isPassed ? '#10b981' : '#ef4743', fontWeight: 800, fontSize: '1.2rem' }}>{finalScorePerc}%</span></p>
                    {isPassed ? (
                        <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '12px 24px', borderRadius: '12px', display: 'inline-block', marginTop: '1rem', fontWeight: 600 }}>
                            <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Congratulations! You have met the requirements for the next round.
                        </div>
                    ) : (
                        <div style={{ background: 'rgba(239,71,67,0.1)', color: '#ef4743', padding: '12px 24px', borderRadius: '12px', display: 'inline-block', marginTop: '1rem', fontWeight: 600 }}>
                            <AlertCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> You did not meet the minimum score threshold. Try appealing below if you believe your logic was correct.
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                    {results.map((res, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileCode2 size={20} color="#3b82f6" /> {res.title}
                                </h3>
                                <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                                    Test Cases: <span style={{ color: res.passed === res.total ? '#10b981' : '#ffa116' }}>{res.passed} / {res.total}</span>
                                </div>
                            </div>
                            
                            <div style={{ padding: '1.5rem' }}>
                                {res.aiEval ? (
                                    <div style={{ background: res.aiEval.isValid ? 'rgba(16,185,129,0.1)' : 'rgba(239,71,67,0.1)', borderRadius: '12px', border: `1px solid ${res.aiEval.isValid ? 'rgba(16,185,129,0.3)' : 'rgba(239,71,67,0.3)'}`, padding: '1.5rem', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: -12, left: 24, background: res.aiEval.isValid ? '#10b981' : '#ef4743', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            AI Verdict: {res.aiEval.isValid ? 'Logic Approved Bypass' : 'Logic Flawed'}
                                        </div>
                                        <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                                            <Bot size={18} /> Evaluator Reasoning
                                        </h4>
                                        <p style={{ color: 'var(--txt2)', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                                            {res.aiEval.reasoning}
                                        </p>
                                        
                                        {res.aiEval.missedEdgeCases?.length > 0 && (
                                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffa116', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={14} /> Missed Edge Cases:</div>
                                                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--txt2)', fontSize: '0.85rem' }}>
                                                    {res.aiEval.missedEdgeCases.map((edge, i) => <li key={i}>{edge}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        {res.aiEval.isValid && (
                                            <div style={{ marginTop: '1rem', color: '#10b981', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <TrendingUp size={16} /> Partial credits awarded (+{res.aiEval.scoreAdjustment || 0} pts) to final grade.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {res.passed < res.total ? (
                                            <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7' }}>
                                                        <Bot size={18} /> Flash AI Appeal System
                                                    </h4>
                                                    <p style={{ margin: 0, color: 'var(--txt2)', fontSize: '0.9rem', maxWidth: '400px', lineHeight: 1.5 }}>
                                                        If your solution failed due to minute formatting or invisible trailing spaces, our AI can manually grade your abstract logic.
                                                    </p>
                                                </div>
                                                <button 
                                                    disabled={isAppealing} 
                                                    onClick={() => handleAppeal(idx)}
                                                    style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: isAppealing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: isAppealing ? 0.7 : 1 }}
                                                >
                                                    {isAppealing && appealedIndexes[idx] ? <Loader2 size={16} className="spin-animation" /> : <BarChart3 size={16} />}
                                                    Submit for Review
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ background: 'rgba(16,185,129,0.05)', padding: '1.5rem', borderRadius: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                                                <CheckCircle2 size={24} /> Flawless Execution. Full Points Awarded.
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center' }}>
                    <button onClick={proceedToNextRound} style={{ padding: '14px 40px', background: '#fff', color: '#000', border: 'none', borderRadius: '99px', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Return to Dashboard <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
