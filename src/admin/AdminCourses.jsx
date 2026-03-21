import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        duration: '',
        description: '',
        priceType: 'free',
        priceAmount: 0,
        youtubePlaylistUrl: '',
        prerequisite: '',
        materialsText: '', // Using comma-separated URLs or simple text block
    });

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'courses'));
            const data = [];
            querySnapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
            setCourses(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
    };

    const handleOpenModal = (course = null) => {
        if (course) {
            setEditingId(course.id);
            setFormData({
                name: course.name || '',
                duration: course.duration || '',
                description: course.description || '',
                priceType: course.priceType || 'free',
                priceAmount: course.priceAmount || 0,
                youtubePlaylistUrl: course.youtubePlaylistUrl || '',
                prerequisite: course.prerequisite || '',
                materialsText: course.materialsText || '',
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                duration: '',
                description: '',
                priceType: 'free',
                priceAmount: 0,
                youtubePlaylistUrl: '',
                prerequisite: '',
                materialsText: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                priceAmount: Number(formData.priceAmount),
                updatedAt: serverTimestamp()
            };

            if (editingId) {
                await updateDoc(doc(db, 'courses', editingId), payload);
            } else {
                payload.createdAt = serverTimestamp();
                await addDoc(collection(db, 'courses'), payload);
            }
            setIsModalOpen(false);
            fetchCourses();
        } catch (err) {
            console.error('Failed to save course:', err);
            alert('Failed to save course. See console for details.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course forever?')) return;
        try {
            await deleteDoc(doc(db, 'courses', id));
            fetchCourses();
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Course Management</h2>
                <button 
                    onClick={() => handleOpenModal()} 
                    style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
                >
                    <Plus size={16} /> Add New Course
                </button>
            </div>

            {loading ? (
                <div style={{ color: 'var(--txt3)' }}>Loading courses...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {courses.map(course => (
                        <div key={course.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#fff' }}>{course.name}</h3>
                                <span style={{ background: course.priceType === 'paid' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', color: course.priceType === 'paid' ? '#f59e0b' : '#10b981', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                    {course.priceType === 'paid' ? `$${course.priceAmount}` : 'Free'}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--txt3)', marginBottom: '1rem', flex: 1 }}>{course.description}</p>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>⏳ {course.duration}</span>
                                {course.prerequisite && <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>🎯 Req: {course.prerequisite}</span>}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                                <button onClick={() => handleOpenModal(course)} style={{ background: 'transparent', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Edit2 size={14} /> Edit</button>
                                <button onClick={() => handleDelete(course.id)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={14} /> Delete</button>
                            </div>
                        </div>
                    ))}
                    {courses.length === 0 && <div style={{ color: 'var(--txt3)', gridColumn: '1 / -1' }}>No courses found. Create one!</div>}
                </div>
            )}

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: '#141620', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>{editingId ? 'Edit Course' : 'Add New Course'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--txt3)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--txt2)' }}>Course Name</label>
                                <input required name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--txt2)' }}>Duration</label>
                                    <input required name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 4 Weeks" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--txt2)' }}>Prerequisite</label>
                                    <input name="prerequisite" value={formData.prerequisite} onChange={handleChange} placeholder="e.g. Basic JS" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--txt2)' }}>Description</label>
                                <textarea required name="description" value={formData.description} onChange={handleChange} rows={3} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', resize: 'vertical' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--txt2)' }}>Price Type</label>
                                    <select name="priceType" value={formData.priceType} onChange={handleChange} style={{ width: '100%', padding: '10px', background: '#1c1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}>
                                        <option value="free">Free</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                                {formData.priceType === 'paid' && (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--txt2)' }}>Price Amount ($)</label>
                                        <input type="number" name="priceAmount" value={formData.priceAmount} onChange={handleChange} min={0} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--txt2)' }}>YouTube Playlist URL <br/><small style={{color:'gray'}}>(E.g. https://www.youtube.com/playlist?list=PL...)</small></label>
                                <input name="youtubePlaylistUrl" value={formData.youtubePlaylistUrl} onChange={handleChange} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--txt2)' }}>Additional Materials (PDF/Images/Text URLs) <br/><small style={{color:'gray'}}>(Separate by comma or new line)</small></label>
                                <textarea name="materialsText" value={formData.materialsText} onChange={handleChange} rows={4} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', resize: 'vertical' }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save Course</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
