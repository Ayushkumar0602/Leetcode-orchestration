import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './OrbChat.css';

export default function OrbChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          contextUrl: window.location.pathname + window.location.search
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages([...newMessages, { role: 'assistant', content: data.response }]);
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
                      <ReactMarkdown className="markdown-body">{msg.content}</ReactMarkdown>
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
