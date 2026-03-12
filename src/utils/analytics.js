/**
 * analytics.js — Global Traffic & Navigation Tracking Utility
 *
 * Handles:
 *  - UTM parameter capture & persistence
 *  - HTTP Referrer tracking
 *  - Session ID management
 *  - Page view event logging
 *  - Navigation event logging
 *  - Traffic source classification
 */

// ─── Constants ─────────────────────────────────────────────────────────────
const STORAGE_KEY_UTM       = 'ca_utm';
const STORAGE_KEY_REFERRER  = 'ca_referrer';
const STORAGE_KEY_SESSION   = 'ca_session_id';
const STORAGE_KEY_FIRST_URL = 'ca_first_url';
const UTM_PARAMS            = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const API_BASE              = 'https://leetcode-orchestration-55z3.onrender.com';

// ─── Session ID ─────────────────────────────────────────────────────────────
export function getOrCreateSessionId() {
    let sid = sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (!sid) {
        sid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        sessionStorage.setItem(STORAGE_KEY_SESSION, sid);
    }
    return sid;
}

// ─── UTM Parameters ─────────────────────────────────────────────────────────
/**
 * Reads UTM params from the current URL and persists them to localStorage.
 * Only overwrites if new UTM params are present in this page load.
 */
export function captureUTMParams() {
    const params = new URLSearchParams(window.location.search);
    const utms = {};
    let found = false;

    UTM_PARAMS.forEach(key => {
        const val = params.get(key);
        if (val) { utms[key] = val; found = true; }
    });

    if (found) {
        localStorage.setItem(STORAGE_KEY_UTM, JSON.stringify({ ...utms, captured_at: new Date().toISOString() }));
    }

    return getStoredUTMParams();
}

export function getStoredUTMParams() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_UTM) || 'null'); }
    catch { return null; }
}

export function clearUTMParams() {
    localStorage.removeItem(STORAGE_KEY_UTM);
}

// ─── Referrer Tracking ──────────────────────────────────────────────────────
const REFERRER_PATTERNS = [
    { pattern: /google/i,      source: 'google',    medium: 'organic' },
    { pattern: /bing/i,        source: 'bing',      medium: 'organic' },
    { pattern: /yahoo/i,       source: 'yahoo',     medium: 'organic' },
    { pattern: /duckduckgo/i,  source: 'duckduckgo',medium: 'organic' },
    { pattern: /linkedin/i,    source: 'linkedin',  medium: 'social'  },
    { pattern: /twitter|x\.com/i, source: 'twitter',medium: 'social'  },
    { pattern: /facebook/i,    source: 'facebook',  medium: 'social'  },
    { pattern: /instagram/i,   source: 'instagram', medium: 'social'  },
    { pattern: /reddit/i,      source: 'reddit',    medium: 'social'  },
    { pattern: /github/i,      source: 'github',    medium: 'referral'},
    { pattern: /youtube/i,     source: 'youtube',   medium: 'video'   },
    { pattern: /t\.co/i,       source: 'twitter',   medium: 'social'  },
];

export function classifyReferrer(referrerUrl) {
    if (!referrerUrl) return { source: 'direct', medium: 'none', referrer: null };

    // Same-origin → internal navigation
    try {
        const ref = new URL(referrerUrl);
        if (ref.origin === window.location.origin) {
            return { source: 'internal', medium: 'internal', referrer: referrerUrl };
        }
        for (const rule of REFERRER_PATTERNS) {
            if (rule.pattern.test(ref.hostname)) {
                return { source: rule.source, medium: rule.medium, referrer: referrerUrl };
            }
        }
        return { source: ref.hostname, medium: 'referral', referrer: referrerUrl };
    } catch {
        return { source: 'direct', medium: 'none', referrer: null };
    }
}

/**
 * Captures the HTTP referrer on first visit and stores it.
 * Only captures once per session.
 */
export function captureReferrer() {
    const existingReferrer = sessionStorage.getItem(STORAGE_KEY_REFERRER);
    if (existingReferrer) {
        try { return JSON.parse(existingReferrer); } catch { return null; }
    }

    const rawReferrer = document.referrer || null;
    const classified  = classifyReferrer(rawReferrer);
    const data = {
        ...classified,
        raw:          rawReferrer,
        captured_at:  new Date().toISOString(),
        landing_page: window.location.pathname + window.location.search,
    };

    sessionStorage.setItem(STORAGE_KEY_REFERRER, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEY_REFERRER, JSON.stringify(data)); // persist long-term too
    return data;
}

export function getStoredReferrer() {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY_REFERRER) || localStorage.getItem(STORAGE_KEY_REFERRER) || 'null'); }
    catch { return null; }
}

// ─── Page View Event ────────────────────────────────────────────────────────
/**
 * Builds a complete analytics payload for the current page.
 */
export function buildPageViewPayload({ userId = null } = {}) {
    const params = new URLSearchParams(window.location.search);
    const qp = {};
    params.forEach((v, k) => { qp[k] = v; });

    return {
        event:          'page_view',
        timestamp:      new Date().toISOString(),
        session_id:     getOrCreateSessionId(),
        user_id:        userId,
        page: {
            url:        window.location.href,
            path:       window.location.pathname,
            search:     window.location.search,
            hash:       window.location.hash,
            title:      document.title,
        },
        query_params:   qp,
        utm:            getStoredUTMParams(),
        referrer:       getStoredReferrer(),
        browser: {
            user_agent: navigator.userAgent,
            language:   navigator.language,
            screen:     `${window.screen.width}x${window.screen.height}`,
            viewport:   `${window.innerWidth}x${window.innerHeight}`,
        },
    };
}

// ─── Event Logging ──────────────────────────────────────────────────────────
/**
 * Logs a custom analytics event.
 * Falls back to console in development.
 */
export async function track(eventName, props = {}, userId = null) {
    const payload = {
        event:      eventName,
        timestamp:  new Date().toISOString(),
        session_id: getOrCreateSessionId(),
        user_id:    userId,
        utm:        getStoredUTMParams(),
        referrer:   getStoredReferrer(),
        page: {
            url:    window.location.href,
            path:   window.location.pathname,
        },
        ...props,
    };

    // Fire Google Analytics if loaded
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, {
            session_id:  payload.session_id,
            utm_source:  payload.utm?.utm_source,
            utm_medium:  payload.utm?.utm_medium,
            utm_campaign:payload.utm?.utm_campaign,
            ...props,
        });
    }

    // Send to backend analytics endpoint (fire-and-forget)
    try {
        await fetch(`${API_BASE}/api/analytics/event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true, // survives page unload
        });
    } catch (_) {
        // Silently fail — analytics should never break the UX
        if (import.meta.env.DEV) {
            console.debug('[Analytics]', eventName, payload);
        }
    }

    return payload;
}

/**
 * Tracks a page view and sends it to the backend.
 */
export async function trackPageView(userId = null) {
    const payload = buildPageViewPayload({ userId });

    if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
            page_path:   payload.page.path,
            page_title:  payload.page.title,
            session_id:  payload.session_id,
        });
    }

    try {
        await fetch(`${API_BASE}/api/analytics/pageview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true,
        });
    } catch (_) {
        if (import.meta.env.DEV) {
            console.debug('[Analytics] page_view', payload);
        }
    }

    return payload;
}

// ─── Redirect Helpers ───────────────────────────────────────────────────────
/**
 * Builds a login URL that preserves the current page as ?redirect=...
 * and optionally attaches a ref parameter.
 */
export function buildLoginUrl({ ref = null } = {}) {
    const current = window.location.pathname + window.location.search;
    const params  = new URLSearchParams();
    // Don't redirect back to login/signup pages
    if (!current.startsWith('/login') && !current.startsWith('/signup')) {
        params.set('redirect', current);
    }
    if (ref) params.set('ref', ref);
    const qs = params.toString();
    return `/login${qs ? `?${qs}` : ''}`;
}

/**
 * Gets the redirect destination from the current URL's ?redirect= param.
 * Falls back to /dashboard.
 */
export function getRedirectDestination(fallback = '/dashboard') {
    try {
        const params   = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        if (!redirect) return fallback;
        // Safety: only allow same-origin relative paths
        const decoded  = decodeURIComponent(redirect);
        if (decoded.startsWith('/') && !decoded.startsWith('//')) return decoded;
        return fallback;
    } catch {
        return fallback;
    }
}

// ─── Bootstrap ──────────────────────────────────────────────────────────────
/**
 * Call once on app startup or on every route change.
 * Captures UTM params and referrer, creates a session ID.
 */
export function bootstrapTracking() {
    getOrCreateSessionId();
    captureUTMParams();
    captureReferrer();

    // Save first landing URL
    if (!sessionStorage.getItem(STORAGE_KEY_FIRST_URL)) {
        sessionStorage.setItem(STORAGE_KEY_FIRST_URL, window.location.href);
    }
}
