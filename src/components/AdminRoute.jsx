import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchProfile, queryKeys } from '../lib/api';

const ADMIN_UIDS = [
    // This is a temporary hardcoded list of super-admins until we integrate Firestore rules or the firebase-admin SDK fully.
    // The actual uid mapping should be checked.
    'sD1yZ4068yO9a88xIeM3n7rU6hU2', // Ayush Jaiswal (Sample UID - replacing will be needed with actual, usually from Firestore `isAdmin: true`)
];

export default function AdminRoute({ children }) {
    const { currentUser } = useAuth();
    
    // Instead of just relying on hardcoded admins, check if the profile has `role: 'admin'` or `isAdmin: true`
    const { data: profile, isLoading } = useQuery({
        queryKey: queryKeys.profile(currentUser?.uid),
        queryFn: () => fetchProfile(currentUser.uid),
        enabled: !!currentUser?.uid,
    });

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#fff' }}>
                <div style={{ animation: 'spin 1s linear infinite', border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', width: '24px', height: '24px' }} />
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Check if user is an admin either by UID list or by Firestore profile field
    const isAdmin = ADMIN_UIDS.includes(currentUser.uid) || profile?.isAdmin === true || profile?.role === 'admin';

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
