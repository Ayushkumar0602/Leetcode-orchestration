import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LogOut, ArrowLeft, Server, Activity, Globe, Database, Cpu, Zap, Lock, Eye, Cloud } from 'lucide-react';
import NavProfile from './NavProfile';

const HLD_SYLLABUS = [
    {
        title: "1. Foundations",
        icon: <Cpu size={20} color="#818cf8" />,
        items: [
            { subtitle: "Requirements Analysis", details: ["Functional requirements", "Non-functional requirements (NFRs)", "Scalability, Availability, Reliability", "Consistency, Latency, Durability, Security", "Constraints (budget, infra, region, team)", "Capacity estimation basics"] },
            { subtitle: "Design Principles", details: ["SOLID principles", "DRY, KISS, YAGNI", "Separation of concerns", "Loose vs tight coupling", "High cohesion", "Design for failure"] }
        ]
    },
    {
        title: "2. Traffic & Scale Estimation",
        icon: <Activity size={20} color="#34d399" />,
        items: [
            { subtitle: "Core Metrics", details: ["DAU / MAU", "QPS / TPS", "Read vs Write ratio", "Peak traffic estimation", "Storage estimation", "Bandwidth estimation"] }
        ]
    },
    {
        title: "3. System Architecture Patterns",
        icon: <Server size={20} color="#f472b6" />,
        items: [
            { subtitle: "Architectures", details: ["Monolithic architecture", "Layered architecture", "Microservices architecture", "Event-driven architecture", "Serverless architecture", "Hexagonal / Clean architecture", "SOA (Service-Oriented Architecture)"] }
        ]
    },
    {
        title: "4. Networking & Communication",
        icon: <Globe size={20} color="#fbbf24" />,
        items: [
            { subtitle: "Protocols & APIs", details: ["HTTP / HTTPS", "REST vs GraphQL vs gRPC", "WebSockets & Long polling", "TCP vs UDP", "API Gateway"] },
            { subtitle: "Load Balancing", details: ["Round-robin", "Least connections", "Consistent hashing"] }
        ]
    },
    {
        title: "5. Scalability Strategies",
        icon: <Zap size={20} color="#fb923c" />,
        items: [
            { subtitle: "Scaling", details: ["Vertical scaling", "Horizontal scaling", "Auto-scaling", "Stateless vs Stateful services"] },
            { subtitle: "Sharding", details: ["Range-based", "Hash-based", "Geo-based", "Partitioning pitfalls"] }
        ]
    },
    {
        title: "6. Databases (HLD View)",
        icon: <Database size={20} color="#60a5fa" />,
        items: [
            { subtitle: "Concepts", details: ["SQL vs NoSQL", "CAP theorem", "ACID vs BASE", "OLTP vs OLAP", "Read replicas", "Leader–Follower architecture", "Multi-leader replication", "Eventual consistency"] },
            { subtitle: "Database Types", details: ["Relational (MySQL, PostgreSQL)", "Key-Value stores", "Document stores", "Columnar databases", "Time-series databases", "Graph databases"] }
        ]
    },
    {
        title: "7. Caching",
        icon: <Zap size={20} color="#a78bfa" />,
        items: [
            { subtitle: "Strategies", details: ["Cache-aside", "Write-through", "Write-back", "Read-through", "Distributed caching", "Cache invalidation problems"] },
            { subtitle: "Eviction Policies", details: ["TTL strategies", "LRU (Least Recently Used)", "LFU (Least Frequently Used)", "FIFO (First In First Out)"] }
        ]
    },
    {
        title: "8. Messaging & Async Processing",
        icon: <Activity size={20} color="#f87171" />,
        items: [
            { subtitle: "Asynchronous Systems", details: ["Message queues", "Pub/Sub systems", "Event streams", "At-least-once vs exactly-once delivery", "Idempotency", "Dead letter queues", "Backpressure handling"] }
        ]
    },
    {
        title: "9. Consistency & Reliability",
        icon: <Server size={20} color="#2dd4bf" />,
        items: [
            { subtitle: "Distributed Concepts", details: ["Strong vs eventual consistency", "Quorum-based reads/writes", "Distributed transactions", "Two-phase commit (2PC)", "Saga pattern", "Circuit breakers", "Retries & exponential backoff", "Rate limiting", "Throttling"] }
        ]
    },
    {
        title: "10. Availability & Fault Tolerance",
        icon: <Activity size={20} color="#818cf8" />,
        items: [
            { subtitle: "Resilience", details: ["Single point of failure (SPOF)", "Redundancy", "Failover strategies", "Active-active vs active-passive", "Health checks", "Graceful degradation", "Chaos engineering basics"] }
        ]
    },
    {
        title: "11. Storage Systems",
        icon: <Database size={20} color="#a3e635" />,
        items: [
            { subtitle: "Storage Infrastructure", details: ["Object storage", "Block storage", "File systems", "CDN architecture", "Media storage & streaming basics"] }
        ]
    },
    {
        title: "12. Security (HLD Level)",
        icon: <Lock size={20} color="#ef4444" />,
        items: [
            { subtitle: "System Security", details: ["Authentication vs Authorization", "OAuth / JWT", "API security", "Rate limiting", "DDoS protection", "Encryption at rest & in transit", "Secrets management"] }
        ]
    },
    {
        title: "13. Observability",
        icon: <Eye size={20} color="#60a5fa" />,
        items: [
            { subtitle: "Monitoring & Metrics", details: ["Logging", "Metrics", "Monitoring", "Tracing", "Alerting", "SLIs, SLOs, SLAs"] }
        ]
    },
    {
        title: "14. Deployment & Infra",
        icon: <Cloud size={20} color="#cbd5e1" />,
        items: [
            { subtitle: "DevOps & Cloud", details: ["CI/CD pipelines", "Blue-green deployment", "Canary releases", "Rolling deployments", "Containers", "Orchestration basics", "Infrastructure as Code"] }
        ]
    },
    {
        title: "15. Common HLD Case Studies",
        icon: <Server size={20} color="#fcd34d" />,
        isCaseStudies: true,
        items: ["URL shortener", "Rate limiter", "Notification system", "Chat application", "File storage system", "Feed system", "Search system", "Payment system", "Video streaming platform"]
    }
];

export default function SystemDesignHLD() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const handlePracticeClick = (topicName) => {
        if (!currentUser) {
            alert('Only authenticated users can take interviews. Please log in first.');
            navigate('/login?redirect=/systemdesign/hld');
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
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--txt)', letterSpacing: '-0.3px' }}>CodeArena</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px' }}>
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

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem 6rem' }}>
                <button
                    onClick={() => navigate('/systemdesign')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '2rem', padding: 0 }}
                >
                    <ArrowLeft size={16} /> Back to System Design
                </button>

                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '6px 14px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1rem' }}>ARCHITECTURE</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--txt)', marginBottom: '1rem', letterSpacing: '-0.5px' }}>High-Level Design Syllabus</h1>
                    <p style={{ fontSize: '1.05rem', color: 'var(--txt2)', lineHeight: 1.6 }}>
                        A comprehensive guide to mastering scalable system design. This syllabus outlines everything you need to know for senior backend engineering and HLD interview rounds.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {HLD_SYLLABUS.map((section, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {section.icon}
                                    </div>
                                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--txt)' }}>{section.title}</h2>
                                </div>
                                <button
                                    onClick={() => handlePracticeClick(section.title)}
                                    style={{
                                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; e.currentTarget.style.borderColor = '#818cf8'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
                                >
                                    <Activity size={14} /> Practice Topic-Wise Interview
                                </button>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                {section.isCaseStudies ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                                        {section.items.map((study, studyIdx) => (
                                            <div key={studyIdx} style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '10px',
                                                padding: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer'
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                                onClick={() => handlePracticeClick(study)}
                                            >
                                                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(252, 211, 77, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Server size={14} color="#fcd34d" />
                                                </div>
                                                <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--txt)' }}>{study}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                        {section.items.map((item, itemIdx) => (
                                            <div key={itemIdx}>
                                                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--txt2)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.subtitle}</h3>
                                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {item.details.map((detail, dIdx) => (
                                                        <li key={dIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: 'var(--txt)', lineHeight: 1.5 }}>
                                                            <span style={{ color: 'var(--accent)', marginTop: '2px' }}>•</span>
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
