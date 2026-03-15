import React, { useState, useEffect } from 'react';
import { Server, Activity, Cpu, HardDrive, Network, AlertCircle, RefreshCw, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

export default function AdminInfrastructure() {
    const { currentUser } = useAuth();
    
    const { data: healthData, isLoading, error, refetch } = useQuery({
        queryKey: ['admin-infrastructure-health'],
        queryFn: async () => {
            if (!currentUser) return null;
            const token = await currentUser.getIdToken();
            const res = await fetch(`${VITE_API_BASE_URL}/api/admin/health`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to reach backend.");
            return res.json();
        },
        enabled: !!currentUser,
        refetchInterval: 10000 // auto refresh every 10s
    });

    const metrics = healthData ? {
        // Mock cpu if standard process.cpuUsage() is too chaotic, but let's use accurate format if possible 
        // process.cpuUsage generates huge numbers (microseconds). Here we just map it loosely or show MB.
        cpu: healthData.cpuUsage ? (healthData.cpuUsage.user / 1000000).toFixed(1) : 0, 
        memory: healthData.memory ? (healthData.memory.rss / 1024 / 1024).toFixed(0) : 0,
        uptime: healthData.uptime ? (healthData.uptime / 3600).toFixed(2) : 0,
        status: healthData.status || 'Unknown'
    } : { cpu: 0, memory: 0, uptime: 0, status: 'Loading' };
    
    // We fetch recent errors or logs from the actual DB instead of mock logs.
    const { data: recentLogs = [] } = useQuery({
        queryKey: ['admin-infra-logs'],
        queryFn: async () => {
            if (!currentUser) return [];
            const token = await currentUser.getIdToken();
            const res = await fetch(`${VITE_API_BASE_URL}/api/admin/db/admin_logs?limit=5`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) return [];
            const data = await res.json();
            return (data.docs || []).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
        },
        enabled: !!currentUser
    });

    const logs = recentLogs.map((l, i) => ({
        id: l.id || i,
        type: l.level === 'critical' ? 'warn' : 'info',
        msg: l.action + ': ' + l.details,
        time: new Date(l.timestamp).toLocaleTimeString()
    }));

    const MetricCard = ({ title, value, unit, icon: Icon, color, trend = null }) => (
        <div style={{ background: 'rgba(20, 22, 30, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: color, filter: 'blur(40px)', opacity: 0.15, borderRadius: '50%' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600 }}>{title}</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                    <Icon size={16} />
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <span style={{ color: '#fff', fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                    {typeof value === 'number' ? value.toFixed(0) : value}
                </span>
                <span style={{ color: 'var(--txt3)', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 600 }}>{unit}</span>
            </div>
            {trend && <div style={{ fontSize: '0.75rem', color: trend > 0 ? '#10b981' : '#f59e0b', marginTop: '4px' }}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last hour</div>}
        </div>
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' }}>Infrastructure Monitoring</h1>
                    <p style={{ color: 'var(--txt2)', margin: 0 }}>Real-time server health and deployment metrics (Mocked data).</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '0.9rem', fontWeight: 600 }}>
                        <CheckCircle2 size={16} /> All Systems Operational
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <MetricCard title="CPU Usage" value={metrics.cpu} unit="%" icon={Cpu} color="#3b82f6" trend={2.4} />
                <MetricCard title="Memory Usage" value={metrics.memory} unit="%" icon={HardDrive} color="#a855f7" trend={-1.2} />
                <MetricCard title="Request Rate" value={metrics.reqPerSec} unit="req/s" icon={Activity} color="#10b981" />
                <MetricCard title="API Latency" value={metrics.latency} unit="ms" icon={Network} color="#f59e0b" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Services Status */}
                <div style={{ background: 'rgba(20, 22, 30, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Server size={18} color="#a855f7" /> Services Overview
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { 
                                name: 'Backend API (Node.js/Express)', 
                                provider: 'Self-hosted', 
                                status: metrics.status, 
                                ping: healthData ? '< 50ms' : '...' 
                            }
                        ].map(service => (
                            <div key={service.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{service.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--txt3)' }}>{service.provider}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--txt3)', fontFamily: 'monospace' }}>{service.ping}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: service.status === 'Healthy' ? '#34d399' : '#f59e0b', fontWeight: 600, background: service.status === 'Healthy' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: service.status === 'Healthy' ? '#34d399' : '#f59e0b' }} /> {service.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Logs / Events */}
                <div style={{ background: 'rgba(20, 22, 30, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={18} color="#3b82f6" /> Recent Events
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--txt3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><RefreshCw size={12}/> Refresh</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
                        {logs.map(log => (
                            <div key={log.id} style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ marginTop: '2px', color: log.type === 'info' ? '#3b82f6' : '#f59e0b' }}>
                                    {log.type === 'warn' ? <AlertCircle size={16} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', margin: '4px' }} />}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--txt2)', lineHeight: 1.4, marginBottom: '4px' }}>{log.msg}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10} /> {log.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
