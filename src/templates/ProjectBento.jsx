import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Github, ExternalLink, ArrowUpRight, Folder, FileCode,
    ChevronRight, Terminal, Zap, Shield,
    Layers, Cpu, Star, Award, Rocket, Code2, Globe, Lock,
    GitBranch, Package, Database, Server, Sparkles,
} from 'lucide-react';
import NavProfile from '../NavProfile';

// ─── Utils ──────────────────────────────────────────────────────
const DI = { react: 'react', javascript: 'javascript', typescript: 'typescript', python: 'python', nodejs: 'nodejs', 'node.js': 'nodejs', java: 'java', cpp: 'cplusplus', 'c++': 'cplusplus', c: 'c', go: 'go', rust: 'rust', swift: 'swift', kotlin: 'kotlin', dart: 'dart', flutter: 'flutter', html: 'html5', css: 'css3', sass: 'sass', tailwind: 'tailwindcss', mongodb: 'mongodb', postgres: 'postgresql', postgresql: 'postgresql', mysql: 'mysql', redis: 'redis', firebase: 'firebase', docker: 'docker', kubernetes: 'kubernetes', git: 'git', github: 'github', linux: 'linux', aws: 'amazonwebservices', gcp: 'googlecloud', azure: 'azure', graphql: 'graphql', nextjs: 'nextjs', 'next.js': 'nextjs', vuejs: 'vuejs', 'vue.js': 'vuejs', angular: 'angularjs', django: 'django', flask: 'flask', express: 'express', figma: 'figma', redux: 'redux', vite: 'vite' };
const devIcon = s => { const n = DI[s.toLowerCase().replace(/\s/g, '')]; return n ? `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${n}/${n}-original.svg` : null; };

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

function FileNode({ node, depth = 0 }) {
    const [open, setOpen] = useState(depth < 1);
    const isDir = node.type === 'folder' || node.children?.length > 0;
    return (
        <div style={{ marginLeft: depth * 14 }}>
            <motion.div
                onClick={() => isDir && setOpen(o => !o)}
                whileHover={{ x: 3 }}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 8px', borderRadius: 6,
                    cursor: isDir ? 'pointer' : 'default',
                    fontSize: '0.75rem',
                    color: isDir ? 'var(--txt)' : 'var(--txt2)',
                    fontFamily: 'monospace', userSelect: 'none',
                    transition: 'background 0.12s',
                }}
            >
                <ChevronRight size={10} style={{ transform: isDir && open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', opacity: isDir ? 0.5 : 0, flexShrink: 0 }} />
                {isDir
                    ? <Folder size={12} style={{ color: 'var(--accent)', opacity: 0.9, flexShrink: 0 }} />
                    : <FileCode size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
                }
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.name}</span>
            </motion.div>
            <AnimatePresence>
                {isDir && open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}
                    >
                        {node.children?.map((c, i) => <FileNode key={i} node={c} depth={depth + 1} />)}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
export default function ProjectBento({ project, profile, d, T, idx }) {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const CSS = `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
            --accent: ${T.accent};
            --accent-rgb: ${T.rgb};
            --bg: #09090b;
            --card: rgba(255,255,255,0.03);
            --card-hover: rgba(255,255,255,0.05);
            --border: rgba(255,255,255,0.08);
            --border-hover: rgba(255,255,255,0.15);
            --txt: #fafafa;
            --txt2: #a1a1aa;
            --txt3: #52525b;
        }

        body {
            background: var(--bg); color: var(--txt);
            font-family: 'Outfit', sans-serif;
            overflow-x: hidden;
        }

        /* Nav */
        .bento-nav {
            position: fixed; top: 0; left: 0; right: 0; z-index: 100;
            padding: 20px 32px; display: flex; justify-content: space-between;
            align-items: center; pointer-events: none;
            transition: all 0.3s ease;
        }
        .bento-nav.scrolled {
            background: rgba(9, 9, 11, 0.8);
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border); padding: 12px 32px;
        }
        .bento-nav > * { pointer-events: auto; }

        .btn-back {
            background: var(--card); border: 1px solid var(--border);
            border-radius: 99px; padding: 8px 20px; color: var(--txt2);
            font-family: 'Outfit', sans-serif; font-size: 0.85rem; font-weight: 500;
            cursor: pointer; display: flex; align-items: center; gap: 8px;
            transition: all 0.2s;
        }
        .btn-back:hover { background: var(--card-hover); color: var(--txt); border-color: var(--border-hover); }

        .profile-pill {
            background: var(--card); border: 1px solid var(--border);
            border-radius: 99px; padding: 4px 12px 4px 6px; display: flex; align-items: center; gap: 10px;
        }

        /* Bento Grid */
        .bento-container {
            max-width: 1400px; margin: 120px auto 100px; padding: 0 32px;
            display: grid; grid-template-columns: repeat(12, 1fr);
            gap: 20px; grid-auto-flow: dense;
        }

        .bento-card {
            background: linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
            border: 1px solid var(--border); border-radius: 24px;
            padding: 32px; display: flex; flex-direction: column;
            position: relative; overflow: hidden; transition: all 0.3s;
            backdrop-filter: blur(10px);
        }
        .bento-card::before {
            content: ''; position: absolute; inset: 0;
            background: radial-gradient(circle at top left, rgba(${T.rgb}, 0.15), transparent 40%);
            opacity: 0; transition: opacity 0.4s;
        }
        .bento-card:hover { border-color: rgba(${T.rgb}, 0.3); transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
        .bento-card:hover::before { opacity: 1; }

        /* Card Sizing */
        .card-hero { grid-column: span 8; grid-row: span 2; display: flex; flex-direction: column; justify-content: space-between; }
        .card-stat { grid-column: span 2; grid-row: span 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
        .card-about { grid-column: span 6; grid-row: span 2; }
        .card-tech { grid-column: span 6; grid-row: span 2; }
        .card-features { grid-column: span 8; grid-row: span 2; }
        .card-links { grid-column: span 4; grid-row: span 1; display: flex; gap: 12px; flex-direction: column; justify-content: center; }
        .card-tree { grid-column: span 4; grid-row: span 2; padding: 20px; }

        /* Elements */
        .tag {
            background: rgba(${T.rgb}, 0.1); border: 1px solid rgba(${T.rgb}, 0.2);
            color: var(--accent); padding: 6px 14px; border-radius: 99px;
            font-size: 0.75rem; font-weight: 600; font-family: 'JetBrains Mono', monospace;
            text-transform: uppercase; letter-spacing: 0.05em; width: fit-content;
        }

        .card-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
        .card-title svg { color: var(--accent); }

        .btn-primary {
            background: var(--txt); color: #000; border: none; padding: 14px 24px;
            border-radius: 12px; font-weight: 600; font-family: 'Outfit'; font-size: 0.95rem;
            cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
            transition: all 0.2s; width: 100%; text-decoration: none;
        }
        .btn-primary:hover { transform: scale(1.02); box-shadow: 0 8px 20px rgba(255,255,255,0.1); }

        .btn-secondary {
            background: var(--card); color: var(--txt); border: 1px solid var(--border); padding: 14px 24px;
            border-radius: 12px; font-weight: 500; font-family: 'Outfit'; font-size: 0.95rem;
            cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
            transition: all 0.2s; width: 100%; text-decoration: none;
        }
        .btn-secondary:hover { background: rgba(${T.rgb},0.1); border-color: rgba(${T.rgb},0.3); color: var(--accent); }

        .tech-pill {
            background: var(--bg); border: 1px solid var(--border); border-radius: 12px;
            padding: 10px 16px; display: flex; align-items: center; gap: 10px;
            font-weight: 500; font-size: 0.9rem; transition: all 0.2s;
        }
        .tech-pill:hover { border-color: var(--accent); background: rgba(${T.rgb}, 0.05); }

        /* Responsive */
        @media (max-width: 1024px) {
            .card-hero { grid-column: span 12; }
            .card-stat { grid-column: span 3; }
            .card-links { grid-column: span 12; flex-direction: row; }
            .card-about, .card-tech, .card-features, .card-tree { grid-column: span 12; }
        }
        @media (max-width: 640px) {
            .card-stat { grid-column: span 6; }
            .card-links { flex-direction: column; }
        }
    `;

    const ICONS = [Shield, Zap, Cpu, Layers, Star, Award, Rocket, Code2, Globe, Lock, GitBranch, Package, Database, Server, Sparkles];

    const statsData = [
        { value: d.techStack.length, label: 'Techs' },
        { value: d.features.length, label: 'Features' },
        { value: d.highlights.length, label: 'Wins' },
        { value: d.installation.length, label: 'Steps' },
    ];

    const StatCounter = ({ s }) => {
        const [count, start] = useCounter(parseInt(s.value) || 0);
        return (
            <div className="bento-card card-stat" onMouseEnter={() => start(true)}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1, color: T.accent, fontFamily: 'JetBrains Mono', marginBottom: '8px' }}>
                    {!isNaN(parseInt(s.value)) ? count : s.value}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--txt2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {s.label}
                </div>
            </div>
        );
    };

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <style>{CSS}</style>

            {/* Nav */}
            <nav className={`bento-nav ${scrolled ? 'scrolled' : ''}`}>
                <button className="btn-back" onClick={() => navigate(-1)}>
                    ← Back
                </button>
                <div className="profile-pill">
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--txt2)', marginLeft: 8 }}>DEV</span>
                    <NavProfile />
                </div>
            </nav>

            {/* Grid container */}
            <motion.div
                className="bento-container"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, staggerChildren: 0.1 }}
            >
                {/* 1. Hero */}
                <motion.div className="bento-card card-hero" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                    <div>
                        <div className="tag" style={{ marginBottom: 24 }}>Project {String(idx + 1).padStart(2, '0')}</div>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
                            {d.name}
                        </h1>
                        <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: 'var(--txt2)', lineHeight: 1.6, maxWidth: '80%' }}>
                            {d.tagline}
                        </p>
                    </div>
                </motion.div>

                {/* 2. Stats */}
                {statsData.map((s, i) => (
                    <motion.div key={i} style={{ display: 'contents' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + (i * 0.05) }}>
                        <StatCounter s={s} />
                    </motion.div>
                ))}

                {/* 3. Links / Actions */}
                <motion.div className="bento-card card-links" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    {project.link && (
                        <a href={project.link.startsWith('http') ? project.link : `https://${project.link}`} target="_blank" rel="noreferrer" className="btn-primary">
                            <Github size={18} /> Source Code
                        </a>
                    )}
                    {d.demoUrl && (
                        <a href={d.demoUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                            Live Demo <ArrowUpRight size={18} />
                        </a>
                    )}
                    {!project.link && !d.demoUrl && (
                        <div style={{ textAlign: 'center', color: 'var(--txt3)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                            Private Project
                        </div>
                    )}
                </motion.div>

                {/* 4. About */}
                <motion.div className="bento-card card-about" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className="card-title"><Code2 size={24} /> Overview</div>
                    <p style={{ color: 'var(--txt2)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 24 }}>{d.overview}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {d.highlights.slice(0, 3).map((h, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--card)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                                <Award size={16} color={T.accent} />
                                <span style={{ fontSize: '0.95rem', color: 'var(--txt)' }}>{h}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 5. Tech Stack */}
                <motion.div className="bento-card card-tech" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className="card-title"><Layers size={24} /> Technologies</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginTop: 16 }}>
                        {d.techStack.map(s => {
                            const icon = devIcon(s);
                            return (
                                <div key={s} className="tech-pill">
                                    {icon ? <img src={icon} alt={s} style={{ width: 18, height: 18 }} /> : <Zap size={16} color={T.accent} />}
                                    {s}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* 6. Features */}
                <motion.div className="bento-card card-features" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className="card-title"><Sparkles size={24} /> Core Features</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginTop: 16 }}>
                        {d.features.map((f, i) => {
                            const Ico = ICONS[i % ICONS.length];
                            return (
                                <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '20px', borderRadius: 16 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `rgba(${T.rgb}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                        <Ico size={20} color={T.accent} />
                                    </div>
                                    <p style={{ fontWeight: 500, fontSize: '0.95rem', lineHeight: 1.5 }}>{f}</p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* 7. File Tree */}
                <motion.div className="bento-card card-tree" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className="card-title"><Folder size={20} /> Structure</div>
                    <div style={{
                        marginTop: 16, background: '#050508', borderRadius: 12,
                        border: '1px solid #1a1a24', padding: '16px',
                        flex: 1, overflowY: 'auto', maxHeight: '400px'
                    }}>
                        {d.projectStructure?.length > 0
                            ? d.projectStructure.map((n, i) => <FileNode key={i} node={n} />)
                            : <div style={{ textAlign: 'center', color: 'var(--txt3)', fontSize: '0.85rem', padding: '20px 0' }}>No structure provided</div>
                        }
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
}
