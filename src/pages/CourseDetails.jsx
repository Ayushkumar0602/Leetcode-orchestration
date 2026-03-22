import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCourseDetail, enrollInCourse, fetchUserCourses, queryKeys } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { 
    Clock, BookOpen, ArrowRight, Play, 
    FileText, Share2, AlertCircle, ShieldCheck,
    ChevronRight, Zap, GraduationCap, Video
} from 'lucide-react';
import '../Courses.css';

export default function CourseDetails() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [isPaymentLoading, setPaymentLoading] = useState(false);

    const { data: course, isLoading } = useQuery({
        queryKey: queryKeys.courseDetail(courseId),
        queryFn: () => fetchCourseDetail(courseId),
        enabled: !!courseId,
    });

    const { data: userCourses = [] } = useQuery({
        queryKey: queryKeys.userCourses(currentUser?.uid),
        queryFn: () => fetchUserCourses(currentUser?.uid),
        enabled: !!currentUser?.uid,
    });

    const isEnrolled = userCourses.some(c => c.id === courseId);

    const enrollmentMutation = useMutation({
        mutationFn: (payload) => enrollInCourse(currentUser?.uid, courseId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.userCourses(currentUser?.uid) });
            setPaymentLoading(false);
            alert("Enrolled successfully!");
        },
        onError: () => {
            setPaymentLoading(false);
            alert("Enrollment failed. Please try again.");
        }
    });

    const handleEnroll = async () => {
        if (!currentUser) {
            navigate('/login', { state: { from: `/courses/${courseId}` } });
            return;
        }

        if (course?.type === 'paid') {
            setPaymentLoading(true);
            // Simulate payment processing
            setTimeout(() => {
                enrollmentMutation.mutate({ amount: course.price, method: 'MockPayment' });
            }, 1000);
        } else {
            enrollmentMutation.mutate();
        }
    };

    if (isLoading) return <div className="courses-container">Loading course details...</div>;
    if (!course) return <div className="courses-container">Course not found.</div>;

    return (
        <div className="courses-container">
            <div className="course-details-page">
                <div className="course-hero">
                    <div className="details-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                            <span style={{ padding: '4px 12px', background: 'rgba(168,85,247,0.1)', color: '#d8b4fe', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid rgba(168,85,247,0.2)' }}>
                                {(course.type || 'free') === 'free' ? 'COMPLEMENTARY' : 'PREMIUM COURSE'}
                            </span>
                            {isEnrolled && <span style={{ padding: '4px 12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid rgba(16,185,129,0.2)' }}>ENROLLED</span>}
                        </div>
                        
                        <h1>{course.name || 'Untitled Course'}</h1>
                        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                            {course.description || 'No description provided.'}
                        </p>
                        
                        <div className="details-meta">
                            <div className="details-meta-item"><Clock size={16} color="#a855f7" /> {course.duration} Duration</div>
                            <div className="details-meta-item"><BookOpen size={16} color="#3b82f6" /> Comprehensive Notes</div>
                            <div className="details-meta-item"><Play size={16} color="#10b981" /> Full Playlist Access</div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            {isEnrolled ? (
                                <button className="details-btn" onClick={() => navigate(`/courses/${courseId}/lecture`)} style={{ padding: '1.2rem 3rem' }}>
                                    <Play size={18} style={{ marginRight: '10px' }} /> Go to Lecture Dashboard
                                </button>
                            ) : (
                                <button className="details-btn" onClick={handleEnroll} disabled={isPaymentLoading} style={{ padding: '1.2rem 3rem', minWidth: '240px' }}>
                                    {isPaymentLoading ? 'Processing...' : ((course.type || 'free') === 'free' ? 'Enroll for Free' : `Enroll for ₹${course.price || 499}`)}
                                </button>
                            )}
                            <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0 1.5rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Share2 size={18} /> Share
                            </button>
                        </div>
                    </div>
                    
                    <div className="details-sidebar">
                        <div style={{ background: 'var(--course-glass)', border: '1px solid var(--course-border)', borderRadius: '24px', padding: '2rem', backdropFilter: 'blur(20px)' }}>
                            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', fontWeight: 700 }}>Course Details</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Prerequisites</div>
                                    <div style={{ fontSize: '0.9rem', color: '#fff', lineHeight: 1.5 }}>
                                        {course.prerequisite || 'Basic understanding of programming is recommended.'}
                                    </div>
                                </div>
                                
                                <div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Included Materials</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {(course.materials || []).map((m, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                {m.type === 'pdf' ? <FileText size={14} color="#ef4444" /> : <Video size={14} color="#3b82f6" />}
                                                {m.name || 'Resource Link'}
                                                <ArrowRight size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>
                                        <AlertCircle size={14} /> Full lifetime access
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefits / Curriculum Section Placeholder */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                    {[
                        { icon: GraduationCap, title: 'Expert Instruction', desc: 'Learn from industry veterans with hands-on examples.' },
                        { icon: Zap, title: 'Fast Track Progress', desc: 'Optimize your learning with curated high-impact content.' },
                        { icon: ShieldCheck, title: 'Certified Completion', desc: 'Get a certificate to showcase on your LinkedIn & Portfolio.' }
                    ].map((benefit, i) => (
                        <div key={i} style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <benefit.icon size={24} color="#a855f7" />
                            </div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 10px' }}>{benefit.title}</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{benefit.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
