// Centralized API fetch functions and query key factories for TanStack Query.
// Every component should import fetch functions and query keys from here.

const BASE = 'https://leetcode-orchestration.onrender.com';

// ─── Query Key Factories ─────────────────────────────────────────────────────
// These produce stable, de-duped cache keys. Components must only use these.
export const queryKeys = {
    profile: (uid) => ['profile', uid],
    stats:   (uid) => ['stats', uid],
    interviews: (uid) => ['interviews', uid],
    interviewDetail: (id) => ['interview', id],
    problems: (params) => ['problems', params],
    metadata: () => ['metadata'],
    lists:   (uid) => ['lists', uid],
    activity: (uid) => ['activity', uid],
};

// ─── API Functions ───────────────────────────────────────────────────────────

export const fetchProfile = async (uid) => {
    const res = await fetch(`${BASE}/api/profile/${uid}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.profile || null;
};

export const fetchStats = async (uid) => {
    const res = await fetch(`${BASE}/api/stats/user/${uid}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return { userStats: data.userStats || {}, totalCounts: data.totalCounts || {} };
};

export const fetchInterviews = async (uid) => {
    const res = await fetch(`${BASE}/api/interviews/${uid}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.interviews || [];
};

export const fetchActivity = async (uid) => {
    const res = await fetch(`${BASE}/api/activity/${uid}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
};

export const fetchInterviewDetail = async (id) => {
    const res = await fetch(`${BASE}/api/interviews/detail/${id}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
};

export const fetchProblems = async ({ page = 1, search = '', topics = [], companies = [] }) => {
    const params = new URLSearchParams({
        page,
        limit: 20,
        search,
        topics: topics.join(','),
        companies: companies.join(','),
    });
    const res = await fetch(`${BASE}/api/problems?${params}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return { problems: data.data || [], totalPages: data.totalPages || 1 };
};

export const fetchMetadata = async () => {
    const res = await fetch(`${BASE}/api/metadata`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return {
        topics:    (data.topics    || []).map(t => ({ value: t, label: t })),
        companies: (data.companies || []).map(c => ({ value: c, label: c })),
    };
};

export const fetchLists = async (uid) => {
    const res = await fetch(`${BASE}/api/lists/${uid}`);
    const data = await res.json();
    return data.lists || [];
};

// ─── Update helpers (used by ProfilePage mutations) ──────────────────────────

export const postProfile = async (uid, payload) => {
    await fetch(`${BASE}/api/profile/${uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
};

export const createList = async (userId, name) => {
    const res = await fetch(`${BASE}/api/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name }),
    });
    return res.json();
};
