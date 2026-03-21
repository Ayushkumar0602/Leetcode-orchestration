import React, { useState, useEffect, useRef } from 'react';
import { User, MessageSquare, Code2, Brain, Search, Send, FileText } from 'lucide-react';

export default function AIChatTheme({ profile, stats, validInvCount, badges, hasProjects, hasExperience, T, navigate, primaryCta, connectModalOpen, setConnectModalOpen, connectMessage, setConnectMessage, connectBusy, sendConnectRequest, isDark }) {
    
    const [messages, setMessages] = useState([
        { sender: 'ai', text: `Hi! I'm an AI assistant representing ${profile.displayName || 'this developer'}. I can tell you all about their skills, experience, and projects. What would you like to know?` }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

    const handlePrompt = (promptId, promptText) => {
        setMessages(prev => [...prev, { sender: 'user', text: promptText }]);
        setIsTyping(true);
        
        setTimeout(() => {
            let reply = '';
            let type = 'text';
            let data = null;

            if (promptId === 'bio') {
                reply = profile.bio ? `Here is a quick bio:\\n\\n"${profile.bio}"\\n\\nThey are currently working as a ${profile.currentRole || 'Software Engineer'}.` : `They are a ${profile.currentRole || 'Software Engineer'} passionate about building great software.`;
            } else if (promptId === 'projects') {
                if (hasProjects) {
                    reply = `They've built some awesome stuff! Here are top projects:`;
                    type = 'projects';
                    data = profile.projects.slice(0, 3);
                } else {
                    reply = 'No public projects are listed right now, but they are always building!';
                }
            } else if (promptId === 'skills') {
                if (profile.skills?.length > 0) {
                    reply = `Their technical arsenal includes: ${profile.skills.join(', ')}.`;
                } else {
                    reply = 'They have a wide range of software engineering skills.';
                }
            } else if (promptId === 'stats') {
                reply = `Let's look at the numbers. They've solved ${stats?.Total || 0} algorithmic problems and survived ${validInvCount} realistic AI mock interviews. Impressive!`;
            } else if (promptId === 'connect') {
                reply = `Great! I've opened the connection form for you to send a direct message.`;
                setTimeout(() => primaryCta?.action(), 1000);
            }

            setMessages(prev => [...prev, { sender: 'ai', text: reply, type, data }]);
            setIsTyping(false);
        }, 1200);
    };

    const css = `
    .chat-wrap { width: 100vw; height: 100vh; background: ${isDark ? '#09090b' : '#f4f4f5'}; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; font-family: 'Inter', sans-serif; overflow: hidden; }
    .chat-container { width: 100%; max-width: 800px; height: 100%; display: flex; flex-direction: column; background: ${isDark ? '#09090b' : '#ffffff'}; border-left: 1px solid ${isDark ? '#27272a' : '#e4e4e7'}; border-right: 1px solid ${isDark ? '#27272a' : '#e4e4e7'}; box-shadow: 0 0 40px rgba(0,0,0,0.05); }
    .chat-header { padding: 16px 24px; border-bottom: 1px solid ${isDark ? '#27272a' : '#e4e4e7'}; display: flex; alignItems: center; gap: 12px; background: ${isDark ? 'rgba(9,9,11,0.8)' : 'rgba(255,255,255,0.8)'}; backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 10; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .chat-bubble { max-width: 85%; padding: 14px 18px; border-radius: 20px; font-size: 0.95rem; line-height: 1.5; animation: popIn 0.3s cubic-bezier(0.16,1,0.3,1); }
    .chat-bubble.ai { background: ${isDark ? '#27272a' : '#f4f4f5'}; color: ${isDark ? '#e4e4e7' : '#18181b'}; border-bottom-left-radius: 4px; align-self: flex-start; }
    .chat-bubble.user { background: ${T.accent}; color: #fff; border-bottom-right-radius: 4px; align-self: flex-end; }
    .chat-prompts { padding: 16px 24px 24px; border-top: 1px solid ${isDark ? '#27272a' : '#e4e4e7'}; display: flex; flex-wrap: wrap; gap: 10px; background: ${isDark ? '#09090b' : '#ffffff'}; justify-content: center; }
    .chat-prompt-btn { background: ${isDark ? '#18181b' : '#ffffff'}; border: 1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}; padding: 10px 16px; border-radius: 999px; font-size: 0.85rem; color: ${isDark ? '#d4d4d8' : '#3f3f46'}; cursor: pointer; transition: all 0.2s; font-weight: 600; }
    .chat-prompt-btn:hover { background: ${isDark ? '#27272a' : '#f4f4f5'}; transform: translateY(-2px); border-color: ${T.accent}; color: ${T.accent}; }
    
    .chat-card { background: ${isDark ? '#18181b' : '#ffffff'}; border: 1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}; border-radius: 12px; padding: 16px; margin-top: 12px; display: flex; flex-direction: column; gap: 12px; }
    .chat-proj-item { display: flex; flex-direction: column; padding-bottom: 12px; border-bottom: 1px solid ${isDark ? '#27272a' : '#f4f4f5'}; }
    .chat-proj-item:last-child { border-bottom: none; padding-bottom: 0; }
    
    .typing-dot { width: 6px; height: 6px; background: ${isDark ? '#a1a1aa' : '#a1a1aa'}; border-radius: 50%; animation: blink 1.4s infinite both; }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes popIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    @keyframes blink { 0%, 100% { opacity: 0.2; } 20% { opacity: 1; } }
    `;

    return (
        <div className="chat-wrap">
            <style>{css}</style>
            
            <div className="chat-container">
                <div className="chat-header">
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: T.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {profile.photoURL ? <img src={profile.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} /> : <Brain size={24} color="#fff" />}
                        </div>
                        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: '#10b981', border: `2px solid ${isDark ? '#09090b' : '#fff'}` }} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: isDark ? '#fff' : '#18181b', display: 'flex', alignItems: 'center', gap: '6px' }}>{profile.displayName || 'Developer'} AI <span style={{ fontSize: '0.65rem', background: `${T.accent}30`, color: T.accent, padding: '2px 6px', borderRadius: '4px' }}>BOT</span></div>
                        <div style={{ fontSize: '0.8rem', color: isDark ? '#a1a1aa' : '#71717a' }}>Always online</div>
                    </div>
                </div>

                <div className="chat-messages">
                    {messages.map((m, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignSelf: m.sender === 'ai' ? 'flex-start' : 'flex-end', width: '100%' }}>
                            <div className={`chat-bubble ${m.sender}`}>
                                {m.text.split('\\n').map((line, j) => <React.Fragment key={j}>{line}<br/></React.Fragment>)}
                                
                                {m.type === 'projects' && m.data && (
                                    <div className="chat-card">
                                        {m.data.map((p, idx) => (
                                            <div key={idx} className="chat-proj-item">
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#fff' : '#18181b', marginBottom: '4px' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: isDark ? '#a1a1aa' : '#52525b', lineHeight: 1.5, marginBottom: '6px' }}>{p.desc}</div>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    {p.tech?.slice(0, 3).map(t => <span key={t} style={{ fontSize: '0.7rem', color: T.accent, fontWeight: 700 }}>#{t}</span>)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: isDark ? '#52525b' : '#a1a1aa', marginTop: '6px', alignSelf: m.sender === 'ai' ? 'flex-start' : 'flex-end', marginLeft: m.sender === 'ai' ? '8px' : '0', marginRight: m.sender === 'user' ? '8px' : '0' }}>
                                {m.sender === 'ai' ? 'AI Assistant' : 'You'} • Just now
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="chat-bubble ai" style={{ display: 'flex', gap: '4px', padding: '16px 20px' }}>
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-prompts">
                    <button className="chat-prompt-btn" onClick={() => handlePrompt('bio', 'Who are you?')} disabled={isTyping}><User size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> Tell me about yourself</button>
                    {hasProjects && <button className="chat-prompt-btn" onClick={() => handlePrompt('projects', 'Show me your best work')} disabled={isTyping}><Code2 size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> View Projects</button>}
                    <button className="chat-prompt-btn" onClick={() => handlePrompt('skills', 'What technologies do you know?')} disabled={isTyping}><Brain size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> Technical Skills</button>
                    <button className="chat-prompt-btn" onClick={() => handlePrompt('stats', 'How good are your coding skills?')} disabled={isTyping}><FileText size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> Platform Stats</button>
                    {primaryCta && <button className="chat-prompt-btn" onClick={() => handlePrompt('connect', 'I want to hire you')} disabled={isTyping || primaryCta.disabled} style={{ background: `${T.accent}15`, borderColor: T.accent, color: T.accent }}><Send size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> Let's Connect</button>}
                </div>
            </div>

            {connectModalOpen && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ width: 450, background: isDark ? '#1e293b' : '#fff', padding: '2rem', borderRadius: '24px' }}>
                        <h3 style={{ margin: '0 0 1rem 0' }}>Connect Request</h3>
                        <textarea style={{ width: '100%', height: 120, padding: 12, borderRadius: 12, background: isDark ? 'rgba(0,0,0,0.2)' : '#f1f5f9', color: isDark ? '#fff' : '#000', border: '1px solid gray' }} value={connectMessage} onChange={e => setConnectMessage(e.target.value)} />
                        <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
                            <button onClick={() => setConnectModalOpen(false)} style={{ flex: 1, padding: 12, borderRadius: 12, background: 'transparent', color: isDark ? '#fff' : '#000', border: '1px solid gray' }}>Cancel</button>
                            <button onClick={sendConnectRequest} style={{ flex: 1, padding: 12, borderRadius: 12, background: T.gradient, color: '#fff', border: 'none' }}>Send</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
