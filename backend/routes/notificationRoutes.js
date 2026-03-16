// backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const {
    collection, doc, addDoc, getDoc, getDocs, setDoc,
    updateDoc, deleteDoc, query, where, orderBy, limit,
    startAfter, serverTimestamp, writeBatch, increment, Timestamp
} = require('firebase/firestore');

// ─────────────────────────────────────────────
// CAMPAIGN MANAGEMENT
// ─────────────────────────────────────────────

// POST /api/notifications/campaigns — Create a new campaign
router.post('/campaigns', async (req, res) => {
    try {
        const {
            title, message, type = 'feed', target = 'all_users',
            displayType = 'feed', link = '', priority = 'normal',
            startAt = null, expiresAt = null, createdBy = 'admin'
        } = req.body;

        if (!title || !message) {
            return res.status(400).json({ error: 'title and message are required' });
        }

        const now = new Date().toISOString();
        const campaignData = {
            title, message, type, target, displayType, link, priority,
            startAt: startAt || now,
            expiresAt: expiresAt || null,
            createdBy,
            createdAt: now,
            status: 'draft',
            sentCount: 0,
            readCount: 0,
        };

        const ref = await addDoc(collection(db, 'campaigns'), campaignData);
        res.json({ success: true, campaignId: ref.id, ...campaignData });
    } catch (err) {
        console.error('Failed to create campaign:', err);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
});

// GET /api/notifications/campaigns — List all campaigns
router.get('/campaigns', async (req, res) => {
    try {
        const q = query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const campaigns = [];
        snap.forEach(d => campaigns.push({ id: d.id, ...d.data() }));
        res.json({ campaigns });
    } catch (err) {
        console.error('Failed to list campaigns:', err);
        res.status(500).json({ error: 'Failed to list campaigns' });
    }
});

// GET /api/notifications/campaigns/:id — Get a single campaign
router.get('/campaigns/:id', async (req, res) => {
    try {
        const snap = await getDoc(doc(db, 'campaigns', req.params.id));
        if (!snap.exists()) return res.status(404).json({ error: 'Campaign not found' });
        res.json({ id: snap.id, ...snap.data() });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get campaign' });
    }
});

// PATCH /api/notifications/campaigns/:id — Update campaign fields
router.patch('/campaigns/:id', async (req, res) => {
    try {
        const allowedFields = ['title', 'message', 'type', 'target', 'displayType', 'link',
            'priority', 'startAt', 'expiresAt', 'status'];
        const updates = {};
        allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
        updates.updatedAt = new Date().toISOString();
        await updateDoc(doc(db, 'campaigns', req.params.id), updates);
        res.json({ success: true });
    } catch (err) {
        console.error('Failed to update campaign:', err);
        res.status(500).json({ error: 'Failed to update campaign' });
    }
});

// DELETE /api/notifications/campaigns/:id — Delete a campaign
router.delete('/campaigns/:id', async (req, res) => {
    try {
        await deleteDoc(doc(db, 'campaigns', req.params.id));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete campaign' });
    }
});

// POST /api/notifications/campaigns/:id/activate — Activate campaign and fan-out notifications
router.post('/campaigns/:id/activate', async (req, res) => {
    const campaignId = req.params.id;
    try {
        // 1. Load campaign
        const campaignSnap = await getDoc(doc(db, 'campaigns', campaignId));
        if (!campaignSnap.exists()) return res.status(404).json({ error: 'Campaign not found' });
        const campaign = { id: campaignSnap.id, ...campaignSnap.data() };

        if (campaign.status === 'active') {
            return res.status(400).json({ error: 'Campaign is already active' });
        }

        // 2. Get target users
        let targetUids = [];
        const profilesSnap = await getDocs(collection(db, 'userProfiles'));
        profilesSnap.forEach(d => targetUids.push(d.id));

        if (targetUids.length === 0) {
            return res.status(400).json({ error: 'No users found to deliver to' });
        }

        // 3. Fan-out notifications in batches of 100
        const now = new Date().toISOString();
        const BATCH_SIZE = 100;
        let totalWritten = 0;

        for (let i = 0; i < targetUids.length; i += BATCH_SIZE) {
            const batch = writeBatch(db);
            const chunk = targetUids.slice(i, i + BATCH_SIZE);

            chunk.forEach(uid => {
                const notifRef = doc(collection(db, 'notifications'));
                batch.set(notifRef, {
                    userId: uid,
                    campaignId: campaignId,
                    title: campaign.title,
                    message: campaign.message,
                    type: campaign.displayType || campaign.type,
                    link: campaign.link || '',
                    read: false,
                    notifType: 'campaign',
                    priority: campaign.priority || 'normal',
                    createdAt: now,
                });
            });

            await batch.commit();
            totalWritten += chunk.length;
        }

        // 4. Mark campaign as active
        await updateDoc(doc(db, 'campaigns', campaignId), {
            status: 'active',
            activatedAt: now,
            sentCount: totalWritten,
        });

        res.json({ success: true, sentCount: totalWritten });
    } catch (err) {
        console.error('Failed to activate campaign:', err);
        res.status(500).json({ error: 'Failed to activate campaign: ' + err.message });
    }
});

// POST /api/notifications/campaigns/:id/pause — Pause an active campaign
router.post('/campaigns/:id/pause', async (req, res) => {
    try {
        await updateDoc(doc(db, 'campaigns', req.params.id), {
            status: 'paused',
            updatedAt: new Date().toISOString(),
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to pause campaign' });
    }
});

// ─────────────────────────────────────────────
// PERSONAL NOTIFICATIONS
// ─────────────────────────────────────────────

// POST /api/notifications/personal — Send notification to a specific user
router.post('/personal', async (req, res) => {
    try {
        const { userId, title, message, link = '', type = 'feed', priority = 'normal' } = req.body;
        if (!userId || !title || !message) {
            return res.status(400).json({ error: 'userId, title, and message are required' });
        }

        const notifData = {
            userId,
            title,
            message,
            link,
            type,
            priority,
            read: false,
            notifType: 'personal',
            createdAt: new Date().toISOString(),
        };

        const ref = await addDoc(collection(db, 'notifications'), notifData);
        res.json({ success: true, notificationId: ref.id });
    } catch (err) {
        console.error('Failed to send personal notification:', err);
        res.status(500).json({ error: 'Failed to send personal notification' });
    }
});

// ─────────────────────────────────────────────
// USER NOTIFICATION QUERIES
// ─────────────────────────────────────────────

// GET /api/notifications/:uid — Fetch notifications for a user (paginated)
router.get('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const pageSize = parseInt(req.query.limit) || 20;
        const filterType = req.query.type; // optional: campaign | personal | system

        let q = query(
            collection(db, 'notifications'),
            where('userId', '==', uid),
            orderBy('createdAt', 'desc'),
            limit(pageSize)
        );

        const snap = await getDocs(q);
        const notifications = [];
        snap.forEach(d => notifications.push({ id: d.id, ...d.data() }));

        // Apply optional client-side filter on notifType
        const filtered = filterType
            ? notifications.filter(n => n.notifType === filterType)
            : notifications;

        const unreadCount = filtered.filter(n => !n.read).length;
        res.json({ notifications: filtered, unreadCount });
    } catch (err) {
        console.error('Failed to fetch notifications:', err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// PATCH /api/notifications/:id/read — Mark a single notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const { campaignId } = req.body; // optional, for analytics
        await updateDoc(doc(db, 'notifications', req.params.id), {
            read: true,
            readAt: new Date().toISOString(),
        });

        // Increment campaign read count
        if (campaignId) {
            try {
                await updateDoc(doc(db, 'campaigns', campaignId), {
                    readCount: increment(1),
                });
            } catch (_) { /* ignore if campaign deleted */ }
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

// PATCH /api/notifications/read-all/:uid — Mark all notifications as read for a user
router.patch('/read-all/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', uid),
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

        res.json({ success: true, markedCount: docs.length });
    } catch (err) {
        console.error('Failed to mark all as read:', err);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

// DELETE /api/notifications/:id — Delete a notification
router.delete('/:id', async (req, res) => {
    try {
        await deleteDoc(doc(db, 'notifications', req.params.id));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

// ─────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────

// GET /api/notifications/analytics/:campaignId — Campaign analytics
router.get('/analytics/:campaignId', async (req, res) => {
    try {
        const campaignSnap = await getDoc(doc(db, 'campaigns', req.params.campaignId));
        if (!campaignSnap.exists()) return res.status(404).json({ error: 'Campaign not found' });
        const campaign = campaignSnap.data();

        // Count total notifications for this campaign
        const notifQ = query(
            collection(db, 'notifications'),
            where('campaignId', '==', req.params.campaignId)
        );
        const notifSnap = await getDocs(notifQ);
        let totalSent = 0, totalRead = 0, totalClicked = 0;
        notifSnap.forEach(d => {
            totalSent++;
            const data = d.data();
            if (data.read) totalRead++;
            if (data.clicked) totalClicked++;
        });

        const readRate = totalSent > 0 ? ((totalRead / totalSent) * 100).toFixed(1) : '0.0';
        const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0.0';

        res.json({
            campaignId: req.params.campaignId,
            title: campaign.title,
            status: campaign.status,
            totalSent,
            totalRead,
            totalClicked,
            readRate,
            clickRate,
            activatedAt: campaign.activatedAt || null,
            createdAt: campaign.createdAt,
        });
    } catch (err) {
        console.error('Failed to fetch analytics:', err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// ─────────────────────────────────────────────
// USER PREFERENCES
// ─────────────────────────────────────────────

// GET /api/notifications/prefs/:uid
router.get('/prefs/:uid', async (req, res) => {
    try {
        const snap = await getDoc(doc(db, 'notificationPrefs', req.params.uid));
        if (!snap.exists()) {
            return res.json({
                enablePopups: true,
                enableFeed: true,
                muteCampaigns: false,
            });
        }
        res.json(snap.data());
    } catch (err) {
        res.status(500).json({ error: 'Failed to get preferences' });
    }
});

// POST /api/notifications/prefs/:uid
router.post('/prefs/:uid', async (req, res) => {
    try {
        const { enablePopups, enableFeed, muteCampaigns } = req.body;
        await setDoc(doc(db, 'notificationPrefs', req.params.uid), {
            enablePopups: enablePopups !== undefined ? enablePopups : true,
            enableFeed: enableFeed !== undefined ? enableFeed : true,
            muteCampaigns: muteCampaigns !== undefined ? muteCampaigns : false,
            updatedAt: new Date().toISOString(),
        }, { merge: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save preferences' });
    }
});

module.exports = router;
