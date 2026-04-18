import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Editor from '@monaco-editor/react';
import { 
    Shield, Lock, Plus, X, Copy,
    CheckCircle, Type, Image as ImageIcon,
    FileCode, Globe, Zap, Network
} from 'lucide-react';

export default function ToolsCSPGenerator() {
    const [policies, setPolicies] = useState({
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'"],
        'img-src': ["'self'"],
        'connect-src': ["'self'"],
        'font-src': [],
        'object-src': ["'none'"],
        'frame-ancestors': ["'none'"]
    });

    const [newDomain, setNewDomain] = useState('');
    const [selectedDirective, setSelectedDirective] = useState('script-src');
    const [outputFormat, setOutputFormat] = useState('header');

    const directivesKeys = Object.keys(policies);

    const handleAddDomain = () => {
        if (!newDomain.trim()) return;
        const directiveArray = policies[selectedDirective];
        if (!directiveArray.includes(newDomain.trim())) {
            setPolicies({
                ...policies,
                [selectedDirective]: [...directiveArray, newDomain.trim()]
            });
        }
        setNewDomain('');
    };

    const handleRemoveDomain = (directive, index) => {
        const newArray = [...policies[directive]];
        newArray.splice(index, 1);
        setPolicies({
            ...policies,
            [directive]: newArray
        });
    };

    const generateCSPString = () => {
        const parts = [];
        for (const [key, values] of Object.entries(policies)) {
            if (values.length > 0) {
                parts.push(`${key} ${values.join(' ')}`);
            }
        }
        return parts.join('; ');
    };

    const cspString = generateCSPString();

    let outputCode = '';
    if (outputFormat === 'header') {
        outputCode = `Content-Security-Policy: ${cspString}`;
    } else if (outputFormat === 'html') {
        outputCode = `<meta http-equiv="Content-Security-Policy" content="${cspString}">`;
    } else if (outputFormat === 'nginx') {
        outputCode = `add_header Content-Security-Policy "${cspString}" always;`;
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(outputCode);
    };

    const popularSources = [
        "https://*.google.com", 
        "https://*.googleapis.com", 
        "https://cdn.jsdelivr.net",
        "https://unpkg.com",
        "data:"
    ];

    return (
        <div style={{ minHeight: '100vh', color: '#fff' }}>
            <Helmet>
                <title>CSP Generator | Content Security Policy Builder | Whizan AI</title>
                <meta name="description" content="Visually build and generate strict Content-Security-Policy rules for your website. Protect against XSS and injection attacks with Whizan AI's CSP Builder." />
                <meta name="keywords" content="csp generator, content security policy builder, xss protection header, nginx csp, html meta csp, web security tools" />
                <link rel="canonical" href="https://whizan.xyz/tools/csp-generator" />
            </Helmet>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield color="#10b981" size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>CSP Builder</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Construct robust Content-Security-Policy headers to secure modern web apps.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '30px', alignItems: 'start' }}>
                    {/* Controls Builder */}
                    <div style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginBottom: '10px' }}>
                                <Globe size={16} /> ADD TRUSTED SOURCE
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <select 
                                    value={selectedDirective}
                                    onChange={(e) => setSelectedDirective(e.target.value)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', padding: '10px', outline: 'none' }}
                                >
                                    {directivesKeys.map(d => <option key={d} value={d} style={{ background: '#0a0a0f' }}>{d}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <input 
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                    placeholder="e.g. https://api.domain.com"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                                    style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 15px', color: '#fff', outline: 'none' }}
                                />
                                <button onClick={handleAddDomain} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '0 15px', borderRadius: '12px', cursor: 'pointer' }}><Plus size={20} /></button>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '10px' }}>
                                <Zap size={16} /> QUICK ADD
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {popularSources.map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => { setNewDomain(s); }}
                                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Result Matrix & Output */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Matrix */}
                        <div style={{ background: '#0a0a0f', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '25px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                            {directivesKeys.map(key => (
                                <div key={key} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '15px' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981', marginBottom: '10px' }}>{key}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {policies[key].length === 0 && <span style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>Implicitly falls back to default-src</span>}
                                        {policies[key].map((domain, index) => (
                                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{domain}</span>
                                                <button onClick={() => handleRemoveDomain(key, index)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}><X size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Output */}
                        <div style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {['header', 'html', 'nginx'].map(f => (
                                        <button 
                                            key={f}
                                            onClick={() => setOutputFormat(f)}
                                            style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: outputFormat === f ? 'rgba(16,185,129,0.2)' : 'transparent', color: outputFormat === f ? '#10b981' : '#64748b', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                                        >
                                            {f.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={copyToClipboard} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                                    <Copy size={16} /> Copy
                                </button>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <Editor
                                    height="100px"
                                    theme="vs-dark"
                                    language={outputFormat === 'html' ? 'html' : 'plaintext'}
                                    value={outputCode}
                                    options={{ readOnly: true, minimap: { enabled: false }, lineNumbers: 'off', wordWrap: 'on' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Extensive SEO Section */}
                <div style={{ 
                    marginTop: '80px', 
                    padding: '80px 40px', 
                    background: 'rgba(15, 23, 42, 0.3)', 
                    borderRadius: '40px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    lineHeight: '1.8',
                    color: '#94a3b8'
                }}>
                    <h2 style={{ color: '#fff', fontSize: '2.4rem', fontWeight: 900, marginBottom: '40px' }}>Locking Down the Browser: The Role of CSP</h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
                        Cross-Site Scripting (XSS) remains one of the most prevalent and dangerous vulnerabilities on the web. 
                        It occurs when an attacker injects malicious scripts into the trusted environment of a webpage. 
                        While input sanitization is the first line of defense, **Content-Security-Policy (CSP)** acts as the 
                        indispensable second layer. It allows site administrators to declare approved sources of content 
                        that the browser may load, violently stopping unauthorized scripts from executing even if they are injected.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', margin: '60px 0' }}>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FileCode color="#10b981" /> script-src
                            </h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                Controls where JavaScript can be loaded and executed from. Removing <code>'unsafe-inline'</code> 
                                is the single most effective way to eliminate XSS. If you need inline scripts, modern policies use 
                                cryptographically secure nonces or hashes.
                            </p>
                        </div>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Network color="#10b981" /> connect-src
                            </h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                Restricts the URLs that can be loaded using script interfaces like <code>fetch</code>, 
                                <code>XMLHttpRequest</code>, WebSockets, or EventSource. Essential for preventing data exfiltration payloads.
                            </p>
                        </div>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Lock color="#10b981" /> default-src
                            </h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                The ultimate fallback. If you omit specific directives like <code>font-src</code> or <code>media-src</code>, 
                                the browser applies the rules defined in <code>default-src</code>. Best practice is to set this to 
                                <code>'none'</code> or <code>'self'</code> and explicitly allow-list what is needed.
                            </p>
                        </div>
                    </div>

                    <section style={{ marginTop: '50px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>Implementing CSP in Production</h3>
                        <p style={{ marginBottom: '20px' }}>
                            You can deliver a CSP either via an HTTP Response Header (recommended) or via a <code>&lt;meta&gt;</code> tag 
                            in the HTML document block. Using the HTTP Header is universally supported and mandatory for certain 
                            directives like <code>frame-ancestors</code> (which mitigates Clickjacking by controlling who can iframe your site).
                        </p>
                        <p>
                            When deploying a new CSP, it is highly recommended to use the <code>Content-Security-Policy-Report-Only</code> 
                            header first. This instructs the browser to monitor and report violations to a specified URL without actually blocking 
                            content, allowing you to fine-tune your Whizan-generated policy before fully locking down the site.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
