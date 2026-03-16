import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, ExternalLink, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { listenActiveCampaigns, listenCampaignReceipts, setCampaignReceipt } from "../lib/notifications";
import { listenForegroundFcmMessages, registerFcmToken } from "../lib/fcm";

const toastWrapStyle = {
  position: "fixed",
  right: 16,
  bottom: 16,
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

function Toast({ title, message, onClose, onOpen }) {
  return (
    <div
      style={{
        width: 360,
        maxWidth: "calc(100vw - 32px)",
        background: "rgba(20,22,30,0.92)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
        padding: 14,
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        color: "#fff",
      }}
      role="alert"
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "rgba(168,85,247,0.18)",
              border: "1px solid rgba(168,85,247,0.32)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Sparkles size={16} color="#c084fc" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {title}
            </div>
            <div style={{ color: "var(--txt2)", fontSize: 12, lineHeight: 1.4 }}>
              {message}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff",
            borderRadius: 12,
            width: 34,
            height: 34,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Close"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <button
          onClick={onOpen}
          style={{
            background: "rgba(59,130,246,0.18)",
            border: "1px solid rgba(59,130,246,0.32)",
            color: "#60a5fa",
            borderRadius: 12,
            padding: "8px 10px",
            fontWeight: 900,
            cursor: "pointer",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Open <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
}

export default function NotificationPopupManager() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const uid = currentUser?.uid;

  const [campaigns, setCampaigns] = useState([]);
  const [receipts, setReceipts] = useState(new Map());
  const [toasts, setToasts] = useState([]);
  const shownRef = useRef(new Set()); // per-session dedupe

  // Register web push token opportunistically (non-blocking).
  useEffect(() => {
    if (!currentUser) return;
    registerFcmToken(currentUser).catch(() => {});
  }, [currentUser]);

  useEffect(() => {
    if (!uid) return;
    const unsub1 = listenActiveCampaigns({}, setCampaigns);
    const unsub2 = listenCampaignReceipts(uid, setReceipts);
    return () => {
      unsub1?.();
      unsub2?.();
    };
  }, [uid]);

  // Foreground FCM messages: show a local toast immediately.
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      unsub = await listenForegroundFcmMessages((payload) => {
        const title = payload?.notification?.title || payload?.data?.title || "Notification";
        const message = payload?.notification?.body || payload?.data?.body || "";
        const link = payload?.data?.link || "/notifications";
        const id = payload?.data?.id || `fcm_${Date.now()}`;
        setToasts((prev) => [{ id, title, message, link, _kind: "fcm" }, ...prev].slice(0, 3));
      });
    })();
    return () => unsub?.();
  }, []);

  const popupCandidates = useMemo(() => {
    return campaigns
      .filter((c) => {
        const display = c.display || c.type;
        if (display !== "popup") return false;
        const r = receipts.get(c.id) || {};
        if (r.dismissedAt) return false;
        return true;
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }, [campaigns, receipts]);

  useEffect(() => {
    if (!uid) return;
    if (popupCandidates.length === 0) return;
    const top = popupCandidates[0];
    const key = `campaign_${top.id}`;
    if (shownRef.current.has(key)) return;
    shownRef.current.add(key);

    // Avoid synchronous setState inside effect (lint rule).
    setTimeout(() => {
      setToasts((prev) =>
        [{ id: key, title: top.title || "Announcement", message: top.message || "", link: top.link || "/notifications", _kind: "campaign", campaignId: top.id }, ...prev].slice(0, 3)
      );
    }, 0);
    setCampaignReceipt(uid, top.id, { shownAt: new Date().toISOString(), firstSeenAt: new Date().toISOString() }).catch(() => {});
  }, [uid, popupCandidates]);

  if (!currentUser) return null;

  return (
    <div style={toastWrapStyle}>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          title={t.title}
          message={t.message}
          onClose={async () => {
            setToasts((prev) => prev.filter((x) => x.id !== t.id));
            if (t._kind === "campaign" && t.campaignId) {
              await setCampaignReceipt(uid, t.campaignId, { dismissedAt: new Date().toISOString() });
            }
          }}
          onOpen={async () => {
            setToasts((prev) => prev.filter((x) => x.id !== t.id));
            if (t._kind === "campaign" && t.campaignId) {
              await setCampaignReceipt(uid, t.campaignId, { clickedAt: new Date().toISOString(), readAt: new Date().toISOString() });
            }
            navigate(t.link || "/notifications");
          }}
        />
      ))}
    </div>
  );
}

