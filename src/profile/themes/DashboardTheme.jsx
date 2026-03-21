import React from 'react';
import { User, Code2, Brain, Trophy, Briefcase, ChevronRight, Activity, TrendingUp, MonitorPlay, Zap, X as XIcon, Send as SendIcon, Loader2 } from 'lucide-react';

export default function DashboardTheme({ profile, stats, totalCounts, recentInv, validInvCount, badges, avg, hasProjects, hasExperience, T, navigate, primaryCta, connectModalOpen, setConnectModalOpen, connectMessage, setConnectMessage, connectBusy, sendConnectRequest, isDark }) {
    
    const dCSS = `
    .dash-wrap { width: 100vw; min-height: 100vh; background: ${isDark ? '#0b1120' : '#f8fafc'}; color: ${isDark ? '#f8fafc' : '#0f172a'}; overflow-y: auto; overflow-x: hidden; padding: 2rem; }
    .dash-grid { max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; }
    .dash-card { background: ${isDark ? 'rgba(30,41,59,0.5)' : '#ffffff'}; border: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}; border-radius: 24px; padding: 1.5rem; display: flex; flex-direction: column; backdrop-filter: blur(20px); box-shadow: ${isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.05)'}; transition: transform 0.2s; }
    .dash-card:hover { transform: translateY(-4px); }
    .dash-header { grid-column: span 12; display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1rem; }
    .dash-stat-top { grid-column: span 3; }
    .dash-main-chart { grid-column: span 8; }
    .dash-side-chart { grid-column: span 4; }
    .dash-projects { grid-column: span 6; }
    .dash-experience { grid-column: span 6; }
    
    @media (max-width: 1024px) {
        .dash-stat-top { grid-column: span 6; }
        .dash-main-chart { grid-column: span 12; }
        .dash-side-chart { grid-column: span 12; }
        .dash-projects { grid-column: span 12; }
        .dash-experience { grid-column: span 12; }
    }
    @media (max-width: 640px) {
        .dash-wrap { padding: 1rem; }
        .dash-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
        .dash-stat-top { grid-column: span 12; }
    }
    `;

    return (
        <div className="dash-wrap">
            <style>{dCSS}</style>
            
            <div className="dash-grid">
                {/* 1. Header */}
                <div className="dash-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: 80, height: 80, borderRadius: '20px', background: T.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {profile.photoURL ? <img src={profile.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={30} color="#fff" />}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: T.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Data Dashboard</div>
                            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.04em', margin: '4px 0' }}>{profile.displayName || 'Developer'}</h1>
                            <div style={{ fontSize: '1rem', color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}>{profile.currentRole || profile.role || 'Software Engineer'}</div>
                        </div>
                    </div>
                    {primaryCta && (
                        <button onClick={primaryCta.action} disabled={primaryCta.disabled} style={{ background: T.gradient, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 10px 30px ${T.accent}40` }}>
                            <primaryCta.icon size={18} /> {primaryCta.label}
                        </button>
                    )}
                </div>

                {/* 2. Top Stats */}
                {[
                    { label: 'Total Problems', value: stats?.Total || 0, icon: Code2, color: T.accent },
                    { label: 'Mock Interviews', value: validInvCount, icon: Brain, color: '#3b82f6' },
                    { label: 'Performance Avg', value: avg ? `${avg}%` : '0%', icon: TrendingUp, color: '#10b981' },
                    { label: 'Badges Earned', value: badges.filter(b => b.unlocked).length, icon: Trophy, color: '#f59e0b' }
                ].map((s, i) => (
                    <div key={i} className="dash-card dash-stat-top">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{s.label}</span>
                            <div style={{ width: 32, height: 32, borderRadius: '10px', background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><s.icon size={16} color={s.color} /></div>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                    </div>
                ))}

                {/* 3. Difficulty Breakdown */}
                <div className="dash-card dash-main-chart">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} color={T.accent} /> Difficulty Distribution Matrix</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1, justifyContent: 'center' }}>
                        {[
                            { label: 'Easy', count: stats?.Easy || 0, max: totalCounts?.Easy || 1, color: '#10b981' },
                            { label: 'Medium', count: stats?.Medium || 0, max: totalCounts?.Medium || 1, color: '#f59e0b' },
                            { label: 'Hard', count: stats?.Hard || 0, max: totalCounts?.Hard || 1, color: '#ef4444' },
                        ].map(d => (
                            <div key={d.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                                    <span style={{ color: d.color }}>{d.label} Algorithms</span>
                                    <span>{d.count} / {d.max}</span>
                                </div>
                                <div style={{ width: '100%', height: '16px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
                                    <div style={{ width: `${(d.count / d.max) * 100}%`, height: '100%', background: d.color, borderRadius: '8px', transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Skills Radar / List */}
                <div className="dash-card dash-side-chart">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={18} color="#eab308" /> Core Capabilities</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {profile.skills?.map(s => (
                            <span key={s} style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, padding: '8px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}>{s}</span>
                        ))}
                        {(!profile.skills || profile.skills.length === 0) && <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>No verified skills extracted yet.</span>}
                    </div>
                </div>

                {/* 5. Projects */}
                {hasProjects && (
                    <div className="dash-card dash-projects">
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><MonitorPlay size={18} color="#06b6d4" /> Technical Implementations</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {profile.projects.slice(0, 3).map((p, i) => (
                                <div key={i} style={{ padding: '1.2rem', borderRadius: '16px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}` }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>{p.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', marginBottom: '10px', lineHeight: 1.5 }}>{p.desc}</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {p.tech?.map(t => <span key={t} style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '6px', background: isDark ? 'rgba(6,182,212,0.1)' : '#cffafe', color: '#06b6d4', fontWeight: 700 }}>{t}</span>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 6. Experience */}
                {hasExperience && (
                    <div className="dash-card dash-experience">
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={18} color="#f43f5e" /> Professional Vector</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {profile.experience.slice(0, 3).map((e, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1.2rem', padding: '1.2rem', borderRadius: '16px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}` }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: isDark ? 'rgba(244,63,94,0.1)' : '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Briefcase size={20} color="#f43f5e" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '2px' }}>{e.role}</div>
                                        <div style={{ fontSize: '0.9rem', color: isDark ? 'rgba(255,255,255,0.7)' : '#334155', fontWeight: 600, marginBottom: '6px' }}>{e.company}</div>
                                        <div style={{ fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>{e.duration}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Connect modal string handling omitted for brevity, same structure */}
            {connectModalOpen && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ width: 450, background: isDark ? '#1e293b' : '#fff', padding: '2rem', borderRadius: '24px' }}>
                        <h3 style={{ margin: '0 0 1rem 0' }}>Connect Request</h3>
                        <textarea style={{ width: '100%', height: 120, padding: 12, borderRadius: 12, background: isDark ? 'rgba(0,0,0,0.2)' : '#f1f5f9', color: isDark ? '#fff' : '#000', border: '1px solid gray' }} value={connectMessage} onChange={e => setConnectMessage(e.target.value)} />
                        <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
                            <button onClick={() => setConnectModalOpen(false)} style={{ flex: 1, padding: 12, borderRadius: 12, background: 'transparent', color: isDark ? '#fff' : '#000', border: '1px solid gray' }}>Cancel</button>
                            <button onClick={sendConnectRequest} style={{ flex: 1, padding: 12, borderRadius: 12, background: T.gradient, color: '#fff', border: 'none' }}>Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
