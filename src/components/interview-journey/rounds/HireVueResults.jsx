import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, ArrowRight, Target, Video, Star, EyeOff } from 'lucide-react';
import NavProfile from '../../../NavProfile';

export default function HireVueResults() {
    const { journeyId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [journey, setJourney] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser || !journeyId) return;
        const fetchData = async () => {
            try {
                const jDoc = await getDoc(doc(db, 'interviewJourneys', journeyId));
                if (jDoc.exists()) {
                    setJourney(jDoc.data());
                } else {
                    setError("Journey not found.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser, journeyId]);

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={32} className="spin-animation" />
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin-animation { animation: spin 1s linear infinite; }`}</style>
        </div>
    );
    if (error || !journey) return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Error: {error}
        </div>
    );

    const hr = journey.hrDetails || {};
    const questions = hr.questions || [];
    const evals = hr.evaluations || {};
    const score = hr.compositeScore || 0;
    const isPassed = score >= 65;

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
            <style>{`.glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; }`}</style>
            
            <nav style={{ height: '70px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.3px' }}>HireVue Results</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--txt2)', fontWeight: 600 }}>{journey.company} • {journey.role}</span>
                    <NavProfile />
                </div>
            </nav>

            <div style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Header Section */}
                <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isPassed ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,0,0,0.5))' : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(0,0,0,0.5))', border: `1px solid ${isPassed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                    <div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
                            Behavioral Assessment Review
                        </h1>
                        <p style={{ color: 'var(--txt2)', margin: 0, fontSize: '1.1rem' }}>
                            {isPassed ? "You met the behavioral benchmarks for this pipeline." : "Unfortunately, your score was below the required threshold."}
                        </p>
                        
                        <div style={{ marginTop: '2rem' }}>
                            <button onClick={() => navigate(`/interview-journey/${journeyId}`)} style={{ padding: '12px 24px', background: '#fff', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                Back to Pipeline <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                    
                    <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `8px solid ${isPassed ? '#10b981' : '#ef4444'}`, boxShadow: `0 0 30px ${isPassed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                        <span style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{Math.round(score)}<span style={{ fontSize: '1.5rem' }}>%</span></span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--txt2)', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Score</span>
                    </div>
                </div>

                {/* Question Breakdown */}
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '1rem 0 0 0' }}>Detailed Evaluation</h3>
                
                {questions.map((q, idx) => {
                    const ans = evals[idx];
                    if (!ans) return null;
                    
                    const scoreTotal = ((ans.clarity + ans.relevance + ans.structure + ans.confidence) / 4) * 10;
                    
                    return (
                        <div key={idx} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <div style={{ padding: '4px 8px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>Question {idx + 1}</div>
                                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{q.title}</h2>
                                    </div>
                                    <p style={{ color: 'var(--txt2)', margin: 0, lineHeight: 1.5 }}>"{q.description}"</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: scoreTotal >= 65 ? '#10b981' : '#f59e0b' }}>{Math.round(scoreTotal)}/100</span>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    <Video size={16} color="#3b82f6" />
                                    <h4 style={{ margin: 0, color: '#3b82f6', fontSize: '0.95rem' }}>Transcript Capture</h4>
                                </div>
                                <p style={{ fontSize: '0.95rem', color: '#e5e7eb', lineHeight: 1.6, margin: 0 }}>"{ans.transcript}"</p>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px' }}>
                                    <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}><Star size={16} /> Strengths</h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--txt2)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {ans.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px' }}>
                                    <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}><Target size={16} /> Areas to Improve</h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--txt2)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {ans.improvements?.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            </div>
                            
                            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 200px', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--txt2)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Clarity</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{ans.clarity}/10</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--txt2)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Structure</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{ans.structure}/10</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--txt2)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Relevance</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{ans.relevance}/10</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--txt2)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Confidence</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{ans.confidence}/10</div>
                                </div>
                                {ans.proctorViolations > 0 && (
                                    <div style={{ background: 'rgba(239,68,68,0.1)', padding: '8px 12px', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                                        <EyeOff size={16} />
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{ans.proctorViolations} Lookaways</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}
