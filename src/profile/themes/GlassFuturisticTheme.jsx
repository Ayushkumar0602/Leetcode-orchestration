import React from 'react';
import { User, Code2, Brain, Trophy, MapPin, Mail, MonitorPlay, Zap } from 'lucide-react';

export default function GlassFuturisticTheme({ profile, stats, validInvCount, badges, avg, hasProjects, hasExperience, T, primaryCta, connectModalOpen, setConnectModalOpen, connectMessage, setConnectMessage, connectBusy, sendConnectRequest, isDark }) {
    
    // Always force dark UI styling semantics for "Futuristic Glass"
    const bgColors = isDark 
        ? 'radial-gradient(circle at 10% 20%, rgba(168,85,247,0.15), transparent 40%), radial-gradient(circle at 90% 80%, rgba(59,130,246,0.15), transparent 40%), #020617' 
        : 'radial-gradient(circle at 10% 20%, rgba(168,85,247,0.1), transparent 40%), radial-gradient(circle at 90% 80%, rgba(59,130,246,0.1), transparent 40%), #f8fafc';
    
    const glassClass = `
    .gf-wrap { width: 100vw; min-height: 100vh; background: ${bgColors}; color: ${isDark ? '#e2e8f0' : '#0f172a'}; font-family: 'Space Grotesk', 'Inter', sans-serif; overflow-x: hidden; position: relative; }
    .gf-grid { max-width: 1200px; margin: 4rem auto; padding: 0 2rem; display: flex; flex-direction: column; gap: 3rem; position: relative; z-index: 10; }
    
    .gf-glass { 
        background: ${isDark ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.4)'}; 
        backdrop-filter: blur(24px); 
        -webkit-backdrop-filter: blur(24px); 
        border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}; 
        border-radius: 32px; 
        padding: 3rem; 
        box-shadow: ${isDark ? '0 30px 60px rgba(0,0,0,0.4)' : '0 30px 60px rgba(0,0,0,0.05)'}; 
        position: relative;
        overflow: hidden;
    }
    .gf-glass::before {
        content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%); pointer-events: none;
    }
    
    .gf-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5; z-index: 0; }
    
    .gf-stat { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; background: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}; border-radius: 24px; border: 1px inset ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; }
    .gf-text { font-size: 1.1rem; line-height: 1.8; color: ${isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'}; }
    .gf-head { font-size: 3.5rem; font-weight: 900; letter-spacing: -0.05em; margin-bottom: 0.5rem; background: ${T.gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    
    .gf-proj-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .gf-proj-card { background: ${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.6)'}; padding: 2rem; border-radius: 24px; border: 1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}; transition: all 0.3s; }
    .gf-proj-card:hover { transform: translateY(-5px); border-color: ${T.accent}; background: ${isDark ? 'rgba(0,0,0,0.4)' : '#fff'}; }
    
    @media (max-width: 768px) {
        .gf-grid { margin: 2rem auto; padding: 0 1rem; }
        .gf-glass { padding: 2rem 1.5rem; border-radius: 24px; }
        .gf-head { font-size: 2.5rem; }
    }
    `;

    return (
        <div className="gf-wrap">
            <style>{glassClass}</style>
            
            <div className="gf-orb" style={{ top: '10%', left: '20%', width: 400, height: 400, background: T.accent }} />
            <div className="gf-orb" style={{ bottom: '20%', right: '10%', width: 500, height: 500, background: '#3b82f6' }} />

            <div className="gf-grid">
                
                {/* Hero section */}
                <div className="gf-glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: 140, height: 140, borderRadius: '50%', background: isDark ? '#0f172a' : '#fff', padding: 8, marginBottom: '2rem', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, boxShadow: `0 0 40px ${T.accent}40` }}>
                        {profile.photoURL ? <img src={profile.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <User size={60} color={T.accent} style={{ margin: 30 }}/>}
                    </div>
                    <div style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 700, color: T.accent, marginBottom: '0.5rem' }}>System Online</div>
                    <h1 className="gf-head">{profile.displayName || 'Developer'}</h1>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', marginBottom: '2rem' }}>{profile.currentRole || profile.role || 'Software Engineer'}</h2>
                    <p className="gf-text" style={{ maxWidth: 700, margin: '0 auto 2.5rem' }}>{profile.bio || 'Architecting highly scalable resilient systems using AI-powered development flows.'}</p>
                    
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {primaryCta && (
                            <button onClick={primaryCta.action} disabled={primaryCta.disabled} style={{ background: T.gradient, color: '#fff', border: 'none', padding: '16px 36px', borderRadius: '20px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: `0 10px 30px ${T.accent}50` }}>
                                <primaryCta.icon size={20} /> {primaryCta.label}
                            </button>
                        )}
                        {profile.location && <span style={{ padding: '16px 24px', borderRadius: '20px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}><MapPin size={18} /> {profile.location}</span>}
                    </div>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div className="gf-glass gf-stat">
                        <Code2 size={32} color={T.accent} style={{ marginBottom: '1rem' }} />
                        <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>{stats?.Total || 0}</div>
                        <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, fontWeight: 700 }}>Algorithms</div>
                    </div>
                    <div className="gf-glass gf-stat">
                        <Brain size={32} color="#3b82f6" style={{ marginBottom: '1rem' }} />
                        <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>{validInvCount}</div>
                        <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, fontWeight: 700 }}>AI Sessions</div>
                    </div>
                    <div className="gf-glass gf-stat">
                        <Trophy size={32} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                        <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>{avg ? `${avg}%` : 'N/A'}</div>
                        <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, fontWeight: 700 }}>Avg Score</div>
                    </div>
                </div>

                {/* Technical Arsenal */}
                {profile.skills?.length > 0 && (
                    <div className="gf-glass">
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}><Zap size={24} color={T.accent} /> Core Stack</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {profile.skills.map(s => (
                                <span key={s} style={{ padding: '12px 24px', borderRadius: '16px', background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, fontSize: '1.05rem', fontWeight: 600 }}>{s}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {hasProjects && (
                    <div className="gf-glass">
                        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}><MonitorPlay size={24} color="#3b82f6" /> Modules & Systems</h3>
                        <div className="gf-proj-grid">
                            {profile.projects.map((p, i) => (
                                <div key={i} className="gf-proj-card">
                                    <h4 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>{p.name}</h4>
                                    {p.tagline && <div style={{ fontSize: '0.9rem', color: T.accent, fontWeight: 700, marginBottom: '1rem' }}>{p.tagline}</div>}
                                    <p className="gf-text" style={{ fontSize: '0.95rem', marginBottom: '1.5rem' }}>{p.desc}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {p.tech?.slice(0, 4).map(t => <span key={t} style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>{t}</span>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Modal hidden for brevity, imagine it's here */}
            {connectModalOpen && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter: 'blur(10px)' }}>
                    <div className="gf-glass" style={{ width: '90%', maxWidth: 500, padding: '2rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0' }}>Connect Request</h3>
                        <textarea style={{ width: '100%', height: 120, padding: 16, borderRadius: 16, background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)', color: isDark ? '#fff' : '#000', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }} value={connectMessage} onChange={e => setConnectMessage(e.target.value)} />
                        <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
                            <button onClick={() => setConnectModalOpen(false)} style={{ flex: 1, padding: 14, borderRadius: 16, background: 'transparent', color: isDark ? '#fff' : '#000', border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}` }}>Cancel</button>
                            <button onClick={sendConnectRequest} style={{ flex: 1, padding: 14, borderRadius: 16, background: T.gradient, color: '#fff', border: 'none', fontWeight: 800 }}>Send Transmission</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
