// src/git/DiffViewer.jsx
import React from 'react';

function linesOf(content = '') { return content.split('\n'); }

function computeDiff(oldContent = '', newContent = '') {
    const oldLines = linesOf(oldContent);
    const newLines = linesOf(newContent);
    const result = [];
    const maxLen = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLen; i++) {
        if (i >= oldLines.length) {
            result.push({ type: 'add', line: newLines[i], lineNum: i + 1 });
        } else if (i >= newLines.length) {
            result.push({ type: 'remove', line: oldLines[i], lineNum: i + 1 });
        } else if (oldLines[i] !== newLines[i]) {
            result.push({ type: 'remove', line: oldLines[i], lineNum: i + 1 });
            result.push({ type: 'add', line: newLines[i], lineNum: i + 1 });
        } else {
            result.push({ type: 'context', line: oldLines[i], lineNum: i + 1 });
        }
    }
    return result;
}

export default function DiffViewer({ oldContent, newContent, filename, onClose }) {
    const lines = computeDiff(oldContent, newContent);
    const adds = lines.filter(l => l.type === 'add').length;
    const removes = lines.filter(l => l.type === 'remove').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#020817' }}>
            {/* Header */}
            <div style={{ padding: '8px 12px', background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.82rem' }}>{filename}</span>
                    <span style={{ color: '#4ade80', fontSize: '0.72rem' }}>+{adds}</span>
                    <span style={{ color: '#f87171', fontSize: '0.72rem' }}>-{removes}</span>
                </div>
                {onClose && (
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18 }}>×</button>
                )}
            </div>

            {/* Diff lines */}
            <div style={{ flex: 1, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.76rem' }}>
                {lines.length === 0 && (
                    <div style={{ padding: 16, color: '#475569' }}>No changes</div>
                )}
                {lines.map((l, i) => {
                    const bg = l.type === 'add' ? '#0d2818' : l.type === 'remove' ? '#2a0d0d' : 'transparent';
                    const color = l.type === 'add' ? '#4ade80' : l.type === 'remove' ? '#f87171' : '#64748b';
                    const prefix = l.type === 'add' ? '+' : l.type === 'remove' ? '-' : ' ';
                    return (
                        <div
                            key={i}
                            style={{ display: 'flex', background: bg, borderLeft: `2px solid ${l.type === 'context' ? 'transparent' : color}` }}
                        >
                            <span style={{ color: '#334155', minWidth: 36, textAlign: 'right', padding: '1px 8px', userSelect: 'none', borderRight: '1px solid #1e293b' }}>
                                {l.lineNum}
                            </span>
                            <span style={{ color, padding: '1px 8px', flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                {prefix} {l.line}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
