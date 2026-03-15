import React, { useState, useEffect } from 'react';
import { Settings, Save, Bell, Shield, Globe, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

export default function AdminConfig() {
    const { currentUser } = useAuth();
    
    // Config state
    const [config, setConfig] = useState({
        maintenanceMode: false,
        openRegistration: true,
        requireEmailVerification: false,
        maxUploadSize: 10,
        supportEmail: 'support@whizan.xyz',
        appName: 'Whizan - AI Interview Prep',
        stripeTestMode: true,
        aiModel: 'gpt-4o'
    });
    
    const [saving, setSaving] = useState(false);

    // Fetch real config
    const { data: remoteConfig, isLoading } = useQuery({
        queryKey: ['admin-config'],
        queryFn: async () => {
            if (!currentUser) return null;
            const token = await currentUser.getIdToken();
            const res = await fetch(`${VITE_API_BASE_URL}/api/admin/config`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch config");
            return res.json();
        },
        enabled: !!currentUser
    });

    // Populate local form state when fetched
    useEffect(() => {
        if (remoteConfig) {
            setConfig(remoteConfig);
        }
    }, [remoteConfig]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await currentUser.getIdToken();
            const res = await fetch(`${VITE_API_BASE_URL}/api/admin/config`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(config)
            });
            if (!res.ok) throw new Error("Failed to save config");
            alert("Settings saved successfully.");
        } catch (e) {
            console.error(e);
            alert("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const ToggleRow = ({ name, label, description }) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--txt3)' }}>{description}</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                <input type="checkbox" name={name} checked={config[name]} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: config[name] ? '#3b82f6' : 'rgba(255,255,255,0.1)', transition: '.4s', borderRadius: '34px' }}>
                    <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: config[name] ? '23px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }} />
                </span>
            </label>
        </div>
    );

    const InputRow = ({ name, label, type = "text", width = "100%" }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--txt2)' }}>{label}</label>
            <input 
                type={type} 
                name={name} 
                value={config[name]} 
                onChange={handleChange}
                style={{ width, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} 
            />
        </div>
    );

    const SelectRow = ({ name, label, options, width = "100%" }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--txt2)' }}>{label}</label>
            <select 
                name={name} 
                value={config[name]} 
                onChange={handleChange}
                style={{ width, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none', appearance: 'none' }} 
            >
                {options.map(opt => <option key={opt} value={opt} style={{ background: '#1a1b26' }}>{opt}</option>)}
            </select>
        </div>
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' }}>System Configuration</h1>
                    <p style={{ color: 'var(--txt2)', margin: 0 }}>Manage global platform settings and feature flags.</p>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    style={{ background: '#3b82f6', border: 'none', padding: '10px 20px', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s', opacity: saving ? 0.7 : 1 }}
                >
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* General Settings */}
                <div style={{ background: 'rgba(20, 22, 30, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                        <Globe size={18} color="#0ea5e9" /> General Settings
                    </h3>
                    <InputRow name="appName" label="Application Name" />
                    <InputRow name="supportEmail" label="Support Email Contact" type="email" />
                    <InputRow name="maxUploadSize" label="Max Upload Size (MB)" type="number" width="120px" />
                </div>

                {/* Security & Access */}
                <div style={{ background: 'rgba(20, 22, 30, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                        <Shield size={18} color="#a855f7" /> Security & Access
                    </h3>
                    <ToggleRow name="maintenanceMode" label="Maintenance Mode" description="Disable access to non-admin users." />
                    <ToggleRow name="openRegistration" label="Open Registration" description="Allow new users to sign up." />
                    <ToggleRow name="requireEmailVerification" label="Require Email Verification" description="Force users to verify email before accessing dashboard." />
                </div>

                {/* Integrations */}
                <div style={{ background: 'rgba(20, 22, 30, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', gridColumn: '1 / -1' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                        <Settings size={18} color="#10b981" /> Services & Integrations
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <ToggleRow name="stripeTestMode" label="Payment Test Mode" description="Use mock payments for Subscriptions" />
                            <SelectRow name="aiModel" label="Primary AI Model" options={['gpt-4o', 'gpt-4o-mini', 'claude-3.5-sonnet', 'gemini-1.5-pro']} />
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--txt2)', marginBottom: '8px' }}><Bell size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Webhook Endpoints</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--txt3)', marginBottom: '16px' }}>Manage endpoints that receive system events.</div>
                            <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 12px', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>Manage Webhooks</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
