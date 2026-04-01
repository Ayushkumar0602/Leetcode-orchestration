// src/git/CommitTree.jsx
import React, { useMemo } from 'react';

const LANE_W = 40;
const ROW_H = 56;
const NODE_R = 8;
const PADDING = { top: 20, left: 20 };

const LANE_COLORS = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6',
];

function laneColor(lane) {
    return LANE_COLORS[lane % LANE_COLORS.length];
}

function cx(lane) { return PADDING.left + lane * LANE_W; }
function cy(row) { return PADDING.top + row * ROW_H; }

export default function CommitTree({ graphData, onSelectCommit, selectedHash }) {
    const { nodes, branchLanes, headBranch } = graphData;

    const totalLanes = useMemo(() => {
        const maxLane = nodes.reduce((m, n) => Math.max(m, n.lane), 0);
        return maxLane + 1;
    }, [nodes]);

    const svgWidth = PADDING.left * 2 + totalLanes * LANE_W + 320;
    const svgHeight = PADDING.top * 2 + nodes.length * ROW_H;

    // Build index for fast lookup
    const nodeIndex = useMemo(() => {
        const idx = {};
        nodes.forEach((n, i) => { idx[n.hash] = { ...n, row: i }; });
        return idx;
    }, [nodes]);

    // Draw edges (parent → child)
    const edges = useMemo(() => {
        const result = [];
        for (const node of nodes) {
            for (const parentHash of node.parents) {
                const parent = nodeIndex[parentHash];
                if (!parent) continue;
                const x1 = cx(node.lane);
                const y1 = cy(nodes.indexOf(node));
                const x2 = cx(parent.lane);
                const y2 = cy(parent.row);
                const color = laneColor(node.lane);
                const controlY = (y1 + y2) / 2;
                const d = x1 === x2
                    ? `M ${x1} ${y1} L ${x2} ${y2}`
                    : `M ${x1} ${y1} C ${x1} ${controlY}, ${x2} ${controlY}, ${x2} ${y2}`;
                result.push({ d, color, key: `${node.hash}-${parentHash}` });
            }
        }
        return result;
    }, [nodes, nodeIndex]);

    if (nodes.length === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', fontSize: '0.85rem' }}>
                No commits yet.
            </div>
        );
    }

    return (
        <div style={{ overflowY: 'auto', overflowX: 'auto', height: '100%', background: '#0a0f1e' }}>
            <svg
                width={svgWidth}
                height={Math.max(svgHeight, 200)}
                style={{ display: 'block', fontFamily: 'monospace' }}
            >
                {/* Branch lane guides */}
                {Array.from({ length: totalLanes }, (_, i) => (
                    <line
                        key={`lane-${i}`}
                        x1={cx(i)} y1={PADDING.top}
                        x2={cx(i)} y2={Math.max(svgHeight, 200) - PADDING.top}
                        stroke={laneColor(i)}
                        strokeWidth={1}
                        strokeDasharray="3,6"
                        opacity={0.15}
                    />
                ))}

                {/* Edges */}
                {edges.map(e => (
                    <path key={e.key} d={e.d} stroke={e.color} strokeWidth={2} fill="none" opacity={0.7} />
                ))}

                {/* Nodes */}
                {nodes.map((node, i) => {
                    const x = cx(node.lane);
                    const y = cy(i);
                    const color = laneColor(node.lane);
                    const isSelected = node.hash === selectedHash;

                    return (
                        <g
                            key={node.hash}
                            style={{ cursor: 'pointer' }}
                            onClick={() => onSelectCommit(node.hash)}
                        >
                            {/* Glow for HEAD */}
                            {node.isHead && (
                                <circle cx={x} cy={y} r={NODE_R + 5} fill={color} opacity={0.2} />
                            )}

                            {/* Selection ring */}
                            {isSelected && (
                                <circle cx={x} cy={y} r={NODE_R + 4} fill="none" stroke="#fff" strokeWidth={1.5} opacity={0.5} />
                            )}

                            {/* Node circle */}
                            <circle
                                cx={x} cy={y} r={NODE_R}
                                fill={node.isHead ? color : '#0a0f1e'}
                                stroke={color}
                                strokeWidth={node.isCurrentBranch ? 2.5 : 1.5}
                            />

                            {/* Commit hash */}
                            <text x={x + NODE_R + 8} y={y - 5} fill="#94a3b8" fontSize={10}>
                                {node.shortHash}
                            </text>

                            {/* Commit message */}
                            <text x={x + NODE_R + 8} y={y + 8} fill="#e2e8f0" fontSize={12} fontWeight={500}>
                                {node.message.slice(0, 38)}{node.message.length > 38 ? '…' : ''}
                            </text>

                            {/* Branch badges */}
                            {(() => {
                                let badgeX = x + NODE_R + 8 + Math.min(node.message.length, 38) * 7.3 + 8;
                                return node.branches.map(b => {
                                    const isHead = b === headBranch && !graphData.detached;
                                    const bColor = laneColor(branchLanes[b] ?? 0);
                                    const label = isHead ? `HEAD → ${b}` : b;
                                    const bw = label.length * 7 + 10;
                                    const el = (
                                        <g key={b}>
                                            <rect x={badgeX} y={y - 9} width={bw} height={16} rx={4} fill={bColor} opacity={0.85} />
                                            <text x={badgeX + 5} y={y + 4} fill="#fff" fontSize={10} fontWeight={700}>{label}</text>
                                        </g>
                                    );
                                    badgeX += bw + 6;
                                    return el;
                                });
                            })()}

                            {/* Tag badges */}
                            {node.tags.map(t => (
                                <g key={t}>
                                    <text x={x + NODE_R + 8} y={y + 20} fill="#f59e0b" fontSize={9}>🏷 {t}</text>
                                </g>
                            ))}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
