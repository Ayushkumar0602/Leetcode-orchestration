import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Editor from '@monaco-editor/react';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { 
    Image as ImageIcon, Download, Settings, 
    Palette, Layout, Code2, Copy, Check,
    Monitor, Share2, Type, Sparkles
} from 'lucide-react';

export default function ToolsCodeScreenshot() {
    const [code, setCode] = useState(`function calculateFibonacci(n) {\n  if (n <= 1) return n;\n  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);\n}\n\nconsole.log(calculateFibonacci(10)); // 55`);
    const [language, setLanguage] = useState('javascript');
    const [theme, setTheme] = useState('hyper'); // hyper, ocean, candy, dark
    const [padding, setPadding] = useState(40);
    const [title, setTitle] = useState('fibonacci.js');
    const [macControls, setMacControls] = useState(true);
    const [exportFormat, setExportFormat] = useState('png');
    const [isExporting, setIsExporting] = useState(false);
    
    const screenshotRef = useRef(null);

    const getBackgroundGradient = () => {
        switch(theme) {
            case 'hyper': return 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)';
            case 'ocean': return 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)';
            case 'candy': return 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)';
            case 'dark': return '#0f172a';
            case 'monochrome': return 'linear-gradient(135deg, #475569 0%, #1e293b 100%)';
            default: return 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)';
        }
    };

    const handleExport = async () => {
        if (!screenshotRef.current) return;
        setIsExporting(true);
        try {
            // Force a small delay to ensure any pending typed text/cursors are settled
            await new Promise(resolve => setTimeout(resolve, 300));

            const exportOptions = {
                quality: 1,
                pixelRatio: 3, // Ultra-Crisp Retina quality
                skipFonts: true, // Prevents CORS errors caused by editor's external font loading
                cacheBust: true,
                fetchRequestInit: { cache: 'no-cache' },
                style: {
                    transform: 'none', // Prevent coordinate scaling issues
                },
                filter: (node) => {
                    // Filter out the blinking cursor or hidden textareas that break SVG rendering
                    if (node.tagName === 'TEXTAREA') return false;
                    // Safely check properties as node could be an SVGElement or TextNode
                    if (node.className && typeof node.className === 'string' && node.className.includes('cursor')) return false;
                    return true;
                }
            };

            let dataUrl;
            if (exportFormat === 'png') {
                dataUrl = await toPng(screenshotRef.current, exportOptions);
            } else if (exportFormat === 'jpeg') {
                // Ensure there's a solid background for JPEG (no transparency)
                dataUrl = await toJpeg(screenshotRef.current, { ...exportOptions, backgroundColor: '#0a0a0f' });
            } else {
                dataUrl = await toSvg(screenshotRef.current, exportOptions);
            }

            const link = document.createElement('a');
            link.download = `whizan-snippet-${Date.now()}.${exportFormat}`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to export image:', err);
            // Fallback strategy or user alert
            alert("Export failed. Sometimes strict browser privacy extensions block canvas drawing.");
        } finally {
            setIsExporting(false);
        }
    };

    const languages = [
        'javascript', 'typescript', 'python', 'html', 'css', 
        'java', 'cpp', 'csharp', 'go', 'rust', 'sql', 'json', 'yaml'
    ];

    const themes = [
        { id: 'hyper', name: 'Hyper', color: '#ec4899' },
        { id: 'ocean', name: 'Ocean', color: '#06b6d4' },
        { id: 'candy', name: 'Candy', color: '#f59e0b' },
        { id: 'dark', name: 'Midnight', color: '#0f172a' },
        { id: 'monochrome', name: 'Slate', color: '#475569' }
    ];

    return (
        <div style={{ minHeight: '100vh', color: '#fff' }}>
            <Helmet>
                <title>Code Screenshot Generator | Dev Branding Tool | Whizan AI</title>
                <meta name="description" content="Generate beautiful, high-resolution code screenshots for Twitter, LinkedIn, and blogs. Customize themes, padding, and window frames effortlessly." />
                <meta name="keywords" content="code screenshot generator, beautiful code snippets, carbon alternative, share code image, programmer aesthetic" />
                <link rel="canonical" href="https://whizan.xyz/tools/screenshot-generator" />
            </Helmet>

            <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon color="#ec4899" size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Code Screenshot Generator</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Create stunning visually appealing code assets for your platform.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '40px', alignItems: 'start' }}>
                    {/* Controls Sidebar */}
                    <div style={{ background: '#0f172a', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                                <Code2 size={16} /> LANGUAGE
                            </label>
                            <select 
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: '#fff', outline: 'none' }}
                            >
                                {languages.map(l => <option key={l} value={l} style={{ background: '#0a0a0f' }}>{l}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                                <Palette size={16} /> THEME GRADIENT
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {themes.map(t => (
                                    <div 
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        style={{ 
                                            width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                                            background: t.id === 'dark' ? '#0f172a' : t.id === 'monochrome' ? 'linear-gradient(135deg, #475569 0%, #1e293b 100%)' : `linear-gradient(135deg, ${t.color} 0%, #fff 200%)`, 
                                            border: theme === t.id ? `3px solid #fff` : '3px solid transparent',
                                            boxShadow: theme === t.id ? `0 0 15px ${t.color}` : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        title={t.name}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                                <Layout size={16} /> PADDING
                            </label>
                            <input 
                                type="range" 
                                min="10" 
                                max="100" 
                                value={padding} 
                                onChange={(e) => setPadding(Number(e.target.value))}
                                style={{ width: '100%', accentColor: '#ec4899' }}
                            />
                            <div style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '5px', color: '#94a3b8' }}>{padding}px</div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                                <Type size={16} /> WINDOW TITLE
                            </label>
                            <input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="filename.js"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: '#fff', outline: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Monitor size={16} /> MAC CONTROLS
                            </label>
                            <div 
                                onClick={() => setMacControls(!macControls)}
                                style={{ width: '40px', height: '22px', background: macControls ? '#10b981' : 'rgba(255,255,255,0.1)', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}
                            >
                                <div style={{ position: 'absolute', top: '3px', left: macControls ? '21px' : '3px', width: '16px', height: '16px', background: '#fff', borderRadius: '50%', transition: 'all 0.3s' }} />
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '25px', display: 'flex', gap: '10px' }}>
                            <select 
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0 15px', color: '#fff', outline: 'none' }}
                            >
                                <option value="png">PNG</option>
                                <option value="jpeg">JPEG</option>
                                <option value="svg">SVG</option>
                            </select>
                            <button 
                                onClick={handleExport}
                                disabled={isExporting}
                                style={{ flex: 1, background: 'linear-gradient(135deg, #ec4899, #d946ef)', border: 'none', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'transform 0.1s' }}
                            >
                                {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                Export Asset
                            </button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Interactive Editor (Hidden entirely inside screenshot bounds to allow editing on the actual preview) */}
                        <div style={{ 
                            background: '#0a0a0f', 
                            borderRadius: '24px', 
                            border: '1px solid rgba(255,255,255,0.05)', 
                            overflow: 'x-auto', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            minHeight: '400px',
                            backgroundSize: '20px 20px',
                            backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)'
                        }}>
                            {/* The DOM Node to Capture */}
                            <div 
                                ref={screenshotRef}
                                style={{ 
                                    background: getBackgroundGradient(),
                                    padding: padding + 'px',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    display: 'inline-block' // Shrink to fit code
                                }}
                            >
                                {/* Window Graphic */}
                                <div style={{ 
                                    background: 'rgba(15, 23, 42, 0.9)', 
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                    minWidth: '400px',
                                    maxWidth: '800px'
                                }}>
                                    {/* Window Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        {macControls && (
                                            <div style={{ display: 'flex', gap: '8px', marginRight: '20px' }}>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                                            </div>
                                        )}
                                        <div style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
                                            {title}
                                        </div>
                                        {macControls && <div style={{ width: '52px' }} />} {/* Spacer to balance title */}
                                    </div>

                                    {/* Editor Instance inside Snapshot bounds */}
                                    <div style={{ padding: '20px 10px' }} className="screenshot-editor-wrapper">
                                        {/* CSS to hide Monaco cursor/scrollbars during actual export would go here; we rely on user clicking off */}
                                        <Editor
                                            height={Math.max(code.split('\n').length * 22 + 40, 100) + 'px'} 
                                            width="100%"
                                            theme="vs-dark"
                                            language={language}
                                            value={code}
                                            onChange={setCode}
                                            options={{ 
                                                fontSize: 15, 
                                                minimap: { enabled: false }, 
                                                scrollBeyondLastLine: false,
                                                overviewRulerBorder: false,
                                                hideCursorInOverviewRuler: true,
                                                renderLineHighlight: "none",
                                                scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                                                contextmenu: false,
                                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem', gap: '10px' }}>
                            <Sparkles size={14} color="#ec4899" />
                            Click inside the window above to freely edit the code snippet before rendering.
                        </div>
                    </div>
                </div>

                {/* Vast SEO Docs */}
                <div style={{ 
                    marginTop: '80px', 
                    padding: '80px 40px', 
                    background: 'rgba(15, 23, 42, 0.3)', 
                    borderRadius: '40px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    lineHeight: '1.8',
                    color: '#94a3b8'
                }}>
                    <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, marginBottom: '40px' }}>Developer Branding & Visual Execution</h2>
                    <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
                        In an era dominated by rich multimedia, sharing raw text blocks on social platforms like Twitter, LinkedIn, 
                        or Medium no longer captures attention. The Whizan AI **Code Screenshot Generator** bridges the gap between 
                        engineering and design, allowing you to instantly convert IDE-quality code snippets into beautiful, high-retina 
                        visual assets using client-side DOM-to-Canvas rendering.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', margin: '60px 0' }}>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                            <h3 style={{ color: '#ec4899', fontSize: '1.2rem', fontWeight: 800, marginBottom: '15px' }}>Retina Scaling Resolution</h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                Unlike standard OS-level screenshots which can suffer from compression and scaling blur, our tool uses 
                                an integrated `pixelRatio` multiplier. Exports in PNG and JPEG are natively upscaled to `2x` Retina 
                                dimensions, ensuring crystal-clear text readability even when compressed by social media algorithms.
                            </p>
                        </div>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '15px' }}>Lossless SVG Export</h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                For authors writing technical books, whitepapers, or creating slide decks, raster formats (PNG) 
                                eventually pixelate. Change the export format to SVG to convert your snippet into a mathematically 
                                perfect vector graphic. It scales infinitely without losing edge crispness.
                            </p>
                        </div>
                    </div>

                    <section style={{ marginTop: '50px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>Optimizing Code for Content Marketing</h3>
                        <p style={{ marginBottom: '20px' }}>
                            When creating assets for technical marketing, remember that the objective is **scannability**. A 100-line 
                            function is physically impossible to parse in a Twitter feed. Best practices indicate that screenshots should 
                            contain no more than 20-30 lines of extremely focused logic.
                        </p>
                        <ul style={{ paddingLeft: '20px', marginBottom: '30px' }}>
                            <li style={{ marginBottom: '10px' }}>**Font Legibility**: We utilize fonts like Fira Code or JetBrains Mono that feature distinct glyphs and programming ligatures (e.g., turning `=&gt;` into an actual arrow).</li>
                            <li style={{ marginBottom: '10px' }}>**Syntax Mapping**: Validating language structure ensures reserved keywords are painted in distinct contrasting colors, breaking up walls of white text into hierarchical logic blocks.</li>
                            <li style={{ marginBottom: '10px' }}>**Background Aesthetics**: Solid colors feel flat. The gradients provided (Hyper, Candy, Ocean) create depth and pull the viewer's eye toward the centered editor window.</li>
                        </ul>
                    </section>
                </div>

            </div>
        </div>
    );
}
