import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, ArrowLeft, ChevronRight, Bookmark, Moon, Sun, Monitor, Type, Layout, List } from 'lucide-react';
import { Helmet } from 'react-helmet';

// Navigation structure for the System Design series
const bookChapters = [
  { id: 'chapter1', title: 'Chapter 1: Single Server Setup' },
  { id: 'chapter2', title: 'Chapter 2: Back-of-the-envelope Estimation' },
  { id: 'chapter3', title: 'Chapter 3: System Design Interview Framework' },
  { id: 'chapter4', title: 'Chapter 4: Design a Rate Limiter' },
  { id: 'chapter5', title: 'Chapter 5: Design Consistent Hashing' },
  { id: 'chapter6', title: 'Chapter 6: Design a Key-Value Store' },
  { id: 'chapter7', title: 'Chapter 7: Design a Unique ID Generator' },
  { id: 'chapter8', title: 'Chapter 8: Design a URL Shortener' },
  { id: 'chapter9', title: 'Chapter 9: Design a Web Crawler' },
  { id: 'chapter10', title: 'Chapter 10: Design a Notification System' },
  { id: 'chapter11', title: 'Chapter 11: Design a News Feed System' },
  { id: 'chapter12', title: 'Chapter 12: Design a Chat System' },
  { id: 'chapter13', title: 'Chapter 13: Design a Search Autocomplete System' },
  { id: 'chapter14', title: 'Chapter 14: Design YouTube' },
  { id: 'chapter15', title: 'Chapter 15: Design Google Drive' },
  { id: 'chapter16', title: 'Chapter 16: The Learning Continues' },
];

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&family=Georgia:wght@400;700&display=swap');

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

:root {
  /* Premium Dark Mode - Deep & Sophisticated */
  --bg-primary: #08080a;
  --bg-secondary: rgba(13, 13, 17, 0.7);
  --bg-nav: rgba(8, 8, 10, 0.8);
  --text-main: #e2e2e7;
  --text-muted: #94a3b8;
  --text-header: #ffffff;
  --accent: #3b82f6;
  --accent-glow: rgba(59, 130, 246, 0.3);
  --accent-hover: rgba(59, 130, 246, 0.1);
  --border-color: rgba(255, 255, 255, 0.06);
  --hover-bg: rgba(255, 255, 255, 0.04);
  --image-bg: rgba(255, 255, 255, 0.01);
  --sidebar-width: 340px;
  --reader-max-width: 1000px;
  --card-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.theme-light {
  --bg-primary: #f8fafc;
  --bg-secondary: rgba(255, 255, 255, 0.7);
  --bg-nav: rgba(248, 250, 252, 0.8);
  --text-main: #334155;
  --text-muted: #64748b;
  --text-header: #0f172a;
  --accent: #2563eb;
  --accent-glow: rgba(37, 99, 235, 0.2);
  --accent-hover: rgba(37, 99, 235, 0.06);
  --border-color: rgba(0, 0, 0, 0.06);
  --hover-bg: rgba(0, 0, 0, 0.03);
  --image-bg: rgba(0, 0, 0, 0.005);
  --card-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}

.theme-sepia {
  --bg-primary: #f4ecd8;
  --bg-secondary: rgba(235, 225, 200, 0.7);
  --bg-nav: rgba(244, 236, 216, 0.8);
  --text-main: #433422;
  --text-muted: #5c4e3c;
  --text-header: #2e2111;
  --accent: #b45309;
  --accent-glow: rgba(180, 83, 9, 0.2);
  --accent-hover: rgba(180, 83, 9, 0.06);
  --border-color: rgba(67, 52, 34, 0.08);
  --hover-bg: rgba(67, 52, 34, 0.03);
  --image-bg: rgba(67, 52, 34, 0.01);
}

.reader-body {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-main);
  transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  scroll-behavior: smooth;
}

.reader-container {
  display: flex;
  max-width: 1600px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
  position: relative;
  transition: all 0.3s;
}

/* Sidebar Navigation */
.reader-sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-color);
  padding: 2.5rem 1.5rem;
  overflow-y: auto;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 40;
}

.reader-sidebar::-webkit-scrollbar {
  width: 4px;
}

.reader-sidebar::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}

.reader-sidebar.collapsed {
  width: 0;
  padding: 0;
  border-right: none;
  opacity: 0;
  pointer-events: none;
}

.sidebar-header {
  font-family: 'Outfit', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.chapter-link {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-radius: 14px;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  margin-bottom: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.chapter-number {
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  opacity: 0.5;
  min-width: 20px;
}

.chapter-link:hover {
  background: var(--hover-bg);
  color: var(--text-main);
  transform: translateX(4px);
}

.chapter-link.active {
  background: var(--accent-hover);
  color: var(--accent);
  border-color: var(--accent-hover);
  box-shadow: inset 0 0 20px var(--accent-hover);
}

.chapter-link.active .chapter-number {
  opacity: 1;
  color: var(--accent);
}

.chapter-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 25%;
  height: 50%;
  width: 4px;
  background: var(--accent);
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 15px var(--accent);
}

.sidebar-close-btn {
  display: none;
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
}

/* Main Content Area */
.reader-content {
  flex: 1;
  padding: 3rem 4rem;
  max-width: var(--reader-max-width);
  margin: 0 auto;
  animation: fadeIn 0.6s ease-out both;
  transition: max-width 0.3s, padding 0.3s;
}

.reader-nav-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 2rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.reader-paragraph {
  font-family: 'Georgia', serif;
  font-size: 1.2rem;
  line-height: 1.9;
  color: var(--text-main);
  margin-bottom: 1.8rem;
  transition: color 0.3s;
  opacity: 0.9;
}

.reader-header {
  font-family: 'Outfit', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-header);
  margin: 4rem 0 1.8rem 0;
  letter-spacing: -0.03em;
  transition: color 0.3s;
  line-height: 1.3;
}

.reader-title {
  font-family: 'Outfit', sans-serif;
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--text-header);
  margin-bottom: 2.5rem;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.reader-image-container {
  margin: 3rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--image-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  transition: background 0.3s, border-color 0.3s;
  content-visibility: auto;
  contain-intrinsic-size: auto 300px;
}

.reader-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
}

.reader-caption {
  margin-top: 1.5rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: var(--accent);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.bullet-point {
  display: flex;
  gap: 12px;
  margin-bottom: 1rem;
  font-family: 'Georgia', serif;
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--text-muted);
}

.bullet-dot {
  color: var(--accent);
  margin-top: 5px;
}

/* Modal and Toggles */
.theme-menu {
  position: absolute;
  top: 50px;
  right: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  z-index: 200;
  min-width: 150px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  color: var(--text-main);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
}

.theme-option:hover, .theme-option.active {
  background: var(--hover-bg);
}

/* Mobile Toggles & Overlays */
.mobile-sidebar-toggle {
  display: none;
  background: var(--hover-bg);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  align-items: center;
  gap: 8px;
  margin-bottom: 2rem;
}

.desktop-nav-links {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 28px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 8px 24px;
  border-radius: 99px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.05);
}

.nav-link {
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--text-header);
}

.nav-link.active {
  color: var(--accent);
  font-weight: 600;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 1024px) {
  .reader-sidebar {
    position: fixed;
    transform: translateX(-100%);
    opacity: 1 !important; /* Mobile overrides desktop collapse */
    width: 320px !important;
  }
  
  .reader-sidebar.open {
    transform: translateX(0);
    pointer-events: all;
  }

  .mobile-sidebar-toggle {
    display: flex;
  }

  .desktop-nav-links {
    display: none;
  }
  
  .sidebar-overlay.open {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    z-index: 30;
  }
  
  .reader-content {
    padding: 2rem;
  }
}

  .sidebar-header {
    justify-content: space-between;
  }

  .sidebar-close-btn {
    display: flex;
  }
}
`;



export default function SystemDesignBookChapter() {
  const { topicname } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [theme, setTheme] = useState('dark');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentChapterInfo = bookChapters.find(c => c.id === topicname) || { title: `System Design - ${topicname}` };
  const currentIndex = bookChapters.findIndex(c => c.id === topicname);
  const nextChapter = currentIndex !== -1 && currentIndex < bookChapters.length - 1 ? bookChapters[currentIndex + 1] : null;

  // --- FIX 1: Static JSON fetch vs. dynamic JS import ---
  // Files live in /public — Vite never touches them, no bundling overhead.
  // fetch() + JSON.parse() runs in native C++ (3-10x faster than JS eval).
  useEffect(() => {
    setIsLoading(true);
    setBlocks([]);
    window.scrollTo(0, 0);
    fetch(`/books/systemdesign/data/${topicname}.json`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => {
        setBlocks(data);
        setIsLoading(false);
      })
      .catch(() => {
        setBlocks([]);
        setIsLoading(false);
      });
  }, [topicname]);

  // Handle Reading Progress Bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- FIX 2: Memoized Rendering ---
  // Prevents the entire 2500+ block tree from re-rendering on every
  // scroll event (readingProgress), theme change, or sidebar toggle.
  const renderedContent = useMemo(() => {
    return blocks.map((block, idx) => {
      switch (block.type) {
        case 'header':
          return (
            <h2 key={`head-${idx}`} className="reader-header">
              {block.text}
            </h2>
          );
        case 'paragraph':
          return (
            <p key={`p-${idx}`} className="reader-paragraph">
              {block.text}
            </p>
          );
        case 'bullet':
          return (
            <div key={`bullet-${idx}`} className="bullet-point">
              <span className="bullet-dot">•</span>
              <span>{block.text.replace(/^[•\d]+\.?\s*/, '').trim()}</span>
            </div>
          );
        case 'image':
          // --- FIX 3: Native lazy loading + decoding=async + aspect-ratio ---
          // loading="lazy" defers network fetch. decoding="async" prevents
          // image decompression from blocking the main thread. The fixed
          // aspect-ratio eliminates CLS by reserving accurate layout space.
          return (
            <div key={`img-${idx}`} className="reader-image-container">
              <img
                src={block.src}
                alt={block.caption}
                className="reader-image"
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'contain', display: 'block', borderRadius: '8px' }}
              />
              <span className="reader-caption">{block.caption}</span>
            </div>
          );
        default:
          return null;
      }
    });
  }, [blocks]);

  return (
    <div className={`reader-body ${theme === 'dark' ? '' : 'theme-' + theme}`}>
      <Helmet>
        <title>{currentChapterInfo.title} | Whizan AI</title>
        <meta name="description" content={`Read ${currentChapterInfo.title} of the System Design Interview guide.`} />
        <link rel="canonical" href={`https://whizan.xyz/books/systemdesign/${topicname}`} />
      </Helmet>
      <style>{styles}</style>

      {/* Progress Bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--hover-bg)', zIndex: 1000 }}>
        <div style={{ height: '100%', width: `${readingProgress}%`, background: 'linear-gradient(90deg, #3b82f6, #a855f7)', transition: 'width 0.1s' }} />
      </div>

      {/* Top Navbar */}
      <nav style={{
        height: '64px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem',
        background: 'var(--bg-nav)', backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', zIndex: 10 }} onClick={() => navigate('/dashboard')}>
          <img src="/logo.jpeg" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-header)' }}>Whizan AI</span>
        </div>

        {/* Center: Dynamic Links */}
        <div className="desktop-nav-links" style={{ zIndex: 1 }}>
          <span className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span className="nav-link" onClick={() => navigate('/systemdesign')}>System Design</span>
          <span className="nav-link" onClick={() => navigate('/companyinterviewselect')}>Company Hub</span>
          <span className="nav-link" onClick={() => navigate('/solvingpage')}>Coding</span>
          <span className="nav-link active">Reading Mode</span>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 10 }}>
          <button 
            onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
            style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            title="Toggle Sidebar"
          >
            {desktopSidebarOpen ? <X size={16} /> : <Menu size={16} />}
            <span className="hidden sm:inline">Index</span>
          </button>

          <button 
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Type size={16} />
            <span className="hidden sm:inline">Theme</span>
          </button>
          
          {themeMenuOpen && (
            <div className="theme-menu">
              <button className={`theme-option ${theme === 'dark' ? 'active' : ''}`} onClick={() => {setTheme('dark'); setThemeMenuOpen(false);}}>
                <Moon size={14} /> Dark Mode
              </button>
              <button className={`theme-option ${theme === 'light' ? 'active' : ''}`} onClick={() => {setTheme('light'); setThemeMenuOpen(false);}}>
                <Sun size={14} /> Light Mode
              </button>
              <button className={`theme-option ${theme === 'sepia' ? 'active' : ''}`} onClick={() => {setTheme('sepia'); setThemeMenuOpen(false);}}>
                <BookOpen size={14} /> Sepia Mode
              </button>
            </div>
          )}

          <button style={{ background: 'var(--accent)', border: 'none', borderRadius: '8px', padding: '8px 16px', color: '#fff', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bookmark size={16} /> <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </nav>

      <div className="reader-container">
        
        {/* Mobile Sidebar Overlay */}
        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
        
        {/* Sidebar Navigation */}
        <aside className={`reader-sidebar ${sidebarOpen ? 'open' : ''} ${!desktopSidebarOpen ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <List size={16} color="var(--accent)" />
              <span>Table of Contents</span>
            </div>
            {sidebarOpen && (
              <button 
                className="sidebar-close-btn"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {bookChapters.map((chapter, index) => (
              <button
                key={chapter.id}
                className={`chapter-link ${topicname === chapter.id ? 'active' : ''}`}
                onClick={() => {
                  navigate(`/books/systemdesign/${chapter.id}`);
                  setSidebarOpen(false);
                }}
              >
                <span className="chapter-number">{(index + 1).toString().padStart(2, '0')}</span>
                <span style={{flex: 1, textAlign: 'left'}}>{chapter.title.split(': ')[1] || chapter.title}</span>
                {topicname === chapter.id && <ChevronRight size={16} />}
              </button>
            ))}
          </div>
        </aside>

        {/* Reader Action Content */}
        <main className="reader-content">
          <button 
            className="mobile-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} /> Menu
          </button>

          <div className="reader-nav-top">
            <span style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => navigate('/dashboard')}>Dashboard</span>
            <ChevronRight size={14} />
            <span>Books</span>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--text-header)' }}>{currentChapterInfo.title}</span>
          </div>
          
          <div className="reading-area">
             {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', opacity: 0.7 }}>
                   <div style={{ width: 48, height: 48, border: '3px solid var(--border-color)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }} />
                   <p className="reader-paragraph">Loading chapter...</p>
                </div>
             ) : blocks.length > 0 ? (
                renderedContent
             ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', opacity: 0.7 }}>
                   <BookOpen size={64} style={{ marginBottom: '1rem', color: '#3b82f6' }} />
                   <h2 className="reader-header" style={{ marginTop: 0 }}>Content Coming Soon</h2>
                   <p className="reader-paragraph text-center">This chapter has not been digitized yet. Check back later.</p>
                </div>
             )}
          </div>
          
          {/* Bottom Navigation */}
          {blocks.length > 0 && (
            <div style={{ marginTop: '5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
               <button onClick={() => window.scrollTo(0, 0)} style={{ background: 'var(--hover-bg)', color: 'var(--text-main)', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s', fontWeight: 500 }}>
                 Back to Top
               </button>
               {nextChapter && (
                 <button onClick={() => navigate(`/books/systemdesign/${nextChapter.id}`)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                   Next Chapter <ArrowLeft size={18} transform="rotate(180)" />
                 </button>
               )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
