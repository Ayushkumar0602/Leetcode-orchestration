import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Editor from '@monaco-editor/react';
import {
    Play, Mic, MicOff, PhoneOff, Brain, LogOut, Volume2, VolumeX,
    Send, Terminal, Trash2, Pen, Eraser, RotateCcw, Loader2,
    CheckCircle2, XCircle, Layers, MessageSquare, Code2, Sparkles,
    TrendingUp, Star, ArrowLeft, Clock, User, Building, Cpu,
    Server, Database, HardDrive, Cloud, Globe, Minus, Maximize2
} from 'lucide-react';

// ─── Voice Templates ──────────────────────────────────────────────────────────
const VOICE_TEMPLATES = [
    { id: 'will', voiceId: 'bIHbv24MWmeRgasZH58o', name: 'Will', tag: 'Authoritative', emoji: '🎙️' },
    { id: 'sarah', voiceId: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', tag: 'Warm', emoji: '🎤' },
    { id: 'eric', voiceId: 'cjVigY5qzO86Huf0OWal', name: 'Eric', tag: 'Calm', emoji: '🔊' },
    { id: 'jessica', voiceId: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', tag: 'Articulate', emoji: '✨' },
    { id: 'alice', voiceId: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', tag: 'British', emoji: '🇬🇧' },
    { id: 'daniel', voiceId: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', tag: 'Deep', emoji: '🎧' },
];

const LANG_OPTIONS = { python: 'Python', javascript: 'JavaScript', cpp: 'C++', java: 'Java', go: 'Go' };
const LANGUAGE_TEMPLATES = {
    python: '# System Design Implementation\n\nclass Solution:\n    def design(self):\n        # Write your implementation here\n        pass\n\n# Example usage:\n# s = Solution()\n# s.design()',
    javascript: '// System Design Implementation\n\nclass Solution {\n    constructor() {\n        // Initialize your data structures\n    }\n    design() {\n        // Write your implementation here\n    }\n}\n\n// const s = new Solution();\n// s.design();',
    cpp: '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\n// System Design Implementation\nclass Solution {\npublic:\n    void design() {\n        // Write your implementation here\n    }\n};\n',
    java: 'import java.util.*;\n\n// System Design Implementation\nclass Solution {\n    public Solution() {\n        // Initialize data structures\n    }\n    \n    public void design() {\n        // Write your implementation here\n    }\n}\n',
    go: 'package main\n\nimport "fmt"\n\n// System Design Implementation\ntype Solution struct {\n    // Add fields here\n}\n\nfunc NewSolution() *Solution {\n    return &Solution{}\n}\n\nfunc (s *Solution) Design() {\n    fmt.Println("Implement here")\n}\n',
};

// Score Badge
function ScoreBadge({ score }) {
    const color = score >= 75 ? '#00b8a3' : score >= 50 ? '#ffa116' : '#ef4743';
    const bg = score >= 75 ? 'rgba(0,184,163,0.1)' : score >= 50 ? 'rgba(255,161,22,0.1)' : 'rgba(239,71,67,0.1)';
    const circumference = 2 * Math.PI * 54;
    const strokeDash = (score / 100) * circumference;
    return (
        <div style={{ position: 'relative', width: 140, height: 140 }}>
            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <circle cx="70" cy="70" r="54" fill="none" stroke={color} strokeWidth="10"
                    strokeDasharray={`${strokeDash} ${circumference}`}
                    strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color }}>{score}</span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>/ 100</span>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SystemDesignInterview() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const topic = searchParams.get('topic') || 'System Design';

    // ── Phase ──
    const [appPhase, setAppPhase] = useState('setup'); // setup | interview | evaluating | score

    // ── Setup state ──
    const [role, setRole] = useState('');
    const [company, setCompany] = useState('');
    const [selectedVoice, setSelectedVoice] = useState(VOICE_TEMPLATES[0]);
    const [setupError, setSetupError] = useState('');

    // ── Code editor ──
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(LANGUAGE_TEMPLATES.python);
    const [terminalOutput, setTerminalOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [terminalOpen, setTerminalOpen] = useState(true);

    // ── Whiteboard ──
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pen'); // pen | eraser | rect | circle | arrow | line | server | database | cache | loadbalancer | api | queue | cdn
    const [penColor, setPenColor] = useState('#818cf8');
    const [whiteboardText, setWhiteboardText] = useState('');
    const lastPos = useRef(null);
    const shapeStart = useRef(null);
    const currentPath = useRef([]);
    const drawnShapes = useRef([]); // Store shapes for redraw on resize

    // ── Panel collapse ──
    const [editorMinimized, setEditorMinimized] = useState(false);
    const [whiteboardMinimized, setWhiteboardMinimized] = useState(false);

    // ── AI Chat ──
    const [transcript, setTranscript] = useState([]);
    const transcriptRef = useRef([]);
    const [userInput, setUserInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const audioRef = useRef(null);
    const recognitionRef = useRef(null);
    const chatEndRef = useRef(null);

    // ── Timer ──
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    // ── Score ──
    const [scoreReport, setScoreReport] = useState(null);

    // ─── Auth guard ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!currentUser) {
            navigate('/login?redirect=/systemdesign', { replace: true });
        }
    }, [currentUser, navigate]);

    // ─── Keep transcript ref in sync ─────────────────────────────────────────
    useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

    // ─── Scroll chat ─────────────────────────────────────────────────────────
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [transcript]);

    // ─── Language change ─────────────────────────────────────────────────────
    useEffect(() => { setCode(LANGUAGE_TEMPLATES[language] || ''); }, [language]);

    // ─── Interview timer ──────────────────────────────────────────────────────
    useEffect(() => {
        if (appPhase === 'interview') {
            startTimeRef.current = Date.now();
            timerRef.current = setInterval(() => {
                setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [appPhase]);

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    // ─── ElevenLabs TTS ──────────────────────────────────────────────────────
    const stopSpeech = () => {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; audioRef.current = null; }
        setIsSpeaking(false);
    };

    const speakText = async (text) => {
        if (!ttsEnabled || !text?.trim()) return;
        stopSpeech();
        setIsSpeaking(true);
        try {
            const res = await fetch('https://leetcode-orchestration-api.onrender.com/api/elevenlabs/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text.trim(), voiceId: selectedVoice.voiceId })
            });
            if (!res.ok) throw new Error('TTS failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); audioRef.current = null; };
            audio.onerror = () => { setIsSpeaking(false); audioRef.current = null; };
            await audio.play();
        } catch (err) { console.error('TTS error:', err); setIsSpeaking(false); }
    };

    // ─── Speech recognition ──────────────────────────────────────────────────
    const userInputRef = useRef(userInput);
    useEffect(() => { userInputRef.current = userInput; }, [userInput]);

    useEffect(() => {
        if (appPhase !== 'interview') return;
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        let sessionTranscript = '';
        recognition.onstart = () => { sessionTranscript = userInputRef.current ? userInputRef.current + ' ' : ''; };
        recognition.onresult = (e) => {
            let finalPart = '';
            let interim = '';
            for (let i = 0; i < e.results.length; i++) {
                if (e.results[i].isFinal) finalPart += e.results[i][0].transcript + ' ';
                else interim += e.results[i][0].transcript;
            }
            setUserInput((sessionTranscript + finalPart + interim).trimStart());
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognitionRef.current = recognition;
        return () => recognition.abort();
    }, [appPhase]);

    const toggleMic = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (_) { }
        }
    };

    // ─── AI Chat ─────────────────────────────────────────────────────────────
    const sendMessage = useCallback(async (textOverride) => {
        const text = textOverride || userInput;
        if (!text.trim() || isAiThinking) return;
        const userMsg = { role: 'user', text: text.trim() };
        const newTranscript = [...transcriptRef.current, userMsg];
        setTranscript(newTranscript);
        setUserInput('');
        setIsAiThinking(true);
        try {
            const wbText = whiteboardText || 'Whiteboard is empty';
            const res = await fetch('https://leetcode-orchestration-api.onrender.com/api/systemdesign/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic, role, company,
                    transcript: newTranscript,
                    code,
                    whiteboardText: wbText,
                    phase: 'discussion'
                })
            });
            const data = await res.json();
            const aiMsg = { role: 'ai', text: data.text || '...' };
            setTranscript(prev => [...prev, aiMsg]);
            speakText(aiMsg.text);
        } catch (err) {
            setTranscript(prev => [...prev, { role: 'ai', text: 'Sorry, I had trouble connecting. Please try again.' }]);
        } finally {
            setIsAiThinking(false);
        }
    }, [userInput, isAiThinking, topic, role, company, code, whiteboardText]);

    // ─── Start interview (opening AI message) ────────────────────────────────
    const startInterview = () => {
        if (!role.trim()) { setSetupError('Please enter your target job role.'); return; }
        setSetupError('');
        setAppPhase('interview');
        // Opening message from AI
        setTimeout(() => {
            sendMessageAsSystem(`Hello! I'm your interviewer today. We'll be focusing on: "${topic}". This session is for the ${role} position${company ? ` at ${company}` : ''}. Please start by walking me through how you would approach this problem — what clarifying questions would you ask first?`);
        }, 500);
    };

    const sendMessageAsSystem = (text) => {
        const aiMsg = { role: 'ai', text };
        setTranscript([aiMsg]);
        speakText(text);
    };

    // ─── Run code ────────────────────────────────────────────────────────────
    const runCode = async () => {
        if (!code.trim() || isRunning) return;
        setIsRunning(true);
        setTerminalOutput('Running...');
        setTerminalOpen(true);
        try {
            const res = await fetch('https://leetcode-orchestration-api.onrender.com/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language, input: '' })
            });
            const result = await res.json();
            if (result.error) setTerminalOutput(`Error:\n${result.error}`);
            else setTerminalOutput(result.stdout || result.output || '✓ No output (ran successfully)');
        } catch (err) {
            setTerminalOutput(`Connection error: ${err.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    // ─── Whiteboard ──────────────────────────────────────────────────────────
    // Scale display coords to canvas coords (fixes alignment when canvas is stretched)
    const getCanvasPos = (clientX, clientY) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };

    const getEventPos = (e) => {
        if (e.touches) return getCanvasPos(e.touches[0].clientX, e.touches[0].clientY);
        return getCanvasPos(e.clientX, e.clientY);
    };

    const drawShape = (ctx, type, x1, y1, x2, y2, color) => {
        ctx.strokeStyle = color || penColor;
        ctx.fillStyle = color || penColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (type === 'rect') {
            const w = x2 - x1, h = y2 - y1;
            ctx.strokeRect(x1, y1, w, h);
        } else if (type === 'circle') {
            const r = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            ctx.beginPath();
            ctx.arc(x1, y1, r, 0, Math.PI * 2);
            ctx.stroke();
        } else if (type === 'line') {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        } else if (type === 'arrow') {
            const headLen = 15;
            const angle = Math.atan2(y2 - y1, x2 - x1);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();
        }
    };

    const drawStamp = (ctx, type, x, y, size = 48, color) => {
        const c = color || penColor;
        const s = size / 2;
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = c;
        ctx.fillStyle = c;
        ctx.lineWidth = 2;
        // Draw icon as simple shapes (server=rect stack, database=cylinder, etc.)
        if (type === 'server') {
            ctx.strokeRect(-s * 0.8, -s * 0.6, s * 1.6, s * 0.4);
            ctx.strokeRect(-s * 0.8, -s * 0.1, s * 1.6, s * 0.4);
            ctx.strokeRect(-s * 0.8, s * 0.4, s * 1.6, s * 0.4);
            ctx.fillRect(-s * 0.5, -s * 0.5, 4, 4);
            ctx.fillRect(-s * 0.5, 0, 4, 4);
            ctx.fillRect(-s * 0.5, s * 0.5, 4, 4);
        } else if (type === 'database') {
            ctx.beginPath();
            ctx.ellipse(0, -s * 0.3, s * 0.8, s * 0.2, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-s * 0.8, -s * 0.3);
            ctx.lineTo(-s * 0.8, s * 0.5);
            ctx.quadraticCurveTo(-s * 0.8, s * 0.9, 0, s * 0.9);
            ctx.quadraticCurveTo(s * 0.8, s * 0.9, s * 0.8, s * 0.5);
            ctx.lineTo(s * 0.8, -s * 0.3);
            ctx.stroke();
        } else if (type === 'cache') {
            ctx.strokeRect(-s * 0.7, -s * 0.7, s * 1.4, s * 1.4);
            ctx.beginPath();
            ctx.moveTo(-s * 0.5, s * 0.5);
            ctx.lineTo(s * 0.5, -s * 0.5);
            ctx.moveTo(-s * 0.5, -s * 0.5);
            ctx.lineTo(s * 0.5, s * 0.5);
            ctx.stroke();
        } else if (type === 'loadbalancer') {
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.8);
            ctx.lineTo(-s * 0.7, s * 0.6);
            ctx.lineTo(s * 0.7, s * 0.6);
            ctx.closePath();
            ctx.stroke();
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = c;
            ctx.fill();
            ctx.globalAlpha = 1;
        } else if (type === 'api') {
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-s * 0.4, 0);
            ctx.lineTo(s * 0.4, 0);
            ctx.moveTo(0, -s * 0.4);
            ctx.lineTo(0, s * 0.4);
            ctx.stroke();
        } else if (type === 'queue') {
            ctx.strokeRect(-s * 0.8, -s * 0.5, s * 1.6, s * 1);
            ctx.beginPath();
            ctx.moveTo(-s * 0.6, 0);
            ctx.lineTo(s * 0.6, 0);
            ctx.stroke();
        } else if (type === 'cdn') {
            ctx.beginPath();
            ctx.arc(0, -s * 0.2, s * 0.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-s * 0.6, s * 0.3);
            ctx.quadraticCurveTo(0, s * 0.8, s * 0.6, s * 0.3);
            ctx.stroke();
        }
        ctx.restore();
    };

    const onCanvasMouseDown = (e) => {
        const pos = getEventPos(e);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const stampTools = ['server', 'database', 'cache', 'loadbalancer', 'api', 'queue', 'cdn'];
        if (stampTools.includes(tool)) {
            drawStamp(ctx, tool, pos.x, pos.y, 48, penColor);
            drawnShapes.current.push({ type: 'stamp', tool, x: pos.x, y: pos.y, color: penColor });
            setWhiteboardText(`User added ${tool} to the whiteboard. Board has system design diagram.`);
            return;
        }

        if (['rect', 'circle', 'arrow', 'line'].includes(tool)) {
            shapeStart.current = pos;
            setIsDrawing(true);
            return;
        }

        if (tool === 'pen' || tool === 'eraser') {
            currentPath.current = [pos];
        }
        setIsDrawing(true);
        lastPos.current = pos;
    };

    const onCanvasMouseMove = (e) => {
        const pos = getEventPos(e);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        if (isDrawing && ['rect', 'circle', 'arrow', 'line'].includes(tool) && shapeStart.current) {
            redrawCanvas(ctx);
            drawShape(ctx, tool, shapeStart.current.x, shapeStart.current.y, pos.x, pos.y);
            return;
        }

        if (!isDrawing) return;
        if (tool === 'pen' || tool === 'eraser') {
            currentPath.current.push(pos);
            ctx.beginPath();
            ctx.moveTo(lastPos.current.x, lastPos.current.y);
            ctx.lineTo(pos.x, pos.y);
            if (tool === 'eraser') {
                ctx.strokeStyle = '#0f1117';
                ctx.lineWidth = 24;
            } else {
                ctx.strokeStyle = penColor;
                ctx.lineWidth = 2.5;
            }
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
            lastPos.current = pos;
        }
        setWhiteboardText(`User is drawing on the whiteboard. Board has sketches/diagrams for the system design.`);
    };

    const redrawCanvas = (ctx) => {
        const canvas = canvasRef.current;
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawnShapes.current.forEach(s => {
            if (s.type === 'stamp') drawStamp(ctx, s.tool, s.x, s.y, 48, s.color);
            else if (s.type === 'path') {
                if (s.points.length < 2) return;
                ctx.strokeStyle = s.isEraser ? '#0f1117' : s.color;
                ctx.lineWidth = s.isEraser ? 24 : 2.5;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(s.points[0].x, s.points[0].y);
                for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
                ctx.stroke();
            } else drawShape(ctx, s.type, s.x1, s.y1, s.x2, s.y2, s.color);
        });
    };

    const onCanvasMouseUp = (e) => {
        const pos = getEventPos(e);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (isDrawing && ['rect', 'circle', 'arrow', 'line'].includes(tool) && shapeStart.current && canvas && ctx) {
            drawnShapes.current.push({
                type: tool,
                x1: shapeStart.current.x, y1: shapeStart.current.y,
                x2: pos.x, y2: pos.y,
                color: penColor
            });
            redrawCanvas(ctx);
            shapeStart.current = null;
            setWhiteboardText(`User added ${tool} shape. Board has system design diagram.`);
        } else if (isDrawing && (tool === 'pen' || tool === 'eraser') && currentPath.current.length > 1) {
            drawnShapes.current.push({
                type: 'path',
                points: [...currentPath.current],
                color: penColor,
                isEraser: tool === 'eraser'
            });
            currentPath.current = [];
        }
        setIsDrawing(false);
    };

    const onCanvasMouseLeave = () => {
        if (isDrawing && shapeStart.current) shapeStart.current = null;
        if (isDrawing && (tool === 'pen' || tool === 'eraser') && currentPath.current.length > 1) {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
                drawnShapes.current.push({
                    type: 'path',
                    points: [...currentPath.current],
                    color: penColor,
                    isEraser: tool === 'eraser'
                });
            }
            currentPath.current = [];
        }
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawnShapes.current = [];
            setWhiteboardText('');
        }
    };

    // Touch handlers
    const handleTouchStart = (e) => { e.preventDefault(); onCanvasMouseDown(e); };
    const handleTouchMove = (e) => { e.preventDefault(); onCanvasMouseMove(e); };
    const handleTouchEnd = (e) => { e.preventDefault(); onCanvasMouseUp(e); };

    // ─── Evaluate & End interview ─────────────────────────────────────────────
    const endInterview = async () => {
        clearInterval(timerRef.current);
        stopSpeech();
        setAppPhase('evaluating');
        try {
            const res = await fetch('https://leetcode-orchestration-api.onrender.com/api/systemdesign/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, role, company, transcript: transcriptRef.current, finalCode: code, whiteboardText })
            });
            const report = await res.json();
            setScoreReport(report);
            // Save to Firestore
            await fetch('https://leetcode-orchestration-api.onrender.com/api/systemdesign/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    role, company, topic, language,
                    finalCode: code, whiteboardText,
                    transcript: transcriptRef.current,
                    scoreReport: report,
                    durationMinutes: Math.round(elapsedSeconds / 60)
                })
            });
            setAppPhase('score');
        } catch (err) {
            console.error('Evaluation error:', err);
            setScoreReport({ overallScore: 70, verdict: 'Maybe', summary: 'Evaluation failed, please try again.', skills: {}, strengths: [], improvements: [] });
            setAppPhase('score');
        }
    };

    const SCORE_SKILL_LABELS = {
        requirementsGathering: 'Requirements',
        architectureDesign: 'Architecture',
        scalabilityThinking: 'Scalability',
        tradeoffAnalysis: 'Trade-offs',
        communication: 'Communication',
        technicalDepth: 'Technical Depth'
    };

    if (!currentUser) return null;

    // ────────────────────────── SETUP PHASE ─────────────────────────────────
    if (appPhase === 'setup') {
        return (
            <div style={{ minHeight: '100vh', background: '#080b14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '2rem' }}>
                <div style={{ width: '100%', maxWidth: '540px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Cpu size={22} color="white" />
                            </div>
                        </div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.5px' }}>System Design Interview</h1>
                        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Topic-wise practice session</p>
                        <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', padding: '6px 16px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.75rem' }}>
                            🎯 {topic}
                        </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Role */}
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                                    <User size={13} /> Job Role *
                                </label>
                                <input
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    placeholder="e.g. Senior Software Engineer, Staff Engineer"
                                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>
                            {/* Company */}
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                                    <Building size={13} /> Company (optional)
                                </label>
                                <input
                                    value={company}
                                    onChange={e => setCompany(e.target.value)}
                                    placeholder="e.g. Google, Meta, Amazon"
                                    style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>
                            {/* Voice */}
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', display: 'block' }}>AI Interviewer Voice</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                    {VOICE_TEMPLATES.map(v => (
                                        <button
                                            key={v.id}
                                            onClick={() => setSelectedVoice(v)}
                                            style={{ padding: '0.6rem 0.5rem', borderRadius: '10px', border: `1px solid ${selectedVoice.id === v.id ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)'}`, background: selectedVoice.id === v.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', color: 'white', cursor: 'pointer', textAlign: 'center', fontSize: '0.8rem', transition: 'all 0.15s' }}
                                        >
                                            <div style={{ fontSize: '1rem' }}>{v.emoji}</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{v.name}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>{v.tag}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {setupError && <div style={{ background: 'rgba(239,71,67,0.1)', border: '1px solid rgba(239,71,67,0.3)', color: '#ef4743', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>{setupError}</div>}

                            <button
                                onClick={startInterview}
                                style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '0.5rem' }}
                            >
                                <Brain size={18} /> Start Interview
                            </button>
                        </div>
                    </div>
                    <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.3)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem', margin: '1.5rem auto 0', padding: 0 }}>
                        <ArrowLeft size={14} /> Back
                    </button>
                </div>
            </div>
        );
    }

    // ────────────────────────── SCORE PHASE ─────────────────────────────────
    if (appPhase === 'score' && scoreReport) {
        const verdict = scoreReport.verdict || 'Maybe';
        const verdictColor = verdict === 'Hire' ? '#00b8a3' : verdict === 'No Hire' ? '#ef4743' : '#ffa116';
        return (
            <div style={{ minHeight: '100vh', background: '#080b14', fontFamily: "'Inter', sans-serif", padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '760px', marginTop: '2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white', margin: 0 }}>Interview Complete!</h1>
                        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>System Design: {topic}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {/* Score Card */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <ScoreBadge score={scoreReport.overallScore || 0} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: verdictColor }}>{verdict}</div>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>Decision</div>
                            </div>
                        </div>
                        {/* Summary */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '2rem' }}>
                            <h3 style={{ color: 'white', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Summary</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, fontSize: '0.9rem', margin: 0 }}>{scoreReport.summary}</p>
                        </div>
                    </div>

                    {/* Skills */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Skill Breakdown</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                            {Object.entries(scoreReport.skills || {}).map(([key, val]) => {
                                const color = val >= 75 ? '#00b8a3' : val >= 50 ? '#ffa116' : '#ef4743';
                                return (
                                    <div key={key}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{SCORE_SKILL_LABELS[key] || key}</span>
                                            <span style={{ color, fontWeight: 600 }}>{val}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: '99px', transition: 'width 1s ease' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Strengths & Improvements */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'rgba(0,184,163,0.05)', border: '1px solid rgba(0,184,163,0.15)', borderRadius: '16px', padding: '1.5rem' }}>
                            <h3 style={{ color: '#00b8a3', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle2 size={15} /> Strengths
                            </h3>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(scoreReport.strengths || []).map((s, i) => (
                                    <li key={i} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', display: 'flex', gap: '8px' }}>
                                        <span style={{ color: '#00b8a3', flexShrink: 0 }}>•</span>{s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div style={{ background: 'rgba(255,161,22,0.05)', border: '1px solid rgba(255,161,22,0.15)', borderRadius: '16px', padding: '1.5rem' }}>
                            <h3 style={{ color: '#ffa116', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <TrendingUp size={15} /> Areas to Improve
                            </h3>
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(scoreReport.improvements || []).map((s, i) => (
                                    <li key={i} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', display: 'flex', gap: '8px' }}>
                                        <span style={{ color: '#ffa116', flexShrink: 0 }}>•</span>{s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/aiinterview')} style={{ padding: '0.9rem 2rem', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', color: '#818cf8', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
                            All Interviews
                        </button>
                        <button onClick={() => navigate('/systemdesign')} style={{ padding: '0.9rem 2rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
                            Practice Another Topic
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ────────────────────────── EVALUATING PHASE ─────────────────────────────
    if (appPhase === 'evaluating') {
        return (
            <div style={{ minHeight: '100vh', background: '#080b14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Loader2 size={48} color="#6366f1" style={{ animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }} />
                    <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Evaluating your interview...</h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>Analyzing your architecture decisions, communication, and technical depth</p>
                </div>
            </div>
        );
    }

    // ────────────────────────── INTERVIEW PHASE ───────────────────────────────
    return (
        <div style={{ height: '100vh', background: '#080b14', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>

            {/* ── Navbar ──────────────────────────────────────────────────── */}
            <nav style={{ height: '52px', background: 'rgba(8,11,20,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '8px', padding: '4px 12px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4743', animation: 'pulse 1s infinite' }} />
                        <span style={{ color: '#818cf8', fontSize: '0.78rem', fontWeight: 600 }}>LIVE — {topic}</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Role: {role}{company ? ` @ ${company}` : ''}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                        <Clock size={14} /> <span style={{ fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>{formatTime(elapsedSeconds)}</span>
                    </div>
                    <button onClick={() => setTtsEnabled(v => !v)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '6px', color: ttsEnabled ? '#818cf8' : 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex' }}>
                        {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                    <button
                        onClick={endInterview}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,71,67,0.15)', border: '1px solid rgba(239,71,67,0.3)', color: '#ef4743', padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                        <PhoneOff size={14} /> End Interview
                    </button>
                </div>
            </nav>

            {/* ── 3-Column Layout ────────────────────────────────────────── */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `${editorMinimized ? '40px' : '1fr'} ${whiteboardMinimized ? '40px' : '1fr'} 360px`, gap: 0, overflow: 'hidden', minHeight: 0 }}>

                {/* ── Column 1: Code Editor + Terminal ─────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', minHeight: 0 }}>
                    {/* Editor header */}
                    <div style={{ padding: editorMinimized ? '12px 4px' : '8px 12px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: editorMinimized ? 'center' : 'space-between', flexShrink: 0, flexDirection: editorMinimized ? 'column' : 'row', gap: editorMinimized ? 8 : 0 }}>
                        {!editorMinimized && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <Code2 size={14} color="rgba(255,255,255,0.5)" />
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600 }}>Code Editor</span>
                        </div>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: editorMinimized ? 'column' : 'row' }}>
                            {editorMinimized && <Code2 size={16} color="rgba(255,255,255,0.5)" />}
                            {!editorMinimized && (
                                <>
                                    <select
                                        value={language}
                                        onChange={e => setLanguage(e.target.value)}
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'rgba(255,255,255,0.7)', padding: '3px 8px', fontSize: '0.78rem', cursor: 'pointer', outline: 'none' }}
                                    >
                                        {Object.entries(LANG_OPTIONS).map(([k, v]) => (
                                            <option key={k} value={k} style={{ background: '#0f1117' }}>{v}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={runCode}
                                        disabled={isRunning}
                                        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: isRunning ? 'rgba(99,102,241,0.1)' : 'rgba(0,184,163,0.15)', border: `1px solid ${isRunning ? 'rgba(99,102,241,0.2)' : 'rgba(0,184,163,0.3)'}`, color: isRunning ? '#6366f1' : '#00b8a3', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: isRunning ? 'not-allowed' : 'pointer' }}
                                    >
                                        {isRunning ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={12} />}
                                        {isRunning ? 'Running…' : 'Run'}
                                    </button>
                                </>
                            )}
                            <button onClick={() => setEditorMinimized(v => !v)} title={editorMinimized ? 'Maximize' : 'Minimize'} style={{ background: 'transparent', border: '1px solid transparent', borderRadius: '6px', padding: '4px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}>
                                {editorMinimized ? <Maximize2 size={14} /> : <Minus size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Monaco editor */}
                    {!editorMinimized && (
                        <>
                            <div style={{ flex: terminalOpen ? '1 1 60%' : 1, minHeight: 0 }}>
                                <Editor
                                    height="100%"
                                    language={language === 'cpp' ? 'cpp' : language}
                                    value={code}
                                    onChange={v => setCode(v || '')}
                                    theme="vs-dark"
                                    options={{ fontSize: 13, minimap: { enabled: false }, lineNumbers: 'on', scrollBeyondLastLine: false, padding: { top: 12 }, fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
                                />
                            </div>
                            {/* Terminal */}
                            <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                                <button
                                    onClick={() => setTerminalOpen(v => !v)}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    <Terminal size={12} /> Terminal (Docker) {terminalOpen ? '▲' : '▼'}
                                </button>
                                {terminalOpen && (
                                    <div style={{ height: '160px', background: '#0a0a0f', padding: '12px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.82rem', color: terminalOutput.startsWith('Error') ? '#ef4743' : '#00b8a3', whiteSpace: 'pre-wrap' }}>
                                        {terminalOutput || <span style={{ color: 'rgba(255,255,255,0.2)' }}>$ Output will appear here after you Run code…</span>}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {editorMinimized && (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }} />
                    )}
                </div>

                {/* ── Column 2: Whiteboard ───────────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', background: '#0f1117' }}>
                    {/* Whiteboard toolbar */}
                    <div style={{ padding: whiteboardMinimized ? '12px 4px' : '8px 12px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: whiteboardMinimized ? 'center' : 'space-between', flexShrink: 0, flexDirection: whiteboardMinimized ? 'column' : 'row', gap: whiteboardMinimized ? 8 : 0 }}>
                        {!whiteboardMinimized && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <Layers size={14} color="rgba(255,255,255,0.5)" />
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600 }}>Whiteboard</span>
                        </div>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flexDirection: whiteboardMinimized ? 'column' : 'row' }}>
                            {whiteboardMinimized && <Layers size={16} color="rgba(255,255,255,0.5)" />}
                            {!whiteboardMinimized && <>
                            {/* Color picker */}
                            {['#818cf8', '#00b8a3', '#ffa116', '#ef4743', '#e2e8f0', '#f472b6'].map(c => (
                                <button key={c} onClick={() => { setPenColor(c); setTool('pen'); }}
                                    style={{ width: '18px', height: '18px', borderRadius: '50%', background: c, border: penColor === c && tool === 'pen' ? '2px solid white' : '2px solid transparent', cursor: 'pointer', padding: 0 }}
                                />
                            ))}
                            <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                            <button onClick={() => setTool('pen')} title="Pen" style={{ background: tool === 'pen' ? 'rgba(99,102,241,0.2)' : 'transparent', border: `1px solid ${tool === 'pen' ? 'rgba(99,102,241,0.4)' : 'transparent'}`, borderRadius: '6px', padding: '4px', color: tool === 'pen' ? '#818cf8' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}>
                                <Pen size={14} />
                            </button>
                            <button onClick={() => setTool('eraser')} title="Eraser" style={{ background: tool === 'eraser' ? 'rgba(239,71,67,0.1)' : 'transparent', border: `1px solid ${tool === 'eraser' ? 'rgba(239,71,67,0.3)' : 'transparent'}`, borderRadius: '6px', padding: '4px', color: tool === 'eraser' ? '#ef4743' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}>
                                <Eraser size={14} />
                            </button>
                            <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                            {/* Shapes */}
                            <button onClick={() => setTool('rect')} title="Rectangle" style={{ background: tool === 'rect' ? 'rgba(99,102,241,0.2)' : 'transparent', border: `1px solid ${tool === 'rect' ? 'rgba(99,102,241,0.4)' : 'transparent'}`, borderRadius: '6px', padding: '4px', color: tool === 'rect' ? '#818cf8' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', fontSize: '10px', fontWeight: 600 }}>□</button>
                            <button onClick={() => setTool('circle')} title="Circle" style={{ background: tool === 'circle' ? 'rgba(99,102,241,0.2)' : 'transparent', border: `1px solid ${tool === 'circle' ? 'rgba(99,102,241,0.4)' : 'transparent'}`, borderRadius: '6px', padding: '4px', color: tool === 'circle' ? '#818cf8' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', fontSize: '10px' }}>○</button>
                            <button onClick={() => setTool('line')} title="Line" style={{ background: tool === 'line' ? 'rgba(99,102,241,0.2)' : 'transparent', border: `1px solid ${tool === 'line' ? 'rgba(99,102,241,0.4)' : 'transparent'}`, borderRadius: '6px', padding: '4px', color: tool === 'line' ? '#818cf8' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', fontSize: '10px' }}>／</button>
                            <button onClick={() => setTool('arrow')} title="Arrow" style={{ background: tool === 'arrow' ? 'rgba(99,102,241,0.2)' : 'transparent', border: `1px solid ${tool === 'arrow' ? 'rgba(99,102,241,0.4)' : 'transparent'}`, borderRadius: '6px', padding: '4px', color: tool === 'arrow' ? '#818cf8' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}>
                                <ArrowLeft size={14} style={{ transform: 'rotate(-45deg)' }} />
                            </button>
                            <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                            {/* System design stamps */}
                            <button onClick={() => setTool('server')} title="Server" style={{ background: tool === 'server' ? 'rgba(99,102,241,0.2)' : 'transparent', border: `1px solid ${tool === 'server' ? 'rgba(99,102,241,0.4)' : 'transparent'}`, borderRadius: '6px', padding: '4px', color: tool === 'server' ? '#818cf8' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}>
                                <Server size={14} />
                            </button>
                            <button onClick={() => setTool('database')} title="Database" style={{ background: tool === 'database' ? 'rgba(99,102,241,0.2)' : 'transparent', border: `1px solid ${tool === 'database' ? 'rgba(99,102,241,0.4)' : 'transparent'}`, borderRadius: '6px', padding: '4px', color: tool === 'database' ? '#818cf8' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}>
                                <Database size={14} />
                            </button>
                            <button onClick={() => setTool('cache')} title="Cache" style={{ background: tool === 'cache' ? 'rgba(99,102,241,0.2)' : 'transparent', border: `1px solid ${tool === 'cache' ? 'rgba(99,102,241,0.4)' : 'transparent'}`, borderRadius: '6px', padding: '4px', color: tool === 'cache' ? '#818cf8' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}>
                                <HardDrive size={14} />
                            </button>
                            <button onClick={() => setTool('loadbalancer')} title="Load Balancer" style={{ background: tool === 'loadbalancer' ? 'rgba(99,102,241,0.2)' : 'transparent', border: `1px solid ${tool === 'loadbalancer' ? 'rgba(99,102,241,0.4)' : 'transparent'}`, borderRadius: '6px', padding: '4px', color: tool === 'loadbalancer' ? '#818cf8' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}>
                                <Layers size={14} />
                            </button>
                            <button onClick={() => setTool('api')} title="API" style={{ background: tool === 'api' ? 'rgba(99,102,241,0.2)' : 'transparent', border: `1px solid ${tool === 'api' ? 'rgba(99,102,241,0.4)' : 'transparent'}`, borderRadius: '6px', padding: '4px', color: tool === 'api' ? '#818cf8' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}>
                                <Globe size={14} />
                            </button>
                            <button onClick={() => setTool('queue')} title="Message Queue" style={{ background: tool === 'queue' ? 'rgba(99,102,241,0.2)' : 'transparent', border: `1px solid ${tool === 'queue' ? 'rgba(99,102,241,0.4)' : 'transparent'}`, borderRadius: '6px', padding: '4px', color: tool === 'queue' ? '#818cf8' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}>
                                <MessageSquare size={14} />
                            </button>
                            <button onClick={() => setTool('cdn')} title="CDN" style={{ background: tool === 'cdn' ? 'rgba(99,102,241,0.2)' : 'transparent', border: `1px solid ${tool === 'cdn' ? 'rgba(99,102,241,0.4)' : 'transparent'}`, borderRadius: '6px', padding: '4px', color: tool === 'cdn' ? '#818cf8' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex' }}>
                                <Cloud size={14} />
                            </button>
                            <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                            <button onClick={clearCanvas} title="Clear All" style={{ background: 'transparent', border: '1px solid transparent', borderRadius: '6px', padding: '4px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex' }}>
                                <Trash2 size={14} />
                            </button>
                            </>}
                            <button onClick={() => setWhiteboardMinimized(v => !v)} title={whiteboardMinimized ? 'Maximize' : 'Minimize'} style={{ background: 'transparent', border: '1px solid transparent', borderRadius: '6px', padding: '4px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', marginLeft: whiteboardMinimized ? 'auto' : 0 }}>
                                {whiteboardMinimized ? <Maximize2 size={14} /> : <Minus size={14} />}
                            </button>
                        </div>
                    </div>
                    {/* Canvas */}
                    {!whiteboardMinimized && <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        <canvas
                            ref={canvasRef}
                            width={800}
                            height={600}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: ['server','database','cache','loadbalancer','api','queue','cdn'].includes(tool) ? 'copy' : tool === 'eraser' ? 'cell' : 'crosshair', background: '#0f1117', touchAction: 'none' }}
                            onMouseDown={onCanvasMouseDown}
                            onMouseMove={onCanvasMouseMove}
                            onMouseUp={onCanvasMouseUp}
                            onMouseLeave={onCanvasMouseLeave}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        />
                        {!whiteboardText && (
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                <Layers size={40} color="rgba(255,255,255,0.05)" />
                                <p style={{ color: 'rgba(255,255,255,0.08)', fontSize: '0.9rem', marginTop: '0.75rem' }}>Draw your system architecture here<br />The AI can see what you draw</p>
                            </div>
                        )}
                    </div>}
                    {whiteboardMinimized && (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }} />
                    )}
                </div>

                {/* ── Column 3: AI Chat ───────────────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                    {/* Chat header */}
                    <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                            <Brain size={16} color="white" />
                            {isSpeaking && <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.6)', animation: 'ping 1s infinite' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>{selectedVoice.name} — AI Interviewer</div>
                            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>{isAiThinking ? 'Thinking...' : isSpeaking ? 'Speaking...' : 'Listening'}</div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
                        {transcript.length === 0 && (
                            <div style={{ textAlign: 'center', marginTop: '2rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem' }}>
                                Starting interview…
                            </div>
                        )}
                        {transcript.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '88%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    background: msg.role === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                                    border: '1px solid ' + (msg.role === 'user' ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'),
                                    color: 'rgba(255,255,255,0.85)',
                                    fontSize: '0.85rem', lineHeight: 1.6
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isAiThinking && (
                            <div style={{ display: 'flex' }}>
                                <div style={{ padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                                    {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#818cf8', animation: `bounce 1s ${i * 0.2}s infinite` }} />)}
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input area */}
                    <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
                            <textarea
                                value={userInput}
                                onChange={e => setUserInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                placeholder={isListening ? '🎙️ Listening...' : 'Type your answer or press mic...'}
                                rows={2}
                                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', padding: '8px 12px', fontSize: '0.85rem', resize: 'none', outline: 'none', fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <button
                                    onClick={toggleMic}
                                    style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: isListening ? 'rgba(239,71,67,0.2)' : 'rgba(255,255,255,0.07)', color: isListening ? '#ef4743' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                                </button>
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={isAiThinking || !userInput.trim()}
                                    style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: userInput.trim() ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)', color: userInput.trim() ? '#818cf8' : 'rgba(255,255,255,0.2)', cursor: userInput.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Send size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes ping { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            `}</style>
        </div>
    );
}
