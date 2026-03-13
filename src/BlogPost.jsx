import React, { useEffect } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { useSEO } from './hooks/useSEO';
import { blogPosts } from './data/blogPosts';
import NavProfile from './NavProfile';
import { ArrowLeft, MessageSquare, ChevronRight, Code, Server, Users } from 'lucide-react';
import './Blog.css';

export default function BlogPost() {
    const { slug } = useParams();
    const navigate = useNavigate();

    // Find post by slug
    const post = blogPosts.find(p => p.slug === slug);

    // Dynamic SEO
    useSEO({
        title: post ? post.metaTitle : 'Post Not Found | Whizan AI',
        description: post ? post.metaDescription : '',
        canonical: `/blog/${slug}`,
        jsonLd: post ? {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            image: post.featuredImage,
            author: { '@type': 'Person', name: post.author.name },
            datePublished: new Date(post.date).toISOString(), // Naive transform assuming valid date
            description: post.metaDescription,
            publisher: {
                '@type': 'Organization',
                name: 'Whizan AI',
                logo: { '@type': 'ImageObject', url: 'https://whizan.xyz/logo.jpeg' } // Adjust real path
            }
        } : null
    });

    // Handle 404
    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    // Dynamic Content Renderer
    const renderBlock = (block, idx) => {
        switch (block.type) {
            case 'heading2': return <h2 id={block.id} key={idx}>{block.text}</h2>;
            case 'heading3': return <h3 id={block.id} key={idx}>{block.text}</h3>;
            case 'paragraph': return <p key={idx} dangerouslySetInnerHTML={{ __html: block.text }} />;
            case 'image': return <img key={idx} src={block.url} alt={block.alt} className="post-content-image" loading="lazy" />;
            case 'code':
                return (
                    <div key={idx} className="post-content-code">
                        <div style={{ marginBottom: '8px', fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>{block.language}</div>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{block.text}</pre>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <nav style={{ height: '64px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--txt2)' }} onClick={() => navigate('/blog')}>
                        <ArrowLeft size={20} />
                        <span style={{ fontSize: '1rem', fontWeight: 600 }}>Back to Blog</span>
                    </div>
                </div>
                <NavProfile />
            </nav>

            <article className="blog-post-wrapper" style={{ padding: '4rem 1.5rem' }}>
                {/* 1. Header Area */}
                <header className="post-header">
                    <div className="post-meta" style={{ marginBottom: '1.5rem' }}>
                        <span>{post.date}</span>
                        <span>•</span>
                        <span style={{ color: '#a855f7', fontWeight: 600 }}>{post.tags?.[0]}</span>
                    </div>
                    <h1 className="post-title">{post.title}</h1>
                    <div className="post-meta" style={{ marginTop: '2rem' }}>
                        <img src={post.author.image} alt={post.author.name} className="post-meta-avatar" loading="lazy" />
                        <div>
                            <div style={{ color: '#fff', fontWeight: 600 }}>{post.author.name}</div>
                            <div style={{ fontSize: '0.8rem' }}>Author</div>
                        </div>
                    </div>
                </header>

                {/* 2. Featured Image */}
                <img src={post.featuredImage} alt={post.title} className="post-featured-image" loading="lazy" />

                <div className="post-layout">
                    {/* 3. Table of Contents */}
                    <aside style={{ display: 'none' }} className="post-toc-container">
                        {/* CSS handles showing this on desktop */}
                    </aside>
                    <aside className="post-toc" style={{ display: 'flex' }}>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <div className="post-toc-title">Explore Platform</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
                                <Link to="/infoaiinterview" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ddd', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'} onMouseLeave={e => e.currentTarget.style.color = '#ddd'}>
                                    <Users size={16} color="#3b82f6" /> AI Interviews
                                </Link>
                                <Link to="/dsaquestion" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ddd', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#c084fc'} onMouseLeave={e => e.currentTarget.style.color = '#ddd'}>
                                    <Code size={16} color="#a855f7" /> DSA Practice
                                </Link>
                                <Link to="/systemdesign" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ddd', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#34d399'} onMouseLeave={e => e.currentTarget.style.color = '#ddd'}>
                                    <Server size={16} color="#10b981" /> System Design Practice
                                </Link>
                            </div>
                        </div>

                        <div className="post-toc-title">Table of Contents</div>
                        {post.toc.map(item => (
                            <a key={item.id} href={`#${item.id}`} className="post-toc-link">
                                {item.title}
                            </a>
                        ))}
                    </aside>

                    {/* 4. Main Content */}
                    <section className="post-content">
                        {post.content.map(renderBlock)}

                        {/* 5. FAQ Section */}
                        {post.faq && post.faq.length > 0 && (
                            <div className="post-faq">
                                <h2>Frequently Asked Questions</h2>
                                {post.faq.map((f, i) => (
                                    <div key={i} className="faq-item">
                                        <div className="faq-question">{f.question}</div>
                                        <div className="faq-answer">{f.answer}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 6. Author Bio */}
                        <div className="post-author-bio">
                            <img src={post.author.image} alt={post.author.name} className="bio-avatar" loading="lazy" />
                            <div>
                                <h3 className="bio-name">{post.author.name}</h3>
                                <p className="bio-text">{post.author.bio}</p>
                            </div>
                        </div>

                        {/* 7. Comments Plugin (Placeholder for Disqus/Giscus) */}
                        <div className="post-comments">
                            <MessageSquare size={32} color="#888" style={{ marginBottom: '1rem' }} />
                            <h3 className="comments-title">Comments</h3>
                            <p className="comments-subtitle">Join the discussion! Login to leave a comment below.</p>
                            {/* Insert Giscus or Disqus embed code here */}
                        </div>

                        {/* 8. Related Posts */}
                        {post.relatedPosts && post.relatedPosts.length > 0 && (
                            <div style={{ marginTop: '4rem' }}>
                                <h3 style={{ marginBottom: '1.5rem', color: '#fff' }}>Related Articles</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                    {post.relatedPosts.map((rel, i) => (
                                        <Link key={i} to={`/blog/${rel.slug}`} style={{ textDecoration: 'none' }}>
                                            <div style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', transition: 'transform 0.2s, border-color 0.2s' }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#a855f7'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#333'; }}>
                                                <img src={rel.image} alt={rel.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} loading="lazy" />
                                                <div style={{ padding: '1.25rem' }}>
                                                    <h4 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.1rem', lineHeight: 1.4 }}>{rel.title}</h4>
                                                    <div style={{ color: '#a855f7', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                                        Read post <ChevronRight size={14} />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </article>

            {/* Minimal Mobile TOC styling overrides */}
            <style>{`
                @media (max-width: 900px) {
                    .post-toc { position: static; border-left: none; padding-left: 0; background: #111; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid #333; }
                }
            `}</style>
        </div>
    );
}
