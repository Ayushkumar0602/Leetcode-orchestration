import { useState, useEffect, useRef } from 'react';
import { Flame, Trophy, Calendar, BarChart3, Zap, Code2, ChevronRight, Target } from 'lucide-react';

/* ── helpers ─────────────────────────────────────────────────── */
function toDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function buildWeeks(dailyCounts) {
    const today = new Date();
    const end = new Date(today);
    const start = new Date(today);
    start.setDate(start.getDate() - 363); // ~52 weeks back
    // snap start to Sunday
    start.setDate(start.getDate() - start.getDay());

    const weeks = [];
    let current = new Date(start);
    while (current <= end) {
        const week = [];
        for (let i = 0; i < 7; i++) {
            const key = toDateStr(current);
            week.push({ date: key, count: dailyCounts[key] || 0, inFuture: current > today });
            current.setDate(current.getDate() + 1);
        }
        weeks.push(week);
    }
    return weeks;
}

function getIntensity(count) {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
}

const INTENSITY_COLORS = ['var(--surface2)', '#0e4429', '#006d32', '#26a641', '#39d353'];

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];

// Generate upcoming contest dates
function buildContests() {
    const now = new Date();
    const contests = [];
    // Weekly: every Sunday 8am IST
    for (let i = 0; i < 3; i++) {
        const d = new Date(now);
        const daysUntilSunday = (7 - d.getDay()) % 7 || 7;
        d.setDate(d.getDate() + daysUntilSunday + i * 7);
        d.setHours(8, 0, 0, 0);
        contests.push({ name: `Weekly Contest ${418 + i}`, type: 'Weekly', date: d });
    }
    // Biweekly: every other Saturday 8pm IST
    for (let i = 0; i < 2; i++) {
        const d = new Date(now);
        const daysUntilSat = (6 - d.getDay() + 7) % 7 || 7;
        d.setDate(d.getDate() + daysUntilSat + i * 14);
        d.setHours(20, 0, 0, 0);
        contests.push({ name: `Biweekly Contest ${154 + i}`, type: 'Biweekly', date: d });
    }
    contests.sort((a, b) => a.date - b.date);
    return contests;
}

function useCountdown(targetDate) {
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
        const update = () => {
            const diff = targetDate - new Date();
            if (diff <= 0) { setTimeLeft('Live now!'); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${h}h ${m}m ${s}s`);
        };
        update();
        const t = setInterval(update, 1000);
        return () => clearInterval(t);
    }, [targetDate]);
    return timeLeft;
}

/* ── sub-components ──────────────────────────────────────────── */
function HeatmapTab({ activityData, uid }) {
    const [tooltip, setTooltip] = useState(null);
    const weeks = buildWeeks(activityData?.dailyCounts || {});

    // Build month markers
    const monthMarkers = [];
    weeks.forEach((week, wi) => {
        const firstDay = week.find(d => !d.inFuture);
        if (!firstDay) return;
        const m = new Date(firstDay.date).getMonth();
        if (wi === 0 || new Date(weeks[wi - 1][0].date).getMonth() !== m) {
            monthMarkers.push({ wi, month: m });
        }
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Metrics row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                    { icon: <Flame size={14} color="#f97316" />, label: 'Streak', value: `${activityData?.currentStreak ?? 0} days` },
                    { icon: <Trophy size={14} color="var(--accent)" />, label: 'Best', value: `${activityData?.longestStreak ?? 0} days` },
                    { icon: <Calendar size={14} color="#8b5cf6" />, label: 'Active', value: `${activityData?.totalActiveDays ?? 0} days` },
                    { icon: <Zap size={14} color="#06b6d4" />, label: 'Submissions', value: activityData?.totalSubmissions ?? 0 },
                ].map(m => (
                    <div key={m.label} style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {m.icon}
                        <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--txt3)', lineHeight: 1 }}>{m.label}</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--txt)', lineHeight: 1.4 }}>{m.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Heatmap */}
            <div style={{ overflowX: 'auto', position: 'relative' }}>
                {/* Month Labels */}
                <div style={{ display: 'flex', marginLeft: '24px', marginBottom: '2px', height: '14px', position: 'relative' }}>
                    {monthMarkers.map(({ wi, month }) => (
                        <span key={wi} style={{ position: 'absolute', left: `${wi * 11}px`, fontSize: '0.6rem', color: 'var(--txt3)', whiteSpace: 'nowrap' }}>
                            {MONTH_LABELS[month]}
                        </span>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '1px' }}>
                    {/* Day labels */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginRight: '3px', paddingTop: '0px' }}>
                        {DAY_LABELS.map((d, i) => (
                            <span key={i} style={{ height: '10px', fontSize: '0.55rem', color: 'var(--txt3)', lineHeight: '10px', textAlign: 'right', display: 'flex', alignItems: 'center' }}>{d}</span>
                        ))}
                    </div>
                    {/* Grid */}
                    {weeks.map((week, wi) => (
                        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            {week.map((cell) => (
                                <div
                                    key={cell.date}
                                    title={`${cell.date}: ${cell.count} submission${cell.count !== 1 ? 's' : ''}`}
                                    onMouseEnter={e => setTooltip({ date: cell.date, count: cell.count, x: e.clientX, y: e.clientY })}
                                    onMouseLeave={() => setTooltip(null)}
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '2px',
                                        background: cell.inFuture ? 'transparent' : INTENSITY_COLORS[getIntensity(cell.count)],
                                        cursor: cell.count > 0 ? 'pointer' : 'default',
                                        transition: 'transform 0.1s',
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
                {/* Legend */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--txt3)' }}>Less</span>
                    {INTENSITY_COLORS.map((c, i) => <div key={i} style={{ width: '10px', height: '10px', background: c, borderRadius: '2px', border: '1px solid rgba(255,255,255,.05)' }} />)}
                    <span style={{ fontSize: '0.6rem', color: 'var(--txt3)' }}>More</span>
                </div>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div style={{ position: 'fixed', top: tooltip.y - 48, left: tooltip.x - 60, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', fontSize: '0.75rem', color: 'var(--txt)', zIndex: 9999, pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                    <div style={{ fontWeight: 600 }}>{tooltip.date}</div>
                    <div style={{ color: 'var(--txt2)' }}>{tooltip.count} submission{tooltip.count !== 1 ? 's' : ''}</div>
                </div>
            )}
        </div>
    );
}

function DailyChallengeTab({ uid, activityData }) {
    // Seed today's daily problem off the current date
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const dailyProblemId = (seed % 1820) + 1;
    const todayStr = toDateStr(today);
    const completedToday = !!(activityData?.dailyCounts?.[todayStr]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={16} color="var(--accent)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--txt)' }}>Today's Challenge</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--txt3)' }}>{today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>

            <div style={{ background: 'var(--surface2)', borderRadius: '12px', padding: '14px', border: `1px solid ${completedToday ? 'var(--pass)' : 'var(--border)'}`, transition: 'border-color 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: completedToday ? 'var(--pass)' : 'var(--warn)', background: completedToday ? 'rgba(0,184,163,0.15)' : 'rgba(255,161,22,0.15)', padding: '2px 8px', borderRadius: '999px' }}>
                        {completedToday ? '✓ Completed' : '⏳ Pending'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--txt3)' }}>#{dailyProblemId}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--txt2)', margin: '0 0 12px' }}>
                    Complete today's challenge to maintain your streak!
                </p>
                <button
                    onClick={() => window.location.href = `/solvingpage/${dailyProblemId}?lang=python`}
                    style={{ width: '100%', background: completedToday ? 'var(--surface)' : 'var(--accent)', color: completedToday ? 'var(--txt2)' : '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                    {completedToday ? '✓ Solved Today' : 'Solve Now'} <ChevronRight size={14} />
                </button>
            </div>

            {/* Streak flame */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'var(--surface2)', borderRadius: '10px' }}>
                <Flame size={22} color="#f97316" />
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f97316', lineHeight: 1 }}>{activityData?.currentStreak ?? 0}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--txt3)' }}>day streak</div>
                </div>
            </div>
        </div>
    );
}

function ContestCard({ contest }) {
    const countdown = useCountdown(contest.date);
    return (
        <div style={{ background: 'var(--surface2)', borderRadius: '12px', padding: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--txt)' }}>{contest.name}</span>
                <span style={{ fontSize: '0.65rem', background: contest.type === 'Weekly' ? 'rgba(99,102,241,0.2)' : 'rgba(236,72,153,0.2)', color: contest.type === 'Weekly' ? '#818cf8' : '#f472b6', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                    {contest.type}
                </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--txt3)' }}>
                {contest.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {contest.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>⏱ {countdown}</span>
                <button
                    onClick={() => window.location.href = '/aiinterview'}
                    style={{ fontSize: '0.7rem', background: 'var(--accent)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                    Compete
                </button>
            </div>
        </div>
    );
}

function ContestsTab() {
    const contests = buildContests();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--txt3)', margin: 0 }}>Upcoming contests on whizan:</p>
            {contests.map((c, i) => <ContestCard key={i} contest={c} />)}
        </div>
    );
}

function StatsTab({ activityData, userStats, totalCounts }) {
    const monthly = activityData?.monthlyData || {};
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const key = `${y}-${m}`;
        return { label: MONTH_LABELS[d.getMonth()], count: monthly[key] || 0 };
    });
    const maxBar = Math.max(...months.map(m => m.count), 1);

    const difficulties = [
        { label: 'Easy', count: userStats?.Easy || 0, total: totalCounts?.Easy || 1, color: 'var(--pass)' },
        { label: 'Medium', count: userStats?.Medium || 0, total: totalCounts?.Medium || 1, color: 'var(--warn)' },
        { label: 'Hard', count: userStats?.Hard || 0, total: totalCounts?.Hard || 1, color: 'var(--fail)' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Monthly bar chart */}
            <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt2)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BarChart3 size={13} /> Monthly Submissions
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '60px' }}>
                    {months.map(m => (
                        <div key={m.label} title={`${m.label}: ${m.count}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'default' }}>
                            <div style={{ width: '100%', background: m.count ? 'var(--accent)' : 'var(--surface2)', height: `${Math.max((m.count / maxBar) * 52, m.count ? 6 : 4)}px`, borderRadius: '3px 3px 0 0', transition: 'height 0.3s' }} />
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '3px' }}>
                    {months.map(m => (
                        <div key={m.label} style={{ flex: 1, textAlign: 'center', fontSize: '0.5rem', color: 'var(--txt3)', marginTop: '3px' }}>{m.label}</div>
                    ))}
                </div>
            </div>

            {/* Difficulty breakdown */}
            <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--txt2)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code2 size={13} /> Difficulty Breakdown
                </div>
                {difficulties.map(d => (
                    <div key={d.label} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                            <span style={{ color: d.color, fontWeight: 600 }}>{d.label}</span>
                            <span style={{ color: 'var(--txt)' }}><strong>{d.count}</strong> <span style={{ color: 'var(--txt3)' }}>/ {d.total}</span></span>
                        </div>
                        <div style={{ width: '100%', height: '5px', background: 'var(--surface2)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${(d.count / d.total) * 100}%`, height: '100%', background: d.color, borderRadius: '999px', transition: 'width 0.5s ease' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── main component ──────────────────────────────────────────── */
export default function ActivityCalendar({ uid, userStats, totalCounts, containerStyle }) {
    const [activityData, setActivityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('heatmap');

    useEffect(() => {
        if (!uid) { setLoading(false); return; }
        setLoading(true);
        fetch(`https://leetcode-orchestration.onrender.com/api/activity/${uid}`)
            .then(r => r.json())
            .then(data => { if (!data.error) setActivityData(data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [uid]);

    const TABS = [
        { id: 'heatmap', label: 'Activity', icon: <Flame size={12} /> },
        { id: 'daily', label: 'Daily', icon: <Target size={12} /> },
        { id: 'contests', label: 'Contests', icon: <Zap size={12} /> },
        { id: 'stats', label: 'Stats', icon: <BarChart3 size={12} /> },
    ];

    return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '14px', ...containerStyle }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="var(--accent)" />
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--txt)' }}>Activity</span>
            </div>

            {/* Tab bar */}
            <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            padding: '5px 4px',
                            background: activeTab === t.id ? 'var(--surface)' : 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            color: activeTab === t.id ? 'var(--txt)' : 'var(--txt3)',
                            fontSize: '0.7rem',
                            fontWeight: activeTab === t.id ? 700 : 400,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            boxShadow: activeTab === t.id ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                        }}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--txt3)', fontSize: '0.8rem', padding: '1.5rem 0' }}>Loading activity…</div>
            ) : !uid ? (
                <div style={{ textAlign: 'center', color: 'var(--txt3)', fontSize: '0.8rem', padding: '1rem 0' }}>Log in to see your activity</div>
            ) : (
                <>
                    {activeTab === 'heatmap' && <HeatmapTab activityData={activityData} uid={uid} />}
                    {activeTab === 'daily' && <DailyChallengeTab uid={uid} activityData={activityData} />}
                    {activeTab === 'contests' && <ContestsTab />}
                    {activeTab === 'stats' && <StatsTab activityData={activityData} userStats={userStats} totalCounts={totalCounts} />}
                </>
            )}
        </div>
    );
}
