const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { 
    collection, addDoc, getDocs, getDoc, doc, 
    updateDoc, deleteDoc, query, orderBy, setDoc 
} = require('firebase/firestore');
const ytpl = require('ytpl');

// Fetch all courses
router.get('/', async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, 'courses'));
        const courses = [];
        snapshot.forEach(d => {
            courses.push({ id: d.id, ...d.data() });
        });
        res.json({ courses }); // Wrapped in 'courses' key
    } catch (err) {
        console.error('Failed to fetch courses:', err);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// Fetch Youtube Playlist
router.post('/playlist', async (req, res) => {
    try {
        let { url } = req.body;
        if (!url) return res.status(400).json({ error: 'Playlist URL required' });
        
        const playlist = await ytpl(url, { pages: 1 });
        
        if (!playlist || !playlist.items) {
            return res.status(404).json({ error: 'No items in this playlist' });
        }
        
        const items = playlist.items.map(vid => {
            return {
                id: vid.id,
                title: vid.title,
                thumbnail: vid.bestThumbnail?.url || `https://i.ytimg.com/vi/${vid.id}/mqdefault.jpg`,
                videoId: vid.id,
                durationRaw: vid.duration || '00:00'
            };
        });
        
        res.json({ playlist: items });
    } catch (err) {
        console.error('Failed to fetch playlist:', err);
        res.status(500).json({ error: 'Failed to fetch playlist data: ' + err.message });
    }
});


// Create a new course
router.post('/', async (req, res) => {
    try {
        const courseData = {
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'courses'), courseData);
        res.status(201).json({ id: docRef.id, ...courseData });
    } catch (err) {
        console.error('Failed to create course:', err);
        res.status(500).json({ error: 'Failed to create course' });
    }
});

// Get a single course detail
router.get('/detail/:id', async (req, res) => {
    try {
        const docSnap = await getDoc(doc(db, 'courses', req.params.id));
        if (!docSnap.exists()) return res.status(404).json({ error: 'Course not found' });
        res.json({ course: { id: docSnap.id, ...docSnap.data() } }); // Wrapped in 'course' key
    } catch (err) {
        console.error('Failed to fetch course detail:', err);
        res.status(500).json({ error: 'Failed to fetch course detail' });
    }
});

// Update a course
router.patch('/:id', async (req, res) => {
    try {
        const courseRef = doc(db, 'courses', req.params.id);
        const updateData = {
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        await updateDoc(courseRef, updateData);
        res.json({ success: true });
    } catch (err) {
        console.error('Failed to update course:', err);
        res.status(500).json({ error: 'Failed to update course' });
    }
});

// Delete a course
router.delete('/:id', async (req, res) => {
    try {
        await deleteDoc(doc(db, 'courses', req.params.id));
        res.json({ success: true });
    } catch (err) {
        console.error('Failed to delete course:', err);
        res.status(500).json({ error: 'Failed to delete course' });
    }
});

// Enroll in a course (User specific)
router.post('/enroll', async (req, res) => {
    const { uid, courseId, paymentData } = req.body;
    if (!uid || !courseId) return res.status(400).json({ error: 'uid and courseId required' });
    
    try {
        const enrollmentRef = doc(db, 'user_courses', `${uid}_${courseId}`);
        const enrollmentData = {
            userId: uid,
            courseId,
            enrolledAt: new Date().toISOString(),
            paymentStatus: paymentData?.amount ? 'paid' : 'free',
            amount: paymentData?.amount || 0,
            paymentMethod: paymentData?.method || 'none'
        };
        await setDoc(enrollmentRef, enrollmentData);
        res.json({ success: true });
    } catch (err) {
        console.error('Failed to enroll in course:', err);
        res.status(500).json({ error: 'Failed to enroll in course' });
    }
});

// Get all enrolled courses for a user
router.get('/user/:uid', async (req, res) => {
    try {
        const uid = req.params.uid;
        const snapshot = await getDocs(collection(db, 'user_courses'));
        const enrolledCourses = [];
        
        for (const d of snapshot.docs) {
            const data = d.data();
            if (data.userId === uid) {
                const courseSnap = await getDoc(doc(db, 'courses', data.courseId));
                if (courseSnap.exists()) {
                    enrolledCourses.push({ 
                        id: courseSnap.id, 
                        ...courseSnap.data(),
                        enrolledAt: data.enrolledAt 
                    });
                }
            }
        }
        res.json({ courses: enrolledCourses }); // Wrapped in 'courses' key
    } catch (err) {
        console.error('Failed to fetch user courses:', err);
        res.status(500).json({ error: 'Failed to fetch user courses' });
    }
});

module.exports = router;
