import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useSEO } from './hooks/useSEO';
import NotificationBell from './components/NotificationBell';
import NavProfile from './NavProfile';
import CourseRecommendations from './components/CourseRecommendations';
import { BookOpen, Star, Lock, Clock, CheckCircle2 } from 'lucide-react';

export default function DSASheets() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();


    const sheets = [
        {
            id: 'neetcode150',
            title: 'Neetcode 150',
            description: 'The ultimate problem list to land a job at a top tech company. Covers all major patterns.',
            problemsCount: 150,
            icon: Star,
            color: '#a855f7',
            available: true
        },
        {
            id: 'neetcode250',
            title: 'Neetcode 250',
            description: 'The expanded 250 problem list providing comprehensive coverage for all concepts and patterns.',
            problemsCount: 250,
            icon: BookOpen,
            color: '#ec4899',
            available: true
        },
        {
            id: 'blind75',
            title: 'Blind 75',
            description: 'The classic 75 problems that cover all the core data structures and algorithms concepts.',
            problemsCount: 75,
            icon: BookOpen,
            color: '#3b82f6',
            available: false
        },
        {
            id: 'striver',
            title: "Striver's SDE Sheet",
            description: 'A comprehensive list of problems widely asked in big tech companies and startups.',
            problemsCount: 190,
            icon: CheckCircle2,
            color: '#10b981',
            available: false
        }
    ];

    useSEO({
        title: 'DSA Sheets Catalog – Whizan AI',
        description: 'Explore curated roadmaps and lists to master Data Structures and Algorithms with Whizan AI. Track your progress globally across Neetcode, Blind 75, and more.',
        canonical: '/sheets',
        keywords: 'dsa sheets, neetcode 150, blind 75, dsa roadmap, algorithm practice, data structures, technical interview prep, whizan ai',
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "DSA Sheets & Interview Roadmaps",
            "description": "Curated collections of high-impact DSA problems for software engineering interviews.",
            "url": "https://whizan.xyz/sheets",
            "numberOfItems": sheets.filter(s => s.available).length,
            "itemListElement": sheets.filter(s => s.available).map((sheet, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://whizan.xyz/sheets/${sheet.id}`,
                "name": sheet.title
            }))
        }
    });

    return (
        <div style={{
            minHeight: '100vh',
            background: '#050505',
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(59,130,246,0.1) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(168,85,247,0.05) 0%, transparent 40%)',
            color: '#fff',
            fontFamily: "'Inter', system-ui, sans-serif"
        }}>
            {/* Top Navigation Bar */}
            <nav style={{
                height: '64px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 1.5rem',
                background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)',
                position: 'sticky', top: 0, zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: '1 1 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <img src="/logo.jpeg" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Whizan AI</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 0', justifyContent: 'center' }}>
                    <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--txt2)'}>
                        Dashboard
                    </button>
                    <button style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                        DSA Sheets
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 0', justifyContent: 'flex-end' }}>
                    {currentUser ? (
                        <>
                            <NotificationBell />
                            <NavProfile />
                        </>
                    ) : (
                        <button onClick={() => navigate('/login')} style={{ background: '#a855f7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                            Sign In
                        </button>
                    )}
                </div>
            </nav>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '4rem 2rem', display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
                
                {/* Main Content Area (Left) */}
                <div style={{ flex: '1 1 700px', display: 'flex', flexDirection: 'column' }}>
                    {/* Page Heading */}
                    <div style={{ marginBottom: '4rem', animation: 'fadeScale 0.6s ease-out' }}>
                        <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 16px 0', letterSpacing: '-0.03em', background: 'linear-gradient(to right, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                            DSA Sheet Catalog
                        </h1>
                        <p style={{ color: 'var(--txt2)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.6, margin: 0 }}>
                            Choose a curated problem list. Track your progress globally and master the patterns needed to ace tech interviews.
                        </p>
                    </div>

                    {/* Sheets Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', animation: 'fadeScale 0.6s ease-out 0.2s both' }}>
                    {sheets.map((sheet) => (
                        <div 
                            key={sheet.id}
                            onClick={() => {
                                if(sheet.available) navigate(`/sheets/${sheet.id}`);
                            }}
                            style={{
                                background: 'rgba(20, 22, 30, 0.4)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '24px',
                                padding: '2rem',
                                cursor: sheet.available ? 'pointer' : 'not-allowed',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                backdropFilter: 'blur(12px)',
                                opacity: sheet.available ? 1 : 0.6
                            }}
                            onMouseEnter={e => {
                                if(sheet.available) {
                                    e.currentTarget.style.transform = 'translateY(-6px)';
                                    e.currentTarget.style.borderColor = `${sheet.color}50`;
                                    e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3), 0 0 30px ${sheet.color}20`;
                                }
                            }}
                            onMouseLeave={e => {
                                if(sheet.available) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }
                            }}
                        >
                            {!sheet.available && (
                                <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={14} /> Coming Soon
                                </div>
                            )}

                            <div style={{ 
                                width: '56px', height: '56px', borderRadius: '16px', 
                                background: `linear-gradient(135deg, ${sheet.color}30, ${sheet.color}10)`,
                                border: `1px solid ${sheet.color}40`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                marginBottom: '1.5rem', color: sheet.color 
                            }}>
                                <sheet.icon size={28} />
                            </div>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 12px 0', color: '#fff' }}>
                                {sheet.title}
                            </h2>
                            <p style={{ color: 'var(--txt2)', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 24px 0', minHeight: '66px' }}>
                                {sheet.description}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--txt3)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {sheet.problemsCount} Problems
                                </span>
                                {sheet.available && (
                                    <span style={{ color: sheet.color, fontWeight: 600, fontSize: '0.9rem' }}>
                                        Open Sheet &rarr;
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                </div>

                {/* Sidebar (Right) */}
                <div style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', animation: 'fadeInRight 0.6s ease-out 0.4s both' }}>
                    <CourseRecommendations 
                        title="Relevant Courses"
                        keywords={['dsa', 'data structure', 'algorithm', 'striver']}
                        limit={3}
                    />
                </div>
            </div>
            <style>{`
                @keyframes fadeScale {
                    from { opacity: 0; transform: scale(0.95) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes fadeInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
