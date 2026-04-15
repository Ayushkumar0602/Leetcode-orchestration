import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Building, Cpu, Mic, Shield, User, Video } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import NavProfile from './NavProfile';
import { useSEO } from './hooks/useSEO';

const LANG_OPTIONS = {
    python: 'Python',
    javascript: 'JavaScript',
    cpp: 'C++',
    java: 'Java',
    go: 'Go'
};

const VOICE_TEMPLATES = [
    { id: 'manan', speaker: 'manan', name: 'Manan', tag: 'Authoritative', gender: 'Male' },
    { id: 'ratan', speaker: 'ratan', name: 'Ratan', tag: 'Calm', gender: 'Male' },
    { id: 'rohan', speaker: 'rohan', name: 'Rohan', tag: 'Deep', gender: 'Male' },
    { id: 'jessica', speaker: 'shreya', name: 'Jessica', tag: 'Articulate', gender: 'Female' },
    { id: 'shreya', speaker: 'shreya', name: 'Shreya', tag: 'Warm', gender: 'Female' },
    { id: 'roopa', speaker: 'roopa', name: 'Roopa', tag: 'Professional', gender: 'Female' }
];

const STRICTNESS_MODES = [
    { id: 'low', label: 'Low', desc: 'Relaxed practice, no restrictions.' },
    { id: 'mid', label: 'Mid', desc: 'Copy/context restrictions enabled.' },
    { id: 'strict', label: 'Strict', desc: 'Fullscreen + anti-tab switch checks.' },
    { id: 'real', label: 'Job Environment', desc: 'Strict + proctoring for interview realism.' }
];

export default function SystemDesignInterviewSelect() {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const stateTopic = location.state?.topic;
    const queryTopic = searchParams.get('topic');
    const initialTopic = stateTopic || queryTopic || '';

    useSEO({
        title: 'System Design Interview Setup',
        description: 'Configure your AI system design interview with strictness mode, voice, and workspace preferences.',
        canonical: '/systemdesigninterviewselect',
        robots: 'noindex, nofollow'
    });

    const [role, setRole] = useState('');
    const [company, setCompany] = useState('');
    const [topic, setTopic] = useState(initialTopic);
    const [language, setLanguage] = useState('python');
    const [selectedVoice, setSelectedVoice] = useState(VOICE_TEMPLATES[0]);
    const [strictness, setStrictness] = useState('real');
    const [setupError, setSetupError] = useState('');
    const [isStarting, setIsStarting] = useState(false);

    const topicLabel = useMemo(() => topic.trim() || 'System Design', [topic]);

    if (!currentUser) {
        navigate('/login?redirect=/systemdesigninterviewselect', { replace: true });
        return null;
    }

    const handleStart = async () => {
        if (!role.trim()) {
            setSetupError('Please enter a target job role.');
            return;
        }
        if (!topic.trim()) {
            setSetupError('Please provide a system design topic.');
            return;
        }

        if (['strict', 'real'].includes(strictness)) {
            try {
                setIsStarting(true);
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                stream.getTracks().forEach(track => track.stop());
            } catch (err) {
                setSetupError('Camera and microphone permissions are required for Strict and Job Environment modes.');
                setIsStarting(false);
                return;
            }
        }

        const interviewId = uuidv4();
        navigate(`/systemdesigninterview/${interviewId}?topic=${encodeURIComponent(topicLabel)}`, {
            state: {
                setupParams: {
                    role: role.trim(),
                    company: company.trim(),
                    topic: topicLabel,
                    language,
                    selectedVoice,
                    strictness
                }
            }
        });
    };

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <nav style={{ height: 64, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', background: 'rgba(5,5,5,0.85)' }}>
                <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: 'var(--txt2)', cursor: 'pointer', fontWeight: 600 }}>
                    <ArrowLeft size={18} />
                    Back
                </button>
                <NavProfile />
            </nav>

            <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem 3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'grid', placeItems: 'center' }}>
                        <Cpu size={22} color="#60a5fa" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Configure System Design Interview</h1>
                        <p style={{ margin: 0, color: 'var(--txt2)', fontSize: '0.9rem' }}>Topic-wise setup with full AI interview environment.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: 6 }}><User size={13} /> Role *</span>
                        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Senior Backend Engineer" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff', borderRadius: 10, padding: '10px 12px' }} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: 6 }}><Building size={13} /> Company</span>
                        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Uber, Meta, Amazon" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff', borderRadius: 10, padding: '10px 12px' }} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--txt3)' }}>Topic *</span>
                        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Design YouTube, Design URL Shortener" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff', borderRadius: 10, padding: '10px 12px' }} />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--txt3)' }}>Code Editor Language</span>
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff', borderRadius: 10, padding: '10px 12px' }}>
                            {Object.entries(LANG_OPTIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </label>
                </div>

                <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Video size={13} /> AI Interviewer Voice</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
                        {VOICE_TEMPLATES.map((voice) => (
                            <button
                                key={voice.id}
                                type="button"
                                onClick={() => setSelectedVoice(voice)}
                                style={{
                                    border: `1px solid ${selectedVoice.id === voice.id ? '#3b82f6' : 'var(--border)'}`,
                                    background: selectedVoice.id === voice.id ? 'rgba(59,130,246,0.14)' : 'var(--surface)',
                                    borderRadius: 10,
                                    color: '#fff',
                                    padding: '10px 8px',
                                    textAlign: 'left',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ fontWeight: 700 }}>{voice.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--txt3)' }}>{voice.tag} · {voice.gender}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Shield size={13} /> Interview Environment</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8 }}>
                        {STRICTNESS_MODES.map((mode) => (
                            <button
                                key={mode.id}
                                type="button"
                                onClick={() => setStrictness(mode.id)}
                                style={{
                                    border: `1px solid ${strictness === mode.id ? '#a855f7' : 'var(--border)'}`,
                                    background: strictness === mode.id ? 'rgba(168,85,247,0.13)' : 'var(--surface)',
                                    borderRadius: 10,
                                    color: '#fff',
                                    padding: '10px 8px',
                                    textAlign: 'left',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ fontWeight: 700 }}>{mode.label}</div>
                                <div style={{ fontSize: 12, color: 'var(--txt3)' }}>{mode.desc}</div>
                            </button>
                        ))}
                    </div>
                    {['strict', 'real'].includes(strictness) && (
                        <div style={{ marginTop: 8, fontSize: 12, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Mic size={13} />
                            Camera and microphone permission will be checked before interview starts.
                        </div>
                    )}
                </div>

                {setupError && (
                    <div style={{ marginTop: 14, padding: '10px 12px', border: '1px solid rgba(239,71,67,0.45)', borderRadius: 10, background: 'rgba(239,71,67,0.12)', color: '#fca5a5' }}>
                        {setupError}
                    </div>
                )}

                <button disabled={isStarting} onClick={handleStart} style={{ marginTop: 18, width: '100%', border: 'none', borderRadius: 12, padding: '12px', fontWeight: 700, background: 'linear-gradient(135deg,#3b82f6,#a855f7)', color: '#fff', cursor: 'pointer', opacity: isStarting ? 0.7 : 1 }}>
                    {isStarting ? 'Starting interview...' : 'Start System Design Interview'}
                </button>
            </div>
        </div>
    );
}
