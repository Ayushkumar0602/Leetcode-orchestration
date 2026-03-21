import React, { useState } from 'react';
import { User, Code2, Brain, Trophy, Briefcase, ExternalLink, Calendar, ChevronRight, X as XIcon, Send as SendIcon, Loader2, MapPin, Mail, Github, Linkedin } from 'lucide-react';

export default function SplitScreenTheme({ profile, stats, recentInv, badges, validInvCount, avg, hasProjects, hasExperience, hasEducation, T, navigate, uid, primaryCta, connectModalOpen, setConnectModalOpen, connectMessage, setConnectMessage, connectBusy, sendConnectRequest, isDark }) {
    const [activeTab, setActiveTab] = useState('projects');
    
    // Extracted dynamic css for SplitScreen
    const sCSS = `
    .split-wrapper { display: flex; width: 100vw; min-height: 100vh; background: ${isDark ? '#04050a' : '#f8fafc'}; color: ${isDark ? '#fff' : '#0f172a'}; overflow: hidden; }
    .split-left { width: 400px; padding: 3rem 2.5rem; background: ${isDark ? '#0a0c14' : '#ffffff'}; border-right: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)'}; display: flex; flex-direction: column; overflow-y: auto; z-index: 10; scrollbar-width: none; }
    .split-right { flex: 1; padding: 2.5rem 4rem; overflow-y: auto; background: ${isDark ? 'radial-gradient(circle at top right, rgba(168,85,247,0.1) 0, transparent 40%), #04050a' : 'radial-gradient(circle at top right, rgba(168,85,247,0.05) 0, transparent 40%), #f8fafc'}; }
    .split-nav { margin-top: 3rem; display: flex; flex-direction: column; gap: 8px; flex: 1; }
    .split-nav-btn { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-radius: 12px; cursor: pointer; transition: all 0.3s; font-weight: 700; border: 1px solid transparent; background: transparent; color: ${isDark ? 'rgba(255,255,255,0.5)' : '#64748b'}; font-size: 0.95rem; }
    .split-nav-btn.active { background: ${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}; color: ${isDark ? '#fff' : '#0f172a'}; border-color: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)'}; transform: translateX(8px); }
    .split-nav-btn:hover:not(.active) { color: ${isDark ? '#fff' : '#0f172a'}; background: ${isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'}; }
    .split-content { animation: splitSlideIn 0.4s ease-out both; }
    @keyframes splitSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 1024px) {
        .split-wrapper { flex-direction: column; overflow-y: auto; }
        .split-left { width: 100%; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 2rem 1.5rem; height: auto; }
        .split-right { padding: 2rem 1.5rem; }
        .split-nav { flex-direction: row; overflow-x: auto; padding-bottom: 1rem; margin-top: 2rem; }
        .split-nav-btn.active { transform: translateY(-4px); }
    }
    `;

    return (
        <div className="split-wrapper">
            <style>{sCSS}</style>
            
            {/* LEFT STATICS */}
            <div className="split-left">
                <button onClick={() => navigate('/')} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: T.accent, fontWeight: 700, cursor: 'pointer', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={14} color="#fff" /></div>
                    Whizan Portfolio
                </button>
                
                <div style={{ width: 120, height: 120, borderRadius: '24px', overflow: 'hidden', border: `2px solid ${T.accent}`, marginBottom: '1.5rem' }}>
                    {profile.photoURL ? <img src={profile.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{width:'100%', height:'100%', background:isDark?'#1f2937':'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center'}}><User size={40} color={isDark?"#4b5563":"#94a3b8"}/></div>}
                </div>
                
                <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>{profile.displayName || 'Developer'}</h1>
                <h2 style={{ fontSize: '1rem', color: T.accent, fontWeight: 600, marginBottom: '1.5rem' }}>{profile.currentRole || profile.role || 'Software Engineer'}</h2>
                
                <p style={{ fontSize: '0.9rem', color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', lineHeight: 1.6, marginBottom: '2rem' }}>
                    {profile.bio || 'Passionate developer building scalable systems and mastering technical interviews.'}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '2rem' }}>
                    {profile.location && <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}><MapPin size={12} /> {profile.location}</span>}
                    {primaryCta && (
                        <button onClick={primaryCta.action} disabled={primaryCta.disabled} style={{ background: T.gradient, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: primaryCta.disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <primaryCta.icon size={14} /> {primaryCta.label}
                        </button>
                    )}
                </div>

                <div className="split-nav">
                    {[
                        { id: 'projects', label: 'Projects', icon: Code2, show: hasProjects },
                        { id: 'experience', label: 'Experience', icon: Briefcase, show: hasExperience || hasEducation },
                        { id: 'skills', label: 'Technical Skills', icon: Brain, show: (profile.skills || []).length > 0 },
                        { id: 'stats', label: 'Performance Stats', icon: Trophy, show: profile.preferences?.showStats !== false }
                    ].filter(t => t.show).map(tab => (
                        <button key={tab.id} className={`split-nav-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <tab.icon size={16} color={activeTab === tab.id ? T.accent : (isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8')} />
                                {tab.label}
                            </div>
                            <ChevronRight size={14} opacity={activeTab === tab.id ? 1 : 0} />
                        </button>
                    ))}
                </div>
                
                <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', gap: '12px' }}>
                    {profile.github && <a href={`https://github.com/${profile.github}`} target="_blank" rel="noreferrer" style={{ color: isDark ? '#fff' : '#0f172a' }}><Github size={20} /></a>}
                    {profile.linkedin && <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noreferrer" style={{ color: isDark ? '#fff' : '#0f172a' }}><Linkedin size={20} /></a>}
                </div>
            </div>

            {/* RIGHT DYNAMIC CONTENT */}
            <div className="split-right">
                {activeTab === 'projects' && hasProjects && (
                    <div className="split-content" key="proj">
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem' }}>Selected Projects</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {profile.projects.map((p, i) => (
                                <div key={i} style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`, borderRadius: '20px', padding: '2rem', transition: 'transform 0.2s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>{p.name}</h3>
                                            <p style={{ color: T.accent, fontWeight: 600, fontSize: '0.9rem' }}>{p.tagline}</p>
                                        </div>
                                        {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ color: isDark ? '#fff' : '#0f172a' }}><ExternalLink size={18} /></a>}
                                    </div>
                                    <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#475569', lineHeight: 1.7, marginBottom: '1.5rem' }}>{p.desc}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {(p.tech || p.technologies || []).map(t => (
                                            <span key={t} style={{ fontSize: '0.75rem', background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>{t}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'experience' && (hasExperience || hasEducation) && (
                    <div className="split-content" key="exp">
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem' }}>Journey</h2>
                        {hasExperience && (
                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ fontSize: '1.2rem', color: T.accent, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={18} /> Experience</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', borderLeft: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, paddingLeft: '1.5rem', marginLeft: '10px' }}>
                                    {profile.experience.map((e, i) => (
                                        <div key={i} style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', width: 12, height: 12, borderRadius: '50%', background: T.accent, left: '-1.89rem', top: '6px' }} />
                                            <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{e.role}</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem', marginTop: '4px' }}>
                                                <span style={{ fontWeight: 600 }}>{e.company}</span> • <span>{e.duration}</span>
                                            </div>
                                            {e.desc && <p style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#334155', lineHeight: 1.6, fontSize: '0.9rem' }}>{e.desc}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'skills' && (profile.skills && profile.skills.length > 0) && (
                    <div className="split-content" key="skills">
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem' }}>Technical Arsenal</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {profile.skills.map(s => (
                                <div key={s} style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, padding: '12px 20px', borderRadius: '12px', fontSize: '1rem', fontWeight: 600 }}>
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="split-content" key="stats">
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem' }}>Performance Metrics</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div style={{ background: isDark ? 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))' : '#fff', borderRadius: '20px', padding: '2rem', border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                                <Code2 size={24} color={T.accent} style={{ marginBottom: '1rem' }} />
                                <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1 }}>{stats?.Total || 0}</div>
                                <div style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b', fontWeight: 600 }}>Problems Solved</div>
                            </div>
                            <div style={{ background: isDark ? 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))' : '#fff', borderRadius: '20px', padding: '2rem', border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                                <Brain size={24} color="#3b82f6" style={{ marginBottom: '1rem' }} />
                                <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1 }}>{validInvCount}</div>
                                <div style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b', fontWeight: 600 }}>Mock Interviews</div>
                            </div>
                            <div style={{ background: isDark ? 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))' : '#fff', borderRadius: '20px', padding: '2rem', border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                                <Trophy size={24} color="#eab308" style={{ marginBottom: '1rem' }} />
                                <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1 }}>{avg ? `${avg}%` : 'N/A'}</div>
                                <div style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b', fontWeight: 600 }}>Average Score</div>
                            </div>
                        </div>

                        {recentInv && recentInv.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: '1.2rem', color: T.accent, marginBottom: '1.5rem' }}>Recent Interviews</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {recentInv.map((inv, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.5rem', background: isDark ? 'rgba(255,255,255,0.03)' : '#fff', borderRadius: '16px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{inv.problemTitle || 'Mock Interview'}</div>
                                                <div style={{ fontSize: '0.8rem', color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} /> {new Date(inv.createdAt?.toDate ? inv.createdAt.toDate() : inv.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: inv.overallScore >= 80 ? '#10b981' : inv.overallScore >= 60 ? '#f59e0b' : '#ef4444' }}>
                                                {inv.overallScore}/100
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Connect Modal */}
            {connectModalOpen && primaryCta && (
                <div className="pp-modal-backdrop" onClick={() => !connectBusy && setConnectModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="pp-modal" onClick={e => e.stopPropagation()} style={{ width: 'min(440px, 90vw)', background: isDark ? '#111827' : '#fff', borderRadius: '24px', overflow: 'hidden', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontWeight: 800, margin: 0, color: isDark ? '#fff' : '#0f172a' }}>Connect with {profile.displayName || 'Developer'}</h3>
                            <XIcon size={20} cursor="pointer" onClick={() => setConnectModalOpen(false)} color={isDark ? 'rgba(255,255,255,0.5)' : '#64748b'} />
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <p style={{ fontSize: '0.85rem', color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', marginBottom: '1rem' }}>Add a short message to introduce yourself.</p>
                            <textarea value={connectMessage} onChange={e => setConnectMessage(e.target.value)} disabled={connectBusy} placeholder="Hi! I saw your portfolio and..." style={{ width: '100%', minHeight: '100px', padding: '1rem', borderRadius: '12px', background: isDark ? 'rgba(0,0,0,0.3)' : '#f8fafc', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, color: isDark ? '#fff' : '#0f172a', resize: 'vertical' }} />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                                <button onClick={() => setConnectModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`, color: isDark ? '#fff' : '#0f172a', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={sendConnectRequest} disabled={connectBusy} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: T.gradient, border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                    {connectBusy ? <Loader2 size={16} className="spin" /> : <><SendIcon size={16} /> Send</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
