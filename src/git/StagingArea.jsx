// src/git/StagingArea.jsx
import React from 'react';
import { Plus, Minus, FileText } from 'lucide-react';

export default function StagingArea({ status, onAdd, onUnstage, onShowDiff }) {
    const { staged = [], modified = [], untracked = [], deleted = [] } = status;
    const hasChanges = staged.length + modified.length + untracked.length + deleted.length > 0;

    return (
        <div style={{ height: '100%', overflowY: 'auto', background: '#0a0f1e', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '6px 12px', background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem' }}>STAGING AREA</span>
                {hasChanges && (
                    <span style={{ fontSize: '0.7rem', color: '#60a5fa' }}>
                        {staged.length} staged · {modified.length + untracked.length} unstaged
                    </span>
                )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                {!hasChanges && (
                    <div style={{ color: '#334155', fontSize: '0.78rem', textAlign: 'center', marginTop: 20 }}>
                        Working tree clean
                    </div>
                )}

                {/* Staged */}
                {staged.length > 0 && (
                    <Section title="Staged" color="#4ade80">
                        {staged.map(f => (
                            <FileRow key={f} file={f} color="#4ade80" badge="●"
                                actions={[
                                    { icon: <Minus size={11} />, title: 'Unstage', onClick: () => onUnstage(f), color: '#f87171' },
                                    { icon: <FileText size={11} />, title: 'Diff', onClick: () => onShowDiff(f, 'staged'), color: '#94a3b8' },
                                ]}
                            />
                        ))}
                    </Section>
                )}

                {/* Modified */}
                {modified.length > 0 && (
                    <Section title="Modified" color="#fbbf24">
                        {modified.map(f => (
                            <FileRow key={f} file={f} color="#fbbf24" badge="M"
                                actions={[
                                    { icon: <Plus size={11} />, title: 'Stage', onClick: () => onAdd(f), color: '#4ade80' },
                                    { icon: <FileText size={11} />, title: 'Diff', onClick: () => onShowDiff(f, 'working'), color: '#94a3b8' },
                                ]}
                            />
                        ))}
                    </Section>
                )}

                {/* Deleted */}
                {deleted.length > 0 && (
                    <Section title="Deleted" color="#f87171">
                        {deleted.map(f => (
                            <FileRow key={f} file={f} color="#f87171" badge="D"
                                actions={[
                                    { icon: <Plus size={11} />, title: 'Stage Delete', onClick: () => onAdd(f), color: '#4ade80' },
                                ]}
                            />
                        ))}
                    </Section>
                )}

                {/* Untracked */}
                {untracked.length > 0 && (
                    <Section title="Untracked" color="#94a3b8">
                        {untracked.map(f => (
                            <FileRow key={f} file={f} color="#94a3b8" badge="?"
                                actions={[
                                    { icon: <Plus size={11} />, title: 'Stage', onClick: () => onAdd(f), color: '#4ade80' },
                                ]}
                            />
                        ))}
                    </Section>
                )}

                {/* Quick Actions */}
                <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(modified.length > 0 || untracked.length > 0) && (
                        <QuickBtn label="Stage All" onClick={() => onAdd('.')} color="#4ade80" />
                    )}
                </div>
            </div>
        </div>
    );
}

function Section({ title, color, children }) {
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ color, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, paddingLeft: 4 }}>
                {title}
            </div>
            {children}
        </div>
    );
}

function FileRow({ file, color, badge, actions }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 6px', borderRadius: 4,
            background: '#0f172a', marginBottom: 3,
        }}>
            <span style={{ color, fontSize: '0.7rem', minWidth: 14, textAlign: 'center', fontWeight: 700 }}>{badge}</span>
            <span style={{ flex: 1, color: '#e2e8f0', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file}</span>
            <div style={{ display: 'flex', gap: 3 }}>
                {actions.map((a, i) => (
                    <button
                        key={i}
                        title={a.title}
                        onClick={a.onClick}
                        style={{ background: 'none', border: `1px solid ${a.color}30`, borderRadius: 3, color: a.color, cursor: 'pointer', padding: '2px 4px', display: 'flex', alignItems: 'center' }}
                    >
                        {a.icon}
                    </button>
                ))}
            </div>
        </div>
    );
}

function QuickBtn({ label, onClick, color }) {
    return (
        <button
            onClick={onClick}
            style={{ padding: '3px 10px', borderRadius: 4, background: `${color}20`, border: `1px solid ${color}50`, color, fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
        >
            {label}
        </button>
    );
}
