import React, { useState, useRef, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    User, Mail, MapPin, Briefcase, Code2, Brain,
    ChevronRight, ChevronLeft, Loader2, Upload, FileText,
    CheckCircle2, X, Plus, Star, Sparkles, Target, Layers,
    Lock
} from 'lucide-react';
import './OnboardingFlow.css';

/* ─── Animation Variants ─────────────────────────────────── */
const pageVariants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60, scale: 0.97 }),
    center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, scale: 0.97, transition: { duration: 0.3 } }),
};

const stagger = { show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.5 } },
};

/* ─── Popular Companies for Tag Suggestions ───────────────── */
const COMPANY_SUGGESTIONS = [
    'Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix',
    'Uber', 'Stripe', 'Airbnb', 'Twitter', 'LinkedIn', 'Spotify',
    'Adobe', 'Salesforce', 'Oracle', 'IBM', 'Goldman Sachs', 'JPMorgan'
];

/* ─── Role Options ─────────────────────────────────────────── */
const ROLE_OPTIONS = [
    'Software Engineer', 'Frontend Engineer', 'Backend Engineer',
    'Full Stack Engineer', 'ML/AI Engineer', 'Data Engineer',
    'DevOps/SRE', 'Mobile Engineer', 'System Architect', 'Other'
];

/* ─── Skill Devicons ───────────────────────────────────────── */
const DEVICON_MAP = {
    react: 'react', javascript: 'javascript', typescript: 'typescript', python: 'python',
    nodejs: 'nodejs', 'node.js': 'nodejs', java: 'java', cpp: 'cplusplus', 'c++': 'cplusplus',
    go: 'go', rust: 'rust', swift: 'swift', kotlin: 'kotlin', dart: 'dart',
    flutter: 'flutter', html: 'html5', css: 'css3', tailwind: 'tailwindcss',
    mongodb: 'mongodb', postgres: 'postgresql', mysql: 'mysql', redis: 'redis',
    firebase: 'firebase', docker: 'docker', kubernetes: 'kubernetes', git: 'git',
    aws: 'amazonwebservices', gcp: 'googlecloud', azure: 'azure', graphql: 'graphql',
    nextjs: 'nextjs', 'next.js': 'nextjs', vuejs: 'vuejs', angular: 'angularjs',
    django: 'django', flask: 'flask', express: 'express', figma: 'figma', redux: 'redux',
};
function getDevIcon(skill) {
    const key = skill.toLowerCase().replace(/\s/g, '');
    const name = DEVICON_MAP[key];
    return name ? `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${name}/${name}-original.svg` : null;
}

function StepIndicator({ step, total = 3 }) {
    const steps = [
        { label: 'Profile', icon: User },
        { label: 'Resume', icon: FileText },
        { label: 'Welcome', icon: Star },
    ];
    return (
        <div className="ob-stepper">
            {steps.map((s, i) => {
                const idx = i + 1;
                const done = idx < step;
                const active = idx === step;
                const Icon = s.icon;
                return (
                    <React.Fragment key={idx}>
                        <div className={`ob-step ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
                            <div className="ob-step-circle">
                                {done ? <CheckCircle2 size={15} /> : <Icon size={14} />}
                            </div>
                            <span className="ob-step-label">{s.label}</span>
                        </div>
                        {i < total - 1 && (
                            <div className={`ob-step-line ${done ? 'done' : ''}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

/* ─── Tag Input (for companies) ────────────────────────────── */
function TagInput({ tags, onAdd, onRemove, placeholder, suggestions, minRequired = 0 }) {
    const [val, setVal] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredSuggestions = suggestions
        ? suggestions.filter(s => s.toLowerCase().includes(val.toLowerCase()) && !tags.includes(s)).slice(0, 6)
        : [];

    const add = (v) => {
        const trimmed = v.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onAdd(trimmed);
            setVal('');
            setShowSuggestions(false);
        }
    };

    return (
        <div className="ob-tag-input-wrap">
            <div className="ob-tags-display">
                {tags.map(t => (
                    <span key={t} className="ob-tag">
                        <Target size={10} />
                        {t}
                        <button type="button" onClick={() => onRemove(t)} className="ob-tag-remove">
                            <X size={10} />
                        </button>
                    </span>
                ))}
                {tags.length < 5 && (
                    <div className="ob-tag-type-wrap" style={{ position: 'relative', flex: 1, minWidth: '150px' }}>
                        <input
                            className="ob-tag-type"
                            value={val}
                            onChange={e => { setVal(e.target.value); setShowSuggestions(true); }}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(val); } }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            placeholder={tags.length === 0 ? placeholder : 'Add more...'}
                        />
                        {showSuggestions && filteredSuggestions.length > 0 && (
                            <div className="ob-suggestions">
                                {filteredSuggestions.map(s => (
                                    <button key={s} type="button" className="ob-suggestion-item" onMouseDown={() => add(s)}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {minRequired > 0 && (
                <div className="ob-tag-hint">
                    <span style={{ color: tags.length >= minRequired ? '#10b981' : 'var(--ob-muted)' }}>
                        {tags.length >= minRequired
                            ? `✓ ${tags.length} companies selected`
                            : `Select at least ${minRequired} companies (${tags.length}/${minRequired})`}
                    </span>
                </div>
            )}
        </div>
    );
}

/* ─── Skill Chip ───────────────────────────────────────────── */
function SkillChip({ skill, onRemove }) {
    const icon = getDevIcon(skill);
    return (
        <span className="ob-skill-chip">
            {icon && <img src={icon} alt={skill} style={{ width: 14, height: 14 }} onError={e => e.target.style.display = 'none'} />}
            {skill}
            <button type="button" onClick={() => onRemove(skill)} className="ob-tag-remove"><X size={10} /></button>
        </span>
    );
}

/* ─── Resume Drop Zone ─────────────────────────────────────── */
function ResumeDropZone({ onFile, parsing, parsed }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
    }, [onFile]);

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) onFile(file);
        e.target.value = null;
    };

    if (parsing) {
        return (
            <div className="ob-resume-zone loading">
                <div className="ob-resume-spinner">
                    <Loader2 size={36} className="ob-spin" />
                </div>
                <div className="ob-resume-title">Analyzing your resume...</div>
                <div className="ob-resume-sub">AI is extracting skills, experience, projects & more</div>
                <div className="ob-parse-bars">
                    {['Skills', 'Experience', 'Projects', 'Education'].map((l, i) => (
                        <div key={l} className="ob-parse-bar-wrap">
                            <span>{l}</span>
                            <div className="ob-parse-bar">
                                <div className="ob-parse-bar-fill" style={{ animationDelay: `${i * 0.2}s` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (parsed) {
        return (
            <div className="ob-resume-zone success">
                <div className="ob-resume-success-icon">
                    <CheckCircle2 size={32} />
                </div>
                <div className="ob-resume-title">Resume Analyzed Successfully!</div>
                <div className="ob-resume-stats">
                    {[
                        { n: parsed.skills?.length || 0, l: 'Skills' },
                        { n: parsed.experience?.length || 0, l: 'Roles' },
                        { n: parsed.projects?.length || 0, l: 'Projects' },
                        { n: parsed.education?.length || 0, l: 'Education' },
                    ].map(({ n, l }) => (
                        <div key={l} className="ob-resume-stat">
                            <span className="ob-resume-stat-n">{n}</span>
                            <span className="ob-resume-stat-l">{l}</span>
                        </div>
                    ))}
                </div>
                <button type="button" className="ob-reupload-btn" onClick={() => inputRef.current?.click()}>
                    <Upload size={13} /> Re-upload
                </button>
                <input ref={inputRef} type="file" accept=".pdf,image/*" onChange={handleChange} style={{ display: 'none' }} />
            </div>
        );
    }

    return (
        <div
            className={`ob-resume-zone ${dragging ? 'dragging' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <div className="ob-resume-icon-wrap">
                <FileText size={28} />
            </div>
            <div className="ob-resume-title">Drop your resume here</div>
            <div className="ob-resume-sub">PDF or image supported · AI-powered parsing</div>
            <div className="ob-resume-btn">
                <Upload size={14} /> Browse Files
            </div>
            <input ref={inputRef} type="file" accept=".pdf,image/*" onChange={handleChange} style={{ display: 'none' }} />
        </div>
    );
}



/* ─── STEP 1: Profile Completion ───────────────────────────── */
function Step1Profile({ data, onChange, onContinue, error }) {
    const avatarInputRef = useRef(null);
    const addCompany = (c) => onChange('targetCompanies', [...(data.targetCompanies || []), c]);
    const removeCompany = (c) => onChange('targetCompanies', (data.targetCompanies || []).filter(x => x !== c));

    const canContinue = (data.name || '').trim().length > 0 && (data.targetCompanies || []).length >= 2;

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => onChange('avatarDataUrl', reader.result);
        reader.readAsDataURL(file);
        e.target.value = null;
    };

    return (
        <motion.div key="step1" custom={1} variants={pageVariants} initial="enter" animate="center" exit="exit" className="ob-step-page">
            <motion.div variants={stagger} initial="hidden" animate="show" className="ob-step-content">

                {/* Whizan Brand Header */}
                <motion.div variants={fadeUp} className="ob-brand-header">
                    <div className="ob-brand-logo-wrap">
                        <img src="/logo.jpeg" alt="Whizan AI" className="ob-brand-logo" onError={e => e.target.style.display = 'none'} />
                    </div>
                    <div>
                        <div className="ob-brand-name">Whizan AI</div>
                        <div className="ob-brand-tagline">Your AI Interview Companion</div>
                    </div>
                </motion.div>

                <motion.div variants={fadeUp} className="ob-step-header" style={{ marginBottom: '1.5rem' }}>
                    <h2 className="ob-step-title">Let's set up your profile</h2>
                    <p className="ob-step-sub">Personalize your experience — this takes under 2 minutes</p>
                </motion.div>

                {error && (
                    <motion.div className="ob-error-banner" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                        {error}
                    </motion.div>
                )}

                {/* Profile Picture Upload */}
                <motion.div variants={fadeUp} className="ob-avatar-section">
                    <div
                        className="ob-avatar-ring"
                        onClick={() => avatarInputRef.current?.click()}
                        title="Click to upload photo"
                    >
                        {data.avatarDataUrl ? (
                            <img src={data.avatarDataUrl} alt="Profile" className="ob-avatar-img" />
                        ) : (
                            <div className="ob-avatar-placeholder">
                                <User size={28} />
                            </div>
                        )}
                        <div className="ob-avatar-overlay">
                            <Upload size={14} />
                        </div>
                    </div>
                    <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                    <div className="ob-avatar-meta">
                        <span className="ob-avatar-hint">Profile Photo</span>
                        <span className="ob-recruiter-note">
                            <span className="ob-recruiter-dot" /> Recruiters may see your image
                        </span>
                    </div>
                </motion.div>

                <motion.div variants={fadeUp} className="ob-form-grid">
                    {/* Name */}
                    <div className="ob-field-group span-2">
                        <label className="ob-label"><User size={13} /> Full Name *</label>
                        <input
                            className="ob-input"
                            placeholder="Your full name"
                            value={data.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Email (locked) */}
                    <div className="ob-field-group">
                        <label className="ob-label"><Mail size={13} /> Email</label>
                        <div className="ob-input ob-input-locked">
                            <Lock size={12} style={{ opacity: 0.4 }} />
                            <span style={{ opacity: 0.5 }}>{data.email || 'Linked account'}</span>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="ob-field-group">
                        <label className="ob-label"><MapPin size={13} /> Location</label>
                        <input
                            className="ob-input"
                            placeholder="City, Country"
                            value={data.location || ''}
                            onChange={e => onChange('location', e.target.value)}
                        />
                    </div>

                    {/* Preferred Role */}
                    <div className="ob-field-group span-2">
                        <label className="ob-label"><Briefcase size={13} /> Preferred Role</label>
                        <select
                            className="ob-input ob-select"
                            value={data.preferredRole || ''}
                            onChange={e => onChange('preferredRole', e.target.value)}
                        >
                            <option value="">Select your target role...</option>
                            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    {/* Primary Goal */}
                    <div className="ob-field-group span-2">
                        <label className="ob-label"><Layers size={13} /> Primary Goal</label>
                        <div className="ob-goal-cards">
                            <div
                                className={`ob-goal-card ${data.primaryInterest === 'DSA' ? 'active' : ''}`}
                                onClick={() => onChange('primaryInterest', 'DSA')}
                            >
                                <Code2 size={22} />
                                <span className="ob-goal-label">DSA Prep</span>
                                <span className="ob-goal-sub">LeetCode & Algorithms</span>
                            </div>
                            <div
                                className={`ob-goal-card ${data.primaryInterest === 'SystemDesign' ? 'active' : ''}`}
                                onClick={() => onChange('primaryInterest', 'SystemDesign')}
                            >
                                <Brain size={22} />
                                <span className="ob-goal-label">System Design</span>
                                <span className="ob-goal-sub">HLD & Architecture</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Target Companies */}
                <motion.div variants={fadeUp} className="ob-section-block">
                    <div className="ob-section-header">
                        <Target size={15} color="#a855f7" />
                        <span className="ob-section-title">Target Companies</span>
                        <span className="ob-required-badge">Min 2 Required</span>
                    </div>
                    <p className="ob-section-sub">We'll tailor your practice problems and portfolio to these companies</p>
                    <TagInput
                        tags={data.targetCompanies || []}
                        onAdd={addCompany}
                        onRemove={removeCompany}
                        placeholder="Type a company name..."
                        suggestions={COMPANY_SUGGESTIONS}
                        minRequired={2}
                    />
                </motion.div>

                {/* Customize checkbox */}
                <motion.div variants={fadeUp} className="ob-checkbox-card">
                    <label className="ob-checkbox-label">
                        <input
                            type="checkbox"
                            className="ob-native-check"
                            checked={data.customizeForCompanies || false}
                            onChange={e => onChange('customizeForCompanies', e.target.checked)}
                        />
                        <div className="ob-custom-check">
                            {data.customizeForCompanies && <CheckCircle2 size={12} />}
                        </div>
                        <div className="ob-checkbox-text">
                            <span className="ob-checkbox-title">Customize my prep for selected companies</span>
                            <span className="ob-checkbox-sub">Tailors interview questions, resume suggestions, and portfolio content based on your targets</span>
                        </div>
                    </label>
                </motion.div>

                {/* Terms */}
                <motion.div variants={fadeUp} className="ob-checkbox-card" style={{ marginTop: '0.5rem' }}>
                    <label className="ob-checkbox-label">
                        <input
                            type="checkbox"
                            className="ob-native-check"
                            checked={data.termsAccepted || false}
                            onChange={e => onChange('termsAccepted', e.target.checked)}
                        />
                        <div className="ob-custom-check">
                            {data.termsAccepted && <CheckCircle2 size={12} />}
                        </div>
                        <div className="ob-checkbox-text">
                            <span className="ob-checkbox-title">
                                I accept the <a href="/terms" target="_blank" rel="noreferrer" className="ob-link">Terms & Conditions</a>
                            </span>
                        </div>
                    </label>
                </motion.div>

                <motion.button
                    variants={fadeUp}
                    className="ob-primary-btn"
                    onClick={onContinue}
                    disabled={!canContinue}
                >
                    Continue <ChevronRight size={18} />
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

/* ─── STEP 2: Resume + Portfolio ───────────────────────────── */
function Step2Resume({ data, onChange, onContinue, onBack, error }) {
    const [parsing, setParsing] = useState(false);
    const [parseError, setParseError] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const [showSkillInput, setShowSkillInput] = useState(false);

    const handleFile = async (file) => {
        setParsing(true);
        setParseError('');
        try {
            const rdr = new FileReader();
            rdr.onload = async () => {
                try {
                    const b64 = rdr.result.split(',')[1];
                    const res = await fetch('https://leetcode-orchestration.onrender.com/api/resume/parse', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ base64Data: b64, mimeType: file.type })
                    });
                    const json = await res.json();
                    if (json.profile) {
                        const p = json.profile;
                        onChange('parsedData', p);
                        // Auto-fill editable fields
                        if (p.bio) onChange('bio', p.bio);
                        if (p.github) onChange('github', p.github);
                        if (p.linkedin) onChange('linkedin', p.linkedin);
                        if (p.skills?.length) onChange('skills', [...new Set([...(data.skills || []), ...p.skills])]);
                        if (p.experience?.length) onChange('experience', p.experience);
                        if (p.education?.length) onChange('education', p.education);
                        if (p.projects?.length) onChange('projects', p.projects);
                        if (p.certifications?.length) onChange('certifications', p.certifications);
                    } else {
                        setParseError('Could not parse resume. Try a PDF or image.');
                    }
                } catch {
                    setParseError('Failed to parse resume. Please try again.');
                } finally {
                    setParsing(false);
                }
            };
            rdr.readAsDataURL(file);
        } catch {
            setParsing(false);
            setParseError('File read error. Please try again.');
        }
    };

    const removeSkill = (s) => onChange('skills', (data.skills || []).filter(x => x !== s));
    const addSkill = () => {
        const v = skillInput.trim();
        if (v && !(data.skills || []).includes(v)) {
            onChange('skills', [...(data.skills || []), v]);
            setSkillInput('');
        }
    };

    return (
        <motion.div key="step2" custom={1} variants={pageVariants} initial="enter" animate="center" exit="exit" className="ob-step-page">
            <motion.div variants={stagger} initial="hidden" animate="show" className="ob-step-content">
                <motion.div variants={fadeUp} className="ob-step-header">
                    <div className="ob-step-icon-wrap blue">
                        <FileText size={24} />
                    </div>
                    <h2 className="ob-step-title">Resume & Portfolio</h2>
                    <p className="ob-step-sub">Upload your resume to auto-fill your profile — or skip and fill in manually later</p>
                </motion.div>

                {(error || parseError) && (
                    <motion.div className="ob-error-banner" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {error || parseError}
                    </motion.div>
                )}

                {/* Drop zone */}
                <motion.div variants={fadeUp}>
                    <ResumeDropZone onFile={handleFile} parsing={parsing} parsed={data.parsedData} />
                </motion.div>

                {/* Auto-filled preview */}
                {data.parsedData && (
                    <motion.div variants={fadeUp} className="ob-parsed-preview">
                        <div className="ob-parsed-header">
                            <Sparkles size={14} color="#a855f7" />
                            <span>AI-Extracted Data — Review & Edit</span>
                        </div>

                        {/* Skills extracted */}
                        {(data.skills || []).length > 0 && (
                            <div className="ob-parsed-section">
                                <div className="ob-parsed-section-title">Skills</div>
                                <div className="ob-skills-wrap">
                                    {(data.skills || []).map(s => (
                                        <SkillChip key={s} skill={s} onRemove={removeSkill} />
                                    ))}
                                    {showSkillInput ? (
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                            <input
                                                className="ob-inline-input"
                                                value={skillInput}
                                                onChange={e => setSkillInput(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') addSkill(); if (e.key === 'Escape') setShowSkillInput(false); }}
                                                placeholder="Add skill..."
                                                autoFocus
                                            />
                                            <button type="button" className="ob-mini-btn" onClick={addSkill}><Plus size={12} /></button>
                                        </div>
                                    ) : (
                                        <button type="button" className="ob-add-skill-btn" onClick={() => setShowSkillInput(true)}>
                                            <Plus size={11} /> Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Experience */}
                        {(data.experience || []).length > 0 && (
                            <div className="ob-parsed-section">
                                <div className="ob-parsed-section-title">Experience</div>
                                {(data.experience || []).map((e, i) => (
                                    <div key={i} className="ob-parsed-entry">
                                        <div className="ob-parsed-entry-title">{e.role}</div>
                                        <div className="ob-parsed-entry-sub">{e.company}{e.duration ? ` · ${e.duration}` : ''}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Education */}
                        {(data.education || []).length > 0 && (
                            <div className="ob-parsed-section">
                                <div className="ob-parsed-section-title">Education</div>
                                {(data.education || []).map((e, i) => (
                                    <div key={i} className="ob-parsed-entry">
                                        <div className="ob-parsed-entry-title">{e.degree}</div>
                                        <div className="ob-parsed-entry-sub">{e.institution}{e.year ? ` · ${e.year}` : ''}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Projects */}
                        {(data.projects || []).length > 0 && (
                            <div className="ob-parsed-section">
                                <div className="ob-parsed-section-title">Projects ({data.projects.length})</div>
                                {(data.projects || []).slice(0, 3).map((p, i) => (
                                    <div key={i} className="ob-parsed-entry">
                                        <div className="ob-parsed-entry-title">{p.name}</div>
                                        {p.desc && <div className="ob-parsed-entry-sub">{p.desc.slice(0, 80)}…</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Portfolio option */}
                <motion.div variants={fadeUp} className="ob-portfolio-option">
                    <div className="ob-portfolio-option-header">
                        <div className="ob-portfolio-spark">✨ FREE</div>
                        <div className="ob-portfolio-title">Create your developer portfolio</div>
                        <p className="ob-portfolio-sub">
                            We'll generate a beautiful, shareable public portfolio page using your profile data — completely free.
                        </p>
                    </div>
                    <div className="ob-portfolio-choices">
                        <div
                            className={`ob-portfolio-choice ${data.wantPortfolio === true ? 'selected' : ''}`}
                            onClick={() => onChange('wantPortfolio', true)}
                        >
                            <CheckCircle2 size={16} />
                            <span>Yes, create my portfolio</span>
                        </div>
                        <div
                            className={`ob-portfolio-choice ${data.wantPortfolio === false ? 'selected skip' : ''}`}
                            onClick={() => onChange('wantPortfolio', false)}
                        >
                            <ChevronRight size={16} />
                            <span>Skip for now</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={fadeUp} className="ob-btn-row">
                    <button type="button" className="ob-back-btn" onClick={onBack}>
                        <ChevronLeft size={16} /> Back
                    </button>
                    <button
                        type="button"
                        className="ob-primary-btn"
                        onClick={onContinue}
                        disabled={parsing}
                        style={{ flex: 1 }}
                    >
                        {parsing ? <><Loader2 size={16} className="ob-spin" /> Analyzing...</> : <>Continue <ChevronRight size={16} /></>}
                    </button>
                </motion.div>
                <button type="button" className="ob-skip-link" onClick={onContinue}>
                    Skip this step →
                </button>
            </motion.div>
        </motion.div>
    );
}

/* ─── STEP 3: Welcome Page ─────────────────────────────────── */
function Step3Welcome({ name, company, onStart, loading, error, saved, onGoToDashboard }) {
    const firstName = (name || 'there').split(' ')[0];
    return (
        <motion.div key="step3" custom={1} variants={pageVariants} initial="enter" animate="center" exit="exit" className="ob-step-page ob-welcome-page">
            {/* Animated orbs */}
            <div className="ob-welcome-orb ob-orb-a" />
            <div className="ob-welcome-orb ob-orb-b" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="ob-welcome-inner"
            >
                {/* Icon */}
                <div className="ob-welcome-icon-ring">
                    <span className="ob-welcome-emoji">{saved ? '✅' : '🚀'}</span>
                </div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="ob-welcome-title"
                >
                    {saved ? 'Profile Saved!' : 'Welcome to Whizan AI,'}
                    <br />
                    <span className="ob-welcome-name">{saved ? 'You\'re all set.' : `${firstName}!`}</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.6 }}
                    className="ob-welcome-sub"
                >
                    {saved
                        ? 'All your profile data has been saved successfully. Head to your dashboard to start practising.'
                        : `Your journey to smarter interview preparation starts now.${company ? ` Let's ace that ${company} interview together.` : ''}`
                    }
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="ob-welcome-features"
                >
                    {[
                        { icon: '🎯', text: 'Profile & portfolio are ready' },
                        { icon: '🤖', text: 'AI mock interviews personalized for you' },
                        { icon: '📊', text: 'Track your progress on the Dashboard' },
                    ].map(({ icon, text }) => (
                        <div key={text} className="ob-welcome-feature">
                            <span className="ob-feature-icon">{icon}</span>
                            <span>{text}</span>
                        </div>
                    ))}
                </motion.div>

                {error && (
                    <motion.div className="ob-error-banner" style={{ marginBottom: '1rem' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {error}
                    </motion.div>
                )}

                {saved ? (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.6 }}
                        className="ob-primary-btn ob-journey-btn"
                        onClick={onGoToDashboard}
                    >
                        <CheckCircle2 size={18} /> Go to Dashboard
                    </motion.button>
                ) : (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.6 }}
                        className="ob-primary-btn ob-journey-btn"
                        onClick={onStart}
                        disabled={loading}
                    >
                        {loading
                            ? <><Loader2 size={18} className="ob-spin" /> Saving your profile...</>
                            : <><Sparkles size={18} /> Save & Start Journey</>
                        }
                    </motion.button>
                )}
            </motion.div>
        </motion.div>
    );
}

/* ─────────────────────────────────────────────────────────────
   MAIN OnboardingFlow Component
───────────────────────────────────────────────────────────── */
export default function OnboardingFlow({ redirectUrl = '/dashboard' }) {
    const navigate = useNavigate();
    const { updateUserProfile, currentUser } = useAuth();

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    // Unified form state
    const [data, setData] = useState({
        name: currentUser?.displayName || '',
        email: currentUser?.email || '',
        location: '',
        preferredRole: '',
        primaryInterest: 'DSA',
        targetCompanies: [],
        customizeForCompanies: false,
        termsAccepted: false,
        // Step 2
        parsedData: null,
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        bio: '',
        github: '',
        linkedin: '',
        wantPortfolio: true,
        avatarDataUrl: '',
    });

    const onChange = (key, value) => setData(prev => ({ ...prev, [key]: value }));

    const goTo = (n) => {
        setDirection(n > step ? 1 : -1);
        setStep(n);
        setError('');
    };

    /* ── Step 1 Validation & Continue ── */
    const handleStep1Continue = () => {
        setError('');
        if (!data.name.trim()) return setError('Please enter your full name.');
        if ((data.targetCompanies || []).length < 2) return setError('Please select at least 2 target companies.');
        if (!data.termsAccepted) return setError('Please accept the Terms & Conditions to continue.');
        goTo(2);
    };

    /* ── Step 2 Continue ── */
    const handleStep2Continue = () => {
        goTo(3);
    };

    /* ── Final Submit ── */
    const handleStart = async () => {
        setLoading(true);
        setError('');
        try {
            // 1. Get Firebase ID token from context user (never null during onboarding)
            const token = await currentUser.getIdToken();

            // 2. Update Firebase displayName
            const { updateProfile } = await import('firebase/auth');
            const { auth } = await import('../firebase');
            if (data.name.trim() && auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: data.name.trim() });
            }

            // 3. Build full profile payload
            const profilePayload = {
                displayName: data.name.trim(),
                primaryInterest: data.primaryInterest,
                location: data.location,
                preferredRole: data.preferredRole,
                targetCompanies: data.targetCompanies,
                customizeForCompanies: data.customizeForCompanies,
                wantPortfolio: data.wantPortfolio,
                termsAccepted: true,
                isFirstTimeUser: false,
                bio: data.bio,
                github: data.github,
                linkedin: data.linkedin,
                skills: data.skills,
                certifications: data.certifications,
                experience: data.experience,
                education: data.education,
                projects: data.projects,
            };

            // 4. Authenticated POST to backend
            const res = await fetch(`https://leetcode-orchestration.onrender.com/api/profile/${currentUser.uid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profilePayload),
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error('Profile save failed:', res.status, errText);
                setError(`Save failed (${res.status}). ${errText || 'Please try again.'}`);
                setLoading(false);
                return;
            }

            // 5. Mark onboarding complete
            localStorage.setItem(`onboarded_${currentUser.uid}`, 'true');

            // 6. Show saved confirmation (don't auto-redirect)
            setSaved(true);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="ob-root">
            {/* Progress indicator at top */}
            <StepIndicator step={step} />

            {/* Animated step pages */}
            <AnimatePresence mode="wait" custom={direction}>
                {step === 1 && (
                    <Step1Profile
                        data={data}
                        onChange={onChange}
                        onContinue={handleStep1Continue}
                        error={error}
                    />
                )}
                {step === 2 && (
                    <Step2Resume
                        data={data}
                        onChange={onChange}
                        onContinue={handleStep2Continue}
                        onBack={() => goTo(1)}
                        error={error}
                    />
                )}
                {step === 3 && (
                    <Step3Welcome
                        name={data.name}
                        company={data.targetCompanies?.[0]}
                        onStart={handleStart}
                        loading={loading}
                        error={error}
                        saved={saved}
                        onGoToDashboard={() => navigate(redirectUrl, { replace: true })}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
