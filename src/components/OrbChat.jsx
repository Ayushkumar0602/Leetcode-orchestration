import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAgent } from '../contexts/AgentContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './OrbChat.css';

export default function OrbChat({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { getActionSchemas, executeAction } = useAgent();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const [userProfileData, setUserProfileData] = useState(null);
  const messagesEndRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (currentUser?.uid) {
      getDoc(doc(db, 'users', currentUser.uid))
        .then(snap => {
          if (snap.exists()) {
            const d = snap.data();
            setUserProfileData({
              uid: currentUser.uid,
              displayName: d.displayName,
              bio: d.bio,
              preferredRole: d.preferredRole,
              skills: d.skills?.slice(0, 10),
              experience: d.experience?.slice(0, 2).map(ex => ({ role: ex.role, company: ex.company })),
              projects: d.projects?.slice(0, 3).map(p => ({ title: p.title, techStack: p.techStack || p.tools, summary: p.description?.substring(0, 150) }))
            });
          }
        })
        .catch(console.error);
    }
  }, [currentUser]);

  const sendToAgent = useCallback(async (messagesToSend) => {
    setIsLoading(true);

    try {
      const pageActions = getActionSchemas();
      
      let pageContent = null;
      try {
        const text = document.body.innerText.substring(0, 3000);
        const allLinks = Array.from(document.querySelectorAll('a'))
          .map(a => ({ text: a.innerText.trim(), href: a.getAttribute('href') }))
          .filter(a => a.text && a.href && !a.href.startsWith('javascript'));
        const uniqueLinks = Array.from(new Set(allLinks.map(l => JSON.stringify(l)))).map(JSON.parse).slice(0, 20);
        pageContent = { text, links: uniqueLinks };
      } catch(err) {
        console.warn('Could not scrape page content', err);
      }

      const response = await fetch(`${API_BASE}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesToSend,
          contextUrl: window.location.pathname + window.location.search,
          pageActions: pageActions,
          pageContent: pageContent,
          userProfile: userProfileData
        })
      });

      const data = await response.json();
      if (data.success) {
        const appendedMessages = [...messagesToSend, { role: 'assistant', content: data.response }];
        setMessages(appendedMessages);
        
        // Execute Agent Action
        if (data.type === 'action') {
          const executeFollowUp = (resultStatus) => {
            const followUp = {
              role: 'user',
              content: `[System Update]: Action '${data.action === 'page_action' ? data.functionName : data.action}' was executed. Status: ${resultStatus}. Current URL is: ${window.location.pathname}. Please continue fulfilling the request based on this new context.`
            };
            const nextMessages = [...appendedMessages, followUp];
            setMessages(nextMessages);
            sendToAgent(nextMessages);
          };

          if (data.action === 'navigate' && data.path) {
            setTimeout(() => {
              navigate(data.path);
              // Do NOT close chat, allow reasoning to continue
              setTimeout(() => {
                executeFollowUp(`Navigated successfully to ${data.path}`);
              }, 500);
            }, 1000);
          } else if (data.action === 'start_interview') {
            const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 12);
            setTimeout(() => {
              if (data.params?.topic === 'System Design') {
                navigate(`/aisystemdesigninterview/${uuid}?topic=${encodeURIComponent(data.params.role || 'General')} System Design`);
              } else {
                navigate(`/aiinterview`, {
                  state: {
                    setupParams: {
                      role: data.params?.role || 'Software Engineer',
                      company: data.params?.company || 'Tech Company',
                      language: (data.params?.language || 'python').toLowerCase(),
                      selectedProblem: {
                          id: 'auto_generated_ai',
                          title: 'AI Curated Mock Problem',
                          difficulty: 'Medium',
                          description: `Please generate a comprehensive DSA coding problem specifically tailored for a ${data.params?.role || 'Software Engineer'} role at ${data.params?.company || 'a Tech Company'}. Include constraints and at least two test cases.`
                      },
                      selectedVoice: null
                    }
                  }
                });
              }
              setTimeout(() => {
                executeFollowUp(`Successfully started the mock interview. User is now in the interview room.`);
              }, 500);
            }, 1000);
          } else if (data.action === 'schedule_interview') {
            // Document already created by backend. Just return success.
            setTimeout(() => {
               executeFollowUp(`Successfully scheduled the interview.`);
            }, 500);
          } else if (data.action === 'page_action' && data.functionName) {
            // Execute the dynamic action mapped in the AgentContext
            executeAction(data.functionName, data.args).then((res) => {
              executeFollowUp(res ? 'Success' : 'Failed to execute action');
            });
          }
        }
      } else {
        setMessages([...messagesToSend, { role: 'assistant', content: '❌ Sorry, I encountered an error.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...messagesToSend, { role: 'assistant', content: '❌ Could not connect to the agent.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE, getActionSchemas, navigate, executeAction]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    sendToAgent(newMessages);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="orb-chat-container"
          onClick={(e) => e.stopPropagation()} // Prevent closing via outer clicks if added
        >
          <div className="orb-chat-header">
            <div className="orb-chat-title">
              <div className="orb-status-indicator"></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>Jarvis</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>AI Assistant · Online</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="orb-chat-action-btn"
                  title="New Chat"
                >
                  <RotateCcw size={14} />
                  <span>New</span>
                </button>
              )}
              <button onClick={onClose} className="orb-chat-close" title="Close">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="orb-chat-messages">
            {messages.length === 0 ? (
              <div className="orb-chat-empty">
                <div className="orb-chat-empty-icon">
                  <Sparkles size={24} />
                </div>
                <p style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Hey, I'm Jarvis!</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5, maxWidth: '220px' }}>Your AI assistant. Ask me anything about this page or the platform.</p>
                <div className="orb-chat-suggestions">
                  {['Start a mock interview', 'Find DSA courses', 'Navigate to my profile'].map(s => (
                    <button key={s} className="orb-suggestion-chip" onClick={() => { setInput(s); }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                if (msg.role === 'user' && msg.content.startsWith('[System Update]')) {
                  return (
                    <div key={idx} className="orb-chat-system-message">
                      <p>{msg.content.replace('[System Update]: ', '')}</p>
                    </div>
                  );
                }

                return (
                  <div key={idx} className={`orb-chat-bubble-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                    <div className={`orb-chat-bubble ${msg.role}`}>
                      {msg.role === 'assistant' ? (
                        <div className="markdown-body">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            {isLoading && (
              <div className="orb-chat-bubble-wrapper assistant">
                <div className="orb-chat-bubble assistant typing">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="orb-chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Jarvis..."
              disabled={isLoading}
            />
            <button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              className="orb-chat-send"
            >
              <Send size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
