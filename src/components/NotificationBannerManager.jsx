import React, { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile, queryKeys } from "../lib/api";
import { campaignAppliesToUser } from "../lib/audience";
import { listenActiveCampaigns, listenCampaignReceipts, setCampaignReceipt } from "../lib/notifications";

export default function NotificationBannerManager() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const uid = currentUser?.uid;

  const { data: profile } = useQuery({
    queryKey: queryKeys.profile(uid),
    queryFn: () => fetchProfile(uid),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  });

  const [campaigns, setCampaigns] = useState([]);
  const [receipts, setReceipts] = useState(new Map());
  const dismissedSession = useRef(new Set());

  useEffect(() => {
    if (!uid) return;
    const unsub1 = listenActiveCampaigns({}, setCampaigns);
    const unsub2 = listenCampaignReceipts(uid, setReceipts);
    return () => {
      unsub1?.();
      unsub2?.();
    };
  }, [uid]);

  const topBanner = useMemo(() => {
    if (!uid) return null;
    const candidates = campaigns
      .filter((c) => campaignAppliesToUser(c, { uid, profile }))
      .filter((c) => (c.display || c.type) === "banner" || (c.display || c.type) === "announcement")
      .filter((c) => {
        const r = receipts.get(c.id) || {};
        if (r.dismissedAt) return false;
        if (dismissedSession.current.has(c.id)) return false;
        return true;
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    return candidates[0] || null;
  }, [uid, campaigns, receipts]);

  useEffect(() => {
    if (!uid || !topBanner) return;
    const r = receipts.get(topBanner.id) || {};
    if (r.firstSeenAt) return;
    setCampaignReceipt(uid, topBanner.id, { firstSeenAt: new Date().toISOString() }).catch(() => {});
  }, [uid, topBanner, receipts]);

  if (!currentUser || !topBanner) return null;

  const kind = topBanner.display || topBanner.type;
  const isAnnouncement = kind === "announcement";

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: isAnnouncement
          ? "linear-gradient(135deg, rgba(168,85,247,0.22), rgba(59,130,246,0.18))"
          : "rgba(20,22,30,0.85)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px 14px", display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 13, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {topBanner.title || "Announcement"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {topBanner.message || ""}
          </div>
        </div>

        {(topBanner.rich?.ctas?.[0] || topBanner.link) && (
          <button
            onClick={async () => {
              await setCampaignReceipt(uid, topBanner.id, { clickedAt: new Date().toISOString(), readAt: new Date().toISOString() });
              const link = topBanner.rich?.ctas?.[0]?.link || topBanner.link || "/notifications";
              navigate(link);
            }}
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              borderRadius: 12,
              padding: "8px 10px",
              fontWeight: 900,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
              fontSize: 12,
            }}
            title="Open"
          >
            <ExternalLink size={14} />
            {topBanner.rich?.ctas?.[0]?.label || "Open"}
          </button>
        )}

        <button
          onClick={async () => {
            dismissedSession.current.add(topBanner.id);
            await setCampaignReceipt(uid, topBanner.id, { dismissedAt: new Date().toISOString(), readAt: new Date().toISOString() });
          }}
          style={{
            background: "rgba(0,0,0,0.18)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff",
            borderRadius: 12,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="Dismiss banner"
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

