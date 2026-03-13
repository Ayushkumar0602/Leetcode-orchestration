import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from './hooks/useSEO';
import { blogPosts } from './data/blogPosts';
import NavProfile from './NavProfile';
import { ArrowLeft, BookOpen, Code, Server, Users } from 'lucide-react';
import './Blog.css';

export default function BlogList() {
    useSEO({
        title: 'Whizan AI Blog | Engineering Interview Prep & AI',
        description: 'Read the latest articles on software engineering interviews, artificial intelligence, LeetCode-style problem solving, and system design.',
        canonical: '/blog',
        jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'Whizan AI Engineering Blog',
            description: 'Insights on technical interviews, system design, and AI coding assistants.',
            url: 'https://whizan.xyz/blog',
        }
    });

    return (
        <div style={{ minHeight: '100vh', background: '#050505' }}>
            {/* Top Navigation */}
            <nav style={{ height: '64px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <ArrowLeft size={20} color="var(--txt2)" />
                        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--txt2)' }}>Back to Home</span>
                    </Link>
                </div>
                <NavProfile />
            </nav>

            <main className="blog-container">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(168,85,247,0.3)' }}>
                        <BookOpen size={32} color="#a855f7" />
                    </div>
                </div>
                <h1 className="blog-title">The Whizan AI Blog</h1>
                <p className="blog-subtitle">Deep dives into software engineering interviews, system design architectures, and building the future of AI-assisted education.</p>

                {/* Feature Links Action Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginBottom: '4rem' }}>
                    <Link to="/infoaiinterview" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'rgba(59,130,246,0.1)', borderRadius: '12px', color: '#fff', textDecoration: 'none', border: '1px solid rgba(59,130,246,0.3)', fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                        <Users size={18} color="#60a5fa" /> Mock AI Interview
                    </Link>
                    <Link to="/dsaquestion" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'rgba(168,85,247,0.1)', borderRadius: '12px', color: '#fff', textDecoration: 'none', border: '1px solid rgba(168,85,247,0.3)', fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                        <Code size={18} color="#c084fc" /> DSA Practice
                    </Link>
                    <Link to="/systemdesign" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', color: '#fff', textDecoration: 'none', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                        <Server size={18} color="#34d399" /> System Design
                    </Link>
                </div>

                <div className="blog-grid">
                    {blogPosts.map((post) => (
                        <Link to={`/blog/${post.slug}`} key={post.slug} style={{ textDecoration: 'none' }}>
                            <article className="blog-card">
                                <img src={post.featuredImage} alt={post.title} className="blog-card-image" loading="lazy" />
                                <div className="blog-card-content">
                                    <div className="blog-card-meta">
                                        <span>{post.date}</span>
                                        <span>{post.tags?.[0]}</span>
                                    </div>
                                    <h2 className="blog-card-title" style={{ color: '#fff' }}>{post.title}</h2>
                                    <p className="blog-card-excerpt">{post.metaDescription}</p>
                                    <div className="blog-card-footer">
                                        <img src={post.author.image} alt={post.author.name} className="blog-author-avatar" loading="lazy" />
                                        <span className="blog-author-name" style={{ color: '#ddd' }}>{post.author.name}</span>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
