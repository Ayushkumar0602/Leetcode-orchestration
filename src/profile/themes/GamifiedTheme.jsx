import React from 'react';
import { User, Code2, Brain, Trophy, Shield, Crosshair, Star, Target, Zap, Swords } from 'lucide-react';

export default function GamifiedTheme({ profile, stats, validInvCount, badges, avg, hasProjects, hasExperience, T, primaryCta, connectModalOpen, setConnectModalOpen, connectMessage, setConnectMessage, connectBusy, sendConnectRequest, isDark }) {
    
    // Level calculation based on stats + interviews
    const totalXP = (stats?.Total || 0) * 10 + validInvCount * 100 + (badges?.filter(b=>b.unlocked).length * 50);
    const level = Math.max(1, Math.floor(totalXP / 500));
    const nextLevelXP = (level + 1) * 500;
    const progress = Math.min(100, Math.round((totalXP / nextLevelXP) * 100));

    const gCSS = `
    .game-wrap { width: 100vw; min-height: 100vh; background: #0f172a; color: #f8fafc; font-family: 'Courier New', 'Inter', monospace; overflow-x: hidden; padding: 2rem; position: relative; }
    .game-scanlines { position: fixed; inset: 0; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 2px, 3px 100%; pointer-events: none; z-index: 999; }
    
    .game-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 350px 1fr; gap: 2rem; position: relative; z-index: 10; }
    
    .game-panel { background: rgba(15, 23, 42, 0.85); border: 2px solid #3b82f6; border-radius: 8px; box-shadow: 0 0 20px rgba(59, 130, 246, 0.2), inset 0 0 20px rgba(59, 130, 246, 0.1); padding: 1.5rem; position: relative; }
    .game-panel::before { content: ''; position: absolute; top: -2px; left: -2px; width: 10px; height: 10px; border-top: 2px solid #60a5fa; border-left: 2px solid #60a5fa; }
    .game-panel::after { content: ''; position: absolute; bottom: -2px; right: -2px; width: 10px; height: 10px; border-bottom: 2px solid #60a5fa; border-right: 2px solid #60a5fa; }
    
    .game-title { font-size: 1.2rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: #60a5fa; margin-bottom: 1.5rem; display: flex; alignItems: center; gap: 10px; border-bottom: 1px dashed #3b82f6; padding-bottom: 10px; }
    
    .game-avatar-box { width: 100%; aspect-ratio: 1; border: 2px solid #10b981; border-radius: 8px; margin-bottom: 1.5rem; position: relative; overflow: hidden; display: flex; alignItems: center; justifyContent: center; background: #020617; box-shadow: 0 0 30px rgba(16, 185, 129, 0.2); }
    .game-avatar-box img { width: 100%; height: 100%; object-fit: cover; filter: contrast(1.1) saturate(1.2); }
    
    .game-xp-bar { width: 100%; height: 20px; background: #1e293b; border: 1px solid #3b82f6; margin-top: 5px; position: relative; overflow: hidden; }
    .game-xp-fill { height: 100%; background: #3b82f6; box-shadow: 0 0 10px #3b82f6; width: ${progress}%; transition: width 1s; }
    
    .game-stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed rgba(59, 130, 246, 0.3); font-size: 0.9rem; text-transform: uppercase; font-weight: 700; }
    .game-stat-val { color: #f59e0b; text-shadow: 0 0 5px rgba(245, 158, 11, 0.5); font-size: 1.1rem; }
    
    .game-btn { width: 100%; background: transparent; border: 2px solid #f43f5e; color: #f43f5e; padding: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; box-shadow: inset 0 0 10px rgba(244, 63, 94, 0.2); margin-top: 1rem; }
    .game-btn:hover { background: #f43f5e; color: #fff; box-shadow: 0 0 20px rgba(244, 63, 94, 0.6); }

    .game-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
    .game-card { background: rgba(2, 6, 23, 0.8); border: 1px solid #10b981; padding: 1.5rem; border-radius: 4px; box-shadow: 0 0 15px rgba(16, 185, 129, 0.1); transition: transform 0.2s; }
    .game-card:hover { transform: scale(1.02); border-color: #34d399; box-shadow: 0 0 20px rgba(52, 211, 153, 0.3); }

    .game-skill-badge { display: inline-flex; alignItems: center; gap: 4px; padding: 4px 10px; background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; color: #f59e0b; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; margin: 4px; }
    
    @media (max-width: 900px) {
        .game-container { grid-template-columns: 1fr; }
        .game-avatar-box { max-width: 300px; margin: 0 auto 1.5rem; }
    }
    `;

    return (
        <div className="game-wrap">
            <style>{gCSS}</style>
            <div className="game-scanlines" />
            
            <div className="game-container">
                {/* Left Panel: Character Sheet */}
                <div className="game-panel">
                    <h2 className="game-title"><Shield size={18} /> Player Profile</h2>
                    
                    <div className="game-avatar-box">
                        {profile.photoURL ? <img src={profile.photoURL} alt="Avatar" /> : <User size={80} color="#10b981" />}
                        <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(2,6,23,0.9)', padding: '5px', textAlign: 'center', fontWeight: 900, color: '#10b981', borderTop: '2px solid #10b981' }}>
                            LVL {level} {profile.currentRole || 'ENGINEER'}
                        </div>
                    </div>

                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, textAlign: 'center', margin: '0 0 5px 0', color: '#fff', textTransform: 'uppercase' }}>{profile.displayName || 'Player 1'}</h1>
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>"{profile.bio || 'Ready for the next quest.'}"</div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa' }}>
                            <span>XP: {totalXP}</span>
                            <span>NEXT: {nextLevelXP}</span>
                        </div>
                        <div className="game-xp-bar"><div className="game-xp-fill" /></div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div className="game-stat-row">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Swords size={14} color="#f59e0b" /> Quests (Problems)</span>
                            <span className="game-stat-val">{stats?.Total || 0}</span>
                        </div>
                        <div className="game-stat-row">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Crosshair size={14} color="#f59e0b" /> Boss Fights (Interviews)</span>
                            <span className="game-stat-val">{validInvCount}</span>
                        </div>
                        <div className="game-stat-row">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={14} color="#f59e0b" /> Accuracy (Avg Score)</span>
                            <span className="game-stat-val">{avg ? `${avg}%` : '0%'}</span>
                        </div>
                        <div className="game-stat-row">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Trophy size={14} color="#f59e0b" /> Achievements</span>
                            <span className="game-stat-val">{badges.filter(b => b.unlocked).length}</span>
                        </div>
                    </div>

                    {primaryCta && (
                        <button className="game-btn" onClick={primaryCta.action} disabled={primaryCta.disabled}>
                            Initiate Co-Op
                        </button>
                    )}
                </div>

                {/* Right Panel: Inventory & Quests */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Inventory (Skills) */}
                    <div className="game-panel" style={{ borderColor: '#f59e0b' }}>
                        <h2 className="game-title" style={{ color: '#fcd34d', borderColor: '#f59e0b' }}><Zap size={18} /> Inventory / Skills</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {profile.skills?.map(s => <div key={s} className="game-skill-badge">{s}</div>)}
                            {(!profile.skills || profile.skills.length === 0) && <div style={{ color: '#94a3b8' }}>Inventory empty.</div>}
                        </div>
                    </div>

                    {/* Quest Log (Projects) */}
                    {hasProjects && (
                        <div className="game-panel" style={{ borderColor: '#10b981' }}>
                            <h2 className="game-title" style={{ color: '#34d399', borderColor: '#10b981' }}><Code2 size={18} /> Completed Quests (Projects)</h2>
                            <div className="game-grid">
                                {profile.projects.map((p, i) => (
                                    <div key={i} className="game-card">
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#34d399', margin: '0 0 10px 0', textTransform: 'uppercase' }}>{p.name}</h3>
                                        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1rem' }}>{p.desc}</p>
                                        <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>REWARDS: EXPOSURE & EXP</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Faction History (Experience) */}
                    {hasExperience && (
                        <div className="game-panel" style={{ borderColor: '#f43f5e' }}>
                            <h2 className="game-title" style={{ color: '#fb7185', borderColor: '#f43f5e' }}><Target size={18} /> Faction History (Experience)</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {profile.experience.map((e, i) => (
                                    <div key={i} style={{ borderLeft: '4px solid #f43f5e', paddingLeft: '1rem' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fb7185', textTransform: 'uppercase' }}>{e.role} @ {e.company}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 700, margin: '4px 0 8px 0' }}>TIME ALIVE: {e.duration}</div>
                                        {e.desc && <div style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.5 }}>{e.desc}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {connectModalOpen && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ width: 450, background: '#020617', padding: '2rem', border: '2px solid #f43f5e', boxShadow: '0 0 30px rgba(244,63,94,0.3)' }}>
                        <h3 style={{ margin: '0 0 1rem 0', color: '#f43f5e', textTransform: 'uppercase' }}>Send Transmission</h3>
                        <textarea style={{ width: '100%', height: 120, padding: 12, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #f43f5e', fontFamily: 'monospace' }} value={connectMessage} onChange={e => setConnectMessage(e.target.value)} />
                        <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
                            <button onClick={() => setConnectModalOpen(false)} style={{ flex: 1, padding: 12, background: 'transparent', color: '#f43f5e', border: '1px solid #f43f5e', textTransform: 'uppercase', fontWeight: 900 }}>Abort</button>
                            <button onClick={sendConnectRequest} style={{ flex: 1, padding: 12, background: '#f43f5e', color: '#fff', border: 'none', textTransform: 'uppercase', fontWeight: 900 }}>Transmit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
