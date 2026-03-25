import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ref, onValue, push, set, update, serverTimestamp } from 'firebase/database';
import { MessageSquare, UserPlus, Check, CheckCheck, X, Paperclip, Send, ExternalLink, Loader2, File as FileIcon } from 'lucide-react';
import NavProfile from './NavProfile';
import { useAuth } from './contexts/AuthContext';
import { rtdb } from './firebase';
import { uploadChatFile } from './lib/s3';
import { fetchProfile } from './lib/api';
import { useQueries } from '@tanstack/react-query';

function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function makeConversationId(a, b) {
  return [a, b].sort().join('__');
}

export default function Chat() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const qp = useQueryParams();

  const preselectUid = qp.get('uid');
  const preselectTab = qp.get('tab');

  const [activeTab, setActiveTab] = useState(preselectTab === 'requests' ? 'requests' : 'chats'); // 'chats' | 'requests'
  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]); // [{uid, ...profileHints}]
  const [activePeerUid, setActivePeerUid] = useState(preselectUid || null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);

  const myUid = currentUser?.uid;
  const activeConversationId = myUid && activePeerUid ? makeConversationId(myUid, activePeerUid) : null;

  const [preview, setPreview] = useState(null); // { url, mime, name }
  const textInputRef = useRef(null);
  const [conversationsMeta, setConversationsMeta] = useState({});

  useEffect(() => {
    if (!currentUser) return;

    const reqRef = ref(rtdb, `connectRequests/${currentUser.uid}`);
    const connRef = ref(rtdb, `connections/${currentUser.uid}`);

    const unsubReq = onValue(reqRef, (snap) => {
      const v = snap.val() || {};
      const arr = Object.entries(v).map(([fromUid, data]) => ({ fromUid, ...data }));
      arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setRequests(arr);
    });

    const unsubConn = onValue(connRef, (snap) => {
      const v = snap.val() || {};
      const arr = Object.entries(v)
        .filter(([, ok]) => ok)
        .map(([uid]) => ({ uid }));
      setConnections(arr);
      if (!activePeerUid && preselectUid && arr.some(x => x.uid === preselectUid)) {
        setActivePeerUid(preselectUid);
      }
    });

    return () => {
      unsubReq();
      unsubConn();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    setMessages([]);
    if (!activeConversationId) return;

    const msgRef = ref(rtdb, `chats/${activeConversationId}/messages`);
    const unsub = onValue(msgRef, (snap) => {
      const v = snap.val() || {};
      const arr = Object.entries(v).map(([id, m]) => ({ id, ...m }));
      arr.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setMessages(arr);
      requestAnimationFrame(() => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      });

      // Mark unread messages as delivered/seen
      if (!myUid || !activeConversationId) return;
      
      let changed = false;
      const updates = {};
      arr.forEach(m => {
        if (m.senderUid !== myUid) {
          if (m.status === 'sent') {
            updates[`messages/${m.id}/status`] = 'delivered';
            changed = true;
          }
          if (m.status !== 'seen') {
            updates[`messages/${m.id}/status`] = 'seen';
            changed = true;
          }
        }
      });
      if (changed) {
        update(ref(rtdb, `chats/${activeConversationId}`), updates).catch(() => {});
      }
    });

    return () => unsub();
  }, [activeConversationId]);

  const uidsToFetch = useMemo(() => {
    const uids = new Set();
    connections.forEach(c => c?.uid && uids.add(c.uid));
    requests.forEach(r => r?.fromUid && uids.add(r.fromUid));
    if (activePeerUid) uids.add(activePeerUid);
    return Array.from(uids);
  }, [connections, requests, activePeerUid]);

  const profileQueries = useQueries({
    queries: uidsToFetch.map(uid => ({
      queryKey: ['profile', uid],
      queryFn: async () => {
        try {
          const p = await fetchProfile(uid);
          return p || { displayName: 'User', photoURL: '' };
        } catch {
          return { displayName: 'User', photoURL: '' };
        }
      },
      staleTime: 1000 * 60 * 30, // cache profiles for 30 minutes natively
    })),
  });

  const profilesByUid = useMemo(() => {
    const lookup = {};
    uidsToFetch.forEach((uid, index) => {
      lookup[uid] = profileQueries[index]?.data || { displayName: 'User', photoURL: '' };
    });
    return lookup;
  }, [uidsToFetch, profileQueries]);

  useEffect(() => {
    if (!myUid || !connections.length) return;
    const unsubs = connections.map(c => {
      if (!c.uid) return () => {};
      const cid = makeConversationId(myUid, c.uid);
      const metaRef = ref(rtdb, `chats/${cid}/meta`);
      return onValue(metaRef, (snap) => {
        setConversationsMeta(prev => ({ ...prev, [c.uid]: snap.val() || {} }));
      });
    });
    return () => unsubs.forEach(u => u());
  }, [connections, myUid]);

  useEffect(() => {
    if (!activeConversationId || !myUid) return;
    update(ref(rtdb, `chats/${activeConversationId}/meta`), {
      [`unread_${myUid}`]: null, // clear unread flag when opening chat
    }).catch(() => {});

    // Proactively mark all messages from peer as seen when chat becomes active
    const msgRef = ref(rtdb, `chats/${activeConversationId}/messages`);
    onValue(msgRef, (snap) => {
      const v = snap.val();
      if (!v) return;
      const updates = {};
      let changed = false;
      Object.entries(v).forEach(([id, m]) => {
        if (m.senderUid !== myUid) {
          if (m.status === 'sent') {
            updates[`messages/${id}/status`] = 'delivered';
            changed = true;
          }
          if (m.status !== 'seen') {
            updates[`messages/${id}/status`] = 'seen';
            changed = true;
          }
        }
      });
      if (changed) update(ref(rtdb, `chats/${activeConversationId}`), updates).catch(() => {});
    }, { onlyOnce: true });
  }, [activeConversationId, myUid]);

  const peerProfile = activePeerUid ? profilesByUid[activePeerUid] : null;
  const peerName = peerProfile?.displayName || peerProfile?.name || (activePeerUid || '');
  const peerPhoto = peerProfile?.photoURL || '';

  const isImageMime = (mime) => typeof mime === 'string' && mime.startsWith('image/');
  const isVideoMime = (mime) => typeof mime === 'string' && mime.startsWith('video/');
  const isAudioMime = (mime) => typeof mime === 'string' && mime.startsWith('audio/');

  const acceptRequest = async (fromUid) => {
    if (!currentUser) return;
    const toUid = currentUser.uid;
    const conversationId = makeConversationId(fromUid, toUid);
    const now = Date.now();

    await update(ref(rtdb, `connectRequests/${toUid}/${fromUid}`), {
      status: 'accepted',
      respondedAt: serverTimestamp(),
    });

    await update(ref(rtdb), {
      [`connections/${toUid}/${fromUid}`]: true,
      [`connections/${fromUid}/${toUid}`]: true,
      [`chats/${conversationId}/meta`]: {
        participants: { [toUid]: true, [fromUid]: true },
        createdAt: now,
        createdAtServer: serverTimestamp(),
      },
    });

    setActiveTab('chats');
    setActivePeerUid(fromUid);
  };

  const declineRequest = async (fromUid) => {
    if (!currentUser) return;
    await update(ref(rtdb, `connectRequests/${currentUser.uid}/${fromUid}`), {
      status: 'declined',
      respondedAt: serverTimestamp(),
    });
  };

  const sendText = async () => {
    if (!currentUser || !activeConversationId) return;
    const t = text.trim();
    if (!t) return;
    setSending(true);
    try {
      const msgRef = push(ref(rtdb, `chats/${activeConversationId}/messages`));
      await set(msgRef, {
        type: 'text',
        text: t,
        senderUid: currentUser.uid,
        createdAt: serverTimestamp(),
        status: 'sent',
      });
      await update(ref(rtdb, `chats/${activeConversationId}/meta`), {
        lastMessageAt: serverTimestamp(),
        lastMessagePreview: t.slice(0, 120),
        [`unread_${activePeerUid}`]: true,
      });
      setText('');
    } finally {
      setSending(false);
      setTimeout(() => textInputRef.current?.focus(), 10);
    }
  };

  const sendFile = async (file) => {
    if (!currentUser || !activeConversationId || !file) return;
    setUploading(true);
    try {
      const url = await uploadChatFile(file, { conversationId: activeConversationId, senderUid: currentUser.uid });
      const msgRef = push(ref(rtdb, `chats/${activeConversationId}/messages`));
      await set(msgRef, {
        type: 'file',
        senderUid: currentUser.uid,
        createdAt: serverTimestamp(),
        status: 'sent',
        file: {
          name: file.name,
          size: file.size,
          mime: file.type,
          url,
        },
      });
      await update(ref(rtdb, `chats/${activeConversationId}/meta`), {
        lastMessageAt: serverTimestamp(),
        lastMessagePreview: `📎 ${file.name}`,
        [`unread_${activePeerUid}`]: true,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => textInputRef.current?.focus(), 10);
    }
  };

  const canUseChat = !!currentUser;

  if (!canUseChat) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
              <img src="/logo.jpeg" alt="Whizan AI" style={{ width: '28px', height: '28px', borderRadius: '8px' }} />
              <span style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Whizan AI</span>
            </div>
            <NavProfile />
          </div>
        </div>
        <div style={{ margin: '0 auto', maxWidth: 900, width: '100%', padding: '3rem 1.5rem' }}>
          <div style={{ background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '2rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px' }}>Sign in to use chat</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>You need to be logged in to view connection requests and messages.</div>
            <button
              onClick={() => navigate('/login?redirect=' + encodeURIComponent('/chat'))}
              style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)', border: 'none', borderRadius: '12px', padding: '10px 16px', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <img src="/logo.jpeg" alt="Whizan AI" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
            <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Whizan AI</span>
          </div>
          <NavProfile />
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1rem', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 6 }}>
              <MessageSquare size={18} color="#60a5fa" />
              <span style={{ fontWeight: 900, letterSpacing: '-0.03em', fontSize: '1.35rem' }}>Chat</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>Connect requests and 1:1 messages.</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setActiveTab('chats')}
              style={{
                background: activeTab === 'chats' ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              style={{
                background: activeTab === 'requests' ? 'rgba(168,85,247,0.18)' : 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Requests {requests.filter(r => r.status === 'pending').length ? `(${requests.filter(r => r.status === 'pending').length})` : ''}
            </button>
          </div>
        </div>

        <div className="chat-grid" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
          {/* Left rail */}
          <div style={{ background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {activeTab === 'requests' ? <UserPlus size={16} color="#a855f7" /> : <MessageSquare size={16} color="#60a5fa" />}
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{activeTab === 'requests' ? 'Connect requests' : 'Connections'}</span>
            </div>

            <div style={{ padding: 10, overflow: 'auto', flex: 1 }}>
              {activeTab === 'requests' ? (
                requests.length === 0 ? (
                  <div style={{ padding: 14, color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>No requests yet.</div>
                ) : (
                  requests.map(r => (
                    <div key={r.fromUid} style={{ padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                            {(r.fromPhotoURL || profilesByUid[r.fromUid]?.photoURL) ? (
                              <img src={r.fromPhotoURL || profilesByUid[r.fromUid]?.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', fontWeight: 900 }}>
                                {(r.fromName || profilesByUid[r.fromUid]?.displayName || 'U').slice(0, 1).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <div style={{ fontWeight: 900, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {r.fromName || profilesByUid[r.fromUid]?.displayName || 'User'}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {r.fromUid}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/public/${r.fromUid}`)}
                          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '6px 10px', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}
                          title="View portfolio"
                        >
                          <ExternalLink size={14} /> View
                        </button>
                      </div>
                      {r.message && <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', lineHeight: 1.4 }}>{r.message}</div>}

                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        {r.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => acceptRequest(r.fromUid)}
                              style={{ flex: 1, background: 'linear-gradient(135deg,#10b981,#34d399)', border: 'none', borderRadius: 12, padding: '10px 12px', color: '#042f2e', cursor: 'pointer', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                            >
                              <Check size={16} /> Accept
                            </button>
                            <button
                              onClick={() => declineRequest(r.fromUid)}
                              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 12, padding: '10px 12px', color: '#fca5a5', cursor: 'pointer', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                            >
                              <X size={16} /> Decline
                            </button>
                          </>
                        ) : (
                          <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 800, fontSize: '0.85rem' }}>
                            Status: {r.status}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )
              ) : (
                connections.length === 0 ? (
                  <div style={{ padding: 14, color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>No connections yet. Accept a request to start chatting.</div>
                ) : (
                  connections.map(c => {
                    const meta = conversationsMeta[c.uid];
                    const isUnread = meta?.[`unread_${myUid}`];
                    const lastMsg = meta?.lastMessagePreview;

                    return (
                      <button
                        key={c.uid}
                        onClick={() => setActivePeerUid(c.uid)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: 12,
                          borderRadius: 14,
                          border: activePeerUid === c.uid ? '1px solid rgba(59,130,246,0.5)' : (isUnread ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(255,255,255,0.06)'),
                          background: activePeerUid === c.uid ? 'rgba(59,130,246,0.12)' : (isUnread ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.02)'),
                          color: '#fff',
                          cursor: 'pointer',
                          marginBottom: 10,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                            {profilesByUid[c.uid]?.photoURL ? (
                              <img src={profilesByUid[c.uid]?.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', fontWeight: 900 }}>
                                {(profilesByUid[c.uid]?.displayName || 'U').slice(0, 1).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: isUnread ? 900 : 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {profilesByUid[c.uid]?.displayName || profilesByUid[c.uid]?.name || 'User'}
                            </div>
                            <div style={{ color: isUnread ? '#fff' : 'rgba(255,255,255,0.55)', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isUnread ? 800 : 400 }}>
                              {lastMsg || 'Tap to open chat'}
                            </div>
                          </div>
                          {isUnread && (
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#60a5fa', flexShrink: 0 }} />
                          )}
                        </div>
                      </button>
                    );
                  })
                )
              )}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ background: 'rgba(20,22,30,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                {activePeerUid ? (
                  <>
                    <div style={{ width: 34, height: 34, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                      {peerPhoto ? (
                        <img src={peerPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', fontWeight: 900 }}>
                          {(peerName || 'U').slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{peerName}</div>
                      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {profilesByUid[activePeerUid]?.email || activePeerUid}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ fontWeight: 900 }}>Select a connection</div>
                )}
              </div>
              {activePeerUid && (
                <button
                  onClick={() => navigate(`/public/${activePeerUid}`)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '6px 10px', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <ExternalLink size={14} /> Portfolio
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
              {!activePeerUid ? (
                <div style={{ padding: 18, color: 'rgba(255,255,255,0.55)' }}>Pick a connection on the left to start messaging.</div>
              ) : (
                <>
                  {messages.length === 0 ? (
                    <div style={{ padding: 18, color: 'rgba(255,255,255,0.55)' }}>No messages yet. Say hello.</div>
                  ) : (
                    messages.map(m => {
                      const mine = m.senderUid === myUid;
                      const mime = m?.file?.mime || '';
                      return (
                        <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                          <div
                            style={{
                              maxWidth: '78%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: mine ? 'flex-end' : 'flex-start',
                            }}
                          >
                            <div
                              style={{
                                padding: '10px 12px',
                                borderRadius: 14,
                                background: mine ? 'rgba(59,130,246,0.22)' : 'rgba(255,255,255,0.06)',
                                border: mine ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(255,255,255,0.08)',
                                width: '100%',
                              }}
                            >
                            {m.type === 'file' && m.file ? (
                              <div>
                                {isImageMime(mime) ? (
                                  <button
                                    onClick={() => setPreview({ url: m.file.url, mime, name: m.file.name })}
                                    style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                                    title="Preview"
                                  >
                                    <img src={m.file.url} alt={m.file.name} style={{ maxWidth: 260, width: '100%', borderRadius: 12, border: '1px solid rgba(255,255,255,0.10)', display: 'block' }} />
                                  </button>
                                ) : isVideoMime(mime) ? (
                                  <video src={m.file.url} controls style={{ maxWidth: 320, width: '100%', borderRadius: 12, border: '1px solid rgba(255,255,255,0.10)' }} />
                                ) : isAudioMime(mime) ? (
                                  <audio src={m.file.url} controls style={{ width: 260 }} />
                                ) : (
                                  <button
                                    onClick={() => setPreview({ url: m.file.url, mime, name: m.file.name })}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: 10, cursor: 'pointer', color: '#fff', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}
                                    title="Open"
                                  >
                                    <div style={{ width: 34, height: 34, borderRadius: 12, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <FileIcon size={16} color="#bfdbfe" />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                      <div style={{ fontWeight: 900, color: '#bfdbfe', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.file.name}</div>
                                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>Tap to preview / download</div>
                                    </div>
                                  </button>
                                )}
                                <a href={m.file.url} target="_blank" rel="noreferrer" style={{ marginTop: 8, color: '#bfdbfe', textDecoration: 'none', fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                  <Paperclip size={14} />
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.file.name}</span>
                                </a>
                              </div>
                            ) : (
                              <div style={{ color: '#fff', whiteSpace: 'pre-wrap', lineHeight: 1.4, wordBreak: 'break-word' }}>{m.text}</div>
                            )}
                            </div>
                            
                            {/* Status indicator for active user's messages */}
                            {mine && (
                              <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, color: m.status === 'seen' ? '#3b82f6' : 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                                {m.status === 'seen' ? (
                                  <><CheckCheck size={14} /> <span>Seen</span></>
                                ) : m.status === 'delivered' ? (
                                  <><CheckCheck size={14} /> <span>Delivered</span></>
                                ) : (
                                  <><Check size={14} /> <span>Sent</span></>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} style={{ height: 1 }} />
                </>
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                ref={textInputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendText();
                  }
                }}
                disabled={!activePeerUid || sending || uploading}
                placeholder={activePeerUid ? 'Write a message…' : 'Select a connection to chat'}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 14,
                  padding: '10px 12px',
                  color: '#fff',
                  outline: 'none',
                  fontWeight: 600,
                }}
              />
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => sendFile(e.target.files?.[0])}
                disabled={!activePeerUid || uploading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!activePeerUid || uploading}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 14,
                  width: 44,
                  height: 44,
                  color: '#fff',
                  cursor: !activePeerUid || uploading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Attach file"
              >
                {uploading ? <Loader2 size={18} className="spin" /> : <Paperclip size={18} />}
              </button>
              <button
                onClick={sendText}
                disabled={!activePeerUid || sending || uploading || !text.trim()}
                style={{
                  background: 'linear-gradient(135deg,#a855f7,#3b82f6)',
                  border: 'none',
                  borderRadius: 14,
                  width: 44,
                  height: 44,
                  color: '#fff',
                  cursor: !activePeerUid || sending || uploading || !text.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Send"
              >
                {sending ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(920px, 100%)',
              maxHeight: 'min(86vh, 720px)',
              background: 'rgba(20,22,30,0.9)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: '0 40px 120px rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview.name}</div>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: '8px 12px', color: '#fff', textDecoration: 'none', fontWeight: 900 }}
                >
                  Open
                </a>
                <button
                  onClick={() => setPreview(null)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, padding: '8px 12px', color: '#fff', cursor: 'pointer', fontWeight: 900 }}
                >
                  Close
                </button>
              </div>
            </div>
            <div style={{ padding: 14, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isImageMime(preview.mime) ? (
                <img src={preview.url} alt={preview.name} style={{ maxWidth: '100%', maxHeight: '72vh', borderRadius: 14, border: '1px solid rgba(255,255,255,0.10)' }} />
              ) : isVideoMime(preview.mime) ? (
                <video src={preview.url} controls style={{ width: '100%', maxHeight: '72vh', borderRadius: 14, border: '1px solid rgba(255,255,255,0.10)' }} />
              ) : isAudioMime(preview.mime) ? (
                <audio src={preview.url} controls style={{ width: '100%' }} />
              ) : preview.mime === 'application/pdf' ? (
                <object data={preview.url} type="application/pdf" style={{ width: '100%', height: '72vh', borderRadius: 14, background: '#fff' }}>
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <div style={{ color: '#fff', fontWeight: 900, marginBottom: 8 }}>Unable to display PDF inline</div>
                    <a href={preview.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#a855f7,#3b82f6)', borderRadius: 14, padding: '10px 14px', color: '#fff', textDecoration: 'none', fontWeight: 900 }}>
                      <ExternalLink size={16} /> Open PDF
                    </a>
                  </div>
                </object>
              ) : (preview.mime && preview.mime.includes('word')) || preview.name.endsWith('.doc') || preview.name.endsWith('.docx') ? (
                <iframe 
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(preview.url)}`} 
                  title={preview.name} 
                  sandbox="allow-scripts allow-same-origin allow-popups"
                  style={{ width: '100%', height: '72vh', borderRadius: 14, border: 'none', background: '#fff' }} 
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 900, marginBottom: 8 }}>No inline preview available</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Open the file in a new tab to view/download.</div>
                  <a href={preview.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#a855f7,#3b82f6)', borderRadius: 14, padding: '10px 14px', color: '#fff', textDecoration: 'none', fontWeight: 900 }}>
                    <ExternalLink size={16} /> Open file
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        /* Scrollbar styles applied globally */
        html, body, div, textarea {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
        }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }
        @media (max-width: 980px) {
          .chat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

