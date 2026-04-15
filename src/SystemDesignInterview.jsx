import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
    AlertCircle,
    BookOpen,
    Brain,
    Clock,
    Code2,
    Layers,
    Loader2,
    Maximize2,
    Mic,
    MicOff,
    Minimize2,
    PhoneOff,
    Play,
    Send,
    StickyNote,
    Terminal,
    Volume2,
    VolumeX
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import AIProctor from './components/AIProctor';
import SystemDesignBoard from './components/SystemDesignBoard';
import { useSEO } from './hooks/useSEO';

const LANG_OPTIONS = { python: 'Python', javascript: 'JavaScript', cpp: 'C++', java: 'Java', go: 'Go' };
const LANGUAGE_TEMPLATES = {
    python: '# General scratchpad for system design\n\nclass Solution:\n    def design(self):\n        pass',
    javascript: '// General scratchpad for system design\nclass Solution {\n  design() {}\n}',
    cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  return 0;\n}',
    java: 'import java.util.*;\n\nclass Solution {\n  void design() {}\n}',
    go: 'package main\n\nfunc main() {\n}\n'
};

const VOICE_TEMPLATES = [
    { id: 'manan', speaker: 'manan', name: 'Manan', gender: 'Male', tag: 'Authoritative' },
    { id: 'ratan', speaker: 'ratan', name: 'Ratan', gender: 'Male', tag: 'Calm' },
    { id: 'rohan', speaker: 'rohan', name: 'Rohan', gender: 'Male', tag: 'Deep' },
    { id: 'jessica', speaker: 'shreya', name: 'Jessica', gender: 'Female', tag: 'Articulate' },
    { id: 'shreya', speaker: 'shreya', name: 'Shreya', gender: 'Female', tag: 'Warm' },
    { id: 'roopa', speaker: 'roopa', name: 'Roopa', gender: 'Female', tag: 'Professional' }
];

const MALE_VIDEO_MAP = {
    manan: '/male_manan.mp4',
    ratan: '/male_ratan.mp4',
    rohan: '/male_rohan.mp4'
};

const SCORE_SKILL_LABELS = {
    requirementsGathering: 'Requirements',
    architectureDesign: 'Architecture',
    scalabilityThinking: 'Scalability',
    tradeoffAnalysis: 'Trade-offs',
    communication: 'Communication',
    technicalDepth: 'Technical Depth'
};

function ScoreBadge({ score }) {
    const color = score >= 75 ? '#00b8a3' : score >= 50 ? '#ffa116' : '#ef4743';
    const circumference = 2 * Math.PI * 54;
    const strokeDash = (score / 100) * circumference;
    return (
        <div style={{ position: 'relative', width: 140, height: 140 }}>
            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <circle cx="70" cy="70" r="54" fill="none" stroke={color} strokeWidth="10" strokeDasharray={`${strokeDash} ${circumference}`} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color, fontSize: '2rem', fontWeight: 800 }}>{score}</div>
                    <div style={{ fontSize: 11, color: 'var(--txt3)' }}>/100</div>
                </div>
            </div>
        </div>
    );
}

export default function SystemDesignInterview() {
    useSEO({
        title: 'AI System Design Interview',
        description: 'Practice system design interviews with AI interviewer, whiteboard, editor, and proctored environment.',
        canonical: '/systemdesigninterview'
    });

    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const topic = (searchParams.get('topic') || location.state?.setupParams?.topic || 'System Design').trim();

    const [appPhase, setAppPhase] = useState('setup');
    const [role, setRole] = useState('');
    const [company, setCompany] = useState('');
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(LANGUAGE_TEMPLATES.python);
    const [selectedVoice, setSelectedVoice] = useState(VOICE_TEMPLATES[0]);
    const [strictness, setStrictness] = useState('real');
    const [setupError, setSetupError] = useState('');
    const [sessionId, setSessionId] = useState(id || null);

    const [transcript, setTranscript] = useState([]);
    const transcriptRef = useRef([]);
    const [userInput, setUserInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [notes, setNotes] = useState('');
    const [rightPanelTab, setRightPanelTab] = useState('chat');

    const [consoleOpen, setConsoleOpen] = useState(true);
    const [terminalOutput, setTerminalOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [whiteboardOpen, setWhiteboardOpen] = useState(false);
    const [whiteboardFullscreen, setWhiteboardFullscreen] = useState(false);

    const [scoreReport, setScoreReport] = useState(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const interviewStartRef = useRef(null);

    const [isBlurry, setIsBlurry] = useState(false);
    const [malpracticeCount, setMalpracticeCount] = useState(0);
    const [aiProctorMsg, setAiProctorMsg] = useState('');
    const [showMalpracticePopup, setShowMalpracticePopup] = useState(false);
    const [isFullscreenCheating, setIsFullscreenCheating] = useState(false);
    const [lockdownNotice, setLockdownNotice] = useState('');

    const audioRef = useRef(null);
    const recognitionRef = useRef(null);
    const chatEndRef = useRef(null);
    const femaleVideoRef = useRef(null);
    const maleVideoRef = useRef(null);
    const userInputRef = useRef('');

    useEffect(() => {
        if (!currentUser) navigate('/login?redirect=/systemdesigninterviewselect', { replace: true });
    }, [currentUser, navigate]);

    useEffect(() => {
        const setup = location.state?.setupParams;
        if (setup && appPhase === 'setup') {
            setRole(setup.role || '');
            setCompany(setup.company || '');
            setLanguage(setup.language || 'python');
            setCode(LANGUAGE_TEMPLATES[setup.language || 'python']);
            setSelectedVoice(setup.selectedVoice || VOICE_TEMPLATES[0]);
            setStrictness(setup.strictness || 'real');
            setSessionId(id || null);
            setAppPhase('interview');
        }
    }, [location.state, appPhase, id]);

    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    useEffect(() => {
        userInputRef.current = userInput;
    }, [userInput]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript, isAiThinking]);

    useEffect(() => {
        setCode(LANGUAGE_TEMPLATES[language] || '');
    }, [language]);

    useEffect(() => {
        if (appPhase !== 'interview') return;
        interviewStartRef.current = Date.now();
        const interval = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - interviewStartRef.current) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [appPhase]);

    useEffect(() => {
        if (appPhase !== 'interview') return;
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        let seed = '';
        recognition.onstart = () => { seed = userInputRef.current ? `${userInputRef.current} ` : ''; };
        recognition.onresult = (e) => {
            let finalPart = '';
            let interimPart = '';
            for (let i = 0; i < e.results.length; i += 1) {
                if (e.results[i].isFinal) finalPart += `${e.results[i][0].transcript} `;
                else interimPart += e.results[i][0].transcript;
            }
            setUserInput(`${seed}${finalPart}${interimPart}`.trimStart());
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognitionRef.current = recognition;
        return () => recognition.abort();
    }, [appPhase]);

    useEffect(() => {
        if (!['mid', 'strict', 'real'].includes(strictness) || appPhase !== 'interview') return undefined;
        const preventCopy = (e) => e.preventDefault();
        const preventContext = (e) => e.preventDefault();
        document.addEventListener('copy', preventCopy);
        document.addEventListener('cut', preventCopy);
        document.addEventListener('paste', preventCopy);
        document.addEventListener('contextmenu', preventContext);
        return () => {
            document.removeEventListener('copy', preventCopy);
            document.removeEventListener('cut', preventCopy);
            document.removeEventListener('paste', preventCopy);
            document.removeEventListener('contextmenu', preventContext);
        };
    }, [strictness, appPhase]);

    useEffect(() => {
        if (!['strict', 'real'].includes(strictness) || appPhase !== 'interview') return undefined;
        const onVisibility = () => {
            if (document.hidden) {
                setMalpracticeCount((v) => v + 1);
                setAiProctorMsg('Tab switch detected. Please stay in interview window.');
                setShowMalpracticePopup(true);
            }
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, [strictness, appPhase]);

    useEffect(() => {
        if (!['strict', 'real'].includes(strictness) || appPhase !== 'interview') return undefined;
        const onFullscreen = () => {
            if (!document.fullscreenElement) {
                setIsFullscreenCheating(true);
                setMalpracticeCount((v) => v + 1);
                setAiProctorMsg('Fullscreen exited. Re-enter fullscreen to continue.');
                setShowMalpracticePopup(true);
            } else {
                setIsFullscreenCheating(false);
            }
        };
        document.addEventListener('fullscreenchange', onFullscreen);
        return () => document.removeEventListener('fullscreenchange', onFullscreen);
    }, [strictness, appPhase]);

    useEffect(() => {
        if (!['strict', 'real'].includes(strictness) || appPhase !== 'interview') return;
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => {
                setAiProctorMsg('Unable to auto-enter fullscreen. Please enable fullscreen manually.');
                setShowMalpracticePopup(true);
            });
        }
    }, [strictness, appPhase]);

    useEffect(() => {
        if (malpracticeCount >= 5 && appPhase === 'interview') {
            setLockdownNotice('Interview ended due to repeated policy violations.');
            endInterview();
        }
    }, [malpracticeCount, appPhase]);

    useEffect(() => {
        if (!sessionId || !currentUser || appPhase !== 'interview') return undefined;
        const saveTimer = setInterval(() => {
            fetch('https://leetcode-orchestration.onrender.com/api/systemdesign/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interviewId: sessionId,
                    userId: currentUser.uid,
                    topic,
                    role,
                    company,
                    strictness,
                    language,
                    transcript: transcriptRef.current,
                    notes,
                    finalCode: code,
                    whiteboardText: 'Diagram is on whiteboard overlay',
                    durationMinutes: Math.round(elapsedSeconds / 60)
                })
            }).catch(() => {});
        }, 12000);
        return () => clearInterval(saveTimer);
    }, [sessionId, currentUser, appPhase, topic, role, company, strictness, language, notes, code, elapsedSeconds]);

    useEffect(() => {
        if (!id || location.state?.setupParams || !currentUser) return;
        fetch(`https://leetcode-orchestration.onrender.com/api/interviews/${id}?userId=${currentUser.uid}`)
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                if (!data) return;
                setRole(data.role || '');
                setCompany(data.company || '');
                setLanguage(data.language || 'python');
                setCode(data.finalCode || LANGUAGE_TEMPLATES[data.language || 'python'] || LANGUAGE_TEMPLATES.python);
                setStrictness(data.strictness || 'real');
                setTranscript(data.transcript || []);
                setNotes(data.notes || '');
                if (data.scoreReport) {
                    setScoreReport(data.scoreReport);
                    setAppPhase('score');
                } else {
                    setAppPhase('interview');
                }
            })
            .catch(() => {});
    }, [id, location.state, currentUser]);

    const formattedTime = useMemo(() => `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`, [elapsedSeconds]);

    const stopSpeech = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }
        setIsSpeaking(false);
        [femaleVideoRef, maleVideoRef].forEach((r) => {
            if (r.current) r.current.pause();
        });
    };

    const speakText = async (text) => {
        if (!ttsEnabled || !text?.trim()) return;
        stopSpeech();
        setIsSpeaking(true);
        try {
            const res = await fetch('https://leetcode-orchestration.onrender.com/api/sarvam/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, speaker: selectedVoice.speaker })
            });
            if (!res.ok) throw new Error('tts');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;
            const selectedVideoRef = selectedVoice.gender === 'Female' ? femaleVideoRef : maleVideoRef;
            selectedVideoRef.current?.play().catch(() => {});
            audio.onended = () => {
                setIsSpeaking(false);
                selectedVideoRef.current?.pause();
                URL.revokeObjectURL(url);
            };
            audio.onerror = () => setIsSpeaking(false);
            await audio.play();
        } catch (_) {
            setIsSpeaking(false);
        }
    };

    const sendMessage = useCallback(async (textOverride) => {
        const text = (textOverride || userInput).trim();
        if (!text || isAiThinking) return;
        const userMsg = { role: 'user', text };
        const nextTranscript = [...transcriptRef.current, userMsg];
        setTranscript(nextTranscript);
        setUserInput('');
        setIsAiThinking(true);
        try {
            const res = await fetch('https://leetcode-orchestration.onrender.com/api/systemdesign/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    role,
                    company,
                    strictness,
                    code,
                    transcript: nextTranscript,
                    whiteboardText: 'Diagram is on interactive whiteboard'
                })
            });
            const data = await res.json();
            const aiMsg = { role: 'ai', text: data.text || 'Let us continue with your approach.' };
            setTranscript((prev) => [...prev, aiMsg]);
            speakText(aiMsg.text);
        } catch (_) {
            setTranscript((prev) => [...prev, { role: 'ai', text: 'I am having trouble connecting. Please try again.' }]);
        } finally {
            setIsAiThinking(false);
        }
    }, [userInput, isAiThinking, topic, role, company, strictness, code, ttsEnabled, selectedVoice]);

    useEffect(() => {
        if (appPhase !== 'interview' || transcriptRef.current.length > 0 || !role) return;
        const intro = `Hello! I am your system design interviewer. Today we will design "${topic}" for the ${role} role${company ? ` at ${company}` : ''}. Start with clarifying questions and assumptions.`;
        const aiMsg = { role: 'ai', text: intro };
        setTranscript([aiMsg]);
        speakText(intro);
    }, [appPhase, role, company, topic]);

    const toggleMic = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }
        recognitionRef.current?.start();
        setIsListening(true);
    };

    const runCode = async () => {
        if (!code.trim() || isRunning) return;
        setIsRunning(true);
        setTerminalOutput('Running...');
        setConsoleOpen(true);
        try {
            const res = await fetch('https://leetcode-orchestration.onrender.com/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language, input: '' })
            });
            const data = await res.json();
            setTerminalOutput(data.error ? `Error:\n${data.error}` : (data.stdout || data.output || 'Execution completed.'));
        } catch (err) {
            setTerminalOutput(`Connection error: ${err.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const endInterview = async () => {
        stopSpeech();
        setAppPhase('evaluating');
        try {
            const res = await fetch('https://leetcode-orchestration.onrender.com/api/systemdesign/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    role,
                    company,
                    strictness,
                    transcript: transcriptRef.current,
                    finalCode: code,
                    notes,
                    whiteboardText: 'Diagram on collaborative whiteboard'
                })
            });
            const report = await res.json();
            setScoreReport(report);
            await fetch('https://leetcode-orchestration.onrender.com/api/systemdesign/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interviewId: sessionId,
                    userId: currentUser?.uid,
                    topic,
                    role,
                    company,
                    strictness,
                    language,
                    transcript: transcriptRef.current,
                    notes,
                    finalCode: code,
                    scoreReport: report,
                    whiteboardText: 'Diagram on collaborative whiteboard',
                    durationMinutes: Math.round(elapsedSeconds / 60)
                })
            });
            setAppPhase('score');
        } catch (_) {
            setScoreReport({
                overallScore: 65,
                verdict: 'Maybe',
                summary: 'Evaluation service failed. Please retry.',
                skills: {},
                strengths: [],
                improvements: []
            });
            setAppPhase('score');
        }
    };

    const startFromInlineSetup = async () => {
        if (!role.trim()) {
            setSetupError('Please enter a target job role.');
            return;
        }
        if (['strict', 'real'].includes(strictness)) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                stream.getTracks().forEach((track) => track.stop());
            } catch (_) {
                setSetupError('Camera and microphone permissions are required for strict modes.');
                return;
            }
        }
        setAppPhase('interview');
    };

    const handleProctorViolation = (msg, forceBlur = false) => {
        setAiProctorMsg(msg);
        setShowMalpracticePopup(true);
        setMalpracticeCount((v) => v + 1);
        if (forceBlur) {
            setIsBlurry(true);
            setTimeout(() => setIsBlurry(false), 5000);
        }
    };

    if (!currentUser) return null;

    if (appPhase === 'setup') {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', display: 'grid', placeItems: 'center', padding: 16 }}>
                <div style={{ width: '100%', maxWidth: 560, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20 }}>
                    <h2 style={{ marginTop: 0, color: '#fff' }}>System Design Interview</h2>
                    <p style={{ marginTop: 0, color: 'var(--txt2)', fontSize: 14 }}>Quick setup fallback for direct links to this route.</p>
                    <div style={{ color: '#93c5fd', marginBottom: 10 }}>Topic: {topic}</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Target role" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: '#fff' }} />
                        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: '#fff' }} />
                    </div>
                    {setupError && <div style={{ marginTop: 8, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 6 }}><AlertCircle size={14} /> {setupError}</div>}
                    <button onClick={startFromInlineSetup} style={{ marginTop: 12, width: '100%', background: 'linear-gradient(135deg,#3b82f6,#a855f7)', border: 'none', borderRadius: 10, padding: 10, color: '#fff', fontWeight: 700 }}>Start Interview</button>
                </div>
            </div>
        );
    }

    if (appPhase === 'evaluating') {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', display: 'grid', placeItems: 'center' }}>
                <div style={{ textAlign: 'center', color: '#fff' }}>
                    <Loader2 size={42} style={{ animation: 'spin 1s linear infinite' }} />
                    <div style={{ marginTop: 12 }}>Evaluating your system design interview...</div>
                </div>
                <style>{'@keyframes spin { to { transform: rotate(360deg);} }'}</style>
            </div>
        );
    }

    if (appPhase === 'score' && scoreReport) {
        const verdict = scoreReport.verdict || 'Maybe';
        const verdictColor = verdict === 'Hire' ? '#00b8a3' : verdict === 'No Hire' ? '#ef4743' : '#ffa116';
        return (
            <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', padding: 20 }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <h1>System Design Interview Result</h1>
                    <p style={{ color: 'var(--txt2)' }}>{topic} · {role}{company ? ` @ ${company}` : ''}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginTop: 12 }}>
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 14, display: 'grid', placeItems: 'center' }}>
                            <ScoreBadge score={scoreReport.overallScore || 0} />
                            <div style={{ marginTop: 8, color: verdictColor, fontWeight: 800 }}>{verdict}</div>
                        </div>
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 14 }}>
                            <h3 style={{ marginTop: 0 }}>Summary</h3>
                            <p style={{ color: 'var(--txt2)' }}>{scoreReport.summary || 'No summary available.'}</p>
                            <div style={{ display: 'grid', gap: 8 }}>
                                {Object.entries(scoreReport.skills || {}).map(([k, val]) => {
                                    const color = val >= 75 ? '#00b8a3' : val >= 50 ? '#ffa116' : '#ef4743';
                                    return (
                                        <div key={k}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                <span>{SCORE_SKILL_LABELS[k] || k}</span>
                                                <span style={{ color }}>{val}%</span>
                                            </div>
                                            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999 }}>
                                                <div style={{ width: `${val}%`, height: '100%', background: color, borderRadius: 999 }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
                        <div style={{ background: 'rgba(0,184,163,0.08)', border: '1px solid rgba(0,184,163,0.26)', borderRadius: 14, padding: 14 }}>
                            <h4 style={{ marginTop: 0, color: '#00b8a3' }}>Strengths</h4>
                            {(scoreReport.strengths || []).map((s, i) => <div key={i} style={{ color: 'var(--txt2)', marginBottom: 6 }}>- {s}</div>)}
                        </div>
                        <div style={{ background: 'rgba(255,161,22,0.08)', border: '1px solid rgba(255,161,22,0.26)', borderRadius: 14, padding: 14 }}>
                            <h4 style={{ marginTop: 0, color: '#ffa116' }}>Improvements</h4>
                            {(scoreReport.improvements || []).map((s, i) => <div key={i} style={{ color: 'var(--txt2)', marginBottom: 6 }}>- {s}</div>)}
                        </div>
                    </div>
                    <div style={{ marginTop: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 14 }}>
                        <h4 style={{ marginTop: 0 }}>Saved Notes</h4>
                        <p style={{ color: 'var(--txt2)', whiteSpace: 'pre-wrap' }}>{notes?.trim() || 'No notes were captured.'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                        <button onClick={() => navigate('/systemdesign')} style={{ border: 'none', borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#a855f7)', color: '#fff', padding: '10px 14px', fontWeight: 700 }}>Practice Another Topic</button>
                        <button onClick={() => navigate('/systemdesigninterviewselect', { state: { topic } })} style={{ border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)', color: '#fff', padding: '10px 14px' }}>New Interview Setup</button>
                    </div>
                    {lockdownNotice && (
                        <div style={{ marginTop: 12, color: '#fca5a5', fontSize: 13 }}>{lockdownNotice}</div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {isBlurry && <div style={{ position: 'fixed', inset: 0, backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.5)', zIndex: 99998 }} />}
            {showMalpracticePopup && (
                <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 99999, background: '#1f1f1f', border: '1px solid rgba(239,71,67,0.5)', borderRadius: 10, padding: 10, maxWidth: 340 }}>
                    <div style={{ color: '#fca5a5', fontWeight: 700, marginBottom: 6 }}>Proctor Alert</div>
                    <div style={{ color: 'var(--txt2)', fontSize: 13 }}>{aiProctorMsg || 'Policy violation detected.'}</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                        {isFullscreenCheating && (
                            <button
                                onClick={async () => {
                                    try {
                                        await document.documentElement.requestFullscreen?.();
                                        setIsFullscreenCheating(false);
                                        setShowMalpracticePopup(false);
                                    } catch (_) {}
                                }}
                                style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.45)', color: '#bfdbfe', borderRadius: 8, padding: '4px 8px' }}
                            >
                                Re-enter Fullscreen
                            </button>
                        )}
                        <button onClick={() => setShowMalpracticePopup(false)} style={{ background: 'transparent', border: '1px solid var(--border)', color: '#fff', borderRadius: 8, padding: '4px 8px' }}>Dismiss</button>
                    </div>
                </div>
            )}

            <nav style={{ height: 52, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, padding: '4px 8px', borderRadius: 999, background: 'rgba(59,130,246,0.16)', border: '1px solid rgba(59,130,246,0.35)' }}>LIVE · {topic}</span>
                    <span style={{ color: 'var(--txt3)', fontSize: 12 }}>{role}{company ? ` @ ${company}` : ''}</span>
                    <span style={{ color: '#fca5a5', fontSize: 12 }}>Mode: {strictness}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => setWhiteboardOpen((v) => !v)} style={{ background: whiteboardOpen ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 5 }}><Layers size={13} /> Whiteboard</button>
                    <button onClick={() => setRightPanelTab((t) => t === 'chat' ? 'notes' : 'chat')} style={{ background: rightPanelTab === 'notes' ? 'rgba(168,85,247,0.24)' : 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 5 }}><StickyNote size={13} /> {rightPanelTab === 'notes' ? 'Chat' : 'Notes'}</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--txt3)', fontSize: 13 }}><Clock size={13} /> {formattedTime}</div>
                    <button onClick={() => setTtsEnabled((v) => !v)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', color: ttsEnabled ? '#93c5fd' : 'var(--txt3)', borderRadius: 8, padding: 6 }}>{ttsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}</button>
                    <button onClick={endInterview} style={{ background: 'rgba(239,71,67,0.2)', border: '1px solid rgba(239,71,67,0.5)', color: '#fca5a5', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 5 }}><PhoneOff size={13} /> End</button>
                </div>
            </nav>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', minHeight: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.1)', minHeight: 0 }}>
                    <div style={{ height: 40, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Code2 size={13} /> <span style={{ fontSize: 12 }}>General Code Editor</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff', borderRadius: 6, padding: '4px 6px', fontSize: 12 }}>
                                {Object.entries(LANG_OPTIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                            <button onClick={runCode} disabled={isRunning} style={{ background: 'rgba(0,184,163,0.18)', border: '1px solid rgba(0,184,163,0.38)', color: '#5eead4', borderRadius: 6, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>{isRunning ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={12} />}Run</button>
                        </div>
                    </div>
                    <div style={{ flex: consoleOpen ? '1 1 60%' : 1, minHeight: 0 }}>
                        <Editor height="100%" language={language === 'cpp' ? 'cpp' : language} value={code} onChange={(v) => setCode(v || '')} theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 13 }} />
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <button onClick={() => setConsoleOpen((v) => !v)} style={{ width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.04)', border: 'none', color: 'var(--txt2)', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}><Terminal size={13} /> Console {consoleOpen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}</button>
                        {consoleOpen && <pre style={{ margin: 0, height: 140, overflow: 'auto', background: '#0a0a0f', padding: 10, color: '#5eead4', fontSize: 12, fontFamily: 'monospace' }}>{terminalOutput || '$ Output will appear here after running code.'}</pre>}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <div style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#a855f7)', display: 'grid', placeItems: 'center', position: 'relative' }}>
                                <Brain size={16} />
                                {isSpeaking && <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: '2px solid rgba(59,130,246,0.7)', animation: 'ping 1s infinite' }} />}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 13 }}>{selectedVoice.name} · AI Interviewer</div>
                                <div style={{ color: 'var(--txt3)', fontSize: 11 }}>{isAiThinking ? 'Thinking...' : isSpeaking ? 'Speaking...' : 'Listening'}</div>
                            </div>
                        </div>
                        <div style={{ width: 120, height: 72, borderRadius: 10, overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.15)' }}>
                            {selectedVoice.gender === 'Female' ? (
                                <video ref={femaleVideoRef} src="/female_speak1.mp4" muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <video ref={maleVideoRef} src={MALE_VIDEO_MAP[selectedVoice.id] || '/male_manan.mp4'} muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                        </div>
                    </div>
                    {rightPanelTab === 'notes' ? (
                        <div style={{ flex: 1, minHeight: 0, padding: 10, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BookOpen size={13} /> Interview Notes</div>
                                <button onClick={() => setNotes('')} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--txt2)', borderRadius: 6, padding: '4px 8px' }}>Clear</button>
                            </div>
                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ flex: 1, minHeight: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, color: '#fff', padding: 10, resize: 'none' }} placeholder="Capture architecture decisions, trade-offs, APIs, scaling notes..." />
                        </div>
                    ) : (
                        <>
                            <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {transcript.map((m, i) => (
                                    <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%', background: m.role === 'user' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, padding: '8px 10px', fontSize: 13, lineHeight: 1.45 }}>
                                        {m.text}
                                    </div>
                                ))}
                                {isAiThinking && <div style={{ color: 'var(--txt3)', fontSize: 12 }}>AI is thinking...</div>}
                                <div ref={chatEndRef} />
                            </div>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: 8, display: 'flex', gap: 6 }}>
                                <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} rows={2} placeholder={isListening ? 'Listening...' : 'Explain your design decisions...'} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: '#fff', padding: 8, resize: 'none' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <button onClick={toggleMic} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: isListening ? 'rgba(239,71,67,0.2)' : 'rgba(255,255,255,0.08)', color: '#fff' }}>{isListening ? <MicOff size={14} /> : <Mic size={14} />}</button>
                                    <button onClick={() => sendMessage()} disabled={isAiThinking || !userInput.trim()} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(59,130,246,0.4)', background: 'rgba(59,130,246,0.2)', color: '#fff' }}><Send size={14} /></button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, height: whiteboardFullscreen ? '100vh' : '58vh', transform: whiteboardOpen ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.25s ease', opacity: whiteboardOpen ? 1 : 0, pointerEvents: whiteboardOpen ? 'auto' : 'none', zIndex: 4000, background: '#07090f', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                <div style={{ height: 46, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Layers size={14} /> System Design Whiteboard</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setWhiteboardFullscreen((v) => !v)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, padding: '4px 8px' }}>{whiteboardFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</button>
                        <button onClick={() => { setWhiteboardOpen(false); setWhiteboardFullscreen(false); }} style={{ background: 'rgba(239,71,67,0.2)', border: '1px solid rgba(239,71,67,0.4)', color: '#fca5a5', borderRadius: 8, padding: '4px 8px' }}>Close</button>
                    </div>
                </div>
                <div style={{ height: 'calc(100% - 46px)' }}>
                    <SystemDesignBoard />
                </div>
            </div>

            {['strict', 'real'].includes(strictness) && !isFullscreenCheating && appPhase === 'interview' && (
                <AIProctor onViolationDetected={handleProctorViolation} />
            )}
            <div style={{ position: 'fixed', bottom: 12, left: 12, fontSize: 11, color: 'var(--txt3)', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: 999 }}>
                Violations: {malpracticeCount}
            </div>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes ping { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } }
            `}</style>
        </div>
    );
}
