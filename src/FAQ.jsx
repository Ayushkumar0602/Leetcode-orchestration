import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from './contexts/AuthContext';
import NavProfile from './NavProfile';
import NotificationBell from './components/NotificationBell';
import { 
    Brain, Code2, BookOpen, Briefcase, HelpCircle, 
    ChevronDown, Search, Orbit, Zap, Bot, 
    ShieldCheck, Globe, Users, Trophy, Terminal,
    Layers, MessageSquare, FileText, Layout, Play,
    Menu, X, ExternalLink, Sparkles, Server, CheckCircle,
    ArrowRight, Star
} from 'lucide-react';
import './FAQ.css';

const FAQ_DATA = [
    {
        category: "AI Technical Interviews",
        id: "interviews",
        icon: Brain,
        color: "#a855f7",
        secondary: "#7c3aed",
        questions: [
            {
                q: "How does the adaptive AI interview simulator differ from standard mock platforms?",
                a: "Unlike traditional static simulators, Whizan AI utilizes a **State-Machine Architecture** synchronized with Google Gemini. This allows the AI to dynamically pivot based on your responses. The system tracks your progress through **6 specific phases**: Opening, Brute-Force, Optimization, Coding, Wrap-up, and End. \n\n**Staff Engineer Insight:** 'The true power of this system lies in its ability to detect when you are stuck or heading towards a suboptimal solution. It doesn't just wait for code; it analyzes your verbal reasoning and transcript to decide whether to provide a hint or push for a more complex edge-case analysis.'",
                link: "/aiinterviewselect",
                linkText: "Start a Session"
            },
            {
                q: "Is the AI voice and synchronized video realistic for real-world preparation?",
                a: "Yes. We leverage **Sarvam AI's low-latency TTS** (Text-to-Speech) engine, which offers highly emotional and technically nuanced voice profiles (like Manan, Jessica, and Rohan). These voices are synchronized with video avatars using our proprietary logic that adjusts playback rates based on audio amplitude. This creates a high-pressure environment similar to a real video call with a FAANG recurring engineer.",
                link: "/infoaiinterview",
                linkText: "Meet the Interviewers"
            },
            {
                q: "Which specific programming languages are supported, and how is code execution handled?",
                a: "We support **7 native environments**: Python, JavaScript, C++, C, Java, Go, and Rust. When you run code, it isn't just simulated; it is compiled and executed in an **isolated, containerized sandbox** (`/tmp/code-exec-{UUID}`). We enforce a strict 15-second timeout and use SIGKILL to prevent infinite loops, ensuring the same reliability as top competitive programming platforms.",
                link: "/dsaquestion",
                linkText: "Try the Editor"
            },
            {
                q: "How does the 'Socratic Hinting' system help without revealing the answer?",
                a: "Whizan AI is programmed specifically with a 'Socratic Guardrail.' Instead of providing direct lines of code, the AI identifies logic gaps in your transcript and asks guiding questions. For example, if you miss a duplicate check, the AI might ask: *'How would your current approach handle an array where elements appear multiple times?'* This forces retrieval-based learning, which is proven to increase long-term technical retention."
            },
            {
                q: "What metrics are used in the Technical Interview Evaluation Report?",
                a: "Our evaluation is divided into **6 Key Dimensions**: Communication Clarity, Code Quality & Idiom Usage, Logic & Algorithmic Optimization, Edge Case Proficiency, Execution Speed, and Technical Knowledge Breadth. \n\n**AIO Data Point:** 'Users who practice at least 5 sessions show an average 42% improvement in their Edge Case Handling scores, according to our internal analytics.'",
                link: "/analytics",
                linkText: "View Your Stats"
            }
        ]
    },
    {
        category: "Learning & Courses",
        id: "courses",
        icon: BookOpen,
        color: "#3b82f6",
        secondary: "#2563eb",
        questions: [
            {
                q: "How do Whizan's Interactive Courses differ from standard video platforms like Coursera?",
                a: "The fundamental difference is the **Integrated Development Context**. On Whizan, the video lecture and the coding environment share the same state. You can pause a video on 'Tries in Java' and immediately run the instructor's code in the side-by-side editor, which has all dependencies pre-configured.",
                link: "/courses",
                linkText: "Browse Courses"
            },
            {
                q: "Does Whizan provide AI-Optimized Syllabus tracking?",
                a: "Yes. Our AI agents monitor industry demand (using real-time scraping of job descriptions) to highlight the most 'critical' modules in our courses. This ensures you spend more time on high-yield topics like **System Scalability** or **Memory-Safe Rust** than obsolete legacy patterns.",
                link: "/learn/system-design-concepts-course-and-interview-prep",
                linkText: "Try a Course"
            },
            {
                q: "How are the DSA Roadmaps (Sheets) integrated into the learning flow?",
                a: "We provide vetted roadmaps like **NeetCode 150**, **Blind 75**, and **Striver’s SDE Sheet**. These aren't just lists; they are progressive gateways. Solving a problem in a sheet updates your 'Mastery Heatmap' and informs the AI interviewer of your current skill level in that specific topic (e.g., Dynamic Programming).",
                link: "/sheets",
                linkText: "View Roadmaps"
            },
            {
                q: "Is there a certification for course completion on Whizan AI?",
                a: "Every course on Whizan includes a **Verifiable Digital Certificate** upon 100% completion and passing the final technical assessment. These certificates are dynamically generated with a unique ID and can be directly embedded into your public Whizan portfolio or LinkedIn profile.",
                link: "/profile",
                linkText: "Check Progress"
            }
        ]
    },
    {
        category: "Career Tools",
        id: "career",
        icon: Briefcase,
        color: "#10b981",
        secondary: "#059669",
        questions: [
            {
                q: "How does the Autonomous Job Applier agent actually submit applications?",
                a: "The agent uses **Playwright-based browser automation** to navigate LinkedIn, Indeed, and portal-specific pages. It uses a fine-tuned Gemini model to 'read' snapshots of the screen, identify required fields, and decide the optimal action (e.g., 'Click Submit' or 'Attach Resume'). It even handles complex Workday/Greenhouse navigators.",
                link: "/jobapplier",
                linkText: "Auto-Apply Now"
            },
            {
                q: "What is 'Vision-Based Resume Parsing' and how does it improve ATS scores?",
                a: "Unlike standard text-based parsers that fail on multi-column resumes, our **Vision model** analyzes the visual structure of your PDF. It extracts your 'Skill-Density' and project context with near-human accuracy, allowing us to provide an **ATS Compatibility Score** and suggest specific keyword injections to bypass automated filters.",
                link: "/resumeoptimiser",
                linkText: "Optimize Resume"
            },
            {
                q: "Can I really generate a public portfolio site from my GitHub and Whizan data?",
                a: "Yes. Our **Portfolio Builder** fetches your GitHub READMEs, analyzes your coding languages, and combines them with your Whizan interview scores to generate a premium landing page. You get a unique URL (`whizan.xyz/public/{uid}`) that looks like a professionally designed personal website.",
                link: "/portfolio",
                linkText: "Build Portfolio"
            }
        ]
    },
    {
        category: "Technical Library",
        id: "library",
        icon: Layout,
        color: "#f43f5e",
        secondary: "#e11d48",
        questions: [
            {
                q: "What makes the digitized books in Whizan's library better than PDFs?",
                a: "Our library is **Semantic and Structured**. Instead of flat PDFs, we provide a markdown-first experience where every diagram is indexed and searchable. You can search for 'Load Balancing Diagram' and Jarvis will find every relevant visual across all textbooks in the library instantly.",
                link: "/books",
                linkText: "Open Library"
            },
            {
                q: "Explain the 'Image Sitemap' optimization for the Technical Library.",
                a: "We have generated an exhaustive image sitemap for over **1,700 technical diagrams**. Each diagram has an AI-generated technical description (Alt-text) for SEO (Google Image Search) and GEO (Generative Search) optimization, ensuring the world can find our high-quality technical assets.",
                link: "/public/sitemap-images.xml",
                linkText: "View Sitemap"
            }
        ]
    },
    {
        category: "Platform & Billing",
        id: "platform",
        icon: HelpCircle,
        color: "#f59e0b",
        secondary: "#d97706",
        questions: [
            {
                q: "What is the difference between the Spark (Free) and Blaze (Premium) plans?",
                a: "The **Spark Plan** is designed for the casual learner, offering essential mock interviews and 1000+ problems. The **Blaze Plan (₹299/mo)** is for high-potential engineers, adding unlimited System Design practice, the Autonomous Job Applier agent, premium certifications, and advanced AI-powered career analytics.",
                link: "/profile",
                linkText: "Check Plans"
            },
            {
                q: "How does the Razorpay-based billing and subscription management work?",
                a: "We use **Razorpay's secure subscription engine**. You can pay via UPI, Card, or Netbanking. Subscriptions auto-renew monthly, but you have a '1-Click Cancel' option in your profile. You’ll receive an automated receipt and renewal notice via email every time.",
                link: "/profile",
                linkText: "Manage Billing"
            }
        ]
    }
];

const FAQ = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [openIndex, setOpenIndex] = useState(null);
    const [activeTab, setActiveTab] = useState(FAQ_DATA[0].category);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const activeCategory = FAQ_DATA.find(s => s.category === activeTab);

    const filteredData = FAQ_DATA.map(section => ({
        ...section,
        questions: section.questions.filter(q => 
            q.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
            q.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(section => section.questions.length > 0);

    const toggleAccordion = (id) => {
        setOpenIndex(openIndex === id ? null : id);
    };

    return (
        <div className="faq-vibrant-root" style={{ '--active-color': activeCategory.color, '--active-secondary': activeCategory.secondary }}>
            <Helmet>
                <title>FAQ Center | Vibrant AI Career Ecosystem | Whizan AI</title>
                <meta name="description" content="Explore the colorful world of Whizan AI. Deep technical answers about interviews, courses, and career automation." />
            </Helmet>

            {/* ── Dynamic Mesh Background ── */}
            <div className="vibrant-bg">
                <div className="mesh-blob blob-1" />
                <div className="mesh-blob blob-2" />
                <div className="mesh-blob blob-3" />
                <div className="mesh-grid" />
            </div>

            {/* ── Integrated Navbar ── */}
            <nav className={`vibrant-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="nav-left" onClick={() => navigate('/dashboard')}>
                        <div className="vibrant-logo-wrapper">
                            <img src="/logo.jpeg" alt="Whizan" />
                            <div className="logo-glow" />
                        </div>
                        <span className="brand-name">Whizan AI</span>
                    </div>

                    <div className="nav-center">
                        <button onClick={() => navigate('/dsaquestion')}>Practice</button>
                        <button onClick={() => navigate('/aiinterviewselect')}>Interviews</button>
                        <button onClick={() => navigate('/systemdesign')}>Architecture</button>
                        <button onClick={() => navigate('/courses')}>Academy</button>
                    </div>

                    <div className="nav-right">
                        <div className="profile-wrap">
                            <NavProfile />
                        </div>
                        <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Hero Section ── */}
            <section className="vibrant-hero">
                <motion.div 
                    className="hero-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="hero-badge">
                        <Star size={14} className="star-pulse" />
                        <span>Support Center 2026</span>
                    </div>
                    <h1>Everything You Need to <span className="vibrant-text">Level Up</span></h1>
                    <p>Discover the secrets behind our AI ecosystem. Detailed, colorful, and built for builders.</p>
                    
                    <div className="search-container">
                        <div className="search-inner">
                            <Search className="s-icon" />
                            <input 
                                type="text" 
                                placeholder="Search tutorials, features, or architecture..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="search-glow" />
                        </div>
                    </div>
                </motion.div>
            </section>

            <main className="vibrant-main">
                <aside className="vibrant-sidebar">
                    <div className="sidebar-sticky">
                        <div className="sidebar-title">Categories</div>
                        <div className="category-list">
                            {FAQ_DATA.map((section) => (
                                <button
                                    key={section.category}
                                    className={`category-btn ${activeTab === section.category ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveTab(section.category);
                                        setOpenIndex(null);
                                    }}
                                    style={{ '--category-color': section.color }}
                                >
                                    <div className="icon-box">
                                        <section.icon size={20} />
                                    </div>
                                    <span>{section.category}</span>
                                    {activeTab === section.category && (
                                        <motion.div className="active-glow" layoutId="active-glow" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                <div className="vibrant-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                            className="questions-wrapper"
                        >
                            <div className="section-header">
                                <div className="header-icon" style={{ background: `${activeCategory.color}20`, color: activeCategory.color }}>
                                    <activeCategory.icon size={32} />
                                </div>
                                <div>
                                    <h2>{activeTab}</h2>
                                    <p>Comprehensive technical guidance for {activeTab.toLowerCase()}.</p>
                                </div>
                            </div>

                            <div className="qa-grid">
                                {filteredData.find(s => s.category === activeTab)?.questions.map((item, idx) => (
                                    <div 
                                        key={idx}
                                        className={`qa-item ${openIndex === idx ? 'open' : ''}`}
                                        onClick={() => toggleAccordion(idx)}
                                    >
                                        <div className="qa-q">
                                            <div className="q-wrap">
                                                <div className="q-bullet" style={{ background: activeCategory.color }} />
                                                <h3>{item.q}</h3>
                                            </div>
                                            <ChevronDown className="arrow" />
                                        </div>
                                        <AnimatePresence>
                                            {openIndex === idx && (
                                                <motion.div 
                                                    className="qa-a"
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                >
                                                    <div className="a-inner">
                                                        <div className="a-text">
                                                            {item.a.split('\n\n').map((p, i) => (
                                                                <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<span>$1</span>') }} />
                                                            ))}
                                                        </div>
                                                        {item.link && (
                                                            <button 
                                                                className="a-cta"
                                                                onClick={(e) => { e.stopPropagation(); navigate(item.link); }}
                                                                style={{ '--btn-color': activeCategory.color }}
                                                            >
                                                                {item.linkText} <ArrowRight size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <footer className="vibrant-footer">
                <div className="footer-card">
                    <div className="footer-glow" />
                    <div className="footer-inner">
                        <Sparkles className="f-icon" size={48} />
                        <h2>Ready to Build?</h2>
                        <p>Join thousands of engineers accelerating their careers with Whizan AI.</p>
                        <div className="f-btns">
                            <button className="primary-f-btn" onClick={() => navigate('/aiinterviewselect')}>Start Free Interview</button>
                            <button className="secondary-f-btn" onClick={() => navigate('/courses')}>View Courses</button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FAQ;
