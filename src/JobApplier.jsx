import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, ShieldCheck, Play, Square, Loader, Cpu, CheckCircle, Plus, X } from 'lucide-react';

export default function JobApplier() {
  const navigate = useNavigate();
  const [tabs, setTabs] = useState([{ id: 'tab-1', url: '', title: 'Whizan Home' }]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [inputUrl, setInputUrl] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-lite-preview');
  
  const tabsRef = useRef([{ id: 'tab-1', url: '', title: 'Whizan Home' }]);
  const activeTabIdRef = useRef('tab-1');
  const selectedModelRef = useRef('gemini-3.1-flash-lite-preview');
  
  // Sync refs with state
  useEffect(() => {
     tabsRef.current = tabs;
     activeTabIdRef.current = activeTabId;
     selectedModelRef.current = selectedModel;
  }, [tabs, activeTabId, selectedModel]);
  
  // Refs for managing iframes and DOM elements without triggering full re-renders
  const iframeRefs = useRef({}); // { 'tab-1': iframeElement, ... }
  const chatContainerRef = useRef(null);

  // Agent State
  const [agentStatus, setAgentStatus] = useState('Idle'); // Idle, Analyzing, Executing, Error, Done
  const [agentLogs, setAgentLogs] = useState([]);
  const [instruction, setInstruction] = useState('');
  const [apiCallCount, setApiCallCount] = useState(0);
  const userInstructionRef = useRef('');
  const previousActionsRef = useRef([]);
  const agentEnabledRef = useRef(false);
  const batchQueueRef = useRef([]);
  const pendingTimeoutsRef = useRef([]);
  const abortControllerRef = useRef(null); // cancels in-flight Gemini fetch
  const failedActionCountsRef = useRef({}); // signature -> consecutive fail count

  // Safe timeout that auto-registers for cancellation on stop
  const safeTimeout = (fn, delay) => {
    const id = setTimeout(() => {
      pendingTimeoutsRef.current = pendingTimeoutsRef.current.filter(t => t !== id);
      fn();
    }, delay);
    pendingTimeoutsRef.current.push(id);
    return id;
  };

  const addLog = (msg, type = 'info', actionData = null) => {
    setAgentLogs(prev => [...prev, { time: new Date().toISOString(), msg, type, actionData }]);
  };

  const actionSignature = (action = {}) => `${action.action || ''}|${action.selector || ''}|${action.value || ''}`;

  const sanitizeDecision = (rawDecision) => {
    const allowed = new Set(['click', 'type', 'navigate', 'switch-tab', 'new-tab', 'scroll', 'scroll-until', 'wait', 'done']);
    const solo = new Set(['navigate', 'switch-tab', 'new-tab', 'scroll', 'scroll-until', 'wait']);
    if (!rawDecision || typeof rawDecision !== 'object') return null;
    const normalized = {
      thought: String(rawDecision.thought || ''),
      actions: Array.isArray(rawDecision.actions) ? rawDecision.actions : []
    };
    const actions = normalized.actions
      .slice(0, 20)
      .map((a) => ({
        action: typeof a?.action === 'string' ? a.action.trim() : '',
        selector: typeof a?.selector === 'string' ? a.selector.trim() : undefined,
        value: a?.value == null ? undefined : String(a.value)
      }))
      .filter((a) => allowed.has(a.action));
    if (actions.length === 0) return null;
    if (solo.has(actions[0].action)) return { thought: normalized.thought, actions: [actions[0]] };
    return { thought: normalized.thought, actions };
  };

  const handleNavigate = (e) => {
    e.preventDefault();
    let target = inputUrl;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target}`;
    }
    
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: target, title: target } : t));
    setInputUrl(target);
  };

  const reloadIframe = () => {
    const iframe = iframeRefs.current[activeTabId];
    if (iframe) {
       // Force a reload by temporarily clearing src or using contentWindow.location.reload
       const currentSrc = iframe.src;
       iframe.src = 'about:blank';
       setTimeout(() => { iframe.src = currentSrc; }, 50);
    }
  };

  const createNewTab = (url = '', title = 'New Tab', switchAfter = true) => {
    const newId = `tab-${Date.now()}`;
    setTabs(prev => [...prev, { id: newId, url, title }]);
    if (switchAfter) {
       setActiveTabId(newId);
       setInputUrl(url);
    }
    return newId;
  };

  const closeTab = (e, idToClose) => {
    e.stopPropagation();
    if (tabs.length === 1) {
       // If last tab, just reset it
       setTabs([{ id: 'tab-1', url: '', title: 'Whizan Home' }]);
       setActiveTabId('tab-1');
       setInputUrl('');
       return;
    }

    setTabs(prev => prev.filter(t => t.id !== idToClose));
    if (activeTabId === idToClose) {
       // If closing active tab, switch to the first available
       const remainingTabs = tabs.filter(t => t.id !== idToClose);
       setActiveTabId(remainingTabs[0].id);
       setInputUrl(remainingTabs[0].url);
    }
  };

  const startAgent = (e) => {
    if (e) e.preventDefault();
    if (agentEnabledRef.current) return; // Guard against double-start
    
    // Do not wipe logs or previousActions to maintain a continuous conversational context
    setApiCallCount(0); // Reset API counter for this specific command session
    
    const userPrompt = instruction || 'Resume autonomous task';
    userInstructionRef.current = userPrompt;
    agentEnabledRef.current = true;
    failedActionCountsRef.current = {};
    setAgentStatus('Analyzing');
    
    addLog(userPrompt, 'user');
    // Inject the user's explicit command directly into the AI's action history timeline
    previousActionsRef.current.push({ role: 'user', command: userPrompt });
    
    setInstruction(''); // Clear input bar for good UX
    requestSnapshot();
  };

  const stopAgent = () => {
    console.log("[Agent] Manual Stop Triggered");
    agentEnabledRef.current = false;
    batchQueueRef.current = [];
    
    // Abort active fetch immediately
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear all scheduled snapshots and waits
    pendingTimeoutsRef.current.forEach(id => clearTimeout(id));
    pendingTimeoutsRef.current = [];
    
    setAgentStatus('Idle');
    addLog("🔴 Agent execution halted by user.", "warning");
  };

  const requestSnapshot = () => {
    if (!agentEnabledRef.current) return;
    
    // Read from refs to avoid stale closures during setTimeout execution
    const currentTabs = tabsRef.current;
    const currentActiveId = activeTabIdRef.current;
    
    const activeTab = currentTabs.find(t => t.id === currentActiveId);
    const iframe = iframeRefs.current[currentActiveId];

    // Build the tab context map to pass to the AI
    const tabContext = currentTabs.map(t => ({ id: t.id, title: t.title, url: t.url, active: t.id === currentActiveId }));

    // If no URL exists on the active tab, we are on the Whizan Home page
    if (!activeTab.url || !iframe) {
       const homeSnapshot = {
          url: "whizan://home",
          title: "Whizan Home",
          snapshotText: "Whizan Home Page. No website is currently loaded. To browse the web, output a navigate action with the URL you want to visit based on the user's prompt.",
          availableTabs: tabContext
       };
       // Trick the message listener into processing this perfectly like a real iframe
       window.postMessage({
          source: 'job-applier-content-script',
          type: 'SNAPSHOT_RESPONSE',
          snapshot: homeSnapshot
       }, '*');
       return;
    }

    if (iframe && iframe.contentWindow) {
       iframe.contentWindow.postMessage({
          source: 'job-applier-react-app',
          type: 'REQUEST_SNAPSHOT',
          availableTabs: tabContext // Ask the content script to bundle this back in the response
       }, '*');
    }
  };

  const executeAction = (actionDecision) => {
    if (!agentEnabledRef.current) return;
    setAgentStatus('Executing');
    addLog(`Executing: ${actionDecision.action}`, "action", actionDecision);
    previousActionsRef.current.push(actionDecision);
    
    // NATIVE UI NAVIGATION (Bypasses iframe sandbox traps and SPA hijackers)
    if (actionDecision.action === 'navigate') {
       const newTarget = actionDecision.value || actionDecision.url;
       setTabs(prev => prev.map(t => t.id === activeTabIdRef.current ? { ...t, url: newTarget, title: newTarget } : t));
       setInputUrl(newTarget);
       addLog(`Navigating natively to ${newTarget}...`, "success");
       
       setAgentStatus('Analyzing');
       safeTimeout(requestSnapshot, 6000);
       return; 
    }

    // AI TAB SWITCHING DOMAIN LOGIC
    if (actionDecision.action === 'switch-tab') {
       const targetId = actionDecision.value;
       const targetTab = tabsRef.current.find(t => t.id === targetId);
       if (targetTab) {
          setActiveTabId(targetId);
          setInputUrl(targetTab.url);
          addLog(`Switched focus to tab: ${targetTab.title}`, 'success');
          // Wait briefly for UI to render the new iframe, then snapshot the new tab
          setAgentStatus('Analyzing');
          safeTimeout(requestSnapshot, 1000);
       } else {
          addLog(`Failed to switch: Tab ${targetId} not found.`, 'error');
          // Proceed with same tab if we failed
          safeTimeout(requestSnapshot, 2000);
       }
       return;
    }

    // AI NEW TAB SPAWNING LOGIC
    if (actionDecision.action === 'new-tab') {
       const newTarget = actionDecision.value || actionDecision.url;
       createNewTab(newTarget, 'Loading...', true);
       addLog(`Agent opened new tab for: ${newTarget}`, "success");
       setAgentStatus('Analyzing');
       safeTimeout(requestSnapshot, 6000);
       return;
    }

    const iframe = iframeRefs.current[activeTabIdRef.current];
    if (iframe && iframe.contentWindow) {
       iframe.contentWindow.postMessage({
          source: 'job-applier-react-app',
          type: 'EXECUTE_ACTION',
          action: actionDecision
       }, '*');
    }
  };

  useEffect(() => {
    return () => {
      stopAgent();
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [agentLogs, agentStatus]);

  useEffect(() => {
    const handleMessage = async (event) => {
      // Security/Origin checks can be added here
      if (!event.data || event.data.source !== 'job-applier-content-script') return;

      if (event.data.type === 'SNAPSHOT_RESPONSE') {
        if (!agentEnabledRef.current) return;
        setAgentStatus('Analyzing');
        const snapshot = event.data.snapshot;
        setInputUrl(snapshot.url); // Sync the visual URL bar with actual frame page
        addLog(`Snapshot received. URL: ${snapshot.url}. Sending to ${selectedModelRef.current.includes('mistral') ? 'Nvidia' : 'Gemini'}...`, "info");
        
        try {
           setApiCallCount(prev => prev + 1);
           const controller = new AbortController();
           abortControllerRef.current = controller;
           const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : (import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration-55z3.onrender.com');
           const compactActions = previousActionsRef.current.slice(-20).map((a) => ({
              action: a?.action || a?.command || '',
              selector: a?.selector || undefined,
              value: a?.value || undefined
           }));
           const res = await fetch(`${API_BASE}/api/ai/browser-agent`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                 snapshot,
                 previousActions: compactActions,
                 userPrompt: userInstructionRef.current,
                 selectedModel: selectedModelRef.current
              })
           });
           abortControllerRef.current = null;
           
           // Discard response if agent was stopped during the API call
           if (!agentEnabledRef.current) return;
           
           if (!res.ok) throw new Error("API responded with " + res.status);
           const data = await res.json();
           
           const decision = sanitizeDecision(data.decision);
           if (decision) {
              addLog(`💭 ${decision.thought}`, "success");
              
              const actions = decision.actions || [];
              
              if (actions.length === 0) {
                 setAgentStatus('Error');
                 addLog("AI returned no actions.", "error");
                 agentEnabledRef.current = false;
                 return;
              }

              // Check for terminal/solo actions first
              const firstAction = actions[0];
              if (firstAction.action === 'done' || (actions.length === 1 && firstAction.action === 'done')) {
                 setAgentStatus('Done');
                 addLog("✅ Agent completed the objective.", "success");
                 agentEnabledRef.current = false;
                 return;
              }

              // For terminal and layout shifting actions, execute and immediately break the batch
              if (firstAction.action === 'navigate') {
                 executeAction(firstAction);
                 return;
              }
              if (firstAction.action === 'switch-tab') {
                 executeAction(firstAction);
                 return;
              }
              if (firstAction.action === 'new-tab') {
                 executeAction(firstAction);
                 return;
              }
              if (firstAction.action === 'scroll') {
                 executeAction(firstAction);
                 return;
              }
              if (firstAction.action === 'scroll-until') {
                 executeAction(firstAction);
                 return;
              }
              if (firstAction.action === 'wait') {
                 setAgentStatus('Analyzing');
                 addLog("⏳ Agent waiting before next step...", "info");
                 safeTimeout(requestSnapshot, 4000);
                 return;
              }
              
              // Execute the full batch sequentially, then re-snapshot once
              const executeBatch = async (remainingActions) => {
                 if (!agentEnabledRef.current || remainingActions.length === 0) {
                    // All batch actions done — request one fresh snapshot
                    setAgentStatus('Analyzing');
                    safeTimeout(requestSnapshot, 2500);
                    return;
                 }
                 const action = remainingActions[0];
                 if (action.action === 'done') {
                    setAgentStatus('Done');
                    addLog("✅ Agent completed the objective.", "success");
                    agentEnabledRef.current = false;
                    return;
                 }
                 executeAction(action);
                 // Wait for ACTION_RESPONSE to come back — handled below via the ref
                 batchQueueRef.current = remainingActions.slice(1);
              };
              
              batchQueueRef.current = actions.slice(1);
              executeAction(actions[0]);
           } else {
              throw new Error("No decision returned");
           }
         } catch (err) {
            // Ignore abort errors caused by stopAgent()
            if (err.name === 'AbortError') {
               console.log("[Agent] Fetch aborted safely.");
               return;
            }
            
            setAgentStatus('Error');
            addLog(`❌ AI Error: ${err.message}`, "error");
            agentEnabledRef.current = false;
            batchQueueRef.current = [];
         }
      }
      else if (event.data.type === 'ACTION_RESPONSE') {
        if (!agentEnabledRef.current) return;
        addLog(`Action result: ${event.data.success ? '✅' : '❌'} ${event.data.message}`, event.data.success ? "success" : "error");
        
        if (event.data.success) {
           failedActionCountsRef.current = {};
           // If there are more batch actions, execute the next one
           if (batchQueueRef.current.length > 0) {
              const nextAction = batchQueueRef.current[0];
              batchQueueRef.current = batchQueueRef.current.slice(1);
              if (nextAction.action === 'done') {
                 setAgentStatus('Done');
                 addLog("✅ Agent completed the objective.", "success");
                 agentEnabledRef.current = false;
              } else {
                 executeAction(nextAction);
              }
           } else {
              // Batch complete — take one new snapshot
              setAgentStatus('Analyzing');
              safeTimeout(requestSnapshot, 2500);
           }
        } else {
           const lastAction = previousActionsRef.current[previousActionsRef.current.length - 1] || {};
           const sig = actionSignature(lastAction);
           failedActionCountsRef.current[sig] = (failedActionCountsRef.current[sig] || 0) + 1;
           const failCount = failedActionCountsRef.current[sig];

           if (failCount >= 2) {
              addLog("Loop guard: repeated action failure detected. Forcing fresh snapshot and strategy shift.", "warning");
              batchQueueRef.current = [];
              previousActionsRef.current.push({
                role: 'system',
                command: `Avoid repeating failed action ${sig}; choose alternative path.`
              });
              setAgentStatus('Analyzing');
              safeTimeout(requestSnapshot, 1200);
              return;
           }

           setAgentStatus('Error');
           agentEnabledRef.current = false;
           batchQueueRef.current = [];
        }
      }
      else if (event.data.type === 'URL_CHANGED') {
        // Keeps the visual address bar exactly synced with internal iframe changes
        // Only update if the message comes from the currently active tab's iframe
        const activeIframe = iframeRefs.current[activeTabId];
        if (activeIframe && activeIframe.contentWindow === event.source) {
           setInputUrl(event.data.url);
           setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: event.data.url, title: event.data.title || event.data.url } : t));
        }
      }
      else if (event.data.type === 'NAVIGATE_REQUEST') {
        const url = event.data.url;
        const targetAttr = event.data.target; // Legacy fallback
        const isExternal = event.data.isExternal;

        if (targetAttr === '_blank' || targetAttr === '_new' || isExternal) {
           // Create a new tab instead of destroying the current one
           createNewTab(url, 'Loading...', true);
           addLog(`Opened external link in new tab: ${url}`, 'info');
        } else {
           // Same tab navigation
           setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url } : t));
           setInputUrl(url);
        }
      }
      else if (event.data.type === 'PAGE_IDLE') {
        // If we are currently "Analyzing" and there are timeouts pending (meaning we're waiting to snapshot), accelerate it!
        if (agentEnabledRef.current && agentStatus === 'Analyzing' && pendingTimeoutsRef.current.length > 0) {
           pendingTimeoutsRef.current.forEach(id => clearTimeout(id));
           pendingTimeoutsRef.current = [];
           addLog(`⚡ DOM idle detected. Bypassing wait...`, 'info');
           requestSnapshot();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ 
      height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex', flexDirection: 'column', 
      background: '#0f1115', color: '#fff', fontFamily: "'Inter', sans-serif" 
    }}>
      {/* ── App Top Header ── */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '60px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#050505', flexShrink: 0 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, background: 'linear-gradient(90deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                Universal Browser Agent
            </span>
            <div style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.1)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, borderRadius: '4px' }}>AI BROWSER AGENT</div>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select 
               value={selectedModel} 
               onChange={(e) => setSelectedModel(e.target.value)}
               style={{ 
                  background: '#1a1d24', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '6px', padding: '6px 12px', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' 
               }}
            >
               <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Preview</option>
               <option value="mistralai/mistral-small-4-119b-2603">Nvidia Mistral Small 4</option>
            </select>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
               Exit to Dashboard
            </button>
         </div>
      </header>

      {/* ── Main Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 450px) 1fr', flex: 1, minHeight: 0 }}>

         {/* ── Left Half: Automation Panel ── */}
         <div style={{ background: '#0a0b0e', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
             {/* Status header */}
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginBottom: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                   <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Cpu size={18} color="#c084fc" /> Automation Agent
                   </h2>
                   <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginLeft: '26px' }}>
                      SESSION API CALLS: <span style={{ color: '#60a5fa' }}>{apiCallCount}</span>
                   </div>
                </div>
                <div style={{ 
                   padding: '3px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase',
                   background: agentStatus === 'Analyzing' || agentStatus === 'Executing' ? 'rgba(59, 130, 246, 0.2)' : agentStatus === 'Error' ? 'rgba(239, 68, 68, 0.2)' : agentStatus === 'Done' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                   color: agentStatus === 'Analyzing' || agentStatus === 'Executing' ? '#60a5fa' : agentStatus === 'Error' ? '#f87171' : agentStatus === 'Done' ? '#34d399' : '#9ca3af'
                }}>
                   {agentStatus}
                </div>
             </div>
             
             {/* Logs Console */}
             <div ref={chatContainerRef} style={{ flex: 1, background: '#111318', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px', scrollBehavior: 'smooth' }}>
                {agentLogs.length === 0 ? (
                   <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '40px', fontSize: '0.9rem' }}>
                      Send a command below to start the autonomous agent.
                   </div>
                ) : (
                   agentLogs.map((log, i) => {
                      const isUser = log.type === 'user';
                      return (
                         <div key={i} style={{ 
                            display: 'flex', flexDirection: 'column', 
                            alignItems: isUser ? 'flex-end' : 'flex-start',
                            marginBottom: '4px'
                         }}>
                            <div style={{
                               maxWidth: '85%', padding: '10px 14px',
                               borderRadius: isUser ? '16px 16px 0 16px' : '16px 16px 16px 0',
                               background: isUser ? '#3b82f6' : (log.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)'),
                               color: isUser ? '#fff' : (log.type === 'error' ? '#fca5a5' : '#e5e7eb'),
                               border: isUser ? 'none' : `1px solid ${log.type === 'error' ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                               fontSize: '0.9rem', lineHeight: '1.4', wordBreak: 'break-word'
                            }}>
                               {log.msg}
                               {log.actionData && (
                                  <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#9ca3af' }}>
                                     ► selector: {log.actionData.selector}<br/>
                                     {log.actionData.value && <>► value: {log.actionData.value}</>}
                                  </div>
                               )}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginTop: '4px', padding: '0 4px' }}>
                               {new Date(log.time).toLocaleTimeString()}
                            </div>
                         </div>
                      );
                   })
                )}
                {agentStatus === 'Analyzing' && (
                   <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '16px 16px 16px 0', color: '#60a5fa', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <Loader size={16} className="animate-spin" /> Gemini is thinking...
                      </div>
                   </div>
                )}
             </div>

             {/* ── Chat input pinned at bottom ── */}
             <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginTop: '10px' }}>
                <form onSubmit={startAgent} style={{ flex: 1, display: 'flex' }}>
                    <input 
                       type="text" 
                       value={instruction}
                       onChange={e => setInstruction(e.target.value)}
                       disabled={agentStatus !== 'Idle' && agentStatus !== 'Error' && agentStatus !== 'Done'}
                       placeholder="Give the agent a command..."
                       style={{
                          flex: 1, padding: '11px 14px', background: '#111318',
                          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                          color: '#fff', fontSize: '0.9rem', outline: 'none'
                       }}
                    />
                    <button type="submit" style={{ display: 'none' }}></button>
                </form>
                
                {agentStatus === 'Idle' || agentStatus === 'Error' || agentStatus === 'Done' ? (
                   <button onClick={startAgent} title="Send" style={{ background: '#3b82f6', border: 'none', color: '#fff', width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Play size={18} fill="currentColor" />
                   </button>
                ) : (
                   <button type="button" onClick={stopAgent} title="Stop" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)', color: '#f87171', width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Square size={18} fill="currentColor" />
                   </button>
                )}
             </div>
         </div>

         {/* ── Right Half: Embedded Browser ── */}
         <div style={{ 
            display: 'flex', flexDirection: 'column', 
            height: 'calc(100vh - 110px)', margin: '15px 20px', 
            borderRadius: '16px', overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.05)'
         }}>
            {/* ── Tabs Bar ── */}
            <div style={{ display: 'flex', background: '#0a0b0e', borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto', flexShrink: 0 }}>
               {tabs.map((tab) => (
                  <div 
                     key={tab.id}
                     onClick={() => {
                        setActiveTabId(tab.id);
                        setInputUrl(tab.url);
                     }}
                     style={{
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        padding: '10px 16px', minWidth: '150px', maxWidth: '220px',
                        background: activeTabId === tab.id ? '#1a1d24' : 'transparent',
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        borderBottom: activeTabId === tab.id ? '2px solid #60a5fa' : '2px solid transparent',
                        cursor: 'pointer', transition: '0.2s',
                        color: activeTabId === tab.id ? '#fff' : '#9ca3af'
                     }}
                  >
                     <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                        {tab.title || tab.url || 'New Tab'}
                     </span>
                     <button 
                        onClick={(e) => closeTab(e, tab.id)}
                        style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                     >
                        <X size={14} />
                     </button>
                  </div>
               ))}
               <button 
                  onClick={() => createNewTab()}
                  style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '10px 16px', display: 'flex', alignItems: 'center', transition: '0.2s', ':hover': { color: '#fff' } }}
               >
                  <Plus size={16} />
               </button>
            </div>

            {/* ── Browser Emulator Bar ── */}
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 20px', 
              background: '#1a1d24', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0
            }}>
               <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}>
                     <ArrowLeft size={18} />
                  </button>
                  <button style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}>
                     <ArrowRight size={18} />
                  </button>
                  <button onClick={reloadIframe} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}>
                     <RotateCw size={18} />
                  </button>
                  <button onClick={() => { 
                     setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: '', title: 'Whizan Home' } : t));
                     setInputUrl(''); 
                  }} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}>
                     <Home size={18} />
                  </button>
               </div>
               
               <form onSubmit={handleNavigate} style={{ flex: 1, display: 'flex', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: '#10b981' }}>
                     <ShieldCheck size={16} />
                  </div>
                  <input 
                    value={inputUrl}
                    onChange={e => setInputUrl(e.target.value)}
                    style={{
                       width: '100%', padding: '10px 16px 10px 36px', background: '#0f1115', 
                       border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', 
                       color: '#fff', fontSize: '0.95rem', outline: 'none'
                    }}
                  />
                  <button type="submit" style={{ display: 'none' }}></button>
               </form>
            </div>

            {/* ── Iframe Container ── */}
            <div style={{ flex: 1, backgroundColor: '#fff', position: 'relative', overflow: 'hidden' }}>
               {(agentStatus === 'Analyzing' || agentStatus === 'Executing') && (
                   <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50,
                      background: 'rgba(59, 130, 246, 0.05)', 
                      pointerEvents: 'auto', 
                      cursor: 'not-allowed',
                      boxShadow: 'inset 0 0 40px rgba(59, 130, 246, 0.5)',
                      border: '2px solid rgba(59, 130, 246, 0.8)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      paddingBottom: '24px'
                   }}>
                      <div style={{ 
                         background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(59, 130, 246, 0.5)', 
                         color: '#fff', padding: '12px 24px', borderRadius: '30px', display: 'flex', 
                         alignItems: 'center', gap: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                         backdropFilter: 'blur(10px)', maxWidth: '80%', textAlign: 'center'
                      }}>
                         <Loader size={18} className="animate-spin" color="#60a5fa" />
                         <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                            {agentStatus === 'Analyzing' 
                                ? 'Agent is reading and analyzing the page...' 
                                : `Agent Executing: ${agentLogs.length > 0 && agentLogs[agentLogs.length-1].actionData ? agentLogs[agentLogs.length-1].actionData.action : 'Action...'}`}
                         </span>
                      </div>
                   </div>
               )}
               
               {/* Render ALL tabs, but hide the inactive ones to preserve their state */}
               {tabs.map((tab) => (
                  <div key={tab.id} style={{ display: activeTabId === tab.id ? 'block' : 'none', height: '100%', width: '100%' }}>
                     {tab.url ? (
                        <iframe 
                           ref={el => iframeRefs.current[tab.id] = el}
                           src={tab.url} 
                           name="whizan-ai-agent"
                           style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                           title={`Embedded Browser - ${tab.title}`}
                           sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        />
                     ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#0f1115', color: '#fff' }}>
                           <img src="/logo.jpeg" alt="Whizan App Logo" style={{ width: '80px', height: '80px', borderRadius: '16px', marginBottom: '15px', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                           <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              Whizan <span style={{ color: '#c084fc' }}>Home</span>
                           </h2>
                           <p style={{ color: '#9ca3af', maxWidth: '400px', textAlign: 'center', lineHeight: '1.5', fontSize: '0.95rem' }}>
                              Enter a URL in the address bar above and instruct the agent to start browsing.
                           </p>
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </div>
         
      </div>
    </div>
  );
}

