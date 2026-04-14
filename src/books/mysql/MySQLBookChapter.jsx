import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, ArrowLeft, ChevronRight, Bookmark, Moon, Sun, Monitor, Type, Layout, List, Database } from 'lucide-react';
import { Helmet } from 'react-helmet';

// Consolidated navigation structure for MySQL Handbook (at most 5 pages)
const bookChapters = [
  { id: 'chapter1', title: 'MySQL Foundations & Setup' },
  { id: 'chapter2', title: 'Table Design & Data Modeling' },
  { id: 'chapter3', title: 'Data Manipulation Essentials' },
  { id: 'chapter4', title: 'Retrieval & Filtering (DQL)' },
  { id: 'chapter5', title: 'Advanced Queries & Integrity' },
];

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&family=Georgia:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap');

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

:root {
  /* MySQL Identity Theme - Database Blue & Deep Slate */
  --bg-primary: #0a0c10;
  --bg-secondary: rgba(16, 20, 24, 0.7);
  --bg-nav: rgba(10, 12, 16, 0.8);
  --text-main: #e2e8f0;
  --text-muted: #94a3b8;
  --text-header: #ffffff;
  --accent: #00758f; /* Official MySQL Blue shade */
  --accent-glow: rgba(0, 117, 143, 0.3);
  --accent-hover: rgba(0, 117, 143, 0.1);
  --border-color: rgba(255, 255, 255, 0.06);
  --hover-bg: rgba(255, 255, 255, 0.04);
  --image-bg: rgba(255, 255, 255, 0.01);
  --sidebar-width: 340px;
  --reader-max-width: 1000px;
  --card-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  --selection-bg: rgba(0, 117, 143, 0.3);
}

.theme-light {
  --bg-primary: #fcfdfe;
  --bg-secondary: rgba(255, 255, 255, 0.8);
  --bg-nav: rgba(252, 253, 254, 0.8);
  --text-main: #1e293b;
  --text-muted: #64748b;
  --text-header: #0f172a;
  --accent: #00607d;
  --accent-glow: rgba(0, 96, 125, 0.1);
  --accent-hover: rgba(0, 96, 125, 0.05);
  --border-color: rgba(0, 0, 0, 0.06);
  --hover-bg: rgba(0, 0, 0, 0.03);
  --image-bg: rgba(0, 0, 0, 0.005);
}

.theme-sepia {
  --bg-primary: #f5f2e9;
  --bg-secondary: rgba(240, 235, 220, 0.7);
  --bg-nav: rgba(245, 242, 233, 0.8);
  --text-main: #3d2b1f;
  --text-muted: #5e4c3e;
  --text-header: #2c1e14;
  --accent: #8b5e3c;
  --accent-glow: rgba(139, 94, 60, 0.1);
  --accent-hover: rgba(139, 94, 60, 0.05);
  --border-color: rgba(61, 43, 31, 0.08);
}

::selection {
  background: var(--selection-bg);
}

.reader-body {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-main);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  scroll-behavior: smooth;
}

.reader-container {
  display: flex;
  max-width: 1600px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
  position: relative;
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
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  margin-bottom: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  width: 100%;
  text-align: left;
  background: transparent;
  cursor: pointer;
  position: relative;
}

.chapter-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  opacity: 0.5;
  color: var(--accent);
}

.chapter-link:hover {
  background: var(--hover-bg);
  color: var(--text-main);
  transform: translateX(4px);
}

.chapter-link.active {
  background: var(--accent-hover);
  color: var(--accent);
  border-color: var(--accent-glow);
  box-shadow: inset 0 0 20px var(--accent-hover);
}

.chapter-link.active .chapter-number {
  opacity: 1;
}

.chapter-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 25%;
  height: 50%;
  width: 3px;
  background: var(--accent);
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 15px var(--accent);
}

/* Main Content Area */
.reader-content {
  flex: 1;
  padding: 3rem 5rem;
  max-width: var(--reader-max-width);
  margin: 0 auto;
  animation: fadeIn 0.7s ease-out;
}

.reader-nav-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 3rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.reader-title {
  font-family: 'Outfit', sans-serif;
  font-size: 3.8rem;
  font-weight: 800;
  color: var(--text-header);
  margin-bottom: 3rem;
  line-height: 1.05;
  letter-spacing: -0.05em;
  background: linear-gradient(135deg, var(--text-header), var(--text-muted));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.reader-header {
  font-family: 'Outfit', sans-serif;
  font-size: 2.1rem;
  font-weight: 700;
  color: var(--text-header);
  margin: 4.5rem 0 2rem 0;
  line-height: 1.25;
}

.reader-paragraph {
  font-family: 'Georgia', serif;
  font-size: 1.2rem;
  line-height: 1.95;
  color: var(--text-main);
  margin-bottom: 2rem;
  opacity: 0.95;
}

.reader-code {
  font-family: 'JetBrains Mono', monospace;
  background: #000;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  border: 1px solid var(--border-color);
  color: #a5d6ff;
  overflow-x: auto;
  font-size: 0.95rem;
  line-height: 1.6;
  position: relative;
}

.reader-code::before {
  content: 'SQL';
  position: absolute;
  top: 0;
  right: 1.5rem;
  font-size: 0.7rem;
  color: var(--accent);
  padding: 4px 8px;
  background: var(--accent-hover);
  border-radius: 0 0 6px 6px;
  font-weight: 700;
}

.reader-image-container {
  margin: 4rem 0;
  background: var(--image-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  content-visibility: auto;
}

.reader-image {
  max-width: 100%;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.bullet-point {
  display: flex;
  gap: 14px;
  margin-bottom: 1.2rem;
  font-family: 'Georgia', serif;
  font-size: 1.15rem;
  line-height: 1.85;
  color: var(--text-main);
}

.bullet-dot {
  color: var(--accent);
  font-weight: bold;
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

/* Desktop Central Nav */
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

.sidebar-overlay {
  display: none;
}

@media (max-width: 1024px) {
  .reader-sidebar {
    position: fixed;
    transform: translateX(-100%);
    opacity: 1 !important;
    width: 320px !important;
  }
  .reader-sidebar.open {
    transform: translateX(0);
    pointer-events: all;
  }
  .desktop-nav-links {
    display: none;
  }
  .mobile-sidebar-toggle {
    display: flex;
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
  .sidebar-header {
    justify-content: space-between;
  }
  .sidebar-close-btn {
    display: flex;
  }
}

@media (max-width: 768px) {
  .reader-content {
    padding: 1.5rem 1rem;
  }
  .reader-header {
    font-size: 1.5rem;
    margin: 2.5rem 0 1.2rem 0;
  }
  .reader-paragraph {
    font-size: 1.05rem;
    line-height: 1.7;
    margin-bottom: 1.2rem;
  }
  .reader-title {
    font-size: 2.2rem;
    margin-bottom: 1.5rem;
  }
  .reader-image-container {
    padding: 1rem;
    margin: 2rem 0;
  }
  .bullet-point {
    font-size: 1.05rem;
  }
}

@media (max-width: 480px) {
  .reader-content {
    padding: 1rem 0.8rem;
  }
  .reader-header {
    font-size: 1.35rem;
  }
  .reader-paragraph {
    font-size: 1rem;
  }
}
`;

export default function MySQLBookChapter() {
  const { topicname } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [theme, setTheme] = useState('light');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentChapterInfo = bookChapters.find(c => c.id === topicname) || { title: `MySQL - ${topicname}` };
  const currentIndex = bookChapters.findIndex(c => c.id === topicname);
  const nextChapter = currentIndex !== -1 && currentIndex < bookChapters.length - 1 ? bookChapters[currentIndex + 1] : null;

  useEffect(() => {
    setIsLoading(true);
    setBlocks([]);
    window.scrollTo(0, 0);
    
    // Fetch from our newly extracted private data directory
    fetch(`/books/mysql/data/${topicname}.json`)
      .then(r => r.json())
      .then(data => {
        setBlocks(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [topicname]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderedContent = useMemo(() => {
    return blocks.map((block, idx) => {
      switch (block.type) {
        case 'header':
          return <h2 key={`head-${idx}`} className="reader-header">{block.text}</h2>;
        case 'paragraph':
          return <p key={`p-${idx}`} className="reader-paragraph">{block.text}</p>;
        case 'code':
          return (
            <div key={`code-${idx}`} className="reader-code">
              <pre><code>{block.text}</code></pre>
            </div>
          );
        case 'bullet':
          return (
            <div key={`bullet-${idx}`} className="bullet-point">
              <span className="bullet-dot">❖</span>
              <span>{block.text.replace(/^[•\d-]+\.?\s*/, '').trim()}</span>
            </div>
          );
        case 'image':
          return (
            <div key={`img-${idx}`} className="reader-image-container">
              <img
                src={block.src}
                alt={block.caption}
                className="reader-image"
                loading="lazy"
                decoding="async"
              />
              <span style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>{block.caption}</span>
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
        <title>{currentChapterInfo.title} | Whizan MySQL Handbook</title>
        <meta name="description" content={`Master MySQL with ${currentChapterInfo.title}. Comprehensive guide for database engineering.`} />
      </Helmet>
      <style>{styles}</style>

      {/* Progress Bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--hover-bg)', zIndex: 1000 }}>
        <div style={{ height: '100%', width: `${readingProgress}%`, background: 'var(--accent)', transition: 'width 0.1s' }} />
      </div>

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
        <aside className={`reader-sidebar ${sidebarOpen ? 'open' : ''} ${!desktopSidebarOpen ? 'collapsed' : ''}`}>
           <div className="sidebar-header">
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <List size={14} color="var(--accent)" />
               <span>CURRICULUM</span>
             </div>
           </div>
           
           {bookChapters.map((chapter, idx) => (
             <button
               key={chapter.id}
               className={`chapter-link ${topicname === chapter.id ? 'active' : ''}`}
               onClick={() => {
                 navigate(`/books/mysql/${chapter.id}`);
                 setSidebarOpen(false);
               }}
             >
               <span className="chapter-number">{`0${idx + 1}`}</span>
               <span style={{ fontWeight: 600 }}>{chapter.title}</span>
               {topicname === chapter.id && <ChevronRight size={16} />}
             </button>
           ))}
        </aside>

        <main className="reader-content">
           <button 
             className="mobile-sidebar-toggle"
             onClick={() => setSidebarOpen(true)}
           >
             <Menu size={18} /> Menu
           </button>
           <div className="reader-nav-top">
             <span style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Home</span>
             <ChevronRight size={14} />
             <span>Database Learning</span>
             <ChevronRight size={14} />
             <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{currentChapterInfo.title}</span>
           </div>

           <header>
             <h1 className="reader-title">{currentChapterInfo.title}</h1>
           </header>

           <div className="reading-area">
             {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6rem 0' }}>
                   <div style={{ width: 40, height: 40, border: '3px solid var(--border-color)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
             ) : renderedContent}
           </div>

           {nextChapter && !isLoading && (
             <div style={{ marginTop: '6rem', padding: '3rem', background: 'var(--hover-bg)', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                   <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>CONTINUE LEARNING</p>
                   <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{nextChapter.title}</h3>
                </div>
                <button 
                  onClick={() => navigate(`/books/mysql/${nextChapter.id}`)}
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 auto', justifyContent: 'center' }}
                >
                  Next Lesson <ArrowLeft size={20} transform="rotate(180)" />
                </button>
             </div>
           )}
        </main>
      </div>
    </div>
  );
}
