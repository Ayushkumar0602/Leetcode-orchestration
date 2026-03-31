import React, { Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import NavProfile from './NavProfile';

// Dynamically map topic IDs to their content files
const topicMapping = {
    'foundations': lazy(() => import('./learn/systemdesign/hld/Foundationscontent')),
    'traffic-scale-estimation': lazy(() => import('./learn/systemdesign/hld/TrafficScaleContent')),
    'system-architecture-patterns': lazy(() => import('./learn/systemdesign/hld/SystemArchitecturePatterns')),
    'networking-communication': lazy(() => import('./learn/systemdesign/hld/NetworkingCommunication')),
    'scalability-strategies': lazy(() => import('./learn/systemdesign/hld/ScalabilityStrategies')),
    'databases-hld-view': lazy(() => import('./learn/systemdesign/hld/DatabasesHLD')),
    'caching': lazy(() => import('./learn/systemdesign/hld/CachingPage')),
    'messaging-async-processing': lazy(() => import('./learn/systemdesign/hld/MessagingPage')),
    // Other topics will be wired up here progressively. For now, fallback to "coming soon" if not mapped.
};

export default function SystemDesignReviseHLD() {
    const { topicId } = useParams();
    const navigate = useNavigate();

    const normalizedTopicId = topicId?.toLowerCase().replace(/-+$/, '');
    const ContentComponent = topicMapping[normalizedTopicId];
    
    console.log("SystemDesignReviseHLD Routing:", { topicId, normalizedTopicId, found: !!ContentComponent });

    if (!ContentComponent) {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
                    <BookOpen size={48} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 1.5rem' }} />
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.5px' }}>Material Coming Soon</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem', lineHeight: 1.6 }}>We are currently crafting high-quality revision materials for <strong>{topicId.replace(/-/g, ' ')}</strong>. Check back shortly!</p>
                    <button 
                        onClick={() => navigate('/systemdesign/hld')}
                        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', padding: '12px 24px', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Return to Syllabus
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
            <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    <img src="/logo.jpeg" alt="Logo" style={{ height: '28px', width: '28px', borderRadius: '6px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>Whizan AI</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: '6px 12px', borderRadius: '8px' }}>
                    <BookOpen size={14} color="#818cf8" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.05em' }}>REVISE MODE</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <NavProfile />
                </div>
            </nav>

            <main style={{ width: '100%', margin: '0 auto' }}>
                <div style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(5,5,5,0.5)' }}>
                    <button
                        onClick={() => navigate('/systemdesign/hld')}
                        style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem', padding: 0, transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                    >
                        <ArrowLeft size={16} /> Back to Syllabus
                    </button>
                </div>

                <Suspense fallback={
                    <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'rgba(255,255,255,0.5)' }}>
                        <Loader2 size={32} className="animate-spin" style={{ marginBottom: '1rem', color: '#6366f1' }} />
                        <span style={{ fontWeight: 600 }}>Loading precision revision material...</span>
                    </div>
                }>
                    <ContentComponent />
                </Suspense>
            </main>
        </div>
    );
}
