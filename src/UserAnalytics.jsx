import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './contexts/AuthContext';
import NavProfile from './NavProfile';
import { fetchInterviews, fetchStats, queryKeys } from './lib/api';
import ActivityCalendar from './ActivityCalendar';
import {
    Brain, TrendingUp, Target, Activity,
    CheckCircle, AlertCircle, ArrowUp, ArrowDown,
    Minus, Zap, Shield, ChevronRight, Award, Flame,
    Calendar, FileText, Hexagon, Network, ZapOff, Bell, ExternalLink, Menu, X
} from 'lucide-react';

import NotificationBell from './components/NotificationBell';

const BASE_URL = 'https://leetcode-orchestration.onrender.com';

// ── colour helpers ──────────────────────────────────────────────────────────
const diffColor = { Easy: '#34d399', Medium: '#fbbf24', Hard: '#f87171' };

function scoreColor(s) {
    if (s >= 75) return '#34d399';
    if (s >= 50) return '#fbbf24';
    return '#f87171';
}

function trendColor(trend) {
    if (trend > 0) return '#34d399';
    if (trend < 0) return '#f87171';
    return '#9ca3af';
}

// ── sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color = '#818cf8', trend }) {
    return (
        <div
            className="stat-card-padding"
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column', gap: '12px',
                transition: 'transform 0.2s',
                cursor: 'default'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
            <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: color, filter: 'blur(50px)', opacity: 0.15, borderRadius: '50%' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: `linear-gradient(135deg, ${color}20, ${color}40)`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {React.cloneElement(icon, { size: 22, color })}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{label}</span>
                </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <div className="stat-col-val" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
                {trend !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', fontWeight: 700, color: trendColor(trend), background: `${trendColor(trend)}15`, padding: '4px 8px', borderRadius: '8px' }}>
                        {trend > 0 ? <ArrowUp size={14}/> : trend < 0 ? <ArrowDown size={14}/> : <Minus size={14}/>}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            {sub && <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{sub}</div>}
        </div>
    );
}

function ReadinessGauge({ score, readinessLog }) {
    const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444';
    const label = score >= 70 ? 'Interview Ready' : score >= 45 ? 'Making Progress' : 'Needs Practice';
    
    const pct = Math.min(score / 100, 1);
    const size = 200, r = (size - 24) / 2;
    const circ = 2 * Math.PI * r;
    const dash = circ * pct;

    return (
        <div className="gauge-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 24, padding: '2rem', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 250, height: 150, background: color, filter: 'blur(90px)', opacity: 0.15 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
                <Shield size={18} color={color} />
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Readiness Score</span>
            </div>
            <div style={{ position: 'relative', marginTop: 10 }}>
                <svg width={size} height={size}>
                    <defs>
                        <linearGradient id="readyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={color} stopOpacity="1" />
                            <stop offset="100%" stopColor={color} stopOpacity="0.4" />
                        </linearGradient>
                    </defs>
                    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={16}/>
                    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#readyGrad)" strokeWidth={16} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.16,1,0.3,1)' }}/>
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{score}</span>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>out of 100</span>
                </div>
            </div>
            <div style={{ fontSize: '0.9rem', padding: '8px 20px', borderRadius: '999px', background: `${color}15`, color, fontWeight: 700, border: `1px solid ${color}30`, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
            {readinessLog && <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '8px', lineHeight: 1.6 }}>{readinessLog}</p>}
        </div>
    );
}

function TopicRadar({ strengths, weaknesses }) {
    const maxItems = 7;
    let mapped = [];
    if (strengths?.length) mapped.push(...strengths.map(t => ({ ...t, isStrength: true })));
    if (weaknesses?.length) mapped.push(...weaknesses.map(t => ({ ...t, isStrength: false })));
    mapped = mapped.slice(0, maxItems);

    if (mapped.length === 0) return <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>No topic data available.</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mapped.map((t, i) => {
                const pct = (t.score / 10) * 100;
                const color = t.isStrength ? '#10b981' : '#f43f5e';
                return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{t.topic}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: color }}>{t.score.toFixed(1)} / 10</span>
                        </div>
                        <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: `linear-gradient(90deg, ${color}60, ${color})`, transition: 'width 1s ease' }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function ScoreTrendChartEnhanced({ trend }) {
    if (!trend?.length) return <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>Not enough data points.</div>;
    
    const scores = trend.map(t => t.score);
    const minS = Math.max(0, Math.min(...scores) - 10);
    const maxS = Math.min(100, Math.max(...scores) + 10);
    const range = maxS - minS || 1;
    const W = 800, H = 280, PAD_X = 40, PAD_Y = 20;

    const pts = trend.map((t, i) => ({
        x: PAD_X + (i / Math.max(trend.length - 1, 1)) * (W - PAD_X * 2),
        y: H - PAD_Y - ((t.score - minS) / range) * (H - PAD_Y * 2),
        ...t,
    }));

    const pathD = pts.length === 1 
        ? `M${pts[0].x},${pts[0].y} L${pts[0].x},${pts[0].y}`
        : pts.reduce((acc, p, i, a) => {
            if (i === 0) return `M ${p.x},${p.y}`;
            const p0 = a[i - 1];
            return `${acc} C ${p0.x + (p.x - p0.x) / 3},${p0.y} ${p.x - (p.x - p0.x) / 3},${p.y} ${p.x},${p.y}`;
        }, "");
    const areaD = `${pathD} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;

    const [hovered, setHovered] = useState(null);

    return (
        <div style={{ position: 'relative', width: '100%', paddingBottom: 10 }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                </defs>
                {[0, 25, 50, 75, 100].map(v => {
                    const y = H - PAD_Y - ((v - minS) / range) * (H - PAD_Y * 2);
                    if (y < 0 || y > H) return null;
                    return (
                        <g key={v}>
                            <line x1={PAD_X} y1={y} x2={W-PAD_X} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="4 4" />
                            <text x={PAD_X - 10} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={11} fontWeight={600}>{v}</text>
                        </g>
                    );
                })}
                <path d={areaD} fill="url(#areaGrad)"/>
                <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth={4} strokeLinecap="round" />
                {pts.map((p, i) => (
                    <g key={i} style={{ cursor: 'pointer' }} onMouseEnter={() => setHovered({ i, ...p })} onMouseLeave={() => setHovered(null)}>
                        <circle cx={p.x} cy={p.y} r={hovered?.i === i ? 9 : 5} fill="#0f172a" stroke={scoreColor(p.score)} strokeWidth={3} style={{ transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)' }} />
                    </g>
                ))}
                {hovered && (
                    <g>
                        <line x1={hovered.x} y1={hovered.y} x2={hovered.x} y2={H - PAD_Y} stroke="rgba(255,255,255,0.1)" strokeWidth={2} strokeDasharray="4 4" />
                        <g transform={`translate(${Math.min(hovered.x, W - 100)}, ${hovered.y - 60})`}>
                            <rect x={-50} y={0} width={100} height={46} rx={8} fill="rgba(15,23,42,0.9)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} style={{ backdropFilter: 'blur(8px)' }} />
                            <text x={0} y={20} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={800}>{hovered.score}%</text>
                            <text x={0} y={36} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={10} fontWeight={500}>{hovered.date}</text>
                        </g>
                    </g>
                )}
            </svg>
        </div>
    );
}

function DetailedDonut({ dataObj }) {
    const data = [
        { id: 'Easy', value: dataObj.Easy || 0, color: '#34d399' },
        { id: 'Medium', value: dataObj.Medium || 0, color: '#fbbf24' },
        { id: 'Hard', value: dataObj.Hard || 0, color: '#f87171' },
    ].filter(d => d.value > 0);

    const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
    const size = 220, r = 70, cx = size / 2, cy = size / 2, strokeW = 24;
    const circ = 2 * Math.PI * r;

    let cumulative = 0;
    const segments = data.map(d => {
        const pct = d.value / total;
        const dash = pct * circ;
        const offset = circ - cumulative * circ;
        cumulative += pct;
        return { ...d, dash, offset, pct };
    });

    const [hovered, setHovered] = useState(null);

    return (
        <div className="donut-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size}>
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth={strokeW} />
                    {segments.map((seg) => (
                        <circle key={seg.id} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={hovered === seg.id ? strokeW + 6 : strokeW} strokeDasharray={`${seg.dash} ${circ - seg.dash}`} strokeDashoffset={seg.offset} transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', opacity: hovered && hovered !== seg.id ? 0.3 : 1, cursor: 'pointer' }} onMouseEnter={() => setHovered(seg.id)} onMouseLeave={() => setHovered(null)} />
                    ))}
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ fontSize: hovered ? '2rem' : '1.8rem', fontWeight: 800, color: '#fff', transition: 'all 0.2s', lineHeight: 1 }}>{hovered ? segments.find(s => s.id === hovered).value : total}</span>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, transition: 'all 0.2s' }}>{hovered ? `${Math.round(segments.find(s => s.id === hovered).pct * 100)}%` : 'Total Solved'}</span>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {data.map(d => {
                    const isHovered = hovered === d.id;
                    return (
                        <div key={d.id} onMouseEnter={() => setHovered(d.id)} onMouseLeave={() => setHovered(null)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: isHovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '12px', border: '1px solid', borderColor: isHovered ? d.color : 'rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <div style={{ width: 12, height: 12, borderRadius: 4, background: d.color, boxShadow: `0 0 10px ${d.color}80` }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase' }}>{d.id}</span>
                                <span style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 800, lineHeight: 1.2 }}>{d.value}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── NEW: Futuristic Modules ───────────────────────────────────────────────────

function PulseTimeline({ interviews }) {
    if (!interviews?.length) return <div style={{ color: 'rgba(255,255,255,0.3)', padding: '2rem 0', textAlign: 'center' }}>No timeline data.</div>;
    
    // Valid and completed interviews only
    const valid = interviews.filter(i => i.overallScore > 0).slice(0, 10).reverse();
    const navigate = useNavigate();

    return (
        <div style={{ width: '100%', overflowX: 'auto', padding: '2.5rem 0.5rem', WebkitOverflowScrolling: 'touch' }} className="custom-scrollbar">
            <div style={{ position: 'relative', minWidth: '500px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 auto' }}>
                {/* Glowing horizontal laser line */}
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #8b5cf6, #3b82f6, transparent)', boxShadow: '0 0 15px #8b5cf6', transform: 'translateY(-50%)', zIndex: 0 }} />
                
                {valid.map((inv, idx) => {
                    const isHire = inv.scoreReport?.hire?.includes('Hire');
                    const color = scoreColor(inv.overallScore);
                    const d = new Date(inv.createdAt);
                    
                    return (
                        <div key={inv.id} 
                             onClick={() => navigate(`/aiinterview/${inv.id}`)}
                             style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', cursor: 'pointer', zIndex: 1, padding: '0 10px' }}
                             className="group">
                            
                            <div style={{ position: 'absolute', top: -35, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, whiteSpace: 'nowrap', opacity: idx % 2 === 0 ? 1 : 0 }}>
                                {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>

                            <div style={{
                                width: 22, height: 22, borderRadius: '50%', background: '#0a0f1c',
                                border: `3px solid ${color}`, boxShadow: `0 0 12px ${color}80`,
                                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                                position: 'relative', zIndex: 2
                            }} 
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.4)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {/* Tooltip Pop */}
                                <div style={{
                                    position: 'absolute', top: '-65px', left: '50%', transform: 'translateX(-50%)',
                                    background: 'rgba(15,23,42,0.95)', padding: '6px 14px', borderRadius: 10,
                                    border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                                    opacity: 0, pointerEvents: 'none', transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                                    whiteSpace: 'nowrap', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.6)', zIndex: 10
                                }} className="timeline-tooltip">
                                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', marginBottom: 2 }}>{inv.overallScore} / 100</div>
                                    <div style={{ fontSize: '0.7rem', color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{inv.scoreReport?.hire || 'Scored'}</div>
                                    {/* Tooltip triangle */}
                                    <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid rgba(15,23,42,0.95)' }} />
                                </div>
                            </div>

                            <div style={{ position: 'absolute', bottom: -35, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, whiteSpace: 'nowrap', opacity: idx % 2 === 1 ? 1 : 0 }}>
                                {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>

                        </div>
                    );
                })}
            </div>
            <style>{`
                .group:hover .timeline-tooltip { opacity: 1 !important; transform: translateX(-50%) translateY(-5px) !important; }
                .custom-scrollbar::-webkit-scrollbar { height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
            `}</style>
        </div>
    );
}

function IntelligenceSynthesis({ stats, analytics }) {
    if (!stats || !analytics) return null;
    
    // Fun Custom Metrics Calculation
    const endurance = Math.min(((stats.userStats?.Total || 0) * 0.5) + ((analytics.totalInterviews || 0) * 5), 100).toFixed(0);
    const variance = analytics.scoreTrend?.length > 1 
        ? Math.abs(analytics.scoreTrend[analytics.scoreTrend.length - 1].score - analytics.scoreTrend[0].score)
        : 0;
    const consistencyScore = Math.max(100 - (variance * 1.5), 10).toFixed(0);
    
    return (
        <div className="responsive-grid-2" style={{ width: '100%' }}>
            <div className="ai-synthesis-col" style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', padding: '1.5rem', borderRadius: 20 }}>
                <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Network size={22} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px', fontWeight: 800, color: '#fff' }}>Endurance Rating</h4>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Calculated from {stats.userStats?.Total || 0} solved concepts & {analytics.totalInterviews || 0} intense mock rounds.</p>
                </div>
                <div className="ai-synthesis-val" style={{ margin: 'auto 0 auto auto', fontSize: '2.5rem', fontWeight: 900, color: '#8b5cf6' }}>
                    {endurance}
                </div>
            </div>

            <div className="ai-synthesis-col" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', padding: '1.5rem', borderRadius: 20 }}>
                <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Hexagon size={22} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px', fontWeight: 800, color: '#fff' }}>Algorithmic Consistency</h4>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Your performance variance across recent AI interviews is dynamically rated at {consistencyScore}/100.</p>
                </div>
                <div className="ai-synthesis-val" style={{ margin: 'auto 0 auto auto', fontSize: '2.5rem', fontWeight: 900, color: '#10b981' }}>
                    {consistencyScore}
                </div>
            </div>
        </div>
    );
}

// ── Skeleton Loader ───────────────────────────────────────────────────────────
function PageSkeleton() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', gap: 24 }}>
               {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 140, borderRadius: 20, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                <div style={{ height: 400, borderRadius: 24, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: 400, borderRadius: 24, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
            </div>
            <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.8}}`}</style>
        </div>
    );
}


// ── Main Layout ───────────────────────────────────────────────────────────────

export default function UserAnalytics() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const uid = currentUser?.uid;

    const { data: recData, isLoading: recLoading, error: recError } = useQuery({
        queryKey: ['ml_user_analytics', uid],
        queryFn: async () => {
            const token = await currentUser.getIdToken().catch(() => null);
            const res = await fetch(`${BASE_URL}/api/recommendations/${uid}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error('Failed to fetch analytics data');
            return res.json();
        },
        enabled: !!uid,
        staleTime: 1000 * 60 * 5, // 5 min
        gcTime: 1000 * 60 * 30, // 30 min cache
        refetchOnWindowFocus: false,
    });

    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: queryKeys.stats(uid),
        queryFn: () => fetchStats(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });

    const { data: interviewsData } = useQuery({
        queryKey: queryKeys.interviews(uid),
        queryFn: () => fetchInterviews(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });

    const analytics = recData?.analytics || recData?.data?.analytics;
    const isLoading = recLoading || statsLoading;

    return (
        <div style={{ 
            minHeight: '100vh',
            background: '#050505', 
            backgroundImage: 'radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 40%), radial-gradient(circle at bottom left, rgba(236,72,153,0.05), transparent 40%)',
            color: '#fff', fontFamily: "'Inter', sans-serif"
        }}>
            {/* ── Top Navigation ── */}
            <nav style={{
                height: '64px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 1.5rem',
                background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)',
                position: 'sticky', top: 0, zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: '1 1 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <img src="/logo.jpeg" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                        <span className="nav-logo-text" style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.5px', color: '#fff' }}>Whizan AI</span>
                    </div>
                </div>

                <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 0', justifyContent: 'center' }}>
                    <button className="dash-nav-links" onClick={() => navigate('/dsaquestion')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--txt2)'}>
                        DSA Practice
                    </button>
                    <button className="dash-nav-links" onClick={() => navigate('/aiinterviewselect')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--txt2)'}>
                        AI Interview
                    </button>
                    <button className="dash-nav-links" onClick={() => navigate('/systemdesign')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--txt2)'}>
                        System Design
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 0', justifyContent: 'flex-end' }}>
                    <NotificationBell />
                    <div className="desktop-nav-profile">
                        <NavProfile />
                    </div>
                    <button
                        className="mobile-nav-toggle"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{
                            display: 'none',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            padding: '8px',
                            zIndex: 110
                        }}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    {!currentUser && (
                        <div className="mobile-nav-toggle" style={{ display: 'none' }}>
                            <NavProfile />
                        </div>
                    )}
                </div>
            </nav>

            {/* ── Mobile Menu Overlay ── */}
            {isMenuOpen && (
                <div style={{
                    position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0,
                    background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)', zIndex: 99,
                    padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out'
                }}>
                    <button style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: 600, textAlign: 'left', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => { navigate('/dsaquestion'); setIsMenuOpen(false); }}>DSA Practice</button>
                    <button style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: 600, textAlign: 'left', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => { navigate('/aiinterviewselect'); setIsMenuOpen(false); }}>AI Interview</button>
                    <button style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: 600, textAlign: 'left', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => { navigate('/systemdesign'); setIsMenuOpen(false); }}>System Design</button>
                    {currentUser && (
                        <>
                            <button style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: 600, textAlign: 'left', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => { navigate(`/public/${currentUser.uid}`); setIsMenuOpen(false); }}>Public Portfolio</button>
                            <button style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: 600, textAlign: 'left', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}>My Profile</button>
                        </>
                    )}
                </div>
            )}
            
            <style>{`
                @media (max-width: 768px) {
                    .mobile-nav-toggle { display: block !important; }
                    .nav-links { display: none !important; }
                    .desktop-nav-profile { display: none !important; }
                }
                @media (max-width: 480px) {
                    .nav-logo-text { display: none !important; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* ---- IMPRESSIVE RESPONSIVE GRID MEDIA QUERIES ---- */
                
                .analytics-wrapper {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 3rem 2rem;
                }
                
                .responsive-grid-kpi {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 1.5rem;
                }
                
                .responsive-grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    align-items: stretch;
                }

                .responsive-grid-trend {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 340px;
                    gap: 1.5rem;
                    align-items: stretch;
                }

                .responsive-grid-donut {
                    display: grid;
                    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
                    gap: 1.5rem;
                    align-items: stretch;
                }

                .ai-synthesis-col {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }

                .ai-synthesis-col h4 {
                    font-size: 1rem;
                }

                /* TABLET STYLES */
                @media (max-width: 1024px) {
                    .responsive-grid-trend {
                        grid-template-columns: 1fr;
                    }
                    .responsive-grid-donut {
                        grid-template-columns: 1fr;
                    }
                    .analytics-header-title {
                        font-size: 2.2rem !important;
                    }
                }

                /* SMARTPHONE STYLES */
                @media (max-width: 800px) {
                    .analytics-wrapper {
                        padding: 1.5rem 1rem;
                    }
                    .responsive-grid-2 {
                        grid-template-columns: 1fr;
                        gap: 1.25rem;
                    }
                    .responsive-grid-kpi {
                        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                        gap: 1rem;
                    }
                    .ai-synthesis-col {
                        flex-direction: column;
                        align-items: flex-start;
                        text-align: left;
                        gap: 1rem;
                        padding: 1.5rem !important;
                    }
                    .ai-synthesis-col > div:first-child {
                        margin-bottom: 0px;
                        width: 48px;
                        height: 48px;
                    }
                    .ai-synthesis-col > div:last-child {
                        margin: 0 !important;
                        font-size: 2.2rem !important;
                        line-height: 1;
                    }
                    .stat-col-val {
                        font-size: 2.22rem !important;
                    }
                    .ai-synthesis-val {
                        margin: 0 !important;
                    }
                    .gauge-container, .donut-container {
                        padding: 1.5rem !important;
                        transform: scale(0.9);
                        transform-origin: center top;
                        margin-bottom: -20px;
                    }
                }

                @media (max-width: 500px) {
                    .responsive-grid-kpi {
                        grid-template-columns: 1fr;
                    }
                    .analytics-header-title {
                        font-size: 1.8rem !important;
                    }
                    .stat-card-padding {
                        padding: 1.25rem !important;
                    }
                    .gauge-container, .donut-container {
                        transform: scale(0.85);
                        margin-bottom: -40px;
                    }
                }
            `}</style>

            <div className="analytics-wrapper">
                
                {/* Title Section */}
                <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ padding: '6px 12px', borderRadius: '100px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                                AI Evaluated Matrix
                            </div>
                        </div>
                        <h1 className="analytics-header-title" style={{ fontSize: '2.8rem', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-1px', background: 'linear-gradient(to right, #fff, #9ca3af)', WebkitBackgroundClip: 'text', color: 'transparent', transition: 'font-size 0.3s' }}>
                            Performance Matrix
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', margin: 0, maxWidth: 600, lineHeight: 1.6 }}>
                            Deep insights, activity mapping, and AI synthesized correlations derived from your interactive history.
                        </p>
                    </div>
                </div>

                {isLoading && <PageSkeleton />}

                {!isLoading && (!analytics && !statsData) ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: 30, border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <ZapOff size={50} color="#f87171" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 10px' }}>No Data Traces Found</h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>Initiate neural linkage by completing an AI interview or solving algorithms.</p>
                        <button onClick={() => navigate('/aiinterviewselect')} style={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontWeight: 700, cursor: 'pointer'
                        }}>Initialize System</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* 1. KPIs */}
                        {analytics && (
                            <div className="responsive-grid-kpi">
                                <StatCard icon={<Target/>} label="Overall Avg Score" value={`${analytics.avgScore || 0}%`} color="#8b5cf6" trend={analytics.recentAvg - analytics.prevAvg} />
                                <StatCard icon={<Activity/>} label="Total Interviews" value={analytics.totalInterviews || 0} color="#ec4899" />
                                <StatCard icon={<CheckCircle/>} label="Problems Solved" value={analytics.totalSolved || 0} color="#10b981" />
                                <StatCard icon={<Flame/>} label="Target Difficulty" value={analytics.targetDifficulty || 'Medium'} color={diffColor[analytics.targetDifficulty] || diffColor.Medium} sub="Adaptive challenge goal" />
                            </div>
                        )}

                        {/* 2. Cyberpunk Activity Heatmap & Interview Pulse Timeline */}
                        <div className="responsive-grid-2">
                            <div style={{ background: 'rgba(20, 22, 30, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '2rem' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10, color: '#6366f1' }}>
                                    <Activity size={20} /> Neural Activity Map
                                </h2>
                                <div style={{ filter: 'drop-shadow(0 0 10px rgba(99,102,241,0.15))' }}>
                                    <ActivityCalendar uid={uid} userStats={statsData?.userStats} totalCounts={statsData?.totalCounts} containerStyle={{ background: 'transparent', border: 'none', padding: 0 }} />
                                </div>
                            </div>

                            <div style={{ background: 'rgba(20, 22, 30, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '2rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10, color: '#ec4899' }}>
                                    <FileText size={20} /> Evaluation Pulse
                                </h2>
                                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginBottom: '2rem' }}>Top 10 Recent Mock Session Outcomes</span>
                                
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                    <PulseTimeline interviews={interviewsData} />
                                </div>
                            </div>
                        </div>

                        {/* 3. New AI Intelligence Synthesis */}
                        <div style={{ margin: '1rem 0' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 1.5rem', letterSpacing: '-0.5px' }}>AI Intelligence Synthesis</h2>
                            <IntelligenceSynthesis stats={statsData} analytics={analytics} />
                        </div>

                        {/* 4. Legacy Row: Trend & Readiness */}
                        {analytics && (
                            <div className="responsive-grid-trend">
                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <TrendingUp color="#818cf8" size={22} /> Growth Trajectory
                                    </h2>
                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginBottom: '2.5rem', display: 'block' }}>Historical performance mapping</span>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyItems: 'stretch' }}>
                                        <ScoreTrendChartEnhanced trend={analytics.scoreTrend || []} />
                                    </div>
                                </div>
                                <ReadinessGauge score={analytics.readinessScore || 0} readinessLog={
                                    analytics.readinessScore >= 70 ? "Consistent high marks suggest you're prepared for technical rounds." :
                                    analytics.readinessScore >= 45 ? "Solid foundation, but critical logic areas need reinforcement." :
                                    "Significant weak points observed. Structured practice required."
                                } />
                            </div>
                        )}

                        {/* 5. Bottom Row: Topics & Donut */}
                        {analytics && (
                            <div className="responsive-grid-donut">
                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '2rem' }}>
                                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <Brain color="#ec4899" size={22} /> Cognitive Profiling
                                    </h2>
                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, display: 'block', marginBottom: '2rem' }}>
                                        ML-identified strengths and weaknesses
                                    </span>
                                    <div style={{ background: '#0a0f1c', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)', padding: '1.25rem', overflow: 'hidden' }}>
                                        <TopicRadar strengths={analytics.topicStrengths} weaknesses={analytics.topicWeaknesses} />
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <Award color="#f59e0b" size={22} /> Problem Resolution
                                    </h2>
                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, display: 'block', marginBottom: '2rem' }}>
                                        Complexity distribution of solved challenges
                                    </span>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {analytics.solvedByDiff && Object.values(analytics.solvedByDiff).some(v => v > 0) ? (
                                            <DetailedDonut dataObj={analytics.solvedByDiff} />
                                        ) : (
                                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>No problem distribution data.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}
