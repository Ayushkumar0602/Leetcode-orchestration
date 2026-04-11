import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavProfile from '../../../NavProfile';
import DSANotesSidebar from './DSANotesSidebar';

const DSANotesLayout = ({ children, activeTab = 'Notes' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(168,85,247,0.1) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(59,130,246,0.05) 0%, transparent 50%)',
      color: '#fff',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* ── Application Default Navbar ─────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 1.5rem', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: '1 1 0' }} onClick={() => navigate('/dashboard')}>
          <img src="/logo.jpeg" alt="Logo" style={{ height: '32px', width: '32px', borderRadius: '8px', objectFit: 'cover' }} />
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Whizan AI</span>
        </div>

        <div className="pl-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px' }}>
          {[
            { label: 'Problems', path: '/dsaquestion' },
            { label: 'DSA Interview', path: '/aiinterview' },
            { label: 'System Design', path: '/systemdesign' },
            { label: 'Notes', path: '/dsa/notes/introduction' },
            { label: 'My Submissions', path: '/submissions' },
          ].map(item => {
            const isActive = item.label === activeTab;
            return (
              <button key={item.label} onClick={() => navigate(item.path)}
                style={{
                  padding: '6px 14px', borderRadius: '7px', border: 'none',
                  background: isActive ? 'rgba(168,85,247,0.25)' : 'transparent',
                  color: isActive ? '#d8b4fe' : '#9ca3af',
                  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                }}>
                {item.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 0', justifyContent: 'flex-end' }}>
          <NavProfile />
        </div>
      </nav>

      {/* ── Main content wrapper ─────────────────────────────── */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
        <DSANotesSidebar />
        <div style={{ flex: 1, minWidth: 0, paddingBottom: '4rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DSANotesLayout;
