import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Users, Database, Server, Image as ImageIcon, 
    Settings, Activity, Shield, Bell 
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

// Views
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminDatabase from './AdminDatabase';
import AdminStorage from './AdminStorage';
import AdminInfrastructure from './AdminInfrastructure';
import AdminConfig from './AdminConfig';
import AdminLogs from './AdminLogs';
import AdminNotifications from './AdminNotifications';

export default function AdminPortal() {
    const navigate = useNavigate();
    const location = useLocation();

    useSEO({
        title: 'Admin Portal – Whizan AI',
        description: 'Centralized administrative control panel.',
        canonical: '/admin',
        robots: 'noindex, nofollow',
    });

    const isCurrent = (path) => {
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Overview' },
        { path: '/admin/users', icon: Users, label: 'User Management' },
        { path: '/admin/database', icon: Database, label: 'Database Admin' },
        { path: '/admin/infrastructure', icon: Server, label: 'Infrastructure' },
        { path: '/admin/storage', icon: ImageIcon, label: 'Storage & Media' },
        { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
        { path: '/admin/config', icon: Settings, label: 'Configuration' },
        { path: '/admin/logs', icon: Activity, label: 'Activity Logs' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#050505', color: '#fff' }}>
            {/* Sidebar */}
            <div style={{ 
                width: '260px', 
                background: 'rgba(20,22,30,0.8)', 
                borderRight: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Shield color="#ef4444" size={24} />
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Admin Portal</span>
                    </div>
                </div>

                <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
                    {navItems.map(item => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                background: isCurrent(item.path) ? 'rgba(59,130,246,0.1)' : 'transparent',
                                color: isCurrent(item.path) ? '#60a5fa' : 'var(--txt2)',
                                border: isCurrent(item.path) ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                                borderRadius: '12px',
                                padding: '10px 14px',
                                fontSize: '0.9rem',
                                fontWeight: isCurrent(item.path) ? 700 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'left',
                                width: '100%'
                            }}
                            onMouseEnter={e => {
                                if (!isCurrent(item.path)) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.color = '#fff';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isCurrent(item.path)) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--txt2)';
                                }
                            }}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </div>

                <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', borderRadius: '10px', padding: '8px 16px',
                            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', width: '100%'
                        }}
                    >
                        ← Back to App
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                <Routes>
                    <Route path="/" element={<AdminOverview />} />
                    <Route path="/users" element={<AdminUsers />} />
                    <Route path="/database" element={<AdminDatabase />} />
                    <Route path="/infrastructure" element={<AdminInfrastructure />} />
                    <Route path="/storage" element={<AdminStorage />} />
                    <Route path="/notifications" element={<AdminNotifications />} />
                    <Route path="/config" element={<AdminConfig />} />
                    <Route path="/logs" element={<AdminLogs />} />
                </Routes>
            </div>
        </div>
    );
}
