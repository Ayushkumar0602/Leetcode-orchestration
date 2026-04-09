import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavProfile from '../NavProfile';
import NotificationBell from './NotificationBell';
import { Menu, X, Terminal, Database, GitBranch, Home, Zap, BrainCircuit } from 'lucide-react';

export default function ToolsNavbar() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { name: 'Codesandbox', path: '/tools/codesandbox', icon: Terminal },
        { name: 'SQL Editor', path: '/tools/sql-editor', icon: Database },
        { name: 'Git Playground', path: '/tools/git-playground', icon: GitBranch },
        { name: 'ML Sandbox', path: '/tools/ml-sandbox', icon: BrainCircuit },
    ];

    return (
        <nav style={{
            height: '70px',
            background: 'rgba(10, 10, 15, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Brand */}
            <div 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                onClick={() => navigate('/')}
            >
                <img src="/logo.jpeg" alt="Whizan AI" style={{ width: '36px', height: '36px', borderRadius: '10px' }} />
                <span style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 800, 
                    background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px'
                }}>
                    Whizan AI
                </span>
            </div>

            {/* Desktop Links */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                flex: 1,
                justifyContent: 'center'
            }} className="desktop-links">
                {navLinks.map((link) => (
                    <button
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: isActive(link.path) ? '#fff' : '#94a3b8',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor: isActive(link.path) ? 'rgba(255,255,255,0.05)' : 'transparent'
                        }}
                        onMouseEnter={e => {
                            if (!isActive(link.path)) e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={e => {
                            if (!isActive(link.path)) e.currentTarget.style.color = '#94a3b8';
                        }}
                    >
                        <link.icon size={16} />
                        {link.name}
                    </button>
                ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <NotificationBell />
                    <NavProfile />
                </div>
                
                {/* Mobile Toggle */}
                <button 
                    style={{ 
                        display: 'none', 
                        background: 'transparent', 
                        border: 'none', 
                        color: '#fff', 
                        cursor: 'pointer' 
                    }}
                    className="mobile-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div style={{
                    position: 'fixed',
                    top: '70px',
                    left: 0,
                    right: 0,
                    background: '#0a0a0f',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    zIndex: 999,
                    animation: 'slideDown 0.3s ease'
                }}>
                    {navLinks.map((link) => (
                        <button
                            key={link.path}
                            onClick={() => { navigate(link.path); setIsMenuOpen(false); }}
                            style={{
                                background: isActive(link.path) ? 'rgba(255,255,255,0.05)' : 'transparent',
                                border: 'none',
                                color: isActive(link.path) ? '#fff' : '#94a3b8',
                                padding: '12px',
                                borderRadius: '10px',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontSize: '1rem',
                                fontWeight: 600
                            }}
                        >
                            <link.icon size={20} />
                            {link.name}
                        </button>
                    ))}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <NavProfile />
                        <NotificationBell />
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 1200px) {
                    .desktop-links { display: none !important; }
                    .mobile-toggle { display: block !important; }
                    .desktop-actions { display: none !important; }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </nav>
    );
}
