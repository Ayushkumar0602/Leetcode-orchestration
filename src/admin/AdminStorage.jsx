import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { HardDrive, Loader2, Trash2, ShieldAlert, Image as ImageIcon, File, ExternalLink, RefreshCw } from 'lucide-react';

// Using the same credentials from src/lib/s3.js
const ACCESS_ID = "b6aae57565cde6c3aa4574fca0f871f2";
const ACCESS_KEY = "6136a2c5906ac98f8e89eb175c837423b0f5cddd0ea95a6eea757c921e44a836";
const ENDPOINT = "https://vnnkhcqswoeqnghztpvh.storage.supabase.co/storage/v1/s3";
const REGION = "us-east-1";
const BUCKET_NAME = "images";
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

    const fetchObjects = async () => {
        const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
        const response = await s3Client.send(command);
        return response.Contents || [];
    };

    const { data: objects = [], isLoading, error, refetch } = useQuery({
        queryKey: ['admin-storage-objects'],
        queryFn: fetchObjects,
        enabled: !!currentUser,
        retry: false
    });

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const isImage = (key) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(key);

    const getPublicUrl = (key) => `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}/${key}`;

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

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' }}>Storage & Media</h1>
                    <p style={{ color: 'var(--txt2)', margin: 0 }}>Manage files uploaded to Supabase S3.</p>
                </div>
                <button 
                    onClick={() => refetch()} 
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}
                >
                    <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Refresh
                </button>
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
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Bucket: <span style={{ color: '#bae6fd' }}>{BUCKET_NAME}</span></span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--txt3)' }}>{objects.length} items total</span>
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
                        ) : objects.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--txt3)' }}>No objects found in this bucket.</td></tr>
                        ) : (
                            objects.sort((a,b) => b.LastModified - a.LastModified).map(obj => (
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
                                        <button 
                                            onClick={() => handleDelete(obj.Key)}
                                            disabled={deleting === obj.Key}
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '6px 12px', color: '#ef4444', fontSize: '0.75rem', cursor: deleting === obj.Key ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', opacity: deleting === obj.Key ? 0.6 : 1 }}
                                        >
                                            {deleting === obj.Key ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14} />} Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}
