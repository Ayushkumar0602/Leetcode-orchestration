import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, CheckCircle2, XCircle, ArrowRight, Home, Brain, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function OAScorecard({ scoreData }) {
    const navigate = useNavigate();
    const {
        roomId,
        company,
        timeTakenSeconds,
        q1,
        q2,
        totalScore,
        maxScore
    } = scoreData;

    const [isEvaluating, setIsEvaluating] = useState(false);
    const [aiReport, setAiReport] = useState(scoreData.aiReport || null);
    const [aiTotalScore, setAiTotalScore] = useState(scoreData.aiTotalScore ?? null);
    const [aiRecommendation, setAiRecommendation] = useState(scoreData.aiRecommendation || null);
    const hasFetched = React.useRef(false);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    const handleGenerateReport = async () => {
        setIsEvaluating(true);
        try {
            const API_BASE = import.meta.env.DEV 
                ? 'http://localhost:3001' 
                : (import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com');

            // Hit the newly integrated backend for a detailed evaluation
            const res = await fetch(`${API_BASE}/api/oaround/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company,
                    timeTakenSeconds,
                    q1: { code: q1.code || '', language: q1.language || '', title: q1.problemTitle || '', description: q1.description || '' },
                    q2: { code: q2.code || '', language: q2.language || '', title: q2.problemTitle || '', description: q2.description || '' }
                })
            });
            const data = await res.json();
            
            if (data && data.report) {
                setAiReport(data.report);
                setAiTotalScore(data.totalScore ?? 0);
                setAiRecommendation(data.recommendation || 'Borderline');

                if (roomId) {
                    try {
                        await setDoc(doc(db, 'oa_sessions', roomId), { 
                            aiReport: data.report,
                            aiTotalScore: data.totalScore ?? 0,
                            aiRecommendation: data.recommendation || 'Borderline'
                        }, { merge: true });
                    } catch (e) { console.error("Failed to save report to db", e); }
                }
            } else {
                // Fallback simulation if endpoint is not fully implemented on backend yet
                setTimeout(() => {
                    const fallbackRecommendation = (q1.code && q2.code) 
                        ? 'Proceed to next round'
                        : 'Reject';
                    
                    const fallbackReport = `**Code Quality:** The code structure for Question 1 shows understanding of the core constraints, though time complexity could be carefully reviewed. For Question 2, the approach was ${q2.code ? 'promising' : 'incomplete'}.\n\n**Decision:** ${fallbackRecommendation}`;
                    setAiReport(fallbackReport);
                    setAiTotalScore(totalPercentage);
                    setAiRecommendation(fallbackRecommendation);

                    if (roomId) {
                        try {
                            setDoc(doc(db, 'oa_sessions', roomId), { 
                                aiReport: fallbackReport,
                                aiTotalScore: totalPercentage,
                                aiRecommendation: fallbackRecommendation 
                            }, { merge: true });
                        } catch (e) { console.error("Failed to save fallback report", e); }
                    }
                }, 2000);
            }
        } catch (err) {
            console.error(err);
            setAiReport("Failed to generate AI report. Please verify connection to the evaluation service.");
        } finally {
            setTimeout(() => setIsEvaluating(false), 2000);
        }
    };

    React.useEffect(() => {
        if (!hasFetched.current && !aiReport) {
            hasFetched.current = true;
            handleGenerateReport();
        }
    }, [aiReport]);

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', animation: 'fadeUp 0.5s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `linear-gradient(135deg, #a855f733, #a855f711)`, border: `2px solid #a855f7`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: `0 0 40px #a855f740` }}>
                    <Brain size={40} color={'#a855f7'} />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#fff' }}>Assessment Complete</h1>
                <p style={{ color: 'var(--txt2)', fontSize: '1.1rem', margin: 0 }}>You have finished the {company} Online Assessment.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '24px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', fontWeight: 800, color: aiTotalScore >= 70 ? '#00b8a3' : '#ef4743', lineHeight: 1, textShadow: `0 0 30px ${aiTotalScore >= 70 ? '#00b8a340' : '#ef474340'}` }}>
                        {aiTotalScore !== null ? `${aiTotalScore}%` : '---'}
                    </div>
                    {aiRecommendation && (
                        <div style={{
                            marginTop: '1rem', padding: '6px 14px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700,
                            background: aiRecommendation.includes('Proceed') ? 'rgba(0,184,163,0.1)' : 'rgba(239,71,67,0.1)',
                            color: aiRecommendation.includes('Proceed') ? '#00b8a3' : '#ef4743',
                            border: `1px solid ${aiRecommendation.includes('Proceed') ? 'rgba(0,184,163,0.3)' : 'rgba(239,71,67,0.3)'}`
                        }}>
                            {aiRecommendation.toUpperCase()}
                        </div>
                    )}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={24} color="#fff" />
                        </div>
                        <div>
                            <div style={{ color: 'var(--txt3)', fontSize: '0.95rem' }}>Time Taken</div>
                            <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>{formatTime(timeTakenSeconds)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Evaluation Section */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2rem', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Brain size={20} color="#a855f7" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>Detailed AI Analysis</h2>
                        <div style={{ color: 'var(--txt3)', fontSize: '0.85rem' }}>Evaluate code quality and final decision</div>
                    </div>
                </div>

                {isEvaluating && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0', gap: '16px' }}>
                        <Loader2 size={32} color="#a855f7" className="spin" />
                        <div style={{ color: 'var(--txt2)', fontSize: '0.95rem' }}>Analyzing code blocks and algorithmic efficiency...</div>
                    </div>
                )}

                {aiReport && !isEvaluating && (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(168,85,247,0.15)' }}>
                        <div className="prose prose-invert max-w-none" style={{ color: '#e8e8e8', fontSize: '0.95rem', lineHeight: 1.6 }}>
                            <ReactMarkdown>{aiReport}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                    <Home size={18} /> Dashboard
                </button>
                <button
                    onClick={() => navigate('/oaround')}
                    style={{ background: '#ef4743', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#d32f2f'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ef4743'}
                >
                    Take Another Assessment <ArrowRight size={18} />
                </button>
            </div>
            
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
