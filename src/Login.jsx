import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { auth } from './firebase';
import {
    Mail, Lock, Eye, EyeOff, AlertCircle, Loader2,
    Sparkles, Terminal, Shield, Zap
} from 'lucide-react';
import './Login.css';
import { useSEO } from './hooks/useSEO';
import OnboardingFlow from './components/OnboardingFlow';

/* ─── Icons ────────────────────────────────────────────────────── */
const GithubIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
);

const GoogleIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

/* ─── Particle Canvas ─────────────────────────────────────────── */
function ParticleCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        let particles = [];

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const CODE_CHARS = ['0', '1', '{', '}', '()', '=>', '++', 'fn', 'AI', '</>', '∞', '∑', 'λ'];

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = -20;
                this.vy = 0.4 + Math.random() * 0.8;
                this.alpha = 0;
                this.maxAlpha = 0.08 + Math.random() * 0.18;
                this.char = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
                this.size = 11 + Math.random() * 6;
                this.hue = Math.random() > 0.5 ? '168, 85, 247' : '59, 130, 246';
            }
            update() {
                this.y += this.vy;
                this.alpha = Math.min(this.alpha + 0.003, this.maxAlpha);
                if (this.y > canvas.height + 20) this.reset();
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = `rgba(${this.hue}, 1)`;
                ctx.font = `${this.size}px 'JetBrains Mono', monospace`;
                ctx.fillText(this.char, this.x, this.y);
                ctx.restore();
            }
        }

        for (let i = 0; i < 60; i++) {
            const p = new Particle();
            p.y = Math.random() * canvas.height;
            p.alpha = Math.random() * p.maxAlpha;
            particles.push(p);
        }

        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            animId = requestAnimationFrame(loop);
        };
        loop();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="cinema-canvas" />;
}

/* ─── Animation Variants ──────────────────────────────────────── */
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.6 } } };

/* ─── Helpers ─────────────────────────────────────────────────── */
function Banner({ message, type = 'error' }) {
    if (!message) return null;
    return (
        <motion.div
            className={`auth-banner auth-banner-${type}`}
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        >
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{message}</span>
        </motion.div>
    );
}

function PasswordField({ value, onChange, placeholder = 'Password', id, autoComplete }) {
    const [show, setShow] = useState(false);
    return (
        <div className="auth-field">
            <span className="auth-field-icon"><Lock size={16} /></span>
            <input
                id={id} type={show ? 'text' : 'password'} className="auth-input has-right"
                placeholder={placeholder} value={value} onChange={onChange} autoComplete={autoComplete}
            />
            <button type="button" className="auth-password-toggle" onClick={() => setShow(s => !s)} tabIndex={-1}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    );
}

/* ─── Main Component ──────────────────────────────────────────── */
export default function Login() {
    const { loginWithGoogle, loginWithGithub, signupWithEmail, loginWithEmail, sendMagicLink, signInWithMagicLink, updateUserProfile, currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const pollingRef = useRef(null);

    useSEO({
        title: 'Sign In – Whizan AI',
        description: 'Sign in or create a free Whizan AI account to access AI mock interviews, 1800+ DSA problems, system design practice, and your developer portfolio.',
        canonical: '/login',
        robots: 'noindex, nofollow',
    });

    const params = new URLSearchParams(location.search);
    const redirectUrl = params.get('redirect') || '/dashboard';

    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutTime, setLockoutTime] = useState(0);

    const initialView = location.pathname === '/signup' ? 'signup' : 'login';
    const [view, setView] = useState(initialView);
    const [authMethod, setAuthMethod] = useState('password');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);

    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');

    // Handle Magic Link callback
    useEffect(() => {
        import('firebase/auth').then(({ isSignInWithEmailLink }) => {
            if (isSignInWithEmailLink(auth, window.location.href)) {
                let saved = window.localStorage.getItem('emailForSignIn') || window.prompt('Confirm your email:');
                if (saved) {
                    setLoading(true);
                    signInWithMagicLink(saved, window.location.href)
                        .then(r => { if (!r.user.displayName) setView('onboarding'); else navigate(redirectUrl, { replace: true }); })
                        .catch(err => setError(friendly(err)))
                        .finally(() => setLoading(false));
                }
            }
        });
    }, []);

    useEffect(() => {
        if (currentUser?.emailVerified && view !== 'onboarding') {
            // Check first-time user: no displayName = definitely first time
            const isFirstTime = !currentUser.displayName || localStorage.getItem(`onboarded_${currentUser.uid}`) !== 'true';
            if (isFirstTime && !currentUser.displayName) setView('onboarding');
            else navigate(redirectUrl, { replace: true });
        }
    }, [currentUser]);

    useEffect(() => {
        if (lockoutTime > 0) {
            const t = setTimeout(() => setLockoutTime(l => l - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [lockoutTime]);

    useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current); }, []);

    function startPolling() {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = setInterval(async () => {
            try {
                await auth.currentUser?.reload();
                if (auth.currentUser?.emailVerified) {
                    clearInterval(pollingRef.current); pollingRef.current = null;
                    setView('onboarding');
                }
            } catch { /* ignore poll errors */ }
        }, 3000);
    }

    function increaseFailure() {
        const n = failedAttempts + 1;
        setFailedAttempts(n);
        if (n >= 3) { setLockoutTime(30); setError('Too many attempts. Wait 30s.'); }
    }

    async function handleOAuth(method) {
        setError(''); if (lockoutTime > 0) return; setLoading(true);
        try {
            const r = await method();
            if (typeof window !== 'undefined' && window.gtag) window.gtag('event', 'login', { method: r.providerId });
            // For OAuth: route to onboarding if no display name or never onboarded
            const neverOnboarded = localStorage.getItem(`onboarded_${r.user.uid}`) !== 'true';
            if (!r.user.displayName || neverOnboarded) setView('onboarding');
            else navigate(redirectUrl, { replace: true });
        } catch (err) {
            if (err.code === 'auth/account-exists-with-different-credential')
                setError('Account exists with another sign-in method.');
            else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                setError(friendly(err)); increaseFailure();
            }
        } finally { setLoading(false); }
    }

    async function handleLogin(e) {
        e.preventDefault(); setError(''); if (lockoutTime > 0) return;
        if (authMethod === 'magiclink') {
            if (!email) { setError('Email required.'); return; }
            setLoading(true);
            try { await sendMagicLink(email); setPendingEmail(email); setView('magic-sent'); }
            catch (err) { setError(friendly(err)); }
            finally { setLoading(false); } return;
        }
        setLoading(true);
        try {
            const { browserSessionPersistence, browserLocalPersistence, setPersistence } = await import('firebase/auth');
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            const r = await loginWithEmail(email, password);
            if (!r.user.emailVerified) { setPendingEmail(email); setView('verify-email'); startPolling(); return; }
            if (!r.user.displayName) setView('onboarding'); else navigate(redirectUrl, { replace: true });
        } catch (err) { setError(friendly(err)); increaseFailure(); }
        finally { setLoading(false); }
    }

    async function handleSignup(e) {
        e.preventDefault(); setError(''); if (lockoutTime > 0) return;
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (password.length < 6) { setError('Password must be 6+ characters.'); return; }
        setLoading(true);
        try {
            await signupWithEmail(email, password);
            if (typeof window !== 'undefined' && window.gtag) window.gtag('event', 'sign_up', { method: 'password' });
            setPendingEmail(email); setView('verify-email'); startPolling();
        } catch (err) { setError(friendly(err)); }
        finally { setLoading(false); }
    }

    function friendly(err) {
        const m = { 'auth/email-already-in-use': 'Email is already registered. Try signing in.', 'auth/invalid-email': 'Invalid email.', 'auth/wrong-password': 'Wrong password.', 'auth/invalid-credential': 'Incorrect email or password.', 'auth/user-not-found': 'No account found. Sign up first.', 'auth/too-many-requests': 'Too many attempts. Please wait.' };
        return m[err.code] || err.message || 'Something went wrong.';
    }

    const isLocked = lockoutTime > 0;
    const isLogin = view === 'login';

    /* ── Sub-screens ─────────────────────────────────────────────── */
    if (view === 'verify-email' || view === 'magic-sent') {
        return (
            <div className="auth-page">
                <CinemaPanel />
                <div className="auth-panel">
                    <motion.div className="auth-box" initial="hidden" animate="show" variants={stagger}>
                        <motion.div variants={item} className="auth-fullscreen">
                            <div className="auth-icon-ring"><Mail size={26} color="#60a5fa" /></div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Check your inbox</h2>
                            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                                {view === 'magic-sent' ? 'Magic link sent to' : 'Verification email sent to'}
                            </p>
                            <div className="auth-email-badge">{pendingEmail}</div>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 340 }}>
                                {view === 'verify-email' ? 'Click the link to verify your email. This page will advance automatically.' : 'Click the link to instantly sign in. You can close this tab.'}
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (view === 'onboarding') {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--ob-bg, #030508)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1rem',
                fontFamily: "'Inter', system-ui, sans-serif"
            }}>
                <OnboardingFlow redirectUrl={redirectUrl} />
            </div>
        );
    }

    /* ── Main Login / Signup ──────────────────────────────────────── */
    return (
        <div className="auth-page">
            <CinemaPanel />
            <div className="auth-panel">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        className="auth-box"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.45 }}
                    >
                        <motion.div className="mobile-brand" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <img src="/logo.jpeg" alt="Whizan AI" onError={e => e.target.style.display = 'none'} />
                            <span>Whizan AI</span>
                        </motion.div>

                        <motion.div initial="hidden" animate="show" variants={stagger}>
                            <motion.div variants={item}>
                                <h1 className="auth-box-title">{isLogin ? 'Welcome back' : 'Create account'}</h1>
                                <p className="auth-box-sub">{isLogin ? 'Sign in to your interview prep workspace.' : 'Join the elite coding community today.'}</p>
                            </motion.div>

                            <Banner message={error} />

                            {/* Social buttons */}
                            <motion.div variants={item} className="auth-social">
                                <button className="auth-social-btn" onClick={() => handleOAuth(loginWithGoogle)} disabled={loading || isLocked}>
                                    <GoogleIcon size={18} /> Continue with Google
                                </button>
                                <button className="auth-social-btn" onClick={() => handleOAuth(loginWithGithub)} disabled={loading || isLocked}>
                                    <GithubIcon size={18} /> Continue with GitHub
                                </button>
                            </motion.div>

                            <motion.div variants={item} className="auth-or-divider">or continue with email</motion.div>

                            {/* Tabs */}
                            <motion.div variants={item} className="auth-mode-tabs">
                                <button className={`auth-mode-tab ${isLogin ? 'active' : ''}`} onClick={() => { setView('login'); setError(''); setAuthMethod('password'); }}>Sign In</button>
                                <button className={`auth-mode-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setView('signup'); setError(''); }}>Sign Up</button>
                            </motion.div>

                            <AnimatePresence mode="wait">
                                {isLogin ? (
                                    <motion.form key="login-form" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} onSubmit={handleLogin} noValidate>
                                        <motion.div variants={item} className="auth-field">
                                            <span className="auth-field-icon"><Mail size={16} /></span>
                                            <input type="email" className="auth-input" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
                                        </motion.div>

                                        <AnimatePresence mode="wait">
                                            {authMethod === 'password' && (
                                                <motion.div key="pw" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                                    <PasswordField value={password} onChange={e => setPassword(e.target.value)} />
                                                    <motion.div className="auth-row">
                                                        <div className="auth-check-wrap">
                                                            <input type="checkbox" id="rm" className="auth-checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                                                            <label htmlFor="rm" className="auth-check-label">Remember me</label>
                                                        </div>
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <motion.button variants={item} className="auth-primary-btn" type="submit" disabled={loading || isLocked}>
                                            {loading ? <Loader2 size={16} className="spin" /> : isLocked ? `Locked · ${lockoutTime}s` : authMethod === 'password' ? 'Sign In' : 'Send Magic Link ✨'}
                                        </motion.button>
                                        <motion.button variants={item} type="button" className="auth-secondary-btn"
                                            onClick={() => { setAuthMethod(a => a === 'password' ? 'magiclink' : 'password'); setError(''); }}
                                            disabled={loading || isLocked}>
                                            {authMethod === 'password'
                                                ? <><Sparkles size={15} /> Sign in with Magic Link</>
                                                : <><Lock size={15} /> Use password instead</>
                                            }
                                        </motion.button>
                                    </motion.form>
                                ) : (
                                    <motion.form key="signup-form" variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0 }} onSubmit={handleSignup} noValidate>
                                        <motion.div variants={item} className="auth-field">
                                            <span className="auth-field-icon"><Mail size={16} /></span>
                                            <input type="email" className="auth-input" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
                                        </motion.div>
                                        <motion.div variants={item}><PasswordField value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (6+ chars)" /></motion.div>
                                        <motion.div variants={item}><PasswordField value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" /></motion.div>
                                        <motion.button variants={item} className="auth-primary-btn" type="submit" disabled={loading || isLocked}>
                                            {loading ? <Loader2 size={16} className="spin" /> : isLocked ? `Locked · ${lockoutTime}s` : 'Create Account'}
                                        </motion.button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.6 } }} className="auth-trust">
                            <Shield size={12} style={{ opacity: 0.5 }} /> 256-bit encrypted
                            <div className="auth-trust-dot" />
                            No credit card required
                            <div className="auth-trust-dot" />
                            Cancel anytime
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

/* ─── LEFT: Cinema Panel ──────────────────────────────────────── */
function CinemaPanel() {
    return (
        <div className="auth-cinema">
            <div className="auth-cinema-bg" />
            <div className="cinema-orb orb-a" />
            <div className="cinema-orb orb-b" />
            <div className="cinema-orb orb-c" />
            <div className="cinema-grid" />
            <ParticleCanvas />

            <div className="cinema-content">
                {/* Brand */}
                <motion.div className="cinema-brand" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.7 }}>
                    <img src="/logo.jpeg" alt="Whizan AI" className="cinema-logo" onError={e => e.target.style.display = 'none'} />
                    <span className="cinema-brand-name">Whizan AI</span>
                </motion.div>

                {/* Center content */}
                <motion.div className="cinema-headline" initial="hidden" animate="show" variants={stagger}>
                    <motion.div variants={item} className="cinema-badge">
                        <div className="badge-dot" />
                        AI-Powered · Used by 5,000+ Engineers
                    </motion.div>
                    <motion.h1 variants={item} className="cinema-title">
                        Master the<br />coding interview<br />with <span className="grad">AI</span>
                    </motion.h1>
                    <motion.p variants={item} className="cinema-subtitle">
                        Practice real interview scenarios with a voice-powered AI that adapts, challenges, and scores you like a real interviewer would.
                    </motion.p>
                    <motion.div variants={item} className="cinema-stats">
                        {[{ val: '250+', label: 'Top company problems' }, { val: '6/10', label: 'Avg. score boost' }, { val: '4.9★', label: 'User rating' }].map(s => (
                            <div key={s.label} className="cinema-stat">
                                <span className="stat-value">{s.val}</span>
                                <span className="stat-label">{s.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Footer companies */}
                <motion.div className="cinema-footer" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.7 } }}>
                    <span className="cinema-footer-text" style={{ fontSize: '0.75rem' }}>Used by engineers from</span>
                    <div className="cinema-company-logos">
                        {['Google', 'Meta', 'Amazon', 'Microsoft'].map((c, i) => (
                            <div key={c} className={`company-chip ${i === 0 ? 'hot' : ''}`}>{c}</div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
