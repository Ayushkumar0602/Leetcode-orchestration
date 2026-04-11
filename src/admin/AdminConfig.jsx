import React, { useState, useEffect } from 'react';
import {
    Settings, Save, Shield, Globe, Bell, Wrench,
    AlertTriangle, CheckCircle2, Clock, BarChart2,
    WifiOff, Zap, RefreshCw, Plus, Trash2, LayoutGrid
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import useMaintenanceMode from '../hooks/useMaintenanceMode';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

// ─── Maintenance Control Panel ───────────────────────────────────────────────
function MaintenancePanel() {
    const { isActive, message: liveMessage, estimatedEnd, progressPercent } = useMaintenanceMode();

    const [form, setForm] = useState({
        maintenanceMode: false,
        maintenanceMessage: '',
        estimatedEndStr: '',   // datetime-local input value (string)
        progressPercent: 65,
    });
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // One-time load current config values into the form
    useEffect(() => {
        const load = async () => {
            const snap = await getDoc(doc(db, 'config', 'app'));
            if (snap.exists()) {
                const d = snap.data();
                const estEnd = d.estimatedEnd?.toDate?.();
                setForm({
                    maintenanceMode: d.maintenanceMode ?? false,
                    maintenanceMessage: d.maintenanceMessage ?? '',
                    estimatedEndStr: estEnd
                        ? new Date(estEnd.getTime() - estEnd.getTimezoneOffset() * 60000)
                            .toISOString()
                            .slice(0, 16)
                        : '',
                    progressPercent: d.progressPercent ?? 65,
                });
            }
            setLoaded(true);
        };
        load();
    }, []);

    // Keep toggle in sync with live Firestore state
    useEffect(() => {
        setForm((prev) => ({ ...prev, maintenanceMode: isActive }));
    }, [isActive]);

    const toggle = async (newValue) => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'config', 'app'), {
                maintenanceMode: newValue,
                updatedAt: serverTimestamp(),
            }, { merge: true });

            toast.success(
                newValue
                    ? '🔧 Maintenance mode ENABLED — site is now locked for users.'
                    : '✅ Maintenance mode DISABLED — site is live again.',
                { duration: 5000 }
            );
        } catch (err) {
            toast.error('Failed to update maintenance mode: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const saveDetails = async () => {
        setSaving(true);
        try {
            const estimatedEnd = form.estimatedEndStr
                ? new Date(form.estimatedEndStr)
                : null;

            await setDoc(doc(db, 'config', 'app'), {
                maintenanceMessage: form.maintenanceMessage || null,
                estimatedEnd: estimatedEnd,
                progressPercent: Number(form.progressPercent),
                updatedAt: serverTimestamp(),
            }, { merge: true });

            toast.success('Maintenance details saved!');
        } catch (err) {
            toast.error('Failed to save: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const isOn = isActive;

    return (
        <div style={{
            background: isOn
                ? 'rgba(239, 68, 68, 0.05)'
                : 'rgba(20, 22, 30, 0.6)',
            border: isOn
                ? '1px solid rgba(239,68,68,0.3)'
                : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
            gridColumn: '1 / -1',
            transition: 'all 0.4s ease',
        }}>
            {/* Header */}
            <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: isOn
                    ? 'rgba(239,68,68,0.08)'
                    : 'rgba(255,255,255,0.02)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        background: isOn ? 'rgba(239,68,68,0.15)' : 'rgba(139,92,246,0.12)',
                        border: `1px solid ${isOn ? 'rgba(239,68,68,0.3)' : 'rgba(139,92,246,0.25)'}`,
                        borderRadius: '10px', padding: '6px',
                    }}>
                        <Wrench size={20} color={isOn ? '#f87171' : '#a78bfa'} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                            Maintenance Mode Control
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#737373' }}>
                            Instantly lock/unlock the site for all users in real-time
                        </div>
                    </div>
                </div>

                {/* Live status badge */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '4px 12px', borderRadius: '99px',
                    background: isOn ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.1)',
                    border: `1px solid ${isOn ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.25)'}`,
                    fontSize: '0.78rem', fontWeight: 700,
                    color: isOn ? '#f87171' : '#34d399',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                    <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: isOn ? '#ef4444' : '#10b981',
                        boxShadow: isOn ? '0 0 6px #ef4444' : '0 0 6px #10b981',
                        display: 'inline-block',
                        animation: 'pulse 2s infinite',
                    }} />
                    {isOn ? 'MAINTENANCE ON' : 'SITE LIVE'}
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Big Toggle */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '12px', padding: '1rem 1.25rem',
                }}>
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                            {isOn ? '🔒 Site is currently locked' : '🌐 Site is currently live'}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#737373' }}>
                            {isOn
                                ? 'Normal users see the maintenance page. Admins can still access /admin.'
                                : 'All users have full access to the platform.'}
                        </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                        onClick={() => toggle(!isOn)}
                        disabled={saving}
                        style={{
                            position: 'relative',
                            width: '64px', height: '34px',
                            borderRadius: '99px',
                            background: isOn
                                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                : 'rgba(255,255,255,0.08)',
                            border: `2px solid ${isOn ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'}`,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            opacity: saving ? 0.6 : 1,
                            padding: 0,
                            flexShrink: 0,
                            boxShadow: isOn ? '0 0 20px rgba(239,68,68,0.3)' : 'none',
                        }}
                    >
                        <span style={{
                            position: 'absolute',
                            top: '50%', transform: 'translateY(-50%)',
                            left: isOn ? 'calc(100% - 28px)' : '4px',
                            width: '24px', height: '24px',
                            borderRadius: '50%',
                            background: '#fff',
                            transition: 'left 0.3s ease',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {saving
                                ? <RefreshCw size={12} color="#666" style={{ animation: 'spin 0.8s linear infinite' }} />
                                : isOn
                                    ? <WifiOff size={12} color="#ef4444" />
                                    : <Zap size={12} color="#10b981" />
                            }
                        </span>
                    </button>
                </div>

                {/* Warning banner when active */}
                {isOn && (
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: '10px', padding: '12px 16px',
                        fontSize: '0.87rem', color: '#fca5a5',
                        animation: 'fadeIn 0.4s ease',
                    }}>
                        <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                            <strong>Maintenance is ACTIVE.</strong> All non-admin users are seeing the maintenance page right now.
                            Turn off the toggle above to restore access immediately.
                        </div>
                    </div>
                )}

                {/* Details grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Message */}
                    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a3a3a3' }}>
                            Custom Maintenance Message
                        </label>
                        <textarea
                            value={form.maintenanceMessage}
                            onChange={(e) => setForm((p) => ({ ...p, maintenanceMessage: e.target.value }))}
                            rows={3}
                            placeholder="We're making some improvements. We'll be back shortly…"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px', padding: '10px 14px',
                                color: '#fff', fontSize: '0.9rem', outline: 'none',
                                resize: 'vertical', fontFamily: "'Inter', sans-serif",
                                lineHeight: 1.6,
                            }}
                        />
                    </div>

                    {/* Estimated End Time */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a3a3a3', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock size={13} /> Estimated End Time
                        </label>
                        <input
                            type="datetime-local"
                            value={form.estimatedEndStr}
                            onChange={(e) => setForm((p) => ({ ...p, estimatedEndStr: e.target.value }))}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px', padding: '10px 14px',
                                color: '#fff', fontSize: '0.9rem', outline: 'none',
                                colorScheme: 'dark',
                            }}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#525252' }}>Shows a live countdown on the maintenance page</span>
                    </div>

                    {/* Progress */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a3a3a3', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <BarChart2 size={13} /> Progress Bar ({form.progressPercent}%)
                        </label>
                        <input
                            type="range"
                            min={0} max={100}
                            value={form.progressPercent}
                            onChange={(e) => setForm((p) => ({ ...p, progressPercent: e.target.value }))}
                            style={{ accentColor: '#8b5cf6', cursor: 'pointer' }}
                        />
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', width: `${form.progressPercent}%`,
                                background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
                                borderRadius: '99px', transition: 'width 0.2s',
                            }} />
                        </div>
                    </div>
                </div>

                {/* Save details button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={saveDetails}
                        disabled={saving}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: '#7c3aed', border: 'none',
                            borderRadius: '10px', padding: '10px 20px',
                            color: '#fff', fontWeight: 600, fontSize: '0.9rem',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.7 : 1,
                            transition: 'all 0.2s',
                            fontFamily: "'Inter', sans-serif",
                        }}
                        onMouseEnter={(e) => !saving && (e.currentTarget.style.background = '#6d28d9')}
                        onMouseLeave={(e) => !saving && (e.currentTarget.style.background = '#7c3aed')}
                    >
                        <Save size={15} />
                        {saving ? 'Saving...' : 'Save Details'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
                @keyframes spin  { to{transform:rotate(360deg)} }
                @keyframes fadeIn{ from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none} }
            `}</style>
        </div>
    );
}

// ─── Per-Page Maintenance Panel ────────────────────────────────────────────────
// All known app routes that can be toggled individually
const KNOWN_ROUTES = [
    { path: '/dashboard',          label: 'Dashboard' },
    { path: '/courses',            label: 'Courses' },
    { path: '/resumeoptimiser',    label: 'Resume Optimiser' },
    { path: '/joblisting',         label: 'Job Listing' },
    { path: '/jobapplier',         label: 'Job Applier' },
    { path: '/sheets',             label: 'DSA Sheets' },
    { path: '/aiinterviewselect',  label: 'AI Interview Select' },
    { path: '/systemdesign',       label: 'System Design' },
    { path: '/chat',               label: 'Chat' },
    { path: '/analytics',          label: 'Analytics' },
    { path: '/recommendation',     label: 'Recommendation' },
    { path: '/blog',               label: 'Blog' },
    { path: '/portfolio',          label: 'Portfolio' },
];

function PageMaintenancePanel() {
    const { pageMaintenance: livePageMaintenance } = useMaintenanceMode();
    // Local state: { [path]: { isActive, message, estimatedEndStr, progressPercent } }
    const [pages, setPages] = useState({});
    const [saving, setSaving] = useState(null); // path being saved
    const [customPath, setCustomPath] = useState('');

    // Sync live Firestore data into local form state (one-way, only on load)
    useEffect(() => {
        if (!livePageMaintenance) return;
        const mapped = {};
        Object.entries(livePageMaintenance).forEach(([path, cfg]) => {
            const estEnd = cfg.estimatedEnd instanceof Date ? cfg.estimatedEnd : null;
            mapped[path] = {
                isActive: cfg.isActive ?? false,
                message: cfg.message ?? '',
                estimatedEndStr: estEnd
                    ? new Date(estEnd.getTime() - estEnd.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                    : '',
                progressPercent: cfg.progressPercent ?? 65,
            };
        });
        setPages(mapped);
    }, [livePageMaintenance]);

    const getPage = (path) => pages[path] || { isActive: false, message: '', estimatedEndStr: '', progressPercent: 65 };

    const updatePage = (path, field, value) => {
        setPages((prev) => ({
            ...prev,
            [path]: { ...getPage(path), [field]: value },
        }));
    };

    const savePage = async (path) => {
        setSaving(path);
        const cfg = getPage(path);
        const estimatedEnd = cfg.estimatedEndStr ? new Date(cfg.estimatedEndStr) : null;
        try {
            // Merge into the pageMaintenance map in Firestore
            await setDoc(doc(db, 'config', 'app'), {
                pageMaintenance: {
                    ...livePageMaintenance,
                    [path]: {
                        isActive: cfg.isActive,
                        message: cfg.message || null,
                        estimatedEnd,
                        progressPercent: Number(cfg.progressPercent),
                        updatedAt: new Date(),
                    },
                },
                updatedAt: serverTimestamp(),
            }, { merge: true });
            toast.success(
                cfg.isActive
                    ? `🔧 ${path} is now under maintenance`
                    : `✅ ${path} maintenance lifted`,
                { duration: 4000 }
            );
        } catch (err) {
            toast.error('Failed: ' + err.message);
        } finally {
            setSaving(null);
        }
    };

    const removePage = async (path) => {
        // Remove the key from pageMaintenance in Firestore
        const updated = { ...livePageMaintenance };
        delete updated[path];
        try {
            await setDoc(doc(db, 'config', 'app'), {
                pageMaintenance: updated,
                updatedAt: serverTimestamp(),
            }, { merge: true });
            setPages((prev) => { const n = { ...prev }; delete n[path]; return n; });
            toast.success(`Removed maintenance config for ${path}`);
        } catch (err) {
            toast.error('Failed: ' + err.message);
        }
    };

    const addCustomRoute = () => {
        const p = customPath.trim();
        if (!p.startsWith('/')) { toast.error('Path must start with /'); return; }
        setPages((prev) => ({ ...prev, [p]: getPage(p) }));
        setCustomPath('');
    };

    // All paths to show: known routes + any custom ones from Firestore + local additions
    const allPaths = Array.from(new Set([
        ...KNOWN_ROUTES.map((r) => r.path),
        ...Object.keys(livePageMaintenance || {}),
        ...Object.keys(pages),
    ]));

    return (
        <div style={{
            background: 'rgba(20,22,30,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
            gridColumn: '1 / -1',
        }}>
            {/* Header */}
            <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.02)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '10px', padding: '6px' }}>
                        <LayoutGrid size={20} color="#60a5fa" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Per-Page Maintenance</div>
                        <div style={{ fontSize: '0.8rem', color: '#737373' }}>Lock specific pages — admins always bypass these</div>
                    </div>
                </div>
                {/* Active page count badge */}
                {Object.values(livePageMaintenance || {}).filter((c) => c.isActive).length > 0 && (
                    <div style={{
                        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                        padding: '3px 12px', borderRadius: '99px', fontSize: '0.78rem',
                        fontWeight: 700, color: '#f87171',
                    }}>
                        {Object.values(livePageMaintenance || {}).filter((c) => c.isActive).length} page(s) locked
                    </div>
                )}
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                {/* Page rows */}
                {allPaths.map((path) => {
                    const label = KNOWN_ROUTES.find((r) => r.path === path)?.label || path;
                    const cfg = getPage(path);
                    const isCustom = !KNOWN_ROUTES.find((r) => r.path === path);
                    const isSaving = saving === path;

                    return (
                        <div key={path} style={{
                            background: cfg.isActive ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${cfg.isActive ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '12px',
                            padding: '1rem 1.25rem',
                            transition: 'all 0.3s ease',
                        }}>
                            {/* Row header: path + toggle */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: cfg.isActive ? '1rem' : '0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{label}</span>
                                    <code style={{
                                        fontSize: '0.75rem', color: '#737373',
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '2px 8px', borderRadius: '6px',
                                    }}>{path}</code>
                                    {cfg.isActive && (
                                        <span style={{
                                            fontSize: '0.7rem', fontWeight: 700,
                                            color: '#f87171', background: 'rgba(239,68,68,0.12)',
                                            border: '1px solid rgba(239,68,68,0.25)',
                                            padding: '1px 8px', borderRadius: '99px',
                                            textTransform: 'uppercase', letterSpacing: '0.05em',
                                        }}>locked</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {isCustom && (
                                        <button
                                            onClick={() => removePage(path)}
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px', display: 'flex', alignItems: 'center' }}
                                            title="Remove this route"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                    {/* Toggle */}
                                    <button
                                        onClick={() => updatePage(path, 'isActive', !cfg.isActive)}
                                        style={{
                                            position: 'relative', width: '52px', height: '28px',
                                            borderRadius: '99px', padding: 0, border: 'none',
                                            background: cfg.isActive ? '#ef4444' : 'rgba(255,255,255,0.08)',
                                            cursor: 'pointer', transition: 'all 0.3s',
                                            boxShadow: cfg.isActive ? '0 0 12px rgba(239,68,68,0.4)' : 'none',
                                        }}
                                    >
                                        <span style={{
                                            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                                            left: cfg.isActive ? 'calc(100% - 24px)' : '4px',
                                            width: '20px', height: '20px', borderRadius: '50%',
                                            background: '#fff', transition: 'left 0.3s ease',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                                        }} />
                                    </button>
                                    {/* Save btn */}
                                    <button
                                        onClick={() => savePage(path)}
                                        disabled={isSaving}
                                        style={{
                                            background: '#3b82f6', border: 'none',
                                            borderRadius: '8px', padding: '5px 14px',
                                            color: '#fff', fontWeight: 600, fontSize: '0.82rem',
                                            cursor: isSaving ? 'not-allowed' : 'pointer',
                                            opacity: isSaving ? 0.6 : 1,
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                            fontFamily: "'Inter', sans-serif",
                                        }}
                                    >
                                        {isSaving ? <RefreshCw size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Save size={13} />}
                                        {isSaving ? 'Saving' : 'Save'}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded details — only show when toggled on */}
                            {cfg.isActive && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#737373' }}>Message (optional)</label>
                                        <input
                                            value={cfg.message}
                                            onChange={(e) => updatePage(path, 'message', e.target.value)}
                                            placeholder={`${label} is under maintenance…`}
                                            style={{
                                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px', padding: '7px 12px', color: '#fff',
                                                fontSize: '0.87rem', outline: 'none', fontFamily: "'Inter', sans-serif",
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#737373', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={11} /> Est. End Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={cfg.estimatedEndStr}
                                            onChange={(e) => updatePage(path, 'estimatedEndStr', e.target.value)}
                                            style={{
                                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px', padding: '7px 12px', color: '#fff',
                                                fontSize: '0.87rem', outline: 'none', colorScheme: 'dark',
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#737373' }}>Progress %</label>
                                        <input
                                            type="number" min={0} max={100}
                                            value={cfg.progressPercent}
                                            onChange={(e) => updatePage(path, 'progressPercent', e.target.value)}
                                            style={{
                                                width: '70px',
                                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px', padding: '7px 12px', color: '#fff',
                                                fontSize: '0.87rem', outline: 'none', fontFamily: "'Inter', sans-serif",
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Add custom route */}
                <div style={{
                    display: 'flex', gap: '0.75rem', alignItems: 'center',
                    marginTop: '0.5rem',
                    padding: '0.875rem 1.25rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px dashed rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                }}>
                    <input
                        value={customPath}
                        onChange={(e) => setCustomPath(e.target.value)}
                        placeholder="Add custom route e.g. /learn/dsa"
                        onKeyDown={(e) => e.key === 'Enter' && addCustomRoute()}
                        style={{
                            flex: 1, background: 'transparent', border: 'none',
                            color: '#a3a3a3', fontSize: '0.9rem', outline: 'none',
                            fontFamily: "'Inter', sans-serif",
                        }}
                    />
                    <button
                        onClick={addCustomRoute}
                        style={{
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px', padding: '6px 14px', color: '#a3a3a3',
                            fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                            fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#a3a3a3'; }}
                    >
                        <Plus size={15} /> Add Route
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Config Page ─────────────────────────────────────────────────────────
export default function AdminConfig() {
    const { currentUser } = useAuth();

    const [config, setConfig] = useState({
        openRegistration: true,
        requireEmailVerification: false,
        maxUploadSize: 10,
        supportEmail: 'support@whizan.xyz',
        appName: 'Whizan - AI Interview Prep',
        stripeTestMode: true,
        aiModel: 'gemini-2.0-flash',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await currentUser.getIdToken();
            const res = await fetch(`${VITE_API_BASE_URL}/api/admin/config`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            if (!res.ok) throw new Error('Failed to save config');
            toast.success('Settings saved successfully!');
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            toast.error('Error saving settings: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const ToggleRow = ({ name, label, description, accentColor = '#3b82f6' }) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '3px' }}>{label}</div>
                <div style={{ fontSize: '0.78rem', color: '#737373' }}>{description}</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', flexShrink: 0, marginLeft: '1rem' }}>
                <input type="checkbox" name={name} checked={!!config[name]} onChange={handleChange} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', inset: 0, backgroundColor: config[name] ? accentColor : 'rgba(255,255,255,0.08)', transition: 'all .3s', borderRadius: '34px' }}>
                    <span style={{ position: 'absolute', height: '18px', width: '18px', left: config[name] ? '23px' : '3px', bottom: '3px', backgroundColor: 'white', transition: 'left .3s', borderRadius: '50%' }} />
                </span>
            </label>
        </div>
    );

    const InputRow = ({ name, label, type = 'text', width = '100%' }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a3a3a3' }}>{label}</label>
            <input type={type} name={name} value={config[name]} onChange={handleChange}
                style={{ width, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none', fontFamily: "'Inter', sans-serif" }} />
        </div>
    );

    const SelectRow = ({ name, label, options }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a3a3a3' }}>{label}</label>
            <select name={name} value={config[name]} onChange={handleChange}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none', appearance: 'none', fontFamily: "'Inter', sans-serif" }}>
                {options.map((opt) => <option key={opt} value={opt} style={{ background: '#1a1b26' }}>{opt}</option>)}
            </select>
        </div>
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>

            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0 0 6px 0' }}>System Configuration</h1>
                    <p style={{ color: '#737373', margin: 0, fontSize: '0.95rem' }}>Manage global platform settings, feature flags, and maintenance controls.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        background: saved ? '#10b981' : '#3b82f6',
                        border: 'none', padding: '10px 22px', borderRadius: '10px',
                        color: '#fff', fontWeight: 700, cursor: saving ? 'wait' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: '0.9rem', transition: 'all 0.2s', opacity: saving ? 0.7 : 1,
                        fontFamily: "'Inter', sans-serif",
                    }}
                >
                    {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                    {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                {/* ── Global Maintenance Mode (full-width, first) ── */}
                <MaintenancePanel />

                {/* ── Per-Page Maintenance (full-width, second) ── */}
                <PageMaintenancePanel />

                {/* General Settings */}
                <div style={{ background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Globe size={17} color="#0ea5e9" /> General Settings
                    </h3>
                    <InputRow name="appName" label="Application Name" />
                    <InputRow name="supportEmail" label="Support Email" type="email" />
                    <InputRow name="maxUploadSize" label="Max Upload Size (MB)" type="number" width="120px" />
                </div>

                {/* Security & Access */}
                <div style={{ background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={17} color="#a855f7" /> Security & Access
                    </h3>
                    <ToggleRow name="openRegistration" label="Open Registration" description="Allow new users to sign up." />
                    <ToggleRow name="requireEmailVerification" label="Require Email Verification" description="Force email verify before dashboard access." />
                    <ToggleRow name="stripeTestMode" label="Payment Test Mode" description="Use mock payments for subscriptions." accentColor="#f59e0b" />
                </div>

                {/* AI & Integrations (full-width) */}
                <div style={{ background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', gridColumn: '1 / -1' }}>
                    <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Settings size={17} color="#10b981" /> AI & Integrations
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <SelectRow name="aiModel" label="Primary AI Model" options={['gemini-2.0-flash', 'gemini-1.5-pro', 'gpt-4o', 'gpt-4o-mini', 'claude-3.5-sonnet']} />
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a3a3a3', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Bell size={13} /> Webhook Endpoints
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#525252', marginBottom: '14px' }}>Manage endpoints that receive system events.</div>
                            <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '7px 14px', color: '#a3a3a3', fontSize: '0.82rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                                Manage Webhooks
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
