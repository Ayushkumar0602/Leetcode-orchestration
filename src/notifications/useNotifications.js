// src/notifications/useNotifications.js
import { useEffect, useState, useCallback } from 'react';
import { db } from '../firebase';
import {
    collection, query, where, orderBy, limit,
    onSnapshot, updateDoc, doc, writeBatch, getDocs
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://whizan-backend.onrender.com';

export function useNotifications(pageSize = 30) {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser?.uid) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        setLoading(true);
        const uid = currentUser.uid;

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', uid),
            orderBy('createdAt', 'desc'),
            limit(pageSize)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const notifs = [];
            snap.forEach(d => notifs.push({ id: d.id, ...d.data() }));
            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.read).length);
            setLoading(false);
        }, (err) => {
            console.error('Notification listener error:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser?.uid, pageSize]);

    // Mark a single notification as read
    const markAsRead = useCallback(async (notifId, campaignId) => {
        try {
            await updateDoc(doc(db, 'notifications', notifId), {
                read: true,
                readAt: new Date().toISOString(),
            });
            // Also update campaign read count on backend
            if (campaignId) {
                fetch(`${BACKEND_URL}/api/notifications/${notifId}/read`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ campaignId }),
                }).catch(() => {});
            }
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    }, []);

    // Mark a notification as clicked (for analytics)
    const markAsClicked = useCallback(async (notifId) => {
        try {
            await updateDoc(doc(db, 'notifications', notifId), {
                clicked: true,
                clickedAt: new Date().toISOString(),
                read: true,
            });
        } catch (err) {
            console.error('Failed to mark as clicked:', err);
        }
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        if (!currentUser?.uid) return;
        try {
            const q = query(
                collection(db, 'notifications'),
                where('userId', '==', currentUser.uid),
                where('read', '==', false)
            );
            const snap = await getDocs(q);
            const BATCH_SIZE = 100;
            const docs = [];
            snap.forEach(d => docs.push(d));

            for (let i = 0; i < docs.length; i += BATCH_SIZE) {
                const batch = writeBatch(db);
                docs.slice(i, i + BATCH_SIZE).forEach(d => {
                    batch.update(d.ref, { read: true, readAt: new Date().toISOString() });
                });
                await batch.commit();
            }
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    }, [currentUser?.uid]);

    return { notifications, unreadCount, loading, markAsRead, markAsClicked, markAllAsRead };
}
