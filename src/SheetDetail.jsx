import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './contexts/AuthContext';
import { fetchStats, queryKeys } from './lib/api';
import { useSEO } from './hooks/useSEO';
import Neetcode150Tree from './components/Neetcode150Tree';
import { neetcode150 } from './data/neetcode150';
import { neetcode250 } from './data/neetcode250';
import NotificationBell from './components/NotificationBell';
import NavProfile from './NavProfile';
import { ArrowLeft, Lock } from 'lucide-react';

export default function SheetDetail() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { sheetId } = useParams();
    const uid = currentUser?.uid;

    useSEO({
        title: `${sheetId.charAt(0).toUpperCase() + sheetId.slice(1)} – Master DSA Problems | Whizan AI`,
        description: `Master High-Frequency DSA problems with the ${sheetId} roadmap. Track solved questions, analyze patterns, and ace your technical interviews with Whizan AI.`,
        canonical: `/sheets/${sheetId}`,
        keywords: `${sheetId}, dsa roadmap, leetcode patterns, technical interview prep, data structures, algorithms, whizan ai`,
        robots: 'index, follow',
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": `${sheetId} DSA Roadmap`,
            "description": `A curated collection of high-impact DSA problems for the ${sheetId} roadmap.`,
            "provider": {
                "@type": "Organization",
                "name": "Whizan AI",
                "sameAs": "https://whizan.xyz"
            },
            "url": `https://whizan.xyz/sheets/${sheetId}`,
            "offers": {
                "@type": "Offer",
                "category": "Free",
                "price": "0.00",
                "priceCurrency": "USD"
            }
        }
    });

    const { data: statsData, isLoading } = useQuery({
        queryKey: queryKeys.stats(uid),
        queryFn: () => fetchStats(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 5,
    });

    const solvedIds = statsData?.userStats?.solvedIds || [];

    const goBack = () => navigate('/sheets');

    let sheetData = null;
    let sheetTitle = "";
    let sheetDesc = "";

    if (sheetId === 'neetcode150') {
        sheetData = neetcode150;
        sheetTitle = "Neetcode 150";
        sheetDesc = "The ultimate 150 problem list to land a job at a top tech company.";
    } else if (sheetId === 'neetcode250') {
        sheetData = neetcode250;
        sheetTitle = "Neetcode 250";
        sheetDesc = "The expanded 250 problem list providing comprehensive coverage for all concepts.";
    }

    // Calculate total progress
    let totalProblems = 0;
    let totalSolved = 0;
    if (sheetData) {
        sheetData.forEach(cat => {
            totalProblems += cat.problems.length;
            cat.problems.forEach(p => {
                if (solvedIds.includes(String(p.id))) totalSolved++;
            });
        });
    }
    const progressPercentage = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            background: '#0a0b10',
            color: '#fff',
            fontFamily: "'Inter', system-ui, sans-serif",
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Top Navigation Bar */}
            <nav style={{
                height: '64px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 1.5rem',
                background: 'rgba(10, 11, 16, 0.95)', backdropFilter: 'blur(16px)',
                zIndex: 100
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
                    <button onClick={goBack} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
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
                        <button onClick={() => navigate('/login')} style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                            Sign In
                        </button>
                    )}
                </div>
            </nav>

            <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
                
                {/* Floating Overlay Header */}
                <div style={{
                    position: 'absolute', top: '24px', left: '24px', zIndex: 10,
                    display: 'flex', flexDirection: 'column', gap: '16px',
                    pointerEvents: 'none' // Let clicks pass through to map where possible
                }}>
                    <button 
                        onClick={goBack}
                        style={{ 
                            background: 'rgba(20, 22, 30, 0.8)', border: '1px solid rgba(255,255,255,0.1)', 
                            color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', 
                            cursor: 'pointer', padding: '8px 16px', borderRadius: '8px',
                            fontSize: '0.9rem', fontWeight: 600, backdropFilter: 'blur(12px)',
                            pointerEvents: 'auto', width: 'fit-content', transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(20, 22, 30, 0.8)'}
                    >
                        <ArrowLeft size={16} /> Back to Catalog
                    </button>

                    <div style={{ 
                        background: 'rgba(20, 22, 30, 0.8)', backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
                        padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '16px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)', pointerEvents: 'auto',
                        width: '320px'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0', color: '#fff' }}>{sheetTitle || 'Loading...'}</h2>
                            <p style={{ color: 'var(--txt2)', margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
                                {sheetDesc || 'Please wait while we load the roadmap.'}
                            </p>
                        </div>
                        
                        {currentUser ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--txt3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Progress</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{progressPercentage}%</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4ade80' }}>{totalSolved}</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--txt3)' }}> / {totalProblems}</span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(79, 70, 229, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 600 }}>
                                    <Lock size={16} /> Tracking Paused
                                </div>
                                <button onClick={() => navigate('/login')} style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                                    Sign In
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {isLoading && !!uid ? (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt3)', zIndex: 1 }}>
                        Loading intelligence...
                    </div>
                ) : (
                    sheetData ? (
                        <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0 }}>
                            <Neetcode150Tree 
                                sheetData={sheetData}
                                solvedIds={solvedIds} 
                                isTrackingEnabled={!!currentUser} 
                            />
                        </div>
                    ) : (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--txt3)', zIndex: 1, gap: '12px' }}>
                            <h2 style={{ margin: 0, color: '#fff' }}>Sheet not found</h2>
                            <p style={{ margin: 0 }}>This curated roadmap doesn't exist yet.</p>
                            <button onClick={goBack} style={{ marginTop: '16px', background: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                Return to Catalog
                            </button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
