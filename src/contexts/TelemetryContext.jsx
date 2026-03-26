import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const TelemetryContext = createContext(null);

export const useTelemetry = () => useContext(TelemetryContext);

export function TelemetryProvider({ children, courseId, userId }) {
    const [events, setEvents] = useState([]);
    const [currentVideoId, setCurrentVideoId] = useState(null);
    const [videoWatchSeconds, setVideoWatchSeconds] = useState(0);

    const [savedProgress, setSavedProgress] = useState(() => {
        try { return JSON.parse(localStorage.getItem(`whizan_progress_${userId}`)) || {}; } 
        catch { return {}; }
    });

    const watchIntervalRef = useRef(null);
    const lastSessionRef = useRef({ lastVideoId: null, lastTimestamp: 0 });

    // In a real app, this flushes to the backend
    const flushEvents = useCallback(async () => {
        if (events.length === 0) return;
        console.log('[Telemetry] Flushing events:', events);
        // await fetch('/api/tracking/batch', { method: 'POST', body: JSON.stringify(events) });
        setEvents([]);
    }, [events]);

    const trackEvent = useCallback((type, payload) => {
        const ev = { type, timestamp: Date.now(), ...payload };
        setEvents(prev => [...prev, ev]);
        console.log('[Telemetry Track]', ev);
    }, []);

    // Video Tracking logic
    const onVideoStart = useCallback((videoId) => {
        setCurrentVideoId(videoId);
        trackEvent('VIDEO_START', { videoId });
    }, [trackEvent]);

    const onVideoProgress = useCallback((seconds, duration) => {
        setVideoWatchSeconds(seconds);
        // Save to refs to preserve exactly where user is
        lastSessionRef.current = { lastVideoId: currentVideoId, lastTimestamp: seconds };

        // Save to local storage for instant smart resume and progress UI
        if (currentVideoId) {
            setSavedProgress(prev => {
                // To support older sessions where we just saved a number
                const oldVal = prev[currentVideoId];
                const oldDuration = typeof oldVal === 'object' ? oldVal.duration : 0;
                
                const updated = { 
                    ...prev, 
                    [currentVideoId]: { time: seconds, duration: duration || oldDuration } 
                };
                localStorage.setItem(`whizan_progress_${userId}`, JSON.stringify(updated));
                return updated;
            });
        }
    }, [currentVideoId, userId]);

    const onVideoPause = useCallback(() => {
        trackEvent('VIDEO_PAUSE', { videoId: currentVideoId, timestampSec: videoWatchSeconds });
    }, [trackEvent, currentVideoId, videoWatchSeconds]);

    // Setup periodic flush
    useEffect(() => {
        const i = setInterval(() => {
            flushEvents();
        }, 30000); // Flush every 30s
        return () => clearInterval(i);
    }, [flushEvents]);

    const getSavedProgress = useCallback((videoId) => {
        const val = savedProgress[videoId];
        if (typeof val === 'object') return val.time || 0;
        return val || 0;
    }, [savedProgress]);

    const getSavedDuration = useCallback((videoId) => {
        const val = savedProgress[videoId];
        if (typeof val === 'object') return val.duration || 0;
        return 0;
    }, [savedProgress]);

    return (
        <TelemetryContext.Provider value={{
            trackEvent,
            onVideoStart,
            onVideoProgress,
            onVideoPause,
            getSavedProgress,
            getSavedDuration,
            lastSession: lastSessionRef.current
        }}>
            {children}
        </TelemetryContext.Provider>
    );
}
