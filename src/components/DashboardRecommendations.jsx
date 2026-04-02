import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import {
    Loader2, Compass, ArrowRight, Play, BrainCircuit, Sparkles,
    Brain, Zap, ChevronRight, BookOpen, AlertCircle
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration-55z3.onrender.com';

// ─── Difficulty color map ────────────────────────────────────────────────────

const DIFF_COLOR = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };
const DIFF_BG = {
    Easy: 'rgba(16,185,129,0.1)',
    Medium: 'rgba(245,158,11,0.1)',
    Hard: 'rgba(239,68,68,0.1)',
};

// ─── Data fetchers ───────────────────────────────────────────────────────────

async function fetchPublicCourses() {
    const res = await fetch(`${BACKEND_URL}/api/public/courses`);
    if (!res.ok) throw new Error('Failed to fetch courses');
    const data = await res.json();
    return data.courses || [];
}

async function fetchMLRecommendations(uid) {
    if (!uid) return null;
    const res = await fetch(`${BACKEND_URL}/api/recommendations/${uid}`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
}

// ─── ML Problem Card ─────────────────────────────────────────────────────────

function ProblemCard({ item, index, onNavigate }) {
    const diff = item.difficulty || 'Medium';
    return (
        <div
            onClick={() => onNavigate(`/dsaquestion?search=${encodeURIComponent(item.title)}`)}
            style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px',
                padding: '1rem 1.25rem',
                cursor: 'pointer',
                transition: 'all 0.25s',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.07)';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.transform = 'translateX(0)';
            }}
        >
            {/* Priority Number */}
            <div style={{
                width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                border: '1px solid rgba(99,102,241,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 800, color: '#818cf8',
            }}>
                {index + 1}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                    </span>
                    <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                        background: DIFF_BG[diff], color: DIFF_COLOR[diff],
                        border: `1px solid ${DIFF_COLOR[diff]}30`, flexShrink: 0,
                    }}>
                        {diff}
                    </span>
                </div>

                {/* Topics */}
                {item.topics?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                        {item.topics.slice(0, 3).map(t => (
                            <span key={t} style={{
                                fontSize: '0.68rem', padding: '2px 7px', borderRadius: '6px',
                                background: 'rgba(255,255,255,0.06)', color: 'var(--txt2)', fontWeight: 500,
                            }}>
                                {t}
                            </span>
                        ))}
                    </div>
                )}

                {/* AI Reason */}
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--txt2)', lineHeight: 1.4 }}>
                    <Zap size={10} color="#818cf8" style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    {item.reason}
                </p>

                {/* Confidence Bar */}
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 999 }}>
                        <div style={{
                            width: `${Math.round((item.confidenceScore || 0.5) * 100)}%`,
                            height: '100%', borderRadius: 999,
                            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        }} />
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#818cf8', fontWeight: 600, flexShrink: 0 }}>
                        {Math.round((item.confidenceScore || 0.5) * 100)}% match
                    </span>
                </div>
            </div>

            <ChevronRight size={14} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0, marginTop: 4 }} />
        </div>
    );
}

// ─── ML Recommendations Section ──────────────────────────────────────────────

function MLProblemsSection({ uid }) {
    const navigate = useNavigate();

    const { data: recData, isLoading, isError } = useQuery({
        queryKey: ['ml-recommendations', uid],
        queryFn: () => fetchMLRecommendations(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 10, // 10min
    });

    const items = recData?.items || [];
    const updatedAt = recData?.updatedAt;

    // Skeleton loader
    if (isLoading) {
        return (
            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ width: 220, height: 20, borderRadius: 8, background: 'rgba(255,255,255,0.06)' }} />
                </div>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{
                        height: 80, borderRadius: 16, background: 'rgba(255,255,255,0.03)',
                        marginBottom: 10, animation: `shimmer 1.5s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                ))}
                <style>{`@keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
            </div>
        );
    }

    // Empty state — no recommendations yet
    if (!items.length) {
        return (
            <div style={{
                marginBottom: '3rem',
                background: 'rgba(99,102,241,0.04)',
                border: '1px dashed rgba(99,102,241,0.2)',
                borderRadius: '20px',
                padding: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
            }}>
                <div style={{
                    width: 56, height: 56, borderRadius: '14px', flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
                    border: '1px solid rgba(99,102,241,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Brain size={26} color="#818cf8" />
                </div>
                <div>
                    <h3 style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '1rem' }}>
                        Personalized Problems on the Way
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--txt2)', lineHeight: 1.5 }}>
                        Your personalized problem recommendations will appear here after the AI analyses your interview history.
                        Complete a mock interview or ask an admin to trigger your recommendations.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '3rem', animation: 'cardAppear 0.5s ease-out 0.55s both' }}>
            {/* Section header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '10px',
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
                            border: '1px solid rgba(99,102,241,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Brain size={18} color="#818cf8" />
                        </div>
                        AI-Picks For You
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--txt2)', paddingLeft: '46px' }}>
                        Personalized based on your interview performance
                        {updatedAt && (
                            <span style={{ opacity: 0.5, marginLeft: '6px', fontSize: '0.75rem' }}>
                                · updated {new Date(updatedAt).toLocaleDateString()}
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/dsaquestion')}
                    style={{
                        background: 'transparent', border: 'none', color: '#818cf8',
                        fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                >
                    All Problems <ArrowRight size={14} />
                </button>
            </div>

            {/* Problem list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.slice(0, 8).map((item, i) => (
                    <ProblemCard key={item.problemId} item={item} index={i} onNavigate={navigate} />
                ))}
            </div>
        </div>
    );
}

// ─── Main Export (Courses + ML Problems combined) ────────────────────────────

export default function DashboardRecommendations({ userStats, interviews }) {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;

    const { data: courses = [], isLoading } = useQuery({
        queryKey: ['public-courses'],
        queryFn: fetchPublicCourses,
        staleTime: 1000 * 60 * 5,
    });

    // Course recommendation logic (preserved from original)
    const recommendedCourses = useMemo(() => {
        if (!courses || courses.length === 0) return { courses: [], title: '', reason: '' };

        const hardSolved = userStats?.Hard || 0;
        const mediumSolved = userStats?.Medium || 0;
        const totalSolved = userStats?.Total || 0;

        let keywords = [];
        let recommendationReason = "Based on your current activity";
        let recommendationTitle = "Recommended for You";

        if (hardSolved >= 10 || totalSolved >= 150) {
            keywords = ["system design", "advanced", "architecture", "scaling", "hld", "lld"];
            recommendationTitle = "Advanced Pathways";
            recommendationReason = "Because you're crushing Hard problems";
        } else if (mediumSolved >= 20 || totalSolved >= 50) {
            keywords = ["algorithms", "backend", "full stack", "dynamic programming", "graphs"];
            recommendationTitle = "Level Up Your Skills";
            recommendationReason = "To master medium & advanced topics";
        } else {
            keywords = ["basics", "data structures", "frontend", "arrays", "strings", "beginner"];
            recommendationTitle = "Build Your Foundation";
            recommendationReason = "Perfect starting points for your journey";
        }

        const validInterviews = interviews?.filter(inv => inv.overallScore > 0) || [];
        if (validInterviews.length > 0) {
            const avgScore = validInterviews.reduce((s, i) => s + i.overallScore, 0) / validInterviews.length;
            if (avgScore < 60) {
                keywords.push("interview", "prep", "communication", "behavioral");
                recommendationReason = "To boost your mock interview scores";
            }
        }

        let filtered = courses;
        if (keywords.length > 0) {
            const scoredCourses = courses.map(course => {
                const textToSearch = `${course.title || ''} ${course.description || ''} ${course.tags?.join(' ') || ''}`.toLowerCase();
                let score = 0;
                keywords.forEach(kw => { if (textToSearch.includes(kw.toLowerCase())) score += 1; });
                return { ...course, matchScore: score };
            });
            scoredCourses.sort((a, b) => b.matchScore - a.matchScore);
            filtered = scoredCourses[0]?.matchScore === 0 ? courses : scoredCourses.filter(c => c.matchScore > 0);
        }

        return { courses: filtered.slice(0, 3), title: recommendationTitle, reason: recommendationReason };
    }, [courses, userStats, interviews]);

    return (
        <>
            {/* ── ML Problem Recommendations (new section) ── */}
            {uid && <MLProblemsSection uid={uid} />}

            {/* ── Course Recommendations (original section) ── */}
            {!isLoading && recommendedCourses.courses.length > 0 && (
                <div style={{ marginBottom: '3rem', animation: 'cardAppear 0.5s ease-out 0.6s both' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BrainCircuit size={18} color="#60a5fa" />
                                </div>
                                {recommendedCourses.title}
                            </h2>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--txt2)', paddingLeft: '46px' }}>
                                {recommendedCourses.reason}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/courses')}
                            style={{ background: 'transparent', border: 'none', color: '#a855f7', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#c084fc'}
                            onMouseLeave={e => e.currentTarget.style.color = '#a855f7'}
                        >
                            View Curriculum <ArrowRight size={16} />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {recommendedCourses.courses.map(course => (
                            <div
                                key={course.id}
                                onClick={() => navigate(`/courses/${course.slug}`)}
                                style={{ background: 'rgba(20, 22, 30, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', display: 'flex', flexDirection: 'column', position: 'relative', backdropFilter: 'blur(12px)' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; e.currentTarget.style.background = 'rgba(20, 22, 30, 0.8)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(59,130,246,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(20, 22, 30, 0.4)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ position: 'relative', height: '160px', width: '100%', overflow: 'hidden' }}>
                                    {course.thumbnailUrl ? (
                                        <div style={{ height: '100%', width: '100%', background: `url(${course.thumbnailUrl}) center / cover no-repeat`, transition: 'transform 0.5s' }} />
                                    ) : (
                                        <div style={{ height: '100%', width: '100%', background: 'linear-gradient(135deg, #1e1e2d 0%, #151521 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Compass size={40} color="rgba(255,255,255,0.1)" />
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
                                        <Sparkles size={12} fill="#eab308" color="#eab308" /> Recommended
                                    </div>
                                </div>

                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', color: '#60a5fa', textTransform: 'uppercase' }}>{course.level || 'All Levels'}</span>
                                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--txt3)' }}>{course.duration || 'Self-paced'}</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 10px 0', lineHeight: 1.3, color: '#fff' }}>{course.title}</h3>
                                    <p style={{ color: 'var(--txt2)', fontSize: '0.85rem', margin: '0 0 20px 0', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>{course.description}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>Explore <ArrowRight size={14} color="#60a5fa" /></span>
                                        <div style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Play size={14} fill="currentColor" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
