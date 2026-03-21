import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Plus, Save, Send, RefreshCcw, Trash2, Search, X, Eye,
  Megaphone, Layout, Zap, MessageSquare, ChevronDown, Users,
  User, Globe, Pause, Play, BarChart3, MousePointerClick,
  EyeOff, TrendingUp, Image, Video, Link2, ExternalLink, AlertTriangle,
} from "lucide-react";
import "../NotificationSystem.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://leetcode-orchestration.onrender.com";

async function adminFetch(currentUser, path, opts = {}) {
  const token = await currentUser.getIdToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Request failed");
  }
  return res.json();
}

function toInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromInputValue(v) {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

const EMPTY_DRAFT = {
  name: "",
  type: "feed",
  title: "",
  message: "",
  link: "",
  ctaText: "",
  ctaLink: "",
  ctaSecondaryText: "",
  ctaSecondaryLink: "",
  imageUrl: "",
  videoUrl: "",
  htmlContent: "",
  priority: 1,
  startAt: null,
  endAt: null,
  target: { kind: "all" },
  targetPage: "",
  status: "draft",
};

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "draft", label: "Draft" },
  { id: "expired", label: "Expired" },
  { id: "paused", label: "Paused" },
];

const TYPE_OPTIONS = [
  { id: "feed", label: "Feed", icon: MessageSquare, desc: "Standard in-app", color: "#60a5fa", bg: "rgba(59,130,246,0.12)" },
  { id: "popup", label: "Popup", icon: Layout, desc: "Modal overlay", color: "#c084fc", bg: "rgba(168,85,247,0.12)" },
  { id: "banner", label: "Banner", icon: Megaphone, desc: "Top bar slide", color: "#fbbf24", bg: "rgba(245,158,11,0.12)" },
  { id: "announcement", label: "Announce", icon: Zap, desc: "Full-screen", color: "#f472b6", bg: "rgba(236,72,153,0.12)" },
];

const PRIORITY_OPTIONS = [
  { value: 1, label: "Low", color: "#60a5fa" },
  { value: 2, label: "Medium", color: "#fbbf24" },
  { value: 3, label: "High", color: "#f87171" },
  { value: 4, label: "Urgent", color: "#c084fc" },
];

const AUDIENCE_OPTIONS = [
  { kind: "all", label: "All Users", desc: "Broadcast to every user", icon: Globe },
  { kind: "group", label: "User Groups", desc: "Target by plan or role", icon: Users },
  { kind: "individual", label: "Specific Users", desc: "Enter user IDs", icon: User },
];

const GROUP_TAGS = ["free", "blaze", "admin", "beta"];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ═══ Preview Component ═══ */
function CampaignPreview({ draft }) {
  const [previewType, setPreviewType] = useState(draft.type);
  useEffect(() => { setPreviewType(draft.type); }, [draft.type]);

  const content = (
    <>
      {draft.imageUrl && <img src={draft.imageUrl} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 12, marginBottom: 14, border: "1px solid rgba(255,255,255,0.06)" }} />}
      
      {draft.htmlContent ? (
        <div style={{ marginTop: 10, width: "100%", overflow: "hidden" }} dangerouslySetInnerHTML={{ __html: draft.htmlContent }} />
      ) : (
        <>
          <div style={{ fontWeight: 900, fontSize: previewType === "announcement" ? "1.15rem" : "0.875rem", marginBottom: 6 }}>
            {draft.title || "Notification Title"}
          </div>
          <div style={{ color: "var(--txt2)", fontSize: "0.8125rem", lineHeight: 1.5, marginBottom: draft.ctaText ? 14 : 0 }}>
            {draft.message || "Your message will appear here..."}
          </div>
        </>
      )}

      {draft.ctaText && !draft.htmlContent && (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="notif-btn notif-btn-primary notif-btn-sm">{draft.ctaText || "Learn More"}</button>
          {draft.ctaSecondaryText && (
            <button className="notif-btn notif-btn-ghost notif-btn-sm">{draft.ctaSecondaryText}</button>
          )}
        </div>
      )}
    </>
  );

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span className="notif-label" style={{ margin: 0 }}>Preview</span>
        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {TYPE_OPTIONS.map((t) => (
            <button key={t.id} onClick={() => setPreviewType(t.id)}
              className={`notif-btn notif-btn-sm ${previewType === t.id ? "notif-btn-primary" : "notif-btn-ghost"}`}
              style={{ padding: "4px 8px", fontSize: "0.6875rem" }}>{t.label}</button>
          ))}
        </div>
      </div>
      <div className="notif-preview-wrap">
        {previewType === "feed" && (
          <div className="notif-preview-feed">
            <div style={{ padding: 16, display: "flex", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(168,85,247,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bell size={16} color="#c084fc" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>{content}</div>
            </div>
          </div>
        )}
        {previewType === "popup" && (
          <div className="notif-preview-popup">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={14} color="#888" />
              </div>
            </div>
            {content}
          </div>
        )}
        {previewType === "banner" && (
          <div className="notif-preview-banner">
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
              <Megaphone size={18} color="#c084fc" />
              <div style={{ minWidth: 0 }}>
                {draft.htmlContent ? (
                   <div style={{ width: "100%", overflow: "hidden" }} dangerouslySetInnerHTML={{ __html: draft.htmlContent }} />
                ) : (
                  <>
                    <div style={{ fontWeight: 900, fontSize: "0.8125rem", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {draft.title || "Banner Title"}
                    </div>
                    <div style={{ color: "var(--txt2)", fontSize: "0.8125rem" }}>{draft.message || "Banner message..."}</div>
                  </>
                )}
              </div>
            </div>
            {draft.ctaText && !draft.htmlContent && <button className="notif-btn notif-btn-primary notif-btn-sm">{draft.ctaText}</button>}
          </div>
        )}
        {previewType === "announcement" && (
          <div className="notif-preview-announcement">{content}</div>
        )}
      </div>
    </div>
  );
}

/* ═══ Delete Confirmation Modal ═══ */
function DeleteModal({ name, onConfirm, onCancel }) {
  return (
    <div className="notif-modal-backdrop" onClick={onCancel}>
      <motion.div className="notif-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle size={20} color="#f87171" />
          </div>
          <div className="notif-modal-title">Delete Campaign</div>
        </div>
        <div className="notif-modal-body">
          Are you sure you want to delete <strong>"{name || "this campaign"}"</strong>? This action cannot be undone.
        </div>
        <div className="notif-modal-actions">
          <button className="notif-btn notif-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="notif-btn notif-btn-danger" onClick={onConfirm}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══ Main Component ═══ */
export default function AdminNotifications() {
  const { currentUser } = useAuth();
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [draft, setDraft] = useState({ ...EMPTY_DRAFT, startAt: new Date().toISOString() });
  const [userIdInput, setUserIdInput] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: () => adminFetch(currentUser, "/api/admin/notifications/campaigns"),
    enabled: !!currentUser,
    retry: false,
  });

  const campaigns = data?.campaigns || [];

  const filtered = useMemo(() => {
    let items = campaigns;
    if (statusFilter !== "all") items = items.filter((c) => c.status === statusFilter);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      items = items.filter((c) => (c.title || "").toLowerCase().includes(q) || (c.name || "").toLowerCase().includes(q) || (c.message || "").toLowerCase().includes(q));
    }
    return items;
  }, [campaigns, statusFilter, searchQ]);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const startNew = () => {
    setSelected(null);
    setDraft({ ...EMPTY_DRAFT, startAt: new Date().toISOString() });
    setShowEditor(true);
  };

  const loadIntoDraft = (c) => {
    setSelected(c.id);
    setDraft({
      name: c.name || "",
      type: c.type || c.display || "feed",
      title: c.title || "",
      message: c.message || "",
      link: c.link || "",
      ctaText: c.ctaText || "",
      ctaLink: c.ctaLink || "",
      ctaSecondaryText: c.ctaSecondaryText || "",
      ctaSecondaryLink: c.ctaSecondaryLink || "",
      imageUrl: c.imageUrl || "",
      videoUrl: c.videoUrl || "",
      htmlContent: c.htmlContent || "",
      priority: c.priority || 1,
      startAt: c.startAt || c.createdAt || new Date().toISOString(),
      endAt: c.endAt || null,
      target: c.target || { kind: "all" },
      targetPage: c.targetPage || "",
      status: c.status || "draft",
    });
    setShowEditor(true);
  };

  const save = async (returnId = false) => {
    if (!currentUser) return null;
    if (!draft.title || !draft.message) { showToast("Title and message are required", "error"); return null; }
    setSaving(true);
    let newId = selected;
    try {
      if (selected) {
        await adminFetch(currentUser, `/api/admin/notifications/campaigns/${selected}`, {
          method: "PATCH", body: JSON.stringify(draft),
        });
        showToast("Campaign updated");
      } else {
        const res = await adminFetch(currentUser, "/api/admin/notifications/campaigns", {
          method: "POST", body: JSON.stringify(draft),
        });
        showToast("Campaign created");
        if (res?.campaign?.id) newId = res.campaign.id;
      }
      await refetch();
    } catch (e) { showToast(e.message, "error"); }
    setSaving(false);
    return newId;
  };

  const activate = async ({ push }) => {
    try {
      const activeId = await save(true);
      if (!activeId) return;
      setSaving(true);
      await adminFetch(currentUser, `/api/admin/notifications/campaigns/${activeId}/activate`, {
        method: "POST", body: JSON.stringify({ push: push === true }),
      });
      showToast(push ? "Campaign activated & pushed" : "Campaign activated");
      setSelected(activeId);
      await refetch();
    } catch (e) { showToast(e.message, "error"); }
    setSaving(false);
  };

  const pauseCampaign = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminFetch(currentUser, `/api/admin/notifications/campaigns/${selected}`, {
        method: "PATCH", body: JSON.stringify({ status: "paused" }),
      });
      showToast("Campaign paused");
      await refetch();
    } catch (e) { showToast(e.message, "error"); }
    setSaving(false);
  };

  const deleteCampaign = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await adminFetch(currentUser, `/api/admin/notifications/campaigns/${deleteTarget}`, { method: "DELETE" });
      showToast("Campaign deleted");
      if (selected === deleteTarget) { setSelected(null); setShowEditor(false); }
      setDeleteTarget(null);
      await refetch();
    } catch (e) { showToast(e.message, "error"); }
    setSaving(false);
  };

  const addUserIdChip = () => {
    const id = userIdInput.trim();
    if (!id) return;
    setDraft((p) => ({
      ...p,
      target: { ...p.target, userIds: [...(p.target.userIds || []), id] },
    }));
    setUserIdInput("");
  };

  const removeUserIdChip = (id) => {
    setDraft((p) => ({
      ...p,
      target: { ...p.target, userIds: (p.target.userIds || []).filter((u) => u !== id) },
    }));
  };

  const toggleGroupTag = (tag) => {
    setDraft((p) => {
      const current = p.target.groups || [];
      const next = current.includes(tag) ? current.filter((g) => g !== tag) : [...current, tag];
      return { ...p, target: { ...p.target, groups: next } };
    });
  };

  const selectedCampaign = useMemo(() => campaigns.find((c) => c.id === selected) || null, [campaigns, selected]);

  // Analytics from campaign data
  const analytics = useMemo(() => {
    if (!selectedCampaign) return null;
    return {
      views: selectedCampaign.analytics?.views || 0,
      clicks: selectedCampaign.analytics?.clicks || 0,
      dismissals: selectedCampaign.analytics?.dismissals || 0,
      ctr: selectedCampaign.analytics?.views > 0
        ? ((selectedCampaign.analytics?.clicks || 0) / selectedCampaign.analytics.views * 100).toFixed(1)
        : "0.0",
    };
  }, [selectedCampaign]);

  const statusBadgeClass = (s) => {
    return `notif-badge notif-badge-${s === "active" ? "active" : s === "expired" ? "expired" : s === "paused" ? "paused" : "draft"}`;
  };

  const typeBadgeClass = (t) => `notif-badge notif-type-${t || "feed"}`;

  return (
    <div style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: 0, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.15))", border: "1px solid rgba(168,85,247,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={22} color="#c084fc" />
            </div>
            Notification Campaigns
          </h1>
          <p style={{ color: "var(--txt2)", margin: "8px 0 0 0", fontSize: "0.9375rem" }}>
            Create, manage, and push notification campaigns to users in real-time.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="notif-btn notif-btn-ghost" onClick={() => refetch()} title="Refresh">
            <RefreshCcw size={16} /> Refresh
          </button>
          <button className="notif-btn notif-btn-primary" onClick={startNew}>
            <Plus size={16} /> New Campaign
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: showEditor ? "1fr 520px" : "1fr", gap: 16, alignItems: "start" }}>
        {/* ═══ Campaign List ═══ */}
        <div className="notif-glass" style={{ overflow: "hidden" }}>
          {/* Search + Filter */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="notif-search" style={{ marginBottom: 12 }}>
              <Search size={16} color="var(--txt3)" />
              <input placeholder="Search campaigns..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
              {searchQ && <button onClick={() => setSearchQ("")} style={{ background: "none", border: "none", color: "var(--txt3)", cursor: "pointer", padding: 0 }}><X size={14} /></button>}
            </div>
            <div className="notif-filter-bar" style={{ padding: 0 }}>
              {STATUS_TABS.map((t) => (
                <button key={t.id} className={`notif-filter-tab ${statusFilter === t.id ? "active" : ""}`}
                  onClick={() => setStatusFilter(t.id)}>
                  {t.label}
                  {t.id !== "all" && <span style={{ marginLeft: 4, opacity: 0.6 }}>
                    ({campaigns.filter((c) => c.status === t.id).length})
                  </span>}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign List */}
          {error && <div style={{ padding: 16, color: "#fca5a5", fontSize: "0.875rem" }}>⚠ {error.message}</div>}
          {isLoading ? (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--txt3)" }}>
              <RefreshCcw size={20} className="spin" style={{ margin: "0 auto 12px", display: "block" }} />
              Loading campaigns…
            </div>
          ) : filtered.length === 0 ? (
            <div className="notif-empty">
              <div className="notif-empty-icon"><Bell size={24} color="var(--txt3)" /></div>
              <div className="notif-empty-title">{searchQ ? "No matching campaigns" : "No campaigns yet"}</div>
              <div className="notif-empty-msg">{searchQ ? "Try a different search term." : "Create your first campaign to get started."}</div>
              {!searchQ && <button className="notif-btn notif-btn-primary notif-btn-sm" onClick={startNew} style={{ marginTop: 8 }}><Plus size={14} /> Create Campaign</button>}
            </div>
          ) : (
            <div style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }} className="notif-scroll">
              {filtered.map((c) => {
                const active = selected === c.id;
                const priorityLabel = PRIORITY_OPTIONS.find((p) => p.value === (c.priority || 1));
                return (
                  <div key={c.id} className={`notif-campaign-item ${active ? "active" : ""}`} onClick={() => loadIntoDraft(c)}>
                    <div className="notif-campaign-row">
                      <div className={`notif-priority-dot notif-priority-dot-${c.priority || 1}`} />
                      <div className="notif-campaign-title">{c.title || c.name || "(untitled)"}</div>
                      <span className={typeBadgeClass(c.type || c.display)}>{c.type || c.display || "feed"}</span>
                      <span className={statusBadgeClass(c.status)}>{c.status || "draft"}</span>
                    </div>
                    <div className="notif-campaign-msg">{c.message || ""}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.6875rem", color: "var(--txt3)", fontWeight: 700 }}>
                      <span>{formatDate(c.startAt || c.createdAt)}</span>
                      {c.endAt && <span>→ {formatDate(c.endAt)}</span>}
                      <span style={{ marginLeft: "auto" }}>P{c.priority || 1} · {priorityLabel?.label || "Low"}</span>
                      <button className="notif-btn notif-btn-danger notif-btn-sm notif-btn-icon"
                        style={{ width: 28, height: 28 }}
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(c.id); }}
                        title="Delete campaign">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats bar */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 16, fontSize: "0.75rem", color: "var(--txt3)", fontWeight: 800 }}>
            <span>{campaigns.length} total</span>
            <span style={{ color: "#34d399" }}>{campaigns.filter((c) => c.status === "active").length} active</span>
            <span>{campaigns.filter((c) => c.status === "draft").length} draft</span>
            <span style={{ color: "#fbbf24" }}>{campaigns.filter((c) => c.status === "paused").length} paused</span>
          </div>
        </div>

        {/* ═══ Campaign Editor ═══ */}
        <AnimatePresence>
          {showEditor && (
            <motion.div key="editor" className="notif-glass notif-scroll"
              initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}
              style={{ maxHeight: "calc(100vh - 120px)", overflowY: "auto", position: "sticky", top: "1rem" }}>
              {/* Editor Header */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 900, fontSize: "1.05rem" }}>
                  {selectedCampaign ? "Edit Campaign" : "Create Campaign"}
                </div>
                <button className="notif-btn notif-btn-ghost notif-btn-icon" onClick={() => setShowEditor(false)}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Analytics (when editing existing) */}
                {selectedCampaign && analytics && (
                  <div>
                    <span className="notif-label">Analytics</span>
                    <div className="notif-stats-grid">
                      <div className="notif-stat-card">
                        <div className="notif-stat-value" style={{ color: "#60a5fa" }}>
                          <Eye size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />{analytics.views}
                        </div>
                        <div className="notif-stat-label">Views</div>
                      </div>
                      <div className="notif-stat-card">
                        <div className="notif-stat-value" style={{ color: "#34d399" }}>
                          <MousePointerClick size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />{analytics.clicks}
                        </div>
                        <div className="notif-stat-label">Clicks</div>
                      </div>
                      <div className="notif-stat-card">
                        <div className="notif-stat-value" style={{ color: "#fbbf24" }}>
                          <TrendingUp size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />{analytics.ctr}%
                        </div>
                        <div className="notif-stat-label">CTR</div>
                      </div>
                      <div className="notif-stat-card">
                        <div className="notif-stat-value" style={{ color: "#f87171" }}>
                          <EyeOff size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />{analytics.dismissals}
                        </div>
                        <div className="notif-stat-label">Dismissed</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Basic Info */}
                <div>
                  <span className="notif-label">Campaign Name</span>
                  <input className="notif-input" value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Internal campaign name" />
                </div>
                <div>
                  <span className="notif-label">Title *</span>
                  <input className="notif-input" value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} placeholder="User-facing title" />
                </div>
                <div>
                  <span className="notif-label">Message *</span>
                  <textarea className="notif-input notif-textarea" value={draft.message} onChange={(e) => setDraft((p) => ({ ...p, message: e.target.value }))} placeholder="Notification body text..." rows={4} />
                </div>

                {/* Notification Type */}
                <div>
                  <span className="notif-label">Notification Type</span>
                  <div className="notif-type-cards">
                    {TYPE_OPTIONS.map((t) => (
                      <div key={t.id}
                        className={`notif-type-card ${draft.type === t.id ? "selected" : ""}`}
                        onClick={() => setDraft((p) => ({ ...p, type: t.id }))}>
                        <div className="notif-type-card-icon" style={{ background: t.bg }}>
                          <t.icon size={18} color={t.color} />
                        </div>
                        <div className="notif-type-card-label">{t.label}</div>
                        <div style={{ fontSize: "0.625rem", color: "var(--txt3)" }}>{t.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <span className="notif-label">Priority</span>
                  <div className="notif-priority-cards">
                    {PRIORITY_OPTIONS.map((p) => (
                      <div key={p.value}
                        className={`notif-priority-card ${draft.priority === p.value ? `selected sel-${p.value}` : ""}`}
                        onClick={() => setDraft((prev) => ({ ...prev, priority: p.value }))}>
                        <div className={`notif-priority-dot notif-priority-dot-${p.value}`} style={{ margin: "0 auto 6px" }} />
                        {p.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rich Content */}
                <div>
                  <span className="notif-label">Rich Content</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ position: "relative" }}>
                      <Image size={14} style={{ position: "absolute", left: 12, top: 13, color: "var(--txt3)" }} />
                      <input className="notif-input" style={{ paddingLeft: 34 }} value={draft.imageUrl}
                        onChange={(e) => setDraft((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="Image URL (optional)" />
                    </div>
                    {draft.imageUrl && (
                      <img src={draft.imageUrl} alt="preview" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}
                        onError={(e) => { e.target.style.display = "none"; }} />
                    )}
                    <div style={{ position: "relative" }}>
                      <Video size={14} style={{ position: "absolute", left: 12, top: 13, color: "var(--txt3)" }} />
                      <input className="notif-input" style={{ paddingLeft: 34 }} value={draft.videoUrl}
                        onChange={(e) => setDraft((p) => ({ ...p, videoUrl: e.target.value }))} placeholder="Video URL or embed (optional)" />
                    </div>
                  </div>
                </div>

                {/* HTML Template */}
                <div>
                  <span className="notif-label">Custom HTML Template (Replaces standard layout)</span>
                  <textarea className="notif-input notif-textarea" value={draft.htmlContent} onChange={(e) => setDraft((p) => ({ ...p, htmlContent: e.target.value }))} placeholder="<html><body>...</body></html>" rows={5} style={{ fontFamily: "monospace", fontSize: "0.875rem" }} />
                </div>

                {/* CTA Buttons */}
                <div>
                  <span className="notif-label">Call to Action</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <input className="notif-input" value={draft.ctaText}
                      onChange={(e) => setDraft((p) => ({ ...p, ctaText: e.target.value }))} placeholder="Primary CTA text" />
                    <div style={{ position: "relative" }}>
                      <Link2 size={14} style={{ position: "absolute", left: 12, top: 13, color: "var(--txt3)" }} />
                      <input className="notif-input" style={{ paddingLeft: 34 }} value={draft.ctaLink}
                        onChange={(e) => setDraft((p) => ({ ...p, ctaLink: e.target.value }))} placeholder="CTA link" />
                    </div>
                    <input className="notif-input" value={draft.ctaSecondaryText}
                      onChange={(e) => setDraft((p) => ({ ...p, ctaSecondaryText: e.target.value }))} placeholder="Secondary CTA (optional)" />
                    <div style={{ position: "relative" }}>
                      <Link2 size={14} style={{ position: "absolute", left: 12, top: 13, color: "var(--txt3)" }} />
                      <input className="notif-input" style={{ paddingLeft: 34 }} value={draft.ctaSecondaryLink}
                        onChange={(e) => setDraft((p) => ({ ...p, ctaSecondaryLink: e.target.value }))} placeholder="Secondary link" />
                    </div>
                  </div>
                </div>

                {/* Legacy Link */}
                <div>
                  <span className="notif-label">Default Link (fallback)</span>
                  <div style={{ position: "relative" }}>
                    <ExternalLink size={14} style={{ position: "absolute", left: 12, top: 13, color: "var(--txt3)" }} />
                    <input className="notif-input" style={{ paddingLeft: 34 }} value={draft.link}
                      onChange={(e) => setDraft((p) => ({ ...p, link: e.target.value }))} placeholder="/dashboard or https://..." />
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <span className="notif-label">Schedule</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--txt3)", marginBottom: 5 }}>Start Date/Time</div>
                      <input type="datetime-local" className="notif-input" value={toInputValue(draft.startAt)}
                        onChange={(e) => setDraft((p) => ({ ...p, startAt: fromInputValue(e.target.value) }))} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--txt3)", marginBottom: 5 }}>End Date/Time (optional)</div>
                      <input type="datetime-local" className="notif-input" value={toInputValue(draft.endAt)}
                        onChange={(e) => setDraft((p) => ({ ...p, endAt: fromInputValue(e.target.value) }))} />
                    </div>
                  </div>
                </div>

                {/* Audience */}
                <div>
                  <span className="notif-label">Target Audience</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {AUDIENCE_OPTIONS.map((a) => (
                      <div key={a.kind}
                        className={`notif-audience-option ${draft.target.kind === a.kind ? "selected" : ""}`}
                        onClick={() => setDraft((p) => ({ ...p, target: { ...p.target, kind: a.kind } }))}>
                        <div className="notif-audience-radio">
                          <div className="notif-audience-radio-inner" />
                        </div>
                        <a.icon size={18} color={draft.target.kind === a.kind ? "#60a5fa" : "var(--txt3)"} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: "0.8125rem" }}>{a.label}</div>
                          <div style={{ fontSize: "0.6875rem", color: "var(--txt3)" }}>{a.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Group tags */}
                  {draft.target.kind === "group" && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--txt3)", marginBottom: 8 }}>Select groups:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {GROUP_TAGS.map((tag) => {
                          const active = (draft.target.groups || []).includes(tag);
                          return (
                            <button key={tag}
                              className={`notif-btn notif-btn-sm ${active ? "notif-btn-blue" : "notif-btn-ghost"}`}
                              onClick={() => toggleGroupTag(tag)}>
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Individual user IDs */}
                  {draft.target.kind === "individual" && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--txt3)", marginBottom: 8 }}>User IDs:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                        {(draft.target.userIds || []).map((uid) => (
                          <span key={uid} className="notif-chip">
                            {uid.length > 12 ? uid.slice(0, 12) + "…" : uid}
                            <button className="notif-chip-remove" onClick={() => removeUserIdChip(uid)}>×</button>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input className="notif-input" value={userIdInput}
                          onChange={(e) => setUserIdInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUserIdChip(); } }}
                          placeholder="Enter user ID and press Enter" style={{ flex: 1 }} />
                        <button className="notif-btn notif-btn-blue notif-btn-sm" onClick={addUserIdChip}>Add</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Target Webpage */}
                <div>
                  <span className="notif-label">Target Webpage (Optional)</span>
                  <div style={{ position: "relative" }}>
                    <Layout size={14} style={{ position: "absolute", left: 12, top: 13, color: "var(--txt3)" }} />
                    <input className="notif-input" style={{ paddingLeft: 34 }} value={draft.targetPage || ""}
                      onChange={(e) => setDraft((p) => ({ ...p, targetPage: e.target.value }))} placeholder="e.g. /interviews (leave empty for all pages)" />
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--txt3)", marginTop: 4 }}>
                    Only users on this specific path (or matching path prefix) will see the popup.
                  </div>
                </div>

                {/* Preview */}
                <CampaignPreview draft={draft} />

                {/* Actions */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <button className="notif-btn notif-btn-success" style={{ flex: 1 }} onClick={() => save(false)} disabled={saving}>
                      <Save size={15} /> {saving ? "Saving..." : "Save"}
                    </button>
                    <button className="notif-btn notif-btn-blue" style={{ flex: 1 }} disabled={saving}
                      onClick={() => activate({ push: false })} title="Activate (in-app)">
                      <Send size={15} /> Activate
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="notif-btn notif-btn-primary" style={{ flex: 1 }} disabled={saving}
                      onClick={() => activate({ push: true })} title="Activate + FCM push">
                      <Send size={15} /> Activate + Push
                    </button>
                    {selectedCampaign?.status === "active" && (
                      <button className="notif-btn notif-btn-ghost" style={{ flex: 1 }} onClick={pauseCampaign} disabled={saving}>
                        <Pause size={15} /> Pause
                      </button>
                    )}
                    {selectedCampaign?.status === "paused" && (
                      <button className="notif-btn notif-btn-blue" style={{ flex: 1 }} onClick={() => activate({ push: false })} disabled={saving}>
                        <Play size={15} /> Resume
                      </button>
                    )}
                  </div>
                  {selected && (
                    <button className="notif-btn notif-btn-danger" style={{ width: "100%", marginTop: 10 }}
                      onClick={() => setDeleteTarget(selected)}>
                      <Trash2 size={15} /> Delete Campaign
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal name={campaigns.find((c) => c.id === deleteTarget)?.title || ""} onConfirm={deleteCampaign} onCancel={() => setDeleteTarget(null)} />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            style={{
              position: "fixed", bottom: 20, right: 20, zIndex: 10010,
              background: toast.type === "error" ? "rgba(239,68,68,0.18)" : "rgba(16,185,129,0.18)",
              border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.30)" : "rgba(16,185,129,0.30)"}`,
              color: toast.type === "error" ? "#f87171" : "#34d399",
              padding: "12px 18px", borderRadius: 14, fontWeight: 800, fontSize: "0.8125rem",
              backdropFilter: "blur(16px)", boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
            }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
