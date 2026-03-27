import React, { useState, useRef, useEffect, useCallback } from 'react';
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
          pageContent: pageContent
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
