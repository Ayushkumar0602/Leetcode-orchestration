import React, { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Bell, Plus, Save, Send, RefreshCcw } from "lucide-react";

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

export default function AdminNotifications() {
  const { currentUser } = useAuth();
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState({
    name: "",
    type: "feed",
    title: "",
    message: "",
    link: "",
    priority: 0,
    startAt: null,
    endAt: null,
    target: { kind: "all" },
    status: "draft",
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
    });
  };

  const loadIntoDraft = (c) => {
    setSelected(c.id);
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
                      <span style={{ fontSize: 11, fontWeight: 900, color: c.status === "active" ? "#34d399" : "var(--txt3)" }}>
                        {c.status}
                      </span>
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

            <button
              disabled={!selected}
              onClick={() => activate({ push: true }).catch((e) => alert(e.message))}
              style={{ opacity: selected ? 1 : 0.5, background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.30)", color: "#c084fc", borderRadius: 12, padding: "10px 12px", fontWeight: 900, cursor: selected ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              title="Activate + send FCM push (best-effort)"
            >
              <Send size={16} /> Activate + Push
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

