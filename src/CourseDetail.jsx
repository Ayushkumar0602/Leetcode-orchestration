import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import NavProfile from './NavProfile';
import { Youtube, Lock, Play, Clock, BookOpen, Layers, CheckCircle, ArrowLeft, Loader2, Menu, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useSEO } from './hooks/useSEO';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchCourse(slug) {
    const res = await fetch(`${VITE_API_BASE_URL}/api/public/courses/${slug}`);
    if (res.status === 404) throw Object.assign(new Error('Not found'), { status: 404 });
    if (!res.ok) throw new Error('Failed to fetch course');
    return res.json();
}

async function fetchEnrolledIds(currentUser) {
    const token = await currentUser.getIdToken();
    const res = await fetch(`${VITE_API_BASE_URL}/api/courses/${currentUser.uid}/enrolled`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch enrollments');
    const data = await res.json();
    return data.enrolledIds || [];
}

async function enrollInCourse({ slug, currentUser }) {
    const token = await currentUser.getIdToken();
    const res = await fetch(`${VITE_API_BASE_URL}/api/courses/${slug}/enroll`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: currentUser.uid }),
    });
    if (!res.ok) throw new Error('Failed to enroll');
    return res.json();
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CourseDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // ── Queries ──────────────────────────────────────────────────────────────

    const {
        data: course,
        isLoading: loadingCourse,
        error: courseError,
    } = useQuery({
        queryKey: ['course', slug],
        queryFn: () => fetchCourse(slug),
        onError: (err) => { if (err.status === 404) navigate('/courses'); },
    });

    const { data: enrolledIds = [] } = useQuery({
        queryKey: ['enrolled-ids', currentUser?.uid],
        queryFn: () => fetchEnrolledIds(currentUser),
        enabled: !!currentUser && !!course,
    });

    // ── Mutation ─────────────────────────────────────────────────────────────

    const enrollMutation = useMutation({
        mutationFn: enrollInCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrolled-ids', currentUser?.uid] });
        },
        onError: () => alert('Failed to enroll.'),
    });

    // ── Derived state ─────────────────────────────────────────────────────────

    const enrolled = course ? enrolledIds.includes(course.id) : false;

    const handleEnroll = () => {
        if (!currentUser) { navigate(`/login?redirect=/courses/${slug}`); return; }
        enrollMutation.mutate({ slug, currentUser });
    };

    const cleanDescription = useMemo(() => {
        if (!course?.description) return 'Master this comprehensive engineering course with Whizan AI.';
        // Remove markdown basics and trim
        return course.description
            .replace(/[#*`_~]/g, '')
            .substring(0, 160) + '...';
    }, [course]);

    useSEO({
        title: course ? `${course.title} - Learn Engineering | Whizan AI` : 'Course Details | Whizan AI',
        description: cleanDescription,
        canonical: `/courses/${slug}`,
        keywords: `learn ${course?.title?.toLowerCase()}, engineering course, ${slug?.replace(/-/g, ', ')}, technical skills, whizan ai`,
        robots: 'index, follow',
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": course?.title,
            "description": cleanDescription,
            "provider": {
                "@type": "Organization",
                "name": "Whizan AI",
                "sameAs": "https://whizan.xyz"
            },
            "url": `https://whizan.xyz/courses/${slug}`,
            "courseCode": slug,
            "thumbnailUrl": course?.thumbnailUrl || "https://whizan.xyz/logo.jpeg",
            "educationalLevel": "Intermediate/Advanced",
            "offers": {
                "@type": "Offer",
                "category": "Free",
                "price": "0.00",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
            }
        }
    });

    // ── Render guards ─────────────────────────────────────────────────────────

    if (loadingCourse) {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={40} className="animate-spin" color="#3b82f6" />
                <p style={{ color: '#fff', marginTop: '15px', fontWeight: 500, letterSpacing: '0.5px' }}>Loading course...</p>
            </div>
        );
    }

    if (courseError || !course) {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Youtube size={64} color="#ef4444" style={{ marginBottom: '20px', opacity: 0.8 }} />
                <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Course Not Found</h2>
                <p style={{ color: 'var(--txt2)', marginTop: '10px' }}>The course you're looking for doesn't exist or was removed.</p>
                <button
                    onClick={() => navigate('/courses')}
                    style={{ marginTop: '30px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                    <ArrowLeft size={18} /> Back to Catalog
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
            <nav style={{ height: '70px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: '1 1 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <img src="/logo.jpeg" alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} />
                        <span className="nav-logo-text" style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Whizan AI</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: '1 1 0', justifyContent: 'flex-end' }}>
                    <div className="desktop-nav-profile">
                        <NavProfile />
                    </div>
                    <button
                        className="mobile-nav-toggle"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{
                            display: 'none',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            padding: '8px',
                            zIndex: 110
                        }}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* ── Mobile Menu Overlay ── */}
            {isMenuOpen && (
                <div style={{
                    position: 'fixed', top: '70px', left: 0, right: 0, bottom: 0,
                    background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)', zIndex: 99,
                    padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out'
                }}>
                    <button className="mobile-nav-link" onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}>Dashboard</button>
                    <button className="mobile-nav-link" onClick={() => { navigate('/courses'); setIsMenuOpen(false); }}>Courses</button>
                    {currentUser && (
                        <button className="mobile-nav-link" onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}>My Profile</button>
                    )}
                </div>
            )}

            <main style={{ flex: 1, position: 'relative' }}>
                <style>{`
                    .course-detail-layout {
                        display: flex;
                        gap: 50px;
                        flex-wrap: wrap;
                        align-items: flex-start;
                    }
                    @media (max-width: 900px) {
                        .course-detail-layout {
                            flex-direction: column-reverse !important;
                            gap: 30px !important;
                            padding: 20px 1.5rem 60px !important;
                        }
                        .course-main-content, .course-sidebar {
                            flex: none !important;
                            width: 100% !important;
                        }
                        .course-sidebar {
                            position: relative !important;
                            top: 0 !important;
                        }
                        .course-title-text {
                            font-size: 2.2rem !important;
                        }
                    }

                    @media (max-width: 768px) {
                        .nav-links { display: none !important; }
                        .desktop-nav-profile { display: none !important; }
                        .mobile-nav-toggle { display: block !important; }
                    }

                    @media (max-width: 480px) {
                        .nav-logo-text { display: none !important; }
                        .course-title-text { font-size: 1.8rem !important; }
                    }

                    .mobile-nav-link {
                        background: transparent;
                        border: none;
                        color: #fff;
                        font-size: 1.2rem;
                        font-weight: 600;
                        text-align: left;
                        padding: 1rem 0;
                        border-bottom: 1px solid rgba(255,255,255,0.05);
                        cursor: pointer;
                    }

                    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>

                <div className="course-detail-layout" style={{ maxWidth: '1250px', margin: '0 auto', padding: '40px 2rem 80px', position: 'relative', zIndex: 1 }}>

                    {/* Left Column (Main Content) */}
                    <div className="course-main-content" style={{ flex: '1 1 650px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '40px' }}>
                            <button
                                onClick={() => navigate('/courses')}
                                style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, padding: 0, marginBottom: '20px', transition: 'color 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                            >
                                <ArrowLeft size={16} /> Back to Courses
                            </button>

                            <h1 className="course-title-text" style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 20px 0', lineHeight: 1.15, letterSpacing: '-1px' }}>{course.title}</h1>

                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
                                {course.timeline && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#a0a0a0', background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <Clock size={16} /> {course.timeline}
                                    </span>
                                )}
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.2)', fontWeight: 600 }}>
                                    <CheckCircle size={16} /> AI Optimized
                                </span>
                            </div>

                            <div className="course-md-content" style={{ fontSize: '1.15rem', color: 'var(--txt2)', margin: 0, lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <ReactMarkdown components={{ p: ({node, ...props}) => <p style={{ whiteSpace: 'pre-wrap', margin: 0 }} {...props} /> }}>{course.description}</ReactMarkdown>
                            </div>
                        </div>

                        <div style={{ height: '1px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)', margin: '10px 0 50px' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
                            {course.prerequisite && (
                                <section>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
                                            <CheckCircle color="#10b981" size={20} />
                                        </div>
                                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Prerequisites</h2>
                                    </div>
                                    <div className="course-md-content" style={{ color: 'var(--txt2)', lineHeight: 1.7, fontSize: '1.05rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(255,255,255,0.015)', padding: '25px 30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <ReactMarkdown components={{ p: ({node, ...props}) => <p style={{ whiteSpace: 'pre-wrap', margin: 0 }} {...props} /> }}>{course.prerequisite}</ReactMarkdown>
                                    </div>
                                </section>
                            )}

                            {course.flow && (
                                <section>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139,92,246,0.2)' }}>
                                            <Layers color="#8b5cf6" size={20} />
                                        </div>
                                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Course Flow</h2>
                                    </div>
                                    <div className="course-md-content" style={{ color: 'var(--txt2)', lineHeight: 1.7, fontSize: '1.05rem', background: 'rgba(255,255,255,0.015)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: 'inset 0 2px 20px rgba(255,255,255,0.01)' }}>
                                        <ReactMarkdown components={{ h1: 'h3', h2: 'h4', h3: 'h5', p: ({node, ...props}) => <p style={{ whiteSpace: 'pre-wrap', margin: 0 }} {...props} /> }}>{course.flow}</ReactMarkdown>
                                    </div>
                                </section>
                            )}

                            {course.syllabus && (
                                <section>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.2)' }}>
                                            <BookOpen color="#3b82f6" size={20} />
                                        </div>
                                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Comprehensive Syllabus</h2>
                                    </div>
                                    <div className="course-md-content" style={{ color: 'var(--txt2)', lineHeight: 1.8, fontSize: '1.05rem', background: 'rgba(255,255,255,0.015)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: 'inset 0 2px 20px rgba(255,255,255,0.01)' }}>
                                        <ReactMarkdown components={{ h1: 'h3', h2: 'h4', h3: 'h5', p: ({node, ...props}) => <p style={{ whiteSpace: 'pre-wrap', margin: 0 }} {...props} /> }}>{course.syllabus}</ReactMarkdown>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sticky Sidebar (Enrollment Box) */}
                    <div className="course-sidebar" style={{ flex: '1 1 350px', position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: '#0a0a0f', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column' }}>
                            {course.thumbnailUrl ? (
                                <div style={{ width: '100%', height: '220px', background: `url(${course.thumbnailUrl}) center/cover`, borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
                            ) : (
                                <div style={{ width: '100%', height: '220px', background: 'linear-gradient(135deg, #111, #1a1a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Youtube size={64} color="rgba(255,255,255,0.05)" />
                                </div>
                            )}

                            <div style={{ padding: '30px' }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 10px 0', lineHeight: 1.3 }}>Ready to dive in?</h3>
                                <p style={{ color: 'var(--txt2)', fontSize: '0.95rem', margin: '0 0 25px 0', lineHeight: 1.5 }}>Gain full access to all lectures, syllabus materials, and AI-optimized prerequisites.</p>

                                {enrolled ? (
                                    <button
                                        onClick={() => navigate(`/learn/${course.slug}`)}
                                        style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 16px rgba(16,185,129,0.25)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 20px rgba(16,185,129,0.35)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(16,185,129,0.25)'; }}
                                    >
                                        <Play size={20} fill="#fff" /> Continue Learning
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleEnroll}
                                        disabled={enrollMutation.isPending}
                                        style={{ width: '100%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: 700, fontSize: '1.05rem', cursor: enrollMutation.isPending ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 16px rgba(59,130,246,0.25)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                        onMouseEnter={(e) => { if (!enrollMutation.isPending) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 20px rgba(59,130,246,0.35)'; } }}
                                        onMouseLeave={(e) => { if (!enrollMutation.isPending) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(59,130,246,0.25)'; } }}
                                    >
                                        {enrollMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
                                        {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                                    </button>
                                )}

                                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--txt3)', fontSize: '0.85rem' }}>
                                    <Lock size={12} /> Secure 1-click enrollment
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
