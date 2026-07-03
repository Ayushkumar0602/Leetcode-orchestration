import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Briefcase, 
    Code2, 
    Database, 
    Smartphone, 
    Settings, 
    LineChart, 
    ShieldCheck, 
    Zap,
    ChevronRight,
    Search
} from 'lucide-react';
import NavProfile from './NavProfile';
import { useSEO } from './hooks/useSEO';

const CATEGORIES = [
    {
        id: 'web-development',
        title: 'Web Development',
        icon: <Code2 size={24} />,
        color: '#6366f1',
        roles: [
            { name: 'Frontend Developer', path: 'frontend-developer' },
            { name: 'React Developer', path: 'react-developer' },
            { name: 'Next.js Developer', path: 'nextjs-developer' },
            { name: 'Angular Developer', path: 'angular-developer' },
            { name: 'Vue.js Developer', path: 'vuejs-developer' }
        ]
    },
    {
        id: 'backend',
        title: 'Backend & Systems',
        icon: <Database size={24} />,
        color: '#10b981',
        roles: [
            { name: 'Backend Developer', path: 'backend-developer' },
            { name: 'Node.js Developer', path: 'nodejs' },
            { name: 'Express.js', path: 'expressjs' },
            { name: 'Java Developer', path: 'java' },
            { name: 'Spring Boot', path: 'spring-boot' },
            { name: 'Python Developer', path: 'python' },
            { name: 'Django', path: 'django' },
            { name: 'Flask', path: 'flask' }
        ]
    },
    {
        id: 'mobile',
        title: 'Mobile Development',
        icon: <Smartphone size={24} />,
        color: '#f59e0b',
        roles: [
            { name: 'Android Developer', path: 'android' },
            { name: 'iOS Developer', path: 'ios' },
            { name: 'Flutter Developer', path: 'flutter' },
            { name: 'React Native', path: 'react-native' }
        ]
    },
    {
        id: 'devops',
        title: 'Cloud & DevOps',
        icon: <Settings size={24} />,
        color: '#3b82f6',
        roles: [
            { name: 'AWS Architect', path: 'aws' },
            { name: 'Azure Engineer', path: 'azure' },
            { name: 'GCP Engineer', path: 'gcp' },
            { name: 'Docker Specialist', path: 'docker' },
            { name: 'Kubernetes', path: 'kubernetes' },
            { name: 'SRE', path: 'sre' }
        ]
    },
    {
        id: 'data-ai',
        title: 'Data & AI',
        icon: <LineChart size={24} />,
        color: '#8b5cf6',
        roles: [
            { name: 'Data Analyst', path: 'data-analyst' },
            { name: 'Data Scientist', path: 'data-scientist' },
            { name: 'ML Engineer', path: 'ml-engineer' },
            { name: 'AI Engineer', path: 'ai-engineer' },
            { name: 'Prompt Engineer', path: 'prompt-engineer' }
        ]
    },
    {
        id: 'testing',
        title: 'Quality Assurance',
        icon: <ShieldCheck size={24} />,
        color: '#ef4444',
        roles: [
            { name: 'QA Engineer', path: 'qa' },
            { name: 'Manual Testing', path: 'manual-testing' },
            { name: 'Automation Testing', path: 'automation-testing' },
            { name: 'Selenium Specialist', path: 'selenium' }
        ]
    }
];

export default function RoleBasedQuestionSelect() {
    const navigate = useNavigate();

    useSEO({
        title: 'Role-Based Interview Questions – Whizan AI',
        description: 'Choose your specific technical role to practice curated interview questions for Frontend, Backend, Mobile, DevOps, AI, and more.',
    });

    const getRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 4), 16) || 99; // Fallback for shorthand or error
        const g = parseInt(hex.slice(4, 6), 16) || 102;
        const b = parseInt(hex.slice(6, 8), 16) || 241;
        // This is a bit rough for dynamic hex, but let's use a simpler mapping for common colors
        const colors = {
            '#6366f1': '99, 102, 241',
            '#10b981': '16, 185, 129',
            '#f59e0b': '245, 158, 11',
            '#3b82f6': '59, 130, 246',
            '#8b5cf6': '139, 92, 246',
            '#ef4444': '239, 68, 68'
        };
        return `rgba(${colors[hex] || '255,255,255'}, ${alpha})`;
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 50%)',
            color: '#fff',
            fontFamily: "'Inter', sans-serif"
        }}>
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
                <NavProfile />
            </nav>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', borderRadius: '99px',
                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                        color: '#818cf8', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem'
                    }}>
                        <Briefcase size={16} /> Industry Specializations
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '1rem' }}>
                        Choose Your Career Path
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Curated question banks for specific engineering roles. Master the tech stack and system design for your dream job.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {CATEGORIES.map(cat => (
                        <div key={cat.id} style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '24px',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ 
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    background: getRgba(cat.color, 0.1), border: `1px solid ${getRgba(cat.color, 0.2)}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: cat.color
                                }}>
                                    {cat.icon}
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{cat.title}</h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {cat.roles.map(role => (
                                    <button
                                        key={role.path}
                                        onClick={() => navigate(`/roles/${cat.id}/${role.path}`)}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '12px 16px', borderRadius: '12px',
                                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                                            color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', fontWeight: 500,
                                            cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                            e.currentTarget.style.borderColor = getRgba(cat.color, 0.3);
                                            e.currentTarget.style.color = '#fff';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                                            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                                        }}
                                    >
                                        {role.name}
                                        <ChevronRight size={16} opacity={0.4} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
