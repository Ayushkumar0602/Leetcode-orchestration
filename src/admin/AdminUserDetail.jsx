import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ExternalLink, Loader2, Save, User, FileJson, MessageSquare, ShieldAlert, ArrowLeft, List, Bell, Database } from 'lucide-react';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://leetcode-orchestration.onrender.com';

const TABs = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'profile', label: 'Profile', icon: FileJson },
  { id: 'interviews', label: 'Interviews', icon: MessageSquare },
  { id: 'submissions', label: 'Submissions', icon: List },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'realtime', label: 'Realtime', icon: Database },
  { id: 'raw', label: 'Raw JSON', icon: FileJson },
];

function pillStyle(active) {
  return {
    background: active ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
    border: active ? '1px solid rgba(59,130,246,0.30)' : '1px solid rgba(255,255,255,0.10)',
    color: active ? '#93c5fd' : '#fff',
    borderRadius: 12,
    padding: '8px 12px',
    fontWeight: 900,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.85rem',
  };
}

export default function AdminUserDetail() {
  const { uid } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [data, setData] = useState(null);
  const [authEditor, setAuthEditor] = useState('');
  const [profileEditor, setProfileEditor] = useState('');
  const [rawEditor, setRawEditor] = useState('');

  const auth = data?.auth || null;
  const profile = data?.profile || data?.userProfiles?.data || null;

  const fetchOverview = async () => {
    if (!currentUser || !uid) return;
    setLoading(true);
    setError(null);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${VITE_API_BASE_URL}/api/admin/users/${uid}/detail`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to load user');
       setData(prev => ({ ...prev, ...json }));
      setAuthEditor(JSON.stringify(json.auth || {}, null, 2));
      setProfileEditor(JSON.stringify(json.profile || {}, null, 2));
      setRawEditor(JSON.stringify(json || {}, null, 2));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tab) => {
    if (!currentUser || !uid || data?.[tab]) return;
    const token = await currentUser.getIdToken();
    try {
      setLoading(true);
      let endpoint = '';
      if (tab === 'interviews') endpoint = `/api/admin/db/interviews?whereField=userId&whereOp===&whereValue=${uid}`;
      else if (tab === 'submissions') endpoint = `/api/admin/db/submissions?whereField=userId&whereOp===&whereValue=${uid}`;
      else if (tab === 'notifications') endpoint = `/api/admin/db/users/${uid}/notifications`;
      else return;

      const res = await fetch(`${VITE_API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok) {
        setData(prev => ({ ...prev, [tab]: json.docs || [] }));
      }
    } catch (e) {
      console.error("Tab fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, currentUser?.uid]);

  useEffect(() => {
    if (activeTab === 'interviews' || activeTab === 'submissions' || activeTab === 'notifications') {
      fetchTabData(activeTab);
    }
  }, [activeTab]);

  const save = async () => {
    if (!currentUser || !uid) return;
    setSaving(true);
    try {
      const token = await currentUser.getIdToken();
      const authPatch = JSON.parse(authEditor || '{}');
      const profilePatch = JSON.parse(profileEditor || '{}');
      const res = await fetch(`${VITE_API_BASE_URL}/api/admin/users/${uid}/detail`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth: authPatch, profile: profilePatch }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to save');
      await fetchOverview();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const statsCards = useMemo(() => {
    // Only shows counts if data is loaded else shows ? to indicate lazy load
    const interviews = data?.interviews ? data.interviews.length : '?';
    const submissions = data?.submissions ? data.submissions.length : '?';
    const lists = data?.lists ? data.lists.length : '?';
    const notifs = data?.notifications ? data.notifications.length : '?';
    return [
      { label: 'Interviews', value: interviews, color: '#60a5fa' },
      { label: 'Submissions', value: submissions, color: '#34d399' },
      { label: 'Lists', value: lists, color: '#fbbf24' },
      { label: 'Notifications', value: notifs, color: '#c084fc' },
    ];
  }, [data]);

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <button
            onClick={() => navigate('/admin/users')}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: '10px 12px', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 900 }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 950, letterSpacing: '-0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {auth?.displayName || profile?.displayName || 'User'} <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>({uid})</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 700, fontSize: '0.9rem' }}>
              {auth?.email || profile?.email || '—'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => window.open(`/public/${uid}`, '_blank')}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: '10px 12px', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 900 }}
          >
            <ExternalLink size={16} /> Public profile
          </button>
          <button
            onClick={save}
            disabled={saving || loading}
            style={{ background: 'rgba(59,130,246,0.16)', border: '1px solid rgba(59,130,246,0.30)', borderRadius: 12, padding: '10px 12px', color: '#93c5fd', cursor: saving || loading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 950, opacity: saving || loading ? 0.7 : 1 }}
          >
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Save
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', padding: 14, borderRadius: 14, color: '#fca5a5', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
          <ShieldAlert size={18} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        {TABs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={pillStyle(activeTab === t.id)}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.55)' }}>
          <Loader2 size={28} className="spin" style={{ margin: '0 auto 10px' }} />
          Loading user data…
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16, alignItems: 'start' }}>
              <div style={{ background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 18, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                    {(auth?.photoURL || profile?.photoURL) ? (
                      <img src={auth?.photoURL || profile?.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', fontWeight: 950 }}>
                        {(auth?.displayName || profile?.displayName || 'U').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 950, fontSize: '1.05rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {auth?.displayName || profile?.displayName || 'User'}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 700, fontSize: '0.9rem' }}>
                      {auth?.email || profile?.email || '—'}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <span style={{ background: auth?.disabled ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)', border: `1px solid ${auth?.disabled ? 'rgba(239,68,68,0.30)' : 'rgba(16,185,129,0.30)'}`, padding: '6px 10px', borderRadius: 999, fontWeight: 950, color: auth?.disabled ? '#fca5a5' : '#6ee7b7', fontSize: '0.78rem' }}>
                      {auth?.disabled ? 'Suspended' : 'Active'}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {statsCards.map(s => (
                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 14 }}>
                      <div style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 950, color: s.color, marginTop: 4 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 16 }}>
                <div style={{ fontWeight: 950, marginBottom: 10 }}>Quick edits</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 700, fontSize: '0.85rem', marginBottom: 10 }}>
                  Edit the JSON in Profile/Auth tabs and press Save.
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'rgba(255,255,255,0.70)', lineHeight: 1.5 }}>
                  <div><strong>Auth</strong>: displayName, email, photoURL, disabled</div>
                  <div><strong>Profile</strong>: role, isAdmin, plan, preferences, portfolio data</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={{ background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 950, marginBottom: 10 }}>Auth (editable JSON)</div>
                  <textarea value={authEditor} onChange={(e) => setAuthEditor(e.target.value)} rows={18} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14, padding: 12, color: '#e8e8e8', outline: 'none', fontFamily: 'monospace', fontSize: '0.82rem' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 950, marginBottom: 10 }}>Firestore `userProfiles/{uid}` (editable JSON)</div>
                  <textarea value={profileEditor} onChange={(e) => setProfileEditor(e.target.value)} rows={18} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14, padding: 12, color: '#e8e8e8', outline: 'none', fontFamily: 'monospace', fontSize: '0.82rem' }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interviews' && (
            <div style={{ background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ padding: 14, borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 950 }}>Interviews</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: 12, textAlign: 'left', color: 'rgba(255,255,255,0.55)' }}>Title</th>
                      <th style={{ padding: 12, textAlign: 'left', color: 'rgba(255,255,255,0.55)' }}>Status</th>
                      <th style={{ padding: 12, textAlign: 'left', color: 'rgba(255,255,255,0.55)' }}>Score</th>
                      <th style={{ padding: 12, textAlign: 'left', color: 'rgba(255,255,255,0.55)' }}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.interviews || []).map(i => (
                      <tr key={i.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: 12, color: '#fff', fontWeight: 800 }}>{i.problemTitle || i.role || 'Interview'}</td>
                        <td style={{ padding: 12, color: 'rgba(255,255,255,0.75)' }}>{i.status || '—'}</td>
                        <td style={{ padding: 12, color: 'rgba(255,255,255,0.75)' }}>{i.overallScore ?? '—'}</td>
                        <td style={{ padding: 12, color: 'rgba(255,255,255,0.55)' }}>{i.createdAt ? new Date(i.createdAt).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                    {(data?.interviews || []).length === 0 && (
                      <tr><td colSpan={4} style={{ padding: 18, color: 'rgba(255,255,255,0.55)' }}>No interviews found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div style={{ background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ padding: 14, borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 950 }}>Submissions</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: 12, textAlign: 'left', color: 'rgba(255,255,255,0.55)' }}>Problem</th>
                      <th style={{ padding: 12, textAlign: 'left', color: 'rgba(255,255,255,0.55)' }}>Result</th>
                      <th style={{ padding: 12, textAlign: 'left', color: 'rgba(255,255,255,0.55)' }}>Lang</th>
                      <th style={{ padding: 12, textAlign: 'left', color: 'rgba(255,255,255,0.55)' }}>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.submissions || []).map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: 12, color: '#fff', fontWeight: 800 }}>{s.problemTitle || s.problemId || '—'}</td>
                        <td style={{ padding: 12, color: 'rgba(255,255,255,0.75)' }}>{s.accepted === true ? 'Accepted' : s.accepted === false ? 'Rejected' : (s.result || '—')}</td>
                        <td style={{ padding: 12, color: 'rgba(255,255,255,0.75)' }}>{s.language || '—'}</td>
                        <td style={{ padding: 12, color: 'rgba(255,255,255,0.55)' }}>{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : (s.createdAt ? new Date(s.createdAt).toLocaleString() : '—')}</td>
                      </tr>
                    ))}
                    {(data?.submissions || []).length === 0 && (
                      <tr><td colSpan={4} style={{ padding: 18, color: 'rgba(255,255,255,0.55)' }}>No submissions found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ padding: 14, borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 950 }}>Notifications (Firestore subcollection)</div>
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(data?.notifications || []).slice(0, 200).map(n => (
                  <div key={n.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ fontWeight: 950 }}>{n.title || 'Notification'}</div>
                      <div style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 800, fontSize: '0.8rem' }}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : '—'}</div>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.70)', marginTop: 6, lineHeight: 1.4 }}>{n.message || n.body || ''}</div>
                    {n.link && (
                      <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: '0.78rem', color: '#93c5fd' }}>{n.link}</div>
                    )}
                  </div>
                ))}
                {(data?.notifications || []).length === 0 && (
                  <div style={{ color: 'rgba(255,255,255,0.55)' }}>No notifications.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'realtime' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 16 }}>
                <div style={{ fontWeight: 950, marginBottom: 10 }}>RTDB Sessions</div>
                <pre style={{ margin: 0, color: '#e8e8e8', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14, padding: 12, fontFamily: 'monospace', fontSize: '0.78rem', overflow: 'auto' }}>
                  {JSON.stringify(data?.rtdb?.sessions || null, null, 2)}
                </pre>
              </div>
              <div style={{ background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 16 }}>
                <div style={{ fontWeight: 950, marginBottom: 10 }}>RTDB Connect requests & connections</div>
                <pre style={{ margin: 0, color: '#e8e8e8', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14, padding: 12, fontFamily: 'monospace', fontSize: '0.78rem', overflow: 'auto' }}>
                  {JSON.stringify({ connectRequests: data?.rtdb?.connectRequests || null, connections: data?.rtdb?.connections || null }, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div style={{ background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 16 }}>
              <div style={{ fontWeight: 950, marginBottom: 10 }}>Raw (read-only snapshot)</div>
              <textarea value={rawEditor} readOnly rows={22} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14, padding: 12, color: '#e8e8e8', outline: 'none', fontFamily: 'monospace', fontSize: '0.82rem' }} />
            </div>
          )}
        </>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

