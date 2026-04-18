import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
    Eye, Globe, RefreshCw, Loader2,
    Twitter, Linkedin, Facebook, Link,
    AlertCircle, Search, Layout, Image as ImageIcon
} from 'lucide-react';

export default function ToolsMetaPreview() {
    const [url, setUrl] = useState('https://github.com');
    const [loading, setLoading] = useState(false);
    const [metaData, setMetaData] = useState(null);
    const [error, setError] = useState(null);

    const fetchMetaTags = async () => {
        if (!url.trim()) return;
        setLoading(true);
        setError(null);
        setMetaData(null);

        try {
            // Add protocol if missing
            let fetchUrl = url;
            if (!/^https?:\/\//i.test(fetchUrl)) {
                fetchUrl = 'https://' + fetchUrl;
            }

            const res = await fetch('http://localhost:3001/api/tools/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method: 'GET', url: fetchUrl })
            });
            const responseData = await res.json();
            
            if (responseData.error) throw new Error(responseData.error);

            const html = responseData.data;
            if (typeof html !== 'string') throw new Error("Target did not return valid HTML");

            // Parse HTML string into DOM
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const getMeta = (nameAttr, propertyAttr) => {
                let tag;
                if (propertyAttr) tag = doc.querySelector(`meta[property="${propertyAttr}"]`);
                if (!tag && nameAttr) tag = doc.querySelector(`meta[name="${nameAttr}"]`);
                return tag ? tag.getAttribute('content') : null;
            };

            const parsed = {
                title: getMeta(null, 'og:title') || getMeta('twitter:title') || doc.title || 'No Title Found',
                description: getMeta(null, 'og:description') || getMeta('twitter:description') || getMeta('description') || 'No description provided.',
                image: getMeta(null, 'og:image') || getMeta('twitter:image') || null,
                url: getMeta(null, 'og:url') || fetchUrl,
                siteName: getMeta(null, 'og:site_name') || new URL(fetchUrl).hostname,
                themeColor: getMeta('theme-color') || '#ffffff',
                twitterCard: getMeta('twitter:card') || 'summary_large_image'
            };

            // Fix relative image URLs
            if (parsed.image && parsed.image.startsWith('/')) {
                const urlObj = new URL(fetchUrl);
                parsed.image = `${urlObj.protocol}//${urlObj.host}${parsed.image}`;
            }

            setMetaData(parsed);
            setUrl(fetchUrl);

        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to fetch or parse URL');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', color: '#fff' }}>
            <Helmet>
                <title>Meta Tag Preview | SEO & Social Graph Checker | Whizan AI</title>
                <meta name="description" content="Enter any URL to test how it looks on Twitter, LinkedIn, Facebook, and Discord. Analyze Open Graph tags and optimize your SEO presence." />
                <meta name="keywords" content="meta tag preview format, open graph tester, twitter card validator, linkedin share preview, seo visibility tools" />
                <link rel="canonical" href="https://whizan.xyz/tools/meta-preview" />
            </Helmet>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Eye color="#6366f1" size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Meta Tag Preview</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Extract Open Graph metadata and visualize social platform link previews.</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div style={{ background: '#0f172a', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '15px', marginBottom: '40px', alignItems: 'center' }}>
                    <Search size={20} color="#64748b" />
                    <input 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchMetaTags()}
                        placeholder="https://yourwebsite.com"
                        style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '1.1rem', outline: 'none' }}
                    />
                    <button 
                        onClick={fetchMetaTags}
                        disabled={loading}
                        style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', color: '#fff', padding: '12px 30px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                        Fetch Tags
                    </button>
                </div>

                {error && (
                    <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '16px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {metaData && !loading && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '40px' }}>
                        
                        {/* Extracted Data Inspector */}
                        <div style={{ background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Layout size={20} color="#6366f1" /> Extracted Properties
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, marginBottom: '5px' }}>TITLE (og:title / title)</div>
                                    <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600 }}>{metaData.title}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, marginBottom: '5px' }}>DESCRIPTION (og:description / description)</div>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>{metaData.description}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, marginBottom: '5px' }}>IMAGE (og:image)</div>
                                    {metaData.image ? (
                                        <div style={{ fontSize: '0.8rem', color: '#3b82f6', wordBreak: 'break-all' }}>{metaData.image}</div>
                                    ) : (
                                        <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>No image found</div>
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, marginBottom: '5px' }}>THEME COLOR</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: metaData.themeColor }}></div>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{metaData.themeColor}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Previews Visualizer */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            
                            {/* Twitter Preview */}
                            <div>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', marginBottom: '15px' }}><Twitter size={18} color="#1DA1F2" /> Twitter Card</h4>
                                <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', background: '#000', maxWidth: '500px' }}>
                                    {metaData.image ? (
                                        <div style={{ width: '100%', paddingTop: '52.35%', position: 'relative', background: '#111' }}>
                                            <img src={metaData.image} alt="Preview" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ) : (
                                        <div style={{ width: '100%', height: '150px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
                                            <ImageIcon size={48} />
                                        </div>
                                    )}
                                    <div style={{ padding: '12px 15px' }}>
                                        <div style={{ color: '#8899A6', fontSize: '0.85rem', marginBottom: '2px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{new URL(metaData.url).hostname}</div>
                                        <div style={{ color: '#E1E8ED', fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{metaData.title}</div>
                                        <div style={{ color: '#8899A6', fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{metaData.description}</div>
                                    </div>
                                </div>
                            </div>

                            {/* LinkedIn Preview */}
                            <div>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', marginBottom: '15px' }}><Linkedin size={18} color="#0A66C2" /> LinkedIn / Facebook</h4>
                                <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0', overflow: 'hidden', background: '#f5f5f5', maxWidth: '500px' }}>
                                    {metaData.image ? (
                                        <div style={{ width: '100%', paddingTop: '52.35%', position: 'relative', background: '#e0e0e0' }}>
                                            <img src={metaData.image} alt="Preview" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ) : (
                                        <div style={{ width: '100%', height: '150px', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                            <ImageIcon size={48} />
                                        </div>
                                    )}
                                    <div style={{ padding: '10px 15px', background: '#f3f2ef' }}>
                                        <div style={{ color: '#000000E6', fontSize: '1rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '2px' }}>{metaData.title}</div>
                                        <div style={{ color: '#00000099', fontSize: '0.85rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{new URL(metaData.url).hostname}</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
                
                {!metaData && !loading && !error && (
                    <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                        <Layout size={80} style={{ marginBottom: '20px' }} />
                        <h2>Enter a URL to preview</h2>
                    </div>
                )}

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
                    <h2 style={{ color: '#fff', fontSize: '2.4rem', fontWeight: 900, marginBottom: '40px' }}>Mastering The Open Graph Protocol</h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
                        When a user links to your website on social media or messaging apps, the platform doesn't just show a raw hyperlink. 
                        It sends a scraper bot to your URL to construct a rich, visual preview link. This process depends entirely on specific 
                        <code>&lt;meta&gt;</code> tags embedded in the <code>&lt;head&gt;</code> of your HTML document. Chief among these is 
                        the **Open Graph Protocol (OGP)**, originally built by Facebook but now adopted industry-wide.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', margin: '40px 0' }}>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            <h3 style={{ color: '#6366f1', fontSize: '1.2rem', fontWeight: 800, marginBottom: '15px' }}>Core Requirements</h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                To ensure your page becomes a rich object, you strictly need the four basic origin tags: 
                                <code>og:title</code>, <code>og:type</code> (like "website" or "article"), <code>og:image</code>, 
                                and <code>og:url</code>. Missing the image tag guarantees a massive drop in click-through rates (CTR).
                            </p>
                        </div>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '15px' }}>Twitter Cards</h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                Twitter relies on Open Graph attributes but also implements its own custom tags, such as <code>twitter:card</code>. 
                                Setting this to <code>summary_large_image</code> is crucial if you want the large, edge-to-edge image layout 
                                instead of the smaller thumbnail layout.
                            </p>
                        </div>
                    </div>

                    <section style={{ marginTop: '50px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>The SEO Impact of Meta Tags</h3>
                        <p style={{ marginBottom: '20px' }}>
                            While Open Graph properties specifically target social scrapers (Facebook, Slack, Discord, LinkedIn), 
                            they also indirectly boost Search Engine Optimization (SEO). Increased click-through rates from attractive 
                            social cards lead to higher traffic signals.
                        </p>
                        <p>
                            Furthermore, for dynamic platforms (like React or Vue Apps), ensuring these tags are available 
                            to scrapers immediately requires Server-Side Rendering (SSR) or Pre-rendering, as many bots will not execute JavaScript 
                            to wait for your &lt;Helmet&gt; tags to populate. Utilizing tools like Next.js is highly recommended for marketing sites 
                            dependent on social visibility.
                        </p>
                    </section>
                </div>

            </div>
        </div>
    );
}
