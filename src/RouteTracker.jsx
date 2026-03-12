/**
 * RouteTracker.jsx — Global Router Middleware Component
 *
 * Mount this ONCE inside <BrowserRouter> (and inside <AuthProvider>).
 * It runs on every route change and:
 *  1. Runs bootstrapTracking() to capture UTM & referrer on first load
 *  2. Fires a trackPageView() on every navigation event
 *  3. Attaches the authenticated user ID to analytics payloads
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { bootstrapTracking, trackPageView, captureUTMParams } from './utils/analytics';

let _bootstrapped = false;

export default function RouteTracker() {
    const location  = useLocation();
    const { currentUser } = useAuth();
    const prevPath  = useRef(null);

    // One-time bootstrap on app load
    useEffect(() => {
        if (!_bootstrapped) {
            bootstrapTracking();
            _bootstrapped = true;
        }
    }, []);

    // Track every route change
    useEffect(() => {
        // Re-capture UTM in case a link has new UTMs
        captureUTMParams();

        const userId = currentUser?.uid ?? null;
        const path = location.pathname + location.search;
        
        // Avoid double-firing on the exact same URL
        if (path === prevPath.current) return;
        prevPath.current = path;

        trackPageView(userId);
    }, [location, currentUser]);

    // Render nothing — this is a side-effect-only component
    return null;
}
