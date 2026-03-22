import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllCourses, createCourse, updateCourse, deleteCourse, queryKeys } from '../lib/api';
import { 
    Plus, Edit, Trash2, Search, 
    Video, X, Save
} from 'lucide-react';
import '../Courses.css';

export default function AdminCourses() {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [search, setSearch] = useState('');

    const { data: courses = [], isLoading } = useQuery({
        queryKey: queryKeys.courses(),
        queryFn: fetchAllCourses,
    });

    const createMutation = useMutation({
        mutationFn: createCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courses() });
            setIsAdding(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data) => updateCourse(data.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courses() });
            setEditingCourse(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCourse,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.courses() })
    });

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this course?")) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="courses-container">
            <header className="courses-header">
                <div>
                    <h1 className="courses-title">Manage Courses</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                        Create and manage learning paths for all users.
                    </p>
                </div>
                <button className="details-btn" onClick={() => setIsAdding(true)}>
                    <Plus size={18} style={{ marginRight: '8px' }} /> Create New Course
                </button>
            </header>

            <div className="course-search-bar" style={{ marginBottom: '2rem', maxWidth: '100%' }}>
                <Search size={18} color="rgba(255,255,255,0.4)" />
                <input 
                    placeholder="Search courses by name or description..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Courses Dashboard...</div>
            ) : (
                <div className="admin-course-list" style={{ display: 'grid', gap: '1rem' }}>
                    {courses.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(course => (
                        <div 
                            key={course.id} 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1.5rem', 
                                padding: '1.25rem', 
                                background: 'var(--course-glass)', 
                                border: '1px solid var(--course-border)', 
                                borderRadius: '16px',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div style={{ width: '80px', height: '50px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Video size={20} color="rgba(255,255,255,0.3)" />
                            </div>
                            
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{course.name}</h4>
                                    <span style={{ fontSize: '0.65rem', background: (course.type || 'free') === 'free' ? 'rgba(16,185,129,0.1)' : 'rgba(234,179,8,0.1)', color: (course.type || 'free') === 'free' ? '#10b981' : '#fbbf24', padding: '2px 8px', borderRadius: '99px', fontWeight: 800 }}>
                                        {(course.type || 'free').toUpperCase()}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span>{course.duration}</span>
                                    <span>•</span>
                                    <span>{course.type === 'paid' ? `₹${course.price}` : 'Free'}</span>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setEditingCourse(course)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}><Edit size={16} /></button>
                                <button onClick={() => handleDelete(course.id)} style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(isAdding || editingCourse) && (
                <CourseFormModal 
                    course={editingCourse} 
                    onClose={() => { setIsAdding(false); setEditingCourse(null); }}
                    onSave={(data) => {
                        if (editingCourse) updateMutation.mutate({ ...data, id: editingCourse.id });
                        else createMutation.mutate(data);
                    }}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                />
            )}
        </div>
    );
}

function CourseFormModal({ course, onClose, onSave, isLoading }) {
    const [formData, setFormData] = useState(course || {
        name: '',
        duration: '',
        description: '',
        type: 'free',
        price: '',
        playlistLink: '',
        prerequisite: '',
        materials: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ display: 'block', height: 'auto', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0 }}>{course ? 'Edit Course' : 'Create New Course'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                <div className="admin-course-form" style={{ margin: 0, maxWidth: '100%', background: 'transparent', border: 'none', padding: 0 }}>
                    <div className="admin-input-group">
                        <label>Course Name</label>
                        <input className="admin-input" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Master React in 30 Days" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="admin-input-group">
                            <label>Duration</label>
                            <input className="admin-input" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 12 Hours" />
                        </div>
                        <div className="admin-input-group">
                            <label>Type</label>
                            <select className="admin-input" name="type" value={formData.type} onChange={handleChange}>
                                <option value="free">Free</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                    </div>

                    {formData.type === 'paid' && (
                        <div className="admin-input-group">
                            <label>Price (₹)</label>
                            <input type="number" className="admin-input" name="price" value={formData.price} onChange={handleChange} placeholder="e.g. 499" />
                        </div>
                    )}

                    <div className="admin-input-group">
                        <label>Description</label>
                        <textarea className="admin-input" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Course overview..." />
                    </div>

                    <div className="admin-input-group">
                        <label>YouTube Playlist Link / ID</label>
                        <input className="admin-input" name="playlistLink" value={formData.playlistLink} onChange={handleChange} placeholder="Playlist URL" />
                    </div>

                    <div className="admin-input-group">
                        <label>Prerequisites</label>
                        <input className="admin-input" name="prerequisite" value={formData.prerequisite} onChange={handleChange} placeholder="e.g. Basic JS Knowledge" />
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button onClick={onClose} style={{ padding: '12px 24px', borderRadius: '12px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                        <button 
                            className="details-btn" 
                            onClick={() => onSave(formData)} 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : <><Save size={18} style={{ marginRight: '8px' }} /> {course ? 'Update Course' : 'Create Course'}</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
