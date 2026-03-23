import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { CheckCircle, Lock, Play, Menu, X, ArrowLeft, Loader2, Youtube, Layers } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useSEO } from './hooks/useSEO';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

export default function LearnCourse() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!currentUser) {
            navigate(`/login?redirect=/learn/${slug}`);
            return;
        }
        
        verifyAccessAndFetch();
        // eslint-disable-next-line
    }, [slug, currentUser]);

    const verifyAccessAndFetch = async () => {
        setLoading(true);
        try {
            // First get the course details publicly to resolve slug -> ID
            const res = await fetch(`${VITE_API_BASE_URL}/api/public/courses/${slug}`);
            if (!res.ok) {
                setErrorMsg('Course not found');
                setLoading(false);
                return;
            }
            const courseData = await res.json();
            
            // Check enrollment
            const token = await currentUser.getIdToken();
            const enrollRes = await fetch(`${VITE_API_BASE_URL}/api/courses/${currentUser.uid}/enrolled`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (enrollRes.ok) {
                const eData = await enrollRes.json();
                if (!(eData.enrolledIds || []).includes(courseData.id)) {
                    // Not enrolled -> Redirect back to detail page
                    navigate(`/courses/${slug}`);
                    return;
                }
            } else {
                setErrorMsg('Failed to verify enrollment');
                setLoading(false);
                return;
            }

            // User is enrolled, set course
            setCourse(courseData);
        } catch (e) {
            setErrorMsg('An error occurred loading the learning interface.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={40} className="animate-spin" color="#3b82f6" />
                <p style={{ color: '#fff', marginTop: '15px' }}>Verifying Access...</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Youtube size={48} color="#ef4444" style={{ marginBottom: '20px' }} />
                <h2>Oops!</h2>
                <p style={{ color: 'var(--txt2)' }}>{errorMsg}</p>
                <button 
                    onClick={() => navigate('/courses')}
                    style={{ marginTop: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
                >
                    Back to Course Catalog
                </button>
            </div>
        );
    }

    if (!course) return null;

    // A helper to extract the YouTube embed ID
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = (match && match[2].length === 11) ? match[2] : null;

        // Note: For playlists, the extraction is different. This assumes video link.
        // If it's a playlist link: https://youtube.com/playlist?list=PL...
        if (url.includes('playlist?list=')) {
            const listId = new URL(url).searchParams.get('list');
            if (listId) return `https://www.youtube.com/embed/videoseries?list=${listId}`;
        }
        
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    const embedUrl = getYouTubeEmbedUrl(course.youtubePlaylistLink);

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            
            {/* Minimal Header */}
            <header style={{ background: '#0a0a0f', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '15px 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
                    >
                        <ArrowLeft size={18} /> Dashboard
                    </button>
                    <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Play size={20} color="#3b82f6" fill="rgba(59,130,246,0.2)" /> {course.title}
                    </h1>
                </div>
            </header>

            <div style={{ flex: 1, display: 'flex' }}>
                {/* Main Content Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#000' }}>
                    {embedUrl ? (
                        <div style={{ width: '100%', paddingBottom: '56.25%', position: 'relative' }}>
                            <iframe 
                                src={embedUrl}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                title={course.title}
                            />
                        </div>
                    ) : (
                        <div style={{ width: '100%', paddingBottom: '56.25%', position: 'relative', background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <Youtube size={64} color="rgba(255,255,255,0.1)" style={{ marginBottom: '15px' }} />
                                <h3 style={{ color: '#fff', margin: 0 }}>No Video Linked</h3>
                                <p style={{ color: 'var(--txt3)' }}>The instructor has not provided a YouTube link for this module.</p>
                            </div>
                        </div>
                    )}
                    
                    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                        <h2 style={{ fontSize: '1.8rem', margin: '0 0 15px 0' }}>Overview</h2>
                        <div className="course-md-content" style={{ color: 'var(--txt2)', lineHeight: 1.7, fontSize: '1.05rem', margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <ReactMarkdown>{course.description}</ReactMarkdown>
                        </div>

                        {course.syllabus && (
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '40px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 15px 0' }}>Syllabus Reference</h3>
                                <div className="course-md-content" style={{ color: 'var(--txt2)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                                    <ReactMarkdown components={{ h1: 'h4', h2: 'h5', h3: 'h6' }}>{course.syllabus}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Menu */}
                <div style={{ width: '350px', background: '#0a0a0f', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Layers size={18} color="#8b5cf6" /> Course Content
                        </h3>
                    </div>
                    
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {course.flow && (
                            <div>
                                <h4 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Modules Breakdown</h4>
                                <div className="course-md-content" style={{ color: 'var(--txt2)', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '10px', borderLeft: '2px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <ReactMarkdown components={{ h1: 'h5', h2: 'h6', h3: 'h6', h4: 'h6' }}>{course.flow}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                        {course.syllabus && (
                            <div>
                                <h4 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Syllabus</h4>
                                <div className="course-md-content" style={{ color: 'var(--txt2)', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '10px', borderLeft: '2px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <ReactMarkdown components={{ h1: 'h5', h2: 'h6', h3: 'h6', h4: 'h6' }}>{course.syllabus}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
}
