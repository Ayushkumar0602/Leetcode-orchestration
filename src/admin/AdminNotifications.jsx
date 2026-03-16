import React, { useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  Image as ImageIcon,
  PauseCircle,
  Plus,
  RefreshCcw,
  Save,
  Send,
  Trash2,
  Video,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://leetcode-orchestration.onrender.com";

const glass = {
  background: "rgba(20,22,30,0.65)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "20px",
};

async function adminFetch(currentUser, path, opts = {}) {
  const token = await currentUser.getIdToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
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

function StatusPill({ status }) {
  const color =
    status === "active"
      ? "#34d399"
      : status === "ended"
        ? "#fb923c"
        : status === "scheduled"
          ? "#60a5fa"
          : "#94a3b8";
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 900,
        color,
        background: `${color}15`,
        border: `1px solid ${color}30`,
        borderRadius: 999,
        padding: "2px 8px",
      }}
    >
      {status || "draft"}
    </span>
  );
}

export default function AdminNotifications() {
  const { currentUser } = useAuth();
  const [selected, setSelected] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [draft, setDraft] = useState({
    name: "",
    type: "feed", // feed | popup | banner | announcement
    title: "",
    message: "", // markdown supported
    link: "",
    priority: 0,
    startAt: null,
    endAt: null,
    target: { kind: "all" },
    status: "draft",
    rich: {
      format: "markdown", // markdown | plain
      media: [], // [{type:'image'|'video', url, alt}]
      ctas: [], // [{label, link, variant:'primary'|'secondary'}]
    },
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: () => adminFetch(currentUser, "/api/admin/notifications/campaigns"),
    enabled: !!currentUser,
    retry: false,
  });

  const campaigns = data?.campaigns || [];

  const selectedCampaign = useMemo(() => {
    if (!selected) return null;
    return campaigns.find((c) => c.id === selected) || null;
  }, [campaigns, selected]);

  const startNew = () => {
    setSelected(null);
    setAnalytics(null);
    setDraft({
      name: "",
      type: "feed",
      title: "",
      message: "",
      link: "",
      priority: 0,
      startAt: new Date().toISOString(),
      endAt: null,
      target: { kind: "all" },
      status: "draft",
      rich: { format: "markdown", media: [], ctas: [] },
    });
  };

  const loadIntoDraft = (c) => {
    setSelected(c.id);
    setAnalytics(null);
    setDraft({
      name: c.name || "",
      type: c.type || c.display || "feed",
      title: c.title || "",
      message: c.message || "",
      link: c.link || "",
      priority: c.priority || 0,
      startAt: c.startAt || c.createdAt || new Date().toISOString(),
      endAt: c.endAt || null,
      target: c.target || { kind: "all" },
      status: c.status || "draft",
      rich: c.rich || { format: "markdown", media: [], ctas: [] },
    });
  };

  const save = async () => {
    if (!currentUser) return;
    if (!draft.title || !draft.message) throw new Error("title and message are required");

    if (selected) {
      await adminFetch(currentUser, `/api/admin/notifications/campaigns/${selected}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...draft,
          startAt: draft.startAt,
          endAt: draft.endAt,
        }),
      });
    } else {
      await adminFetch(currentUser, "/api/admin/notifications/campaigns", {
        method: "POST",
        body: JSON.stringify({
          ...draft,
          startAt: draft.startAt,
          endAt: draft.endAt,
        }),
      });
    }
    await refetch();
  };

  const activate = async ({ push }) => {
    if (!selected) return;
    await adminFetch(currentUser, `/api/admin/notifications/campaigns/${selected}/activate`, {
      method: "POST",
      body: JSON.stringify({ push: push === true }),
    });
    await refetch();
  };

  const deactivate = async () => {
    if (!selected) return;
    await adminFetch(currentUser, `/api/admin/notifications/campaigns/${selected}/deactivate`, { method: "POST" });
    await refetch();
  };

  const del = async () => {
    if (!selected) return;
    if (!window.confirm("Delete this campaign permanently?")) return;
    await adminFetch(currentUser, `/api/admin/notifications/campaigns/${selected}`, { method: "DELETE" });
    startNew();
    await refetch();
  };

  const loadAnalytics = async () => {
    if (!selected) return;
    const result = await adminFetch(currentUser, `/api/admin/notifications/campaigns/${selected}/analytics`);
    setAnalytics(result);
  };

  const addCta = () => {
    setDraft((p) => ({
      ...p,
      rich: {
        ...(p.rich || {}),
        ctas: [...(p.rich?.ctas || []), { label: "Learn more", link: p.link || "/notifications", variant: "primary" }],
      },
    }));
  };

  const removeMedia = async (idx) => {
    const m = draft.rich?.media?.[idx];
    setDraft((p) => ({
      ...p,
      rich: { ...(p.rich || {}), media: (p.rich?.media || []).filter((_, i) => i !== idx) },
    }));
    if (m?.url) {
      adminFetch(currentUser, "/api/admin/notifications/media/delete", {
        method: "POST",
        body: JSON.stringify({ publicUrl: m.url }),
      }).catch(() => {});
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (!selected) {
      alert("Save the campaign once before uploading media.");
      return;
    }
    setIsUploading(true);
    try {
      const kind = file.type.startsWith("video/") ? "video" : "image";
      const presign = await adminFetch(currentUser, "/api/admin/notifications/media/presign", {
        method: "POST",
        body: JSON.stringify({
          campaignId: selected,
          filename: file.name || `${kind}.${kind === "video" ? "mp4" : "png"}`,
          contentType: file.type || "application/octet-stream",
        }),
      });

      const uploadRes = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      const url = presign.publicUrl;
      setDraft((p) => ({
        ...p,
        rich: {
          ...(p.rich || {}),
          media: [...(p.rich?.media || []), { type: kind, url, alt: "" }],
        },
      }));
    } catch (e) {
      alert(e.message || "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const PreviewCard = () => {
    const media = draft.rich?.media || [];
    const ctas = draft.rich?.ctas || [];
    return (
      <div style={{ ...glass, padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontWeight: 900 }}>Preview</div>
          <span style={{ fontSize: 11, fontWeight: 900, color: "var(--txt3)" }}>{draft.type.toUpperCase()}</span>
        </div>
        {media.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginBottom: 10 }}>
            {media.slice(0, 1).map((m) => (
              <div key={m.url} style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                {m.type === "video" ? (
                  <video src={m.url} controls style={{ width: "100%", display: "block", maxHeight: 220, background: "#000" }} />
                ) : (
                  <img src={m.url} alt={m.alt || ""} style={{ width: "100%", display: "block", maxHeight: 220, objectFit: "cover" }} />
                )}
              </div>
            ))}
          </div>
        )}
        <div style={{ fontWeight: 900, fontSize: 14 }}>{draft.title || "Title"}</div>
        <div style={{ marginTop: 8, color: "var(--txt2)", fontSize: 13, lineHeight: 1.55 }}>
          {draft.rich?.format === "markdown" ? <ReactMarkdown>{draft.message || ""}</ReactMarkdown> : <span>{draft.message || ""}</span>}
        </div>
        {ctas.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            {ctas.slice(0, 2).map((b, i) => (
              <button
                key={`${b.label}_${i}`}
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
                {b.label || "CTA"}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 1300, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>Notifications</h1>
          <p style={{ color: "var(--txt2)", margin: "8px 0 0 0" }}>
            Create campaigns and push them to users in near real-time.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => refetch()}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 12, padding: "10px 12px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            title="Refresh"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
          <button
            onClick={startNew}
            style={{ background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.30)", color: "#c084fc", borderRadius: 12, padding: "10px 12px", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={16} /> New Campaign
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 430px", gap: 16, alignItems: "stretch" }}>
        <div style={{ ...glass, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
            <Bell size={18} color="#60a5fa" />
            <div style={{ fontWeight: 900 }}>Campaigns</div>
            <div style={{ marginLeft: "auto", color: "var(--txt3)", fontSize: 12, fontWeight: 800 }}>
              {campaigns.length} total
            </div>
          </div>

          {error && <div style={{ padding: 16, color: "#fca5a5" }}>{error.message}</div>}
          {isLoading ? (
            <div style={{ padding: 16, color: "var(--txt3)" }}>Loading…</div>
          ) : (
            <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {campaigns.map((c) => {
                const active = selected === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => loadIntoDraft(c)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: active ? "rgba(59,130,246,0.10)" : "transparent",
                      border: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      color: "#fff",
                      padding: "12px 16px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.title || c.name || "(untitled)"}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 900, color: "var(--txt3)" }}>{c.type}</span>
                      <StatusPill status={c.status} />
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--txt3)", fontWeight: 900 }}>
                        p{c.priority || 0}
                      </span>
                    </div>
                    <div style={{ color: "var(--txt2)", fontSize: 12, marginTop: 6, lineHeight: 1.4 }}>
                      {String(c.message || "").slice(0, 120)}
                      {(c.message || "").length > 120 ? "…" : ""}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ ...glass, padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 12 }}>{selectedCampaign ? "Edit Campaign" : "Create Campaign"}</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ ...glass, padding: 12 }}>
              <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 10 }}>Audience</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <select
                  value={draft.target?.kind || "all"}
                  onChange={(e) => {
                    const kind = e.target.value;
                    if (kind === "uids") setDraft((p) => ({ ...p, target: { kind: "uids", uids: [] } }));
                    else if (kind === "segment") setDraft((p) => ({ ...p, target: { kind: "segment", segment: { plan: "all" } } }));
                    else setDraft((p) => ({ ...p, target: { kind: "all" } }));
                  }}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 12, padding: "10px 12px", outline: "none", fontWeight: 900 }}
                >
                  <option value="all">All users</option>
                  <option value="segment">Segment (plan)</option>
                  <option value="uids">Specific users (UIDs)</option>
                </select>

                {(draft.target?.kind || "all") === "segment" ? (
                  <select
                    value={draft.target?.segment?.plan || "all"}
                    onChange={(e) => setDraft((p) => ({ ...p, target: { kind: "segment", segment: { ...(p.target?.segment || {}), plan: e.target.value } } }))}
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 12, padding: "10px 12px", outline: "none", fontWeight: 900 }}
                    title="Plan-based segment"
                  >
                    <option value="all">All plans</option>
                    <option value="Blaze">Blaze (paid)</option>
                    <option value="Spark">Spark (free)</option>
                  </select>
                ) : (
                  <div />
                )}
              </div>

              {(draft.target?.kind || "all") === "uids" && (
                <div style={{ marginTop: 10 }}>
                  <input
                    value={(draft.target?.uids || []).join(",")}
                    onChange={(e) => {
                      const uids = e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .slice(0, 500);
                      setDraft((p) => ({ ...p, target: { kind: "uids", uids } }));
                    }}
                    placeholder="Comma-separated UIDs (max 500)"
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 12, padding: "10px 12px", outline: "none" }}
                  />
                  <div style={{ marginTop: 6, fontSize: 11, color: "var(--txt3)", fontWeight: 900 }}>
                    {(draft.target?.uids || []).length} selected
                  </div>
                </div>
              )}
            </div>

            <input
              value={draft.title}
              onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
              placeholder="Title"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 12, padding: "10px 12px", outline: "none" }}
            />
            <textarea
              value={draft.message}
              onChange={(e) => setDraft((p) => ({ ...p, message: e.target.value }))}
              placeholder="Message"
              rows={5}
              style={{ resize: "vertical", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 12, padding: "10px 12px", outline: "none" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <select
                value={draft.type}
                onChange={(e) => setDraft((p) => ({ ...p, type: e.target.value }))}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 12, padding: "10px 12px", outline: "none" }}
              >
                <option value="feed">Feed</option>
                <option value="popup">Popup</option>
                <option value="banner">Banner</option>
                <option value="announcement">Announcement</option>
              </select>
              <input
                type="number"
                value={draft.priority}
                onChange={(e) => setDraft((p) => ({ ...p, priority: Number(e.target.value || 0) }))}
                placeholder="Priority"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 12, padding: "10px 12px", outline: "none" }}
              />
            </div>

            <div style={{ ...glass, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontWeight: 900, fontSize: 13 }}>Rich content</div>
                <select
                  value={draft.rich?.format || "markdown"}
                  onChange={(e) => setDraft((p) => ({ ...p, rich: { ...(p.rich || {}), format: e.target.value } }))}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 10, padding: "6px 10px", outline: "none", fontWeight: 900, fontSize: 12 }}
                >
                  <option value="markdown">Markdown</option>
                  <option value="plain">Plain</option>
                </select>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={(e) => handleUpload(e.target.files?.[0])} />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  disabled={!selected || isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "#fff",
                    borderRadius: 12,
                    padding: "8px 10px",
                    fontWeight: 900,
                    cursor: !selected || isUploading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    opacity: !selected || isUploading ? 0.6 : 1,
                    fontSize: 12,
                  }}
                  title={!selected ? "Save campaign first" : "Upload image/video"}
                >
                  <ImageIcon size={16} /> Upload media
                </button>
                <button
                  onClick={addCta}
                  style={{
                    background: "rgba(59,130,246,0.16)",
                    border: "1px solid rgba(59,130,246,0.28)",
                    color: "#60a5fa",
                    borderRadius: 12,
                    padding: "8px 10px",
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                  }}
                >
                  <Plus size={16} /> Add CTA
                </button>
              </div>

              {(draft.rich?.media || []).length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  {(draft.rich.media || []).map((m, idx) => (
                    <div key={m.url} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(168,85,247,0.16)", border: "1px solid rgba(168,85,247,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {m.type === "video" ? <Video size={16} color="#c084fc" /> : <ImageIcon size={16} color="#c084fc" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.url}</div>
                        <div style={{ fontSize: 11, color: "var(--txt3)", fontWeight: 900 }}>{m.type}</div>
                      </div>
                      <button
                        onClick={() => removeMedia(idx)}
                        style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.22)", color: "#f87171", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                        title="Remove media"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {(draft.rich?.ctas || []).length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  {(draft.rich.ctas || []).map((b, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 110px 40px", gap: 8 }}>
                      <input
                        value={b.label || ""}
                        onChange={(e) => setDraft((p) => ({ ...p, rich: { ...(p.rich || {}), ctas: (p.rich?.ctas || []).map((x, ix) => (ix === i ? { ...x, label: e.target.value } : x)) } }))}
                        placeholder="CTA label"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 12, padding: "10px 12px", outline: "none" }}
                      />
                      <input
                        value={b.link || ""}
                        onChange={(e) => setDraft((p) => ({ ...p, rich: { ...(p.rich || {}), ctas: (p.rich?.ctas || []).map((x, ix) => (ix === i ? { ...x, link: e.target.value } : x)) } }))}
                        placeholder="CTA link (/path or https://...)"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 12, padding: "10px 12px", outline: "none" }}
                      />
                      <select
                        value={b.variant || "primary"}
                        onChange={(e) => setDraft((p) => ({ ...p, rich: { ...(p.rich || {}), ctas: (p.rich?.ctas || []).map((x, ix) => (ix === i ? { ...x, variant: e.target.value } : x)) } }))}
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 12, padding: "10px 12px", outline: "none" }}
                      >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                      </select>
                      <button
                        onClick={() => setDraft((p) => ({ ...p, rich: { ...(p.rich || {}), ctas: (p.rich?.ctas || []).filter((_, ix) => ix !== i) } }))}
                        style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.22)", color: "#f87171", borderRadius: 12, cursor: "pointer" }}
                        title="Remove CTA"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <PreviewCard />

            <input
              value={draft.link}
              onChange={(e) => setDraft((p) => ({ ...p, link: e.target.value }))}
              placeholder="Optional link (e.g. /dashboard)"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 12, padding: "10px 12px", outline: "none" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: "var(--txt3)", marginBottom: 6 }}>Start</div>
                <input
                  type="datetime-local"
                  value={toInputValue(draft.startAt)}
                  onChange={(e) => setDraft((p) => ({ ...p, startAt: fromInputValue(e.target.value) }))}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 12, padding: "10px 12px", outline: "none" }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: "var(--txt3)", marginBottom: 6 }}>End (optional)</div>
                <input
                  type="datetime-local"
                  value={toInputValue(draft.endAt)}
                  onChange={(e) => setDraft((p) => ({ ...p, endAt: fromInputValue(e.target.value) }))}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 12, padding: "10px 12px", outline: "none" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button
                onClick={() => save().catch((e) => alert(e.message))}
                style={{ flex: 1, background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399", borderRadius: 12, padding: "10px 12px", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Save size={16} /> Save
              </button>
              <button
                disabled={!selected}
                onClick={() => activate({ push: false }).catch((e) => alert(e.message))}
                style={{ flex: 1, opacity: selected ? 1 : 0.5, background: "rgba(59,130,246,0.16)", border: "1px solid rgba(59,130,246,0.28)", color: "#60a5fa", borderRadius: 12, padding: "10px 12px", fontWeight: 900, cursor: selected ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                title={selected ? "Activate (in-app realtime)" : "Save first"}
              >
                <Send size={16} /> Activate
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                disabled={!selected}
                onClick={() => deactivate().catch((e) => alert(e.message))}
                style={{ opacity: selected ? 1 : 0.5, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", borderRadius: 12, padding: "10px 12px", fontWeight: 900, cursor: selected ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                title="Deactivate (back to draft)"
              >
                <PauseCircle size={16} /> Deactivate
              </button>
              <button
                disabled={!selected}
                onClick={() => loadAnalytics().catch((e) => alert(e.message))}
                style={{ opacity: selected ? 1 : 0.5, background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399", borderRadius: 12, padding: "10px 12px", fontWeight: 900, cursor: selected ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                title="Load analytics"
              >
                <BarChart3 size={16} /> Analytics
              </button>
            </div>

            <button
              disabled={!selected}
              onClick={() => activate({ push: true }).catch((e) => alert(e.message))}
              style={{ opacity: selected ? 1 : 0.5, background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.30)", color: "#c084fc", borderRadius: 12, padding: "10px 12px", fontWeight: 900, cursor: selected ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              title="Activate + send FCM push (best-effort)"
            >
              <Send size={16} /> Activate + Push
            </button>

            <button
              disabled={!selected}
              onClick={() => del().catch((e) => alert(e.message))}
              style={{ opacity: selected ? 1 : 0.5, background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.22)", color: "#f87171", borderRadius: 12, padding: "10px 12px", fontWeight: 900, cursor: selected ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              title="Delete campaign"
            >
              <Trash2 size={16} /> Delete
            </button>

            {analytics && (
              <div style={{ ...glass, padding: 12 }}>
                <div style={{ fontWeight: 900, marginBottom: 10 }}>Campaign analytics</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Receipts", value: analytics.receipts },
                    { label: "Seen", value: analytics.seen },
                    { label: "Read", value: analytics.read },
                    { label: "Clicked", value: analytics.clicked },
                  ].map((m) => (
                    <div key={m.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 10 }}>
                      <div style={{ fontSize: 11, color: "var(--txt3)", fontWeight: 900 }}>{m.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>{m.value ?? 0}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

