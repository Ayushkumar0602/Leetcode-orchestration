import React, { useState, useEffect } from 'react';
import { Upload, Trash2, FileText, Image as ImageIcon, File, Loader2, X, AlertCircle, PlayCircle, FolderArchive } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile } from '../lib/s3';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

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

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getFileIcon = (type) => {
    if (!type) return <File size={20} color="#64748b" />;
    if (type.startsWith('image/')) return <ImageIcon size={20} color="#3b82f6" />;
    if (type.startsWith('video/')) return <PlayCircle size={20} color="#f59e0b" />;
    if (type.includes('pdf')) return <FileText size={20} color="#ef4444" />;
    if (type.includes('zip') || type.includes('compressed')) return <FolderArchive size={20} color="#8b5cf6" />;
    return <File size={20} color="#64748b" />;
};

export default function AdminCourseMaterials({ course, onClose }) {
    const { currentUser } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    const [uploadCategory, setUploadCategory] = useState('Resource');

    useEffect(() => {
        fetchMaterials();
    }, [course.id]);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const res = await adminFetch(currentUser, `${VITE_API_BASE_URL}/api/admin/courses/${course.id}/materials`);
            setMaterials(res.materials || []);
        } catch (e) {
            setErrorMsg('Failed to load materials: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setErrorMsg('');
        try {
            // Upload to Supabase bucket 'course_material'
            const result = await uploadFile(file, 'course_material');
            if (!result.success) throw new Error(result.error);

            // Save metadata to database
            const payload = {
                name: file.name,
                category: uploadCategory,
                size: file.size,
                type: file.type,
                url: result.url
            };

            await adminFetch(currentUser, `${VITE_API_BASE_URL}/api/admin/courses/${course.id}/materials`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // Refresh materials
            fetchMaterials();
        } catch (err) {
            setErrorMsg('Upload error: ' + err.message);
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDelete = async (materialId) => {
        if (!window.confirm("Delete this material?")) return;
        try {
            await adminFetch(currentUser, `${VITE_API_BASE_URL}/api/admin/courses/${course.id}/materials/${materialId}`, {
                method: 'DELETE'
            });
            fetchMaterials();
        } catch (err) {
            setErrorMsg('Delete error: ' + err.message);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#0a0a0f', width: '100%', maxWidth: '850px', maxHeight: '90vh', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
                {/* Header */}
                <div style={{ padding: '20px 25px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                        <h2 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>Course Materials</h2>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--txt2)' }}>Manage files for: <strong style={{ color: '#fff' }}>{course.title}</strong></p>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '25px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {errorMsg && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px 15px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <AlertCircle size={18} /> {errorMsg}
                        </div>
                    )}

                    {/* Uploader Section */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '16px', padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <select 
                                value={uploadCategory} 
                                onChange={e => setUploadCategory(e.target.value)}
                                style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                            >
                                <option value="Resource">Resource</option>
                                <option value="Note">Lecture Note</option>
                                <option value="Assignment">Assignment</option>
                                <option value="Video">Video Material</option>
                                <option value="Dataset">Dataset / ZIP</option>
                            </select>

                            <input type="file" onChange={handleFileUpload} disabled={uploading} id="materialUpload" style={{ display: 'none' }} />
                            <label htmlFor="materialUpload" style={{ 
                                background: uploading ? 'rgba(59,130,246,0.5)' : '#3b82f6', color: '#fff',
                                padding: '10px 20px', borderRadius: '8px', cursor: uploading ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem',
                                transition: 'background 0.2s'
                            }}>
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                {uploading ? 'Uploading...' : 'Select File'}
                            </label>
                        </div>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Uploads to `course_material` bucket (PDF, ZIP, Images, MP4, etc)</p>
                    </div>

                    {/* Files List */}
                    <div>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>Uploaded Materials ({materials.length})</h3>
                        
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                                <Loader2 className="animate-spin" size={30} color="#666" />
                            </div>
                        ) : materials.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', color: '#555' }}>
                                <FileText size={40} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                                <p style={{ margin: 0 }}>No materials uploaded yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '15px' }}>
                                {materials.map(mat => (
                                    <div key={mat.id} style={{
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '12px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px',
                                        transition: 'background 0.2s'
                                    }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {getFileIcon(mat.type)}
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <a href={mat.url} target="_blank" rel="noreferrer" style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#fff', fontWeight: 600, textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {mat.name}
                                            </a>
                                            <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: '#888' }}>
                                                <span>{mat.category}</span>
                                                <span>•</span>
                                                <span>{formatBytes(mat.size)}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(mat.id)}
                                            style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.2)'} onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                                            title="Delete file"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
