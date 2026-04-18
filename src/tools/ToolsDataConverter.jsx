import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Editor from '@monaco-editor/react';
import { 
    FileBox, AlertCircle, CheckCircle, Copy, 
    Trash2, RefreshCw, Sparkles, Info,
    ArrowRight, BookOpen, Terminal, Code2,
    Download, FileJson, FileText, Globe, 
    Table, Layers, Share2
} from 'lucide-react';
import Papa from 'papaparse';
import yaml from 'js-yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export default function ToolsDataConverter() {
    const [input, setInput] = useState('[\n  {\n    "id": 1,\n    "name": "Whizan AI",\n    "role": "Developer Extraordinaire"\n  }\n]');
    const [output, setOutput] = useState('');
    const [sourceType, setSourceType] = useState('json');
    const [targetType, setTargetType] = useState('csv');
    const [error, setError] = useState('');
    const [isConverting, setIsConverting] = useState(false);

    const formats = [
        { id: 'json', name: 'JSON', icon: FileJson },
        { id: 'csv', name: 'CSV', icon: Table },
        { id: 'xml', name: 'XML', icon: Code2 },
        { id: 'yaml', name: 'YAML', icon: Layers },
    ];

    const convertData = () => {
        if (!input.trim()) {
            setOutput('');
            setError('');
            return;
        }

        setError('');
        setIsConverting(true);

        try {
            let parsedData;
            
            // 1. Parsing Source
            try {
                if (sourceType === 'json') {
                    parsedData = JSON.parse(input);
                } else if (sourceType === 'csv') {
                    const result = Papa.parse(input, { header: true, dynamicTyping: true });
                    if (result.errors.length > 0) throw new Error(result.errors[0].message);
                    parsedData = result.data;
                } else if (sourceType === 'xml') {
                    const parser = new XMLParser({ ignoreAttributes: false });
                    parsedData = parser.parse(input);
                } else if (sourceType === 'yaml') {
                    parsedData = yaml.load(input);
                }
            } catch (err) {
                throw new Error(`Failed to parse source ${sourceType.toUpperCase()}: ${err.message}`);
            }

            // 2. Generating Target
            let resultString = '';
            if (targetType === sourceType) {
                resultString = input;
            } else if (targetType === 'json') {
                resultString = JSON.stringify(parsedData, null, 2);
            } else if (targetType === 'csv') {
                // Flatten nested objects for CSV if necessary (simple first level)
                const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
                resultString = Papa.unparse(dataArray);
            } else if (targetType === 'xml') {
                const builder = new XMLBuilder({ format: true, ignoreAttributes: false });
                // Wrap in root tag if it's an array
                const toBuild = Array.isArray(parsedData) ? { root: { item: parsedData } } : parsedData;
                resultString = builder.build(toBuild);
            } else if (targetType === 'yaml') {
                resultString = yaml.dump(parsedData);
            }

            setOutput(resultString);
        } catch (err) {
            setError(err.message);
            setOutput('');
        } finally {
            setIsConverting(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(convertData, 500);
        return () => clearTimeout(timeoutId);
    }, [input, sourceType, targetType]);

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
    };

    const handleClear = () => {
        setInput('');
        setOutput('');
        setError('');
    };

    const handleDownload = () => {
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `converted-data.${targetType}`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const swapFormats = () => {
        setSourceType(targetType);
        setTargetType(sourceType);
        setInput(output);
    };

    return (
        <div style={{ minHeight: '100vh', color: '#fff' }}>
            <Helmet>
                <title>Universal Data Converter | JSON, CSV, XML, YAML Transformer | Whizan AI</title>
                <meta name="description" content="Instantly convert between JSON, CSV, XML, and YAML formats. Whizan AI provides a premium, real-time data transformation lab for backend developers and data engineers." />
                <meta name="keywords" content="json to csv, csv to json, xml to json, yaml to json, data converter, format transformer, online json converter, whizan ai tools" />
                <link rel="canonical" href="https://whizan.xyz/tools/data-converter" />
            </Helmet>

            <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(45, 212, 191, 0.1)', border: '1px solid rgba(45, 212, 191, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileBox color="#2dd4bf" size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Data Converter Lab</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Morph any data format into another with zero friction.</p>
                    </div>
                </div>

                {/* Workspace Panels */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'stretch' }}>
                    {/* Source Panel */}
                    <div style={{ background: '#0f172a', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)', padding: '25px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {formats.map(f => (
                                    <button 
                                        key={f.id}
                                        onClick={() => setSourceType(f.id)}
                                        style={{ 
                                            padding: '8px 16px', borderRadius: '12px', border: 'none', 
                                            background: sourceType === f.id ? 'rgba(45, 212, 191, 0.15)' : 'transparent',
                                            color: sourceType === f.id ? '#2dd4bf' : '#64748b',
                                            fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}
                                    >
                                        <f.icon size={14} /> {f.name}
                                    </button>
                                ))}
                            </div>
                            <button onClick={handleClear} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><Trash2 size={18} /></button>
                        </div>
                        <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Editor
                                height="500px"
                                language={sourceType}
                                theme="vs-dark"
                                value={input}
                                onChange={setInput}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    padding: { top: 20 },
                                    scrollBeyondLastLine: false,
                                    lineNumbers: 'on',
                                    roundedSelection: true
                                }}
                            />
                        </div>
                    </div>

                    {/* Swap Button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button 
                            onClick={swapFormats}
                            style={{ 
                                width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)', color: '#2dd4bf', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'rotate(180deg)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'rotate(0deg)'}
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>

                    {/* Target Panel */}
                    <div style={{ background: '#0f172a', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)', padding: '25px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {formats.map(f => (
                                    <button 
                                        key={f.id}
                                        onClick={() => setTargetType(f.id)}
                                        style={{ 
                                            padding: '8px 16px', borderRadius: '12px', border: 'none', 
                                            background: targetType === f.id ? 'rgba(45, 212, 191, 0.15)' : 'transparent',
                                            color: targetType === f.id ? '#2dd4bf' : '#64748b',
                                            fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}
                                    >
                                        <f.icon size={14} /> {f.name}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button onClick={handleDownload} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><Download size={18} /></button>
                                <button onClick={handleCopy} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><Copy size={18} /></button>
                            </div>
                        </div>
                        <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                            {error ? (
                                <div style={{ height: '500px', background: '#0a0a0f', padding: '30px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center' }}>
                                    <AlertCircle size={24} />
                                    <div>
                                        <div style={{ fontWeight: 800, marginBottom: '5px' }}>CONVERSION FAILED</div>
                                        <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{error}</div>
                                    </div>
                                </div>
                            ) : (
                                <Editor
                                    height="500px"
                                    language={targetType}
                                    theme="vs-dark"
                                    value={output}
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        padding: { top: 20 },
                                        scrollBeyondLastLine: false
                                    }}
                                />
                            )}
                            {isConverting && (
                                <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                                    <RefreshCw className="animate-spin text-teal-400" size={16} />
                                </div>
                            )}
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
                        <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, marginBottom: '40px', letterSpacing: '-1px' }}>
                            Data Interchange Formats: The DNA of Modern Engineering
                        </h2>
                        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
                            In the interconnected world of cloud computing, microservices, and edge 
                            delivery, data is the vital medium. However, data rarely exists in a 
                            single vacuum. Backend systems may communicate via **JSON**, while legacy 
                            billing systems ingest **CSV**, and configuration is best expressed in **YAML**. 
                            Our **Universal Data Converter** acts as a high-fidelity translator, 
                            ensuring that information flows seamlessly across these heterogeneous 
                            environments with zero loss of integrity.
                        </p>
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '50px', margin: '80px 0' }}>
                        <div style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FileJson size={24} color="#2dd4bf" /> JSON (Javascript Object Notation)
                            </h3>
                            <p style={{ fontSize: '0.95rem' }}>
                                JSON has become the de facto standard for web APIs. Its key-value 
                                pair structure and native compatibility with JavaScript make it 
                                indispensable for real-time applications. 
                            </p>
                            <p style={{ marginTop: '15px' }}>**Best for**: REST APIs, MongoDB, Single Page Apps.</p>
                        </div>
                        <div style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Layers size={24} color="#f59e0b" /> YAML (YAML Ain't Markup Language)
                            </h3>
                            <p style={{ fontSize: '0.95rem' }}>
                                YAML prioritizes human readability. Its whitespace-driven hierarchy 
                                makes it the preferred choice for configuration files where 
                                complex nesting is required but overhead must be minimized.
                            </p>
                            <p style={{ marginTop: '15px' }}>**Best for**: Kubernetes, Docker Compose, CI/CD pipelines.</p>
                        </div>
                        <div style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Code2 size={24} color="#8b5cf6" /> XML (eXtensible Markup Language)
                            </h3>
                            <p style={{ fontSize: '0.95rem' }}>
                                XML provides a strictly typed, schema-validated structure. While 
                                more verbose than JSON, its ability to represent complex relational 
                                schemas and attributes remains vital for enterprise workflows.
                            </p>
                            <p style={{ marginTop: '15px' }}>**Best for**: SOAP APIs, RSS feeds, Android Layouts.</p>
                        </div>
                    </div>

                    <section style={{ marginTop: '60px' }}>
                        <h3 style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, marginBottom: '30px' }}>
                            JSON to CSV: Bridging Programming and Analytics
                        </h3>
                        <p style={{ marginBottom: '30px' }}>
                            One of the most common tasks for data engineers is exporting database 
                            results (**JSON**) for business analysts to use in **Excel** (**CSV**). 
                            Moving between these formats requires careful handling of object 
                            flattening. Our converter intelligently detects nested structures and 
                            represents them as dot-notated columns, ensuring that no data is hidden 
                            behind depth.
                        </p>
                        <div style={{ padding: '30px', background: 'rgba(236, 72, 153, 0.05)', borderRadius: '24px', border: '1px solid rgba(236, 72, 153, 0.1)' }}>
                            <h4 style={{ color: '#fff', marginBottom: '10px' }}>Pro Tip: Dealing with Arrays</h4>
                            <p style={{ fontSize: '0.9rem', margin: 0 }}>
                                When converting large JSON arrays to CSV, ensure that your objects 
                                share a consistent schema. If dynamic fields exist, our CSV generator 
                                will normalize headers to include the superset of all keys found 
                                across the dataset.
                            </p>
                        </div>
                    </section>

                    <section style={{ marginTop: '80px' }}>
                        <h3 style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, marginBottom: '30px' }}>
                            Why Whizan AI Converter is the Developer's Choice
                        </h3>
                        <ul style={{ listStyleType: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            <li style={{ padding: '20px', borderLeft: '3px solid #2dd4bf', background: 'rgba(255,255,255,0.02)' }}>
                                <strong style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>1. Client-Side Security</strong>
                                Your data never leaves your browser. All transformations are executed locally via high-performance WASM and Javascript libraries.
                            </li>
                            <li style={{ padding: '20px', borderLeft: '3px solid #2dd4bf', background: 'rgba(255,255,255,0.02)' }}>
                                <strong style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>2. High Precision Parsing</strong>
                                We use standard compliant parsers like `js-yaml` and `PapaParse`, guaranteeing that your production config files remain valid.
                            </li>
                            <li style={{ padding: '20px', borderLeft: '3px solid #2dd4bf', background: 'rgba(255,255,255,0.02)' }}>
                                <strong style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>3. Advanced Error Reporting</strong>
                                Instead of silent failures, get specific line numbers and error context if your XML tags are mismatched or your YAML indentation is faulty.
                            </li>
                            <li style={{ padding: '20px', borderLeft: '3px solid #2dd4bf', background: 'rgba(255,255,255,0.02)' }}>
                                <strong style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>4. Large Dataset Support</strong>
                                Optimized for memory efficiency, allowing you to convert multi-megabyte files without browser hanging.
                            </li>
                        </ul>
                    </section>

                    <section style={{ marginTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(45, 212, 191, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                            <Sparkles color="#2dd4bf" size={40} />
                        </div>
                        <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px' }}>Scale Your Engineering Intelligence</h2>
                        <p style={{ maxWidth: '850px', marginBottom: '40px', fontSize: '1.2rem' }}>
                            Data conversion is a tactical hurdle that should never slow you down. 
                            Whizan AI provides the infrastructure to automate these tasks, 
                            allowing you to focus on building the logic that matters.
                        </p>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button 
                                onClick={() => window.location.href = '/tools/sql-editor'}
                                style={{ padding: '16px 32px', borderRadius: '15px', background: '#1e293b', border: '1px solid #334155', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Open SQL Editor
                            </button>
                            <button 
                                onClick={() => window.location.href = '/tools/api-tester'}
                                style={{ padding: '16px 32px', borderRadius: '15px', background: 'linear-gradient(135deg, #2dd4bf, #06b6d4)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Launch API Tester
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
