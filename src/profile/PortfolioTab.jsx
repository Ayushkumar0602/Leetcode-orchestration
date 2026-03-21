import { useState, useEffect } from 'react';
import { Github, Linkedin, Globe, Plus, X, Briefcase, GraduationCap, Code2, Link2, FileText, ExternalLink, ChevronDown, ChevronUp, Upload, Loader2, MapPin, Target, Layers, Compass } from 'lucide-react';

// ── Devicon resolver ──────────────────────────────────────────────
const DEVICON_MAP = {
    react: 'react', javascript: 'javascript', typescript: 'typescript', python: 'python',
    nodejs: 'nodejs', 'node.js': 'nodejs', java: 'java', cpp: 'cplusplus', 'c++': 'cplusplus',
    c: 'c', go: 'go', rust: 'rust', swift: 'swift', kotlin: 'kotlin', dart: 'dart',
    flutter: 'flutter', html: 'html5', css: 'css3', sass: 'sass', tailwind: 'tailwindcss',
    mongodb: 'mongodb', postgres: 'postgresql', postgresql: 'postgresql', mysql: 'mysql',
    redis: 'redis', firebase: 'firebase', docker: 'docker', kubernetes: 'kubernetes',
    git: 'git', github: 'github', linux: 'linux', aws: 'amazonwebservices', gcp: 'googlecloud',
    azure: 'azure', graphql: 'graphql', nextjs: 'nextjs', 'next.js': 'nextjs',
    vuejs: 'vuejs', 'vue.js': 'vuejs', angular: 'angularjs', django: 'django',
    flask: 'flask', express: 'express', figma: 'figma', redux: 'redux', vite: 'vite',
};
function getDevIcon(skill) {
    const name = DEVICON_MAP[skill.toLowerCase().replace(/\s/g, '')];
    return name ? `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${name}/${name}-original.svg` : null;
}

// ── CSS ───────────────────────────────────────────────────────────
const CSS = `
.pf-section{background:rgba(20,22,30,0.65);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:1.5rem;}
.pf-input{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:0.82rem;outline:none;box-sizing:border-box;font-family:inherit;transition:border-color 0.2s;}
.pf-input:focus{border-color:rgba(168,85,247,0.5);}
.pf-label{font-size:0.78rem;font-weight:600;color:rgba(255,255,255,0.45);display:block;margin-bottom:6px;}
.pf-skill-tag{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:5px 10px;font-size:0.75rem;color:#e8e8e8;transition:all 0.2s;}
.pf-cert-tag{display:inline-flex;align-items:center;gap:5px;background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.25);border-radius:8px;padding:5px 10px;font-size:0.75rem;color:#fbbf24;}
.pf-entry-card{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:12px 14px;margin-bottom:8px;}
.pf-add-zone{background:rgba(255,255,255,0.02);border:1px dashed rgba(255,255,255,0.1);border-radius:12px;padding:12px;}
.ov-card{background:linear-gradient(135deg,rgba(168,85,247,0.07),rgba(59,130,246,0.04));backdrop-filter:blur(16px);border:1px solid rgba(168,85,247,0.18);border-radius:24px;padding:1.75rem;margin-bottom:1.5rem;}
.slink{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:5px 12px;font-size:0.75rem;font-weight:600;color:#e8e8e8;text-decoration:none;}
@media(max-width:900px){.pf-grid{grid-template-columns:1fr !important;}}
@media(max-width:640px){
    .pf-section{padding:1.25rem;}
    .pf-input{font-size:0.85rem;}
}
`;

// ── Components ────────────────────────────────────────────────────

function OverviewCard({ form }) {
    const empty = !form.bio && !form.github && !form.linkedin && !form.portfolio &&
        !(form.skills || []).length && !(form.experience || []).length && !(form.education || []).length && !(form.projects || []).length;
    if (empty) return (
        <div className="ov-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✦</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>Portfolio Preview</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>Fill in the form below to see a live preview of your public portfolio</div>
        </div>
    );
    return (
        <div className="ov-card">
            <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(168,85,247,0.6)', textTransform: 'uppercase', marginBottom: '10px' }}>⚡ Live Portfolio Preview</div>
            
            {(form.preferredRole || form.location) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    {form.preferredRole && <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{form.preferredRole}</div>}
                    {form.location && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={10} />{form.location}</div>}
                </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
                {form.bio && <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', margin: 0, fontStyle: 'italic', flex: 1 }}>"{form.bio}"</p>}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {form.github && <a href={`https://${form.github}`} target="_blank" rel="noreferrer" className="slink"><Github size={12} />{form.github.replace(/^https?:\/\/(www\.)?/, '').split('/').slice(0, 2).join('/')}</a>}
                    {form.linkedin && <a href={`https://${form.linkedin}`} target="_blank" rel="noreferrer" className="slink"><Linkedin size={12} />LinkedIn</a>}
                    {form.portfolio && <a href={`https://${form.portfolio}`} target="_blank" rel="noreferrer" className="slink"><Globe size={12} />Portfolio</a>}
                    {form.resume && <a href={form.resume} target="_blank" rel="noreferrer" className="slink"><FileText size={12} />Resume</a>}
                </div>
            </div>
            {(form.skills || []).length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Skills</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {form.skills.slice(0, 12).map(s => {
                            const icon = getDevIcon(s);
                            return <span key={s} className="pf-skill-tag">{icon && <img src={icon} alt={s} style={{ width: 14, height: 14 }} onError={e => e.target.style.display = 'none'} />}{s}</span>;
                        })}
                        {form.skills.length > 12 && <span className="pf-skill-tag" style={{ color: 'rgba(255,255,255,0.3)' }}>+{form.skills.length - 12}</span>}
                    </div>
                </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: (form.experience || []).length && (form.education || []).length ? '1fr 1fr' : '1fr', gap: '1rem', marginBottom: (form.projects || []).length ? '1rem' : 0 }}>
                {(form.experience || []).slice(0, 2).length > 0 && (
                    <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Experience</div>
                        {form.experience.slice(0, 2).map((e, i) => <div key={i} style={{ marginBottom: '6px' }}><div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{e.role}</div><div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{e.company}{e.duration && ` · ${e.duration}`}</div></div>)}
                    </div>
                )}
                {(form.education || []).slice(0, 2).length > 0 && (
                    <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Education</div>
                        {form.education.slice(0, 2).map((e, i) => <div key={i} style={{ marginBottom: '6px' }}><div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{e.degree}</div><div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{e.institution}{e.year && ` · ${e.year}`}</div></div>)}
                    </div>
                )}
            </div>
            {(form.projects || []).length > 0 && (
                <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Projects</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {form.projects.slice(0, 3).map((p, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 12px', minWidth: '130px' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{p.name}</div>
                                {p.desc && <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{p.desc.slice(0, 50)}{p.desc.length > 50 ? '…' : ''}</div>}
                                {p.link && <a href={p.link.startsWith('http') ? p.link : `https://${p.link}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.68rem', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none', marginTop: '4px' }}><ExternalLink size={9} />View</a>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function SkillInput({ skills, onAdd, onRemove }) {
    const [val, setVal] = useState('');
    const icon = val.trim() ? getDevIcon(val.trim()) : null;
    const add = () => { const v = val.trim(); if (v) { onAdd(v); setVal(''); } };
    return (
        <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px', minHeight: '28px' }}>
                {(skills || []).map(s => {
                    const ic = getDevIcon(s);
                    return (
                        <span key={s} className="pf-skill-tag">
                            {ic && <img src={ic} alt={s} style={{ width: 15, height: 15 }} onError={e => e.target.style.display = 'none'} />}
                            {s}
                            <X size={10} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.3)', marginLeft: '2px' }} onClick={() => onRemove(s)} />
                        </span>
                    );
                })}
                {!(skills || []).length && <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>No skills added yet</span>}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {icon && <img src={icon} alt="" style={{ width: 22, height: 22, flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />}
                <input className="pf-input" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Type a skill + Enter (React, Docker, Python…)" />
                <button onClick={add} style={{ flexShrink: 0, background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.35)', borderRadius: '10px', padding: '9px 14px', color: '#c084fc', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Plus size={15} /></button>
            </div>
        </div>
    );
}

function ListEditor({ label, icon: Icon, color, items, onAdd, onRemove, fields }) {
    const [open, setOpen] = useState(true);
    const [form, setForm] = useState({});
    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <button onClick={() => setOpen(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 10px', color: '#fff' }}>
                {Icon && <Icon size={14} color={color} />}
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{label}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>{items.length} added</span>
                {open ? <ChevronUp size={14} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={14} color="rgba(255,255,255,0.3)" />}
            </button>
            {open && (
                <>
                    {items.map((item, i) => (
                        <div key={i} className="pf-entry-card" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{item[fields[0].key]}</div>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '3px' }}>
                                    {fields.slice(1).map(f => item[f.key] && <span key={f.key} style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{item[f.key]}</span>)}
                                </div>
                            </div>
                            <button onClick={() => onRemove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.5)', padding: '2px', flexShrink: 0 }}><X size={13} /></button>
                        </div>
                    ))}
                    <div className="pf-add-zone">
                        <div style={{ display: 'grid', gridTemplateColumns: fields.length > 1 ? `repeat(${Math.min(fields.length, 2)},1fr)` : '1fr', gap: '8px' }}>
                            {fields.map(f => <input key={f.key} className="pf-input" value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />)}
                        </div>
                        <button onClick={() => { if (form[fields[0].key]) { onAdd({ ...form }); setForm({}); } }} style={{ marginTop: '8px', width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                            <Plus size={12} /> Add {label.replace(/s$/, '')}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

function ProjectItem({ project, onRemove, onEnhance, enhancing, onUpdate }) {
    return (
        <div className="pf-entry-card" style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{project.name}</div>
                    {project.link && project.link.includes('github.com') && (
                        <button 
                            onClick={() => onEnhance(project)} 
                            disabled={enhancing}
                            style={{ 
                                background: 'rgba(168,85,247,0.15)', 
                                border: '1px solid rgba(168,85,247,0.3)', 
                                borderRadius: '6px', 
                                padding: '2px 8px', 
                                color: '#c084fc', 
                                fontSize: '0.65rem', 
                                fontWeight: 700, 
                                cursor: enhancing ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            {enhancing ? <Loader2 size={10} className="animate-spin" /> : '✨ AI Enhance'}
                        </button>
                    )}
                </div>
                {project.tagline && <div style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 600, marginBottom: '4px' }}>{project.tagline}</div>}
                {project.desc && <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginBottom: '4px' }}>{project.desc}</div>}
                {project.link && <a href={project.link.startsWith('http') ? project.link : `https://${project.link}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}><ExternalLink size={9} />View project</a>}
                {project.detailedData && <div style={{ fontSize: '0.65rem', color: '#10b981', marginTop: '4px', fontWeight: 700 }}>✓ AI Enhanced Content Ready</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Template:</span>
                    {['cinematic', 'bento', 'minimal'].map(t => (
                        <button 
                            key={t}
                            onClick={() => onUpdate && onUpdate('template', t)}
                            style={{ 
                                background: (project.template || 'cinematic') === t ? 'rgba(168,85,247,0.2)' : 'transparent',
                                border: `1px solid ${(project.template || 'cinematic') === t ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                color: (project.template || 'cinematic') === t ? '#c084fc' : 'rgba(255,255,255,0.5)',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
            <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.5)', flexShrink: 0 }}><X size={13} /></button>
        </div>
    );
}

function ProjectAddForm({ onAdd }) {
    const [pf, setPf] = useState({});
    return (
        <div className="pf-add-zone">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <input className="pf-input" value={pf.name || ''} onChange={e => setPf(p => ({ ...p, name: e.target.value }))} placeholder="Project Name *" />
                <input className="pf-input" value={pf.link || ''} onChange={e => setPf(p => ({ ...p, link: e.target.value }))} placeholder="GitHub / Live URL" />
            </div>
            <input className="pf-input" value={pf.desc || ''} onChange={e => setPf(p => ({ ...p, desc: e.target.value }))} placeholder="Short description" style={{ marginBottom: '8px' }} />
            <button onClick={() => { if (pf.name) { onAdd({ ...pf }); setPf({}); } }} style={{ width: '100%', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '8px', padding: '8px', color: '#22d3ee', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <Plus size={12} /> Add Project
            </button>
        </div>
    );
}

// ── CertInput ─────────────────────────────────────────────────────
function CertInput({ certs, onAdd, onRemove }) {
    const [val, setVal] = useState('');
    const add = () => { const v = val.trim(); if (v) { onAdd(v); setVal(''); } };
    return (
        <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {(certs || []).map(c => <span key={c} className="pf-cert-tag">{c}<X size={10} style={{ cursor: 'pointer', marginLeft: '2px' }} onClick={() => onRemove(c)} /></span>)}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <input className="pf-input" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="e.g. AWS Solutions Architect…" />
                <button onClick={add} style={{ flexShrink: 0, background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '10px', padding: '9px 14px', color: '#fbbf24', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Plus size={14} /></button>
            </div>
        </div>
    );
}

// ── Main PortfolioTab ─────────────────────────────────────────────
export default function PortfolioTab({ uid, profile, onSave, setIsAIProcessing }) {
    const [form, setForm] = useState({ bio: '', location: '', preferredRole: '', primaryInterest: '', targetCompanies: [], github: '', linkedin: '', portfolio: '', resume: '', skills: [], certifications: [], education: [], experience: [], projects: [], ...profile });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [parsingTarget, setParsingTarget] = useState(false);
    const [manualReadmeModal, setManualReadmeModal] = useState({ show: false, index: null, error: '', text: '', enhancing: false });

    useEffect(() => { setForm({ bio: '', location: '', preferredRole: '', primaryInterest: '', targetCompanies: [], github: '', linkedin: '', portfolio: '', resume: '', skills: [], certifications: [], education: [], experience: [], projects: [], ...profile }); }, [profile]);

    const save = async () => { setSaving(true); await onSave(form); setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2200); };

    // --- Auto Fill from Resume Logic ---
    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setParsingTarget(true);
        setIsAIProcessing(true); // Show global spinner
        try {
            const rdr = new FileReader();
            const result = await new Promise((resolve, reject) => {
                rdr.onload = () => resolve(rdr.result);
                rdr.onerror = reject;
                rdr.readAsDataURL(file);
            });
            
            const b64 = result.split(',')[1];
            const res = await fetch('https://leetcode-orchestration.onrender.com/api/resume/parse', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ base64Data: b64, mimeType: file.type })
            });
            const data = await res.json();
            if (data.profile) {
                const mapped = data.profile;
                const newForm = {
                    ...form,
                    bio: mapped.bio || form.bio,
                    github: mapped.github || form.github,
                    portfolio: mapped.portfolio || form.portfolio,
                    skills: [...new Set([...(form.skills || []), ...(mapped.skills || [])])],
                    certifications: [...new Set([...(form.certifications || []), ...(mapped.certifications || [])])],
                    experience: mapped.experience && mapped.experience.length ? mapped.experience : form.experience,
                    education: mapped.education && mapped.education.length ? mapped.education : form.education,
                    projects: mapped.projects && mapped.projects.length ? mapped.projects : form.projects
                };
                setForm(newForm);
                await onSave(newForm);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to parse resume.");
        } finally {
            setParsingTarget(false);
            setIsAIProcessing(false); // Hide global spinner
            e.target.value = null;
        }
    };
    // ------------------------------------

    const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const addTag = (k, v) => upd(k, [...new Set([...(form[k] || []), v.trim()])]);
    const rmTag = (k, v) => upd(k, (form[k] || []).filter(t => t !== v));
    const addItem = (k, v) => upd(k, [...(form[k] || []), v]);
    const rmItem = (k, i) => upd(k, (form[k] || []).filter((_, idx) => idx !== i));

    return (
        <div>
            <style>{CSS}</style>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Customize Portfolio</div>
                {/* ── Auto Fill Button ── */}
                <div style={{ position: 'relative' }}>
                    <input type="file" id="_resumeUp" accept=".pdf,image/*" onChange={handleResumeUpload} style={{ display: 'none' }} />
                    <button onClick={() => document.getElementById('_resumeUp').click()} disabled={parsingTarget} style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '10px', padding: '10px 16px', color: '#c084fc', cursor: parsingTarget ? 'wait' : 'pointer', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', opacity: parsingTarget ? 0.7 : 1 }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.25)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(168,85,247,0.15)'}>
                        {parsingTarget ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Scanning Resume...</> : <><Upload size={16} /> Auto-fill with Resume</>}
                        <style>{'@keyframes spin{to{transform:rotate(360deg);}}'}</style>
                    </button>
                    {!parsingTarget && <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#eab308', color: '#000', fontSize: '0.55rem', fontWeight: 900, padding: '2px 6px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Magic ✨</div>}
                </div>
            </div>

            <OverviewCard form={form} />

            {manualReadmeModal.show && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                    <div className="pf-section" style={{ width: '90%', maxWidth: '600px', background: '#1e1b4b', border: '1px solid rgba(168,85,247,0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={18} color="#c084fc" /> Manual README Entry
                            </h3>
                            <button onClick={() => setManualReadmeModal({ show: false, index: null, error: '', text: '', enhancing: false })} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                        {manualReadmeModal.error && (
                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px', borderRadius: '8px', color: '#fca5a5', fontSize: '0.8rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                                <strong>Scraper Failed:</strong> {manualReadmeModal.error}
                                <br />Please paste the raw Markdown content of your README below to continue.
                            </div>
                        )}
                        <textarea 
                            className="pf-input" 
                            style={{ minHeight: '250px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: 1.5 }}
                            placeholder="# Project Overview&#10;Paste your README.md here..."
                            value={manualReadmeModal.text}
                            onChange={(e) => setManualReadmeModal(p => ({ ...p, text: e.target.value }))}
                            disabled={manualReadmeModal.enhancing}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                            <button 
                                onClick={() => setManualReadmeModal({ show: false, index: null, error: '', text: '', enhancing: false })}
                                disabled={manualReadmeModal.enhancing}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={async () => {
                                    if (!manualReadmeModal.text.trim()) return;
                                    setManualReadmeModal(p => ({ ...p, enhancing: true }));
                                    setIsAIProcessing(true); // Show global spinner
                                    try {
                                        const res = await fetch('https://leetcode-orchestration.onrender.com/api/project/extract-readme', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ readmeContent: manualReadmeModal.text })
                                        });
                                        const data = await res.json();
                                        if (data.projectData) {
                                            const updatedProjs = [...form.projects];
                                            const i = manualReadmeModal.index;
                                            updatedProjs[i] = { 
                                                ...updatedProjs[i], 
                                                name: data.projectData.name || updatedProjs[i].name,
                                                desc: data.projectData.overview ? data.projectData.overview.slice(0, 150) + '...' : updatedProjs[i].desc,
                                                tagline: data.projectData.tagline,
                                                detailedData: data.projectData 
                                            };
                                            upd('projects', updatedProjs);
                                            setManualReadmeModal({ show: false, index: null, error: '', text: '', enhancing: false });
                                        } else if (data.error) {
                                            setManualReadmeModal(p => ({ ...p, error: data.error, enhancing: false }));
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        setManualReadmeModal(p => ({ ...p, error: "Failed to extract project details. Please try again.", enhancing: false }));
                                    } finally {
                                        setIsAIProcessing(false); // Hide global spinner
                                    }
                                }}
                                disabled={manualReadmeModal.enhancing || (!manualReadmeModal.text.trim())}
                                style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)', border: 'none', padding: '8px 16px', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: manualReadmeModal.enhancing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: manualReadmeModal.enhancing || (!manualReadmeModal.text.trim()) ? 0.6 : 1 }}
                            >
                                {manualReadmeModal.enhancing ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : '✨ Extract Details'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="pf-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                {/* Left */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Bio & Links */}
                    <div className="pf-section">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1.25rem', color: '#fff' }}>
                            <Link2 size={16} color="#a855f7" /> Social & Bio
                        </h3>
                        <label className="pf-label">Bio / Tagline</label>
                        <textarea className="pf-input" value={form.bio} onChange={e => upd('bio', e.target.value)} placeholder="A short line about you — appears on your public profile…" style={{ resize: 'vertical', minHeight: '72px', marginBottom: '14px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { key: 'github', icon: Github, placeholder: 'github.com/username', accent: '#fff', bg: 'rgba(255,255,255,0.04)' },
                                { key: 'linkedin', icon: Linkedin, placeholder: 'linkedin.com/in/username', accent: '#0a66c2', bg: 'rgba(10,102,194,0.07)' },
                                { key: 'portfolio', icon: Globe, placeholder: 'yourportfolio.com', accent: '#10b981', bg: 'rgba(16,185,129,0.07)' },
                                { key: 'resume', icon: FileText, placeholder: 'link to Resume / CV', accent: '#f59e0b', bg: 'rgba(245,158,11,0.07)' },
                            ].map(s => (
                                <div key={s.key} style={{ display: 'flex', alignItems: 'center', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.09)' }}>
                                    <div style={{ background: s.bg, padding: '0 12px', height: '40px', display: 'flex', alignItems: 'center', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.07)' }}><s.icon size={14} color={s.accent} /></div>
                                    <input className="pf-input" value={form[s.key] || ''} onChange={e => upd(s.key, e.target.value)} placeholder={s.placeholder} style={{ border: 'none', borderRadius: 0, height: '40px', padding: '0 12px', flex: 1 }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Career Details */}
                    <div className="pf-section">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1.25rem', color: '#fff' }}>
                            <Compass size={16} color="#06b6d4" /> Career Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                            <div>
                                <label className="pf-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={12} /> Location</label>
                                <input className="pf-input" value={form.location || ''} onChange={e => upd('location', e.target.value)} placeholder="City, Country" />
                            </div>
                            <div>
                                <label className="pf-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Briefcase size={12} /> Preferred Role</label>
                                <input className="pf-input" value={form.preferredRole || ''} onChange={e => upd('preferredRole', e.target.value)} placeholder="e.g. Frontend Engineer" />
                            </div>
                        </div>

                        <div style={{ marginBottom: '14px' }}>
                            <label className="pf-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Layers size={12} /> Primary Goal</label>
                            <select 
                                className="pf-input" 
                                value={form.primaryInterest || ''} 
                                onChange={e => upd('primaryInterest', e.target.value)}
                                style={{ appearance: 'none', cursor: 'pointer', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                            >
                                <option value="" style={{ background: '#141620' }}>Select primary goal...</option>
                                <option value="DSA" style={{ background: '#141620' }}>DSA Prep (LeetCode & Algorithms)</option>
                                <option value="SystemDesign" style={{ background: '#141620' }}>System Design (HLD & Architecture)</option>
                            </select>
                        </div>

                        <div>
                            <label className="pf-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}><Target size={12} /> Target Companies</label>
                            <CertInput certs={form.targetCompanies || []} onAdd={v => addTag('targetCompanies', v)} onRemove={v => rmTag('targetCompanies', v)} />
                        </div>
                    </div>

                    {/* Skills + Certs */}
                    <div className="pf-section">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 .25rem', color: '#fff' }}>
                            <Code2 size={16} color="#3b82f6" /> Skills
                        </h3>
                        <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)', margin: '0 0 12px' }}>Tech icons auto-appear for React, Python, Docker, AWS, etc.</p>
                        <SkillInput skills={form.skills || []} onAdd={v => addTag('skills', v)} onRemove={v => rmTag('skills', v)} />
                        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <label className="pf-label" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>🏅 Certifications</label>
                            <CertInput certs={form.certifications || []} onAdd={v => addTag('certifications', v)} onRemove={v => rmTag('certifications', v)} />
                        </div>
                    </div>
                </div>

                {/* Right */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Experience & Education */}
                    <div className="pf-section">
                        <ListEditor label="Work Experience" icon={Briefcase} color="#f59e0b" items={form.experience || []} onAdd={v => addItem('experience', v)} onRemove={i => rmItem('experience', i)}
                            fields={[{ key: 'role', placeholder: 'Role / Title *' }, { key: 'company', placeholder: 'Company' }, { key: 'duration', placeholder: 'Duration (e.g. 2022–2024)' }]} />
                        <ListEditor label="Education" icon={GraduationCap} color="#a855f7" items={form.education || []} onAdd={v => addItem('education', v)} onRemove={i => rmItem('education', i)}
                            fields={[{ key: 'degree', placeholder: 'Degree / Program *' }, { key: 'institution', placeholder: 'Institution' }, { key: 'year', placeholder: 'Year' }]} />
                    </div>

                    {/* Projects */}
                    <div className="pf-section">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem', color: '#fff' }}>
                            <ExternalLink size={16} color="#06b6d4" /> Projects
                        </h3>
                        {(form.projects || []).map((p, i) => (
                            <ProjectItem 
                                key={i} 
                                project={p} 
                                enhancing={parsingTarget === `proj-${i}`}
                                onRemove={() => rmItem('projects', i)} 
                                onUpdate={(k, v) => {
                                    const updatedProjs = [...form.projects];
                                    updatedProjs[i] = { ...updatedProjs[i], [k]: v };
                                    upd('projects', updatedProjs);
                                }}
                                onEnhance={async () => {
                                    if (!p.link || !p.link.includes('github.com')) return;
                                    setParsingTarget(`proj-${i}`);
                                    setIsAIProcessing(true); // Show global spinner
                                    try {
                                        const res = await fetch('https://leetcode-orchestration.onrender.com/api/project/extract-readme', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ githubUrl: p.link })
                                        });
                                        const data = await res.json();
                                        if (data.projectData) {
                                            const updatedProjs = [...form.projects];
                                            updatedProjs[i] = { 
                                                ...updatedProjs[i], 
                                                name: data.projectData.name || updatedProjs[i].name,
                                                desc: data.projectData.overview ? data.projectData.overview.slice(0, 150) + '...' : updatedProjs[i].desc,
                                                tagline: data.projectData.tagline,
                                                detailedData: data.projectData 
                                            };
                                            upd('projects', updatedProjs);
                                        } else if (data.error) {
                                            setManualReadmeModal({ show: true, index: i, error: data.error, text: '', enhancing: false });
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert("Failed to extract project details. Please try again.");
                                    } finally {
                                        setParsingTarget(false);
                                        setIsAIProcessing(false); // Hide global spinner
                                    }
                                }}
                            />
                        ))}
                        <ProjectAddForm onAdd={v => addItem('projects', v)} />
                    </div>
                </div>
            </div>

            {/* Save */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '12px', alignItems: 'center' }}>
                {saved && <span style={{ fontSize: '0.82rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>✓ Changes saved!</span>}
                <button onClick={save} disabled={saving} style={{ background: saved ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg,#a855f7,#3b82f6)', border: saved ? '1px solid rgba(16,185,129,0.35)' : 'none', borderRadius: '12px', padding: '12px 32px', color: saved ? '#34d399' : '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'wait' : 'pointer', transition: 'all 0.3s', opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Portfolio'}
                </button>
            </div>
        </div>
    );
}
