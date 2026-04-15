import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Cpu, Database, Terminal, ChevronRight, Layout, BookOpen, Clock, Star } from 'lucide-react';
import NavProfile from './NavProfile';
import { useSEO } from './hooks/useSEO';

const BOOKS_DATA = [
    {
        id: 'ml',
        title: 'Hands-On Machine Learning',
        subtitle: 'Scikit-Learn & TensorFlow',
        description: 'The definitive guide to mastering machine learning fundamentals, deep learning, and neural networks with practical Python implementations.',
        icon: <Cpu size={24} />,
        color: '#8b5cf6',
        path: '/books/ml/mlchapter1',
        stats: '16 Chapters',
        level: 'Intermediate',
        tag: 'AI & Data Science'
    },
    {
        id: 'docker',
        title: 'Docker Deep Dive',
        subtitle: 'The Big Picture',
        description: 'Master containerization from zero to production. Understand Docker architecture, images, networking, and security in depth.',
        icon: <Terminal size={24} />,
        color: '#0ea5e9',
        path: '/books/docker/chapter1',
        stats: '11 Chapters',
        level: 'Beginner to Pro',
        tag: 'DevOps'
    },
    {
        id: 'systemdesign',
        title: 'System Design Masterclass',
        subtitle: 'Scale to Millions',
        description: 'Learn to design high-availability, scalable systems. Covers HLD, LLD, load balancing, caching, and database sharding.',
        icon: <Layout size={24} />,
        color: '#ec4899',
        path: '/books/systemdesign/chapter1',
        stats: '16 Chapters',
        level: 'Advanced',
        tag: 'Architecture'
    },
    {
        id: 'mysql',
        title: 'MySQL Handbook',
        subtitle: 'Relational Mastery',
        description: 'A comprehensive guide to relational databases. From SQL basics and normalization to advanced indexing and query optimization.',
        icon: <Database size={24} />,
        color: '#f59e0b',
        path: '/books/mysql/chapter1',
        stats: 'Coming Soon',
        level: 'Beginner',
        tag: 'Database'
    }
];

export default function BooksPage() {
    const navigate = useNavigate();

    useSEO({
        title: 'Digital Library - Premium Engineering Books | Whizan AI',
        description: 'Access a curated collection of digitized technical books on Machine Learning, Docker, MySQL, and System Design. Master engineering with Whizan AI.',
        canonical: '/books',
        keywords: 'machine learning book, docker deep dive, system design interview guide, mysql handbook, technical library, whizan books',
    });

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <nav style={{ height: '64px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flex: '1 1 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <img src="/logo.jpeg" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Whizan AI</span>
                    </div>
                </div>

                <div className="nav-center" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <span onClick={() => navigate('/dashboard')} style={{ color: '#888', fontSize: '0.9rem', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#888'}>Dashboard</span>
                    <span onClick={() => navigate('/courses')} style={{ color: '#888', fontSize: '0.9rem', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#888'}>Courses</span>
                    <span onClick={() => navigate('/systemdesign')} style={{ color: '#888', fontSize: '0.9rem', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#888'}>Dev Hub</span>
                    <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>Library</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 0', justifyContent: 'flex-end' }}>
                    <NavProfile />
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px', 
                        background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
                        padding: '6px 16px', borderRadius: '99px', color: '#c084fc', fontSize: '0.8rem', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px'
                    }}>
                        <Book size={14} /> The Digital Library
                    </div>
                    <h1 style={{ 
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, margin: '0 0 16px 0', 
                        background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        letterSpacing: '-1.5px'
                    }}>
                        Master Technical Bar
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#888', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
                        Digitized versions of world-class technical books, optimized for reading and interview preparation.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
                    {BOOKS_DATA.map(book => (
                        <div
                            key={book.id}
                            onClick={() => navigate(book.path)}
                            style={{
                                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '24px', padding: '32px', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                            }}
                        >
                            {/* Accent Glow */}
                            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: book.color, filter: 'blur(80px)', opacity: 0.05 }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div style={{ 
                                    width: '56px', height: '56px', background: `${book.color}15`, 
                                    border: `1px solid ${book.color}30`, borderRadius: '16px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: book.color
                                }}>
                                    {book.icon}
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666', background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: '12px' }}>{book.tag}</span>
                            </div>

                            <div style={{ marginBottom: '24px', flex: 1 }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 6px 0', color: '#fff' }}>{book.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: book.color, fontWeight: 600, marginBottom: '16px', opacity: 0.8 }}>{book.subtitle}</p>
                                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>{book.description}</p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', opacity: 0.6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                    <BookOpen size={14} /> <span>{book.stats}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                    <Clock size={14} /> <span>{book.level}</span>
                                </div>
                            </div>

                            <button style={{
                                width: '100%', height: '48px', background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff',
                                fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '8px', transition: 'all 0.2s', cursor: 'pointer'
                            }} onMouseEnter={e => {
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.color = '#000';
                            }} onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                e.currentTarget.style.color = '#fff';
                            }}>
                                Start Reading <ChevronRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            {/* CSS for responsive nav layout */}
            <style>{`
                @media (max-width: 768px) {
                    .nav-center { display: none !important; }
                }
            `}</style>
        </div>
    );
}
