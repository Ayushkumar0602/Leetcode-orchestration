(function() {
  if (window.name !== 'whizan-ai-agent') return;
  const originalWindowOpen = window.open;
  window.open = function(url, target, features) {
    // Post message to the isolated content script
    window.postMessage({ type: 'WHIZAN_PROGRAMMATIC_OPEN', url: url }, '*');
    return null; // Block actual popup
  };
})();
