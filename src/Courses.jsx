import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Youtube, Play, CheckCircle, Lock, BookOpen, Clock, Loader2, X } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import NavProfile from './NavProfile';
import { useSEO } from './hooks/useSEO';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

export default function Courses() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [courses, setCourses] = useState([]);
    const [enrolledIds, setEnrolledIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    
    const [selectedCourse, setSelectedCourse] = useState(null); // For modal
    const filter = searchParams.get('filter') || 'all'; // all, enrolled, not-enrolled

    useSEO({
        title: 'Tech & Programming Courses - Whizan',
        description: 'Master system design, algorithms, and real-world engineering with structured interactive courses.',
        canonical: '/courses',
        robots: 'index, follow'
    });

    useEffect(() => {
        fetchCoursesAndEnrollment();
        // eslint-disable-next-line
    }, [currentUser]);

    const fetchCoursesAndEnrollment = async () => {
        setLoading(true);
        try {
            // Fetch public courses list
            const res = await fetch(`${VITE_API_BASE_URL}/api/public/courses`);
            if (res.ok) {
                const data = await res.json();
                setCourses(data.courses || []);
            }

            // Fetch enrolled if logged in
            if (currentUser) {
                const token = await currentUser.getIdToken();
                const enrollRes = await fetch(`${VITE_API_BASE_URL}/api/courses/${currentUser.uid}/enrolled`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (enrollRes.ok) {
                    const eData = await enrollRes.json();
                    setEnrolledIds(eData.enrolledIds || []);
                }
            }
        } catch (e) {
            console.error("Error fetching courses data", e);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (slug) => {
        if (!currentUser) {
            navigate('/login?redirect=/courses');
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
                const data = await res.json();
                setEnrolledIds(prev => [...prev, data.courseId]);
                // Re-fetch to guarantee sync if needed, but local array is fine
                fetchCoursesAndEnrollment();
            }
        } catch (e) {
            alert('Failed to enroll. Please try again.');
        } finally {
            setEnrolling(false);
        }
    };

    const filteredCourses = courses.filter(course => {
        if (filter === 'enrolled') return enrolledIds.includes(course.id);
        if (filter === 'not-enrolled') return !enrolledIds.includes(course.id);
        return true;
    });

    const isEnrolled = (courseId) => enrolledIds.includes(courseId);

    const CourseModal = ({ course, onClose }) => {
        const enrolled = isEnrolled(course.id);
        const [fullDetails, setFullDetails] = useState(null);
        const [loadingDetails, setLoadingDetails] = useState(true);

        useEffect(() => {
            const getFullDetails = async () => {
                try {
                    const res = await fetch(`${VITE_API_BASE_URL}/api/public/courses/${course.slug}`);
                    if (res.ok) setFullDetails(await res.json());
                } finally {
                    setLoadingDetails(false);
                }
            };
            getFullDetails();
        }, [course.slug]);

        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
                <div 
                    onClick={e => e.stopPropagation()}
                    style={{ background: '#0a0a0f', width: '100%', maxWidth: '700px', maxHeight: '90vh', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                    {course.thumbnailUrl && (
                        <div style={{ width: '100%', height: '220px', background: `url(${course.thumbnailUrl}) center/cover`, position: 'relative' }}>
                            <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                        </div>
                    )}
                    <div style={{ padding: '30px', overflowY: 'auto' }}>
                        {!course.thumbnailUrl && (
                            <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
                        )}
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 10px 0' }}>{course.title}</h2>
                        <p style={{ color: 'var(--txt2)', margin: '0 0 25px 0', lineHeight: 1.6 }}>{course.description}</p>
                        
                        {loadingDetails ? (
                            <div style={{ display: 'flex', padding: '2rem', justifyContent: 'center' }}><Loader2 className="animate-spin" size={24} color="#666" /></div>
                        ) : fullDetails ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {fullDetails.prerequisite && (
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#fff' }}>Prerequisites</h4>
                                        <p style={{ margin: 0, color: 'var(--txt3)', fontSize: '0.9rem' }}>{fullDetails.prerequisite}</p>
                                    </div>
                                )}
                                {fullDetails.timeline && (
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#fff' }}>Expected Timeline</h4>
                                        <p style={{ margin: 0, color: 'var(--txt3)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {fullDetails.timeline}</p>
                                    </div>
                                )}
                                {fullDetails.syllabus && (
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={16} color="#3b82f6" /> Syllabus Preview</h4>
                                        <p style={{ margin: 0, color: 'var(--txt2)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                            {fullDetails.syllabus.length > 300 ? fullDetails.syllabus.slice(0, 300) + '...' : fullDetails.syllabus}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p style={{ color: '#ef4444' }}>Failed to load full course details.</p>
                        )}
                        
                        <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                            <button 
                                onClick={(e) => { e.stopPropagation(); navigate(`/courses/${course.slug}`); }}
                                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Full Details View
                            </button>
                            {enrolled ? (
                                <button 
                                    onClick={() => navigate(`/learn/${course.slug}`)}
                                    style={{ flex: 1, background: '#10b981', border: 'none', color: '#fff', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <Play size={18} /> Continue Learning
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleEnroll(course.slug)}
                                    disabled={enrolling}
                                    style={{ flex: 1, background: '#3b82f6', border: 'none', color: '#fff', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: enrolling ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    {enrolling ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />} Enroll Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
            
            <main style={{ flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 1rem 0', background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Accelerate Your Career
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--txt2)', maxWidth: '600px', margin: '0 auto' }}>
                        Structured, project-based video courses designed specifically for software engineers passing the world's toughest technical bars.
                    </p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {['all', 'enrolled', 'not-enrolled'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setSearchParams({ filter: f })}
                                style={{
                                    background: filter === f ? 'rgba(59,130,246,0.1)' : 'transparent',
                                    border: filter === f ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.1)',
                                    color: filter === f ? '#60a5fa' : '#999',
                                    padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize'
                                }}
                            >
                                {f.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                    {/* Add search optionally here */}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                        <Loader2 className="animate-spin" size={40} color="#666" />
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: '#666' }}>
                        <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h2>No courses found.</h2>
                        <p>Check back later for new content or adjust your filters.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                        {filteredCourses.map(course => {
                            const enrolled = isEnrolled(course.id);
                            return (
                                <div 
                                    key={course.id}
                                    onClick={() => setSelectedCourse(course)}
                                    style={{
                                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
                                        display: 'flex', flexDirection: 'column'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {course.thumbnailUrl ? (
                                        <div style={{ height: '180px', width: '100%', background: `url(${course.thumbnailUrl}) center/cover` }} />
                                    ) : (
                                        <div style={{ height: '180px', width: '100%', background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(168,85,247,0.1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Youtube size={40} color="rgba(255,255,255,0.2)" />
                                        </div>
                                    )}
                                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 10px 0', lineHeight: 1.3 }}>{course.title}</h3>
                                        <p style={{ color: 'var(--txt3)', fontSize: '0.9rem', margin: '0 0 20px 0', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                            {course.description}
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            {enrolled ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    <CheckCircle size={14} /> Enrolled
                                                </span>
                                            ) : (
                                                <span style={{ color: '#666', fontSize: '0.85rem', fontWeight: 600 }}>Available</span>
                                            )}
                                            
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (enrolled) navigate(`/learn/${course.slug}`);
                                                    else handleEnroll(course.slug);
                                                }}
                                                disabled={enrolling}
                                                style={{
                                                    background: enrolled ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                                                    border: enrolled ? '1px solid rgba(16,185,129,0.2)' : 'none',
                                                    color: enrolled ? '#10b981' : '#fff',
                                                    padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: enrolling ? 'wait' : 'pointer',
                                                    transition: 'background 0.2s'
                                                }}
                                            >
                                                {enrolled ? 'Continue' : 'Enroll'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
            {selectedCourse && <CourseModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />}
        </div>
    );
}
