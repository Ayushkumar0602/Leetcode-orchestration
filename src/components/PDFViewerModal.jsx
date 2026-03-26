import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
    X, ZoomIn, ZoomOut, Download, FileText, Loader2,
    RotateCw, RotateCcw, Maximize2, Minimize2, Printer,
    ChevronFirst, ChevronLast, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).href;

// ── Per-page error boundary ───────────────────────────────────────────────────
class PageErrorBoundary extends React.Component {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError)
            return <div style={{ padding: 32, color: '#64748b', textAlign: 'center', background: '#0f172a', borderRadius: 6, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Page failed to render</div>;
        return this.props.children;
    }
}

// ── Toolbar icon button ───────────────────────────────────────────────────────
const TB = ({ onClick, title, children, danger, active }) => (
    <button
        onClick={onClick}
        title={title}
        style={{
            background: active ? 'rgba(59,130,246,0.2)' : danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${active ? 'rgba(59,130,246,0.4)' : danger ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`,
            color: active ? '#60a5fa' : danger ? '#f87171' : '#f1f5f9',
            padding: '7px 10px', borderRadius: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s', fontSize: '0.85rem', fontWeight: 600,
        }}
    >{children}</button>
);

// ── Lazy Page with per-page controls on hover ─────────────────────────────────
const LazyPage = React.memo(({ pageNumber, scale, width, rotation, onLoaded, onRotate }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        // Page 1 renders immediately — no scroll needed for instant first-page preview
        if (pageNumber === 1) { setVisible(true); return; }
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.01, rootMargin: '400px' }  // 400px pre-load buffer
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [pageNumber]);

    // Pick the effective dimension based on rotation
    const isRotated90 = rotation === 90 || rotation === 270;
    const pageW = isRotated90 ? undefined : width;
    const pageH = isRotated90 ? width : undefined;   // fit rotated page into same container width
    const estimatedH = Math.round(width * 1.414 * scale);

    return (
        <div
            ref={ref}
            data-page={pageNumber}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative', marginBottom: 12,
                borderRadius: 6, overflow: 'hidden',
                background: '#1e293b',
                minHeight: estimatedH,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: hovered ? '0 4px 24px rgba(59,130,246,0.2)' : '0 4px 20px rgba(0,0,0,0.4)',
                transition: 'box-shadow 0.2s',
            }}
        >
            {/* Floating per-page controls */}
            {hovered && loaded && (
                <div style={{
                    position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', gap: 6, zIndex: 10,
                    background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(8px)',
                    padding: '5px 10px', borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.1)',
                }}>
                    <button onClick={() => onRotate(pageNumber, -90)} title="Rotate left" style={miniBtn}>
                        <RotateCcw size={14} /> <span style={{ fontSize: '0.72rem', marginLeft: 3 }}>Left</span>
                    </button>
                    <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                    <button onClick={() => onRotate(pageNumber, 90)} title="Rotate right" style={miniBtn}>
                        <RotateCw size={14} /> <span style={{ fontSize: '0.72rem', marginLeft: 3 }}>Right</span>
                    </button>
                    {rotation !== 0 && (
                        <>
                            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                            <button onClick={() => onRotate(pageNumber, -rotation)} title="Reset rotation" style={{ ...miniBtn, color: '#94a3b8' }}>
                                ↺ Reset
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Page number badge */}
            <div style={{
                position: 'absolute', bottom: 10, right: 12, zIndex: 5,
                background: 'rgba(0,0,0,0.55)', color: '#94a3b8',
                fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                fontFamily: 'monospace', pointerEvents: 'none',
            }}>
                {pageNumber}{rotation !== 0 && ` · ${rotation}°`}
            </div>

            {/* Skeleton */}
            {!loaded && (
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 12, background: '#0f172a', zIndex: 1,
                }}>
                    <Loader2 size={22} color="#3b82f6" style={{ animation: 'pdf-spin 1s linear infinite' }} />
                    <span style={{ fontSize: '0.78rem', color: '#475569' }}>Loading page {pageNumber}…</span>
                </div>
            )}

            {visible && (
                <PageErrorBoundary>
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        width={pageW}
                        height={pageH}
                        rotate={rotation}
                        renderTextLayer
                        renderAnnotationLayer
                        loading={null}
                        error={null}
                        onRenderSuccess={() => { setLoaded(true); onLoaded(); }}
                        onRenderError={() => setLoaded(true)}
                    />
                </PageErrorBoundary>
            )}
        </div>
    );
});

const miniBtn = {
    background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer',
    display: 'flex', alignItems: 'center', padding: '2px 6px', borderRadius: 6,
    fontSize: '0.82rem', fontWeight: 600, gap: 2,
};

// ── PDF Viewer Modal ──────────────────────────────────────────────────────────
export default function PDFViewerModal({ material, onClose }) {
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(1.0);
    const [fitMode, setFitMode] = useState('width');      // 'width' | 'actual'
    const [loadError, setLoadError] = useState(null);
    const [docLoading, setDocLoading] = useState(true);
    const [loadedPages, setLoadedPages] = useState(0);
    const [rotations, setRotations] = useState({});        // { [pageNum]: degrees }
    const [fullscreen, setFullscreen] = useState(false);
    const [jumpInput, setJumpInput] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const scrollRef = useRef(null);
    const modalRef = useRef(null);

    const pdfOptions = useMemo(() => ({
        cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: 'https://unpkg.com/pdfjs-dist/standard_fonts/',
        // ── Range-request streaming (Google Drive approach) ──────────────────
        // pdfjs will fetch only the cross-ref table first (~few KB from EOF),
        // then fetch each page's byte-range on demand. The full file is NEVER
        // downloaded upfront. Requires the server to support Accept-Ranges
        // (Supabase Storage does).
        disableRange: false,        // keep HTTP range requests enabled (default)
        disableStream: false,       // keep streaming enabled (default)
        disableAutoFetch: true,     // ← THE KEY: stop pdfjs eagerly downloading
                                    //   the whole file before showing anything
    }), []);

    const containerWidth = fitMode === 'width'
        ? Math.min(window.innerWidth * (fullscreen ? 0.9 : 0.78), 960) - 80
        : 595; // A4 actual width at 72dpi

    const getRotation = (pNum) => rotations[pNum] ?? 0;

    const rotateOne = useCallback((pNum, delta) => {
        setRotations(prev => {
            const cur = prev[pNum] ?? 0;
            const next = ((cur + delta) % 360 + 360) % 360;
            return { ...prev, [pNum]: next };
        });
    }, []);

    const rotateAll = (delta) => {
        if (!numPages) return;
        setRotations(prev => {
            const next = { ...prev };
            for (let i = 1; i <= numPages; i++) {
                const cur = next[i] ?? 0;
                next[i] = ((cur + delta) % 360 + 360) % 360;
            }
            return next;
        });
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setDocLoading(false);
    };

    const onDocumentLoadError = (err) => {
        console.error('PDF error:', err);
        setLoadError(err?.message || 'Failed to load');
        setDocLoading(false);
    };

    const handleLoaded = useCallback(() => setLoadedPages(p => p + 1), []);

    const zoom = (delta) => {
        setFitMode('custom');
        setScale(s => Math.min(3, Math.max(0.4, parseFloat((s + delta).toFixed(1)))));
    };

    // Observe which page is in view
    useEffect(() => {
        if (!numPages || !scrollRef.current) return;
        const obs = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter(e => e.isIntersecting);
                if (visible.length) {
                    const nums = visible.map(e => parseInt(e.target.dataset.page)).filter(Boolean);
                    if (nums.length) setCurrentPage(Math.min(...nums));
                }
            },
            { root: scrollRef.current, threshold: 0.3 }
        );
        const els = scrollRef.current.querySelectorAll('[data-page]');
        els.forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, [numPages, loadedPages]);

    // Jump to page
    const jumpToPage = (pNum) => {
        const p = Math.max(1, Math.min(numPages, parseInt(pNum) || 1));
        const el = scrollRef.current?.querySelector(`[data-page="${p}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setCurrentPage(p);
    };

    // Print
    const handlePrint = () => {
        const win = window.open(material.url, '_blank');
        win?.addEventListener('load', () => win.print());
    };

    // Fullscreen
    const toggleFullscreen = () => {
        if (!fullscreen) {
            modalRef.current?.requestFullscreen?.().catch(() => {});
        } else {
            document.exitFullscreen?.().catch(() => {});
        }
        setFullscreen(f => !f);
    };

    // Esc to close
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') { if (fullscreen) document.exitFullscreen?.(); else onClose(); }
            if (e.key === 'ArrowRight' || e.key === 'PageDown') jumpToPage(currentPage + 1);
            if (e.key === 'ArrowLeft' || e.key === 'PageUp') jumpToPage(currentPage - 1);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose, fullscreen, currentPage, numPages]);

    const isPDF = material.type?.includes('pdf') || material.url?.toLowerCase().endsWith('.pdf');
    const isImage = material.type?.startsWith('image/');

    return (
        <div
            ref={modalRef}
            onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{
                position: 'fixed', inset: 0, zIndex: 2000,
                background: 'rgba(0,8,20,0.95)', backdropFilter: 'blur(8px)',
                display: 'flex', flexDirection: 'column',
            }}
        >
            <style>{`
                @keyframes pdf-spin { to { transform: rotate(360deg); } }
                .pdf-scroll::-webkit-scrollbar { width: 6px; }
                .pdf-scroll::-webkit-scrollbar-track { background: #0a0f1e; }
                .pdf-scroll::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.35); border-radius: 4px; }
            `}</style>

            {/* ── TOOLBAR ── */}
            <div style={{
                display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8,
                padding: '8px 16px', background: 'rgba(5,10,25,0.98)',
                borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
            }}>
                {/* File name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 120 }}>
                    <FileText size={18} color={isPDF ? '#ef4444' : '#3b82f6'} />
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260 }}>
                            {material.name}
                        </div>
                        {numPages && <div style={{ fontSize: '0.7rem', color: '#475569' }}>{numPages} pages · {loadedPages} rendered</div>}
                    </div>
                </div>

                {isPDF && numPages && (<>
                    {/* Divider */}
                    <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }} />

                    {/* Page navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <TB onClick={() => jumpToPage(1)} title="First page"><ChevronFirst size={15} /></TB>
                        <TB onClick={() => jumpToPage(currentPage - 1)} title="Previous page"><ChevronsLeft size={15} /></TB>
                        <form onSubmit={e => { e.preventDefault(); jumpToPage(jumpInput); setJumpInput(''); }}>
                            <input
                                value={jumpInput}
                                onChange={e => setJumpInput(e.target.value)}
                                placeholder={`${currentPage}`}
                                style={{
                                    width: 40, textAlign: 'center', background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9',
                                    borderRadius: 6, padding: '5px 4px', fontSize: '0.82rem', fontFamily: 'monospace',
                                }}
                            />
                        </form>
                        <span style={{ color: '#475569', fontSize: '0.78rem', minWidth: 20 }}>/ {numPages}</span>
                        <TB onClick={() => jumpToPage(currentPage + 1)} title="Next page"><ChevronsRight size={15} /></TB>
                        <TB onClick={() => jumpToPage(numPages)} title="Last page"><ChevronLast size={15} /></TB>
                    </div>

                    <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }} />

                    {/* Zoom */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <TB onClick={() => zoom(-0.1)} title="Zoom out (-)"><ZoomOut size={15} /></TB>
                        <button
                            onClick={() => setFitMode(m => m === 'width' ? 'actual' : 'width')}
                            title="Toggle fit/actual size"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'monospace', minWidth: 46, textAlign: 'center' }}
                        >
                            {Math.round(scale * 100)}%
                        </button>
                        <TB onClick={() => zoom(0.1)} title="Zoom in (+)"><ZoomIn size={15} /></TB>
                    </div>

                    <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }} />

                    {/* Rotate All */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <TB onClick={() => rotateAll(-90)} title="Rotate ALL pages left"><RotateCcw size={15} /></TB>
                        <TB onClick={() => rotateAll(90)} title="Rotate ALL pages right"><RotateCw size={15} /></TB>
                    </div>

                    <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }} />

                    {/* Print */}
                    <TB onClick={handlePrint} title="Print"><Printer size={15} /></TB>
                </>)}

                {/* Fullscreen */}
                <TB onClick={toggleFullscreen} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} active={fullscreen}>
                    {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </TB>

                {/* Download */}
                <a
                    href={material.url} download={material.name} target="_blank" rel="noreferrer"
                    style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd', padding: '7px 12px', borderRadius: 8, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}
                >
                    <Download size={14} /> Save
                </a>

                {/* Close */}
                <TB onClick={onClose} title="Close (Esc)" danger><X size={17} /></TB>
            </div>

            {/* Progress bar */}
            {numPages && loadedPages < numPages && (
                <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', flexShrink: 0 }}>
                    <div style={{ height: '100%', width: `${Math.round((loadedPages / numPages) * 100)}%`, background: 'linear-gradient(90deg,#3b82f6,#818cf8)', transition: 'width 0.4s ease' }} />
                </div>
            )}

            {/* Content */}
            <div ref={scrollRef} className="pdf-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {isPDF ? (
                    <>
                        {docLoading && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 80 }}>
                                <Loader2 size={36} color="#3b82f6" style={{ animation: 'pdf-spin 1s linear infinite' }} />
                                <div style={{ color: '#475569', fontSize: '0.9rem' }}>Fetching document…</div>
                            </div>
                        )}
                        {loadError && (
                            <div style={{ marginTop: 60, padding: 32, textAlign: 'center', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, maxWidth: 480, color: '#fca5a5' }}>
                                <FileText size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
                                <p style={{ margin: 0, fontWeight: 600 }}>Could not render PDF</p>
                                <p style={{ margin: '8px 0 16px', fontSize: '0.85rem', color: '#ef4444' }}>{loadError}</p>
                                <a href={material.url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: '0.88rem' }}>Open in new tab ↗</a>
                            </div>
                        )}
                        <Document file={material.url} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError} loading={null} error={null} options={pdfOptions}>
                            {numPages && Array.from({ length: numPages }, (_, i) => i + 1).map(pNum => (
                                <div key={pNum} style={{ width: Math.round(containerWidth * scale) + 80 }}>
                                    <LazyPage
                                        pageNumber={pNum}
                                        scale={scale}
                                        width={containerWidth}
                                        rotation={getRotation(pNum)}
                                        onLoaded={handleLoaded}
                                        onRotate={rotateOne}
                                    />
                                </div>
                            ))}
                        </Document>
                    </>
                ) : isImage ? (
                    <img src={material.url} alt={material.name} style={{ maxWidth: '90%', maxHeight: '85vh', borderRadius: 12, objectFit: 'contain' }} />
                ) : (
                    <div style={{ marginTop: 80, textAlign: 'center', color: '#64748b' }}>
                        <FileText size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
                        <p>Preview not available for this file type.</p>
                        <a href={material.url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: '0.9rem' }}>Open in new tab ↗</a>
                    </div>
                )}
            </div>
        </div>
    );
}
