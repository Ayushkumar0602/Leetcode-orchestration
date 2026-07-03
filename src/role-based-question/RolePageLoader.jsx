import React, { Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function RolePageLoader() {
    const { category, role } = useParams();
    const navigate = useNavigate();

    // Dynamically import the role component
    const RoleComponent = lazy(() => {
        // We need to be careful with the path for dynamic imports in Vite/Webpack
        // Using template literals usually works if the path prefix is static
        return import(`./roles/${category}/${role}.jsx`)
            .catch(err => {
                console.error("Failed to load role component:", err);
                return { default: () => <RoleNotFound /> };
            });
    });

    return (
        <Suspense fallback={<LoadingState />}>
            <RoleComponent />
        </Suspense>
    );
}

function LoadingState() {
    return (
        <div style={{ 
            minHeight: '100vh', background: '#050505', color: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem'
        }}>
            <Loader2 size={40} className="spin" style={{ color: '#6366f1' }} />
            <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Tailoring the interview experience...</p>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

function RoleNotFound() {
    const navigate = useNavigate();
    return (
        <div style={{ 
            minHeight: '100vh', background: '#050505', color: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem'
        }}>
            <AlertCircle size={64} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Role Not Found</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '500px', marginBottom: '2rem' }}>
                We couldn't find the specific role you're looking for. It might be under construction or moved.
            </p>
            <button 
                onClick={() => navigate('/role-based-question')}
                style={{
                    background: '#6366f1', color: '#fff', border: 'none',
                    padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}
            >
                <ArrowLeft size={18} /> Back to Roles
            </button>
        </div>
    );
}
