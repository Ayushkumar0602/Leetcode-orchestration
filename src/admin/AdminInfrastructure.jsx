import React, { useState, useEffect } from 'react';
import { Server, Activity, Cpu, HardDrive, Network, AlertCircle, RefreshCw, CheckCircle2, Clock } from 'lucide-react';

export default function AdminInfrastructure() {
    // Note: Since no real provider API keys (Vercel/Render) were given yet, this view simulates
    // healthy data to show how it should look. It generates realistic-looking fluctuating metrics.
    const [metrics, setMetrics] = useState({
        cpu: 12,
        memory: 45,
        reqPerSec: 124,
        latency: 42,
        uptime: '99.99%'
    });
    
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        // Initial mock logs
        const initialLogs = [
            { id: 1, type: 'info', msg: 'Frontend deployment #2844 successful', time: '10 mins ago' },
            { id: 2, type: 'info', msg: 'Backend Node.js container restarted', time: '1 hour ago' },
            { id: 3, type: 'warn', msg: 'High memory usage threshold warning (85%) on Worker 1', time: '3 hours ago' },
            { id: 4, type: 'info', msg: 'Database backup completed automatically', time: '12 hours ago' },
        ];
        setLogs(initialLogs);

        // Simulate fluctuating metrics every 3 seconds
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() * 10 - 5))),
                memory: Math.max(30, Math.min(90, prev.memory + (Math.random() * 4 - 2))),
                reqPerSec: Math.max(50, Math.min(500, prev.reqPerSec + (Math.random() * 40 - 20))),
                latency: Math.max(15, Math.min(200, prev.latency + (Math.random() * 20 - 10)))
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

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
                            { name: 'Frontend Application (Vite/React)', provider: 'Vercel / Firebase Hosting', status: 'Healthy', ping: '12ms' },
                            { name: 'Backend API (Node.js/Express)', provider: 'Render', status: 'Healthy', ping: '45ms' },
                            { name: 'Primary Database (Firestore)', provider: 'Firebase', status: 'Healthy', ping: '28ms' },
                            { name: 'Realtime Code Sync (RTDB)', provider: 'Firebase', status: 'Healthy', ping: '35ms' },
                            { name: 'Media Storage Bucket', provider: 'Supabase S3', status: 'Healthy', ping: '60ms' }
                        ].map(service => (
                            <div key={service.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{service.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--txt3)' }}>{service.provider}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--txt3)', fontFamily: 'monospace' }}>{service.ping}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#34d399', fontWeight: 600, background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} /> {service.status}
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
