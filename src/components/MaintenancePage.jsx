import React, { useState, useEffect } from 'react';
import { Wrench, RefreshCw, Bell, Twitter, CheckCircle2 } from 'lucide-react';

const MaintenancePage = ({ message, estimatedEnd, progressPercent = 65 }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [email, setEmail] = useState('');
  const [notified, setNotified] = useState(false);
  const [dotAngle, setDotAngle] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (!estimatedEnd) return;
    const updateTimer = () => {
      const now = new Date();
      const diff = estimatedEnd - now;
      if (diff <= 0) {
        setTimeLeft('Finishing up...');
        return;
      }
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setTimeLeft(`${h}:${m}:${s}`);
    };
    updateTimer();
    const id = setInterval(updateTimer, 1000);
    return () => clearInterval(id);
  }, [estimatedEnd]);

  // Orbiting dots animation
  useEffect(() => {
    const id = setInterval(() => setDotAngle((a) => (a + 1.5) % 360), 16);
    return () => clearInterval(id);
  }, []);

  const handleNotify = (e) => {
    e.preventDefault();
    if (email.trim()) {
      // In production, save this to Firestore: collection('maintenanceNotifications')
      console.log('[Maintenance] Notify signup:', email);
      setNotified(true);
    }
  };

  const orbitDots = [0, 60, 120, 180, 240, 300];
  const ORBIT_RADIUS = 72;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999998,
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
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .maint-container { animation: fadeUp 0.6s ease-out both; }
        .maint-title { animation: fadeUp 0.6s 0.1s ease-out both; }
        .maint-desc { animation: fadeUp 0.6s 0.2s ease-out both; }
        .maint-progress { animation: fadeUp 0.6s 0.3s ease-out both; }
        .maint-notify { animation: fadeUp 0.6s 0.4s ease-out both; }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #6366f1, #3b82f6, #8b5cf6);
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
          border-radius: 99px;
          transition: width 1s ease;
        }
      `}</style>

      {/* Subtle grid background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(139, 92, 246, 0.06) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        pointerEvents: 'none',
      }} />

      {/* Glow blobs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '40%', height: '40%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '40%', height: '40%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="maint-container" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '560px', width: '100%', textAlign: 'center' }}>

        {/* Icon with orbiting dots */}
        <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '2.5rem' }}>
          {/* Pulse rings */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(139,92,246,0.3)', animation: 'pulseRing 2s ease-out infinite' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(139,92,246,0.2)', animation: 'pulseRing 2s 0.7s ease-out infinite' }} />

          {/* Center icon */}
          <div style={{
            position: 'absolute', inset: '20px',
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(139,92,246,0.2)',
          }}>
            <Wrench size={44} color="#a78bfa" strokeWidth={1.5} />
          </div>

          {/* Orbiting dots */}
          {orbitDots.map((baseDeg, i) => {
            const angle = ((baseDeg + dotAngle) * Math.PI) / 180;
            const cx = 80 + Math.cos(angle) * ORBIT_RADIUS;
            const cy = 80 + Math.sin(angle) * ORBIT_RADIUS;
            const opacity = 0.4 + (i / orbitDots.length) * 0.6;
            const size = i % 2 === 0 ? 7 : 5;
            return (
              <div key={i} style={{
                position: 'absolute',
                width: size, height: size,
                borderRadius: '50%',
                background: `rgba(139, 92, 246, ${opacity})`,
                left: cx - size / 2, top: cy - size / 2,
                boxShadow: `0 0 6px rgba(139,92,246,${opacity})`,
              }} />
            );
          })}
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(139,92,246,0.12)',
          border: '1px solid rgba(139,92,246,0.3)',
          padding: '0.35rem 1rem', borderRadius: '99px',
          fontSize: '0.8rem', fontWeight: 600,
          color: '#a78bfa', marginBottom: '1.5rem',
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', boxShadow: '0 0 6px #a78bfa' }} />
          Scheduled Maintenance
        </div>

        <h1 className="maint-title" style={{
          fontSize: 'clamp(2rem, 5vw, 2.8rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 60%, #818cf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          We're leveling up<br />Whizan AI
        </h1>

        <p className="maint-desc" style={{
          fontSize: '1.05rem', color: '#a3a3a3', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '420px',
        }}>
          {message || "Our team is making some improvements to bring you a better experience. We'll be back online shortly — sit tight!"}
        </p>

        {/* Progress bar */}
        <div className="maint-progress" style={{ width: '100%', marginBottom: estimatedEnd ? '0.75rem' : '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.85rem' }}>
            <span style={{ color: '#737373' }}>Upgrade progress</span>
            <span style={{ color: '#a78bfa', fontWeight: 700 }}>{progressPercent}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Countdown */}
        {estimatedEnd && timeLeft && (
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#737373', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Estimated time remaining</p>
            <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em', fontFamily: "'Courier New', monospace" }}>
              {timeLeft}
            </div>
          </div>
        )}

        {/* Notify form */}
        <div className="maint-notify" style={{ width: '100%', maxWidth: '380px', marginBottom: '2rem' }}>
          {!notified ? (
            <>
              <p style={{ fontSize: '0.9rem', color: '#737373', marginBottom: '0.75rem' }}>
                <Bell size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Get notified when we're back
              </p>
              <form onSubmit={handleNotify} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '0.75rem 1rem',
                    color: '#fff', fontSize: '0.95rem',
                    outline: 'none', fontFamily: "'Inter', sans-serif",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#7c3aed', border: 'none',
                    borderRadius: '10px', padding: '0.75rem 1.25rem',
                    color: '#fff', fontWeight: 600, cursor: 'pointer',
                    fontSize: '0.9rem', whiteSpace: 'nowrap',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#6d28d9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#7c3aed'}
                >
                  Notify Me
                </button>
              </form>
            </>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '12px', padding: '0.875rem 1.5rem',
              color: '#34d399', fontWeight: 600,
            }}>
              <CheckCircle2 size={20} />
              You're on the list! We'll email you when we're back.
            </div>
          )}
        </div>

        {/* Footer links */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#737373', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#737373'}
          >
            <Twitter size={15} /> @WhizanAI
          </a>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '99px', padding: '0.5rem 1.25rem',
              color: '#a3a3a3', cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.2s', fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#a3a3a3'; }}
          >
            <RefreshCw size={14} /> Reload
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
