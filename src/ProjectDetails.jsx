import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import {
    Github, ExternalLink, ArrowUpRight, Folder, FileCode,
    ChevronRight, RefreshCw, Terminal, Zap, Shield,
    Layers, Cpu, Star, Award, Rocket, Code2, Globe, Lock,
    GitBranch, Package, Database, Server, Sparkles,
} from 'lucide-react';
import NavProfile from './NavProfile';
import { useSEO } from './hooks/useSEO';

// ─── Devicon map ────────────────────────────────────────────────
const DI = { react: 'react', javascript: 'javascript', typescript: 'typescript', python: 'python', nodejs: 'nodejs', 'node.js': 'nodejs', java: 'java', cpp: 'cplusplus', 'c++': 'cplusplus', c: 'c', go: 'go', rust: 'rust', swift: 'swift', kotlin: 'kotlin', dart: 'dart', flutter: 'flutter', html: 'html5', css: 'css3', sass: 'sass', tailwind: 'tailwindcss', mongodb: 'mongodb', postgres: 'postgresql', postgresql: 'postgresql', mysql: 'mysql', redis: 'redis', firebase: 'firebase', docker: 'docker', kubernetes: 'kubernetes', git: 'git', github: 'github', linux: 'linux', aws: 'amazonwebservices', gcp: 'googlecloud', azure: 'azure', graphql: 'graphql', nextjs: 'nextjs', 'next.js': 'nextjs', vuejs: 'vuejs', 'vue.js': 'vuejs', angular: 'angularjs', django: 'django', flask: 'flask', express: 'express', figma: 'figma', redux: 'redux', vite: 'vite' };
const devIcon = s => { const n = DI[s.toLowerCase().replace(/\s/g, '')]; return n ? `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${n}/${n}-original.svg` : null; };

// ─── Themes ─────────────────────────────────────────────────────
const THEMES = {
    Purple: { accent: '#a855f7', muted: '#7c3aed', rgb: '168,85,247', glow: '#a855f730' },
    Blue: { accent: '#3b82f6', muted: '#1d4ed8', rgb: '59,130,246', glow: '#3b82f630' },
    Emerald: { accent: '#10b981', muted: '#065f46', rgb: '16,185,129', glow: '#10b98130' },
    Amber: { accent: '#f59e0b', muted: '#b45309', rgb: '245,158,11', glow: '#f59e0b30' },
    Rose: { accent: '#f43f5e', muted: '#be123c', rgb: '244,63,94', glow: '#f43f5e30' },
    Cyan: { accent: '#06b6d4', muted: '#0e7490', rgb: '6,182,212', glow: '#06b6d430' },
};

// ─── Animated counter hook ───────────────────────────────────────
function useCounter(target, duration = 1800) {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    useEffect(() => {
        if (!started) return;
        let start = null;
        const step = ts => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(ease * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [started, target, duration]);
    return [count, setStarted];
}

// ─── Magnetic card hook ──────────────────────────────────────────
function useMagnetic(strength = 0.25) {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 200, damping: 20 });
    const sy = useSpring(y, { stiffness: 200, damping: 20 });
    const onMove = useCallback(e => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
    }, [x, y, strength]);
    const onLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
    return { ref, sx, sy, onMove, onLeave };
}

// ─── File Tree ───────────────────────────────────────────────────
function FileNode({ node, depth = 0 }) {
    const [open, setOpen] = useState(depth < 1);
    const isDir = node.type === 'folder' || node.children?.length > 0;
    return (
        <div style={{ marginLeft: depth * 16 }}>
            <motion.div
                onClick={() => isDir && setOpen(o => !o)}
                whileHover={{ x: 3 }}
                style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '5px 10px', borderRadius: 7,
                    cursor: isDir ? 'pointer' : 'default',
                    fontSize: '0.77rem',
                    color: isDir ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)',
                    fontFamily: 'monospace', userSelect: 'none',
                    transition: 'background 0.12s',
                }}
                className="fn-row"
            >
                <ChevronRight size={10} style={{ transform: isDir && open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', opacity: isDir ? 0.5 : 0, flexShrink: 0 }} />
                {isDir
                    ? <Folder size={13} style={{ color: 'var(--accent)', opacity: 0.8, flexShrink: 0 }} />
                    : <FileCode size={13} style={{ opacity: 0.35, flexShrink: 0 }} />
                }
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
            </motion.div>
            <AnimatePresence initial={false}>
                {isDir && open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                    >
                        {node.children?.map((c, i) => <FileNode key={i} node={c} depth={depth + 1} />)}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Stat pill with counter ──────────────────────────────────────
function StatPill({ value, label, accent }) {
    const [count, start] = useCounter(parseInt(value) || 0);
    const isNum = !isNaN(parseInt(value));
    return (
        <motion.div
            whileInView={() => { start(true); return {}; }}
            viewport={{ once: true }}
            style={{
                textAlign: 'center', padding: '1.5rem 2rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, backdropFilter: 'blur(12px)',
            }}
        >
            <div style={{
                fontSize: '2.4rem', fontWeight: 700, fontFamily: 'monospace',
                color: accent, letterSpacing: '-0.04em', lineHeight: 1,
                marginBottom: '0.5rem',
            }}>
                {isNum ? count : value}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                {label}
            </div>
        </motion.div>
    );
}

// ─── Aurora orb ─────────────────────────────────────────────────
function AuroraOrb({ color, size, x, y, delay = 0, duration = 18 }) {
    return (
        <motion.div
            animate={{ x: [0, 30, -20, 10, 0], y: [0, -20, 30, -10, 0], scale: [1, 1.05, 0.97, 1.03, 1] }}
            transition={{ duration, ease: 'easeInOut', repeat: Infinity, delay }}
            style={{
                position: 'absolute', left: x, top: y,
                width: size, height: size, borderRadius: '50%',
                background: color, filter: 'blur(80px)',
                opacity: 0.18, pointerEvents: 'none',
            }}
        />
    );
}

// ─── Variants ────────────────────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } } };

// ════════════════════════════════════════════════════════════════
export default function ProjectDetails() {
    const { uid, projId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [scrolled, setScrolled] = useState(false);

    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
    const heroO = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const heroS = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
    const lineW = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const load = () => {
        setLoading(true); setError(null);
        fetch(`https://leetcode-orchestration.onrender.com/api/profile/${uid}`)
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(data => {
                if (!data.profile) throw new Error('Profile not found');
                setProfile(data.profile);
                const p = data.profile.projects?.[parseInt(projId)];
                if (!p) throw new Error('Project not found');
                setProject(p);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, [uid, projId]); // eslint-disable-line

    const pref = profile?.preferences ?? { theme: 'Purple', darkMode: true };
    const T = THEMES[pref.theme] ?? THEMES.Purple;
    const idx = parseInt(projId);

    // Dynamic SEO
    const authorName = profile?.displayName || profile?.name || 'Developer';
    const projectName = project?.detailedData?.name || project?.name || 'Project';
    const projectDesc = project?.detailedData?.overview || project?.desc || project?.tagline || `View the technical details, source code, and live demo by ${authorName} on Whizan AI.`;
    
    useSEO({
        title: project ? `${projectName} – ${authorName}'s Portfolio` : 'Loading Project...',
        description: projectDesc,
        canonical: `/public/${uid}/project/${projId}`,
        image: profile?.photoURL || undefined,
        jsonLd: project ? {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: projectName,
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            description: projectDesc,
            author: {
                '@type': 'Person',
                name: authorName,
                url: `https://whizan.xyz/public/${uid}`
            },
            url: `https://whizan.xyz/public/${uid}/project/${projId}`
        } : undefined
    });

    const CSS = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
            --accent: ${T.accent};
            --accent-rgb: ${T.rgb};
            --glow: ${T.glow};
            --bg:     #050508;
            --bg1:    #0c0c10;
            --bg2:    #131318;
            --bg3:    #1a1a22;
            --border: rgba(255,255,255,0.07);
            --border2:rgba(255,255,255,0.12);
            --txt:    #f0f0f5;
            --txt2:   rgba(240,240,245,0.5);
            --txt3:   rgba(240,240,245,0.22);
        }

        html { scroll-behavior:smooth; }
        body {
            background:var(--bg);
            color:var(--txt);
            font-family:'Syne',system-ui,sans-serif;
            -webkit-font-smoothing:antialiased;
            overflow-x:hidden;
        }

        /* Film grain overlay */
        body::after {
            content:'';
            position:fixed; inset:0; z-index:9999; pointer-events:none;
            background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
            opacity:0.028; mix-blend-mode:overlay;
        }

        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(${T.rgb},0.3); border-radius:99px; }

        .serif { font-family:'DM Serif Display',Georgia,serif; }
        .mono  { font-family:'JetBrains Mono',monospace; }

        .s-label {
            font-family:'JetBrains Mono',monospace;
            font-size:0.62rem; letter-spacing:0.18em;
            color:var(--accent); text-transform:uppercase; font-weight:500;
        }

        .fn-row:hover { background:rgba(255,255,255,0.04); }

        /* Scroll progress bar */
        .scroll-bar {
            position:fixed; top:0; left:0; right:0; height:2px;
            background:rgba(255,255,255,0.05); z-index:1000;
        }
        .scroll-bar-fill {
            height:100%;
            background:linear-gradient(90deg, ${T.muted}, ${T.accent});
        }

        /* Navigation */
        .top-nav-container {
            position: fixed; top: 20px; left: 24px; right: 24px; z-index: 600;
            display: flex; justify-content: space-between; align-items: flex-start;
            flex-wrap: wrap; gap: 12px; pointer-events: none;
        }
        .top-nav-container > * { pointer-events: auto; }

        /* Nav pill */
        .nav-pill {
            background:rgba(12,12,16,0.85);
            border:1px solid var(--border2);
            border-radius:99px; padding:8px 20px;
            display:flex; align-items:center; gap:16px;
            backdrop-filter:blur(30px); -webkit-backdrop-filter:blur(30px);
            box-shadow:0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
            transition: box-shadow 0.3s;
        }
        .nav-pill.scrolled {
            box-shadow:0 8px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(${T.rgb},0.12);
        }

        .profile-float {
            background:rgba(12,12,16,0.85); border:1px solid var(--border);
            border-radius:12px; padding:6px 12px 6px 14px;
            display:flex; align-items:center; gap:10px;
            backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
            box-shadow:0 4px 24px rgba(0,0,0,0.4);
        }

        /* Buttons */
        .btn-solid {
            display:inline-flex; align-items:center; gap:9px;
            padding:13px 26px; border-radius:12px;
            background:var(--txt); color:#050508;
            font-weight:700; font-size:0.85rem;
            font-family:'Syne',sans-serif;
            text-decoration:none; border:none; cursor:pointer;
            transition:all 0.2s; position:relative; overflow:hidden;
        }
        .btn-solid::before {
            content:''; position:absolute; inset:0;
            background:linear-gradient(135deg, ${T.accent}22, transparent);
            opacity:0; transition:opacity 0.2s;
        }
        .btn-solid:hover::before { opacity:1; }
        .btn-solid:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(0,0,0,0.35); }

        .btn-ghost {
            display:inline-flex; align-items:center; gap:9px;
            padding:13px 26px; border-radius:12px;
            border:1px solid var(--border2); color:var(--txt2);
            font-weight:600; font-size:0.85rem;
            font-family:'Syne',sans-serif;
            text-decoration:none; background:transparent; cursor:pointer;
            transition:all 0.2s;
        }
        .btn-ghost:hover {
            border-color:var(--accent); color:var(--accent);
            transform:translateY(-2px); background:rgba(${T.rgb},0.06);
            box-shadow:0 0 24px rgba(${T.rgb},0.12);
        }

        /* Feature cards */
        .feat-card {
            border:1px solid var(--border); border-radius:18px;
            padding:2rem; background:var(--bg1);
            transition:all 0.3s; position:relative; overflow:hidden;
        }
        .feat-card::before {
            content:''; position:absolute; inset:0;
            background:radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(${T.rgb},0.06) 0%, transparent 60%);
            opacity:0; transition:opacity 0.3s;
        }
        .feat-card:hover::before { opacity:1; }
        .feat-card:hover { border-color:rgba(${T.rgb},0.25); transform:translateY(-4px); box-shadow:0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(${T.rgb},0.08); }

        /* Tech badges */
        .tech-badge {
            display:inline-flex; align-items:center; gap:7px;
            padding:8px 16px; border-radius:99px;
            background:rgba(255,255,255,0.04);
            border:1px solid var(--border);
            font-size:0.75rem; font-weight:600;
            color:var(--txt2); letter-spacing:0.03em;
            font-family:'JetBrains Mono',monospace;
            transition:all 0.2s; cursor:default;
        }
        .tech-badge:hover {
            background:rgba(${T.rgb},0.08);
            border-color:rgba(${T.rgb},0.3);
            color:var(--accent);
        }

        /* Tech rows */
        .tech-row {
            display:flex; align-items:center; gap:14px;
            padding:14px 18px; border-radius:14px;
            border:1px solid var(--border); background:var(--bg1);
            transition:all 0.25s; cursor:default;
        }
        .tech-row:hover {
            border-color:rgba(${T.rgb},0.2);
            background:rgba(${T.rgb},0.04);
            transform:translateX(5px);
            box-shadow:0 4px 20px rgba(0,0,0,0.3);
        }

        /* Highlight card */
        .highlight-card {
            display:flex; gap:14px; align-items:flex-start;
            padding:1.25rem 1.5rem; border-radius:14px;
            border:1px solid var(--border); background:var(--bg1);
            transition:all 0.25s;
        }
        .highlight-card:hover {
            border-color:rgba(${T.rgb},0.2);
            background:rgba(${T.rgb},0.04);
            transform:translateY(-2px);
        }

        /* Tab bar */
        .tab-bar {
            display:flex; gap:4px; padding:6px;
            background:var(--bg1); border:1px solid var(--border);
            border-radius:14px; width:fit-content;
        }
        .tab-btn {
            padding:8px 20px; border-radius:10px; border:none;
            background:transparent; cursor:pointer; font-family:'Syne',sans-serif;
            font-size:0.82rem; font-weight:600; color:var(--txt2);
            transition:all 0.2s; white-space:nowrap;
        }
        .tab-btn.active {
            background:var(--bg3); color:var(--txt);
            box-shadow:0 2px 12px rgba(0,0,0,0.3);
        }
        .tab-btn:hover:not(.active) { color:var(--txt); background:rgba(255,255,255,0.03); }

        /* Section divider */
        .section-divider {
            width:100%; height:1px;
            background:linear-gradient(90deg, transparent, var(--border), transparent);
            margin:0 0 5rem;
        }

        /* Code block */
        .code-block {
            flex:1; font-family:'JetBrains Mono',monospace; font-size:0.78rem;
            line-height:1.8; color:rgba(240,240,245,0.65);
            background:var(--bg2); border:1px solid var(--border);
            border-radius:11px; padding:1rem 1.25rem;
            word-break:break-all; position:relative; overflow:hidden;
        }
        .code-block::before {
            content:'$'; position:absolute; left:1.25rem; top:50%;
            transform:translateY(-50%); color:var(--accent); opacity:0.6;
            font-size:0.7rem;
        }
        .code-block span { padding-left:1.1em; }

        /* Responsive */
        @media(max-width:900px) {
            .two-col { grid-template-columns:1fr !important; gap:3rem !important; }
            .top-nav-container { top: 16px; left: 16px; right: 16px; }
        }
        @media(max-width:768px) {
            .nav-hide-mobile { display: none !important; }
        }
        @media(max-width:640px) {
            .feat-grid { grid-template-columns:1fr !important; }
            .stats-grid { grid-template-columns:repeat(2,1fr) !important; }
        }
        @media(max-width:420px) {
            .stats-grid { grid-template-columns:1fr !important; }
        }
    `;

    /* ── Loading ─────────────────────────────────────────────── */
    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
            <style>{CSS}</style>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: `2px solid rgba(${T.rgb},0.15)`,
                    borderTopColor: T.accent,
                }}
            />
            <motion.p
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}
            >
                LOADING PROJECT
            </motion.p>
        </div>
    );

    /* ── Error ───────────────────────────────────────────────── */
    if (error || !project) return (
        <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <style>{CSS}</style>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: 400 }}>
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        width: 64, height: 64, borderRadius: 18,
                        background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem', boxShadow: '0 0 40px rgba(244,63,94,0.1)',
                    }}
                >
                    <Terminal size={28} color="#f43f5e" />
                </motion.div>
                <h2 className="serif" style={{ fontSize: '2.5rem', fontWeight: 400, marginBottom: '1rem' }}>Something went wrong</h2>
                <p style={{ color: 'var(--txt2)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>{error ?? 'Project not found.'}</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn-solid" onClick={load}><RefreshCw size={14} /> Retry</button>
                    <button className="btn-ghost" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            </motion.div>
        </div>
    );

    const d = project.detailedData ?? {
        name: project.name,
        tagline: project.tagline ?? 'A precise engineering achievement.',
        overview: project.desc ?? 'A groundbreaking implementation pushing the boundaries of modern performance and developer experience.',
        features: ['Scalable Distributed Core', 'Low-Latency Edge Processing', 'Quantum-Safe Encryption', 'Adaptive Load Balancing'],
        techStack: ['React', 'Rust', 'TypeScript'],
        installation: ['git clone <repo-url>', 'cd project && npm install', 'npm run dev'],
        usage: 'Streamlined operational control via unified API interface.',
        highlights: ['Award-winning efficiency metrics.', 'Seamless cloud-native integration.', '99.9% uptime SLA.', 'Sub-10ms response time.'],
        projectStructure: [],
    };

    const ICONS = [Shield, Zap, Cpu, Layers, Star, Award, Rocket, Code2, Globe, Lock, GitBranch, Package, Database, Server, Sparkles];

    const statsData = [
        { value: d.techStack.length, label: 'Technologies' },
        { value: d.features.length, label: 'Features' },
        { value: d.highlights.length, label: 'Highlights' },
        { value: d.installation.length, label: 'Setup Steps' },
    ];

    return (
        <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg)', overflowX: 'hidden' }}>
            <style>{CSS}</style>

            {/* ── Scroll progress bar ─────────────────────── */}
            <div className="scroll-bar">
                <motion.div className="scroll-bar-fill" style={{ width: lineW }} />
            </div>

            {/* ── Top Navigation Container ────────────────── */}
            <div className="top-nav-container">
                {/* ── Floating nav pill ───────────────────────── */}
                <motion.div
                    className={`nav-pill${scrolled ? ' scrolled' : ''}`}
                    initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <button onClick={() => navigate(-1)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--txt3)', fontSize: '0.72rem',
                        fontFamily: 'JetBrains Mono,monospace', letterSpacing: '0.1em',
                        display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--txt)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--txt3)'}
                    >
                        ← Back
                    </button>
                    <div className="nav-hide-mobile" style={{ width: 1, height: 14, background: 'var(--border)' }} />
                    <span className="s-label nav-hide-mobile" style={{ fontSize: '0.6rem', whiteSpace: 'nowrap' }}>
                        CASE {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="nav-hide-mobile" style={{ width: 1, height: 14, background: 'var(--border)' }} />
                    <span className="nav-hide-mobile" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--txt2)', maxWidth: '18ch', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.name}
                    </span>
                </motion.div>

                {/* ── Profile pill ────────────────────────────── */}
                <motion.div className="profile-float"
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                >
                    <span className="s-label" style={{ fontSize: '0.58rem' }}>DEV</span>
                    <div style={{ width: 1, height: 14, background: 'var(--border)' }} />
                    <NavProfile />
                </motion.div>
            </div>

            {/* ══════════════════════════════════════════════
                HERO
            ══════════════════════════════════════════════ */}
            <section ref={heroRef} style={{
                position: 'relative', minHeight: '100vh',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: '0 clamp(2rem,6vw,6rem) clamp(4rem,6vw,6rem)',
                overflow: 'hidden',
            }}>
                {/* Aurora background */}
                <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <AuroraOrb color={T.accent} size="55vw" x="40%" y="-15%" delay={0} duration={20} />
                    <AuroraOrb color={T.muted} size="40vw" x="70%" y="30%" delay={5} duration={25} />
                    <AuroraOrb color={T.accent} size="30vw" x="5%" y="50%" delay={10} duration={22} />

                    {/* Dot grid */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
                        backgroundSize: '48px 48px',
                        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 20%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 20%, transparent 100%)',
                    }} />

                    {/* Cinematic vignette */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(5,5,8,0.85) 100%)',
                    }} />
                    {/* Bottom fade */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top,var(--bg) 20%,transparent)' }} />
                </div>

                {/* Hero content with parallax */}
                <motion.div style={{ y: heroY, opacity: heroO, scale: heroS, position: 'relative', zIndex: 1 }}>
                    <motion.div variants={stagger} initial="hidden" animate="show">

                        {/* Eyebrow */}
                        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 'clamp(2rem,4vw,3rem)' }}>
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                style={{
                                    width: 44, height: 44, borderRadius: 13,
                                    background: `linear-gradient(135deg,${T.accent},${T.muted})`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 0 40px ${T.accent}50, 0 0 80px ${T.accent}20`,
                                    flexShrink: 0,
                                }}
                            >
                                <Code2 size={20} color="#fff" strokeWidth={1.8} />
                            </motion.div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <span className="s-label">Project</span>
                                <span style={{ color: 'var(--border)', fontSize: '0.7rem' }}>—</span>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {d.techStack.slice(0, 3).map(t => (
                                        <span key={t} className="s-label" style={{
                                            opacity: 0.7, background: `rgba(${T.rgb},0.08)`,
                                            padding: '2px 10px', borderRadius: 99,
                                            border: `1px solid rgba(${T.rgb},0.15)`,
                                        }}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            variants={fadeUp} className="serif"
                            style={{
                                fontSize: 'clamp(3.5rem,10vw,9.5rem)',
                                fontWeight: 400, lineHeight: 0.9,
                                letterSpacing: '-0.03em',
                                color: 'var(--txt)',
                                marginBottom: 'clamp(1.5rem,3vw,2.5rem)',
                                maxWidth: '14ch',
                            }}
                        >
                            {d.name}
                        </motion.h1>

                        {/* Tagline */}
                        <motion.p variants={fadeUp} style={{
                            fontSize: 'clamp(0.95rem,1.8vw,1.15rem)',
                            color: 'var(--txt2)', fontWeight: 400,
                            maxWidth: 520, lineHeight: 1.8,
                            marginBottom: 'clamp(2.5rem,4vw,3.5rem)',
                            fontFamily: 'Syne,sans-serif',
                        }}>
                            {d.tagline}
                        </motion.p>

                        {/* CTAs */}
                        <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {project.link && (
                                <a href={project.link.startsWith('http') ? project.link : `https://${project.link}`}
                                    target="_blank" rel="noreferrer" className="btn-solid">
                                    <Github size={15} /> View Source
                                </a>
                            )}
                            {d.demoUrl && (
                                <a href={d.demoUrl} target="_blank" rel="noreferrer" className="btn-ghost">
                                    Live Demo <ArrowUpRight size={14} />
                                </a>
                            )}
                            {!project.link && !d.demoUrl && (
                                <motion.div style={{ display: 'flex', gap: 12 }}>
                                    <span className="btn-solid" style={{ cursor: 'default', opacity: 0.5 }}>
                                        <Github size={15} /> View Source
                                    </span>
                                    <span className="btn-ghost" style={{ cursor: 'default', opacity: 0.4 }}>
                                        Live Demo <ExternalLink size={14} />
                                    </span>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Scroll hint */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
                    style={{
                        position: 'absolute', bottom: '2.5rem', right: 'clamp(2rem,6vw,6rem)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                        zIndex: 1,
                    }}
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            width: 26, height: 42, borderRadius: 13,
                            border: '1px solid var(--border2)',
                            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                            padding: '7px 0',
                        }}
                    >
                        <motion.div
                            animate={{ height: [6, 16, 6], opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            style={{ width: 2, background: `linear-gradient(${T.accent},${T.muted})`, borderRadius: 1 }}
                        />
                    </motion.div>
                    <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--txt3)', letterSpacing: '0.15em', writingMode: 'vertical-rl' }}>SCROLL</span>
                </motion.div>
            </section>

            {/* ══════════════════════════════════════════════
                BODY
            ══════════════════════════════════════════════ */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(2rem,6vw,6rem)' }}>

                {/* ── Stats strip ──────────────────────────── */}
                <motion.section
                    initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
                    variants={stagger} style={{ padding: '4rem 0 6rem' }}
                >
                    <div className="section-divider" />
                    <motion.div
                        variants={stagger}
                        className="stats-grid"
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}
                    >
                        {statsData.map((s, i) => (
                            <motion.div key={i} variants={fadeUp}>
                                <StatPill value={s.value} label={s.label} accent={T.accent} />
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.section>

                {/* ── Overview + Highlights ────────────────── */}
                <section style={{ padding: '2rem 0 6rem' }}>
                    <div className="section-divider" />

                    {/* Section header */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        transition={{ duration: 0.6 }} style={{ marginBottom: '4rem' }}
                    >
                        <p className="s-label" style={{ marginBottom: '0.75rem' }}>01 / About</p>
                        <h2 className="serif" style={{ fontSize: 'clamp(2.5rem,5vw,3.8rem)', fontWeight: 400, lineHeight: 1, letterSpacing: '-0.02em' }}>
                            The vision behind<br /><em>the project</em>
                        </h2>
                    </motion.div>

                    <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.65 }}
                        >
                            <p style={{ color: 'var(--txt2)', fontSize: '1.05rem', lineHeight: 2, fontWeight: 400 }}>
                                {d.overview}
                            </p>

                            {/* Inline accent line */}
                            <motion.div
                                initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.3 }}
                                style={{ height: 1, background: `linear-gradient(90deg,${T.accent},transparent)`, marginTop: '2.5rem', opacity: 0.4 }}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.65, delay: 0.1 }}
                        >
                            <p className="s-label" style={{ marginBottom: '1.5rem' }}>Key Highlights</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {d.highlights.map((h, i) => (
                                    <motion.div
                                        key={i} className="highlight-card"
                                        initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}
                                    >
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 10, flexShrink: 0, marginTop: 1,
                                            background: `rgba(${T.rgb},0.1)`, border: `1px solid rgba(${T.rgb},0.18)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Award size={14} color={T.accent} />
                                        </div>
                                        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--txt2)', fontWeight: 400 }}>{h}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ── Tech Stack ───────────────────────────── */}
                <section style={{ padding: '2rem 0 6rem' }}>
                    <div className="section-divider" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '2rem' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        >
                            <p className="s-label" style={{ marginBottom: '0.75rem' }}>02 / Stack</p>
                            <h2 className="serif" style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                                The technologies
                            </h2>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
                        >
                            {d.techStack.map(s => {
                                const icon = devIcon(s);
                                return (
                                    <span key={s} className="tech-badge">
                                        {icon && <img src={icon} alt={s} style={{ width: 14, height: 14 }} />}
                                        {s}
                                    </span>
                                );
                            })}
                        </motion.div>
                    </div>

                    <motion.div
                        variants={stagger} initial="hidden"
                        whileInView="show" viewport={{ once: true, margin: '-40px' }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(320px,100%),1fr))', gap: '0.6rem' }}
                    >
                        {d.techStack.map((s, i) => {
                            const icon = devIcon(s);
                            const Ico = ICONS[i % ICONS.length];
                            return (
                                <motion.div key={s} variants={fadeUp} className="tech-row">
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                        background: `rgba(${T.rgb},0.08)`,
                                        border: `1px solid rgba(${T.rgb},0.15)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {icon
                                            ? <img src={icon} alt={s} style={{ width: 22, height: 22 }} />
                                            : <Ico size={20} color={T.accent} />
                                        }
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{s}</div>
                                        <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--txt3)', marginTop: 3 }}>Core dependency</div>
                                    </div>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: 8,
                                        background: 'var(--bg2)', border: '1px solid var(--border)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <ChevronRight size={12} style={{ opacity: 0.3 }} />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </section>

                {/* ── Features ─────────────────────────────── */}
                <section style={{ padding: '2rem 0 6rem' }}>
                    <div className="section-divider" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '2rem' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        >
                            <p className="s-label" style={{ marginBottom: '0.75rem' }}>03 / Features</p>
                            <h2 className="serif" style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                                What it does
                            </h2>
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            style={{ maxWidth: 340, color: 'var(--txt2)', fontSize: '0.9rem', lineHeight: 1.8, fontWeight: 400 }}
                        >
                            Every feature engineered with intent — no bloat, no compromise.
                        </motion.p>
                    </div>

                    <motion.div
                        className="feat-grid"
                        variants={stagger} initial="hidden"
                        whileInView="show" viewport={{ once: true, margin: '-40px' }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(300px,100%),1fr))', gap: '1rem' }}
                    >
                        {d.features.map((f, i) => {
                            const Ico = ICONS[i % ICONS.length];
                            return (
                                <motion.div
                                    key={i} variants={fadeUp} className="feat-card"
                                    onMouseMove={e => {
                                        const r = e.currentTarget.getBoundingClientRect();
                                        e.currentTarget.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
                                        e.currentTarget.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                        <div style={{
                                            width: 46, height: 46, borderRadius: 14,
                                            background: `rgba(${T.rgb},0.1)`,
                                            border: `1px solid rgba(${T.rgb},0.18)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: `0 0 20px rgba(${T.rgb},0.1)`,
                                        }}>
                                            <Ico size={20} color={T.accent} />
                                        </div>
                                        <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--txt3)', letterSpacing: '0.12em' }}>
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <p style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--txt)' }}>{f}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </section>

                {/* ── Installation + File Tree ─────────────── */}
                <section style={{ padding: '2rem 0 8rem' }}>
                    <div className="section-divider" />
                    <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>

                        {/* Installation */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.6 }}
                        >
                            <p className="s-label" style={{ marginBottom: '0.75rem' }}>04 / Setup</p>
                            <h2 className="serif" style={{ fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 400, marginBottom: '2.5rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                                Installation
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {d.installation.map((step, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                        style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
                                    >
                                        <div style={{
                                            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                            background: `rgba(${T.rgb},0.1)`,
                                            border: `1px solid rgba(${T.rgb},0.18)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            marginTop: 8,
                                        }}>
                                            <span className="mono" style={{ fontSize: '0.6rem', color: T.accent }}>{i + 1}</span>
                                        </div>
                                        <div className="code-block">
                                            <span>{step}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {d.usage && (
                                <motion.div
                                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                                    transition={{ delay: 0.4 }}
                                    style={{ marginTop: '3rem', padding: '1.5rem', borderRadius: 16, background: `rgba(${T.rgb},0.05)`, border: `1px solid rgba(${T.rgb},0.15)` }}
                                >
                                    <p className="s-label" style={{ marginBottom: '0.75rem' }}>Usage</p>
                                    <p style={{ color: 'var(--txt2)', fontSize: '0.9rem', lineHeight: 1.8, fontWeight: 400 }}>{d.usage}</p>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* File Tree */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
                        >
                            <p className="s-label" style={{ marginBottom: '0.75rem' }}>05 / Structure</p>
                            <h2 className="serif" style={{ fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 400, marginBottom: '2.5rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                                Project tree
                            </h2>

                            <div style={{
                                background: '#08090e', borderRadius: 18,
                                border: '1px solid rgba(255,255,255,0.07)',
                                overflow: 'hidden',
                                boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(${T.rgb},0.05)`,
                            }}>
                                {/* Window chrome */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '13px 16px',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    background: 'rgba(255,255,255,0.015)',
                                }}>
                                    {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                                        <motion.div
                                            key={c} whileHover={{ scale: 1.2 }}
                                            style={{ width: 11, height: 11, borderRadius: '50%', background: c, opacity: 0.8 }}
                                        />
                                    ))}
                                    <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.18)' }}>
                                        ~/{d.name.toLowerCase().replace(/\s/g, '-')}
                                    </span>
                                </div>
                                <div style={{ padding: '1rem', maxHeight: 400, overflowY: 'auto' }}>
                                    {d.projectStructure?.length > 0
                                        ? d.projectStructure.map((n, i) => <FileNode key={i} node={n} />)
                                        : (
                                            <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.12)' }}>
                                                <Terminal size={28} style={{ display: 'block', margin: '0 auto 1rem', opacity: 0.4 }} />
                                                <p className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.1em' }}>No structure defined</p>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>

            {/* ══════════════════════════════════════════════
                FOOTER
            ══════════════════════════════════════════════ */}
            <footer style={{
                borderTop: '1px solid var(--border)',
                padding: '2.5rem clamp(2rem,6vw,6rem)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: '1.5rem',
                position: 'relative', zIndex: 10,
                background: 'linear-gradient(to bottom, transparent, rgba(5,5,8,0.95))',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        style={{
                            width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                            background: `linear-gradient(135deg,${T.accent},${T.muted})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 0 24px ${T.accent}35`,
                        }}
                    >
                        <Rocket size={15} color="#fff" />
                    </motion.div>
                    <div>
                        <p style={{ fontSize: '0.88rem', fontWeight: 700 }}>{d.name}</p>
                        <p className="mono" style={{ fontSize: '0.62rem', color: 'var(--txt3)', marginTop: 3 }}>Whizan AI · 2026</p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <p className="mono" style={{ fontSize: '0.62rem', color: 'var(--txt3)', letterSpacing: '0.1em' }}>
                        CASE {String(idx + 1).padStart(2, '0')} — {d.techStack.slice(0, 3).join(' · ')}
                    </p>
                    {project.link && (
                        <a href={project.link.startsWith('http') ? project.link : `https://${project.link}`}
                            target="_blank" rel="noreferrer"
                            style={{ color: 'var(--txt3)', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = T.accent}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--txt3)'}
                        >
                            <Github size={16} />
                        </a>
                    )}
                </div>
            </footer>
        </div>
    );
}