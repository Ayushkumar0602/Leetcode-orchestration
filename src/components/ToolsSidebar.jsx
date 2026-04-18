import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    ChevronLeft, ChevronRight, LayoutGrid, Settings,
    MessageSquare, HelpCircle, Package
} from 'lucide-react';
import { TOOLS_NAV_LINKS } from '../constants/tools';

export default function ToolsSidebar({ isCollapsed, setIsCollapsed }) {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <aside style={{
            width: isCollapsed ? '80px' : '260px',
            background: 'rgba(13, 13, 20, 0.9)',
            backdropFilter: 'blur(30px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 1001,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 0',
            fontFamily: "'Inter', sans-serif"
        }}>
            <style>{`
                .sidebar-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 20px;
                    margin: 4px 12px;
                    border-radius: 12px;
                    color: #94a3b8;
                    text-decoration: none;
                    transition: all 0.2s;
                    cursor: pointer;
                    border: 1px solid transparent;
                    position: relative;
                    overflow: hidden;
                }
                .sidebar-item:hover {
                    background: rgba(255, 255, 255, 0.03);
                    color: #fff;
                }
                .sidebar-item.active {
                    background: rgba(139, 92, 246, 0.1);
                    color: #fff;
                    border: 1px solid rgba(139, 92, 246, 0.2);
                }
                .sidebar-item.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 20%;
                    height: 60%;
                    width: 4px;
                    background: #8b5cf6;
                    border-radius: 0 4px 4px 0;
                }
                .sidebar-label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    white-space: nowrap;
                    opacity: ${isCollapsed ? 0 : 1};
                    transition: opacity 0.3s;
                }
                .collapse-btn {
                    position: absolute;
                    right: -12px;
                    top: 85px;
                    width: 24px;
                    height: 24px;
                    background: #1e1e2d;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.2s;
                    z-index: 10;
                }
                .collapse-btn:hover {
                    background: #8b5cf6;
                    color: #fff;
                    transform: scale(1.1);
                }
                .sidebar-nav-container {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
                }
                .sidebar-nav-container::-webkit-scrollbar {
                    width: 4px;
                }
                .sidebar-nav-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sidebar-nav-container::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .sidebar-nav-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 92, 246, 0.3);
                }
            `}</style>

            {/* Logo Section */}
            <div style={{ padding: '0 20px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/logo.jpeg" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                    {!isCollapsed && (
                        <span style={{ 
                            fontWeight: 900, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.5px',
                            background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>
                            Whizan
                        </span>
                    )}
                </div>
            </div>

            <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Nav Links */}
            <div className="sidebar-nav-container">
                {TOOLS_NAV_LINKS.map((group) => (
                    <div key={group.category} style={{ marginBottom: '20px' }}>
                        {!isCollapsed && (
                            <div style={{ padding: '0 24px', marginBottom: '8px' }}>
                                <span style={{ 
                                    fontSize: '0.65rem', 
                                    fontWeight: 800, 
                                    color: '#475569', 
                                    letterSpacing: '1.5px', 
                                    textTransform: 'uppercase' 
                                }}>
                                    {group.category}
                                </span>
                            </div>
                        )}
                        {group.tools.map((link) => (
                            <div 
                                key={link.path}
                                className={`sidebar-item ${isActive(link.path) ? 'active' : ''}`}
                                onClick={() => navigate(link.path)}
                            >
                                <link.icon size={20} style={{ 
                                    color: isActive(link.path) ? link.color : 'inherit', 
                                    minWidth: '20px',
                                    filter: isActive(link.path) ? `drop-shadow(0 0 8px ${link.color}44)` : 'none'
                                }} />
                                {!isCollapsed && <span className="sidebar-label">{link.name}</span>}
                                {isCollapsed && isActive(link.path) && (
                                    <div style={{ 
                                        position: 'absolute', 
                                        right: '0', 
                                        width: '4px', 
                                        height: '20px', 
                                        background: link.color, 
                                        borderRadius: '4px 0 0 4px',
                                        boxShadow: `0 0 10px ${link.color}`
                                    }} />
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '15px' }}>
                <div className="sidebar-item" onClick={() => navigate('/feedback')}>
                    <MessageSquare size={18} style={{ minWidth: '18px' }} />
                    {!isCollapsed && <span className="sidebar-label">Feedback</span>}
                </div>
                <div className="sidebar-item" onClick={() => window.open('https://docs.whizan.xyz')}>
                    <HelpCircle size={18} style={{ minWidth: '18px' }} />
                    {!isCollapsed && <span className="sidebar-label">Docs</span>}
                </div>
            </div>
        </aside>
    );
}
