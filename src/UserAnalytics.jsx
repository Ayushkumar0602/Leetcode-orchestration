import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './contexts/AuthContext';
import NavProfile from './NavProfile';
import {
    Brain, TrendingUp, TrendingDown, Target, Award, Zap,
    BookOpen, BarChart2, CheckCircle, XCircle, Activity,
    AlertCircle, RotateCcw, Flame, ArrowUp, ArrowDown,
    Minus, Star, Shield
} from 'lucide-react';

const BASE_URL = 'https://leetcode-orchestration-55z3.onrender.com';

// ── colour helpers ──────────────────────────────────────────────────────────
const diffColor = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };
const diffBg    = { Easy: 'rgba(16,185,129,0.12)', Medium: 'rgba(245,158,11,0.12)', Hard: 'rgba(239,68,68,0.12)' };

function scoreColor(s) {
    if (s >= 75) return '#10b981';
    if (s >= 50) return '#f59e0b';
    return '#ef4444';
}

// ── sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color = '#818cf8', trend }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
            padding: '1.25rem 1.5rem',
            display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: `${color}18`, border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    {React.cloneElement(icon, { size: 16, color })}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{label}</span>
                {trend !== undefined && (
                    <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', fontWeight: 700, color: trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#6b7280' }}>
                        {trend > 0 ? <ArrowUp size={11}/> : trend < 0 ? <ArrowDown size={11}/> : <Minus size={11}/>}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: color, lineHeight: 1 }}>{value}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>{sub}</div>}
        </div>
    );
}

function RadialProgress({ value, max = 100, size = 110, label, color = '#6366f1' }) {
    const pct = Math.min(value / max, 1);
    const r = (size - 14) / 2;
    const circ = 2 * Math.PI * r;
    const dash = circ * pct;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <svg width={size} height={size}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={12}/>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={12}
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size/2} ${size/2})`}
                    style={{ transition: 'stroke-dasharray 1s ease' }}/>
                <text x={size/2} y={size/2 + 6} textAnchor="middle" fill="#fff" fontSize="18" fontWeight="800">{value}</text>
            </svg>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{label}</span>
        </div>
    );
}

function TopicBar({ topic, score, max, isWeak }) {
    const pct = max > 0 ? (score / max) * 100 : 0;
    const color = isWeak ? '#ef4444' : '#10b981';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
                fontSize: '0.75rem', fontWeight: 600, minWidth: 130,
                color: 'rgba(255,255,255,0.7)', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{topic}</span>
            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                    width: `${pct}%`, height: '100%', borderRadius: 999,
                    background: `linear-gradient(90deg, ${color}99, ${color})`,
                    transition: 'width 1s ease',
                }}/>
            </div>
            <span style={{ fontSize: '0.7rem', color, fontWeight: 700, minWidth: 24, textAlign: 'right' }}>
                {score.toFixed?.(1) ?? score}
            </span>
        </div>
    );
}

function ScoreTrendChart({ trend }) {
    if (!trend?.length) return null;
    const scores = trend.map(t => t.score);
    const minS = Math.min(...scores, 0);
    const maxS = Math.max(...scores, 100);
    const range = maxS - minS || 1;
    const W = 420, H = 130, PAD = 16;
    const pts = trend.map((t, i) => ({
        x: PAD + (i / Math.max(trend.length - 1, 1)) * (W - PAD * 2),
        y: H - PAD - ((t.score - minS) / range) * (H - PAD * 2),
        ...t,
    }));
    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const areaD = `${pathD} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;

    const [hovered, setHovered] = useState(null);

    return (
        <div style={{ position: 'relative', overflow: 'visible' }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto', overflow: 'visible' }}>
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                    </linearGradient>
                </defs>
                {/* Grid lines */}
                {[0,25,50,75,100].map(v => {
                    const y = H - PAD - ((v - minS) / range) * (H - PAD * 2);
                    if (y < 0 || y > H) return null;
                    return <line key={v} x1={PAD} y1={y} x2={W-PAD} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={1}/>;
                })}
                {/* Area */}
                <path d={areaD} fill="url(#areaGrad)"/>
                {/* Line */}
                <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/>
                {/* Dots */}
                {pts.map((p, i) => (
                    <g key={i} style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}>
                        <circle cx={p.x} cy={p.y} r={hovered === i ? 7 : 4}
                            fill={scoreColor(p.score)} stroke="#0a0a0a" strokeWidth={2}
                            style={{ transition: 'r 0.15s' }}/>
                        {hovered === i && (
                            <g>
                                <rect x={p.x - 48} y={p.y - 38} width={96} height={30} rx={7}
                                    fill="rgba(15,15,25,0.95)" stroke="rgba(99,102,241,0.4)" strokeWidth={1}/>
                                <text x={p.x} y={p.y - 19} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={700}>{p.score}%</text>
                                <text x={p.x} y={p.y - 8} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={9}>{p.date}</text>
                            </g>
                        )}
                    </g>
                ))}
            </svg>
            {/* X labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, paddingInline: PAD }}>
                {trend.map((t, i) => (
                    (i === 0 || i === trend.length - 1 || (trend.length <= 6)) && (
                        <span key={i} style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                            {t.date}
                        </span>
                    )
                ))}
            </div>
        </div>
    );
}

function SolvedDonut({ byDiff }) {
    const data = [
        { label: 'Easy', value: byDiff.Easy || 0, color: '#10b981' },
        { label: 'Medium', value: byDiff.Medium || 0, color: '#f59e0b' },
        { label: 'Hard', value: byDiff.Hard || 0, color: '#ef4444' },
    ];
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const size = 120, R = 48, cx = size/2, cy = size/2;
    const strokeW = 16;

    let cumulative = 0;
    const circ = 2 * Math.PI * R;
    const segments = data.map(d => {
        const pct = d.value / total;
        const dash = pct * circ;
        const offset = circ - cumulative * circ;
        cumulative += pct;
        return { ...d, dash, offset };
    });

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <svg width={size} height={size}>
                {segments.map((seg, i) => (
                    <circle key={i} cx={cx} cy={cy} r={R}
                        fill="none" stroke={seg.value > 0 ? seg.color : 'transparent'} strokeWidth={strokeW}
                        strokeDasharray={`${seg.dash} ${circ - seg.dash}`}
                        strokeDashoffset={seg.offset}
                        transform={`rotate(-90 ${cx} ${cy})`}/>
                ))}
                <text x={cx} y={cy+6} textAnchor="middle" fill="#fff" fontSize={15} fontWeight={800}>{total}</text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.map(d => (
                    <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }}/>
                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>{d.label}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: d.color, marginLeft: 'auto', paddingLeft: 16 }}>{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[96, 240, 180, 240].map((h, i) => (
                <div key={i} style={{
                    height: h, borderRadius: 18,
                    background: 'rgba(255,255,255,0.04)',
                    animation: `shimmer 1.6s ease-in-out ${i*0.12}s infinite`,
                }}/>
            ))}
            <style>{`@keyframes shimmer{0%,100%{opacity:.45}50%{opacity:.9}}`}</style>
        </div>
    );
}

// ── ReadinessGauge ───────────────────────────────────────────────────────────
function ReadinessGauge({ score }) {
    const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444';
    const label = score >= 70 ? 'Interview Ready' : score >= 45 ? 'Making Progress' : 'Needs Practice';

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            background: `radial-gradient(circle at 50% 80%, ${color}12, transparent 70%)`,
            border: `1px solid ${color}25`, borderRadius: 20, padding: '1.5rem',
        }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Interview Readiness
            </div>
            <RadialProgress value={score} size={130} label={label} color={color}/>
            <div style={{
                fontSize: '0.78rem', padding: '5px 14px', borderRadius: '999px',
                background: `${color}18`, color, fontWeight: 700, border: `1px solid ${color}30`,
            }}>{label}</div>
        </div>
    );
}

export default function UserAnalytics() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const { data: recData, isLoading, error } = useQuery({
        queryKey: ['ml_recommendations', currentUser?.uid],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/recommendations/${currentUser?.uid}`);
            if (!res.ok) throw new Error('Failed to fetch analytics data');
            return res.json();
        },
        enabled: !!currentUser?.uid,
    });

    const analytics = recData?.analytics || recData?.data?.analytics;

    if (isLoading) {
        return (
            <div style={{ padding: '2rem 5%', maxWidth: '1300px', margin: '0 auto', color: '#fff' }}>
                <Skeleton />
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div style={{ padding: '2rem 5%', maxWidth: '1300px', margin: '0 auto', color: '#fff', textAlign: 'center' }}>
                <div style={{ padding: '3rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 20 }}>
                    <AlertCircle size={40} style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Failed to load analytics</h3>
                    <p style={{ opacity: 0.8 }}>We could not fetch your performance profile. Please run a mock interview or trigger ML again.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem 5%', maxWidth: '1300px', margin: '0 auto', color: '#fff' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Performance Analytics</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontSize: '0.95rem' }}>Your AI-driven personalized insights dashboard.</p>
                </div>
            </div>

            {/* Top row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem'
            }}>
                <StatCard icon={<Target/>} label="Overall Avg Score" value={analytics.avgScore + '%'} color="#818cf8" trend={analytics.recentAvg - analytics.prevAvg}/>
                <StatCard icon={<Activity/>} label="Total Interviews" value={analytics.totalInterviews} color="#f472b6" />
                <StatCard icon={<CheckCircle/>} label="Problems Solved" value={analytics.totalSolved} color="#10b981" />
                <StatCard icon={<Flame/>} label="Target Difficulty" value={analytics.targetDifficulty} color={diffColor[analytics.targetDifficulty] || diffColor.Medium} sub="Adaptive metric" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem', marginBottom: '2rem', alignItems: 'start' }}>
                {/* Left col */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Score Trend */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }}>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={18} color="#818cf8"/>
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Performance Trend</h3>
                        </div>
                        {analytics.scoreTrend?.length > 0 ? (
                            <ScoreTrendChart trend={analytics.scoreTrend} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>Not enough data for trend chart.</div>
                        )}
                    </div>

                    {/* Topic analysis */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}/>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'rgba(255,255,255,0.85)' }}>Areas to Improve</h4>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {analytics.topicWeaknesses?.length > 0 ? (
                                    analytics.topicWeaknesses.map((t, i) => <TopicBar key={i} topic={t.topic} score={t.score} max={10} isWeak={true} />)
                                ) : (
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '1rem' }}>No weaknesses detected yet.</div>
                                )}
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}/>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'rgba(255,255,255,0.85)' }}>Strong Areas</h4>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {analytics.topicStrengths?.length > 0 ? (
                                    analytics.topicStrengths.map((t, i) => <TopicBar key={i} topic={t.topic} score={t.score} max={10} isWeak={false} />)
                                ) : (
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '1rem' }}>Keep practicing to build your strengths!</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right col */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <ReadinessGauge score={analytics.readinessScore || 0} />
                    
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: '0 0 1.5rem' }}>Solved by Difficulty</h4>
                        {analytics.solvedByDiff && Object.values(analytics.solvedByDiff).some(v => v > 0) ? (
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <SolvedDonut byDiff={analytics.solvedByDiff} />
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '1.5rem 0' }}>No problems solved yet.</div>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
}
