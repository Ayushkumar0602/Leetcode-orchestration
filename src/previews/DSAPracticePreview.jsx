import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import NavProfile from '../NavProfile';
import {
  Code2, Brain, Zap, Terminal, Trophy,
  Activity, Target, Shield, CheckCircle, ArrowRight,
  Star, Lock, Clock, Users, TrendingUp, Award,
  ChevronDown, RefreshCw, Download, Layers, Sparkles,
  BarChart2, GitBranch, Cpu, Play, BookOpen,
  FlameKindling, Flame, SlidersHorizontal, List, Calendar
} from 'lucide-react';
import './DSAPracticePreview.css';

/* ── count-up hook ── */
const useCountUp = (target, duration = 1800, start = false) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0 = null;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return val;
};

/* ── animated stat card ── */
const StatCard = ({ value, suffix = '', label, icon: Icon, color, delay = '0s' }) => {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  const count = useCountUp(parseInt(value.toString().replace(/\D/g, '')), 1800, vis);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const display = typeof value === 'string' && isNaN(parseInt(value)) ? value : `${count}${suffix}`;

  return (
    <div ref={ref} className="dp2-stat-card" style={{ '--delay': delay, '--accent': color }}>
      <div className="dp2-stat-icon"><Icon size={20} /></div>
      <div className="dp2-stat-num">{display}</div>
      <div className="dp2-stat-label">{label}</div>
    </div>
  );
};

/* ── faq item ── */
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`dp2-faq-item ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="dp2-faq-q"><span>{q}</span><ChevronDown size={17} className="dp2-faq-chevron" /></div>
      {open && <p className="dp2-faq-a">{a}</p>}
    </div>
  );
};

/* ── difficulty badge ── */
const Diff = ({ level }) => {
  const colors = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#f43f5e' };
  return <span className="dp2-diff" style={{ color: colors[level], background: `${colors[level]}18` }}>{level}</span>;
};

/* ── main ── */
const DSAPracticePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const handleCTA = () => {
    if (currentUser) navigate('/dsaquestion');
    else navigate(`/login?redirect=${encodeURIComponent('/dsaquestion')}`);
  };

  const faqs = [
    { q: "Is this really free for students?", a: "Yes — the full platform is free for students forever, including all AI features, ML recommendations, and template access. No credit card required." },
    { q: "How is this different from LeetCode?", a: "Whizan adds a layer of agentic AI: we auto-generate boilerplate for any problem, synthesize hidden test cases, and use ML to identify your exact weak spots and route you to the right problems. LeetCode doesn't do any of that." },
    { q: "What languages are supported?", a: "Python 3, JavaScript, C++, C, Java, Go, and Rust — each with full Monaco editor support, syntax highlighting, and smart formatting via Prettier and indent-normalization." },
    { q: "What is the ML Recommendation Engine?", a: "It analyzes your full submission history across all topics (DP, Trees, Graphs, etc.) and builds a real-time Readiness Gauge, scoring your strengths and weaknesses to recommend exactly what to practice next — with a confidence percentage for each pick." },
    { q: "Can I sync my existing LeetCode progress?", a: "Yes. Enter your LeetCode username in the platform and our bridge module will sync your existing solved problems so you don't start from scratch." },
    { q: "How does the AI boilerplate generation work?", a: "Our Gemini Flash agent reads the problem statement, infers the required data structures and function signatures, and generates the optimal starter template for your chosen language — instantly, before you type a single character." },
  ];

  const topics = [
    "Arrays & Hashing", "Two Pointers", "Sliding Window", "Stack",
    "Binary Search", "Linked List", "Trees", "Tries",
    "Backtracking", "Heap / PQ", "Graphs", "Dynamic Programming",
    "Greedy", "Intervals", "Math & Bit Manipulation", "Advanced Graphs"
  ];

  const companies = ["Google", "Meta", "Amazon", "Apple", "Microsoft", "Netflix", "Uber", "Stripe"];

  const problems = [
    { title: "Two Sum", diff: "Easy", topic: "Arrays", acceptance: "49%" },
    { title: "Longest Substring Without Repeating Characters", diff: "Medium", topic: "Sliding Window", acceptance: "33%" },
    { title: "Median of Two Sorted Arrays", diff: "Hard", topic: "Binary Search", acceptance: "38%" },
    { title: "Merge K Sorted Lists", diff: "Hard", topic: "Heap", acceptance: "47%" },
    { title: "Coin Change", diff: "Medium", topic: "Dynamic Programming", acceptance: "42%" },
  ];

  const schemaJSON = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Whizan AI – DSA Practice & ML Recommendations",
    "url": "https://whizan.xyz/dsa-practice-preview",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Free forever for students" },
    "description": "Master 1800+ LeetCode-style DSA problems with a Monaco editor, agentic AI boilerplate generation, hidden test case synthesis, and an ML-powered cognitive profiling engine that personalizes your learning path.",
    "featureList": [
      "1800+ curated coding problems",
      "Monaco VS Code editor engine",
      "AI boilerplate generation (Gemini Flash)",
      "Automatic hidden test case synthesis",
      "ML Cognitive Profiling & Readiness Gauge",
      "LeetCode sync bridge",
      "7 execution languages",
      "Activity heatmap & streak tracking",
      "Custom problem lists & bookmarks",
      "Streaming SSE submission engine"
    ],
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "15420", "bestRating": "5" },
    "provider": { "@type": "Organization", "name": "Whizan AI", "url": "https://whizan.xyz" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  return (
    <>
      <Helmet>
        <title>Master DSA with Agentic AI | 1800+ Problems & ML Learning Paths | Whizan</title>
        <meta name="description" content="Practice 1800+ LeetCode-style DSA problems in a VS Code-grade Monaco editor. Get AI-generated boilerplate, hidden test cases, and an ML-powered personalized roadmap that targets your exact weaknesses. Free for students." />
        <meta name="keywords" content="DSA practice, LeetCode alternative, coding interview prep, AI coding tutor, data structures algorithms, Monaco editor, FAANG prep, competitive programming, ML recommendation engine, interview readiness" />
        <link rel="canonical" href="https://whizan.xyz/dsa-practice-preview" />
        <meta property="og:title" content="Master DSA with Agentic AI | 1800+ Problems | Whizan AI" />
        <meta property="og:description" content="1800+ coding problems with a Monaco editor, AI boilerplate generation, hidden test case synthesis, and ML-powered learning paths. Free for students." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://whizan.xyz/dsa-practice-preview" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Master DSA with Agentic AI | Whizan AI" />
        <meta name="twitter:description" content="A world-class IDE + AI coach that personalizes your entire DSA prep journey." />
        <script type="application/ld+json">{JSON.stringify(schemaJSON)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="dsa-preview-container dp2-enhanced">

        {/* orbs */}
        <div className="dp-orb dp-orb-1" aria-hidden="true" />
        <div className="dp-orb dp-orb-2" aria-hidden="true" />
        <div className="dp2-orb dp2-orb-3" aria-hidden="true" />

        {/* ── Navbar ── */}
        <nav className="resume-preview-nav">
          <div className="nav-brand" onClick={() => navigate('/')}>
            <img src="/logo.jpeg" alt="Whizan" className="nav-brand-img" />
            <span className="nav-brand-text">Whizan AI</span>
          </div>
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {!currentUser ? (
              <button className="btn-secondary" onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}>Sign In</button>
            ) : (
              <NavProfile />
            )}
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="dp-hero dp2-hero" aria-labelledby="dp2-hero-title">
          <div className="hero-tag">
            <Cpu size={13} style={{ display: 'inline', marginRight: '6px' }} />
            Engineered for FAANG & Top-Tech Prep
          </div>

          <h1 id="dp2-hero-title" className="dp-hero-title">
            1800+ Coding Problems.<br />
            <span className="dp2-gradient-text">Zero Context Switching.</span>
          </h1>

          <p className="dp-hero-subtitle" style={{ maxWidth: '640px', margin: '0 auto 2rem' }}>
            A world-class VS Code-grade IDE fused with an Agentic AI coach. We generate your boilerplate, synthesize edge-case tests, and use ML cognitive profiling to tell you exactly what to practice next — so you stop grinding randomly and start improving systematically.
          </p>

          <div className="cta-group">
            <button className="btn-primary dp2-cta-main" onClick={handleCTA}>
              Start Practicing Free <ArrowRight size={20} />
            </button>
            <button className="btn-secondary" onClick={() => navigate('/resume-optimizer-preview')}>
              Optimize Resume First
            </button>
          </div>

          {/* social proof */}
          <div className="dp2-social-proof">
            <div className="rop-avatars">
              {[
                'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=100&h=100&fit=crop',
                'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=100&h=100&fit=crop',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
                'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
                'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop'
              ].map((src, i) => (
                <img key={i} src={src} alt="User avatar" className="rop-avatar" style={{ zIndex: 6 - i }} />
              ))}
            </div>
            <span className="dp2-social-text"><strong>5,000+</strong> engineers leveled up this month</span>
          </div>

          {/* stats bar */}
          <div className="dp-stats-bar dp2-stats-bar">
            {[
              { val: '1,824', label: 'Curated Problems', icon: BookOpen, color: '#a5b4fc' },
              { val: '7', label: 'Execution Languages', icon: Code2, color: '#34d399' },
              { val: '<1s', label: 'Code Execution', icon: Zap, color: '#f472b6' },
              { val: '16', label: 'DSA Topic Tracks', icon: Layers, color: '#fbbf24' },
            ].map(({ val, label, icon: Icon, color }) => (
              <div key={label} className="dp-stat-item dp2-stat-item">
                <Icon size={16} color={color} style={{ marginBottom: '4px' }} />
                <span className="dp-stat-val">{val}</span>
                <span className="dp-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Animated stats ── */}
        <section className="dp2-stats-section" aria-label="Platform Statistics">
          <StatCard value={15000} suffix="+" label="Active Users" icon={Users} color="#a5b4fc" delay="0s" />
          <StatCard value={1824} suffix="" label="Problems" icon={BookOpen} color="#34d399" delay="0.1s" />
          <StatCard value={98} suffix="%" label="User Satisfaction" icon={Award} color="#f472b6" delay="0.2s" />
          <StatCard value={7} suffix="" label="Languages" icon={Code2} color="#fbbf24" delay="0.3s" />
        </section>

        {/* ── IDE Showcase ── */}
        <section className="dp-ide-showcase dp2-ide-showcase" aria-label="Monaco Editor Demo">
          <div className="dp2-ide-label">
            <Terminal size={14} color="#34d399" />
            <span>Live IDE Preview — TwoSum.py</span>
          </div>
          <div className="dp-ide-window dp2-ide-window">
            <div className="dp-ide-header">
              <div className="dp-dot r" /><div className="dp-dot y" /><div className="dp-dot g" />
              <span style={{ color: '#888', fontSize: '0.78rem', marginLeft: '10px' }}>whizan-editor — TwoSum.py</span>
              <div className="dp2-ide-lang-badge">Python 3</div>
            </div>
            <div className="dp-ide-body dp2-ide-body">
              {/* sidebar */}
              <div className="dp-ide-sidebar dp2-sidebar">
                <div className="dp2-problem-meta">
                  <div className="dp2-problem-num">#1</div>
                  <h4 className="dp2-problem-title">Two Sum</h4>
                  <Diff level="Easy" />
                </div>
                <p className="dp2-problem-desc">
                  Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target.
                </p>
                <div className="dp2-constraints">
                  <div className="dp2-constraint-label">Constraints</div>
                  <div className="dp2-constraint">2 ≤ nums.length ≤ 10⁴</div>
                  <div className="dp2-constraint">-10⁹ ≤ nums[i] ≤ 10⁹</div>
                  <div className="dp2-constraint">Exactly one solution exists</div>
                </div>
                <div className="dp2-ai-banner">
                  <Sparkles size={13} color="#a5b4fc" />
                  <span>AI generated boilerplate</span>
                </div>
              </div>
              {/* code */}
              <div className="dp-ide-code dp2-code-panel">
                <pre className="dp2-code-pre">
                  <span className="dp2-kw">class</span> <span className="dp2-cls">Solution</span>:{'\n'}
                  {'    '}<span className="dp2-kw">def</span> <span className="dp2-fn">twoSum</span>(<span className="dp2-self">self</span>, nums: <span className="dp2-cls">List</span>[<span className="dp2-cls">int</span>], target: <span className="dp2-cls">int</span>) -&gt; <span className="dp2-cls">List</span>[<span className="dp2-cls">int</span>]:{'\n'}
                  {'        '}numMap = {'{}'}{'\n'}
                  {'        '}<span className="dp2-kw">for</span> i, num <span className="dp2-kw">in</span> <span className="dp2-builtin">enumerate</span>(nums):{'\n'}
                  {'            '}complement = target - num{'\n'}
                  {'            '}<span className="dp2-kw">if</span> complement <span className="dp2-kw">in</span> numMap:{'\n'}
                  {'                '}<span className="dp2-kw">return</span> [numMap[complement], i]{'\n'}
                  {'            '}numMap[num] = i{'\n'}
                  {'        '}<span className="dp2-kw">return</span> []
                </pre>
                {/* test results */}
                <div className="dp2-test-results">
                  {[
                    { label: 'Test 1', input: '[2,7,11,15], 9', output: '[0,1]', pass: true },
                    { label: 'Test 2', input: '[3,2,4], 6', output: '[1,2]', pass: true },
                    { label: 'Hidden #47', input: '...', output: '...', pass: true },
                  ].map(({ label, input, output, pass }) => (
                    <div key={label} className={`dp2-test-row ${pass ? 'pass' : 'fail'}`}>
                      <CheckCircle size={13} color={pass ? '#10b981' : '#f43f5e'} />
                      <span className="dp2-test-label">{label}</span>
                      <span className="dp2-test-io">Input: <code>{input}</code> → <code>{output}</code></span>
                    </div>
                  ))}
                </div>
                <div className="dp2-accepted-banner">
                  <CheckCircle color="#10b981" size={18} />
                  <span style={{ color: '#10b981', fontWeight: 700 }}>Accepted</span>
                  <span className="dp2-runtime">Runtime: 56ms · Beats 94.2% of Python solutions</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features grid ── */}
        <section className="dp-features dp2-features" aria-labelledby="dp2-features-heading">
          <div className="dp-section-header">
            <h2 id="dp2-features-heading" className="dp-section-title">A Superior Solving Environment</h2>
            <p className="dp-section-sub">Three intelligent systems working together to make you genuinely interview-ready.</p>
          </div>

          <div className="dp-features-grid dp2-features-grid">
            <div className="dp-feature-card dp2-feature-card">
              <div className="dp-icon-wrapper"><Terminal size={30} color="#a5b4fc" /></div>
              <h3 className="dp-feature-title">Monaco Editor Engine</h3>
              <p className="dp-feature-desc">The same engine powering VS Code, embedded directly in your browser. Multi-cursor editing, smart indentation, and language-specific formatting — so your practice environment mirrors your actual work environment.</p>
              <ul className="dp2-feature-bullets">
                <li><CheckCircle size={13} /> Python, JS, C++, C, Java, Go, Rust</li>
                <li><CheckCircle size={13} /> Prettier & indent-normalization</li>
                <li><CheckCircle size={13} /> Resizable split-pane layout</li>
                <li><CheckCircle size={13} /> Language preference persistence</li>
              </ul>
            </div>

            <div className="dp-feature-card dp2-feature-card dp2-feature-card--highlight">
              <div className="dp2-feature-badge">Most Powerful</div>
              <div className="dp-icon-wrapper"><Zap size={30} color="#34d399" /></div>
              <h3 className="dp-feature-title">Agentic AI Execution</h3>
              <p className="dp-feature-desc">Our Gemini Flash agent reads any problem statement and instantly synthesizes language-specific boilerplate and a comprehensive suite of hidden test cases — including edge cases that standard solutions miss.</p>
              <ul className="dp2-feature-bullets">
                <li><CheckCircle size={13} /> Auto-generated starter templates</li>
                <li><CheckCircle size={13} /> Dynamic hidden test case synthesis</li>
                <li><CheckCircle size={13} /> Streaming SSE submission engine</li>
                <li><CheckCircle size={13} /> Stop-on-fail execution optimization</li>
              </ul>
            </div>

            <div className="dp-feature-card dp2-feature-card">
              <div className="dp-icon-wrapper"><Brain size={30} color="#f472b6" /></div>
              <h3 className="dp-feature-title">ML Cognitive Profiling</h3>
              <p className="dp-feature-desc">Forget generic "Blind 75" sheets. Our ML engine analyzes your full submission history to build a real-time Readiness Gauge, score your topic strengths and weaknesses, and route you to exactly the right problem next.</p>
              <ul className="dp2-feature-bullets">
                <li><CheckCircle size={13} /> Interview Readiness Gauge</li>
                <li><CheckCircle size={13} /> Topic strength/weakness scoring</li>
                <li><CheckCircle size={13} /> Confidence-scored recommendations</li>
                <li><CheckCircle size={13} /> Growth trajectory chart</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── ML recommendation preview ── */}
        <section className="dp2-ml-section" aria-labelledby="dp2-ml-heading">
          <div className="dp-section-header">
            <h2 id="dp2-ml-heading" className="dp-section-title">Your Personalized ML Learning Path</h2>
            <p className="dp-section-sub">Stop guessing what to study. The engine tells you — with a reason and a confidence score for every pick.</p>
          </div>

          <div className="dp2-ml-layout">
            {/* readiness gauge mock */}
            <div className="dp2-gauge-card">
              <div className="dp2-gauge-title">Interview Readiness</div>
              <div className="dp2-gauge-ring">
                <svg viewBox="0 0 120 120" width="120" height="120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#a5b4fc" strokeWidth="10"
                    strokeDasharray={`${0.74 * 314} ${314}`} strokeLinecap="round"
                    transform="rotate(-90 60 60)" />
                </svg>
                <div className="dp2-gauge-pct">74%</div>
              </div>
              <div className="dp2-gauge-status">Making Progress</div>
              <div className="dp2-topic-bars">
                {[
                  { topic: 'Arrays', pct: 88, color: '#34d399' },
                  { topic: 'Dynamic Programming', pct: 42, color: '#f59e0b' },
                  { topic: 'Graphs', pct: 31, color: '#f43f5e' },
                  { topic: 'Trees', pct: 67, color: '#a5b4fc' },
                ].map(({ topic, pct, color }) => (
                  <div key={topic} className="dp2-topic-bar-row">
                    <span className="dp2-topic-name">{topic}</span>
                    <div className="dp2-topic-bar-track">
                      <div className="dp2-topic-bar-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="dp2-topic-pct" style={{ color }}>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* recommendation cards */}
            <div className="dp2-recs">
              <div className="dp2-recs-label"><Sparkles size={14} color="#a5b4fc" /> AI Picks for You</div>
              {[
                { title: "Word Break", diff: "Medium", topic: "Dynamic Programming", match: 96, reason: "Targets DP — your #1 identified weakness from last 12 submissions." },
                { title: "Number of Islands", diff: "Medium", topic: "Graphs", match: 91, reason: "Reinforces BFS/DFS pattern. You've solved 3 similar but avoided grid traversal." },
                { title: "Kth Largest Element in Array", diff: "Medium", topic: "Heap", match: 87, reason: "Bridges your Array strength into Heap concepts — high leverage problem." },
              ].map(({ title, diff, topic, match, reason }) => (
                <div key={title} className="dp2-rec-card">
                  <div className="dp2-rec-top">
                    <div>
                      <div className="dp2-rec-title">{title}</div>
                      <div className="dp2-rec-meta"><Diff level={diff} /><span className="dp2-rec-topic">{topic}</span></div>
                    </div>
                    <div className="dp2-match-score" style={{ '--match': match }}>{match}%<span>match</span></div>
                  </div>
                  <div className="dp2-rec-reason"><Brain size={12} color="#f472b6" />{reason}</div>
                  <button className="dp2-solve-btn" onClick={handleCTA}>Solve <ArrowRight size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Problem list preview ── */}
        <section className="dp2-problems-section" aria-labelledby="dp2-problems-heading">
          <div className="dp-section-header">
            <h2 id="dp2-problems-heading" className="dp-section-title">1,824 Curated Problems. Every Track Covered.</h2>
            <p className="dp-section-sub">Filter by topic, company, and difficulty. Build custom lists. Track streaks. Sync LeetCode.</p>
          </div>

          {/* filters mock */}
          <div className="dp2-filters-bar">
            <div className="dp2-filter-chip active"><SlidersHorizontal size={13} />All Difficulties</div>
            <div className="dp2-filter-chip"><span className="dp2-diff" style={{ color: '#10b981', background: '#10b98118' }}>Easy</span></div>
            <div className="dp2-filter-chip"><span className="dp2-diff" style={{ color: '#f59e0b', background: '#f59e0b18' }}>Medium</span></div>
            <div className="dp2-filter-chip"><span className="dp2-diff" style={{ color: '#f43f5e', background: '#f43f5e18' }}>Hard</span></div>
            <div className="dp2-filter-chip"><GitBranch size={13} /> Topic</div>
            <div className="dp2-filter-chip"><Cpu size={13} /> Company</div>
          </div>

          <div className="dp2-problem-table">
            <div className="dp2-table-header">
              <span>#</span><span>Title</span><span>Topic</span><span>Acceptance</span><span>Difficulty</span>
            </div>
            {problems.map(({ title, diff, topic, acceptance }, i) => (
              <div key={title} className="dp2-table-row" onClick={handleCTA}>
                <span className="dp2-row-num">{i + 1}</span>
                <span className="dp2-row-title">{title}</span>
                <span className="dp2-row-topic">{topic}</span>
                <span className="dp2-row-accept">{acceptance}</span>
                <Diff level={diff} />
              </div>
            ))}
            <div className="dp2-table-more" onClick={handleCTA}>
              View all 1,824 problems <ArrowRight size={14} />
            </div>
          </div>
        </section>

        {/* ── Topic tracks ── */}
        <section className="dp2-topics-section" aria-labelledby="dp2-topics-heading">
          <div className="dp-section-header">
            <h2 id="dp2-topics-heading" className="dp-section-title">16 Topic Tracks, 8 Company Filters</h2>
            <p className="dp-section-sub">Master every pattern that shows up in real interviews — organized exactly how interviewers think.</p>
          </div>
          <div className="dp2-topics-grid">
            {topics.map((t, i) => (
              <div key={t} className="dp2-topic-chip" style={{ '--idx': i }}>
                <Code2 size={13} color="#a5b4fc" />{t}
              </div>
            ))}
          </div>
          <div className="dp2-companies-row">
            {companies.map(c => (
              <div key={c} className="dp2-company-chip">{c}</div>
            ))}
          </div>
        </section>

        {/* ── Feature pipeline ── */}
        <section className="dp2-pipeline-section" aria-labelledby="dp2-pipeline-heading">
          <div className="dp-section-header">
            <h2 id="dp2-pipeline-heading" className="dp-section-title">How the Practice Loop Works</h2>
            <p className="dp-section-sub">Every session is smarter than the last — because the AI is watching and adapting.</p>
          </div>
          <div className="dp2-pipeline">
            {[
              { num: '01', icon: BookOpen, color: '#a5b4fc', title: 'Browse & Filter', desc: 'Search 1,824 problems by topic, difficulty, or company. AI-curated picks appear at the top based on your profile.' },
              { num: '02', icon: Zap, color: '#34d399', title: 'AI Generates Boilerplate', desc: 'Select a problem and language. Gemini Flash instantly synthesizes the optimal class structure and starter code — no blank page paralysis.' },
              { num: '03', icon: Play, color: '#f472b6', title: 'Write, Run, Submit', desc: 'Code in the Monaco editor. Run against example cases instantly. Submit to trigger our SSE engine across all hidden test cases in real time.' },
              { num: '04', icon: Brain, color: '#fbbf24', title: 'ML Updates Your Profile', desc: 'Every submission — pass or fail — feeds the ML engine. Your Readiness Gauge updates, weak topics are flagged, and tomorrow\'s recommendations sharpen.' },
            ].map(({ num, icon: Icon, color, title, desc }) => (
              <div key={num} className="dp2-pipeline-step">
                <div className="dp2-pipeline-num" style={{ color }}>{num}</div>
                <div className="dp2-pipeline-icon" style={{ '--pc': color }}><Icon size={22} color={color} /></div>
                <div>
                  <div className="dp2-pipeline-title">{title}</div>
                  <p className="dp2-pipeline-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Trust / extras ── */}
        <section className="dp2-trust-section" aria-label="Trust Signals">
          <div className="dp2-trust-grid">
            <div className="dp2-trust-item"><Activity size={18} color="#a5b4fc" /><span>GitHub-style Activity Heatmap</span></div>
            <div className="dp2-trust-item"><List size={18} color="#34d399" /><span>Custom Problem Lists & Bookmarks</span></div>
            <div className="dp2-trust-item"><GitBranch size={18} color="#f472b6" /><span>LeetCode Sync Bridge</span></div>
            <div className="dp2-trust-item"><Clock size={18} color="#fbbf24" /><span>Session Timer for Timed Practice</span></div>
            <div className="dp2-trust-item"><Shield size={18} color="#60a5fa" /><span>Submission History & Code Review</span></div>
            <div className="dp2-trust-item"><Flame size={18} color="#fb923c" /><span>Streak Tracking & Milestones</span></div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="dp2-faq-section" aria-labelledby="dp2-faq-heading">
          <div className="dp-section-header">
            <h2 id="dp2-faq-heading" className="dp-section-title">Frequently Asked Questions</h2>
          </div>
          <div className="dp2-faq-list">
            {faqs.map(f => <FaqItem key={f.q} {...f} />)}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="dp-cta-banner dp2-cta-banner">
          <div className="dp2-cta-orb" aria-hidden="true" />
          <div className="dp-cta-box dp2-cta-box">
            <div className="dp2-cta-icon"><Terminal size={44} color="#818cf8" /></div>
            <h2 className="dp-section-title" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', marginBottom: '1rem' }}>
              Ready to crush your interviews?
            </h2>
            <p className="dp-section-sub" style={{ color: 'rgba(255,255,255,0.6)', margin: '0 auto 2rem' }}>
              Stop memorizing solutions. Start understanding patterns — with intelligent tooling and a personalized ML roadmap that evolves with every submission.
            </p>
            <button className="btn-primary dp2-cta-main" onClick={handleCTA}>
              Initialize Practice Engine &nbsp;<ArrowRight size={20} />
            </button>
            <div className="dp2-cta-footnote">
              <Star size={13} fill="#fbbf24" color="#fbbf24" /> Free forever for students &nbsp;·&nbsp;
              <Lock size={12} /> No credit card &nbsp;·&nbsp;
              <Zap size={12} color="#34d399" /> Live in 30 seconds
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default DSAPracticePreview;