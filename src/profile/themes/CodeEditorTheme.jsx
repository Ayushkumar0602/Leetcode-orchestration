import React, { useState } from 'react';
import { User, Code2, FolderGit2, FileJson, Terminal, Play, X as XIcon, Send as SendIcon, Loader2, FileCode2 } from 'lucide-react';

export default function CodeEditorTheme({ profile, stats, recentInv, validInvCount, hasProjects, hasExperience, hasEducation, T, navigate, primaryCta, connectModalOpen, setConnectModalOpen, connectMessage, setConnectMessage, connectBusy, sendConnectRequest, isDark }) {
    const [activeFile, setActiveFile] = useState('About.ts');
    
    // Extracted dynamic css
    const sCSS = `
    .code-wrapper { display: flex; width: 100vw; min-height: 100vh; background: ${isDark ? '#1e1e1e' : '#f3f3f3'}; color: ${isDark ? '#d4d4d4' : '#333333'}; font-family: 'Consolas', 'Courier New', monospace; overflow: hidden; }
    .code-sidebar { width: 250px; background: ${isDark ? '#252526' : '#f3f3f3'}; border-right: 1px solid ${isDark ? '#333' : '#ccc'}; display: flex; flex-direction: column; }
    .code-sidebar-header { padding: 10px 20px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: ${isDark ? '#969696' : '#666'}; }
    .code-file { padding: 6px 20px 6px 30px; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; transition: background 0.1s; color: ${isDark ? '#cccccc' : '#333'}; }
    .code-file:hover { background: ${isDark ? '#2a2d2e' : '#e8e8e8'}; }
    .code-file.active { background: ${isDark ? '#37373d' : '#e4e6f1'}; color: ${isDark ? '#fff' : '#000'}; }
    
    .code-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: ${isDark ? '#1e1e1e' : '#ffffff'}; }
    .code-tabs { display: flex; background: ${isDark ? '#2d2d2d' : '#ececec'}; border-bottom: 1px solid ${isDark ? '#333' : '#ccc'}; }
    .code-tab { padding: 10px 16px; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; border-right: 1px solid ${isDark ? '#333' : '#ccc'}; color: ${isDark ? '#969696' : '#666'}; background: ${isDark ? '#2d2d2d' : '#ececec'}; }
    .code-tab.active { background: ${isDark ? '#1e1e1e' : '#ffffff'}; color: ${isDark ? '#fff' : '#000'}; border-top: 2px solid ${T.accent}; }
    
    .code-content { flex: 1; padding: 20px; overflow-y: auto; font-size: 0.9rem; line-height: 1.5; scrollbar-width: thin; }
    
    .kw { color: ${isDark ? '#569cd6' : '#0000ff'}; } /* keywords */
    .str { color: ${isDark ? '#ce9178' : '#a31515'}; } /* strings */
    .prop { color: ${isDark ? '#9cdcfe' : '#0451a5'}; } /* properties */
    .fn { color: ${isDark ? '#dcdcaa' : '#795e26'}; } /* functions */
    .num { color: ${isDark ? '#b5cea8' : '#098658'}; } /* numbers */
    .cmt { color: ${isDark ? '#6a9955' : '#008000'}; font-style: italic; } /* comments */
    
    @media (max-width: 768px) {
        .code-sidebar { display: none; }
        .code-wrapper { flex-direction: column; }
    }
    `;

    const files = [
        { name: 'About.ts', icon: <FileCode2 size={14} color="#3178c6" /> },
        ...(hasProjects ? [{ name: 'Projects.js', icon: <FileCode2 size={14} color="#f7df1e" /> }] : []),
        ...((profile.skills || []).length > 0 ? [{ name: 'Skills.json', icon: <FileJson size={14} color="#cbd5e1" /> }] : []),
        { name: 'Interviews.json', icon: <FileJson size={14} color="#cbd5e1" /> }
    ];

    const stringify = (str) => <span className="str">"{str}"</span>;
    const prop = (str) => <span className="prop">{str}</span>;
    const kw = (str) => <span className="kw">{str}</span>;
    const num = (n) => <span className="num">{n}</span>;

    return (
        <div className="code-wrapper">
            <style>{sCSS}</style>
            
            {/* Sidebar */}
            <div className="code-sidebar">
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${isDark ? '#333' : '#ccc'}` }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {profile.photoURL ? <img src={profile.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : <User size={18} color="#fff" />}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{profile.displayName || 'Dev'} Workspace</span>
                </div>
                
                <div className="code-sidebar-header" style={{ marginTop: '10px' }}>EXPLORER</div>
                <div style={{ padding: '6px 20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                    <span style={{ transform: 'rotate(90deg)', fontSize: '0.6rem' }}>▶</span> PORTFOLIO
                </div>
                
                <div style={{ paddingLeft: '8px' }}>
                    {files.map(f => (
                        <div key={f.name} className={`code-file ${activeFile === f.name ? 'active' : ''}`} onClick={() => setActiveFile(f.name)}>
                            {f.icon} {f.name}
                        </div>
                    ))}
                </div>
                
                {primaryCta && (
                    <div style={{ padding: '20px', marginTop: 'auto' }}>
                        <button onClick={primaryCta.action} disabled={primaryCta.disabled} style={{ width: '100%', background: T.accent, color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                            <Terminal size={14} /> Run "Connect"
                        </button>
                    </div>
                )}
            </div>

            {/* Main Area */}
            <div className="code-main">
                {/* Tabs */}
                <div className="code-tabs">
                    {files.map(f => (
                        <div key={f.name} className={`code-tab ${activeFile === f.name ? 'active' : ''}`} onClick={() => setActiveFile(f.name)}>
                            {f.icon} {f.name} {activeFile === f.name && <XIcon size={14} style={{ marginLeft: 6, opacity: 0.5 }} />}
                        </div>
                    ))}
                </div>

                {/* Editor Content */}
                <div className="code-content">
                    {activeFile === 'About.ts' && (
                        <div>
                            <div className="cmt">{'/**'}</div>
                            <div className="cmt">{' * Developer Identity Configuration'}</div>
                            <div className="cmt">{' * Auto-generated by Whizan AI'}</div>
                            <div className="cmt">{' */'}</div>
                            <br/>
                            {kw('interface')} <span style={{ color: isDark ? '#4ec9b0' : '#267f99' }}>Developer</span> {'{'} <br/>
                            &nbsp;&nbsp;{prop('name')}: <span style={{ color: isDark ? '#4ec9b0' : '#267f99' }}>string</span>; <br/>
                            &nbsp;&nbsp;{prop('role')}: <span style={{ color: isDark ? '#4ec9b0' : '#267f99' }}>string</span>; <br/>
                            &nbsp;&nbsp;{prop('location')}: <span style={{ color: isDark ? '#4ec9b0' : '#267f99' }}>string</span>; <br/>
                            &nbsp;&nbsp;{prop('bio')}: <span style={{ color: isDark ? '#4ec9b0' : '#267f99' }}>string</span>; <br/>
                            {'}'}<br/><br/>

                            {kw('const')} <span style={{ color: isDark ? '#4fc1ff' : '#001080' }}>profile</span>: <span style={{ color: isDark ? '#4ec9b0' : '#267f99' }}>Developer</span> = {'{'} <br/>
                            &nbsp;&nbsp;{prop('name')}: {stringify(profile.displayName || 'Dev')},<br/>
                            &nbsp;&nbsp;{prop('role')}: {stringify(profile.currentRole || profile.role || 'Software Engineer')},<br/>
                            &nbsp;&nbsp;{prop('location')}: {stringify(profile.location || 'Remote')},<br/>
                            &nbsp;&nbsp;{prop('bio')}: {stringify(profile.bio || 'Building the future.')},<br/>
                            {'}'};<br/><br/>
                            {kw('export default')} <span style={{ color: isDark ? '#4fc1ff' : '#001080' }}>profile</span>;
                        </div>
                    )}

                    {activeFile === 'Projects.js' && (
                        <div>
                            {kw('const')} <span style={{ color: isDark ? '#4fc1ff' : '#001080' }}>projects</span> = [<br/>
                            {profile.projects?.map((p, i) => (
                                <span key={i}>
                                    &nbsp;&nbsp;{'{'}<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;{prop('name')}: {stringify(p.name)},<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;{prop('description')}: {stringify(p.desc)},<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;{prop('technologies')}: [{p.tech?.map(t => stringify(t)).reduce((prev, curr) => [prev, ', ', curr], '')}],<br/>
                                    {p.link && <>&nbsp;&nbsp;&nbsp;&nbsp;{prop('url')}: {stringify(p.link)},<br/></>}
                                    &nbsp;&nbsp;{'}'}{i < profile.projects.length - 1 ? ',' : ''}<br/>
                                </span>
                            ))}
                            ];<br/><br/>
                            <span className="fn">console.log</span>(projects);
                        </div>
                    )}

                    {activeFile === 'Skills.json' && (
                        <div>
                            {'{'}<br/>
                            &nbsp;&nbsp;{stringify("languages_and_tools")}: [<br/>
                            &nbsp;&nbsp;&nbsp;&nbsp;{profile.skills?.map(s => stringify(s)).reduce((prev, curr) => [prev, ",\n    ", curr], '')}<br/>
                            &nbsp;&nbsp;]<br/>
                            {'}'}
                        </div>
                    )}

                    {activeFile === 'Interviews.json' && (
                        <div>
                            {'{'}<br/>
                            &nbsp;&nbsp;{stringify("total_problems_solved")}: {num(stats?.Total || 0)},<br/>
                            &nbsp;&nbsp;{stringify("mock_interviews_completed")}: {num(validInvCount)},<br/>
                            &nbsp;&nbsp;{stringify("recent_evaluations")}: [<br/>
                            {(recentInv || []).map((inv, i) => (
                                <span key={i}>
                                    &nbsp;&nbsp;&nbsp;&nbsp;{'{'}<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{stringify("problem")}: {stringify(inv.problemTitle || 'Mock')},<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{stringify("score")}: {num(inv.overallScore)},<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{stringify("date")}: {stringify(new Date(inv.createdAt?.toDate ? inv.createdAt.toDate() : inv.createdAt).toISOString().split('T')[0])}<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;{'}'}{i < recentInv.length - 1 ? ',' : ''}<br/>
                                </span>
                            ))}
                            &nbsp;&nbsp;]<br/>
                            {'}'}
                        </div>
                    )}
                </div>

                {/* Bottom Terminal */}
                <div style={{ height: '30px', borderTop: `1px solid ${isDark ? '#333' : '#ccc'}`, background: isDark ? '#007acc' : '#007acc', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.75rem', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Play size={12} /> Ready</div>
                    <div>UTF-8</div>
                    <div>TypeScript React</div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Whizan Server Running</span>
                    </div>
                </div>
            </div>

            {connectModalOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                <div style={{ width: 400, background: isDark ? '#252526' : '#fff', border: `1px solid ${isDark ? '#333' : '#ccc'}`, padding: 20, borderRadius: 8 }}>
                    <h3 style={{ marginTop: 0 }}>Connect</h3>
                    <textarea style={{ width: '100%', height: 100, background: isDark ? '#1e1e1e' : '#f3f3f3', color: isDark ? '#d4d4d4' : '#333', border: `1px solid ${isDark ? '#333' : '#ccc'}`, padding: 10 }} value={connectMessage} onChange={e => setConnectMessage(e.target.value)} />
                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                        <button onClick={sendConnectRequest} style={{ background: T.accent, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>Send</button>
                        <button onClick={() => setConnectModalOpen(false)} style={{ background: 'transparent', color: isDark ? '#ccc' : '#333', border: `1px solid ${isDark ? '#ccc' : '#333'}`, padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
                    </div>
                </div>
            </div>}
        </div>
    );
}
