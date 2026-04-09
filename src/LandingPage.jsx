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
    BarChart3, Globe, Users, Trophy
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
                <link rel="canonical" href="https://whizan.xyz/" />
                <script type="application/ld+json">{JSON.stringify(SEO_SCHEMA)}</script>
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
                {/* ── Hero Section ────────────────────────────────────── */}
                <section className="wh-hero">
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
                <section id="features" className="wh-section wh-section-dark">
                    <div className="wh-container">
                        <SectionHeader 
                            tag="Core Capabilities" 
                            title="Everything You Need to Ace Technical Rounds" 
                            desc="Whizan AI replaces 5 different tools. Get everything from coding sandboxes to system design drawing boards in one unified, intelligent platform."
                        />
                        
                        <div className="wh-features-grid">
                            <FeatureCard 
                                icon={Mic} 
                                tag="Real-Time Voice" 
                                tagColor="#a855f7" 
                                title="Conversational AI Mock Interviews" 
                                desc="Practice with 6 different voice personalities. The AI uses the Socratic method to provide live hints and perfectly mimics FAANG interview conditions without giving away the answers." 
                                delay={0.1}
                            />
                            <FeatureCard 
                                icon={Terminal} 
                                tag="Containerized" 
                                tagColor="#3b82f6" 
                                title="7-Language Code Execution" 
                                desc="Write code directly in the browser using the Monaco editor. Execute instantly against 15+ automated test cases in an isolated Docker sandbox with real-time SSE streaming." 
                                delay={0.2}
                            />
                            <FeatureCard 
                                icon={Layers} 
                                tag="Architecture" 
                                tagColor="#f43f5e" 
                                title="System Design Interviewing" 
                                desc="Interactive whiteboard to architect scalable systems (HLD) and clean code patterns (LLD). Get evaluated on your technical decisions, caching strategies, and load balancing insights." 
                                delay={0.3}
                            />
                            <FeatureCard 
                                icon={Briefcase} 
                                tag="Automation" 
                                tagColor="#10b981" 
                                title="Autonomous Job Application" 
                                desc="Let our AI agent apply to jobs across LinkedIn, Indeed, and company portals on your behalf. Smartly scrapes roles matching your profile and auto-fills complex applications." 
                                delay={0.4}
                            />
                            <FeatureCard 
                                icon={FileText} 
                                tag="Intelligence" 
                                tagColor="#f59e0b" 
                                title="Resume Parsing & Portfolio" 
                                desc="Upload your PDF resume. Gemini Vision automatically parses your skills, fetches your GitHub activity, and builds a stunning, customizable public portfolio website instantly." 
                                delay={0.5}
                            />
                            <FeatureCard 
                                icon={BarChart3} 
                                tag="Analytics" 
                                tagColor="#0ea5e9" 
                                title="Detailed Performance Reports" 
                                desc="Receive a comprehensive 6-dimension skill breakdown after every session. See a definitive 'Hire/No-Hire' recommendation, pinpoint strengths, and identify red flags immediately." 
                                delay={0.6}
                            />
                        </div>
                    </div>
                </section>

                {/* ── The Ecosystem (Learning & Community) ──────────────── */}
                <section id="ecosystem" className="wh-section">
                    <div className="wh-container">
                        <SectionHeader 
                            tag="The Ecosystem" 
                            title="Beyond Just Interviews" 
                            desc="Whizan AI isn't just for practice. It is a complete educational ecosystem designed to accelerate your engineering career."
                        />
                        
                        <div className="wh-bento-grid">
                            <motion.div className="wh-bento-box bento-large bento-library"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="wh-bento-content">
                                    <div className="wh-bento-icon"><Code2 size={24}/></div>
                                    <h3>1000+ Problem Library</h3>
                                    <p>A massive, curated database of coding problems grouped by difficulty, company, and topic. Filter by acceptance rate and track your submission history securely in the cloud.</p>
                                    <button className="wh-bento-link" onClick={() => handleCtaClick('/dsaquestion/1')}>Browse Library <ArrowRight size={14}/></button>
                                </div>
                                <div className="wh-bento-visual bg-mesh-purple"/>
                            </motion.div>

                            <motion.div className="wh-bento-box bento-medium bento-sandboxes"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="wh-bento-content">
                                    <div className="wh-bento-icon"><Server size={24}/></div>
                                    <h3>Hands-On Sandboxes</h3>
                                    <p>Practice in real environments. Spin up a full React/Next.js Web Dev Sandbox or jump into the Git Playground to master branching, rebasing, and resolving complex merge conflicts.</p>
                                    <ul className="wh-bento-list">
                                        <li><CheckCircle size={14}/> Live Web Editors</li>
                                        <li><CheckCircle size={14}/> Visual Git Commits</li>
                                    </ul>
                                </div>
                            </motion.div>

                            <motion.div className="wh-bento-box bento-medium bento-courses"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="wh-bento-content">
                                    <div className="wh-bento-icon"><BookOpen size={24}/></div>
                                    <h3>Interactive Courses</h3>
                                    <p>Structured video lectures combined with live code samples. Learn deeply by pausing the video to immediately write and execute code within the same view.</p>
                                    <button className="wh-bento-link" onClick={() => handleCtaClick('/courses')}>View Courses <ArrowRight size={14}/></button>
                                </div>
                            </motion.div>
                            
                            <motion.div className="wh-bento-box bento-wide bento-jarvis"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="wh-bento-split">
                                    <div className="wh-bento-content">
                                        <div className="wh-bento-icon"><MessageSquare size={24}/></div>
                                        <h3>Jarvis: Your AI Co-Pilot</h3>
                                        <p>A context-aware global AI assistant available on every page. Ask Jarvis to explain binary search, recommend a specific course, or summarize your weak areas based on your past mock interview performances.</p>
                                    </div>
                                    <div className="wh-bento-visual jarvis-chat-demo">
                                        <div className="chat-bubble user">Hey Jarvis, how is my Dynamic Programming?</div>
                                        <div className="chat-bubble ai">Based on your recent 4 interviews, your DP score averages 62/100. I recommend practicing "Knapsack" next!</div>
                                    </div>
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
