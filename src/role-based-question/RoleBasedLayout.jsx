import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ChevronLeft, 
    BookOpen, 
    Terminal, 
    Code2, 
    Cpu, 
    Globe, 
    MessageSquare, 
    ShieldCheck, 
    Zap, 
    Search,
    Award,
    Briefcase,
    Star
} from 'lucide-react';
import NavProfile from '../NavProfile';

export default function RoleBasedLayout({ 
    roleTitle, 
    roleDescription, 
    questions = [], 
    accentColor = '#6366f1',
    skills = [],
    difficulty = 'Intermediate'
}) {
    const navigate = useNavigate();

    const getRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#050505',
            backgroundImage: `radial-gradient(circle at 50% 0%, ${getRgba(accentColor, 0.08)} 0%, transparent 60%), 
                             radial-gradient(circle at 0% 100%, ${getRgba(accentColor, 0.04)} 0%, transparent 40%)`,
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            paddingBottom: '4rem'
        }}>
            <style>{`
                .role-header {
                    text-align: center;
                    padding: 4rem 1.5rem 2rem;
                    position: relative;
                }
                .role-title {
                    font-size: clamp(2.5rem, 5vw, 4rem);
                    font-weight: 800;
                    letter-spacing: -2px;
                    margin-bottom: 1rem;
                    background: linear-gradient(to right, #fff, rgba(255,255,255,0.7));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .role-desc {
                    color: rgba(255,255,255,0.6);
                    font-size: 1.1rem;
                    max-width: 700px;
                    margin: 0 auto 2rem;
                    line-height: 1.6;
                }
                .question-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px;
                    padding: 1.5rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    position: relative;
                    overflow: hidden;
                }
                .question-card:hover {
                    background: rgba(255,255,255,0.05);
                    border-color: ${getRgba(accentColor, 0.3)};
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 20px ${getRgba(accentColor, 0.1)};
                }
                .question-card::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; width: 4px; height: 0;
                    background: ${accentColor};
                    transition: height 0.3s ease;
                }
                .question-card:hover::after {
                    height: 100%;
                }
                .badge {
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .skill-chip {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 6px 14px;
                    border-radius: 99px;
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.7);
                    transition: all 0.2s;
                }
                .skill-chip:hover {
                    background: ${getRgba(accentColor, 0.1)};
                    border-color: ${accentColor};
                    color: #fff;
                }
                .questions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 1.5rem;
                    padding: 0 1.5rem;
                    max-width: 1300px;
                    margin: 0 auto;
                }
                @media (max-width: 768px) {
                    .questions-grid { grid-template-columns: 1fr; }
                    .role-title { font-size: 2.2rem; }
                }
            `}</style>
            
            {/* Navbar Placeholder - Replicating your app's nav style */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                padding: '0 1.5rem', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="Logo" style={{ height: '32px', width: '32px', borderRadius: '8px' }} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Whizan AI</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Link to="/role-based-question" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Roles</Link>
                    <NavProfile />
                </div>
            </nav>

            <div className="role-header">
                <div style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '99px',
                    background: getRgba(accentColor, 0.1), border: `1px solid ${getRgba(accentColor, 0.2)}`,
                    color: accentColor, fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem'
                }}>
                    <Award size={16} /> Professional Career Path
                </div>
                <h1 className="role-title">{roleTitle}</h1>
                <p className="role-desc">{roleDescription}</p>
                
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
                    {skills.map(skill => (
                        <span key={skill} className="skill-chip">{skill}</span>
                    ))}
                </div>
            </div>

            <div className="questions-grid">
                {questions.length > 0 ? questions.map((q, i) => (
                    <div key={i} className="question-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ color: accentColor, fontWeight: 700, fontSize: '1.2rem' }}>0{i+1}</span>
                            <span className="badge" style={{ 
                                background: q.difficulty === 'Hard' ? 'rgba(239,71,67,0.1)' : 'rgba(0,184,163,0.1)',
                                color: q.difficulty === 'Hard' ? '#ef4743' : '#00b8a3'
                            }}>
                                {q.difficulty || 'Medium'}
                            </span>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>{q.title}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeigt: 1.5 }}>
                            {q.summary}
                        </p>
                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MessageSquare size={12} /> {q.answersCount || 1} Solutions
                            </span>
                            <button style={{ 
                                background: 'transparent', border: 'none', color: accentColor, 
                                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                                Practice <Zap size={14} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', opacity: 0.5 }}>
                        <Terminal size={48} style={{ margin: '0 auto 1rem' }} />
                        <p>Curating the latest industry questions for this role...</p>
                    </div>
                )}
            </div>

            <div style={{ maxWidth: '800px', margin: '4rem auto 0', padding: '0 1.5rem', textAlign: 'center' }}>
                <div style={{ 
                    padding: '3rem', background: 'rgba(255,255,255,0.02)', 
                    borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>Master {roleTitle} Interviews</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
                        Our AI-powered platform provides real-time feedback on your answers, helping you refine your technical depth and communication skills.
                    </p>
                    <button style={{ 
                        background: accentColor, color: '#fff', border: 'none', 
                        padding: '12px 32px', borderRadius: '12px', fontWeight: 700,
                        fontSize: '1rem', cursor: 'pointer', boxShadow: `0 10px 20px ${getRgba(accentColor, 0.3)}`
                    }}>
                        Start Mock Interview
                    </button>
                </div>
            </div>
        </div>
    );
}
