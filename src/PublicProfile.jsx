import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, Github, Linkedin, Globe, Code2, Brain, Award, TrendingUp, Star, Flame, Zap, Trophy,
    Briefcase, GraduationCap, Calendar, FileText, ExternalLink, CheckCircle, ChevronRight, MapPin, Mail
} from 'lucide-react';

// ── Devicon ──────────────────────────────────────────────────────
const DEVICON_MAP = { react: 'react', javascript: 'javascript', typescript: 'typescript', python: 'python', nodejs: 'nodejs', 'node.js': 'nodejs', java: 'java', cpp: 'cplusplus', 'c++': 'cplusplus', c: 'c', go: 'go', rust: 'rust', swift: 'swift', kotlin: 'kotlin', dart: 'dart', flutter: 'flutter', html: 'html5', css: 'css3', sass: 'sass', tailwind: 'tailwindcss', mongodb: 'mongodb', postgres: 'postgresql', postgresql: 'postgresql', mysql: 'mysql', redis: 'redis', firebase: 'firebase', docker: 'docker', kubernetes: 'kubernetes', git: 'git', github: 'github', linux: 'linux', aws: 'amazonwebservices', gcp: 'googlecloud', azure: 'azure', graphql: 'graphql', nextjs: 'nextjs', 'next.js': 'nextjs', vuejs: 'vuejs', 'vue.js': 'vuejs', angular: 'angularjs', django: 'django', flask: 'flask', express: 'express', figma: 'figma', redux: 'redux', vite: 'vite' };
const devIcon = s => { const n = DEVICON_MAP[s.toLowerCase().replace(/\s/g, '')]; return n ? `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${n}/${n}-original.svg` : null; };

// ── Theme Configs ────────────────────────────────────────────────
const THEME_MAP = {
    'Purple': { accent: '#a855f7', hex2: '#6d28d9', rgb: '168,85,247', heroGrad: 'linear-gradient(135deg,#a855f7,#3b82f6)' },
    'Blue': { accent: '#3b82f6', hex2: '#1d4ed8', rgb: '59,130,246', heroGrad: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
    'Emerald': { accent: '#10b981', hex2: '#065f46', rgb: '16,185,129', heroGrad: 'linear-gradient(135deg,#10b981,#065f46)' },
    'Amber': { accent: '#f59e0b', hex2: '#b45309', rgb: '245,158,11', heroGrad: 'linear-gradient(135deg,#f59e0b,#b45309)' },
    'Rose': { accent: '#f43f5e', hex2: '#be123c', rgb: '244,63,94', heroGrad: 'linear-gradient(135deg,#f43f5e,#be123c)' },
    'Cyan': { accent: '#06b6d4', hex2: '#0e7490', rgb: '6,182,212', heroGrad: 'linear-gradient(135deg,#06b6d4,#0e7490)' },
};
const LAYOUT_MAP = { 'Compact': '900px', 'Comfortable': '1100px', 'Wide': '1350px' };

// ── Sub-components ────────────────────────────────────────────────
function SectionHead({ icon: Icon, color, title, count }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--divide)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: `${color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={17} color={color} /></div>
            <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--txt1)' }}>{title}</span>
            {count !== undefined && <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--txt3)', background: 'var(--pill-bg)', padding: '3px 10px', borderRadius: '999px' }}>{count}</span>}
        </div>
    );
}

function CircleProgress({ value, max, color, size = 72, sw = 6, label }) {
    const r = (size - sw * 2) / 2, c = 2 * Math.PI * r, p = max > 0 ? Math.min(value / max, 1) : 0;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--divide)" strokeWidth={sw} />
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={`${p * c} ${c}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.16,1,0.3,1)' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--txt1)' }}>{value}</span></div>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color, textAlign: 'center' }}>{label}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--txt3)' }}>/ {max}</div>
        </div>
    );
}

function Badge({ icon: Icon, label, desc, color, unlocked }) {
    return (
        <div className={`badge-card ${unlocked ? 'unlocked' : ''}`} style={{ opacity: unlocked ? 1 : 0.35, filter: unlocked ? 'none' : 'grayscale(0.5)', border: `1px solid ${unlocked ? color + '40' : 'var(--divide)'}`, background: unlocked ? `${color}1A` : 'var(--card-bg)' }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: unlocked ? `radial-gradient(circle,${color}28,${color}08)` : 'var(--divide)', border: `1px solid ${unlocked ? color + '35' : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: unlocked ? `0 0 20px ${color}28` : 'none' }}>
                <Icon size={22} color={unlocked ? color : 'var(--txt3)'} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: unlocked ? 'var(--txt1)' : 'var(--txt3)', lineHeight: 1.3 }}>{label}</div>
            {desc && <div style={{ fontSize: '0.62rem', color: 'var(--txt3)', lineHeight: 1.4 }}>{desc}</div>}
        </div>
    );
}

// ── Main ─────────────────────────────────────────────────────────
export default function PublicProfile() {
    const { uid } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!uid) return;
        Promise.all([
            fetch(`http://localhost:3001/api/stats/user/${uid}`).then(r => r.json()),
            fetch(`http://localhost:3001/api/interviews/${uid}`).then(r => r.json()),
            fetch(`http://localhost:3001/api/profile/${uid}`).then(r => r.json()),
        ]).then(([stats, inv, prof]) => {
            const validInv = (inv.interviews || []).filter(i => i.overallScore || i.scoreReport);
            const scored = validInv.filter(i => i.overallScore > 0);
            const avg = scored.length ? Math.round(scored.reduce((s, i) => s + i.overallScore, 0) / scored.length) : 0;
            const recentInv = validInv.slice(0, 5);
            setData({ stats: stats.userStats || {}, totalCounts: stats.totalCounts || {}, validInvCount: validInv.length, avg, recentInv, profile: prof.profile || {} });
        }).catch(() => setError(true)).finally(() => setLoading(false));
    }, [uid]);

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#04050a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', fontFamily: 'Inter,sans-serif' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(168,85,247,0.3)', borderTopColor: '#a855f7', animation: 'spin 0.8s linear infinite' }} />
            <style>{'@keyframes spin{to{transform:rotate(360deg);}}'}</style>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Loading portfolio…</span>
        </div>
    );

    if (error || !data || data.profile.preferences?.isPublic === false) return (
        <div style={{ minHeight: '100vh', background: '#04050a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', fontFamily: 'Inter,sans-serif', color: '#fff' }}>
            <div style={{ fontSize: '3rem' }}>404</div>
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>Profile not found or is currently marked private.</div>
            <button onClick={() => navigate('/')} style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)', border: 'none', borderRadius: '12px', padding: '10px 24px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>← Go Home</button>
        </div>
    );

    const { stats, totalCounts, validInvCount, avg, recentInv, profile } = data;

    // Extract preferences
    const prefs = profile.preferences || { theme: 'Purple', layout: 'Comfortable', darkMode: true, isPublic: true, showInterviews: true, showStats: true, showBadges: true };
    const T = THEME_MAP[prefs.theme] || THEME_MAP['Purple'];
    const maxW = LAYOUT_MAP[prefs.layout] || LAYOUT_MAP['Comfortable'];
    const isDark = prefs.darkMode !== false;

    // Build Dynamic CSS
    const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    
    :root {
        --bg: ${isDark ? '#04050a' : '#f4f4f5'};
        --txt1: ${isDark ? '#ffffff' : '#0f172a'};
        --txt2: ${isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.7)'};
        --txt3: ${isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.45)'};
        
        --glass-bg: ${isDark ? 'rgba(16,18,26,0.7)' : 'rgba(255,255,255,0.85)'};
        --glass-border: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'};
        
        --card-bg: ${isDark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.6)'};
        --card-border: ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.06)'};
        --card-hover-bg: ${isDark ? 'rgba(255,255,255,0.05)' : '#ffffff'};
        --card-hover-border: ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.12)'};
        --card-shadow: ${isDark ? '0 16px 40px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.06)'};
        
        --pill-bg: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)'};
        --pill-border: ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.08)'};
        --pill-hover-bg: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'};
        --pill-hover-border: ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.14)'};

        --divide: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'};
        --nav-bg: ${isDark ? 'rgba(4,5,10,0.85)' : 'rgba(244,244,245,0.85)'};

        --accent: ${T.accent};
        --accent-rgb: ${T.rgb};
        --hero-grad: ${T.heroGrad};
    }

    .pub{font-family:'Inter',system-ui,sans-serif;background:var(--bg);min-height:100vh;color:var(--txt1);transition:background 0.3s, color 0.3s;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
    @keyframes scaleIn{from{opacity:0;transform:scale(0.88);}to{opacity:1;transform:scale(1);}}
    @keyframes glow{0%,100%{box-shadow:0 0 30px rgba(var(--accent-rgb),0.3);}50%{box-shadow:0 0 60px rgba(var(--accent-rgb),0.55);}}
    
    .glass{background:var(--glass-bg);backdrop-filter:blur(20px);border:1px solid var(--glass-border);border-radius:22px;}
    .skill-pill{display:inline-flex;align-items:center;gap:6px;background:var(--pill-bg);border:1px solid var(--pill-border);border-radius:10px;padding:6px 12px;font-size:0.78rem;font-weight:500;color:var(--txt1);transition:all 0.25s;}
    .skill-pill:hover{background:var(--pill-hover-bg);border-color:var(--pill-hover-border);transform:translateY(-2px);}
    .cert-pill{display:inline-flex;align-items:center;gap:6px;background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.3);border-radius:10px;padding:6px 12px;font-size:0.78rem;font-weight:600;color: ${isDark ? '#fbbf24' : '#d97706'};}
    .proj-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:16px;padding:1.25rem;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);}
    .proj-card:hover{background:var(--card-hover-bg);border-color:var(--card-hover-border);transform:translateY(-4px);box-shadow:var(--card-shadow);}
    .badge-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:16px;padding:1.1rem;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;transition:all 0.3s;}
    .badge-card.unlocked:hover{transform:translateY(-3px);}
    .stat-card{background:var(--glass-bg);backdrop-filter:blur(20px);border:1px solid var(--glass-border);border-radius:18px;padding:1.2rem;display:flex;flex-direction:column;gap:4px;transition:all 0.25s;}
    .stat-card:hover{transform:translateY(-3px);border-color:var(--pill-hover-border);box-shadow:var(--card-shadow);}
    .slink{display:inline-flex;align-items:center;gap:6px;border-radius:10px;padding:8px 16px;font-size:0.82rem;font-weight:600;text-decoration:none;transition:all 0.2s;}
    
    /* Responsive */
    @media(max-width:1024px){.pub-main-grid{grid-template-columns:1fr !important;}}
    @media(max-width:640px){.pub-stats{grid-template-columns:repeat(2,1fr) !important;} .pub-badges{grid-template-columns:repeat(2,1fr) !important;} .pub-projs{grid-template-columns:1fr !important;}}
    `;

    const badges = [
        { icon: Code2, label: 'First Solve', desc: 'Solved first problem', color: '#00b8a3', unlocked: (stats?.Total || 0) >= 1 },
        { icon: Flame, label: '10 Day Streak', desc: '10 days in a row', color: '#f97316', unlocked: false },
        { icon: Brain, label: 'AI Interviewee', desc: 'Completed mock interview', color: '#a855f7', unlocked: validInvCount >= 1 },
        { icon: Trophy, label: 'High Achiever', desc: 'Scored above 80%', color: '#eab308', unlocked: avg >= 80 },
        { icon: Star, label: 'Top 50', desc: 'Solved 50+ problems', color: '#3b82f6', unlocked: (stats?.Total || 0) >= 50 },
        { icon: Zap, label: 'Speed Runner', desc: '5 problems in one day', color: '#06b6d4', unlocked: false },
    ];
    const unlockedBadges = badges.filter(b => b.unlocked).length;
    const hasExperience = (profile.experience || []).length > 0;
    const hasEducation = (profile.education || []).length > 0;
    const hasProjects = (profile.projects || []).length > 0;
    const hasSkills = (profile.skills || []).length > 0;
    const hasCerts = (profile.certifications || []).length > 0;

    return (
        <div className="pub">
            <style>{CSS}</style>

            {/* ── Top nav ── */}
            <nav style={{ height: '56px', borderBottom: '1px solid var(--divide)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <img src="/logo.jpeg" alt="CodeArena" style={{ width: '26px', height: '26px', borderRadius: '7px' }} />
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.3px', color: 'var(--txt1)' }}>CodeArena</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--txt3)', background: 'var(--pill-bg)', padding: '4px 10px', borderRadius: '999px', border: '1px solid var(--pill-border)', fontWeight: 600 }}>Public Portfolio</span>
                </div>
            </nav>

            {/* ── Hero section ── */}
            <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--divide)', background: `linear-gradient(180deg,rgba(var(--accent-rgb),0.1) 0%, transparent 100%)` }}>
                {/* BG grid */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--divide) 1px,transparent 1px),linear-gradient(90deg,var(--divide) 1px,transparent 1px)', backgroundSize: '60px 60px', opacity: 0.5 }} />
                {/* BG orbs */}
                <div style={{ position: 'absolute', top: '-80px', left: '10%', width: '500px', height: '500px', background: `radial-gradient(circle,rgba(var(--accent-rgb),0.15),transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-100px', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(59,130,246,0.1),transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ maxWidth: maxW, margin: '0 auto', padding: '4rem 2rem 3rem', position: 'relative', zIndex: 1, transition: 'max-width 0.3s' }}>
                    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap', animation: 'fadeUp 0.5s ease-out' }}>
                        {/* Avatar */}
                        <div style={{ flexShrink: 0, animation: 'scaleIn 0.5s ease-out' }}>
                            <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'var(--hero-grad)', padding: '3px', animation: 'glow 3s ease-in-out infinite' }}>
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: isDark ? '#0a0b12' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {profile.photoURL ? <img src={profile.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={50} color="var(--accent)" opacity={0.5} />}
                                </div>
                            </div>
                            {/* online dot */}
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#10b981', border: `3px solid var(--bg)`, position: 'relative', margin: '-20px 0 0 80px' }} />
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: '240px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, background: isDark ? 'linear-gradient(135deg,#fff 60%,rgba(255,255,255,0.5))' : 'linear-gradient(135deg,#000 60%,rgba(0,0,0,0.5))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    {profile.displayName || 'Developer Portfolio'}
                                </h1>
                                <span style={{ background: 'var(--hero-grad)', borderRadius: '8px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>PRO</span>
                            </div>

                            {profile.email && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--txt3)', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 600 }}><Mail size={14} />{profile.email}</div>}

                            {profile.bio && <p style={{ fontSize: '1rem', color: 'var(--txt2)', margin: '0 0 1.2rem', lineHeight: 1.6, maxWidth: '600px', fontStyle: 'italic' }}>"{profile.bio}"</p>}

                            {/* Social links row */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                                {profile.github && <a href={`https://${profile.github}`} target="_blank" rel="noreferrer" className="slink" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.1)'}`, color: 'var(--txt1)' }}><Github size={14} />{profile.github.replace(/^https?:\/\//, '')}</a>}
                                {profile.linkedin && <a href={`https://${profile.linkedin}`} target="_blank" rel="noreferrer" className="slink" style={{ background: 'rgba(10,102,194,0.12)', border: '1px solid rgba(10,102,194,0.28)', color: isDark ? '#60a5fa' : '#084c94' }}><Linkedin size={14} />LinkedIn</a>}
                                {profile.portfolio && <a href={`https://${profile.portfolio}`} target="_blank" rel="noreferrer" className="slink" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: isDark ? '#34d399' : '#0d9467' }}><Globe size={14} />Portfolio</a>}
                                {profile.resume && <a href={profile.resume} target="_blank" rel="noreferrer" className="slink" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: isDark ? '#fcd34d' : '#d97706' }}><FileText size={14} />Resume / CV</a>}
                            </div>

                            {/* Quick meta */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.8rem', color: 'var(--txt3)', fontWeight: 600 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle size={13} color="#10b981" />Verified CodeArena Member</span>
                                {prefs.showBadges && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Trophy size={13} color="#eab308" />{unlockedBadges} Achievements Unlocked</span>}
                                {prefs.showInterviews && validInvCount > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Brain size={13} color="var(--accent)" />{validInvCount} Mock Interviews</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stats row ── */}
            {prefs.showStats && (
                <div style={{ maxWidth: maxW, margin: '0 auto', padding: '2rem 2rem 0', transition: 'max-width 0.3s' }}>
                    <div className="pub-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', animation: 'fadeUp 0.5s ease-out 0.1s both' }}>
                        {[
                            { label: 'Problems Solved', value: stats?.Total || 0, sub: `of ${totalCounts?.Total || 0}`, icon: Code2, color: T.accent, bg: `rgba(var(--accent-rgb),0.1)` },
                            { label: 'Mock Interviews', value: validInvCount, sub: 'completed sessions', icon: Brain, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
                            { label: 'Avg. Score', value: avg ? `${avg}%` : 'N/A', sub: 'interview performance', icon: TrendingUp, color: avg >= 80 ? '#10b981' : avg >= 60 ? '#f59e0b' : '#3b82f6', bg: 'rgba(16,185,129,0.1)' },
                            { label: 'Badges Earned', value: unlockedBadges, sub: `of ${badges.length} total`, icon: Award, color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
                        ].map((s, i) => (
                            <div key={s.label} className="stat-card" style={{ animationDelay: `${i * 0.05}s`, animation: 'fadeUp 0.5s ease-out both' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
                                    <div style={{ width: 30, height: 30, borderRadius: '8px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><s.icon size={14} color={s.color} /></div>
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--txt1)', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--txt3)', marginTop: '4px', fontWeight: 500 }}>{s.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Main content ── */}
            <div style={{ maxWidth: maxW, margin: '0 auto', padding: '2rem', transition: 'max-width 0.3s' }}>
                <div className="pub-main-grid" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem' }}>

                    {/* ── LEFT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Skills */}
                        {hasSkills && (
                            <div className="glass" style={{ padding: '1.5rem', animation: 'fadeUp 0.5s ease-out 0.15s both' }}>
                                <SectionHead icon={Code2} color="#3b82f6" title="Tech Stack" count={profile.skills.length} />
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                                    {profile.skills.map(s => {
                                        const icon = devIcon(s);
                                        return (
                                            <span key={s} className="skill-pill">
                                                {icon && <img src={icon} alt={s} style={{ width: 16, height: 16 }} onError={e => e.target.style.display = 'none'} />}
                                                {s}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {hasCerts && (
                            <div className="glass" style={{ padding: '1.5rem', animation: 'fadeUp 0.5s ease-out 0.2s both' }}>
                                <SectionHead icon={CheckCircle} color="#10b981" title="Certifications" count={profile.certifications.length} />
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                                    {profile.certifications.map(c => <span key={c} className="cert-pill"><CheckCircle size={11} />{c}</span>)}
                                </div>
                            </div>
                        )}

                        {/* Difficulty rings */}
                        {prefs.showStats && stats?.Total > 0 && (
                            <div className="glass" style={{ padding: '1.5rem', animation: 'fadeUp 0.5s ease-out 0.25s both' }}>
                                <SectionHead icon={Code2} color="var(--accent)" title="Problem Stats" />
                                <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0 1rem' }}>
                                    <CircleProgress value={stats?.Easy || 0} max={totalCounts?.Easy || 1} color="#10b981" label="Easy" size={72} sw={6} />
                                    <CircleProgress value={stats?.Medium || 0} max={totalCounts?.Medium || 1} color="#f59e0b" label="Medium" size={84} sw={7} />
                                    <CircleProgress value={stats?.Hard || 0} max={totalCounts?.Hard || 1} color="#ef4444" label="Hard" size={72} sw={6} />
                                </div>
                                <div style={{ borderTop: '1px solid var(--divide)', paddingTop: '1rem' }}>
                                    {[{ label: 'Easy', color: '#10b981', v: stats?.Easy || 0, m: totalCounts?.Easy || 1 }, { label: 'Medium', color: '#f59e0b', v: stats?.Medium || 0, m: totalCounts?.Medium || 1 }, { label: 'Hard', color: '#ef4444', v: stats?.Hard || 0, m: totalCounts?.Hard || 1 }].map(d => (
                                        <div key={d.label} style={{ marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                                <span style={{ color: d.color, fontWeight: 700 }}>{d.label}</span>
                                                <span style={{ color: 'var(--txt2)' }}><strong>{d.v}</strong><span style={{ color: 'var(--txt3)' }}> / {d.m}</span></span>
                                            </div>
                                            <div style={{ height: '4px', background: 'var(--divide)', borderRadius: '999px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(d.v / d.m) * 100}%`, height: '100%', background: d.color, borderRadius: '999px', transition: 'width 1.5s cubic-bezier(0.16,1,0.3,1)' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Achievements */}
                        {prefs.showBadges && (
                            <div className="glass" style={{ padding: '1.5rem', animation: 'fadeUp 0.5s ease-out 0.3s both' }}>
                                <SectionHead icon={Trophy} color="#eab308" title="Achievements" count={`${unlockedBadges}/${badges.length}`} />
                                <div className="pub-badges" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                                    {badges.map(b => <Badge key={b.label} {...b} />)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Projects */}
                        {hasProjects && (
                            <div className="glass" style={{ padding: '1.5rem', animation: 'fadeUp 0.5s ease-out 0.15s both' }}>
                                <SectionHead icon={ExternalLink} color="#06b6d4" title="Projects" count={profile.projects.length} />
                                <div className="pub-projs" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
                                    {profile.projects.map((p, i) => (
                                        <div key={i} className="proj-card">
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
                                                <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Code2 size={16} color={isDark ? '#22d3ee' : '#0891b2'} />
                                                </div>
                                                {p.link && (
                                                    <a href={p.link.startsWith('http') ? p.link : `https://${p.link}`} target="_blank" rel="noreferrer" style={{ color: 'var(--txt3)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--accent)'} onMouseLeave={e => e.target.style.color = 'var(--txt3)'}>
                                                        <ExternalLink size={14} />
                                                    </a>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--txt1)', marginBottom: '6px', lineHeight: 1.3 }}>{p.name}</div>
                                            {p.desc && <div style={{ fontSize: '0.78rem', color: 'var(--txt2)', lineHeight: 1.6, marginBottom: '10px' }}>{p.desc}</div>}
                                            {p.link && (
                                                <a href={p.link.startsWith('http') ? p.link : `https://${p.link}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: isDark ? '#22d3ee' : '#0891b2', fontWeight: 700, textDecoration: 'none' }}>
                                                    <Github size={11} /> View Project <ChevronRight size={10} />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Experience */}
                        {hasExperience && (
                            <div className="glass" style={{ padding: '1.5rem', animation: 'fadeUp 0.5s ease-out 0.2s both' }}>
                                <SectionHead icon={Briefcase} color="#f59e0b" title="Work Experience" count={profile.experience.length} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {profile.experience.map((e, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '14px', paddingBottom: '1.2rem', borderBottom: i < profile.experience.length - 1 ? '1px solid var(--divide)' : 'none', marginBottom: i < profile.experience.length - 1 ? '1.2rem' : 0 }}>
                                            {/* Timeline */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                                <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={16} color={isDark ? "#fbbf24" : "#d97706"} /></div>
                                                {i < profile.experience.length - 1 && <div style={{ width: '2px', flex: 1, background: 'var(--divide)', marginTop: '8px', minHeight: '20px' }} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--txt1)', marginBottom: '4px' }}>{e.role}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                    {e.company && <span style={{ fontSize: '0.8rem', color: 'var(--txt2)', fontWeight: 700 }}>{e.company}</span>}
                                                    {e.duration && <span style={{ fontSize: '0.75rem', color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><Calendar size={11} />{e.duration}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {hasEducation && (
                            <div className="glass" style={{ padding: '1.5rem', animation: 'fadeUp 0.5s ease-out 0.25s both' }}>
                                <SectionHead icon={GraduationCap} color="var(--accent)" title="Education" count={profile.education.length} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {profile.education.map((e, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '14px', paddingBottom: '1.2rem', borderBottom: i < profile.education.length - 1 ? '1px solid var(--divide)' : 'none', marginBottom: i < profile.education.length - 1 ? '1.2rem' : 0 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                                <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(var(--accent-rgb),0.15)', border: '1px solid rgba(var(--accent-rgb),0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GraduationCap size={16} color="var(--accent)" /></div>
                                                {i < profile.education.length - 1 && <div style={{ width: '2px', flex: 1, background: 'var(--divide)', marginTop: '8px', minHeight: '20px' }} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--txt1)', marginBottom: '4px' }}>{e.degree}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                    {e.institution && <span style={{ fontSize: '0.8rem', color: 'var(--txt2)', fontWeight: 700 }}>{e.institution}</span>}
                                                    {e.year && <span style={{ fontSize: '0.75rem', color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}><Calendar size={11} />{e.year}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Interviews */}
                        {prefs.showInterviews && recentInv.length > 0 && (
                            <div className="glass" style={{ padding: '1.5rem', animation: 'fadeUp 0.5s ease-out 0.3s both' }}>
                                <SectionHead icon={Brain} color="#3b82f6" title="Recent Mock Interviews" count={validInvCount} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {recentInv.map((inv, i) => {
                                        const hire = inv.scoreReport?.hire || '';
                                        const hC = hire.includes('Strong Hire') ? '#10b981' : hire.includes('No Hire') ? '#ef4444' : '#f59e0b';
                                        const sc = inv.overallScore;
                                        const sC = sc >= 80 ? '#10b981' : sc >= 60 ? '#f59e0b' : '#ef4444';
                                        const dt = inv.createdAt ? (inv.createdAt?.toDate ? inv.createdAt.toDate() : new Date(inv.createdAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                                        return (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--divide)', gap: '12px' }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--txt1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>{inv.problemTitle || 'Mock Interview'}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}><Calendar size={10} />{dt}</div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                                    {hire && <span style={{ fontSize: '0.65rem', fontWeight: 800, color: hC, background: `${hC}15`, border: `1px solid ${hC}30`, borderRadius: '6px', padding: '2px 8px' }}>{hire}</span>}
                                                    {sc != null && <span style={{ fontSize: '0.78rem', fontWeight: 900, color: sC }}>{sc}/100</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Empty state when no content at all */}
                        {!hasProjects && !hasExperience && !hasEducation && recentInv.length === 0 && (
                            <div className="glass" style={{ padding: '3rem', textAlign: 'center', animation: 'fadeUp 0.5s ease-out 0.2s both' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '12px', color: 'var(--txt3)' }}>✦</div>
                                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--txt2)' }}>Portfolio in progress</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--txt3)', marginTop: '6px', fontWeight: 500 }}>This user hasn't added their projects and experience yet</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <div style={{ borderTop: '1px solid var(--divide)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '2rem' }}>
                <img src="/logo.jpeg" alt="CodeArena" style={{ width: '18px', height: '18px', borderRadius: '4px', opacity: 0.5 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--txt3)', fontWeight: 500 }}>Powered by <strong style={{ color: 'var(--txt2)' }}>CodeArena</strong> — Build your coding career</span>
            </div>
        </div>
    );
}
