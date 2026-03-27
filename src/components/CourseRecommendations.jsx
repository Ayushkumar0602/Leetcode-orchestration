import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Youtube, Sparkles, ArrowRight, BookOpen } from 'lucide-react';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

async function fetchPublicCourses() {
    const res = await fetch(`${VITE_API_BASE_URL}/api/public/courses`);
    if (!res.ok) throw new Error('Failed to fetch courses');
    const data = await res.json();
    return data.courses || [];
}

export default function CourseRecommendations({ 
    title = "Accelerate Your Learning", 
    keywords = [], 
    limit = 6
}) {
    const navigate = useNavigate();

    const { data: courses = [], isLoading } = useQuery({
        queryKey: ['public-courses'],
        queryFn: fetchPublicCourses,
        staleTime: 1000 * 60 * 5,
    });

    const recommendedCourses = useMemo(() => {
        if (!courses || courses.length === 0) return [];
        let filtered = courses;
        if (keywords && keywords.length > 0) {
            filtered = courses.filter(course => {
                const textToSearch = `${course.title || ''} ${course.description || ''}`.toLowerCase();
                return keywords.some(kw => textToSearch.includes(kw.toLowerCase()));
            });
        }
        return filtered.slice(0, limit);
    }, [courses, keywords, limit]);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                <Loader2 className="animate-spin" size={30} color="#666" />
            </div>
        );
    }

    if (recommendedCourses.length === 0) {
        return null;
    }

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(168,85,247,0.1)' }}>
                    <Sparkles size={20} color="#c084fc" />
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.5px' }}>
                    {title}
                </h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {recommendedCourses.map(course => (
                    <div
                        key={course.id}
                        onClick={() => navigate(`/courses/${course.slug}`)}
                        style={{
                            background: 'rgba(255,255,255,0.02)', 
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '20px', 
                            overflow: 'hidden', 
                            cursor: 'pointer', 
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            display: 'flex', 
                            flexDirection: 'column',
                            position: 'relative',
                            backdropFilter: 'blur(20px)'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4), 0 0 40px rgba(168,85,247,0.1)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ position: 'relative', height: '190px', width: '100%' }}>
                            {course.thumbnailUrl ? (
                                <div style={{ height: '100%', width: '100%', background: `url(${course.thumbnailUrl}) center / cover no-repeat` }} />
                            ) : (
                                <div style={{ height: '100%', width: '100%', background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(168,85,247,0.15) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Youtube size={40} color="rgba(255,255,255,0.2)" />
                                </div>
                            )}
                            {/* Gradient Overlay for text readability */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, rgba(15,15,15,0.95), transparent)' }}></div>
                        </div>

                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', marginTop: '-15px', position: 'relative', zIndex: 2 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0', lineHeight: 1.4, color: '#fff', letterSpacing: '-0.3px' }}>
                                {course.title}
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: '0 0 15px 0', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
                                {course.description}
                            </p>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: 'transparent', backgroundImage: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', backgroundClip: 'text', fontSize: '0.9rem', fontWeight: 600 }}>Start Learning</span>
                                    <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em' }}>FREE</span>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                                    <ArrowRight size={14} color="#a855f7" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button 
                    onClick={() => navigate('/courses')}
                    style={{ 
                        marginTop: '0.5rem', width: '100%', 
                        background: 'rgba(59,130,246,0.1)', color: '#60a5fa', 
                        border: '1px solid rgba(59,130,246,0.3)', padding: '14px 20px', 
                        borderRadius: '16px', fontWeight: 600, cursor: 'pointer', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                        transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' 
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                    <BookOpen size={18} /> Explore All Courses
                </button>
            </div>
        </div>
    );
}
