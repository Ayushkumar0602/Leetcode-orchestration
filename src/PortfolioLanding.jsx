import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Code2, Award, Sparkles, ChevronRight, Globe, LayoutTemplate, Shield, Terminal, ArrowUpRight } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useSEO } from './hooks/useSEO';
import NavProfile from './NavProfile';

// Advanced CSS for highly aesthetic cinematic dark mode
const S = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
    
    .pl-main { 
        background-color: #030408; 
        background-image: 
            radial-gradient(circle at 10% 20%, rgba(168, 85, 247, 0.12), transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.1), transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05), transparent 50%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3%3C/filter%3%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3%3C/svg%3");
        background-blend-mode: overlay;
        color: #fff; 
        font-family: 'Inter', sans-serif; 
        min-height: 100vh; 
        overflow-x: hidden; 
        position: relative; 
    }
    
    /* Subtle Animated Grid Background */
    .pl-bg-grid { 
        position: fixed; 
        inset: 0; 
        background-image: 
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), 
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px); 
        background-size: 40px 40px; 
        pointer-events: none; 
        z-index: 0; 
        mask-image: radial-gradient(circle at center, black 40%, transparent 100%); 
        -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 100%); 
    }
    
    /* Navigation */
    .pl-nav { height: 72px; display: flex; align-items: center; justify-content: space-between; padding: 0 5%; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(3,4,8,0.7); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 50; }
    
    /* Hero Section */
    .pl-hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; position: relative; padding: 8rem 5% 4rem; text-align: center; z-index: 10; }
    
    .pl-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3); padding: 8px 20px; border-radius: 99px; font-size: 0.85rem; font-weight: 600; color: #c084fc; margin-bottom: 2rem; box-shadow: 0 0 20px rgba(168,85,247,0.2); animation: pulseGlow 2s infinite alternate; }
    
    .pl-h1 { font-family: 'Syne', sans-serif; font-size: clamp(3rem, 7vw, 5.5rem); font-weight: 800; line-height: 1.05; letter-spacing: -0.04em; margin-bottom: 1.5rem; max-width: 1000px; text-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .pl-h1-gradient { background: linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-size: 200% auto; animation: gradientShift 5s ease infinite; }
    
    .pl-p { font-size: clamp(1.1rem, 2vw, 1.35rem); color: rgba(255,255,255,0.65); max-width: 700px; line-height: 1.6; margin: 0 auto 3rem; }
    
    .pl-btn { display: inline-flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #a855f7, #3b82f6); color: #fff; padding: 18px 36px; border-radius: 14px; font-weight: 700; font-size: 1.1rem; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 10px 40px rgba(168,85,247,0.4); text-decoration: none; position: relative; overflow: hidden; }
    .pl-btn::after { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent); transform: skewX(-20deg); transition: all 0.5s; }
    .pl-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 50px rgba(168,85,247,0.6); }
    .pl-btn:hover::after { left: 150%; }
    
    /* Hero Image Mockup */
    .pl-mockup-container { width: 100%; max-width: 1100px; margin-top: 5rem; perspective: 1000px; position: relative; }
    .pl-mockup-glow { position: absolute; top: 20%; left: 50%; transform: translateX(-50%); width: 80%; height: 60%; background: linear-gradient(90deg, #a855f7, #3b82f6); filter: blur(120px); opacity: 0.25; z-index: 0; pointer-events: none; }
    
    .pl-mockup-window { background: rgba(10,12,18,0.8); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1); position: relative; z-index: 10; transform: rotateX(8deg) translateY(20px); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .pl-mockup-window:hover { transform: rotateX(0deg) translateY(-10px); }
    
    .pl-mockup-header { height: 44px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; padding: 0 20px; gap: 8px; }
    .pl-dot { width: 12px; height: 12px; border-radius: 50%; }
    .pl-mockup-url { margin: 0 auto; background: rgba(0,0,0,0.3); padding: 4px 16px; border-radius: 6px; font-size: 0.75rem; color: rgba(255,255,255,0.5); font-family: 'JetBrains Mono', monospace; border: 1px solid rgba(255,255,255,0.05); }
    
    .pl-image-wrapper { width: 100%; display: block; background: #050505; position: relative; }
    .pl-image { width: 100%; height: auto; display: block; object-fit: cover; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; }
    
    /* Layouts */
    .pl-section { padding: 8rem 5%; position: relative; z-index: 10; }
    .pl-section-title { font-family: 'Syne', sans-serif; font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; text-align: center; margin-bottom: 1rem; letter-spacing: -0.02em; }
    .pl-section-subtitle { text-align: center; color: rgba(255,255,255,0.6); font-size: 1.1rem; max-width: 600px; margin: 0 auto 5rem; line-height: 1.6; }
    
    /* Bento Grid */
    .pl-bento-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; max-width: 1200px; margin: 0 auto; }
    .pl-bento-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 2.5rem; transition: all 0.3s; position: relative; overflow: hidden; backdrop-filter: blur(14px); text-align: left; display: flex; flex-direction: column; }
    .pl-bento-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.15); transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    
    .pl-span-4 { grid-column: span 4; }
    .pl-span-8 { grid-column: span 8; }
    .pl-span-6 { grid-column: span 6; }
    
    @media (max-width: 1024px) {
        .pl-span-4, .pl-span-8 { grid-column: span 12; }
        .pl-span-6 { grid-column: span 6; }
    }
    @media (max-width: 768px) {
        .pl-span-6 { grid-column: span 12; }
        .pl-mockup-window { transform: none; }
        .pl-mockup-window:hover { transform: none; }
    }
    
    .pl-icon-box { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }
    .pl-card-h3 { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.8rem; letter-spacing: -0.02em; color: #fff; }
    .pl-card-p { color: rgba(255,255,255,0.6); line-height: 1.6; font-size: 1rem; margin: 0; }
    
    /* Values Section */
    .pl-value-row { display: flex; align-items: center; gap: 4rem; max-width: 1100px; margin: 0 auto 6rem; }
    .pl-value-row.reverse { flex-direction: row-reverse; }
    .pl-value-content { flex: 1; }
    .pl-value-visual { flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 2rem; position: relative; overflow: hidden; box-shadow: inset 0 0 40px rgba(0,0,0,0.5); }
    @media (max-width: 900px) {
        .pl-value-row, .pl-value-row.reverse { flex-direction: column; gap: 2.5rem; }
    }
    
    /* CTA Box */
    .pl-cta-box { max-width: 1000px; margin: 0 auto; background: linear-gradient(135deg, rgba(168,85,247,0.1), rgba(59,130,246,0.1)); border: 1px solid rgba(255,255,255,0.1); border-radius: 32px; padding: 5rem 3rem; text-align: center; position: relative; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.5); }
    .pl-cta-box::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle at center, rgba(168,85,247,0.15) 0%, transparent 60%); pointer-events: none; }

    /* Animations */
    @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    @keyframes pulseGlow { 0% { box-shadow: 0 0 10px rgba(168,85,247,0.2); } 100% { box-shadow: 0 0 25px rgba(168,85,247,0.4); } }
`;

export default function PortfolioLanding() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // SEO Enhancement for generic non-logged-in public traffic
    useSEO({
        title: 'Free Developer Portfolio Maker – Whizan AI',
        description: 'Auto-generate a stunning, SEO-optimized software engineering portfolio. Showcase your LeetCode DSA stats, AI mock interview scores, and deployed projects.',
        canonical: '/portfolio',
        keywords: 'developer portfolio, free portfolio maker, software engineer portfolio, AI coding interview, DSA practice portfolio, github portfolio alternative',
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Whizan AI Portfolio Maker",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web",
            "description": "A tool for software engineers to instantly generate a professional, data-driven portfolio using their technical interview practice metrics.",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        }
    });

    const handleCreateClick = () => navigate(currentUser ? '/profile' : '/login?redirect=/portfolio');

    return (
        <main className="pl-main">
            <style>{S}</style>

            {/* Ambient Background */}
            <div className="pl-bg-grid" />

            {/* Navigation Header */}
            <header className="pl-nav">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <img src="/logo.jpeg" alt="Whizan AI Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.4px', color: '#fff' }}>Whizan AI</span>
                </div>
                {currentUser ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <NavProfile />
                    </div>
                ) : (
                    <button onClick={() => navigate('/login?redirect=/portfolio')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                        Sign In
                    </button>
                )}
            </header>

            {/* Hero Section */}
            <section className="pl-hero">
                {/* Visual Ambient Orbs */}
                <div style={{ position: 'absolute', top: '5%', left: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 50%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '20%', right: '10%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 50%)', pointerEvents: 'none' }} />

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    <div className="pl-badge">
                        <Sparkles size={14} /> The #1 Free Portfolio Setup for Engineers
                    </div>

                    <h1 className="pl-h1">
                        Turn Your Practice into <br />
                        <span className="pl-h1-gradient">A Proof of Excellence.</span>
                    </h1>

                    <p className="pl-p">
                        Skip the templates. Whizan AI auto-generates a premium, highly-SEO-optimized public portfolio that proves your verifiable <strong>LeetCode stats</strong>, <strong>System Design skills</strong>, and <strong>AI mock interview scores</strong>.
                    </p>

                    <button onClick={handleCreateClick} className="pl-btn">
                        <Globe size={20} /> Claim Your Public Link
                    </button>
                </motion.div>

                {/* Desktop Mockup Preview */}
                <motion.div className="pl-mockup-container" initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
                    <div className="pl-mockup-glow" />
                    <div className="pl-mockup-window">
                        {/* Browser Chrome Header */}
                        <div className="pl-mockup-header">
                            <div className="pl-dot" style={{ background: '#ff5f56' }} />
                            <div className="pl-dot" style={{ background: '#ffbd2e' }} />
                            <div className="pl-dot" style={{ background: '#27c93f' }} />
                            <div className="pl-mockup-url">whizan.xyz/public/developer</div>
                            <div style={{ width: 44 }} /> {/* Fake flex balancer */}
                        </div>
                        {/* Insert Actual Portfolio Mockup Image */}
                        <div className="pl-image-wrapper">
                            <img
                                src="/portfolio.png"
                                alt="High quality developer portfolio preview showing 3D DSA activity charts, recent AI mock interview evaluations, and technical system design case studies"
                                className="pl-image"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Core Value Propositions */}
            <article className="pl-section">
                <h2 className="pl-section-title">Beyond a Static Resume</h2>
                <p className="pl-section-subtitle">A dynamic, living showcase that proves you can actually write code, construct architectures, and communicate under pressure.</p>

                {/* AI Interview Detail Map */}
                <div className="pl-value-row">
                    <motion.div className="pl-value-content" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true, margin: "-100px" }}>
                        <div className="pl-icon-box" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
                            <Brain color="#c084fc" size={28} />
                        </div>
                        <h3 className="pl-card-h3">Verifiable AI Interview Metrics</h3>
                        <p className="pl-card-p" style={{ fontSize: '1.1rem' }}>
                            Show technical recruiters specifically how you perform natively under pressure. Your portfolio links directly to anonymized AI mock interview reports detailing your problem-solving approaches, coding efficiency, and Hire/No Hire signals.
                        </p>
                    </motion.div>
                    <motion.div className="pl-value-visual" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true, margin: "-100px" }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#10b98120', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', flexShrink: 0 }}>92</div>
                                <div><div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#fff' }}>Mock Interview: Valid Palindrome II</div><div style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>Strong Hire Signal</div></div>
                            </div>
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f59e0b20', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', flexShrink: 0 }}>78</div>
                                <div><div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#fff' }}>System Design: Scalable Chat App</div><div style={{ fontSize: '0.85rem', color: '#f59e0b', marginTop: '4px', fontWeight: '600' }}>Hire Signal</div></div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* DSA Practice Sync */}
                <div className="pl-value-row reverse">
                    <motion.div className="pl-value-content" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true, margin: "-100px" }}>
                        <div className="pl-icon-box" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
                            <Code2 color="#60a5fa" size={28} />
                        </div>
                        <h3 className="pl-card-h3">Live DSA Activity Sync</h3>
                        <p className="pl-card-p" style={{ fontSize: '1.1rem' }}>
                             Every time you solve a Data Structures or Algorithms problem inside Whizan AI, your custom portfolio updates instantly. Prove your consistency globally with an embedded activity heatmap and segmented difficulty breakdown.
                        </p>
                    </motion.div>
                    <motion.div className="pl-value-visual" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true, margin: "-100px" }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                            {Array.from({ length: 35 }).map((_, i) => {
                                const active = Math.random() > 0.5;
                                const opacity = active ? Math.random() * 0.8 + 0.2 : 1;
                                return (
                                    <div key={i} style={{ aspectRatio: '1/1', borderRadius: '4px', background: active ? `rgba(59,130,246,${opacity})` : 'rgba(255,255,255,0.03)' }} />
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </article>

            {/* Comprehensive SEO Feature Grid */}
            <section className="pl-section" style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 className="pl-section-title">Everything You Need to Stand Out</h2>

                <div className="pl-bento-grid" style={{ marginTop: '4rem' }}>

                    <motion.div className="pl-bento-card pl-span-8" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.08))', pointerEvents: 'none' }} />
                        <div className="pl-icon-box" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}><LayoutTemplate color="#c084fc" size={24} /></div>
                        <h3 className="pl-card-h3">In-Depth Project Case Studies</h3>
                        <p className="pl-card-p" style={{ maxWidth: '450px' }}>Don't just list a project name. Attach full architectural overviews, detailed technology stacks, server setup instructions, and live deployment demo links within dedicated, inherently SEO-friendly project detail pages.</p>
                    </motion.div>

                    <motion.div className="pl-bento-card pl-span-4" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}>
                        <div className="pl-icon-box" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}><Shield color="#34d399" size={24} /></div>
                        <h3 className="pl-card-h3">Global SEO Indexing</h3>
                        <p className="pl-card-p">Your profile URL natively injects perfect metadata and JSON-LD schema, meaning recruiters will organically find you through Google Search.</p>
                    </motion.div>

                    <motion.div className="pl-bento-card pl-span-6" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
                        <div className="pl-icon-box" style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)' }}><Award color="#facc15" size={24} /></div>
                        <h3 className="pl-card-h3">Gamified Badges</h3>
                        <p className="pl-card-p">Progress organically visually demonstrated. Unlock unique achievement badges by solving hard algorithms and successfully finishing complex systems design interviews.</p>
                    </motion.div>

                    <motion.div className="pl-bento-card pl-span-6" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} viewport={{ once: true }}>
                        <div className="pl-icon-box" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}><Terminal color="#f87171" size={24} /></div>
                        <h3 className="pl-card-h3">Extensive Tech Stack Mapping</h3>
                        <p className="pl-card-p">Categorize yourself and your projects using precision technologies. The system dynamically pulls premium, recognizable SVG logos for your frameworks.</p>
                    </motion.div>

                </div>
            </section>

            {/* Massive Footer Output / CTA Focus */}
            <section className="pl-section">
                <motion.div className="pl-cta-box" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} viewport={{ once: true }}>
                    <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, letterSpacing: '-0.04em' }}>
                        Your next job is waiting.
                    </h2>
                    <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3.5rem', lineHeight: 1.6 }}>
                        Join thousands of software engineers leveraging Whizan AI to prove their raw coding skills with immutable data, rather than just words.
                    </p>
                    <button onClick={handleCreateClick} className="pl-btn" style={{ padding: '20px 48px', fontSize: '1.25rem' }}>
                        Create Your URL <ArrowUpRight size={22} />
                    </button>
                    <div style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', fontWeight: 500 }}>
                        100% Free · Real-Time Updates · Perfect Integration
                    </div>
                </motion.div>
            </section>

            {/* Global Footer */}
            <footer style={{ padding: '2.5rem 5%', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>© 2026 Whizan AI. All rights reserved.</div>
                <nav style={{ display: 'flex', gap: '24px' }}>
                    <a href="/" title="Whizan AI Home" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>Home</a>
                    <a href="/dsaquestion" title="Practice DSA Coding Questions" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>DSA Practice</a>
                    <a href="/infoaiinterview" title="Learn about AI Mock Interviews" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>Interviews</a>

                </nav>
            </footer>
        </main>
    );
}
