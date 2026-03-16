// src/notifications/PopupNotification.jsx
// Renders popup notifications for 'popup' type notifications in real time
import React, { useState, useEffect, useRef } from 'react';
import { X, Bell, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import {
    collection, query, where, orderBy, limit, onSnapshot, updateDoc, doc
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function PopupNotification() {
    const { currentUser } = useAuth();
    const [queue, setQueue] = useState([]);
    const [current, setCurrent] = useState(null);
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();
    const dismissTimer = useRef(null);

    // Listen for unread popup notifications
    useEffect(() => {
        if (!currentUser?.uid) return;

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', currentUser.uid),
            where('type', '==', 'popup'),
            where('read', '==', false),
            orderBy('createdAt', 'desc'),
            limit(5)
        );

        const unsub = onSnapshot(q, (snap) => {
            const popups = [];
            snap.forEach(d => popups.push({ id: d.id, ...d.data() }));
            if (popups.length > 0) {
                setQueue(prev => {
                    // Only add truly new ones not already in queue or current
                    const currentIds = new Set([...(prev.map(p => p.id)), current?.id].filter(Boolean));
                    const newOnes = popups.filter(p => !currentIds.has(p.id));
                    return [...prev, ...newOnes];
                });
            }
        }, (err) => {
            console.error('Popup listener error:', err);
        });

        return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.uid]);

    // Show next in queue
    useEffect(() => {
        if (!current && queue.length > 0 && !visible) {
            const [next, ...rest] = queue;
            setCurrent(next);
            setQueue(rest);
            setVisible(true);

            // Auto-dismiss after 6 seconds
            dismissTimer.current = setTimeout(() => {
                handleDismiss(next);
            }, 6000);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queue, current, visible]);

    const handleDismiss = async (notif) => {
        clearTimeout(dismissTimer.current);
        setVisible(false);
        const n = notif || current;
        setTimeout(() => {
            setCurrent(null);
        }, 350);

        // Mark as read
        if (n) {
            try {
                await updateDoc(doc(db, 'notifications', n.id), {
                    read: true,
                    readAt: new Date().toISOString(),
                });
            } catch (err) {
                console.error('Failed to mark popup as read:', err);
            }
        }
    };

    const handleAction = async () => {
        if (current?.link) {
            try {
                await updateDoc(doc(db, 'notifications', current.id), {
                    clicked: true,
                    read: true,
                    readAt: new Date().toISOString(),
                });
            } catch (_) {}
            navigate(current.link);
        }
        handleDismiss();
    };

    if (!current) return null;

    return (
        <div
            id="popup-notification"
            role="alert"
            aria-live="assertive"
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                width: '360px',
                zIndex: 99999,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                opacity: visible ? 1 : 0,
                transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                pointerEvents: visible ? 'all' : 'none',
            }}
        >
            <div style={{
                background: 'rgba(16,18,26,0.97)',
                backdropFilter: 'blur(32px)',
                border: '1px solid rgba(167,139,250,0.25)',
                borderRadius: '18px',
                padding: '18px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(167,139,250,0.1) inset',
            }}>
                {/* Progress bar */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '3px',
                    borderRadius: '18px 18px 0 0',
                    background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
                    animation: 'popup-progress 6s linear forwards',
                    width: '100%',
                }} />

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    {/* Icon */}
                    <div style={{
                        width: '40px',
                        height: '40px',
                        flexShrink: 0,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(96,165,250,0.15))',
                        border: '1px solid rgba(167,139,250,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Bell size={18} color="#a78bfa" />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: '#fff',
                            marginBottom: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {current.title}
                        </div>
                        <div style={{
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.55)',
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}>
                            {current.message}
                        </div>

                        {current.link && (
                            <button
                                onClick={handleAction}
                                style={{
                                    marginTop: '10px',
                                    background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(96,165,250,0.1))',
                                    border: '1px solid rgba(167,139,250,0.3)',
                                    color: '#a78bfa',
                                    borderRadius: '8px',
                                    padding: '5px 12px',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.25)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(96,165,250,0.1))'; }}
                            >
                                <ExternalLink size={12} /> View details
                            </button>
                        )}
                    </div>

                    {/* Close */}
                    <button
                        onClick={() => handleDismiss()}
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.5)',
                            borderRadius: '8px',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                        aria-label="Dismiss notification"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes popup-progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
}
