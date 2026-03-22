import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCourseDetail, fetchPlaylist, queryKeys } from '../lib/api';
import Editor from '@monaco-editor/react';
import { 
    Send, X, Play, Clock, 
    Book, Code, BarChart, Settings, ChevronRight, 
    MessageSquare, Trash2, Save 
} from 'lucide-react';
import '../Courses.css';

export default function LectureDashboard() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [activeVideo, setActiveVideo] = useState(null);
    const [playlist, setPlaylist] = useState([]);
    const [chatMessages, setChatMessages] = useState([
        { role: 'bot', text: 'Welcome! I am your DSA Helper. How can I assist you with today\'s lecture?' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState('');
    const [code, setCode] = useState('// Write your C++ code here\n#include <iostream>\n\nint main() {\n    std::cout << "Hello DSA!" << std::endl;\n    return 0;\n}');
    
    const { data: course, isLoading } = useQuery({
        queryKey: queryKeys.courseDetail(courseId),
        queryFn: () => fetchCourseDetail(courseId),
        enabled: !!courseId,
    });

    useEffect(() => {
        console.log("LectureDashboard: course loaded =", course);
        if (course) {
            console.log("LectureDashboard: course.playlistLink =", course.playlistLink);
            if (course.playlistLink) {
                fetchPlaylist(course.playlistLink)
                    .then(items => {
                        console.log("fetchPlaylist success:", items);
                        if (items && items.length > 0) {
                            setPlaylist(items);
                            setActiveVideo(items[0]);
                        }
                    })
                    .catch(err => {
                        console.error('Failed to load playlist:', err);
                    });
            } else {
                console.log("No playlistLink found on this course.");
            }
        }
    }, [course]);

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;
        
        const newMsg = { role: 'user', text: userInput };
        setChatMessages(prev => [...prev, newMsg]);
        setUserInput('');
        
        // Mocking AI response
        setTimeout(() => {
            setChatMessages(prev => [...prev, { 
                role: 'bot', 
                text: `Regarding "${userInput}": In ${activeVideo?.title}, this concept is crucial for optimizing your approach.` 
            }]);
        }, 800);
    };

    if (isLoading) return <div className="courses-container">Loading Dashboard...</div>;
    if (!course) return <div className="courses-container">Course Details Missing.</div>;

    return (
        <div className="lecture-layout">
            <style>{`
                .lecture-layout { display: flex; height: 100vh; background: #0a0a0a; color: #fff; overflow: hidden; }
                .lecture-main { flex: 1; display: flex; flex-direction: column; padding: 20px; gap: 20px; overflow-y: auto; }
                .lecture-sidebar { width: 350px; background: #111; border-left: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; }
                
                .video-wrapper { width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .video-wrapper iframe { width: 100%; height: 100%; border: none; }
                
                .playlist-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 800; }
                .playlist-items { flex: 1; overflow-y: auto; }
                .playlist-item { display: flex; gap: 12px; padding: 12px 20px; cursor: pointer; transition: all 0.2s; border-bottom: 1px solid rgba(255,255,255,0.03); }
                .playlist-item:hover { background: rgba(255,255,255,0.05); }
                .playlist-item.active { background: rgba(168, 85, 247, 0.1); border-left: 3px solid #a855f7; }
                .playlist-thumb { width: 100px; height: 56px; border-radius: 6px; object-fit: cover; }
                .playlist-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
                .playlist-title { font-size: 0.82rem; font-weight: 600; line-height: 1.3; }
                
                .chat-card { background: #1a1a1a; border-radius: 16px; height: 300px; display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
                .chat-header { padding: 12px 16px; background: #222; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .chat-messages { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
                .msg { padding: 10px 14px; border-radius: 12px; max-width: 85%; font-size: 0.85rem; line-height: 1.4; }
                .msg.bot { background: rgba(255,255,255,0.05); align-self: flex-start; color: #e0e0e0; }
                .msg.user { background: #a855f7; align-self: flex-end; color: #fff; }
                .chat-input-area { padding: 12px; background: #222; display: flex; gap: 8px; }
                .chat-input-area input { flex: 1; background: #333; border: none; padding: 10px; border-radius: 8px; color: #fff; outline: none; }
                .chat-send-btn { background: #a855f7; border: none; padding: 8px; border-radius: 8px; color: #fff; cursor: pointer; }
                
                .float-tools { position: fixed; bottom: 30px; right: 380px; display: flex; flex-direction: column; gap: 12px; }
                .tool-btn { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
                .tool-btn:hover { transform: scale(1.1); }
                
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
                .modal-content { background: #1a1a1a; border-radius: 24px; border: 1px solid rgba(255,255,255,0.08); width: 100%; max-width: 800px; height: 600px; display: flex; flex-direction: column; overflow: hidden; }
                .modal-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; }
            `}</style>

            <div className="lecture-main">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '-10px' }}>
                    <span onClick={() => navigate(`/courses/${courseId}`)} style={{ cursor: 'pointer', color: '#a855f7', fontSize: '0.85rem', fontWeight: 700 }}>{course.name}</span>
                    <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{activeVideo?.title}</span>
                </div>

                <div className="video-wrapper">
                    {activeVideo && (
                        <iframe 
                            src={`https://www.youtube.com/embed/${activeVideo.videoId}?rel=0&modestbranding=1`}
                            allowFullScreen
                            title="Lecture Player"
                        ></iframe>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px' }}>{activeVideo?.title}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> 45:12</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Play size={12} /> 12.4k Views</span>
                        </div>
                    </div>
                    
                    <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                        Mark as Complete
                    </button>
                </div>

                <div className="chat-card">
                    <div className="chat-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 700 }}>
                            <MessageSquare size={16} color="#a855f7" /> 
                            Gemini AI DSA Assistant
                        </div>
                        <button onClick={() => setChatMessages([])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}><Trash2 size={14} /></button>
                    </div>
                    <div className="chat-messages">
                        {chatMessages.map((m, i) => (
                            <div key={i} className={`msg ${m.role}`}>
                                {m.text}
                            </div>
                        ))}
                    </div>
                    <div className="chat-input-area">
                        <input 
                            placeholder="Ask about time complexity, logic, etc..." 
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button className="chat-send-btn" onClick={handleSendMessage}><Send size={16} /></button>
                    </div>
                </div>
            </div>

            <div className="lecture-sidebar">
                <div className="playlist-header">
                    Course Contents
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontWeight: 400 }}>
                        {playlist.length} Lectures • Next: {playlist[1]?.title}
                    </div>
                </div>
                <div className="playlist-items">
                    {playlist.map((video, index) => (
                        <div 
                            key={video.id} 
                            className={`playlist-item ${activeVideo?.id === video.id ? 'active' : ''}`}
                            onClick={() => setActiveVideo(video)}
                        >
                            <img src={video.thumbnail} className="playlist-thumb" alt="Thumbnail" />
                            <div className="playlist-info">
                                <span className="playlist-title">{video.title}</span>
                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                                    Lec {index + 1} • {video.durationRaw || '12:45'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Tools */}
            <div className="float-tools">
                <div className="tool-btn" style={{ background: '#3b82f6' }} onClick={() => setShowCodeEditor(true)} title="Coding Playground"><Code size={20} /></div>
                <div className="tool-btn" style={{ background: '#f59e0b' }} onClick={() => setShowNotes(true)} title="Lecture Notes"><Book size={20} /></div>
                <div className="tool-btn" style={{ background: '#10b981' }} title="Analytics"><BarChart size={20} /></div>
                <div className="tool-btn" style={{ background: 'rgba(255,255,255,0.1)' }} title="Settings"><Settings size={20} /></div>
            </div>

            {/* Code Editor Modal */}
            {showCodeEditor && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Code size={20} color="#3b82f6" />
                                <h3 style={{ margin: 0 }}>C++ Interview Playground</h3>
                            </div>
                            <button onClick={() => setShowCodeEditor(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ flex: 1 }}>
                            <Editor
                                height="100%"
                                defaultLanguage="cpp"
                                theme="vs-dark"
                                value={code}
                                onChange={setCode}
                                options={{
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true
                                }}
                            />
                        </div>
                        <div style={{ padding: '15px', background: '#222', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button className="details-btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '8px 20px', fontSize: '0.85rem' }}>Run Solution</button>
                            <button className="details-btn" style={{ padding: '8px 25px', fontSize: '0.85rem' }}>Submit</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Modal */}
            {showNotes && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px', height: '500px' }}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Book size={20} color="#f59e0b" />
                                <h3 style={{ margin: 0 }}>Personal Study Notes</h3>
                            </div>
                            <button onClick={() => setShowNotes(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ flex: 1, padding: '20px' }}>
                            <textarea 
                                style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', padding: '15px', outline: 'none', resize: 'none', fontSize: '0.9rem', lineHeight: 1.6 }}
                                placeholder="Type your notes for this lecture here..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                        <div style={{ padding: '15px', background: '#222', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="details-btn" style={{ padding: '8px 25px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Save size={14} /> Save Notes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
