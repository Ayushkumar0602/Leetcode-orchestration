import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, ArrowLeft, ChevronRight, Bookmark, Moon, Sun, Monitor, Type, Layout, List } from 'lucide-react';
import { Helmet } from 'react-helmet';

// Navigation structure for the Computer Networks series
const bookChapters = [
  { id: 'chapter1', title: 'Chapter 1: Introduction & Physical Layer' },
  { id: 'chapter2', title: 'Chapter 2: Data Link Layer' },
  { id: 'chapter3', title: 'Chapter 3: Network Layer' },
  { id: 'chapter4', title: 'Chapter 4: Transport Layer' },
  { id: 'chapter5', title: 'Chapter 5: Application Layer' },
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
  --accent: #22c55e;
  --accent-glow: rgba(34, 197, 94, 0.3);
  --accent-hover: rgba(34, 197, 94, 0.1);
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
  --accent: #16a34a;
  --accent-glow: rgba(22, 163, 74, 0.2);
  --accent-hover: rgba(22, 163, 74, 0.06);
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
    opacity: 1 !important;
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
  .sidebar-close-btn {
    display: flex;
  }
  .sidebar-header {
    justify-content: space-between;
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

export default function NetworkingBookChapter() {
  const { topicname } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [theme, setTheme] = useState('dark');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentChapterInfo = bookChapters.find(c => c.id === topicname) || { title: `Computer Networks - ${topicname}` };
  const currentIndex = bookChapters.findIndex(c => c.id === topicname);
  const nextChapter = currentIndex !== -1 && currentIndex < bookChapters.length - 1 ? bookChapters[currentIndex + 1] : null;

  useEffect(() => {
    setIsLoading(true);
    setBlocks([]);
    window.scrollTo(0, 0);
    fetch(`/books/computernetworks/data/${topicname}.json`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => {
        setBlocks(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load chapter:", err);
        setBlocks([]);
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
                style={{ width: '100%', height: 'auto', minHeight: '200px', objectFit: 'contain', display: 'block', borderRadius: '8px' }}
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
        <meta name="description" content={`Read ${currentChapterInfo.title} of the Computer Networks guide.`} />
        <link rel="canonical" href={`https://whizan.xyz/books/computernetworks/${topicname}`} />
      </Helmet>
      <style>{styles}</style>

      {/* Progress Bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--hover-bg)', zIndex: 1000 }}>
        <div style={{ height: '100%', width: `${readingProgress}%`, background: 'linear-gradient(90deg, #22c55e, #3b82f6)', transition: 'width 0.1s' }} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', zIndex: 10 }} onClick={() => navigate('/dashboard')}>
          <img src="/logo.jpeg" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-header)' }}>Whizan AI</span>
        </div>

        <div className="desktop-nav-links" style={{ zIndex: 1 }}>
          <span className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span className="nav-link" onClick={() => navigate('/books')}>Books</span>
          <span className="nav-link active">Networking Notes</span>
        </div>

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
        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
        
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
                  navigate(`/books/computernetworks/${chapter.id}`);
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
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/books')}>Books</span>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--text-header)' }}>{currentChapterInfo.title}</span>
          </div>
          
          <div className="reading-area">
             {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', opacity: 0.7 }}>
                   <div style={{ width: 48, height: 48, border: '3px solid var(--border-color)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }} />
                   <p className="reader-paragraph">Loading networking chapter...</p>
                </div>
             ) : blocks.length > 0 ? (
                renderedContent
             ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', opacity: 0.7 }}>
                   <BookOpen size={64} style={{ marginBottom: '1rem', color: 'var(--accent)' }} />
                   <h2 className="reader-header" style={{ marginTop: 0 }}>Content Coming Soon</h2>
                   <p className="reader-paragraph text-center">This chapter has not been digitized yet. Check back later.</p>
                </div>
             )}
          </div>
          
          {blocks.length > 0 && (
            <div style={{ marginTop: '5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
               <button onClick={() => window.scrollTo(0, 0)} style={{ background: 'var(--hover-bg)', color: 'var(--text-main)', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s', fontWeight: 500, flex: '1 1 auto' }}>
                 Back to Top
               </button>
               {nextChapter && (
                 <button onClick={() => navigate(`/books/computernetworks/${nextChapter.id}`)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: '1 1 auto' }}>
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
