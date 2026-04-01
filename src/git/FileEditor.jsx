// src/git/FileEditor.jsx
import React, { useState, useEffect } from 'react';
import { Plus, X, Save } from 'lucide-react';

export default function FileEditor({ workingTree, onSaveFile, onCreateFile, onDeleteFile }) {
    const files = Object.keys(workingTree);
    const [activeFile, setActiveFile] = useState(files[0] || null);
    const [editorContent, setEditorContent] = useState('');
    const [dirty, setDirty] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [creatingFile, setCreatingFile] = useState(false);

    // Sync editor content when switching files
    useEffect(() => {
        if (activeFile && workingTree[activeFile] !== undefined) {
            setEditorContent(workingTree[activeFile]);
            setDirty(false);
        }
    }, [activeFile]);

    // If current file deleted externally, switch to first available
    useEffect(() => {
        const fList = Object.keys(workingTree);
        if (activeFile && !workingTree[activeFile] && fList.length > 0) {
            setActiveFile(fList[0]);
        } else if (!activeFile && fList.length > 0) {
            setActiveFile(fList[0]);
        }
    }, [workingTree]);

    const handleSave = () => {
        if (!activeFile) return;
        onSaveFile(activeFile, editorContent);
        setDirty(false);
    };

    const handleCreateFile = () => {
        const name = newFileName.trim();
        if (!name) return;
        onCreateFile(name);
        setActiveFile(name);
        setEditorContent('');
        setDirty(false);
        setNewFileName('');
        setCreatingFile(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#020817' }}>
            {/* Tab bar */}
            <div style={{ display: 'flex', overflowX: 'auto', background: '#0f172a', borderBottom: '1px solid #1e293b', minHeight: 32 }}>
                {Object.keys(workingTree).map(f => {
                    const isDirty = f === activeFile && dirty;
                    const isActive = f === activeFile;
                    return (
                        <div
                            key={f}
                            onClick={() => {
                                if (dirty && !window.confirm('Discard unsaved changes?')) return;
                                setActiveFile(f);
                            }}
                            style={{
                                padding: '5px 12px', cursor: 'pointer', fontSize: '0.75rem',
                                whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
                                borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                                color: isActive ? '#e2e8f0' : '#64748b',
                                background: isActive ? '#0a0f1e' : 'transparent',
                            }}
                        >
                            <span>{f}</span>
                            {isDirty && <span style={{ color: '#fbbf24', fontSize: 16, lineHeight: 0 }}>●</span>}
                            <X
                                size={11}
                                style={{ color: '#475569', cursor: 'pointer' }}
                                onClick={e => { e.stopPropagation(); onDeleteFile && onDeleteFile(f); }}
                            />
                        </div>
                    );
                })}

                {/* New file button */}
                {creatingFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', gap: 4 }}>
                        <input
                            autoFocus
                            value={newFileName}
                            onChange={e => setNewFileName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleCreateFile(); if (e.key === 'Escape') setCreatingFile(false); }}
                            placeholder="filename.js"
                            style={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', borderRadius: 3, padding: '2px 6px', fontSize: '0.75rem', width: 100, outline: 'none' }}
                        />
                        <button onClick={handleCreateFile} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', padding: '2px' }}><Save size={11} /></button>
                        <button onClick={() => setCreatingFile(false)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}><X size={11} /></button>
                    </div>
                ) : (
                    <button
                        onClick={() => setCreatingFile(true)}
                        title="New file"
                        style={{ padding: '0 10px', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 16 }}
                    >
                        <Plus size={13} />
                    </button>
                )}
            </div>

            {/* Editor area */}
            {activeFile ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <textarea
                        value={editorContent}
                        onChange={e => { setEditorContent(e.target.value); setDirty(true); }}
                        onKeyDown={e => {
                            if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
                            if (e.key === 'Tab') {
                                e.preventDefault();
                                const { selectionStart: s, selectionEnd: end } = e.target;
                                const v = editorContent;
                                setEditorContent(v.slice(0, s) + '  ' + v.slice(end));
                                setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }, 0);
                            }
                        }}
                        style={{
                            flex: 1, resize: 'none', background: '#020817', color: '#e2e8f0',
                            border: 'none', outline: 'none', padding: '12px 16px',
                            fontFamily: "'Fira Code', 'Cascadia Code', monospace", fontSize: '0.8rem',
                            lineHeight: 1.6, width: '100%', boxSizing: 'border-box',
                        }}
                        spellCheck={false}
                    />
                    {dirty && (
                        <button
                            onClick={handleSave}
                            style={{
                                position: 'absolute', bottom: 10, right: 10,
                                background: '#6366f1', border: 'none', color: '#fff',
                                padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem',
                                boxShadow: '0 2px 8px #6366f160',
                            }}
                        >
                            Save (⌘S)
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontSize: '0.85rem' }}>
                    No files yet. Create one with +
                </div>
            )}
        </div>
    );
}
