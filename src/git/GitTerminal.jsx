// src/git/GitTerminal.jsx
import React, { useState, useRef, useEffect } from 'react';

function parseColor(text) {
    // Convert our simple color tags into JSX spans
    const parts = [];
    const regex = /\x1b\[(\w+)\](.*?)\x1b\[\/\]/gs;
    let last = 0;
    let match;
    const colorMap = {
        green: '#4ade80',
        red: '#f87171',
        yellow: '#fbbf24',
        blue: '#60a5fa',
        gray: '#94a3b8',
        cyan: '#22d3ee',
    };
    while ((match = regex.exec(text)) !== null) {
        if (match.index > last) parts.push(<span key={last}>{text.slice(last, match.index)}</span>);
        parts.push(<span key={match.index} style={{ color: colorMap[match[1]] || '#fff' }}>{match[2]}</span>);
        last = match.index + match[0].length;
    }
    if (last < text.length) parts.push(<span key={last}>{text.slice(last)}</span>);
    return parts.length > 0 ? parts : [<span key={0}>{text}</span>];
}

export default function GitTerminal({ engine, onCommand, prompt = 'student@git-playground' }) {
    const [history, setHistory] = useState([
        { type: 'info', text: 'Git Playground Terminal. Type "git help" to see available commands.' },
    ]);
    const [input, setInput] = useState('');
    const [cmdHistory, setCmdHistory] = useState([]);
    const [histIdx, setHistIdx] = useState(-1);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const GIT_COMMANDS = [
        'git status', 'git add .', 'git add ',
        'git commit -m "', 'git branch', 'git checkout ', 'git checkout -b ',
        'git merge ', 'git log', 'git log --oneline', 'git log --oneline --graph',
        'git diff', 'git diff --staged', 'git reset HEAD~1', 'git reset --hard HEAD~1',
        'git revert ', 'git stash', 'git stash pop', 'git stash list',
        'git tag ', 'git cherry-pick ', 'git rebase ', 'git help', 'git init',
    ];

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const idx = Math.min(histIdx + 1, cmdHistory.length - 1);
            setHistIdx(idx);
            setInput(cmdHistory[idx] ?? '');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const idx = Math.max(histIdx - 1, -1);
            setHistIdx(idx);
            setInput(idx === -1 ? '' : cmdHistory[idx] ?? '');
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const match = GIT_COMMANDS.find(c => c.startsWith(input));
            if (match) setInput(match);
        }
    };

    const submit = () => {
        const cmd = input.trim();
        if (!cmd) return;

        // Echo the command
        const echoEntry = { type: 'cmd', text: cmd };
        let resultEntry;

        try {
            const result = engine.run(cmd);
            resultEntry = {
                type: result.ok ? 'output' : 'error',
                text: result.output,
                result,
            };
        } catch (err) {
            resultEntry = { type: 'error', text: `Error: ${err.message}` };
        }

        setHistory(h => [...h, echoEntry, resultEntry]);
        setCmdHistory(h => [cmd, ...h]);
        setHistIdx(-1);
        setInput('');
        onCommand && onCommand(cmd);
    };

    const clear = () => setHistory([]);

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#020817', fontFamily: 'monospace', fontSize: '0.78rem' }}
            onClick={() => inputRef.current?.focus()}
        >
            {/* Header */}
            <div style={{ padding: '6px 12px', background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.75rem' }}>TERMINAL</span>
                <button
                    onClick={(e) => { e.stopPropagation(); clear(); }}
                    style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.7rem' }}
                >
                    clear
                </button>
            </div>

            {/* Output */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
                {history.map((entry, i) => {
                    if (entry.type === 'cmd') {
                        return (
                            <div key={i} style={{ marginBottom: 2 }}>
                                <span style={{ color: '#4ade80' }}>{prompt}</span>
                                <span style={{ color: '#94a3b8' }}>:</span>
                                <span style={{ color: '#60a5fa' }}>~</span>
                                <span style={{ color: '#94a3b8' }}>$ </span>
                                <span style={{ color: '#e2e8f0' }}>{entry.text}</span>
                            </div>
                        );
                    }
                    const color = entry.type === 'error' ? '#f87171' : entry.type === 'info' ? '#60a5fa' : '#cbd5e1';
                    return (
                        <pre key={i} style={{ margin: '0 0 4px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color, lineHeight: 1.5 }}>
                            {parseColor(entry.text)}
                        </pre>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input row */}
            <div style={{ padding: '6px 12px', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#4ade80', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>$ </span>
                <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') submit();
                        else handleKeyDown(e);
                    }}
                    placeholder="git status (Tab to autocomplete)"
                    style={{
                        flex: 1, background: 'transparent', border: 'none', outline: 'none',
                        color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.78rem',
                        caretColor: '#4ade80',
                    }}
                    autoFocus
                />
            </div>
        </div>
    );
}
