import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Terminal } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const [terminalText, setTerminalText] = useState('');
  const fullText = "System Error: Neural pathways offline. Sector 404 unmapped.";

  useEffect(() => {
    let i = 0;
    setTerminalText('');
    const interval = setInterval(() => {
      setTerminalText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050505',
      backgroundImage: 'radial-gradient(circle at top right, rgba(99,102,241,0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(236,72,153,0.1), transparent 40%)',
      color: '#fff',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>
        {`
          @keyframes textGlitch {
            0%, 100% { text-shadow: 0 0 0px rgba(236,72,153,0.8), 0 0 0px rgba(99,102,241,0.8); }
            15% { text-shadow: -4px 0 8px rgba(236,72,153,0.8), 4px 0 8px rgba(99,102,241,0.8); }
            16% { text-shadow: 3px 0 8px rgba(236,72,153,0.8), -3px 0 8px rgba(99,102,241,0.8); transform: skew(2deg); }
            17% { text-shadow: -3px 0 8px rgba(236,72,153,0.8), 3px 0 8px rgba(99,102,241,0.8); transform: skew(-2deg); }
            18%, 80% { text-shadow: 0 0 0px rgba(236,72,153,0.8), 0 0 0px rgba(99,102,241,0.8); transform: skew(0deg); }
            81% { text-shadow: -4px 0 8px rgba(236,72,153,0.8), 4px 0 8px rgba(99,102,241,0.8); transform: skew(1deg); }
            82% { text-shadow: 4px 0 8px rgba(236,72,153,0.8), -4px 0 8px rgba(99,102,241,0.8); transform: skew(-1deg); }
            83% { text-shadow: 0 0 0px rgba(236,72,153,0.8), 0 0 0px rgba(99,102,241,0.8); transform: skew(0deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-15px) scale(1.02); }
          }
          @keyframes rotateRing {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes rotateRingReverse {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }
        `}
      </style>

      {/* Background Decor Elements */}
      <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '500px', height: '500px',
          marginLeft: '-250px', marginTop: '-250px',
          borderRadius: '50%',
          border: '1px dashed rgba(99,102,241,0.2)',
          animation: 'rotateRing 40s linear infinite',
          zIndex: 0,
          pointerEvents: 'none'
      }}></div>
      
      <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '350px', height: '350px',
          marginLeft: '-175px', marginTop: '-175px',
          borderRadius: '50%',
          border: '2px dotted rgba(236,72,153,0.15)',
          animation: 'rotateRingReverse 25s linear infinite',
          zIndex: 0,
          pointerEvents: 'none'
      }}></div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        animation: 'float 6s ease-in-out infinite',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Core Glow */}
        <div style={{
          position: 'absolute',
          width: '150px', height: '150px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
          filter: 'blur(30px)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: -1
        }}></div>

        <h1 style={{
          fontSize: 'clamp(6rem, 15vw, 12rem)',
          fontWeight: 900,
          margin: 0,
          lineHeight: 1,
          fontFamily: "'Inter', sans-serif",
          color: '#fff',
          letterSpacing: '-4px',
          animation: 'textGlitch 4s infinite',
          position: 'relative',
        }}>
          4<span style={{ color: '#6366f1' }}>0</span>4
        </h1>
        
        <div style={{
          background: 'rgba(20,22,30,0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '2rem',
          marginTop: '2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '600px',
          width: '90%'
        }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            margin: '0 0 1.5rem',
            background: 'linear-gradient(135deg, #fff, #9ca3af)',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            Entity Not Found
          </h2>
          
          {/* Terminal Box */}
          <div style={{
            background: '#09090b',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '12px 16px',
            width: '100%',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'left'
          }}>
            <Terminal size={18} color="#6366f1" style={{ flexShrink: 0 }} />
            <div style={{ fontFamily: 'monospace', color: '#34d399', fontSize: '0.9rem', overflow: 'hidden' }}>
              <span style={{ color: '#9ca3af' }}>root@whizan:~#</span>{' '}
              <span style={{ color: '#e2e8f0' }}>{terminalText}</span>
              <span style={{ display: 'inline-block', width: '8px', height: '14px', background: '#34d399', marginLeft: '4px', verticalAlign: 'middle', animation: 'blink 1s infinite' }}></span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            width: '100%'
          }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                flex: '1 1 140px',
                padding: '14px 24px',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <ArrowLeft size={18} />
              Return
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                flex: '1 1 140px',
                padding: '14px 24px',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #4f46e5, #ec4899)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(79, 70, 229, 0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.3)'; }}
            >
              <Home size={18} />
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
