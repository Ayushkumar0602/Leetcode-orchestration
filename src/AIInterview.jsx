import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
    Play, Mic, MicOff, PhoneOff, Brain, ChevronRight, Search,
    X, Loader2, CheckCircle2, XCircle, Star, TrendingUp, MessageSquare,
    Code2, Shield, Lightbulb, BarChart3, ArrowLeft, Sparkles, Volume2, VolumeX,
    Send, Terminal, ChevronDown, ChevronUp, LogOut, Clock, History, User, Building,
    MessageCircle, AlertCircle, Info, Navigation, Trash2, RefreshCcw, LayoutTemplate,
    Maximize2, Minimize2
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { useInterviewSession } from './useInterviewSession';
import SystemDesignBoard from './components/SystemDesignBoard';
import NavProfile from './NavProfile';

// ─── Constants ───────────────────────────────────────────────────────────────
const LANG_OPTIONS = { python: 'Python 3', javascript: 'JavaScript', cpp: 'C++', c: 'C', java: 'Java', go: 'Go', rust: 'Rust' };
const LANGUAGE_TEMPLATES = {
    python: 'class Solution:\n    def solve(self):\n        # Your code here\n        pass',
    javascript: 'var solve = function() {\n    // Your code here\n};',
    cpp: '#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        // Your code here\n    }\n};',
    c: '#include <stdio.h>\n\nvoid solve() {\n    // Your code here\n}',
    java: 'class Solution {\n    public void solve() {\n        // Your code here\n    }\n}',
    go: 'package main\n\nimport "fmt"\n\nfunc solve() {\n    fmt.Println("Hello")\n}',
    rust: 'struct Solution;\n\nimpl Solution {\n    pub fn solve() {\n        // Your code here\n    }\n}'
};
const DIFFICULTY_COLOR = { Easy: '#00b8a3', Medium: '#ffa116', Hard: '#ef4743' };
const INTERVIEW_PHASES = ['opening', 'brute-force', 'optimization', 'coding', 'wrap-up'];
const PHASE_LABELS = { opening: '🎯 Opening', 'brute-force': '🔨 Brute Force', optimization: '⚡ Optimization', coding: '💻 Coding', 'wrap-up': '✅ Wrap-up' };
const SKILL_ICONS = {
    problemDecomposition: Brain,
    communication: MessageSquare,
    codeQuality: Code2,
    edgeCases: Shield,
    optimization: TrendingUp,
    algorithmicThinking: Sparkles
};
const SKILL_LABELS = {
    problemDecomposition: 'Problem Decomposition',
    communication: 'Communication',
    codeQuality: 'Code Quality',
    edgeCases: 'Edge Cases',
    optimization: 'Optimization',
    algorithmicThinking: 'Algorithmic Thinking'
};

// ─── Sarvam AI Voice Templates ───────────────────────────────────────────────
const VOICE_TEMPLATES = [
    { id: 'manan', speaker: 'manan', name: 'Manan', gender: 'Male', accent: 'Indian', tag: 'Authoritative', emoji: '🎙️' },
    { id: 'ratan', speaker: 'ratan', name: 'Ratan', gender: 'Male', accent: 'Indian', tag: 'Calm', emoji: '🔊' },
    { id: 'rohan', speaker: 'rohan', name: 'Rohan', gender: 'Male', accent: 'Indian', tag: 'Deep', emoji: '🎧' },
    { id: 'jessica', speaker: 'shreya', name: 'Jessica', gender: 'Female', accent: 'Indian', tag: 'Articulate', emoji: '✨' },
    { id: 'shreya', speaker: 'shreya', name: 'Shreya', gender: 'Female', accent: 'Indian', tag: 'Warm', emoji: '🎤' },
    { id: 'roopa', speaker: 'roopa', name: 'Roopa', gender: 'Female', accent: 'Indian', tag: 'Professional', emoji: '🎙️' },
];
const PREVIEW_TEXT = "Hello! I'm your AI interviewer today. I'm excited to work through this problem with you. Let's get started!";

// ─── Male speaker video map (one video per male voice) ─────────────────────
const MALE_VIDEO_MAP = {
    manan: '/male_manan.mp4',
    ratan: '/male_ratan.mp4',
    rohan: '/male_rohan.mp4',
};

const LANGUAGE_WRAPPERS = {
    python: '\nif __name__ == "__main__":\n    solution = Solution()\n    solution.solve()',
    javascript: '\nsolve();',
    cpp: '\nint main() {\n    Solution solution;\n    solution.solve();\n    return 0;\n}',
    c: '\nint main() {\n    solve();\n    return 0;\n}',
    java: '\npublic class Main {\n    public static void main(String[] args) {\n        Solution solution = new Solution();\n        solution.solve();\n    }\n}',
    go: '\nfunc main() {\n    solve()\n}',
    rust: '\nfn main() {\n    Solution::solve();\n}'
};


// ─── Score badge component ────────────────────────────────────────────────────
function ScoreBadge({ score }) {
    const color = score >= 75 ? '#00b8a3' : score >= 50 ? '#ffa116' : '#ef4743';
    const bg = score >= 75 ? 'rgba(0,184,163,0.1)' : score >= 50 ? 'rgba(255,161,22,0.1)' : 'rgba(239,71,67,0.1)';
    const circumference = 2 * Math.PI * 54;
    const strokeDash = (score / 100) * circumference;
    return (
        <div style={{ position: 'relative', width: 140, height: 140 }}>
            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r="54" fill="none" stroke="var(--surface2)" strokeWidth="10" />
                <circle cx="70" cy="70" r="54" fill="none" stroke={color} strokeWidth="10"
                    strokeDasharray={`${strokeDash} ${circumference} `}
                    strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color }}>{score}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--txt2)' }}>/ 100</span>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIInterview() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: urlId } = useParams();
    const { currentUser, logout } = useAuth();

    // ── App phase ──
    const [appPhase, setAppPhase] = useState('setup'); // setup | starting | interview | evaluating | score

    // ── Setup state ──
    const [role, setRole] = useState('');
    const [company, setCompany] = useState('');
    const [problems, setProblems] = useState([]);
    const [problemSearch, setProblemSearch] = useState('');
    const [problemsLoading, setProblemsLoading] = useState(true);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [setupError, setSetupError] = useState('');
    const [selectedVoice, setSelectedVoice] = useState(VOICE_TEMPLATES[0]); // Will by default
    const [previewLoading, setPreviewLoading] = useState(null); // voiceId being previewed

    // ── Problem / AI data ──
    const [problemData, setProblemData] = useState(null); // full AI-generated problem
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(LANGUAGE_TEMPLATES.python);
    const [aiCode, setAiCode] = useState(null); // boilerplate from AI
    const [isLoadingProblem, setIsLoadingProblem] = useState(false);

    // ── Interview state ──
    const [sessionId, setSessionId] = useState(null);
    const { aiActions } = useInterviewSession(sessionId);
    const [interviewPhase, setInterviewPhase] = useState('opening');
    const [autoStart, setAutoStart] = useState(false);

    // Auto-start from AIInterviewSelect passing config parameters via location.state
    useEffect(() => {
        if (location.state?.setupParams && appPhase === 'setup') {
            const p = location.state.setupParams;
            setRole(p.role);
            setCompany(p.company);
            setLanguage(p.language);
            setSelectedProblem(p.selectedProblem);
            setSelectedVoice(p.selectedVoice);
            setAutoStart(true);
            window.history.replaceState({}, document.title);
        }
    }, [location.state, appPhase]);

    useEffect(() => {
        if (autoStart && role && company && selectedProblem) {
            setAutoStart(false);
            handleStartInterview();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoStart, role, company, selectedProblem]);
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [transcript, setTranscript] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(true); // AI voice on/off
    const [isListening, setIsListening] = useState(false);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [liveAnalysis, setLiveAnalysis] = useState(null);
    const [analysisTimer, setAnalysisTimer] = useState(null);

    // ── Timer state ──
    const [interviewSeconds, setInterviewSeconds] = useState(0);

    // ── Whiteboard state ──
    const [whiteboardOpen, setWhiteboardOpen] = useState(false);
    const [whiteboardFullscreen, setWhiteboardFullscreen] = useState(false);

    // ── Timer Effect ──
    useEffect(() => {
        let interval;
        if (appPhase === 'interview') {
            interval = setInterval(() => {
                setInterviewSeconds(Math.floor((Date.now() - (interviewStartTimeRef.current || Date.now())) / 1000));
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [appPhase]);

    // Formatter
    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // ─── AI Real-Time UI Interactions ───────────────────────────────────────

    // Manage Monaco decorations for highlights
    const decorationsRef = useRef([]);

    useEffect(() => {
        if (!editorRef.current || !aiActions) return;
        const editor = editorRef.current;
        const monaco = window.monaco;
        if (!monaco) return;

        // Isolate highlight actions
        const highlights = aiActions.filter(a => a.type === 'highlight');

        const newDecorations = highlights.map(action => {
            const colorMapping = {
                warning: 'rgba(255, 161, 22, 0.2)',
                error: 'rgba(239, 71, 67, 0.2)',
                success: 'rgba(0, 184, 163, 0.2)',
                info: 'rgba(59, 130, 246, 0.2)'
            };
            const color = colorMapping[action.color] || colorMapping.info;

            return {
                range: new monaco.Range(action.startLine, 1, action.endLine, 100),
                options: {
                    isWholeLine: true,
                    className: `ai-highlight-line ${action.color || 'info'}`,
                    hoverMessage: { value: `**AI Note:** ${action.message}` },
                    overviewRuler: {
                        color: color,
                        position: monaco.editor.OverviewRulerLane.Right
                    }
                }
            };
        });

        const css = `
            .ai-highlight-line { background: rgba(59, 130, 246, 0.15) !important; border-left: 3px solid #3b82f6; }
            .ai-highlight-line.warning { background: rgba(255, 161, 22, 0.15) !important; border-left: 3px solid #ffa116; }
            .ai-highlight-line.error { background: rgba(239, 71, 67, 0.15) !important; border-left: 3px solid #ef4743; }
        `;
        let styleNode = document.getElementById('ai-highlight-styles');
        if (!styleNode) {
            styleNode = document.createElement('style');
            styleNode.id = 'ai-highlight-styles';
            document.head.appendChild(styleNode);
        }
        styleNode.innerText = css;

        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);

    }, [aiActions]);

    // Derived overlay datasets
    const cursorActions = aiActions.filter(a => a.type === 'cursor');
    const commentActions = aiActions.filter(a => a.type === 'comment');
    const lastBanner = [...aiActions].reverse().find(a => a.type === 'banner');

    // Code Update tracking (execute only once per action using its unique timestamp/id if possible, or just the latest one)
    const [lastProcessedCodeUpdate, setLastProcessedCodeUpdate] = useState(null);

    const [activeBanner, setActiveBanner] = useState(null);
    useEffect(() => {
        if (lastBanner) {
            setActiveBanner(lastBanner);
            const timer = setTimeout(() => setActiveBanner(null), 8000); // auto dismiss after 8s
            return () => clearTimeout(timer);
        }
    }, [lastBanner]);

    // Handle codeUpdate action
    useEffect(() => {
        const lastCodeUpdate = [...aiActions].reverse().find(a => a.type === 'codeUpdate');

        if (lastCodeUpdate && editorRef.current && lastProcessedCodeUpdate !== lastCodeUpdate) {
            const editor = editorRef.current;
            const model = editor.getModel();
            if (!model) return;

            let range;
            if (lastCodeUpdate.startLine) {
                // Insert at specific line
                range = new window.monaco.Range(lastCodeUpdate.startLine, 1, lastCodeUpdate.startLine, 1);
            } else {
                // Append to end
                const lineCount = model.getLineCount();
                const lastLineLen = model.getLineMaxColumn(lineCount);
                range = new window.monaco.Range(lineCount, lastLineLen, lineCount, lastLineLen);
                lastCodeUpdate.code = '\n' + lastCodeUpdate.code;
            }

            editor.executeEdits('ai-update', [{
                range: range,
                text: lastCodeUpdate.code,
                forceMoveMarkers: true
            }]);

            // Push the updated code to React state so it stays synced
            setCode(model.getValue());
            setLastProcessedCodeUpdate(lastCodeUpdate);
        }
    }, [aiActions, lastProcessedCodeUpdate]);

    // ── Code Execution & Results ──
    const [runResults, setRunResults] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [submitProgress, setSubmitProgress] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [consoleOpen, setConsoleOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // ── Layout ──
    const [leftWidth, setLeftWidth] = useState(340);
    const [rightWidth, setRightWidth] = useState(380);
    const [isDraggingLeft, setIsDraggingLeft] = useState(false);
    const [isDraggingRight, setIsDraggingRight] = useState(false);

    // ── Score ──
    const [scoreReport, setScoreReport] = useState(null);

    // ── Refs ──
    const editorRef = useRef(null);
    const recognitionRef = useRef(null);
    const chatEndRef = useRef(null);
    const transcriptRef = useRef([]);
    const audioRef = useRef(null);        // ElevenLabs current audio element
    const interviewStartTimeRef = useRef(null);
    const femaleVideoRef = useRef(null);   // female_speak1 video element
    const maleVideoRef = useRef(null);   // male_speak1 video element
    const audioCtxRef = useRef(null);    // Web Audio context
    const analyserRef = useRef(null);    // AnalyserNode for amplitude reading
    const rafRef = useRef(null);    // requestAnimationFrame id

    // ── Interview history (for setup screen) ──
    const [pastInterviews, setPastInterviews] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [submissionCount, setSubmissionCount] = useState(0);
    const [transcriptOpen, setTranscriptOpen] = useState(false);

    // ─── Load problems ──────────────────────────────────────────────────────
    useEffect(() => {
        setProblemsLoading(true);
        fetch('https://leetcode-orchestration-55z3.onrender.com/api/problems?page=1&limit=50')
            .then(r => r.json())
            .then(d => { if (d.data) setProblems(d.data); })
            .catch(console.error)
            .finally(() => setProblemsLoading(false));
    }, []);

    // ─── Resume Existing Interview Initialization ──────────────────────────
    useEffect(() => {
        if (urlId && currentUser && appPhase === 'setup') {
            fetch(`https://leetcode-orchestration-55z3.onrender.com/api/interviews/detail/${urlId}`)
                .then(r => r.json())
                .then(iv => {
                    if (iv.error) return;

                    // Populate state from saved interview
                    setRole(iv.role);
                    setCompany(iv.company);
                    setLanguage(iv.language);
                    setCode(iv.finalCode || '');
                    setTranscript(iv.transcript || []);
                    setSessionId(urlId); // Reconnect RTDB

                    if (iv.problemId) {
                        setSelectedProblem({ id: iv.problemId, title: iv.problemTitle, difficulty: iv.problemDifficulty });
                    }
                    if (iv.problemData) {
                        setProblemData(iv.problemData);
                    } else if (iv.problemId) {
                        fetch('https://leetcode-orchestration-55z3.onrender.com/api/generate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ problemStatement: iv.problemTitle, language: iv.language || 'python', problemId: iv.problemId })
                        })
                            .then(r => r.json())
                            .then(data => { if (!data.error) setProblemData(data); })
                            .catch(err => console.error("Fallback problem fetch failed:", err));
                    }

                    // Deduce phase from transcript or default
                    const lastMsg = (iv.transcript || []).find(m => m.phase);
                    if (lastMsg) setInterviewPhase(lastMsg.phase);

                    // If it was already completed, jump to score
                    if (iv.status === 'completed' && iv.scoreReport) {
                        setScoreReport(iv.scoreReport);
                        setAppPhase('score');
                    } else {
                        // Otherwise, drop them right back into the interview
                        setAppPhase('interview');
                        interviewStartTimeRef.current = Date.now() - ((iv.durationMinutes || 0) * 60000);
                    }
                })
                .catch(console.error);
        }
    }, [urlId, currentUser, appPhase]);

    // Refetch when search changes
    useEffect(() => {
        const t = setTimeout(() => {
            fetch(`https://leetcode-orchestration-55z3.onrender.com/api/problems?page=1&limit=50&search=${encodeURIComponent(problemSearch)}`)
                .then(r => r.json())
                .then(d => { if (d.data) setProblems(d.data); })
                .catch(console.error);
        }, 300);
        return () => clearTimeout(t);
    }, [problemSearch]);

    // Keep transcriptRef in sync
    useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

    // Fetch past interviews for history panel
    useEffect(() => {
        if (!currentUser) return;
        setHistoryLoading(true);
        fetch(`https://leetcode-orchestration-55z3.onrender.com/api/interviews/${currentUser.uid}`)
            .then(r => r.json())
            .then(d => setPastInterviews(d.interviews || []))
            .catch(console.error)
            .finally(() => setHistoryLoading(false));
    }, [currentUser]);

    // ─── Auto-Save Ongoing Interview ────────────────────────────────────────
    useEffect(() => {
        // Only auto-save if we are actively in an interview, have a valid urlId (from navigation), and aren't evaluating yet
        if (appPhase !== 'interview' || !urlId || !currentUser) return;

        const timer = setTimeout(() => {
            fetch('https://leetcode-orchestration-55z3.onrender.com/api/interviews/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: urlId, // Passing ID triggers an upsert in the backend
                    userId: currentUser.uid,
                    role, company, language,
                    problemId: selectedProblem?.id,
                    problemTitle: selectedProblem?.title || problemData?.problem?.title,
                    problemDifficulty: selectedProblem?.difficulty || problemData?.problem?.difficulty,
                    problemData: problemData,
                    finalCode: code,
                    transcript: transcriptRef.current,
                    submissionCount,
                    durationMinutes: interviewStartTimeRef.current
                        ? Math.round((Date.now() - interviewStartTimeRef.current) / 60000)
                        : 0
                })
            }).catch(err => console.error("Auto-save failed:", err));
        }, 2000); // 2 second debounce

        return () => clearTimeout(timer);
    }, [urlId, currentUser, appPhase, transcript, code, interviewPhase, submissionCount, problemData]);

    // ─── Sarvam AI TTS ──────────────────────────────────────────────────────

    /** Stop running RAF loop + close AudioContext + pause audio */
    const stopCurrentSpeech = () => {
        // Cancel amplitude-sync loop
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }

        // Close Web Audio pipeline
        if (analyserRef.current) { try { analyserRef.current.disconnect(); } catch (_) { } analyserRef.current = null; }
        if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch (_) { } audioCtxRef.current = null; }

        // Stop the audio element
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }

        // Reset both video refs to idle
        [femaleVideoRef, maleVideoRef].forEach(ref => {
            if (ref.current) {
                ref.current.pause();
                ref.current.playbackRate = 1;
                ref.current.currentTime = 0;
            }
        });

        setIsSpeaking(false);
    };

    /**
     * Starts a requestAnimationFrame loop that reads the RMS amplitude of the
     * ElevenLabs audio and maps it to femaleVideoRef.current.playbackRate.
     *
     * Rate mapping (smoothed):
     *   silence  (rms ≈ 0)   → 0.4×  (slow crawl between words)
     *   normal speech         → ~1.0×
     *   loud / emphasis       → up to 2.0×
     */
    const startVideoSync = (audio, videoRef) => {
        const video = (videoRef || femaleVideoRef).current;
        if (!video) return;

        // ── Build Web Audio pipeline ──────────────────────────
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;

        const source = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;                    // small = fast update
        analyser.smoothingTimeConstant = 0;        // we do own smoothing
        analyserRef.current = analyser;

        source.connect(analyser);
        analyser.connect(ctx.destination);         // still hear audio

        const bufLen = analyser.frequencyBinCount; // 128 bins
        const dataArr = new Uint8Array(bufLen);

        let smoothedRate = 1.0;                    // exponential smoother
        const ALPHA = 0.15;                        // lower = more smoothing

        const loop = () => {
            if (!analyserRef.current) return;      // stopped

            analyser.getByteTimeDomainData(dataArr);

            // RMS of the waveform (0–128 centred around 128)
            let sumSq = 0;
            for (let i = 0; i < bufLen; i++) {
                const v = (dataArr[i] - 128) / 128; // normalise to [-1, 1]
                sumSq += v * v;
            }
            const rms = Math.sqrt(sumSq / bufLen);  // 0 … 1

            // Map rms → target playback rate
            //   0.00 → 0.40  (complete silence / pause between words)
            //   0.05 → ~0.7  (very soft)
            //   0.20 → 1.0   (normal conversational volume)
            //   0.50 → ~1.6
            //   1.00 → 2.00  (clamp ceiling)
            const targetRate = Math.min(2.0, 0.4 + rms * 3.2);

            // Smooth to avoid jarring jumps
            smoothedRate = smoothedRate + ALPHA * (targetRate - smoothedRate);

            if (video && !video.paused) {
                video.playbackRate = smoothedRate;
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
    };

    /**
     * PRIMARY TTS — Sarvam AI (streaming).
     * Uses speaker mapped from selectedVoice.speaker (manan/ratan/rohan/shreya/roopa).
     * Streams MP3 via MediaSource API so audio starts immediately as chunks arrive.
     * Falls back to raw speechSynthesis if Sarvam fails.
     */
    const speakWithSarvam = async (text) => {
        if (!ttsEnabled || !text?.trim()) return;
        stopCurrentSpeech();
        setIsSpeaking(true);
        setIsListening(false);
        if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch (_) { } }

        const speaker = selectedVoice.speaker || 'manan';
        const gender = selectedVoice.gender || 'Male';

        const onDone = () => {
            setIsSpeaking(false);
            [femaleVideoRef, maleVideoRef].forEach(ref => {
                if (ref.current) {
                    ref.current.pause();
                    ref.current.playbackRate = 1;
                    ref.current.currentTime = 0;
                }
            });
        };

        try {
            const res = await fetch('https://leetcode-orchestration-55z3.onrender.com/api/sarvam/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text.trim(), speaker })
            });

            if (!res.ok) throw new Error(`Sarvam TTS ${res.status}`);

            let audio;

            // ── Option 1: MediaSource streaming (audio plays as chunks arrive) ──
            if (window.MediaSource && MediaSource.isTypeSupported('audio/mpeg')) {
                audio = new Audio();
                const mediaSource = new MediaSource();
                audio.src = URL.createObjectURL(mediaSource);
                audioRef.current = audio;

                await new Promise((resolve, reject) => {
                    mediaSource.addEventListener('sourceopen', async () => {
                        try {
                            const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
                            const reader = res.body.getReader();

                            // Start playing as soon as we have the first chunk
                            let playStarted = false;

                            while (true) {
                                const { done, value } = await reader.read();
                                if (done) { mediaSource.endOfStream(); break; }

                                // Wait for buffer to be ready
                                if (sourceBuffer.updating) {
                                    await new Promise(r => sourceBuffer.addEventListener('updateend', r, { once: true }));
                                }
                                sourceBuffer.appendBuffer(value);

                                if (!playStarted) {
                                    playStarted = true;
                                    audio.play().then(() => {
                                        // Video + amplitude sync — jessica uses female, rohan uses male
                                        if (selectedVoice.id === 'jessica' && femaleVideoRef.current) {
                                            femaleVideoRef.current.play().catch(() => { });
                                            startVideoSync(audio, femaleVideoRef);
                                        } else if (selectedVoice.gender === 'Male' && maleVideoRef.current) {
                                            maleVideoRef.current.play().catch(() => { });
                                            startVideoSync(audio, maleVideoRef);
                                        }
                                    }).catch(reject);
                                }
                            }
                            resolve();
                        } catch (e) { reject(e); }
                    }, { once: true });
                });

                audio.onended = () => {
                    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
                    if (analyserRef.current) { try { analyserRef.current.disconnect(); } catch (_) { } analyserRef.current = null; }
                    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch (_) { } audioCtxRef.current = null; }
                    audioRef.current = null;
                    onDone();
                };

            } else {
                // ── Option 2: Collect all chunks then play ──
                const chunks = [];
                const reader = res.body.getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                }
                const blob = new Blob(chunks, { type: 'audio/mpeg' });
                const url = URL.createObjectURL(blob);
                audio = new Audio(url);
                audioRef.current = audio;

                const cleanup = () => {
                    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
                    if (analyserRef.current) { try { analyserRef.current.disconnect(); } catch (_) { } analyserRef.current = null; }
                    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch (_) { } audioCtxRef.current = null; }
                    URL.revokeObjectURL(url);
                    audioRef.current = null;
                    onDone();
                };
                audio.onended = cleanup;
                audio.onerror = cleanup;

                await audio.play();

                if (selectedVoice.id === 'jessica' && femaleVideoRef.current) {
                    femaleVideoRef.current.play().catch(() => { });
                    startVideoSync(audio, femaleVideoRef);
                } else if (selectedVoice.gender === 'Male' && maleVideoRef.current) {
                    maleVideoRef.current.play().catch(() => { });
                    startVideoSync(audio, maleVideoRef);
                }
            }

            return; // Sarvam handled it

        } catch (err) {
            console.warn('Sarvam TTS failed, using browser speechSynthesis:', err.message);
        }

        // ── Last resort: browser speechSynthesis ─────────────────────
        if (!window.speechSynthesis) { onDone(); return; }
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.0;
        utter.pitch = gender === 'Female' ? 1.1 : 0.9;
        utter.volume = 1;
        const voices = window.speechSynthesis.getVoices();
        const picked = gender === 'Female'
            ? voices.find(v => v.lang.startsWith('en') && /female|samantha|zira|karen|victoria/i.test(v.name))
            : voices.find(v => v.lang.startsWith('en') && /male|david|alex/i.test(v.name));
        if (picked) utter.voice = picked || voices.find(v => v.lang.startsWith('en'));
        utter.onend = onDone;
        utter.onerror = onDone;
        window.speechSynthesis.speak(utter);
    };


    // Scroll chat to bottom

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [transcript]);

    // ─── Resizer logic ──────────────────────────────────────────────────────
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDraggingLeft) setLeftWidth(prev => Math.max(260, Math.min(500, prev + e.movementX)));
            if (isDraggingRight) setRightWidth(prev => Math.max(280, Math.min(500, prev - e.movementX)));
        };
        const handleMouseUp = () => { setIsDraggingLeft(false); setIsDraggingRight(false); };
        if (isDraggingLeft || isDraggingRight) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingLeft, isDraggingRight]);

    // ─── Web Speech Recognition setup ──────────────────────────────────────
    const userInputRef = useRef(userInput);
    useEffect(() => { userInputRef.current = userInput; }, [userInput]);

    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let sessionTranscript = '';

        recognition.onstart = () => {
            sessionTranscript = userInputRef.current ? userInputRef.current + ' ' : '';
        };

        recognition.onresult = (e) => {
            let finalForSession = '';
            let interim = '';
            for (let i = 0; i < e.results.length; i++) {
                if (e.results[i].isFinal) finalForSession += e.results[i][0].transcript + ' ';
                else interim += e.results[i][0].transcript;
            }
            setUserInput((sessionTranscript + finalForSession + interim).trimStart());
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = () => {
            setIsListening(false);
        };
        recognitionRef.current = recognition;
        return () => recognition.abort();
    }, [appPhase]);

    // ─── Code analysis (triggered after 3s of no typing) ───────────────────
    const scheduleAnalysis = useCallback((currentCode) => {
        if (analysisTimer) clearTimeout(analysisTimer);
        if (!problemData || !currentCode || currentCode.length < 20 || appPhase !== 'interview') return;
        const timer = setTimeout(async () => {
            try {
                const res = await fetch('https://leetcode-orchestration-55z3.onrender.com/api/interview/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: currentCode, language, problem: problemData.problem })
                });
                const analysis = await res.json();
                if (!analysis.error) setLiveAnalysis(analysis);
            } catch { /* silent fail */ }
        }, 3000);
        setAnalysisTimer(timer);
    }, [analysisTimer, problemData, language, appPhase]);

    // ─── Run and Submit Handlers ─────────────────────────────────────────────
    const getWrapper = () => problemData?.wrapper ? problemData.wrapper : (LANGUAGE_WRAPPERS[language] || '');

    const handleRun = async () => {
        if (!currentUser) {
            navigate('/login?redirect=/aiinterview');
            return;
        }
        const primaryCases = problemData?.primaryTestCases || [];
        if (!primaryCases.length) { alert('No test cases available to run.'); return; }
        setIsRunning(true);
        setRunResults(null);
        setSubmitResult(null);
        setSubmissionCount(c => c + 1);
        setConsoleOpen(true);
        try {
            const fullCode = code + '\n' + getWrapper();
            const res = await fetch('https://leetcode-orchestration-55z3.onrender.com/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: fullCode, language, testCases: primaryCases })
            });
            const data = await res.json();
            setRunResults(data.results || []);
        } catch {
            setRunResults([{ success: false, output: '', error: 'Connection failed.' }]);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!currentUser) {
            navigate('/login?redirect=/aiinterview');
            return;
        }
        const primaryCases = problemData?.primaryTestCases || [];
        const submitCases = problemData?.submitTestCases || [];
        const allCases = [...primaryCases, ...submitCases];
        if (!allCases.length) { alert('No test cases available to submit.'); return; }

        setIsSubmitting(true);
        setRunResults(null);
        setSubmitResult(null);
        setSubmitProgress(null);
        setSubmissionCount(c => c + 1);
        setConsoleOpen(true);
        try {
            const fullCode = code + '\n' + getWrapper();
            const res = await fetch('https://leetcode-orchestration-55z3.onrender.com/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: fullCode, language, testCases: allCases })
            });

            if (!res.ok) throw new Error("HTTP error " + res.status);

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                let boundary = buffer.indexOf('\n\n');

                while (boundary !== -1) {
                    const eventString = buffer.slice(0, boundary);
                    buffer = buffer.slice(boundary + 2);

                    if (eventString.startsWith('data: ')) {
                        const data = JSON.parse(eventString.slice(6));

                        if (data.type === 'progress') {
                            setSubmitProgress({ passed: data.passed, total: data.total });
                        } else if (data.type === 'done') {
                            setSubmitResult(data);
                            setSubmitProgress(null);
                            // Report execution event to AI interviewer quietly so it knows the user submitted code
                            sendAiMessage(interviewPhase, transcriptRef.current, code, `User submitted code to the compiler and scored: ${data.accepted ? 'Accepted (Pass)' : 'Rejected (Fail)'}. Tell them the result of their submission.`);
                        } else if (data.type === 'error') {
                            throw new Error(data.error);
                        }
                    }
                    boundary = buffer.indexOf('\n\n');
                }
            }
        } catch {
            setSubmitResult({ accepted: false, failedLabel: 'Connection Error', results: [] });
            setSubmitProgress(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Start Interview ────────────────────────────────────────────────────
    const handleStartInterview = async () => {
        if (!currentUser) {
            navigate('/login?redirect=/aiinterview');
            return;
        }

        if (!selectedProblem) { setSetupError('Please select a problem.'); return; }
        if (!role.trim()) { setSetupError('Please enter a job role.'); return; }
        if (!company.trim()) { setSetupError('Please enter a company name.'); return; }
        setSetupError('');
        setIsLoadingProblem(true);
        setAppPhase('starting');

        try {
            // Load AI boilerplate + test cases for the problem
            const res = await fetch('https://leetcode-orchestration-55z3.onrender.com/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problemStatement: selectedProblem.description,
                    language,
                    problemId: selectedProblem.id
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setProblemData(data);
            const boilerplate = data.code || LANGUAGE_TEMPLATES[language];
            setAiCode(boilerplate);
            setCode(boilerplate);
            setTranscript([]);

            // Immediately create the Firestore document to reserve an ID
            const initRes = await fetch('https://leetcode-orchestration-55z3.onrender.com/api/interviews/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    role, company, language,
                    problemId: selectedProblem.id,
                    problemTitle: selectedProblem.title,
                    problemDifficulty: selectedProblem.difficulty,
                    problemData: data,
                    finalCode: boilerplate,
                    transcript: []
                })
            });
            const initData = await initRes.json();
            const initSessionId = initData.id || uuidv4(); // fallback just in case

            // Set up Realtime DB sync session and update URL seamlessly
            setSessionId(initSessionId);
            navigate(`/aiinterview/${initSessionId}`, { replace: true });

            setInterviewPhase('opening');
            setPhaseIndex(0);
            setLiveAnalysis(null);
            setSubmissionCount(0);
            interviewStartTimeRef.current = Date.now();
            setAppPhase('interview');

            // AI opens the interview
            setTimeout(() => sendAiMessage('opening', [], boilerplate), 500);
        } catch (err) {
            setSetupError('Failed to load problem: ' + err.message);
            setAppPhase('setup');
        } finally {
            setIsLoadingProblem(false);
        }
    };

    // ─── AI sends a message ─────────────────────────────────────────────────
    const sendAiMessage = async (phase, currentTranscript, currentCode, systemPromptOverride = null) => {
        setIsAiThinking(true);
        try {
            const bodyPayload = {
                problem: problemData?.problem || { title: selectedProblem?.title, description: selectedProblem?.description, difficulty: selectedProblem?.difficulty, constraints: [] },
                role, company, interviewPhase: phase,
                transcript: currentTranscript,
                currentCode: currentCode || code, language,
                sessionId
            };
            if (systemPromptOverride) {
                bodyPayload.systemPromptOverride = systemPromptOverride;
            }

            const res = await fetch('https://leetcode-orchestration-55z3.onrender.com/api/interview/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Parse JSON envelope {text, nextPhase} from AI
            let speakableText = data.text;
            let aiNextPhase = null;
            try {
                // AI returns a JSON string; strip markdown blocks then try to parse it
                const cleanedResponse = data.text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
                const parsed = JSON.parse(cleanedResponse);
                if (parsed && typeof parsed.text === 'string') {
                    speakableText = parsed.text;
                    if (parsed.nextPhase && typeof parsed.nextPhase === 'string'
                        && INTERVIEW_PHASES.includes(parsed.nextPhase)) {
                        aiNextPhase = parsed.nextPhase;
                    }
                }
            } catch {
                // AI returned plain text (fallback) — use as-is
            }

            // Absolutely completely forbid phase advance if the candidate hasn't said a single word yet
            if (currentTranscript.length === 0) {
                aiNextPhase = null;
            }

            // Artificial 'thinking' delay based on text length (min 1.5s, max 4s)
            const thinkingDelayMs = Math.min(4000, Math.max(1500, (speakableText?.length || 50) * 15));

            setTimeout(() => {
                const aiMsg = { role: 'ai', text: speakableText, timestamp: Date.now() };
                const newTranscript = [...currentTranscript, aiMsg];
                setTranscript(newTranscript);
                transcriptRef.current = newTranscript;

                // AI-controlled phase transition
                if (aiNextPhase) {
                    if (aiNextPhase === 'end') {
                        // Automatically trigger end interview eval when AI hits 'end' phase
                        setInterviewPhase('end');
                        setTimeout(() => handleEndInterview(), 3000); // 3 second delay to let the goodbye message finish playing
                    } else {
                        const nextIdx = INTERVIEW_PHASES.indexOf(aiNextPhase);
                        const currentIdx = INTERVIEW_PHASES.indexOf(phase);
                        if (nextIdx > currentIdx) {
                            setPhaseIndex(nextIdx);
                            setInterviewPhase(aiNextPhase);
                        }
                    }
                }

                // Speak the natural-language part only
                setIsAiThinking(false);
                if (speakableText?.trim()) {
                    speakWithSarvam(speakableText.trim());
                }
            }, thinkingDelayMs);

        } catch (err) {
            setIsAiThinking(false);
            const errMsg = { role: 'ai', text: 'I had trouble responding. Please try again.', timestamp: Date.now() };
            setTranscript(prev => [...prev, errMsg]);
        }
    };

    // ─── Handle user speech/text ────────────────────────────────────────────
    const handleUserSpeech = async (text) => {
        if (!text.trim()) return;
        stopCurrentSpeech();
        const userMsg = { role: 'user', text: text.trim(), timestamp: Date.now() };
        const newTranscript = [...transcriptRef.current, userMsg];
        setTranscript(newTranscript);
        transcriptRef.current = newTranscript;
        await sendAiMessage(interviewPhase, newTranscript, code);
    };

    // ─── Toggle mic ─────────────────────────────────────────────────────────
    const toggleMic = () => {
        if (!recognitionRef.current) { alert('Speech recognition not supported in this browser. Use Chrome or Edge.'); return; }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            stopCurrentSpeech();
            try { recognitionRef.current.start(); } catch (e) { }
            setIsListening(true);
        }
    };

    // ─── Send typed message ──────────────────────────────────────────────────
    const handleSendText = async () => {
        if (!userInput.trim() || isAiThinking) return;
        const text = userInput.trim();
        setUserInput('');
        await handleUserSpeech(text);
    };

    // ─── Interrupt AI ────────────────────────────────────────────────────────
    const handleInterruptAI = () => {
        if (!isSpeaking) return;
        stopCurrentSpeech();
        const interruptMsg = { role: 'user', text: '(Candidate interrupted the interviewer)', timestamp: Date.now(), isSystem: true };
        const newTranscript = [...transcriptRef.current, interruptMsg];
        setTranscript(newTranscript);
        transcriptRef.current = newTranscript;
        // Do not immediately send to AI; let the user actually speak their thought now
        toggleMic();
    };

    // advancePhase is now AI-controlled — no user button

    // ─── End interview → evaluate ────────────────────────────────────────────
    const handleEndInterview = async () => {
        stopCurrentSpeech();
        if (recognitionRef.current) recognitionRef.current.abort();
        setIsListening(false);
        setAppPhase('evaluating');
        try {
            const res = await fetch('https://leetcode-orchestration-55z3.onrender.com/api/interview/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problem: problemData?.problem || { title: selectedProblem?.title, description: selectedProblem?.description, difficulty: selectedProblem?.difficulty },
                    role, company,
                    transcript: transcriptRef.current,
                    finalCode: code, language
                })
            });
            const report = await res.json();
            if (report.error) throw new Error(report.error);
            setScoreReport(report);
            // Save interview to Firestore
            const durationMins = interviewStartTimeRef.current
                ? Math.round((Date.now() - interviewStartTimeRef.current) / 60000)
                : 0;
            if (currentUser) {
                fetch('https://leetcode-orchestration-55z3.onrender.com/api/interviews/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: currentUser.uid,
                        role, company, language,
                        problemId: selectedProblem?.id,
                        problemTitle: selectedProblem?.title || problemData?.problem?.title,
                        problemDifficulty: selectedProblem?.difficulty || problemData?.problem?.difficulty,
                        problemData: problemData,
                        finalCode: code,
                        transcript: transcriptRef.current,
                        scoreReport: report,
                        submissionCount,
                        durationMinutes: durationMins
                    })
                }).then(r => r.json()).then(saved => {
                    // refresh history
                    fetch(`https://leetcode-orchestration-55z3.onrender.com/api/interviews/${currentUser.uid}`)
                        .then(r2 => r2.json()).then(d => setPastInterviews(d.interviews || []));
                }).catch(console.error);
            }
            setAppPhase('score');
        } catch (err) {
            alert('Evaluation failed: ' + err.message);
            setAppPhase('interview');
        }
    };

    // ─── Filtered problems for setup ──────────────────────────────────────────
    const filteredProblems = problems.filter(p =>
        !problemSearch ||
        p.title?.toLowerCase().includes(problemSearch.toLowerCase()) ||
        p.related_topics?.toLowerCase().includes(problemSearch.toLowerCase())
    );

    // ─── Delete & Restart ───────────────────────────────────────────────────
    const handleDeleteInterview = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this interview history?")) return;
        try {
            await fetch(`https://leetcode-orchestration-55z3.onrender.com/api/interviews/${id}`, { method: 'DELETE' });
            setPastInterviews(prev => prev.filter(iv => iv.id !== id));
        } catch (err) {
            alert("Failed to delete interview.");
        }
    };

    const handleRestartInterview = (iv, e) => {
        e.stopPropagation();
        if (!window.confirm("Restart this interview? This will prep the setup page with the same role and problem.")) return;
        setRole(iv.role || '');
        setCompany(iv.company || '');
        setLanguage(iv.language || 'python');
        if (iv.problemId) {
            setSelectedProblem({ id: iv.problemId, title: iv.problemTitle, difficulty: iv.problemDifficulty });
        }
        setAppPhase('setup');
        navigate('/aiinterview', { replace: true });
    };

    // ─── Render: SETUP ────────────────────────────────────────────────────────
    if (appPhase === 'setup') {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#050505',
                backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* ── Top Nav ──────────── */}
                <nav style={{
                    height: '56px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 1.25rem',
                    background: 'rgba(5, 5, 5, 0.8)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    zIndex: 40,
                    color: 'var(--txt)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <img src="/logo.jpeg" alt="CodeArena" style={{ height: '24px', width: '24px', borderRadius: '6px', objectFit: 'contain' }} />
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            CodeArena AI Interview
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => navigate('/dsaquestion')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>Problems</button>
                        <button onClick={() => navigate('/aiinterviewselect')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>AI Interview</button>
                        <button onClick={() => navigate('/systemdesign')} style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>System Design</button>
                    </div>

                    <NavProfile />
                </nav>

                <div className="setup-container" style={{ flex: 1, display: 'flex' }}>
                    {/* LEFT SIDEBAR: Past Interviews (Desktop only, hides or stacks on mobile) */}
                    {currentUser && (
                        <div className="setup-sidebar" style={{ width: '300px', flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <History size={18} color="var(--ai)" />
                                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--txt)' }}>Past Interviews</span>
                                    {pastInterviews.length > 0 && (
                                        <span style={{ fontSize: '0.72rem', background: 'var(--ai-dim)', color: 'var(--ai)', borderRadius: '99px', padding: '1px 8px', fontWeight: 600 }}>
                                            {pastInterviews.length}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {historyLoading ? (
                                    <div style={{ color: 'var(--txt3)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', padding: '2rem 0' }}>
                                        <Loader2 size={16} className="spin" /> Loading history…
                                    </div>
                                ) : pastInterviews.length === 0 ? (
                                    <div style={{ color: 'var(--txt3)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 1rem' }}>
                                        No past interviews found. Start your first session!
                                    </div>
                                ) : (
                                    pastInterviews.map(iv => {
                                        const score = iv.overallScore;
                                        const scoreColor = score >= 75 ? '#00b8a3' : score >= 50 ? '#ffa116' : '#ef4743';
                                        const hire = iv.scoreReport?.hire || '';
                                        const hireShort = hire.includes('Strong Hire') ? 'Strong Hire' : hire.includes('No Hire') ? 'No Hire' : hire.includes('Hire') ? 'Hire' : '-';
                                        const hireColor = hireShort === 'Strong Hire' ? '#00b8a3' : hireShort === 'No Hire' ? '#ef4743' : '#ffa116';
                                        const date = iv.createdAt ? new Date(iv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
                                        const diffColor = { Easy: '#00b8a3', Medium: '#ffa116', Hard: '#ef4743' }[iv.problemDifficulty] || 'var(--txt3)';
                                        return (
                                            <div key={iv.id} onClick={() => navigate(iv.status === 'in-progress' ? `/aiinterview/${iv.id}` : `/evaluation/${iv.id}`)} style={{
                                                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem',
                                                display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ai)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                            <User size={13} color="var(--ai)" />
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--txt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{iv.role || 'Unknown Role'}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <Building size={12} color="var(--txt3)" />
                                                            <span style={{ fontSize: '0.78rem', color: 'var(--txt2)' }}>{iv.company || '-'}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '4px', opacity: 0.7 }}>
                                                        <button onClick={(e) => handleRestartInterview(iv, e)} title="Restart Interview" style={{ background: 'transparent', border: 'none', color: 'var(--txt2)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                            <RefreshCcw size={14} />
                                                        </button>
                                                        <button onClick={(e) => handleDeleteInterview(iv.id, e)} title="Delete Interview" style={{ background: 'transparent', border: 'none', color: 'var(--fail)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 71, 67, 0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--txt2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: 'var(--surface2)', padding: '6px 8px', borderRadius: '6px', marginBottom: '4px' }} title={iv.problemTitle}>
                                                    {iv.problemTitle || 'Unknown'}
                                                    {iv.problemDifficulty && <span style={{ marginLeft: '6px', color: diffColor, fontWeight: 600 }}>{iv.problemDifficulty}</span>}
                                                </div>

                                                {iv.status === 'in-progress' ? (
                                                    <div style={{ marginTop: '4px', padding: '6px 0', borderTop: '1px dashed var(--border)' }}>
                                                        <button style={{ width: '100%', background: 'var(--ai)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 0', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                            <Play size={12} fill="currentColor" /> Resume
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                                                            {score != null ? score : '-'}
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--txt3)', fontWeight: 500, marginLeft: '2px' }}>/100</span>
                                                        </div>
                                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, background: hireColor + '22', color: hireColor, padding: '3px 10px', borderRadius: '99px' }}>
                                                            {hireShort}
                                                        </span>
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--txt3)', marginTop: '2px' }}>
                                                    <span>{date}</span>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <span title="Duration"><Clock size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} />{iv.durationMinutes || 0}m</span>
                                                        <span title="Submissions"><Code2 size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} />{iv.submissionCount || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* MAIN CONTENT: Setup Form */}
                    <div className="setup-main" style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', width: '100%', overflowY: 'auto' }}>
                        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--txt)', marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '-0.02em' }}>AI Interview Setup</h1>
                            <p style={{ textAlign: 'center', color: 'var(--txt2)', fontSize: '0.95rem', marginBottom: '3rem' }}>Select a problem and tell us about your target role.</p>

                            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--txt)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Search size={20} color="var(--ai)" /> Search Problem
                                </h2>

                                <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                                    <Search size={18} color="var(--txt3)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="text"
                                        placeholder="Search LeetCode problems..."
                                        value={problemSearch}
                                        onChange={e => setProblemSearch(e.target.value)}
                                        style={{
                                            width: '100%', padding: '0.8rem 1rem 0.8rem 2.75rem',
                                            background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px',
                                            color: 'var(--txt)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s'
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'var(--ai)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                    />
                                </div>

                                <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg)' }}>
                                    {problemsLoading ? (
                                        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--txt3)', fontSize: '0.85rem' }}><Loader2 size={18} className="spin" /></div>
                                    ) : filteredProblems.length === 0 ? (
                                        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--txt3)', fontSize: '0.85rem' }}>No problems found.</div>
                                    ) : (
                                        filteredProblems.slice(0, 50).map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => setSelectedProblem(p)}
                                                style={{
                                                    padding: '0.8rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    cursor: 'pointer', borderBottom: '1px solid var(--border-soft)',
                                                    background: selectedProblem?.id === p.id ? 'var(--ai-dim)' : 'transparent',
                                                    borderLeft: selectedProblem?.id === p.id ? '4px solid var(--ai)' : '4px solid transparent',
                                                    transition: 'background 0.15s'
                                                }}
                                            >
                                                <span style={{ fontSize: '0.9rem', fontWeight: selectedProblem?.id === p.id ? 600 : 400, color: selectedProblem?.id === p.id ? 'var(--ai)' : 'var(--txt)' }}>{p.title}</span>
                                                <span style={{ fontSize: '0.78rem', fontWeight: 700, background: DIFFICULTY_COLOR[p.difficulty] + '22', color: DIFFICULTY_COLOR[p.difficulty], padding: '2px 8px', borderRadius: '4px' }}>{p.difficulty}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {selectedProblem && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: 'var(--ai-dim)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <CheckCircle2 size={14} color="var(--ai)" />
                                        <span style={{ fontSize: '0.82rem', color: 'var(--ai)' }}>Selected: <strong>{selectedProblem.title}</strong></span>
                                    </div>
                                )}
                            </div>

                            {/* ── Voice Template Selector ── */}
                            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                    <Volume2 size={17} color="var(--ai)" />
                                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--txt)' }}>AI Interviewer Voice</span>
                                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--txt3)' }}>Click to select · Preview to listen</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                                    {VOICE_TEMPLATES.map(voice => {
                                        const isSelected = selectedVoice.id === voice.id;
                                        const isPreviewing = previewLoading === voice.id;
                                        return (
                                            <div
                                                key={voice.id}
                                                onClick={() => setSelectedVoice(voice)}
                                                style={{
                                                    border: `1.5px solid ${isSelected ? 'var(--ai)' : 'var(--border)'}`,
                                                    borderRadius: '10px',
                                                    padding: '0.65rem 0.85rem',
                                                    cursor: 'pointer',
                                                    background: isSelected ? 'rgba(168,85,247,0.08)' : 'var(--bg)',
                                                    transition: 'all 0.18s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    userSelect: 'none'
                                                }}
                                            >
                                                <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>{voice.emoji}</span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isSelected ? 'var(--ai)' : 'var(--txt)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {voice.name}
                                                        {isSelected && <CheckCircle2 size={11} color="var(--ai)" style={{ marginLeft: '5px', verticalAlign: 'middle' }} />}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--txt3)', whiteSpace: 'nowrap' }}>{voice.accent} · <span style={{ color: 'var(--ai)', opacity: 0.85 }}>{voice.tag}</span></div>
                                                </div>
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (isPreviewing) return;
                                                        setPreviewLoading(voice.id);
                                                        try {
                                                            const res = await fetch('https://leetcode-orchestration-55z3.onrender.com/api/sarvam/tts', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ text: PREVIEW_TEXT, speaker: voice.speaker })
                                                            });
                                                            if (!res.ok) throw new Error('TTS failed');
                                                            // Stream the preview using MediaSource if available
                                                            if (window.MediaSource && MediaSource.isTypeSupported('audio/mpeg')) {
                                                                const audio = new Audio();
                                                                const ms = new MediaSource();
                                                                audio.src = URL.createObjectURL(ms);
                                                                ms.addEventListener('sourceopen', async () => {
                                                                    const sb = ms.addSourceBuffer('audio/mpeg');
                                                                    const reader = res.body.getReader();
                                                                    let started = false;
                                                                    while (true) {
                                                                        const { done, value } = await reader.read();
                                                                        if (done) { ms.endOfStream(); break; }
                                                                        if (sb.updating) await new Promise(r => sb.addEventListener('updateend', r, { once: true }));
                                                                        sb.appendBuffer(value);
                                                                        if (!started) { started = true; audio.play(); }
                                                                    }
                                                                }, { once: true });
                                                                audio.onended = () => setPreviewLoading(null);
                                                            } else {
                                                                const chunks = [];
                                                                const reader = res.body.getReader();
                                                                while (true) {
                                                                    const { done, value } = await reader.read();
                                                                    if (done) break;
                                                                    chunks.push(value);
                                                                }
                                                                const blob = new Blob(chunks, { type: 'audio/mpeg' });
                                                                const url = URL.createObjectURL(blob);
                                                                const audio = new Audio(url);
                                                                audio.onended = () => { URL.revokeObjectURL(url); setPreviewLoading(null); };
                                                                await audio.play();
                                                            }
                                                        } catch (err) {
                                                            console.error('Preview failed:', err);
                                                            setPreviewLoading(null);
                                                        }
                                                    }}
                                                    title="Preview voice"
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        width: '26px', height: '26px', borderRadius: '6px', flexShrink: 0,
                                                        background: isPreviewing ? 'var(--ai-dim)' : 'rgba(255,255,255,0.06)',
                                                        border: `1px solid ${isPreviewing ? 'var(--ai)' : 'rgba(255,255,255,0.1)'}`,
                                                        color: isPreviewing ? 'var(--ai)' : 'var(--txt3)',
                                                        cursor: isPreviewing ? 'not-allowed' : 'pointer',
                                                        transition: 'all 0.18s'
                                                    }}
                                                >
                                                    {isPreviewing ? <Loader2 size={11} className="spin" /> : <Play size={10} fill="currentColor" />}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--txt)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <User size={20} color="var(--ai)" /> Interview Context
                                </h2>
                                <p style={{ color: 'var(--txt2)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Configure your mock interview details.</p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--txt2)', marginBottom: '0.5rem', fontWeight: 600 }}>Job Role</label>
                                        <input type="text" placeholder="e.g. SDE-2, ML Engineer"
                                            value={role} onChange={e => setRole(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--txt)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                                            onFocus={e => e.target.style.borderColor = 'var(--ai)'}
                                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--txt2)', marginBottom: '0.5rem', fontWeight: 600 }}>Company</label>
                                        <input type="text" placeholder="e.g. Google, Startup"
                                            value={company} onChange={e => setCompany(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--txt)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }}
                                            onFocus={e => e.target.style.borderColor = 'var(--ai)'}
                                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                        />
                                    </div>
                                </div>

                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--txt2)', marginBottom: '0.5rem', fontWeight: 600 }}>Language</label>
                                <select value={language} onChange={e => setLanguage(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--txt)', fontSize: '0.9rem', outline: 'none', marginBottom: '2rem', cursor: 'pointer' }}>
                                    {Object.entries(LANG_OPTIONS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                </select>

                                {setupError && (
                                    <div style={{ marginBottom: '1.5rem', padding: '0.8rem 1rem', background: 'var(--fail-dim)', border: '1px solid rgba(239,71,67,0.3)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--fail)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <XCircle size={16} /> {setupError}
                                    </div>
                                )}

                                <button
                                    onClick={handleStartInterview}
                                    disabled={appPhase === 'starting'}
                                    style={{
                                        width: '100%', padding: '0.85rem 1rem',
                                        background: 'linear-gradient(135deg, var(--ai), #7c3aed)',
                                        color: '#fff', border: 'none', borderRadius: '12px',
                                        fontWeight: 700, fontSize: '1.05rem', cursor: appPhase === 'starting' ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                        opacity: appPhase === 'starting' ? 0.7 : 1,
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 20px rgba(168,85,247,0.4)',
                                        letterSpacing: '0.01em'
                                    }}
                                >
                                    {appPhase === 'starting' ? <><Loader2 size={18} className="spin" /> Preparing Interview...</> : <><Brain size={20} /> Start Simulation</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    // ─── Render: EVALUATING// ─── Render: EVALUATING ───────────────────────────────────────────────────
    if (appPhase === 'evaluating') {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#050505',
                backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)',
                gap: '1.5rem'
            }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--ai-dim)', border: '2px solid var(--ai)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 size={36} color="var(--ai)" className="spin" />
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Evaluating Your Interview...</h2>
                <p style={{ color: 'var(--txt2)', fontSize: '0.9rem' }}>Our AI is analyzing your performance. This may take a moment.</p>
            </div>
        );
    }

    // ─── Render: SCORE REPORT ─────────────────────────────────────────────────
    if (appPhase === 'score' && scoreReport) {
        const hireColor = scoreReport.hire?.includes('Strong Hire') ? '#00b8a3'
            : scoreReport.hire?.includes('No Hire') ? '#ef4743' : '#ffa116';
        const durationMins = interviewStartTimeRef.current
            ? Math.round((Date.now() - interviewStartTimeRef.current) / 60000)
            : 0;
        const aiQuestions = (transcriptRef.current || []).filter(m => m.role === 'ai').length;
        return (
            <div style={{
                minHeight: '100vh',
                background: '#050505',
                backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)',
                overflowY: 'auto',
                fontFamily: "'Inter', sans-serif"
            }}>
                {/* ── Header bar ── */}
                <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button onClick={() => { setAppPhase('setup'); setScoreReport(null); setTranscriptOpen(false); }}
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--txt2)', borderRadius: '8px', padding: '0.4rem 0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                        <ArrowLeft size={14} /> New Interview
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--txt3)' }}>{selectedProblem?.title}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--txt3)' }}>·</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--txt2)' }}>{role} @ {company}</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--txt3)' }}>{new Date().toLocaleDateString()}</span>
                </div>

                <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
                    {/* ── Stats row ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Overall Score', value: `${scoreReport.overallScore}/100`, color: scoreReport.overallScore >= 75 ? '#00b8a3' : scoreReport.overallScore >= 50 ? '#ffa116' : '#ef4743' },
                            { label: 'Run / Submits', value: submissionCount || durationMins > 0 ? submissionCount : '—', color: 'var(--ai)' },
                            { label: 'Duration', value: `${durationMins > 0 ? durationMins : '—'} min`, color: 'var(--txt)' },
                            { label: 'AI Questions', value: aiQuestions, color: 'var(--txt)' },
                        ].map(s => (
                            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--txt3)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── Score + Summary row ── */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        {/* Score ring + hire */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minWidth: '190px' }}>
                            <ScoreBadge score={scoreReport.overallScore} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: hireColor, background: hireColor + '18', padding: '4px 14px', borderRadius: '99px' }}>{scoreReport.hire}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--txt3)', marginTop: '6px' }}>Recommendation</div>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--txt3)', textAlign: 'center' }}>
                                {selectedProblem?.difficulty && (
                                    <span style={{ color: { Easy: '#00b8a3', Medium: '#ffa116', Hard: '#ef4743' }[selectedProblem.difficulty] || 'var(--txt3)', fontWeight: 600 }}>
                                        {selectedProblem.difficulty} •&nbsp;
                                    </span>
                                )}
                                {LANG_OPTIONS[language] || language}
                            </div>
                        </div>

                        {/* Summary + code analysis */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', flex: 1 }}>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Overall Assessment</h3>
                            <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: 'var(--txt)' }}>{scoreReport.summary}</p>
                            {scoreReport.codeAnalysis && (
                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,161,22,0.08)', border: '1px solid rgba(255,161,22,0.2)', borderRadius: '8px', fontSize: '0.83rem', color: 'var(--txt2)', lineHeight: 1.6, borderLeft: '3px solid var(--accent)' }}>
                                    <strong style={{ color: 'var(--accent)' }}>Code Review: </strong>{scoreReport.codeAnalysis}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Skills breakdown ── */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Skill Breakdown</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {Object.entries(scoreReport.skills || {}).map(([key, val]) => {
                                const Icon = SKILL_ICONS[key] || Star;
                                const barWidth = (val.score / 5) * 100;
                                const barCol = val.score >= 4 ? '#00b8a3' : val.score >= 3 ? '#ffa116' : '#ef4743';
                                return (
                                    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Icon size={14} color="var(--ai)" />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--txt)' }}>{SKILL_LABELS[key] || key}</span>
                                            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 700, color: barCol }}>{val.score}/5</span>
                                        </div>
                                        <div style={{ height: '5px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${barWidth}%`, background: barCol, borderRadius: '99px', transition: 'width 0.8s ease' }} />
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--txt2)' }}>{val.comment}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Strengths + Improvements ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#00b8a3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Strengths</h3>
                            {(scoreReport.strengths || []).map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '0.6rem', alignItems: 'flex-start' }}>
                                    <CheckCircle2 size={14} color="#00b8a3" style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--txt)', lineHeight: 1.5 }}>{s}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Areas to Improve</h3>
                            {(scoreReport.improvements || []).map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '0.6rem', alignItems: 'flex-start' }}>
                                    <Lightbulb size={14} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--txt)', lineHeight: 1.5 }}>{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Red flags ── */}
                    {scoreReport.redFlags?.length > 0 && (
                        <div style={{ background: 'rgba(239,71,67,0.07)', border: '1px solid rgba(239,71,67,0.3)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--fail)' }}>Red Flags</h3>
                            {scoreReport.redFlags.map((f, i) => (
                                <div key={i} style={{ fontSize: '0.83rem', color: 'var(--txt2)', marginBottom: '0.3rem' }}>• {f}</div>
                            ))}
                        </div>
                    )}

                    {/* ── Your Code ── */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Code2 size={15} color="var(--ai)" />
                                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--txt)' }}>Your Final Code</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--txt3)', background: 'rgba(255,255,255,0.07)', padding: '2px 10px', borderRadius: '6px' }}>{LANG_OPTIONS[language] || language}</span>
                        </div>
                        <div style={{ height: '320px', overflow: 'hidden' }}>
                            <Editor
                                value={code}
                                language={language === 'cpp' ? 'cpp' : language}
                                theme="vs-dark"
                                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on', scrollBeyondLastLine: false, wordWrap: 'on' }}
                            />
                        </div>
                    </div>

                    {/* ── Interview Transcript ── */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', marginBottom: '3rem' }}>
                        <button onClick={() => setTranscriptOpen(o => !o)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.25rem', background: 'rgba(255,255,255,0.03)', border: 'none', color: 'var(--txt)', cursor: 'pointer', borderBottom: transcriptOpen ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageSquare size={15} color="var(--ai)" />
                                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Interview Transcript</span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--txt3)', background: 'rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: '6px' }}>{transcriptRef.current.length} messages</span>
                            </div>
                            {transcriptOpen ? <ChevronUp size={16} color="var(--txt3)" /> : <ChevronDown size={16} color="var(--txt3)" />}
                        </button>
                        {transcriptOpen && (
                            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {(transcriptRef.current || []).map((msg, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, background: msg.role === 'ai' ? 'var(--ai-dim)' : 'rgba(255,255,255,0.08)', color: msg.role === 'ai' ? 'var(--ai)' : 'var(--txt2)' }}>
                                            {msg.role === 'ai' ? 'AI' : 'You'}
                                        </div>
                                        <div style={{ flex: 1, background: msg.role === 'ai' ? 'rgba(168,85,247,0.06)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.6rem 0.9rem' }}>
                                            <div style={{ fontSize: '0.82rem', color: msg.role === 'ai' ? 'var(--txt)' : 'var(--txt2)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                                            {msg.timestamp && (
                                                <div style={{ fontSize: '0.68rem', color: 'var(--txt3)', marginTop: '4px' }}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ─── Render: INTERVIEW ────────────────────────────────────────────────────
    const problemInfo = problemData?.problem || { title: selectedProblem?.title, description: selectedProblem?.description, difficulty: selectedProblem?.difficulty };

    return (
        <div className="lc-root">
            {/* ── Top Nav ──────────── */}
            <nav style={{
                height: '56px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 1.25rem',
                background: 'rgba(5, 5, 5, 0.8)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                zIndex: 40,
                color: 'var(--txt)',
                fontFamily: "\'Inter\', sans-serif"
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <img src="/logo.jpeg" alt="CodeArena" style={{ height: '24px', width: '24px', borderRadius: '6px', objectFit: 'contain' }} />
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            CodeArena AI
                        </span>
                    </div>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ai)', background: 'var(--ai-dim)', padding: '2px 8px', borderRadius: '4px' }}>
                            {role}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--txt3)' }}>@ {company}</span>
                    </div>
                </div>

                {/* Phase stepper */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {INTERVIEW_PHASES.map((p, i) => (
                        <div key={p} style={{
                            fontSize: '0.72rem', padding: '4px 12px', borderRadius: '999px', fontWeight: 600,
                            background: i === phaseIndex ? 'var(--ai)' : i < phaseIndex ? 'rgba(0,184,163,0.15)' : 'transparent',
                            color: i === phaseIndex ? '#fff' : i < phaseIndex ? '#00b8a3' : 'var(--txt3)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            whiteSpace: 'nowrap', cursor: 'default'
                        }}>
                            {PHASE_LABELS[p]}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {/* Profile hidden during interview as requested */}

                    {/* Timer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,161,22,0.15)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,161,22,0.3)', color: '#ffa116', fontWeight: 600, fontSize: '0.8rem', marginRight: '8px' }}>
                        <Clock size={13} /> {formatTime(interviewSeconds)}
                    </div>

                    {/* Whiteboard Toggle */}
                    <button onClick={() => setWhiteboardOpen(!whiteboardOpen)}
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontWeight: 600, background: whiteboardOpen ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.08)', border: `1px solid ${whiteboardOpen ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.15)'}`, color: whiteboardOpen ? '#60a5fa' : '#e8e8e8', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px', transition: 'all 0.2s' }}>
                        <LayoutTemplate size={14} /> Whiteboard
                    </button>

                    {/* Phase transitions are controlled by the AI */}
                    <button onClick={handleEndInterview}
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontWeight: 600, background: 'linear-gradient(135deg, #ef4743, #d93834)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 10px rgba(239,71,67,0.3)' }}>
                        <PhoneOff size={13} /> End Interview
                    </button>
                </div>
            </nav>

            {/* ── Main 3-column body ── */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* LEFT: Problem panel */}
                <div style={{ width: leftWidth, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, background: '#11131a' }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem' }}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.85rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '4px', background: (DIFFICULTY_COLOR[problemInfo.difficulty] || '#ffa116') + '22', color: DIFFICULTY_COLOR[problemInfo.difficulty] || '#ffa116' }}>
                                    {problemInfo.difficulty}
                                </span>
                                {(problemInfo.timeLimit || problemInfo.spaceLimit) && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={12} /> {problemInfo.timeLimit || '2s'}
                                    </span>
                                )}
                            </div>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.3, color: '#f0f0f0', marginBottom: '1rem', wordBreak: 'break-word', letterSpacing: '-0.01em' }}>
                                {problemInfo.title}
                            </h2>
                            <p style={{ fontSize: '0.92rem', color: '#c0c0c0', lineHeight: 1.75, marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                                {problemInfo.description}
                            </p>
                        </div>

                        {/* Examples */}
                        {problemData?.problem?.examples?.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {problemData.problem.examples.map((ex, i) => (
                                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.85rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Example {i + 1}
                                        </div>
                                        <div style={{ padding: '0.85rem', fontFamily: '\'JetBrains Mono\', monospace', fontSize: '0.82rem', color: '#d4d4d4', lineHeight: 1.6 }}>
                                            <div style={{ display: 'flex', gap: '8px' }}><span style={{ color: 'var(--txt3)', minWidth: '55px' }}>Input:</span> <span style={{ color: '#9cdcfe' }}>{ex.input}</span></div>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}><span style={{ color: 'var(--txt3)', minWidth: '55px' }}>Output:</span> <span style={{ color: '#ce9178' }}>{ex.output}</span></div>
                                            {ex.explanation && (
                                                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed rgba(255,255,255,0.1)', color: 'var(--txt2)', fontSize: '0.8rem', fontFamily: '\'Inter\', sans-serif' }}>
                                                    <strong>Explanation:</strong> {ex.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Constraints */}
                        {problemData?.problem?.constraints?.length > 0 && (
                            <div style={{ marginTop: '1.75rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt3)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Constraints</p>
                                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#a0a0a0', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                    {problemData.problem.constraints.map((c, i) => (
                                        <li key={i} style={{ marginBottom: '0.4rem' }}>
                                            <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', fontFamily: '\'JetBrains Mono\', monospace', fontSize: '0.8rem', color: '#dcdcaa' }}>{c}</code>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Live Code Analysis */}
                        {liveAnalysis && (
                            <div style={{ marginTop: '2rem', padding: '1rem', background: liveAnalysis.isOnRightTrack ? 'rgba(0,184,163,0.05)' : 'rgba(255,161,22,0.05)', border: `1px solid ${liveAnalysis.isOnRightTrack ? 'rgba(0,184,163,0.2)' : 'rgba(255,161,22,0.2)'}`, borderLeft: `3px solid ${liveAnalysis.isOnRightTrack ? '#00b8a3' : '#ffa116'}`, borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: liveAnalysis.isOnRightTrack ? '#00b8a3' : '#ffa116', marginBottom: '0.6rem', letterSpacing: '0.05em' }}>
                                    <Sparkles size={14} /> LIVE AI ANALYSIS
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#e0e0e0', lineHeight: 1.6 }}>
                                    {liveAnalysis.isOnRightTrack ? 'Your current approach looks structurally promising.' : (liveAnalysis.errorDescription || 'Review your logic. Your approach might need adjustment.')}
                                </p>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.8rem', fontSize: '0.75rem', color: 'var(--txt3)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Time: {liveAnalysis.complexity?.time || '—'}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={12} /> Space: {liveAnalysis.complexity?.space || '—'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Resizer left */}
                <div className="lc-resizer ai-resizer" onMouseDown={() => setIsDraggingLeft(true)} style={{ cursor: 'col-resize' }} />

                {/* CENTER: Code editor */}
                <div className="ai-mid-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: '#1e1e1e' }}>
                    {/* Editor toolbar */}
                    <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', background: 'rgba(30, 30, 30, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#858585', fontSize: '0.75rem', fontWeight: 600 }}>
                                <Code2 size={15} color="#00b8a3" /> Code Editor
                            </div>
                            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />
                            <select value={language} onChange={e => { setLanguage(e.target.value); setCode(aiCode || LANGUAGE_TEMPLATES[e.target.value]); }}
                                style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#cccccc', fontSize: '0.75rem', outline: 'none', cursor: 'pointer', fontFamily: '\'Inter\', sans-serif' }}>
                                {Object.entries(LANG_OPTIONS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button onClick={handleRun} disabled={isRunning || isSubmitting}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.35rem 0.85rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#e8e8e8', fontSize: '0.78rem', fontWeight: 500, cursor: (isRunning || isSubmitting) ? 'not-allowed' : 'pointer', opacity: (isRunning || isSubmitting) ? 0.6 : 1, transition: 'background 0.2s' }}>
                                {isRunning ? <Loader2 size={13} className="spin" color="#a855f7" /> : <Play size={13} color="#a855f7" />} Run Code
                            </button>
                            <button onClick={handleSubmit} disabled={isRunning || isSubmitting}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.35rem 0.85rem', background: 'rgba(0,184,163,0.15)', border: '1px solid rgba(0,184,163,0.3)', borderRadius: '6px', color: '#00b8a3', fontSize: '0.78rem', fontWeight: 600, cursor: (isRunning || isSubmitting) ? 'not-allowed' : 'pointer', opacity: (isRunning || isSubmitting) ? 0.6 : 1, transition: 'background 0.2s' }}>
                                {isSubmitting ? <Loader2 size={13} className="spin" /> : <Send size={13} />} Submit
                            </button>
                            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                            <button onClick={() => setCode(aiCode || LANGUAGE_TEMPLATES[language])}
                                style={{ padding: '0.3rem', background: 'transparent', border: 'none', borderRadius: '4px', color: '#858585', cursor: 'pointer' }} title="Reset Code">
                                <History size={15} />
                            </button>
                        </div>
                    </div>

                    {/* AI Banner Overlay */}
                    {activeBanner && (
                        <div style={{
                            position: 'absolute', top: 48, left: 0, right: 0, zIndex: 20,
                            background: activeBanner.level === 'warning' ? 'rgba(255, 161, 22, 0.95)' :
                                activeBanner.level === 'success' ? 'rgba(0, 184, 163, 0.95)' : 'rgba(59, 130, 246, 0.95)',
                            color: '#fff', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}>
                            {activeBanner.level === 'warning' ? <AlertCircle size={16} /> :
                                activeBanner.level === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
                            {activeBanner.text}
                            <button onClick={() => setActiveBanner(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                        <Editor
                            language={language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language}
                            value={code}
                            theme="vs-dark"
                            onChange={(val) => { setCode(val || ''); scheduleAnalysis(val || ''); }}
                            onMount={(editor, monaco) => {
                                editorRef.current = editor;
                                window.monaco = monaco;
                            }}
                            options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, fontFamily: 'JetBrains Mono, monospace', padding: { top: 12 }, wordWrap: 'on' }}
                        />

                        {/* AI Inline Comment Layer */}
                        {editorRef.current && commentActions.map((c, i) => (
                            <div key={`comment-${i}`} style={{
                                position: 'absolute',
                                top: Math.max(0, editorRef.current.getTopForLineNumber(c.line) - editorRef.current.getScrollTop() + 12),
                                right: '24px',
                                background: 'var(--surface2)',
                                border: '1px solid rgba(168,85,247,0.4)',
                                padding: '4px 10px',
                                borderRadius: '12px 12px 0 12px',
                                fontSize: '0.7rem', color: '#e8e8e8',
                                display: 'flex', alignItems: 'center', gap: '6px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                zIndex: 5,
                                pointerEvents: 'none'
                            }}>
                                <MessageCircle size={12} color="#a855f7" /> {c.text}
                            </div>
                        ))}

                        {/* AI Cursor Badges */}
                        {editorRef.current && cursorActions.map((c, i) => (
                            <div key={`cursor-${i}`} style={{
                                position: 'absolute',
                                top: Math.max(0, editorRef.current.getTopForLineNumber(c.line) - editorRef.current.getScrollTop() + 12),
                                left: '4px',
                                background: '#a855f7',
                                color: '#fff',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.65rem', fontWeight: 800,
                                display: 'flex', alignItems: 'center', gap: '4px',
                                boxShadow: '0 0 10px rgba(168,85,247,0.6)',
                                zIndex: 5,
                                pointerEvents: 'none',
                                animation: 'pulse 2s infinite'
                            }}>
                                <Navigation size={10} style={{ transform: 'rotate(90deg)' }} /> AI
                            </div>
                        ))}
                    </div>

                    {/* Console/Results Panel */}
                    <div className={`lc-console ${consoleOpen ? 'open' : ''}`} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, background: '#11131a', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)', height: consoleOpen ? '320px' : '44px' }}>
                        <div className="lc-console-header" onClick={() => setConsoleOpen(!consoleOpen)} style={{ padding: '0 1rem', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: consoleOpen ? '1px solid rgba(255,255,255,0.05)' : 'none', background: 'rgba(0,0,0,0.2)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#e8e8e8' }}>
                                <Terminal size={15} color="#888" /> Test Results Console
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {runResults && (
                                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: runResults.filter(r => r.success).length === (problemData?.primaryTestCases || []).length ? 'var(--pass-dim)' : 'var(--fail-dim)', color: runResults.filter(r => r.success).length === (problemData?.primaryTestCases || []).length ? 'var(--pass)' : 'var(--fail)' }}>
                                        {runResults.filter(r => r.success).length}/{(problemData?.primaryTestCases || []).length} passed
                                    </span>
                                )}
                                {submitResult && (
                                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: submitResult.accepted ? 'var(--pass-dim)' : 'var(--fail-dim)', color: submitResult.accepted ? 'var(--pass)' : 'var(--fail)' }}>
                                        {submitResult.accepted ? '✓ Accepted' : '✗ Wrong Answer'}
                                    </span>
                                )}
                                {consoleOpen ? <ChevronDown size={14} color="var(--txt3)" /> : <ChevronUp size={14} color="var(--txt3)" />}
                            </div>
                        </div>

                        {consoleOpen && (
                            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: 'var(--bg)' }}>
                                {/* Loading state */}
                                {(isRunning || isSubmitting) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--txt2)', fontSize: '0.85rem', justifyContent: 'center', marginTop: '2rem' }}>
                                        <Loader2 size={18} className="spin" color="var(--ai)" />
                                        <span>
                                            {isRunning ? 'Running test cases...' :
                                                isSubmitting ? (submitProgress ? `Evaluating... ${submitProgress.passed} / ${submitProgress.total} test cases passed` : 'Submitting to judge...') : ''}
                                        </span>
                                    </div>
                                )}

                                {/* Run Results */}
                                {runResults && !isRunning && (
                                    <div>
                                        {/* Tabs */}
                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem', borderBottom: '1px solid var(--border-soft)', paddingBottom: '4px' }}>
                                            {(problemData?.primaryTestCases || []).map((tc, i) => {
                                                const res = runResults[i];
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => setActiveTab(i)}
                                                        style={{
                                                            padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                                                            background: activeTab === i ? 'var(--surface2)' : 'transparent',
                                                            color: res ? (res.success ? 'var(--pass)' : 'var(--fail)') : 'var(--txt2)'
                                                        }}
                                                    >
                                                        {res ? (res.success ? <CheckCircle2 size={12} /> : <XCircle size={12} />) : null}
                                                        {tc.label || `Case ${i + 1}`}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {/* Active case result */}
                                        {(() => {
                                            const tc = (problemData?.primaryTestCases || [])[activeTab];
                                            const res = runResults[activeTab];
                                            if (!tc || !res) return null;
                                            return (
                                                <div style={{ fontSize: '0.82rem' }}>
                                                    <div style={{ marginBottom: '0.75rem' }}>
                                                        <span style={{ display: 'block', color: 'var(--txt2)', marginBottom: '4px', fontSize: '0.75rem' }}>Input</span>
                                                        <pre style={{ background: 'var(--surface2)', padding: '0.6rem', borderRadius: '6px', color: 'var(--txt)', fontFamily: 'JetBrains Mono, monospace' }}>{tc.input || '(none)'}</pre>
                                                    </div>
                                                    <div style={{ marginBottom: '0.75rem' }}>
                                                        <span style={{ display: 'block', color: 'var(--txt2)', marginBottom: '4px', fontSize: '0.75rem' }}>Expected Output</span>
                                                        <pre style={{ background: 'var(--surface2)', padding: '0.6rem', borderRadius: '6px', color: 'var(--txt)', fontFamily: 'JetBrains Mono, monospace' }}>{tc.expectedOutput || '(none)'}</pre>
                                                    </div>
                                                    <div style={{ marginBottom: '0.75rem' }}>
                                                        <span style={{ display: 'block', color: 'var(--txt2)', marginBottom: '4px', fontSize: '0.75rem' }}>Your Output</span>
                                                        <pre style={{ background: res.success ? 'var(--pass-dim)' : 'var(--fail-dim)', border: `1px solid ${res.success ? 'rgba(0,184,163,0.2)' : 'rgba(239,71,67,0.2)'}`, padding: '0.6rem', borderRadius: '6px', color: res.success ? 'var(--pass)' : 'var(--fail)', fontFamily: 'JetBrains Mono, monospace' }}>{res.output || '(none)'}</pre>
                                                    </div>
                                                    {res.error && (
                                                        <div style={{ marginTop: '0.75rem' }}>
                                                            <span style={{ display: 'block', color: 'var(--fail)', marginBottom: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Error Trace</span>
                                                            <pre style={{ background: 'rgba(239, 71, 67, 0.05)', color: 'var(--fail)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.78rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', border: '1px solid rgba(239, 71, 67, 0.2)' }}>{res.error}</pre>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* Submit Results */}
                                {submitResult && !isSubmitting && (
                                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                                        {submitResult.accepted ? (
                                            <>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: 'var(--pass-dim)', marginBottom: '1rem' }}>
                                                    <CheckCircle2 size={24} color="var(--pass)" />
                                                </div>
                                                <h3 style={{ fontSize: '1.2rem', color: 'var(--pass)', marginBottom: '0.5rem', fontWeight: 600 }}>Accepted!</h3>
                                                <p style={{ color: 'var(--txt2)', fontSize: '0.9rem' }}>You passed all {submitResult.results?.length || 0} test cases.</p>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: 'var(--fail-dim)', marginBottom: '1rem' }}>
                                                    <XCircle size={24} color="var(--fail)" />
                                                </div>
                                                <h3 style={{ fontSize: '1.2rem', color: 'var(--fail)', marginBottom: '0.5rem', fontWeight: 600 }}>Wrong Answer</h3>
                                                <p style={{ color: 'var(--txt2)', fontSize: '0.9rem' }}>Passed {submitResult.results?.filter(r => r.success).length || 0} / {(problemData?.primaryTestCases || []).length + (problemData?.submitTestCases || []).length} test cases.</p>
                                            </>
                                        )}
                                    </div>
                                )}

                                {!runResults && !submitResult && !isRunning && !isSubmitting && (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--txt3)', fontSize: '0.85rem' }}>
                                        Run your code to see outputs here.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Resizer right */}
                <div className="lc-resizer ai-resizer" onMouseDown={() => setIsDraggingRight(true)} style={{ cursor: 'col-resize' }} />

                {/* RIGHT: AI Avatar + Chat */}
                <div className="ai-right-panel" style={{ width: rightWidth, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, background: '#0a0c10', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>

                    {/* Header: AI Avatar — switches to video card for jessica/rohan */}
                    {selectedVoice.id === 'jessica' ? (
                        /* ── Jessica: full-width female video header ── */
                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            overflow: 'hidden',
                            position: 'relative',
                            flexShrink: 0
                        }}>
                            {/* 16:9 full-width video */}
                            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
                                <video
                                    ref={femaleVideoRef}
                                    src="/female_speak1.mp4"
                                    loop
                                    muted
                                    playsInline
                                    style={{
                                        position: 'absolute', inset: 0,
                                        width: '100%', height: '100%',
                                        objectFit: 'cover', display: 'block'
                                    }}
                                />
                                {/* Gradient overlay at bottom */}
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
                                    background: 'linear-gradient(to top, rgba(10,12,16,0.95) 0%, transparent 100%)'
                                }} />
                                {/* Speaking pulse bars */}
                                {isSpeaking && (
                                    <div style={{
                                        position: 'absolute', bottom: '8px', left: '12px',
                                        display: 'flex', gap: '3px', alignItems: 'flex-end', height: '16px'
                                    }}>
                                        {[0, 0.12, 0.24, 0.36, 0.48].map((delay, idx) => (
                                            <div key={idx} style={{
                                                width: '3px', borderRadius: '2px',
                                                background: '#a855f7',
                                                animation: 'speakBar 0.65s ease-in-out infinite',
                                                animationDelay: `${delay}s`,
                                                height: '100%',
                                                transformOrigin: 'bottom'
                                            }} />
                                        ))}
                                    </div>
                                )}
                                {/* Name + status badge bottom-right */}
                                <div style={{
                                    position: 'absolute', bottom: '8px', right: '10px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px'
                                }}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e8e8e8', letterSpacing: '0.01em', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                                        Jessica · AI Interviewer
                                    </span>
                                    <span style={{
                                        fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: '99px',
                                        background: isSpeaking ? 'rgba(168,85,247,0.25)' : isAiThinking ? 'rgba(255,161,22,0.2)' : 'rgba(0,184,163,0.2)',
                                        color: isSpeaking ? '#a855f7' : isAiThinking ? '#ffa116' : '#00b8a3',
                                        border: `1px solid ${isSpeaking ? 'rgba(168,85,247,0.4)' : isAiThinking ? 'rgba(255,161,22,0.3)' : 'rgba(0,184,163,0.3)'}`,
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        backdropFilter: 'blur(8px)'
                                    }}>
                                        {isSpeaking && <><Volume2 size={9} />Speaking...</>}
                                        {!isSpeaking && isAiThinking && <><Loader2 size={9} className="spin" />Analyzing...</>}
                                        {!isSpeaking && !isAiThinking && <><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00b8a3', display: 'inline-block' }} />Listening</>}
                                    </span>
                                </div>
                                {/* Purple glow border when speaking */}
                                {isSpeaking && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        boxShadow: 'inset 0 0 0 2px rgba(168,85,247,0.6)',
                                        borderRadius: 0,
                                        pointerEvents: 'none',
                                        animation: 'avatar-pulse 1.8s ease-in-out infinite'
                                    }} />
                                )}
                            </div>
                        </div>
                    ) : selectedVoice.gender === 'Male' ? (
                        /* ── Rohan: full-width male video header ── */
                        <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            overflow: 'hidden',
                            position: 'relative',
                            flexShrink: 0
                        }}>
                            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
                                <video
                                    ref={maleVideoRef}
                                    src={MALE_VIDEO_MAP[selectedVoice.id] || '/male_manan.mp4'}
                                    loop
                                    muted
                                    playsInline
                                    style={{
                                        position: 'absolute', inset: 0,
                                        width: '100%', height: '100%',
                                        objectFit: 'cover', display: 'block'
                                    }}
                                />
                                {/* Gradient overlay at bottom */}
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
                                    background: 'linear-gradient(to top, rgba(10,12,16,0.95) 0%, transparent 100%)'
                                }} />
                                {/* Speaking pulse bars */}
                                {isSpeaking && (
                                    <div style={{
                                        position: 'absolute', bottom: '8px', left: '12px',
                                        display: 'flex', gap: '3px', alignItems: 'flex-end', height: '16px'
                                    }}>
                                        {[0, 0.12, 0.24, 0.36, 0.48].map((delay, idx) => (
                                            <div key={idx} style={{
                                                width: '3px', borderRadius: '2px',
                                                background: '#3b82f6',
                                                animation: 'speakBar 0.65s ease-in-out infinite',
                                                animationDelay: `${delay}s`,
                                                height: '100%',
                                                transformOrigin: 'bottom'
                                            }} />
                                        ))}
                                    </div>
                                )}
                                {/* Name + status */}
                                <div style={{
                                    position: 'absolute', bottom: '8px', right: '10px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px'
                                }}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e8e8e8', letterSpacing: '0.01em', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                                        {selectedVoice.name} · AI Interviewer
                                    </span>
                                    <span style={{
                                        fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: '99px',
                                        background: isSpeaking ? 'rgba(59,130,246,0.25)' : isAiThinking ? 'rgba(255,161,22,0.2)' : 'rgba(0,184,163,0.2)',
                                        color: isSpeaking ? '#3b82f6' : isAiThinking ? '#ffa116' : '#00b8a3',
                                        border: `1px solid ${isSpeaking ? 'rgba(59,130,246,0.4)' : isAiThinking ? 'rgba(255,161,22,0.3)' : 'rgba(0,184,163,0.3)'}`,
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        backdropFilter: 'blur(8px)'
                                    }}>
                                        {isSpeaking && <><Volume2 size={9} />Speaking...</>}
                                        {!isSpeaking && isAiThinking && <><Loader2 size={9} className="spin" />Analyzing...</>}
                                        {!isSpeaking && !isAiThinking && <><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00b8a3', display: 'inline-block' }} />Listening</>}
                                    </span>
                                </div>
                                {/* Blue glow border when speaking */}
                                {isSpeaking && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        boxShadow: 'inset 0 0 0 2px rgba(59,130,246,0.6)',
                                        borderRadius: 0,
                                        pointerEvents: 'none',
                                        animation: 'avatar-pulse 1.8s ease-in-out infinite'
                                    }} />
                                )}
                            </div>
                        </div>
                    ) : (
                        /* ── Other voices: original Brain avatar header ── */
                        <div style={{ padding: '1.25rem 1rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <div className={`ai-avatar-frame ${isSpeaking ? 'ai-avatar-speaking' : ''}`} style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(168,85,247,0.1)', border: '2px solid rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isSpeaking ? '0 0 20px rgba(168,85,247,0.4)' : 'none', transition: 'all 0.3s' }}>
                                <Brain size={32} color="#a855f7" />
                                {isSpeaking && (
                                    <div style={{ position: 'absolute', right: '-4px', bottom: '-4px', background: '#a855f7', borderRadius: '50%', padding: '4px', border: '2px solid #0a0c10' }}>
                                        <Volume2 size={10} color="#fff" />
                                    </div>
                                )}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e8e8e8', letterSpacing: '0.01em' }}>Senior Engineer AI</div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: isSpeaking ? '#a855f7' : isAiThinking ? '#ffa116' : '#888', transition: 'color 0.3s', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', marginTop: '2px' }}>
                                    {isSpeaking && <><Volume2 size={11} /><span>Speaking...</span></>}
                                    {!isSpeaking && isAiThinking && <><Loader2 size={11} className="spin" /><span>Analyzing...</span></>}
                                    {!isSpeaking && !isAiThinking && <><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00b8a3' }} /><span>Listening</span></>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chat log */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', scrollBehavior: 'smooth' }}>
                        {transcript.length === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6 }}>
                                <MessageSquare size={32} color="rgba(255,255,255,0.2)" style={{ marginBottom: '12px' }} />
                                <div style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
                                    The interview will begin shortly.<br />AI will start the conversation.
                                </div>
                            </div>
                        )}
                        {transcript.map((msg, i) => (
                            <div key={i} style={{
                                maxWidth: '90%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                display: 'flex', flexDirection: 'column', gap: '4px'
                            }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: msg.role === 'user' ? 'rgba(255,255,255,0.4)' : '#a855f7', marginLeft: msg.role === 'user' ? 'auto' : '4px', marginRight: msg.role === 'user' ? '4px' : 'auto', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {msg.role === 'user' ? 'You' : 'AI Interviewer'}
                                </div>
                                <div style={{
                                    padding: '0.85rem 1rem',
                                    background: msg.role === 'user' ? 'rgba(255,255,255,0.08)' : 'rgba(168,85,247,0.08)',
                                    border: `1px solid ${msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(168,85,247,0.2)'}`,
                                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    fontSize: '0.85rem', lineHeight: 1.6, color: '#e8e8e8',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isAiThinking && (
                            <div style={{ alignSelf: 'flex-start', marginLeft: '4px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#a855f7', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Interviewer</div>
                                <div style={{ padding: '0.8rem 1rem', background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: '4px', alignItems: 'center', width: 'fit-content' }}>
                                    <div className="typing-dot" style={{ background: '#a855f7' }} /><div className="typing-dot" style={{ animationDelay: '0.15s', background: '#a855f7' }} /><div className="typing-dot" style={{ animationDelay: '0.3s', background: '#a855f7' }} />
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Voice / Text input bar */}
                    <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    type="text" placeholder={isSpeaking ? 'AI is speaking...' : isListening ? 'Listening via microphone...' : 'Type message...'}
                                    value={userInput} onChange={e => setUserInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSendText(); }}
                                    disabled={isAiThinking || isSpeaking}
                                    style={{ width: '100%', padding: '0.75rem 1rem', paddingRight: '2.5rem', background: isListening ? 'rgba(0,184,163,0.08)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isListening ? 'rgba(0,184,163,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', color: '#fff', fontSize: '0.85rem', outline: 'none', transition: 'all 0.2s', opacity: (isAiThinking || isSpeaking) ? 0.6 : 1, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}
                                />
                                <button onClick={handleSendText} disabled={isAiThinking || isSpeaking || !userInput.trim()}
                                    style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', width: '28px', height: '28px', background: userInput.trim() ? '#a855f7' : 'rgba(168,85,247,0.2)', border: 'none', borderRadius: '8px', color: '#fff', cursor: (isAiThinking || isSpeaking || !userInput.trim()) ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    onClick={() => setTtsEnabled(prev => !prev)}
                                    title={ttsEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
                                    style={{
                                        width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: ttsEnabled ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${ttsEnabled ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', color: ttsEnabled ? '#a855f7' : '#888', cursor: 'pointer', transition: 'all 0.2s'
                                    }}>
                                    {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                </button>

                                {isSpeaking ? (
                                    <button onClick={handleInterruptAI}
                                        style={{ width: 'auto', padding: '0 12px', height: '42px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,71,67,0.15)', border: '1px solid rgba(239,71,67,0.4)', borderRadius: '12px', color: '#ef4743', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <XCircle size={16} /> Interrupt
                                    </button>
                                ) : (
                                    <button onClick={toggleMic} disabled={isAiThinking}
                                        style={{ opacity: isAiThinking ? 0.5 : 1, cursor: isAiThinking ? 'not-allowed' : 'pointer', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isListening ? '#00b8a3' : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '12px', color: '#fff', transition: 'all 0.2s', boxShadow: isListening ? '0 4px 12px rgba(0,184,163,0.4)' : 'none' }}>
                                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── System Design Whiteboard Overlay ── */}
            <div style={{
                position: 'fixed',
                top: '56px',
                left: whiteboardFullscreen ? 0 : leftWidth, // fullscreen hides question panel; normal keeps it
                right: rightWidth, // AI chat always stays visible on the right
                bottom: 0,
                background: '#0a0c10',
                zIndex: 35,
                transform: whiteboardOpen ? 'translateY(0)' : 'translateY(100%)',
                opacity: whiteboardOpen ? 1 : 0,
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, left 0.3s ease',
                pointerEvents: whiteboardOpen ? 'auto' : 'none',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ height: '40px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e8e8e8', fontSize: '0.85rem', fontWeight: 600 }}>
                        <LayoutTemplate size={16} color="#3b82f6" /> System Architecture Board
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            onClick={() => setWhiteboardFullscreen(f => !f)}
                            title={whiteboardFullscreen ? 'Exit fullscreen' : 'Fullscreen (keeps AI panel visible)'}
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--txt3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', borderRadius: '6px', padding: '3px 8px', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e8e8e8'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--txt3)'; }}
                        >
                            {whiteboardFullscreen
                                ? <><Minimize2 size={13} /> Restore</>
                                : <><Maximize2 size={13} /> Fullscreen</>}
                        </button>
                        <button onClick={() => { setWhiteboardOpen(false); setWhiteboardFullscreen(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--txt3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                            <ChevronDown size={14} /> Close
                        </button>
                    </div>
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                    <SystemDesignBoard />
                </div>
            </div>
        </div>
    );
}
