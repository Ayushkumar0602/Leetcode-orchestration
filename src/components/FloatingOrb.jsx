import React, { useState } from 'react';
import OrbChat from './OrbChat';
import './FloatingOrb.css';

const FloatingOrb = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="floating-orb-container">
      <OrbChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <div className="floating-orb-float">
        <div className="floating-orb-hover-wrapper" onClick={() => setIsChatOpen(!isChatOpen)}>
          <div className="floating-orb"></div>
        </div>
      </div>
    </div>
  );
};

export default FloatingOrb;
