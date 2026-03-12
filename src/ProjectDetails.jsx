import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Github, Globe, Code2, CheckCircle, 
    Layers, Cpu, BookOpen, Rocket, Star, Info, List
} from 'lucide-react';
import NavProfile from './NavProfile';

const S = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
.glass-card { background: rgba(20,22,30,0.65); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; }
.tech-tag { background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.25); border-radius: 10px; padding: 6px 14px; font-size: 0.85rem; color: #c084fc; font-weight: 600; }
.feature-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.bullet { width: 6px; height: 6px; border-radius: 50%; background: #a855f7; margin-top: 8px; flex-shrink: 0; }
`;

export default function ProjectDetails() {
    const { uid, projId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(`https://leetcode-orchestration-55z3.onrender.com/api/profile/${uid}`);
                const data = await res.json();
                if (data.profile && data.profile.projects) {
                    const proj = data.profile.projects[parseInt(projId)];
                    if (proj) {
                        setProject(proj);
                    } else {
                        setError("Project not found");
                    }
                } else {
                    setError("User profile not found");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load project details");
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [uid, projId]);

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(168,85,247,0.2)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
        </div>
    );

    if (error || !project) return (
        <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops!</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>{error || "Project details could not be found."}</p>
            <button onClick={() => navigate(-1)} style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)', border: 'none', borderRadius: '12px', padding: '12px 24px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Go Back</button>
        </div>
    );

    const d = project.detailedData || {
        name: project.name,
        tagline: project.tagline || "Advanced Software Project",
        overview: project.desc || "A sophisticated technical project showcasing expertise in modern development practices.",
        features: ["Robust implementation", "Scalable architecture", "Clean code principles"],
        techStack: ["React", "Node.js", "Firebase"],
        installation: ["Clone the repository", "Install dependencies", "Start development server"],
        usage: "Comprehensive usage instructions are provided in the README.",
        highlights: ["High performance optimization", "Responsive user interface"]
    };

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            <style>{S}</style>
            
            {/* Nav */}
            <nav style={{ height: '64px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                        <ArrowLeft size={15} /> Back
                    </button>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.5))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {d.name}
                    </div>
                </div>
                <NavProfile />
            </nav>

            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem' }}>
                {/* Hero */}
                <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '22px', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(168,85,247,0.3)' }}>
                        <Rocket size={40} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.05em' }}>{d.name}</h1>
                    <p style={{ fontSize: '1.2rem', color: '#a855f7', fontWeight: 600, maxWidth: '600px', margin: '0 auto 2rem' }}>{d.tagline}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                        {project.link && (
                            <a href={project.link.startsWith('http') ? project.link : `https://${project.link}`} target="_blank" rel="noreferrer" style={{ background: '#fff', color: '#000', borderRadius: '12px', padding: '12px 24px', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s' }}>
                                <Github size={18} /> GitHub Repository
                            </a>
                        )}
                        {d.demoUrl && (
                            <a href={d.demoUrl} target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px 24px', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Globe size={18} /> Live Demo
                            </a>
                        )}
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                    {/* Left Col */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Overview */}
                        <section className="glass-card animate-fade-in" style={{ padding: '2rem', animationDelay: '0.1s' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                                <Info size={20} color="#a855f7" /> Project Overview
                            </h2>
                            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                {d.overview}
                            </p>
                        </section>

                        {/* Features */}
                        <section className="glass-card animate-fade-in" style={{ padding: '2rem', animationDelay: '0.2s' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                                <Star size={20} color="#eab308" /> Key Features
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {d.features.map((f, i) => (
                                    <div key={i} className="feature-item">
                                        <CheckCircle size={18} color="#10b981" style={{ marginTop: '2px' }} />
                                        <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>{f}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Usage & Install */}
                        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', animationDelay: '0.3s' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>
                                    <Cpu size={18} color="#06b6d4" /> Installation
                                </h3>
                                {d.installation.map((step, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>
                                        <span style={{ color: '#06b6d4', fontWeight: 900 }}>0{i+1}</span>
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', animationDelay: '0.4s' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>
                                    <BookOpen size={18} color="#3b82f6" /> Usage
                                </h3>
                                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{d.usage}</p>
                            </div>
                        </section>
                    </div>

                    {/* Right Col */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Tech Stack */}
                        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', animationDelay: '0.5s' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 800, marginBottom: '1.2rem' }}>
                                <Layers size={18} color="#a855f7" /> Tech Stack
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {d.techStack.map(s => <span key={s} className="tech-tag">{s}</span>)}
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', animationDelay: '0.6s' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 800, marginBottom: '1.2rem' }}>
                                <Star size={18} color="#eab308" /> Highlights
                            </h3>
                            {d.highlights.map((h, i) => (
                                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#eab308', marginTop: '8px' }} />
                                    <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{h}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Footer */}
            <footer style={{ padding: '4rem 2rem', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Generated with AI Portfolio Assistant • CodeArena</p>
            </footer>
        </div>
    );
}
