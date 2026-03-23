import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import NavProfile from './NavProfile';
import { Youtube, Lock, Play, Clock, BookOpen, Layers, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useSEO } from './hooks/useSEO';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

export default function CourseDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Enrollment state
    const [enrolled, setEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        fetchCourseAndStatus();
        // eslint-disable-next-line
    }, [slug, currentUser]);

    const fetchCourseAndStatus = async () => {
        setLoading(true);
        try {
            // Fetch public course details
            const res = await fetch(`${VITE_API_BASE_URL}/api/public/courses/${slug}`);
            if (!res.ok) {
                if (res.status === 404) navigate('/courses'); // Redirect if not found
                throw new Error("Failed to fetch course");
            }
            const courseData = await res.json();
            setCourse(courseData);

            // Fetch enrollment status if logged in
            if (currentUser && courseData.id) {
                const token = await currentUser.getIdToken();
                const enrollRes = await fetch(`${VITE_API_BASE_URL}/api/courses/${currentUser.uid}/enrolled`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (enrollRes.ok) {
                    const eData = await enrollRes.json();
                    if ((eData.enrolledIds || []).includes(courseData.id)) {
                        setEnrolled(true);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!currentUser) {
            navigate(`/login?redirect=/courses/${slug}`);
            return;
        }
        setEnrolling(true);
        try {
            const token = await currentUser.getIdToken();
            const res = await fetch(`${VITE_API_BASE_URL}/api/courses/${slug}/enroll`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ uid: currentUser.uid })
            });
            if (res.ok) {
                setEnrolled(true);
            }
        } catch (e) {
            alert('Failed to enroll.');
        } finally {
            setEnrolling(false);
        }
    };

    useSEO({
        title: course ? `${course.title} | Whizan Courses` : 'Course Details',
        description: course?.description || 'Learn completely structured engineering courses.',
        canonical: `/courses/${slug}`,
        robots: 'index, follow'
    });

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={40} className="animate-spin" color="#666" />
            </div>
        );
    }

    if (!course) return null; // Handled by redirect inside fetchCourseAndStatus

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            <nav style={{ height: '64px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: '1 1 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <img src="/logo.jpeg" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Whizan AI</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 0', justifyContent: 'flex-end' }}>
                    <NavProfile />
                </div>
            </nav>
            
            <main style={{ flex: 1 }}>
                {/* Hero Section */}
                <div style={{ position: 'relative', overflow: 'hidden', padding: '60px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {/* Background Overlay */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: course.thumbnailUrl ? `url(${course.thumbnailUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(10px)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #050505 0%, rgba(5,5,5,0.8) 50%, #050505 100%)' }} />

                    <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <button 
                            onClick={() => navigate('/courses')}
                            style={{ background: 'transparent', border: 'none', color: '#666', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: '0 0 10px 0', padding: 0, fontWeight: 600, fontSize: '0.9rem' }}
                        >
                            <ArrowLeft size={16} /> Back to Courses
                        </button>
                        
                        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{course.title}</h1>
                                <p style={{ fontSize: '1.1rem', color: 'var(--txt2)', margin: 0, lineHeight: 1.6 }}>{course.description}</p>
                                
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '15px 0' }}>
                                    {course.timeline && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600 }}>
                                            <Clock size={18} color="#f59e0b" /> {course.timeline}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600 }}>
                                        <Layers size={18} color="#8b5cf6" /> Structured Path
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600 }}>
                                        <Youtube size={18} color="#ef4444" /> Media Rich
                                    </div>
                                </div>

                                <div style={{ marginTop: '10px' }}>
                                    {enrolled ? (
                                        <button 
                                            onClick={() => navigate(`/learn/${course.slug}`)}
                                            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 14px rgba(16,185,129,0.3)', transition: 'transform 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <Play size={22} fill="currentColor" /> Continue Learning
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleEnroll}
                                            disabled={enrolling}
                                            style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: enrolling ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 14px rgba(59,130,246,0.3)', transition: 'transform 0.2s' }}
                                            onMouseEnter={e => { if(!enrolling) e.currentTarget.style.transform = 'translateY(-2px)' }}
                                            onMouseLeave={e => { if(!enrolling) e.currentTarget.style.transform = 'translateY(0)' }}
                                        >
                                            {enrolling ? <Loader2 size={22} className="animate-spin" /> : <Lock size={22} />} Enroll for Free
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div style={{ flex: '1 1 350px', maxWidth: '450px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                                {course.thumbnailUrl ? (
                                    <div style={{ width: '100%', paddingTop: '56.25%', background: `url(${course.thumbnailUrl}) center/cover` }} />
                                ) : (
                                    <div style={{ width: '100%', paddingTop: '56.25%', background: 'linear-gradient(45deg, #1e1b4b, #312e81)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Youtube color="rgba(255,255,255,0.1)" size={80} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                                    </div>
                                )}
                                {enrolled && (
                                    <div style={{ padding: '15px', background: 'rgba(16,185,129,0.1)', borderTop: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#10b981', fontWeight: 600 }}>
                                        <CheckCircle size={18} /> You are enrolled in this course
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px', display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '40px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        {course.prerequisite && (
                            <section>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle color="#10b981" size={24} /> Prerequisites</h2>
                                <p style={{ color: 'var(--txt2)', lineHeight: 1.7, fontSize: '1.05rem', margin: 0 }}>{course.prerequisite}</p>
                            </section>
                        )}
                        
                        {course.flow && (
                            <section>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}><Layers color="#8b5cf6" size={24} /> Course Flow</h2>
                                <div style={{ color: 'var(--txt2)', lineHeight: 1.7, fontSize: '1.05rem', background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'pre-wrap' }}>
                                    {course.flow}
                                </div>
                            </section>
                        )}

                        {course.syllabus && (
                            <section>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}><BookOpen color="#3b82f6" size={24} /> Comprehensive Syllabus</h2>
                                <div style={{ color: 'var(--txt2)', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                                    {course.syllabus}
                                </div>
                            </section>
                        )}
                    </div>
                    
                    <div>
                        <div style={{ position: 'sticky', top: '100px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '25px' }}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 800 }}>Ready to start learning?</h3>
                            {enrolled ? (
                                <button 
                                    onClick={() => navigate(`/learn/${course.slug}`)}
                                    style={{ width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
                                >
                                    <Play size={18} fill="currentColor" /> Access Course Contents
                                </button>
                            ) : (
                                <button 
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, cursor: enrolling ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' }}
                                >
                                    {enrolling ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />} Enroll Now
                                </button>
                            )}
                            
                            <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0 0', display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--txt3)', fontSize: '0.9rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Lifetime Access</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Self-paced learning</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={14} color="#10b981" /> Practical Examples</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
