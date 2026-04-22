import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NavProfile from '../NavProfile';
import { useSEO } from '../hooks/useSEO';
import { toughest70InterviewData } from '../data/softskills/toughest70InterviewData';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  MessageCircle, 
  UserCheck, 
  Target, 
  Quote,
  ShieldCheck,
  Star,
  Sparkles,
  Award,
  BookOpen
} from 'lucide-react';

export default function Toughest70Interview() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedIds, setExpandedIds] = useState([]);

    useSEO({
        title: '70 Toughest Interview Questions & Pro Answers | Whizan AI',
        description: 'Master behavioral and HR interview rounds with our premium guide to the 70 toughest questions. Expert model answers using the STAR method for top tech companies.',
        canonical: '/softskills/70-toughest-interview-questions',
        keywords: '70 toughest interview questions, behavioral interview prep, hr interview questions, star method, soft skills prep, whizan ai',
        robots: 'index, follow',
    });

    const toggleExpand = (id) => {
        setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const filteredQuestions = useMemo(() => {
        return toughest70InterviewData.filter(q => 
            q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
            q.answer.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div style={{
            minHeight: '100vh', background: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)',
            color: '#fff', fontFamily: "'Inter', sans-serif"
        }}>
            <style>{`
                .question-card {
                    background: rgba(15, 15, 20, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    margin-bottom: 16px;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    cursor: pointer;
                    overflow: hidden;
                }
                .question-card:hover {
                    border-color: rgba(16, 185, 129, 0.4);
                    background: rgba(255, 255, 255, 0.02);
                }
                .question-card.expanded {
                    border-color: rgba(16, 185, 129, 0.3);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                }
                .answer-box {
                    padding: 24px; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2);
                    line-height: 1.7; color: #ccc;
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}><NavProfile /></div>
            </nav>

            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 1.5rem' }}>
                <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 16px', borderRadius: '99px', color: '#34d399', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                      <UserCheck size={14} /> Soft Skills Excellence
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-2px', marginBottom: '1rem' }}>70 Toughest <span style={{ color: '#10b981' }}>Interview Questions</span></h1>
                    <p style={{ fontSize: '1.1rem', color: '#888', maxWidth: '600px', margin: '0 auto' }}>
                        Expert guide to high-stakes behavioral interviews. Master your narrative and project confidence with our curated model answers.
                    </p>
                </header>

                <div style={{ position: 'relative', marginBottom: '3rem' }}>
                    <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search for questions (e.g., 'conflict', 'failure', 'salary')..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '16px 16px 16px 48px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                    />
                </div>

                <div style={{ marginBottom: '6rem' }}>
                    {filteredQuestions.map((q, idx) => {
                        const isExpanded = expandedIds.includes(q.id);
                        return (
                            <div key={q.id} className={`question-card ${isExpanded ? 'expanded' : ''}`} onClick={() => toggleExpand(q.id)}>
                                <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Quote size={20} color="#10b981" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', marginBottom: '4px', textTransform: 'uppercase' }}>Question {idx + 1}</div>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{q.question}</h3>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        {isExpanded ? <ChevronUp size={24} color="#666" /> : <ChevronDown size={24} color="#666" />}
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="answer-box">
                                        <div style={{ display: 'flex', gap: '16px' }}>
                                            <div style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', minWidth: '80px' }}>Answer:</div>
                                            <div style={{ fontSize: '1.05rem', color: '#ddd' }}>{q.answer}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: '6rem' }} />

                {/* SEO Section */}
                <article style={{ color: '#aaa', lineHeight: 1.8, fontSize: '1.1rem' }}>
                    <h2 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Mastering Behavioral Interviews: A Strategy for Success</h2>
                    <p style={{ marginBottom: '1.5rem' }}>
                        While technical rounds test *what* you can do, behavioral interviews reveal *who* you are. For top-tier tech roles, your ability to communicate complex experiences and show emotional intelligence is often more important than your coding speed. This handbook of the **70 toughest interview questions** is your roadmap to professional excellence.
                    </p>

                    <h3 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700, marginTop: '3rem', marginBottom: '1.5rem' }}>The Power of the STAR Method</h3>
                    <p style={{ marginBottom: '1.5rem' }}>
                        To answer these questions effectively, we recommend the **STAR Method**:
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '1.5rem' }}>
                            <strong style={{ color: '#10b981', display: 'block' }}># Situation:</strong> Set the scene and provide necessary background.
                        </li>
                        <li style={{ marginBottom: '1.5rem' }}>
                            <strong style={{ color: '#10b981', display: 'block' }}># Task:</strong> Describe the challenge or what needed to be done.
                        </li>
                        <li style={{ marginBottom: '1.5rem' }}>
                            <strong style={{ color: '#10b981', display: 'block' }}># Action:</strong> Explain exactly what *you* did to handle the situation.
                        </li>
                        <li style={{ marginBottom: '1.5rem' }}>
                            <strong style={{ color: '#10b981', display: 'block' }}># Result:</strong> Share the positive outcome and what you learned.
                        </li>
                    </ul>

                    <h3 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700, marginTop: '3rem', marginBottom: '1.5rem' }}>Why Soft Skills Matter in Tech</h3>
                    <p style={{ marginBottom: '1.5rem' }}>
                        High-growth companies like Amazon and Google prioritize "Culture Fit" and "Leadership Principles." Questions about conflict, failure, and ambiguity are designed to test your resilience and ownership. By practicing these 70 scenarios, you will be prepared for even the most unpredictable HR rounds.
                    </p>

                    <div style={{ 
                        marginTop: '4rem', 
                        padding: '3rem', 
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), transparent)', 
                        borderRadius: '24px', 
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        textAlign: 'center'
                    }}>
                      <div style={{ width: '64px', height: '64px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: '#000' }}>
                        <Target size={32} />
                      </div>
                      <h3 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Take Your Prep to the Next Level</h3>
                      <p style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>Simulate a real HR round with our AI Interviewer to get live feedback on your STAR responses.</p>
                      <button 
                        onClick={() => navigate('/aiinterviewselect')}
                        style={{ background: '#10b981', color: '#000', border: 'none', padding: '12px 32px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Start AI Interview Practice
                      </button>
                    </div>
                </article>
            </main>
        </div>
    );
}
