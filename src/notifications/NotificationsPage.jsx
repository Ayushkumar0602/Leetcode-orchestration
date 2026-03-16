// src/notifications/NotificationsPage.jsx
import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Filter, ExternalLink, Trash2, ArrowLeft, Megaphone, User, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from './useNotifications';
import { db } from '../firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { useSEO } from '../hooks/useSEO';

const FILTER_TABS = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'campaign', label: 'Campaigns', icon: Megaphone },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'system', label: 'System', icon: Zap },
];

const TYPE_ICON = {
    campaign: Megaphone,
    personal: User,
    system: Zap,
};

const TYPE_COLOR = {
    campaign: { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa' },
    personal: { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', text: '#60a5fa' },
    system: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
};

function formatTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function NotificationItem({ notif, onRead, onDelete, onNavigate }) {
    const colors = TYPE_COLOR[notif.notifType] || TYPE_COLOR.system;
    const Icon = TYPE_ICON[notif.notifType] || Bell;

    return (
        <div
            style={{
                display: 'flex',
                gap: '16px',
                padding: '18px 20px',
                background: notif.read ? 'transparent' : 'rgba(167,139,250,0.04)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                transition: 'background 0.2s',
                position: 'relative',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(167,139,250,0.04)'; }}
        >
            {/* Unread indicator */}
            {!notif.read && (
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '3px',
                    background: 'linear-gradient(180deg, #a78bfa, #60a5fa)',
                    borderRadius: '0 2px 2px 0',
                }} />
            )}

            {/* Type icon */}
            <div style={{
                width: '44px',
                height: '44px',
                flexShrink: 0,
                borderRadius: '14px',
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Icon size={18} color={colors.text} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{
                        fontWeight: notif.read ? 500 : 700,
                        fontSize: '0.9rem',
                        color: notif.read ? 'rgba(255,255,255,0.65)' : '#fff',
                        lineHeight: 1.4,
                    }}>
                        {notif.title}
                    </div>
                    <span style={{
                        fontSize: '0.72rem',
                        color: 'rgba(255,255,255,0.3)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                    }}>
                        {formatTime(notif.createdAt)}
                    </span>
                </div>

                <div style={{
                    fontSize: '0.82rem',
                    color: 'rgba(255,255,255,0.45)',
                    marginTop: '4px',
                    lineHeight: 1.5,
                }}>
                    {notif.message}
                </div>

                {/* Tags and actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                        background: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '99px',
                        fontSize: '0.69rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        textTransform: 'capitalize',
                    }}>
                        {notif.notifType || 'notification'}
                    </span>

                    {!notif.read && (
                        <button
                            onClick={() => onRead(notif.id, notif.campaignId)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#60a5fa',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                            }}
                        >
                            <Check size={11} /> Mark read
                        </button>
                    )}

                    {notif.link && (
                        <button
                            onClick={() => onNavigate(notif)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#a78bfa',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                            }}
                        >
                            <ExternalLink size={11} /> View
                        </button>
                    )}

                    <button
                        onClick={() => onDelete(notif.id)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255,255,255,0.2)',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            marginLeft: 'auto',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; }}
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('all');
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, markAsClicked } = useNotifications(50);

    useSEO({
        title: 'Notifications – Whizan AI',
        description: 'View your notifications and updates.',
        robots: 'noindex',
    });

    const filtered = activeFilter === 'all'
        ? notifications
        : notifications.filter(n => n.notifType === activeFilter);

    const handleNavigate = async (notif) => {
        await markAsRead(notif.id, notif.campaignId);
        await markAsClicked(notif.id);
        navigate(notif.link);
    };

    const handleDelete = async (notifId) => {
        try {
            await deleteDoc(doc(db, 'notifications', notifId));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#050505',
            color: '#fff',
            fontFamily: 'Inter, system-ui, sans-serif',
        }}>
            {/* Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'rgba(5,5,5,0.9)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                padding: '0 24px',
            }}>
                <div style={{
                    maxWidth: '720px',
                    margin: '0 auto',
                    padding: '16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                color: '#fff',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Bell size={18} color="#a78bfa" />
                                Notifications
                            </div>
                            {unreadCount > 0 && (
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                                    {unreadCount} unread
                                </div>
                            )}
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            style={{
                                background: 'rgba(96,165,250,0.1)',
                                border: '1px solid rgba(96,165,250,0.2)',
                                color: '#60a5fa',
                                borderRadius: '10px',
                                padding: '7px 14px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(96,165,250,0.18)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(96,165,250,0.1)'; }}
                        >
                            <CheckCheck size={14} /> Mark all read
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div style={{
                    maxWidth: '720px',
                    margin: '0 auto',
                    display: 'flex',
                    gap: '4px',
                    paddingBottom: '12px',
                    overflowX: 'auto',
                }}>
                    {FILTER_TABS.map(tab => {
                        const TabIcon = tab.icon;
                        const count = tab.id === 'all'
                            ? notifications.length
                            : notifications.filter(n => n.notifType === tab.id).length;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveFilter(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 14px',
                                    borderRadius: '99px',
                                    border: 'none',
                                    background: activeFilter === tab.id
                                        ? 'rgba(167,139,250,0.15)'
                                        : 'transparent',
                                    color: activeFilter === tab.id ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                                    fontSize: '0.8rem',
                                    fontWeight: activeFilter === tab.id ? 700 : 500,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <TabIcon size={13} />
                                {tab.label}
                                {count > 0 && (
                                    <span style={{
                                        background: activeFilter === tab.id
                                            ? 'rgba(167,139,250,0.3)'
                                            : 'rgba(255,255,255,0.08)',
                                        borderRadius: '99px',
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        padding: '1px 6px',
                                        minWidth: '18px',
                                        textAlign: 'center',
                                    }}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '8px 0 80px' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            border: '2px solid rgba(167,139,250,0.3)',
                            borderTopColor: '#a78bfa',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                            margin: '0 auto 12px',
                        }} />
                        Loading notifications…
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                        <div style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '20px',
                            background: 'rgba(167,139,250,0.08)',
                            border: '1px solid rgba(167,139,250,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                        }}>
                            <Bell size={28} color="rgba(167,139,250,0.4)" />
                        </div>
                        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>
                            {activeFilter === 'all' ? 'No notifications yet' : `No ${activeFilter} notifications`}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                            {activeFilter === 'all'
                                ? "You're all caught up! We'll notify you when something happens."
                                : 'Try switching to a different filter.'}
                        </p>
                    </div>
                ) : (
                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        margin: '16px 24px 0',
                    }}>
                        {filtered.map(notif => (
                            <NotificationItem
                                key={notif.id}
                                notif={notif}
                                onRead={markAsRead}
                                onDelete={handleDelete}
                                onNavigate={handleNavigate}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
