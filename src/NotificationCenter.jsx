import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Filter, MessageSquare, Sparkles, X, Bell, Megaphone,
  Zap, CheckCheck, ExternalLink, Image as ImageIcon, Layout,
} from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import {
  listenActiveCampaigns,
  listenCampaignReceipts,
  listenPersonalNotifications,
  markPersonalNotificationRead,
  markAllPersonalRead,
  setCampaignReceipt,
  getRelativeTime,
} from "./lib/notifications";
import "./NotificationSystem.css";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "campaigns", label: "Campaigns" },
  { id: "personal", label: "Personal" },
  { id: "announcements", label: "Announcements" },
];

const typeIcon = (type, source) => {
  if (type === "announcement") return { Icon: Zap, color: "#f472b6", bg: "notif-card-icon-announcement" };
  if (type === "popup") return { Icon: Layout, color: "#c084fc", bg: "notif-card-icon-campaign" };
  if (type === "banner") return { Icon: Megaphone, color: "#fbbf24", bg: "notif-card-icon-campaign" };
  if (source === "campaign") return { Icon: Sparkles, color: "#c084fc", bg: "notif-card-icon-campaign" };
  return { Icon: MessageSquare, color: "#60a5fa", bg: "notif-card-icon-personal" };
};

const priorityClass = (p) => `notif-announcement-p${Math.min(Math.max(p || 1, 1), 4)}`;

export default function NotificationCenter() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const uid = currentUser?.uid;

  const [personal, setPersonal] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [receipts, setReceipts] = useState(new Map());
  const [filter, setFilter] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const unsub1 = listenPersonalNotifications(uid, { pageSize: 100 }, setPersonal);
    const unsub2 = listenActiveCampaigns({}, setCampaigns);
    const unsub3 = listenCampaignReceipts(uid, setReceipts);
    return () => { unsub1?.(); unsub2?.(); unsub3?.(); };
  }, [uid]);

  const merged = useMemo(() => {
    const activeCampaigns = campaigns.map((c) => {
      const r = receipts.get(c.id) || {};
      return {
        ...c, id: c.id,
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

  const announcements = useMemo(() => {
    return merged.filter((n) =>
      (n.display === "announcement" || n.type === "announcement") &&
      !n.dismissedAt && n._source === "campaign"
    );
  }, [merged]);

  const filtered = useMemo(() => {
    let items = merged;
    if (filter === "unread") items = items.filter((n) => !n.readAt);
    else if (filter === "campaigns") items = items.filter((n) => n._source === "campaign");
    else if (filter === "personal") items = items.filter((n) => n._source !== "campaign");
    else if (filter === "announcements") items = items.filter((n) => n.display === "announcement" || n.type === "announcement");
    return items;
  }, [merged, filter]);

  const unreadCount = useMemo(() => merged.filter((n) => !n.readAt).length, [merged]);

  // Mark campaigns as "seen"
  useEffect(() => {
    if (!uid) return;
    const toMark = campaigns
      .filter((c) => !receipts.get(c.id)?.firstSeenAt)
      .slice(0, 20);
    if (toMark.length === 0) return;
    Promise.all(
      toMark.map((c) => setCampaignReceipt(uid, c.id, { firstSeenAt: new Date().toISOString() }))
    ).catch(() => {});
  }, [uid, campaigns, receipts]);

  const handleMarkAllRead = useCallback(async () => {
    if (!uid || markingAll) return;
    setMarkingAll(true);
    try {
      await markAllPersonalRead(uid);
      // Mark all campaign receipts as read
      const unreadCampaigns = campaigns.filter((c) => {
        const r = receipts.get(c.id);
        return !r?.readAt;
      });
      await Promise.all(
        unreadCampaigns.map((c) => setCampaignReceipt(uid, c.id, { readAt: new Date().toISOString() }))
      );
    } catch (e) { console.error(e); }
    setMarkingAll(false);
  }, [uid, markingAll, campaigns, receipts]);

  const handleDismissAnnouncement = async (n) => {
    if (n._source === "campaign") {
      await setCampaignReceipt(uid, n.id, { dismissedAt: new Date().toISOString(), readAt: new Date().toISOString() });
    }
  };

  const handleMarkRead = async (n) => {
    if (n._source === "campaign") {
      await setCampaignReceipt(uid, n.id, { readAt: new Date().toISOString() });
    } else {
      await markPersonalNotificationRead(uid, n.id);
    }
  };

  const handleCtaClick = async (n, link) => {
    if (n._source === "campaign") {
      await setCampaignReceipt(uid, n.id, { clickedAt: new Date().toISOString(), readAt: new Date().toISOString() });
    } else {
      await markPersonalNotificationRead(uid, n.id);
    }
    if (link) {
      if (link.startsWith("http")) window.open(link, "_blank");
      else navigate(link);
    }
  };

  if (!currentUser) {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", padding: "2rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="notif-glass" style={{ padding: "2rem", textAlign: "center" }}>
            <div className="notif-empty-icon" style={{ margin: "0 auto 16px" }}>
              <Bell size={24} color="var(--txt3)" />
            </div>
            <div style={{ fontWeight: 900, fontSize: "1.25rem", marginBottom: 8 }}>Notifications</div>
            <div style={{ color: "var(--txt2)", marginBottom: 20 }}>Sign in to view your notifications.</div>
            <button className="notif-btn notif-btn-primary" onClick={() => navigate("/login")}>Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.25rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.12))", border: "1px solid rgba(59,130,246,0.20)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={22} color="#60a5fa" />
              </div>
              Notifications
            </div>
            <div style={{ color: "var(--txt2)", marginTop: 6, fontSize: "0.9375rem" }}>
              Campaigns and personal updates in real-time.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {unreadCount > 0 && (
              <button className="notif-btn notif-btn-blue notif-btn-sm" onClick={handleMarkAllRead} disabled={markingAll}>
                <CheckCheck size={14} /> {markingAll ? "Marking..." : "Mark All Read"}
              </button>
            )}
            <button className="notif-btn notif-btn-ghost notif-btn-sm" onClick={() => navigate("/dashboard")}>
              ← Back
            </button>
          </div>
        </div>

        {/* Announcement Banners */}
        <AnimatePresence>
          {announcements.map((n) => (
            <motion.div key={`ann_${n.id}`}
              className={`notif-announcement-banner ${priorityClass(n.priority)}`}
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 12 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: "linear-gradient(135deg, rgba(236,72,153,0.18), rgba(168,85,247,0.15))", border: "1px solid rgba(236,72,153,0.20)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Zap size={20} color="#f472b6" />
              </div>
              <div className="notif-announcement-content">
                {n.htmlContent ? (
                  <div style={{ width: "100%", overflow: "hidden" }} dangerouslySetInnerHTML={{ __html: n.htmlContent }} />
                ) : (
                  <>
                    <div className="notif-announcement-title">{n.title || "Announcement"}</div>
                    <div className="notif-announcement-msg">{n.message || n.body || ""}</div>
                    {n.imageUrl && (
                      <img src={n.imageUrl} alt="" className="notif-card-image" style={{ marginTop: 10, maxHeight: 140 }} />
                    )}
                  </>
                )}
              </div>
              <div className="notif-announcement-actions">
                {!n.htmlContent && (n.ctaText || n.link) && (
                  <button className="notif-btn notif-btn-primary notif-btn-sm"
                    onClick={() => handleCtaClick(n, n.ctaLink || n.link)}>
                    {n.ctaText || "View"} <ExternalLink size={12} />
                  </button>
                )}
                <button className="notif-btn notif-btn-ghost notif-btn-icon notif-btn-sm"
                  style={{ width: 32, height: 32 }}
                  onClick={() => handleDismissAnnouncement(n)} title="Dismiss">
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Filter Bar */}
        <div className="notif-glass" style={{ marginBottom: 14 }}>
          <div className="notif-filter-bar">
            <Filter size={16} color="var(--txt3)" style={{ flexShrink: 0 }} />
            {FILTERS.map((t) => (
              <button key={t.id} className={`notif-filter-tab ${filter === t.id ? "active" : ""}`}
                onClick={() => setFilter(t.id)}>
                {t.label}
                {t.id === "unread" && unreadCount > 0 && (
                  <span style={{ marginLeft: 4, background: "rgba(59,130,246,0.2)", padding: "1px 6px", borderRadius: 999, fontSize: "0.625rem" }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Feed */}
        <div className="notif-glass" style={{ overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div className="notif-empty">
              <div className="notif-empty-icon"><Bell size={24} color="var(--txt3)" /></div>
              <div className="notif-empty-title">
                {filter === "unread" ? "All caught up!" : "No notifications yet"}
              </div>
              <div className="notif-empty-msg">
                {filter === "unread"
                  ? "You've read all your notifications."
                  : "When you receive notifications, they'll appear here."}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((n) => {
                const isUnread = !n.readAt;
                const display = n.display || n.type || "feed";
                const { Icon, color, bg } = typeIcon(display, n._source);
                const timeAgo = getRelativeTime(n.createdAt);
                const isUrgent = (n.priority || 1) >= 4;

                return (
                  <motion.div key={`${n._source}_${n.id}`}
                    className={`notif-card ${isUnread ? "unread" : ""}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    style={isUrgent ? { borderLeft: "3px solid #c084fc" } : undefined}>

                    {/* Icon */}
                    <div className={`notif-card-icon ${bg}`}>
                      <Icon size={18} color={color} />
                    </div>

                    {/* Content */}
                    <div className="notif-card-body">
                      <div className="notif-card-header">
                        <div className="notif-card-title">{n.title || "Notification"}</div>
                        <span className={`notif-badge notif-type-${display}`} style={{ transform: "scale(0.85)" }}>
                          {display}
                        </span>
                        {isUnread && (
                          <span style={{ width: 7, height: 7, borderRadius: 99, background: "#60a5fa", flexShrink: 0 }} />
                        )}
                        <span className="notif-card-time">{timeAgo}</span>
                      </div>

                      {n.htmlContent ? (
                        <div style={{ marginTop: 8, width: "100%", overflow: "hidden" }} dangerouslySetInnerHTML={{ __html: n.htmlContent }} />
                      ) : (
                        <>
                          <div className="notif-card-message">{n.message || n.body || ""}</div>
                          {n.imageUrl && (
                            <img src={n.imageUrl} alt="" className="notif-card-image" />
                          )}
                          {n.videoUrl && (
                            <div style={{ marginTop: 10, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                              <iframe src={n.videoUrl} style={{ width: "100%", height: 200, border: "none" }} title="Video" allowFullScreen />
                            </div>
                          )}
                        </>
                      )}

                      {/* CTA Buttons */}
                      <div className="notif-card-actions">
                        {!n.htmlContent && n.ctaText && (
                          <button className="notif-card-cta notif-card-cta-primary"
                            onClick={() => handleCtaClick(n, n.ctaLink || n.link)}>
                            {n.ctaText}
                          </button>
                        )}
                        {!n.htmlContent && n.ctaSecondaryText && (
                          <button className="notif-card-cta notif-card-cta-secondary"
                            onClick={() => handleCtaClick(n, n.ctaSecondaryLink || n.link)}>
                            {n.ctaSecondaryText}
                          </button>
                        )}
                        {!n.htmlContent && !n.ctaText && n.link && (
                          <button className="notif-card-cta notif-card-cta-secondary"
                            onClick={() => handleCtaClick(n, n.link)}>
                            Open <ExternalLink size={11} style={{ marginLeft: 4 }} />
                          </button>
                        )}
                        {n.htmlContent && (n.ctaLink || n.link) && (
                          <button className="notif-card-cta notif-card-cta-primary"
                            onClick={() => handleCtaClick(n, n.ctaLink || n.link)}>
                            Open <ExternalLink size={11} style={{ marginLeft: 4 }} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                      {isUnread && (
                        <button className="notif-btn notif-btn-success notif-btn-icon notif-btn-sm"
                          style={{ width: 32, height: 32 }}
                          onClick={() => handleMarkRead(n)} title="Mark as read">
                          <Check size={14} />
                        </button>
                      )}
                      {n._source === "campaign" && (
                        <button className="notif-btn notif-btn-danger notif-btn-icon notif-btn-sm"
                          style={{ width: 32, height: 32 }}
                          onClick={() => handleDismissAnnouncement(n)} title="Dismiss">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
