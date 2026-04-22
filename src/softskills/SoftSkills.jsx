import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavProfile from '../NavProfile';
import { useSEO } from '../hooks/useSEO';
import { 
  UserCheck, 
  Target, 
  MessageCircle, 
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Star,
  Users
} from 'lucide-react';

export default function SoftSkills() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useSEO({
        title: 'Soft Skills Excellence | Master Your Story - Whizan AI',
        description: 'Prepare for high-stakes behavioral and HR interviews. Master the STAR method, leadership principles, and cultural fit scenarios with our expert handbooks.',
        canonical: '/softskills',
        keywords: 'soft skills, behavioral interview prep, hr interview questions, star method, leadership principles, Whizan AI',
        robots: 'index, follow',
    });

    return (
        <div style={{
            minHeight: '100vh', background: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)',
            color: '#fff', fontFamily: "'Inter', sans-serif"
        }}>
            <style>{`
                .hero-gradient {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .resource-card {
                    background: rgba(15, 15, 20, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    padding: 2.5rem;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    backdrop-filter: blur(12px);
                }
                .resource-card:hover {
                    transform: translateY(-8px);
                    border-color: rgba(16, 185, 129, 0.4);
                    background: rgba(15, 15, 20, 0.6);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(16, 185, 129, 0.1);
                }
                .resource-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.1), transparent 70%);
                    opacity: 0;
                    transition: opacity 0.4s ease;
                }
                .resource-card:hover::before {
                    opacity: 1;
                }
            `}</style>

            <nav style={{
                height: '64px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem',
                background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="Logo" style={{ height: '32px', width: '32px', borderRadius: '8px' }} />
                    <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Whizan AI</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <NavProfile />
                </div>
            </nav>

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 1.5rem' }}>
                <header style={{ textAlign: 'center', marginBottom: '6rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 16px', borderRadius: '99px', color: '#34d399', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                      <Sparkles size={14} /> Soft Skills Center
                    </div>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-3px', marginBottom: '1.5rem' }}>
                        Master Your <span className="hero-gradient">Story</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#888', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                        The technical round gets you the interview, but the behavioral round gets you the job. Build a narrative that highlights your leadership and impact.
                    </p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', marginBottom: '8rem' }}>
                    {/* behavioral handbook card */}
                    <div className="resource-card" onClick={() => navigate('/softskills/70-toughest-interview-questions')}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', color: '#10b981' }}>
                            <UserCheck size={32} />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>70 Toughest HR Questions</h2>
                        <p style={{ color: '#888', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                            Master cultural fit and behavioral rounds with our premium guide featuring 70 battle-tested scenarios and expert model answers.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '1rem' }}>
                            Explore Handbook <ArrowRight size={18} />
                        </div>
                    </div>

                    {/* AI interview practice prompt */}
                    <div className="resource-card" onClick={() => navigate('/aiinterviewselect')}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', color: '#60a5fa' }}>
                            <MessageCircle size={32} />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>AI Behavioral Practice</h2>
                        <p style={{ color: '#888', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                            Simulate mock behavioral interviews with our AI interviewer. Receive instant feedback on your tone, STAR method structure, and confidence.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontWeight: 700, fontSize: '1rem' }}>
                            Start Mock Session <ArrowRight size={18} />
                        </div>
                    </div>
                </div>

                {/* extra value section */}
                <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>The Competitive Edge</h2>
                        <p style={{ color: '#666', fontSize: '1.1rem' }}>Soft skills are the deciding factor at top-tier firms like Amazon, Google, and Meta.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ color: '#10b981' }}><Users size={24} /></div>
                            <div>
                                <h3 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Culture Fit</h3>
                                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6 }}>Learn to align your values with company leadership principles and mission statements.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ color: '#10b981' }}><ShieldCheck size={24} /></div>
                            <div>
                                <h3 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Conflict Resolution</h3>
                                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6 }}>Master the art of describing workplace disagreements with maturity and objective outcomes.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ color: '#10b981' }}><Award size={24} /></div>
                            <div>
                                <h3 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Impact Tracking</h3>
                                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6 }}>Quantify your achievements using data-driven narratives that recruiters love.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
