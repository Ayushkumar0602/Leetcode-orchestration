import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavProfile from './NavProfile';
import {
    User, Github, Linkedin, Globe, Code2, Brain, Award, TrendingUp, Star, Flame, Zap, Trophy,
    Briefcase, GraduationCap, Calendar, FileText, ExternalLink, CheckCircle, ChevronRight, MapPin, Mail
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchStats, fetchInterviews, fetchProfile, queryKeys } from './lib/api';
import { useSEO } from './hooks/useSEO';

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

    const { data: statsResult, isLoading: statsLoading } = useQuery({
        queryKey: queryKeys.stats(uid),
        queryFn: () => fetchStats(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 5,
    });

    const { data: interviewsRaw, isLoading: invLoading } = useQuery({
        queryKey: queryKeys.interviews(uid),
        queryFn: () => fetchInterviews(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 3,
    });

    const { data: profileData, isLoading: profileLoading, isError } = useQuery({
        queryKey: queryKeys.profile(uid),
        queryFn: () => fetchProfile(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 5,
    });

    const loading = statsLoading || invLoading || profileLoading;

    const stats = statsResult?.userStats || {};
    const totalCounts = statsResult?.totalCounts || {};
    const profile = profileData || {};

    const validInv = (interviewsRaw || []).filter(i => i.overallScore || i.scoreReport);
    const scored = validInv.filter(i => i.overallScore > 0);
    const avg = scored.length ? Math.round(scored.reduce((s, i) => s + i.overallScore, 0) / scored.length) : 0;
    const recentInv = validInv.slice(0, 5);
    const validInvCount = validInv.length;

    // ── Dynamic SEO ── (fired when profile data lands)
    const profileName = profile.displayName || profile.name || 'Developer';
    const profileBio = profile.bio || `${profileName} is a software developer. View their projects, skills, and interview performance on Whizan AI.`;
    useSEO({
        title: `${profileName}'s Portfolio – Whizan AI`,
        description: profileBio.slice(0, 155),
        canonical: `/public/${uid}`,
        jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profileName,
            url: `https://whizan.xyz/public/${uid}`,
            description: profileBio,
            jobTitle: profile.currentRole || profile.role || 'Software Developer',
            knowsAbout: (profile.skills || []).slice(0, 10),
            sameAs: [
                profile.github ? `https://github.com/${profile.github}` : null,
                profile.linkedin ? `https://linkedin.com/in/${profile.linkedin}` : null,
            ].filter(Boolean),
        },
    });


    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#04050a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', fontFamily: 'Inter,sans-serif' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(168,85,247,0.3)', borderTopColor: '#a855f7', animation: 'spin 0.8s linear infinite' }} />
            <style>{'@keyframes spin{to{transform:rotate(360deg);}}'}</style>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Loading portfolio…</span>
        </div>
    );

    if (isError || !profileData || profile.preferences?.isPublic === false) return (
        <div style={{ minHeight: '100vh', background: '#04050a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', fontFamily: 'Inter,sans-serif', color: '#fff' }}>
            <div style={{ fontSize: '3rem' }}>404</div>
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>Profile not found or is currently marked private.</div>
            <button onClick={() => navigate('/')} style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)', border: 'none', borderRadius: '12px', padding: '10px 24px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>← Go Home</button>
        </div>
    );

    // Extract preferences
    const prefs = profile.preferences || { theme: 'Purple', layout: 'Comfortable', darkMode: true, isPublic: true, showInterviews: true, showStats: true, showBadges: true };
    const T = THEME_MAP[prefs.theme] || THEME_MAP['Purple'];
    const maxW = LAYOUT_MAP[prefs.layout] || LAYOUT_MAP['Comfortable'];
    const isDark = prefs.darkMode !== false;
    const template = prefs.template || 'Signature';

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
    @media(max-width:768px){
        .pub-nav-links{display:none !important;}
        .pub-nav{height:auto !important; padding:0.6rem 1rem !important; flex-wrap:wrap; gap:0.5rem;}
        .pub-nav-badge{display:none !important;}
        .pub-hero-content{padding:2.5rem 1rem 2rem !important; overflow:hidden !important;}
        .pub-hero-inner{flex-direction:column !important; align-items:center !important; text-align:center !important; gap:1.5rem !important; flex-wrap:nowrap !important;}
        .pub-hero-avatar-wrap{display:flex !important; flex-direction:column !important; align-items:center !important;}
        .pub-hero-info{min-width:0 !important; width:100% !important; max-width:100% !important; display:flex !important; flex-direction:column !important; align-items:center !important;}
        .pub-hero-name-row{justify-content:center !important;}
        .pub-hero-email{justify-content:center !important;}
        .pub-hero-avatar{width:90px !important; height:90px !important;}
        .pub-hero-name{font-size:1.75rem !important; word-break:break-word !important; overflow-wrap:anywhere !important;}
        .pub-hero-links{justify-content:center !important; flex-wrap:wrap !important;}
        .pub-hero-meta{justify-content:center !important; flex-wrap:wrap !important; gap:10px !important;}
        .pub-stats{grid-template-columns:repeat(2,1fr) !important;}
        .pub-badges{grid-template-columns:repeat(2,1fr) !important;}
        .pub-projs{grid-template-columns:1fr !important;}
        .pub-main-grid{gap:1rem !important;}
        .pub-section-pad{padding:1.25rem !important;}
        .badge-card{padding:0.85rem 0.5rem !important;}
        .pub-stats-wrap{padding:1.25rem 1rem 0 !important;}
        .pub-content-wrap{padding:1rem !important;}
    }
    @media(max-width:480px){
        .pub-hero-content{padding:2rem 0.75rem 1.5rem !important; box-sizing:border-box !important;}
        .pub-hero-inner{gap:1.2rem !important;}
        .pub-hero-avatar{width:78px !important; height:78px !important;}
        .pub-hero-name{font-size:1.4rem !important; letter-spacing:-0.03em !important;}
        .pub-hero-links .slink{font-size:0.75rem !important; padding:6px 10px !important;}
        .pub-stats{grid-template-columns:repeat(2,1fr) !important; gap:8px !important;}
        .pub-stats-wrap{padding:1rem 0.75rem 0 !important;}
        .pub-content-wrap{padding:0.75rem !important;}
        .stat-card{padding:0.85rem 0.75rem !important;}
    }
    @media(max-width:400px){
        .pub-hero-name{font-size:1.2rem !important;}
        .pub-hero-avatar{width:68px !important; height:68px !important;}
        .pub-hero-meta{font-size:0.72rem !important;}
        .pub-stats{grid-template-columns:1fr 1fr !important;}
        .pub-badges{grid-template-columns:repeat(2,1fr) !important;}
        .pub-hero-links .slink{padding:5px 8px !important; font-size:0.7rem !important;}
    }

    /* ── Cinematic template ───────────────────────────────────── */
    .pub-cinematic{
        background: radial-gradient(circle at top left, rgba(var(--accent-rgb),0.12) 0, transparent 55%), radial-gradient(circle at bottom right, rgba(59,130,246,0.14) 0, transparent 60%), var(--bg);
    }
    .cin-hero{
        position:relative;
        min-height:72vh;
        display:flex;
        align-items:flex-end;
        padding:4.5rem 0 3rem;
        overflow:hidden;
    }
    .cin-hero-backdrop{
        position:absolute;
        inset:0;
        background:
            radial-gradient(circle at top, rgba(var(--accent-rgb),0.3) 0, transparent 55%),
            linear-gradient(180deg, #020617 0%, #020617 40%, transparent 100%);
        opacity:0.85;
    }
    .cin-hero-overlay{
        position:absolute;
        inset:0;
        background:radial-gradient(circle at 20% 0%, rgba(15,23,42,0.9) 0, transparent 60%);
        mix-blend-mode:screen;
        opacity:0.9;
    }
    .cin-hero-content{
        position:relative;
        z-index:1;
        max-width:1100px;
        margin:0 auto;
        padding:0 2rem;
    }
    .cin-hero-main{
        display:flex;
        gap:3rem;
        align-items:flex-end;
        flex-wrap:wrap;
    }
    .cin-hero-text{
        flex:1.2;
        min-width:260px;
    }
    .cin-hero-kicker{
        display:flex;
        align-items:center;
        gap:8px;
        font-size:0.78rem;
        color:rgba(248,250,252,0.6);
        letter-spacing:0.18em;
        text-transform:uppercase;
        margin-bottom:0.9rem;
    }
    .cin-dot{
        width:6px;
        height:6px;
        border-radius:999px;
        background:#22c55e;
        box-shadow:0 0 0 6px rgba(34,197,94,0.2);
    }
    .cin-name{
        font-size:3rem;
        line-height:1.05;
        letter-spacing:-0.08em;
        font-weight:900;
        margin:0 0 0.3rem;
        background:linear-gradient(120deg,#fff 10%,rgba(226,232,240,0.95) 40%,rgba(148,163,184,0.9) 100%);
        -webkit-background-clip:text;
        -webkit-text-fill-color:transparent;
    }
    .cin-role{
        font-size:1rem;
        color:rgba(226,232,240,0.8);
        font-weight:600;
        text-transform:uppercase;
        letter-spacing:0.18em;
        margin-bottom:1.2rem;
    }
    .cin-bio{
        font-size:0.95rem;
        color:rgba(226,232,240,0.78);
        max-width:540px;
        line-height:1.7;
        margin-bottom:1.4rem;
    }
    .cin-meta-row{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-bottom:1.6rem;
    }
    .cin-meta-pill{
        display:inline-flex;
        align-items:center;
        gap:6px;
        font-size:0.78rem;
        padding:6px 10px;
        border-radius:999px;
        border:1px solid rgba(148,163,184,0.4);
        background:rgba(15,23,42,0.7);
        color:rgba(226,232,240,0.9);
    }
    .cin-links{
        display:flex;
        flex-wrap:wrap;
        gap:10px;
    }
    .cin-btn{
        display:inline-flex;
        align-items:center;
        gap:8px;
        font-size:0.82rem;
        font-weight:600;
        border-radius:999px;
        padding:8px 16px;
        border:1px solid transparent;
        text-decoration:none;
        transition:all 0.2s;
    }
    .cin-btn-primary{
        background:var(--hero-grad);
        color:#0b1120;
        box-shadow:0 18px 40px rgba(15,23,42,0.8);
    }
    .cin-btn-primary:hover{
        transform:translateY(-1px);
        box-shadow:0 20px 45px rgba(15,23,42,0.9);
    }
    .cin-btn-outline{
        background:rgba(15,23,42,0.7);
        border-color:rgba(148,163,184,0.4);
        color:rgba(226,232,240,0.9);
    }
    .cin-btn-outline:hover{
        border-color:rgba(226,232,240,0.9);
        background:rgba(15,23,42,0.9);
    }
    .cin-btn-ghost{
        background:transparent;
        border-color:rgba(148,163,184,0.25);
        color:rgba(226,232,240,0.7);
    }
    .cin-btn-ghost:hover{
        background:rgba(15,23,42,0.75);
        color:rgba(226,232,240,0.96);
    }
    .cin-hero-profile{
        flex:0.9;
        min-width:240px;
        display:flex;
        flex-direction:column;
        gap:1.2rem;
        align-items:flex-end;
    }
    .cin-avatar-wrap{
        display:flex;
        flex-direction:column;
        align-items:flex-end;
        gap:0.7rem;
    }
    .cin-avatar-ring{
        width:120px;
        height:120px;
        border-radius:50%;
        padding:3px;
        background:conic-gradient(from 160deg, rgba(var(--accent-rgb),0.2), rgba(59,130,246,0.4), rgba(var(--accent-rgb),0.9), rgba(15,23,42,1));
        box-shadow:0 24px 60px rgba(15,23,42,0.9);
    }
    .cin-avatar-inner{
        width:100%;
        height:100%;
        border-radius:50%;
        background:#020617;
        display:flex;
        align-items:center;
        justify-content:center;
        overflow:hidden;
    }
    .cin-availability{
        display:inline-flex;
        align-items:center;
        gap:6px;
        font-size:0.75rem;
        padding:4px 10px;
        border-radius:999px;
        background:rgba(22,163,74,0.18);
        border:1px solid rgba(22,163,74,0.6);
        color:#bbf7d0;
    }
    .cin-availability-dot{
        width:8px;
        height:8px;
        border-radius:999px;
        background:#22c55e;
        box-shadow:0 0 0 6px rgba(34,197,94,0.25);
    }
    .cin-hero-stats{
        display:grid;
        grid-template-columns:repeat(3, minmax(0,1fr));
        gap:8px;
        padding:10px;
        border-radius:16px;
        background:linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.7));
        border:1px solid rgba(148,163,184,0.3);
        backdrop-filter:blur(22px);
    }
    .cin-hero-stat{
        padding:6px 8px;
    }
    .cin-hero-stat-label{
        font-size:0.68rem;
        color:rgba(148,163,184,0.9);
        text-transform:uppercase;
        letter-spacing:0.15em;
        display:block;
        margin-bottom:4px;
    }
    .cin-hero-stat-value{
        font-size:1.2rem;
        font-weight:800;
        color:#e5e7eb;
        letter-spacing:-0.05em;
    }

    .cin-main{
        padding:2.5rem 0 1.5rem;
    }
    .cin-main-inner{
        max-width:1100px;
        margin:0 auto;
        padding:0 2rem;
        display:flex;
        flex-direction:column;
        gap:2rem;
    }
    .cin-section{
        border-radius:24px;
        background:rgba(15,23,42,0.9);
        border:1px solid rgba(15,23,42,0.9);
        box-shadow:0 24px 80px rgba(15,23,42,0.95);
        padding:1.6rem 1.6rem 1.7rem;
    }
    .cin-section-header{
        display:flex;
        align-items:flex-end;
        justify-content:space-between;
        gap:1rem;
        margin-bottom:1.2rem;
        border-bottom:1px solid rgba(30,64,175,0.45);
        padding-bottom:0.9rem;
    }
    .cin-section-title{
        display:flex;
        align-items:center;
        gap:10px;
    }
    .cin-section-title h2{
        font-size:0.95rem;
        font-weight:700;
        letter-spacing:0.18em;
        text-transform:uppercase;
        color:rgba(226,232,240,0.95);
    }
    .cin-section-title p{
        font-size:0.78rem;
        color:rgba(148,163,184,0.85);
        margin-top:2px;
    }
    .cin-projects{
        display:flex;
        flex-direction:column;
        gap:1rem;
    }
    .cin-project-card{
        border-radius:16px;
        padding:1rem 1.1rem 1rem;
        background:rgba(15,23,42,0.9);
        border:1px solid rgba(30,64,175,0.55);
        display:flex;
        flex-direction:column;
        gap:0.4rem;
        transition:all 0.22s;
    }
    .cin-project-card:hover{
        transform:translateY(-3px);
        border-color:rgba(96,165,250,0.9);
        box-shadow:0 18px 55px rgba(15,23,42,0.9);
    }
    .cin-project-header{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:0.7rem;
    }
    .cin-project-title-wrap h3{
        font-size:0.98rem;
        font-weight:700;
        color:rgba(226,232,240,0.98);
        margin-bottom:2px;
    }
    .cin-project-tagline{
        font-size:0.78rem;
        color:rgba(129,140,248,0.9);
        font-weight:600;
    }
    .cin-project-meta{
        display:flex;
        align-items:center;
        gap:6px;
        flex-shrink:0;
    }
    .cin-chip{
        font-size:0.7rem;
        border-radius:999px;
        padding:3px 8px;
        border:1px solid rgba(148,163,184,0.5);
        color:rgba(226,232,240,0.85);
        background:rgba(15,23,42,0.9);
    }
    .cin-chip-accent{
        border-color:rgba(168,85,247,0.6);
        background:rgba(30,64,175,0.6);
        color:#f5f3ff;
    }
    .cin-icon-link{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        width:26px;
        height:26px;
        border-radius:999px;
        border:1px solid rgba(148,163,184,0.5);
        color:rgba(148,163,184,0.9);
        text-decoration:none;
        transition:all 0.18s;
    }
    .cin-icon-link:hover{
        border-color:rgba(248,250,252,0.9);
        color:rgba(248,250,252,1);
        background:rgba(15,23,42,0.9);
    }
    .cin-project-desc{
        font-size:0.8rem;
        color:rgba(226,232,240,0.8);
        line-height:1.7;
    }
    .cin-project-footer{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:0.8rem;
        margin-top:0.4rem;
    }
    .cin-tech-row{
        display:flex;
        flex-wrap:wrap;
        gap:6px;
    }
    .cin-project-cta{
        display:inline-flex;
        align-items:center;
        gap:4px;
        font-size:0.75rem;
        color:rgba(196,181,253,1);
        font-weight:600;
    }
    .cin-section-split{
        display:grid;
        grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);
        gap:1.4rem;
        background:transparent;
        border:none;
        box-shadow:none;
        padding:0;
    }
    .cin-column{
        border-radius:22px;
        background:rgba(15,23,42,0.96);
        border:1px solid rgba(15,23,42,0.96);
        box-shadow:0 24px 80px rgba(15,23,42,0.95);
        padding:1.4rem 1.4rem 1.5rem;
        display:flex;
        flex-direction:column;
        gap:1.1rem;
    }
    .cin-block{
        border-radius:18px;
        border:1px solid rgba(30,64,175,0.55);
        padding:1rem 1.1rem 1.1rem;
        background:radial-gradient(circle at 0 0, rgba(37,99,235,0.35) 0, transparent 45%), radial-gradient(circle at 100% 100%, rgba(15,23,42,0.95) 0, rgba(15,23,42,0.95) 55%);
    }
    .cin-timeline{
        margin-top:0.5rem;
        border-left:1px solid rgba(30,64,175,0.65);
        padding-left:0.8rem;
        display:flex;
        flex-direction:column;
        gap:0.9rem;
    }
    .cin-timeline-item{
        position:relative;
        padding-left:0.2rem;
    }
    .cin-timeline-marker{
        position:absolute;
        left:-1.23rem;
        top:0.25rem;
        width:9px;
        height:9px;
        border-radius:999px;
        background:#60a5fa;
        box-shadow:0 0 0 4px rgba(37,99,235,0.5);
    }
    .cin-timeline-content h3{
        font-size:0.9rem;
        font-weight:700;
        color:rgba(226,232,240,0.98);
        margin-bottom:2px;
    }
    .cin-timeline-meta{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        font-size:0.75rem;
        color:rgba(148,163,184,0.9);
        margin-bottom:4px;
    }
    .cin-timeline-desc{
        font-size:0.78rem;
        color:rgba(203,213,225,0.92);
        line-height:1.7;
    }
    .cin-subblock{
        margin-top:0.4rem;
        padding-top:0.5rem;
        border-top:1px dashed rgba(51,65,85,0.8);
    }
    .cin-subheader{
        display:flex;
        align-items:center;
        justify-content:space-between;
        font-size:0.78rem;
        color:rgba(148,163,184,0.95);
        margin-bottom:0.4rem;
    }
    .cin-count-chip{
        font-size:0.68rem;
        padding:2px 8px;
        border-radius:999px;
        border:1px solid rgba(148,163,184,0.45);
        color:rgba(209,213,219,0.95);
    }
    .cin-pill-row{
        display:flex;
        flex-wrap:wrap;
        gap:6px;
    }
    .cin-problem-bars{
        display:flex;
        flex-direction:column;
        gap:0.6rem;
        margin-top:0.2rem;
    }
    .cin-problem-row{
        display:flex;
        flex-direction:column;
        gap:3px;
    }
    .cin-problem-label{
        display:flex;
        align-items:center;
        justify-content:space-between;
        font-size:0.75rem;
        color:rgba(226,232,240,0.9);
    }
    .cin-problem-max{
        color:rgba(148,163,184,0.9);
        font-weight:400;
    }
    .cin-problem-track{
        height:4px;
        border-radius:999px;
        background:rgba(15,23,42,1);
        overflow:hidden;
    }
    .cin-problem-fill{
        height:100%;
        border-radius:999px;
        transition:width 1.4s cubic-bezier(0.16,1,0.3,1);
    }
    .cin-interviews{
        margin-top:0.5rem;
        display:flex;
        flex-direction:column;
        gap:0.6rem;
    }
    .cin-interview-row{
        border-radius:12px;
        padding:0.65rem 0.7rem;
        background:rgba(15,23,42,0.95);
        border:1px solid rgba(30,64,175,0.65);
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:0.8rem;
    }
    .cin-interview-main h3{
        font-size:0.84rem;
        font-weight:600;
        color:rgba(226,232,240,0.98);
        margin-bottom:2px;
    }
    .cin-interview-date{
        font-size:0.72rem;
        color:rgba(148,163,184,0.92);
        display:inline-flex;
        align-items:center;
        gap:4px;
    }
    .cin-interview-meta{
        display:flex;
        align-items:center;
        gap:6px;
        flex-shrink:0;
    }
    .cin-score{
        font-size:0.82rem;
        font-weight:800;
        color:#bfdbfe;
    }
    .cin-empty{
        padding:1.5rem 1.2rem;
        border-radius:18px;
        border:1px dashed rgba(51,65,85,0.9);
        background:rgba(15,23,42,0.9);
        display:flex;
        align-items:center;
        gap:0.8rem;
        color:rgba(148,163,184,0.9);
        font-size:0.8rem;
    }
    .cin-empty-icon{
        font-size:1.1rem;
    }

    /* ── Interactive 3D template (refined hero) ──────────────── */
    .pub-3d {
        min-height: 100vh;
        background:
            radial-gradient(circle at top, rgba(var(--accent-rgb),0.35) 0, transparent 55%),
            radial-gradient(circle at bottom left, rgba(56,189,248,0.25) 0, transparent 55%),
            #020617;
        display:flex;
        flex-direction:column;
    }
    .three-shell {
        max-width: 1120px;
        margin: 2.6rem auto 1.5rem;
        padding: 0 1.5rem;
    }
    .three-stage {
        position:relative;
        border-radius:30px;
        padding:1.8rem 1.8rem 1.9rem;
        background:
            radial-gradient(circle at top, rgba(15,23,42,0.2) 0, transparent 55%),
            linear-gradient(160deg, rgba(15,23,42,0.98), rgba(15,23,42,0.96));
        border:1px solid rgba(148,163,184,0.35);
        box-shadow:
            0 30px 90px rgba(15,23,42,0.95),
            0 0 0 1px rgba(15,23,42,0.9) inset;
        overflow:hidden;
        display:grid;
        grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);
        gap:1.5rem;
    }
    .three-card {
        position:relative;
    }
    .three-hero {
        padding-right:1.5rem;
    }
    .three-rail {
        position:relative;
    }
    .three-chip-row {
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        margin-top:0.5rem;
    }
    .three-chip {
        font-size:0.7rem;
        padding:4px 9px;
        border-radius:999px;
        border:1px solid rgba(148,163,184,0.5);
        color:rgba(226,232,240,0.88);
        background:rgba(15,23,42,0.9);
    }
    .three-chip-main {
        border-color:rgba(129,140,248,0.85);
        background:rgba(30,64,175,0.75);
        color:#e0e7ff;
    }
    .three-name {
        font-size:2.8rem;
        letter-spacing:-0.09em;
        font-weight:900;
        margin:0 0 0.3rem;
        background:linear-gradient(120deg,#e5e7eb 0,#f9fafb 40%,rgba(148,163,184,0.9) 100%);
        -webkit-background-clip:text;
        -webkit-text-fill-color:transparent;
    }
    .three-role {
        font-size:0.9rem;
        text-transform:uppercase;
        letter-spacing:0.24em;
        color:rgba(148,163,184,0.96);
        margin-bottom:1.1rem;
    }
    .three-bio {
        font-size:0.9rem;
        color:rgba(203,213,225,0.9);
        line-height:1.7;
        max-width:520px;
        margin-bottom:1.3rem;
    }
    .three-hero-footer {
        display:flex;
        flex-wrap:wrap;
        gap:0.9rem;
        align-items:center;
        justify-content:space-between;
    }
    .three-links {
        display:flex;
        flex-wrap:wrap;
        gap:7px;
    }
    .three-link {
        display:inline-flex;
        align-items:center;
        gap:6px;
        font-size:0.78rem;
        padding:7px 12px;
        border-radius:999px;
        border:1px solid rgba(148,163,184,0.55);
        color:rgba(226,232,240,0.96);
        background: rgba(15,23,42,0.85);
        text-decoration:none;
        transition:all 0.2s;
    }
    .three-link:hover {
        border-color:rgba(248,250,252,0.95);
        background:rgba(15,23,42,0.98);
        transform:translateY(-1px);
    }
    .three-meta {
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        font-size:0.7rem;
        color:rgba(148,163,184,0.9);
        text-transform:uppercase;
        letter-spacing:0.15em;
    }
    .three-avatar-wrap {
        width:72px;
        height:72px;
        border-radius:999px;
        padding:3px;
        background:conic-gradient(from 210deg, rgba(var(--accent-rgb),0.45), rgba(56,189,248,0.55), rgba(129,140,248,0.7), rgba(15,23,42,1));
        box-shadow:0 18px 55px rgba(15,23,42,0.9);
    }
    .three-avatar-inner {
        width:100%;
        height:100%;
        border-radius:999px;
        background:#020617;
        display:flex;
        align-items:center;
        justify-content:center;
        overflow:hidden;
    }
    .three-stats {
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:8px;
        margin-top:1.3rem;
        padding-top:0.9rem;
        border-top:1px solid rgba(51,65,85,0.9);
    }
    .three-stat {
        padding:0.4rem 0.1rem;
    }
    .three-stat-label {
        font-size:0.65rem;
        color:rgba(148,163,184,0.88);
        text-transform:uppercase;
        letter-spacing:0.14em;
        margin-bottom:3px;
    }
    .three-stat-value {
        font-size:1.05rem;
        font-weight:800;
        color:#e5e7eb;
        letter-spacing:-0.04em;
    }
    .three-track-label {
        font-size:0.7rem;
        color:rgba(148,163,184,0.95);
        margin-bottom:0.4rem;
        text-transform:uppercase;
        letter-spacing:0.14em;
    }
    .three-track {
        display:flex;
        gap:10px;
    }
    .three-track-col {
        flex:1;
        display:flex;
        flex-direction:column;
        gap:6px;
    }
    .three-pill {
        border-radius:999px;
        padding:5px 10px;
        font-size:0.72rem;
        border:1px solid rgba(30,64,175,0.7);
        background:rgba(15,23,42,0.9);
        color:rgba(226,232,240,0.96);
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
    }
    .three-score {
        font-size:0.72rem;
        font-weight:700;
        color:#22c55e;
    }
    .three-orbit {
        position:absolute;
        inset:0;
        display:flex;
        align-items:center;
        justify-content:center;
        pointer-events:none;
    }
    .three-orbit-ring {
        width:260px;
        height:260px;
        border-radius:999px;
        border:1px dashed rgba(148,163,184,0.3);
        position:relative;
    }
    .three-orbit-dot {
        position:absolute;
        width:42px;
        height:42px;
        border-radius:16px;
        background:rgba(15,23,42,0.96);
        border:1px solid rgba(148,163,184,0.35);
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 12px 35px rgba(15,23,42,0.95);
    }
    .three-orbit-dot:nth-child(1){ top:-10px; left:50%; transform:translateX(-50%);}
    .three-orbit-dot:nth-child(2){ right:-6px; top:50%; transform:translateY(-50%);}
    .three-orbit-dot:nth-child(3){ bottom:-8px; left:50%; transform:translateX(-50%);}
    .three-orbit-dot:nth-child(4){ left:-6px; top:50%; transform:translateY(-50%);}

    .three-projects {
        margin-top:0.5rem;
        border-radius:18px;
        border:1px solid rgba(30,64,175,0.5);
        background:rgba(15,23,42,0.96);
        padding:1.1rem 1rem 1.1rem;
    }
    .three-projects-header {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:0.8rem;
        margin-bottom:0.9rem;
    }
    .three-projects-title {
        display:flex;
        align-items:center;
        gap:0.55rem;
        font-size:0.8rem;
        text-transform:uppercase;
        letter-spacing:0.2em;
        color:#bfdbfe;
    }
    .three-projects-tag {
        font-size:0.7rem;
        color:rgba(148,163,184,0.9);
    }
    .three-project-grid {
        display:flex;
        flex-direction:column;
        gap:0.55rem;
    }
    .three-project-row {
        border-radius:12px;
        padding:0.7rem 0.75rem;
        background:rgba(15,23,42,0.98);
        border:1px solid rgba(30,64,175,0.6);
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:0.7rem;
        cursor:pointer;
        transition:transform 0.15s, box-shadow 0.15s, border-color 0.15s, background 0.15s;
    }
    .three-project-row:hover {
        transform:translateY(-2px);
        box-shadow:0 16px 55px rgba(15,23,42,0.9);
        border-color:rgba(129,140,248,0.95);
        background:rgba(15,23,42,1);
    }
    .three-project-main h3 {
        font-size:0.86rem;
        font-weight:700;
        color:#e5e7eb;
        margin-bottom:2px;
    }
    .three-project-desc {
        font-size:0.75rem;
        color:rgba(148,163,184,0.95);
        line-height:1.6;
    }
    .three-project-meta {
        display:flex;
        flex-direction:column;
        align-items:flex-end;
        gap:4px;
        flex-shrink:0;
    }
    .three-tech-row {
        display:flex;
        flex-wrap:wrap;
        gap:4px;
        justify-content:flex-end;
    }
    .three-tech-pill {
        font-size:0.65rem;
        padding:2px 7px;
        border-radius:999px;
        border:1px solid rgba(148,163,184,0.55);
        color:rgba(209,213,219,0.95);
    }
    .three-project-link {
        font-size:0.7rem;
        color:#93c5fd;
        display:inline-flex;
        align-items:center;
        gap:4px;
        text-decoration:none;
    }
    .three-side {
        display:flex;
        flex-direction:column;
        gap:1rem;
    }
    .three-side-block {
        border-radius:18px;
        background:rgba(15,23,42,0.98);
        border:1px solid rgba(30,64,175,0.7);
        padding:1rem 1rem 1.1rem;
    }
    .three-side-title {
        font-size:0.78rem;
        text-transform:uppercase;
        letter-spacing:0.18em;
        color:rgba(148,163,184,0.96);
        margin-bottom:0.5rem;
        display:flex;
        align-items:center;
        gap:0.4rem;
    }
    .three-skill-cloud {
        display:flex;
        flex-wrap:wrap;
        gap:6px;
    }
    .three-mini-list {
        display:flex;
        flex-direction:column;
        gap:0.4rem;
        font-size:0.74rem;
        color:rgba(203,213,225,0.96);
    }
    .three-mini-row {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:0.6rem;
    }
    .three-mini-meta {
        font-size:0.68rem;
        color:rgba(148,163,184,0.9);
    }

    @media(max-width:1024px){
        .three-shell {
            margin-top:2.2rem;
        }
        .three-stage {
            grid-template-columns:1fr;
            padding:1.6rem 1.4rem 1.7rem;
        }
        .three-hero {
            padding-right:0;
        }
    }
    @media(max-width:768px){
        .three-shell {
            padding:0 1rem;
        }
        .three-name {
            font-size:2rem;
        }
        .three-stage {
            gap:1.2rem;
        }
    }

    @media(max-width:1024px){
        .cin-hero-main{
            flex-direction:column;
            align-items:flex-start;
        }
        .cin-hero-profile{
            align-items:flex-start;
        }
        .cin-hero-stats{
            width:100%;
        }
        .cin-section-split{
            grid-template-columns:1fr;
        }
    }
    @media(max-width:768px){
        .cin-hero{
            min-height:auto;
            padding:3rem 0 2.2rem;
        }
        .cin-main-inner{
            padding:0 1rem;
        }
        .cin-hero-content{
            padding:0 1rem;
        }
        .cin-name{
            font-size:2.1rem;
        }
        .cin-section{
            padding:1.2rem 1rem 1.2rem;
        }
        .cin-column{
            padding:1.2rem 1rem 1.2rem;
        }
    }
    @media(max-width:480px){
        .cin-hero-main{
            gap:1.6rem;
        }
        .cin-name{
            font-size:1.7rem;
        }
        .cin-hero-stats{
            grid-template-columns:repeat(2, minmax(0,1fr));
        }
    }
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

    // Interactive 3D template
    if (template === 'Interactive3D') {
        return (
            <div className="pub pub-3d">
                <style>{CSS}</style>

                {/* Top nav (shared) */}
                <nav className="pub-nav" style={{ height: '56px', borderBottom: '1px solid var(--divide)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <img src="/logo.jpeg" alt="Whizan AI" style={{ width: '26px', height: '26px', borderRadius: '7px' }} />
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.3px', color: 'var(--txt1)' }}>Whizan AI</span>
                    </div>

                    <div className="pub-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => navigate('/dsaquestion')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>Problems</button>
                        <button onClick={() => navigate('/aiinterviewselect')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>AI Interview</button>
                        <button onClick={() => navigate('/systemdesign')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>System Design</button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="pub-nav-badge" style={{ fontSize: '0.72rem', color: 'var(--txt3)', background: 'var(--pill-bg)', padding: '4px 10px', borderRadius: '999px', border: '1px solid var(--pill-border)', fontWeight: 600 }}>Interactive 3D Portfolio</span>
                        <NavProfile />
                    </div>
                </nav>

                <div className="three-shell">
                    <div className="three-stage">
                        {/* Left: hero text */}
                        <section className="three-card three-hero">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem' }}>
                                <div className="three-avatar-wrap">
                                    <div className="three-avatar-inner">
                                        {profile.photoURL ? (
                                            <img src={profile.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <User size={38} color="var(--accent)" opacity={0.7} />
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.95)' }}>Portfolio</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e7eb' }}>{profile.displayName || 'Developer'}</span>
                                </div>
                            </div>

                            <div style={{ maxWidth: 560 }}>
                                <h1 className="three-name">{profile.displayName || 'Developer Portfolio'}</h1>
                                <div className="three-role">
                                    {profile.currentRole || profile.role || 'Software Engineer'}
                                </div>
                                {profile.bio && (
                                    <p className="three-bio">{profile.bio}</p>
                                )}

                                <div className="three-chip-row">
                                    {profile.location && (
                                        <span className="three-chip three-chip-main">
                                            <MapPin size={12} /> {profile.location}
                                        </span>
                                    )}
                                    {prefs.showInterviews && validInvCount > 0 && (
                                        <span className="three-chip">
                                            <Brain size={12} /> {validInvCount} mock interviews
                                        </span>
                                    )}
                                    {prefs.showStats && (
                                        <span className="three-chip">
                                            <Code2 size={12} /> {stats?.Total || 0} problems
                                        </span>
                                    )}
                                </div>

                                <div className="three-hero-footer" style={{ marginTop: '1.4rem' }}>
                                    <div className="three-links">
                                        {profile.github && (
                                            <a href={`https://${profile.github}`} target="_blank" rel="noreferrer" className="three-link">
                                                <Github size={14} />
                                                <span>GitHub</span>
                                            </a>
                                        )}
                                        {profile.linkedin && (
                                            <a href={`https://${profile.linkedin}`} target="_blank" rel="noreferrer" className="three-link">
                                                <Linkedin size={14} />
                                                <span>LinkedIn</span>
                                            </a>
                                        )}
                                        {profile.resume && (
                                            <a href={profile.resume} target="_blank" rel="noreferrer" className="three-link">
                                                <FileText size={14} />
                                                <span>Resume</span>
                                            </a>
                                        )}
                                    </div>

                                    <div className="three-meta">
                                        <span>Interactive 3D view</span>
                                        <span>Optimized for recruiters</span>
                                    </div>
                                </div>
                            </div>

                            {prefs.showStats && (
                                <div className="three-stats">
                                    <div className="three-stat">
                                        <span className="three-stat-label">Problems solved</span>
                                        <span className="three-stat-value">{stats?.Total || 0}</span>
                                    </div>
                                    <div className="three-stat">
                                        <span className="three-stat-label">Mock interviews</span>
                                        <span className="three-stat-value">{validInvCount}</span>
                                    </div>
                                    <div className="three-stat">
                                        <span className="three-stat-label">Avg score</span>
                                        <span className="three-stat-value">{avg || '—'}</span>
                                    </div>
                                </div>
                            )}

                            {prefs.showInterviews && recentInv.length > 0 && (
                                <div style={{ marginTop: '1.1rem' }}>
                                    <div className="three-track-label">Interview signals</div>
                                    <div className="three-track">
                                        <div className="three-track-col">
                                            {recentInv.slice(0, 2).map((inv, i) => {
                                                const sc = inv.overallScore;
                                                const dt = inv.createdAt
                                                    ? (inv.createdAt?.toDate ? inv.createdAt.toDate() : new Date(inv.createdAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                    : '—';
                                                return (
                                                    <div key={i} className="three-pill">
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                                                            {inv.problemTitle || 'Mock Interview'}
                                                        </span>
                                                        <span className="three-score">
                                                            {sc != null ? `${sc}/100` : dt}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="three-track-col">
                                            {recentInv.slice(2, 4).map((inv, i) => {
                                                const sc = inv.overallScore;
                                                const dt = inv.createdAt
                                                    ? (inv.createdAt?.toDate ? inv.createdAt.toDate() : new Date(inv.createdAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                    : '—';
                                                return (
                                                    <div key={i} className="three-pill">
                                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                                                            {inv.problemTitle || 'Mock Interview'}
                                                        </span>
                                                        <span className="three-score">
                                                            {sc != null ? `${sc}/100` : dt}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Right: orbit visual + projects + side info */}
                        <div className="three-rail">
                            {/* Orbit visual */}
                            <div style={{ position: 'relative', minHeight: 260 }}>
                                <div className="three-orbit">
                                    <div className="three-orbit-ring">
                                        <div className="three-orbit-dot">
                                            <Code2 size={18} color="var(--accent)" />
                                        </div>
                                        <div className="three-orbit-dot">
                                            <Brain size={18} color="#38bdf8" />
                                        </div>
                                        <div className="three-orbit-dot">
                                            <Award size={18} color="#eab308" />
                                        </div>
                                        <div className="three-orbit-dot">
                                            <Github size={18} color="#9ca3af" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Projects rail */}
                            <section className="three-projects">
                                <div className="three-projects-header">
                                    <div className="three-projects-title">
                                        <Code2 size={14} />
                                        <span>Projects</span>
                                    </div>
                                    {hasProjects && (
                                        <span className="three-projects-tag">
                                            {profile.projects.length} shipped
                                        </span>
                                    )}
                                </div>

                                {hasProjects ? (
                                    <div className="three-project-grid">
                                        {profile.projects.slice(0, 4).map((p, i) => (
                                            <div
                                                key={i}
                                                className="three-project-row"
                                                onClick={() => p.detailedData && navigate(`/public/${uid}/project/${i}`)}
                                                style={{ cursor: p.detailedData ? 'pointer' : 'default' }}
                                            >
                                                <div className="three-project-main">
                                                    <h3>{p.name}</h3>
                                                    {p.desc && (
                                                        <div className="three-project-desc">
                                                            {p.desc.length > 120 ? `${p.desc.slice(0, 120)}…` : p.desc}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="three-project-meta">
                                                    {Array.isArray(p.tech) && p.tech.length > 0 && (
                                                        <div className="three-tech-row">
                                                            {p.tech.slice(0, 3).map(t => (
                                                                <span key={t} className="three-tech-pill">
                                                                    {t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {p.link && (
                                                        <a
                                                            href={p.link.startsWith('http') ? p.link : `https://${p.link}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={e => e.stopPropagation()}
                                                            className="three-project-link"
                                                        >
                                                            <ExternalLink size={11} /> Live / Repo
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="cin-empty">
                                        <span className="cin-empty-icon">✦</span>
                                        <p>No projects added yet — add some from your dashboard to showcase here.</p>
                                    </div>
                                )}
                            </section>

                            {/* Side info blocks */}
                            <div className="three-side">
                                {hasSkills && (
                                    <section className="three-side-block">
                                        <div className="three-side-title">
                                            <Code2 size={13} />
                                            Tech stack
                                        </div>
                                        <div className="three-skill-cloud">
                                            {profile.skills.slice(0, 12).map(s => {
                                                const icon = devIcon(s);
                                                return (
                                                    <span key={s} className="skill-pill">
                                                        {icon && (
                                                            <img
                                                                src={icon}
                                                                alt={s}
                                                                style={{ width: 14, height: 14 }}
                                                                onError={e => (e.target.style.display = 'none')}
                                                            />
                                                        )}
                                                        {s}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}

                                {hasExperience && (
                                    <section className="three-side-block">
                                        <div className="three-side-title">
                                            <Briefcase size={13} />
                                            Experience
                                        </div>
                                        <div className="three-mini-list">
                                            {profile.experience.slice(0, 3).map((e, i) => (
                                                <div key={i} className="three-mini-row">
                                                    <span style={{ fontWeight: 600 }}>
                                                        {e.role}
                                                    </span>
                                                    <span className="three-mini-meta">
                                                        {e.company} {e.duration ? `· ${e.duration}` : ''}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {hasEducation && (
                                    <section className="three-side-block">
                                        <div className="three-side-title">
                                            <GraduationCap size={13} />
                                            Education
                                        </div>
                                        <div className="three-mini-list">
                                            {profile.education.slice(0, 2).map((e, i) => (
                                                <div key={i} className="three-mini-row">
                                                    <span style={{ fontWeight: 600 }}>
                                                        {e.degree}
                                                    </span>
                                                    <span className="three-mini-meta">
                                                        {e.institution} {e.year ? `· ${e.year}` : ''}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ borderTop: '1px solid var(--divide)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
                    <img src="/logo.jpeg" alt="Whizan AI" style={{ width: '18px', height: '18px', borderRadius: '4px', opacity: 0.5 }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--txt3)', fontWeight: 500 }}>
                        Powered by <strong style={{ color: 'var(--txt2)' }}>Whizan AI</strong> — Build your coding career
                    </span>
                </div>
            </div>
        );
    }

    // Alternate cinematic template
    if (template === 'Cinematic') {
        return (
            <div className="pub pub-cinematic">
                <style>{CSS}</style>

                {/* Top nav (shared) */}
                <nav className="pub-nav" style={{ height: '56px', borderBottom: '1px solid var(--divide)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <img src="/logo.jpeg" alt="Whizan AI" style={{ width: '26px', height: '26px', borderRadius: '7px' }} />
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.3px', color: 'var(--txt1)' }}>Whizan AI</span>
                    </div>

                    <div className="pub-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => navigate('/dsaquestion')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>Problems</button>
                        <button onClick={() => navigate('/aiinterviewselect')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>AI Interview</button>
                        <button onClick={() => navigate('/systemdesign')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>System Design</button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="pub-nav-badge" style={{ fontSize: '0.72rem', color: 'var(--txt3)', background: 'var(--pill-bg)', padding: '4px 10px', borderRadius: '999px', border: '1px solid var(--pill-border)', fontWeight: 600 }}>Cinematic Portfolio</span>
                        <NavProfile />
                    </div>
                </nav>

                {/* Cinematic hero */}
                <section className="cin-hero">
                    <div className="cin-hero-backdrop" />
                    <div className="cin-hero-overlay" />
                    <div className="cin-hero-content">
                        <div className="cin-hero-main">
                            <div className="cin-hero-text">
                                <div className="cin-hero-kicker">
                                    <span className="cin-dot" />
                                    <span>Portfolio · Whizan AI</span>
                                </div>
                                <h1 className="cin-name">
                                    {profile.displayName || 'Developer Portfolio'}
                                </h1>
                                <p className="cin-role">
                                    {profile.currentRole || profile.role || 'Software Engineer'}
                                </p>
                                {profile.bio && (
                                    <p className="cin-bio">
                                        {profile.bio}
                                    </p>
                                )}

                                <div className="cin-meta-row">
                                    {profile.location && (
                                        <span className="cin-meta-pill">
                                            <MapPin size={13} /> {profile.location}
                                        </span>
                                    )}
                                    {profile.experience?.[0]?.company && (
                                        <span className="cin-meta-pill">
                                            <Briefcase size={13} /> {profile.experience[0].company}
                                        </span>
                                    )}
                                    {prefs.showInterviews && validInvCount > 0 && (
                                        <span className="cin-meta-pill">
                                            <Brain size={13} /> {validInvCount} mock interviews
                                        </span>
                                    )}
                                </div>

                                <div className="cin-links">
                                    {profile.github && (
                                        <a
                                            href={`https://${profile.github}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="cin-btn cin-btn-primary"
                                        >
                                            <Github size={15} />
                                            <span>GitHub</span>
                                        </a>
                                    )}
                                    {profile.linkedin && (
                                        <a
                                            href={`https://${profile.linkedin}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="cin-btn cin-btn-outline"
                                        >
                                            <Linkedin size={15} />
                                            <span>LinkedIn</span>
                                        </a>
                                    )}
                                    {profile.resume && (
                                        <a
                                            href={profile.resume}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="cin-btn cin-btn-ghost"
                                        >
                                            <FileText size={15} />
                                            <span>Resume</span>
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="cin-hero-profile">
                                <div className="cin-avatar-wrap">
                                    <div className="cin-avatar-ring">
                                        <div className="cin-avatar-inner">
                                            {profile.photoURL ? (
                                                <img
                                                    src={profile.photoURL}
                                                    alt="Avatar"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <User size={56} color="var(--accent)" opacity={0.5} />
                                            )}
                                        </div>
                                    </div>
                                    <div className="cin-availability">
                                        <span className="cin-availability-dot" />
                                        <span>Open to opportunities</span>
                                    </div>
                                </div>

                                {prefs.showStats && (
                                    <div className="cin-hero-stats">
                                        <div className="cin-hero-stat">
                                            <span className="cin-hero-stat-label">Problems solved</span>
                                            <span className="cin-hero-stat-value">{stats?.Total || 0}</span>
                                        </div>
                                        <div className="cin-hero-stat">
                                            <span className="cin-hero-stat-label">Mock interviews</span>
                                            <span className="cin-hero-stat-value">{validInvCount}</span>
                                        </div>
                                        <div className="cin-hero-stat">
                                            <span className="cin-hero-stat-label">Avg. interview score</span>
                                            <span className="cin-hero-stat-value">
                                                {avg ? `${avg}` : '—'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main cinematic layout */}
                <main className="cin-main">
                    <div className="cin-main-inner">
                        <section className="cin-section">
                            <header className="cin-section-header">
                                <div className="cin-section-title">
                                    <Code2 size={18} color="var(--accent)" />
                                    <div>
                                        <h2>Featured work</h2>
                                        <p>Selected projects that represent my craft.</p>
                                    </div>
                                </div>
                            </header>
                            {hasProjects ? (
                                <div className="cin-projects">
                                    {(profile.projects || []).map((p, i) => (
                                        <article
                                            key={i}
                                            className="cin-project-card"
                                            onClick={() => p.detailedData && navigate(`/public/${uid}/project/${i}`)}
                                            style={{ cursor: p.detailedData ? 'pointer' : 'default' }}
                                        >
                                            <div className="cin-project-header">
                                                <div className="cin-project-title-wrap">
                                                    <h3>{p.name}</h3>
                                                    {p.tagline && <p className="cin-project-tagline">{p.tagline}</p>}
                                                </div>
                                                <div className="cin-project-meta">
                                                    {p.detailedData && (
                                                        <span className="cin-chip cin-chip-accent">
                                                            AI case study
                                                        </span>
                                                    )}
                                                    {p.link && (
                                                        <a
                                                            href={p.link.startsWith('http') ? p.link : `https://${p.link}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={e => e.stopPropagation()}
                                                            className="cin-icon-link"
                                                        >
                                                            <ExternalLink size={14} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            {p.desc && (
                                                <p className="cin-project-desc">
                                                    {p.desc.length > 160 ? `${p.desc.slice(0, 160)}…` : p.desc}
                                                </p>
                                            )}
                                            <div className="cin-project-footer">
                                                {Array.isArray(p.tech) && p.tech.length > 0 && (
                                                    <div className="cin-tech-row">
                                                        {p.tech.slice(0, 4).map(t => (
                                                            <span key={t} className="cin-chip">
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {p.detailedData && (
                                                    <div className="cin-project-cta">
                                                        <span>View interview-ready breakdown</span>
                                                        <ChevronRight size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="cin-empty">
                                    <span className="cin-empty-icon">✦</span>
                                    <p>Projects will appear here once added.</p>
                                </div>
                            )}
                        </section>

                        <section className="cin-section cin-section-split">
                            <div className="cin-column">
                                {hasExperience && (
                                    <div className="cin-block">
                                        <header className="cin-section-header">
                                            <div className="cin-section-title">
                                                <Briefcase size={18} color="#f59e0b" />
                                                <div>
                                                    <h2>Experience</h2>
                                                    <p>Roles that shaped my engineering perspective.</p>
                                                </div>
                                            </div>
                                        </header>
                                        <div className="cin-timeline">
                                            {profile.experience.map((e, i) => (
                                                <div key={i} className="cin-timeline-item">
                                                    <div className="cin-timeline-marker" />
                                                    <div className="cin-timeline-content">
                                                        <h3>{e.role}</h3>
                                                        <div className="cin-timeline-meta">
                                                            {e.company && <span>{e.company}</span>}
                                                            {e.duration && (
                                                                <span>
                                                                    <Calendar size={11} /> {e.duration}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {e.summary && (
                                                            <p className="cin-timeline-desc">{e.summary}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {prefs.showInterviews && recentInv.length > 0 && (
                                    <div className="cin-block">
                                        <header className="cin-section-header">
                                            <div className="cin-section-title">
                                                <Brain size={18} color="#3b82f6" />
                                                <div>
                                                    <h2>Mock interviews</h2>
                                                    <p>Signals from recent AI-driven interviews.</p>
                                                </div>
                                            </div>
                                        </header>
                                        <div className="cin-interviews">
                                            {recentInv.map((inv, i) => {
                                                const hire = inv.scoreReport?.hire || '';
                                                const hC = hire.includes('Strong Hire') ? '#10b981' : hire.includes('No Hire') ? '#ef4444' : '#f59e0b';
                                                const sc = inv.overallScore;
                                                const dt = inv.createdAt
                                                    ? (inv.createdAt?.toDate
                                                        ? inv.createdAt.toDate()
                                                        : new Date(inv.createdAt)
                                                    ).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })
                                                    : '—';
                                                return (
                                                    <article key={i} className="cin-interview-row">
                                                        <div className="cin-interview-main">
                                                            <h3>{inv.problemTitle || 'Mock Interview'}</h3>
                                                            <span className="cin-interview-date">
                                                                <Calendar size={11} /> {dt}
                                                            </span>
                                                        </div>
                                                        <div className="cin-interview-meta">
                                                            {hire && (
                                                                <span
                                                                    className="cin-chip"
                                                                    style={{
                                                                        color: hC,
                                                                        borderColor: `${hC}55`,
                                                                        background: `${hC}15`,
                                                                    }}
                                                                >
                                                                    {hire}
                                                                </span>
                                                            )}
                                                            {sc != null && (
                                                                <span className="cin-score">
                                                                    {sc}/100
                                                                </span>
                                                            )}
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="cin-column">
                                {(hasSkills || hasCerts) && (
                                    <div className="cin-block">
                                        <header className="cin-section-header">
                                            <div className="cin-section-title">
                                                <Code2 size={18} color="#3b82f6" />
                                                <div>
                                                    <h2>Profile</h2>
                                                    <p>Skills and signals recruiters care about.</p>
                                                </div>
                                            </div>
                                        </header>
                                        {hasSkills && (
                                            <div className="cin-subblock">
                                                <div className="cin-subheader">
                                                    <span>Tech stack</span>
                                                    <span className="cin-count-chip">
                                                        {profile.skills.length} skills
                                                    </span>
                                                </div>
                                                <div className="cin-pill-row">
                                                    {profile.skills.map(s => {
                                                        const icon = devIcon(s);
                                                        return (
                                                            <span key={s} className="skill-pill">
                                                                {icon && (
                                                                    <img
                                                                        src={icon}
                                                                        alt={s}
                                                                        style={{ width: 16, height: 16 }}
                                                                        onError={e => (e.target.style.display = 'none')}
                                                                    />
                                                                )}
                                                                {s}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        {hasCerts && (
                                            <div className="cin-subblock">
                                                <div className="cin-subheader">
                                                    <span>Certifications</span>
                                                    <span className="cin-count-chip">
                                                        {profile.certifications.length} earned
                                                    </span>
                                                </div>
                                                <div className="cin-pill-row">
                                                    {profile.certifications.map(c => (
                                                        <span key={c} className="cert-pill">
                                                            <CheckCircle size={11} />
                                                            {c}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {prefs.showStats && stats?.Total > 0 && (
                                            <div className="cin-subblock">
                                                <div className="cin-subheader">
                                                    <span>Problem stats</span>
                                                </div>
                                                <div className="cin-problem-bars">
                                                    {[{ label: 'Easy', color: '#10b981', v: stats?.Easy || 0, m: totalCounts?.Easy || 1 }, { label: 'Medium', color: '#f59e0b', v: stats?.Medium || 0, m: totalCounts?.Medium || 1 }, { label: 'Hard', color: '#ef4444', v: stats?.Hard || 0, m: totalCounts?.Hard || 1 }].map(d => (
                                                        <div key={d.label} className="cin-problem-row">
                                                            <div className="cin-problem-label">
                                                                <span style={{ color: d.color }}>{d.label}</span>
                                                                <span>
                                                                    {d.v}
                                                                    <span className="cin-problem-max">
                                                                        {' '}
                                                                        / {d.m}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            <div className="cin-problem-track">
                                                                <div
                                                                    className="cin-problem-fill"
                                                                    style={{
                                                                        width: `${(d.v / d.m) * 100}%`,
                                                                        background: d.color,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {hasEducation && (
                                    <div className="cin-block">
                                        <header className="cin-section-header">
                                            <div className="cin-section-title">
                                                <GraduationCap size={18} color="var(--accent)" />
                                                <div>
                                                    <h2>Education</h2>
                                                    <p>Academic foundations.</p>
                                                </div>
                                            </div>
                                        </header>
                                        <div className="cin-timeline">
                                            {profile.education.map((e, i) => (
                                                <div key={i} className="cin-timeline-item">
                                                    <div className="cin-timeline-marker" />
                                                    <div className="cin-timeline-content">
                                                        <h3>{e.degree}</h3>
                                                        <div className="cin-timeline-meta">
                                                            {e.institution && <span>{e.institution}</span>}
                                                            {e.year && (
                                                                <span>
                                                                    <Calendar size={11} /> {e.year}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </main>

                {/* Footer (shared) */}
                <div style={{ borderTop: '1px solid var(--divide)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '2rem' }}>
                    <img src="/logo.jpeg" alt="Whizan AI" style={{ width: '18px', height: '18px', borderRadius: '4px', opacity: 0.5 }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--txt3)', fontWeight: 500 }}>
                        Powered by <strong style={{ color: 'var(--txt2)' }}>Whizan AI</strong> — Build your coding career
                    </span>
                </div>
            </div>
        );
    }

    // Default template (existing beautiful layout)
    return (
        <div className="pub">
            <style>{CSS}</style>

            {/* ── Top nav ── */}
            <nav className="pub-nav" style={{ height: '56px', borderBottom: '1px solid var(--divide)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="Whizan AI" style={{ width: '26px', height: '26px', borderRadius: '7px' }} />
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.3px', color: 'var(--txt1)' }}>Whizan AI</span>
                </div>

                <div className="pub-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => navigate('/dsaquestion')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>Problems</button>
                    <button onClick={() => navigate('/aiinterviewselect')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>AI Interview</button>
                    <button onClick={() => navigate('/systemdesign')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>System Design</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="pub-nav-badge" style={{ fontSize: '0.72rem', color: 'var(--txt3)', background: 'var(--pill-bg)', padding: '4px 10px', borderRadius: '999px', border: '1px solid var(--pill-border)', fontWeight: 600 }}>Public Portfolio</span>
                    <NavProfile />
                </div>
            </nav>

            {/* ── Hero section ── */}
            <div style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--divide)', background: `linear-gradient(180deg,rgba(var(--accent-rgb),0.1) 0%, transparent 100%)` }}>
                {/* BG grid */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--divide) 1px,transparent 1px),linear-gradient(90deg,var(--divide) 1px,transparent 1px)', backgroundSize: '60px 60px', opacity: 0.5 }} />
                {/* BG orbs */}
                <div style={{ position: 'absolute', top: '-80px', left: '10%', width: '500px', height: '500px', background: `radial-gradient(circle,rgba(var(--accent-rgb),0.15),transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-100px', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(59,130,246,0.1),transparent 70%)', pointerEvents: 'none' }} />

                <div className="pub-hero-content" style={{ maxWidth: maxW, margin: '0 auto', padding: '4rem 2rem 3rem', position: 'relative', zIndex: 1, transition: 'max-width 0.3s' }}>
                    <div className="pub-hero-inner" style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap', animation: 'fadeUp 0.5s ease-out' }}>
                        {/* Avatar */}
                        <div className="pub-hero-avatar-wrap" style={{ flexShrink: 0, animation: 'scaleIn 0.5s ease-out', position: 'relative', display: 'inline-block' }}>
                            <div className="pub-hero-avatar" style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'var(--hero-grad)', padding: '3px', animation: 'glow 3s ease-in-out infinite' }}>
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: isDark ? '#0a0b12' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {profile.photoURL ? <img src={profile.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={50} color="var(--accent)" opacity={0.5} />}
                                </div>
                            </div>
                            {/* online dot - absolutely positioned bottom-right of avatar */}
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#10b981', border: `3px solid var(--bg)`, position: 'absolute', bottom: '4px', right: '4px' }} />
                        </div>

                        {/* Info */}
                        <div className="pub-hero-info" style={{ flex: 1, minWidth: '240px' }}>
                            <div className="pub-hero-name-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                <h1 className="pub-hero-name" style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, background: isDark ? 'linear-gradient(135deg,#fff 60%,rgba(255,255,255,0.5))' : 'linear-gradient(135deg,#000 60%,rgba(0,0,0,0.5))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    {profile.displayName || 'Developer Portfolio'}
                                </h1>
                                <span style={{ background: 'var(--hero-grad)', borderRadius: '8px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>PRO</span>
                            </div>

                            {profile.email && <div className="pub-hero-email" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--txt3)', fontSize: '0.85rem', marginBottom: '12px', fontWeight: 600 }}><Mail size={14} />{profile.email}</div>}

                            {profile.bio && <p style={{ fontSize: '1rem', color: 'var(--txt2)', margin: '0 0 1.2rem', lineHeight: 1.6, maxWidth: '600px', fontStyle: 'italic' }}>"{profile.bio}"</p>}

                            {/* Social links row */}
                            <div className="pub-hero-links" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                                {profile.github && <a href={`https://${profile.github}`} target="_blank" rel="noreferrer" className="slink" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.1)'}`, color: 'var(--txt1)' }}><Github size={14} />{profile.github.replace(/^https?:\/\//, '')}</a>}
                                {profile.linkedin && <a href={`https://${profile.linkedin}`} target="_blank" rel="noreferrer" className="slink" style={{ background: 'rgba(10,102,194,0.12)', border: '1px solid rgba(10,102,194,0.28)', color: isDark ? '#60a5fa' : '#084c94' }}><Linkedin size={14} />LinkedIn</a>}
                                {profile.portfolio && <a href={`https://${profile.portfolio}`} target="_blank" rel="noreferrer" className="slink" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: isDark ? '#34d399' : '#0d9467' }}><Globe size={14} />Portfolio</a>}
                                {profile.resume && <a href={profile.resume} target="_blank" rel="noreferrer" className="slink" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: isDark ? '#fcd34d' : '#d97706' }}><FileText size={14} />Resume / CV</a>}
                            </div>

                            {/* Quick meta */}
                            <div className="pub-hero-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.8rem', color: 'var(--txt3)', fontWeight: 600 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle size={13} color="#10b981" />Verified Whizan AI Member</span>
                                {prefs.showBadges && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Trophy size={13} color="#eab308" />{unlockedBadges} Achievements Unlocked</span>}
                                {prefs.showInterviews && validInvCount > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Brain size={13} color="var(--accent)" />{validInvCount} Mock Interviews</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stats row ── */}
            {prefs.showStats && (
                <div className="pub-stats-wrap" style={{ maxWidth: maxW, margin: '0 auto', padding: '2rem 2rem 0', transition: 'max-width 0.3s' }}>
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
            <div className="pub-content-wrap" style={{ maxWidth: maxW, margin: '0 auto', padding: '2rem', transition: 'max-width 0.3s' }}>
                <div className="pub-main-grid" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem' }}>

                    {/* ── LEFT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Skills */}
                        {hasSkills && (
                            <div className="glass pub-section-pad" style={{ padding: '1.5rem', animation: 'fadeUp 0.5s ease-out 0.15s both' }}>
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
                                        <div key={i} className="proj-card" onClick={() => p.detailedData && navigate(`/public/${uid}/project/${i}`)} style={{ cursor: p.detailedData ? 'pointer' : 'default' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
                                                <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Code2 size={16} color={isDark ? '#22d3ee' : '#0891b2'} />
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {p.detailedData && <span style={{ fontSize: '0.6rem', background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>AI DETAILS</span>}
                                                    {p.link && (
                                                        <a href={p.link.startsWith('http') ? p.link : `https://${p.link}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--txt3)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--accent)'} onMouseLeave={e => e.target.style.color = 'var(--txt3)'}>
                                                            <ExternalLink size={14} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--txt1)', marginBottom: '4px', lineHeight: 1.3 }}>{p.name}</div>
                                            {p.tagline && <div style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 600, marginBottom: '6px' }}>{p.tagline}</div>}
                                            {p.desc && <div style={{ fontSize: '0.78rem', color: 'var(--txt2)', lineHeight: 1.6, marginBottom: '10px' }}>{p.desc.length > 100 ? p.desc.slice(0, 100) + '...' : p.desc}</div>}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {p.link && (
                                                    <a href={p.link.startsWith('http') ? p.link : `https://${p.link}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: isDark ? '#22d3ee' : '#0891b2', fontWeight: 700, textDecoration: 'none' }}>
                                                        <Github size={11} /> GitHub
                                                    </a>
                                                )}
                                                {p.detailedData && (
                                                    <span style={{ fontSize: '0.72rem', color: '#a855f7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        View Details <ChevronRight size={10} />
                                                    </span>
                                                )}
                                            </div>
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
                <img src="/logo.jpeg" alt="Whizan AI" style={{ width: '18px', height: '18px', borderRadius: '4px', opacity: 0.5 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--txt3)', fontWeight: 500 }}>Powered by <strong style={{ color: 'var(--txt2)' }}>Whizan AI</strong> — Build your coding career</span>
            </div>
        </div>
    );
}