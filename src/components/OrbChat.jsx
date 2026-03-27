import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAgent } from '../contexts/AgentContext';
import './OrbChat.css';

export default function OrbChat({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { getActionSchemas, executeAction } = useAgent();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const pageActions = getActionSchemas();

      const response = await fetch(`${API_BASE}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          contextUrl: window.location.pathname + window.location.search,
          pageActions: pageActions
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages([...newMessages, { role: 'assistant', content: data.response }]);
        
        // Execute Agent Action
        if (data.type === 'action') {
          if (data.action === 'navigate' && data.path) {
            setTimeout(() => {
              navigate(data.path);
              onClose(); // Close the chat overlay smoothly after navigation
            }, 1500);
          } else if (data.action === 'page_action' && data.functionName) {
            // Execute the dynamic action mapped in the AgentContext
            executeAction(data.functionName, data.args);
          }
        }
      } else {
        setMessages([...newMessages, { role: 'assistant', content: '❌ Sorry, I encountered an error.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: '❌ Could not connect to the agent.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="orb-chat-container"
          onClick={(e) => e.stopPropagation()} // Prevent closing via outer clicks if added
        >
          <div className="orb-chat-header">
            <div className="orb-chat-title">
              <div className="orb-status-indicator"></div>
              <span>Jarvis AI</span>
            </div>
            <button onClick={onClose} className="orb-chat-close">
              <X size={18} />
            </button>
          </div>

          <div className="orb-chat-messages">
            {messages.length === 0 ? (
              <div className="orb-chat-empty">
                <p>Hello! I am Jarvis, your global AI agent.</p>
                <p>How can I help you with this page?</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
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
              ))
            )}
            {isLoading && (
              <div className="orb-chat-bubble-wrapper assistant">
                <div className="orb-chat-bubble assistant typing">
                  <Loader2 className="spinner" size={16} />
                  <span>Agent is thinking...</span>
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
