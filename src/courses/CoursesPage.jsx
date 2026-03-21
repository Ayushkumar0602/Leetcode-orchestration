import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useSEO } from '../hooks/useSEO';
import { Search, BookOpen, Clock, PlayCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function CoursesPage() {
    useEffect(() => { console.log("CoursesPage mounted"); }, []);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [processingId, setProcessingId] = useState(null);

    useSEO({
        title: 'Courses - Whizan AI',
        description: 'Browse and enroll in top-tier courses.',
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Fetch courses
                const qs = await getDocs(collection(db, 'courses'));
                const cList = [];
                qs.forEach(d => cList.push({ id: d.id, ...d.data() }));
                setCourses(cList);

                // Fetch user enrollments
                if (currentUser) {
                    const eSnap = await getDocs(collection(db, `users/${currentUser.uid}/enrollments`));
                    const eSet = new Set();
                    eSnap.forEach(d => eSet.add(d.id));
                    setEnrollments(eSet);
                }
            } catch (err) {
                console.error('Failed to load courses', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [currentUser]);

    const handleEnroll = async (course) => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (course.priceType === 'paid') {
            const confirmPay = window.confirm(`This is a paid course. Proceed to pay $${course.priceAmount}?`);
            if (!confirmPay) return;
        }

        setProcessingId(course.id);
        try {
            await setDoc(doc(db, `users/${currentUser.uid}/enrollments`, course.id), {
                enrolledAt: new Date().toISOString(),
                courseName: course.name
            });
            setEnrollments(p => new Set([...p, course.id]));
            // Redirect to course details after enrolled
            navigate(`/courses/${course.id}`);
        } catch (err) {
            console.error(err);
            alert("Failed to enroll. Please try again.");
        } finally {
            setProcessingId(null);
        }
    };

    const filtered = courses.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            <nav style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(20,22,30,0.8)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowLeft size={16} /> Dashboard
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen color="#3b82f6" /> Course Library
                </h1>
            </nav>

            <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ position: 'relative', marginBottom: '2rem', maxWidth: '500px' }}>
                    <Search color="var(--txt3)" size={18} style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input 
                        placeholder="Search courses by name or keyword..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                    />
                </div>

                {loading ? (
                    <div style={{display:'flex', justifyContent:'center', padding:'3rem', color:'var(--txt3)'}}><Loader2 className="animate-spin" /></div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {filtered.map(course => {
                            const isEnrolled = enrollments.has(course.id);
                            return (
                                <div key={course.id} style={{ background: 'rgba(20,22,30,0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>{course.name}</h3>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, textTransform: 'uppercase' }}>
                                            {course.priceType === 'paid' ? `$${course.priceAmount}` : 'Free'}
                                        </span>
                                        {course.duration && <span style={{ fontSize: '0.75rem', color: '#60a5fa', background: 'rgba(96,165,250,0.1)', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} />{course.duration}</span>}
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--txt2)', marginBottom: '1.5rem', flex: 1, lineHeight: 1.5 }}>
                                        {course.description.length > 120 ? course.description.substring(0, 120) + '...' : course.description}
                                    </p>
                                    
                                    {isEnrolled ? (
                                        <button onClick={() => navigate(`/courses/${course.id}`)} style={{ width: '100%', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                            <PlayCircle size={18} /> Access Course
                                        </button>
                                    ) : (
                                        <button onClick={() => handleEnroll(course)} disabled={processingId === course.id} style={{ width: '100%', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '12px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: processingId === course.id ? 'wait' : 'pointer' }}>
                                            {processingId === course.id ? <Loader2 className="animate-spin" size={18} /> : (course.priceType === 'paid' ? `Enroll for $${course.priceAmount}` : 'Enroll for Free')}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        {filtered.length === 0 && <div style={{ color: 'var(--txt3)', gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>No courses available right now.</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
