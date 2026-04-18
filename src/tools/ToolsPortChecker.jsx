import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
    Radar, Server, Network, Shield,
    Play, Loader2, AlertCircle, CheckCircle,
    Terminal, ArrowRight, Activity, Clock
} from 'lucide-react';

export default function ToolsPortChecker() {
    const [host, setHost] = useState('8.8.8.8');
    const [port, setPort] = useState('53');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);

    const commonPorts = [
        { port: 21, service: 'FTP' },
        { port: 22, service: 'SSH' },
        { port: 25, service: 'SMTP' },
        { port: 53, service: 'DNS' },
        { port: 80, service: 'HTTP' },
        { port: 443, service: 'HTTPS' },
        { port: 3306, service: 'MySQL' },
        { port: 5432, service: 'PostgreSQL' },
        { port: 6379, service: 'Redis' },
        { port: 8080, service: 'Dev Server' }
    ];

    const checkPort = async (targetHost = host, targetPort = port) => {
        if (!targetHost.trim() || !targetPort) return;
        setLoading(true);
        setResult(null);

        const startTime = Date.now();

        try {
            const res = await fetch('http://localhost:3001/api/tools/port-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ host: targetHost.trim(), port: parseInt(targetPort) })
            });
            const data = await res.json();
            
            const timeTaken = Date.now() - startTime;
            
            if (data.error) {
                setResult({ error: data.error });
            } else {
                const newResult = {
                    host: data.host,
                    port: data.port,
                    status: data.status, // 'open', 'closed', 'timeout'
                    timeMs: timeTaken,
                    timestamp: new Date().toLocaleTimeString()
                };
                setResult(newResult);
                setHistory(prev => [newResult, ...prev].slice(0, 10)); // Keep last 10
            }
        } catch (err) {
            setResult({ error: 'Failed to contact backend scanning service' });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        if (status === 'open') return '#10b981'; // Green
        if (status === 'closed') return '#ef4444'; // Red
        return '#f59e0b'; // Yellow for timeout/filtered
    };

    return (
        <div style={{ minHeight: '100vh', color: '#fff' }}>
            <Helmet>
                <title>TCP Port Checker | Open Port Scanner | Whizan AI</title>
                <meta name="description" content="Perform raw TCP handshakes to check if remote ports are open, closed, or filtered by a firewall. Premium network diagnostics by Whizan AI." />
                <meta name="keywords" content="port checker, open port scanner, tcp connection test, firewall test, ping port online" />
                <link rel="canonical" href="https://whizan.xyz/tools/port-checker" />
            </Helmet>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Radar color="#06b6d4" size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>TCP Port Scanner</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Verify outside reachability and firewall rules through raw TCP sockets.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr', gap: '30px' }}>
                    
                    {/* Scanner Console */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Input Area */}
                        <div style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 2 }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}><Server size={14} /> HOSTNAME / IP</label>
                                    <input 
                                        value={host}
                                        onChange={(e) => setHost(e.target.value)}
                                        placeholder="192.168.1.1 or github.com"
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 15px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}><Network size={14} /> PORT</label>
                                    <input 
                                        type="number"
                                        value={port}
                                        onChange={(e) => setPort(e.target.value)}
                                        placeholder="80"
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 15px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={() => checkPort()}
                                disabled={loading}
                                style={{ width: '100%', marginTop: '20px', background: 'linear-gradient(135deg, #06b6d4, #0284c7)', border: 'none', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                                {loading ? 'Establishing TCP Handshake...' : 'Scan Port'}
                            </button>
                        </div>

                        {/* Visual Result */}
                        <div style={{ background: '#0a0a0f', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '250px' }}>
                            {!result && !loading && (
                                <div style={{ opacity: 0.2, textAlign: 'center' }}>
                                    <Terminal size={64} style={{ marginBottom: '15px' }} />
                                    <h3>Awaiting Target Coordinates</h3>
                                </div>
                            )}

                            {loading && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#06b6d4' }}>
                                    <Radar size={64} className="animate-pulse" />
                                    <h3 style={{ marginTop: '20px' }}>Scanning {host}:{port}</h3>
                                </div>
                            )}

                            {result && result.error && (
                                <div style={{ color: '#ef4444', textAlign: 'center' }}>
                                    <AlertCircle size={48} style={{ marginBottom: '15px' }} />
                                    <h3>Scan Failed</h3>
                                    <p>{result.error}</p>
                                </div>
                            )}

                            {result && !result.error && !loading && (
                                <div style={{ textAlign: 'center' }}>
                                    {result.status === 'open' && <CheckCircle size={64} color="#10b981" style={{ marginBottom: '15px' }} />}
                                    {result.status === 'closed' && <AlertCircle size={64} color="#ef4444" style={{ marginBottom: '15px' }} />}
                                    {result.status === 'timeout' && <Shield size={64} color="#f59e0b" style={{ marginBottom: '15px' }} />}
                                    
                                    <h2 style={{ fontSize: '2rem', color: getStatusColor(result.status), textTransform: 'uppercase', marginBottom: '10px' }}>
                                        {result.status === 'timeout' ? 'FILTERED / TIMEOUT' : result.status}
                                    </h2>
                                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                                        Target <strong>{result.host}:{result.port}</strong> responded in {result.timeMs}ms
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Ports & History */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '25px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '15px' }}>COMMON SERVICES</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {commonPorts.map(cp => (
                                    <button 
                                        key={cp.port}
                                        onClick={() => { setPort(cp.port.toString()); checkPort(host, cp.port.toString()); }}
                                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', cursor: 'pointer', transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    >
                                        <span style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 800 }}>PORT {cp.port}</span>
                                        <span style={{ fontSize: '0.85rem' }}>{cp.service}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {history.length > 0 && (
                            <div style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '25px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={14} /> SCAN HISTORY</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {history.map((h, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px 15px', borderRadius: '10px', borderLeft: `3px solid ${getStatusColor(h.status)}` }}>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{h.host}:{h.port}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10} /> {h.timestamp}</div>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: getStatusColor(h.status), textTransform: 'uppercase' }}>
                                                {h.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Extended SEO Section */}
                <div style={{ 
                    marginTop: '80px', 
                    padding: '80px 40px', 
                    background: 'rgba(15, 23, 42, 0.3)', 
                    borderRadius: '40px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    lineHeight: '1.8',
                    color: '#94a3b8'
                }}>
                    <h2 style={{ color: '#fff', fontSize: '2.4rem', fontWeight: 900, marginBottom: '40px' }}>Understanding Network Ports & Firewalls</h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
                        In computer networking, an IP address identifies the machine, while a **Port** identifies the specific 
                        process or service running on that machine. The Whizan AI **Port Scanner** bypasses high-level HTTP protocols 
                        and attempts to perform a raw **TCP Three-Way Handshake** (SYN, SYN-ACK, ACK) with the specified target. 
                        The result of this handshake reveals the precise connectivity state of your infrastructure.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', margin: '60px 0' }}>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <h3 style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 800, marginBottom: '15px' }}>OPEN</h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                An application (like Nginx, SSHd, or MySQL) is actively listening on this port. The server sent 
                                a `SYN-ACK` packet in response to our `SYN`. If this is a database port (e.g., 3306) and the server 
                                is public, this represents a massive security risk unless bound to localhost.
                            </p>
                        </div>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <h3 style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 800, marginBottom: '15px' }}>CLOSED</h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                The host is online, but no application is actively listening on this specific port. The server cleanly 
                                rejected the connection by responding with an `RST` (Reset) packet. The machine is reachable, but the service is down.
                            </p>
                        </div>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                            <h3 style={{ color: '#f59e0b', fontSize: '1.2rem', fontWeight: 800, marginBottom: '15px' }}>FILTERED / TIMEOUT</h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                The scanner sent a `SYN` packet but received no response whatsoever until the timeout limit. This implies 
                                that a Firewall (like AWS Security Groups, iptables, or Cloudflare) intercepted the packet and silently dropped it.
                            </p>
                        </div>
                    </div>

                    <section style={{ marginTop: '50px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>Securing Your Infrastructure</h3>
                        <p style={{ marginBottom: '20px' }}>
                            A fundamental principle of DevSecOps is **Network Attack Surface Reduction**. Only expose the ports that are absolutely 
                            necessary for your application to function over the public internet (usually port 80 and 443 for web traffic).
                        </p>
                        <p>
                            Administrative ports like SSH (22) or RDP (3389) should never be globally exposed. Instead, restrict access to 
                            these ports using strict firewall rules that only allow connections from known, static IP addresses (like your office VPN 
                            or Bastion host). Use our Port Scanner from outside your network to verify that your firewall is properly dropping 
                            unauthorized packets (yielding a "Filtered" result).
                        </p>
                    </section>
                </div>

            </div>
        </div>
    );
}
