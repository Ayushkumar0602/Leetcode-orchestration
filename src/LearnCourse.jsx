import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Loader2, ArrowLeft, Play, FileText, ImageIcon, PlayCircle, FolderArchive, File, Lock, Download, CheckCircle, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useSEO } from './hooks/useSEO';
import { useQuery } from '@tanstack/react-query';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getFileIcon = (type) => {
    if (!type) return <File size={20} color="#64748b" />;
    if (type.startsWith('image/')) return <ImageIcon size={20} color="#3b82f6" />;
    if (type.startsWith('video/')) return <PlayCircle size={20} color="#f59e0b" />;
    if (type.includes('pdf')) return <FileText size={20} color="#ef4444" />;
    if (type.includes('zip') || type.includes('compressed')) return <FolderArchive size={20} color="#8b5cf6" />;
    return <File size={20} color="#64748b" />;
};

async function fetchCourse(slug) {
    const res = await fetch(`${VITE_API_BASE_URL}/api/public/courses/${slug}`);
    if (!res.ok) throw new Error("Course not found");
    return res.json();
}

async function fetchEnrolledIds(currentUser) {
    const token = await currentUser.getIdToken();
    const res = await fetch(`${VITE_API_BASE_URL}/api/courses/${currentUser.uid}/enrolled`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch enrollments");
    const data = await res.json();
    return data.enrolledIds || [];
}

async function fetchCourseMaterials(courseId) {
    const res = await fetch(`${VITE_API_BASE_URL}/api/courses/${courseId}/materials`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.materials || [];
}

export default function LearnCourse() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    useEffect(() => {
        if (!currentUser) navigate('/login');
    }, [currentUser, navigate]);

    const { data: course, isLoading: loadingCourse, error: courseError } = useQuery({
        queryKey: ['course', slug],
        queryFn: () => fetchCourse(slug),
        staleTime: 1000 * 60 * 5,
    });

    const { data: enrolledIds = [], isLoading: loadingEnrollments, error: enrollError } = useQuery({
        queryKey: ['enrolled-ids', currentUser?.uid],
        queryFn: () => fetchEnrolledIds(currentUser),
        enabled: !!currentUser,
        staleTime: 1000 * 60 * 5,
    });

    const enrolled = course ? (enrolledIds.includes(course.id) || enrolledIds.includes(slug)) : false;

    const { data: materials = [], isLoading: loadingMaterials } = useQuery({
        queryKey: ['course-materials', course?.id],
        queryFn: () => fetchCourseMaterials(course.id),
        enabled: !!course?.id && enrolled,
        staleTime: 1000 * 60 * 5,
    });

    const loading = loadingCourse || loadingEnrollments || (course && enrolled && loadingMaterials);
    let error = null;
    if (courseError) error = courseError.message;
    else if (enrollError) error = "Failed to verify enrollment";
    else if (!loading && course && !enrolled) error = "You are not enrolled in this course.";

    useSEO({
        title: course ? `Learning: ${course.title} | Whizan Courses` : 'Learning',
        description: course?.description || 'Learn comprehensive, structured engineering courses.',
        canonical: `/learn/${slug}`,
        robots: 'noindex, nofollow'
    });

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="#3b82f6" />
            </div>
        );
    }

    if (error || !course) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '2rem' }}>
                <Lock size={64} color="#ef4444" style={{ marginBottom: '1rem' }} />
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Access Denied</h1>
                <p style={{ color: 'var(--txt2)', marginBottom: '2rem' }}>{error}</p>
                <button 
                    onClick={() => navigate(`/courses/${slug}`)}
                    style={{ background: '#3b82f6', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                    Go Back to Course Page
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--txt)' }}>
            {/* Header Navbar */}
            <nav style={{ 
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(10, 10, 15, 0.8)', backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <button 
                    onClick={() => navigate('/dashboard')}
                    style={{ background: 'transparent', border: 'none', color: '#ccc', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem' }}
                >
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>
                <div style={{ fontWeight: 700, background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {course.title}
                </div>
                <div style={{ width: '100px' }}></div> {/* Spacer */}
            </nav>

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                
                {/* Hero / Overview Banner */}
                <div style={{
                    background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
                    padding: '3rem', display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'center',
                    marginBottom: '3rem', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ flex: '1 1 500px', zIndex: 2 }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                            <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <CheckCircle size={14} /> Enrolled
                            </span>
                            {course.timeline && (
                                <span style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#aaa', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Clock size={14} /> {course.timeline}
                                </span>
                            )}
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#fff', lineHeight: 1.2 }}>{course.title}</h1>
                        <p style={{ color: 'var(--txt2)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'pre-wrap' }}>
                            {course.description}
                        </p>

                        <button 
                            onClick={() => navigate(`/learn/${slug}/lecture`)}
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: '#fff', border: 'none', padding: '15px 32px', borderRadius: '12px',
                                fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: '10px',
                                boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)', transition: 'all 0.3s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
                        >
                            Start Learning <Play size={18} fill="currentColor" />
                        </button>
                    </div>

                    {/* Thumbnail */}
                    <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center', zIndex: 2 }}>
                        {course.thumbnailUrl ? (
                            <img src={course.thumbnailUrl} alt={course.title} style={{ width: '100%', maxWidth: '400px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }} />
                        ) : (
                            <div style={{ width: '100%', maxWidth: '400px', aspectRatio: '16/9', background: 'rgba(0,0,0,0.4)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <PlayCircle size={64} color="#666" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Course Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                    
                    {/* Materials Section */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileText size={24} color="#a855f7" /> Course Materials
                        </h2>

                        {materials.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <FolderArchive size={40} color="#444" style={{ margin: '0 auto 1rem' }} />
                                <p style={{ color: '#888', margin: 0 }}>No additional materials are available for this course yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {materials.map(mat => (
                                    <div key={mat.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '15px', padding: '15px',
                                        background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s'
                                    }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}>
                                            {getFileIcon(mat.type)}
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mat.name}</h4>
                                            <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: '#888' }}>
                                                <span>{mat.category}</span>
                                                <span>•</span>
                                                <span>{formatBytes(mat.size)}</span>
                                            </div>
                                        </div>
                                        <a 
                                            href={mat.url} target="_blank" rel="noreferrer"
                                            style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
                                            onMouseEnter={e => {e.currentTarget.style.background='#3b82f6'; e.currentTarget.style.color='#fff'}} 
                                            onMouseLeave={e => {e.currentTarget.style.background='rgba(59,130,246,0.1)'; e.currentTarget.style.color='#3b82f6'}}
                                        >
                                            <Download size={16} /> Open
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Course Breakdown / Syllabus Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {course.prerequisite && (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0 0 1rem 0' }}>Prerequisites</h3>
                                <div className="course-markdown-content" style={{ fontSize: '0.95rem', color: 'var(--txt2)' }}>
                                    <ReactMarkdown components={{ p: ({node, ...props}) => <p style={{ whiteSpace: 'pre-wrap', margin: 0 }} {...props} /> }}>{course.prerequisite}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                        {course.syllabus && (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '0 0 1rem 0' }}>Quick Syllabus</h3>
                                <div className="course-markdown-content" style={{ fontSize: '0.95rem', color: 'var(--txt2)' }}>
                                    <ReactMarkdown
                                        components={{
                                            h1: 'h4', h2: 'h4', h3: 'h5',
                                            p: ({node, ...props}) => <p style={{ whiteSpace: 'pre-wrap', margin: 0 }} {...props} />
                                        }}
                                    >{course.syllabus}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
