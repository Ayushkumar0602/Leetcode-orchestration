import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadProfilePicture, deleteProfilePicture } from './lib/s3';
import ProfilePictureEditor from './components/ProfilePictureEditor';
import { useAuth } from './contexts/AuthContext';
import {
    ArrowLeft, User, Mail, Calendar, Shield, Star, Zap, Target,
    Code2, Brain, TrendingUp, Award, CheckCircle, Flame,
    Trophy, ChevronRight, BarChart3, Clock, FileText,
    LayoutDashboard, Briefcase, Palette, Lock, Database, Edit3, LogOut, ExternalLink, Menu, X, Camera, Trash2
} from 'lucide-react';
import PortfolioTab from './profile/PortfolioTab';
import CustomizationTab from './profile/CustomizationTab';
import SecurityTab from './profile/SecurityTab';
import DataTab from './profile/DataTab';
import UpgradeModal from './components/UpgradeModal';
import NavProfile from './NavProfile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchStats, fetchInterviews, fetchProfile, queryKeys } from './lib/api';
import { useSEO } from './hooks/useSEO';

// ── Styles ──────────────────────────────────────────────────────
const S = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes scaleIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
@keyframes pulseGlow { 0%,100%{box-shadow:0 0 20px rgba(168,85,247,0.3);}50%{box-shadow:0 0 40px rgba(168,85,247,0.6);} }
@keyframes badgePop { 0%{transform:scale(0.8);opacity:0;}60%{transform:scale(1.1);}100%{transform:scale(1);opacity:1;} }
@keyframes spin { to { transform: rotate(360deg); } }
.profile-body { font-family: 'Inter', system-ui, sans-serif; }
.glass-card { background:rgba(20,22,30,0.65); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:1.5rem; box-shadow:0 8px 40px rgba(0,0,0,0.25); }
.p-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
.p-badges-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
.p-two-col { display:grid; grid-template-columns:320px 1fr; gap:1.5rem; }
.badge-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:1.1rem 0.9rem; display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center; transition:all 0.3s cubic-bezier(0.16,1,0.3,1); animation:badgePop 0.4s ease-out both; }
.badge-card:hover { transform:translateY(-4px); border-color:rgba(255,255,255,0.15); }
.stat-mini { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:1.1rem 1rem; display:flex; flex-direction:column; gap:6px; }
.interview-row { display:flex; align-items:center; justify-content:space-between; padding:0.9rem 1rem; border-radius:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); cursor:pointer; transition:all 0.2s; gap:12px; }
.interview-row:hover { background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.12); transform:translateX(4px); }
.settings-row { display:flex; align-items:center; justify-content:space-between; padding:0.85rem 1rem; border-radius:10px; transition:background 0.15s; cursor:pointer; }
.settings-row:hover { background:rgba(255,255,255,0.04); }
.tab-btn { display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; border:none; cursor:pointer; font-size:0.82rem; font-weight:600; transition:all 0.2s; white-space:nowrap; }
@media(max-width:1100px){.p-two-col{grid-template-columns:1fr;} .p-stats-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:768px){
    .p-stats-grid{grid-template-columns:1fr !important; gap:0.75rem;}
    .p-badges-grid{grid-template-columns:repeat(2,1fr); gap:0.75rem;}
    .p-two-col{gap:1rem;}
    .glass-card{padding:1.25rem;}
}
@media(max-width:640px){
    .p-stats-grid{grid-template-columns:1fr !important;} 
    .p-badges-grid{grid-template-columns:repeat(2,1fr);}
}

.mobile-nav-toggle {
    display: none;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
}

@media (max-width: 768px) {
    .mobile-nav-toggle { display: flex; }
    .desktop-nav-profile { display: none !important; }
}

.mobile-nav-overlay {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(5,5,5,0.98);
    backdrop-filter: blur(20px);
    z-index: 1000;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.mobile-nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    color: #fff;
    text-decoration: none;
    font-size: 1rem;
    font-weight: 600;
}
`;

// ── Sub-components ────────────────────────────────────────────────
function CircleProgress({ value, max, color, size = 72, sw = 6, label }) {
    const r = (size - sw * 2) / 2; const c = 2 * Math.PI * r; const p = max > 0 ? value / max : 0;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={`${p * c} ${c}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{value}</span></div>
            </div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{label}</div><div style={{ fontSize: '0.65rem', color: 'var(--txt3)' }}>/ {max}</div></div>
        </div>
    );
}

function Badge({ icon: Icon, label, desc, color, delay = 0, unlocked = true }) {
    return (
        <div className="badge-card" style={{ animationDelay: `${delay}s`, opacity: unlocked ? 1 : 0.4, filter: unlocked ? 'none' : 'grayscale(0.6)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: unlocked ? `radial-gradient(circle,${color}30,${color}08)` : 'rgba(255,255,255,0.04)', border: `1px solid ${unlocked ? color + '40' : 'rgba(255,255,255,0.07)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: unlocked ? `0 0 16px ${color}30` : 'none' }}>
                <Icon size={20} color={unlocked ? color : 'rgba(255,255,255,0.25)'} />
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: unlocked ? '#fff' : 'rgba(255,255,255,0.35)', lineHeight: 1.2 }}>{label}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--txt3)' }}>{desc}</div>
        </div>
    );
}

// ── OVERVIEW TAB ──────────────────────────────────────────────────
function OverviewTab({ userStats, totalCounts, validInterviews, avgScore, interviews, badges, loading, navigate, profile, openUpgrade }) {
    function formatDate(ts) { if (!ts) return '—'; const d = ts?.toDate ? ts.toDate() : new Date(ts); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

    const isBlaze = profile.plan === 'Blaze';
    const expiresDate = profile.planExpiresAt ? new Date(profile.planExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Plan row */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', flexWrap: 'wrap', gap: '1rem', animation: 'fadeUp 0.3s ease-out both' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: isBlaze ? 'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(59,130,246,0.1))' : 'rgba(255,255,255,0.05)', border: `1px solid ${isBlaze ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isBlaze ? <Zap size={24} color="#a855f7" /> : <Star size={24} color="#94a3b8" />}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--txt3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Current Plan</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{isBlaze ? 'Blaze' : 'Spark'}</span>
                            {isBlaze ?
                                <span style={{ fontSize: '0.6rem', background: '#10b98120', color: '#10b981', border: '1px solid #10b98140', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>PREMIUM</span> :
                                <span style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.1)', color: 'var(--txt2)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>FREE</span>
                            }
                        </div>
                        {isBlaze && expiresDate && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--txt3)', marginTop: '2px' }}>
                                Renews / Expires: <strong style={{ color: '#fff' }}>{expiresDate}</strong>
                            </div>
                        )}
                    </div>
                </div>
                {!isBlaze && (
                    <button onClick={openUpgrade} style={{ width: window.innerWidth <= 480 ? '100%' : 'auto', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', border: 'none', borderRadius: '10px', padding: '10px 20px', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(168,85,247,0.3)', transition: 'transform 0.2s' }}>
                        <Zap size={14} /> Upgrade to Blaze
                    </button>
                )}
            </div>

            {/* Stats row */}
            <div className="p-stats-grid" style={{ animation: 'fadeUp 0.4s ease-out both' }}>
                {[
                    { label: 'Problems Solved', value: loading ? '–' : (userStats?.Total || 0), icon: Code2, color: '#a855f7', sub: `of ${totalCounts?.Total || 0}` },
                    { label: 'Interviews Done', value: loading ? '–' : validInterviews.length, icon: Brain, color: '#3b82f6', sub: 'mock sessions' },
                    { label: 'Avg. Score', value: loading ? '–' : (avgScore ? `${avgScore}%` : 'N/A'), icon: TrendingUp, color: avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#f59e0b' : '#ef4444', sub: 'interview avg' },
                    { label: 'Badges Earned', value: badges.filter(b => b.unlocked).length, icon: Award, color: '#eab308', sub: `of ${badges.length}` },
                ].map((s, i) => (
                    <div key={s.label} className="stat-mini" style={{ animationDelay: `${i * 0.05}s`, animation: 'fadeUp 0.4s ease-out both' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--txt2)', fontWeight: 600 }}>{s.label}</span>
                            <div style={{ width: 30, height: 30, borderRadius: '8px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><s.icon size={15} color={s.color} /></div>
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>{s.value}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--txt3)' }}>{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Two-col: difficulty + interview list */}
            <div className="p-two-col">
                <div className="glass-card" style={{ animation: 'fadeUp 0.4s ease-out 0.1s both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}><BarChart3 size={18} color="#a855f7" /><span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Difficulty Breakdown</span></div>
                    {loading ? <div style={{ textAlign: 'center', color: 'var(--txt3)', padding: '1.5rem 0', fontSize: '0.85rem' }}>Loading…</div> : (
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', padding: '0.5rem 0 1rem', gap: '10px', flexWrap: 'wrap' }}>
                            <CircleProgress value={userStats?.Easy || 0} max={totalCounts?.Easy || 1} color="#00b8a3" label="Easy" size={window.innerWidth <= 480 ? 60 : 72} />
                            <CircleProgress value={userStats?.Medium || 0} max={totalCounts?.Medium || 1} color="#ffa116" label="Medium" size={window.innerWidth <= 480 ? 76 : 88} sw={window.innerWidth <= 480 ? 6 : 7} />
                            <CircleProgress value={userStats?.Hard || 0} max={totalCounts?.Hard || 1} color="#ef4743" label="Hard" size={window.innerWidth <= 480 ? 60 : 72} />
                        </div>
                    )}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                        {[{ label: 'Easy', color: '#00b8a3', count: userStats?.Easy || 0, total: totalCounts?.Easy || 1 }, { label: 'Medium', color: '#ffa116', count: userStats?.Medium || 0, total: totalCounts?.Medium || 1 }, { label: 'Hard', color: '#ef4743', count: userStats?.Hard || 0, total: totalCounts?.Hard || 1 }].map(d => (
                            <div key={d.label} style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '5px' }}><span style={{ color: d.color, fontWeight: 600 }}>{d.label}</span><span style={{ color: 'var(--txt2)' }}><strong>{d.count}</strong> <span style={{ color: 'var(--txt3)' }}>/ {d.total}</span></span></div>
                                <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}><div style={{ width: `${(d.count / d.total) * 100}%`, height: '100%', background: d.color, borderRadius: '999px', transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)' }} /></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card" style={{ animation: 'fadeUp 0.4s ease-out 0.15s both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} color="#3b82f6" /><span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Interview History</span></div>
                        <button onClick={() => navigate('/infoaiinterview')} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '5px 12px', color: '#3b82f6', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>View All <ChevronRight size={12} /></button>
                    </div>
                    {loading ? <div style={{ textAlign: 'center', color: 'var(--txt3)', padding: '2rem', fontSize: '0.85rem' }}>Loading…</div>
                        : interviews.length === 0 ? <div style={{ textAlign: 'center', color: 'var(--txt3)', padding: '2.5rem', fontSize: '0.85rem' }}>No interviews yet. <button onClick={() => navigate('/aiinterview')} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Start one!</button></div>
                            : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                                    {interviews.map((inv, i) => {
                                        const hire = inv.scoreReport?.hire || ''; const hC = hire.includes('Strong Hire') ? '#10b981' : hire.includes('No Hire') ? '#ef4444' : '#f59e0b'; const sc = inv.overallScore; const sC = sc >= 80 ? '#10b981' : sc >= 60 ? '#f59e0b' : '#ef4444'; return (
                                            <div key={inv.id || i} className="interview-row" onClick={() => navigate(`/aiinterview/${inv.id}`)}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.problemTitle || 'Mock Interview'}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.73rem', color: 'var(--txt3)' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Calendar size={11} />{formatDate(inv.createdAt)}</span>
                                                        {inv.durationMinutes && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={11} />{inv.durationMinutes}m</span>}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                                    {hire && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: hC, background: `${hC}15`, border: `1px solid ${hC}30`, borderRadius: '6px', padding: '2px 7px' }}>{hire}</span>}
                                                    {sc != null && <span style={{ fontSize: '0.78rem', fontWeight: 700, color: sC }}>{sc}/100</span>}
                                                    <ChevronRight size={14} color="var(--txt3)" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                </div>
            </div>

            {/* Badges */}
            <div className="glass-card" style={{ animation: 'fadeUp 0.4s ease-out 0.2s both' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                    <Trophy size={18} color="#eab308" /><span style={{ fontWeight: 700, fontSize: '1rem' }}>Achievements</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--txt3)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '999px' }}>{badges.filter(b => b.unlocked).length}/{badges.length} unlocked</span>
                </div>
                <div className="p-badges-grid">
                    {badges.map((b, i) => <Badge key={b.label} {...b} delay={0.05 * i} />)}
                </div>
            </div>
        </div>
    );
}

// ── MAIN ProfilePage ────────────────────────────────────────────────────
const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'customization', label: 'Customize', icon: Palette },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'data', label: 'Data', icon: Database },
];

export default function ProfilePage() {
    const { currentUser, logout, updateUserProfile } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isUploading, setIsUploading] = useState(false);
    const [editorFile, setEditorFile] = useState(null);
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser) return;
        setEditorFile(file); // Show the modal instead of uploading right away
        setShowAvatarMenu(false);
    };

    const handleSaveCroppedImage = async (blob) => {
        setIsUploading(true);
        setEditorFile(null); // Close modal
        try {
            // Need to convert blob to File object for upload logic
            const croppedFile = new File([blob], "profile_edited.jpg", { type: "image/jpeg" });
            const newPhotoUrl = await uploadProfilePicture(croppedFile, currentUser.uid);
            await updateUserProfile({ photoURL: newPhotoUrl });
            setProfile(p => ({ ...p, photoURL: newPhotoUrl }));

            // Auto-sync the exact same logic currently found in useEffect
            await fetch(`https://leetcode-orchestration.onrender.com/api/profile/${currentUser.uid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName: currentUser.displayName, email: currentUser.email, photoURL: newPhotoUrl })
            }).catch(console.error);
        } catch (error) {
            console.error("Failed to upload image:", error);
            alert("Failed to upload image.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeletePicture = async () => {
        if (!window.confirm("Are you sure you want to remove your profile picture?")) return;

        setIsUploading(true);
        setShowAvatarMenu(false);
        try {
            if (currentUser.photoURL) {
                await deleteProfilePicture(currentUser.photoURL);
            }
            await updateUserProfile({ photoURL: "" });

            await fetch(`https://leetcode-orchestration.onrender.com/api/profile/${currentUser.uid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName: currentUser.displayName, email: currentUser.email, photoURL: "" })
            });

            queryClient.invalidateQueries({ queryKey: queryKeys.profile(currentUser.uid) });

        } catch (error) {
            console.error("Failed to delete image:", error);
            alert("Failed to remove image.");
        } finally {
            setIsUploading(false);
        }
    };

    const uid = currentUser?.uid;

    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: queryKeys.stats(uid),
        queryFn: () => fetchStats(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 5,
    });

    const { data: interviewsData, isLoading: invLoading } = useQuery({
        queryKey: queryKeys.interviews(uid),
        queryFn: () => fetchInterviews(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 3,
    });

    const { data: profileQueryData, isLoading: profLoading } = useQuery({
        queryKey: queryKeys.profile(uid),
        queryFn: () => fetchProfile(uid),
        enabled: !!uid,
        staleTime: 1000 * 60 * 5,
    });

    const loading = statsLoading || invLoading || profLoading;

    const userStats = statsData?.userStats ?? null;
    const totalCounts = statsData?.totalCounts ?? null;
    const allInterviews = interviewsData || [];
    const interviews = allInterviews.slice(0, 8);
    const profile = profileQueryData || {};

    const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const queryClient = useQueryClient();

    // Auto-sync Auth data to Firestore Profile doc so PublicProfile has access to it
    useEffect(() => {
        if (!currentUser || !profileQueryData) return;
        if (currentUser.displayName && (profile.displayName !== currentUser.displayName || profile.photoURL !== currentUser.photoURL || profile.email !== currentUser.email)) {
            fetch(`https://leetcode-orchestration.onrender.com/api/profile/${currentUser.uid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName: currentUser.displayName, email: currentUser.email, photoURL: currentUser.photoURL })
            }).catch(console.error);
        }
    }, [currentUser, profileQueryData]);

    const saveProfile = async (data) => {
        if (!currentUser) return;
        try {
            await fetch(`https://leetcode-orchestration.onrender.com/api/profile/${currentUser.uid}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            queryClient.invalidateQueries({ queryKey: queryKeys.profile(currentUser.uid) });
        } catch (e) { console.error(e); }
    };

    const joinDate = currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';
    const validInterviews = allInterviews.filter(i => i.overallScore || i.scoreReport);
    const scored = validInterviews.filter(i => i.overallScore > 0);
    const avgScore = scored.length ? Math.round(scored.reduce((s, i) => s + i.overallScore, 0) / scored.length) : 0;

    const badges = [
        { icon: Code2, label: 'First Solve', desc: 'Solved your first problem', color: '#00b8a3', unlocked: (userStats?.Total || 0) >= 1 },
        { icon: Flame, label: '10 Day Streak', desc: '10 days in a row', color: '#f97316', unlocked: false },
        { icon: Brain, label: 'AI Interviewee', desc: 'Completed a mock interview', color: '#a855f7', unlocked: validInterviews.length >= 1 },
        { icon: Trophy, label: 'High Achiever', desc: 'Scored above 80%', color: '#eab308', unlocked: avgScore >= 80 },
        { icon: Star, label: 'Top 50', desc: 'Solved 50+ problems', color: '#3b82f6', unlocked: (userStats?.Total || 0) >= 50 },
        { icon: Zap, label: 'Speed Runner', desc: '5 problems in one day', color: '#06b6d4', unlocked: false },
    ];

    const handleLogout = async () => { try { await logout(); navigate('/'); } catch (e) { console.error(e); } };

    useSEO({
        title: 'My Profile & Portfolio – Whizan AI',
        description: 'Manage your developer profile, track your coding progress, and build your public portfolio on Whizan AI.',
        canonical: '/profile',
    });

    return (
        <div className="profile-body" style={{ minHeight: '100vh', background: '#050505', backgroundImage: 'radial-gradient(circle at 20% 0%, rgba(168,85,247,0.1) 0%, transparent 60%), radial-gradient(circle at 80% 100%, rgba(59,130,246,0.07) 0%, transparent 50%)', color: '#fff' }}>
            <style>{S}</style>

            {/* Nav */}
            <nav style={{ height: '64px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100, boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            padding: '7px 14px',
                            display: window.innerWidth > 768 ? 'flex' : 'none',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--txt2)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        <ArrowLeft size={15} /> Dashboard
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <img src="/logo.jpeg" alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
                        <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.4px', display: window.innerWidth > 480 ? 'inline' : 'none' }}>Whizan AI</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="desktop-nav-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <NavProfile />
                        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '6px 14px', color: '#ef4444', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>
                    <button className="mobile-nav-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            {isMobileMenuOpen && (
                <div className="mobile-nav-overlay">
                    <button className="mobile-nav-link" onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}>
                        <LayoutDashboard size={18} /> Dashboard
                    </button>
                    <button className="mobile-nav-link" onClick={() => { navigate(`/public/${currentUser?.uid}`); setIsMobileMenuOpen(false); }}>
                        <ExternalLink size={18} /> Public Profile
                    </button>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: 'auto' }}>
                        <button className="mobile-nav-link" onClick={handleLogout} style={{ color: '#ef4444', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                </div>
            )}

            {editorFile && (
                <ProfilePictureEditor
                    file={editorFile}
                    onCancel={() => setEditorFile(null)}
                    onSave={handleSaveCroppedImage}
                    isSaving={isUploading}
                />
            )}

            {/* Hero Banner */}
            <div style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.18) 0%,rgba(59,130,246,0.12) 50%,rgba(16,185,129,0.08) 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '2.5rem 2rem 2rem' }}>
                <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', justifyContent: window.innerWidth <= 640 ? 'center' : 'flex-start', textAlign: window.innerWidth <= 640 ? 'center' : 'left' }}>
                    <div style={{ position: 'relative', flexShrink: 0, animation: 'scaleIn 0.5s ease-out' }} onMouseLeave={() => setShowAvatarMenu(false)}>
                        <div
                            style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', padding: '3px', animation: 'pulseGlow 3s ease-in-out infinite', cursor: 'pointer', position: 'relative' }}
                            onClick={() => {
                                if (currentUser?.photoURL) setShowAvatarMenu(!showAvatarMenu);
                                else fileInputRef.current?.click();
                            }}
                            title={currentUser?.photoURL ? "Manage Profile Picture" : "Upload Profile Picture"}
                            onMouseEnter={() => { if (currentUser?.photoURL) setShowAvatarMenu(true); }}
                        >
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isUploading ? 0.5 : 1 }} /> : <User size={40} color="rgba(168,85,247,0.6)" style={{ opacity: isUploading ? 0.5 : 1 }} />}
                                {isUploading && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}><div style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                        {showAvatarMenu && currentUser?.photoURL && !isUploading && (
                            <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', zIndex: 50, paddingTop: '10px' }}>
                                <div style={{
                                    background: '#121212', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', minWidth: '140px'
                                }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', borderRadius: '8px', textAlign: 'left', width: '100%' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Camera size={14} /> Change Picture
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeletePicture(); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', borderRadius: '8px', textAlign: 'left', width: '100%' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Trash2 size={14} /> Remove Picture
                                    </button>
                                </div>
                            </div>
                        )}
                        <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#10b981', border: '2px solid #050505', pointerEvents: 'none' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px', animation: 'fadeUp 0.5s ease-out 0.1s both', display: 'flex', flexDirection: 'column', alignItems: window.innerWidth <= 640 ? 'center' : 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px', justifyContent: window.innerWidth <= 640 ? 'center' : 'flex-start' }}>
                            <h1 style={{ fontSize: window.innerWidth <= 480 ? '1.5rem' : '1.9rem', fontWeight: 900, margin: 0, letterSpacing: '-0.04em' }}>{currentUser?.displayName || 'Developer'}</h1>
                            <div style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)', borderRadius: '8px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>PRO</div>
                            <button onClick={() => navigate(`/public/${currentUser?.uid}`)} style={{
                                display: window.innerWidth <= 768 ? 'none' : 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '8px', padding: '5px 12px', color: '#fff', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                                <ExternalLink size={13} /> View Public Profile
                            </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', justifyContent: window.innerWidth <= 640 ? 'center' : 'flex-start' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} />{currentUser?.email}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} />Joined {joinDate}</span>
                            <span style={{ display: window.innerWidth <= 480 ? 'none' : 'flex', alignItems: 'center', gap: '4px' }}><Shield size={12} />Verified Account</span>
                            {profile.github && <a href={`https://${profile.github}`} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: '0.78rem' }}>{profile.github}</a>}
                        </div>
                    </div>
                    {profile.bio && <p style={{ flex: '100%', fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', margin: '0', maxWidth: '600px', fontStyle: 'italic', textAlign: window.innerWidth <= 640 ? 'center' : 'left' }}>"{profile.bio}"</p>}
                </div>

                {/* Tab navigation */}
                <div style={{ maxWidth: '1300px', margin: '1.5rem auto 0', display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                    {TABS.map(t => (
                        <button key={t.id} className="tab-btn" onClick={() => setActiveTab(t.id)} style={{ background: activeTab === t.id ? 'rgba(255,255,255,0.12)' : 'transparent', color: activeTab === t.id ? '#fff' : 'rgba(255,255,255,0.5)', border: activeTab === t.id ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent', boxShadow: activeTab === t.id ? '0 2px 12px rgba(0,0,0,0.3)' : 'none' }}>
                            <t.icon size={14} />{t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            <div style={{ maxWidth: '1300px', margin: '0 auto', padding: window.innerWidth <= 768 ? '1.5rem 1rem' : '2rem 1.5rem' }}>
                {activeTab === 'overview' && <OverviewTab userStats={userStats} totalCounts={totalCounts} validInterviews={validInterviews} avgScore={avgScore} interviews={interviews} badges={badges} loading={loading} navigate={navigate} profile={profile} openUpgrade={() => setUpgradeModalOpen(true)} />}
                {activeTab === 'portfolio' && <PortfolioTab uid={currentUser?.uid} profile={profile} onSave={saveProfile} />}
                {activeTab === 'customization' && <CustomizationTab preferences={profile.preferences} onSave={saveProfile} />}
                {activeTab === 'security' && <SecurityTab currentUser={currentUser} />}
                {activeTab === 'data' && <DataTab currentUser={currentUser} userStats={userStats} interviews={allInterviews} />}
            </div>

            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setUpgradeModalOpen(false)}
                user={currentUser}
                onUpgradeSuccess={() => setProfile(p => ({ ...p, plan: 'Blaze', planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }))}
            />
        </div>
    );
}