import React, { useState, useEffect, useCallback } from 'react';
import { ServerCrash, RefreshCw, AlertTriangle, MessageCircle, ChevronRight } from 'lucide-react';

/**
 * ServerErrorPage
 * Renders a full-screen 503/500 error page.
 * Props:
 *   statusCode  — 503 | 500 | number  (default 503)
 *   onRetry     — optional callback when the user clicks Retry (defaults to window.location.reload)
 */
const ServerErrorPage = ({ statusCode = 503, onRetry }) => {
  const [countdown, setCountdown] = useState(15);
  const [retrying, setRetrying] = useState(false);
  const [glitching, setGlitching] = useState(false);

  const is503 = statusCode === 503;

  const handleRetry = useCallback(() => {
    setRetrying(true);
    setTimeout(() => {
      if (onRetry) onRetry();
      else window.location.reload();
    }, 600);
  }, [onRetry]);

  // Auto-retry countdown for 503
  useEffect(() => {
    if (!is503) return;
    if (countdown <= 0) {
      handleRetry();
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, is503, handleRetry]);

  // Glitch effect loop
  useEffect(() => {
    const trigger = () => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 400);
    };
    trigger();
    const id = setInterval(trigger, 3500);
    return () => clearInterval(id);
  }, []);

  const statusLabels = {
    503: { title: 'Service Unavailable', sub: "Our servers are temporarily overloaded or under maintenance. Hang tight — we're on it." },
    500: { title: 'Internal Server Error', sub: "Something broke on our end. Our engineers have been notified and are working on a fix." },
  };
  const { title, sub } = statusLabels[statusCode] || { title: 'Server Error', sub: "Something went wrong on our end." };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999997,
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glitchClip1 {
          0%, 100% { clip-path: inset(40% 0 61% 0); transform: translate(-4px, 0); }
          20% { clip-path: inset(92% 0 1% 0); transform: translate(4px, 0); }
          60% { clip-path: inset(10% 0 80% 0); transform: translate(-4px, 0); }
        }
        @keyframes glitchClip2 {
          0%, 100% { clip-path: inset(60% 0 30% 0); transform: translate(4px, 0); }
          30% { clip-path: inset(2% 0 96% 0); transform: translate(-4px, 0); }
          70% { clip-path: inset(70% 0 10% 0); transform: translate(4px, 0); }
        }
        @keyframes scanline {
          0% { top: -5%; }
          100% { top: 105%; }
        }
        @keyframes pulse503 {
          0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.15); }
          50% { box-shadow: 0 0 40px rgba(239,68,68,0.3); }
        }
        .server-error-anim { animation: fadeUp 0.5s ease-out both; }
        .glitch-el { position: relative; }
        .glitch-el::before, .glitch-el::after {
          content: attr(data-text);
          position: absolute; inset: 0;
          color: #f87171;
        }
        .glitch-el.active::before { animation: glitchClip1 0.4s steps(2, end) both; }
        .glitch-el.active::after { animation: glitchClip2 0.4s steps(2, end) both; color: #818cf8; }
      `}</style>

      {/* Grid background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'radial-gradient(rgba(239,68,68,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />
      
      {/* Scanline effect */}
      <div style={{
        position: 'fixed', left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.3), transparent)',
        animation: 'scanline 4s linear infinite', zIndex: 0, pointerEvents: 'none',
      }} />

      {/* Glow */}
      <div style={{ position: 'fixed', top: '-5%', right: '-5%', width: '35%', height: '35%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="server-error-anim" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '560px', width: '100%', textAlign: 'center' }}>

        {/* Error code — glitch effect */}
        <div
          className={`glitch-el ${glitching ? 'active' : ''}`}
          data-text={String(statusCode)}
          style={{
            fontSize: 'clamp(7rem, 20vw, 10rem)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            marginBottom: '0.25rem',
            color: 'rgba(255,255,255,0.04)',
            WebkitTextStroke: '2px rgba(239,68,68,0.5)',
            userSelect: 'none',
          }}
        >
          {statusCode}
        </div>

        {/* Icon */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '50%',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          animation: 'pulse503 2.5s ease-in-out infinite',
        }}>
          <ServerCrash size={42} color="#f87171" strokeWidth={1.5} />
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
          padding: '0.3rem 1rem', borderRadius: '99px',
          fontSize: '0.78rem', fontWeight: 700,
          color: '#f87171', marginBottom: '1.25rem',
          letterSpacing: '0.07em', textTransform: 'uppercase',
        }}>
          <AlertTriangle size={13} /> Error {statusCode}
        </div>

        <h1 style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          fontWeight: 800, letterSpacing: '-0.02em',
          marginBottom: '0.9rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #fca5a5 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {title}
        </h1>

        <p style={{ fontSize: '1.05rem', color: '#a3a3a3', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '420px' }}>
          {sub}
        </p>

        {/* Auto-retry indicator for 503 */}
        {is503 && (
          <div style={{
            width: '100%', maxWidth: '380px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
              <span style={{ color: '#737373' }}>Auto-retrying in</span>
              <span style={{ color: '#f87171', fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>{countdown}s</span>
            </div>
            {/* Progress countdown bar */}
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(countdown / 15) * 100}%`,
                background: 'linear-gradient(90deg, #ef4444, #f87171)',
                borderRadius: '99px',
                transition: 'width 1s linear',
              }} />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
          <button
            onClick={handleRetry}
            disabled={retrying}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              background: retrying ? 'rgba(239,68,68,0.5)' : '#ef4444',
              border: 'none', borderRadius: '99px',
              padding: '0.875rem 2rem',
              color: '#fff', fontWeight: 700, fontSize: '1rem',
              cursor: retrying ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0 4px 20px rgba(239,68,68,0.25)',
            }}
            onMouseEnter={(e) => !retrying && (e.currentTarget.style.background = '#dc2626')}
            onMouseLeave={(e) => !retrying && (e.currentTarget.style.background = '#ef4444')}
          >
            <RefreshCw size={17} style={{ animation: retrying ? 'spin 0.8s linear infinite' : 'none' }} />
            {retrying ? 'Retrying...' : 'Retry Now'}
          </button>

          <a
            href="mailto:support@whizan.xyz"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '99px', padding: '0.875rem 2rem',
              color: '#a3a3a3', fontWeight: 600, fontSize: '1rem',
              cursor: 'pointer', textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#a3a3a3'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            <MessageCircle size={17} /> Contact Support
          </a>
        </div>

        {/* Help links */}
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.88rem' }}>
          {[
            { label: 'System Status', href: '#' },
            { label: 'Help Center', href: '#' },
            { label: 'Home', href: '/' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{ color: '#525252', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#a3a3a3'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#525252'}
            >
              {link.label} <ChevronRight size={13} />
            </a>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ServerErrorPage;
