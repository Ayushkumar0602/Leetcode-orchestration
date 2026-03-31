import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { CheckCircle, Lock, Play, Menu, X, ArrowLeft, Loader2, Youtube, Layers, PlayCircle, ChevronDown, ChevronUp, Code2, PenLine, Database } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useSEO } from './hooks/useSEO';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import NavProfile from './NavProfile';
import VideoCodeEditor from './VideoCodeEditor';
import LectureChatBot from './LectureChatBot';
import LecturePractice from './LecturePractice';
import LectureSQLEditor from './LectureSQLEditor';
import SystemDesignBoard from './components/SystemDesignBoard';
import YouTube from 'react-youtube';
import { useTelemetry } from './contexts/TelemetryContext';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

async function fetchYoutubePlaylistPage(url, pageToken = '') {
    let playlistId = null;
    if (url.includes('playlist?list=')) {
        playlistId = new URL(url).searchParams.get('list');
    } else {
        const sp = new URL(url).searchParams;
        if (sp.has('list')) playlistId = sp.get('list');
    }
    
    if (!playlistId) throw new Error("No valid playlist ID found in the course link. Attempting to load as single video.");

    let success = false;
    let data = null;
    for (let i = 0; i < YOUTUBE_API_KEYS.length; i++) {
        try {
            const tokenParam = pageToken ? `&pageToken=${pageToken}` : '';
            const apiRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=20&playlistId=${playlistId}&key=${YOUTUBE_API_KEYS[i]}${tokenParam}`);
            data = await apiRes.json();
            if (apiRes.ok) {
                success = true;
                break;
            }
        } catch (err) {}
    }
    
    if (!success) {
        throw new Error("Failed to load playlist. Quota exceeded or playlist is private.");
    }
    
    const validVideos = (data.items || []).filter(item => item.snippet.title !== 'Private video' && item.snippet.title !== 'Deleted video');
    
    return {
        items: validVideos,
        nextPageToken: data.nextPageToken || null
    };
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
    const [whiteboardOpen, setWhiteboardOpen] = useState(false);
    const [aiExpanded, setAiExpanded] = useState(false);
    const editorRef = useRef(null); // bridge to VideoCodeEditor for AI chatbot

    const { onVideoStart, onVideoProgress, onVideoPause, getSavedProgress, getSavedDuration } = useTelemetry() || {};
    const ytPlayerRef = useRef(null);
    const initialRenderTimes = useRef({});

    const [currentTime, setCurrentTime] = useState(0);
    const [showAutoAdvance, setShowAutoAdvance] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const autoAdvanceTriggered = useRef(false);


    // 1. Queries and Nav Hooks (Hoisted)
    useEffect(() => {
        if (!currentUser) navigate(`/login?redirect=/learn/${slug}/lecture`);
    }, [currentUser, navigate, slug]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 900) setWhiteboardOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const { data: playlistData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: loadingPlaylist, error: playlistErrorObj } = useInfiniteQuery({
        queryKey: ['youtube-playlist', course?.youtubePlaylistLink],
        queryFn: ({ pageParam = '' }) => fetchYoutubePlaylistPage(course.youtubePlaylistLink, pageParam),
        getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
        enabled: !!course?.youtubePlaylistLink && isEnrolled,
        staleTime: 1000 * 60 * 60,
    });

    const playlistVideos = playlistData ? playlistData.pages.flatMap(page => page.items) : [];

    // 2. Derived IDs (Hoisted before Effects)
    const getSingleVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    let playingVideoId = null;
    let embedUrl = null;
    let playingTitle = course?.title || '';
    let playingDesc = course?.description || '';

    if (playlistVideos.length > 0) {
        const currentItem = playlistVideos[currentVideoIndex];
        playingVideoId = currentItem?.snippet?.resourceId?.videoId || null;
        if (playingVideoId) embedUrl = `https://www.youtube.com/embed/${playingVideoId}?autoplay=1&rel=0&modestbranding=1`;
        if (currentItem) {
            playingTitle = currentItem.snippet.title;
            playingDesc = currentItem.snippet.description;
        }
    } else if (course?.youtubePlaylistLink) {
        const vidId = getSingleVideoId(course.youtubePlaylistLink);
        if (vidId) {
            playingVideoId = vidId;
            embedUrl = `https://www.youtube.com/embed/${vidId}?rel=0&modestbranding=1`;
        }
    }

    // 3. All Effects Hook Definitions
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    useEffect(() => {
        if (!playingVideoId || !currentUser) return;
        const loadNotes = async () => {
            try {
                const snapshot = await getDoc(doc(db, 'users', currentUser.uid, 'lecture_notes', playingVideoId));
                if (snapshot.exists()) setNotes(snapshot.data().notes || []);
                else setNotes([]);
            } catch (err) { console.error("Failed to load notes", err); }
        };
        loadNotes();
    }, [playingVideoId, currentUser]);

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim() || !playingVideoId || !currentUser) return;
        setIsSavingNote(true);
        const t = ytPlayerRef.current ? ytPlayerRef.current.getCurrentTime() : 0;
        const noteObj = { id: Date.now().toString(), text: newNote.trim(), timestamp: t };
        const updated = [...notes, noteObj].sort((a,b) => a.timestamp - b.timestamp);
        
        try {
            await setDoc(doc(db, 'users', currentUser.uid, 'lecture_notes', playingVideoId), { notes: updated }, { merge: true });
            setNotes(updated);
            setNewNote('');
        } catch (err) { console.error(err); } 
        finally { setIsSavingNote(false); }
    };
    
    const seekToNote = (sec) => { if (ytPlayerRef.current) ytPlayerRef.current.seekTo(sec, true); };
    const formatTimestamp = (sec) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Track watching progress every 5 seconds if playing
    useEffect(() => {
        const interval = setInterval(() => {
            if (ytPlayerRef.current && onVideoProgress) {
                try {
                    const time = ytPlayerRef.current.getCurrentTime();
                    const duration = ytPlayerRef.current.getDuration();
                    if (time && duration) {
                        onVideoProgress(time, duration);
                        setCurrentTime(time);
                        // Auto-Advance logic
                        if (!autoAdvanceTriggered.current && playlistVideos.length > currentVideoIndex + 1) {
                            if (duration > 0 && (time / duration) > 0.95) {
                                autoAdvanceTriggered.current = true;
                                setShowAutoAdvance(true);
                                setCountdown(5);
                            }
                        }
                    }
                } catch (e) {}
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [onVideoProgress, playlistVideos.length, currentVideoIndex]);

    // Countdown timer for Auto-Advance
    useEffect(() => {
        let timer;
        if (showAutoAdvance && countdown > 0) {
            timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        } else if (showAutoAdvance && countdown === 0) {
            setShowAutoAdvance(false);
            setCurrentVideoIndex(prev => prev + 1);
        }
        return () => clearTimeout(timer);
    }, [showAutoAdvance, countdown]);

    // Reset auto-advance state on video change
    useEffect(() => {
        autoAdvanceTriggered.current = false;
        setShowAutoAdvance(false);
    }, [currentVideoIndex]);

    const handleAiExpandChange = (expanded) => {
        setAiExpanded(expanded);
        setActivePanel(expanded ? 'ai' : 'playlist');
    };

    // 4. Pre-Render Calcs & Early Returns
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

    if (playingVideoId && initialRenderTimes.current[playingVideoId] === undefined) {
        initialRenderTimes.current[playingVideoId] = getSavedProgress && getSavedProgress(playingVideoId) > 0 
            ? getSavedProgress(playingVideoId) 
            : 0;
    }
    const savedStartTime = playingVideoId ? initialRenderTimes.current[playingVideoId] : 0;

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
            <header className="lecture-header" style={{ position: 'relative', background: '#0a0a0f', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                {/* Brand Logo - Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', zIndex: 10 }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.5px' }} className="hide-mobile">Whizan AI</span>
                </div>

                {/* Centered Course Title */}
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '50%', display: 'flex', justifyContent: 'center', zIndex: 5, pointerEvents: 'none' }}>
                    <h1 className="lecture-title" style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <Youtube size={20} color="#ef4444" className="hide-mobile" /> 
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', textAlign: 'center' }}>{course.title}</span>
                    </h1>
                </div>

                {/* Right Actions */}
                <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 10 }}>
                    <button className="nav-link-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button className="nav-link-btn" onClick={() => navigate('/aiinterviewselect')}>AI Interview</button>
                    <button
                        onClick={() => setWhiteboardOpen(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                            background: 'rgba(0,184,163,0.12)', border: '1px solid rgba(0,184,163,0.35)',
                            color: '#2dd4bf', fontWeight: 700, fontSize: '0.82rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,184,163,0.22)'; e.currentTarget.style.borderColor = 'rgba(0,184,163,0.6)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,184,163,0.12)'; e.currentTarget.style.borderColor = 'rgba(0,184,163,0.35)'; }}
                    >
                        <PenLine size={14} /> Whiteboard
                    </button>
                    <NavProfile />
                </div>

                {/* Whiteboard full-screen overlay — only available on desktop (> 900px) */}
                {whiteboardOpen && window.innerWidth > 900 && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        display: 'flex', flexDirection: 'column',
                        background: '#0a0c10'
                    }}>
                        {/* Overlay header */}
                        <div style={{
                            height: '48px', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0 16px',
                            background: 'rgba(10,12,16,0.98)',
                            borderBottom: '1px solid rgba(0,184,163,0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <PenLine size={16} color="#2dd4bf" />
                                <span style={{ color: '#2dd4bf', fontWeight: 700, fontSize: '0.9rem' }}>Whiteboard</span>
                                <span style={{ color: '#475569', fontSize: '0.78rem', marginLeft: '4px' }}>— {course?.title}</span>
                            </div>
                            <button
                                onClick={() => setWhiteboardOpen(false)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '5px 14px', borderRadius: '7px', cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#94a3b8', fontWeight: 600, fontSize: '0.82rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                <X size={14} /> Close
                            </button>
                        </div>
                        {/* Board canvas */}
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <SystemDesignBoard />
                        </div>
                    </div>
                )}
            </header>

            <div className="lecture-layout">
                {/* Main Content Area */}
                <div className="lecture-main" style={{ background: '#050505' }}>
                    {playingVideoId ? (
                        <div style={{ width: '95%', maxWidth: '1100px', margin: '30px auto 10px', flexShrink: 0 }}>
                            <div style={{ width: '100%', paddingBottom: '56.25%', position: 'relative', background: '#000', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
                                <YouTube 
                                    videoId={playingVideoId}
                                    opts={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        playerVars: { 
                                            autoplay: 1, 
                                            rel: 0, 
                                            modestbranding: 1,
                                            start: Math.floor(savedStartTime)
                                        } 
                                    }}
                                    onReady={(e) => { ytPlayerRef.current = e.target; }}
                                    onPlay={() => onVideoStart?.(playingVideoId)}
                                    onPause={() => onVideoPause?.()}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                    iframeClassName="youtube-iframe-fw"
                                />
                                <style>{`.youtube-iframe-fw { width: 100%; height: 100%; position: absolute; top: 0; left: 0; border: none; }`}</style>
                                
                                {showAutoAdvance && (
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                        background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center', zIndex: 50,
                                        backdropFilter: 'blur(8px)'
                                    }}>
                                        <h3 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: 700 }}>Up Next:</h3>
                                        <p style={{ color: '#3b82f6', fontSize: '1.2rem', fontWeight: 500, marginBottom: '25px', maxWidth: '80%', textAlign: 'center' }}>
                                            {playlistVideos[currentVideoIndex + 1]?.snippet?.title}
                                        </p>
                                        <div style={{
                                            width: '70px', height: '70px', borderRadius: '50%',
                                            border: '3px solid rgba(59,130,246,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '25px',
                                            boxShadow: '0 0 20px rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.1)'
                                        }}>
                                            {countdown}
                                        </div>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <button 
                                                onClick={() => { setShowAutoAdvance(false); autoAdvanceTriggered.current = true; }}
                                                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={() => { setShowAutoAdvance(false); setCurrentVideoIndex(c => c + 1); }}
                                                style={{ background: '#3b82f6', color: '#fff', padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, boxShadow: '0 4px 14px rgba(59,130,246,0.3)' }}
                                            >
                                                <Play size={18} fill="#fff" /> Play Now
                                            </button>
                                        </div>
                                    </div>
                                )}
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

                        {/* ── SQL Sandbox Section ── */}
                        <div style={{ marginTop: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                <Database size={20} color="#06b6d4" />
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>SQL Sandbox</h3>
                                <span style={{ fontSize: '0.78rem', color: '#555', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)', padding: '2px 8px', borderRadius: '20px' }}>per-course · auto-saved</span>
                            </div>
                            <div style={{ height: '520px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(6,182,212,0.15)', boxShadow: '0 0 40px rgba(6,182,212,0.05)' }}>
                                <LectureSQLEditor
                                    userId={currentUser?.uid}
                                    courseId={course?.id}
                                />
                            </div>
                        </div>
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

                        <button
                            onClick={() => setActivePanel('notes')}
                            style={{
                                flex: 1, padding: '13px 10px', background: 'transparent',
                                border: 'none', borderBottom: activePanel === 'notes' ? '2px solid #ef4444' : '2px solid transparent',
                                color: activePanel === 'notes' ? '#fff' : '#555',
                                cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <PenLine size={15} /> Notes
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
                                            {(() => {
                                                const vidId = item.snippet.resourceId.videoId;
                                                const savedProg = getSavedProgress ? getSavedProgress(vidId) : 0;
                                                const savedDur = getSavedDuration ? getSavedDuration(vidId) : 0;
                                                if (savedProg > 0 && savedDur > 0) {
                                                    const pct = Math.min(100, Math.max(0, (savedProg / savedDur) * 100));
                                                    return (
                                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.3)' }}>
                                                            <div style={{ height: '100%', background: '#ef4444', width: `${pct}%`, transition: 'width 0.3s' }}></div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
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
                            {hasNextPage && (
                                <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: isFetchingNextPage ? 'not-allowed' : 'pointer',
                                            fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center'
                                        }}
                                    >
                                        {isFetchingNextPage ? <Loader2 size={16} className="animate-spin" /> : null}
                                        {isFetchingNextPage ? 'Loading...' : 'Load More Videos'}
                                    </button>
                                </div>
                            )}
                        </div>
                        )}
                    </div>
                    )}

                    {/* ── AI Chat Panel — always mounted to preserve history ── */}
                    <div style={{ flex: 1, display: activePanel === 'ai' ? 'flex' : 'none', flexDirection: 'column', minHeight: 0 }}>
                        <LectureChatBot
                            videoTitle={playingTitle}
                            currentTime={currentTime}
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



                    {/* ── Notes Panel ── */}
                    <div style={{ flex: 1, display: activePanel === 'notes' ? 'flex' : 'none', flexDirection: 'column', minHeight: 0, background: '#0a0a0f' }}>
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <PenLine size={18} color="#ef4444" /> My Notes
                            </h3>
                            <p style={{ margin: '5px 0 0', color: '#888', fontSize: '0.8rem' }}>Notes are tied to timestamps and saved automatically.</p>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', padding: '15px 20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {notes.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#666', padding: '40px 0', fontSize: '0.9rem' }}>
                                    No notes for this video yet.<br/>Type below to add one at your current timestamp.
                                </div>
                            ) : (
                                notes.map(n => (
                                    <div key={n.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                        <button 
                                            onClick={() => seekToNote(n.timestamp)}
                                            style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <PlayCircle size={12} /> {formatTimestamp(n.timestamp)}
                                        </button>
                                        <div style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                            {n.text}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handleAddNote} style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder={`Add note at ${formatTimestamp(currentTime)}...`}
                                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', padding: '10px 12px', fontSize: '0.9rem', resize: 'none', height: '60px', fontFamily: 'inherit' }}
                                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddNote(e); } }}
                                />
                                <button 
                                    type="submit"
                                    disabled={!newNote.trim() || isSavingNote}
                                    style={{ background: newNote.trim() && !isSavingNote ? '#ef4444' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 15px', cursor: newNote.trim() && !isSavingNote ? 'pointer' : 'not-allowed', fontWeight: 600, transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                >
                                    {isSavingNote ? <Loader2 size={18} className="animate-spin" /> : <PenLine size={18} />}
                                    <span style={{ fontSize: '0.7rem' }}>Save</span>
                                </button>
                            </div>
                        </form>
                    </div>



                </div>
            </div>

        </div>
    );
}
