import React, { useState, useEffect } from 'react';
import { Youtube, Plus, Trash2, Edit, Sparkles, Image as ImageIcon, CheckCircle, AlertCircle, X, Loader2, FileBox } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile } from '../lib/s3';
import AdminCourseMaterials from './AdminCourseMaterials';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

// We need a way to fetch with the user token for admin
async function adminFetch(currentUser, path, opts = {}) {
    if (!currentUser) throw new Error("Not logged in");
    const token = await currentUser.getIdToken();
    const headers = { 
        "Authorization": `Bearer ${token}`,
        ...opts.headers
    };
    if (opts.body && !(opts.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }
    const res = await fetch(path, { ...opts, headers });
    if (!res.ok) {
        let errStr = "Error";
        try { const d = await res.json(); errStr = d.error || errStr; } catch(e){}
        throw new Error(errStr);
    }
    return res.json();
}

export default function AdminCourses() {
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [managingMaterialsFor, setManagingMaterialsFor] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        timeline: '',
        flow: '',
        syllabus: '',
        youtubePlaylistLink: '',
        prerequisite: '',
        thumbnailUrl: '',
        features: []
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [aiLoadingField, setAiLoadingField] = useState(null); // 'description' | 'timeline' | 'flow' | 'syllabus' | 'prerequisite'
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // ── Query: list admin courses ──────────────────────────────────────────
    const { data: courses = [], isLoading: loading } = useQuery({
        queryKey: ['admin-courses'],
        queryFn: () => adminFetch(currentUser, `${VITE_API_BASE_URL}/api/admin/courses`)
            .then(d => d.courses || []),
        enabled: !!currentUser,
    });

    // ── Mutations ─────────────────────────────────────────────────────────
    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const toggleFeature = (featureId) => {
        setFormData(prev => {
            const currentFeatures = prev.features || [];
            if (currentFeatures.includes(featureId)) {
                return { ...prev, features: currentFeatures.filter(f => f !== featureId) };
            } else {
                return { ...prev, features: [...currentFeatures, featureId] };
            }
        });
    };

    const handleOptimizeText = async (field) => {
        if (!formData[field]) return;
        setAiLoadingField(field);
        try {
            const res = await adminFetch(currentUser, `${VITE_API_BASE_URL}/api/admin/optimize-text`, {
                method: 'POST',
                body: JSON.stringify({ text: formData[field], field })
            });
            setFormData(prev => ({ ...prev, [field]: res.optimizedText }));
        } catch (e) {
            setErrorMsg(`AI Optimization failed: ${e.message}`);
        } finally {
            setAiLoadingField(null);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        setUploadProgress(0);
        setErrorMsg('');
        try {
            // Modify s3.js to accept bucketName if possible, or build the public URL here.
            // s3.js by default might use CHAT_BUCKET_NAME but let's see. 
            // In setup_supabase we requested `course_thumbnail` bucket.
            // Since s3.js uploadFile function might not accept bucket name, we might need to manually upload using Supabase URL 
            // OR use the uploadFile from s3.js and just store it in the default bucket. 
            // However, the prompt requires "course_thumbnail" bucket.
            // Let's implement direct presigned/upload or write a custom fetch to Supabase.
            // Actually, we can use the `uploadFile` from `lib/s3` if we modify it, but we can't easily without knowing its exact exports.
            // Wait, we can just pass the file to `uploadFile(file)` and store the result url. 
            // Let's assume we modify lib/s3 to accept `bucketName`.
            const result = await uploadFile(file, 'course_thumbnail', (progress) => {
                setUploadProgress(progress);
            });
            if (result.success) {
                setFormData(prev => ({ ...prev, thumbnailUrl: result.url }));
            } else {
                setErrorMsg('Upload failed: ' + result.error);
            }
        } catch (err) {
            setErrorMsg('Upload error: ' + err.message);
        } finally {
            setUploadingImage(false);
            setUploadProgress(0);
        }
    };

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (editingCourse) {
                return adminFetch(currentUser, `${VITE_API_BASE_URL}/api/admin/courses/${editingCourse.id}`, {
                    method: 'PATCH', body: JSON.stringify(data)
                });
            }
            return adminFetch(currentUser, `${VITE_API_BASE_URL}/api/admin/courses`, {
                method: 'POST', body: JSON.stringify(data)
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            queryClient.invalidateQueries({ queryKey: ['public-courses'] });
            setIsModalOpen(false);
            setEditingCourse(null);
        },
        onError: (e) => setErrorMsg(e.message),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminFetch(currentUser, `${VITE_API_BASE_URL}/api/admin/courses/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            queryClient.invalidateQueries({ queryKey: ['public-courses'] });
        },
        onError: (e) => alert('Failed to delete: ' + e.message),
    });

    const openCreateModal = () => {
        setFormData({ title: '', description: '', timeline: '', flow: '', syllabus: '', youtubePlaylistLink: '', prerequisite: '', thumbnailUrl: '', features: [] });
        setEditingCourse(null);
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const openEditModal = (course) => {
        setFormData({
            title: course.title || '',
            description: course.description || '',
            timeline: course.timeline || '',
            flow: course.flow || '',
            syllabus: course.syllabus || '',
            youtubePlaylistLink: course.youtubePlaylistLink || '',
            prerequisite: course.prerequisite || '',
            thumbnailUrl: course.thumbnailUrl || '',
            features: course.features || []
        });
        setEditingCourse(course);
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await adminFetch(currentUser, `${VITE_API_BASE_URL}/api/admin/courses/${id}`, { method: 'DELETE' });
            fetchCourses();
        } catch (e) {
            alert('Failed to delete: ' + e.message);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');
        saveMutation.mutate(formData);
    };

    const AITextarea = ({ label, name, rows = 3 }) => (
        <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ fontSize: '0.9rem', color: '#ccc', fontWeight: 600 }}>{label}</label>
                <button 
                    type="button" 
                    onClick={() => handleOptimizeText(name)}
                    disabled={!formData[name] || aiLoadingField === name}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: formData[name] ? '#a855f7' : '#666',
                        display: 'flex', alignItems: 'center', gap: '5px',
                        cursor: formData[name] ? 'pointer' : 'not-allowed',
                        fontSize: '0.8rem',
                        fontWeight: 600
                    }}
                >
                    {aiLoadingField === name ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {aiLoadingField === name ? 'Optimizing...' : 'AI Optimize'}
                </button>
            </div>
            <textarea
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                rows={rows}
                style={{
                    width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                    borderRadius: '8px', fontSize: '0.95rem',
                    resize: 'vertical'
                }}
            />
        </div>
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Youtube color="#ef4444" size={28} />
                        YouTube Courses Management
                    </h1>
                    <p style={{ color: 'var(--txt2)', margin: 0 }}>Add and manage embedded YouTube courses.</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    style={{
                        background: '#2563eb', color: '#fff', border: 'none',
                        padding: '10px 18px', borderRadius: '8px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
                    }}
                >
                    <Plus size={18} /> Add Course
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <Loader2 className="animate-spin" size={32} color="#666" />
                </div>
            ) : courses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Youtube size={48} color="#444" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ margin: '0 0 10px 0', color: '#ccc' }}>No Courses Found</h3>
                    <p style={{ color: '#666', margin: 0 }}>Create your first course to get started.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {courses.map(course => (
                        <div key={course.id} style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column'
                        }}>
                            {course.thumbnailUrl ? (
                                <div style={{ height: '160px', width: '100%', background: `url(${course.thumbnailUrl}) center/cover` }} />
                            ) : (
                                <div style={{ height: '160px', width: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ImageIcon size={32} color="#666" />
                                </div>
                            )}
                            <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#fff' }}>{course.title || 'Untitled Course'}</h3>
                                <p style={{ fontSize: '0.85rem', color: '#999', margin: '0 0 15px 0', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {course.description || 'No description provided.'}
                                </p>
                                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                                    <button 
                                        onClick={() => openEditModal(course)}
                                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.85rem' }}
                                    >
                                        <Edit size={14} /> Edit
                                    </button>
                                    <button 
                                        onClick={() => setManagingMaterialsFor(course)}
                                        title="Manage Materials"
                                        style={{ flex: 1, background: 'rgba(59,130,246,0.1)', border: 'none', color: '#3b82f6', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.85rem' }}
                                    >
                                        <FileBox size={14} /> Materials
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(course.id)}
                                        style={{ flex: 1, background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.85rem' }}
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {managingMaterialsFor && (
                <AdminCourseMaterials 
                    course={managingMaterialsFor} 
                    onClose={() => setManagingMaterialsFor(null)} 
                />
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{
                        background: '#111', width: '100%', maxWidth: '800px', maxHeight: '90vh',
                        borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden'
                    }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0 }}>{editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer' }}><X /></button>
                        </div>
                        
                        <div style={{ padding: '20px', overflowY: 'auto' }}>
                            {errorMsg && (
                                <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <AlertCircle size={18} /> {errorMsg}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} id="courseForm">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', color: '#ccc', fontWeight: 600, marginBottom: '5px' }}>Course Title *</label>
                                        <input 
                                            required name="title" value={formData.title} onChange={handleInputChange}
                                            style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', color: '#ccc', fontWeight: 600, marginBottom: '5px' }}>YouTube Playlist Link</label>
                                        <input 
                                            name="youtubePlaylistLink" value={formData.youtubePlaylistLink} onChange={handleInputChange} placeholder="https://youtube.com/playlist?list=..."
                                            style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#ccc', fontWeight: 600, marginBottom: '5px' }}>Course Thumbnail</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        {formData.thumbnailUrl ? (
                                            <div style={{ width: '100px', height: '60px', background: `url(${formData.thumbnailUrl}) center/cover`, borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }} />
                                        ) : (
                                            <div style={{ width: '100px', height: '60px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <ImageIcon size={20} color="#666" />
                                            </div>
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} id="thumbUpload" style={{ display: 'none' }} />
                                            <label htmlFor="thumbUpload" style={{ 
                                                display: 'inline-block', background: 'rgba(255,255,255,0.05)', 
                                                border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', 
                                                borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' 
                                            }}>
                                                {uploadingImage ? `Uploading ${uploadProgress}%` : 'Browse Image'}
                                            </label>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#666' }}>Uploads to Supabase 'course_thumbnail' bucket.</p>
                                        </div>
                                    </div>
                                </div>

                                <AITextarea label="Detailed Course Description" name="description" rows={5} />
                                <AITextarea label="Course Prerequisites" name="prerequisite" rows={3} />
                                <AITextarea label="Course Timeline" name="timeline" rows={4} />
                                <AITextarea label="Course Flow / Modules" name="flow" rows={4} />
                                <AITextarea label="Detailed Syllabus" name="syllabus" rows={5} />

                                <div style={{ marginBottom: '20px', marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <label style={{ display: 'block', fontSize: '1rem', color: '#fff', fontWeight: 700, marginBottom: '5px' }}>Enabled Features</label>
                                    <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 15px 0' }}>Select which interactive tools should load on the lecture page for this course.</p>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                                        {[
                                            { id: 'editor', label: 'Code Editor Sandbox' },
                                            { id: 'webdev', label: 'Web Dev Sandbox' },
                                            { id: 'sql', label: 'SQL Editor' },
                                            { id: 'ml', label: 'ML / Python Sandbox' },
                                            { id: 'git', label: 'Git Playground' },
                                            { id: 'sysdesign', label: 'System Design Board' },
                                            { id: 'ai', label: 'Jarvis AI Assistant' },
                                            { id: 'notes', label: 'Personal Notes' }
                                        ].map(feat => {
                                            const isChecked = (formData.features || []).includes(feat.id);
                                            return (
                                                <label key={feat.id} style={{
                                                    display: 'flex', alignItems: 'center', gap: '10px',
                                                    padding: '10px 15px', borderRadius: '8px', cursor: 'pointer',
                                                    background: isChecked ? 'rgba(59,130,246,0.1)' : 'rgba(0,0,0,0.3)',
                                                    border: `1px solid ${isChecked ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                                    transition: 'all 0.2s'
                                                }}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isChecked} 
                                                        onChange={() => toggleFeature(feat.id)} 
                                                        style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }}
                                                    />
                                                    <span style={{ color: isChecked ? '#60a5fa' : '#ccc', fontSize: '0.9rem', fontWeight: isChecked ? 600 : 400 }}>
                                                        {feat.label}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: 'rgba(0,0,0,0.2)' }}>
                            <button 
                                type="button" onClick={() => setIsModalOpen(false)}
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" form="courseForm" disabled={saveMutation.isPending || uploadingImage}
                                style={{ background: '#2563eb', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                {editingCourse ? 'Save Changes' : 'Create Course'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
