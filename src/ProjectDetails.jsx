import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Github, Globe, Code2, CheckCircle, 
    Layers, Cpu, BookOpen, Rocket, Star, Info, List,
    ChevronRight, ExternalLink, Award, Folder, FileCode, FileDigit
} from 'lucide-react';
import NavProfile from './NavProfile';

// ── Devicon ──────────────────────────────────────────────────────
const DEVICON_MAP = { react: 'react', javascript: 'javascript', typescript: 'typescript', python: 'python', nodejs: 'nodejs', 'node.js': 'nodejs', java: 'java', cpp: 'cplusplus', 'c++': 'cplusplus', c: 'c', go: 'go', rust: 'rust', swift: 'swift', kotlin: 'kotlin', dart: 'dart', flutter: 'flutter', html: 'html5', css: 'css3', sass: 'sass', tailwind: 'tailwindcss', mongodb: 'mongodb', postgres: 'postgresql', postgresql: 'postgresql', mysql: 'mysql', redis: 'redis', firebase: 'firebase', docker: 'docker', kubernetes: 'kubernetes', git: 'git', github: 'github', linux: 'linux', aws: 'amazonwebservices', gcp: 'googlecloud', azure: 'azure', graphql: 'graphql', nextjs: 'nextjs', 'next.js': 'nextjs', vuejs: 'vuejs', 'vue.js': 'vuejs', angular: 'angularjs', django: 'django', flask: 'flask', express: 'express', figma: 'figma', redux: 'redux', vite: 'vite' };
const devIcon = s => { const n = DEVICON_MAP[s.toLowerCase().replace(/\s/g, '')]; return n ? `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${n}/${n}-original.svg` : null; };

// ── Theme Configs ────────────────────────────────────────────────
const THEME_MAP = {
    'Purple': { accent: '#a855f7', hex2: '#6d28d9', rgb: '168,85,247', heroGrad: 'linear-gradient(135deg,#a855f7,#3b82f6)' },
    'Blue': { accent: '#3b82f6', hex2: '#1d4ed8', rgb: '59,130,246', heroGrad: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
    'Emerald': { accent: '#10b981', hex2: '#065f46', rgb: '16,185,129', heroGrad: 'linear-gradient(135deg,#10b981,#065f46)' },
    'Amber': { accent: '#f59e0b', hex2: '#b45309', rgb: '245,158,11', heroGrad: 'linear-gradient(135deg,#f59e0b,#b45309)' },
    'Rose': { accent: '#f43f5e', hex2: '#be123c', rgb: '244,63,94', heroGrad: 'linear-gradient(134deg,#f43f5e,#be123c)' },
    'Cyan': { accent: '#06b6d4', hex2: '#0e7490', rgb: '6,182,212', heroGrad: 'linear-gradient(135deg,#06b6d4,#0e7490)' },
};

// ── File Tree Component ──────────────────────────────────────
function FileNode({ node, depth = 0 }) {
    const [open, setOpen] = useState(depth < 1);
    const isFolder = node.type === 'folder' || (node.children && node.children.length > 0);

    return (
        <div style={{ marginLeft: depth > 0 ? '20px' : '0' }}>
            <div 
                onClick={() => isFolder && setOpen(!open)}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '6px 8px', 
                    borderRadius: '8px',
                    cursor: isFolder ? 'pointer' : 'default',
                    background: open && isFolder ? 'var(--card-bg)' : 'transparent',
                    transition: 'all 0.2s',
                    fontSize: '0.9rem',
                    color: isFolder ? 'var(--txt1)' : 'var(--txt2)',
                    fontWeight: isFolder ? 600 : 400
                }}
                className="file-node-hover"
            >
                {isFolder ? (
                    <ChevronRight size={14} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', opacity: 0.5 }} />
                ) : (
                    <div style={{ width: 14 }} />
                )}
                {isFolder ? <Folder size={16} color="var(--accent)" fill="var(--accent)" style={{ opacity: 0.3 }} /> : <FileCode size={16} style={{ opacity: 0.5 }} />}
                <span>{node.name}</span>
            </div>
            {isFolder && open && node.children && (
                <div style={{ borderLeft: '1px solid var(--divide)', marginLeft: '14px' }}>
                    {node.children.map((child, i) => (
                        <FileNode key={i} node={child} depth={0} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ProjectDetails() {
    const { uid, projId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`https://leetcode-orchestration-55z3.onrender.com/api/profile/${uid}`);
                const data = await res.json();
                if (data.profile) {
                    setProfile(data.profile);
                    const proj = data.profile.projects?.[parseInt(projId)];
                    if (proj) {
                        setProject(proj);
                    } else {
                        setError("Project not found");
                    }
                } else {
                    setError("User profile not found");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load project details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [uid, projId]);

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#04050a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid rgba(168,85,247,0.2)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
        </div>
    );

    if (error || !project) return (
        <div style={{ minHeight: '100vh', background: '#04050a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>404</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>{error || "Project details could not be found."}</p>
            <button onClick={() => navigate(-1)} style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)', border: 'none', borderRadius: '12px', padding: '12px 28px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Go Back</button>
        </div>
    );

    const prefs = profile.preferences || { theme: 'Purple', darkMode: true };
    const T = THEME_MAP[prefs.theme] || THEME_MAP['Purple'];
    const isDark = prefs.darkMode !== false;

    const d = project.detailedData || {
        name: project.name,
        tagline: project.tagline || "Advanced Technical Implementation",
        overview: project.desc || "A sophisticated project demonstrating modern software engineering principles and best practices.",
        features: ["Scalable Architecture", "Clean & Maintainable Code", "Responsive User Interface"],
        techStack: ["React", "Node.js", "Firebase", "Express"],
        installation: ["Clone the project repository", "Configure environment variables", "Execute 'npm install' & 'npm run dev'"],
        usage: "Detailed documentation is available in the root repository for comprehensive setup and usage instructions.",
        highlights: ["Optimized for high performance and low latency.", "Implements secure authentication and data protection.", "Architected for modularity and future extensibility."],
        projectStructure: [
            { name: "src", type: "folder", children: [ { name: "components", type: "folder", children: [] }, { name: "App.jsx", type: "file" } ] },
            { name: "package.json", type: "file" },
            { name: "README.md", type: "file" }
        ]
    };

    const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    :root {
        --bg: ${isDark ? '#04050a' : '#f4f4f5'};
        --txt1: ${isDark ? '#ffffff' : '#0f172a'};
        --txt2: ${isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.7)'};
        --txt3: ${isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.45)'};
        --accent: ${T.accent};
        --accent-rgb: ${T.rgb};
        --glass-bg: ${isDark ? 'rgba(16,18,26,0.7)' : 'rgba(255,255,255,0.85)'};
        --glass-border: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'};
        --card-bg: ${isDark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.6)'};
        --card-border: ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.06)'};
        --divide: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'};
    }
    .pd-page { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--txt1); min-height: 100vh; position: relative; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .glass { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 22px; }
    .card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 18px; padding: 2rem; }
    .tech-pill { display: flex; align-items: center; gap: 8px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 10px 16px; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
    .tech-pill:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(var(--accent-rgb), 0.15); }
    .btn-primary { background: var(--accent); color: #fff; padding: 12px 24px; border-radius: 14px; font-weight: 700; text-decoration: none; display: flex; alignItems: center; gap: 8px; transition: transform 0.2s; }
    .btn-primary:hover { transform: translateY(-2px); }
    .pd-grid-bg { position: fixed; inset: 0; background-image: linear-gradient(var(--divide) 1px, transparent 1px), linear-gradient(90deg, var(--divide) 1px, transparent 1px); background-size: 60px 60px; pointer-events: none; z-index: 0; opacity: 0.7; }
    .pd-orb { position: absolute; pointer-events: none; z-index: 0; border-radius: 50%; filter: blur(100px); opacity: 0.15; }
    .file-node-hover:hover { background: var(--card-bg) !important; color: var(--accent) !important; }
    `;

    return (
        <div className="pd-page">
            <style>{CSS}</style>

            <div className="pd-grid-bg" />
            <div className="pd-orb" style={{ top: '-100px', left: '10%', width: '600px', height: '600px', background: T.accent }} />
            <div className="pd-orb" style={{ bottom: '10%', right: '5%', width: '400px', height: '400px', background: '#3b82f6' }} />
            
            <nav style={{ height: '70px', borderBottom: '1px solid var(--divide)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', background: 'var(--nav-bg)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt1)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
                        <ArrowLeft size={16} /> Portfolio
                    </button>
                    <div style={{ width: '1px', height: '20px', background: 'var(--divide)' }} />
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--txt1)' }}>Project Case Study</span>
                </div>
                <NavProfile />
            </nav>

            <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }} className="animate-up">
                    <div style={{ width: '90px', height: '90px', borderRadius: '24px', background: T.heroGrad, margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 20px 40px ${T.accent}40` }}>
                        <Code2 size={45} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.04em' }}>{d.name}</h1>
                    <p style={{ fontSize: '1.4rem', color: 'var(--accent)', fontWeight: 600, maxWidth: '700px', margin: '0 auto 2.5rem' }}>{d.tagline}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                        {project.link && (
                            <a href={project.link.startsWith('http') ? project.link : `https://${project.link}`} target="_blank" rel="noreferrer" className="btn-primary" style={{ background: isDark ? '#fff' : '#000', color: isDark ? '#000' : '#fff' }}>
                                <Github size={20} /> Repository
                            </a>
                        )}
                        {d.demoUrl && (
                            <a href={d.demoUrl} target="_blank" rel="noreferrer" className="btn-primary">
                                <Globe size={20} /> Live Experience
                            </a>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '2.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <section className="card glass animate-up" style={{ animationDelay: '0.1s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderBottom: '1px solid var(--divide)', paddingBottom: '1rem' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '12px', background: `${T.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Info size={20} color={T.accent} /></div>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Overview</h2>
                            </div>
                            <p style={{ fontSize: '1.05rem', color: 'var(--txt2)', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{d.overview}</p>
                        </section>

                        {/* Project Structure Section */}
                        <section className="card glass animate-up" style={{ animationDelay: '0.15s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderBottom: '1px solid var(--divide)', paddingBottom: '1rem' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '12px', background: `${T.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><List size={20} color={T.accent} /></div>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Project Architecture</h2>
                            </div>
                            <div style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)', borderRadius: '14px', padding: '1.5rem', border: '1px solid var(--card-border)' }}>
                                {d.projectStructure && d.projectStructure.length > 0 ? (
                                    d.projectStructure.map((node, i) => (
                                        <FileNode key={i} node={node} />
                                    ))
                                ) : (
                                    <p style={{ fontSize: '0.9rem', color: 'var(--txt3)' }}>Structure not available for this project.</p>
                                )}
                            </div>
                        </section>

                        <section className="card glass animate-up" style={{ animationDelay: '0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderBottom: '1px solid var(--divide)', paddingBottom: '1rem' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '12px', background: `${T.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={20} color={T.accent} /></div>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Core Features</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                                {d.features.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '14px', background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                                        <CheckCircle size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <span style={{ fontSize: '1rem', color: 'var(--txt1)', fontWeight: 500, lineHeight: 1.5 }}>{f}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div className="card glass animate-up" style={{ animationDelay: '0.3s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                                    <Cpu size={18} color={T.accent} />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Installation</h3>
                                </div>
                                {d.installation.map((step, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '0.92rem', color: 'var(--txt2)' }}>
                                        <div style={{ fontWeight: 900, color: T.accent, fontSize: '0.8rem', minWidth: '22px' }}>0{i+1}</div>
                                        <div style={{ lineHeight: 1.6 }}>{step}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="card glass animate-up" style={{ animationDelay: '0.4s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                                    <BookOpen size={18} color={T.accent} />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Usage</h3>
                                </div>
                                <p style={{ fontSize: '0.95rem', color: 'var(--txt2)', lineHeight: 1.7 }}>{d.usage}</p>
                            </div>
                        </section>
                    </div>

                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="card glass animate-up" style={{ animationDelay: '0.5s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                                <Layers size={20} color={T.accent} />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Tech Stack</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {d.techStack.map(s => {
                                    const iconUrl = devIcon(s);
                                    return (
                                        <div key={s} className="tech-pill">
                                            {iconUrl ? (
                                                <img src={iconUrl} alt={s} style={{ width: 18, height: 18 }} />
                                            ) : (
                                                <Code2 size={16} color={T.accent} />
                                            )}
                                            {s}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="card glass animate-up" style={{ animationDelay: '0.6s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                                <Award size={20} color="#eab308" />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Highlights</h3>
                            </div>
                            {d.highlights.map((h, i) => (
                                <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '1.25rem' }}>
                                    <Rocket size={16} color="#eab308" style={{ flexShrink: 0, marginTop: '3px' }} />
                                    <p style={{ fontSize: '0.92rem', color: 'var(--txt2)', lineHeight: 1.6 }}>{h}</p>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </main>
            
            <footer style={{ padding: '6rem 2rem', borderTop: '1px solid var(--divide)', textAlign: 'center' }}>
                <Rocket size={32} color={T.accent} style={{ opacity: 0.5, marginBottom: '1.5rem' }} />
                <p style={{ color: 'var(--txt3)', fontSize: '0.9rem', fontWeight: 600 }}>Crafted with CodeArena Intelligence</p>
            </footer>
        </div>
    );
}
