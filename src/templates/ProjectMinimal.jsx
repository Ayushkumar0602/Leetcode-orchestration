import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ArrowUpRight, Folder, FileCode, ChevronRight, Code2 } from 'lucide-react';
import NavProfile from '../NavProfile';

// ─── Utils ──────────────────────────────────────────────────────
const DI = { react: 'react', javascript: 'javascript', typescript: 'typescript', python: 'python', nodejs: 'nodejs', 'node.js': 'nodejs', java: 'java', cpp: 'cplusplus', 'c++': 'cplusplus', c: 'c', go: 'go', rust: 'rust', swift: 'swift', kotlin: 'kotlin', dart: 'dart', flutter: 'flutter', html: 'html5', css: 'css3', sass: 'sass', tailwind: 'tailwindcss', mongodb: 'mongodb', postgres: 'postgresql', postgresql: 'postgresql', mysql: 'mysql', redis: 'redis', firebase: 'firebase', docker: 'docker', kubernetes: 'kubernetes', git: 'git', github: 'github', linux: 'linux', aws: 'amazonwebservices', gcp: 'googlecloud', azure: 'azure', graphql: 'graphql', nextjs: 'nextjs', 'next.js': 'nextjs', vuejs: 'vuejs', 'vue.js': 'vuejs', angular: 'angularjs', django: 'django', flask: 'flask', express: 'express', figma: 'figma', redux: 'redux', vite: 'vite' };
const devIcon = s => { const n = DI[s.toLowerCase().replace(/\s/g, '')]; return n ? `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${n}/${n}-original.svg` : null; };

function FileNode({ node, depth = 0 }) {
    const [open, setOpen] = useState(depth < 1);
    const isDir = node.type === 'folder' || node.children?.length > 0;
    return (
        <div style={{ marginLeft: depth * 16 }}>
            <div
                onClick={() => isDir && setOpen(o => !o)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 0', cursor: isDir ? 'pointer' : 'default',
                    fontSize: '0.85rem', color: isDir ? 'var(--txt)' : 'var(--txt2)',
                    fontFamily: '"JetBrains Mono", monospace', userSelect: 'none',
                }}
            >
                {isDir
                    ? <ChevronRight size={12} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    : <div style={{ width: 12 }} />
                }
                {isDir ? <Folder size={14} /> : <FileCode size={14} opacity={0.5} />}
                <span>{node.name}</span>
            </div>
            <AnimatePresence>
                {isDir && open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                        {node.children?.map((c, i) => <FileNode key={i} node={c} depth={depth + 1} />)}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════
export default function ProjectMinimal({ project, profile, d, T, idx }) {
    const navigate = useNavigate();

    const CSS = `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
            --bg: #fafafa;
            --txt: #111111;
            --txt2: #555555;
            --txt3: #999999;
            --border: #eaeaea;
            --accent: ${T.accent};
        }

        /* Dark mode overrides (assuming the profile is generally dark) */
        @media (prefers-color-scheme: dark) {
            :root {
                --bg: #030303;
                --txt: #f5f5f5;
                --txt2: #a3a3a3;
                --txt3: #666666;
                --border: #1f1f1f;
            }
        }

        body {
            background: var(--bg); color: var(--txt);
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        .minimal-container {
            max-width: 800px; margin: 0 auto; padding: 120px 24px 100px;
        }

        .serif { font-family: 'Playfair Display', serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }

        .minimal-nav {
            position: fixed; top: 0; left: 0; right: 0; padding: 24px 32px;
            display: flex; justify-content: space-between; align-items: center;
            background: transparent; z-index: 100;
        }

        .minimal-btn-back {
            background: transparent; border: none; cursor: pointer;
            font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 500;
            color: var(--txt2); display: flex; align-items: center; gap: 8px;
            transition: color 0.2s;
        }
        .minimal-btn-back:hover { color: var(--txt); }

        .minimal-divider {
            height: 1px; background: var(--border); width: 100%; margin: 60px 0;
        }

        .minimal-section-title {
            font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;
            color: var(--txt3); margin-bottom: 24px;
        }

        .minimal-link {
            display: inline-flex; align-items: center; gap: 6px;
            color: var(--txt); font-weight: 500; font-size: 0.95rem;
            text-decoration: none; border-bottom: 1px solid var(--border); padding-bottom: 2px;
            transition: all 0.2s; cursor: pointer;
        }
        .minimal-link:hover { border-color: var(--txt); }

        .minimal-tech-grid {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;
        }
        .minimal-tech-item {
            display: flex; align-items: center; gap: 12px; font-size: 0.95rem;
            padding: 12px 0; border-bottom: 1px solid var(--border);
        }

        .minimal-feature-item {
            padding: 20px 0; border-bottom: 1px solid var(--border);
        }
        .minimal-feature-item:last-child { border-bottom: none; }
    `;

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            <style>{CSS}</style>

            <nav className="minimal-nav">
                <button className="minimal-btn-back" onClick={() => navigate(-1)}>
                    ← Back to Portfolio
                </button>
            </nav>

            <div className="minimal-container">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    
                    <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--txt3)', marginBottom: 20 }}>
                        PROJECT {String(idx + 1).padStart(2, '0')}
                    </p>
                    
                    <h1 className="serif" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 24 }}>
                        {d.name}
                    </h1>
                    
                    <p style={{ fontSize: '1.25rem', color: 'var(--txt2)', lineHeight: 1.6, fontWeight: 300, maxWidth: '600px' }}>
                        {d.tagline}
                    </p>

                    <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
                        {project.link && (
                            <a href={project.link.startsWith('http') ? project.link : `https://${project.link}`} target="_blank" rel="noreferrer" className="minimal-link">
                                Source Code <ArrowUpRight size={14} />
                            </a>
                        )}
                        {d.demoUrl && (
                            <a href={d.demoUrl} target="_blank" rel="noreferrer" className="minimal-link">
                                Live Demo <ArrowUpRight size={14} />
                            </a>
                        )}
                    </div>
                </motion.div>

                <div className="minimal-divider" />

                {/* About & Highlights */}
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                    <h2 className="minimal-section-title">Overview</h2>
                    <p className="serif" style={{ fontSize: '1.6rem', lineHeight: 1.6, fontWeight: 400, color: 'var(--txt)', marginBottom: 40 }}>
                        {d.overview}
                    </p>

                    <h2 className="minimal-section-title">Highlights</h2>
                    <ul style={{ listStyle: 'none' }}>
                        {d.highlights.map((h, i) => (
                            <li key={i} style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--txt2)', marginBottom: 16, display: 'flex', gap: 16 }}>
                                <span style={{ color: 'var(--txt3)' }}>—</span> {h}
                            </li>
                        ))}
                    </ul>
                </motion.div>

                <div className="minimal-divider" />

                {/* Tech Stack */}
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                    <h2 className="minimal-section-title">Technologies</h2>
                    <div className="minimal-tech-grid">
                        {d.techStack.map(s => {
                            const icon = devIcon(s);
                            return (
                                <div key={s} className="minimal-tech-item">
                                    {icon ? <img src={icon} alt={s} style={{ width: 16, height: 16, filter: 'grayscale(100%) opacity(0.8)' }} /> : <Code2 size={16} opacity={0.5} />}
                                    {s}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                <div className="minimal-divider" />

                {/* Features */}
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                    <h2 className="minimal-section-title">Capabilities</h2>
                    <div>
                        {d.features.map((f, i) => (
                            <div key={i} className="minimal-feature-item">
                                <p style={{ fontSize: '1.1rem', fontWeight: 400, lineHeight: 1.6 }}>{f}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div className="minimal-divider" />

                {/* File Tree */}
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                    <h2 className="minimal-section-title">Architecture</h2>
                    <div style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: 24 }}>
                        {d.projectStructure?.length > 0
                            ? d.projectStructure.map((n, i) => <FileNode key={i} node={n} />)
                            : <div style={{ color: 'var(--txt3)', fontSize: '0.9rem' }}>Architecture hidden.</div>
                        }
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
