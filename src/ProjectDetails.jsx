import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal, RefreshCw } from 'lucide-react';
import { useSEO } from './hooks/useSEO';

import ProjectCinematic from './templates/ProjectCinematic';
import ProjectBento from './templates/ProjectBento';
import ProjectMinimal from './templates/ProjectMinimal';

// ─── Themes ─────────────────────────────────────────────────────
const THEMES = {
    Purple: { accent: '#a855f7', muted: '#7c3aed', rgb: '168,85,247', glow: '#a855f730' },
    Blue: { accent: '#3b82f6', muted: '#1d4ed8', rgb: '59,130,246', glow: '#3b82f630' },
    Emerald: { accent: '#10b981', muted: '#065f46', rgb: '16,185,129', glow: '#10b98130' },
    Amber: { accent: '#f59e0b', muted: '#b45309', rgb: '245,158,11', glow: '#f59e0b30' },
    Rose: { accent: '#f43f5e', muted: '#be123c', rgb: '244,63,94', glow: '#f43f5e30' },
    Cyan: { accent: '#06b6d4', muted: '#0e7490', rgb: '6,182,212', glow: '#06b6d430' },
};

export default function ProjectDetails() {
    const { uid, projId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = () => {
        setLoading(true); setError(null);
        fetch(`https://leetcode-orchestration.onrender.com/api/profile/${uid}`)
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(data => {
                if (!data.profile) throw new Error('Profile not found');
                setProfile(data.profile);
                const p = data.profile.projects?.[parseInt(projId)];
                if (!p) throw new Error('Project not found');
                setProject(p);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, [uid, projId]); // eslint-disable-line

    const pref = profile?.preferences ?? { theme: 'Purple', darkMode: true };
    const T = THEMES[pref.theme] ?? THEMES.Purple;
    const idx = parseInt(projId);

    // Dynamic SEO
    const authorName = profile?.displayName || profile?.name || 'Developer';
    const projectName = project?.detailedData?.name || project?.name || 'Project';
    const projectDesc = project?.detailedData?.overview || project?.desc || project?.tagline || `View the technical details, source code, and live demo by ${authorName} on Whizan AI.`;
    
    useSEO({
        title: project ? `${projectName} – ${authorName}'s Portfolio` : 'Loading Project...',
        description: projectDesc,
        canonical: `/public/${uid}/project/${projId}`,
        image: profile?.photoURL || undefined,
        jsonLd: project ? {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: projectName,
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            description: projectDesc,
            author: { '@type': 'Person', name: authorName, url: `https://whizan.xyz/public/${uid}` },
            url: `https://whizan.xyz/public/${uid}/project/${projId}`
        } : undefined
    });

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid rgba(${T.rgb},0.15)`, borderTopColor: T.accent }}
            />
            <motion.p animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}
            >
                LOADING PROJECT
            </motion.p>
        </div>
    );

    if (error || !project) return (
        <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: 400 }}>
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 0 40px rgba(244,63,94,0.1)' }}
                >
                    <Terminal size={28} color="#f43f5e" />
                </motion.div>
                <h2 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '2.5rem', fontWeight: 400, marginBottom: '1rem', color: '#f0f0f5' }}>Something went wrong</h2>
                <p style={{ color: 'rgba(240,240,245,0.5)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>{error ?? 'Project not found.'}</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={load} style={{ background: '#f0f0f5', color: '#050508', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><RefreshCw size={14} /> Retry</button>
                    <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: 'rgba(240,240,245,0.5)', border: '1px solid rgba(255,255,255,0.12)', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Go Back</button>
                </div>
            </motion.div>
        </div>
    );

    const d = project.detailedData ?? {
        name: project.name,
        tagline: project.tagline ?? 'A precise engineering achievement.',
        overview: project.desc ?? 'A groundbreaking implementation pushing the boundaries of modern performance and developer experience.',
        features: ['Scalable Distributed Core', 'Low-Latency Edge Processing', 'Quantum-Safe Encryption', 'Adaptive Load Balancing'],
        techStack: ['React', 'Rust', 'TypeScript'],
        installation: ['git clone <repo-url>', 'cd project && npm install', 'npm run dev'],
        usage: 'Streamlined operational control via unified API interface.',
        highlights: ['Award-winning efficiency metrics.', 'Seamless cloud-native integration.', '99.9% uptime SLA.', 'Sub-10ms response time.'],
        projectStructure: [],
    };

    const templateType = project.template || 'cinematic';

    if (templateType === 'bento') {
        return <ProjectBento project={project} profile={profile} d={d} T={T} idx={idx} />;
    }
    if (templateType === 'minimal') {
        return <ProjectMinimal project={project} profile={profile} d={d} T={T} idx={idx} />;
    }

    // Default
    return <ProjectCinematic project={project} profile={profile} d={d} T={T} idx={idx} />;
}