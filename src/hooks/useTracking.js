/**
 * useTracking.js — Hook for component-level analytics event tracking
 *
 * Usage:
 *   const { track, trackClick } = useTracking();
 *   <button onClick={() => trackClick('start_interview', { problem_id: id })}>Start</button>
 */

import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { track as _track, buildLoginUrl, getRedirectDestination } from '../utils/analytics';

export default function useTracking() {
    const { currentUser } = useAuth();
    const location = useLocation();

    const userId = currentUser?.uid ?? null;

    /**
     * Generic event tracker.
     * @param {string} eventName 
     * @param {object} props — extra key-value pairs to attach to the event
     */
    const track = useCallback((eventName, props = {}) => {
        return _track(eventName, props, userId);
    }, [userId]);

    /**
     * Track a button/link click.
     */
    const trackClick = useCallback((elementName, props = {}) => {
        return _track('click', { element: elementName, ...props }, userId);
    }, [userId]);

    /**
     * Track a search action.
     */
    const trackSearch = useCallback((query, props = {}) => {
        return _track('search', { query, ...props }, userId);
    }, [userId]);

    /**
     * Track a feature engagement.
     */
    const trackFeature = useCallback((featureName, props = {}) => {
        return _track('feature_used', { feature: featureName, ...props }, userId);
    }, [userId]);

    /**
     * Build a login URL that preserves current page as ?redirect=...
     */
    const getLoginUrl = useCallback((ref = null) => {
        return buildLoginUrl({ ref });
    }, [location]);

    /**
     * Get the ?redirect= destination from current URL.
     */
    const getPostLoginDestination = useCallback((fallback = '/dashboard') => {
        return getRedirectDestination(fallback);
    }, [location]);

    return {
        track,
        trackClick,
        trackSearch,
        trackFeature,
        getLoginUrl,
        getPostLoginDestination,
        userId,
    };
}
