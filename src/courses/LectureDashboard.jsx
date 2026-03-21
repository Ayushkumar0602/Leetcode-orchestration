import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useSEO } from '../hooks/useSEO';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function LectureDashboard() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useSEO({
        title: 'Lecture Dashboard - Whizan AI',
        description: 'Interactive lecture dashboard for comprehensive learning.',
    });

    useEffect(() => {
        const fetchAccess = async () => {
            if (!currentUser) return navigate('/login');
            try {
                // Check enrollment first
                const eDoc = await getDoc(doc(db, `users/${currentUser.uid}/enrollments`, courseId));
                if (!eDoc.exists()) {
                    setError('You are not enrolled in this course.');
                    setLoading(false);
                    return;
                }

                // Fetch course details
                const cDoc = await getDoc(doc(db, 'courses', courseId));
                if (cDoc.exists()) {
                    setCourse({ id: cDoc.id, ...cDoc.data() });
                } else {
                    setError('Course not found.');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load course dashboard.');
            } finally {
                setLoading(false);
            }
        };
        fetchAccess();
    }, [courseId, currentUser, navigate]);

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050505', color: '#fff' }}><Loader2 className="animate-spin" /></div>;
    
    if (error) return (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#fff', background: '#050505', minHeight: '100vh' }}>
            <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/courses')} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' }}>Browse Courses</button>
        </div>
    );

    // Extract Playlist ID from URL
    const extractPlaylistId = (url) => {
        if (!url) return null;
        try {
            const urlObj = new URL(url);
            return urlObj.searchParams.get('list');
        } catch {
            return null;
        }
    };

    const playlistId = extractPlaylistId(course.youtubePlaylistUrl);
    const iframeUrl = playlistId 
        ? `/lecture-dashboard.html?playlistId=${playlistId}`
        : '/lecture-dashboard.html';

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f0f0f' }}>
            <nav style={{ padding: '0.8rem 1.5rem', background: '#141620', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => navigate(`/courses/${courseId}`)} style={{ background: 'transparent', border: '1px solid #3a3a3a', color: '#fff', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowLeft size={16} /> Course Details
                </button>
                <h1 style={{ fontSize: '1.2rem', margin: 0, color: '#fff', fontWeight: 700 }}>{course.name} - Lectures</h1>
            </nav>
            <div style={{ flex: 1, position: 'relative' }}>
                <iframe 
                    src={iframeUrl} 
                    title="Lecture Dashboard"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        </div>
    );
}
