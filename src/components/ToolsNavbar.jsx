import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavProfile from '../NavProfile';
import NotificationBell from './NotificationBell';
import { Menu, X } from 'lucide-react';
import { TOOLS_NAV_LINKS } from '../constants/tools';

export default function ToolsNavbar() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

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
            zIndex: 1002,
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header / Brand handled by sidebar on desktop, but keep here for mobile/branding */}
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

            <div style={{ flex: 1 }} />

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <NotificationBell />
                    <NavProfile />
                </div>
                
                {/* Mobile Toggle */}
                <button 
                    style={{ 
                        display: 'block', 
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
                    gap: '0.8rem',
                    zIndex: 999,
                    animation: 'slideDown 0.3s ease'
                }}>
                    {TOOLS_NAV_LINKS.map((link) => (
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
                            <link.icon size={20} color={isActive(link.path) ? link.color : 'inherit'} />
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
                @media (min-width: 1201px) {
                    .mobile-toggle { display: none !important; }
                }
                @media (max-width: 1200px) {
                    .desktop-actions { display: none !important; }
                    .mobile-toggle { display: block !important; }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </nav>
    );
}
