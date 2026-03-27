import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle, Loader2, Youtube, Search } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import NavProfile from './NavProfile';
import { useSEO } from './hooks/useSEO';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

// ─── Fetchers ────────────────────────────────────────────────────────────────

async function fetchPublicCourses() {
    const res = await fetch(`${VITE_API_BASE_URL}/api/public/courses`);
    if (!res.ok) throw new Error('Failed to fetch courses');
    const data = await res.json();
    return data.courses || [];
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
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ uid: currentUser.uid })
    });
    if (!res.ok) throw new Error('Failed to enroll');
    return res.json();
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
    { id: 'all', label: 'All Topics' },
    { id: 'system-design', label: 'System Design', keywords: ['system design', 'hld', 'lld', 'architecture'] },
    { id: 'dsa', label: 'Data Structures & Algorithms', keywords: ['dsa', 'algorithm', 'data structure', 'leetcode', 'c++'] },
    { id: 'programming', label: 'Programming & CS', keywords: ['python', 'java', 'c++', 'oop', 'computer science', 'operating system'] },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Courses() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const filter = searchParams.get('filter') || 'all';

    useSEO({
        title: 'Tech & Programming Courses - Whizan',
        description: 'Master system design, algorithms, and real-world engineering with structured interactive courses.',
        canonical: '/courses',
        robots: 'index, follow'
    });

    // ── Queries ──────────────────────────────────────────────────────────────

    const { data: courses = [], isLoading: loadingCourses } = useQuery({
        queryKey: ['public-courses'],
        queryFn: fetchPublicCourses,
    });

    const { data: enrolledIds = [] } = useQuery({
        queryKey: ['enrolled-ids', currentUser?.uid],
        queryFn: () => fetchEnrolledIds(currentUser),
        enabled: !!currentUser,
    });

    // ── Mutation ─────────────────────────────────────────────────────────────

    const enrollMutation = useMutation({
        mutationFn: enrollInCourse,
        onSuccess: () => {
            // Invalidate so both lists refresh from cache or network
            queryClient.invalidateQueries({ queryKey: ['enrolled-ids', currentUser?.uid] });
        },
        onError: () => alert('Failed to enroll. Please try again.'),
    });

    // ── Helpers ──────────────────────────────────────────────────────────────

    const isEnrolled = (courseId) => enrolledIds.includes(courseId);

    const handleEnroll = (slug) => {
        if (!currentUser) { navigate('/login?redirect=/courses'); return; }
        enrollMutation.mutate({ slug, currentUser });
    };

    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            // 1. Status Filter
            if (filter === 'enrolled' && !isEnrolled(course.id)) return false;
            if (filter === 'not-enrolled' && isEnrolled(course.id)) return false;

            // 2. Search Query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const titleMatch = course.title?.toLowerCase().includes(query);
                const descMatch = course.description?.toLowerCase().includes(query);
                if (!titleMatch && !descMatch) return false;
            }

            // 3. Category Filter
            if (categoryFilter !== 'all') {
                const cat = CATEGORIES.find(c => c.id === categoryFilter);
                if (cat && cat.keywords) {
                    const textToSearch = `${course.title || ''} ${course.description || ''}`.toLowerCase();
                    const matchesCategory = cat.keywords.some(kw => textToSearch.includes(kw));
                    if (!matchesCategory) return false;
                }
            }

            return true;
        });
    }, [courses, filter, searchQuery, categoryFilter, enrolledIds]);

    const loading = loadingCourses;

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

                {/* Search and Filters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
                    {/* Search Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0 16px', height: '48px', transition: 'all 0.2s', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                        <Search size={20} color="#666" style={{ marginRight: '12px', flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Search courses by title or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '1rem', outline: 'none' }}
                        />
                    </div>

                    {/* Filter Pills */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        {/* Categories */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategoryFilter(cat.id)}
                                    style={{
                                        background: categoryFilter === cat.id ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)',
                                        border: categoryFilter === cat.id ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.1)',
                                        color: categoryFilter === cat.id ? '#c084fc' : '#aaa',
                                        padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Status Filter */}
                        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {['all', 'enrolled', 'not-enrolled'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setSearchParams({ filter: f })}
                                    style={{
                                        background: filter === f ? 'rgba(59,130,246,0.15)' : 'transparent',
                                        border: filter === f ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                                        color: filter === f ? '#60a5fa' : '#888',
                                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize'
                                    }}
                                >
                                    {f.replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
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
                                    onClick={() => navigate(`/courses/${course.slug}`)}
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
                                        <p style={{ color: 'var(--txt3)', fontSize: '0.9rem', margin: '0 0 20px 0', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', whiteSpace: 'pre-wrap' }}>
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
                                                    else navigate(`/courses/${course.slug}`);
                                                }}
                                                disabled={enrollMutation.isPending}
                                                style={{
                                                    background: enrolled ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                                                    border: enrolled ? '1px solid rgba(16,185,129,0.2)' : 'none',
                                                    color: enrolled ? '#10b981' : '#fff',
                                                    padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                                                    cursor: enrollMutation.isPending ? 'wait' : 'pointer',
                                                    transition: 'background 0.2s'
                                                }}
                                            >
                                                {enrolled ? 'Continue' : 'View Details'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
