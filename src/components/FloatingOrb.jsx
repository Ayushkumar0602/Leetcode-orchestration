import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import OrbChat from './OrbChat';
import './FloatingOrb.css';

const FloatingOrb = () => {
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Exclude ai interview and system design interview pages
  const excludedPaths = [
    '/aiinterview',
    '/aiinterviewselect',
    '/infoaiinterview',
    '/systemdesigninterview',
    '/aisystemdesigninterview'
  ];

  const shouldHide = excludedPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) return null;

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
