import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Editor from '@monaco-editor/react';
import { 
    FileJson, AlertCircle, CheckCircle, Copy, 
    Trash2, Minimize2, Maximize2, Sparkles,
    Code2, Info, ArrowRight, BookOpen,
    Terminal, Database, Lock, Share2
} from 'lucide-react';

export default function ToolsJSONFormatter() {
    const [jsonInput, setJsonInput] = useState('{\n  "project": "Whizan AI",\n  "feature": "JSON Formatter",\n  "status": "Premium",\n  "author": "Antigravity AI"\n}');
    const [error, setError] = useState('');
    const [stats, setStats] = useState({ size: 0, lines: 0 });

    const validateAndFormat = (input, indent = 2) => {
        if (!input.trim()) {
            setError('');
            setStats({ size: 0, lines: 0 });
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const formatted = JSON.stringify(parsed, null, indent);
            setJsonInput(formatted);
            setError('');
            
            // Calculate stats
            const bytes = new Blob([formatted]).size;
            const lineCount = formatted.split('\n').length;
            setStats({ size: bytes, lines: lineCount });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleMinify = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            const minified = JSON.stringify(parsed);
            setJsonInput(minified);
            setError('');
            setStats({ size: new Blob([minified]).size, lines: 1 });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleClear = () => {
        setJsonInput('');
        setError('');
        setStats({ size: 0, lines: 0 });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonInput);
    };

    const handleEditorChange = (value) => {
        setJsonInput(value || '');
        try {
            JSON.parse(value || '');
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ minHeight: '100vh', color: '#fff' }}>
            <Helmet>
                <title>Free Online JSON Formatter & Validator | Prettify & Minify JSON | Whizan AI</title>
                <meta name="description" content="Instantly prettify, validate, and minify JSON data online. Whizan AI's premium JSON Formatter provides real-time linting, formatting, and structural analysis for backend engineers." />
                <meta name="keywords" content="json formatter, json validator online, prettify json, minify json tool, json lint online, backend developer tools, format json code, json viewer online, whizan ai tools" />
                <meta property="og:title" content="Whizan AI | Advanced JSON Formatter & Data Science Lab" />
                <meta property="og:description" content="Clean and validate your JSON data with Whizan AI. High-performance formatting, minification, and syntax checking in a premium glassmorphic interface." />
                <link rel="canonical" href="https://whizan.xyz/tools/json-formatter" />
            </Helmet>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileJson color="#10b981" size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>JSON Formatter</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Full client-side formatting. We never store or transmit your data.</p>
                    </div>
                </div>

                <div style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '700px' }}>
                    {/* Toolbar */}
                    <div style={{ padding: '15px 25px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => validateAndFormat(jsonInput, 2)}
                                style={{ background: '#10b981', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Maximize2 size={16} /> Prettify
                            </button>
                            <button 
                                onClick={handleMinify}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Minimize2 size={16} /> Minify
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '20px', marginRight: '20px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SIZE: <span style={{ color: '#10b981' }}>{stats.size} B</span></div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>LINES: <span style={{ color: '#10b981' }}>{stats.lines}</span></div>
                            </div>
                            <button onClick={handleCopy} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }} title="Copy to clipboard"><Copy size={18} /></button>
                            <button onClick={handleClear} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Clear editor"><Trash2 size={18} /></button>
                        </div>
                    </div>

                    {/* Editor Area */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Editor
                            height="100%"
                            defaultLanguage="json"
                            theme="vs-dark"
                            value={jsonInput}
                            onChange={handleEditorChange}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: 'monospace',
                                lineNumbers: 'on',
                                roundedSelection: false,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 20, bottom: 20 }
                            }}
                        />
                        {error && (
                            <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 10, padding: '12px 20px', background: 'rgba(239, 68, 68, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#fff', fontSize: '0.85rem', boxShadow: '0 10px 25px -5px rgba(239,68,68,0.5)', maxWidth: '400px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}
                        {!error && jsonInput && (
                            <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 10, padding: '10px 18px', background: 'rgba(34, 197, 94, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '12px', color: '#fff', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle size={16} /> VALID JSON
                            </div>
                        )}
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
                            Advanced JSON Formatting, Validation & Architecture
                        </h2>
                        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
                            In the stateless era of modern web development, **JSON (JavaScript Object Notation)** 
                            has become the universal language of data exchange. Our **Premium JSON Formatter** 
                            is engineered for performance, providing backend developers and data scientists 
                            with a high-fidelity environment to prettify, validate, and minify complex 
                            data structures instantly.
                        </p>
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', margin: '60px 0' }}>
                        <section>
                            <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Code2 size={26} color="#10b981" /> Why JSON Matters
                            </h3>
                            <p>
                                Unlike legacy formats like XML, JSON is lightweight, easy for humans to read 
                                and write, and effortless for machines to parse and generate. It has 
                                revolutionized the way REST APIs, GraphQL services, and NoSQL databases 
                                handle information at scale.
                            </p>
                            <ul style={{ paddingLeft: '20px', marginTop: '15px' }}>
                                <li style={{ marginBottom: '10px' }}>✅ **Cross-Platform**: Supported by virtually every programming language.</li>
                                <li style={{ marginBottom: '10px' }}>✅ **Speed**: Native parsing in modern browsers and server runtimes (V8).</li>
                                <li style={{ marginBottom: '10px' }}>✅ **Simplicity**: Based on key-value pairs and ordered lists.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Lock size={26} color="#34d399" /> Privacy-First Engineering
                            </h3>
                            <p>
                                At Whizan AI, we understand the sensitivity of your data. Our **JSON Formatter** 
                                is 100% client-side. Whether you are formatting production logs, customer metadata, 
                                or authentication configurations, your JSON never leaves your device. 
                            </p>
                            <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ color: '#fff', marginBottom: '10px', fontSize: '1rem' }}>Security Note:</h4>
                                <p style={{ fontSize: '0.85rem' }}>We use standard `JSON.parse` and `JSON.stringify` logic within an isolated browser context to prevent any tracking or data leakage.</p>
                            </div>
                        </section>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '60px 0' }} />

                    <section>
                        <h3 style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, marginBottom: '30px' }}>
                            The Rules of Valid JSON Syntax
                        </h3>
                        <p style={{ marginBottom: '40px' }}>
                            Even senior developers occasionally run into malformed JSON issues. Our validator 
                            is designed to catch and highlight these common pitfalls in real-time:
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                            <div>
                                <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '12px' }}>Double Quotes Only</h4>
                                <p style={{ fontSize: '0.9rem' }}>JSON keys and string values **must** be wrapped in double quotes (`"`). Single quotes (`'`) will invalidate the object.</p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '12px' }}>No Trailing Commas</h4>
                                <p style={{ fontSize: '0.9rem' }}>The last item in an array or object must not have a trailing comma. This is a common point of failure for automated scripts.</p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '12px' }}>Strict Boolean Scaling</h4>
                                <p style={{ fontSize: '0.9rem' }}>Booleans (`true`, `false`) and `null` must be lowercase. Uppercase variants are not recognized by the JSON specification.</p>
                            </div>
                        </div>
                    </section>

                    <section style={{ marginTop: '80px' }}>
                        <h3 style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, marginBottom: '30px' }}>
                            Professional Best Practices for JSON Payloads
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '12px' }}>1. Use PascalCase or camelCase Consistently</h4>
                                <p>While JSON itself doesn't care, your application architecture does. Stick to one naming convention across your entire API to reduce friction for frontend consumers.</p>
                            </div>
                            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '12px' }}>2. Avoid Redundant Nesting</h4>
                                <p>Flat is better than nested. Overly complex structures increase parsing time and make your data harder to debug with tools like our JSON Formatter.</p>
                            </div>
                            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '12px' }}>3. Minify in Production, Prettify in Development</h4>
                                <p>Use our **Minify** feature to strip whitespace and line breaks before sending data over the wire—this reduces payload size and bandwidth costs significantly.</p>
                            </div>
                        </div>
                    </section>

                    <section style={{ marginTop: '100px', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
                            <Sparkles color="#10b981" size={40} />
                        </div>
                        <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, marginBottom: '25px' }}>Master Your Data with Whizan AI</h2>
                        <p style={{ maxWidth: '850px', margin: '0 auto 40px', fontSize: '1.2rem' }}>
                            Whizan AI provides more than just a JSON Formatter. Explore our full suite of 
                            professional developer tools designed for the modern engineering workflow. 
                            From SQL debugging to API testing, we've got you covered.
                        </p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button 
                                onClick={() => window.location.href = '/tools/sql-editor'}
                                style={{ padding: '16px 32px', borderRadius: '15px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Try SQL Editor
                            </button>
                            <button 
                                onClick={() => window.location.href = '/tools/api-tester'}
                                style={{ padding: '16px 32px', borderRadius: '15px', background: 'linear-gradient(135deg, #10b981, #34d399)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Open API Tester
                            </button>
                        </div>
                    </section>

                    <footer style={{ marginTop: '120px', paddingTop: '60px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
                            {[
                                'json-formatter-online', 'prettify-json', 'json-validator', 'minify-json',
                                'json-lint-online', 'backend-tools', 'api-debugger', 'whizan-ai',
                                'developer-productivity', 'clean-json-data'
                            ].map(tag => (
                                <span key={tag} style={{ fontSize: '0.8rem', color: '#64748b', background: 'rgba(255,255,255,0.01)', padding: '6px 15px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#475569', maxWidth: '900px', margin: '0 auto' }}>
                            **Disclaimer**: Whizan AI JSON Formatter is a productivity tool. We focus on speed and correctness 
                            using native browser APIs. No processing is performed on our servers. 
                            © 2026 Whizan AI - Empowering Developers Globally.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
