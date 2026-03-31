import { useState } from "react";

// ─── Shared UI primitives ────────────────────────────────────────────────────

const SH = ({ title, subtitle, icon }) => (
  <div style={{
    marginBottom: "2rem",
    paddingBottom: "1.25rem",
    borderBottom: "1px solid rgba(167,139,250,0.18)"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
      {icon && <span style={{ fontSize: "1.5rem" }}>{icon}</span>}
      <h2 style={{
        margin: 0,
        fontSize: "1.55rem",
        fontWeight: 700,
        background: "linear-gradient(90deg,#a78bfa,#c4b5fd)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontFamily: "'Syne', sans-serif",
        letterSpacing: "-0.5px"
      }}>{title}</h2>
    </div>
    {subtitle && <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.92rem", paddingLeft: icon ? "2.25rem" : 0 }}>{subtitle}</p>}
  </div>
);

const InfoBox = ({ title, children, accent = "#a78bfa" }) => (
  <div style={{
    background: "rgba(167,139,250,0.06)",
    border: `1px solid ${accent}33`,
    borderLeft: `3px solid ${accent}`,
    borderRadius: "0.65rem",
    padding: "1rem 1.25rem",
    marginBottom: "1rem"
  }}>
    {title && <div style={{ fontWeight: 700, color: accent, marginBottom: "0.5rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>}
    <div style={{ color: "#d1d5db", fontSize: "0.92rem", lineHeight: 1.7 }}>{children}</div>
  </div>
);

const Callout = ({ type = "tip", children }) => {
  const map = {
    tip: { icon: "💡", label: "Tip", bg: "rgba(16,185,129,0.07)", border: "#10b981", color: "#34d399" },
    warning: { icon: "⚠️", label: "Warning", bg: "rgba(245,158,11,0.07)", border: "#f59e0b", color: "#fbbf24" },
    note: { icon: "📝", label: "Note", bg: "rgba(99,102,241,0.09)", border: "#6366f1", color: "#818cf8" },
    danger: { icon: "🔥", label: "Critical", bg: "rgba(239,68,68,0.07)", border: "#ef4444", color: "#f87171" },
  };
  const c = map[type];
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}44`,
      borderLeft: `3px solid ${c.border}`,
      borderRadius: "0.65rem", padding: "0.9rem 1.1rem",
      marginBottom: "1rem", display: "flex", gap: "0.75rem"
    }}>
      <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{c.icon}</span>
      <div>
        <span style={{ fontWeight: 700, color: c.color, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.label} — </span>
        <span style={{ color: "#d1d5db", fontSize: "0.91rem", lineHeight: 1.7 }}>{children}</span>
      </div>
    </div>
  );
};

const CodeBlock = ({ code, language = "text" }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  return (
    <div style={{
      background: "#0d0d14", border: "1px solid rgba(167,139,250,0.18)",
      borderRadius: "0.7rem", marginBottom: "1rem", overflow: "hidden"
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0.5rem 1rem", background: "rgba(167,139,250,0.07)",
        borderBottom: "1px solid rgba(167,139,250,0.12)"
      }}>
        <span style={{ color: "#6b7280", fontSize: "0.78rem", fontFamily: "monospace" }}>{language}</span>
        <button onClick={copy} style={{
          background: "none", border: "1px solid rgba(167,139,250,0.3)",
          color: copied ? "#34d399" : "#a78bfa", borderRadius: "0.35rem",
          padding: "0.2rem 0.65rem", cursor: "pointer", fontSize: "0.75rem"
        }}>{copied ? "✓ Copied" : "Copy"}</button>
      </div>
      <pre style={{ margin: 0, padding: "1.1rem 1.25rem", color: "#e2e8f0", fontSize: "0.83rem", lineHeight: 1.75, overflowX: "auto", fontFamily: "'Fira Code', 'Cascadia Code', monospace" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
};

const Table = ({ headers, rows }) => (
  <div style={{ overflowX: "auto", marginBottom: "1.25rem", borderRadius: "0.65rem", border: "1px solid rgba(167,139,250,0.18)" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.87rem" }}>
      <thead>
        <tr style={{ background: "rgba(167,139,250,0.12)" }}>
          {headers.map((h, i) => (
            <th key={i} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "#a78bfa", fontWeight: 700, borderBottom: "1px solid rgba(167,139,250,0.2)", whiteSpace: "nowrap" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? "rgba(0,0,0,0.2)" : "rgba(167,139,250,0.03)", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(167,139,250,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "rgba(0,0,0,0.2)" : "rgba(167,139,250,0.03)"}
          >
            {row.map((cell, j) => (
              <td key={j} style={{ padding: "0.7rem 1rem", color: "#d1d5db", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── SVG Diagrams ────────────────────────────────────────────────────────────

const DiagramCacheAside = () => (
  <div style={{ background: "#0a0a12", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "0.8rem", padding: "1.5rem", marginBottom: "1rem" }}>
    <p style={{ textAlign: "center", color: "#a78bfa", fontWeight: 700, marginBottom: "1rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Cache-Aside (Lazy Loading) Flow</p>
    <svg viewBox="0 0 720 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
      {/* App box */}
      <rect x="20" y="75" width="110" height="50" rx="8" fill="#1e1030" stroke="#a78bfa" strokeWidth="1.5" />
      <text x="75" y="97" textAnchor="middle" fill="#c4b5fd" fontSize="12" fontWeight="bold">Application</text>
      <text x="75" y="113" textAnchor="middle" fill="#9ca3af" fontSize="10">Server</text>
      {/* Cache box */}
      <rect x="290" y="30" width="110" height="50" rx="8" fill="#0f1a2e" stroke="#38bdf8" strokeWidth="1.5" />
      <text x="345" y="52" textAnchor="middle" fill="#7dd3fc" fontSize="12" fontWeight="bold">Cache</text>
      <text x="345" y="68" textAnchor="middle" fill="#9ca3af" fontSize="10">Redis / Memcached</text>
      {/* DB box */}
      <rect x="290" y="120" width="110" height="50" rx="8" fill="#1a1a0f" stroke="#fbbf24" strokeWidth="1.5" />
      <text x="345" y="142" textAnchor="middle" fill="#fde68a" fontSize="12" fontWeight="bold">Database</text>
      <text x="345" y="158" textAnchor="middle" fill="#9ca3af" fontSize="10">PostgreSQL / MySQL</text>
      {/* Arrow: App → Cache */}
      <defs>
        <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#a78bfa" /></marker>
        <marker id="arrY" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#fbbf24" /></marker>
        <marker id="arrG" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#34d399" /></marker>
      </defs>
      <line x1="130" y1="90" x2="288" y2="58" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arr)" />
      <text x="200" y="62" fill="#a78bfa" fontSize="10" textAnchor="middle">① Read?</text>
      {/* Miss path */}
      <line x1="345" y1="80" x2="345" y2="118" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrY)" />
      <text x="380" y="108" fill="#fbbf24" fontSize="10">② Miss → DB</text>
      {/* Return path */}
      <line x1="290" y1="148" x2="140" y2="112" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#arrG)" />
      <text x="200" y="148" fill="#34d399" fontSize="10" textAnchor="middle">③ Return + cache</text>
      {/* Hit label */}
      <rect x="500" y="45" width="190" height="110" rx="8" fill="rgba(167,139,250,0.06)" stroke="rgba(167,139,250,0.2)" strokeWidth="1" />
      <text x="595" y="68" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="bold">Cache HIT ✅</text>
      <text x="595" y="84" textAnchor="middle" fill="#9ca3af" fontSize="9.5">Data found in cache</text>
      <text x="595" y="97" textAnchor="middle" fill="#9ca3af" fontSize="9.5">→ Return instantly (~1ms)</text>
      <text x="595" y="118" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="bold">Cache MISS ❌</text>
      <text x="595" y="133" textAnchor="middle" fill="#9ca3af" fontSize="9.5">Fetch from DB (~50-200ms)</text>
      <text x="595" y="146" textAnchor="middle" fill="#9ca3af" fontSize="9.5">→ Store in cache</text>
    </svg>
  </div>
);

const DiagramWriteModes = () => (
  <div style={{ background: "#0a0a12", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "0.8rem", padding: "1.5rem", marginBottom: "1rem" }}>
    <p style={{ textAlign: "center", color: "#a78bfa", fontWeight: 700, marginBottom: "1rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Write-Through vs Write-Back</p>
    <svg viewBox="0 0 720 210" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="a1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#38bdf8" /></marker>
        <marker id="a2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#fb923c" /></marker>
        <marker id="a3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#f87171" /></marker>
      </defs>
      {/* Write-Through section */}
      <text x="175" y="22" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold">Write-Through</text>
      <rect x="20" y="35" width="80" height="40" rx="6" fill="#0f1a2e" stroke="#38bdf8" strokeWidth="1.5" />
      <text x="60" y="52" textAnchor="middle" fill="#7dd3fc" fontSize="11" fontWeight="bold">App</text>
      <text x="60" y="66" textAnchor="middle" fill="#9ca3af" fontSize="9">Write</text>
      <rect x="140" y="35" width="80" height="40" rx="6" fill="#0f1a2e" stroke="#38bdf8" strokeWidth="1.5" />
      <text x="180" y="56" textAnchor="middle" fill="#7dd3fc" fontSize="11">Cache</text>
      <rect x="260" y="35" width="80" height="40" rx="6" fill="#1a1a0f" stroke="#fbbf24" strokeWidth="1.5" />
      <text x="300" y="56" textAnchor="middle" fill="#fde68a" fontSize="11">DB</text>
      <line x1="100" y1="55" x2="138" y2="55" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#a1)" />
      <line x1="220" y1="55" x2="258" y2="55" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#a1)" />
      <text x="120" y="48" fill="#38bdf8" fontSize="9" textAnchor="middle">sync</text>
      <text x="240" y="48" fill="#38bdf8" fontSize="9" textAnchor="middle">sync</text>
      <text x="175" y="100" textAnchor="middle" fill="#34d399" fontSize="10">✅ Consistent  ⚠️ Slower writes</text>

      {/* Write-Back section */}
      <text x="545" y="22" textAnchor="middle" fill="#fb923c" fontSize="12" fontWeight="bold">Write-Back (Write-Behind)</text>
      <rect x="390" y="35" width="80" height="40" rx="6" fill="#1a0f0a" stroke="#fb923c" strokeWidth="1.5" />
      <text x="430" y="52" textAnchor="middle" fill="#fdba74" fontSize="11" fontWeight="bold">App</text>
      <text x="430" y="66" textAnchor="middle" fill="#9ca3af" fontSize="9">Write</text>
      <rect x="510" y="35" width="80" height="40" rx="6" fill="#1a0f0a" stroke="#fb923c" strokeWidth="1.5" />
      <text x="550" y="56" textAnchor="middle" fill="#fdba74" fontSize="11">Cache</text>
      <rect x="620" y="35" width="80" height="40" rx="6" fill="#1a1a0f" stroke="#fbbf24" strokeWidth="1.5" />
      <text x="660" y="56" textAnchor="middle" fill="#fde68a" fontSize="11">DB</text>
      <line x1="470" y1="55" x2="508" y2="55" stroke="#fb923c" strokeWidth="1.5" markerEnd="url(#a2)" />
      <line x1="590" y1="55" x2="618" y2="55" stroke="#f87171" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#a3)" />
      <text x="490" y="48" fill="#fb923c" fontSize="9" textAnchor="middle">sync</text>
      <text x="605" y="47" fill="#f87171" fontSize="9" textAnchor="middle">async</text>
      <text x="545" y="100" textAnchor="middle" fill="#fbbf24" fontSize="10">⚡ Fast writes  ⚠️ Risk of data loss</text>
      {/* Comparison table */}
      <line x1="360" y1="20" x2="360" y2="120" stroke="rgba(167,139,250,0.2)" strokeWidth="1" />
      <rect x="20" y="120" width="680" height="75" rx="8" fill="rgba(167,139,250,0.04)" stroke="rgba(167,139,250,0.12)" strokeWidth="1" />
      <text x="360" y="143" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="bold">Comparison</text>
      <text x="180" y="162" textAnchor="middle" fill="#7dd3fc" fontSize="10">Write-Through: data always in sync</text>
      <text x="180" y="176" textAnchor="middle" fill="#9ca3af" fontSize="9.5">Best for: read-heavy, financial systems</text>
      <text x="540" y="162" textAnchor="middle" fill="#fdba74" fontSize="10">Write-Back: low write latency</text>
      <text x="540" y="176" textAnchor="middle" fill="#9ca3af" fontSize="9.5">Best for: write-heavy, logging, analytics</text>
    </svg>
  </div>
);

const DiagramDistributed = () => (
  <div style={{ background: "#0a0a12", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "0.8rem", padding: "1.5rem", marginBottom: "1rem" }}>
    <p style={{ textAlign: "center", color: "#a78bfa", fontWeight: 700, marginBottom: "1rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Distributed Cache System</p>
    <svg viewBox="0 0 720 220" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="da" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#a78bfa" /></marker>
      </defs>
      {/* Clients */}
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={20} y={30 + i * 60} width="70" height="35" rx="6" fill="#1a1030" stroke="#6d28d9" strokeWidth="1.2" />
          <text x={55} y={50 + i * 60} textAnchor="middle" fill="#c4b5fd" fontSize="10" fontWeight="bold">Client {i + 1}</text>
        </g>
      ))}
      {/* Load Balancer */}
      <rect x="140" y="80" width="90" height="50" rx="8" fill="#0f1a1a" stroke="#06b6d4" strokeWidth="1.5" />
      <text x="185" y="100" textAnchor="middle" fill="#67e8f9" fontSize="11" fontWeight="bold">Load</text>
      <text x="185" y="115" textAnchor="middle" fill="#67e8f9" fontSize="11" fontWeight="bold">Balancer</text>
      {/* Arrows clients→LB */}
      {[47, 107, 167].map((y, i) => <line key={i} x1="90" y1={y} x2="138" y2="105" stroke="#6d28d9" strokeWidth="1" markerEnd="url(#da)" />)}
      {/* Cache nodes */}
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={310} y={25 + i * 65} width="110" height="42" rx="7" fill="#0f1a2e" stroke="#38bdf8" strokeWidth="1.5" />
          <text x={365} y={43 + i * 65} textAnchor="middle" fill="#7dd3fc" fontSize="11" fontWeight="bold">Cache Node {i + 1}</text>
          <text x={365} y={58 + i * 65} textAnchor="middle" fill="#9ca3af" fontSize="9">Redis Shard {i + 1}</text>
          <line x1="230" y1="105" x2="308" y2={46 + i * 65} stroke="#38bdf8" strokeWidth="1.2" markerEnd="url(#da)" />
        </g>
      ))}
      {/* Consistent hashing ring */}
      <ellipse cx="270" cy="105" rx="35" ry="35" fill="none" stroke="rgba(167,139,250,0.3)" strokeWidth="1" strokeDasharray="4,3" />
      <text x="270" y="100" textAnchor="middle" fill="#a78bfa" fontSize="8">Consistent</text>
      <text x="270" y="112" textAnchor="middle" fill="#a78bfa" fontSize="8">Hashing</text>
      <line x1="230" y1="105" x2="235" y2="105" stroke="none" />
      {/* DB */}
      <rect x="530" y="80" width="100" height="50" rx="7" fill="#1a1a0f" stroke="#fbbf24" strokeWidth="1.5" />
      <text x="580" y="100" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="bold">Primary</text>
      <text x="580" y="115" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="bold">Database</text>
      {/* Cache→DB */}
      {[46, 111, 176].map((y, i) => <line key={i} x1="420" y1={y} x2="528" y2="105" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" markerEnd="url(#da)" />)}
      {/* Footer note */}
      <rect x="20" y="190" width="680" height="24" rx="5" fill="rgba(167,139,250,0.06)" />
      <text x="360" y="206" textAnchor="middle" fill="#9ca3af" fontSize="10">Consistent hashing distributes keys across nodes — adding/removing nodes only remaps ~K/n keys</text>
    </svg>
  </div>
);

const DiagramEviction = () => (
  <div style={{ background: "#0a0a12", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "0.8rem", padding: "1.5rem", marginBottom: "1rem" }}>
    <p style={{ textAlign: "center", color: "#a78bfa", fontWeight: 700, marginBottom: "1rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>LRU Eviction — Cache Full Scenario</p>
    <svg viewBox="0 0 720 150" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
      {/* LRU linked list */}
      {[
        { label: "D", sub: "Most Recent", color: "#34d399", x: 60 },
        { label: "C", sub: "Recent", color: "#a78bfa", x: 190 },
        { label: "B", sub: "Older", color: "#818cf8", x: 320 },
        { label: "A", sub: "Least Recent", color: "#f87171", x: 450 },
      ].map(({ label, sub, color, x }) => (
        <g key={label}>
          <rect x={x} y="40" width="100" height="55" rx="8" fill={`${color}15`} stroke={color} strokeWidth="1.5" />
          <text x={x + 50} y="65" textAnchor="middle" fill={color} fontSize="20" fontWeight="bold">{label}</text>
          <text x={x + 50} y="83" textAnchor="middle" fill="#9ca3af" fontSize="9">{sub}</text>
        </g>
      ))}
      {/* Arrows */}
      {[160, 290, 420].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="67" x2={x + 28} y2="67" stroke="#4b5563" strokeWidth="1.5" />
          <polygon points={`${x + 28},63 ${x + 35},67 ${x + 28},71`} fill="#4b5563" />
        </g>
      ))}
      {/* New item */}
      <rect x="590" y="40" width="100" height="55" rx="8" fill="rgba(251,191,36,0.12)" stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="5,3" />
      <text x="640" y="65" textAnchor="middle" fill="#fbbf24" fontSize="20" fontWeight="bold">E</text>
      <text x="640" y="83" textAnchor="middle" fill="#9ca3af" fontSize="9">New Item</text>
      <text x="640" y="130" textAnchor="middle" fill="#fbbf24" fontSize="10">Incoming →</text>
      {/* Evict label */}
      <text x="500" y="130" textAnchor="middle" fill="#f87171" fontSize="10">⬆️ A evicted (LRU)</text>
      <text x="60" y="130" textAnchor="middle" fill="#34d399" fontSize="10">HEAD (MRU)</text>
    </svg>
  </div>
);

// ─── Section components ───────────────────────────────────────────────────────

const Introduction = () => (
  <section>
    <SH title="Introduction to Caching" icon="🗄️" subtitle="The single most impactful optimization in distributed systems" />
    <InfoBox title="What is Caching?">
      Caching is the technique of <strong style={{ color: "#a78bfa" }}>storing copies of frequently accessed data</strong> in a fast-access storage layer (cache) so future requests can be served faster — without hitting the original, slower data source (database, API, disk).
    </InfoBox>
    <p style={{ color: "#9ca3af", lineHeight: 1.8, marginBottom: "1rem" }}>
      Think of a cache as a <em style={{ color: "#c4b5fd" }}>high-speed buffer</em> between your application and the slow, expensive backend. Instead of recomputing or refetching data every time, you store the result once and retrieve it instantly for subsequent requests.
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
      {[
        { icon: "⚡", label: "Latency", val: "~1ms (cache) vs ~100ms (DB)", color: "#34d399" },
        { icon: "📈", label: "Throughput", val: "10-100x more requests/sec", color: "#a78bfa" },
        { icon: "💸", label: "Cost", val: "Reduces expensive DB queries", color: "#fbbf24" },
      ].map(({ icon, label, val, color }) => (
        <div key={label} style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: "0.65rem", padding: "1rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{icon}</div>
          <div style={{ color, fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.25rem" }}>{label}</div>
          <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>{val}</div>
        </div>
      ))}
    </div>
    <Callout type="tip">Caching is one of the top 3 topics asked in every system design interview. Master it deeply.</Callout>
  </section>
);

const WhyCaching = () => (
  <section>
    <SH title="Why Caching is Critical" icon="🎯" subtitle="Core motivations with real-world examples" />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
      {[
        { title: "Reduce Database Load", icon: "🗃️", color: "#38bdf8", desc: "Without caching, every user request hits the DB. At 1M users, that's 1M DB queries. A cache absorbs 90%+ of reads." },
        { title: "Improve Response Time", icon: "⚡", color: "#34d399", desc: "DB reads take 50-200ms. In-memory cache reads take <1ms. For a feed with 100 items, that's 10 seconds vs 0.1 seconds." },
        { title: "Handle Traffic Spikes", icon: "📊", color: "#fbbf24", desc: "A viral post on Instagram gets 10M views in an hour. Without caching, the DB would collapse under this load." },
      ].map(({ title, icon, color, desc }) => (
        <div key={title} style={{ background: `${color}0d`, border: `1px solid ${color}33`, borderRadius: "0.7rem", padding: "1.1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
            <span style={{ fontSize: "1.2rem" }}>{icon}</span>
            <strong style={{ color, fontSize: "0.9rem" }}>{title}</strong>
          </div>
          <p style={{ color: "#d1d5db", fontSize: "0.86rem", margin: 0, lineHeight: 1.65 }}>{desc}</p>
        </div>
      ))}
    </div>
    <p style={{ color: "#a78bfa", fontWeight: 700, marginBottom: "0.6rem" }}>Real-World Examples</p>
    <Table
      headers={["Company", "What they cache", "Why", "Impact"]}
      rows={[
        ["YouTube", "Video metadata, view counts, recommendations", "Billions of daily requests per video", "Reduces DB load by ~95%"],
        ["Instagram", "User feeds, follower counts, story views", "Feed loads must be <100ms", "Serves 500M stories/day effortlessly"],
        ["Amazon", "Product pages, pricing, inventory counts", "Product page is read 1000x more than written", "Black Friday traffic absorbed by cache"],
        ["Twitter/X", "Home timeline, trending topics", "Timeline rebuild is expensive (fan-out)", "Pre-computed feeds cached per user"],
        ["Netflix", "Metadata, thumbnails, user preferences", "Same content served globally", "CDN edge cache reduces origin load"],
      ]}
    />
    <Callout type="note">The <strong>cache hit ratio</strong> (hits / total requests) is the key metric. A 90% hit ratio means only 10% of requests reach the DB — a 10x reduction in DB load.</Callout>
  </section>
);

const Strategies = () => (
  <section>
    <SH title="Caching Strategies" icon="⚙️" subtitle="Five patterns every engineer must know" />
    <DiagramCacheAside />

    {/* Cache-Aside */}
    <div style={{ background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "0.7rem", padding: "1.25rem", marginBottom: "1rem" }}>
      <h3 style={{ color: "#a78bfa", margin: "0 0 0.75rem", fontSize: "1.05rem" }}>1. Cache-Aside (Lazy Loading)</h3>
      <p style={{ color: "#d1d5db", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: "0.75rem" }}>
        The application manages the cache manually. On a read, it checks the cache first. On a miss, it fetches from DB and populates the cache. This is the <strong style={{ color: "#c4b5fd" }}>most commonly used pattern</strong>.
      </p>
      <CodeBlock language="python" code={`def get_user(user_id):
    # Step 1: Check cache first
    user = cache.get(f"user:{user_id}")
    if user:
        return user  # Cache HIT — return instantly

    # Step 2: Cache MISS — fetch from database
    user = db.query("SELECT * FROM users WHERE id = ?", user_id)

    # Step 3: Populate cache for future requests
    cache.set(f"user:{user_id}", user, ttl=3600)  # 1 hour TTL

    return user`} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <InfoBox title="✅ Pros" accent="#34d399">
          <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
            <li>Simple to implement</li>
            <li>Cache only what's needed (lazy)</li>
            <li>Cache failure doesn't break the app</li>
            <li>Works well for read-heavy workloads</li>
          </ul>
        </InfoBox>
        <InfoBox title="❌ Cons" accent="#f87171">
          <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
            <li>First request always hits DB (cold start)</li>
            <li>Stale data risk if TTL is too long</li>
            <li>Cache stampede under high concurrency</li>
          </ul>
        </InfoBox>
      </div>
    </div>

    {/* Write-Through */}
    <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "0.7rem", padding: "1.25rem", marginBottom: "1rem" }}>
      <h3 style={{ color: "#38bdf8", margin: "0 0 0.75rem", fontSize: "1.05rem" }}>2. Write-Through</h3>
      <p style={{ color: "#d1d5db", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: "0.75rem" }}>
        Every write goes to both the cache and database <strong style={{ color: "#7dd3fc" }}>synchronously</strong>. Cache is always consistent with DB.
      </p>
      <CodeBlock language="python" code={`def update_user(user_id, data):
    # Write to BOTH cache and DB simultaneously
    db.update("UPDATE users SET ... WHERE id = ?", user_id, data)
    cache.set(f"user:{user_id}", data, ttl=3600)
    # ✅ Cache is always fresh — no stale data risk`} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <InfoBox title="✅ Pros" accent="#34d399"><ul style={{ margin: 0, paddingLeft: "1.2rem" }}><li>Strong consistency guaranteed</li><li>No stale reads after writes</li><li>Good for read-after-write scenarios</li></ul></InfoBox>
        <InfoBox title="❌ Cons" accent="#f87171"><ul style={{ margin: 0, paddingLeft: "1.2rem" }}><li>Higher write latency (two writes)</li><li>Cache may store rarely-read data</li></ul></InfoBox>
      </div>
    </div>

    {/* Write-Back */}
    <div style={{ background: "rgba(251,146,60,0.05)", border: "1px solid rgba(251,146,60,0.2)", borderRadius: "0.7rem", padding: "1.25rem", marginBottom: "1rem" }}>
      <h3 style={{ color: "#fb923c", margin: "0 0 0.75rem", fontSize: "1.05rem" }}>3. Write-Back (Write-Behind)</h3>
      <p style={{ color: "#d1d5db", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: "0.75rem" }}>
        Writes go to cache only, and are flushed to the database <strong style={{ color: "#fdba74" }}>asynchronously</strong> after a delay. Extremely fast writes.
      </p>
      <CodeBlock language="python" code={`def update_user(user_id, data):
    # Write ONLY to cache — return immediately
    cache.set(f"user:{user_id}", data, ttl=3600)
    cache.add_to_dirty_queue(user_id)  # Mark for async flush
    return  # Responds in <1ms!

# Background worker — runs every N seconds
def flush_dirty_keys():
    for user_id in cache.get_dirty_queue():
        data = cache.get(f"user:{user_id}")
        db.update("UPDATE users SET ...", data)  # Async DB write`} />
      <Callout type="danger">If the cache crashes before flushing, writes are lost permanently. Use only when some data loss is acceptable (e.g., view counts, analytics).</Callout>
    </div>

    {/* Read-Through */}
    <div style={{ background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: "0.7rem", padding: "1.25rem", marginBottom: "1rem" }}>
      <h3 style={{ color: "#c4b5fd", margin: "0 0 0.5rem", fontSize: "1.05rem" }}>4. Read-Through</h3>
      <p style={{ color: "#d1d5db", fontSize: "0.88rem", lineHeight: 1.7 }}>
        The <strong style={{ color: "#c4b5fd" }}>cache itself</strong> handles the DB fetch on a miss, transparently. The application only talks to the cache — it never directly queries the DB. Used in libraries like <code style={{ color: "#a78bfa" }}>Caffeine</code> (Java) and Redis with <code style={{ color: "#a78bfa" }}>cache-through</code> patterns.
      </p>
    </div>

    <DiagramWriteModes />

    <Table
      headers={["Strategy", "Read Logic", "Write Logic", "Consistency", "Best For"]}
      rows={[
        ["Cache-Aside", "App checks cache → DB on miss", "App writes DB only", "Eventual", "Read-heavy, general use"],
        ["Write-Through", "App reads from cache", "App writes cache + DB", "Strong", "Financial, user data"],
        ["Write-Back", "App reads from cache", "App writes cache only (async DB)", "Eventual", "Write-heavy, analytics"],
        ["Read-Through", "Cache fetches from DB on miss", "App writes DB only", "Eventual", "ORM-based systems"],
      ]}
    />
  </section>
);

const DistributedCaching = () => (
  <section>
    <SH title="Distributed Caching" icon="🌐" subtitle="Scaling cache across multiple nodes" />
    <p style={{ color: "#d1d5db", lineHeight: 1.75, marginBottom: "1rem" }}>
      A single cache node is a single point of failure and has limited memory. <strong style={{ color: "#a78bfa" }}>Distributed caching</strong> spreads data across multiple nodes using consistent hashing or sharding.
    </p>
    <DiagramDistributed />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
      <div style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: "0.7rem", padding: "1.1rem" }}>
        <div style={{ color: "#f87171", fontWeight: 700, marginBottom: "0.5rem" }}>⚡ Redis Cluster</div>
        <ul style={{ color: "#d1d5db", fontSize: "0.86rem", margin: 0, paddingLeft: "1.2rem", lineHeight: 1.75 }}>
          <li>Built-in sharding with 16,384 hash slots</li>
          <li>Automatic failover with replicas</li>
          <li>Supports data structures (lists, sets, sorted sets)</li>
          <li>Used by: Twitter, GitHub, Stack Overflow</li>
        </ul>
      </div>
      <div style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "0.7rem", padding: "1.1rem" }}>
        <div style={{ color: "#34d399", fontWeight: 700, marginBottom: "0.5rem" }}>🔧 Memcached</div>
        <ul style={{ color: "#d1d5db", fontSize: "0.86rem", margin: 0, paddingLeft: "1.2rem", lineHeight: 1.75 }}>
          <li>Simple key-value store, extremely fast</li>
          <li>Multi-threaded (better CPU utilization)</li>
          <li>No persistence — pure in-memory</li>
          <li>Used by: Facebook, Wikipedia, YouTube</li>
        </ul>
      </div>
    </div>
    <InfoBox title="Consistent Hashing — Key Concept">
      Instead of <code>node = hash(key) % N</code> (breaks on node change), consistent hashing places nodes on a virtual ring. Adding/removing a node only remaps <code>K/N</code> keys (where K = total keys, N = nodes). This is why Redis Cluster can scale without full reshuffling.
    </InfoBox>
    <Callout type="warning">Cache replication introduces lag. A write to the primary may not immediately reflect on replicas — always design with eventual consistency in mind for distributed caches.</Callout>
  </section>
);

const CacheInvalidation = () => (
  <section>
    <SH title="Cache Invalidation" icon="⚠️" subtitle="The hardest problem in computer science" />
    <Callout type="danger">Phil Karlton famously said: "There are only two hard things in Computer Science: cache invalidation and naming things." — This is asked in almost every senior interview.</Callout>
    <p style={{ color: "#d1d5db", lineHeight: 1.75, marginBottom: "1rem" }}>
      Cache invalidation is the process of <strong style={{ color: "#a78bfa" }}>removing or updating stale entries</strong> in the cache when the underlying data changes. Get it wrong and users see outdated data. Get it too aggressive and you lose all caching benefits.
    </p>
    <InfoBox title="Why It's Hard">
      <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8 }}>
        <li><strong style={{ color: "#c4b5fd" }}>Race conditions:</strong> Two servers update the DB; only one invalidates cache</li>
        <li><strong style={{ color: "#c4b5fd" }}>Distributed lag:</strong> Invalidation message may arrive after a fresh cache write</li>
        <li><strong style={{ color: "#c4b5fd" }}>Cascading dependencies:</strong> One DB change can affect 50 different cache keys</li>
        <li><strong style={{ color: "#c4b5fd" }}>Unknown subscribers:</strong> You don't always know who cached what</li>
      </ul>
    </InfoBox>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
      <div style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "0.7rem", padding: "1.1rem" }}>
        <div style={{ color: "#a78bfa", fontWeight: 700, marginBottom: "0.6rem" }}>⏱️ Time-Based (TTL)</div>
        <p style={{ color: "#d1d5db", fontSize: "0.87rem", lineHeight: 1.7, margin: 0 }}>
          Each cache entry has a <strong>Time-To-Live</strong>. Expires automatically. Simple but imprecise — data can be stale for the full TTL duration.
        </p>
        <CodeBlock language="redis" code={`SET user:123 "{...}" EX 3600   # Expires in 1 hour
SETEX product:456 300 "{...}"  # Expires in 5 minutes`} />
      </div>
      <div style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "0.7rem", padding: "1.1rem" }}>
        <div style={{ color: "#38bdf8", fontWeight: 700, marginBottom: "0.6rem" }}>📡 Event-Based</div>
        <p style={{ color: "#d1d5db", fontSize: "0.87rem", lineHeight: 1.7, margin: 0 }}>
          When data changes, an event is published. All services listening delete or update their cached copies immediately.
        </p>
        <CodeBlock language="python" code={`# On DB update:
db.update(user_id, new_data)
event_bus.publish("user.updated", {
    "user_id": user_id,
    "keys": [f"user:{user_id}", f"feed:{user_id}"]
})
# Cache service listens and invalidates`} />
      </div>
    </div>
    <InfoBox title="🔥 Cache Stampede / Thundering Herd" accent="#f59e0b">
      When a popular cache key expires, <strong>thousands of requests simultaneously</strong> hit the DB before anyone can re-populate the cache. Solutions: <strong>probabilistic early expiration</strong>, <strong>mutex locking</strong> (only one process refreshes), or <strong>staggered TTLs</strong>.
    </InfoBox>
    <CodeBlock language="python" code={`import threading

lock = threading.Lock()

def get_with_lock(key):
    value = cache.get(key)
    if value:
        return value  # Cache hit

    with lock:  # Only ONE thread fetches from DB
        value = cache.get(key)  # Double-check after acquiring lock
        if not value:
            value = db.fetch(key)
            cache.set(key, value, ttl=300)
    return value`} />
  </section>
);

const EvictionPolicies = () => (
  <section>
    <SH title="Eviction Policies" icon="🔥" subtitle="What to remove when the cache is full" />
    <p style={{ color: "#9ca3af", lineHeight: 1.75, marginBottom: "1rem" }}>
      Caches have finite memory. When full, an <strong style={{ color: "#a78bfa" }}>eviction policy</strong> decides which items to remove to make space for new ones. Choosing the wrong policy can destroy cache effectiveness.
    </p>
    <DiagramEviction />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
      {[
        { name: "LRU", full: "Least Recently Used", icon: "⏰", color: "#a78bfa", desc: "Evicts the item that was accessed least recently. Works on the assumption that recently used data will be used again soon.", code: `# Redis config\nmaxmemory-policy allkeys-lru`, usecase: "General purpose, user sessions, web caches" },
        { name: "LFU", full: "Least Frequently Used", icon: "📊", color: "#38bdf8", desc: "Evicts the item accessed least often overall. Better for skewed workloads where some data is always hot.", code: `# Redis config\nmaxmemory-policy allkeys-lfu`, usecase: "Content recommendation, trending topics" },
        { name: "FIFO", full: "First In First Out", icon: "📦", color: "#fbbf24", desc: "Evicts the oldest inserted item regardless of usage. Simple but often suboptimal.", code: `# Custom implementation needed\nqueue.dequeue()  # Remove oldest`, usecase: "Simple queues, log buffers" },
        { name: "TTL", full: "Time-To-Live", icon: "⌛", color: "#34d399", desc: "Items expire after a set duration. Not strictly an eviction policy but used alongside them.", code: `cache.set(key, val, ex=3600)  # Redis TTL`, usecase: "Session tokens, rate limiting, news feeds" },
      ].map(({ name, full, icon, color, desc, code, usecase }) => (
        <div key={name} style={{ background: `${color}0a`, border: `1px solid ${color}30`, borderRadius: "0.7rem", padding: "1.1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.3rem" }}>{icon}</span>
            <div>
              <span style={{ color, fontWeight: 800, fontSize: "1rem" }}>{name}</span>
              <span style={{ color: "#6b7280", fontSize: "0.78rem", marginLeft: "0.4rem" }}>— {full}</span>
            </div>
          </div>
          <p style={{ color: "#d1d5db", fontSize: "0.84rem", lineHeight: 1.65, margin: "0 0 0.6rem" }}>{desc}</p>
          <div style={{ fontSize: "0.78rem", color: "#9ca3af", marginBottom: "0.5rem" }}>📌 {usecase}</div>
          <CodeBlock language="code" code={code} />
        </div>
      ))}
    </div>
    <Table
      headers={["Policy", "Algorithm", "Use Case", "Pros", "Cons"]}
      rows={[
        ["LRU", "Doubly linked list + HashMap", "Web caches, sessions", "Simple, effective", "Doesn't consider frequency"],
        ["LFU", "Min-heap of frequency counters", "Recommendation engines", "Better for skewed access", "Complex, frequency decay needed"],
        ["FIFO", "Queue (circular buffer)", "Streaming, simple queues", "O(1), very simple", "Ignores usage patterns"],
        ["Random", "Random selection", "Low-overhead systems", "No tracking overhead", "Unpredictable, poor hit rate"],
        ["TTL", "Expiry timestamps", "Sessions, rate limits", "Automatic, predictable", "Stale data until expiry"],
      ]}
    />
    <Callout type="tip">Redis defaults to <strong>noeviction</strong> (returns error when full). For production, always set <code>maxmemory-policy</code> — <code>allkeys-lru</code> is the safe default for most use cases.</Callout>
  </section>
);

const InterviewSection = () => (
  <section>
    <SH title="Interview Deep Dive" icon="🎤" subtitle="How caching questions appear — and how to answer them" />
    {[
      {
        q: "How would you design a caching layer for a high-traffic e-commerce site?",
        approach: [
          "Identify what to cache: product pages (80% of traffic), user sessions, search results, inventory counts",
          "Choose Redis (rich data structures, cluster mode, pub/sub for invalidation)",
          "Strategy: Cache-Aside for product data, Write-Through for cart/order data",
          "TTL: Product pages 5 min, inventory 30s (changes fast), sessions 24h",
          "Handle invalidation via event bus when product data changes",
        ],
        tradeoff: "Stale inventory counts are acceptable for 30s, but stale pricing could cause legal issues → use shorter TTL or event-based invalidation for price changes."
      },
      {
        q: "Which caching strategy would you use and why?",
        approach: [
          "Always start by asking: read-heavy or write-heavy?",
          "Read-heavy + consistency needed → Write-Through + Cache-Aside for reads",
          "Write-heavy + can tolerate data loss → Write-Back",
          "General case → Cache-Aside (most flexible, most common)",
          "Mention trade-offs: consistency vs latency vs complexity",
        ],
        tradeoff: "There's no universally best strategy. The right choice depends on read/write ratio, consistency requirements, and failure tolerance."
      },
      {
        q: "How do you handle cache invalidation at scale?",
        approach: [
          "Acknowledge it's the hardest part — shows seniority",
          "Short TTLs as baseline safety net",
          "Event-driven invalidation via message queue (Kafka/SQS) on DB writes",
          "Versioned cache keys (user:123:v2) — bump version on change",
          "Cache-aside + write-through hybrid for critical data",
          "Monitor cache hit ratio — drops indicate stale/incorrect invalidation",
        ],
        tradeoff: "Event-based invalidation adds system complexity but dramatically reduces stale data windows. For most systems, TTL + event hybrid is the pragmatic choice."
      },
    ].map(({ q, approach, tradeoff }) => (
      <div key={q} style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "0.75rem", padding: "1.25rem", marginBottom: "1rem" }}>
        <div style={{ color: "#fbbf24", fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.95rem" }}>❓ {q}</div>
        <div style={{ color: "#a78bfa", fontWeight: 600, fontSize: "0.82rem", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>📋 Answer Approach</div>
        <ul style={{ margin: "0 0 0.75rem", paddingLeft: "1.3rem", color: "#d1d5db", fontSize: "0.88rem", lineHeight: 1.8 }}>
          {approach.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
        <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "0.5rem", padding: "0.75rem" }}>
          <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: "0.82rem" }}>⚖️ Key Trade-off: </span>
          <span style={{ color: "#d1d5db", fontSize: "0.87rem" }}>{tradeoff}</span>
        </div>
      </div>
    ))}
    <InfoBox title="Interview Pro Tips" accent="#34d399">
      <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.85 }}>
        <li>Always define <strong>what</strong> to cache before <strong>how</strong> — not everything should be cached</li>
        <li>Bring up <strong>cache hit ratio</strong> as a success metric (aim for ≥90%)</li>
        <li>Discuss <strong>memory limits</strong> and eviction policies proactively</li>
        <li>Mention <strong>cache warming</strong> for cold starts (pre-populate on deploy)</li>
        <li>Address <strong>distributed consistency</strong> — what happens when caches disagree?</li>
      </ul>
    </InfoBox>
  </section>
);

const CommonMistakes = () => (
  <section>
    <SH title="Common Mistakes to Avoid" icon="⛔" subtitle="What separates junior from senior engineers" />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "0.75rem" }}>
      {[
        { icon: "🚫", title: "Not handling cache invalidation", color: "#f87171", desc: "Caching without a clear invalidation strategy leads to users seeing stale data indefinitely. Always define when and how cache entries are invalidated." },
        { icon: "📦", title: "Over-caching everything", color: "#fb923c", desc: "Caching rarely-accessed or highly-dynamic data wastes memory and adds complexity. Cache selectively based on access patterns and update frequency." },
        { icon: "⚖️", title: "Ignoring consistency requirements", color: "#fbbf24", desc: "Banking/payment systems cannot tolerate stale cache reads. Always assess consistency requirements before applying caching — don't blindly cache all reads." },
        { icon: "🎲", title: "Wrong eviction policy", color: "#a78bfa", desc: "Using LRU when your access pattern is highly skewed (20% of keys get 80% of hits) should use LFU. Using FIFO for sessions causes premature eviction of active users." },
        { icon: "💥", title: "Cache stampede / thundering herd", color: "#38bdf8", desc: "When a popular key expires, thousands of simultaneous requests flood the DB. Use mutex locks, probabilistic expiration, or background refresh to prevent this." },
        { icon: "🔑", title: "Poor cache key design", color: "#34d399", desc: "Keys like 'user' or 'data' cause collisions. Use namespaced keys: 'user:{id}:profile', 'product:{id}:v2'. Version your keys to enable instant cache busting." },
      ].map(({ icon, title, color, desc }) => (
        <div key={title} style={{ background: `${color}08`, border: `1px solid ${color}30`, borderRadius: "0.7rem", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>{icon}</span>
            <strong style={{ color, fontSize: "0.88rem" }}>{title}</strong>
          </div>
          <p style={{ color: "#9ca3af", fontSize: "0.84rem", margin: 0, lineHeight: 1.65 }}>{desc}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── TOC Sidebar ─────────────────────────────────────────────────────────────

const sections = [
  { id: "intro", label: "Introduction", icon: "🗄️" },
  { id: "why", label: "Why Caching", icon: "🎯" },
  { id: "strategies", label: "Strategies", icon: "⚙️" },
  { id: "distributed", label: "Distributed", icon: "🌐" },
  { id: "invalidation", label: "Invalidation", icon: "⚠️" },
  { id: "eviction", label: "Eviction Policies", icon: "🔥" },
  { id: "interview", label: "Interview", icon: "🎤" },
  { id: "mistakes", label: "Mistakes", icon: "⛔" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CachingPage() {
  const [active, setActive] = useState("intro");

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActive(id);
    }
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      background: "#060610",
      minHeight: "100vh",
      color: "#e2e8f0",
      display: "flex",
      gap: 0,
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Fira+Code:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a0a14; } ::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.3); border-radius: 3px; }
        section { scroll-margin-top: 80px; }
      `}</style>

      {/* Sidebar TOC */}
      <aside style={{
        width: "220px", flexShrink: 0,
        background: "#08080f",
        borderRight: "1px solid rgba(167,139,250,0.12)",
        padding: "2rem 0", position: "sticky", top: 0, height: "100vh",
        overflowY: "auto", display: "flex", flexDirection: "column"
      }}>
        <div style={{ padding: "0 1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ background: "rgba(167,139,250,0.15)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontSize: "0.75rem" }}>🗄️</span>
            <span style={{ color: "#a78bfa", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Caching</span>
          </div>
        </div>
        <nav style={{ flex: 1 }}>
          {sections.map(({ id, label, icon }) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              width: "100%", textAlign: "left", padding: "0.6rem 1.25rem",
              background: active === id ? "rgba(167,139,250,0.12)" : "none",
              border: "none", borderLeft: `2px solid ${active === id ? "#a78bfa" : "transparent"}`,
              color: active === id ? "#c4b5fd" : "#6b7280", cursor: "pointer",
              fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem",
              transition: "all 0.15s", fontFamily: "inherit"
            }}>
              <span style={{ fontSize: "0.9rem" }}>{icon}</span> {label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(167,139,250,0.1)", marginTop: "auto" }}>
          <div style={{ fontSize: "0.72rem", color: "#4b5563", lineHeight: 1.6 }}>System Design<br /><span style={{ color: "#6d28d9" }}>HLD · Foundations</span></div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: "auto", padding: "2.5rem 2.5rem 4rem" }}>
        {/* Hero */}
        <div style={{
          background: "linear-gradient(135deg, rgba(109,40,217,0.2) 0%, rgba(167,139,250,0.08) 50%, rgba(6,6,16,0) 100%)",
          border: "1px solid rgba(167,139,250,0.2)", borderRadius: "1rem",
          padding: "2rem 2.5rem", marginBottom: "2.5rem",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "2rem" }}>🗄️</span>
            <h1 style={{
              margin: 0, fontSize: "2rem", fontWeight: 800,
              background: "linear-gradient(90deg, #a78bfa 0%, #c4b5fd 50%, #818cf8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              fontFamily: "'Syne', sans-serif", letterSpacing: "-1px"
            }}>Caching</h1>
          </div>
          <p style={{ margin: "0 0 1rem", color: "#9ca3af", fontSize: "0.95rem", maxWidth: "600px", lineHeight: 1.7 }}>
            From cache-aside to distributed Redis clusters — everything you need to ace caching in system design interviews and build performant real-world systems.
          </p>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {["Beginner → Advanced", "Interview-Ready", "Diagrams Included", "Real Examples"].map(tag => (
              <span key={tag} style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)", color: "#c4b5fd", borderRadius: "999px", padding: "0.25rem 0.75rem", fontSize: "0.75rem", fontWeight: 600 }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          <div id="intro"><Introduction /></div>
          <div id="why"><WhyCaching /></div>
          <div id="strategies"><Strategies /></div>
          <div id="distributed"><DistributedCaching /></div>
          <div id="invalidation"><CacheInvalidation /></div>
          <div id="eviction"><EvictionPolicies /></div>
          <div id="interview"><InterviewSection /></div>
          <div id="mistakes"><CommonMistakes /></div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "3rem", padding: "1.5rem", textAlign: "center", borderTop: "1px solid rgba(167,139,250,0.1)", color: "#4b5563", fontSize: "0.83rem" }}>
          System Design · HLD Foundations · Caching — <span style={{ color: "#6d28d9" }}>Whizan</span>
        </div>
      </main>
    </div>
  );
}
