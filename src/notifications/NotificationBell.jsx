// src/notifications/NotificationBell.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from './useNotifications';

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, markAllAsRead, markAsClicked } = useNotifications(10);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleNotifClick = async (notif) => {
        await markAsRead(notif.id, notif.campaignId);
        if (notif.link) {
            await markAsClicked(notif.id);
            navigate(notif.link);
            setOpen(false);
        }
    };

    const formatTime = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const typeColor = (type) => {
        if (type === 'popup') return '#f59e0b';
        if (type === 'personal') return '#60a5fa';
        return '#a78bfa';
    };

    const preview = notifications.slice(0, 5);

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            {/* Bell Button */}
            <button
                id="notification-bell-btn"
                onClick={() => setOpen(prev => !prev)}
                style={{
                    position: 'relative',
                    background: open ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '3px',
                        right: '3px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        borderRadius: '99px',
                        minWidth: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                        border: '2px solid #050505',
                        lineHeight: 1,
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '360px',
                    background: 'rgba(16,18,26,0.97)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '18px',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                    zIndex: 9999,
                    overflow: 'hidden',
                    animation: 'notif-dropdown-in 0.2s ease',
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 18px 12px',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bell size={16} color="#a78bfa" />
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
                            {unreadCount > 0 && (
                                <span style={{
                                    background: 'rgba(167,139,250,0.15)',
                                    color: '#a78bfa',
                                    borderRadius: '99px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                }}>
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#60a5fa',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                <Check size={12} /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification list */}
                    <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                        {preview.length === 0 ? (
                            <div style={{
                                padding: '36px 20px',
                                textAlign: 'center',
                                color: 'rgba(255,255,255,0.3)',
                                fontSize: '0.85rem',
                            }}>
                                <Bell size={32} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            preview.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotifClick(notif)}
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        cursor: notif.link ? 'pointer' : 'default',
                                        background: notif.read
                                            ? 'transparent'
                                            : 'rgba(167,139,250,0.04)',
                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = notif.read
                                            ? 'transparent'
                                            : 'rgba(167,139,250,0.04)';
                                    }}
                                >
                                    {/* Dot indicator */}
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        flexShrink: 0,
                                        borderRadius: '50%',
                                        marginTop: '6px',
                                        background: notif.read ? 'transparent' : typeColor(notif.type),
                                        border: notif.read ? '1.5px solid rgba(255,255,255,0.15)' : 'none',
                                    }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: notif.read ? 500 : 700,
                                            fontSize: '0.85rem',
                                            color: notif.read ? 'rgba(255,255,255,0.6)' : '#fff',
                                            white: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {notif.title}
                                        </div>
                                        <div style={{
                                            fontSize: '0.77rem',
                                            color: 'rgba(255,255,255,0.4)',
                                            marginTop: '2px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {notif.message}
                                        </div>
                                        <div style={{
                                            fontSize: '0.72rem',
                                            color: 'rgba(255,255,255,0.25)',
                                            marginTop: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                        }}>
                                            {formatTime(notif.createdAt)}
                                            {notif.link && <ExternalLink size={10} color="#60a5fa" />}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                        <button
                            onClick={() => { navigate('/notifications'); setOpen(false); }}
                            style={{
                                width: '100%',
                                background: 'rgba(167,139,250,0.1)',
                                border: '1px solid rgba(167,139,250,0.2)',
                                color: '#a78bfa',
                                borderRadius: '10px',
                                padding: '8px',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.18)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.1)'; }}
                        >
                            View all notifications
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes notif-dropdown-in {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
