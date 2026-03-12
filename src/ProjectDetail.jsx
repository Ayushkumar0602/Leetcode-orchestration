import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavProfile from './NavProfile';
import {
    ArrowLeft, Github, Globe, Code2, Brain, Box, CheckCircle, Database
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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

function SectionHead({ icon: Icon, color, title }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--divide)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: `${color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={17} color={color} /></div>
            <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--txt1)' }}>{title}</span>
        </div>
    );
}

export default function ProjectDetail() {
    const { uid, projectIndex } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!uid || projectIndex === undefined) return;
        fetch(`https://leetcode-orchestration-55z3.onrender.com/api/profile/${uid}`)
            .then(r => r.json())
            .then(res => {
                const pList = res.profile?.projects || [];
                const proj = pList[parseInt(projectIndex, 10)];
                if (!proj || !proj.extendedData) {
                    setError(true);
                } else {
                    setData({ profile: res.profile, project: proj });
                }
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [uid, projectIndex]);

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#04050a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', fontFamily: 'Inter,sans-serif' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(168,85,247,0.3)', borderTopColor: '#a855f7', animation: 'spin 0.8s linear infinite' }} />
            <style>{'@keyframes spin{to{transform:rotate(360deg);}}'}</style>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Loading project deep dive…</span>
        </div>
    );

    if (error || !data) return (
        <div style={{ minHeight: '100vh', background: '#04050a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', fontFamily: 'Inter,sans-serif', color: '#fff' }}>
            <div style={{ fontSize: '3rem' }}>404</div>
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>Project not found or lacks AI analysis data.</div>
            <button onClick={() => navigate(`/public/${uid}`)} style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)', border: 'none', borderRadius: '12px', padding: '10px 24px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>← Back to Profile</button>
        </div>
    );

    const { profile, project } = data;
    const { extendedData } = project;
    const prefs = profile.preferences || { theme: 'Purple', layout: 'Comfortable', darkMode: true };
    const T = THEME_MAP[prefs.theme] || THEME_MAP['Purple'];
    const maxW = LAYOUT_MAP[prefs.layout] || LAYOUT_MAP['Comfortable'];
    const isDark = prefs.darkMode !== false;

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
        --pill-bg: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)'};
        --pill-border: ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.08)'};
        --divide: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'};
        --nav-bg: ${isDark ? 'rgba(4,5,10,0.85)' : 'rgba(244,244,245,0.85)'};
        --accent: ${T.accent};
        --accent-rgb: ${T.rgb};
        --hero-grad: ${T.heroGrad};
    }

    .pub{font-family:'Inter',system-ui,sans-serif;background:var(--bg);min-height:100vh;color:var(--txt1);transition:background 0.3s, color 0.3s;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
    
    .glass{background:var(--glass-bg);backdrop-filter:blur(20px);border:1px solid var(--glass-border);border-radius:22px;}
    .skill-pill{display:inline-flex;align-items:center;gap:6px;background:var(--pill-bg);border:1px solid var(--pill-border);border-radius:10px;padding:6px 12px;font-size:0.78rem;font-weight:500;color:var(--txt1);}
    
    .md-content { color: var(--txt2); font-size: 0.9rem; line-height: 1.6; }
    .md-content p { margin-bottom: 1rem; }
    .md-content pre { background: ${isDark ? '#0f111a' : '#e2e8f0'}; padding: 1rem; border-radius: 8px; overflow-x: auto; margin-bottom: 1rem; border: 1px solid var(--divide); color: ${isDark ? '#e2e8f0' : '#1e293b'};}
    .md-content code { font-family: 'Fira Code', monospace; font-size: 0.82rem; }
    .md-content p code { background: var(--pill-bg); padding: 2px 6px; border-radius: 4px; color: var(--accent); }
    `;

    return (
        <div className="pub">
            <style>{CSS}</style>

            <nav style={{ height: '56px', borderBottom: '1px solid var(--divide)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="CodeArena" style={{ width: '26px', height: '26px', borderRadius: '7px' }} />
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.3px', color: 'var(--txt1)' }}>CodeArena</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--txt3)', background: 'var(--pill-bg)', padding: '4px 10px', borderRadius: '999px', border: '1px solid var(--pill-border)', fontWeight: 600 }}>Project Deep Dive</span>
                    <NavProfile />
                </div>
            </nav>

            {/* Back Nav */}
            <div style={{ maxWidth: maxW, margin: '0 auto', padding: '2rem 2rem 0', display: 'flex' }}>
                <button onClick={() => navigate(`/public/${uid}`)} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: 0 }} onMouseEnter={e => e.target.style.color = 'var(--accent)'} onMouseLeave={e => e.target.style.color = 'var(--txt2)'}>
                    <ArrowLeft size={16} /> Back to Profile
                </button>
            </div>

            {/* Hero */}
            <div style={{ margin: '0 auto', maxWidth: maxW, padding: '2rem', position: 'relative' }}>
                <div className="glass" style={{ padding: '3rem 2.5rem', position: 'relative', overflow: 'hidden', animation: 'fadeUp 0.5s ease-out' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle,rgba(var(--accent-rgb),0.15),transparent 70%)', pointerEvents: 'none' }} />
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '999px', padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}><Brain size={12} /> AI Analyzed Repository</div>
                    </div>
                    
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--txt1)', marginBottom: '8px', lineHeight: 1.2 }}>{project.name}</h1>
                    <p style={{ fontSize: '1rem', color: 'var(--txt2)', maxWidth: '700px', lineHeight: 1.6, marginBottom: '24px' }}>{project.desc}</p>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {project.link && (
                            <a href={project.link.startsWith('http') ? project.link : `https://${project.link}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--txt1)', color: 'var(--bg)', textDecoration: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700 }}>
                                <Github size={16} /> View on GitHub
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div style={{ maxWidth: maxW, margin: '0 auto', padding: '0 2rem 3rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
                    
                    {/* Main Col */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="glass" style={{ padding: '2rem', animation: 'fadeUp 0.5s ease-out 0.1s both' }}>
                            <SectionHead icon={Globe} color="#3b82f6" title="Project Overview" />
                            <div className="md-content">
                                <ReactMarkdown>{extendedData.overview}</ReactMarkdown>
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '2rem', animation: 'fadeUp 0.5s ease-out 0.2s both' }}>
                            <SectionHead icon={Box} color="#10b981" title="Architecture & Design" />
                            <div className="md-content">
                                <ReactMarkdown>{extendedData.architecture || 'No architecture details explicitly found.'}</ReactMarkdown>
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '2rem', animation: 'fadeUp 0.5s ease-out 0.3s both' }}>
                            <SectionHead icon={Database} color="#f59e0b" title="Setup Instructions" />
                            <div className="md-content">
                                <ReactMarkdown>{extendedData.setupInstructions || 'No setup instructions provided.'}</ReactMarkdown>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="glass" style={{ padding: '1.5rem', animation: 'fadeUp 0.5s ease-out 0.15s both' }}>
                            <SectionHead icon={Code2} color="#ec4899" title="Tech Stack" />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {(extendedData.techStack || []).map(s => {
                                    const icon = devIcon(s);
                                    return (
                                        <span key={s} className="skill-pill">
                                            {icon && <img src={icon} alt={s} style={{ width: 14, height: 14 }} onError={e => e.target.style.display = 'none'} />}
                                            {s}
                                        </span>
                                    )
                                })}
                                {(!extendedData.techStack || extendedData.techStack.length === 0) && <span style={{ color: 'var(--txt3)', fontSize: '0.8rem' }}>Not specified</span>}
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '1.5rem', animation: 'fadeUp 0.5s ease-out 0.25s both' }}>
                            <SectionHead icon={CheckCircle} color="#06b6d4" title="Key Features" />
                            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {(extendedData.features || []).map((f, i) => (
                                    <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.88rem', color: 'var(--txt2)', lineHeight: 1.5 }}>
                                        <div style={{ marginTop: '3px', color: '#06b6d4' }}><CheckCircle size={14} /></div>
                                        <span>{f}</span>
                                    </li>
                                ))}
                                {(!extendedData.features || extendedData.features.length === 0) && <span style={{ color: 'var(--txt3)', fontSize: '0.8rem' }}>Not specified</span>}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--divide)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '2rem' }}>
                <img src="/logo.jpeg" alt="CodeArena" style={{ width: '18px', height: '18px', borderRadius: '4px', opacity: 0.5 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--txt3)', fontWeight: 500 }}>Powered by <strong style={{ color: 'var(--txt2)' }}>CodeArena</strong></span>
            </div>
        </div>
    );
}
