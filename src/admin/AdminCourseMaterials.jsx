import React, { useState, useEffect } from 'react';
import { Upload, Trash2, FileText, Image as ImageIcon, File, Loader2, X, AlertCircle, PlayCircle, FolderArchive, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile } from '../lib/s3';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';
const COMPRESSION_THRESHOLD_BYTES = 10 * 1024 * 1024; // 10 MB

// ── Client-side Image Compressor (Canvas API, zero dependencies) ──────────────
const compressImageFile = (file, maxDimension = 2400, quality = 0.82) =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            let { width, height } = img;

            // Proportionally scale down if larger than maxDimension
            if (width > maxDimension || height > maxDimension) {
                if (width > height) { height = Math.round(height * maxDimension / width); width = maxDimension; }
                else { width = Math.round(width * maxDimension / height); height = maxDimension; }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const outputType = file.type === 'image/png' ? 'image/webp' : file.type;
            canvas.toBlob(
                blob => {
                    if (!blob) { reject(new Error('Canvas compression failed')); return; }
                    // If compressed blob is somehow bigger, return original
                    const result = blob.size < file.size ? blob : file;
                    const name = file.name.replace(/\.[^.]+$/, '') + (outputType === 'image/webp' ? '.webp' : file.name.match(/\.[^.]+$/)?.[0] || '');
                    resolve(new File([result], name, { type: outputType }));
                },
                outputType,
                quality
            );
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
        img.src = url;
    });

// ── Main compression dispatcher ───────────────────────────────────────────────
const compressFile = async (file) => {
    if (file.size <= COMPRESSION_THRESHOLD_BYTES) return { file, compressed: false };
    const isImage = file.type.startsWith('image/');
    if (isImage) {
        const compressed = await compressImageFile(file);
        return { file: compressed, compressed: true, originalSize: file.size };
    }
    // PDFs, videos, zips — already compressed internally; skip
    return { file, compressed: false, note: 'Format not compressible in browser' };
};

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

const getFileIcon = (type, size = 20) => {
    if (!type) return <File size={size} color="#64748b" />;
    if (type.startsWith('image/')) return <ImageIcon size={size} color="#3b82f6" />;
    if (type.startsWith('video/')) return <PlayCircle size={size} color="#f59e0b" />;
    if (type.includes('pdf')) return <FileText size={size} color="#ef4444" />;
    if (type.includes('zip') || type.includes('compressed')) return <FolderArchive size={size} color="#8b5cf6" />;
    return <File size={size} color="#64748b" />;
};

// ── File Queue Item Component ─────────────────────────────────────────────────
const STATUS_COLOR = { pending: '#64748b', compressing: '#f59e0b', uploading: '#3b82f6', done: '#22c55e', error: '#ef4444' };

const QueueItem = ({ item }) => {
    const color = STATUS_COLOR[item.status] || '#64748b';
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 14px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}33`,
            transition: 'all 0.2s'
        }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', flexShrink: 0 }}>
                {getFileIcon(item.file.type, 18)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.88rem', color: '#e2e8f0', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.file.name}
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#64748b', marginTop: '2px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>{formatBytes(item.originalSize || item.file.size)}</span>
                    {item.compressedSize && item.compressedSize < (item.originalSize || item.file.size) && (
                        <>
                            <span style={{ color: '#22c55e' }}>→ {formatBytes(item.compressedSize)}</span>
                            <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', borderRadius: '4px', padding: '1px 5px', fontWeight: 700 }}>
                                -{Math.round((1 - item.compressedSize / (item.originalSize || item.file.size)) * 100)}%
                            </span>
                        </>
                    )}
                </div>
                {item.status === 'compressing' && (
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#f59e0b' }}>
                        <Zap size={12} /> Compressing…
                    </div>
                )}
                {item.status === 'uploading' && (
                    <div style={{ marginTop: '6px', background: 'rgba(59,130,246,0.15)', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${item.progress}%`, background: '#3b82f6', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                    </div>
                )}
                {item.status === 'error' && (
                    <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '3px' }}>{item.error}</div>
                )}
            </div>
            <div style={{ flexShrink: 0 }}>
                {item.status === 'pending'     && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#64748b' }} />}
                {item.status === 'compressing' && <Zap size={16} color="#f59e0b" />}
                {item.status === 'uploading'   && <Loader2 size={18} color="#3b82f6" className="animate-spin" />}
                {item.status === 'done'        && <CheckCircle2 size={18} color="#22c55e" />}
                {item.status === 'error'       && <XCircle size={18} color="#ef4444" />}
            </div>
        </div>
    );
};

export default function AdminCourseMaterials({ course, onClose }) {
    const { currentUser } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadCategory, setUploadCategory] = useState('Resource');
    const [errorMsg, setErrorMsg] = useState('');

    // Multi-file queue state
    const [queue, setQueue] = useState([]);         // [{ id, file, status, progress, error }]
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => { fetchMaterials(); }, [course.id]);

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

    const handleFilesSelected = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const newItems = files.map(file => ({
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            file,
            status: 'pending',
            progress: 0,
            error: null,
        }));

        setQueue(prev => [...prev, ...newItems]);
        e.target.value = '';
    };

    const updateQueueItem = (id, patch) => {
        setQueue(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
    };

    const uploadAll = async () => {
        const pending = queue.filter(q => q.status === 'pending');
        if (!pending.length) return;

        setIsUploading(true);
        setErrorMsg('');

        // Upload sequentially to avoid hammering the API
        for (const item of pending) {
            try {
                // ── Step 1: Compress if needed ──
                let fileToUpload = item.file;
                const needsCompression = item.file.size > COMPRESSION_THRESHOLD_BYTES && item.file.type.startsWith('image/');

                if (needsCompression) {
                    updateQueueItem(item.id, { status: 'compressing' });
                    try {
                        const { file: compressed, compressed: wasCompressed } = await compressFile(item.file);
                        fileToUpload = compressed;
                        updateQueueItem(item.id, {
                            file: compressed,
                            compressedSize: wasCompressed ? compressed.size : null,
                            originalSize: item.file.size,
                        });
                    } catch (compErr) {
                        // Compression failed gracefully — just upload original
                        console.warn('Compression failed, uploading original:', compErr.message);
                    }
                }

                // ── Step 2: Upload ──
                updateQueueItem(item.id, { status: 'uploading', progress: 0 });
                const result = await uploadFile(fileToUpload, 'course_material', (progress) => {
                    updateQueueItem(item.id, { progress });
                });
                if (!result.success) throw new Error(result.error);

                await adminFetch(currentUser, `${VITE_API_BASE_URL}/api/admin/courses/${course.id}/materials`, {
                    method: 'POST',
                    body: JSON.stringify({
                        name: fileToUpload.name,
                        category: uploadCategory,
                        size: fileToUpload.size,
                        type: fileToUpload.type,
                        url: result.url
                    })
                });

                updateQueueItem(item.id, { status: 'done', progress: 100 });
            } catch (err) {
                updateQueueItem(item.id, { status: 'error', error: err.message });
            }
        }

        setIsUploading(false);
        fetchMaterials();
    };

    const clearDone = () => setQueue(prev => prev.filter(q => q.status !== 'done'));
    const removeFromQueue = (id) => setQueue(prev => prev.filter(q => q.id !== id));

    const pendingCount  = queue.filter(q => q.status === 'pending').length;
    const doneCount     = queue.filter(q => q.status === 'done').length;
    const errorCount    = queue.filter(q => q.status === 'error').length;

    const handleDelete = async (materialId) => {
        if (!window.confirm("Delete this material?")) return;
        try {
            await adminFetch(currentUser, `${VITE_API_BASE_URL}/api/admin/courses/${course.id}/materials/${materialId}`, { method: 'DELETE' });
            fetchMaterials();
        } catch (err) {
            setErrorMsg('Delete error: ' + err.message);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#0a0a0f', width: '100%', maxWidth: '900px', maxHeight: '90vh', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
                {/* Header */}
                <div style={{ padding: '20px 25px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                        <h2 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>Course Materials</h2>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>Manage files for: <strong style={{ color: '#fff' }}>{course.title}</strong></p>
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

                    {/* ── Upload Zone ── */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '16px', padding: '20px 25px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: queue.length > 0 ? '16px' : 0 }}>
                            <select
                                value={uploadCategory}
                                onChange={e => setUploadCategory(e.target.value)}
                                style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                            >
                                <option value="Resource">Resource</option>
                                <option value="Note">Lecture Note</option>
                                <option value="Assignment">Assignment</option>
                                <option value="Video">Video Material</option>
                                <option value="Dataset">Dataset / ZIP</option>
                            </select>

                            {/* Hidden multi-file input */}
                            <input
                                type="file"
                                id="materialUpload"
                                multiple
                                onChange={handleFilesSelected}
                                disabled={isUploading}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="materialUpload" style={{
                                background: 'rgba(99,102,241,0.15)', color: '#818cf8',
                                border: '1px solid rgba(99,102,241,0.3)',
                                padding: '10px 18px', borderRadius: '8px',
                                cursor: isUploading ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s'
                            }}>
                                <Upload size={16} />
                                Add Files
                            </label>

                            {pendingCount > 0 && !isUploading && (
                                <button
                                    onClick={uploadAll}
                                    style={{
                                        background: '#3b82f6', color: '#fff',
                                        border: 'none', padding: '10px 20px',
                                        borderRadius: '8px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        fontWeight: 700, fontSize: '0.9rem', transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
                                >
                                    <Upload size={16} />
                                    Upload {pendingCount} file{pendingCount > 1 ? 's' : ''}
                                </button>
                            )}

                            {isUploading && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontSize: '0.9rem', fontWeight: 600 }}>
                                    <Loader2 size={16} className="animate-spin" /> Uploading…
                                </div>
                            )}

                            {doneCount > 0 && !isUploading && (
                                <button onClick={clearDone} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                    Clear done ({doneCount})
                                </button>
                            )}
                        </div>

                        {/* Queue List */}
                        {queue.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, letterSpacing: '0.05em' }}>
                                        UPLOAD QUEUE — {queue.length} file{queue.length > 1 ? 's' : ''}
                                        {doneCount > 0 && <span style={{ color: '#22c55e' }}> · {doneCount} done</span>}
                                        {errorCount > 0 && <span style={{ color: '#ef4444' }}> · {errorCount} failed</span>}
                                    </span>
                                    <button
                                        onClick={() => setQueue([])}
                                        disabled={isUploading}
                                        style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.8rem', padding: '2px 6px' }}
                                    >
                                        Clear all
                                    </button>
                                </div>
                                {queue.map(item => (
                                    <div key={item.id} style={{ position: 'relative' }}>
                                        <QueueItem item={item} />
                                        {(item.status === 'pending' || item.status === 'error') && !isUploading && (
                                            <button
                                                onClick={() => removeFromQueue(item.id)}
                                                style={{ position: 'absolute', top: '8px', right: '36px', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '4px' }}
                                                title="Remove"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {queue.length === 0 && (
                            <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem', textAlign: 'center', paddingTop: '6px' }}>
                                Click <strong style={{ color: '#818cf8' }}>Add Files</strong> to select one or more files (PDF, ZIP, Images, MP4…)
                            </p>
                        )}
                    </div>

                    {/* ── Uploaded Materials List ── */}
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
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '12px' }}>
                                {materials.map(mat => (
                                    <div key={mat.id} style={{
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '14px',
                                        transition: 'background 0.2s'
                                    }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {getFileIcon(mat.type)}
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <a href={mat.url} target="_blank" rel="noreferrer" style={{ margin: '0 0 4px 0', fontSize: '0.92rem', color: '#fff', fontWeight: 600, textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {mat.name}
                                            </a>
                                            <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: '#64748b' }}>
                                                <span>{mat.category}</span>
                                                <span>·</span>
                                                <span>{formatBytes(mat.size)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(mat.id)}
                                            style={{ background: 'rgba(239,68,68,0.08)', border: 'none', color: '#ef4444', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0 }}
                                            onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.2)'}
                                            onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}
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
