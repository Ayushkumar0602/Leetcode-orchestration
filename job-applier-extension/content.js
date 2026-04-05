// content.js - Injected into target iframes by the extension
// Flag to ensure we don't start multiple listeners AND only run inside the emulator
if (!window.jobApplierAgentInjected && window.name === 'whizan-ai-agent') {
  console.log("[Job Applier Agent] Emulator frame detected. Content script injected on:", window.location.href);
  window.jobApplierAgentInjected = true;

  let globalAgentIdCounter = 1;

  // Assigns sequential IDs to interactive elements so the AI can target them precisely
  function assignTemporaryIds() {
    const elements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"], [tabindex="0"]');
    elements.forEach(el => {
      // Don't overwrite existing agent-ids and don't assign if not visible
      if (!el.hasAttribute('data-agent-id') && el.offsetParent !== null) {
        el.setAttribute('data-agent-id', `el-${globalAgentIdCounter++}`);
      }
    });
  }

  // Captures a text-based representation of the DOM with interactive landmarks
  function captureDOMSnapshot() {
    assignTemporaryIds();
    
    // We clean up the view by grabbing text blocks and tagging interactive elements
    // A full raw HTML dump would be too large and noisy for an LLM
    const elements = document.querySelectorAll('body *');
    let snapshotText = "";
    
    // A simplified tree walker
    const walkNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) {
          snapshotText += text + " ";
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Skip script, style
        if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'SVG', 'PATH'].includes(node.tagName)) {
          return;
        }
        
        let isInteractive = false;
        if (node.hasAttribute('data-agent-id')) {
          isInteractive = true;
          const agentId = node.getAttribute('data-agent-id');
          const role = node.tagName.toLowerCase();
          const ariaLabel = node.getAttribute('aria-label') || "";
          
          let state = "";
          if (node.tagName === "INPUT" || node.tagName === "TEXTAREA" || node.tagName === "SELECT") {
            state = `[value="${node.value}"] `;
            if (node.placeholder) state += `[placeholder="${node.placeholder}"] `;
            if (node.name) state += `[name="${node.name}"] `;
          }
          if (node.disabled) {
            state += "[disabled] ";
          }
          
          snapshotText += `\n<%INTERACTIVE id="${agentId}" type="${role}" ${ariaLabel ? 'label="'+ariaLabel+'"' : ''} ${state}> `;
        }
        
        node.childNodes.forEach(walkNode);
        
        if (isInteractive) {
           snapshotText += ` </%INTERACTIVE>\n`;
        }
      }
    };
    
    walkNode(document.body);
    
    return {
      url: window.location.href,
      title: document.title,
      snapshotText: snapshotText.trim().replace(/\n{3,}/g, '\n\n') // Clean up excessive whitespace
    };
  }

  // ── NEW TAB INTERCEPTION ──
  // Prevents ANY link from opening a new tab. Instead, sends the URL to the
  // parent React app so it can load it natively inside the same iframe.
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;

    const href = anchor.href;
    if (!href || href.startsWith('javascript:') || href.startsWith('#')) return;

    const originalTarget = anchor.getAttribute('data-original-target') || anchor.getAttribute('target');
    const isExternal = (originalTarget === '_blank' || originalTarget === '_new' || (anchor.hostname && anchor.hostname !== window.location.hostname));

    if (isExternal) {
      e.preventDefault();
      e.stopPropagation();
      
      let finalUrl = href;
      // Handle LinkedIn safety redirects (which break in iframes)
      if (finalUrl.includes('linkedin.com/safety/go')) {
        try {
           const urlObj = new URL(finalUrl);
           const redirectUrl = urlObj.searchParams.get('url');
           if (redirectUrl) finalUrl = decodeURIComponent(redirectUrl);
        } catch(e) {}
      }

      window.parent.postMessage({
        source: 'job-applier-content-script',
        type: 'NAVIGATE_REQUEST',
        url: finalUrl,
        isExternal: true
      }, '*');
    }
  }, true); // capture phase to intercept before any site's own click handlers

  // Also strip target="_blank" from ALL links to prevent passive pops
  const observer = new MutationObserver(() => {
    document.querySelectorAll('a[target="_blank"], a[target="_new"]').forEach(a => {
      a.setAttribute('data-original-target', a.getAttribute('target'));
      a.removeAttribute('target');
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  // Apply to existing links immediately
  document.querySelectorAll('a[target="_blank"], a[target="_new"]').forEach(a => {
    a.setAttribute('data-original-target', a.getAttribute('target'));
    a.removeAttribute('target');
  });

  // Listen for messages from BOTH the React app (parent frame) AND the injected main-world script
  window.addEventListener('message', async (event) => {
    
    // 1. Handle programmatic window.open from the injected main-world script
    if (event.source === window && event.data && event.data.type === 'WHIZAN_PROGRAMMATIC_OPEN') {
      let finalUrl = event.data.url;
      // Handle LinkedIn safety redirects
      if (finalUrl.includes('linkedin.com/safety/go')) {
        try {
           const urlObj = new URL(finalUrl);
           const redirectUrl = urlObj.searchParams.get('url');
           if (redirectUrl) finalUrl = decodeURIComponent(redirectUrl);
        } catch(e) {}
      }

      window.parent.postMessage({
        source: 'job-applier-content-script',
        type: 'NAVIGATE_REQUEST',
        url: finalUrl,
        isExternal: true
      }, '*');
      return;
    }

    // 2. Handle commands from the JobApplier React App
    if (!event.data || event.data.source !== 'job-applier-react-app') return;

    if (event.data.type === 'REQUEST_SNAPSHOT') {
      const snapshot = captureDOMSnapshot();
      event.source.postMessage({
        source: 'job-applier-content-script',
        type: 'SNAPSHOT_RESPONSE',
        snapshot: {
          ...snapshot,
          availableTabs: event.data.availableTabs || []
        }
      }, event.origin);
    } 
    else if (event.data.type === 'EXECUTE_ACTION') {
      const action = event.data.action;
      console.log("[Job Applier Agent] Executing action:", action);
      
      let success = false;
      let message = "";
      
      // Helper to animate a fake AI cursor on the page
      const moveCursorTo = (el) => {
        return new Promise(resolve => {
           let cursor = document.getElementById('whizan-ai-cursor');
           if (!cursor) {
              cursor = document.createElement('div');
              cursor.id = 'whizan-ai-cursor';
              cursor.style.position = 'fixed';
              cursor.style.width = '24px';
              cursor.style.height = '24px';
              cursor.style.borderRadius = '50%';
              cursor.style.backgroundColor = 'rgba(59, 130, 246, 0.4)';
              cursor.style.border = '2px solid rgba(96, 165, 250, 0.8)';
              cursor.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.6)';
              cursor.style.zIndex = '9999999';
              cursor.style.pointerEvents = 'none';
              cursor.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
              cursor.style.left = `${window.innerWidth / 2}px`;
              cursor.style.top = `${window.innerHeight / 2}px`;
              document.body.appendChild(cursor);
           }
           
           if (!el) { resolve(); return; }
           
           const rect = el.getBoundingClientRect();
           const x = rect.left + rect.width / 2;
           const y = rect.top + rect.height / 2;
           
           setTimeout(() => {
              cursor.style.left = `${x - 12}px`;
              cursor.style.top = `${y - 12}px`;
              setTimeout(() => {
                 cursor.style.transform = 'scale(1.4)';
                 cursor.style.backgroundColor = 'rgba(16, 185, 129, 0.5)';
                 setTimeout(() => {
                    cursor.style.transform = 'scale(1)';
                    cursor.style.backgroundColor = 'rgba(59, 130, 246, 0.4)';
                    resolve();
                 }, 100);
              }, 200);
           }, 20);
        });
      };

      try {
        if (action.action === 'click') {
          // Priority to data-agent-id if provided
          let el = null;
          if (action.selector && action.selector.startsWith('el-')) {
             el = document.querySelector(`[data-agent-id="${action.selector}"]`);
          } 
          if (!el && action.selector) {
             el = document.querySelector(action.selector); // Fallback standard CSS selector
          }
          
          if (el) {
            const rect = el.getBoundingClientRect();
            window.scrollBy({ top: rect.top - window.innerHeight / 2, behavior: 'smooth' });
            await new Promise(r => setTimeout(r, 400));
            await moveCursorTo(el);
            el.click();
            success = true;
            message = "Click successful";
          } else {
            message = `Element not found: ${action.selector}`;
          }
        } 
        else if (action.action === 'type') {
          let el = null;
          if (action.selector && action.selector.startsWith('el-')) {
             el = document.querySelector(`[data-agent-id="${action.selector}"]`);
          } 
          if (!el && action.selector) {
             el = document.querySelector(action.selector);
          }
          
          if (el) {
             const rect = el.getBoundingClientRect();
             window.scrollBy({ top: rect.top - window.innerHeight / 2, behavior: 'smooth' });
             await new Promise(r => setTimeout(r, 400));
             await moveCursorTo(el);

             // --- UNIVERSAL ROBUST TYPE MECHANISM ---
             // Uses setRangeText for inputs/textareas - highly compatible with React/Vue
             // and avoids the "Illegal invocation" cross-context prototype issues.
             el.focus();
             
             let typingSuccess = false;
             try {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                   // Select all text and replace it via setRangeText
                   el.select();
                   el.setRangeText(action.value, 0, el.value ? el.value.length : 0, 'end');
                   typingSuccess = true;
                } else if (el.isContentEditable) {
                   // For Monaco/CodeMirror and rich text editors
                   document.execCommand('selectAll', false, null);
                   document.execCommand('insertText', false, action.value);
                   typingSuccess = true;
                }
             } catch (e) {
                console.warn("[Agent] Primary typing method failed, falling back:", e);
             }

             if (!typingSuccess) {
                // Last ditch effort for weird elements
                if ('value' in el) el.value = action.value;
                else el.textContent = action.value;
             }

             // Fire ALL common events so frameworks (React, Vue, Alpine) catch the update
             const eventInit = { bubbles: true, cancelable: true };
             el.dispatchEvent(new Event('input', eventInit));
             el.dispatchEvent(new Event('change', eventInit));
             el.dispatchEvent(new KeyboardEvent('keydown', { ...eventInit, key: 'Enter', code: 'Enter' }));
             
             success = true;
             message = `Type successful into ${el.tagName}`;
          } else {
             message = `Element not found: ${action.selector}`;
          }
        }
        else if (action.action === 'navigate') {
          window.location.href = action.value;
          success = true;
          message = `Navigating to ${action.value}...`;
        }
        else if (action.action === 'scroll') {
          let direction = 'down';
          let scrollAmount = window.innerHeight * 0.8;
          let behavior = 'smooth';
          let delay = 900;

          if (typeof action.value === 'string') {
             const parts = action.value.toLowerCase().split(' ');
             direction = parts.includes('up') ? 'up' : 'down';
             
             // Check if user requested a specific amount
             const amountParam = parts.find(p => !isNaN(parseInt(p)));
             if (amountParam) {
                scrollAmount = parseInt(amountParam);
             }
             
             // Check if user requested fast
             if (action.value.includes('fast') || action.value.includes('instant')) {
                behavior = 'instant';
                delay = 300; // Just enough for DOM to paint
             }
          }

          if (direction === 'up') {
             window.scrollBy({ top: -scrollAmount, behavior });
          } else {
             window.scrollBy({ top: scrollAmount, behavior });
          }
          await new Promise(r => setTimeout(r, delay)); // wait for scroll to finish visually
          success = true;
          message = `Scrolled ${direction} by ${Math.round(scrollAmount)}px`;
        }
        else if (action.action === 'scroll-until') {
          const target = (action.value || '').toLowerCase();
          let found = false;
          let iterations = 0;
          const maxIterations = 10;
          const distance = window.innerHeight * 0.8;

          // Check immediately before scrolling
          if (document.body.innerText.toLowerCase().includes(target)) {
             found = true;
          }

          while (!found && iterations < maxIterations) {
             window.scrollBy({ top: distance, behavior: 'smooth' });
             await new Promise(r => setTimeout(r, 1200)); // wait for scroll + lazy load API paint
             
             if (document.body.innerText.toLowerCase().includes(target)) {
                found = true;
             }
             iterations++;
          }

          success = true; 
          if (found) {
             message = `Macro scrolled ${iterations} times and successfully located "${action.value}".`;
          } else {
             message = `Macro scrolled ${maxIterations} times but could NOT find "${action.value}".`;
          }
        }
        else if (action.action === 'wait') {
          // Just wait, no-op effectively, the orchestration loop will pause
          success = true;
          message = "Waiting.";
        }
        else if (action.action === 'done') {
          // End of task
          success = true;
          message = "Task complete.";
        }
        else {
          message = `Unknown action type: ${action.action}`;
        }
      } catch (err) {
        success = false;
        message = err.toString();
      }

      event.source.postMessage({
        source: 'job-applier-content-script',
        type: 'ACTION_RESPONSE',
        success,
        message
      }, event.origin);
    }
  });

  // Signal to the parent that the script is ready, just in case parent is waiting
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      source: 'job-applier-content-script',
      type: 'SCRIPT_READY',
      url: window.location.href
    }, '*');
    
    // Periodically sync the URL back to our fake Applier Address Bar
    // Needed because SPAs (like LinkedIn/YouTube) change URL without full page unloads
    let lastUrl = window.location.href;
    setInterval(() => {
       if (window.location.href !== lastUrl) {
          lastUrl = window.location.href;
          window.parent.postMessage({
             source: 'job-applier-content-script',
             type: 'URL_CHANGED',
             url: lastUrl
          }, '*');
       }
    }, 1000);
  }
}
