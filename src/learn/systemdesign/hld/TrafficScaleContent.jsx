import { useState, useEffect, useRef } from "react";

// ─── NAV TOPICS ───────────────────────────────────────────────────────────────
const NAV_TOPICS = [
  { id: "intro", label: "Introduction" },
  { id: "key-metrics", label: "Key Metrics" },
  { id: "traffic-types", label: "Types of Traffic" },
  { id: "bote", label: "Back-of-Envelope" },
  { id: "storage", label: "Storage Estimation" },
  { id: "bandwidth", label: "Bandwidth Estimation" },
  { id: "scaling", label: "Scaling Concepts" },
  { id: "optimization", label: "Optimization Techniques" },
  { id: "interview", label: "Interview Perspective" },
];

// ─── SHARED COMPONENTS (same patterns as Foundations) ─────────────────────────

const Pill = ({ color, children }) => (
  <span style={{
    display: "inline-block", padding: "2px 10px", borderRadius: "20px",
    fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em",
    background: color + "22", color, border: `1px solid ${color}44`,
    fontFamily: "'JetBrains Mono', monospace"
  }}>{children}</span>
);

const SH = ({ id, icon, accent, title, subtitle }) => (
  <div id={id} style={{ scrollMarginTop: "80px", marginBottom: "2rem" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "0.5rem" }}>
      <div style={{
        width: 44, height: 44, borderRadius: "12px", display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: "1.4rem",
        background: accent + "18", border: `1px solid ${accent}33`, flexShrink: 0
      }}>{icon}</div>
      <h2 style={{ margin: 0, fontSize: "1.7rem", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.4px", fontFamily: "'Syne', sans-serif" }}>
        {title}
      </h2>
    </div>
    {subtitle && <p style={{ margin: "0 0 0 58px", color: "#64748b", fontSize: "0.95rem" }}>{subtitle}</p>}
    <div style={{ height: 2, background: `linear-gradient(90deg, ${accent}55, transparent)`, marginTop: "1rem", borderRadius: 2 }} />
  </div>
);

const InfoBox = ({ color, icon, title, children }) => (
  <div style={{
    background: color + "08", border: `1px solid ${color}30`, borderLeft: `4px solid ${color}`,
    borderRadius: "0 12px 12px 0", padding: "1.25rem 1.5rem", marginBottom: "1rem"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
      <span style={{ fontSize: "1.1rem" }}>{icon}</span>
      <strong style={{ color: "#f1f5f9", fontSize: "1rem", fontFamily: "'Syne', sans-serif" }}>{title}</strong>
    </div>
    <div style={{ color: "#94a3b8", fontSize: "0.92rem", lineHeight: 1.75 }}>{children}</div>
  </div>
);

const Code = ({ children }) => (
  <code style={{
    background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)",
    padding: "2px 8px", borderRadius: "6px", fontSize: "0.83rem",
    color: "#c4b5fd", fontFamily: "'JetBrains Mono', monospace"
  }}>{children}</code>
);

const CodeBlock = ({ children }) => (
  <pre style={{
    background: "rgba(2,6,23,0.95)", border: "1px solid rgba(167,139,250,0.15)",
    padding: "1.25rem 1.5rem", borderRadius: "12px", fontSize: "0.82rem",
    color: "#c4b5fd", fontFamily: "'JetBrains Mono', monospace", overflowX: "auto",
    lineHeight: 1.8, margin: "1rem 0"
  }}>{children}</pre>
);

const Callout = ({ type, children }) => {
  const map = {
    warn: { color: "#fbbf24", icon: "⚠️", label: "EDGE CASE" },
    tip: { color: "#34d399", icon: "💡", label: "PRO TIP" },
    err: { color: "#f87171", icon: "🚨", label: "WATCH OUT" },
    note: { color: "#a78bfa", icon: "📌", label: "NOTE" },
    formula: { color: "#38bdf8", icon: "🧮", label: "FORMULA" },
    real: { color: "#f472b6", icon: "🌍", label: "REAL WORLD" },
  };
  const { color, icon, label } = map[type] || map.note;
  return (
    <div style={{
      background: color + "0d", border: `1px solid ${color}33`, borderRadius: "10px",
      padding: "1rem 1.25rem", margin: "1rem 0", display: "flex", gap: "12px"
    }}>
      <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div>
        <Pill color={color}>{label}</Pill>
        <div style={{ color: "#cbd5e1", fontSize: "0.91rem", marginTop: "6px", lineHeight: 1.7 }}>{children}</div>
      </div>
    </div>
  );
};

const Table = ({ headers, rows, accentCol = 0 }) => (
  <div style={{ overflowX: "auto", margin: "1.25rem 0", maxWidth: "100%" }}>
    <table style={{ minWidth: "600px", width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{
              padding: "10px 14px", textAlign: "left", fontWeight: 700,
              color: "#f1f5f9", background: "rgba(167,139,250,0.08)",
              borderBottom: "1px solid rgba(167,139,250,0.2)",
              fontFamily: "'Syne', sans-serif", fontSize: "0.82rem", letterSpacing: "0.04em"
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            {row.map((cell, j) => (
              <td key={j} style={{
                padding: "10px 14px",
                color: j === accentCol ? "#c4b5fd" : "#94a3b8",
                fontWeight: j === accentCol ? 700 : 400,
                fontFamily: j === accentCol ? "'JetBrains Mono', monospace" : "inherit"
              }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color }) => (
  <div style={{
    background: color + "08", border: `1px solid ${color}25`, borderRadius: "14px",
    padding: "1.25rem", display: "flex", flexDirection: "column", gap: "6px"
  }}>
    <div style={{ fontSize: "1.6rem" }}>{icon}</div>
    <div style={{ fontSize: "1.5rem", fontWeight: 900, color, fontFamily: "'Syne', sans-serif" }}>{value}</div>
    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9", fontFamily: "'Syne', sans-serif" }}>{label}</div>
    {sub && <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{sub}</div>}
  </div>
);

// ─── FLOW DIAGRAM — pure SVG inline ──────────────────────────────────────────
const TrafficFlowDiagram = () => (
  <div style={{ margin: "1.75rem 0", overflowX: "auto" }}>
    <svg viewBox="0 0 820 200" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 820, display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#a78bfa" />
        </marker>
      </defs>

      {/* Background */}
      <rect width="820" height="200" fill="rgba(2,6,23,0.97)" rx="14" />

      {/* Nodes */}
      {[
        { x: 20, label: "Users", sub: "Millions", color: "#f472b6", icon: "👥" },
        { x: 175, label: "CDN / Edge", sub: "Cache hit", color: "#38bdf8", icon: "🌐" },
        { x: 330, label: "Load Balancer", sub: "RPS split", color: "#34d399", icon: "⚖️" },
        { x: 490, label: "App Servers", sub: "Stateless", color: "#fbbf24", icon: "🖥️" },
        { x: 645, label: "DB / Cache", sub: "Read replica", color: "#a78bfa", icon: "🗄️" },
      ].map((n, i) => (
        <g key={i} filter="url(#glow)">
          <rect x={n.x} y={40} width={130} height={90} rx="10"
            fill={n.color + "12"} stroke={n.color + "55"} strokeWidth="1.5" />
          <text x={n.x + 65} y={72} textAnchor="middle" fontSize="20">{n.icon}</text>
          <text x={n.x + 65} y={100} textAnchor="middle" fill="#f1f5f9"
            fontSize="11" fontFamily="'Syne', sans-serif" fontWeight="700">{n.label}</text>
          <text x={n.x + 65} y={118} textAnchor="middle" fill="#64748b" fontSize="9">{n.sub}</text>
        </g>
      ))}

      {/* Arrows */}
      {[150, 305, 460, 615].map((x, i) => (
        <line key={i} x1={x} y1={85} x2={x + 22} y2={85}
          stroke="#a78bfa" strokeWidth="1.5" markerEnd="url(#arrow)" strokeDasharray="4 2" opacity="0.7" />
      ))}

      {/* Labels above arrows */}
      {[
        { x: 155, label: "Request" },
        { x: 310, label: "Route" },
        { x: 465, label: "Process" },
        { x: 620, label: "Query" },
      ].map((l, i) => (
        <text key={i} x={l.x} y={76} textAnchor="middle" fill="#64748b" fontSize="8"
          fontFamily="'JetBrains Mono', monospace">{l.label}</text>
      ))}

      {/* Bottom label */}
      <text x="410" y="185" textAnchor="middle" fill="#475569" fontSize="9"
        fontFamily="'Syne', sans-serif">End-to-end request lifecycle — each hop adds latency & scale requirements</text>
    </svg>
  </div>
);

// ─── SCALING DIAGRAM ──────────────────────────────────────────────────────────
const ScalingDiagram = () => (
  <div style={{ margin: "1.75rem 0", overflowX: "auto" }}>
    <svg viewBox="0 0 820 260" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 820, display: "block", margin: "0 auto" }}>
      <rect width="820" height="260" fill="rgba(2,6,23,0.97)" rx="14" />

      {/* VERTICAL label */}
      <text x="30" y="130" textAnchor="middle" fill="#a78bfa"
        fontSize="11" fontFamily="'Syne', sans-serif" fontWeight="800"
        transform="rotate(-90, 30, 130)">VERTICAL SCALING</text>
      <rect x="55" y="30" width="320" height="200" rx="10"
        fill="rgba(167,139,250,0.05)" stroke="rgba(167,139,250,0.2)" strokeWidth="1" />

      {/* Single big server */}
      <rect x="140" y="70" width="160" height="120" rx="10"
        fill="rgba(167,139,250,0.12)" stroke="#a78bfa" strokeWidth="1.5" />
      <text x="220" y="100" textAnchor="middle" fill="#c4b5fd" fontSize="24">🖥️</text>
      <text x="220" y="125" textAnchor="middle" fill="#f1f5f9" fontSize="10"
        fontFamily="'Syne', sans-serif" fontWeight="700">BIG SERVER</text>
      <text x="220" y="142" textAnchor="middle" fill="#64748b" fontSize="9">64 CPU / 512 GB RAM</text>
      <text x="220" y="158" textAnchor="middle" fill="#34d399" fontSize="9">↑ Upgrade hardware</text>
      <text x="220" y="172" textAnchor="middle" fill="#f87171" fontSize="9">✗ Single point of failure</text>

      {/* Caption */}
      <text x="215" y="245" textAnchor="middle" fill="#475569" fontSize="9"
        fontFamily="'JetBrains Mono', monospace">Scale Up: Bigger machine</text>

      {/* HORIZONTAL label */}
      <text x="600" y="130" textAnchor="middle" fill="#34d399"
        fontSize="11" fontFamily="'Syne', sans-serif" fontWeight="800"
        transform="rotate(-90, 600, 130)">HORIZONTAL SCALING</text>
      <rect x="420" y="30" width="370" height="200" rx="10"
        fill="rgba(52,211,153,0.04)" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />

      {/* LB box */}
      <rect x="430" y="90" width="80" height="50" rx="8"
        fill="rgba(56,189,248,0.12)" stroke="#38bdf8" strokeWidth="1.5" />
      <text x="470" y="113" textAnchor="middle" fill="#38bdf8" fontSize="16">⚖️</text>
      <text x="470" y="130" textAnchor="middle" fill="#7dd3fc" fontSize="8"
        fontFamily="'Syne', sans-serif">LB</text>

      {/* 3 servers */}
      {[0, 1, 2].map(i => (
        <g key={i}>
          <line x1="510" y1="115" x2="555" y2={65 + i * 66}
            stroke="#34d399" strokeWidth="1" strokeDasharray="3 2" opacity="0.6"
            markerEnd="url(#arrow2)" />
          <rect x="555" y={40 + i * 66} width="100" height="50" rx="8"
            fill="rgba(52,211,153,0.08)" stroke="#34d399" strokeWidth="1.2" />
          <text x="605" y={62 + i * 66} textAnchor="middle" fill="#86efac" fontSize="16">🖥️</text>
          <text x="605" y={79 + i * 66} textAnchor="middle" fill="#94a3b8" fontSize="8"
            fontFamily="'Syne', sans-serif">Server {i + 1}</text>
        </g>
      ))}

      <text x="605" y="245" textAnchor="middle" fill="#475569" fontSize="9"
        fontFamily="'JetBrains Mono', monospace">Scale Out: More machines</text>

      {/* vs divider */}
      <text x="415" y="138" textAnchor="middle" fill="#a78bfa" fontSize="18"
        fontFamily="'Syne', sans-serif" fontWeight="900">VS</text>
    </svg>
  </div>
);

// ─── TRAFFIC GRAPH ────────────────────────────────────────────────────────────
const TrafficGraph = () => {
  const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  const vals = [5, 3, 2, 2, 3, 8, 25, 60, 80, 85, 82, 88, 75, 80, 85, 88, 90, 82, 70, 55, 40, 28, 18, 10];
  const W = 760, H = 160, pad = { t: 20, b: 40, l: 40, r: 20 };
  const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b;
  const xs = hours.map(h => pad.l + (h / 23) * iW);
  const ys = vals.map(v => pad.t + iH - (v / 100) * iH);
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = `${path} L${xs[xs.length - 1]},${pad.t + iH} L${xs[0]},${pad.t + iH} Z`;

  return (
    <div style={{ margin: "1.75rem 0", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", maxWidth: W, display: "block", margin: "0 auto" }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="rgba(2,6,23,0.97)" rx="14" />

        {/* Y gridlines */}
        {[0, 25, 50, 75, 100].map(v => {
          const y = pad.t + iH - (v / 100) * iH;
          return (
            <g key={v}>
              <line x1={pad.l} y1={y} x2={W - pad.r} y2={y}
                stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x={pad.l - 6} y={y + 4} textAnchor="end"
                fill="#475569" fontSize="9" fontFamily="'JetBrains Mono', monospace">{v}%</text>
            </g>
          );
        })}

        {/* Area + line */}
        <path d={area} fill="url(#areaGrad)" />
        <path d={path} fill="none" stroke="#a78bfa" strokeWidth="2.5" />

        {/* Peak annotation */}
        <line x1={xs[16]} y1={ys[16] - 6} x2={xs[16]} y2={ys[16] + 30}
          stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />
        <text x={xs[16]} y={ys[16] - 10} textAnchor="middle"
          fill="#fbbf24" fontSize="9" fontFamily="'Syne', sans-serif" fontWeight="700">PEAK</text>

        {/* X axis labels */}
        {[0, 6, 12, 18, 23].map(h => (
          <text key={h} x={pad.l + (h / 23) * iW} y={H - 6} textAnchor="middle"
            fill="#475569" fontSize="9" fontFamily="'JetBrains Mono', monospace">{h}:00</text>
        ))}

        <text x={W / 2} y={H - 0} textAnchor="middle" fill="#64748b" fontSize="9"
          fontFamily="'Syne', sans-serif">Typical daily traffic pattern — peak ~4–6× average</text>
      </svg>
    </div>
  );
};

// ─── CACHING DIAGRAM ─────────────────────────────────────────────────────────
const CacheDiagram = () => (
  <div style={{ margin: "1.75rem 0", overflowX: "auto" }}>
    <svg viewBox="0 0 820 190" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 820, display: "block", margin: "0 auto" }}>
      <rect width="820" height="190" fill="rgba(2,6,23,0.97)" rx="14" />

      {/* Client */}
      <rect x="20" y="70" width="100" height="55" rx="8"
        fill="rgba(244,114,182,0.1)" stroke="#f472b6" strokeWidth="1.5" />
      <text x="70" y="95" textAnchor="middle" fill="#f9a8d4" fontSize="20">📱</text>
      <text x="70" y="115" textAnchor="middle" fill="#f1f5f9" fontSize="9"
        fontFamily="'Syne', sans-serif" fontWeight="700">CLIENT</text>

      {/* Cache */}
      <rect x="200" y="40" width="130" height="55" rx="8"
        fill="rgba(52,211,153,0.1)" stroke="#34d399" strokeWidth="1.5" />
      <text x="265" y="63" textAnchor="middle" fill="#34d399" fontSize="20">⚡</text>
      <text x="265" y="82" textAnchor="middle" fill="#f1f5f9" fontSize="9"
        fontFamily="'Syne', sans-serif" fontWeight="700">CACHE (Redis)</text>
      <text x="265" y="93" textAnchor="middle" fill="#86efac" fontSize="8">~1ms response</text>

      {/* DB */}
      <rect x="200" y="115" width="130" height="55" rx="8"
        fill="rgba(167,139,250,0.1)" stroke="#a78bfa" strokeWidth="1.5" />
      <text x="265" y="138" textAnchor="middle" fill="#a78bfa" fontSize="20">🗄️</text>
      <text x="265" y="156" textAnchor="middle" fill="#f1f5f9" fontSize="9"
        fontFamily="'Syne', sans-serif" fontWeight="700">DATABASE</text>
      <text x="265" y="165" textAnchor="middle" fill="#94a3b8" fontSize="8">~50–200ms response</text>

      {/* HIT path */}
      <path d="M120,90 L200,67" stroke="#34d399" strokeWidth="1.5" fill="none" strokeDasharray="4 2" />
      <text x="155" y="73" textAnchor="middle" fill="#34d399" fontSize="8"
        fontFamily="'JetBrains Mono', monospace">HIT ✓</text>

      {/* MISS path to DB */}
      <path d="M120,97 L200,143" stroke="#f87171" strokeWidth="1.5" fill="none" strokeDasharray="4 2" />
      <text x="155" y="130" textAnchor="middle" fill="#f87171" fontSize="8"
        fontFamily="'JetBrains Mono', monospace">MISS ✗</text>

      {/* DB to cache (populate) */}
      <line x1="265" y1="115" x2="265" y2="95" stroke="#a78bfa"
        strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
      <text x="280" y="108" fill="#a78bfa" fontSize="8"
        fontFamily="'JetBrains Mono', monospace">populate</text>

      {/* Metrics */}
      {[
        { x: 430, icon: "🎯", label: "Cache Hit Rate", val: "80–95%", color: "#34d399" },
        { x: 560, icon: "💾", label: "Cache Eviction", val: "LRU / TTL", color: "#fbbf24" },
        { x: 690, icon: "📉", label: "DB Load Reduction", val: "~10× less", color: "#a78bfa" },
      ].map(m => (
        <g key={m.x}>
          <rect x={m.x} y="55" width="110" height="75" rx="8"
            fill={m.color + "0d"} stroke={m.color + "40"} strokeWidth="1" />
          <text x={m.x + 55} y="80" textAnchor="middle" fontSize="20">{m.icon}</text>
          <text x={m.x + 55} y="98" textAnchor="middle" fill={m.color} fontSize="14"
            fontFamily="'Syne', sans-serif" fontWeight="900">{m.val}</text>
          <text x={m.x + 55} y="113" textAnchor="middle" fill="#64748b" fontSize="8">{m.label}</text>
        </g>
      ))}
    </svg>
  </div>
);

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function TrafficScaleContent() {
  const [activeSection, setActiveSection] = useState("intro");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      const sections = NAV_TOPICS.map(t => document.getElementById(t.id)).filter(Boolean);
      let current = sections[0]?.id;
      for (const el of sections) {
        if (window.scrollY + 120 >= el.offsetTop) current = el.id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setNavOpen(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800;900&family=JetBrains+Mono:wght@400;600&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        :root {
          --bg:     #030712;
          --bg2:    #0c1220;
          --border: rgba(255,255,255,0.07);
          --txt:    #e2e8f0;
          --txt2:   #94a3b8;
          --accent: #a78bfa;
        }
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; overflow-x: hidden; }

        .revision-wrapper {
          background: var(--bg);
          font-family: 'Lora', Georgia, serif;
          height: calc(100vh - 60px);
          overflow: hidden;
          width: 100%;
          display: flex;
        }
        .revision-content-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          min-width: 0;
          height: 100%;
          scroll-behavior: smooth;
        }
        .revision-main {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 3.5rem 3rem 8rem;
          color: var(--txt);
          line-height: 1.8;
        }

        /* ── Sidebar ── */
        .nav-item { transition: all 0.2s; cursor: pointer; }
        .nav-item:hover {
          background: rgba(167,139,250,0.1) !important;
          color: #c4b5fd !important;
        }

        /* ── Cards ── */
        .section-card {
          background: rgba(255,255,255,0.015);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 2.5rem;
          margin-bottom: 2.5rem;
          transition: border-color 0.2s;
          word-break: break-word;
          overflow-wrap: anywhere;
          overflow: hidden;
        }
        .section-card:hover { border-color: rgba(167,139,250,0.2); }

        /* ── Grids ── */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin: 1rem 0; }
        .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin: 1rem 0; }

        /* ── Code ── */
        pre { white-space: pre-wrap; word-break: break-word; overflow-x: auto; }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.2); border-radius: 4px; }
        ul.fancy li { margin-bottom: 0.6rem; }
        ul.fancy li::marker { color: #a78bfa; }

        /* ── Page title gradient ── */
        .purple-gradient {
          background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Breakpoints ── */
        @media (max-width: 1100px) {
          .revision-main { padding: 3rem 2rem 6rem; }
        }
        @media (max-width: 900px) {
          .desktop-sidebar { display: none !important; }
          .revision-main { padding: 2.5rem 1.5rem 6rem; max-width: 100%; }
          .section-card { padding: 1.5rem; border-radius: 12px; }
          .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr !important; }
          h2 { font-size: 1.4rem !important; }
        }
        @media (max-width: 600px) {
          .revision-main { padding: 1.5rem 1rem 5rem; }
          .section-card { padding: 1rem; }
          pre, code { font-size: 0.75rem !important; }
          table { font-size: 0.8rem !important; }
          td, th { padding: 7px 10px !important; }
        }
      `}</style>

      <div className="revision-wrapper">

        {/* ── SIDEBAR ── */}
        <aside className="desktop-sidebar" style={{
          width: 280, flexShrink: 0, height: "100%",
          overflowY: "auto", borderRight: "1px solid var(--border)",
          background: "rgba(3,7,18,0.97)", backdropFilter: "blur(20px)",
          padding: "1.5rem 0", display: "flex", flexDirection: "column"
        }}>
          <div style={{ padding: "0 1.25rem 1.25rem", borderBottom: "1px solid var(--border)", marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.12em", color: "#475569", marginBottom: "2px", fontFamily: "'Syne', sans-serif" }}>SYSTEM DESIGN / HLD</div>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne', sans-serif" }}>Traffic & Scale</div>
            <div style={{ height: 2, background: "linear-gradient(90deg, #7c3aed, #a78bfa, transparent)", marginTop: "8px", borderRadius: 2 }} />
          </div>
          {NAV_TOPICS.map(t => (
            <div key={t.id} className="nav-item"
              onClick={() => scrollTo(t.id)}
              style={{
                padding: "8px 1.25rem", fontSize: "0.82rem", lineHeight: 1.4,
                color: activeSection === t.id ? "#c4b5fd" : "#64748b",
                background: activeSection === t.id ? "rgba(167,139,250,0.1)" : "transparent",
                borderLeft: activeSection === t.id ? "3px solid #a78bfa" : "3px solid transparent",
                fontWeight: activeSection === t.id ? 700 : 400,
                fontFamily: activeSection === t.id ? "'Syne', sans-serif" : "inherit"
              }}>
              {t.label}
            </div>
          ))}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="revision-content-area">
          <main className="revision-main">

            {/* PAGE HEADER */}
            <div style={{ marginBottom: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
                <Pill color="#a78bfa">HLD</Pill>
                <Pill color="#38bdf8">Estimation</Pill>
                <Pill color="#34d399">Interview Critical</Pill>
              </div>
              <h1 className="purple-gradient" style={{
                margin: 0, fontSize: "2.8rem", fontWeight: 900, letterSpacing: "-1px",
                fontFamily: "'Syne', sans-serif", lineHeight: 1.1
              }}>
                Traffic & Scale Estimation
              </h1>
              <p style={{ color: "#64748b", marginTop: "1rem", fontSize: "1.05rem", maxWidth: "680px" }}>
                Master back-of-the-envelope calculations, capacity planning, and scaling theory —
                the cornerstone skill of every senior system design interview.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
                {[
                  { k: "~45 min read", color: "#a78bfa" },
                  { k: "9 sections", color: "#38bdf8" },
                  { k: "10+ worked examples", color: "#34d399" },
                  { k: "Interview ready", color: "#fbbf24" },
                ].map(b => (
                  <div key={b.k} style={{
                    padding: "6px 14px", background: b.color + "0d",
                    border: `1px solid ${b.color}25`, borderRadius: "8px",
                    color: b.color, fontSize: "0.8rem", fontWeight: 700,
                    fontFamily: "'Syne', sans-serif"
                  }}>{b.k}</div>
                ))}
              </div>
            </div>

            {/* ════════════════════════════════════════════════
                SECTION 1 — INTRODUCTION
            ════════════════════════════════════════════════ */}
            <div className="section-card">
              <SH id="intro" icon="🎯" accent="#a78bfa" title="Introduction to Traffic Estimation"
                subtitle="Why numbers matter before architecture decisions" />

              <p style={{ color: "#94a3b8" }}>
                Traffic and scale estimation is the process of <strong style={{ color: "#e2e8f0" }}>quantifying how much load
                  a system must handle</strong> — before writing a single line of code. It transforms
                vague requirements like "millions of users" into concrete numbers: requests per second,
                gigabytes of storage per day, megabits of bandwidth per hour.
              </p>

              <InfoBox color="#a78bfa" icon="🧠" title="The Core Mental Model">
                Think of your system like a city's water supply. Before building pipes, you need to know:
                how many households, peak consumption (morning rush), average daily usage, and storage
                tank size. Traffic estimation is exactly that — <strong>infrastructure sizing for software</strong>.
              </InfoBox>

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif" }}>Why It Matters in System Design</h3>
              <p style={{ color: "#94a3b8" }}>
                Estimation drives every major architectural decision. The choice between SQL and NoSQL,
                monolith vs microservices, single region vs multi-region — all flow from how much traffic
                the system must serve. Underestimate and you get outages; overestimate and you waste
                millions on infrastructure.
              </p>

              <div className="grid-3">
                <StatCard icon="📊" label="YouTube Videos Uploaded" value="500hrs/min" sub="Every minute of every day" color="#f87171" />
                <StatCard icon="💬" label="WhatsApp Messages/Day" value="100B+" sub="Requires ~1.16M msg/sec" color="#34d399" />
                <StatCard icon="🛒" label="Amazon Peak RPS (Prime Day)" value="~66,000" sub="vs ~5,000 average" color="#fbbf24" />
              </div>

              <Callout type="real">
                <strong>Twitter's Fail Whale (2008–2009):</strong> Twitter underestimated growth and ran
                on a single Ruby on Rails monolith. During major events (Ashton Kutcher hitting 1M followers),
                the site crashed under load. The "Fail Whale" error page became iconic. This directly led
                to their rebuild into distributed systems — all because early estimations were ignored.
              </Callout>

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif" }}>The End-to-End Request Lifecycle</h3>
              <p style={{ color: "#94a3b8" }}>
                Every user action travels through multiple hops. Each hop has its own throughput ceiling
                and latency cost. Estimation helps you find <em>which hop becomes the bottleneck first</em>.
              </p>

              <TrafficFlowDiagram />
            </div>

            {/* ════════════════════════════════════════════════
                SECTION 2 — KEY METRICS
            ════════════════════════════════════════════════ */}
            <div className="section-card">
              <SH id="key-metrics" icon="📐" accent="#38bdf8" title="Key Metrics"
                subtitle="The vocabulary of scale — every engineer must speak this language fluently" />

              <p style={{ color: "#94a3b8" }}>
                Before doing any estimation, you must deeply understand what each metric measures,
                how they relate to each other, and when each one becomes the critical constraint.
              </p>

              {/* DAU / MAU */}
              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif" }}>📅 DAU / MAU — Daily / Monthly Active Users</h3>
              <InfoBox color="#38bdf8" icon="👥" title="Definition">
                <strong>DAU</strong> = number of unique users who perform at least one action in a 24-hour window.<br />
                <strong>MAU</strong> = same, but over 30 days.<br />
                <strong>Stickiness</strong> = DAU / MAU × 100%. A ratio above 50% is excellent (WhatsApp ≈ 80%).
              </InfoBox>
              <CodeBlock>{`// DAU → RPS conversion pipeline
DAU          = 50,000,000     (50M daily active users)
Avg sessions = 3/day          (user opens app 3 times)
Actions/session = 10          (reads, writes, taps)
Total actions/day = 50M × 3 × 10 = 1,500,000,000

Seconds in a day = 86,400
Average RPS = 1,500,000,000 / 86,400 ≈ 17,361 RPS

// Peak is typically 5-10× average
Peak RPS ≈ 17,361 × 5 = ~87,000 RPS`}</CodeBlock>

              {/* RPS */}
              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "2rem" }}>⚡ RPS — Requests Per Second</h3>
              <p style={{ color: "#94a3b8" }}>
                RPS measures <strong style={{ color: "#e2e8f0" }}>total HTTP requests</strong> hitting your servers per second,
                including all endpoints — API calls, asset fetches, health checks. It determines how many
                server instances and load balancers you need.
              </p>
              <Callout type="formula">
                <Code>RPS = (DAU × Actions_per_user_per_day) / 86,400</Code><br />
                <strong>Rule of thumb:</strong> 1 app server handles ~1,000–5,000 RPS depending on workload type.
                A CPU-bound computation service handles far less than a simple I/O proxy.
              </Callout>

              {/* QPS */}
              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "2rem" }}>🔍 QPS — Queries Per Second</h3>
              <p style={{ color: "#94a3b8" }}>
                QPS specifically refers to <strong style={{ color: "#e2e8f0" }}>database queries</strong>. One RPS often
                triggers multiple QPS (authentication query + data fetch + audit log write = 3 QPS per 1 RPS).
                The QPS on your database is typically the first bottleneck.
              </p>
              <InfoBox color="#f472b6" icon="⚡" title="Database QPS Limits (Rough Benchmarks)">
                <strong>PostgreSQL:</strong> ~10,000–50,000 QPS (reads with index)<br />
                <strong>MySQL:</strong> ~20,000–60,000 QPS (reads)<br />
                <strong>Redis:</strong> ~100,000–1,000,000 QPS (in-memory)<br />
                <strong>Cassandra:</strong> ~100,000+ QPS (distributed writes)<br />
                <em style={{ fontSize: "0.8rem" }}>These vary wildly by query complexity, hardware, and sharding.</em>
              </InfoBox>

              {/* Latency */}
              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "2rem" }}>⏱️ Latency</h3>
              <p style={{ color: "#94a3b8" }}>
                Latency is the time from a user sending a request to receiving the first byte of response.
                This is a user-experience metric. The industry target for web apps is under 200ms for p99
                (99th percentile).
              </p>

              <Table
                headers={["Operation", "Approximate Latency", "Notes"]}
                rows={[
                  ["L1 Cache Access", "~0.5 ns", "Fastest possible — in CPU"],
                  ["L2 Cache Access", "~7 ns", "Still CPU-side"],
                  ["RAM Access", "~100 ns", "Main memory"],
                  ["SSD Read (NVMe)", "~100 µs", "Local disk, very fast"],
                  ["HDD Read", "~1–10 ms", "Mechanical, slow"],
                  ["Redis (same DC)", "~0.5–1 ms", "In-memory network call"],
                  ["DB Query (indexed)", "~1–10 ms", "PostgreSQL, small dataset"],
                  ["Cross-DC Network", "~50–150 ms", "Intercontinental"],
                  ["DB Query (full-scan)", "~100ms–10s", "Without index!"],
                ]}
              />

              {/* Throughput */}
              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "2rem" }}>🚀 Throughput</h3>
              <p style={{ color: "#94a3b8" }}>
                Throughput is the volume of data processed per unit time — measured in <strong style={{ color: "#e2e8f0" }}>MB/s,
                  GB/s, or requests/s</strong>. While latency is about a single request, throughput is about the
                system's aggregate capacity. A system can have low latency (fast per request) but low throughput
                (can't handle many at once) — like a sports car that handles one passenger brilliantly but can't
                run a bus route.
              </p>

              <div className="grid-2">
                <InfoBox color="#a78bfa" icon="🐌" title="Latency vs Throughput">
                  These are often in tension. Batching requests increases throughput (you process 1,000
                  at once) but adds latency to individual items (they wait to be batched). Design for
                  your workload: real-time user interactions need low latency; batch ETL jobs need high
                  throughput.
                </InfoBox>
                <InfoBox color="#34d399" icon="📈" title="Little's Law">
                  <Code>L = λ × W</Code><br />
                  L = avg items in system, λ = arrival rate, W = avg time in system.<br />
                  If your DB processes 1,000 QPS and avg query takes 10ms:
                  L = 1,000 × 0.01 = 10 queries in flight at any moment.
                </InfoBox>
              </div>
            </div>

            {/* ════════════════════════════════════════════════
                SECTION 3 — TYPES OF TRAFFIC
            ════════════════════════════════════════════════ */}
            <div className="section-card">
              <SH id="traffic-types" icon="🚦" accent="#34d399" title="Types of Traffic"
                subtitle="Not all requests are equal — understanding traffic patterns shapes architecture" />

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif" }}>📖 Read vs Write Traffic</h3>
              <p style={{ color: "#94a3b8" }}>
                The ratio of reads to writes is one of the most important numbers in system design.
                It determines your caching strategy, database replication setup, and API design.
              </p>

              <Table
                headers={["System", "Read:Write Ratio", "Dominant Strategy"]}
                rows={[
                  ["Twitter / X Timeline", "~100:1", "Heavy read caching, fan-out on write"],
                  ["WhatsApp Messaging", "~1:1", "Message queue, delivered once"],
                  ["GitHub (code hosting)", "~80:20", "CDN for blobs, write-ahead log"],
                  ["Stock Trading Platform", "~10:1 (varies)", "CQRS, event sourcing"],
                  ["Video Streaming (YouTube)", "~1000:1", "CDN, transcoding pipeline"],
                  ["Collaborative Doc (Notion)", "~5:1", "CRDT, operational transforms"],
                ]}
              />

              <Callout type="tip">
                In interviews, always clarify the read/write ratio early. A <strong>read-heavy</strong> system
                prioritizes caching, CDN, and read replicas. A <strong>write-heavy</strong> system prioritizes
                message queues, write buffering, and database sharding. They require fundamentally different architectures.
              </Callout>

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "2rem" }}>📈 Peak vs Average Traffic</h3>
              <p style={{ color: "#94a3b8" }}>
                Average traffic is what you pay for every day. Peak traffic is what you must survive.
                Designing for average means outages at peak. Designing for absolute peak wastes 90% of your
                infrastructure. The answer is <strong style={{ color: "#e2e8f0" }}>autoscaling with a headroom buffer</strong>.
              </p>

              <TrafficGraph />

              <div className="grid-3" style={{ marginTop: "1rem" }}>
                <StatCard icon="📊" label="Average Traffic" value="1×" sub="Baseline — steady state" color="#38bdf8" />
                <StatCard icon="🌅" label="Daily Peak" value="4–6×" sub="Morning rush / evenings" color="#fbbf24" />
                <StatCard icon="🚀" label="Event Spike" value="10–50×" sub="Product launch, TV mention" color="#f87171" />
              </div>

              <Callout type="warn">
                <strong>The Thundering Herd Problem:</strong> When a cache expires, thousands of requests
                simultaneously hit the database to regenerate it — causing a spike that can crash the DB.
                Solutions: cache stampede prevention (probabilistic refresh), mutex locks on cache miss,
                or background refresh before TTL expires.
              </Callout>

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "2rem" }}>👥 Concurrent Users</h3>
              <p style={{ color: "#94a3b8" }}>
                Concurrent users ≠ active users. At any millisecond, only a fraction of your DAU is
                actively making requests. The conversion factor is the <strong style={{ color: "#e2e8f0" }}>concurrency
                  factor</strong>, typically 5–15% of DAU for consumer apps.
              </p>

              <CodeBlock>{`// Concurrent users estimation
DAU = 10,000,000  (10M daily active users)
Peak hours window = 4 hours out of 24
Users active during peak = 10M × (4/24) = 1,666,666
Concurrent at any instant = 1,666,666 × 10% = ~167,000

// Each user holds 1 connection → need connection pool for 167,000 conns
// PostgreSQL max_connections default = 100
// → You MUST use a connection pooler (PgBouncer, RDS Proxy)`}</CodeBlock>
            </div>

            {/* ════════════════════════════════════════════════
                SECTION 4 — BACK-OF-ENVELOPE
            ════════════════════════════════════════════════ */}
            <div className="section-card">
              <SH id="bote" icon="🧮" accent="#fbbf24" title="Back-of-the-Envelope Calculations"
                subtitle="The art of getting approximately right rather than precisely wrong" />

              <p style={{ color: "#94a3b8" }}>
                Back-of-the-envelope (BOTE) estimation is structured rough-calculation. The goal is not
                an exact number — it's an order of magnitude. Is this system handling 1K, 10K, or 1M RPS?
                That difference changes your entire architecture.
              </p>

              <InfoBox color="#fbbf24" icon="📏" title="Powers of 10 Cheat Sheet">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.85rem" }}>
                  <div><Code>1 thousand = 10³ = 1K</Code></div>
                  <div><Code>1 million = 10⁶ = 1M</Code></div>
                  <div><Code>1 billion = 10⁹ = 1B</Code></div>
                  <div><Code>1 trillion = 10¹² = 1T</Code></div>
                  <div><Code>1 KB = 10³ bytes</Code></div>
                  <div><Code>1 MB = 10⁶ bytes</Code></div>
                  <div><Code>1 GB = 10⁹ bytes</Code></div>
                  <div><Code>1 TB = 10¹² bytes</Code></div>
                </div>
              </InfoBox>

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif" }}>The BOTE Framework</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", margin: "1rem 0" }}>
                {[
                  { step: "1", title: "Clarify Scale", desc: "Get DAU, user behaviour, read/write ratio from interviewer", color: "#a78bfa" },
                  { step: "2", title: "Identify Key Metrics", desc: "What do you need to calculate? RPS? Storage? Bandwidth?", color: "#38bdf8" },
                  { step: "3", title: "Make Assumptions", desc: "State them explicitly. Avg tweet size = 280 chars ≈ 300 bytes", color: "#34d399" },
                  { step: "4", title: "Calculate", desc: "Use round numbers. 86,400 ≈ 100,000 seconds/day", color: "#fbbf24" },
                  { step: "5", title: "Sanity Check", desc: "Compare to known systems. Does your Twitter RPS match public benchmarks?", color: "#f472b6" },
                ].map(s => (
                  <div key={s.step} style={{
                    display: "flex", alignItems: "flex-start", gap: "14px",
                    background: s.color + "06", border: `1px solid ${s.color}20`,
                    borderRadius: "10px", padding: "1rem"
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: "0.85rem",
                      fontWeight: 900, background: s.color + "20", color: s.color,
                      flexShrink: 0, fontFamily: "'Syne', sans-serif"
                    }}>{s.step}</div>
                    <div>
                      <div style={{ color: "#f1f5f9", fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: "3px" }}>{s.title}</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.88rem" }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* WORKED EXAMPLE 1 */}
              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "2rem" }}>
                🔢 Worked Example 1: Twitter-like Service (100M DAU)
              </h3>

              <CodeBlock>{`════════ ASSUMPTIONS ════════
DAU                         = 100,000,000 (100M)
Active ratio (peak 4hrs)    = ~33% peak window
Reads per user/day          = 200 (timeline, profile, search)
Writes per user/day         = 5   (tweet, like, retweet, follow)
Avg tweet size              = 300 bytes (text) + 2KB (media metadata)
Media (image/video) ratio   = 20% of tweets have media
Avg media size              = 1 MB

════════ TRAFFIC (RPS) ════════
Read RPS  = (100M × 200) / 86,400 ≈ 231,500 RPS average
Write RPS = (100M × 5)   / 86,400 ≈   5,787 RPS average
Peak Read RPS ≈ 231,500 × 5        ≈ 1,157,000 RPS  (→ CDN critical!)
Peak Write RPS ≈ 5,787 × 5         ≈    28,935 RPS

════════ STORAGE ════════
Text tweets/day  = 100M × 5 = 500M tweets
Text storage/day = 500M × 300B = 150 GB/day
Media tweets/day = 500M × 20% = 100M media tweets
Media storage/day= 100M × 1MB = 100 TB/day  (→ S3 / object store!)

Total storage/year = (150 GB + 100 TB) × 365 ≈ 36.5 PB/year

════════ BANDWIDTH ════════
Inbound  = 100 TB/day / 86,400 ≈ 1.16 GB/s
Outbound = Reads are 200× writes → ~232 GB/s outbound
→ CDN MUST absorb 95%+ of outbound traffic`}</CodeBlock>

              <Callout type="note">
                Notice how 100M DAU creates a <strong>100 TB/day media storage</strong> problem.
                This immediately tells you: no traditional file system, must use distributed object storage
                (S3, GCS), CDN is mandatory, and media upload/processing is a separate pipeline entirely.
              </Callout>

              {/* WORKED EXAMPLE 2 */}
              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "2rem" }}>
                🔢 Worked Example 2: URL Shortener (Bitly-like)
              </h3>

              <CodeBlock>{`════════ ASSUMPTIONS ════════
Read:Write ratio = 100:1 (reads dominate)
Write (create URL)/day = 100 million
Read  (redirect)/day   = 10 billion (100× writes)
URL record size        = 500 bytes (short URL + long URL + metadata)
URL expiry             = 5 years default

════════ RPS ════════
Write RPS = 100M / 86,400      ≈  1,157 RPS
Read  RPS = 10B / 86,400       ≈ 115,740 RPS
Peak Read RPS ≈ 115,740 × 3    ≈ 347,000 RPS  → heavy caching needed

════════ STORAGE ════════
Entries/day  = 100M
Entries/5yrs = 100M × 365 × 5 = 182.5 billion records
Storage      = 182.5B × 500B  = ~91.25 TB total

91 TB fits in a single large server but:
  - Single point of failure → shard by hash of short code
  - Use consistent hashing to distribute across ~10 shards (9 TB each)

════════ CACHE ════════
Pareto principle: 20% of URLs = 80% of traffic
Cache top 20%: 182.5B × 20% × 500B = ~18 TB cache
→ Redis cluster with 18 TB, 100% reads from cache = ~347K RPS easily`}</CodeBlock>

              <Callout type="tip">
                The URL shortener is a classic interview example because it demonstrates the <strong>read-heavy
                  pattern</strong> elegantly. Redis can serve 100K+ RPS per node. With 3 Redis nodes in a cluster,
                you handle peak traffic trivially. The DB only needs to handle writes (1,157 RPS — trivial for Postgres).
              </Callout>
            </div>

            {/* ════════════════════════════════════════════════
                SECTION 5 — STORAGE ESTIMATION
            ════════════════════════════════════════════════ */}
            <div className="section-card">
              <SH id="storage" icon="💾" accent="#f472b6" title="Storage Estimation"
                subtitle="From bytes to petabytes — sizing your data layer before choosing your database" />

              <p style={{ color: "#94a3b8" }}>
                Storage estimation answers: <em>What type of database do I need? How many nodes?
                  How do I shard?</em> Getting this wrong early leads to expensive re-architectures at scale.
              </p>

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif" }}>Common Data Sizes (Memorise These)</h3>

              <Table
                headers={["Data Type", "Typical Size", "Notes"]}
                rows={[
                  ["User record (name, email, etc.)", "~1 KB", "After JSON encoding + metadata"],
                  ["Tweet / short text post", "~300 B – 1 KB", "Including timestamps, IDs"],
                  ["Profile photo (thumbnail)", "~50–200 KB", "After compression (WebP)"],
                  ["Profile photo (full)", "~500 KB – 2 MB", "Original upload"],
                  ["Short video (60s, 720p)", "~50–100 MB", "H.264/H.265 compressed"],
                  ["UUID / snowflake ID", "16 bytes", "128-bit UUID or 64-bit snowflake"],
                  ["Timestamp (UNIX)", "8 bytes", "int64, millisecond precision"],
                  ["URL (average)", "~50–100 bytes", "ASCII chars"],
                ]}
              />

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "2rem" }}>
                📐 Storage Estimation Framework
              </h3>

              <CodeBlock>{`Storage = Users × Data_per_user × Time_period × Replication_factor

═══ Example: Instagram-like photo service ═══

Users                  = 500M registered
Active uploaders (10%) = 50M users upload/day
Photos/user/day        = 2
Photo size (compressed)= 200 KB average

Daily new storage = 50M × 2 × 200 KB = 20 TB/day
Monthly           = 20 TB × 30       = 600 TB/month
Yearly            = 20 TB × 365      = 7.3 PB/year

With 3× replication (durability):
Actual storage needed  = 7.3 PB × 3 = 21.9 PB/year

→ Use S3 / GCS (object storage)
→ Multi-tier: hot (SSD), warm (HDD), cold (Glacier/Archive)
→ Estimate $0.023/GB for S3 Standard = ~$503M/year (→ CDN to reduce egress!)`}</CodeBlock>

              <div className="grid-3" style={{ marginTop: "1.5rem" }}>
                {[
                  { icon: "🔥", label: "Hot Storage", desc: "Frequently accessed. SSD, Redis, in-memory. High cost, low latency.", color: "#f87171" },
                  { icon: "🌡️", label: "Warm Storage", desc: "Accessed occasionally. HDD RAID, cloud standard tier. Medium cost.", color: "#fbbf24" },
                  { icon: "🧊", label: "Cold Storage", desc: "Rarely accessed. S3 Glacier, tape. Very low cost, high retrieval latency.", color: "#38bdf8" },
                ].map(t => (
                  <div key={t.label} style={{
                    background: t.color + "08", border: `1px solid ${t.color}25`,
                    borderRadius: "12px", padding: "1.25rem"
                  }}>
                    <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>{t.icon}</div>
                    <div style={{ color: t.color, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: "6px" }}>{t.label}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.6 }}>{t.desc}</div>
                  </div>
                ))}
              </div>

              <Callout type="warn">
                <strong>Don't forget metadata storage!</strong> For a photo service, the photo binary
                goes to object storage, but you still need a database row per photo: user_id, timestamp,
                caption, tags, dimensions, CDN URL, view count. At 500 bytes/row × 10B photos = 5 TB
                of metadata — this goes in your relational DB and must be indexed and sharded.
              </Callout>
            </div>

            {/* ════════════════════════════════════════════════
                SECTION 6 — BANDWIDTH ESTIMATION
            ════════════════════════════════════════════════ */}
            <div className="section-card">
              <SH id="bandwidth" icon="📡" accent="#38bdf8" title="Bandwidth Estimation"
                subtitle="Calculating network throughput — the often forgotten constraint" />

              <p style={{ color: "#94a3b8" }}>
                Bandwidth determines your network infrastructure cost, whether you need a CDN, and
                whether your architecture is viable at scale. A 1 Gbps NIC maxes out at 125 MB/s —
                if your service needs 10 GB/s outbound, no single server can serve it directly.
              </p>

              <div className="grid-2">
                <InfoBox color="#38bdf8" icon="📥" title="Inbound Bandwidth (Ingress)">
                  Data flowing <em>into</em> your system from users. Typically cheaper (often free on cloud).
                  Critical for write-heavy workloads: video uploads, bulk data ingestion, IoT sensor streams.
                </InfoBox>
                <InfoBox color="#a78bfa" icon="📤" title="Outbound Bandwidth (Egress)">
                  Data flowing <em>out</em> to users. This is expensive on cloud (AWS charges ~$0.09/GB egress).
                  Critical for media serving, API responses. CDN reduces this dramatically.
                </InfoBox>
              </div>

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "1.5rem" }}>
                📐 Bandwidth Calculation Template
              </h3>

              <CodeBlock>{`Bandwidth (MB/s) = (Requests/second × Average_response_size_bytes) / 1,000,000

═══ Example: Netflix-like Video Streaming ═══

MAU              = 200M
Concurrent users (peak) = 200M × 1% = 2M concurrent streams
Avg bitrate      = 5 Mbps (1080p H.265)

Outbound bandwidth = 2,000,000 streams × 5 Mbps = 10 Tbps

→ Impossible from a single datacenter or without CDN
→ Netflix uses 100,000+ CDN edge servers globally (Open Connect)
→ Pre-position popular content at ISP level

═══ Example: REST API Service ═══

RPS              = 50,000
Avg response     = 2 KB (JSON payload)
Outbound         = 50,000 × 2,000 bytes = 100 MB/s = 800 Mbps

→ A single 10 Gbps NIC can handle this
→ But add overhead (TCP, TLS, HTTP headers) → actual ~1.2 Gbps
→ 2 servers with 10 Gbps NICs provide headroom + HA`}</CodeBlock>

              <Table
                headers={["Network Card Speed", "Max Throughput", "Practical Throughput (70%)", "~Max RPS (2KB resp)"]}
                rows={[
                  ["1 Gbps NIC", "125 MB/s", "87.5 MB/s", "~43,750 RPS"],
                  ["10 Gbps NIC", "1.25 GB/s", "875 MB/s", "~437,500 RPS"],
                  ["25 Gbps NIC", "3.1 GB/s", "2.19 GB/s", "~1.1M RPS"],
                  ["100 Gbps NIC", "12.5 GB/s", "8.75 GB/s", "~4.4M RPS"],
                ]}
              />

              <Callout type="real">
                <strong>Cloudflare serves 46 million HTTP requests per second</strong> at peak across
                their global network (2024). They do this with ~300 data centres, Anycast routing,
                and massive edge caching. Without the CDN layer, that traffic would need to hit origin
                servers — requiring roughly 92,000 dedicated 10 Gbps servers. This is why CDN is not
                optional at scale.
              </Callout>
            </div>

            {/* ════════════════════════════════════════════════
                SECTION 7 — SCALING CONCEPTS
            ════════════════════════════════════════════════ */}
            <div className="section-card">
              <SH id="scaling" icon="📈" accent="#34d399" title="Scaling Concepts"
                subtitle="How systems grow from 1 user to 1 billion — the architectural decisions that matter" />

              <p style={{ color: "#94a3b8" }}>
                Scaling is the ability to handle growing load while maintaining performance and availability.
                There are two fundamental axes — <strong style={{ color: "#e2e8f0" }}>scale up</strong> (bigger
                hardware) and <strong style={{ color: "#e2e8f0" }}>scale out</strong> (more hardware). Understanding
                when to use each is a core system design skill.
              </p>

              <ScalingDiagram />

              <div className="grid-2" style={{ marginTop: "1.5rem" }}>
                <div style={{
                  background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)",
                  borderRadius: "12px", padding: "1.25rem"
                }}>
                  <strong style={{ color: "#c4b5fd", display: "block", marginBottom: "8px", fontFamily: "'Syne', sans-serif" }}>
                    ⬆️ Vertical Scaling (Scale Up)
                  </strong>
                  <ul className="fancy" style={{ color: "#94a3b8", paddingLeft: "18px", margin: 0, fontSize: "0.9rem" }}>
                    <li>Add more CPU, RAM, faster SSD to existing machine</li>
                    <li>Simple — no code changes required</li>
                    <li>Has a hard ceiling (largest EC2 is ~224 vCPU / 24 TB RAM)</li>
                    <li>Single point of failure — no redundancy</li>
                    <li>Downtime required for hardware upgrade</li>
                    <li><strong>Best for:</strong> databases (initially), stateful services</li>
                  </ul>
                </div>
                <div style={{
                  background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)",
                  borderRadius: "12px", padding: "1.25rem"
                }}>
                  <strong style={{ color: "#86efac", display: "block", marginBottom: "8px", fontFamily: "'Syne', sans-serif" }}>
                    ↔️ Horizontal Scaling (Scale Out)
                  </strong>
                  <ul className="fancy" style={{ color: "#94a3b8", paddingLeft: "18px", margin: 0, fontSize: "0.9rem" }}>
                    <li>Add more machines; load balancer distributes traffic</li>
                    <li>Theoretically unlimited scale (add more nodes)</li>
                    <li>Requires stateless application design</li>
                    <li>Higher operational complexity (service discovery, etc.)</li>
                    <li>No single point of failure — inherent redundancy</li>
                    <li><strong>Best for:</strong> stateless app servers, microservices</li>
                  </ul>
                </div>
              </div>

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "2rem" }}>
                ⚖️ Load Balancing
              </h3>
              <p style={{ color: "#94a3b8" }}>
                A load balancer is the gateway that distributes incoming requests across multiple backend
                servers. It's what makes horizontal scaling work — without it, you'd need users to pick
                a server manually.
              </p>

              <Table
                headers={["Algorithm", "How it Works", "Best For", "Pitfall"]}
                rows={[
                  ["Round Robin", "Rotate through servers sequentially", "Uniform requests", "Ignores server load"],
                  ["Weighted Round Robin", "Servers with higher weight get more requests", "Mixed instance sizes", "Weight must be tuned"],
                  ["Least Connections", "Route to server with fewest active connections", "Long-lived connections (WebSocket)", "Can miss latency diff"],
                  ["IP Hash", "Hash client IP → always same server", "Session sticky apps", "Uneven distribution"],
                  ["Least Response Time", "Track response time + connections", "Heterogeneous loads", "Higher LB overhead"],
                  ["Resource Based", "Agents report CPU/RAM; route to least loaded", "CPU-intensive workloads", "Complex to implement"],
                ]}
              />

              <Callout type="note">
                <strong>Layer 4 vs Layer 7 Load Balancers:</strong> L4 (TCP/UDP) makes decisions based on
                IP+port — very fast but no content awareness. L7 (HTTP) reads request headers, cookies,
                URL paths — enables smarter routing (route /api/* to API servers, /static/* to file servers)
                but with slightly higher latency. AWS ALB is L7; NLB is L4.
              </Callout>

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "2rem" }}>
                🗄️ Database Scaling Patterns
              </h3>

              <CodeBlock>{`═══════════════════════════════════════════
1. READ REPLICAS (scale reads)
   Primary (write) → replica1 (read)
                   → replica2 (read)
                   → replica3 (read)
   ✓ Great when read:write >> 10:1
   ✗ Replication lag (eventual consistency)

═══════════════════════════════════════════
2. SHARDING (scale writes + storage)
   Shard by user_id % N:
   user_id 0–999  → Shard 0  (DB server A)
   user_id 1000–1999 → Shard 1  (DB server B)
   user_id 2000–2999 → Shard 2  (DB server C)
   ✓ Scales writes and storage horizontally
   ✗ Cross-shard queries are painful (JOINs impossible)
   ✗ Re-sharding = massive data migration

═══════════════════════════════════════════
3. CQRS (Command Query Responsibility Segregation)
   Writes → Command Model (normalised, ACID, Postgres)
   Reads  → Query Model  (denormalised, fast, Elasticsearch/Redis)
   ✓ Optimise each side independently
   ✗ Eventual consistency between models`}</CodeBlock>
            </div>

            {/* ════════════════════════════════════════════════
                SECTION 8 — OPTIMIZATION TECHNIQUES
            ════════════════════════════════════════════════ */}
            <div className="section-card">
              <SH id="optimization" icon="⚡" accent="#fbbf24" title="Optimization Techniques"
                subtitle="The toolkit for doing more with less — performance engineering at scale" />

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif" }}>🗃️ Caching Strategy</h3>
              <p style={{ color: "#94a3b8" }}>
                Caching is the single most impactful optimization in distributed systems. A cache stores
                the results of expensive operations (DB queries, API calls, computations) so subsequent
                requests can be served from fast memory instead.
              </p>

              <CacheDiagram />

              <Table
                headers={["Cache Pattern", "How it Works", "Consistency", "Best Use Case"]}
                rows={[
                  ["Cache-Aside (Lazy)", "App checks cache; on miss, loads DB and writes cache", "Eventual", "Read-heavy, cache can be stale"],
                  ["Write-Through", "Every write goes to cache AND DB simultaneously", "Strong", "Read-heavy, freshness required"],
                  ["Write-Behind (Write-Back)", "Write to cache immediately; async flush to DB", "Eventual", "Write-heavy, DB throughput bottleneck"],
                  ["Read-Through", "Cache sits in front of DB; handles its own miss logic", "Eventual", "Simplifies app code"],
                  ["Refresh-Ahead", "Proactively refresh cache before expiry", "Strong-ish", "Predictable access patterns"],
                ]}
              />

              <Callout type="tip">
                <strong>Cache eviction policies you must know:</strong><br />
                <strong>LRU (Least Recently Used)</strong> — evict the item not accessed longest. Good for temporal locality.<br />
                <strong>LFU (Least Frequently Used)</strong> — evict the item accessed fewest times. Good for popularity-based access.<br />
                <strong>TTL (Time To Live)</strong> — evict after a fixed time. Simple, prevents stale data. Usually combined with LRU.
              </Callout>

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "2rem" }}>🌐 CDN (Content Delivery Network)</h3>
              <p style={{ color: "#94a3b8" }}>
                A CDN is a globally distributed network of cache servers (edge nodes) that serve static
                and semi-static content from a location geographically close to the user. It solves the
                speed-of-light problem — a request from Mumbai to a US server takes ~200ms; from a Mumbai
                CDN node it takes ~5ms.
              </p>

              <div className="grid-2">
                <InfoBox color="#38bdf8" icon="📦" title="What to CDN">
                  Images, videos, CSS/JS bundles, fonts, HTML templates, API responses with long TTL,
                  software download files, ML model weights. Anything static or semi-static.
                </InfoBox>
                <InfoBox color="#f87171" icon="🚫" title="What NOT to CDN">
                  Authenticated user data, real-time APIs (stock prices, chat), personalised content,
                  server-side rendered pages with user-specific data, payment processing.
                </InfoBox>
              </div>

              <CodeBlock>{`CDN Impact Calculation:

Service: Video streaming platform
Total bandwidth without CDN: 10 Gbps
CDN cache hit rate: 95% (most videos are popular)
Bandwidth that hits origin: 10 Gbps × 5% = 500 Mbps

AWS Data Transfer cost (egress from origin): $0.09/GB
Without CDN: 10 Gbps = 108 TB/day → $9,720/day → $3.5M/year
With CDN:    500 Mbps = 5.4 TB/day → $486/day  → $177K/year
CDN cost:    ~$0.01/GB × 102.6 TB/day          → $1.09M/year

Net saving: $3.5M - $177K - $1.09M = $2.23M/year
+ users in Singapore, Mumbai, Berlin get ~5ms vs ~200ms latency`}</CodeBlock>

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "2rem" }}>🗄️ Database Optimization</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  {
                    title: "Indexing", color: "#a78bfa",
                    desc: "An index trades write overhead for read speed. A B-Tree index on user_id turns a full-table scan (O(n)) into a tree lookup (O(log n)). Rule: index every column used in WHERE, JOIN ON, or ORDER BY clauses. Over-indexing hurts write performance and wastes storage."
                  },
                  {
                    title: "Query Optimization", color: "#34d399",
                    desc: "Use EXPLAIN ANALYZE to identify slow queries. Avoid SELECT *, use pagination (LIMIT/OFFSET or cursor-based), batch N+1 queries, and avoid functions on indexed columns in WHERE clauses (WHERE YEAR(created_at) = 2024 kills the index; WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31' uses it)."
                  },
                  {
                    title: "Connection Pooling", color: "#fbbf24",
                    desc: "Database connections are expensive (~5 MB RAM each on Postgres). Never open a new connection per request. Use PgBouncer, RDS Proxy, or framework-level pools. Pool size = (num_cores × 2) + spindle_count is a common starting point."
                  },
                  {
                    title: "Denormalization", color: "#f472b6",
                    desc: "Deliberately introduce redundancy to avoid expensive JOINs. Store follower_count on the User table instead of COUNTing the Follows table. Accept the write complexity (update both tables) to gain read performance."
                  },
                ].map(o => (
                  <div key={o.title} style={{
                    background: o.color + "06", borderLeft: `3px solid ${o.color}`,
                    borderRadius: "0 10px 10px 0", padding: "1rem 1.25rem"
                  }}>
                    <div style={{ color: o.color, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: "6px" }}>
                      {o.title}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.7 }}>{o.desc}</div>
                  </div>
                ))}
              </div>

              <Callout type="err">
                <strong>The N+1 Query Problem:</strong> Fetching a list of 100 posts, then making a separate
                DB query per post to get its author = 1 + 100 = 101 queries. At 1,000 RPS, that's 101,000
                QPS on your DB. Fix with SQL JOINs, dataloader batching, or eager loading. This single
                mistake can crash production databases at moderate scale.
              </Callout>
            </div>

            {/* ════════════════════════════════════════════════
                SECTION 9 — INTERVIEW PERSPECTIVE
            ════════════════════════════════════════════════ */}
            <div className="section-card">
              <SH id="interview" icon="🎤" accent="#f472b6" title="Interview Perspective"
                subtitle="How estimation is tested at FAANG — strategy, structure, and common traps" />

              <p style={{ color: "#94a3b8" }}>
                Estimation questions in system design interviews are not math tests. Interviewers are
                evaluating your <strong style={{ color: "#e2e8f0" }}>structured thinking, communication,
                  and ability to derive reasonable numbers from first principles</strong>. Being wrong by
                2× is fine. Being unable to start is not.
              </p>

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif" }}>🎯 How It's Actually Asked</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
                {[
                  "\"Design YouTube. How much storage do you need? How many servers?\"",
                  "\"How would you handle 10 million concurrent WebSocket connections?\"",
                  "\"Estimate the write throughput for a Twitter-like system and design accordingly.\"",
                  "\"Our system has 500M DAU. Walk me through how you'd size the database layer.\"",
                  "\"How many servers does Google need to serve Search? Estimate from first principles.\"",
                ].map((q, i) => (
                  <div key={i} style={{
                    background: "rgba(244,114,182,0.05)", border: "1px solid rgba(244,114,182,0.2)",
                    borderRadius: "10px", padding: "0.9rem 1.2rem",
                    color: "#f9a8d4", fontFamily: "'Lora', Georgia, serif",
                    fontSize: "0.92rem", fontStyle: "italic", lineHeight: 1.6
                  }}>
                    {q}
                  </div>
                ))}
              </div>

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif" }}>🗺️ The Winning Approach (5-Step Framework)</h3>

              <CodeBlock>{`Step 1: CLARIFY (2 min)
  ├── "How many users? DAU or MAU?"
  ├── "What's the primary use case — read-heavy or write-heavy?"
  ├── "Any geographic distribution requirements?"
  └── "What SLA? 99.9% or 99.99% uptime?"

Step 2: DEFINE ASSUMPTIONS OUT LOUD (1 min)
  ├── "I'll assume 100M DAU for this calculation."
  ├── "Assuming 10% of users post daily, others only read."
  └── "Rounding 86,400 to 100,000 seconds/day for simplicity."

Step 3: CALCULATE KEY METRICS (5 min)
  ├── Traffic: RPS (read + write separately)
  ├── Storage: per day, per year
  └── Bandwidth: inbound + outbound

Step 4: DERIVE ARCHITECTURE DECISIONS (main interview)
  ├── "Since peak read is 500K RPS, we need CDN + Redis cluster"
  ├── "100 TB/day storage → object store (S3), not block storage"
  └── "Write QPS is 50K → single Postgres primary won't handle it → shard"

Step 5: VALIDATE & ITERATE
  ├── "Does this match known scale of similar systems?"
  └── "Where are the bottlenecks? What breaks first?"`}</CodeBlock>

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "2rem" }}>
                🚫 Common Mistakes (And How to Avoid Them)
              </h3>

              <Table
                headers={["Mistake", "Example", "Fix"]}
                rows={[
                  ["Not stating assumptions", "Jumping straight to calculations", "\"I'll assume X, Y, Z...\" before any math"],
                  ["Confusing DAU with concurrent users", "Building for 100M connections when DAU is 100M", "Concurrent ≈ 1–10% of DAU at any instant"],
                  ["Forgetting peak multiplier", "Designing for average traffic only", "Always ask: peak = 5–10× average"],
                  ["Ignoring replication factor", "Calculating raw storage without ×3", "Always multiply storage by replication (typically 3×)"],
                  ["Not linking numbers to architecture", "Stopping at \"5,000 RPS\"", "\"5,000 RPS means 2–3 app servers with Redis cache\""],
                  ["Over-precision", "\"17,361.11 RPS\"", "Round to \"~17K RPS\" — conveys same info faster"],
                  ["Forgetting metadata", "Only counting media storage", "Add DB rows, indices, audit logs to storage estimate"],
                  ["Ignoring write amplification", "1 write = 1 DB write", "1 write often = primary + 2 replicas + cache invalidation + audit log"],
                ]}
              />

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "2rem" }}>
                🏆 Numbers Every Engineer Should Memorise
              </h3>

              <div className="grid-2">
                <CodeBlock>{`═══ TIME ═══
1 day        = 86,400 sec  (~100K)
1 month      = 2.6M sec    (~3M)
1 year       = 31.5M sec   (~32M)

═══ USERS ═══
World internet users ≈ 5.5B
Smartphone users     ≈ 6.8B
WhatsApp DAU         ≈ 2B
Instagram DAU        ≈ 500M
Twitter/X DAU        ≈ 200M`}</CodeBlock>
                <CodeBlock>{`═══ SERVER CAPACITY ═══
App server RPS   = 1K–10K
Redis RPS        = 100K–1M
Nginx RPS        = 50K–200K
DB QPS (Pg)      = 10K–50K

═══ NETWORK ═══
Datacenter RTT   = 0.5–5 ms
CDN edge RTT     = 5–20 ms
Cross-continent  = 100–200 ms
LAN throughput   = 10+ Gbps`}</CodeBlock>
              </div>

              <Callout type="tip">
                <strong>The Interviewers' Real Question:</strong> Behind every estimation question is:
                "Can this person take ambiguous requirements, structure them into concrete constraints,
                and use those constraints to justify their architecture?" The exact number doesn't matter.
                The reasoning process does. Always narrate your thinking. Say "I'm calculating this to
                determine if we need a cache" — that's what earns the offer.
              </Callout>

              <h3 style={{ color: "#e2e8f0", fontFamily: "'Syne', sans-serif", marginTop: "2rem" }}>
                📋 Sample Interview Question Walkthrough
              </h3>

              <div style={{
                background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.2)",
                borderRadius: "14px", padding: "1.5rem"
              }}>
                <div style={{ color: "#c4b5fd", fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: "1rem", fontSize: "1.05rem" }}>
                  🎤 Q: "Design a URL shortener. How many servers do you need?"
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.8 }}>
                  <strong style={{ color: "#e2e8f0" }}>1. Clarify:</strong> "I'll assume 100M new URLs/day, 100:1 read:write, 5-year retention."<br />
                  <strong style={{ color: "#e2e8f0" }}>2. Write RPS:</strong> "100M / 86,400 ≈ 1,200 RPS writes. A single Postgres instance handles 50K QPS — so writes are trivial."<br />
                  <strong style={{ color: "#e2e8f0" }}>3. Read RPS:</strong> "100:1 ratio → 120,000 RPS reads. Postgres alone can't handle this. We need Redis."<br />
                  <strong style={{ color: "#e2e8f0" }}>4. Storage:</strong> "100M × 365 × 5 = 182.5B records × 500B = 91 TB. Postgres can handle this with sharding across ~10 nodes."<br />
                  <strong style={{ color: "#e2e8f0" }}>5. Cache:</strong> "Pareto: cache top 20% of URLs = ~18 TB of Redis. Cache hit rate 80% → DB sees only 24K QPS — easily handled."<br />
                  <strong style={{ color: "#e2e8f0" }}>6. Answer:</strong> "3 Redis nodes (for HA), 2–3 Postgres nodes (primary + replica), 2 app servers behind a load balancer."
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div style={{ marginTop: "3rem", padding: "2rem", background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", color: "#a78bfa", fontFamily: "'Syne', sans-serif", marginBottom: "0.5rem" }}>FURTHER READING</div>
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0 0 1.25rem" }}>Canonical resources for mastering scale and estimation.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
                {[
                  { label: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer" },
                  { label: "DDIA — Kleppmann", url: "https://dataintensive.net/" },
                  { label: "ByteByteGo Blog", url: "https://blog.bytebytego.com/" },
                  { label: "AWS Architecture Center", url: "https://aws.amazon.com/architecture/" },
                  { label: "High Scalability Blog", url: "http://highscalability.com/" },
                ].map(l => (
                  <a key={l.label} href={l.url} target="_blank" rel="noreferrer" style={{
                    padding: "8px 16px", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)",
                    borderRadius: "8px", color: "#c4b5fd", fontSize: "0.82rem", fontWeight: 700,
                    textDecoration: "none", fontFamily: "'Syne', sans-serif", letterSpacing: "0.02em"
                  }}>{l.label} ↗</a>
                ))}
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}
