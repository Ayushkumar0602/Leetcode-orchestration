import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Editor from '@monaco-editor/react';
import { 
    ShieldCheck, AlertCircle, CheckCircle, Clock, 
    Copy, Trash2, Info, ArrowRight, BookOpen,
    Terminal, Lock, Eye, Key, Share2, Sparkles
} from 'lucide-react';

export default function ToolsJWTDecoder() {
    const [token, setToken] = useState('');
    const [header, setHeader] = useState(null);
    const [payload, setPayload] = useState(null);
    const [error, setError] = useState('');
    const [expiryInfo, setExpiryInfo] = useState({ status: 'idle', message: '' });

    const decodeToken = (jwt) => {
        if (!jwt.trim()) {
            setHeader(null);
            setPayload(null);
            setError('');
            setExpiryInfo({ status: 'idle', message: '' });
            return;
        }

        try {
            const parts = jwt.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format. A JWT must have 3 parts separated by dots.');
            }

            const base64UrlDecode = (str) => {
                const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
                return decodeURIComponent(atob(base64).split('').map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
            };

            const decodedHeader = JSON.parse(base64UrlDecode(parts[0]));
            const decodedPayload = JSON.parse(base64UrlDecode(parts[1]));

            setHeader(decodedHeader);
            setPayload(decodedPayload);
            setError('');

            // Check Expiry
            if (decodedPayload.exp) {
                const expTime = decodedPayload.exp * 1000;
                const now = Date.now();
                const timeLeft = expTime - now;

                if (timeLeft < 0) {
                    setExpiryInfo({ 
                        status: 'expired', 
                        message: `Expired on ${new Date(expTime).toLocaleString()}` 
                    });
                } else {
                    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                    setExpiryInfo({ 
                        status: 'valid', 
                        message: `Expires in ${hours}h ${minutes}m (${new Date(expTime).toLocaleString()})` 
                    });
                }
            } else {
                setExpiryInfo({ status: 'no-exp', message: 'No expiration claim (exp) found in payload.' });
            }

        } catch (err) {
            setHeader(null);
            setPayload(null);
            setError(err.message);
            setExpiryInfo({ status: 'error', message: 'Decoding failed' });
        }
    };

    useEffect(() => {
        decodeToken(token);
    }, [token]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    };

    return (
        <div style={{ minHeight: '100vh', color: '#fff' }}>
            <Helmet>
                <title>Free Online JWT Decoder & Debugger | JSON Web Token Expiry Checker | Whizan AI</title>
                <meta name="description" content="Instantly decode and debug JSON Web Tokens (JWT) online. Whizan AI's premium JWT Decoder provides a 100% private, client-side breakdown of headers, payloads, and expiry status for backend developers." />
                <meta name="keywords" content="jwt decoder, jwt debugger online, check jwt expiry, json web token, jwt payload viewer, backend developer tools, auth debugger, free jwt tool, open source jwt decoder" />
                <meta property="og:title" content="Whizan AI | Premium JWT Decoder & Security Lab" />
                <meta property="og:description" content="Expert-grade JWT debugging. Decode payloads, check expiration timestamps, and understand JWT structure with Whizan AI." />
                <link rel="canonical" href="https://whizan.xyz/tools/jwt-decoder" />
            </Helmet>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck color="#f59e0b" size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>JWT Decoder</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Full client-side decoding. We never store or transmit your tokens.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', alignItems: 'start' }}>
                    {/* Input Panel */}
                    <div style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '25px', position: 'sticky', top: '90px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b' }}>ENCODED TOKEN</span>
                            <button onClick={() => setToken('')} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                        <textarea
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste your JWT here (header.payload.signature)..."
                            style={{
                                width: '100%',
                                height: '300px',
                                background: '#0a0a0f',
                                border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                padding: '20px',
                                color: '#e2e8f0',
                                fontSize: '1rem',
                                fontFamily: 'monospace',
                                resize: 'none',
                                outline: 'none'
                            }}
                        />
                        {error && (
                            <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', fontSize: '0.85rem' }}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', color: '#fff' }}>Quick Tips</h3>
                            <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: '0.85rem', color: '#94a3b8' }}>
                                <li style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}><Info size={14} color="#f59e0b" /> JWTs are usually sent in Authorization headers.</li>
                                <li style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}><Info size={14} color="#f59e0b" /> They are Base64URL encoded, not encrypted.</li>
                                <li style={{ display: 'flex', gap: '8px' }}><Info size={14} color="#f59e0b" /> Never share production secrets or keys.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Output Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Expiry Bar */}
                        {expiryInfo.status !== 'idle' && (
                            <div style={{ 
                                padding: '15px 25px', 
                                borderRadius: '16px', 
                                background: expiryInfo.status === 'valid' ? 'rgba(34, 197, 94, 0.1)' : expiryInfo.status === 'expired' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                border: '1px solid ' + (expiryInfo.status === 'valid' ? 'rgba(34, 197, 94, 0.2)' : expiryInfo.status === 'expired' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(148, 163, 184, 0.2)'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {expiryInfo.status === 'valid' ? <CheckCircle color="#22c55e" size={20} /> : <Clock color={expiryInfo.status === 'expired' ? '#ef4444' : '#94a3b8'} size={20} />}
                                    <span style={{ fontWeight: 600, color: expiryInfo.status === 'valid' ? '#22c55e' : expiryInfo.status === 'expired' ? '#ef4444' : '#94a3b8' }}>
                                        {expiryInfo.message}
                                    </span>
                                </div>
                                {expiryInfo.status === 'valid' && (
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: '#22c55e', color: '#fff' }}>LIVE</span>
                                )}
                            </div>
                        )}

                        {/* Header Section */}
                        <div style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                            <div style={{ padding: '15px 25px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px' }}>HEADER: ALGORITHM & TOKEN TYPE</span>
                                {header && <button onClick={() => copyToClipboard(header)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><Copy size={16} /></button>}
                            </div>
                            <div style={{ height: '150px' }}>
                                <Editor
                                    height="100%"
                                    defaultLanguage="json"
                                    theme="vs-dark"
                                    value={header ? JSON.stringify(header, null, 2) : '// Header content will appear here...'}
                                    options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 13, backgroundColor: '#0f172a' }}
                                />
                            </div>
                        </div>

                        {/* Payload Section */}
                        <div style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                            <div style={{ padding: '15px 25px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px' }}>PAYLOAD: DATA</span>
                                {payload && <button onClick={() => copyToClipboard(payload)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><Copy size={16} /></button>}
                            </div>
                            <div style={{ height: '350px' }}>
                                <Editor
                                    height="100%"
                                    defaultLanguage="json"
                                    theme="vs-dark"
                                    value={payload ? JSON.stringify(payload, null, 2) : '// Payload claims will appear here...'}
                                    options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 13 }}
                                />
                            </div>
                        </div>

                        {/* Signature Note */}
                        <div style={{ padding: '20px', background: 'rgba(139, 92, 246, 0.05)', border: '1px dashed rgba(139, 92, 246, 0.2)', borderRadius: '16px', display: 'flex', gap: '15px' }}>
                            <Lock color="#8b5cf6" size={24} />
                            <div>
                                <h4 style={{ margin: '0 0 5px', fontSize: '0.9rem', fontWeight: 700, color: '#c084fc' }}>Signature Handling</h4>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                                    This tool decodes token data for debugging. It does not verify the cryptographic signature. 
                                    To verify tokens, you must use your application's public/private key or secret.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Extensive SEO / AIO Content Section (200+ Lines) --- */}
                <div style={{ 
                    marginTop: '80px', 
                    padding: '80px 40px', 
                    background: 'rgba(15, 23, 42, 0.3)', 
                    borderRadius: '40px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    lineHeight: '1.8',
                    color: '#94a3b8'
                }}>
                    <section>
                        <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, marginBottom: '30px', letterSpacing: '-1px' }}>
                            The Ultimate Guide to JSON Web Tokens (JWT)
                        </h2>
                        <p style={{ fontSize: '1.2rem', marginBottom: '25px' }}>
                            Modern web security relies heavily on **JSON Web Tokens (JWT)** for stateless authentication. 
                            Our **Online JWT Decoder** is designed for backend engineers, security researchers, 
                            and full-stack developers who need a high-performance, private environment to 
                            debug authentication flows and verify token payloads instantly.
                        </p>
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', margin: '60px 0' }}>
                        <section>
                            <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Terminal size={26} color="#f59e0b" /> What is a JWT?
                            </h3>
                            <p>
                                A JWT is an open standard (RFC 7519) that defines a compact and self-contained 
                                way for securely transmitting information between parties as a JSON object. 
                                Because it's digitally signed, the information can be verified and trusted.
                            </p>
                            <p style={{ marginTop: '15px' }}>
                                JWTs consist of three parts separated by dots (`.`):
                            </p>
                            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                                <li style={{ marginBottom: '10px' }}>**Header**: Typically contains the algorithm (e.g., HS256, RS256).</li>
                                <li style={{ marginBottom: '10px' }}>**Payload**: Contains the claims (user data, expiry, etc.).</li>
                                <li style={{ marginBottom: '10px' }}>**Signature**: Created by signing the header and payload.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Lock size={26} color="#8b5cf6" /> Why Whizan AI Decoder?
                            </h3>
                            <p>
                                Unlike many common debuggers, our **JWT Decoder** prioritizes your privacy. 
                                All decoding logic runs strictly in your browser (client-side). Your sensitive 
                                authentication tokens never touch our backend servers, ensuring your 
                                development environment remains secure and compliant.
                            </p>
                            <ul style={{ listStyleType: 'none', padding: 0, marginTop: '15px' }}>
                                <li style={{ marginBottom: '12px', display: 'flex', gap: '10px' }}><ArrowRight size={18} color="#f59e0b" /> **Real-time Expiry Detection**</li>
                                <li style={{ marginBottom: '12px', display: 'flex', gap: '10px' }}><ArrowRight size={18} color="#f59e0b" /> **Deep Payload Analysis**</li>
                                <li style={{ display: 'flex', gap: '10px' }}><ArrowRight size={18} color="#f59e0b" /> **Zero Logging Policy**</li>
                            </ul>
                        </section>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '60px 0' }} />

                    <section>
                        <h3 style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, marginBottom: '30px' }}>
                            Standard JWT Claims Deciphered
                        </h3>
                        <p style={{ marginBottom: '40px' }}>
                            When you decode a JWT using our tool, you will see key-value pairs in the payload. 
                            These are called "claims". Understanding these is essential for building robust 
                            distributed systems.
                        </p>
                        
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                        <th style={{ padding: '20px', color: '#fff' }}>Claim Name</th>
                                        <th style={{ padding: '20px', color: '#fff' }}>Full Name</th>
                                        <th style={{ padding: '20px', color: '#fff' }}>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '20px', fontFamily: 'monospace', color: '#f59e0b' }}>sub</td>
                                        <td style={{ padding: '20px' }}>Subject</td>
                                        <td style={{ padding: '20px' }}>Uniquely identifies the user or principal.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '20px', fontFamily: 'monospace', color: '#f59e0b' }}>iss</td>
                                        <td style={{ padding: '20px' }}>Issuer</td>
                                        <td style={{ padding: '20px' }}>Identifies who issued the token (e.g., Auth0, Firebase).</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '20px', fontFamily: 'monospace', color: '#f59e0b' }}>exp</td>
                                        <td style={{ padding: '20px' }}>Expiration Time</td>
                                        <td style={{ padding: '20px' }}>Unix timestamp when the token becomes invalid.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '20px', fontFamily: 'monospace', color: '#f59e0b' }}>iat</td>
                                        <td style={{ padding: '20px' }}>Issued At</td>
                                        <td style={{ padding: '20px' }}>Timestamp when the token was generated.</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '20px', fontFamily: 'monospace', color: '#f59e0b' }}>aud</td>
                                        <td style={{ padding: '20px' }}>Audience</td>
                                        <td style={{ padding: '20px' }}>Intended recipient of the token (e.g., your API URL).</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section style={{ marginTop: '80px' }}>
                        <h3 style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, marginBottom: '25px' }}>
                            Security Best Practices for JWT Implementation
                        </h3>
                        <p style={{ marginBottom: '30px' }}>
                            Working with JWTs requires a high attention to security details. Here are professional 
                            strategies to keep your authentication layer secure:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>1. Use Strong Algorithms</h4>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Avoid the "none" algorithm at all costs. Prefer asymmetrical algorithms like **RS256** (RSA Signature with SHA-256) over HMACS if you have multiple consumers, as it allows verification via public keys.
                                </p>
                            </div>
                            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>2. Keep Payloads Concise</h4>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Remember that JWTs are **encoded**, not **encrypted**. Do not store passwords, PII (Personally Identifiable Information), or sensitive internal metadata in the payload claims.
                                </p>
                            </div>
                            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>3. Implement Short Expiry</h4>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Since JWTs are stateless and cannot be easily revoked, use short expiration times (e.g., 15 minutes) combined with a robust **Refresh Token** strategy.
                                </p>
                            </div>
                            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>4. Validate the 'aud' and 'iss'</h4>
                                <p style={{ fontSize: '0.9rem' }}>
                                    Always verify that the token was intended for your specific application. Checking the audience claim (`aud`) prevents token reuse across different services.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section style={{ marginTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                            <Sparkles color="#8b5cf6" size={40} />
                        </div>
                        <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px' }}>Join the Future of Backend Development</h2>
                        <p style={{ maxWidth: '800px', marginBottom: '40px', fontSize: '1.15rem' }}>
                            Mastering JWTs is just the beginning. Whizan AI provides a complete suite of developer 
                            tools designed to accelerate your workflow. From real-time SQL debugging to 
                            AI-powered infrastructure tests, elevate your engineering career with us.
                        </p>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button 
                                onClick={() => window.location.href = '/tools/api-tester'}
                                style={{ padding: '16px 32px', borderRadius: '15px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Try API Tester
                            </button>
                            <button 
                                onClick={() => window.location.href = '/tools/sql-editor'}
                                style={{ padding: '16px 32px', borderRadius: '15px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Open SQL Editor
                            </button>
                        </div>
                    </section>

                    <footer style={{ marginTop: '120px', paddingTop: '60px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
                            {[
                                'jwt-debugger', 'auth-flow-checker', 'decode-token-online', 'check-jwt-expiry',
                                'json-web-token-lab', 'security-debugging', 'backend-engineering',
                                'whizan-ai-security', 'online-auth-tools', 'developer-productivity'
                            ].map(tag => (
                                <span key={tag} style={{ fontSize: '0.8rem', color: '#64748b', background: 'rgba(255,255,255,0.02)', padding: '6px 15px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#475569', maxWidth: '900px', margin: '0 auto' }}>
                            **Disclaimer**: Whizan AI JWT Decoder is a debugging tool. While we use high-grade client-side 
                            logic, this tool is provided "as-is". Always verify your tokens in a secure production 
                            environment using official libraries. © 2026 Whizan AI Ecosystem.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
