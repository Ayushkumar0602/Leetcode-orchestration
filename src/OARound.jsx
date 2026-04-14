import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import NavProfile from './NavProfile';
import { Clock, Send, AlertTriangle, Loader2 } from 'lucide-react';
import { fetchProblems } from './lib/api';
import Dashboard from './Dashboard';
import OAScorecard from './components/OAScorecard';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function OARound() {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // The target company. If unavailable in state, fallback to a general tech company or Apple.
    const company = location.state?.company || 'Apple';

    const [loading, setLoading] = useState(true);
    const [problems, setProblems] = useState([]);
    const [activeTab, setActiveTab] = useState(0); // 0 for Q1, 1 for Q2

    // Score Tracking
    const [q1Score, setQ1Score] = useState({ passed: 0, total: 1 });
    const [q2Score, setQ2Score] = useState({ passed: 0, total: 1 });
    const [isFinished, setIsFinished] = useState(false);

    // Timer (60 minutes = 3600 seconds)
    const [timeLeft, setTimeLeft] = useState(3600);
    const timerIntervalRef = useRef(null);

    const [aiReport, setAiReport] = useState(null);
    const [aiTotalScore, setAiTotalScore] = useState(null);
    const [aiRecommendation, setAiRecommendation] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            navigate(`/login?redirect=/oaround`);
            return;
        }

        const initializeOA = async () => {
            setLoading(true);
            try {
                // 1. Check if session already exists
                const sessionRef = doc(db, 'oa_sessions', roomId);
                const sessionSnap = await getDoc(sessionRef);

                if (sessionSnap.exists()) {
                    const data = sessionSnap.data();
                    // Must belong to the current user
                    if (data.userId !== currentUser.uid) {
                        alert("Unauthorized access to assessment.");
                        navigate('/oaround');
                        return;
                    }
                    setProblems(data.problems || []);
                    setQ1Score(data.q1Score || { passed: 0, total: 1 });
                    setQ2Score(data.q2Score || { passed: 0, total: 1 });
                    setTimeLeft(data.timeLeft ?? 3600);
                    setIsFinished(data.isFinished || false);
                    setAiReport(data.aiReport || null);
                    setAiTotalScore(data.aiTotalScore ?? null);
                    setAiRecommendation(data.aiRecommendation || null);
                    // Update company state strictly based on saved session
                    if (location.state?.company !== data.company) {
                        navigate(location.pathname, { replace: true, state: { company: data.company } });
                    }
                } else {
                    // 2. New Session - Fetch problems
                    const res = await fetchProblems({ companies: [company], page: 1 });
                    let p = res.problems || [];
                    p = p.filter(prob => prob.difficulty === 'Medium' || prob.difficulty === 'Hard');
                    p = p.sort(() => 0.5 - Math.random());

                    if (p.length < 2) {
                        const fallbackRes = await fetchProblems({ companies: [], page: Math.floor(Math.random() * 5) + 1 });
                        let fallbackP = (fallbackRes.problems || []).filter(prob => prob.difficulty === 'Medium' || prob.difficulty === 'Hard');
                        fallbackP = fallbackP.sort(() => 0.5 - Math.random());
                        p = [...p, ...fallbackP].slice(0, 2);
                    } else {
                        p = p.slice(0, 2);
                    }

                    setProblems(p);

                    // Create the initial session document
                    await setDoc(sessionRef, {
                        userId: currentUser.uid,
                        roomId,
                        company,
                        problems: p,
                        q1Score: { passed: 0, total: 1 },
                        q2Score: { passed: 0, total: 1 },
                        timeLeft: 3600,
                        isFinished: false,
                        aiReport: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                }
            } catch (err) {
                console.error("Failed to load OA problems:", err);
            } finally {
                setLoading(false);
            }
        };

        initializeOA();
    }, [company, currentUser, navigate, roomId, location.state?.company, location.pathname]);

    const handleSaveProgress = async () => {
        try {
            const ref = doc(db, 'oa_sessions', roomId);
            await setDoc(ref, {
                q1Score,
                q2Score,
                timeLeft,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            // Add a brief subtle alert natively or rely on toast if it exists. 
            // The blue active styling of the button handles visual feedback implicitly.
            alert('Progress saved to your Assessment Vault !');
        } catch (err) {
            console.error("Manual save failed", err);
            alert("Failed to save progress.");
        }
    };

    useEffect(() => {
        if (!loading && !isFinished) {
            timerIntervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerIntervalRef.current);
                        setIsFinished(true); // Auto-finish on expiry
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerIntervalRef.current);
    }, [loading, isFinished]);

    const handleEndAssessment = async () => {
        if (window.confirm("Are you sure you want to end the assessment? Your highest achieved scores will be recorded.")) {
            clearInterval(timerIntervalRef.current);
            setIsFinished(true);
            // Mark finished in DB
            try {
                await setDoc(doc(db, 'oa_sessions', roomId), {
                    isFinished: true,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            } catch (err) {
                console.error("Failed to finalize assessment on DB", err);
            }
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Loader2 size={48} color="#ef4743" className="spin" style={{ marginBottom: '1.5rem' }} />
                <h2 style={{ margin: '0 0 0.5rem 0' }}>Initializing {company} Assessment...</h2>
                <p style={{ color: 'var(--txt2)' }}>Securely fetching proctored environment and problems.</p>
            </div>
        );
    }

    if (isFinished) {
        const totalScore = q1Score.passed + q2Score.passed;
        const maxScore = q1Score.total + q2Score.total;
        
        return (
            <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <OAScorecard scoreData={{
                    roomId,
                    company,
                    timeTakenSeconds: 3600 - timeLeft,
                    q1: { ...q1Score, problemTitle: q1Score.problemTitle || problems[0]?.title, description: problems[0]?.description },
                    q2: { ...q2Score, problemTitle: q2Score.problemTitle || problems[1]?.title, description: problems[1]?.description },
                    totalScore,
                    maxScore,
                    aiReport,
                    aiTotalScore,
                    aiRecommendation
                }} />
            </div>
        );
    }

    if (problems.length < 2) {
        return (
             <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <AlertTriangle size={48} color="#ef4743" style={{ marginBottom: '1.5rem' }} />
                <h2 style={{ margin: '0 0 0.5rem 0' }}>Assessment Error</h2>
                <p style={{ color: 'var(--txt2)' }}>We couldn't initialize the questions. Please try another company or check back later.</p>
                <button onClick={() => navigate('/oaround')} style={{ marginTop: '1.5rem', background: '#ef4743', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Go Back</button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            {/* Top Bar for Assessment */}
            <div style={{
                height: '64px', background: 'rgba(239,71,67,0.05)',
                borderBottom: '1px solid rgba(239,71,67,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 1.5rem', zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
                        {company} <span style={{ color: 'var(--txt2)', fontWeight: 400 }}>| Online Assessment</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 700, color: timeLeft < 300 ? '#ef4743' : '#fff' }}>
                        <Clock size={20} color={timeLeft < 300 ? '#ef4743' : 'var(--txt2)'} />
                        {formatTime(timeLeft)}
                    </div>
                    <button
                        onClick={handleEndAssessment}
                        style={{
                            background: '#ef4743', border: 'none', borderRadius: '8px',
                            color: '#fff', padding: '8px 16px', fontSize: '0.95rem', fontWeight: 600,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                            boxShadow: '0 4px 10px rgba(239,71,67,0.3)', transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#d32f2f'}
                        onMouseLeave={e => e.currentTarget.style.background = '#ef4743'}
                    >
                        End Assessment <Send size={14} />
                    </button>
                    <NavProfile />
                </div>
            </div>

            {/* Assessment Layout */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                        onClick={() => setActiveTab(0)}
                        style={{
                            flex: 1, padding: '16px', background: activeTab === 0 ? 'rgba(255,255,255,0.05)' : 'transparent',
                            border: 'none', borderBottom: activeTab === 0 ? '2px solid #ef4743' : '2px solid transparent',
                            color: activeTab === 0 ? '#fff' : 'var(--txt2)', fontSize: '1rem', fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Question 1
                        {q1Score.passed > 0 && <span style={{ marginLeft: 8, fontSize: '0.75rem', background: '#00b8a3', color: '#000', padding: '2px 6px', borderRadius: '4px' }}>Attempted</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab(1)}
                        style={{
                            flex: 1, padding: '16px', background: activeTab === 1 ? 'rgba(255,255,255,0.05)' : 'transparent',
                            border: 'none', borderBottom: activeTab === 1 ? '2px solid #ef4743' : '2px solid transparent',
                            color: activeTab === 1 ? '#fff' : 'var(--txt2)', fontSize: '1rem', fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Question 2
                        {q2Score.passed > 0 && <span style={{ marginLeft: 8, fontSize: '0.75rem', background: '#00b8a3', color: '#000', padding: '2px 6px', borderRadius: '4px' }}>Attempted</span>}
                    </button>
                </div>

                {/* Dashboard Instances embedded */}
                {/* We mount both but control visibility to preserve Editor states across tabs */}
                <div style={{ flex: 1, display: activeTab === 0 ? 'block' : 'none' }}>
                    <Dashboard 
                        embedded={true} 
                        initialProblem={problems[0]} 
                        onScoreUpdate={(score) => setQ1Score(prev => ({ ...prev, ...score }))}
                        initialCode={q1Score?.code || null}
                        onCodeChange={(code) => setQ1Score(prev => ({ ...prev, code }))}
                        onSaveCode={handleSaveProgress}
                    />
                </div>
                <div style={{ flex: 1, display: activeTab === 1 ? 'block' : 'none' }}>
                    <Dashboard 
                        embedded={true} 
                        initialProblem={problems[1]} 
                        onScoreUpdate={(score) => setQ2Score(prev => ({ ...prev, ...score }))}
                        initialCode={q2Score?.code || null}
                        onCodeChange={(code) => setQ2Score(prev => ({ ...prev, code }))}
                        onSaveCode={handleSaveProgress}
                    />
                </div>
            </div>
            
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
