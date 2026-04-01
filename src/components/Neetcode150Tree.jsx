import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactFlow, Background, Controls, Handle, Position, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CheckCircle2, Circle, ArrowRight, X } from 'lucide-react';
import { dagPositions, roadmapEdges } from '../data/roadmapLayout';

// Custom Node Component - matches the premium indigo pill design from the user's reference
function CategoryNode({ data }) {
    const { category, isCompleted, problemsTotal, problemsSolved, onNodeClick } = data;
    const progress = problemsTotal > 0 ? (problemsSolved / problemsTotal) * 100 : 0;

    return (
        <div 
            onClick={() => onNodeClick(data)}
            style={{
                background: isCompleted ? '#10b981' : '#4f46e5', // Indigo by default, green if complete
                borderRadius: '8px',
                padding: '12px 20px',
                minWidth: '150px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = isCompleted ? '0 8px 20px rgba(16,185,129,0.5)' : '0 8px 20px rgba(79,70,229,0.5)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
            }}
        >
            <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
            
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {category}
            </span>
            
            {/* Inner Progress Bar matching the screenshot */}
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#4ade80', transition: 'width 0.3s' }}></div>
            </div>

            <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
        </div>
    );
}

const nodeTypes = { categoryNode: CategoryNode };

export default function Neetcode150Tree({ sheetData = [], solvedIds = [], isTrackingEnabled = false }) {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState(null);

    const initialNodes = useMemo(() => {
        return sheetData.map((catObj) => {
            const catSolved = catObj.problems.filter(p => solvedIds.includes(String(p.id))).length;
            const catTotal = catObj.problems.length;
            
            return {
                id: catObj.category,
                type: 'categoryNode',
                position: dagPositions[catObj.category] || { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
                data: {
                    category: catObj.category,
                    problems: catObj.problems,
                    solvedIds,
                    onNodeClick: (data) => setSelectedCategory(data),
                    isCompleted: catTotal > 0 && catSolved === catTotal,
                    problemsTotal: catTotal,
                    problemsSolved: catSolved
                }
            };
        });
    }, [sheetData, solvedIds]);

    const initialEdges = useMemo(() => {
        const edges = [];
        const existingNodeIds = new Set(sheetData.map(c => c.category));

        roadmapEdges.forEach((edge, index) => {
            if (existingNodeIds.has(edge.source) && existingNodeIds.has(edge.target)) {
                edges.push({
                    id: `e-${edge.source}-${edge.target}-${index}`,
                    source: edge.source,
                    target: edge.target,
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: '#ffffff', strokeWidth: 2, opacity: 0.8 } // Solid white lines like the reference
                });
            }
        });
        return edges;
    }, [sheetData]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const getDifficultyColor = (diff) => {
        if (diff === 'Easy') return '#4ade80';
        if (diff === 'Medium') return '#fbbf24';
        if (diff === 'Hard') return '#f87171';
        return '#fbbf24';
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex' }}>
            
            {/* React Flow Canvas */}
            <div style={{ flex: 1, backgroundColor: '#1a1b26' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    minZoom={0.1}
                    maxZoom={1.5}
                >
                    {/* Dark minimalist background without dots if possible, or very subtle */}
                    <Background color="#ffffff" gap={30} size={1} opacity={0.05} />
                    <Controls style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} />
                    <style>{`
                        .react-flow__controls-button {
                            background: rgba(30, 32, 45, 0.9) !important;
                            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
                            fill: #fff !important;
                            color: #fff !important;
                            transition: background 0.2s !important;
                        }
                        .react-flow__controls-button:hover {
                            background: #4f46e5 !important;
                        }
                        .react-flow__controls-button:last-child {
                            border-bottom: none !important;
                        }
                    `}</style>
                </ReactFlow>
            </div>

            {/* Side Panel for Problems */}
            <div style={{
                position: 'absolute', top: 0, bottom: 0, right: 0, zIndex: 50,
                width: selectedCategory ? '400px' : '0px', maxWidth: '100%',
                background: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(20px)',
                borderLeft: selectedCategory ? '1px solid rgba(255,255,255,0.1)' : 'none',
                display: 'flex', flexDirection: 'column', 
                transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden',
                boxShadow: selectedCategory ? '-10px 0 40px rgba(0,0,0,0.5)' : 'none'
            }}>
                {selectedCategory && (
                    <div style={{ width: '400px', maxWidth: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{selectedCategory.category}</h3>
                                <div style={{ color: 'var(--txt3)', fontSize: '0.9rem', marginTop: '4px' }}>
                                    {selectedCategory.problemsSolved} / {selectedCategory.problemsTotal} completed
                                </div>
                            </div>
                            <button onClick={() => setSelectedCategory(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {selectedCategory.problems.map(p => {
                                const isSolved = solvedIds.includes(String(p.id));
                                return (
                                    <div 
                                        key={p.id}
                                        onClick={() => navigate(`/solvingpage/${p.id}`)}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '14px 16px', background: isSolved ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${isSolved ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)'}`,
                                            borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = isSolved ? 'rgba(16,185,129,0.5)' : '#6366f1';
                                            e.currentTarget.style.background = isSolved ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = isSolved ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)';
                                            e.currentTarget.style.background = isSolved ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                            {isTrackingEnabled ? (
                                                isSolved ? <CheckCircle2 size={18} color="#10b981" style={{minWidth:'18px'}}/> : <Circle size={18} color="rgba(255,255,255,0.2)" style={{minWidth:'18px'}} />
                                            ) : (
                                                <Circle size={18} color="rgba(255,255,255,0.1)" style={{minWidth:'18px'}} />
                                            )}
                                            <span style={{ fontWeight: 600, color: isSolved ? '#fff' : 'var(--txt2)', fontSize: '0.95rem', lineHeight: 1.4 }}>
                                                {p.id}. {p.title}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: getDifficultyColor(p.difficulty) }}>
                                                {p.difficulty}
                                            </span>
                                            <ArrowRight size={16} color="var(--txt3)" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
