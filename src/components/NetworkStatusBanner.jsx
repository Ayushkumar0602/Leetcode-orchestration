import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';

const NetworkStatusBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Determine initial state logic
    if (!navigator.onLine) {
      setHasBeenOffline(true);
      setVisible(true);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setVisible(true); // Show the restored message
      
      // Auto-hide the "Restored" message after 4 seconds
      setTimeout(() => {
        setVisible(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasBeenOffline(true);
      setVisible(true); // Persistently show offline message
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't render anything if we've never been offline and we are currently online,
  // or if the banner shouldn't be visible right now (auto-dismissed online state)
  if (!visible && isOnline) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999, // Super high z-index to stay above navbars/modals
        display: 'flex',
        justifyContent: 'center',
        padding: '12px',
        pointerEvents: 'none', // Allow clicks to pass through except for the banner content itself
        animation: 'slideDown 0.4s ease-out',
      }}
    >
      <style>
        {`
          @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
      
      <div 
        style={{
          background: isOnline ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
          backdropFilter: 'blur(10px)',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '100px', // Pill shape
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: isOnline 
            ? '0 10px 25px rgba(16, 185, 129, 0.3)' 
            : '0 10px 25px rgba(239, 68, 68, 0.4)',
          border: isOnline ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.3)',
          pointerEvents: 'auto', // Re-enable pointer events for the content box
          fontSize: '0.95rem',
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {isOnline ? (
          <Wifi size={18} strokeWidth={2.5} />
        ) : (
          <WifiOff size={18} strokeWidth={2.5} />
        )}
        
        <span>
          {isOnline 
            ? 'Internet connection restored.' 
            : 'You are offline. Please check your internet connection.'}
        </span>
        
        {isOnline && (
           <button 
             onClick={() => setVisible(false)}
             style={{ 
               background: 'transparent', 
               border: 'none', 
               color: 'rgba(255,255,255,0.7)', 
               cursor: 'pointer', 
               display: 'flex', 
               alignItems: 'center',
               marginLeft: '8px',
               padding: '4px'
             }}
             onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
             onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
           >
             <X size={16} />
           </button>
        )}
      </div>
    </div>
  );
};

export default NetworkStatusBanner;
