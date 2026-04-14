import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, ArrowLeft, ChevronRight, Bookmark, Moon, Sun, Type, List } from 'lucide-react';
import { Helmet } from 'react-helmet';

// ── Part 1: The Fundamentals of Machine Learning ────────────────────────────
const mlChapters = [
  { id: 'mlchapter1', title: 'Chapter 1: The Machine Learning Landscape', part: 1 },
  { id: 'mlchapter2', title: 'Chapter 2: End-to-End Machine Learning Project', part: 1 },
  { id: 'mlchapter3', title: 'Chapter 3: Classification', part: 1 },
  { id: 'mlchapter4', title: 'Chapter 4: Training Models', part: 1 },
  { id: 'mlchapter5', title: 'Chapter 5: Support Vector Machines', part: 1 },
  { id: 'mlchapter6', title: 'Chapter 6: Decision Trees', part: 1 },
  { id: 'mlchapter7', title: 'Chapter 7: Ensemble Learning and Random Forests', part: 1 },
  { id: 'mlchapter8', title: 'Chapter 8: Dimensionality Reduction', part: 1 },
  { id: 'mlchapter9', title: 'Chapter 9: Up and Running with TensorFlow', part: 2 },
  { id: 'mlchapter10', title: 'Chapter 10: Introduction to Artificial Neural Networks', part: 2 },
  { id: 'mlchapter11', title: 'Chapter 11: Training Deep Neural Nets', part: 2 },
  { id: 'mlchapter12', title: 'Chapter 12: Distributing TensorFlow Across', part: 2 },
  { id: 'mlchapter13', title: 'Chapter 13: Convolutional Neural Networks', part: 2 },
  { id: 'mlchapter14', title: 'Chapter 14: Recurrent Neural Networks', part: 2 },
  { id: 'mlchapter15', title: 'Chapter 15: Autoencoders', part: 2 },
  { id: 'mlchapter16', title: 'Chapter 16: Reinforcement Learning', part: 2 },
];


const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&family=Georgia:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap');

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ─── Themes ─────────────────────────────────────────── */
:root {
  --bg-primary:   #f8fafc;
  --bg-secondary: rgba(255,255,255,0.75);
  --bg-nav:       rgba(248,250,252,0.85);
  --text-main:    #334155;
  --text-muted:   #64748b;
  --text-header:  #0f172a;
  --accent:       #7c3aed;
  --accent-glow:  rgba(124,58,237,0.18);
  --accent-hover: rgba(124,58,237,0.08);
  --border-color: rgba(0,0,0,0.07);
  --hover-bg:     rgba(0,0,0,0.03);
  --image-bg:     rgba(0,0,0,0.005);
  --code-bg:      #1e1e2e;
  --sidebar-width:340px;
  --reader-max:   960px;
}
.theme-dark {
  --bg-primary:   #08080a;
  --bg-secondary: rgba(13,13,17,0.7);
  --bg-nav:       rgba(8,8,10,0.85);
  --text-main:    #e2e2e7;
  --text-muted:   #94a3b8;
  --text-header:  #ffffff;
  --accent:       #a78bfa;
  --accent-glow:  rgba(167,139,250,0.25);
  --accent-hover: rgba(167,139,250,0.1);
  --border-color: rgba(255,255,255,0.06);
  --hover-bg:     rgba(255,255,255,0.04);
  --image-bg:     rgba(255,255,255,0.01);
}
.theme-sepia {
  --bg-primary:   #f4ecd8;
  --bg-secondary: rgba(235,225,200,0.7);
  --bg-nav:       rgba(244,236,216,0.85);
  --text-main:    #433422;
  --text-muted:   #5c4e3c;
  --text-header:  #2e2111;
  --accent:       #92400e;
  --accent-glow:  rgba(146,64,14,0.2);
  --accent-hover: rgba(146,64,14,0.07);
  --border-color: rgba(67,52,34,0.08);
  --hover-bg:     rgba(67,52,34,0.03);
  --image-bg:     rgba(67,52,34,0.01);
}

/* ─── Base ───────────────────────────────────────────── */
.ml-body {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-main);
  transition: background 0.3s, color 0.3s;
  scroll-behavior: smooth;
}
.ml-container {
  display: flex;
  max-width: 1600px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
}

/* ─── Sidebar ────────────────────────────────────────── */
.ml-sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-color);
  padding: 2rem 1.25rem;
  overflow-y: auto;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  transition: all 0.45s cubic-bezier(0.4,0,0.2,1);
  z-index: 40;
}
.ml-sidebar::-webkit-scrollbar { width: 4px; }
.ml-sidebar::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
.ml-sidebar.collapsed { width:0; padding:0; border-right:none; opacity:0; pointer-events:none; }

.sidebar-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 10px 14px 4px;
  opacity: 0.6;
}

.ml-chapter-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid transparent;
  margin-bottom: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  text-align: left;
  width: 100%;
  position: relative;
}
.ml-chapter-link:hover { background: var(--hover-bg); color: var(--text-main); transform: translateX(4px); }
.ml-chapter-link.active {
  background: var(--accent-hover);
  color: var(--accent);
  border-color: var(--accent-glow);
}
.ml-chapter-link.active::before {
  content: '';
  position: absolute;
  left: 0; top: 25%; height: 50%; width: 3px;
  background: var(--accent);
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 12px var(--accent);
}
.chap-num {
  font-size: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  opacity: 0.5;
  min-width: 22px;
}
.ml-chapter-link.active .chap-num { opacity: 1; color: var(--accent); }

/* ─── Main Content ───────────────────────────────────── */
.ml-content {
  flex: 1;
  padding: 3rem 4.5rem;
  max-width: var(--reader-max);
  margin: 0 auto;
  animation: fadeIn 0.5s ease-out both;
}
.ml-breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}
.ml-header { font-family:'Outfit',sans-serif; font-size:1.9rem; font-weight:700; color:var(--text-header); margin:3.5rem 0 1.5rem; line-height:1.3; letter-spacing:-0.02em; }
.ml-paragraph { font-family:'Georgia',serif; font-size:1.15rem; line-height:1.9; color:var(--text-main); margin-bottom:1.6rem; opacity:0.92; }
.ml-bullet { display:flex; gap:12px; margin-bottom:0.9rem; font-family:'Georgia',serif; font-size:1.1rem; line-height:1.8; color:var(--text-muted); }
.ml-bullet-dot { color:var(--accent); flex-shrink:0; margin-top:4px; }
.ml-code {
  font-family:'JetBrains Mono',monospace;
  background: var(--code-bg);
  border-radius:12px;
  padding:1.5rem;
  margin:2rem 0;
  border:1px solid var(--border-color);
  color:#cdd6f4;
  overflow-x:auto;
  font-size:0.88rem;
  line-height:1.65;
  position:relative;
}
.ml-code::before {
  content:'CODE';
  position:absolute; top:0; right:1.25rem;
  font-size:0.65rem; color:var(--accent);
  padding:3px 8px;
  background:var(--accent-hover);
  border-radius:0 0 6px 6px;
  font-weight:700; letter-spacing:0.08em;
}
.ml-img-wrap {
  margin:3rem 0;
  background:var(--image-bg);
  border:1px solid var(--border-color);
  border-radius:16px;
  padding:1.75rem;
  display:flex; flex-direction:column; align-items:center;
}
.ml-img-wrap img { max-width:100%; border-radius:8px; box-shadow:0 8px 30px rgba(0,0,0,0.15); }
.ml-img-caption { margin-top:1.25rem; font-size:0.85rem; color:var(--accent); font-weight:600; letter-spacing:0.4px; }

/* ─── Navbar pieces ──────────────────────────────────── */
.ml-nav-center {
  position:absolute; left:50%; transform:translateX(-50%);
  display:flex; align-items:center; gap:24px;
  background:var(--bg-secondary); border:1px solid var(--border-color);
  padding:7px 22px; border-radius:99px; backdrop-filter:blur(20px);
}
.ml-nav-link { color:var(--text-muted); font-size:0.9rem; font-weight:500; cursor:pointer; transition:color 0.2s; }
.ml-nav-link:hover { color:var(--text-header); }
.ml-nav-link.active { color:var(--accent); font-weight:600; }

.ml-sidebar-overlay { display:none; }
.ml-mobile-toggle {
  display:none; background:var(--hover-bg); border:1px solid var(--border-color);
  color:var(--text-main); padding:8px 12px; border-radius:8px; cursor:pointer;
  align-items:center; gap:8px; margin-bottom:1.75rem;
}
.theme-menu {
  position:absolute; top:52px; right:24px;
  background:var(--bg-secondary); border:1px solid var(--border-color);
  backdrop-filter:blur(20px); border-radius:12px; padding:8px;
  display:flex; flex-direction:column; gap:3px;
  box-shadow:0 10px 40px rgba(0,0,0,0.15); z-index:200; min-width:148px;
}
.theme-opt { display:flex; align-items:center; gap:8px; padding:9px 12px; background:transparent; border:none; color:var(--text-main); border-radius:8px; cursor:pointer; text-align:left; transition:background 0.2s; font-size:0.9rem; }
.theme-opt:hover,.theme-opt.on { background:var(--hover-bg); }
.ml-sidebar-close { display:none; background:var(--hover-bg); border:1px solid var(--border-color); color:var(--text-main); padding:6px; border-radius:7px; cursor:pointer; }

/* ─── Responsive ─────────────────────────────────────── */
@media (max-width:1024px) {
  .ml-sidebar {
    position:fixed; transform:translateX(-100%);
    opacity:1 !important; width:300px !important;
  }
  .ml-sidebar.open { transform:translateX(0); pointer-events:all; }
  .ml-mobile-toggle { display:flex; }
  .ml-nav-center { display:none; }
  .ml-sidebar-overlay.open {
    display:block; position:fixed; inset:0;
    background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); z-index:30;
  }
  .ml-content { padding:2rem; }
  .ml-sidebar-close { display:flex; }
}
@media (max-width:768px) {
  .ml-content { padding:1.5rem 1rem; }
  .ml-header { font-size:1.45rem; margin:2.5rem 0 1.2rem; }
  .ml-paragraph { font-size:1.05rem; line-height:1.75; }
  .ml-img-wrap { padding:1rem; margin:2rem 0; }
  .ml-bullet { font-size:1.05rem; }
}
@media (max-width:480px) {
  .ml-content { padding:1rem 0.8rem; }
  .ml-header { font-size:1.3rem; }
  .ml-paragraph { font-size:1rem; }
}
`;

export default function MLBookChapter() {
  const { topicname } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [theme, setTheme] = useState('light');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentInfo = mlChapters.find(c => c.id === topicname) || { title: `ML - ${topicname}` };
  const currentIndex = mlChapters.findIndex(c => c.id === topicname);
  const nextChapter = currentIndex !== -1 && currentIndex < mlChapters.length - 1 ? mlChapters[currentIndex + 1] : null;
  const prevChapter = currentIndex > 0 ? mlChapters[currentIndex - 1] : null;

  useEffect(() => {
    setIsLoading(true);
    setBlocks([]);
    window.scrollTo(0, 0);
    fetch(`/books/ml/data/${topicname}.json`)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(data => { setBlocks(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [topicname]);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const renderedContent = useMemo(() => blocks.map((block, i) => {
    switch (block.type) {
      case 'header':
        return <h2 key={i} className="ml-header">{block.text}</h2>;
      case 'paragraph':
        return <p key={i} className="ml-paragraph">{block.text}</p>;
      case 'bullet':
        return (
          <div key={i} className="ml-bullet">
            <span className="ml-bullet-dot">▸</span>
            <span>{block.text.replace(/^[•▸\-\d]+\.?\s*/, '').trim()}</span>
          </div>
        );
      case 'code':
        return <div key={i} className="ml-code"><pre><code>{block.text}</code></pre></div>;
      case 'image':
        return (
          <div key={i} className="ml-img-wrap">
            <img src={block.src} alt={block.caption} loading="lazy" decoding="async" />
            <span className="ml-img-caption">{block.caption}</span>
          </div>
        );
      default: return null;
    }
  }), [blocks]);

  const themeClass = theme === 'light' ? '' : `theme-${theme}`;

  return (
    <div className={`ml-body ${themeClass}`}>
      <Helmet>
        <title>{currentInfo.title} | Hands-On ML - Whizan AI</title>
        <meta name="description" content={`Learn Machine Learning with ${currentInfo.title} from Hands-On Machine Learning with Scikit-Learn and TensorFlow. Practical ML guide with Python.`} />
        <meta name="keywords" content="Machine Learning, Scikit-Learn, TensorFlow, Python, Deep Learning, ML Interview, Data Science" />
        <link rel="canonical" href={`https://whizan.xyz/books/ml/${topicname}`} />
        <meta property="og:title" content={`${currentInfo.title} - Hands-On ML`} />
        <meta property="og:description" content={`Master ML with ${currentInfo.title}. A practical guide from zero to production-ready models.`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://whizan.xyz/books/ml/${topicname}`} />
      </Helmet>
      <style>{styles}</style>

      {/* Progress bar */}
      <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'4px', background:'var(--border-color)', zIndex:1000 }}>
        <div style={{ height:'100%', width:`${readingProgress}%`, background:'linear-gradient(90deg,#7c3aed,#ec4899)', transition:'width 0.1s' }} />
      </div>

      {/* Navbar */}
      <nav style={{ height:'64px', borderBottom:'1px solid var(--border-color)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.5rem', background:'var(--bg-nav)', backdropFilter:'blur(16px)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', zIndex:10 }} onClick={() => navigate('/dashboard')}>
          <img src="/logo.jpeg" alt="Logo" style={{ width:'32px', height:'32px', borderRadius:'8px', objectFit:'cover' }} />
          <span style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--text-header)' }}>Whizan AI</span>
        </div>

        <div className="ml-nav-center" style={{ zIndex:1 }}>
          <span className="ml-nav-link" onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span className="ml-nav-link" onClick={() => navigate('/systemdesign')}>System Design</span>
          <span className="ml-nav-link" onClick={() => navigate('/companyinterviewselect')}>Company Hub</span>
          <span className="ml-nav-link" onClick={() => navigate('/solvingpage')}>Coding</span>
          <span className="ml-nav-link active">Reading</span>
        </div>

        <div style={{ display:'flex', gap:'12px', position:'relative', zIndex:10 }}>
          <button onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)} style={{ background:'transparent', border:'1px solid var(--border-color)', borderRadius:'8px', padding:'8px 12px', color:'var(--text-main)', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
            {desktopSidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <button onClick={() => setThemeMenuOpen(!themeMenuOpen)} style={{ background:'transparent', border:'1px solid var(--border-color)', borderRadius:'8px', padding:'8px 12px', color:'var(--text-main)', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
            <Type size={16} />
          </button>
          {themeMenuOpen && (
            <div className="theme-menu">
              <button className={`theme-opt ${theme==='light'?'on':''}`} onClick={() => { setTheme('light'); setThemeMenuOpen(false); }}><Sun size={14}/> Light</button>
              <button className={`theme-opt ${theme==='dark'?'on':''}`}  onClick={() => { setTheme('dark');  setThemeMenuOpen(false); }}><Moon size={14}/> Dark</button>
              <button className={`theme-opt ${theme==='sepia'?'on':''}`} onClick={() => { setTheme('sepia'); setThemeMenuOpen(false); }}><BookOpen size={14}/> Sepia</button>
            </div>
          )}
          <button style={{ background:'var(--accent)', border:'none', borderRadius:'8px', padding:'8px 14px', color:'#fff', fontSize:'0.9rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
            <Bookmark size={16} />
          </button>
        </div>
      </nav>

      <div className="ml-container">
        {/* Overlay */}
        <div className={`ml-sidebar-overlay ${sidebarOpen?'open':''}`} onClick={() => setSidebarOpen(false)} />

        {/* Sidebar */}
        <aside className={`ml-sidebar ${sidebarOpen?'open':''} ${!desktopSidebarOpen?'collapsed':''}`}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <List size={15} color="var(--accent)" />
              <span style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)' }}>Hands-On ML</span>
            </div>
            {sidebarOpen && (
              <button className="ml-sidebar-close" onClick={() => setSidebarOpen(false)}><X size={16}/></button>
            )}
          </div>

          <div className="sidebar-label">Part 1 · Fundamentals</div>
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1.5rem' }}>
            {mlChapters.filter(ch => ch.part === 1).map((ch, idx) => (
              <button key={ch.id} className={`ml-chapter-link ${topicname === ch.id ? 'active' : ''}`}
                onClick={() => { navigate(`/books/ml/${ch.id}`); setSidebarOpen(false); }}>
                <span className="chap-num">{String(idx + 1).padStart(2, '0')}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{ch.title.split(': ')[1] || ch.title}</span>
                {topicname === ch.id && <ChevronRight size={14} />}
              </button>
            ))}
          </div>

          <div className="sidebar-label">Part 2 · Neural Networks</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {mlChapters.filter(ch => ch.part === 2).map((ch, idx) => (
              <button key={ch.id} className={`ml-chapter-link ${topicname === ch.id ? 'active' : ''}`}
                onClick={() => { navigate(`/books/ml/${ch.id}`); setSidebarOpen(false); }}>
                <span className="chap-num">{String(idx + 9).padStart(2, '0')}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{ch.title.split(': ')[1] || ch.title}</span>
                {topicname === ch.id && <ChevronRight size={14} />}
              </button>
            ))}
          </div>

        </aside>

        {/* Main */}
        <main className="ml-content">
          <button className="ml-mobile-toggle" onClick={() => setSidebarOpen(true)}>
            <Menu size={18}/> Menu
          </button>

          <div className="ml-breadcrumb">
            <span style={{ cursor:'pointer', color:'var(--accent)' }} onClick={() => navigate('/dashboard')}>Dashboard</span>
            <ChevronRight size={13}/>
            <span>Books</span>
            <ChevronRight size={13}/>
            <span style={{ color:'var(--text-header)' }}>Hands-On ML</span>
            <ChevronRight size={13}/>
            <span style={{ color:'var(--text-header)', fontWeight:500 }}>{currentInfo.title.split(': ')[1] || currentInfo.title}</span>
          </div>

          <div className="reading-area">
            {isLoading ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'6rem 0', opacity:0.7 }}>
                <div style={{ width:46, height:46, border:'3px solid var(--border-color)', borderTop:'3px solid var(--accent)', borderRadius:'50%', animation:'spin 0.8s linear infinite', marginBottom:'1rem' }}/>
                <p className="ml-paragraph">Loading chapter…</p>
              </div>
            ) : blocks.length > 0 ? renderedContent : (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'4rem 0', opacity:0.7 }}>
                <BookOpen size={60} style={{ marginBottom:'1rem', color:'var(--accent)' }}/>
                <h2 className="ml-header" style={{ marginTop:0 }}>Content Coming Soon</h2>
                <p className="ml-paragraph">This chapter hasn't been digitised yet.</p>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          {blocks.length > 0 && (
            <div style={{ marginTop:'5rem', paddingTop:'2rem', borderTop:'1px solid var(--border-color)', display:'flex', gap:'1rem', flexWrap:'wrap' }}>
              {prevChapter ? (
                <button onClick={() => navigate(`/books/ml/${prevChapter.id}`)} style={{ flex:'1 1 auto', background:'var(--hover-bg)', color:'var(--text-main)', border:'1px solid var(--border-color)', padding:'12px 24px', borderRadius:'12px', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                  <ArrowLeft size={17}/> Previous
                </button>
              ) : (
                <button onClick={() => window.scrollTo(0,0)} style={{ flex:'1 1 auto', background:'var(--hover-bg)', color:'var(--text-main)', border:'none', padding:'12px 24px', borderRadius:'12px', cursor:'pointer', fontWeight:500, justifyContent:'center' }}>
                  Back to Top
                </button>
              )}
              {nextChapter && (
                <button onClick={() => navigate(`/books/ml/${nextChapter.id}`)} style={{ flex:'1 1 auto', background:'var(--accent)', color:'#fff', border:'none', padding:'12px 24px', borderRadius:'12px', cursor:'pointer', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                  Next Chapter <ArrowLeft size={17} transform="rotate(180)"/>
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
