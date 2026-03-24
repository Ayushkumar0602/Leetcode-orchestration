import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { CheckCircle, Lock, Play, Menu, X, ArrowLeft, Loader2, Youtube, Layers, PlayCircle, ChevronDown, ChevronUp, Code2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useSEO } from './hooks/useSEO';
import { useQuery } from '@tanstack/react-query';
import NavProfile from './NavProfile';
import VideoCodeEditor from './VideoCodeEditor';
import LectureChatBot from './LectureChatBot';
import LecturePractice from './LecturePractice';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

const YOUTUBE_API_KEYS = [
    'AIzaSyCoBeOf90UzMby6rZmIFInhS2DHhbAzbS4',
    'AIzaSyDvdyjYPX0MTlDPEwWIiCW1MdtQ6K9ri6Y',
    'AIzaSyACa-hDsfwmTJ4lQHx-EThm8s4-i5fJbnA'
];

async function fetchCourse(slug) {
    const res = await fetch(`${VITE_API_BASE_URL}/api/public/courses/${slug}`);
    if (!res.ok) throw new Error('Course not found');
    return res.json();
}

async function fetchEnrolledIds(currentUser) {
    const token = await currentUser.getIdToken();
    const res = await fetch(`${VITE_API_BASE_URL}/api/courses/${currentUser.uid}/enrolled`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to verify enrollment');
    const data = await res.json();
    return data.enrolledIds || [];
}

async function fetchFullYoutubePlaylist(url) {
    let playlistId = null;
    if (url.includes('playlist?list=')) {
        playlistId = new URL(url).searchParams.get('list');
    } else {
        const sp = new URL(url).searchParams;
        if (sp.has('list')) playlistId = sp.get('list');
    }
    
    if (!playlistId) throw new Error("No valid playlist ID found in the course link. Attempting to load as single video.");

    let allItems = [];
    let pageToken = '';
    
    let pageCount = 0;
    while (pageCount < 6) {
        let success = false;
        let data = null;
        for (let i = 0; i < YOUTUBE_API_KEYS.length; i++) {
            try {
                const tokenParam = pageToken ? `&pageToken=${pageToken}` : '';
                const apiRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEYS[i]}${tokenParam}`);
                data = await apiRes.json();
                if (apiRes.ok) {
                    success = true;
                    break;
                }
            } catch (err) {}
        }
        
        if (!success) {
            if (allItems.length > 0) break;
            throw new Error("Failed to load playlist. Quota exceeded or playlist is private.");
        }
        
        const validVideos = (data.items || []).filter(item => item.snippet.title !== 'Private video' && item.snippet.title !== 'Deleted video');
        allItems.push(...validVideos);
        
        if (!data.nextPageToken) break;
        pageToken = data.nextPageToken;
        pageCount++;
    }
    
    if (allItems.length === 0) throw new Error("This playlist contains no public videos.");
    return allItems;
}

export default function LearnCourseLecture() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isPlaylistVisible, setIsPlaylistVisible] = useState(true);
    const [isEditorVisible, setIsEditorVisible] = useState(false);
    // 'playlist' | 'editor' | 'ai' — only one panel shown at a time on desktop
    const [activePanel, setActivePanel] = useState('playlist');
    const [aiExpanded, setAiExpanded] = useState(false);
    const editorRef = useRef(null); // bridge to VideoCodeEditor for AI chatbot

    // When AI chat opens → auto-switch sidebar to 'ai'. When closed → restore 'playlist'.
    const handleAiExpandChange = (expanded) => {
        setAiExpanded(expanded);
        setActivePanel(expanded ? 'ai' : 'playlist');
    };

    useEffect(() => {
        if (!currentUser) navigate(`/login?redirect=/learn/${slug}/lecture`);
    }, [currentUser, navigate, slug]);

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

    const isEnrolled = course ? (enrolledIds.includes(course.id) || enrolledIds.includes(slug)) : false;

    const { data: playlistVideos = [], isLoading: loadingPlaylist, error: playlistErrorObj } = useQuery({
        queryKey: ['youtube-playlist', course?.youtubePlaylistLink],
        queryFn: () => fetchFullYoutubePlaylist(course.youtubePlaylistLink),
        enabled: !!course?.youtubePlaylistLink && isEnrolled,
        staleTime: 1000 * 60 * 60,
    });

    const loading = loadingCourse || loadingEnrollments || (course && isEnrolled && loadingPlaylist);
    
    let errorMsg = '';
    if (courseError) errorMsg = courseError.message;
    else if (enrollError) errorMsg = enrollError.message;
    else if (!loading && course && !isEnrolled) errorMsg = 'Course not found or not enrolled.';
    
    const playlistError = playlistErrorObj ? playlistErrorObj.message : (course && !course.youtubePlaylistLink && !loading ? "No YouTube link provided for this course." : '');

    const currentVideoTitle = playlistVideos[currentVideoIndex]?.snippet?.title;
    useSEO({
        title: currentVideoTitle && course ? `${currentVideoTitle} - ${course.title}` : (course ? course.title : 'Lecture'),
        description: course?.description || 'Learn comprehensive, structured engineering courses.',
        canonical: `/learn/${slug}/lecture`,
        robots: 'noindex, nofollow'
    });

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={40} className="animate-spin" color="#3b82f6" />
                <p style={{ color: '#fff', marginTop: '15px' }}>Verifying Access...</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Youtube size={48} color="#ef4444" style={{ marginBottom: '20px' }} />
                <h2>Oops!</h2>
                <p style={{ color: 'var(--txt2)' }}>{errorMsg}</p>
                <button 
                    onClick={() => navigate('/courses')}
                    style={{ marginTop: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
                >
                    Back to Course Catalog
                </button>
            </div>
        );
    }

    if (!course) return null;

    const getSingleVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    let embedUrl = null;
    let playingTitle = course.title;
    let playingDesc = course.description;

    if (playlistVideos.length > 0) {
        const currentItem = playlistVideos[currentVideoIndex];
        embedUrl = `https://www.youtube.com/embed/${currentItem.snippet.resourceId.videoId}?autoplay=1&rel=0&modestbranding=1`;
        playingTitle = currentItem.snippet.title;
        playingDesc = currentItem.snippet.description;
    } else {
        const vidId = getSingleVideoId(course.youtubePlaylistLink);
        if (vidId) embedUrl = `https://www.youtube.com/embed/${vidId}?rel=0&modestbranding=1`;
    }

    return (
        <div style={{ height: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <style>{`
                .lecture-layout {
                    flex: 1;
                    display: flex;
                    flex-direction: row;
                    overflow: hidden;
                }
                .lecture-sidebar {
                    width: 400px;
                    border-left: 1px solid rgba(255,255,255,0.05);
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    overflow-y: hidden;
                }
                .lecture-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background-color: #000;
                    overflow-y: auto;
                }
                .nav-link-btn {
                    background: transparent;
                    border: none;
                    color: #999;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .nav-link-btn:hover {
                    color: #fff;
                }
                @media (max-width: 900px) {
                    .lecture-layout {
                        flex-direction: column !important;
                        overflow-y: auto !important;
                    }
                    .lecture-sidebar {
                        width: 100% !important;
                        border-left: none !important;
                        border-top: 1px solid rgba(255,255,255,0.05) !important;
                        flex: none !important;
                    }
                    .lecture-main {
                        flex: none !important;
                        overflow-y: visible !important;
                    }
                    .hide-mobile {
                        display: none !important;
                    }
                    .lecture-title {
                        font-size: 1rem !important;
                    }
                    .lecture-header {
                        padding: 15px !important;
                    }
                }
            `}</style>
            
            {/* Header */}
            <header className="lecture-header" style={{ background: '#0a0a0f', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button 
                        onClick={() => navigate(`/learn/${slug}`)}
                        style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
                    >
                        <ArrowLeft size={18} /> <span className="hide-mobile">Course Hub</span>
                    </button>
                    <div className="hide-mobile" style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    <h1 className="lecture-title" style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Youtube size={20} color="#ef4444" className="hide-mobile" /> 
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.title}</span>
                    </h1>
                </div>

                <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button className="nav-link-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button className="nav-link-btn" onClick={() => navigate('/aiinterviewselect')}>AI Interview</button>
                    <NavProfile />
                </div>
            </header>

            <div className="lecture-layout">
                {/* Main Content Area */}
                <div className="lecture-main" style={{ background: '#050505' }}>
                    {embedUrl ? (
                        <div style={{ width: '95%', maxWidth: '1100px', margin: '30px auto 10px', flexShrink: 0 }}>
                            <div style={{ width: '100%', paddingBottom: '56.25%', position: 'relative', background: '#000', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
                                <iframe 
                                    src={embedUrl}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    title={playingTitle}
                                />
                            </div>
                        </div>
                    ) : (
                        <div style={{ width: '95%', maxWidth: '1100px', margin: '30px auto 10px', flexShrink: 0 }}>
                            <div style={{ width: '100%', paddingBottom: '56.25%', position: 'relative', background: '#111', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100%' }}>
                                    {loadingPlaylist ? (
                                        <>
                                            <Loader2 size={48} className="animate-spin" color="#3b82f6" style={{ margin: '0 auto 15px' }} />
                                            <h3 style={{ color: '#fff', margin: 0 }}>Loading Playlist...</h3>
                                        </>
                                    ) : (
                                        <>
                                            <Youtube size={64} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 15px' }} />
                                            <h3 style={{ color: '#fff', margin: 0 }}>{playlistError || "No Video Linked"}</h3>
                                            {!playlistError && <p style={{ color: '#888' }}>The instructor has not provided a valid YouTube link for this module.</p>}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div style={{ padding: '20px 0', maxWidth: '1100px', width: '95%', margin: '0 auto', boxSizing: 'border-box' }}>
                        <h2 style={{ fontSize: '1.6rem', margin: '0 0 10px 0', fontWeight: 800, color: '#fff' }}>{playingTitle}</h2>
                        <div style={{ height: '2px', width: '40px', background: '#3b82f6', borderRadius: '10px', marginBottom: '20px' }}></div>
                        {/* ── Practice Section ── */}
                        <LecturePractice videoTitle={playingTitle} />
                    </div>
                </div>

                {/* Sidebar: Tabbed Panel */}
                <div className="lecture-sidebar" style={{ background: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>

                    {/* Tab Bar */}
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                        <button
                            onClick={() => setActivePanel('playlist')}
                            style={{
                                flex: 1, padding: '13px 10px', background: 'transparent',
                                border: 'none', borderBottom: activePanel === 'playlist' ? '2px solid #8b5cf6' : '2px solid transparent',
                                color: activePanel === 'playlist' ? '#fff' : '#555',
                                cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Layers size={15} /> Playlist
                        </button>
                        <button
                            onClick={() => setActivePanel('ai')}
                            style={{
                                flex: 1, padding: '13px 10px', background: 'transparent',
                                border: 'none', borderBottom: activePanel === 'ai' ? '2px solid #8b5cf6' : '2px solid transparent',
                                color: activePanel === 'ai' ? '#a78bfa' : '#555',
                                cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <img src="/logo.jpeg" alt="" style={{ width: 15, height: 15, borderRadius: '4px', objectFit: 'cover' }} /> AI
                        </button>
                        <button
                            onClick={() => setActivePanel('editor')}
                            style={{
                                flex: 1, padding: '13px 10px', background: 'transparent',
                                border: 'none', borderBottom: activePanel === 'editor' ? '2px solid #3b82f6' : '2px solid transparent',
                                color: activePanel === 'editor' ? '#fff' : '#555',
                                cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Code2 size={15} /> Code
                        </button>
                    </div>

                    {/* ── Playlist Panel ── */}
                    {activePanel === 'playlist' && (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>
                                {playlistVideos.length > 0 ? `${currentVideoIndex + 1} / ${playlistVideos.length} videos` : 'Loading...'}
                            </p>
                            <button 
                                onClick={() => setIsPlaylistVisible(prev => !prev)}
                                style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                                title={isPlaylistVisible ? "Collapse list" : "Expand list"}
                            >
                                {isPlaylistVisible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                        </div>

                        {isPlaylistVisible && (
                        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
                            {loadingPlaylist && playlistVideos.length === 0 && (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                                    <Loader2 size={24} className="animate-spin" color="#666" />
                                </div>
                            )}
                            {playlistVideos.length > 0 && playlistVideos.map((item, index) => {
                                const isPlaying = index === currentVideoIndex;
                                return (
                                    <div 
                                        key={item.id} 
                                        onClick={() => setCurrentVideoIndex(index)}
                                        style={{ 
                                            display: 'flex', gap: '15px', padding: '15px 20px', 
                                            cursor: 'pointer', transition: 'background 0.2s',
                                            background: isPlaying ? 'rgba(59,130,246,0.1)' : 'transparent',
                                            borderLeft: isPlaying ? '3px solid #3b82f6' : '3px solid transparent'
                                        }}
                                        onMouseEnter={(e) => { if (!isPlaying) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                        onMouseLeave={(e) => { if (!isPlaying) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <div style={{ width: '120px', aspectRatio: '16/9', background: '#222', borderRadius: '8px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                                            <img 
                                                src={item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url} 
                                                alt={item.snippet.title} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            {isPlaying && (
                                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <PlayCircle size={28} color="#fff" fill="#3b82f6" />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <h4 style={{ 
                                                margin: '0 0 5px 0', fontSize: '0.95rem', lineHeight: 1.4, 
                                                color: isPlaying ? '#3b82f6' : '#eee',
                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' 
                                            }}>
                                                {item.snippet.title}
                                            </h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>
                                                {item.snippet.channelTitle}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            {!loadingPlaylist && playlistVideos.length === 0 && !playlistError && (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
                                    This specific course only features a single video module.
                                </div>
                            )}
                            {/* Pagination automatically handled by React Query up to 300 videos */}
                        </div>
                        )}
                    </div>
                    )}

                    {/* ── AI Chat Panel — always mounted to preserve history ── */}
                    <div style={{ flex: 1, display: activePanel === 'ai' ? 'flex' : 'none', flexDirection: 'column', minHeight: 0 }}>
                        <LectureChatBot
                            videoTitle={playingTitle}
                            getEditorCode={() => editorRef.current?.getEditorCode()}
                            applyEditorCode={(code) => editorRef.current?.applyEditorCode(code)}
                            highlightLines={(s, e) => editorRef.current?.highlightLines(s, e)}
                            clearHighlights={() => editorRef.current?.clearHighlights()}
                            switchToEditor={() => setActivePanel('editor')}
                            onExpandChange={handleAiExpandChange}
                        />
                    </div>

                    {/* ── Code Editor Panel — always mounted to preserve state ── */}
                    <div style={{ flex: 1, display: activePanel === 'editor' ? 'flex' : 'none', flexDirection: 'column', minHeight: 0 }}>
                        <VideoCodeEditor
                            ref={editorRef}
                            userId={currentUser?.uid}
                            courseId={course?.id}
                            videoId={playlistVideos[currentVideoIndex]?.snippet?.resourceId?.videoId || 'default'}
                        />
                    </div>

                </div>
            </div>

        </div>
    );
}
