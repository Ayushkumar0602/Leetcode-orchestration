import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Github, ExternalLink, ArrowUpRight, Folder, FileCode,
    ChevronRight, RefreshCw, Terminal, Zap, Shield,
    Layers, Cpu, Star, Award, Rocket, Code2,
} from 'lucide-react';
import NavProfile from './NavProfile';

// ─── Devicon ────────────────────────────────────────────────────
const DI = { react:'react',javascript:'javascript',typescript:'typescript',python:'python',nodejs:'nodejs','node.js':'nodejs',java:'java',cpp:'cplusplus','c++':'cplusplus',c:'c',go:'go',rust:'rust',swift:'swift',kotlin:'kotlin',dart:'dart',flutter:'flutter',html:'html5',css:'css3',sass:'sass',tailwind:'tailwindcss',mongodb:'mongodb',postgres:'postgresql',postgresql:'postgresql',mysql:'mysql',redis:'redis',firebase:'firebase',docker:'docker',kubernetes:'kubernetes',git:'git',github:'github',linux:'linux',aws:'amazonwebservices',gcp:'googlecloud',azure:'azure',graphql:'graphql',nextjs:'nextjs','next.js':'nextjs',vuejs:'vuejs','vue.js':'vuejs',angular:'angularjs',django:'django',flask:'flask',express:'express',figma:'figma',redux:'redux',vite:'vite' };
const devIcon = s => { const n = DI[s.toLowerCase().replace(/\s/g,'')]; return n ? `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${n}/${n}-original.svg` : null; };

// ─── Theme ──────────────────────────────────────────────────────
const THEMES = {
    Purple:  { accent:'#a855f7', muted:'#7c3aed', rgb:'168,85,247'  },
    Blue:    { accent:'#3b82f6', muted:'#1d4ed8', rgb:'59,130,246'  },
    Emerald: { accent:'#10b981', muted:'#065f46', rgb:'16,185,129'  },
    Amber:   { accent:'#f59e0b', muted:'#b45309', rgb:'245,158,11'  },
    Rose:    { accent:'#f43f5e', muted:'#be123c', rgb:'244,63,94'   },
    Cyan:    { accent:'#06b6d4', muted:'#0e7490', rgb:'6,182,212'   },
};

// ─── File Tree ──────────────────────────────────────────────────
function FileNode({ node, depth = 0 }) {
    const [open, setOpen] = useState(depth < 1);
    const isDir = node.type === 'folder' || node.children?.length > 0;
    return (
        <div style={{ marginLeft: depth * 14 }}>
            <div
                onClick={() => isDir && setOpen(o => !o)}
                className="fn-row"
                style={{
                    display:'flex', alignItems:'center', gap:6,
                    padding:'5px 8px', borderRadius:6,
                    cursor: isDir ? 'pointer' : 'default',
                    fontSize:'0.78rem', lineHeight:1,
                    color: isDir ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.38)',
                    fontFamily:'monospace', transition:'background 0.12s', userSelect:'none',
                }}
            >
                <ChevronRight size={11} style={{ transform: isDir && open ? 'rotate(90deg)':'none', transition:'transform 0.2s', opacity: isDir ? 0.45 : 0, flexShrink:0 }}/>
                {isDir
                    ? <Folder size={13} style={{color:'var(--accent)',opacity:0.7,flexShrink:0}}/>
                    : <FileCode size={13} style={{opacity:0.35,flexShrink:0}}/>
                }
                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{node.name}</span>
            </div>
            {isDir && open && node.children?.map((c,i) => <FileNode key={i} node={c} depth={depth+1}/>)}
        </div>
    );
}

// ─── Stagger variants ───────────────────────────────────────────
const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.08 } } };
const fadeUp  = { hidden:{ opacity:0, y:18 }, show:{ opacity:1, y:0, transition:{ duration:0.5, ease:[0.22,1,0.36,1] } } };

// ════════════════════════════════════════════════════════════════
export default function ProjectDetails() {
    const { uid, projId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target:heroRef, offset:['start start','end start'] });
    const heroY = useTransform(scrollYProgress, [0,1], ['0%','20%']);
    const heroO = useTransform(scrollYProgress, [0,0.75], [1, 0]);

    const load = () => {
        setLoading(true); setError(null);
        fetch(`https://leetcode-orchestration-55z3.onrender.com/api/profile/${uid}`)
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

    const pref = profile?.preferences ?? { theme:'Purple', darkMode:true };
    const T    = THEMES[pref.theme] ?? THEMES.Purple;
    const idx  = parseInt(projId);

    const CSS = `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        :root {
            --accent: ${T.accent};
            --accent-rgb: ${T.rgb};
            --bg:     #080809;
            --bg1:    #0f0f11;
            --bg2:    #16161a;
            --border: rgba(255,255,255,0.07);
            --txt:    #ececee;
            --txt2:   rgba(236,236,238,0.45);
            --txt3:   rgba(236,236,238,0.22);
        }

        html { scroll-behavior:smooth; }
        body {
            background:var(--bg);
            color:var(--txt);
            font-family:'Geist',system-ui,sans-serif;
            -webkit-font-smoothing:antialiased;
            overflow-x:hidden;
        }

        /* Grain */
        body::after {
            content:'';
            position:fixed; inset:0; z-index:9999; pointer-events:none;
            background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
            opacity:0.032;
        }

        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:99px; }

        .fn-row:hover { background:rgba(255,255,255,0.04); }
        .serif { font-family:'Instrument Serif',Georgia,serif; }
        .mono  { font-family:'Geist Mono',monospace; }

        .s-label {
            font-family:'Geist Mono',monospace;
            font-size:0.66rem; letter-spacing:0.13em;
            color:var(--txt3); text-transform:uppercase; font-weight:500;
        }

        .divider { width:100%; height:1px; background:var(--border); }

        /* Buttons */
        .btn-solid {
            display:inline-flex; align-items:center; gap:9px;
            padding:11px 24px; border-radius:9px;
            background:var(--txt); color:#080809;
            font-weight:600; font-size:0.85rem; letter-spacing:0.01em;
            text-decoration:none; border:none; cursor:pointer;
            transition:opacity 0.18s,transform 0.18s;
            font-family:'Geist',sans-serif;
        }
        .btn-solid:hover { opacity:0.85; transform:translateY(-1px); }

        .btn-outline {
            display:inline-flex; align-items:center; gap:9px;
            padding:11px 24px; border-radius:9px;
            border:1px solid var(--border); color:var(--txt2);
            font-weight:500; font-size:0.85rem; letter-spacing:0.01em;
            text-decoration:none; background:transparent; cursor:pointer;
            transition:border-color 0.18s,color 0.18s,transform 0.18s;
            font-family:'Geist',sans-serif;
        }
        .btn-outline:hover { border-color:var(--accent); color:var(--accent); transform:translateY(-1px); }

        /* Cards */
        .feat-card {
            border:1px solid var(--border); border-radius:14px;
            padding:1.75rem; background:var(--bg1);
            transition:border-color 0.22s,transform 0.22s;
        }
        .feat-card:hover { border-color:rgba(255,255,255,0.13); transform:translateY(-3px); }

        .tech-row {
            display:flex; align-items:center; gap:12px;
            padding:11px 14px; border-radius:11px;
            border:1px solid var(--border); background:var(--bg1);
            transition:border-color 0.18s,transform 0.18s;
        }
        .tech-row:hover { border-color:rgba(255,255,255,0.12); transform:translateX(3px); }

        /* Profile float (top right only) */
        .profile-float {
            position:fixed; top:20px; right:20px; z-index:600;
            background:var(--bg1); border:1px solid var(--border);
            border-radius:11px; padding:5px 10px 5px 14px;
            display:flex; align-items:center; gap:10px;
            backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
            box-shadow:0 4px 20px rgba(0,0,0,0.35);
        }

        /* Responsive */
        @media(max-width:820px) {
            .two-col { grid-template-columns:1fr !important; gap:3rem !important; }
        }
        @media(max-width:540px) {
            .feat-grid { grid-template-columns:1fr !important; }
        }
    `;

    /* ── Loading ───────────────────────────────────────── */
    if (loading) return (
        <div style={{minHeight:'100vh',background:'#080809',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <style>{CSS}</style>
            <motion.div
                animate={{rotate:360}} transition={{repeat:Infinity,duration:1,ease:'linear'}}
                style={{width:28,height:28,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.07)',borderTopColor:'rgba(255,255,255,0.55)'}}
            />
        </div>
    );

    /* ── Error ─────────────────────────────────────────── */
    if (error || !project) return (
        <div style={{minHeight:'100vh',background:'#080809',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem'}}>
            <style>{CSS}</style>
            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} style={{textAlign:'center',maxWidth:380}}>
                <div style={{width:52,height:52,borderRadius:14,background:'rgba(244,63,94,0.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.5rem'}}>
                    <Terminal size={24} color="#f43f5e"/>
                </div>
                <h2 className="serif" style={{fontSize:'2rem',fontWeight:400,marginBottom:'0.75rem',color:'var(--txt)'}}>Something went wrong</h2>
                <p style={{color:'var(--txt2)',fontSize:'0.88rem',lineHeight:1.75,marginBottom:'2rem'}}>{error ?? 'Project not found.'}</p>
                <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                    <button className="btn-solid" onClick={load}><RefreshCw size={14}/> Retry</button>
                    <button className="btn-outline" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            </motion.div>
        </div>
    );

    const d = project.detailedData ?? {
        name: project.name,
        tagline: project.tagline ?? 'A precise engineering achievement.',
        overview: project.desc ?? 'A groundbreaking implementation pushing the boundaries of modern performance and developer experience.',
        features: ['Scalable Distributed Core','Low-Latency Edge Processing','Quantum-Safe Encryption','Adaptive Load Balancing'],
        techStack: ['React','Rust','TypeScript'],
        installation: ['git clone <repo-url>','cd project && npm install','npm run dev'],
        usage: 'Streamlined operational control via unified API interface.',
        highlights: ['Award-winning efficiency metrics.','Seamless cloud-native integration.','99.9% uptime SLA.','Sub-10ms response time.'],
        projectStructure: [],
    };

    const ICONS = [Shield, Zap, Cpu, Layers, Star, Award, Rocket, Code2];

    return (
        <div style={{position:'relative',minHeight:'100vh',background:'var(--bg)'}}>
            <style>{CSS}</style>

            {/* ── Profile (only fixed element) ─────────────── */}
            <motion.div
                className="profile-float"
                initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
                transition={{delay:0.3,duration:0.4}}
            >
                <span className="s-label" style={{fontSize:'0.62rem',letterSpacing:'0.1em'}}>
                    CASE {String(idx+1).padStart(2,'0')}
                </span>
                <div style={{width:1,height:14,background:'var(--border)'}}/>
                <NavProfile />
            </motion.div>

            {/* ── Hero ─────────────────────────────────────── */}
            <section
                ref={heroRef}
                style={{
                    position:'relative', minHeight:'100vh',
                    display:'flex', flexDirection:'column', justifyContent:'flex-end',
                    padding:'0 clamp(2rem,6vw,6rem) clamp(3.5rem,6vw,5.5rem)',
                    overflow:'hidden',
                }}
            >
                {/* Background atmosphere */}
                <div aria-hidden style={{position:'absolute',inset:0,pointerEvents:'none'}}>
                    {/* Radial accent glow */}
                    <div style={{
                        position:'absolute', top:'-10%', left:'55%',
                        width:'65vw', height:'65vw', borderRadius:'50%',
                        background:T.accent, filter:'blur(160px)', opacity:0.07,
                        transform:'translateX(-50%)',
                    }}/>
                    {/* Dot grid */}
                    <div style={{
                        position:'absolute', inset:0,
                        backgroundImage:`radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)`,
                        backgroundSize:'40px 40px',
                        maskImage:'radial-gradient(ellipse 70% 70% at 50% 40%, black 30%, transparent 100%)',
                        WebkitMaskImage:'radial-gradient(ellipse 70% 70% at 50% 40%, black 30%, transparent 100%)',
                    }}/>
                    {/* Bottom fade */}
                    <div style={{position:'absolute',bottom:0,left:0,right:0,height:'40%',background:'linear-gradient(to top,var(--bg),transparent)'}}/>
                </div>

                {/* Parallax content */}
                <motion.div style={{y:heroY, opacity:heroO, position:'relative', zIndex:1}}>
                    <motion.div variants={stagger} initial="hidden" animate="show">

                        {/* Eyebrow row */}
                        <motion.div variants={fadeUp} style={{display:'flex',alignItems:'center',gap:14,marginBottom:'clamp(2rem,4vw,3.5rem)'}}>
                            <div style={{
                                width:38,height:38,borderRadius:11,
                                background:`linear-gradient(135deg,${T.accent},${T.muted})`,
                                display:'flex',alignItems:'center',justifyContent:'center',
                                boxShadow:`0 0 28px ${T.accent}35`,
                            }}>
                                <Code2 size={18} color="#fff" strokeWidth={1.8}/>
                            </div>
                            <div style={{display:'flex',alignItems:'center',gap:10}}>
                                <span className="s-label">Project</span>
                                <span style={{color:'var(--border)',fontSize:'0.7rem'}}>—</span>
                                <span className="s-label" style={{color:'var(--accent)',opacity:0.8}}>{d.techStack.slice(0,3).join(' · ')}</span>
                            </div>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            variants={fadeUp}
                            className="serif"
                            style={{
                                fontSize:'clamp(3.8rem,10vw,9rem)',
                                fontWeight:400,
                                lineHeight:0.92,
                                letterSpacing:'-0.025em',
                                color:'var(--txt)',
                                marginBottom:'clamp(1.5rem,3vw,2.5rem)',
                                maxWidth:'14ch',
                            }}
                        >
                            {d.name}
                        </motion.h1>

                        {/* Tagline */}
                        <motion.p
                            variants={fadeUp}
                            style={{
                                fontSize:'clamp(0.95rem,1.8vw,1.15rem)',
                                color:'var(--txt2)',fontWeight:300,
                                maxWidth:500,lineHeight:1.75,
                                marginBottom:'clamp(2.5rem,4vw,3.5rem)',
                            }}
                        >
                            {d.tagline}
                        </motion.p>

                        {/* CTAs */}
                        <motion.div variants={fadeUp} style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                            {project.link && (
                                <a
                                    href={project.link.startsWith('http') ? project.link : `https://${project.link}`}
                                    target="_blank" rel="noreferrer"
                                    className="btn-solid"
                                >
                                    <Github size={15}/> View Source
                                </a>
                            )}
                            {d.demoUrl && (
                                <a href={d.demoUrl} target="_blank" rel="noreferrer" className="btn-outline">
                                    Live Demo <ArrowUpRight size={14}/>
                                </a>
                            )}
                        </motion.div>
                    </motion.div>
                </motion.div>
            </section>

            {/* ── Body sections ────────────────────────────── */}
            <div style={{maxWidth:1160,margin:'0 auto',padding:'0 clamp(2rem,6vw,6rem)'}}>

                {/* Overview */}
                <section style={{padding:'6rem 0'}}>
                    <div className="divider" style={{marginBottom:'5rem'}}/>
                    <div className="two-col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5rem',alignItems:'start'}}>

                        <motion.div whileInView={{opacity:1,y:0}} initial={{opacity:0,y:16}} viewport={{once:true,margin:'-50px'}} transition={{duration:0.55}}>
                            <p className="s-label" style={{marginBottom:'1rem'}}>Overview</p>
                            <h2 className="serif" style={{fontSize:'clamp(2rem,4vw,2.8rem)',fontWeight:400,lineHeight:1.18,marginBottom:'1.75rem',color:'var(--txt)'}}>
                                The vision behind<br/><em>the project</em>
                            </h2>
                            <p style={{color:'var(--txt2)',fontSize:'1rem',lineHeight:1.9,fontWeight:300}}>
                                {d.overview}
                            </p>
                        </motion.div>

                        <motion.div whileInView={{opacity:1,y:0}} initial={{opacity:0,y:16}} viewport={{once:true,margin:'-50px'}} transition={{duration:0.55,delay:0.1}}>
                            <p className="s-label" style={{marginBottom:'1rem'}}>Highlights</p>
                            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                                {d.highlights.map((h,i) => (
                                    <div key={i} style={{
                                        display:'flex',gap:'1rem',alignItems:'flex-start',
                                        padding:'1.1rem 1.25rem',borderRadius:12,
                                        border:'1px solid var(--border)',background:'var(--bg1)',
                                    }}>
                                        <div style={{
                                            width:26,height:26,borderRadius:8,flexShrink:0,marginTop:1,
                                            background:`rgba(${T.rgb},0.1)`,
                                            border:`1px solid rgba(${T.rgb},0.18)`,
                                            display:'flex',alignItems:'center',justifyContent:'center',
                                        }}>
                                            <Award size={13} color={T.accent}/>
                                        </div>
                                        <p style={{fontSize:'0.88rem',lineHeight:1.65,color:'var(--txt2)',fontWeight:300}}>{h}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Tech Stack */}
                <section style={{padding:'6rem 0'}}>
                    <div className="divider" style={{marginBottom:'4rem'}}/>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'2.5rem',flexWrap:'wrap',gap:'1.5rem'}}>
                        <div>
                            <p className="s-label" style={{marginBottom:'0.75rem'}}>Technologies</p>
                            <h2 className="serif" style={{fontSize:'clamp(1.8rem,3.5vw,2.4rem)',fontWeight:400,lineHeight:1.2}}>The stack</h2>
                        </div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                            {d.techStack.map(s => {
                                const icon = devIcon(s);
                                return (
                                    <span key={s} style={{
                                        display:'inline-flex',alignItems:'center',gap:6,
                                        padding:'4px 11px',borderRadius:99,
                                        background:'rgba(255,255,255,0.04)',
                                        border:'1px solid var(--border)',
                                        fontSize:'0.7rem',fontWeight:500,
                                        color:'var(--txt2)',letterSpacing:'0.04em',
                                        fontFamily:'monospace',
                                    }}>
                                        {icon && <img src={icon} alt={s} style={{width:13,height:13}}/>}
                                        {s}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    <motion.div
                        variants={stagger} initial="hidden"
                        whileInView="show" viewport={{once:true,margin:'-40px'}}
                        style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}
                    >
                        {d.techStack.map((s,i) => {
                            const icon = devIcon(s);
                            const Ico  = ICONS[i % ICONS.length];
                            return (
                                <motion.div key={s} variants={fadeUp} className="tech-row">
                                    <div style={{
                                        width:38,height:38,borderRadius:10,flexShrink:0,
                                        background:'var(--bg2)',border:'1px solid var(--border)',
                                        display:'flex',alignItems:'center',justifyContent:'center',
                                    }}>
                                        {icon
                                            ? <img src={icon} alt={s} style={{width:20,height:20}}/>
                                            : <Ico size={18} color={T.accent}/>
                                        }
                                    </div>
                                    <div style={{flex:1,minWidth:0}}>
                                        <div style={{fontWeight:600,fontSize:'0.9rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s}</div>
                                        <div style={{fontSize:'0.68rem',color:'var(--txt3)',fontFamily:'monospace',marginTop:2}}>Core dependency</div>
                                    </div>
                                    <ChevronRight size={13} style={{opacity:0.18,flexShrink:0}}/>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </section>

                {/* Features */}
                <section style={{padding:'6rem 0'}}>
                    <div className="divider" style={{marginBottom:'4rem'}}/>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'3rem',flexWrap:'wrap',gap:'1.5rem'}}>
                        <div>
                            <p className="s-label" style={{marginBottom:'0.75rem'}}>Features</p>
                            <h2 className="serif" style={{fontSize:'clamp(1.8rem,3.5vw,2.4rem)',fontWeight:400,lineHeight:1.2}}>What it does</h2>
                        </div>
                        <p style={{maxWidth:320,color:'var(--txt2)',fontSize:'0.88rem',lineHeight:1.75,fontWeight:300}}>
                            Every feature engineered with intent — no bloat, no compromise.
                        </p>
                    </div>

                    <motion.div
                        className="feat-grid"
                        variants={stagger} initial="hidden"
                        whileInView="show" viewport={{once:true,margin:'-40px'}}
                        style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(280px,100%),1fr))',gap:'0.9rem'}}
                    >
                        {d.features.map((f,i) => {
                            const Ico = ICONS[i % ICONS.length];
                            return (
                                <motion.div key={i} variants={fadeUp} className="feat-card">
                                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'2rem'}}>
                                        <div style={{
                                            width:40,height:40,borderRadius:11,
                                            background:`rgba(${T.rgb},0.1)`,
                                            border:`1px solid rgba(${T.rgb},0.18)`,
                                            display:'flex',alignItems:'center',justifyContent:'center',
                                        }}>
                                            <Ico size={19} color={T.accent}/>
                                        </div>
                                        <span className="mono" style={{fontSize:'0.65rem',color:'var(--txt3)',letterSpacing:'0.1em'}}>
                                            {String(i+1).padStart(2,'0')}
                                        </span>
                                    </div>
                                    <p style={{fontWeight:600,fontSize:'0.95rem',lineHeight:1.55,color:'var(--txt)'}}>{f}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </section>

                {/* Deployment + File Tree */}
                <section style={{padding:'6rem 0'}}>
                    <div className="divider" style={{marginBottom:'4rem'}}/>
                    <div className="two-col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5rem',alignItems:'start'}}>

                        {/* Installation */}
                        <motion.div whileInView={{opacity:1,y:0}} initial={{opacity:0,y:16}} viewport={{once:true}} transition={{duration:0.55}}>
                            <p className="s-label" style={{marginBottom:'0.75rem'}}>Getting Started</p>
                            <h2 className="serif" style={{fontSize:'clamp(1.8rem,3vw,2.4rem)',fontWeight:400,marginBottom:'2.5rem',lineHeight:1.2}}>
                                Installation
                            </h2>
                            <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
                                {d.installation.map((step,i) => (
                                    <div key={i} style={{display:'flex',gap:'1.1rem',alignItems:'flex-start'}}>
                                        <span className="mono" style={{fontSize:'0.65rem',color:T.accent,letterSpacing:'0.1em',paddingTop:'1rem',minWidth:22}}>
                                            {String(i+1).padStart(2,'0')}
                                        </span>
                                        <div style={{
                                            flex:1,fontFamily:'monospace',fontSize:'0.8rem',
                                            lineHeight:1.7,color:'rgba(236,236,238,0.6)',
                                            background:'var(--bg2)',border:'1px solid var(--border)',
                                            borderRadius:9,padding:'0.85rem 1.1rem',
                                            wordBreak:'break-all',
                                        }}>
                                            {step}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{marginTop:'3rem',paddingTop:'2.5rem',borderTop:'1px solid var(--border)'}}>
                                <p className="s-label" style={{marginBottom:'0.85rem'}}>Usage</p>
                                <p style={{color:'var(--txt2)',fontSize:'0.92rem',lineHeight:1.8,fontWeight:300}}>{d.usage}</p>
                            </div>
                        </motion.div>

                        {/* File Tree */}
                        <motion.div whileInView={{opacity:1,y:0}} initial={{opacity:0,y:16}} viewport={{once:true}} transition={{duration:0.55,delay:0.1}}>
                            <p className="s-label" style={{marginBottom:'0.75rem'}}>Structure</p>
                            <h2 className="serif" style={{fontSize:'clamp(1.8rem,3vw,2.4rem)',fontWeight:400,marginBottom:'2.5rem',lineHeight:1.2}}>
                                Project tree
                            </h2>
                            <div style={{background:'#0b0c10',borderRadius:14,border:'1px solid rgba(255,255,255,0.06)',overflow:'hidden'}}>
                                {/* Window chrome */}
                                <div style={{
                                    display:'flex',alignItems:'center',gap:7,
                                    padding:'11px 15px',
                                    borderBottom:'1px solid rgba(255,255,255,0.05)',
                                    background:'rgba(255,255,255,0.02)',
                                }}>
                                    {['#ff5f57','#febc2e','#28c840'].map(c => (
                                        <div key={c} style={{width:10,height:10,borderRadius:'50%',background:c,opacity:0.75}}/>
                                    ))}
                                    <span style={{marginLeft:'auto',fontFamily:'monospace',fontSize:'0.65rem',color:'rgba(255,255,255,0.18)'}}>
                                        ~/{d.name.toLowerCase().replace(/\s/g,'-')}
                                    </span>
                                </div>
                                <div style={{padding:'0.9rem',maxHeight:360,overflowY:'auto'}}>
                                    {d.projectStructure?.length > 0
                                        ? d.projectStructure.map((n,i) => <FileNode key={i} node={n}/>)
                                        : (
                                            <div style={{padding:'3rem 1rem',textAlign:'center',color:'rgba(255,255,255,0.14)'}}>
                                                <Terminal size={26} style={{marginBottom:'0.7rem',opacity:0.4,display:'block',margin:'0 auto 0.7rem'}}/>
                                                <p style={{fontFamily:'monospace',fontSize:'0.75rem'}}>No structure defined</p>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>

            {/* ── Footer ───────────────────────────────────── */}
            <footer style={{
                borderTop:'1px solid var(--border)',
                padding:'2.5rem clamp(2rem,6vw,6rem)',
                display:'flex',justifyContent:'space-between',alignItems:'center',
                flexWrap:'wrap',gap:'1rem',
                position:'relative',zIndex:10,
            }}>
                <div style={{display:'flex',alignItems:'center',gap:'1.25rem'}}>
                    <div style={{
                        width:30,height:30,borderRadius:9,flexShrink:0,
                        background:`linear-gradient(135deg,${T.accent},${T.muted})`,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        boxShadow:`0 0 16px ${T.accent}30`,
                    }}>
                        <Rocket size={13} color="#fff"/>
                    </div>
                    <div>
                        <p style={{fontSize:'0.82rem',fontWeight:600}}>{d.name}</p>
                        <p className="mono" style={{fontSize:'0.66rem',color:'var(--txt3)',marginTop:2}}>CodeArena / 2026</p>
                    </div>
                </div>
                <p className="mono" style={{fontSize:'0.66rem',color:'var(--txt3)',letterSpacing:'0.07em'}}>
                    CASE {String(idx+1).padStart(2,'0')} — {d.techStack.slice(0,3).join(' · ')}
                </p>
            </footer>
        </div>
    );
}