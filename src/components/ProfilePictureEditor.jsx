import React, { useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { X, ZoomIn, ZoomOut, Check, Sliders } from 'lucide-react';

const FILTERS = [
    { name: 'None', css: 'none' },
    { name: 'Grayscale', css: 'grayscale(100%)' },
    { name: 'Sepia', css: 'sepia(100%)' },
    { name: 'Contrast', css: 'contrast(150%)' },
    { name: 'Blur', css: 'blur(2px)' },
];

export default function ProfilePictureEditor({ file, onCancel, onSave, isSaving }) {
    const editorRef = useRef(null);
    const [scale, setScale] = useState(1.2);
    const [activeFilter, setActiveFilter] = useState(FILTERS[0].css);
    const [isLoaded, setIsLoaded] = useState(false);

    const handleSave = () => {
        if (!isLoaded) return;
        if (editorRef.current) {
            try {
                // Get the cropped image as a canvas
                const canvas = editorRef.current.getImageScaledToCanvas();

                // We apply the selected CSS filter to the Context before extracting the blob
                const ctx = canvas.getContext('2d');
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Capture current pixels
                
                // Create an offscreen canvas to apply the filter
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                
                if (activeFilter !== 'none') {
                    tempCtx.filter = activeFilter;
                }
                // Draw the original scaled image into the temp canvas applying the filter
                tempCtx.drawImage(editorRef.current.getImage(), 0, 0, canvas.width, canvas.height);

                tempCanvas.toBlob((blob) => {
                    if (blob) {
                        onSave(blob);
                    }
                }, 'image/jpeg', 0.95);
            } catch (err) {
                console.error("Avatar editor error:", err);
            }
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000, 
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', p: '1rem'
        }}>
            <div style={{
                background: '#121212', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px', padding: '1.5rem', width: '90%', maxWidth: '400px',
                display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Edit Picture</h3>
                    <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', background: '#0a0a0a', borderRadius: '16px', overflow: 'hidden' }}>
                    <AvatarEditor
                        ref={editorRef}
                        image={file}
                        width={250}
                        height={250}
                        border={20}
                        color={[0, 0, 0, 0.8]} // RGBA
                        scale={scale}
                        rotate={0}
                        style={{ filter: activeFilter }}
                        borderRadius={125}
                        onLoadSuccess={() => setIsLoaded(true)}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.6)' }}>
                        <ZoomOut size={16} />
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.01"
                            value={scale}
                            onChange={(e) => setScale(parseFloat(e.target.value))}
                            style={{ flex: 1, accentColor: '#a855f7' }}
                        />
                        <ZoomIn size={16} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}><Sliders size={14} /> Filters</div>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {FILTERS.map(f => (
                            <button
                                key={f.name}
                                onClick={() => setActiveFilter(f.css)}
                                style={{
                                    whiteSpace: 'nowrap',
                                    background: activeFilter === f.css ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${activeFilter === f.css ? '#a855f7' : 'transparent'}`,
                                    color: activeFilter === f.css ? '#fff' : 'rgba(255,255,255,0.6)',
                                    padding: '6px 14px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600,
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                {f.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                    <button
                        onClick={onCancel}
                        disabled={isSaving}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '12px', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !isLoaded}
                        style={{ flex: 1, background: 'linear-gradient(135deg, #a855f7, #3b82f6)', border: 'none', color: '#fff', padding: '10px', borderRadius: '12px', fontWeight: 700, cursor: (isSaving || !isLoaded) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: (isSaving || !isLoaded) ? 0.7 : 1 }}
                    >
                        {isSaving ? <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <><Check size={16} /> Save</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
