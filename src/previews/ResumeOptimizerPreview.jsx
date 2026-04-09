import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, FileCheck, Zap, ArrowRight, UploadCloud, Star, BarChart,
  CheckCircle, Shield, Clock, Users, TrendingUp, Award, ChevronDown,
  Target, Layers, RefreshCw, Download, Briefcase, GraduationCap,
  Building2, Sparkles, Lock, Globe
} from 'lucide-react';
import './ResumeOptimizerPreview.css';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import NavProfile from '../NavProfile';
import NotificationBell from '../components/NotificationBell';

/* ─────────────── tiny hook: animate number counting up ─────────────── */
const useCountUp = (target, duration = 1800, start = false) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return val;
};

/* ─────────────── stat card ─────────────── */
const StatCard = ({ value, suffix, label, icon: Icon, color, delay }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const count = useCountUp(parseInt(value), 1800, visible);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="rop-stat-card" style={{ '--delay': delay, '--accent': color }}>
      <div className="rop-stat-icon"><Icon size={22} /></div>
      <div className="rop-stat-number">{count}{suffix}</div>
      <div className="rop-stat-label">{label}</div>
    </div>
  );
};

/* ─────────────── FAQ item ─────────────── */
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rop-faq-item ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="rop-faq-q">
        <span>{q}</span>
        <ChevronDown size={18} className="rop-faq-chevron" />
      </div>
      {open && <div className="rop-faq-a">{a}</div>}
    </div>
  );
};

/* ─────────────── main component ─────────────── */
const ResumeOptimizerPreview = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    document.title = "Free AI Resume Optimizer & ATS Checker | Whizan";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Upload your resume for a free, instant ATS score. Get AI-powered rewrites and industry-specific keywords to land more interviews. Try it completely free.");
  }, []);

  const faqs = [
    { q: "Is the Resume Optimizer really free?", a: "Yes — you get 5 full resume optimizations per month completely free. No credit card required, no hidden charges." },
    { q: "What file formats are supported?", a: "We support PDF uploads (the most common resume format). Our parser extracts raw text exactly as corporate ATS systems like Workday or Taleo would read it." },
    { q: "How accurate is the ATS scoring?", a: "Our scoring model runs at low temperature to minimize hallucinations and simulates real ATS keyword-matching logic. Resumes that score 95%+ have a significantly higher pass-through rate." },
    { q: "Will my resume data be stored?", a: "Your resume is stored securely in your personal vault and is used only to power your optimizations, mock interviews, and job applications within Whizan AI. We never share it." },
    { q: "How many rewrite loops does the AI do?", a: "The AI will automatically rewrite your resume points up to 5 times, scoring itself after each iteration, until it achieves a 95%+ ATS match — or stops if it has already hit the goal." },
    { q: "Can I use this for any industry?", a: "Yes. The AI tailors keyword injection and tone based on the job description you paste in — whether that's software engineering, finance, marketing, healthcare, or any other field." },
  ];

  const industries = [
    { icon: Briefcase, label: "Business & Finance" },
    { icon: Globe, label: "Marketing & Growth" },
    { icon: Bot, label: "AI & Engineering" },
    { icon: GraduationCap, label: "Academia & Research" },
    { icon: Building2, label: "Product & Design" },
    { icon: Shield, label: "Legal & Compliance" },
  ];

  const templates = [
    { name: "Single Column", tag: "Most ATS-Safe" },
    { name: "Header Focused", tag: "Popular" },
    { name: "Two Column Lite", tag: "Modern" },
    { name: "Executive", tag: "Senior Roles" },
    { name: "Minimal Edge", tag: "Tech" },
    { name: "Timeline", tag: "Academic" },
    { name: "Impact Bold", tag: "Sales" },
    { name: "Compact Pro", tag: "Entry Level" },
    { name: "Classic Clean", tag: "Traditional" },
  ];

  return (
    <>
      <Helmet>
        <title>Free AI Resume Optimizer & ATS Scorer | Whizan AI</title>
        <meta name="description" content="Instantly analyze your resume against ATS requirements. Our AI optimizes your bullet points, injects missing keywords, and iteratively rewrites until you score 95%+. Free up to 5 scans per month — no credit card needed." />
        <meta name="keywords" content="Resume Optimizer, ATS Checker, Resume rewrite, AI Resume maker, Free Resume Checker, ATS score, Job application tool, Resume builder, Keyword optimization, Pass ATS, Beat ATS, Resume scanner" />
        <meta property="og:title" content="Free AI Resume Optimizer & ATS Scorer | Whizan AI" />
        <meta property="og:description" content="Stop getting auto-rejected. Our AI scores your resume, rewrites bullet points, and injects missing keywords until you score 95%+ on ATS. Free for students and job seekers." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://whizan.com/resume-optimizer-preview" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free AI Resume Optimizer & ATS Scorer | Whizan AI" />
        <meta name="twitter:description" content="Score and rewrite your resume with AI. Beat ATS filters and land more interviews." />
        <link rel="canonical" href="https://whizan.com/resume-optimizer-preview" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Whizan AI Resume Optimizer",
            "url": "https://whizan.com/resume-optimizer-preview",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0.00",
              "priceCurrency": "USD",
              "description": "Free up to 5 resume scans and optimizations per month"
            },
            "description": "AI-powered resume optimizer that scores, rewrites, and tailors your resume to pass Applicant Tracking Systems (ATS) with up to 5 iterative rewrite loops.",
            "featureList": [
              "ATS Parsing Simulation",
              "Keyword Match Scoring",
              "Multi-Agent AI Rewrite Loops",
              "9 ATS-Friendly PDF Templates",
              "Resume Vault Storage",
              "Industry-Specific Optimization"
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "1247",
              "bestRating": "5"
            },
            "provider": {
              "@type": "Organization",
              "name": "Whizan AI",
              "url": "https://whizan.com"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
              "@type": "Question",
              "name": f.q,
              "acceptedAnswer": { "@type": "Answer", "text": f.a }
            }))
          })}
        </script>
      </Helmet>

      <div className="resume-preview-container rop-enhanced">

        {/* ── Navbar ── */}
        <nav className="resume-preview-nav">
          <div className="nav-brand" onClick={() => navigate('/')}>
            <img src="/logo.jpeg" alt="Whizan logo" className="nav-brand-img" />
            <span className="nav-brand-text">Whizan AI</span>
          </div>
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {currentUser ? (
              <>
                <NotificationBell />
                <NavProfile />
              </>
            ) : (
              <button className="btn-secondary" onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}>Sign In</button>
            )}
          </div>
        </nav>

        {/* ── Hero ── */}
        <header className="resume-preview-hero rop-hero">
          {/* floating glow orbs */}
          <div className="rop-orb rop-orb-1" aria-hidden="true" />
          <div className="rop-orb rop-orb-2" aria-hidden="true" />
          <div className="rop-orb rop-orb-3" aria-hidden="true" />

          <div className="hero-tag">
            <Zap size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Powered by Advanced ATS Intelligence
          </div>

          <h1 className="hero-title">
            Beat the ATS.<br />
            <span className="rop-gradient-text">Land the Interview.</span>
          </h1>

          <p className="hero-subtitle">
            75% of resumes are rejected by ATS before a human ever sees them. Our AI Optimizer scores your resume, rewrites your bullet points with the exact keywords your target job demands, and iterates automatically until you hit 95%+.
          </p>

          <div className="cta-group">
            <button className="btn-primary rop-cta-main" onClick={() => navigate('/resumeoptimiser')}>
              Optimize My Resume Free <ArrowRight size={20} />
            </button>
            <div className="free-tier-badge">
              <Star size={16} fill="currentColor" />
              100% Free · No credit card · 5 scans/month
            </div>
          </div>

          {/* social proof strip */}
          <div className="rop-social-proof">
            <div className="rop-avatars">
              {[
                "https://images.unsplash.com/photo-1556157382-97eda2d62296",
                "https://images.unsplash.com/photo-1521119989659-a83eee488004",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9",
                "https://images.unsplash.com/photo-1531123897727-8f129e1688ce"
              ].map((src, i) => (
                <img 
                  key={i} 
                  src={`${src}?auto=format&fit=crop&w=64&q=80`} 
                  alt="User" 
                  className="rop-avatar" 
                  style={{ zIndex: 10 - i, objectFit: 'cover' }} 
                />
              ))}
            </div>
            <span className="rop-social-text"><strong>12,000+</strong> job seekers optimized their resume this month</span>
          </div>

          {/* mini score mockup */}
          <div className="rop-score-mockup" aria-label="Sample ATS Score Widget">
            <div className="rop-score-before">
              <span className="rop-score-label">Before</span>
              <div className="rop-score-ring" style={{ '--pct': '38%', '--color': '#f87171' }}>
                <span>38%</span>
              </div>
            </div>
            <div className="rop-score-arrow"><ArrowRight size={28} color="#a5b4fc" /></div>
            <div className="rop-score-after">
              <span className="rop-score-label">After AI Rewrite</span>
              <div className="rop-score-ring rop-score-ring-after" style={{ '--pct': '97%', '--color': '#34d399' }}>
                <span>97%</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Stats bar ── */}
        <section className="rop-stats-section" aria-label="Key Statistics">
          <StatCard value={12000} suffix="+" label="Resumes Optimized" icon={TrendingUp} color="#a5b4fc" delay="0s" />
          <StatCard value={97} suffix="%" label="Avg ATS Score After" icon={Award} color="#34d399" delay="0.1s" />
          <StatCard value={9} suffix="" label="PDF Templates" icon={Layers} color="#f472b6" delay="0.2s" />
          <StatCard value={5} suffix="x" label="AI Rewrite Loops" icon={RefreshCw} color="#fbbf24" delay="0.3s" />
        </section>

        {/* ── Features Grid ── */}
        <section className="features-container rop-features" aria-labelledby="features-heading">
          <div className="rop-section-header">
            <h2 id="features-heading" className="rop-section-title">Everything You Need to Pass Screening</h2>
            <p className="rop-section-sub">Three powerful systems working in concert to get your resume in front of humans.</p>
          </div>

          <div className="rop-features-grid">
            <div className="feature-card rop-feature-card">
              <div className="feature-icon-wrapper"><UploadCloud size={32} color="#a5b4fc" /></div>
              <h3 className="feature-title">Secure Resume Vault</h3>
              <p className="feature-desc">Upload your master PDF once. We extract text via edge computing exactly as corporate ATS would — preserving your vault for instant mock interviews and auto-filled job applications, forever.</p>
              <ul className="rop-feature-bullets">
                <li><CheckCircle size={13} /> PDF parsing with formatting analysis</li>
                <li><CheckCircle size={13} /> Persisted across all Whizan tools</li>
                <li><CheckCircle size={13} /> Encrypted storage, private by default</li>
              </ul>
            </div>

            <div className="feature-card rop-feature-card rop-feature-card--highlight">
              <div className="rop-feature-badge">Most Popular</div>
              <div className="feature-icon-wrapper"><BarChart size={32} color="#34d399" /></div>
              <h3 className="feature-title">Strict ATS Scoring</h3>
              <p className="feature-desc">Discover the exact reason you're getting auto-rejected. We simulate Workday, Taleo, and Greenhouse logic to grade your keyword match rate out of 100% — section by section.</p>
              <ul className="rop-feature-bullets">
                <li><CheckCircle size={13} /> Per-section keyword gap analysis</li>
                <li><CheckCircle size={13} /> Hard skill vs soft skill breakdown</li>
                <li><CheckCircle size={13} /> Low-temperature model, no hallucinations</li>
              </ul>
            </div>

            <div className="feature-card rop-feature-card">
              <div className="feature-icon-wrapper"><Bot size={32} color="#f472b6" /></div>
              <h3 className="feature-title">AI Auto-Rewrite Loops</h3>
              <p className="feature-desc">Not hitting 95%? Our agentic AI rewrites your bullet points up to 5 times, evaluating itself after each pass and dynamically injecting missing skills until it scores a perfect match.</p>
              <ul className="rop-feature-bullets">
                <li><CheckCircle size={13} /> Iterative multi-agent architecture</li>
                <li><CheckCircle size={13} /> Tone and action verb optimization</li>
                <li><CheckCircle size={13} /> Stops automatically when goal met</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Pipeline walkthrough ── */}
        <section className="pipeline-section rop-pipeline" aria-labelledby="pipeline-heading">
          <div className="rop-section-header">
            <h2 id="pipeline-heading" className="rop-section-title">The 4-Step AI Optimization Pipeline</h2>
            <p className="rop-section-sub">Not just a keyword matcher — a fully agentic system designed to guarantee ATS pass-through.</p>
          </div>

          <div className="rop-pipeline-steps">
            {[
              {
                num: "01", icon: FileCheck, color: "#a5b4fc",
                title: "ATS Parsing Simulation",
                desc: "We extract raw text from your PDF exactly how Workday, Taleo, or Greenhouse would — identifying formatting issues like tables, columns, and special characters that silently cause auto-rejections before a human ever reads your resume."
              },
              {
                num: "02", icon: Target, color: "#34d399",
                title: "Baseline ATS Scoring",
                desc: "Your experience is graded against the job description using a Strict ATS Evaluation model running at low temperature. This eliminates AI hallucinations and gives you a precise keyword match percentage by section."
              },
              {
                num: "03", icon: RefreshCw, color: "#f472b6",
                title: "Multi-Agent Rewrite Loops",
                desc: "If your score is below 95%, our agent iteratively rewrites your bullet points — dynamically injecting missing hard skills, adjusting tone, and improving structure — evaluating itself up to 5 times until it hits the target."
              },
              {
                num: "04", icon: Download, color: "#fbbf24",
                title: "9 ATS-Friendly PDF Exports",
                desc: "Once optimized, export your resume using one of 9 machine-readable templates including Single Column, Header Focused, Executive, and Compact Pro — each designed to render cleanly inside ATS parsers."
              }
            ].map(({ num, icon: Icon, color, title, desc }) => (
              <div key={num} className="rop-pipeline-step">
                <div className="rop-pipeline-num" style={{ color }}>{num}</div>
                <div className="rop-pipeline-icon-wrap" style={{ '--step-color': color }}>
                  <Icon size={24} color={color} />
                </div>
                <div>
                  <h3 className="rop-pipeline-title">{title}</h3>
                  <p className="rop-pipeline-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Templates showcase ── */}
        <section className="rop-templates-section" aria-labelledby="templates-heading">
          <div className="rop-section-header">
            <h2 id="templates-heading" className="rop-section-title">9 ATS-Optimized PDF Templates</h2>
            <p className="rop-section-sub">Every template is engineered to parse cleanly inside real corporate ATS software.</p>
          </div>
          <div className="rop-templates-grid">
            {templates.map(({ name, tag }) => (
              <div key={name} className="rop-template-card">
                <div className="rop-template-preview">
                  <div className="rop-template-line rop-tl-1" />
                  <div className="rop-template-line rop-tl-2" />
                  <div className="rop-template-line rop-tl-3" />
                  <div className="rop-template-line rop-tl-4" />
                </div>
                <div className="rop-template-name">{name}</div>
                <div className="rop-template-tag">{tag}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Industries ── */}
        <section className="rop-industries-section" aria-labelledby="industries-heading">
          <div className="rop-section-header">
            <h2 id="industries-heading" className="rop-section-title">Works for Every Industry</h2>
            <p className="rop-section-sub">Keyword injection and tone are calibrated to your specific job description — whatever the field.</p>
          </div>
          <div className="rop-industries-grid">
            {industries.map(({ icon: Icon, label }) => (
              <div key={label} className="rop-industry-pill">
                <Icon size={18} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="rop-testimonials" aria-labelledby="testimonials-heading">
          <div className="rop-section-header">
            <h2 id="testimonials-heading" className="rop-section-title">What Job Seekers Are Saying</h2>
          </div>
          <div className="rop-testimonials-grid">
            {[
              { name: "Priya S.", role: "SWE @ Meta", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce", text: "I went from 0 callbacks to 3 interviews in a week after running my resume through this. The ATS score went from 42% to 96%.", stars: 5 },
              { name: "James K.", role: "Product Manager", avatar: "https://images.unsplash.com/photo-1521119989659-a83eee488004", text: "The rewrite loops are genuinely impressive. It rewrote my bullet points 3 times and explained why each iteration was better. Never seen anything like it.", stars: 5 },
              { name: "Aisha M.", role: "MBA Graduate", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330", text: "Used it for 5 different job descriptions in the same month — free tier was more than enough. The templates look incredibly professional.", stars: 5 },
            ].map(({ name, role, avatar, text, stars }) => (
              <div key={name} className="rop-testimonial-card">
                <div className="rop-t-stars">{Array.from({ length: stars }).map((_, i) => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}</div>
                <p className="rop-t-text">"{text}"</p>
                <div className="rop-t-author">
                  <img src={`${avatar}?auto=format&fit=crop&w=100&q=80`} alt={name} className="rop-t-avatar" style={{ objectFit: 'cover' }} />
                  <div>
                    <div className="rop-t-name">{name}</div>
                    <div className="rop-t-role">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Trust signals ── */}
        <section className="rop-trust-section" aria-label="Trust and Security">
          <div className="rop-trust-grid">
            <div className="rop-trust-item"><Lock size={20} color="#a5b4fc" /><span>End-to-End Encrypted</span></div>
            <div className="rop-trust-item"><Shield size={20} color="#34d399" /><span>GDPR Compliant</span></div>
            <div className="rop-trust-item"><Users size={20} color="#f472b6" /><span>12,000+ Active Users</span></div>
            <div className="rop-trust-item"><Clock size={20} color="#fbbf24" /><span>Avg. 90-Second Optimization</span></div>
            <div className="rop-trust-item"><Sparkles size={20} color="#60a5fa" /><span>No Signup to Try</span></div>
            <div className="rop-trust-item"><GraduationCap size={20} color="#f0abfc" /><span>Free for Students Forever</span></div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="rop-faq-section" aria-labelledby="faq-heading">
          <div className="rop-section-header">
            <h2 id="faq-heading" className="rop-section-title">Frequently Asked Questions</h2>
          </div>
          <div className="rop-faq-list">
            {faqs.map(faq => <FaqItem key={faq.q} {...faq} />)}
          </div>
        </section>

        {/* ── CTA banner ── */}
        <section className="demo-section rop-cta-banner">
          <div className="rop-orb rop-orb-cta" aria-hidden="true" />
          <div className="demo-box rop-demo-box">
            <div className="rop-cta-icon-wrap"><FileCheck size={52} color="#818cf8" /></div>
            <h2 className="rop-cta-title">Stop getting auto-rejected.<br />Start getting interviews.</h2>
            <p className="rop-cta-subtitle">
              Paste a job description. Upload your resume. Let our AI handle the rest — no credit card, no catch, no limits for students.
            </p>
            <button className="btn-primary rop-cta-main" onClick={() => navigate('/resumeoptimiser')}>
              Launch Resume Optimizer &nbsp;<ArrowRight size={20} />
            </button>
            <div className="rop-cta-footnote">
              <Star size={14} fill="#fbbf24" color="#fbbf24" /> Free up to 5 optimizations/month &nbsp;·&nbsp;
              <Lock size={13} /> Secure vault storage &nbsp;·&nbsp;
              <Clock size={13} /> Results in under 2 minutes
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default ResumeOptimizerPreview;