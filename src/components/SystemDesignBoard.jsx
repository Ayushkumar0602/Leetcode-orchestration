import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Handle,
    Position,
    useReactFlow,
    useViewport,
    ReactFlowProvider,
    EdgeLabelRenderer,
    BaseEdge,
    getStraightPath,
    getSmoothStepPath,
    getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import {
    Server, Activity, Globe, Database, Smartphone, HardDrive,
    Network, LayoutTemplate, Layers, Settings, Zap, AppWindow,
    Type, Square, Circle, Diamond, ShieldCheck, Search, Trash2,
    Pencil, Eraser, MousePointer,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const EDGE_COLORS = [
    { label: 'Purple', value: '#a855f7' },
    { label: 'Teal', value: '#00b8a3' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Red', value: '#ef4743' },
    { label: 'Orange', value: '#ffa116' },
    { label: 'White', value: '#e8e8e8' },
    { label: 'Green', value: '#22c55e' },
    { label: 'Pink', value: '#ec4899' },
];

const EDGE_TYPES_OPTIONS = [
    { id: 'smoothstep', label: 'Curved' },
    { id: 'straight', label: 'Straight' },
    { id: 'step', label: 'Step' },
];

const NODE_TYPES_CONFIG = [
    { type: 'Text', component: 'textNode', id: 'text', label: 'Add Text', icon: Type, color: '#e8e8e8' },
    { divider: true },
    { type: 'Shape', component: 'shapeNode', id: 'rect', label: 'Rectangle', shapeType: 'rect', icon: Square, color: '#a3a3a3' },
    { type: 'Shape', component: 'shapeNode', id: 'circle', label: 'Circle', shapeType: 'circle', icon: Circle, color: '#a3a3a3' },
    { type: 'Shape', component: 'shapeNode', id: 'diamond', label: 'Diamond', shapeType: 'diamond', icon: Diamond, color: '#a3a3a3' },
    { divider: true },
    { type: 'Client/User', component: 'systemNode', id: 'client', label: 'User Device', sublabel: 'Mobile / Web', icon: Smartphone, color: '#3b82f6' },
    { type: 'Client/User', component: 'systemNode', id: 'cdn', label: 'CDN', sublabel: 'Content Delivery', icon: Globe, color: '#3b82f6' },
    { type: 'Network', component: 'systemNode', id: 'lb', label: 'Load Balancer', sublabel: 'Traffic Routing', icon: Network, color: '#00b8a3' },
    { type: 'Network', component: 'systemNode', id: 'gateway', label: 'API Gateway', sublabel: 'Entry Point', icon: AppWindow, color: '#00b8a3' },
    { type: 'Network', component: 'systemNode', id: 'dns', label: 'DNS', sublabel: 'Domain Name System', icon: LayoutTemplate, color: '#00b8a3' },
    { type: 'Network', component: 'systemNode', id: 'firewall', label: 'Firewall', sublabel: 'Security', icon: ShieldCheck, color: '#ef4743' },
    { type: 'Compute', component: 'systemNode', id: 'service', label: 'Microservice', sublabel: 'Compute Node', icon: Server, color: '#a855f7' },
    { type: 'Compute', component: 'systemNode', id: 'worker', label: 'Async Worker', sublabel: 'Background Job', icon: Settings, color: '#a855f7' },
    { type: 'Data', component: 'systemNode', id: 'db_sql', label: 'SQL Database', sublabel: 'Relational', icon: Database, color: '#ffa116' },
    { type: 'Data', component: 'systemNode', id: 'db_nosql', label: 'NoSQL Database', sublabel: 'Document/KV', icon: Layers, color: '#ffa116' },
    { type: 'Data', component: 'systemNode', id: 'cache', label: 'Redis Cache', sublabel: 'In-Memory', icon: Zap, color: '#ef4743' },
    { type: 'Data', component: 'systemNode', id: 'queue', label: 'Message Queue', sublabel: 'Kafka / RMQ', icon: Activity, color: '#ef4743' },
    { type: 'Data', component: 'systemNode', id: 'storage', label: 'Object Storage', sublabel: 'S3 / Blob', icon: HardDrive, color: '#ffa116' },
    { type: 'Data', component: 'systemNode', id: 'search', label: 'Search Engine', sublabel: 'Elasticsearch', icon: Search, color: '#3b82f6' },
];

const getIconById = (id) => {
    const found = NODE_TYPES_CONFIG.find(c => c.id === id);
    return found ? found.icon : Server;
};

// ─── Custom Edge ──────────────────────────────────────────────────────────────
const CustomDeletableEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd, style, selected }) => {
    const { setEdges } = useReactFlow();
    const edgeType = data?.edgeType || 'smoothstep';
    let edgePath, labelX, labelY;
    if (edgeType === 'straight') {
        [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
    } else if (edgeType === 'step') {
        [edgePath, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
    } else {
        [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
    }
    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            {selected && (
                <EdgeLabelRenderer>
                    <div style={{ position: 'absolute', transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`, pointerEvents: 'all' }} className="nodrag nopan">
                        <button onClick={(e) => { e.stopPropagation(); setEdges(eds => eds.filter(e => e.id !== id)); }}
                            style={{ background: '#ef4743', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.5)', fontSize: '12px', fontWeight: 700 }}>×</button>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

// ─── Generic Delete Button ────────────────────────────────────────────────────
const DeleteNodeButton = ({ id }) => {
    const { setNodes, setEdges } = useReactFlow();
    return (
        <button onClick={(e) => { e.stopPropagation(); setNodes(nds => nds.filter(n => n.id !== id)); setEdges(eds => eds.filter(e => e.source !== id && e.target !== id)); }}
            title="Delete Node"
            style={{ position: 'absolute', top: -12, right: -12, background: '#ef4743', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'transform 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <Trash2 size={12} />
        </button>
    );
};

// ─── Custom Nodes ─────────────────────────────────────────────────────────────
const CustomSystemNode = ({ data, selected, id }) => {
    const Icon = getIconById(data.iconId);
    const color = data.color || '#a855f7';
    return (
        <div style={{ background: 'rgba(20,22,30,0.95)', border: `1px solid ${selected ? color : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', padding: '12px 16px', minWidth: '160px', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', backdropFilter: 'blur(8px)', transition: 'all 0.2s', transform: selected ? 'scale(1.02)' : 'scale(1)', boxShadow: selected ? `0 0 0 2px rgba(${color === '#a855f7' ? '168,85,247' : color === '#00b8a3' ? '0,184,163' : color === '#ffa116' ? '255,161,22' : '59,130,246'},0.2),0 8px 24px rgba(0,0,0,0.4)` : '0 4px 12px rgba(0,0,0,0.2)' }}>
            {selected && <DeleteNodeButton id={id} />}
            <Handle type="target" position={Position.Top} style={{ width: 8, height: 8, background: 'var(--txt3)', border: 'none' }} />
            <Handle type="target" position={Position.Left} id="left" style={{ width: 8, height: 8, background: 'var(--txt3)', border: 'none' }} />
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: `rgba(${color === '#a855f7' ? '168,85,247' : color === '#00b8a3' ? '0,184,163' : color === '#ef4743' ? '239,71,67' : color === '#ffa116' ? '255,161,22' : '59,130,246'},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}><Icon size={20} /></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e8e8e8' }}>{data.label}</span>
                {data.sublabel && <span style={{ fontSize: '0.65rem', color: 'var(--txt3)', fontWeight: 500 }}>{data.sublabel}</span>}
            </div>
            <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8, background: 'var(--txt3)', border: 'none' }} />
            <Handle type="source" position={Position.Right} id="right" style={{ width: 8, height: 8, background: 'var(--txt3)', border: 'none' }} />
        </div>
    );
};

const CustomTextNode = ({ data, selected, id }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localText, setLocalText] = useState(data.text || 'Type here...');
    const { updateNodeData } = useReactFlow();
    useEffect(() => { setLocalText(data.text || 'Type here...'); }, [data.text]);
    const onBlur = () => { setIsEditing(false); updateNodeData(id, { text: localText }); };
    return (
        <div style={{ padding: '8px', minWidth: '150px', border: isEditing || selected ? '1px dashed rgba(255,255,255,0.4)' : '1px dashed transparent', borderRadius: '6px', background: isEditing || selected ? 'rgba(255,255,255,0.02)' : 'transparent', cursor: 'text', position: 'relative' }} onDoubleClick={() => setIsEditing(true)}>
            {selected && !isEditing && <DeleteNodeButton id={id} />}
            {isEditing ? (<textarea className="nodrag nowheel" autoFocus value={localText} onChange={e => setLocalText(e.target.value)} onBlur={onBlur} onKeyDown={e => e.stopPropagation()} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1rem', outline: 'none', width: '100%', minHeight: '60px', fontFamily: 'inherit', resize: 'none' }} />) : (<div style={{ color: '#fff', fontSize: '1rem', whiteSpace: 'pre-wrap', minHeight: '24px' }}>{localText}</div>)}
        </div>
    );
};

const CustomShapeNode = ({ data, selected, id }) => {
    const isCircle = data.shapeType === 'circle';
    const isDiamond = data.shapeType === 'diamond';
    const [isEditing, setIsEditing] = useState(false);
    const [localLabel, setLocalLabel] = useState(data.label || 'Shape');
    const { updateNodeData } = useReactFlow();
    useEffect(() => { setLocalLabel(data.label || 'Shape'); }, [data.label]);
    const onBlur = () => { setIsEditing(false); updateNodeData(id, { label: localLabel }); };
    const base = { width: '120px', height: '120px', background: 'rgba(20,22,30,0.7)', border: `2px solid ${selected ? '#3b82f6' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', position: 'relative' };
    const style = isCircle ? { ...base, borderRadius: '50%' } : isDiamond ? { ...base, transform: 'rotate(45deg)' } : { ...base, borderRadius: '8px' };
    return (
        <div style={style} onDoubleClick={() => setIsEditing(true)}>
            {selected && !isEditing && <DeleteNodeButton id={id} />}
            <Handle type="target" position={Position.Top} style={{ background: 'var(--txt3)', border: 'none' }} />
            <Handle type="target" position={Position.Left} style={{ background: 'var(--txt3)', border: 'none' }} />
            {isEditing ? (<textarea className="nodrag nowheel" autoFocus value={localLabel} onChange={e => setLocalLabel(e.target.value)} onBlur={onBlur} onKeyDown={e => e.stopPropagation()} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', fontWeight: 600, outline: 'none', width: '100%', height: '100%', fontFamily: 'inherit', resize: 'none', textAlign: 'center', transform: isDiamond ? 'rotate(-45deg)' : 'none', padding: '16px', boxSizing: 'border-box' }} />) : (<span style={{ fontSize: '0.9rem', fontWeight: 600, transform: isDiamond ? 'rotate(-45deg)' : 'none', textAlign: 'center', padding: '8px', pointerEvents: 'none', wordBreak: 'break-word', maxWidth: '100%' }}>{localLabel}</span>)}
            <Handle type="source" position={Position.Bottom} style={{ background: 'var(--txt3)', border: 'none' }} />
            <Handle type="source" position={Position.Right} style={{ background: 'var(--txt3)', border: 'none' }} />
        </div>
    );
};

const nodeTypes = { systemNode: CustomSystemNode, textNode: CustomTextNode, shapeNode: CustomShapeNode };
const edgeTypes = { customEdge: CustomDeletableEdge };

// ─── Toolbar ──────────────────────────────────────────────────────────────────
const Toolbar = ({ edgeColor, setEdgeColor, edgeStyle, setEdgeStyle, drawMode, setDrawMode, eraserMode, setEraserMode, onClearDrawings }) => {
    const onDragStart = (event, nodeConfig) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeConfig));
        event.dataTransfer.effectAllowed = 'move';
    };
    const btn = (active, onClick, icon, label, danger = false) => (
        <button onClick={onClick} title={label}
            style={{
                display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, outline: 'none',
                background: active ? (danger ? 'rgba(239,71,67,0.2)' : 'rgba(59,130,246,0.2)') : 'rgba(255,255,255,0.04)',
                border: active ? `1px solid ${danger ? 'rgba(239,71,67,0.5)' : 'rgba(59,130,246,0.5)'}` : '1px solid rgba(255,255,255,0.08)',
                color: active ? (danger ? '#f87171' : '#60a5fa') : 'var(--txt3)'
            }}>
            {icon}{label}
        </button>
    );
    return (
        <div style={{ background: 'rgba(20,22,30,0.95)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {/* Row 1: Nodes */}
            <div style={{ height: '48px', display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '0 16px', gap: '8px', overflowX: 'auto' }}>
                {NODE_TYPES_CONFIG.map((item, index) => {
                    if (item.divider) return <div key={`div-${index}`} style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />;
                    return (
                        <div key={item.id} onDragStart={e => onDragStart(e, item)} draggable title={`${item.label}${item.sublabel ? ` (${item.sublabel})` : ''}`}
                            style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'grab', transition: 'all 0.2s', color: item.color, flexShrink: 0 }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                            <item.icon size={18} />
                        </div>
                    );
                })}
            </div>
            {/* Row 2: Drawing tools + colors + edge style */}
            <div style={{ height: '40px', display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '0 16px', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', overflowX: 'auto' }}>
                {btn(!drawMode && !eraserMode, () => { setDrawMode(false); setEraserMode(false); }, <MousePointer size={12} />, 'Select')}
                {btn(drawMode, () => { setDrawMode(true); setEraserMode(false); }, <Pencil size={12} />, 'Draw')}
                {btn(eraserMode, () => { setEraserMode(true); setDrawMode(false); }, <Eraser size={12} />, 'Erase')}
                <button onClick={onClearDrawings} title="Clear all drawings"
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', flexShrink: 0, outline: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--txt3)', transition: 'all 0.2s' }}>
                    <Trash2 size={12} /> Clear
                </button>
                <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--txt3)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>Color</span>
                {EDGE_COLORS.map(c => (
                    <button key={c.value} title={c.label} onClick={() => setEdgeColor(c.value)}
                        style={{ width: 18, height: 18, borderRadius: '50%', background: c.value, border: edgeColor === c.value ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', flexShrink: 0, transition: 'transform 0.15s', outline: 'none', boxSizing: 'border-box' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.25)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                ))}
                <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--txt3)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>Arrow</span>
                {EDGE_TYPES_OPTIONS.map(opt => (
                    <button key={opt.id} onClick={() => setEdgeStyle(opt.id)} title={opt.label}
                        style={{
                            padding: '2px 10px', fontSize: '0.72rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, outline: 'none',
                            background: edgeStyle === opt.id ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                            border: edgeStyle === opt.id ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                            color: edgeStyle === opt.id ? '#60a5fa' : 'var(--txt3)'
                        }}>
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ─── Drawing Canvas – fully synced to React Flow viewport ─────────────────────
// Strokes are stored in FLOW COORDINATES. Canvas re-renders whenever viewport changes.
const DrawingCanvas = ({ isActive, isEraser, color, strokes, onStrokeAdd, onClear }) => {
    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const currentStroke = useRef(null);
    const { x: vpX, y: vpY, zoom } = useViewport();

    // Convert client coords → flow coords
    const toFlow = useCallback((clientX, clientY) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left - vpX) / zoom,
            y: (clientY - rect.top - vpY) / zoom,
        };
    }, [vpX, vpY, zoom]);

    // Convert flow coords → canvas pixel coords
    const toCanvas = useCallback((fx, fy) => ({
        x: fx * zoom + vpX,
        y: fy * zoom + vpY,
    }), [vpX, vpY, zoom]);

    // ── Re-render all strokes whenever viewport or strokes list changes
    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const stroke of strokes) {
            if (stroke.points.length < 2) continue;
            ctx.beginPath();
            const p0 = toCanvas(stroke.points[0].x, stroke.points[0].y);
            ctx.moveTo(p0.x, p0.y);
            for (let i = 1; i < stroke.points.length; i++) {
                const p = toCanvas(stroke.points[i].x, stroke.points[i].y);
                ctx.lineTo(p.x, p.y);
            }
            ctx.globalCompositeOperation = stroke.isEraser ? 'destination-out' : 'source-over';
            ctx.strokeStyle = stroke.isEraser ? 'rgba(0,0,0,1)' : stroke.color;
            ctx.lineWidth = (stroke.isEraser ? 24 : 3) * stroke.zoomAtDraw / zoom;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }
        // reset composite
        ctx.globalCompositeOperation = 'source-over';
    }, [strokes, toCanvas, zoom]);

    // Resize canvas to fill parent
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        const resize = () => {
            canvas.width = parent.offsetWidth;
            canvas.height = parent.offsetHeight;
            redraw();
        };
        const ro = new ResizeObserver(resize);
        ro.observe(parent);
        resize();
        return () => ro.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Redraw when viewport or stroke list changes
    useEffect(() => { redraw(); }, [redraw, vpX, vpY, zoom]);

    const getClientPos = (e) => {
        if (e.touches) return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
        return { clientX: e.clientX, clientY: e.clientY };
    };

    const startDraw = (e) => {
        if (!isActive) return;
        e.preventDefault();
        isDrawingRef.current = true;
        const { clientX, clientY } = getClientPos(e);
        const fp = toFlow(clientX, clientY);
        currentStroke.current = {
            isEraser,
            color,
            zoomAtDraw: zoom,
            points: [fp],
        };
    };

    const continueDraw = (e) => {
        if (!isActive || !isDrawingRef.current || !currentStroke.current) return;
        e.preventDefault();
        const { clientX, clientY } = getClientPos(e);
        const fp = toFlow(clientX, clientY);
        currentStroke.current = {
            ...currentStroke.current,
            points: [...currentStroke.current.points, fp],
        };

        // Draw incremental line on canvas directly too (for zero-lag feel)
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const pts = currentStroke.current.points;
        if (pts.length >= 2) {
            const prev = toCanvas(pts[pts.length - 2].x, pts[pts.length - 2].y);
            const curr = toCanvas(pts[pts.length - 1].x, pts[pts.length - 1].y);
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(curr.x, curr.y);
            ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
            ctx.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : color;
            ctx.lineWidth = isEraser ? 24 : 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
        }
    };

    const stopDraw = () => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        if (currentStroke.current && currentStroke.current.points.length >= 2) {
            onStrokeAdd(currentStroke.current);
        }
        currentStroke.current = null;
    };

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                pointerEvents: isActive ? 'auto' : 'none',
                zIndex: isActive ? 20 : 0,
                cursor: isActive ? (isEraser ? 'cell' : 'crosshair') : 'default',
                touchAction: 'none',
            }}
            onMouseDown={startDraw}
            onMouseMove={continueDraw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={continueDraw}
            onTouchEnd={stopDraw}
        />
    );
};

// ─── Main Whiteboard Canvas ───────────────────────────────────────────────────
const WhiteboardCanvas = () => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [edgeColor, setEdgeColor] = useState('#a855f7');
    const [edgeStyle, setEdgeStyle] = useState('smoothstep');
    const [drawMode, setDrawMode] = useState(false);
    const [eraserMode, setEraserMode] = useState(false);
    const [strokes, setStrokes] = useState([]);
    const reactFlowWrapper = useRef(null);
    const { screenToFlowPosition } = useReactFlow();

    const onNodesChange = useCallback((changes) => setNodes(nds => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges(eds => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((connection) =>
        setEdges(eds => addEdge({ ...connection, type: 'customEdge', animated: true, data: { edgeType: edgeStyle }, style: { stroke: edgeColor, strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: edgeColor } }, eds)),
        [edgeColor, edgeStyle]);
    const onDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);
    const onDrop = useCallback((event) => {
        event.preventDefault();
        const configStr = event.dataTransfer.getData('application/reactflow');
        if (!configStr) return;
        const config = JSON.parse(configStr);
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        let newNode = { id: `node-${uuidv4()}`, type: config.component, position, data: {} };
        if (config.component === 'systemNode') newNode.data = { label: config.label, sublabel: config.sublabel, iconId: config.id, color: config.color };
        else if (config.component === 'textNode') newNode.data = { text: 'Type here...' };
        else if (config.component === 'shapeNode') newNode.data = { label: config.label, shapeType: config.shapeType };
        setNodes(nds => nds.concat(newNode));
    }, [screenToFlowPosition]);

    const isDrawing = drawMode || eraserMode;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#0a0c10' }}>
            <Toolbar
                edgeColor={edgeColor} setEdgeColor={setEdgeColor}
                edgeStyle={edgeStyle} setEdgeStyle={setEdgeStyle}
                drawMode={drawMode} setDrawMode={setDrawMode}
                eraserMode={eraserMode} setEraserMode={setEraserMode}
                onClearDrawings={() => setStrokes([])}
            />
            <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }} ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes} edges={edges}
                    onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                    onConnect={onConnect} onDrop={onDrop} onDragOver={onDragOver}
                    nodeTypes={nodeTypes} edgeTypes={edgeTypes}
                    panOnDrag={!isDrawing}
                    selectionOnDrag={!isDrawing}
                    nodeDragThreshold={isDrawing ? 999999 : 1}
                    fitView defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                    proOptions={{ hideAttribution: true }}
                    deleteKeyCode={['Backspace', 'Delete']}
                >
                    <Controls style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', padding: 0 }} />
                    <Background color="#1a1c23" gap={24} size={1} />
                </ReactFlow>

                {/* Drawing canvas is INSIDE the React Flow wrapper so it shares the same coordinate space reference */}
                <DrawingCanvas
                    isActive={isDrawing}
                    isEraser={eraserMode}
                    color={edgeColor}
                    strokes={strokes}
                    onStrokeAdd={(stroke) => setStrokes(s => [...s, stroke])}
                    onClear={() => setStrokes([])}
                />
            </div>
        </div>
    );
};

// ─── Wrapper Provider ────────────────────────────────────────────────────────
export default function SystemDesignBoard() {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flex: 1 }}>
            <ReactFlowProvider>
                <WhiteboardCanvas />
            </ReactFlowProvider>
        </div>
    );
}
