import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import {
    Trophy, CheckCircle2, AlertCircle, Bot, Loader2, ChevronRight,
    BrainCircuit, RotateCcw, Lock, Unlock, ArrowLeft, MessageSquare,
    Code2, AlertTriangle, User, Clock, TrendingUp, Lightbulb, Star
} from 'lucide-react';
import Editor from '@monaco-editor/react';

export default function TR1Results() {
    const { journeyId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [journey, setJourney] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRetaking, setIsRetaking] = useState(false);
    const [transcriptOpen, setTranscriptOpen] = useState(false);

    useEffect(() => {
        if (!currentUser || !journeyId) return;
        const fetchJourney = async () => {
            try {
                const jDoc = await getDoc(doc(db, 'interviewJourneys', journeyId));
                if (jDoc.exists()) {
                    setJourney({ id: jDoc.id, ...jDoc.data() });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchJourney();
    }, [currentUser, journeyId]);

    // ── Complete wipe on reattempt: deletes every tr1Details field ──────────
    const handleReattempt = async () => {
        setIsRetaking(true);
        try {
            const jSnap = await getDoc(doc(db, 'interviewJourneys', journeyId));
            const data = jSnap.data();
            const updatedRounds = Array.isArray(data.rounds)
                ? data.rounds.map(r => {
                    if (r.id === 'tech1') return { ...r, status: 'pending', locked: false };
                    if (r.id === 'tech2') return { ...r, locked: true, status: 'pending' };
                    return r;
                })
                : data.rounds;

            // deleteField() removes the entire tr1Details map from Firestore completely
            await updateDoc(doc(db, 'interviewJourneys', journeyId), {
                tr1Details: deleteField(),
                rounds: updatedRounds
            });

            navigate(`/interview-journey/${journeyId}/tr1-setup`, { replace: true });
        } catch (err) {
            console.error(err);
            alert('Failed to reset. Please try again.');
        } finally {
            setIsRetaking(false);
        }
    };

    if (loading) {
        return (
            <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                <Loader2 style={{ animation: 'spin 1s linear infinite' }} color="#a855f7" size={32} />
            </div>
        );
    }

    if (!journey) {
        return (
            <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                Journey not found.
            </div>
        );
    }

    // ── Safely extract all nested fields ──────────────────────────────────────
    const tr1 = journey.tr1Details || {};
    const report = tr1.scoreReport || null;
    const PASS_THRESHOLD = 65;
    const score = report?.overallScore ?? null;
    const isPassed = score !== null && score >= PASS_THRESHOLD;

    const transcript = Array.isArray(tr1.transcript) ? tr1.transcript : [];
    const savedCode = tr1.savedCode || '';
    const violations = Array.isArray(tr1.violations) ? tr1.violations : [];
    const autoSubmitted = tr1.autoSubmitted || false;
    const language = journey.language || 'python';

    // Duration: read stored field or compute from timestamps
    const durationMinutes = tr1.durationMinutes || tr1.duration || tr1.timeTaken
        || (tr1.completedAt && tr1.startedAt ? Math.round((tr1.completedAt - tr1.startedAt) / 60000) : 0);

    // Actual field paths from Firestore scoreReport:
    // report.summary        → overall feedback text
    // report.codeAnalysis   → code quality commentary
    // report.hire           → verdict label
    // report.strengths      → array of strength strings
    // report.improvements   → array of improvement strings (NOT weaknesses)
    // report.skills.{key}.score → nested skill scores
    // report.redFlags       → array of flags

    const feedbackText   = report?.summary || report?.feedback || '';
    const codeAnalysis   = report?.codeAnalysis || '';
    const strengths      = Array.isArray(report?.strengths) ? report.strengths : [];
    const weaknesses     = Array.isArray(report?.improvements) ? report.improvements
                         : Array.isArray(report?.weaknesses) ? report.weaknesses : [];
    const recommendations = Array.isArray(report?.recommendations) ? report.recommendations : [];
    const redFlags       = Array.isArray(report?.redFlags) ? report.redFlags : [];
    const hireLabel      = report?.hire || report?.verdict || '';

    // Skills are nested: report.skills.algorithmicThinking.score (out of 5)
    const skills = report?.skills || {};
    const SKILL_MAX = 5; // AI returns scores out of 5
    const subScores = [
        { label: 'Communication & Clarification', key: 'communication',       icon: '💬' },
        { label: 'Problem Decomposition',         key: 'problemDecomposition', icon: '🧩' },
        { label: 'Algorithmic Thinking',          key: 'algorithmicThinking',  icon: '🧠' },
        { label: 'Code Quality',                  key: 'codeQuality',          icon: '💻' },
        { label: 'Edge Cases Handled',            key: 'edgeCases',            icon: '🔍' },
        { label: 'Optimization',                  key: 'optimization',         icon: '⚡' },
    ].map(s => {
        const skillObj = skills[s.key];
        const val = skillObj?.score ?? skillObj ?? report?.[s.key]?.score ?? report?.[s.key] ?? null;
        return { ...s, val: typeof val === 'number' ? val : null };
    }).filter(s => s.val !== null);

    // Determine if scores are /5 or /100 by checking the range of values
    // If ANY score is > 10, then we assume they are out of 100.
    const scoreMax = subScores.some(s => s.val > 10) ? 100 : 5;

    const formatTs = (ts) => {
        if (!ts) return '';
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const violationLabel = (type) => {
        const map = {
            tab_switch: 'Switched tabs / unfocused window',
            screenshot: 'Attempted screenshot',
            fullscreen_exit: 'Exited fullscreen mode',
            mouse_leave: 'Mouse left browser window',
        };
        return map[type] || type;
    };

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .fade-up { animation: fadeUp 0.5s ease-out both; }
                .score-bar-fill { transition: width 1s ease-out; }
            `}</style>

            {/* Nav */}
            <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={() => navigate(`/interview-journey/${journeyId}`)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                    <ArrowLeft size={18} /> Back to Pipeline
                </button>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Technical Round 1 — Report Card</span>
                <div style={{ width: '140px' }} />
            </nav>

            <div style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* ── Hero Score ── */}
                <div className="fade-up" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', padding: '24px', borderRadius: '50%', background: report ? (isPassed ? 'rgba(16,185,129,0.12)' : 'rgba(239,71,67,0.12)') : 'rgba(168,85,247,0.12)', border: `2px solid ${report ? (isPassed ? 'rgba(16,185,129,0.4)' : 'rgba(239,71,67,0.4)') : 'rgba(168,85,247,0.4)'}`, marginBottom: '1.5rem', boxShadow: report ? (isPassed ? '0 0 40px rgba(16,185,129,0.2)' : '0 0 40px rgba(239,71,67,0.15)') : '0 0 40px rgba(168,85,247,0.15)' }}>
                        <Trophy size={52} color={report ? (isPassed ? '#10b981' : '#ef4743') : '#a855f7'} />
                    </div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 0.4rem 0', letterSpacing: '-0.03em' }}>Technical Round 1</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', margin: '0 0 1.5rem 0' }}>
                        {journey.company} · {journey.role}
                    </p>

                    {report ? (
                        <>
                            <div style={{ fontSize: '4.5rem', fontWeight: 900, color: isPassed ? '#10b981' : '#ef4743', lineHeight: 1, marginBottom: '0.5rem' }}>
                                {score}<span style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>/100</span>
                            </div>
                            {hireLabel && (
                                <div style={{ display: 'inline-block', background: isPassed ? 'rgba(16,185,129,0.1)' : 'rgba(239,71,67,0.1)', border: `1px solid ${isPassed ? 'rgba(16,185,129,0.35)' : 'rgba(239,71,67,0.35)'}`, padding: '6px 20px', borderRadius: '99px', fontSize: '0.9rem', fontWeight: 700, color: isPassed ? '#10b981' : '#ef4743', marginBottom: '1.5rem' }}>
                                    {hireLabel}
                                </div>
                            )}
                            {autoSubmitted && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ef4444', marginBottom: '1rem', fontSize: '0.88rem', fontWeight: 600 }}>
                                    <AlertTriangle size={15} /> Auto-submitted — time expired
                                </div>
                            )}
                            <div style={{ margin: '0 auto', maxWidth: '480px' }}>
                                {isPassed ? (
                                    <div style={{ background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '14px 24px', borderRadius: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Unlock size={18} /> Passed — Technical Round 2 is now unlocked!
                                    </div>
                                ) : (
                                    <div style={{ background: 'rgba(239,71,67,0.09)', border: '1px solid rgba(239,71,67,0.3)', color: '#ef4743', padding: '14px 24px', borderRadius: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Lock size={18} /> Score below 65 — Reattempt to unlock Round 2
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <p style={{ color: 'rgba(255,255,255,0.4)' }}>No evaluation data available.</p>
                    )}
                </div>

                {/* ── Interview Stats Row ── */}
                <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', animationDelay: '0.05s' }}>
                    {[
                        { label: 'Duration', value: durationMinutes > 0 ? `${durationMinutes} min` : '—', icon: <Clock size={18} />, color: durationMinutes >= 30 ? '#10b981' : '#f59e0b', note: durationMinutes >= 30 ? 'Strong effort' : durationMinutes > 0 ? '< 30 min' : '' },
                        { label: 'Messages', value: transcript.length > 0 ? transcript.length : '—', icon: <MessageSquare size={18} />, color: '#a855f7' },
                        { label: 'Violations', value: violations.length, icon: <AlertTriangle size={18} />, color: violations.length > 5 ? '#ef4444' : violations.length > 0 ? '#f59e0b' : '#10b981' },
                        { label: 'Code Saved', value: savedCode ? 'Yes' : 'No', icon: <Code2 size={18} />, color: savedCode ? '#3b82f6' : '#6b7280' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.2rem', textAlign: 'center' }}>
                            <div style={{ color: s.color, marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{s.label}</div>
                            {s.note && <div style={{ fontSize: '0.72rem', color: s.color, marginTop: '4px', fontWeight: 600 }}>{s.note}</div>}
                        </div>
                    ))}
                </div>

                {/* ── Sub-scores Breakdown ── */}
                {subScores.length > 0 && (
                    <div className="fade-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.75rem', animationDelay: '0.1s' }}>
                        <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={18} color="#a855f7" /> Score Breakdown
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {subScores.map(s => (
                                <div key={s.key}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.86rem', color: 'rgba(255,255,255,0.7)', alignItems: 'center' }}>
                                        <span>{s.icon} {s.label}</span>
                                        <span style={{ fontWeight: 800, color: (s.val / scoreMax) >= 0.65 ? '#10b981' : (s.val / scoreMax) >= 0.45 ? '#f59e0b' : '#ef4444', fontSize: '0.92rem' }}>
                                            {s.val}<span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/{scoreMax}</span>
                                        </span>
                                    </div>
                                    <div style={{ height: '7px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${Math.min(100, (s.val / scoreMax) * 100)}%`, background: (s.val / scoreMax) >= 0.65 ? 'linear-gradient(90deg,#10b981,#34d399)' : (s.val / scoreMax) >= 0.45 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#ef4444,#f87171)', borderRadius: '4px', transition: 'width 1s ease-out' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Detailed Feedback from AI ── */}
                {feedbackText && (
                    <div className="fade-up" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '20px', padding: '2rem', animationDelay: '0.12s' }}>
                        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 700 }}>
                            <Bot color="#a855f7" size={20} /> Interviewer Feedback
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, margin: 0, fontSize: '0.97rem', whiteSpace: 'pre-wrap' }}>
                            {feedbackText}
                        </p>
                    </div>
                )}

                {/* ── Code Analysis ── */}
                {codeAnalysis && (
                    <div className="fade-up" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '20px', padding: '2rem', animationDelay: '0.13s' }}>
                        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 700 }}>
                            <Code2 color="#3b82f6" size={20} /> Code Analysis
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, margin: 0, fontSize: '0.97rem', whiteSpace: 'pre-wrap' }}>
                            {codeAnalysis}
                        </p>
                    </div>
                )}

                {/* ── Strengths & Weaknesses ── */}
                {(strengths.length > 0 || weaknesses.length > 0) && (
                    <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', animationDelay: '0.14s' }}>
                        {strengths.length > 0 && (
                            <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                                    <Star size={17} /> Strengths
                                </h4>
                                <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, fontSize: '0.92rem' }}>
                                    {strengths.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                        )}
                        {weaknesses.length > 0 && (
                            <div style={{ background: 'rgba(239,71,67,0.05)', border: '1px solid rgba(239,71,67,0.2)', borderRadius: '16px', padding: '1.5rem' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: '#ef4743', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                                    <AlertCircle size={17} /> Areas to Improve
                                </h4>
                                <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, fontSize: '0.92rem' }}>
                                    {weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Recommendations ── */}
                {recommendations.length > 0 && (
                    <div className="fade-up" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '16px', padding: '1.75rem', animationDelay: '0.16s' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                            <Lightbulb size={17} /> Recommendations
                        </h4>
                        <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, fontSize: '0.92rem' }}>
                            {recommendations.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                    </div>
                )}

                {/* ── Red Flags ── */}
                {redFlags.length > 0 && (
                    <div className="fade-up" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '16px', padding: '1.75rem', animationDelay: '0.17s' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                            <AlertTriangle size={17} /> Red Flags
                        </h4>
                        <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, fontSize: '0.92rem' }}>
                            {redFlags.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                    </div>
                )}

                {/* ── Final Submitted Code ── */}
                {savedCode && (
                    <div className="fade-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', animationDelay: '0.18s' }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Code2 size={18} color="#3b82f6" />
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Final Submitted Code</h4>
                            <span style={{ marginLeft: 'auto', fontSize: '0.78rem', background: 'rgba(59,130,246,0.1)', padding: '3px 10px', borderRadius: '6px', color: '#3b82f6', fontWeight: 600 }}>{language}</span>
                        </div>
                        <div style={{ height: '340px' }}>
                            <Editor
                                height="100%"
                                language={language}
                                theme="vs-dark"
                                value={savedCode}
                                options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 13 }}
                            />
                        </div>
                    </div>
                )}

                {/* ── Interview Transcript ── */}
                {transcript.length > 0 && (
                    <div className="fade-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', animationDelay: '0.2s' }}>
                        <button
                            onClick={() => setTranscriptOpen(o => !o)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', border: 'none', color: '#fff', cursor: 'pointer', borderBottom: transcriptOpen ? '1px solid rgba(255,255,255,0.08)' : 'none' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MessageSquare size={18} color="#a855f7" />
                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Interview Transcript</h4>
                                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.07)', padding: '3px 10px', borderRadius: '6px' }}>{transcript.length} messages</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{transcriptOpen ? '▲ Collapse' : '▼ Expand'}</span>
                        </button>
                        {transcriptOpen && (
                            <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {transcript.map((msg, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: msg.role === 'ai' ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.06)', color: msg.role === 'ai' ? '#a855f7' : '#aaa' }}>
                                            {msg.role === 'ai' ? <Bot size={17} /> : <User size={17} />}
                                        </div>
                                        <div style={{ flex: 1, background: msg.role === 'ai' ? 'rgba(168,85,247,0.06)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.85rem 1.1rem' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '4px', fontWeight: 600 }}>
                                                {msg.role === 'ai' ? 'AI Interviewer' : 'You'}{msg.timestamp ? ` · ${formatTs(msg.timestamp)}` : ''}
                                            </div>
                                            <div style={{ fontSize: '0.93rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                                                {msg.text || msg.content || ''}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Violations Timeline ── */}
                {violations.length > 0 && (
                    <div className="fade-up" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', overflow: 'hidden', animationDelay: '0.22s' }}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <AlertTriangle size={18} color="#ef4444" />
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#ef4444' }}>Proctoring Violations ({violations.length})</h4>
                        </div>
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {violations.map((v, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.07)', borderRadius: '8px' }}>
                                    <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'monospace', flexShrink: 0 }}>
                                        {formatTs(v.timestamp)}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>
                                        {violationLabel(v.type)}
                                    </div>
                                </div>
                            ))}
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.78rem', color: 'rgba(239,68,68,0.6)' }}>
                                Violations carry reduced weight in scoring. Only severe or repeat patterns impact your final result.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Action Buttons ── */}
                <div className="fade-up" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', paddingBottom: '2rem', animationDelay: '0.25s' }}>
                    <button
                        onClick={handleReattempt}
                        disabled={isRetaking}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: '14px', color: '#f59e0b', fontWeight: 700, fontSize: '1rem', cursor: isRetaking ? 'wait' : 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.18)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}
                    >
                        {isRetaking ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <RotateCcw size={18} />}
                        {isRetaking ? 'Resetting...' : 'Reattempt Round'}
                    </button>

                    <button
                        onClick={() => navigate(`/interview-journey/${journeyId}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: '#fff', border: 'none', borderRadius: '14px', color: '#000', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none'; }}
                    >
                        Back to Pipeline <ChevronRight size={18} />
                    </button>

                    {isPassed && (
                        <button
                            onClick={() => navigate(`/interview-journey/${journeyId}`)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '14px', color: '#10b981', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.12)'}
                        >
                            <CheckCircle2 size={18} /> Enter Technical Round 2
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
