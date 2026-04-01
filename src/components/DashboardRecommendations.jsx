import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Compass, ArrowRight, Play, BookOpen, BrainCircuit, Sparkles } from 'lucide-react';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

async function fetchPublicCourses() {
    const res = await fetch(`${VITE_API_BASE_URL}/api/public/courses`);
    if (!res.ok) throw new Error('Failed to fetch courses');
    const data = await res.json();
    return data.courses || [];
}

export default function DashboardRecommendations({ userStats, interviews }) {
    const navigate = useNavigate();

    const { data: courses = [], isLoading } = useQuery({
        queryKey: ['public-courses'],
        queryFn: fetchPublicCourses,
        staleTime: 1000 * 60 * 5,
    });

    // Determine user level and interests
    const recommendedCourses = useMemo(() => {
        if (!courses || courses.length === 0) return [];
        
        const hardSolved = userStats?.Hard || 0;
        const mediumSolved = userStats?.Medium || 0;
        const easySolved = userStats?.Easy || 0;
        const totalSolved = userStats?.Total || 0;

        // Default to showing popular or new courses
        let keywords = [];
        let recommendationReason = "Based on your current activity";
        let recommendationTitle = "Recommended for You";

        // Logic for advanced user recommendations
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

        // Check if they do mock interviews and struggle
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
            // Give each course a score based on keyword match
            const scoredCourses = courses.map(course => {
                const textToSearch = `${course.title || ''} ${course.description || ''} ${course.tags?.join(' ') || ''}`.toLowerCase();
                let score = 0;
                keywords.forEach(kw => {
                    if (textToSearch.includes(kw.toLowerCase())) score += 1;
                });
                return { ...course, matchScore: score };
            });

            // Sort by score
            scoredCourses.sort((a, b) => b.matchScore - a.matchScore);
            
            // If they all have 0 match score, just return the newest ones
            if (scoredCourses[0] && scoredCourses[0].matchScore === 0) {
                filtered = courses;
            } else {
                filtered = scoredCourses.filter(c => c.matchScore > 0);
            }
        }

        return {
             courses: filtered.slice(0, 3), // Show top 3
             title: recommendationTitle,
             reason: recommendationReason
        };
    }, [courses, userStats, interviews]);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                <Loader2 className="animate-spin" size={30} color="#666" />
            </div>
        );
    }

    if (recommendedCourses.courses.length === 0) {
        return null;
    }

    return (
        <div style={{ marginBottom: '3rem', animation: 'cardAppear 0.5s ease-out 0.6s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                     <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                         <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                        style={{
                            background: 'rgba(20, 22, 30, 0.4)', 
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '20px', 
                            overflow: 'hidden', 
                            cursor: 'pointer', 
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            display: 'flex', 
                            flexDirection: 'column',
                            position: 'relative',
                            backdropFilter: 'blur(12px)'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)';
                            e.currentTarget.style.background = 'rgba(20, 22, 30, 0.8)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(59,130,246,0.1)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                            e.currentTarget.style.background = 'rgba(20, 22, 30, 0.4)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ position: 'relative', height: '160px', width: '100%', overflow: 'hidden' }}>
                            {course.thumbnailUrl ? (
                                <div style={{ height: '100%', width: '100%', background: `url(${course.thumbnailUrl}) center / cover no-repeat`, transition: 'transform 0.5s' }} className="course-thumb" />
                            ) : (
                                <div style={{ height: '100%', width: '100%', background: 'linear-gradient(135deg, #1e1e2d 0%, #151521 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Compass size={40} color="rgba(255,255,255,0.1)" />
                                </div>
                            )}
                            {/* Premium Overlay Badge */}
                            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
                                <Sparkles size={12} fill="#eab308" color="#eab308" /> Recommended
                            </div>
                        </div>

                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', color: '#60a5fa', textTransform: 'uppercase' }}>
                                    {course.level || 'All Levels'}
                                </span>
                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></span>
                                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--txt3)' }}>
                                    {course.duration || 'Self-paced'}
                                </span>
                            </div>
                            
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 10px 0', lineHeight: 1.3, color: '#fff' }}>
                                {course.title}
                            </h3>
                            
                            <p style={{ color: 'var(--txt2)', fontSize: '0.85rem', margin: '0 0 20px 0', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
                                {course.description}
                            </p>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    Explore <ArrowRight size={14} color="#60a5fa" />
                                </span>
                                <div style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Play size={14} fill="currentColor" />
                                </div>
                            </div>
                        </div>
                        <style>{`
                            div:hover > div > .course-thumb {
                                transform: scale(1.05);
                            }
                        `}</style>
                    </div>
                ))}
            </div>
        </div>
    );
}
