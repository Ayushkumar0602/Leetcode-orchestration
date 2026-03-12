import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { buildLoginUrl } from './utils/analytics';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
    Brain, Code2, Server, Zap, Shield, MessageSquare, Terminal,
    ChevronRight, ArrowRight, Play, Mic, Star, Clock, TrendingUp,
    CheckCircle, Circle, Sparkles, Users, Container, GitBranch,
    Bot, Cpu, Database, Globe, Lock, BarChart3, Layers, Award
} from 'lucide-react';
import './LandingPage.css';

// ── Constants ──────────────────────────────────────────────────────────────────


const FEATURES = [
    {
        icon: Brain,
        color: '#a855f7',
        bg: 'rgba(168,85,247,0.1)',
        border: 'rgba(168,85,247,0.3)',
        title: 'AI Interviewer',
        subtitle: 'Sarvam-powered voice',
        desc: 'A real-time conversational AI interviewer that speaks to you, adapts to your answers, and guides problem-solving through 5 structured phases.',
        bullets: ['Natural voice conversations', 'Adaptive follow-up questions', 'Multi-phase interview control'],
    },
    {
        icon: Code2,
        color: '#00b8a3',
        bg: 'rgba(0,184,163,0.1)',
        border: 'rgba(0,184,163,0.3)',
        title: 'Live Coding',
        subtitle: 'Monaco Editor',
        desc: 'Full-featured Monaco code editor with syntax highlighting for 7 languages, boilerplate generation, and real-time execution feedback.',
        bullets: ['Python, C++, Java, Go, Rust...', 'AI-generated boilerplate', 'Live test case execution'],
    },
    {
        icon: Zap,
        color: '#ffa116',
        bg: 'rgba(255,161,22,0.1)',
        border: 'rgba(255,161,22,0.3)',
        title: 'Real-time AI Actions',
        subtitle: 'Firebase RTDB',
        desc: 'The AI can move a cursor on your code, highlight problematic lines, drop inline comments, and trigger contextual banners — all in real time.',
        bullets: ['AI cursor movement', 'Line highlighting & annotations', 'Inline code comments'],
    },
    {
        icon: Server,
        color: '#3b82f6',
        bg: 'rgba(59,130,246,0.1)',
        border: 'rgba(59,130,246,0.3)',
        title: 'Containerized Execution',
        subtitle: 'Docker sandboxes',
        desc: 'Every code submission runs in an isolated Docker container, supporting full test-case validation with streaming progress feedback.',
        bullets: ['Isolated Docker sandbox', 'Streaming SSE results', 'Edge case auto-generation'],
    },
    {
        icon: Layers,
        color: '#f43f5e',
        bg: 'rgba(244,63,94,0.1)',
        border: 'rgba(244,63,94,0.3)',
        title: 'System Design',
        subtitle: 'HLD & LLD',
        desc: 'Dedicated system design interview modes. Discuss scalable architectures, trade-offs, and capacity estimation with an AI Staff Engineer.',
        bullets: ['HLD architecture discussions', 'LLD class & sequence design', 'Whiteboard-style canvas'],
    },
    {
        icon: BarChart3,
        color: '#10b981',
        bg: 'rgba(16,185,129,0.1)',
        border: 'rgba(16,185,129,0.3)',
        title: 'Score Reports',
        subtitle: '6-dimension analysis',
        desc: 'At the end of every interview, get a detailed hire/no-hire report with skill scores, strengths, red flags, and areas to improve.',
        bullets: ['6-skill evaluation matrix', 'Hire / No-Hire verdict', 'Full transcript replay'],
    },
];

const SAMPLE_PROBLEMS = [
    { id: 1, title: 'Two Sum', diff: 'Easy', topics: ['Array', 'Hash Map'], acceptance: '49.1%' },
    { id: 2, title: 'Median of Two Sorted Arrays', diff: 'Hard', topics: ['Binary Search'], acceptance: '37.2%' },
    { id: 3, title: 'LRU Cache', diff: 'Medium', topics: ['Linked List', 'Hash Map'], acceptance: '42.5%' },
];



// ── Helpers ────────────────────────────────────────────────────────────────────
const FadeIn = ({ children, delay = 0, y = 30, className = '' }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

const DiffBadge = ({ diff }) => {
    const colors = { Easy: '#00b8a3', Medium: '#ffa116', Hard: '#ef4743' };
    return (
        <span style={{ color: colors[diff], background: colors[diff] + '22', border: `1px solid ${colors[diff]}44`, borderRadius: 6, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
            {diff}
        </span>
    );
};

// ── AI Code Demo ───────────────────────────────────────────────────────────────
function AICodeDemo() {
    const [highlightedLines, setHighlightedLines] = useState([]);
    const [aiComment, setAiComment] = useState(null);
    const [aiCursorLine, setAiCursorLine] = useState(null);
    const [step, setStep] = useState(0);

    const steps = [
        () => { setAiCursorLine(1); setHighlightedLines([]); setAiComment(null); },
        () => { setAiCursorLine(2); setHighlightedLines([2]); setAiComment({ line: 2, text: '✅ HashMap gives O(1) lookup — great choice!' }); },
        () => { setAiCursorLine(3); setHighlightedLines([3, 4]); setAiComment({ line: 3, text: '⚡ Complement check in O(1) — this is O(n) overall!' }); },
        () => { setAiCursorLine(5); setHighlightedLines([5, 6]); setAiComment({ line: 5, text: '✅ Early exit when found — excellent optimization.' }); },
        () => { setHighlightedLines([]); setAiCursorLine(null); setAiComment(null); },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setStep(s => {
                const next = (s + 1) % steps.length;
                steps[next]();
                return next;
            });
        }, 2200);
        steps[0]();
        return () => clearInterval(timer);
    }, []);

    const lines = `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`.split('\n');

    return (
        <div className="ai-code-demo">
            <div className="code-demo-header">
                <div className="dots-row">
                    <span className="mac-dot r"></span>
                    <span className="mac-dot y"></span>
                    <span className="mac-dot g"></span>
                </div>
                <span className="code-demo-filename">solution.py</span>
                <span className="code-demo-lang">Python 3</span>
            </div>
            <div className="code-demo-body">
                {lines.map((line, i) => {
                    const lineNum = i + 1;
                    const isHighlighted = highlightedLines.includes(lineNum);
                    const isCursor = aiCursorLine === lineNum;
                    return (
                        <div key={i} className={`code-line ${isHighlighted ? 'highlighted' : ''}`}>
                            <span className="line-num">{lineNum}</span>
                            <span className="line-content">{line || ' '}</span>
                            {isCursor && (
                                <motion.div
                                    className="ai-cursor-badge"
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Bot size={10} /> AI
                                </motion.div>
                            )}
                        </div>
                    );
                })}
                <AnimatePresence>
                    {aiComment && (
                        <motion.div
                            className="ai-comment-chip"
                            key={aiComment.text}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.35 }}
                        >
                            {aiComment.text}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [showHeroEditor, setShowHeroEditor] = useState(false);
    const [activeProblem, setActiveProblem] = useState(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const goToInterview = () => navigate('/aiinterview');
    const goToProblems = () => navigate('/dsaquestion/1');

    return (
        <div className="lp-root">
            {/* Grid lines BG */}
            <div className="lp-grid-bg" aria-hidden />

            {/* ── NAV ─────────────────────────────────────────────────────────── */}
            <nav className={`lp-nav ${scrolled ? 'lp-nav-scrolled' : ''}`}>
                <div className="lp-nav-inner">
                    <div className="lp-brand" onClick={() => navigate('/')}>
                        <img src="/logo.jpeg" alt="CodeArena" className="lp-logo" />
                        <span className="lp-brand-name">CodeArena AI</span>
                    </div>
                    <div className="lp-nav-links">
                        <a href="#features">Features</a>
                        <a href="#demo">Live Demo</a>
                        <a href="#architecture">How it works</a>
                        <a href="#problems">Practice</a>
                    </div>
                    <div className="lp-nav-actions">
                        {currentUser ? (
                            <button className="lp-btn-outline" onClick={() => navigate('/dashboard')}>Dashboard →</button>
                        ) : (
                            <>
                                <button className="lp-btn-ghost" onClick={() => navigate(buildLoginUrl({ ref: 'navbar' }))}>Sign in</button>
                                <button className="lp-btn-primary" onClick={() => navigate(buildLoginUrl({ ref: 'navbar_cta' }))}>Get started</button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ── HERO ────────────────────────────────────────────────────────── */}
            <section className="lp-hero">
                <div className="lp-hero-glow glow-purple" />
                <div className="lp-hero-glow glow-blue" />

                <div className="lp-hero-content">
                    <motion.div
                        className="lp-hero-badge"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Sparkles size={13} className="badge-sparkle" />
                        AI-powered interview simulator
                    </motion.div>

                    <motion.h1
                        className="lp-hero-headline"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                    >
                        Ace your engineering<br />
                        interview with an{' '}
                        <span className="lp-gradient-text">AI interviewer</span>
                    </motion.h1>

                    <motion.p
                        className="lp-hero-sub"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        Real-time voice conversations, live code review, AI cursor annotations,
                        and a full six-skill performance report — all in one platform.
                    </motion.p>

                    <motion.div
                        className="lp-hero-cta"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                    >
                        <button className="lp-btn-glow" onClick={goToInterview}>
                            <Brain size={18} /> Start Mock Interview
                        </button>
                        <button className="lp-btn-outline" onClick={goToProblems}>
                            <Code2 size={18} /> Practice Problems
                        </button>
                    </motion.div>

                    <motion.div
                        className="lp-hero-stats"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        {[['7', 'Languages'], ['5', 'Interview Phases'], ['1,000+', 'DSA Problems'], ['6', 'Skill Dimensions']].map(([num, label]) => (
                            <div className="lp-stat" key={label}>
                                <span className="lp-stat-num">{num}</span>
                                <span className="lp-stat-label">{label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Hero interactive demo */}
                <motion.div
                    className="lp-hero-demo"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="hero-video-wrapper">
                        <video
                            src="/indexpage_video 1 .mov"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="hero-demo-video"
                        />
                    </div>
                </motion.div>
            </section>

            {/* ── LIVE CODE DEMO ───────────────────────────────────────────────── */}
            <section className="lp-section" id="demo">
                <div className="lp-demo-split">
                    <FadeIn className="lp-demo-left">
                        <div className="lp-section-label">Live Demo</div>
                        <h2 className="lp-section-title lp-section-title-left">Watch the AI review your code in real&nbsp;time</h2>
                        <p className="lp-section-sub lp-section-sub-left">
                            As you type, the AI interviewer moves its cursor through your code,
                            highlights specific lines, and drops contextual annotations —
                            all streamed instantly via Firebase Realtime Database.
                        </p>
                        <div className="lp-demo-feature-list">
                            {[
                                { icon: Bot, color: '#a855f7', text: 'AI cursor moves across your code' },
                                { icon: Zap, color: '#ffa116', text: 'Line highlighting with severity colors' },
                                { icon: MessageSquare, color: '#00b8a3', text: 'Inline comment chips on specific lines' },
                                { icon: Terminal, color: '#3b82f6', text: 'Contextual banners with hints' },
                            ].map(({ icon: Icon, color, text }) => (
                                <div className="lp-demo-feature-item" key={text}>
                                    <div className="lp-demo-feature-icon" style={{ background: color + '20', border: `1px solid ${color}44` }}>
                                        <Icon size={14} color={color} />
                                    </div>
                                    {text}
                                </div>
                            ))}
                        </div>
                        <button className="lp-btn-glow" style={{ marginTop: '1.5rem' }} onClick={goToInterview}>
                            Try it yourself <ArrowRight size={16} />
                        </button>
                    </FadeIn>

                    <FadeIn delay={0.15} className="lp-demo-right">
                        <AICodeDemo />
                    </FadeIn>
                </div>
            </section>

            {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
            <section className="lp-section lp-section-dark" id="features">
                <FadeIn>
                    <div className="lp-section-label">Platform Capabilities</div>
                    <h2 className="lp-section-title">Everything you need to land the offer</h2>
                    <p className="lp-section-sub">From live voice interviews to system design — one platform, end-to-end preparation.</p>
                </FadeIn>

                <div className="lp-features-grid">
                    {FEATURES.map((feat, i) => {
                        const Icon = feat.icon;
                        return (
                            <FadeIn key={feat.title} delay={0.07 * i}>
                                <motion.div
                                    className="lp-feature-card"
                                    style={{ '--card-color': feat.color, '--card-bg': feat.bg, '--card-border': feat.border }}
                                    whileHover={{ y: -6, boxShadow: `0 20px 40px ${feat.color}18` }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="lp-feature-icon-wrap">
                                        <Icon size={22} color={feat.color} />
                                    </div>
                                    <div className="lp-feature-tag">{feat.subtitle}</div>
                                    <h3 className="lp-feature-title">{feat.title}</h3>
                                    <p className="lp-feature-desc">{feat.desc}</p>
                                    <ul className="lp-feature-bullets">
                                        {feat.bullets.map(b => (
                                            <li key={b}><CheckCircle size={12} color={feat.color} />{b}</li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </FadeIn>
                        );
                    })}
                </div>
            </section>

            {/* ── PRACTICE PROBLEMS ────────────────────────────────────────────── */}
            <section className="lp-section lp-section-dark" id="problems">
                <FadeIn>
                    <div className="lp-section-label">Practice Mode</div>
                    <h2 className="lp-section-title">1,000+ LeetCode-style problems</h2>
                    <p className="lp-section-sub">Solve real problems with a full coding environment, AI hints, and automated test cases.</p>
                </FadeIn>

                <FadeIn delay={0.15}>
                    <div className="lp-problems-list">
                        {SAMPLE_PROBLEMS.map((prob) => (
                            <motion.div
                                key={prob.id}
                                className="lp-problem-row"
                                whileHover={{ x: 6 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => navigate(`/solvingpage/${prob.id}`)}
                            >
                                <div className="lp-problem-num">#{prob.id}</div>
                                <div className="lp-problem-title">{prob.title}</div>
                                <div className="lp-problem-topics">
                                    {prob.topics.map(t => <span key={t} className="lp-topic-chip">{t}</span>)}
                                </div>
                                <DiffBadge diff={prob.diff} />
                                <div className="lp-problem-accept">{prob.acceptance}</div>
                                <ChevronRight size={16} color="var(--lp-txt3)" />
                            </motion.div>
                        ))}
                        <button className="lp-view-all-btn" onClick={goToProblems}>
                            View all problems <ArrowRight size={15} />
                        </button>
                    </div>
                </FadeIn>
            </section>

            {/* ── SYSTEM DESIGN CTA ─────────────────────────────────────────────── */}
            <section className="lp-section">
                <FadeIn>
                    <div className="lp-sysdesign-card">
                        <div className="lp-sysdesign-icon-bg">
                            <Server size={40} color="#3b82f6" />
                        </div>
                        <h2 className="lp-sysdesign-title">System Design Interviews</h2>
                        <p className="lp-sysdesign-sub">
                            Practice HLD and LLD interviews with an AI Staff Engineer. Discuss real architectures,
                            trade-offs, and scalability decisions the same way top companies evaluate senior candidates.
                        </p>
                        <div className="lp-sysdesign-pills">
                            {['High-Level Design', 'Low-Level Design', 'Capacity Estimation', 'Trade-off Analysis'].map(t => (
                                <span key={t} className="lp-sysdesign-pill">{t}</span>
                            ))}
                        </div>
                        <button className="lp-btn-outline" onClick={() => navigate('/systemdesign')}>
                            Explore System Design <ArrowRight size={16} />
                        </button>
                    </div>
                </FadeIn>
            </section>

            {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
            <section className="lp-cta-section">
                <div className="lp-cta-glow" />
                <FadeIn>
                    <div className="lp-section-label" style={{ justifyContent: 'center', display: 'flex' }}>Start today — it's free</div>
                    <h2 className="lp-cta-title">Ready to ace your interview?</h2>
                    <p className="lp-cta-sub">
                        Join engineers preparing for FAANG and top-tier companies with AI-powered mock interviews that feel remarkably real.
                    </p>
                    <div className="lp-cta-btns">
                        <button className="lp-btn-glow lp-btn-large" onClick={goToInterview}>
                            <Brain size={20} /> Start AI Interview
                        </button>
                        <button className="lp-btn-outline lp-btn-large" onClick={goToProblems}>
                            <Code2 size={20} /> Explore Problems
                        </button>
                    </div>
                </FadeIn>
                {/* Floating code blobs */}
                <div className="lp-code-floats" aria-hidden>
                    {['O(log n)', 'HashMap{}', 'DP[i][j]', 'BFS/DFS', 'O(n²)→O(n)', 'setDoc()', 'useEffect()', 'merge:true'].map((t, i) => (
                        <motion.span
                            key={t}
                            className="lp-code-float"
                            style={{ '--i': i }}
                            animate={{ y: [0, -18, 0], opacity: [0.18, 0.35, 0.18] }}
                            transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.7 }}
                        >
                            {t}
                        </motion.span>
                    ))}
                </div>
            </section>

            {/* ── FOOTER ────────────────────────────────────────────────────────── */}
            <footer className="lp-footer">
                <div className="lp-footer-inner">
                    <div className="lp-footer-brand">
                        <img src="/logo.jpeg" alt="CodeArena" className="lp-logo" />
                        <span className="lp-brand-name">CodeArena AI</span>
                    </div>
                    <div className="lp-footer-links">
                        <button onClick={() => navigate('/dsaquestion/1')}>Problems</button>
                        <button onClick={() => navigate('/aiinterview')}>AI Interview</button>
                        <button onClick={() => navigate('/systemdesign')}>System Design</button>
                        <button onClick={() => navigate(buildLoginUrl({ ref: 'footer' }))}>Sign In</button>
                    </div>
                    <div className="lp-footer-copy">© {new Date().getFullYear()} CodeArena AI · Built for engineers, by engineers.</div>
                </div>
            </footer>
        </div>
    );
}
