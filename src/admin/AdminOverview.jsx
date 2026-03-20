import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Users, Database, Server, Activity, ArrowUpRight, TrendingUp, Radio, Terminal, Sparkles, DollarSign, Power, Pause, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

export default function AdminOverview() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [actionLoading, setActionLoading] = useState(false);

    const handleQuickAction = async (actionType) => {
        if (!currentUser) return;
        if (!window.confirm(`Are you sure you want to perform: ${actionType}?`)) return;
        setActionLoading(true);
        try {
            const token = await currentUser.getIdToken();
            let url = '';
            let method = 'POST';
            let body = null;

            if (actionType === 'kill-executions') {
                url = `${VITE_API_BASE_URL}/api/admin/executions/kill-all`;
            } else if (actionType === 'toggle-maintenance') {
                url = `${VITE_API_BASE_URL}/api/admin/config`;
                body = JSON.stringify({ maintenanceMode: true }); 
            } else if (actionType === 'pause-ai') {
                url = `${VITE_API_BASE_URL}/api/admin/config`;
                body = JSON.stringify({ aiPaused: true });
            }

            const res = await fetch(url, {
                method,
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    ...(body && { 'Content-Type': 'application/json' })
                },
                body
            });
            
            if (res.ok) alert(`Action ${actionType} successful`);
            else alert('Action failed');
        } catch (err) {
            alert('Action failed: ' + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Fetch stats
    const { data: statsData, isLoading: isLoadingStats } = useQuery({
        queryKey: ['admin-overview-stats'],
        queryFn: async () => {
            if (!currentUser) return null;
            const token = await currentUser.getIdToken();
            const res = await fetch(`${VITE_API_BASE_URL}/api/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return null;
            return res.json();
        },
        enabled: !!currentUser
    });

    const StatCard = ({ title, value, subtitle, icon: Icon, color, linkTo, loading }) => (
        <div 
            onClick={() => navigate(linkTo)}
            style={{ 
                background: 'rgba(20, 22, 30, 0.6)', border: '1px solid rgba(255,255,255,0.08)', 
                borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: color, filter: 'blur(40px)', opacity: 0.15, borderRadius: '50%' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--txt2)', fontSize: '0.9rem', fontWeight: 600 }}>{title}</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                    <Icon size={16} />
                </div>
            </div>
            <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, margin: '4px 0' }}>
                {loading ? '...' : (value ?? '-')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--txt3)' }}>{subtitle}</span>
                <ArrowUpRight size={14} color="var(--txt3)" />
            </div>
        </div>
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' }}>Admin Overview</h1>
                <p style={{ color: 'var(--txt2)', margin: 0 }}>System snapshot and quick metrics.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <StatCard loading={isLoadingStats} title="Active Users" value={statsData?.activeUsers} subtitle="Live Sessions" icon={Radio} color="#ef4444" linkTo="/admin/users" />
                <StatCard loading={isLoadingStats} title="Running Interviews" value={statsData?.runningInterviews} subtitle="In-progress" icon={Activity} color="#f59e0b" linkTo="/admin/users" />
                <StatCard loading={isLoadingStats} title="Execution Load" value={statsData?.execLoad?.jobsPerMin} subtitle={`${statsData?.execLoad?.failedJobs || 0} failed jobs`} icon={Terminal} color="#10b981" linkTo="/admin/infrastructure" />
                <StatCard loading={isLoadingStats} title="AI Usage" value={statsData?.aiUsage?.totalCalls} subtitle={`${statsData?.aiUsage?.avgLatencyMs || 0}ms avg latency`} icon={Sparkles} color="#8b5cf6" linkTo="/admin/infrastructure" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard loading={isLoadingStats} title="Total Revenue" value={`$${statsData?.revenueSnapshot?.estimatedMRR || 0}`} subtitle={`${statsData?.revenueSnapshot?.plansActive || 0} active plans`} icon={DollarSign} color="#ec4899" linkTo="/admin/users" />
                <StatCard loading={isLoadingStats} title="Total Users" value={statsData?.totalUsers} subtitle="All registered accounts" icon={Users} color="#3b82f6" linkTo="/admin/users" />
                <StatCard loading={isLoadingStats} title="Database Status" value={statsData?.dbStatus} subtitle="Firestore Connected" icon={Database} color="#10b981" linkTo="/admin/database" />
                <StatCard loading={isLoadingStats} title="Server Uptime" value={statsData?.serverUptime ? `${(statsData.serverUptime / 3600).toFixed(1)}h` : null} subtitle="Instance Uptime" icon={Server} color="#a855f7" linkTo="/admin/infrastructure" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(20, 22, 30, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {[
                            { title: 'Manage Users', desc: 'Suspend or delete accounts', link: '/admin/users' },
                            { title: 'Database Browser', desc: 'Inspect raw firestore docs', link: '/admin/database' },
                            { title: 'Check Infrastructure', desc: 'View server health', link: '/admin/infrastructure' },
                            { title: 'System Settings', desc: 'Update platform config', link: '/admin/config' }
                        ].map(act => (
                            <div 
                                key={act.title} 
                                onClick={() => navigate(act.link)}
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            >
                                <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>{act.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--txt3)' }}>{act.desc}</div>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ margin: '1.5rem 0 1rem 0', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>Power Tools</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <button onClick={() => handleQuickAction('kill-executions')} disabled={actionLoading} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '12px', color: '#ef4444', fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                            <XCircle size={20} />
                            Kill Active Executions
                        </button>
                        <button onClick={() => handleQuickAction('toggle-maintenance')} disabled={actionLoading} style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px', borderRadius: '12px', color: '#f59e0b', fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                            <Power size={20} />
                            Enable Maintenance
                        </button>
                        <button onClick={() => handleQuickAction('pause-ai')} disabled={actionLoading} style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '12px', borderRadius: '12px', color: '#8b5cf6', fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                            <Pause size={20} />
                            Pause AI Globally
                        </button>
                    </div>
                </div>

                <div style={{ background: 'var(--gradient-card)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <TrendingUp size={48} color="#10b981" style={{ marginBottom: '1rem', opacity: 0.8 }} />
                    <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>Platform Growth</h3>
                    <p style={{ color: 'var(--txt2)', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>User registrations are up 15% compared to last month.</p>
                    <button onClick={() => navigate('/admin/users')} style={{ background: '#3b82f6', border: 'none', padding: '8px 16px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>View Analytics</button>
                </div>
            </div>
        </div>
    );
}
