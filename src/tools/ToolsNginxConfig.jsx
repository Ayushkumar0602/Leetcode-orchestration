import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Editor from '@monaco-editor/react';
import { 
    Server, Globe, ShieldCheck, Zap,
    Copy, Download, Sliders, Hash
} from 'lucide-react';

export default function ToolsNginxConfig() {
    const [domain, setDomain] = useState('example.com');
    const [type, setType] = useState('proxy'); // proxy or static
    const [proxyPass, setProxyPass] = useState('http://localhost:3000');
    const [rootDirectory, setRootDirectory] = useState('/var/www/html');
    const [https, setHttps] = useState(true);
    const [forceHttps, setForceHttps] = useState(true);
    const [gzip, setGzip] = useState(true);
    const [securityHeaders, setSecurityHeaders] = useState(true);
    
    const [configData, setConfigData] = useState('');

    const generateConfig = () => {
        const d = domain.trim() || 'example.com';
        let conf = ``;

        // Redirect HTTP to HTTPS
        if (https && forceHttps) {
            conf += `# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ${d} www.${d};
    return 301 https://$host$request_uri;
}

`;
        }

        conf += `# ${type === 'proxy' ? 'Reverse Proxy' : 'Static Server'} Block for ${d}
server {
`;
        
        // Listen Directives
        if (https) {
            conf += `    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${d} www.${d};

    # SSL Certificates (Update with your actual paths via Certbot)
    ssl_certificate /etc/letsencrypt/live/${d}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${d}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
`;
        } else {
            conf += `    listen 80;
    listen [::]:80;
    server_name ${d} www.${d};
`;
        }

        // Security Headers
        if (securityHeaders) {
            conf += `
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
`;
        }

        // Gzip Compression
        if (gzip) {
            conf += `
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
    gzip_disable "MSIE [1-6]\.";
`;
        }

        // Routing Logic
        if (type === 'proxy') {
            conf += `
    # Reverse Proxy Logic
    location / {
        proxy_pass ${proxyPass.trim() || 'http://localhost:3000'};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
`;
        } else {
            conf += `
    # Static File Routing
    root ${rootDirectory.trim() || '/var/www/html'};
    index index.html index.htm;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Browser Cache for Static Assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        expires 365d;
        add_header Cache-Control "public, no-transform";
    }
`;
        }

        conf += `}`;
        setConfigData(conf);
    };

    useEffect(() => {
        generateConfig();
    }, [domain, type, proxyPass, rootDirectory, https, forceHttps, gzip, securityHeaders]);

    const handleCopy = () => {
        navigator.clipboard.writeText(configData);
    };

    const handleDownload = () => {
        const blob = new Blob([configData], { type: 'text/plain' });
        const link = document.createElement('a');
        link.download = `${domain.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.conf`;
        link.href = URL.createObjectURL(blob);
        link.click();
    };

    return (
        <div style={{ minHeight: '100vh', color: '#fff' }}>
            <Helmet>
                <title>Nginx Config Generator | Reverse Proxy Builder | Whizan AI</title>
                <meta name="description" content="Instantly generate production-ready Nginx configuration files. Build highly optimized reverse proxy templates with SSL, Gzip, and Security headers out of the box." />
                <meta name="keywords" content="nginx config generator, reverse proxy setup, nginx ssl config, nginx react deployment, nginx node proxy" />
                <link rel="canonical" href="https://whizan.xyz/tools/nginx-config" />
            </Helmet>

            <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Server color="#10b981" size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Nginx Config Builder</h1>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Construct highly optimized, secure server blocks and reverse proxies.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 1.5fr', gap: '40px', alignItems: 'start' }}>
                    {/* Controls Sidebar */}
                    <div style={{ background: '#0f172a', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        
                        {/* Core Routing */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 800, fontSize: '0.85rem', marginBottom: '20px', textTransform: 'uppercase' }}><Globe size={16} /> Server Coordinates</div>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', display: 'block' }}>DOMAIN / SERVER_NAME</label>
                                <input 
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    placeholder="api.company.com"
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: '#fff', outline: 'none' }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', display: 'block' }}>INFRASTRUCTURE TYPE</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button 
                                        onClick={() => setType('proxy')}
                                        style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', border: 'none', background: type === 'proxy' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', color: type === 'proxy' ? '#10b981' : '#64748b', cursor: 'pointer' }}
                                    >
                                        Node/Python Proxy
                                    </button>
                                    <button 
                                        onClick={() => setType('static')}
                                        style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', border: 'none', background: type === 'static' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', color: type === 'static' ? '#10b981' : '#64748b', cursor: 'pointer' }}
                                    >
                                        React/Vue Static
                                    </button>
                                </div>
                            </div>

                            {type === 'proxy' ? (
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', display: 'block' }}>INTERNAL TARGET (PROXY_PASS)</label>
                                    <input 
                                        value={proxyPass}
                                        onChange={(e) => setProxyPass(e.target.value)}
                                        placeholder="http://localhost:3000"
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', display: 'block' }}>DOCUMENT ROOT (VAR/WWW)</label>
                                    <input 
                                        value={rootDirectory}
                                        onChange={(e) => setRootDirectory(e.target.value)}
                                        placeholder="/var/www/my-react-app"
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Modifiers */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontWeight: 800, fontSize: '0.85rem', marginBottom: '20px', textTransform: 'uppercase' }}><Sliders size={16} /> Performance & Security</div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={16} color="#10b981" /> Enable HTTPS (SSL/TLS)</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>Listens on 443 with modern cipher suites.</div>
                                    </div>
                                    <div onClick={() => setHttps(!https)} style={{ width: '40px', height: '22px', background: https ? '#10b981' : 'rgba(255,255,255,0.1)', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                                        <div style={{ position: 'absolute', top: '3px', left: https ? '21px' : '3px', width: '16px', height: '16px', background: '#fff', borderRadius: '50%', transition: 'all 0.3s' }} />
                                    </div>
                                </div>

                                {https && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '24px', opacity: 0.8 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Force HTTPS Redirect</div>
                                        <div onClick={() => setForceHttps(!forceHttps)} style={{ width: '40px', height: '22px', background: forceHttps ? '#3b82f6' : 'rgba(255,255,255,0.1)', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                                            <div style={{ position: 'absolute', top: '3px', left: forceHttps ? '21px' : '3px', width: '16px', height: '16px', background: '#fff', borderRadius: '50%', transition: 'all 0.3s' }} />
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={16} color="#f59e0b" /> GZIP Compression</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>Shrinks text assets to save bandwidth.</div>
                                    </div>
                                    <div onClick={() => setGzip(!gzip)} style={{ width: '40px', height: '22px', background: gzip ? '#f59e0b' : 'rgba(255,255,255,0.1)', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                                        <div style={{ position: 'absolute', top: '3px', left: gzip ? '21px' : '3px', width: '16px', height: '16px', background: '#fff', borderRadius: '50%', transition: 'all 0.3s' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><Hash size={16} color="#ec4899" /> Security Headers</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>XSS, Frame-Options, HSTS, Sniffing protection.</div>
                                    </div>
                                    <div onClick={() => setSecurityHeaders(!securityHeaders)} style={{ width: '40px', height: '22px', background: securityHeaders ? '#ec4899' : 'rgba(255,255,255,0.1)', borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                                        <div style={{ position: 'absolute', top: '3px', left: securityHeaders ? '21px' : '3px', width: '16px', height: '16px', background: '#fff', borderRadius: '50%', transition: 'all 0.3s' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Syntax Output */}
                    <div style={{ background: '#0a0a0f', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 800, color: '#10b981' }}>/etc/nginx/sites-available/{domain.split('.')[0] || 'default'}.conf</div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={handleCopy} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Copy size={14} /> Copy
                                </button>
                                <button onClick={handleDownload} style={{ background: '#10b981', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Download size={14} /> Save
                                </button>
                            </div>
                        </div>
                        <Editor
                            height="700px"
                            theme="vs-dark"
                            language="nginx"
                            value={configData}
                            options={{ 
                                readOnly: true, 
                                minimap: { enabled: false }, 
                                fontSize: 13,
                                padding: { top: 20 }
                            }}
                        />
                    </div>
                </div>

                {/* Extensive SEO Platform Text */}
                <div style={{ 
                    marginTop: '80px', 
                    padding: '80px 40px', 
                    background: 'rgba(15, 23, 42, 0.3)', 
                    borderRadius: '40px', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    lineHeight: '1.8',
                    color: '#94a3b8'
                }}>
                    <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, marginBottom: '40px' }}>Architecting the Nginx Edge Node</h2>
                    <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
                        Nginx is the backbone of the modern web, running relentlessly as a high-performance web server, reverse proxy, 
                        and load balancer. Writing an Nginx configuration file (`nginx.conf`) from scratch can be daunting, as misconfigurations 
                        can lead to severe security vulnerabilities, broken WebSockets, or massive performance degradation. 
                        The **Whizan Nginx Config Generator** applies industry-tested best practices dynamically.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', margin: '50px 0' }}>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <h3 style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 800, marginBottom: '15px' }}>The Reverse Proxy Pattern</h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                Node.js, Python Flask, and Spring Boot are excellent application runtimes, but poor public-facing web servers. 
                                Nginx acts as a shield, terminating SSL requests on port 443, mitigating DoS attacks, and forwarding 
                                pure HTTP traffic to your local runtime (e.g., <code>proxy_pass http://localhost:3000</code>).
                            </p>
                        </div>
                        <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '15px' }}>SPA Routing Integrity</h3>
                            <p style={{ fontSize: '0.9rem' }}>
                                Single Page Applications (like React, Vue, or Angular) use client-side routing. If a user manually refreshes 
                                the page at <code>/dashboard</code>, standard Nginx will physically look for a `/dashboard/index.html` file and return a 404. 
                                Our generator injects <code>try_files $uri $uri/ /index.html;</code> to map all frontend routes back to the root entry point.
                            </p>
                        </div>
                    </div>

                    <section style={{ marginTop: '50px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>Header Augmentation</h3>
                        <p style={{ marginBottom: '20px' }}>
                            Proxying requests blindly loses critical client information. The backend server will think every request 
                            is coming from <code>127.0.0.1</code> (the Nginx proxy). The configuration strictly injects <code>X-Real-IP</code> 
                            and <code>X-Forwarded-For</code> headers, ensuring your Node or Python app knows the true origin of the user 
                            for rate-limiting and analytics.
                        </p>
                        <p style={{ fontSize: '0.95rem', padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', borderLeft: '4px solid #10b981' }}>
                            <strong>Installation Note:</strong> After saving the generated file, place it in <code>/etc/nginx/sites-available/</code>, 
                            symlink it to <code>sites-enabled</code>, test the syntax with <code>nginx -t</code>, and reboot the system daemon.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
