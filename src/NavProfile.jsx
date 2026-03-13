import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Award, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchProfile, queryKeys } from './lib/api';

export default function NavProfile() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const { data: profile } = useQuery({
        queryKey: queryKeys.profile(currentUser?.uid),
        queryFn: () => fetchProfile(currentUser.uid),
        enabled: !!currentUser,
        staleTime: 1000 * 60 * 5, // 5 min — profile data is slow-changing
    });

    if (!currentUser) {
        return (
            <button 
                onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`)} 
                style={{ 
                    background: 'var(--accent, #6366f1)', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '6px 14px', 
                    borderRadius: '8px', 
                    fontSize: '0.85rem', 
                    fontWeight: 600, 
                    cursor: 'pointer', 
                    transition: 'opacity 0.2s' 
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
                Sign In
            </button>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Public Portfolio Link */}
            <button
                onClick={() => navigate(`/public/${currentUser.uid}`)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(59,130,246,0.1)',
                    color: '#60a5fa',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid rgba(59,130,246,0.2)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    marginRight: '4px'
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(59,130,246,0.2)';
                    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(59,130,246,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
                title="View your public portfolio"
            >
                <ExternalLink size={14} />
                <span className="nav-profile-label">Public Portfolio</span>
            </button>

            {/* User Badge → click to go to profile */}
            <div
                onClick={() => navigate('/profile')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(255,255,255,0.05)', padding: '5px 14px 5px 5px',
                    borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                title="View Profile"
            >
                {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="User" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Award size={14} color="#a855f7" />
                    </div>
                )}
                <span className="nav-profile-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e8e8e8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {currentUser.displayName?.split(' ')[0] || 'Dev'}
                    {profile?.plan === 'Blaze' ?
                        <span style={{ fontSize: '0.65rem', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', color: '#fff', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>PRO</span> :
                        <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>FREE</span>
                    }
                </span>
            </div>
            
            <style>{`
                @media (max-width: 480px) {
                    .nav-profile-label { display: none !important; }
                }
            `}</style>
        </div>
    );
}
