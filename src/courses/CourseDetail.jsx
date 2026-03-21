import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useSEO } from '../hooks/useSEO';
import { BookOpen, MapPin, Layers, Clock, ArrowLeft, PlayCircle, FileText, CheckCircle2 } from 'lucide-react';

export default function CourseDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [course, setCourse] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);

    useSEO({
        title: course ? `${course.name} - Whizan AI` : 'Course Details - Whizan AI',
        description: course?.description || 'Course details page',
    });

    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) return;
            try {
                const cDoc = await getDoc(doc(db, 'courses', courseId));
                if (cDoc.exists()) {
                    setCourse({ id: cDoc.id, ...cDoc.data() });
                }

                if (currentUser) {
                    const eDoc = await getDoc(doc(db, `users/${currentUser.uid}/enrollments`, courseId));
                    setIsEnrolled(eDoc.exists());
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, currentUser]);

    if (loading) return <div style={{ color: '#fff', padding: '3rem', textAlign: 'center' }}>Loading course...</div>;
    if (!course) return <div style={{ color: '#ef4444', padding: '3rem', textAlign: 'center' }}>Course not found.</div>;

    const materials = course.materialsText ? course.materialsText.split(/[\n,]+/).filter(x => x.trim().length > 0) : [];

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.18) 0%,rgba(59,130,246,0.12) 50%,rgba(16,185,129,0.08) 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '3rem 2rem' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <button onClick={() => navigate('/courses')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                        <ArrowLeft size={14} /> Back to Courses
                    </button>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.04em' }}>{course.name}</h1>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '2rem' }}>
                        <span style={{ fontSize: '0.85rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, textTransform: 'uppercase' }}>
                            {course.priceType === 'paid' ? `$${course.priceAmount}` : 'Free'}
                        </span>
                        {course.duration && <span style={{ fontSize: '0.85rem', color: 'var(--txt2)', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} />{course.duration}</span>}
                        {course.prerequisite && <span style={{ fontSize: '0.85rem', color: 'var(--txt2)', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={14} />Prerequisites: {course.prerequisite}</span>}
                    </div>

                    {!isEnrolled ? (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem 1.5rem', borderRadius: '12px', display: 'inline-block' }}>
                            You are not enrolled in this course. Please enroll from the course library to access content.
                        </div>
                    ) : (
                        <button 
                            onClick={() => navigate(`/courses/${course.id}/lecture`)} 
                            style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '12px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 24px rgba(168,85,247,0.3)', transition: 'transform 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
                        >
                            <PlayCircle size={20} /> Enter Lecture Dashboard
                        </button>
                    )}
                </div>
            </div>

            {/* Content area */}
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem', display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                
                <section>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Course Description</h2>
                    <div style={{ color: 'var(--txt2)', lineHeight: 1.8, fontSize: '1rem', background: 'rgba(20,22,30,0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }}>
                        {course.description.split('\n').map((line, i) => <p key={i} style={{ margin: '0 0 1rem 0' }}>{line}</p>)}
                    </div>
                </section>

                {materials.length > 0 && isEnrolled && (
                    <section>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Course Materials</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {materials.map((m, i) => (
                                <a 
                                    key={i} 
                                    href={m.trim()} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background='rgba(59,130,246,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                                >
                                    <FileText size={18} /> Resource {i + 1}
                                </a>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}
