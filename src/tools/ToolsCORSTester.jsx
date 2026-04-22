import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Editor from '@monaco-editor/react';
import { 
    ShieldAlert, Globe, Server, AlertCircle, 
    CheckCircle, Info, Loader2, Send, 
    ArrowRight, Box, Lock, Code2, Link
} from 'lucide-react';

export default function ToolsCORSTester() {
    const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts');
    const [method, setMethod] = useState('GET');
    const [origin, setOrigin] = useState('https://my-app.com');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    const handleTest = async () => {
        if (!url.trim()) return;
        setLoading(true);
        setResult(null);

        try {
            // Test 1: Preflight (OPTIONS)
            const preflightRes = await fetch('https://leetcode-orchestration.onrender.com/api/tools/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    method: 'OPTIONS',
                    url: url,
                    headers: {
                        'Origin': origin,
                        'Access-Control-Request-Method': method
                    }
                })
            });
            const preflightData = await preflightRes.json();

            // Test 2: Actual Request
            const actualRes = await fetch('https://leetcode-orchestration.onrender.com/api/tools/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    method: method,
                    url: url,
                    headers: { 'Origin': origin }
                })
            });
            const actualData = await actualRes.json();

            // Evaluate
            const allowOrigin = actualData.headers['access-control-allow-origin'];
            const allowMethods = preflightData.headers['access-control-allow-methods'];
            const allowCredentials = actualData.headers['access-control-allow-credentials'];

            let isCorsValid = false;
            let failureReason = [];

            if (!allowOrigin) {
                failureReason.push("Missing Access-Control-Allow-Origin header");
            } else if (allowOrigin !== '*' && allowOrigin !== origin) {
                failureReason.push(`Origin mismatch. Server expects: ${allowOrigin}`);
            } else {
                isCorsValid = true;
            }

            if (method !== 'GET' && method !== 'POST') {
                if (!allowMethods || !allowMethods.includes(method)) {
                    isCorsValid = false;
                    failureReason.push(`Method ${method} not explicitly allowed in preflight`);
                }
            }

            setResult({
                isCorsValid,
                failureReason,
                actualHeaders: actualData.headers,
                preflightHeaders: preflightData.headers
            });

        } catch (err) {
            setResult({
                error: err.message || 'Failed to reach proxy or target URL'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', color: '#fff' }}>
            <Helmet>
                <title>CORS Tester | Cross-Origin Policy Debugger | Whizan AI</title>
                <meta name="description" content="Debug CORS errors instantly. Test Cross-Origin Resource Sharing policies, analyze preflight OPTIONS requests, and view raw headers with Whizan AI." />
                <meta name="keywords" content="cors tester, debug cors, cross origin resource sharing, test cors online, preflight request, whizan ai" />
                <link rel="canonical" href="https://whizan.xyz/tools/cors-tester" />
            </Helmet>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldAlert color="#f59e0b" size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>CORS Diagnostic Tester</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Simulate browser security checks and debug your API's Cross-Origin policies.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '30px' }}>
                    {/* Controls */}
                    <div style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>
                                <Globe size={16} /> TARGET ENDPOINT
                            </label>
                            <input 
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://api.domain.com/data"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 15px', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                                <Server size={16} /> REQUEST METHOD
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                {methods.map(m => (
                                    <button 
                                        key={m}
                                        onClick={() => setMethod(m)}
                                        style={{ padding: '8px', borderRadius: '8px', border: 'none', background: method === m ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)', color: method === m ? '#f59e0b' : '#94a3b8', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                                <Link size={16} /> SIMULATED ORIGIN HEADER
                            </label>
                            <input 
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                placeholder="http://localhost:3000"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 15px', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
                            />
                        </div>
                        <button 
                            onClick={handleTest}
                            disabled={loading || !url}
                            style={{ marginTop: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            {loading ? 'Analyzing Headers...' : 'Run CORS Audit'}
                        </button>
                    </div>

                    {/* Results */}
                    <div style={{ background: '#0a0a0f', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 800, color: '#94a3b8' }}>AUDIT REPORT</div>
                        </div>
                        <div style={{ flex: 1, padding: '25px', overflowY: 'auto' }}>
                            {!result && !loading && (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3, textAlign: 'center' }}>
                                    <ShieldAlert size={64} style={{ marginBottom: '20px' }} />
                                    <h2>Ready for Inspection</h2>
                                    <p>Enter an endpoint and origin to simulate browser behavior.</p>
                                </div>
                            )}

                            {result && result.error && (
                                <div style={{ padding: '30px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '16px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <AlertCircle size={32} color="#ef4444" />
                                    <div>
                                        <h3 style={{ color: '#ef4444', marginBottom: '5px' }}>Connection Failure</h3>
                                        <p>{result.error}</p>
                                    </div>
                                </div>
                            )}

                            {result && !result.error && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                    {/* Verdict */}
                                    <div style={{ padding: '25px', borderRadius: '16px', background: result.isCorsValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${result.isCorsValid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        {result.isCorsValid ? <CheckCircle size={40} color="#10b981" /> : <AlertCircle size={40} color="#ef4444" />}
                                        <div>
                                            <h2 style={{ color: result.isCorsValid ? '#10b981' : '#ef4444', marginBottom: '5px' }}>
                                                {result.isCorsValid ? 'CORS Check Passed' : 'Browser Blocked (CORS Error)'}
                                            </h2>
                                            {!result.isCorsValid && result.failureReason.map((reason, i) => (
                                                <p key={i} style={{ color: '#fca5a5', fontSize: '0.9rem', marginTop: '5px' }}>• {reason}</p>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Detailed Headers */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <h4 style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 800, marginBottom: '15px' }}>PREFLIGHT HEADERS (OPTIONS)</h4>
                                            {Object.entries(result.preflightHeaders || {})
                                                .filter(([k]) => k.toLowerCase().includes('access-control'))
                                                .map(([k, v]) => (
                                                <div key={k} style={{ marginBottom: '10px' }}>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{k}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontFamily: 'monospace' }}>{v}</div>
                                                </div>
                                            ))}
                                            {Object.keys(result.preflightHeaders || {}).filter(k => k.toLowerCase().includes('access-control')).length === 0 && (
                                                <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>No Access-Control headers returned.</span>
                                            )}
                                        </div>
                                        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <h4 style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 800, marginBottom: '15px' }}>ACTUAL REQUEST HEADERS</h4>
                                            {Object.entries(result.actualHeaders || {})
                                                .filter(([k]) => k.toLowerCase().includes('access-control'))
                                                .map(([k, v]) => (
                                                <div key={k} style={{ marginBottom: '10px' }}>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{k}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#10b981', fontFamily: 'monospace' }}>{v}</div>
                                                </div>
                                            ))}
                                            {Object.keys(result.actualHeaders || {}).filter(k => k.toLowerCase().includes('access-control')).length === 0 && (
                                                <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>No Access-Control headers returned.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SEO Section (200+ lines) */}
                <div style={{ 
                    marginTop: '80px', 
                    padding: '80px 40px', 
                    background: 'rgba(15, 23, 42, 0.3)', 
                    borderRadius: '40px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    lineHeight: '1.8',
                    color: '#94a3b8'
                }}>
                    <h2 style={{ color: '#fff', fontSize: '2.4rem', fontWeight: 900, marginBottom: '40px' }}>Understanding Cross-Origin Resource Sharing (CORS)</h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
                        CORS is one of the most misunderstood and frequently encountered security mechanics in modern web development. 
                        It is a critical component of the browser's **Same-Origin Policy**, which dictates that a web application 
                        can only request resources from the same origin (domain, protocol, and port) from which it was loaded.
                        However, in microservice architectures, fetching APIs hosted on different subdomains or third-party servers 
                        is the norm, which is where CORS bridges the gap safely.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', margin: '60px 0' }}>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: '15px' }}>The Preflight Request</h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                For complex requests (like PUT, DELETE, or requests with custom headers like Authorization), 
                                the browser sends an `OPTIONS` request first. This is called the "preflight". The server must 
                                respond with `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers` to grant permission 
                                for the actual request to proceed.
                            </p>
                        </div>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: '15px' }}>Access-Control-Allow-Origin</h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                This is the flagship header of CORS. It tells the browser exactly which remote domains are allowed 
                                to read the response. While setting it to `*` is easy, it is a massive security risk if the API 
                                returns sensitive user data, because any site on the internet could perform malicious background reads.
                            </p>
                        </div>
                    </div>

                    <section style={{ marginTop: '50px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>Why CORS Exists</h3>
                        <p style={{ marginBottom: '20px' }}>
                            Imagine you are logged into your banking website. In another tab, you visit a malicious blog. 
                            Without the Same-Origin Policy, malicious scripts on the blog could silently send an AJAX request to 
                            `bank.com/api/transfer`. Because your bank cookies are automatically sent with the request, the 
                            transaction would succeed.
                        </p>
                        <p>
                            CORS ensures that even if the malicious blog fires the request, the bank's server will not 
                            return an `Access-Control-Allow-Origin` for the blog's domain, and the browser will **block the response** 
                            from being read by the attacker's script. Remember: CORS protects the *client (browser)* from reading unauthorized data, 
                            it does not inherently stop the request from reaching the server.
                        </p>
                    </section>

                    <section style={{ marginTop: '50px', padding: '40px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '32px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                        <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px' }}>Fixing CORS Errors in Production</h4>
                        <p style={{ marginBottom: '15px' }}>
                            If our CORS Tester flags your endpoint red, you need to configure your backend server (Express, Django, Spring Boot) 
                            to explicitly emit the correct headers. For Node.js/Express, the simplest method is utilizing the `cors` middleware:
                        </p>
                        <pre style={{ background: '#0a0a0f', padding: '20px', borderRadius: '12px', color: '#10b981', overflowX: 'auto' }}>
{`// Express.js Example
const cors = require('cors');

app.use(cors({
    origin: 'https://my-frontend.com',
    methods: ['GET', 'POST', 'PUT'],
    credentials: true
}));`}
                        </pre>
                        <p style={{ marginTop: '15px', fontSize: '0.85rem' }}>
                            Setting `credentials: true` allows the browser to send cookies across domains. However, if you enable this, 
                            you **cannot** use the wildcard `*` for the origin. You must specify the exact domain string.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
