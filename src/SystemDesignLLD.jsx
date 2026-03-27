import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LogOut, ArrowLeft, Cpu, Layout, Layers, Box, Terminal, Database, Shield, Settings, GitBranch, Code } from 'lucide-react';
import NavProfile from './NavProfile';
import { useSEO } from './hooks/useSEO';

const LLD_SYLLABUS = [
    {
        title: "1. Object-Oriented Design (OOD)",
        icon: <Box size={20} color="#a855f7" />,
        items: [
            { subtitle: "Core Concepts", details: ["Classes & objects", "Interfaces", "Abstract classes", "Inheritance", "Composition vs inheritance", "Polymorphism", "Encapsulation"] }
        ]
    },
    {
        title: "2. UML Diagrams",
        icon: <Layers size={20} color="#3b82f6" />,
        items: [
            { subtitle: "Diagram Types", details: ["Class diagrams", "Sequence diagrams", "Use-case diagrams", "Activity diagrams", "State diagrams", "Component diagrams"] }
        ]
    },
    {
        title: "3. Design Patterns (Very Important)",
        icon: <Layout size={20} color="#ec4899" />,
        items: [
            { subtitle: "Creational", details: ["Singleton", "Factory", "Abstract Factory", "Builder", "Prototype"] },
            { subtitle: "Structural", details: ["Adapter", "Decorator", "Facade", "Proxy", "Composite", "Bridge"] },
            { subtitle: "Behavioral", details: ["Observer", "Strategy", "Command", "Iterator", "State", "Template Method", "Chain of Responsibility"] }
        ]
    },
    {
        title: "4. API Design (LLD Level)",
        icon: <GitBranch size={20} color="#f59e0b" />,
        items: [
            { subtitle: "API Contracts", details: ["REST resource modeling", "HTTP status codes", "Idempotent APIs", "Pagination strategies", "Versioning", "Error handling"] }
        ]
    },
    {
        title: "5. Database Design (LLD)",
        icon: <Database size={20} color="#10b981" />,
        items: [
            { subtitle: "Schema & Data", details: ["Schema design", "Normalization", "Denormalization", "Indexing strategies", "Composite indexes", "Foreign keys", "Constraints", "Transactions", "Query optimization"] }
        ]
    },
    {
        title: "6. Concurrency & Multithreading",
        icon: <Cpu size={20} color="#ef4444" />,
        items: [
            { subtitle: "Execution Models", details: ["Threads vs processes", "Synchronization", "Locks", "Mutex", "Semaphores", "Deadlocks", "Race conditions", "Thread safety", "Immutability"] }
        ]
    },
    {
        title: "7. Memory Management",
        icon: <Settings size={20} color="#6366f1" />,
        items: [
            { subtitle: "Resource Handling", details: ["Heap vs stack", "Garbage collection basics", "Memory leaks", "Object pooling", "Caching at code level"] }
        ]
    },
    {
        title: "8. Error Handling & Resilience",
        icon: <Shield size={20} color="#f97316" />,
        items: [
            { subtitle: "Robustness", details: ["Custom exceptions", "Retry logic", "Timeouts", "Fallback mechanisms", "Validation layers"] }
        ]
    },
    {
        title: "9. Data Modeling (LLD)",
        icon: <Box size={20} color="#8b5cf6" />,
        items: [
            { subtitle: "Entities & ORM", details: ["Entity modeling", "Relationships", "Aggregates", "Value objects", "DTOs", "ORM pitfalls"] }
        ]
    },
    {
        title: "10. Logging & Debugging",
        icon: <Terminal size={20} color="#64748b" />,
        items: [
            { subtitle: "Observability at Code Level", details: ["Log levels", "Structured logging", "Correlation IDs", "Debugging distributed flows"] }
        ]
    },
    {
        title: "11. Testing (LLD Focus)",
        icon: <Cpu size={20} color="#14b8a6" />,
        items: [
            { subtitle: "Testing Strategies", details: ["Unit testing", "Integration testing", "Mocking", "Stubbing", "Testability design", "Contract testing"] }
        ]
    },
    {
        title: "12. LLD Case Studies",
        icon: <Code size={20} color="#eab308" />,
        items: [
            { subtitle: "Machine Coding Examples", details: ["Design Parking Lot", "Design Elevator System", "Design Cache", "Design Rate Limiter", "Design File System", "Design Chess Game", "Design Notification Service", "Design BookMyShow / Movie Ticket System"] }
        ]
    }
];

export default function SystemDesignLLD() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    useSEO({
        title: 'System Design LLD (Low-Level Design) Course | Whizan AI',
        description: 'Master Object-Oriented Design, Design Patterns, API architecture, and machine coding with our comprehensive Low-Level Design syllabus.',
        canonical: '/systemdesign/lld',
        keywords: 'low level design, LLD, object oriented design, design patterns, machine coding, system design interview',
    });

    const handlePracticeClick = (topicName) => {
        if (!currentUser) {
            alert('Please log in to start a practice interview.');
            navigate('/login?redirect=/systemdesign/lld');
            return;
        }
        const interviewId = Date.now().toString();
        navigate(`/systemdesigninterview/${interviewId}?topic=${encodeURIComponent(topicName)}`);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.05) 0%, transparent 50%)',
            color: 'var(--txt)',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* ── Navbar ─────────────────────────────────── */}
            <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="Logo" style={{ height: '28px', width: '28px', borderRadius: '6px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--txt)', letterSpacing: '-0.3px' }}>Whizan AI</span>
                </div>

                <div className="sd-lld-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px' }}>
                    {[
                        { label: 'Problems', path: '/dsaquestion' },
                        { label: 'System Design', path: '/systemdesign' },
                        { label: 'AI Interview', path: '/aiinterview' },
                        { label: 'My Submissions', path: '/submissions' },
                    ].map(item => (
                        <button key={item.label} onClick={() => navigate(item.path)}
                            style={{ padding: '6px 14px', borderRadius: '7px', border: 'none', background: item.path === '/systemdesign' ? 'rgba(255,255,255,0.1)' : 'transparent', color: item.path === '/systemdesign' ? 'var(--txt)' : 'var(--txt3)', fontSize: '0.82rem', fontWeight: item.path === '/systemdesign' ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                            {item.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <NavProfile />
                </div>
            </nav>

            <div className="sd-lld-content" style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem 6rem' }}>
                <button
                    onClick={() => navigate('/systemdesign')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '2rem', padding: 0 }}
                >
                    <ArrowLeft size={16} /> Back to System Design
                </button>

                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(168,85,247,0.15)', color: '#c084fc', padding: '6px 14px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1rem' }}>CODE STRUCTURE</div>
                    <h1 className="sd-lld-page-title" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--txt)', marginBottom: '1rem', letterSpacing: '-0.5px' }}>Low-Level Design Syllabus</h1>
                    <p style={{ fontSize: '1.05rem', color: 'var(--txt2)', lineHeight: 1.6 }}>
                        Dive deep into Object-Oriented Design, Design Patterns, API architecture, and machine coding. Master the building blocks of clean, robust software.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {LLD_SYLLABUS.map((section, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
                            <div className="sd-lld-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {section.icon}
                                    </div>
                                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--txt)' }}>{section.title}</h2>
                                </div>
                                <button
                                    onClick={() => handlePracticeClick(section.title)}
                                    className="sd-lld-practice-btn"
                                    style={{
                                        background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.2)'; e.currentTarget.style.borderColor = '#c084fc'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)'; }}
                                >
                                    <Terminal size={14} /> Practice Topic-Wise Interview
                                </button>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                {section.title.includes("12. LLD Case Studies") ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {section.items[0].details.map((caseStudy, cIdx) => (
                                            <div key={cIdx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7' }} />
                                                    <span style={{ fontSize: '1rem', color: 'var(--txt)', fontWeight: 500 }}>{caseStudy}</span>
                                                </div>
                                                <button
                                                    onClick={() => handlePracticeClick(caseStudy)}
                                                    style={{ background: 'transparent', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; e.currentTarget.style.borderColor = '#c084fc'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)'; }}
                                                >
                                                    Practice This Problem
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="sd-lld-section-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                        {section.items.map((item, itemIdx) => (
                                            <div key={itemIdx}>
                                                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt2)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.subtitle}</h3>
                                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {item.details.map((detail, dIdx) => (
                                                        <li key={dIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: 'var(--txt)', lineHeight: 1.5 }}>
                                                            <span style={{ color: '#a855f7', marginTop: '2px' }}>•</span>
                                                            {detail}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
