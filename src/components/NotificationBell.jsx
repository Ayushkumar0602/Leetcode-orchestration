import React, { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { listenCampaignReceipts, listenPersonalNotifications } from "../lib/notifications";

export default function NotificationBell() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [personal, setPersonal] = useState([]);
  const [receipts, setReceipts] = useState(new Map());

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub1 = listenPersonalNotifications(currentUser.uid, { pageSize: 50 }, setPersonal);
    const unsub2 = listenCampaignReceipts(currentUser.uid, setReceipts);
    return () => {
      unsub1?.();
      unsub2?.();
    };
  }, [currentUser?.uid]);

  const unreadCount = useMemo(() => {
    if (!currentUser?.uid) return 0;
    const personalUnread = personal.filter((n) => !n.readAt).length;
    // Campaign unread is derived in NotificationCenter (needs active campaigns). Keep bell lightweight.
    const campaignUnread = Array.from(receipts.values()).filter((r) => r && !r.readAt && r.firstSeenAt).length;
    return personalUnread + campaignUnread;
  }, [currentUser?.uid, personal, receipts]);

  if (!currentUser) return null;

  return (
    <button
      onClick={() => navigate("/notifications")}
      style={{
        position: "relative",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        width: 40,
        height: 40,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      aria-label="Notifications"
      title="Notifications"
    >
      <Bell size={18} color="#fff" />
      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            minWidth: 18,
            height: 18,
            padding: "0 5px",
            borderRadius: 999,
            background: "#ef4444",
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
            lineHeight: "18px",
            textAlign: "center",
          }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}

