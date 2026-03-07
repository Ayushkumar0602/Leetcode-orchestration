import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
    ArrowLeft, Loader2, CheckCircle2, XCircle, Star, TrendingUp, MessageSquare,
    Code2, Shield, Lightbulb, Brain, ChevronDown, ChevronUp, Clock, Terminal,
    Sparkles, User, Building, BarChart3
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

const SKILL_ICONS = {
    problemDecomposition: Brain,
    communication: MessageSquare,
    codeQuality: Code2,
    edgeCases: Shield,
    optimization: TrendingUp,
    algorithmicThinking: Sparkles
};
const SKILL_LABELS = {
    problemDecomposition: 'Problem Decomposition',
    communication: 'Communication',
    codeQuality: 'Code Quality',
    edgeCases: 'Edge Cases',
    optimization: 'Optimization',
    algorithmicThinking: 'Algorithmic Thinking'
};
const LANG_OPTIONS = { python: 'Python 3', javascript: 'JavaScript', cpp: 'C++', c: 'C', java: 'Java', go: 'Go', rust: 'Rust' };
const DIFF_COLOR = { Easy: '#00b8a3', Medium: '#ffa116', Hard: '#ef4743' };

function ScoreRing({ score }) {
    const color = score >= 75 ? '#00b8a3' : score >= 50 ? '#ffa116' : '#ef4743';
    const r = 52;
    const circ = 2 * Math.PI * r;
    const dash = Math.max(0, Math.min(1, score / 100)) * circ;
    return (
        <div style={{ position: 'relative', width: 132, height: 132 }}>
            <svg width="132" height="132" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="66" cy="66" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
                <circle cx="66" cy="66" r={r} fill="none" stroke={color} strokeWidth="9"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{score ?? '—'}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--txt3)', marginTop: '2px' }}>/ 100</span>
            </div>
        </div>
    );
}

export default function InterviewEvaluation() {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [transcriptOpen, setTranscriptOpen] = useState(false);

    useEffect(() => {
        if (!interviewId) return;
        setLoading(true);
        fetch(`https://leetcode-orchestration-api.onrender.com/api/interviews/detail/${interviewId}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) setError(data.error);
                else setInterview(data);
            })
            .catch(() => setError('Failed to load interview'))
            .finally(() => setLoading(false));
    }, [interviewId]);

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#080b14', gap: '16px' }}>
            <Loader2 size={36} color="var(--ai, #a855f7)" className="spin" />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Loading evaluation…</p>
        </div>
    );

    if (error || !interview) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#080b14', gap: '12px' }}>
            <XCircle size={40} color="#ef4743" />
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>{error || 'Interview not found'}</p>
            <button onClick={() => navigate('/aiinterview')} style={{ marginTop: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}>
                Back to Interviews
            </button>
        </div>
    );

    const r = interview;
    const sr = r.scoreReport || {};
    const hireColor = sr.hire?.includes('Strong Hire') ? '#00b8a3' : sr.hire?.includes('No Hire') ? '#ef4743' : '#ffa116';
    const date = r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
    const aiMessages = (r.transcript || []).filter(m => m.role === 'ai');
    const userMessages = (r.transcript || []).filter(m => m.role === 'user');

    return (
        <div style={{ minHeight: '100vh', background: '#080b14', color: '#e8e8e8', fontFamily: "'Inter', sans-serif" }}>
            {/* ── Sticky header ── */}
            <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(8,11,20,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 2rem', height: '58px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => navigate('/aiinterview')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.82rem' }}>
                    <ArrowLeft size={14} /> Interviews
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="rgba(168,85,247,0.9)" />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.role}</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>@</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Building size={13} color="rgba(255,255,255,0.3)" />
                        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem' }}>{r.company}</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '1.2rem' }}>·</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.problemTitle}</span>
                    {r.problemDifficulty && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: DIFF_COLOR[r.problemDifficulty] || 'rgba(255,255,255,0.4)', background: (DIFF_COLOR[r.problemDifficulty] || '#888') + '18', padding: '2px 9px', borderRadius: '99px' }}>
                            {r.problemDifficulty}
                        </span>
                    )}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{date}</span>
            </div>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

                {/* ── Stat cards row ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
                    {[
                        { icon: <BarChart3 size={16} color="rgba(168,85,247,0.8)" />, label: 'Score', value: `${r.overallScore ?? '—'}/100`, color: r.overallScore >= 75 ? '#00b8a3' : r.overallScore >= 50 ? '#ffa116' : '#ef4743' },
                        { icon: <Clock size={16} color="rgba(255,161,22,0.8)" />, label: 'Duration', value: `${r.durationMinutes ?? 0} min`, color: 'var(--txt, #e8e8e8)' },
                        { icon: <Terminal size={16} color="rgba(99,188,255,0.8)" />, label: 'Run / Submits', value: r.submissionCount ?? 0, color: 'var(--txt, #e8e8e8)' },
                        { icon: <MessageSquare size={16} color="rgba(0,184,163,0.8)" />, label: 'AI Questions', value: aiMessages.length, color: 'var(--txt, #e8e8e8)' },
                        { icon: <User size={16} color="rgba(255,255,255,0.4)" />, label: 'Your Replies', value: userMessages.length, color: 'var(--txt, #e8e8e8)' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            {s.icon}
                            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Score ring + Summary ── */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minWidth: '182px' }}>
                        <ScoreRing score={r.overallScore} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: hireColor, background: hireColor + '18', padding: '4px 14px', borderRadius: '99px' }}>{sr.hire || '—'}</div>
                            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>Recommendation</div>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
                            {LANG_OPTIONS[r.language] || r.language}
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', flex: 1 }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Overall Assessment</div>
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: '#e8e8e8' }}>{sr.summary || 'No summary available.'}</p>
                        {sr.codeAnalysis && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,161,22,0.07)', border: '1px solid rgba(255,161,22,0.2)', borderLeft: '3px solid var(--accent, #ffa116)', borderRadius: '8px', fontSize: '0.83rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                                <strong style={{ color: '#ffa116' }}>Code Review: </strong>{sr.codeAnalysis}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Skill Breakdown ── */}
                {sr.skills && Object.keys(sr.skills).length > 0 && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>Skill Breakdown</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>
                            {Object.entries(sr.skills).map(([key, val]) => {
                                const Icon = SKILL_ICONS[key] || Star;
                                const barCol = val.score >= 4 ? '#00b8a3' : val.score >= 3 ? '#ffa116' : '#ef4743';
                                return (
                                    <div key={key}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
                                            <Icon size={14} color="rgba(168,85,247,0.8)" />
                                            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#e8e8e8' }}>{SKILL_LABELS[key] || key}</span>
                                            <span style={{ marginLeft: 'auto', fontSize: '0.82rem', fontWeight: 700, color: barCol }}>{val.score}/5</span>
                                        </div>
                                        <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden', marginBottom: '5px' }}>
                                            <div style={{ height: '100%', width: `${(val.score / 5) * 100}%`, background: barCol, borderRadius: '99px', transition: 'width 0.8s ease' }} />
                                        </div>
                                        {val.comment && <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{val.comment}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Strengths + Improvements ── */}
                {(sr.strengths?.length > 0 || sr.improvements?.length > 0) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        {sr.strengths?.length > 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#00b8a3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>Strengths</div>
                                {sr.strengths.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '0.6rem', alignItems: 'flex-start' }}>
                                        <CheckCircle2 size={14} color="#00b8a3" style={{ marginTop: '2px', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.84rem', color: '#e8e8e8', lineHeight: 1.55 }}>{s}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {sr.improvements?.length > 0 && (
                            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#ffa116', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>Areas to Improve</div>
                                {sr.improvements.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '0.6rem', alignItems: 'flex-start' }}>
                                        <Lightbulb size={14} color="#ffa116" style={{ marginTop: '2px', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.84rem', color: '#e8e8e8', lineHeight: 1.55 }}>{s}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Red flags ── */}
                {sr.redFlags?.length > 0 && (
                    <div style={{ background: 'rgba(239,71,67,0.07)', border: '1px solid rgba(239,71,67,0.28)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#ef4743', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Red Flags</div>
                        {sr.redFlags.map((f, i) => (
                            <div key={i} style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.55)', marginBottom: '4px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                                <XCircle size={13} color="#ef4743" style={{ marginTop: '2px', flexShrink: 0 }} />
                                {f}
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Final Code ── */}
                {r.finalCode && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Code2 size={15} color="rgba(168,85,247,0.8)" />
                                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Final Code Submitted</span>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.07)', padding: '2px 10px', borderRadius: '6px' }}>{LANG_OPTIONS[r.language] || r.language}</span>
                        </div>
                        <div style={{ height: '340px', overflow: 'hidden' }}>
                            <Editor
                                value={r.finalCode}
                                language={r.language === 'cpp' ? 'cpp' : r.language}
                                theme="vs-dark"
                                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on', scrollBeyondLastLine: false, wordWrap: 'on', domReadOnly: true }}
                            />
                        </div>
                    </div>
                )}

                {/* ── Interview Transcript ── */}
                {r.transcript?.length > 0 && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
                        <button onClick={() => setTranscriptOpen(o => !o)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', background: 'rgba(255,255,255,0.03)', border: 'none', color: '#e8e8e8', cursor: 'pointer', borderBottom: transcriptOpen ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageSquare size={15} color="rgba(168,85,247,0.8)" />
                                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Interview Transcript</span>
                                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: '6px' }}>{r.transcript.length} messages</span>
                            </div>
                            {transcriptOpen ? <ChevronUp size={16} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.3)" />}
                        </button>

                        {transcriptOpen && (
                            <div style={{ maxHeight: '480px', overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {r.transcript.map((msg, i) => {
                                    const isAi = msg.role === 'ai';
                                    return (
                                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.02em', background: isAi ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.07)', color: isAi ? 'rgba(168,85,247,0.9)' : 'rgba(255,255,255,0.5)', border: `1px solid ${isAi ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.1)'}` }}>
                                                {isAi ? 'AI' : 'You'}
                                            </div>
                                            <div style={{ flex: 1, background: isAi ? 'rgba(168,85,247,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isAi ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '10px', padding: '0.65rem 0.9rem' }}>
                                                <div style={{ fontSize: '0.83rem', color: isAi ? '#e8e8e8' : 'rgba(255,255,255,0.6)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                                                {msg.timestamp && (
                                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '5px' }}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
