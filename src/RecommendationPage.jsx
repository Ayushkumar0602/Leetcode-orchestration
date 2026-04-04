import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './contexts/AuthContext';
import NavProfile from './NavProfile';
import {
    Brain, TrendingDown, Award,
    BarChart2, CheckCircle, XCircle, Activity,
    Flame, ArrowUp, ArrowDown,
    Minus, Star, Shield,
    Zap, ChevronRight, ArrowRight, RotateCcw,
    Sparkles, BookOpen, Target, TrendingUp, AlertCircle
} from 'lucide-react';
import { useSEO } from './hooks/useSEO';

const BASE_URL = 'https://leetcode-orchestration-55z3.onrender.com';

const DIFF_COLOR = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };
const DIFF_BG    = { Easy: 'rgba(16,185,129,0.1)', Medium: 'rgba(245,158,11,0.1)', Hard: 'rgba(239,68,68,0.1)' };

async function fetchRecs(uid, token) {
    const res = await fetch(`${BASE_URL}/api/recommendations/${uid}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to load recommendations');
    return res.json();
}

// ─── Problem Card ────────────────────────────────────────────────────────────

function RecCard({ item, rank, onSolve }) {
    const diff = item.difficulty || 'Medium';
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative',
                background: hovered ? 'rgba(99,102,241,0.08)' : 'rgba(15,15,20,0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${hovered ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)'}`,
                boxShadow: hovered ? '0 12px 40px rgba(99,102,241,0.15)' : '0 4px 20px rgba(0,0,0,0.3)',
                borderRadius: '20px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                transform: hovered ? 'translateY(-4px)' : 'none',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                overflow: 'hidden'
            }}
            onClick={() => onSolve(item)}
        >
            {/* Subtle glow behind card when hovered */}
            <div style={{
                position: 'absolute', top: 0, left: '-10%', width: '120%', height: '100%',
                background: 'radial-gradient(circle at 10% 50%, rgba(99,102,241,0.15), transparent 50%)',
                opacity: hovered ? 1 : 0, transition: 'opacity 0.4s', pointerEvents: 'none', zIndex: 0
            }}/>

            {/* Rank badge */}
            <div style={{
                position: 'relative', zIndex: 1,
                width: 42, height: 42, borderRadius: '12px', flexShrink: 0,
                background: rank <= 3
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))'
                    : 'rgba(255,255,255,0.03)',
                border: `1px solid ${rank <= 3 ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: rank <= 3 ? '0 0 15px rgba(99,102,241,0.2) inset' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 800,
                color: rank <= 3 ? '#a5b4fc' : 'rgba(255,255,255,0.3)',
            }}>
                {rank}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>{item.title}</span>
                    <span style={{
                        fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', borderRadius: '999px',
                        background: DIFF_BG[diff], color: DIFF_COLOR[diff],
                        border: `1px solid ${DIFF_COLOR[diff]}40`,
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>{diff}</span>
                </div>

                {/* Topics */}
                {item.topics?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                        {item.topics.slice(0, 4).map(t => (
                            <span key={t} style={{
                                fontSize: '0.72rem', padding: '4px 10px', borderRadius: '8px',
                                background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)',
                                fontWeight: 600, border: '1px solid rgba(255,255,255,0.05)',
                                letterSpacing: '0.02em'
                            }}>{t}</span>
                        ))}
                    </div>
                )}

                {/* AI Reason */}
                <div style={{
                    background: 'linear-gradient(90deg, rgba(99,102,241,0.05), transparent)',
                    borderLeft: '2px solid rgba(99,102,241,0.5)',
                    padding: '8px 12px', borderRadius: '0 8px 8px 0',
                    marginBottom: '14px'
                }}>
                    <p style={{
                        margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5,
                        display: 'flex', alignItems: 'flex-start', gap: '8px',
                    }}>
                        <Zap size={14} color="#818cf8" style={{ flexShrink: 0, marginTop: 2, filter: 'drop-shadow(0 0 5px rgba(129,140,248,0.5))' }} />
                        <span>{item.reason}</span>
                    </p>
                </div>

                {/* Confidence bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                            width: `${Math.round((item.confidenceScore || 0.5) * 100)}%`,
                            height: '100%', borderRadius: 999,
                            background: 'linear-gradient(90deg, #4f46e5, #8b5cf6, #d946ef)',
                            boxShadow: '0 0 10px rgba(139,92,246,0.5)',
                            transition: 'width 1s ease',
                        }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 800, flexShrink: 0, letterSpacing: '0.05em' }}>
                        {Math.round((item.confidenceScore || 0.5) * 100)}% MATCH
                    </span>
                </div>
            </div>

            {/* Solve CTA */}
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', position: 'relative', zIndex: 1, alignSelf: 'center' }}>
                <button
                    onClick={e => { e.stopPropagation(); onSolve(item); }}
                    style={{
                        background: hovered ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${hovered ? 'transparent' : 'rgba(255,255,255,0.1)'}`, 
                        color: '#fff',
                        borderRadius: '12px', padding: '10px 20px',
                        fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: hovered ? '0 8px 20px rgba(99,102,241,0.4)' : 'none',
                        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                    }}
                >
                    Solve 
                    <ArrowRight size={15} style={{ transform: hovered ? 'translateX(3px)' : 'none', transition: 'transform 0.3s' }}/>
                </button>
            </div>
        </div>
    );
}



// ─── Main Page ────────────────────────────────────────────────────────────────

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
            {[140, 140, 140, 140].map((h, i) => (
                <div key={i} style={{
                    height: h, borderRadius: '20px',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(60,60,80,0.1) 50%, rgba(255,255,255,0.02) 75%)',
                    backgroundSize: '400% 100%',
                    border: '1px solid rgba(255,255,255,0.03)',
                    animation: `shimmer 1.8s ease-in-out ${i*0.15}s infinite`,
                }}/>
            ))}
            <style>{`@keyframes shimmer{0%{background-position:100% 50%}100%{background-position:0 50%}}`}</style>
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RecommendationPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useSEO({
        title: 'AI Problem Recommendations | Whizan AI',
        description: 'Personalized DSA problem recommendations powered by AI, tailored to your interview performance and skill level.',
        canonical: '/recommendation',
        robots: 'noindex, nofollow',
    });

    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['ml-recommendations-page', currentUser?.uid],
        queryFn: async () => {
            if (!currentUser) return { items: [] };
            const token = await currentUser.getIdToken().catch(() => null);
            return fetchRecs(currentUser.uid, token);
        },
        enabled: !!currentUser,
        staleTime: 1000 * 60 * 10, // 10 min
        gcTime: 1000 * 60 * 30, // Keep in cache for 30 mins
        refetchOnWindowFocus: false,
    });

    const analytics = data?.analytics || null;
    const items = data?.items || [];

    const meta = data ? {
        updatedAt: data.updatedAt,
        avgScore: data.avgScore,
        targetDiff: data.targetDifficulty,
        modelVersion: data.modelVersion,
    } : null;

    const handleSolve = (item) => {
        navigate(`/solvingpage/${item.problemId}`, {
            state: { problemParams: { id: item.problemId, title: item.title, difficulty: item.difficulty } }
        });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#030303',
            backgroundImage: 'radial-gradient(circle at 15% 0%, rgba(99,102,241,0.08) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(139,92,246,0.05) 0%, transparent 40%)',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            position: 'relative',
        }}>
            {/* ── Navbar ── */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                padding: '0 1.5rem', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: '1 1 0' }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="Logo" style={{ height: 32, width: 32, borderRadius: 8, objectFit: 'cover' }} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Whizan AI</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px' }}>
                    {[
                        { label: 'Problems', path: '/dsaquestion' },
                        { label: '✦ AI Picks', path: '/recommendation', active: true },
                        { label: '📊 Analytics', path: '/analytics' },
                        { label: 'DSA Interview', path: '/aiinterview' },
                        { label: 'System Design', path: '/systemdesign' },
                        { label: 'My Submissions', path: '/submissions' },
                    ].map(item => (
                        <button key={item.label} onClick={() => navigate(item.path)}
                            style={{
                                padding: '6px 14px', borderRadius: '7px', border: 'none',
                                background: item.active ? 'rgba(99,102,241,0.25)' : 'transparent',
                                color: item.active ? '#fff' : 'rgba(255,255,255,0.5)',
                                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                            }}>
                            {item.label}
                        </button>
                    ))}
                </div>

                <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'flex-end' }}>
                    <NavProfile />
                </div>
            </nav>

            {/* ── Content ── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3.5rem 1.5rem', position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '18px', flexShrink: 0,
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
                            border: '1px solid rgba(99,102,241,0.4)',
                            boxShadow: '0 0 30px rgba(99,102,241,0.15) inset, 0 10px 20px rgba(0,0,0,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at top left, rgba(255,255,255,0.2), transparent 60%)', borderRadius: '18px', pointerEvents: 'none' }} />
                            <Brain size={32} color="#a5b4fc" style={{ filter: 'drop-shadow(0 0 10px rgba(129,140,248,0.7))' }} />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', background: 'linear-gradient(90deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                AI Picks For You
                            </h1>
                            <p style={{ margin: '6px 0 0', fontSize: '1rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                                Personalized problem curation based on your performance profile
                            </p>
                        </div>
                    </div>

                    {/* Meta strip */}
                    {meta && items.length > 0 && (
                        <div style={{
                            display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '1rem',
                        }}>
                            {[
                                { icon: <Target size={13} />, label: `Target: ${meta.targetDiff || '—'}` },
                                { icon: <TrendingUp size={13} />, label: `Avg Score: ${meta.avgScore ?? '—'}%` },
                                { icon: <Sparkles size={13} />, label: `${items.length} recommendations` },
                                { icon: <BookOpen size={13} />, label: `Updated ${meta.updatedAt ? new Date(meta.updatedAt).toLocaleDateString() : '—'}` },
                            ].map(({ icon, label }) => (
                                <div key={label} style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '8px', padding: '5px 12px',
                                    fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500,
                                }}>
                                    {icon} {label}
                                </div>
                            ))}
                            <button
                                disabled={isFetching}
                                onClick={() => refetch()}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                                    borderRadius: '8px', padding: '5px 12px', color: '#818cf8',
                                    fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                <RotateCcw size={12} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />
                                {isFetching ? 'Refreshing…' : 'Refresh'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Not logged in */}
                {!currentUser && (
                    <div style={{
                        textAlign: 'center', padding: '4rem 2rem',
                        background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                    }}>
                        <Brain size={40} color="#818cf8" style={{ marginBottom: 16, opacity: 0.6 }} />
                        <h2 style={{ margin: '0 0 8px', fontWeight: 700 }}>Sign in to see your picks</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Your personalized problem recommendations will appear here after you complete a mock interview.
                        </p>
                        <button onClick={() => navigate('/login?redirect=/recommendation')}
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                            Sign In
                        </button>
                    </div>
                )}

                {/* Loading */}
                {currentUser && isLoading && <Skeleton />}

                {/* Error */}
                {isError && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '14px', padding: '1rem 1.25rem', color: '#f87171',
                    }}>
                        <AlertCircle size={18} style={{ flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: '0.88rem' }}>
                            Failed to load recommendations. <button onClick={() => refetch()} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}>Retry</button>
                        </p>
                    </div>
                )}

                {/* Empty state */}
                {currentUser && !isLoading && !isError && items.length === 0 && (
                    <div style={{
                        textAlign: 'center', padding: '5rem 2rem', position: 'relative', overflow: 'hidden',
                        background: 'linear-gradient(135deg, rgba(30,30,40,0.6), rgba(15,15,20,0.8))',
                        border: '1px solid rgba(99,102,241,0.15)', borderRadius: '24px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.02)'
                    }}>
                        {/* Empty state background glow */}
                        <div style={{ position: 'absolute', top: '-20%', left: '30%', width: '40%', height: '140%', background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.1) 0%, transparent 70%)', transform: 'rotate(20deg)', pointerEvents: 'none' }} />

                        <div style={{
                            width: 80, height: 80, borderRadius: '20px', margin: '0 auto 24px',
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))', 
                            border: '1px solid rgba(99,102,241,0.3)',
                            boxShadow: '0 0 30px rgba(99,102,241,0.15) inset, 0 10px 20px rgba(0,0,0,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative'
                        }}>
                            <Brain size={36} color="#818cf8" style={{ filter: 'drop-shadow(0 0 8px rgba(129,140,248,0.5))' }} />
                        </div>
                        <h2 style={{ margin: '0 0 12px', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', color: '#fff' }}>
                            Your AI Core is Booting Up
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', maxWidth: '460px', margin: '0 auto 2rem', lineHeight: 1.6, fontWeight: 500 }}>
                            Complete a mock DSA interview to calibrate our models. The AI will then generate a highly targeted problem roadmap tailored to your exact skill gaps.
                        </p>
                        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                            <button onClick={() => navigate('/aiinterview')}
                                style={{ 
                                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', 
                                    borderRadius: '12px', padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', 
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
                                    transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)'
                                }}
                            >
                                <Zap size={16} fill="#fff" /> Initialize Interview
                            </button>
                            <button onClick={() => navigate('/dsaquestion')}
                                style={{ 
                                    background: 'rgba(255,255,255,0.03)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)', 
                                    borderRadius: '12px', padding: '12px 28px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem',
                                    backdropFilter: 'blur(10px)', transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)'
                                }}
                            >
                                Browse Directory
                            </button>
                        </div>
                    </div>
                )}

                

                {/* Problem list & Sidebar layout */}
                {items.length > 0 && (
                    <div className="rec-layout">
                        {/* LEFT COLUMN: RECOMMENDATIONS */}
                        <div className="rec-problems-col" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {items.map((item, i) => (
                                <RecCard key={item.problemId || i} item={item} rank={i + 1} onSolve={handleSolve} />
                            ))}
                        </div>

                        {/* RIGHT COLUMN: ANALYTICS SIDEBAR */}
                        <div className="rec-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Readiness Gauge */}
                            <ReadinessGauge score={analytics?.readinessScore || 0} />
                            
                            {/* Growth Trajectory */}
                            {analytics?.scoreTrend?.length > 0 && (
                                <div style={{
                                    background: 'rgba(15,15,20,0.6)', backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px',
                                    padding: '1.25rem 1.5rem',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                }}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', letterSpacing: '-0.02em', fontWeight: 800, color: '#fff' }}>Growth Trajectory</h3>
                                    <ScoreTrendChart trend={analytics.scoreTrend} />
                                </div>
                            )}

                            {/* Cognitive Profiling */}
                            {(analytics?.topicStrengths?.length > 0 || analytics?.topicWeaknesses?.length > 0) && (
                                <div style={{
                                    background: 'rgba(15,15,20,0.6)', backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px',
                                    padding: '1.25rem 1.5rem',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                }}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', letterSpacing: '-0.02em', fontWeight: 800, color: '#fff' }}>Cognitive Profiling</h3>
                                    
                                    {analytics?.topicStrengths?.length > 0 && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 800, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Strengths</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {analytics.topicStrengths.map(t => (
                                                    <TopicBar key={t.topic} topic={t.topic} score={t.score} max={Math.max(...analytics.topicStrengths.map(s => s.score), 1)} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {analytics?.topicWeaknesses?.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 800, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weaknesses</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {analytics.topicWeaknesses.map(t => (
                                                    <TopicBar key={t.topic} topic={t.topic} score={t.score} max={Math.max(...analytics.topicWeaknesses.map(s => s.score), 1)} isWeak />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                .rec-layout {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 32px;
                    align-items: start;
                }
                @media (max-width: 960px) {
                    .rec-layout {
                        grid-template-columns: 1fr;
                    }
                    .rec-sidebar {
                        order: -1; /* Pushes the analytics gauges above recommendations on mobile */
                    }
                }
            `}</style>
        </div>
    );
}
