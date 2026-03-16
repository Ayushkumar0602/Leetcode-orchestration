import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Filter, MessageSquare, Sparkles, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "./contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile, queryKeys } from "./lib/api";
import { campaignAppliesToUser } from "./lib/audience";
import {
  listenActiveCampaigns,
  listenCampaignReceipts,
  listenPersonalNotifications,
  markPersonalNotificationRead,
  setCampaignReceipt,
} from "./lib/notifications";

const glass = {
  background: "rgba(20,22,30,0.65)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "20px",
};

function kindLabel(n) {
  if (n._source === "campaign") return "Campaign";
  return n.kind || "Personal";
}

function renderCtas(n, onClickCta) {
  const ctas = n.rich?.ctas || [];
  if (!Array.isArray(ctas) || ctas.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
      {ctas.slice(0, 3).map((b, i) => (
        <button
          key={`${b.label || "cta"}_${i}`}
          onClick={() => onClickCta(b)}
          style={{
            background: b.variant === "secondary" ? "rgba(255,255,255,0.04)" : "rgba(59,130,246,0.18)",
            border: b.variant === "secondary" ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(59,130,246,0.32)",
            color: b.variant === "secondary" ? "#fff" : "#60a5fa",
            borderRadius: 12,
            padding: "8px 10px",
            fontWeight: 900,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          {b.label || "Open"}
        </button>
      ))}
    </div>
  );
}

export default function NotificationCenter() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const uid = currentUser?.uid;

  const { data: profile } = useQuery({
    queryKey: queryKeys.profile(uid),
    queryFn: () => fetchProfile(uid),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  });

  const [personal, setPersonal] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [receipts, setReceipts] = useState(new Map());
  const [filter, setFilter] = useState("all"); // all | unread | campaigns | personal

  useEffect(() => {
    if (!uid) return;
    const unsub1 = listenPersonalNotifications(uid, { pageSize: 100 }, setPersonal);
    const unsub2 = listenActiveCampaigns({}, setCampaigns);
    const unsub3 = listenCampaignReceipts(uid, setReceipts);
    return () => {
      unsub1?.();
      unsub2?.();
      unsub3?.();
    };
  }, [uid]);

  const merged = useMemo(() => {
    const activeCampaigns = campaigns
      .filter((c) => campaignAppliesToUser(c, { uid, profile }))
      .map((c) => {
        const r = receipts.get(c.id) || {};
        return {
          ...c,
          id: c.id,
          createdAt: c.startAt || c.createdAt,
          _source: "campaign",
          readAt: r.readAt || null,
          dismissedAt: r.dismissedAt || null,
          link: c.link || null,
          display: c.display || c.type || "feed",
        };
      });

    const items = [
      ...personal.map((p) => ({ ...p, _source: "personal", display: p.display || p.type || "feed" })),
      ...activeCampaigns,
    ];

    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return items;
  }, [campaigns, personal, receipts]);

  const filtered = useMemo(() => {
    if (filter === "unread") return merged.filter((n) => !n.readAt);
    if (filter === "campaigns") return merged.filter((n) => n._source === "campaign");
    if (filter === "personal") return merged.filter((n) => n._source !== "campaign");
    return merged;
  }, [merged, filter]);

  const pinned = useMemo(() => {
    // Announcements: still appear in the list, but show a "Pinned" section for clarity.
    return merged.filter((n) => n._source === "campaign" && (n.display === "announcement" || n.type === "announcement")).slice(0, 3);
  }, [merged]);

  useEffect(() => {
    if (!uid) return;
    // Mark campaigns as "seen" when they enter the feed list.
    // This is used for unread badge heuristics and analytics (read vs seen).
    const toMark = campaigns
      .filter((c) => !receipts.get(c.id)?.firstSeenAt)
      .slice(0, 20);
    if (toMark.length === 0) return;
    Promise.all(
      toMark.map((c) =>
        setCampaignReceipt(uid, c.id, { firstSeenAt: new Date().toISOString() })
      )
    ).catch(() => {});
  }, [uid, campaigns, receipts]);

  if (!currentUser) {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", padding: "2rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ ...glass, padding: "1.5rem" }}>
            <div style={{ fontWeight: 800, fontSize: "1.4rem" }}>Notifications</div>
            <div style={{ color: "var(--txt2)", marginTop: 8 }}>Sign in to view your notifications.</div>
            <button
              onClick={() => navigate("/login")}
              style={{
                marginTop: 16,
                background: "rgba(59,130,246,0.18)",
                border: "1px solid rgba(59,130,246,0.3)",
                color: "#60a5fa",
                borderRadius: 12,
                padding: "10px 14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.02em" }}>Notifications</div>
            <div style={{ color: "var(--txt2)", marginTop: 6 }}>Campaigns and personal updates in real-time.</div>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              borderRadius: 12,
              padding: "10px 12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
        </div>

        <div style={{ ...glass, padding: "12px", display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Filter size={16} color="var(--txt3)" />
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
            { id: "campaigns", label: "Campaigns" },
            { id: "personal", label: "Personal" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              style={{
                background: filter === t.id ? "rgba(168,85,247,0.22)" : "rgba(255,255,255,0.04)",
                border: filter === t.id ? "1px solid rgba(168,85,247,0.45)" : "1px solid rgba(255,255,255,0.08)",
                color: filter === t.id ? "#c084fc" : "var(--txt2)",
                borderRadius: 999,
                padding: "8px 12px",
                fontWeight: 800,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ ...glass, overflow: "hidden" }}>
          {pinned.length > 0 && (
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(135deg, rgba(168,85,247,0.10), rgba(59,130,246,0.08))" }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Pinned announcements</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pinned.map((a) => (
                  <div key={`pin_${a.id}`} style={{ background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 14, padding: 12 }}>
                    <div style={{ fontWeight: 900 }}>{a.title || "Announcement"}</div>
                    <div style={{ color: "var(--txt2)", fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
                      {a.rich?.format === "markdown" ? <ReactMarkdown>{a.message || ""}</ReactMarkdown> : <span>{a.message || ""}</span>}
                    </div>
                    {renderCtas(a, async (b) => {
                      await setCampaignReceipt(uid, a.id, { clickedAt: new Date().toISOString(), readAt: new Date().toISOString() });
                      navigate(b.link || a.link || "/notifications");
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
          {filtered.length === 0 ? (
            <div style={{ padding: "2rem", color: "var(--txt3)" }}>No notifications yet.</div>
          ) : (
            filtered.map((n) => {
              const isUnread = !n.readAt;
              const Icon = n._source === "campaign" ? Sparkles : MessageSquare;
              const media = n.rich?.media || [];
              return (
                <div
                  key={`${n._source}_${n.id}`}
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    background: isUnread ? "rgba(59,130,246,0.06)" : "transparent",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: n._source === "campaign" ? "rgba(168,85,247,0.15)" : "rgba(59,130,246,0.12)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} color={n._source === "campaign" ? "#c084fc" : "#60a5fa"} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 900, color: "#fff", fontSize: 14 }}>{n.title || "Notification"}</div>
                      <span style={{ fontSize: 11, fontWeight: 900, color: "var(--txt3)" }}>
                        {kindLabel(n)}
                      </span>
                      {isUnread && (
                        <span style={{ fontSize: 11, fontWeight: 900, color: "#60a5fa" }}>UNREAD</span>
                      )}
                    </div>
                    <div style={{ color: "var(--txt2)", fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
                      {n.rich?.format === "markdown" ? <ReactMarkdown>{n.message || n.body || ""}</ReactMarkdown> : <span>{n.message || n.body || ""}</span>}
                    </div>
                    {Array.isArray(media) && media.length > 0 && (
                      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                        {media.slice(0, 1).map((m) => (
                          <div key={m.url} style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                            {m.type === "video" ? (
                              <video src={m.url} controls style={{ width: "100%", display: "block", maxHeight: 260, background: "#000" }} />
                            ) : (
                              <img src={m.url} alt={m.alt || ""} style={{ width: "100%", display: "block", maxHeight: 260, objectFit: "cover" }} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {renderCtas(n, async (b) => {
                      if (n._source === "campaign") {
                        await setCampaignReceipt(uid, n.id, { clickedAt: new Date().toISOString(), readAt: new Date().toISOString() });
                      } else {
                        await markPersonalNotificationRead(uid, n.id);
                      }
                      navigate(b.link || n.link || "/notifications");
                    })}
                    {n.link && (
                      <button
                        onClick={async () => {
                          if (n._source === "campaign") {
                            await setCampaignReceipt(uid, n.id, {
                              clickedAt: new Date().toISOString(),
                              readAt: new Date().toISOString(),
                            });
                          } else {
                            await markPersonalNotificationRead(uid, n.id);
                          }
                          navigate(n.link);
                        }}
                        style={{
                          marginTop: 10,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          color: "#fff",
                          borderRadius: 12,
                          padding: "8px 10px",
                          fontWeight: 800,
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Open
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={async () => {
                        if (n._source === "campaign") {
                          await setCampaignReceipt(uid, n.id, { readAt: new Date().toISOString() });
                        } else {
                          await markPersonalNotificationRead(uid, n.id);
                        }
                      }}
                      style={{
                        background: "rgba(16,185,129,0.12)",
                        border: "1px solid rgba(16,185,129,0.25)",
                        color: "#34d399",
                        borderRadius: 12,
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                      title="Mark as read"
                      aria-label="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                    {n._source === "campaign" && (
                      <button
                        onClick={async () => {
                          await setCampaignReceipt(uid, n.id, { dismissedAt: new Date().toISOString(), readAt: new Date().toISOString() });
                        }}
                        style={{
                          background: "rgba(239,68,68,0.10)",
                          border: "1px solid rgba(239,68,68,0.22)",
                          color: "#f87171",
                          borderRadius: 12,
                          width: 36,
                          height: 36,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                        title="Dismiss campaign"
                        aria-label="Dismiss campaign"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

