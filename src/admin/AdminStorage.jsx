import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInfiniteQuery } from '@tanstack/react-query';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload as S3Upload } from "@aws-sdk/lib-storage";
import { HardDrive, Loader2, Trash2, ShieldAlert, File, ExternalLink, RefreshCw, Upload, Search, ArrowUpDown, FolderOpen } from 'lucide-react';

// Using the same credentials from src/lib/s3.js
const ACCESS_ID = "b6aae57565cde6c3aa4574fca0f871f2";
const ACCESS_KEY = "6136a2c5906ac98f8e89eb175c837423b0f5cddd0ea95a6eea757c921e44a836";
const ENDPOINT = "https://vnnkhcqswoeqnghztpvh.storage.supabase.co/storage/v1/s3";
const REGION = "us-east-1";
const BUCKETS = ["images", "chat-files"];
const SUPABASE_PROJECT_URL = "https://vnnkhcqswoeqnghztpvh.supabase.co"; 

const s3Client = new S3Client({
  forcePathStyle: true,
  region: REGION,
  endpoint: ENDPOINT,
  credentials: { accessKeyId: ACCESS_ID, secretAccessKey: ACCESS_KEY },
});

export default function AdminStorage() {
    const { currentUser } = useAuth();
    const [deleting, setDeleting] = useState(null);
    const [bucket, setBucket] = useState("images");
    const [queryText, setQueryText] = useState("");
    const [prefix, setPrefix] = useState("");
    const [sortKey, setSortKey] = useState("lastModified");
    const [sortDir, setSortDir] = useState("desc");
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } = useInfiniteQuery({
        queryKey: ['admin-storage-objects', bucket, prefix],
        queryFn: async ({ pageParam = null }) => {
            const command = new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix || undefined, ContinuationToken: pageParam || undefined });
            return await s3Client.send(command);
        },
        getNextPageParam: (lastPage) => lastPage.NextContinuationToken || undefined,
        enabled: !!currentUser,
        retry: false
    });

    const objects = data ? data.pages.flatMap(p => p.Contents || []) : [];

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const isImage = (key) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(key);

    const getPublicUrl = (key) => `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${bucket}/${key}`;

    const handleUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        setUploadProgress(0);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const safeName = (file.name || 'file').replace(/[^\w.\- ]+/g, '').trim().slice(0, 120) || 'file';
            const key = `${bucket === 'chat-files' ? 'chats' : 'uploads'}/${Date.now()}_${safeName}`;
            
            const upload = new S3Upload({
                client: s3Client,
                params: {
                    Bucket: bucket,
                    Key: key,
                    Body: uint8Array,
                    ContentType: file.type || 'application/octet-stream',
                },
            });

            upload.on("httpUploadProgress", (progress) => {
                if (progress.total) {
                    setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
                }
            });

            await upload.done();
            await refetch();
        } catch (err) {
            console.error(err);
            alert("Failed to upload: " + err.message);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (key) => {
        if (!window.confirm(`Are you sure you want to permanently delete this file?\n${key}`)) return;
        setDeleting(key);
        try {
            const command = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key });
            await s3Client.send(command);
            refetch();
        } catch (err) {
            console.error(err);
            alert("Failed to delete object from S3: " + err.message);
        } finally {
            setDeleting(null);
        }
    };

    const filtered = useMemo(() => {
        const q = queryText.trim().toLowerCase();
        let items = objects;
        if (q) items = items.filter(o => (o.Key || '').toLowerCase().includes(q));

        const sorted = [...items].sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            if (sortKey === 'name') return (String(a.Key).localeCompare(String(b.Key))) * dir;
            if (sortKey === 'size') return ((a.Size || 0) - (b.Size || 0)) * dir;
            return ((new Date(a.LastModified || 0).getTime()) - (new Date(b.LastModified || 0).getTime())) * dir;
        });
        return sorted;
    }, [objects, queryText, sortKey, sortDir]);

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' }}>Storage & Media</h1>
                    <p style={{ color: 'var(--txt2)', margin: 0 }}>Manage files uploaded to Supabase S3.</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <label style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
                        <Upload size={16} />
                        {uploading ? `Uploading ${uploadProgress}%` : 'Upload'}
                        <input type="file" style={{ display: 'none' }} disabled={uploading} onChange={(e) => handleUpload(e.target.files?.[0])} />
                    </label>
                    <button 
                        onClick={() => refetch()} 
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}
                    >
                        <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FolderOpen size={16} color="var(--txt3)" />
                    <select value={bucket} onChange={(e) => setBucket(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontWeight: 700 }}>
                        {BUCKETS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Search size={16} color="var(--txt3)" />
                    <input value={queryText} onChange={e => setQueryText(e.target.value)} placeholder="Search by key…" style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ArrowUpDown size={16} color="var(--txt3)" />
                    <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontWeight: 700 }}>
                        <option value="lastModified">lastModified</option>
                        <option value="name">name</option>
                        <option value="size">size</option>
                    </select>
                    <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontWeight: 700 }}>
                        <option value="desc">desc</option>
                        <option value="asc">asc</option>
                    </select>
                </div>
            </div>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', color: '#fca5a5', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}><ShieldAlert size={18} /> S3 Connection Error</div>
                    <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>{error.message}</div>
                </div>
            )}

            <div style={{ background: 'rgba(20, 22, 30, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HardDrive size={18} color="#0ea5e9" />
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Bucket: <span style={{ color: '#bae6fd' }}>{bucket}</span></span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--txt3)' }}>{filtered.length} items</span>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--txt3)', fontWeight: 600 }}>Preview</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--txt3)', fontWeight: 600 }}>File Key</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--txt3)', fontWeight: 600 }}>Last Modified</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--txt3)', fontWeight: 600 }}>Size</th>
                            <th style={{ padding: '16px', textAlign: 'right', color: 'var(--txt3)', fontWeight: 600 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: '#3b82f6' }} /></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--txt3)' }}>No objects found in this bucket.</td></tr>
                        ) : (
                            filtered.map(obj => (
                                <tr key={obj.Key} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td style={{ padding: '16px', width: '60px' }}>
                                        {isImage(obj.Key) ? (
                                            <a href={getPublicUrl(obj.Key)} target="_blank" rel="noreferrer">
                                                <img src={getPublicUrl(obj.Key)} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }} />
                                            </a>
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <File size={20} color="var(--txt3)" />
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--txt2)', fontFamily: 'monospace' }}>
                                        {obj.Key}
                                        <a href={getPublicUrl(obj.Key)} target="_blank" rel="noreferrer" style={{ marginLeft: '8px', color: '#60a5fa', display: 'inline-block' }}>
                                            <ExternalLink size={12} />
                                        </a>
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--txt3)' }}>{new Date(obj.LastModified).toLocaleString()}</td>
                                    <td style={{ padding: '16px', color: 'var(--txt3)' }}>{formatBytes(obj.Size)}</td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                            <a href={getPublicUrl(obj.Key)} target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '8px', padding: '6px 12px', color: '#fff', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                                                Download
                                            </a>
                                            <button 
                                                onClick={() => handleDelete(obj.Key)}
                                                disabled={deleting === obj.Key}
                                                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '6px 12px', color: '#ef4444', fontSize: '0.75rem', cursor: deleting === obj.Key ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', opacity: deleting === obj.Key ? 0.6 : 1 }}
                                            >
                                                {deleting === obj.Key ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14} />} Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {hasNextPage && (
                    <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <button 
                            onClick={() => fetchNextPage()} 
                            disabled={isFetchingNextPage}
                            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', padding: '8px 16px', borderRadius: '8px', color: '#60a5fa', cursor: isFetchingNextPage ? 'wait' : 'pointer' }}
                        >
                            {isFetchingNextPage ? 'Loading...' : 'Load More Files'}
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}
