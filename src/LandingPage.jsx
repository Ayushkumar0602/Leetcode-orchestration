import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { buildLoginUrl } from './utils/analytics';
import NavProfile from './NavProfile';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import {
    Brain, Code2, Server, Zap, Play, Mic, Terminal, 
    ArrowRight, CheckCircle, Orbit, FileText, Briefcase, 
    BookOpen, Layers, Bot, MessageSquare, ShieldCheck, 
    BarChart3, Globe, Users, Trophy, Eye, ScanFace,
    AlertTriangle, Sparkles, GitBranch, Activity, Award,
    FileCheck, Search, UploadCloud, Rocket, LayoutTemplate,
    ListChecks, Library, Cpu
} from 'lucide-react';
import './LandingPage.css';

// ── SEO JSON-LD ──────────────────────────────────────────────
const SEO_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Whizan AI",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "description": "An AI-powered technical interview simulator and developer ecosystem offering real-time mock interviews, system design practice, live coding in 7 languages, and autonomous job applications for software engineers.",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free tier available (Spark), with premium tier (Blaze) starting at competitive prices."
    },
    "featureList": [
        "AI Mock Interviews with Real-Time Feedback",
        "Code Execution & Testing in 7 Languages",
        "1000+ Coding Problems Library",
        "System Design Interview Training",
        "AI-Powered Resume Parser & Portfolio Builder",
        "Autonomous Job Application Tool",
        "Interactive Learning Courses & Tutorials"
    ]
};

const HOME_FAQS = [
    {
        question: 'What is Whizan AI?',
        answer: 'Whizan AI is a web-based technical interview preparation platform for software engineers. It combines AI-assisted mock interviews, coding practice, system design learning, developer tools, and career-focused portfolio and resume experiences in one product.'
    },
    {
        question: 'Who is Whizan AI for?',
        answer: 'Whizan AI is designed for software engineers, computer science students, interview candidates, and developers who want structured practice for coding rounds, system design interviews, and public professional showcasing.'
    },
    {
        question: 'What can you do on Whizan AI?',
        answer: 'Users can practice DSA problems, explore system design learning paths, browse engineering courses, read technical books, use browser-based code tools, view company-wise preparation pages, and explore preview pages for resume optimization and developer portfolios.'
    },
    {
        question: 'Where should new users start?',
        answer: 'Good public starting points are the homepage, the AI interview overview page, the DSA practice page, the system design hub, the FAQ page, and the preview pages for DSA practice and resume optimization.'
    }
];

const HOME_FAQ_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": HOME_FAQS.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
        }
    }))
};
// ── Components ────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, desc, tag, tagColor, delay }) => (
    <motion.div 
        className="wh-feature-card"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay }}
        whileHover={{ y: -8, boxShadow: `0 25px 50px -12px ${tagColor}30` }}
    >
        <div className="wh-fc-icon-wrapper" style={{ '--icon-accent': tagColor }}>
            <Icon className="wh-fc-icon" />
            <div className="wh-fc-glow" style={{ background: tagColor }}/>
        </div>
        <div className="wh-fc-tag" style={{ color: tagColor, background: `${tagColor}15`, border: `1px solid ${tagColor}30` }}>
            {tag}
        </div>
        <h3 className="wh-fc-title">{title}</h3>
        <p className="wh-fc-desc">{desc}</p>
    </motion.div>
);

const SectionHeader = ({ tag, title, desc }) => (
    <div className="wh-section-header">
        <motion.div 
            className="wh-sh-tag"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
        >
            {tag}
        </motion.div>
        <motion.h2 
            className="wh-sh-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
        >
            {title}
        </motion.h2>
        <motion.p 
            className="wh-sh-desc"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
        >
            {desc}
        </motion.p>
    </div>
);

// ── Main Page ─────────────────────────────────────────────
export default function LandingPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleCtaClick = (path) => {
        navigate(path);
        window.scrollTo(0, 0);
    };

    return (
        <div className="wh-landing-root">
            <Helmet>
                <html lang="en" />
                <title>AI Coding Interview Simulator & Career Ecosystem | Whizan AI</title>
                <meta name="description" content="Master technical interviews with Whizan AI. Real-time mock interviews, system design practice, live coding in 7 languages, and automated job applications for engineers." />
                <meta name="keywords" content="AI mock interview, leetcode alternative, system design practice, autonomous job applier, resume parser, live coding interview" />
                <meta property="og:title" content="Whizan AI - Intelligent Technical Interview Ecosystem" />
                <meta property="og:description" content="Master technical interviews with Whizan AI. Real-time mock interviews, system design practice, live coding in 7 languages, and automated job applications." />
                <meta property="og:type" content="website" />
                <meta property="og:image:alt" content="Whizan AI homepage showing AI interview preparation, coding practice, and developer career tools." />
                <link rel="canonical" href="https://whizan.xyz/" />
                <script type="application/ld+json">{JSON.stringify(SEO_SCHEMA)}</script>
                <script type="application/ld+json">{JSON.stringify(HOME_FAQ_SCHEMA)}</script>
            </Helmet>

            <div className="wh-bg-mesh" aria-hidden="true" />
            
            {/* ── Navbar ────────────────────────────────────────────── */}
            <nav className={`wh-navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="wh-container wh-nav-inner">
                    <div className="wh-brand" onClick={() => handleCtaClick('/dashboard')} role="button" tabIndex={0}>
                        <img src="/logo.jpeg" alt="Whizan AI Logo" className="wh-logo" width="36" height="36" />
                        <span className="wh-brand-text">Whizan AI</span>
                    </div>
                    <div className="wh-nav-links">
                        <a href="#features">Features</a>
                        <a href="#ecosystem">Ecosystem</a>
                        <a href="#pricing">Pricing</a>
                    </div>
                    <div className="wh-nav-cta">
                        {currentUser ? (
                            <button className="wh-btn-outline" onClick={() => handleCtaClick('/dashboard')}>Dashboard</button>
                        ) : (
                            <button className="wh-btn-glow" onClick={() => handleCtaClick(buildLoginUrl({ ref: 'navbar' }))}>
                                Get Started
                            </button>
                        )}
                        <NavProfile />
                    </div>
                </div>
            </nav>

            <main>
                {/* ── Hero Section ─────────────────────────────────────── */}
                <section className="wh-hero">
                    {/* Moving Aura Background */}
                    <div className="wh-aura-bg" aria-hidden="true">
                        <div className="aura-orb aura-purple-1" />
                        <div className="aura-orb aura-magenta" />
                        <div className="aura-orb aura-teal" />
                        <div className="aura-orb aura-blue" />
                        <div className="aura-orb aura-purple-2" />
                        <div className="aura-line aura-line-1" />
                        <div className="aura-line aura-line-2" />
                        <div className="aura-line aura-line-3" />
                    </div>
                    <div className="wh-hero-glow glow-1" />
                    <div className="wh-hero-glow glow-2" />
                    <div className="wh-container">
                        <div className="wh-hero-grid">
                            <div className="wh-hero-content">
                                <motion.div 
                                    className="wh-hero-badge"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Orbit className="wh-badge-icon" size={16} /> 
                                    <span>The Ultimate Career Architect for Software Engineers</span>
                                </motion.div>
                                
                                <motion.h1 
                                    className="wh-hero-title"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.1 }}
                                >
                                    Master Interviews.<br />
                                    <span className="wh-text-gradient">Land Top Offers.</span><br />
                                    Automated by AI.
                                </motion.h1>
                                
                                <motion.p 
                                    className="wh-hero-subtitle"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.2 }}
                                >
                                    Experience the world's most advanced technical interview simulator. Engage in real-time voice conversations, execute code across 7 languages, master system design, and let AI autonomously apply to jobs for you.
                                </motion.p>
                                
                                <motion.div 
                                    className="wh-hero-actions"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.3 }}
                                >
                                    <button className="wh-btn-glow large" onClick={() => handleCtaClick('/aiinterview')}>
                                        <Brain size={20} /> Start Playing Mock
                                    </button>
                                    <button className="wh-btn-outline large" onClick={() => handleCtaClick('/dsaquestion/1')}>
                                        <Code2 size={20} /> Explore 1000+ Problems
                                    </button>
                                </motion.div>

                                <motion.div 
                                    className="wh-hero-metrics"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1, delay: 0.6 }}
                                >
                                    <div className="wh-metric"><strong className="wh-text-gradient-purple">7</strong> Supported Languages</div>
                                    <div className="wh-metric"><strong className="wh-text-gradient-blue">15+</strong> Sandbox Test Cases</div>
                                    <div className="wh-metric"><strong className="wh-text-gradient-teal">100%</strong> Autonomous Applications</div>
                                </motion.div>
                            </div>
                            
                            <motion.div 
                                className="wh-hero-visual"
                                initial={{ opacity: 0, x: 40, rotateY: -10 }}
                                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                                transition={{ duration: 1, delay: 0.3, type: "spring" }}
                            >
                                <div className="wh-visual-card">
                                    <div className="wh-vc-header">
                                        <div className="wh-mac-dots">
                                            <span style={{background: '#ff5f56'}}/>
                                            <span style={{background: '#ffbd2e'}}/>
                                            <span style={{background: '#27c93f'}}/>
                                        </div>
                                        <span className="wh-vc-title">Live Interview Analysis</span>
                                        <span className="wh-vc-status"><div className="pulse-dot"/>Recording...</span>
                                    </div>
                                    <div className="wh-vc-video-wrap">
                                        <video src="/indexpage_video 1 .mov" autoPlay loop muted playsInline className="wh-vc-video" />
                                    </div>
                                    <div className="wh-vc-footer">
                                        <div className="wh-ai-comment">
                                            <Bot size={14} color="#a855f7" />
                                            <span>"Great use of a HashMap here. What happens if the array contains duplicates?"</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ── Core Features ───────────────────────────────────────── */}
                <section id="features" className="wh-section wh-section-dark wh-caps-section">
                    {/* Aura bg + animated overlay */}
                    <div className="wh-caps-bg" aria-hidden="true">
                        {/* Reuse aura orbs for visual continuity */}
                        <div className="aura-orb aura-caps-purple" />
                        <div className="aura-orb aura-caps-magenta" />
                        <div className="aura-orb aura-caps-teal" />
                        <div className="aura-line aura-caps-line-1" />
                        <div className="wh-caps-grid-lines" />
                        <div className="wh-caps-scan-line" />
                        <div className="wh-caps-particles">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className="wh-particle" style={{
                                    left: `${5 + (i * 4.8) % 92}%`,
                                    animationDelay: `${(i * 0.41) % 5}s`,
                                    animationDuration: `${4 + (i * 0.37) % 5}s`
                                }} />
                            ))}
                        </div>
                    </div>
                    <div className="wh-container">
                        <SectionHeader 
                            tag="Core Capabilities" 
                            title="A Real Interview. Powered by AI." 
                            desc="Whizan AI doesn't just quiz you — it simulates the full FAANG-level interview experience with proctoring, voice AI, live code analysis, and a comprehensive scorecard."
                        />

                        {/* Top 2-col bento */}
                        <div className="wh-caps-grid">

                            {/* --- Proctoring Card (wide) --- */}
                            <motion.div
                                className="wh-cap-card wh-cap-proctor"
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="wh-cap-badge"><ScanFace size={14}/> AI Proctor</div>
                                <h3>Real-Time Violation Detection</h3>
                                <p>Face &amp; head pose analysis via TinyFaceDetector. Detects multiple faces, phone/tablet objects (COCO-SSD), and OS-level cheating like PrintScreen or tab-switching. Violations blur the screen and log malpractice strikes in real-time.</p>
                                <div className="wh-cap-pills">
                                    <span><Eye size={12}/> Face Detection</span>
                                    <span><AlertTriangle size={12}/> Object Detection</span>
                                    <span><ShieldCheck size={12}/> OS Monitoring</span>
                                </div>
                                <div className="wh-cap-proctor-visual">
                                    <div className="wh-proctor-bar">
                                        <div className="wh-proctor-dot green"/>
                                        <span>No violations detected</span>
                                        <span className="wh-proctor-mode">Strict Mode</span>
                                    </div>
                                    <div className="wh-proctor-hud">
                                        <div className="wh-hud-box">
                                            <span className="wh-hud-label">Face Status</span>
                                            <span className="wh-hud-val green">1 Face ✓</span>
                                        </div>
                                        <div className="wh-hud-box">
                                            <span className="wh-hud-label">Objects</span>
                                            <span className="wh-hud-val green">Clear ✓</span>
                                        </div>
                                        <div className="wh-hud-box">
                                            <span className="wh-hud-label">Violations</span>
                                            <span className="wh-hud-val amber">0 / 3</span>
                                        </div>
                                        <div className="wh-hud-box">
                                            <span className="wh-hud-label">Focus</span>
                                            <span className="wh-hud-val green">Active ✓</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* --- Strictness Modes Card --- */}
                            <motion.div
                                className="wh-cap-card wh-cap-modes"
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <div className="wh-cap-badge purple"><Zap size={14}/> Strictness Modes</div>
                                <h3>4 Levels of Interview Pressure</h3>
                                <p>From relaxed learning to real-world pressure — escalate from Low to Real Interview mode as you progress.</p>
                                <div className="wh-modes-list">
                                    <div className="wh-mode-row low">
                                        <span className="wh-mode-dot"/>
                                        <div>
                                            <strong>Low</strong>
                                            <span>Chill &amp; helpful, no proctoring</span>
                                        </div>
                                    </div>
                                    <div className="wh-mode-row mid">
                                        <span className="wh-mode-dot"/>
                                        <div>
                                            <strong>Mid</strong>
                                            <span>Blocks right-click, flags alt-tab</span>
                                        </div>
                                    </div>
                                    <div className="wh-mode-row strict">
                                        <span className="wh-mode-dot"/>
                                        <div>
                                            <strong>Strict</strong>
                                            <span>Fullscreen + AI Proctor active</span>
                                        </div>
                                    </div>
                                    <div className="wh-mode-row real">
                                        <span className="wh-mode-dot"/>
                                        <div>
                                            <strong>Real Interview</strong>
                                            <span>Terminates on multiple violations</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* --- Voice AI Card --- */}
                            <motion.div
                                className="wh-cap-card wh-cap-voice"
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.15 }}
                            >
                                <div className="wh-cap-badge blue"><Mic size={14}/> Conversational AI</div>
                                <h3>6 AI Interviewer Voices</h3>
                                <p>The AI conducts a 6-phase interview — Opening → Brute-Force → Optimization → Coding → Wrap-Up → End — with real-time speech recognition and Sarvam TTS lip-sync.</p>
                                <div className="wh-voice-phases">
                                    {['Opening','Brute Force','Optimize','Coding','Wrap-Up','End'].map((phase, i) => (
                                        <div key={phase} className={`wh-phase-chip ${i === 3 ? 'active' : ''}`}>{phase}</div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* --- Live Code Analysis Card --- */}
                            <motion.div
                                className="wh-cap-card wh-cap-code"
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <div className="wh-cap-badge teal"><Activity size={14}/> Live Analysis</div>
                                <h3>AI Feedback Inside Your Editor</h3>
                                <p>3 seconds after you stop typing, the AI analyzes complexity, edge cases, and structure. It injects inline hints, highlights bug lines, and drops socratic banners — all without breaking flow.</p>
                                <div className="wh-code-feedback-demo">
                                    <div className="wh-code-line highlight-warn">
                                        <span className="ln">12</span>
                                        <span className="code">  <span className="kw">for</span> i <span className="kw">in</span> range(n):</span>
                                        <span className="wh-inline-hint">⚠ O(n²) detected</span>
                                    </div>
                                    <div className="wh-code-line">
                                        <span className="ln">13</span>
                                        <span className="code">    res.append(arr[i])</span>
                                    </div>
                                    <div className="wh-code-banner">
                                        <Bot size={12}/> Can you reduce this to O(n) using a HashMap?
                                    </div>
                                </div>
                            </motion.div>

                            {/* --- Scorecard Card (full width) --- */}
                            <motion.div
                                className="wh-cap-card wh-cap-scorecard"
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.25 }}
                            >
                                <div className="wh-cap-badge amber"><Award size={14}/> Evaluation</div>
                                <h3>Comprehensive Hire / No-Hire Report</h3>
                                <p>Every session ends with a detailed scorecard: a hire recommendation, score out of 100, 6-dimension skill breakdown, strengths, red flags, full voice transcript, and final complexity analysis.</p>
                                <div className="wh-scorecard-demo">
                                    <div className="wh-sc-verdict strong-hire">
                                        <Trophy size={18}/> STRONG HIRE
                                    </div>
                                    <div className="wh-sc-axes">
                                        {[
                                            { label: 'Problem Decomposition', val: 88 },
                                            { label: 'Communication', val: 92 },
                                            { label: 'Code Quality', val: 79 },
                                            { label: 'Edge Cases', val: 85 },
                                            { label: 'Optimization', val: 74 },
                                            { label: 'Algo Thinking', val: 91 },
                                        ].map(ax => (
                                            <div key={ax.label} className="wh-sc-axis">
                                                <span>{ax.label}</span>
                                                <div className="wh-sc-bar-track">
                                                    <div className="wh-sc-bar-fill" style={{ width: `${ax.val}%` }}/>
                                                </div>
                                                <span className="wh-sc-val">{ax.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </section>

                {/* ── The Ecosystem ────────────────────────────────────── */}
                <section id="ecosystem" className="wh-section wh-section-dark wh-eco-section">
                    <div className="wh-aura-bg" aria-hidden="true">
                        <div className="aura-orb aura-eco-blue" />
                        <div className="aura-orb aura-eco-teal" />
                        <div className="aura-line aura-eco-line" />
                    </div>

                    <div className="wh-container">
                        <SectionHeader 
                            tag="The Ecosystem" 
                            title="One Platform. Every Tool You Need." 
                            desc="From resume to offer letter — Whizan AI is your complete engineering career operating system."
                        />
                        
                        {/* ── Row 1: Resume + Portfolio + Job Apply ── */}
                        <div className="wh-eco-grid wh-eco-row-1">

                            {/* Resume Optimizer — large */}
                            <motion.div 
                                className="wh-cap-card wh-eco-resume"
                                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.5 }}
                            >
                                <div className="wh-cap-badge purple"><FileCheck size={13}/> ATS Intelligence</div>
                                <h3>AI Resume Optimizer</h3>
                                <p>Upload your resume, paste a job description. Our multi-agent AI scores it against real ATS parsers, rewrites bullet points iteratively up to 5× until you hit 95%+ — with 9 one-click PDF templates.</p>
                                <div className="wh-eco-ats-bar">
                                    <div className="wh-ats-before">
                                        <span>Before</span>
                                        <div className="wh-ats-track"><div className="wh-ats-fill" style={{width:'38%', background:'#f87171'}}/></div>
                                        <span className="wh-ats-pct bad">38%</span>
                                    </div>
                                    <div className="wh-ats-after">
                                        <span>After AI</span>
                                        <div className="wh-ats-track"><div className="wh-ats-fill" style={{width:'97%', background:'#34d399'}}/></div>
                                        <span className="wh-ats-pct good">97%</span>
                                    </div>
                                </div>
                                <button className="wh-btn-outline small" onClick={() => handleCtaClick('/resume-optimizer-preview')}>
                                    Optimize Resume <ArrowRight size={14}/>
                                </button>
                            </motion.div>

                            {/* Portfolio — medium */}
                            <motion.div 
                                className="wh-cap-card wh-eco-portfolio"
                                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <div className="wh-cap-badge teal"><LayoutTemplate size={13}/> Auto-Generated</div>
                                <h3>Developer Portfolio</h3>
                                <p>Your public profile is auto-built from your Whizan activity — pinned projects, solved problems, interview badges, and scores. Share a single link to recruiters.</p>
                                <div className="wh-eco-list">
                                    <div className="wh-eco-item"><div className="wh-item-icon teal"><Globe size={12}/></div><span>Public shareable profile link</span></div>
                                    <div className="wh-eco-item"><div className="wh-item-icon teal"><Trophy size={12}/></div><span>Interview badges & achievement wall</span></div>
                                    <div className="wh-eco-item"><div className="wh-item-icon teal"><Activity size={12}/></div><span>Live activity heatmap</span></div>
                                </div>
                                <button className="wh-btn-outline small" onClick={() => handleCtaClick('/portfolio')}>
                                    View Portfolio <ArrowRight size={14}/>
                                </button>
                            </motion.div>

                            {/* Job Auto-Apply — medium */}
                            <motion.div 
                                className="wh-cap-card wh-eco-jobs"
                                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <div className="wh-cap-badge amber"><Rocket size={13}/> Autonomous</div>
                                <h3>Job Auto-Apply</h3>
                                <p>Set desired role, location, and salary range. Whizan scrapes live listings and autonomously submits applications — tailoring your resume to each JD automatically.</p>
                                <div className="wh-eco-job-stat">
                                    <div className="wh-job-pulse"><span className="wh-job-dot"/><span>Applying to jobs live…</span></div>
                                    <div className="wh-job-count"><span className="wh-job-num">247</span><span>applications sent today</span></div>
                                </div>
                                <button className="wh-btn-outline small" onClick={() => handleCtaClick('/jobapplier')}>
                                    Start Applying <ArrowRight size={14}/>
                                </button>
                            </motion.div>
                        </div>

                        {/* ── Row 2: DSA Sheets + Books + Library ── */}
                        <div className="wh-eco-grid wh-eco-row-2">

                            {/* DSA Sheets — medium */}
                            <motion.div 
                                className="wh-cap-card wh-eco-sheets"
                                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.05 }}
                            >
                                <div className="wh-cap-badge blue"><ListChecks size={13}/> Curated Paths</div>
                                <h3>DSA Practice Sheets</h3>
                                <p>Company-wise and topic-wise curated problem sheets. Track progress across Blind 75, NeetCode 150, company sheets for Google, Amazon, Meta, and more.</p>
                                <div className="wh-eco-sheet-tags">
                                    {['Blind 75','NeetCode 150','Striver','Google','Meta','Amazon'].map(t => (
                                        <span key={t} className="wh-sheet-tag">{t}</span>
                                    ))}
                                </div>
                                <button className="wh-btn-outline small" onClick={() => handleCtaClick('/sheets')}>
                                    Browse Sheets <ArrowRight size={14}/>
                                </button>
                            </motion.div>

                            {/* Premium Books — large */}
                            <motion.div 
                                className="wh-cap-card wh-eco-books"
                                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
                            >
                                <div className="wh-cap-badge pink"><Library size={13}/> Premium</div>
                                <h3>Engineering Books</h3>
                                <p>Deep, chapter-by-chapter breakdowns of the books every senior engineer reads. Interactive, code-annotated, and paired with hands-on exercises.</p>
                                <div className="wh-eco-books-shelf">
                                    {[
                                        { title: 'System Design Interview', color: '#a855f7' },
                                        { title: 'MySQL Mastery', color: '#3b82f6' },
                                        { title: 'Docker & K8s', color: '#14b8a6' },
                                        { title: 'Machine Learning', color: '#f59e0b' },
                                    ].map(b => (
                                        <div key={b.title} className="wh-book-spine" style={{'--book-color': b.color}}>
                                            <span>{b.title}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="wh-btn-outline small" onClick={() => handleCtaClick('/books')}>
                                    Read Books <ArrowRight size={14}/>
                                </button>
                            </motion.div>

                            {/* Problem Library — medium */}
                            <motion.div 
                                className="wh-cap-card wh-eco-library"
                                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 }}
                            >
                                <div className="wh-cap-badge purple"><Code2 size={13}/> Topic Explorer</div>
                                <h3>Problem Library</h3>
                                <p>1200+ problems with multi-tag filtering. Solve directly in the browser with 7-language code execution and real-time test cases.</p>
                                <div className="wh-eco-stats">
                                    <div className="wh-stat-box"><span className="wh-stat-val">1.2k+</span><span className="wh-stat-label">Problems</span></div>
                                    <div className="wh-stat-box"><span className="wh-stat-val">7</span><span className="wh-stat-label">Languages</span></div>
                                    <div className="wh-stat-box"><span className="wh-stat-val">50+</span><span className="wh-stat-label">Topics</span></div>
                                </div>
                                <button className="wh-btn-outline small" onClick={() => handleCtaClick('/dsaquestion/1')}>
                                    Solve Problems <ArrowRight size={14}/>
                                </button>
                            </motion.div>
                        </div>

                        {/* ── Row 3: Sandboxes full-width + Jarvis ── */}
                        <div className="wh-eco-grid wh-eco-row-3">

                            {/* Sandboxes */}
                            <motion.div 
                                className="wh-cap-card wh-eco-sandboxes"
                                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.5 }}
                            >
                                <div className="wh-cap-badge teal"><Cpu size={13}/> Cloud Env</div>
                                <h3>Hands-On Sandboxes</h3>
                                <p>Spin up isolated cloud environments instantly for full-stack practice, Git mastery, or ML experimentation — all inside the browser.</p>
                                <div className="wh-eco-list">
                                    <div className="wh-eco-item"><div className="wh-item-icon teal"><Zap size={12}/></div><span>React / Next.js Sandbox</span></div>
                                    <div className="wh-eco-item"><div className="wh-item-icon teal"><GitBranch size={12}/></div><span>Git & Terminal Playground</span></div>
                                    <div className="wh-eco-item"><div className="wh-item-icon teal"><Brain size={12}/></div><span>ML Notebook Environment</span></div>
                                </div>
                            </motion.div>

                            {/* Courses */}
                            <motion.div 
                                className="wh-cap-card wh-eco-courses"
                                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <div className="wh-cap-badge blue"><BookOpen size={13}/> Skill Paths</div>
                                <h3>Interactive Courses</h3>
                                <p>Video lectures paired with live code editors. Pause, write code, run it, continue — real learning, not passive watching.</p>
                                <button className="wh-eco-course-peek" onClick={() => handleCtaClick('/courses')}>
                                    <Play size={14} /> Browse Courses
                                </button>
                            </motion.div>

                            {/* Jarvis */}
                            <motion.div 
                                className="wh-cap-card wh-eco-jarvis"
                                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <div className="wh-cap-badge amber"><MessageSquare size={13}/> AI Co-Pilot</div>
                                <h3>Jarvis Assistant</h3>
                                <p>Context-aware AI on every page. Explains patterns, recommends problems, scores your weak areas.</p>
                                <div className="wh-jarvis-chat-demo">
                                    <div className="wh-chat-msg user">How do I improve my Graph BFS?</div>
                                    <div className="wh-chat-msg ai">Try 'Rotting Oranges' next — it's your key gap based on your last 3 interviews. 🎯</div>
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </section>


                {/* ── Pricing ─────────────────────────────────────────────── */}
                <section id="pricing" className="wh-section wh-section-dark">
                    <div className="wh-container">
                        <SectionHeader 
                            tag="Pricing" 
                            title="Affordable Plans for Every Stage" 
                            desc="Choose the tier that accelerates your success. Jumpstart for free, upgrade when you need uncompromising power."
                        />

                        <div className="wh-pricing-grid">
                            <motion.div 
                                className="wh-price-card spark"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="wh-pc-header">
                                    <h3>Spark Plan</h3>
                                    <div className="wh-pc-price">Free<span>/forever</span></div>
                                    <p>Perfect for exploring and occasional practice.</p>
                                </div>
                                <div className="wh-pc-body">
                                    <ul className="wh-pc-features">
                                        <li><CheckCircle size={16}/> Essential AI Mock Interviews</li>
                                        <li><CheckCircle size={16}/> 1000+ Problem Library</li>
                                        <li><CheckCircle size={16}/> 7-Language Code Execution</li>
                                        <li><CheckCircle size={16}/> Basic Performance Reports</li>
                                        <li><CheckCircle size={16}/> Standard Chat Coach</li>
                                    </ul>
                                </div>
                                <div className="wh-pc-footer">
                                    <button className="wh-btn-outline full-width" onClick={() => handleCtaClick(buildLoginUrl({ ref: 'pricing_free' }))}>
                                        Start for Free
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div 
                                className="wh-price-card blaze"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.15 }}
                            >
                                <div className="wh-pc-badge">Most Popular</div>
                                <div className="wh-pc-glow"/>
                                <div className="wh-pc-header">
                                    <h3>Blaze Plan</h3>
                                    <div className="wh-pc-price">₹299<span>/month</span></div>
                                    <p>For serious engineers ready to land FAANG.</p>
                                </div>
                                <div className="wh-pc-body">
                                    <ul className="wh-pc-features">
                                        <li><CheckCircle size={16}/> <strong>Everything in Spark, PLUS:</strong></li>
                                        <li><CheckCircle size={16}/> Unlimited System Design Training</li>
                                        <li><CheckCircle size={16}/> Autonomous Job Applier Tool</li>
                                        <li><CheckCircle size={16}/> AI Resume Parser & Portfolio Builder</li>
                                        <li><CheckCircle size={16}/> Premium Courses & Certifications</li>
                                        <li><CheckCircle size={16}/> Advanced Analytics & Priority Support</li>
                                    </ul>
                                </div>
                                <div className="wh-pc-footer">
                                    <button className="wh-btn-glow full-width" onClick={() => handleCtaClick(buildLoginUrl({ ref: 'pricing_premium' }))}>
                                        Upgrade to Blaze
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ── Final CTA ────────────────────────────────────────────── */}
                <section className="wh-final-cta">
                    <div className="wh-final-glow"/>
                    <div className="wh-container">
                        <motion.div 
                            className="wh-cta-box"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <h2>Ready to Elevate Your Engineering Capabilities?</h2>
                            <p>Join thousands of software engineers already using Whizan AI to write better code, ace system design rounds, and secure premium tech roles.</p>
                            <div className="wh-cta-actions">
                                <button className="wh-btn-glow large" onClick={() => handleCtaClick(buildLoginUrl({ ref: 'bottom_cta' }))}>
                                    Create Free Account
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <footer className="wh-footer">
                <div className="wh-container">
                    <div className="wh-footer-grid">
                        <div className="wh-footer-brand">
                            <div className="wh-brand">
                                <img src="/logo.jpeg" alt="Whizan AI" width="32" height="32" className="wh-logo" />
                                <span className="wh-brand-text">Whizan AI</span>
                            </div>
                            <p className="wh-footer-desc">
                                The ultimate AI ecosystem for software engineers. Practice coding, ace interviews, and accelerate your career.
                            </p>
                        </div>
                        <div className="wh-footer-links-group">
                            <h4>Platform</h4>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleCtaClick('/aiinterview'); }}>Mock Interviews</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleCtaClick('/dsaquestion/1'); }}>Coding Library</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleCtaClick('/systemdesign'); }}>System Design</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleCtaClick('/jobapplier'); }}>Job Applier</a>
                        </div>
                        <div className="wh-footer-links-group">
                            <h4>Resources</h4>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleCtaClick('/courses'); }}>Interactive Courses</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleCtaClick('/blog'); }}>Tech Blog</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleCtaClick('/portfolio'); }}>Portfolio Builder</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleCtaClick('/faq'); }}>FAQ Center</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleCtaClick('/terms'); }}>Terms & Conditions</a>
                        </div>
                    </div>
                    <div className="wh-footer-bottom">
                        <p>© {new Date().getFullYear()} Whizan AI. Built for engineers, by engineers.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
