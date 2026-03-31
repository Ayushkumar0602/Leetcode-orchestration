import { useState } from "react";

// ─── Shared UI primitives ────────────────────────────────────────────────────

const SH = ({ title, subtitle, icon }) => (
  <div style={{ marginBottom: "2rem", paddingBottom: "1.25rem", borderBottom: "1px solid rgba(167,139,250,0.18)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
      {icon && <span style={{ fontSize: "1.5rem" }}>{icon}</span>}
      <h2 style={{
        margin: 0, fontSize: "1.55rem", fontWeight: 700,
        background: "linear-gradient(90deg,#a78bfa,#c4b5fd)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        fontFamily: "'Syne', sans-serif", letterSpacing: "-0.5px"
      }}>{title}</h2>
    </div>
    {subtitle && <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.92rem", paddingLeft: icon ? "2.25rem" : 0 }}>{subtitle}</p>}
  </div>
);

const InfoBox = ({ title, children, accent = "#a78bfa" }) => (
  <div style={{
    background: "rgba(167,139,250,0.06)", border: `1px solid ${accent}33`,
    borderLeft: `3px solid ${accent}`, borderRadius: "0.65rem",
    padding: "1rem 1.25rem", marginBottom: "1rem"
  }}>
    {title && <div style={{ fontWeight: 700, color: accent, marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>}
    <div style={{ color: "#d1d5db", fontSize: "0.92rem", lineHeight: 1.75 }}>{children}</div>
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
      background: c.bg, border: `1px solid ${c.border}44`, borderLeft: `3px solid ${c.border}`,
      borderRadius: "0.65rem", padding: "0.9rem 1.1rem", marginBottom: "1rem",
      display: "flex", gap: "0.75rem"
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
    <div style={{ background: "#0d0d14", border: "1px solid rgba(167,139,250,0.18)", borderRadius: "0.7rem", marginBottom: "1rem", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 1rem", background: "rgba(167,139,250,0.07)", borderBottom: "1px solid rgba(167,139,250,0.12)" }}>
        <span style={{ color: "#6b7280", fontSize: "0.78rem", fontFamily: "monospace" }}>{language}</span>
        <button onClick={copy} style={{ background: "none", border: "1px solid rgba(167,139,250,0.3)", color: copied ? "#34d399" : "#a78bfa", borderRadius: "0.35rem", padding: "0.2rem 0.65rem", cursor: "pointer", fontSize: "0.75rem" }}>{copied ? "✓ Copied" : "Copy"}</button>
      </div>
      <pre style={{ margin: 0, padding: "1.1rem 1.25rem", color: "#e2e8f0", fontSize: "0.83rem", lineHeight: 1.75, overflowX: "auto", fontFamily: "'Fira Code','Cascadia Code',monospace" }}>
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
          {headers.map((h, i) => <th key={i} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "#a78bfa", fontWeight: 700, borderBottom: "1px solid rgba(167,139,250,0.2)", whiteSpace: "nowrap" }}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? "rgba(0,0,0,0.2)" : "rgba(167,139,250,0.03)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(167,139,250,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "rgba(0,0,0,0.2)" : "rgba(167,139,250,0.03)"}>
            {row.map((cell, j) => <td key={j} style={{ padding: "0.7rem 1rem", color: "#d1d5db", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── SVG Diagrams ─────────────────────────────────────────────────────────────

const DiagramQueueFlow = () => (
  <div style={{ background: "#0a0a12", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "0.8rem", padding: "1.5rem", marginBottom: "1rem" }}>
    <p style={{ textAlign: "center", color: "#a78bfa", fontWeight: 700, marginBottom: "1rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Producer → Queue → Consumer Flow</p>
    <svg viewBox="0 0 720 180" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="q1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#a78bfa" /></marker>
        <marker id="q2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#34d399" /></marker>
      </defs>
      {/* Producers */}
      {[0, 1].map(i => (
        <g key={i}>
          <rect x="20" y={35 + i * 75} width="100" height="45" rx="8" fill="#1e1030" stroke="#a78bfa" strokeWidth="1.5" />
          <text x="70" y={55 + i * 75} textAnchor="middle" fill="#c4b5fd" fontSize="11" fontWeight="bold">Producer {i + 1}</text>
          <text x="70" y={70 + i * 75} textAnchor="middle" fill="#9ca3af" fontSize="9">Order / Event</text>
          <line x1="120" y1={57 + i * 75} x2="210" y2={87} stroke="#a78bfa" strokeWidth="1.4" markerEnd="url(#q1)" />
        </g>
      ))}
      {/* Queue */}
      <rect x="212" y="50" width="200" height="80" rx="10" fill="#0f1020" stroke="#818cf8" strokeWidth="1.8" />
      <text x="312" y="75" textAnchor="middle" fill="#818cf8" fontSize="12" fontWeight="bold">Message Queue</text>
      <text x="312" y="92" textAnchor="middle" fill="#9ca3af" fontSize="9">RabbitMQ / SQS / Kafka</text>
      {/* Message slots */}
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x={225 + i * 42} y="102" width="35" height="18" rx="4" fill={`rgba(129,140,248,${0.15 + i * 0.08})`} stroke="#818cf8" strokeWidth="1" />
      ))}
      <text x="312" y="114" textAnchor="middle" fill="#818cf8" fontSize="8">msgs buffered in queue</text>
      {/* Consumers */}
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x="520" y={20 + i * 50} width="100" height="38" rx="7" fill="#0f2018" stroke="#34d399" strokeWidth="1.5" />
          <text x="570" y={36 + i * 50} textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="bold">Consumer {i + 1}</text>
          <text x="570" y={50 + i * 50} textAnchor="middle" fill="#9ca3af" fontSize="9">Worker Instance</text>
          <line x1="412" y1="90" x2="518" y2={39 + i * 50} stroke="#34d399" strokeWidth="1.3" markerEnd="url(#q2)" />
        </g>
      ))}
      {/* Labels */}
      <text x="160" y="148" textAnchor="middle" fill="#a78bfa" fontSize="10">① Publish</text>
      <text x="460" y="148" textAnchor="middle" fill="#34d399" fontSize="10">② Consume (parallel)</text>
      <rect x="620" y="50" width="90" height="80" rx="7" fill="rgba(52,211,153,0.06)" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />
      <text x="665" y="72" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">Benefits</text>
      <text x="665" y="88" textAnchor="middle" fill="#9ca3af" fontSize="8.5">✓ Decoupled</text>
      <text x="665" y="101" textAnchor="middle" fill="#9ca3af" fontSize="8.5">✓ Buffered</text>
      <text x="665" y="114" textAnchor="middle" fill="#9ca3af" fontSize="8.5">✓ Scalable</text>
    </svg>
  </div>
);

const DiagramPubSub = () => (
  <div style={{ background: "#0a0a12", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "0.8rem", padding: "1.5rem", marginBottom: "1rem" }}>
    <p style={{ textAlign: "center", color: "#a78bfa", fontWeight: 700, marginBottom: "1rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Pub/Sub Architecture</p>
    <svg viewBox="0 0 720 200" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="ps1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#f59e0b" /></marker>
        <marker id="ps2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#fb923c" /></marker>
      </defs>
      {/* Publisher */}
      <rect x="20" y="80" width="110" height="50" rx="8" fill="#1a1505" stroke="#f59e0b" strokeWidth="1.8" />
      <text x="75" y="101" textAnchor="middle" fill="#fde68a" fontSize="12" fontWeight="bold">Publisher</text>
      <text x="75" y="117" textAnchor="middle" fill="#9ca3af" fontSize="9">Payment Service</text>
      <line x1="130" y1="105" x2="218" y2="105" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#ps1)" />
      <text x="175" y="98" textAnchor="middle" fill="#f59e0b" fontSize="9">publish</text>
      {/* Topic / Broker */}
      <rect x="220" y="65" width="150" height="80" rx="10" fill="#10100a" stroke="#fbbf24" strokeWidth="2" />
      <text x="295" y="92" textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="bold">Topic / Broker</text>
      <text x="295" y="107" textAnchor="middle" fill="#9ca3af" fontSize="9">payment.processed</text>
      <text x="295" y="120" textAnchor="middle" fill="#6b7280" fontSize="8">Kafka / SNS / Pub/Sub</text>
      {/* Subscribers */}
      {[
        { label: "Email Service", sub: "Sends receipt", y: 20, color: "#fb923c" },
        { label: "Inventory Svc", sub: "Updates stock", y: 80, color: "#fb923c" },
        { label: "Analytics Svc", sub: "Tracks revenue", y: 140, color: "#fb923c" },
      ].map(({ label, sub, y, color }) => (
        <g key={label}>
          <rect x="490" y={y} width="130" height="42" rx="7" fill="#1a0f05" stroke={color} strokeWidth="1.4" />
          <text x="555" y={y + 17} textAnchor="middle" fill="#fdba74" fontSize="11" fontWeight="bold">{label}</text>
          <text x="555" y={y + 31} textAnchor="middle" fill="#9ca3af" fontSize="9">{sub}</text>
          <line x1="370" y1="105" x2="488" y2={y + 21} stroke={color} strokeWidth="1.3" markerEnd="url(#ps2)" />
        </g>
      ))}
      <text x="430" y="185" textAnchor="middle" fill="#fbbf24" fontSize="10">All subscribers get a copy — fan-out pattern</text>
    </svg>
  </div>
);

const DiagramEventStream = () => (
  <div style={{ background: "#0a0a12", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "0.8rem", padding: "1.5rem", marginBottom: "1rem" }}>
    <p style={{ textAlign: "center", color: "#a78bfa", fontWeight: 700, marginBottom: "1rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Event Streaming Pipeline (Kafka)</p>
    <svg viewBox="0 0 720 185" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="es1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#38bdf8" /></marker>
        <marker id="es2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#a78bfa" /></marker>
      </defs>
      {/* Producers */}
      <rect x="10" y="70" width="110" height="50" rx="8" fill="#0a1520" stroke="#38bdf8" strokeWidth="1.5" />
      <text x="65" y="90" textAnchor="middle" fill="#7dd3fc" fontSize="11" fontWeight="bold">Producers</text>
      <text x="65" y="106" textAnchor="middle" fill="#9ca3af" fontSize="9">IoT / Apps / Services</text>
      <line x1="120" y1="95" x2="155" y2="95" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#es1)" />
      {/* Kafka Broker with partitions */}
      <rect x="157" y="25" width="250" height="140" rx="10" fill="#08101a" stroke="#38bdf8" strokeWidth="2" />
      <text x="282" y="48" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold">Kafka Broker</text>
      <text x="282" y="62" textAnchor="middle" fill="#6b7280" fontSize="9">Topic: user-events</text>
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x="167" y={70 + i * 30} width="230" height="22" rx="4" fill="rgba(56,189,248,0.08)" stroke="rgba(56,189,248,0.25)" strokeWidth="1" />
          <text x="178" y={85 + i * 30} fill="#38bdf8" fontSize="9" fontWeight="bold">Partition {i}</text>
          {[0, 1, 2, 3, 4].map(j => (
            <rect key={j} x={230 + j * 30} y={73 + i * 30} width="22" height="16" rx="2" fill={`rgba(56,189,248,${0.1 + j * 0.05})`} stroke="rgba(56,189,248,0.3)" strokeWidth="0.8" />
          ))}
          <text x="376" y={85 + i * 30} fill="#6b7280" fontSize="8">→ offset {i * 5}</text>
        </g>
      ))}
      {/* Consumer Groups */}
      <line x1="407" y1="95" x2="445" y2="95" stroke="#a78bfa" strokeWidth="1.5" markerEnd="url(#es2)" />
      <rect x="447" y="40" width="140" height="120" rx="9" fill="#120f1a" stroke="#a78bfa" strokeWidth="1.5" />
      <text x="517" y="62" textAnchor="middle" fill="#c4b5fd" fontSize="11" fontWeight="bold">Consumer Groups</text>
      {[
        { label: "Analytics", y: 72 },
        { label: "Alerting", y: 102 },
        { label: "Storage", y: 132 },
      ].map(({ label, y }) => (
        <g key={label}>
          <rect x="460" y={y} width="110" height="22" rx="4" fill="rgba(167,139,250,0.1)" stroke="rgba(167,139,250,0.3)" strokeWidth="1" />
          <text x="515" y={y + 14} textAnchor="middle" fill="#c4b5fd" fontSize="10">{label} Group</text>
        </g>
      ))}
      {/* Storage */}
      <rect x="600" y="70" width="108" height="50" rx="7" fill="#0a0f1a" stroke="#818cf8" strokeWidth="1.3" />
      <text x="654" y="89" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="bold">Storage</text>
      <text x="654" y="104" textAnchor="middle" fill="#9ca3af" fontSize="8.5">S3 / Elasticsearch</text>
      <line x1="587" y1="95" x2="598" y2="95" stroke="#818cf8" strokeWidth="1.2" markerEnd="url(#es2)" />
      <text x="360" y="178" textAnchor="middle" fill="#38bdf8" fontSize="10">Messages retained on disk — consumers read at their own pace (offset-based)</text>
    </svg>
  </div>
);

const DiagramDLQ = () => (
  <div style={{ background: "#0a0a12", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "0.8rem", padding: "1.5rem", marginBottom: "1rem" }}>
    <p style={{ textAlign: "center", color: "#a78bfa", fontWeight: 700, marginBottom: "1rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Retry Flow & Dead Letter Queue</p>
    <svg viewBox="0 0 720 190" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="d1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#a78bfa" /></marker>
        <marker id="d2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#f87171" /></marker>
        <marker id="d3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#fbbf24" /></marker>
        <marker id="d4" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#34d399" /></marker>
      </defs>
      {/* Main Queue */}
      <rect x="20" y="70" width="120" height="50" rx="8" fill="#1e1030" stroke="#a78bfa" strokeWidth="1.5" />
      <text x="80" y="90" textAnchor="middle" fill="#c4b5fd" fontSize="11" fontWeight="bold">Main Queue</text>
      <text x="80" y="106" textAnchor="middle" fill="#9ca3af" fontSize="9">SQS / RabbitMQ</text>
      <line x1="140" y1="95" x2="195" y2="95" stroke="#a78bfa" strokeWidth="1.5" markerEnd="url(#d1)" />
      {/* Consumer */}
      <rect x="197" y="70" width="120" height="50" rx="8" fill="#0f1a2e" stroke="#818cf8" strokeWidth="1.5" />
      <text x="257" y="90" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontWeight="bold">Consumer</text>
      <text x="257" y="106" textAnchor="middle" fill="#9ca3af" fontSize="9">Processes message</text>
      {/* Success path */}
      <line x1="317" y1="85" x2="390" y2="50" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#d4)" />
      <rect x="392" y="28" width="100" height="40" rx="7" fill="rgba(52,211,153,0.09)" stroke="#34d399" strokeWidth="1.3" />
      <text x="442" y="45" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">✅ Success</text>
      <text x="442" y="60" textAnchor="middle" fill="#9ca3af" fontSize="9">Ack → deleted</text>
      {/* Retry path */}
      <path d="M 257 120 Q 257 155 80 155 Q 80 140 80 120" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#d3)" />
      <text x="170" y="170" textAnchor="middle" fill="#fbbf24" fontSize="9">Retry (max 3×, exponential backoff)</text>
      {/* Failure → DLQ */}
      <line x1="317" y1="105" x2="390" y2="130" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#d2)" />
      <rect x="392" y="115" width="140" height="55" rx="8" fill="rgba(239,68,68,0.09)" stroke="#f87171" strokeWidth="1.8" />
      <text x="462" y="137" textAnchor="middle" fill="#f87171" fontSize="12" fontWeight="bold">Dead Letter Queue</text>
      <text x="462" y="152" textAnchor="middle" fill="#9ca3af" fontSize="9">Failed after max retries</text>
      <text x="462" y="163" textAnchor="middle" fill="#9ca3af" fontSize="8.5">Inspect / alert / reprocess</text>
      {/* Alert */}
      <line x1="532" y1="142" x2="590" y2="115" stroke="#f87171" strokeWidth="1.2" strokeDasharray="4,3" markerEnd="url(#d2)" />
      <rect x="592" y="92" width="115" height="55" rx="7" fill="rgba(239,68,68,0.07)" stroke="rgba(239,68,68,0.3)" strokeWidth="1" />
      <text x="649" y="113" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold">🚨 Alert</text>
      <text x="649" y="128" textAnchor="middle" fill="#9ca3af" fontSize="8.5">PagerDuty / Slack</text>
      <text x="649" y="140" textAnchor="middle" fill="#9ca3af" fontSize="8.5">Notify on-call</text>
    </svg>
  </div>
);

const DiagramBackpressure = () => (
  <div style={{ background: "#0a0a12", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "0.8rem", padding: "1.5rem", marginBottom: "1rem" }}>
    <p style={{ textAlign: "center", color: "#a78bfa", fontWeight: 700, marginBottom: "1rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Backpressure Scenario</p>
    <svg viewBox="0 0 720 175" style={{ width: "100%", height: "auto" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="bp1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#f87171" /></marker>
        <marker id="bp2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#34d399" /></marker>
      </defs>
      {/* Fast producer */}
      <rect x="15" y="62" width="110" height="52" rx="8" fill="#1a0808" stroke="#f87171" strokeWidth="2" />
      <text x="70" y="83" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="bold">Fast Producer</text>
      <text x="70" y="98" textAnchor="middle" fill="#9ca3af" fontSize="9">10,000 msgs/sec</text>
      <text x="70" y="110" textAnchor="middle" fill="#f87171" fontSize="8">🔥 Overloading</text>
      {/* Arrows – overload */}
      {[55, 75, 95].map((y, i) => <line key={i} x1="125" y1={y} x2="198" y2={88} stroke="#f87171" strokeWidth={i === 1 ? 2 : 1} markerEnd="url(#bp1)" />)}
      {/* Buffer / Queue overflowing */}
      <rect x="200" y="50" width="160" height="90" rx="10" fill="#1a0a0a" stroke="#f59e0b" strokeWidth="2" />
      <text x="280" y="75" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">Queue / Buffer</text>
      <text x="280" y="90" textAnchor="middle" fill="#f87171" fontSize="9">⚠️ OVERFLOWING</text>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <rect key={i} x={210 + i * 22} y="100" width="18" height="28" rx="3" fill={i < 5 ? "#f87171" : "#ef4444"} opacity={0.6 + i * 0.06} />
      ))}
      <text x="280" y="145" textAnchor="middle" fill="#f59e0b" fontSize="8.5">Queue filling up → memory pressure</text>
      {/* Solutions panel */}
      <rect x="380" y="20" width="320" height="140" rx="10" fill="rgba(52,211,153,0.05)" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />
      <text x="540" y="43" textAnchor="middle" fill="#34d399" fontSize="12" fontWeight="bold">Backpressure Techniques</text>
      {[
        { icon: "🚦", label: "Rate Limiting", desc: "Reject/delay producers > threshold", y: 60 },
        { icon: "🗂️", label: "Buffering", desc: "Absorb spikes; flush when idle", y: 90 },
        { icon: "🗑️", label: "Load Shedding", desc: "Drop low-priority msgs intentionally", y: 120 },
        { icon: "⏸️", label: "Consumer Feedback", desc: "Signal producer to slow down", y: 150 },
      ].map(({ icon, label, desc, y }) => (
        <g key={label}>
          <text x="395" y={y} fill="#34d399" fontSize="11">{icon} <tspan fill="#a5b4fc" fontWeight="bold">{label}</tspan> — <tspan fill="#9ca3af" fontSize="9.5">{desc}</tspan></text>
        </g>
      ))}
    </svg>
  </div>
);

// ─── Page Sections ─────────────────────────────────────────────────────────────

const Introduction = () => (
  <section>
    <SH title="Asynchronous Systems" icon="⚡" subtitle="From synchronous bottlenecks to resilient, decoupled architectures" />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
      <div style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "0.7rem", padding: "1.1rem" }}>
        <div style={{ color: "#f87171", fontWeight: 700, marginBottom: "0.6rem" }}>🔗 Synchronous (Blocking)</div>
        <p style={{ color: "#d1d5db", fontSize: "0.86rem", lineHeight: 1.7, margin: "0 0 0.5rem" }}>Caller waits for response. Simple, but creates tight coupling and cascading failures.</p>
        <CodeBlock language="python" code={`# Sync — caller BLOCKS until response
result = payment_service.charge(card, amount)
send_email(result)  # Only runs AFTER payment`} />
      </div>
      <div style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: "0.7rem", padding: "1.1rem" }}>
        <div style={{ color: "#34d399", fontWeight: 700, marginBottom: "0.6rem" }}>🔀 Asynchronous (Non-Blocking)</div>
        <p style={{ color: "#d1d5db", fontSize: "0.86rem", lineHeight: 1.7, margin: "0 0 0.5rem" }}>Caller fires and continues. Response handled later. Enables scale and resilience.</p>
        <CodeBlock language="python" code={`# Async — publish event, return immediately
queue.publish("payment.processed", { order_id })
return {"status": "processing"}  # Instant response
# Email service picks it up independently`} />
      </div>
    </div>
    <Table
      headers={["Dimension", "Synchronous", "Asynchronous"]}
      rows={[
        ["Coupling", "Tight — caller waits", "Loose — fire and forget"],
        ["Failure impact", "Cascades to caller instantly", "Isolated — retry independently"],
        ["Latency", "Sum of all service calls", "Constant — just enqueue"],
        ["Throughput", "Limited by slowest service", "High — queue absorbs spikes"],
        ["Complexity", "Simple to reason about", "Needs idempotency, DLQ, monitoring"],
        ["Use case", "Real-time reads, auth, payments", "Emails, notifications, video processing"],
      ]}
    />
    <Callout type="tip">Rule of thumb: if the user doesn't need the result <strong>right now</strong>, make it async. Video encoding, email sending, report generation — all ideal async candidates.</Callout>
  </section>
);

const MessageQueues = () => (
  <section>
    <SH title="Message Queues" icon="📬" subtitle="The backbone of decoupled, reliable async systems" />
    <InfoBox title="What is a Message Queue?">
      A message queue is a <strong style={{ color: "#a78bfa" }}>durable buffer</strong> that holds messages sent by producers until consumers are ready to process them. The queue acts as a middleman — producers and consumers never talk directly.
    </InfoBox>
    <DiagramQueueFlow />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
      <div style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: "0.7rem", padding: "1.1rem" }}>
        <div style={{ color: "#f87171", fontWeight: 700, marginBottom: "0.5rem" }}>🐇 RabbitMQ</div>
        <ul style={{ color: "#d1d5db", fontSize: "0.85rem", margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8 }}>
          <li>AMQP protocol — rich routing (exchanges, bindings)</li>
          <li>Per-message acknowledgment</li>
          <li>Supports priority queues, TTL per message</li>
          <li>Best for: task queues, job scheduling</li>
          <li>Used by: Reddit, GitHub Actions</li>
        </ul>
      </div>
      <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "0.7rem", padding: "1.1rem" }}>
        <div style={{ color: "#fbbf24", fontWeight: 700, marginBottom: "0.5rem" }}>☁️ AWS SQS</div>
        <ul style={{ color: "#d1d5db", fontSize: "0.85rem", margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8 }}>
          <li>Fully managed — zero ops overhead</li>
          <li>Standard queue (at-least-once) + FIFO (exactly-once)</li>
          <li>Built-in DLQ support, visibility timeout</li>
          <li>Best for: AWS-native microservices</li>
          <li>Used by: Netflix, Airbnb, Pinterest</li>
        </ul>
      </div>
    </div>
    <CodeBlock language="python" code={`import boto3

sqs = boto3.client('sqs')

# Producer — publish a job
sqs.send_message(
    QueueUrl='https://sqs.us-east-1.amazonaws.com/123/order-queue',
    MessageBody='{"order_id": "abc-123", "amount": 99.99}',
    MessageGroupId='payments'  # FIFO ordering
)

# Consumer — poll and process
while True:
    msgs = sqs.receive_message(QueueUrl=queue_url, MaxNumberOfMessages=10)
    for msg in msgs.get('Messages', []):
        process_order(json.loads(msg['Body']))
        sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=msg['ReceiptHandle'])
        # ✅ Only delete AFTER successful processing — at-least-once guarantee`} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.6rem", marginBottom: "1rem" }}>
      {[
        { icon: "🔌", label: "Decoupling", desc: "Services evolve independently. Add consumers without changing producers." },
        { icon: "📈", label: "Scalability", desc: "Add more consumers to scale processing horizontally." },
        { icon: "🛡️", label: "Reliability", desc: "Queue persists messages. Consumer crash doesn't lose data." },
      ].map(({ icon, label, desc }) => (
        <div key={label} style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: "0.65rem", padding: "0.9rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.3rem", marginBottom: "0.3rem" }}>{icon}</div>
          <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.83rem", marginBottom: "0.3rem" }}>{label}</div>
          <div style={{ color: "#9ca3af", fontSize: "0.78rem", lineHeight: 1.6 }}>{desc}</div>
        </div>
      ))}
    </div>
    <Callout type="warning">Message queues guarantee <strong>at-least-once delivery</strong> by default. Your consumers MUST be idempotent — the same message may arrive twice.</Callout>
  </section>
);

const PubSub = () => (
  <section>
    <SH title="Pub/Sub Systems" icon="📡" subtitle="Fan-out broadcasting to multiple independent subscribers" />
    <InfoBox title="Queue vs Pub/Sub — Key Difference">
      In a <strong style={{ color: "#38bdf8" }}>message queue</strong>, one consumer processes each message (competing consumers). In <strong style={{ color: "#fbbf24" }}>pub/sub</strong>, every subscriber gets a copy — it's a broadcast, not a handoff.
    </InfoBox>
    <DiagramPubSub />
    <Table
      headers={["Aspect", "Message Queue", "Pub/Sub"]}
      rows={[
        ["Delivery", "One consumer gets each message", "All subscribers get a copy"],
        ["Use case", "Task distribution, work queues", "Event broadcasting, notifications"],
        ["Coupling", "Producer knows queue name", "Publisher knows only topic"],
        ["Consumers", "Compete for messages", "All receive independently"],
        ["Examples", "RabbitMQ, SQS", "Kafka, SNS, Google Pub/Sub"],
        ["Scaling", "Add more consumers for throughput", "Each subscriber scales independently"],
      ]}
    />
    <p style={{ color: "#d1d5db", lineHeight: 1.75, marginBottom: "0.75rem" }}>Real-world pub/sub use cases:</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0.65rem", marginBottom: "1rem" }}>
      {[
        { company: "Uber", event: "trip.completed", subs: "Billing, Driver rating, Receipt email, Analytics" },
        { company: "Slack", event: "message.sent", subs: "Push notification, Email digest, Search index, Audit log" },
        { company: "Instagram", event: "post.uploaded", subs: "Feed fanout, Thumbnail gen, ML tagging, CDN push" },
      ].map(({ company, event, subs }) => (
        <div key={company} style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "0.65rem", padding: "0.9rem" }}>
          <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.3rem" }}>{company}</div>
          <div style={{ color: "#818cf8", fontSize: "0.78rem", marginBottom: "0.4rem", fontFamily: "monospace" }}>{event}</div>
          <div style={{ color: "#9ca3af", fontSize: "0.78rem", lineHeight: 1.6 }}>Subscribers: {subs}</div>
        </div>
      ))}
    </div>
    <Callout type="note">AWS SNS + SQS is the classic combo: SNS fans out to multiple SQS queues, each with independent consumers. This gives you pub/sub fan-out with queue-backed reliability.</Callout>
  </section>
);

const EventStreams = () => (
  <section>
    <SH title="Event Streaming" icon="🌊" subtitle="Continuous, ordered, replayable event logs at massive scale" />
    <InfoBox title="What is Event Streaming?">
      Unlike queues where messages are <em>consumed and deleted</em>, event streams <strong style={{ color: "#38bdf8" }}>persist events on disk</strong> for a configured period. Consumers track their position (offset) and can replay past events. Think of it as a <strong style={{ color: "#38bdf8" }}>distributed, append-only log</strong>.
    </InfoBox>
    <DiagramEventStream />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
      <div style={{ background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.25)", borderRadius: "0.7rem", padding: "1.1rem" }}>
        <div style={{ color: "#38bdf8", fontWeight: 700, marginBottom: "0.6rem" }}>⚡ Apache Kafka</div>
        <ul style={{ color: "#d1d5db", fontSize: "0.85rem", margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8 }}>
          <li>Partitioned topics for parallelism</li>
          <li>Messages retained for days/weeks</li>
          <li>Consumer groups track offsets independently</li>
          <li>Millions of msgs/sec throughput</li>
          <li>Used by: LinkedIn, Uber, Airbnb</li>
        </ul>
      </div>
      <div style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: "0.7rem", padding: "1.1rem" }}>
        <div style={{ color: "#a78bfa", fontWeight: 700, marginBottom: "0.6rem" }}>🔑 Key Kafka Concepts</div>
        <ul style={{ color: "#d1d5db", fontSize: "0.85rem", margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8 }}>
          <li><strong style={{ color: "#c4b5fd" }}>Topic:</strong> Named stream of events</li>
          <li><strong style={{ color: "#c4b5fd" }}>Partition:</strong> Ordered sub-log, enables parallelism</li>
          <li><strong style={{ color: "#c4b5fd" }}>Offset:</strong> Position of consumer in partition</li>
          <li><strong style={{ color: "#c4b5fd" }}>Consumer Group:</strong> Multiple consumers sharing load</li>
          <li><strong style={{ color: "#c4b5fd" }}>Replication:</strong> Partitions replicated across brokers</li>
        </ul>
      </div>
    </div>
    <CodeBlock language="python" code={`from confluent_kafka import Producer, Consumer

# Producer
producer = Producer({'bootstrap.servers': 'kafka:9092'})
producer.produce(
    topic='user-events',
    key=str(user_id),         # Same key → same partition → ordered
    value=json.dumps(event),
    on_delivery=delivery_callback
)
producer.flush()

# Consumer
consumer = Consumer({
    'bootstrap.servers': 'kafka:9092',
    'group.id': 'analytics-group',      # Shared offset tracking
    'auto.offset.reset': 'earliest'     # Replay from beginning if new group
})
consumer.subscribe(['user-events'])

while True:
    msg = consumer.poll(timeout=1.0)
    if msg and not msg.error():
        process_event(msg.value())
        consumer.commit()  # Commit offset after successful processing`} />
    <Callout type="tip">Kafka's killer feature is <strong>replayability</strong>. If you add a new analytics service, it can consume events from day 1 without any re-publishing. Queues can't do this.</Callout>
  </section>
);

const DeliveryGuarantees = () => (
  <section>
    <SH title="Delivery Guarantees" icon="🛡️" subtitle="The reliability spectrum every distributed system must choose from" />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
      {[
        { name: "At-Most-Once", icon: "1️⃣", color: "#f87171", desc: "Message delivered 0 or 1 times. No retries. May be lost.", tradeoff: "Lowest latency, but data loss possible.", example: "Metrics, heartbeats, UDP video frames" },
        { name: "At-Least-Once", icon: "🔁", color: "#fbbf24", desc: "Message delivered 1 or more times. Retried on failure. Duplicates possible.", tradeoff: "Reliable but requires idempotent consumers.", example: "Email notifications, order processing" },
        { name: "Exactly-Once", icon: "✅", color: "#34d399", desc: "Delivered exactly once. Complex distributed transactions required.", tradeoff: "Highest correctness, highest cost/complexity.", example: "Financial transactions, inventory deduction" },
      ].map(({ name, icon, color, desc, tradeoff, example }) => (
        <div key={name} style={{ background: `${color}0d`, border: `1px solid ${color}35`, borderRadius: "0.7rem", padding: "1.1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>{icon}</span>
            <strong style={{ color, fontSize: "0.9rem" }}>{name}</strong>
          </div>
          <p style={{ color: "#d1d5db", fontSize: "0.84rem", lineHeight: 1.65, margin: "0 0 0.5rem" }}>{desc}</p>
          <div style={{ color: "#9ca3af", fontSize: "0.8rem", marginBottom: "0.3rem" }}>⚖️ {tradeoff}</div>
          <div style={{ color: "#6b7280", fontSize: "0.78rem" }}>📌 {example}</div>
        </div>
      ))}
    </div>
    <Table
      headers={["Guarantee", "Reliability", "Complexity", "Latency", "Use Cases"]}
      rows={[
        ["At-Most-Once", "⚠️ May lose msgs", "Simple", "Lowest", "Metrics, logging, live video"],
        ["At-Least-Once", "✅ Never loses msgs", "Medium (idempotency)", "Low", "Emails, notifications, orders"],
        ["Exactly-Once", "✅ Perfect delivery", "High (2PC, transactions)", "Highest", "Payments, inventory, billing"],
      ]}
    />
    <InfoBox title="Exactly-Once in Kafka" accent="#34d399">
      Kafka achieves exactly-once via <strong>idempotent producers</strong> (dedup by sequence number) + <strong>transactional APIs</strong> (atomic produce + offset commit). Even then, it's exactly-once <em>within Kafka</em> — your downstream DB write must also be atomic.
    </InfoBox>
    <Callout type="danger">Exactly-once is expensive. Most systems use <strong>at-least-once + idempotent consumers</strong> — simpler, cheaper, and achieves the same correctness when done right.</Callout>
  </section>
);

const Idempotency = () => (
  <section>
    <SH title="Idempotency" icon="🔑" subtitle="The critical property that makes at-least-once delivery safe" />
    <InfoBox title="What is Idempotency?">
      An operation is <strong style={{ color: "#a78bfa" }}>idempotent</strong> if performing it multiple times produces the same result as performing it once. In distributed systems, <em>retries are unavoidable</em> — idempotency ensures retries don't cause double-effects.
    </InfoBox>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
      <div style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "0.7rem", padding: "1rem" }}>
        <div style={{ color: "#f87171", fontWeight: 700, marginBottom: "0.5rem" }}>❌ Not Idempotent</div>
        <CodeBlock language="python" code={`def charge_card(amount):
    db.insert("payments", {
        "amount": amount,
        "status": "charged"
    })
    # Retry → charges card TWICE! 💸`} />
      </div>
      <div style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "0.7rem", padding: "1rem" }}>
        <div style={{ color: "#34d399", fontWeight: 700, marginBottom: "0.5rem" }}>✅ Idempotent</div>
        <CodeBlock language="python" code={`def charge_card(amount, idempotency_key):
    existing = db.find("payments", key=idempotency_key)
    if existing:
        return existing  # Return cached result ✅

    result = stripe.charge(amount)
    db.insert("payments", {
        "idempotency_key": idempotency_key,
        "amount": amount, "result": result
    })
    return result  # Safe to retry!`} />
      </div>
    </div>
    <p style={{ color: "#a78bfa", fontWeight: 700, marginBottom: "0.5rem" }}>Real-World Idempotency Patterns</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "0.65rem", marginBottom: "1rem" }}>
      {[
        { title: "Idempotency Key", desc: "Client sends UUID with each request. Server checks if already processed. Stripe, PayPal use this.", color: "#a78bfa" },
        { title: "Deduplication Window", desc: "SQS MessageDeduplicationId — same ID within 5 min window is dropped.", color: "#38bdf8" },
        { title: "Conditional DB Write", desc: "INSERT ... ON CONFLICT DO NOTHING. DB-level uniqueness constraint as guard.", color: "#34d399" },
        { title: "Event Versioning", desc: "Each event has a version/sequence. Consumer skips if version already applied.", color: "#fbbf24" },
      ].map(({ title, desc, color }) => (
        <div key={title} style={{ background: `${color}0a`, border: `1px solid ${color}30`, borderRadius: "0.65rem", padding: "0.9rem" }}>
          <div style={{ color, fontWeight: 700, fontSize: "0.86rem", marginBottom: "0.35rem" }}>{title}</div>
          <div style={{ color: "#9ca3af", fontSize: "0.82rem", lineHeight: 1.6 }}>{desc}</div>
        </div>
      ))}
    </div>
    <Callout type="warning">HTTP <code>GET</code> and <code>DELETE</code> are naturally idempotent. <code>POST</code> is not — always add idempotency keys for payment, order, and notification endpoints.</Callout>
  </section>
);

const DLQ = () => (
  <section>
    <SH title="Dead Letter Queues" icon="💀" subtitle="Graceful failure handling — messages that can't be processed" />
    <p style={{ color: "#d1d5db", lineHeight: 1.75, marginBottom: "1rem" }}>
      A Dead Letter Queue (DLQ) captures messages that <strong style={{ color: "#f87171" }}>fail processing after the maximum retry count</strong>. Without DLQs, poison messages loop forever, blocking healthy processing.
    </p>
    <DiagramDLQ />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
      <InfoBox title="Why Messages Fail" accent="#f87171">
        <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8 }}>
          <li>Malformed/unexpected payload format</li>
          <li>Downstream service (DB, API) unavailable</li>
          <li>Business logic violation (insufficient funds)</li>
          <li>Timeout — processing takes too long</li>
          <li>Schema version mismatch</li>
        </ul>
      </InfoBox>
      <InfoBox title="DLQ Best Practices" accent="#34d399">
        <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8 }}>
          <li>Alert on DLQ depth (CloudWatch alarm)</li>
          <li>Store original message + error + timestamp</li>
          <li>Build tooling to reprocess from DLQ</li>
          <li>Use exponential backoff: 1s, 2s, 4s, 8s…</li>
          <li>Set max retries (3-5 is typical)</li>
        </ul>
      </InfoBox>
    </div>
    <CodeBlock language="python" code={`# AWS SQS — DLQ configuration
import boto3

sqs = boto3.client('sqs')

# Create main queue with DLQ attached
main_queue = sqs.create_queue(
    QueueName='order-processing',
    Attributes={
        'RedrivePolicy': json.dumps({
            'deadLetterTargetArn': dlq_arn,
            'maxReceiveCount': '3'  # Retry 3 times, then → DLQ
        }),
        'VisibilityTimeout': '30'   # 30s to process before re-queuing
    }
)

# Consumer with exponential backoff
def process_with_retry(message):
    for attempt in range(3):
        try:
            process_order(message)
            return  # Success — delete message
        except TransientError as e:
            wait = 2 ** attempt  # 1s, 2s, 4s
            time.sleep(wait)
    # All retries exhausted → SQS sends to DLQ automatically`} />
    <Callout type="tip">Monitor DLQ depth as a <strong>lagging indicator</strong> of system health. A growing DLQ means a bug or infrastructure issue needs attention — set alarms before it becomes an incident.</Callout>
  </section>
);

const Backpressure = () => (
  <section>
    <SH title="Backpressure Handling" icon="🌡️" subtitle="What happens when consumers can't keep up with producers" />
    <InfoBox title="What is Backpressure?">
      Backpressure occurs when a fast producer overwhelms a slow consumer, causing <strong style={{ color: "#f87171" }}>queue growth, memory exhaustion, and eventually system failure</strong>. It's the distributed systems equivalent of a traffic jam.
    </InfoBox>
    <DiagramBackpressure />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0.65rem", marginBottom: "1rem" }}>
      {[
        { icon: "🚦", title: "Rate Limiting", color: "#f87171", desc: "Cap how fast producers can send. Token bucket or leaky bucket algorithms. Producers get 429 when limit hit.", code: "# Token bucket\nif not bucket.consume(1):\n    raise TooManyRequests()" },
        { icon: "🗂️", title: "Buffering", color: "#fbbf24", desc: "Queue absorbs burst traffic temporarily. Works for short spikes but not sustained overload.", code: "# Bounded buffer\nif queue.size() > MAX:\n    raise BufferFull()" },
        { icon: "🗑️", title: "Load Shedding", color: "#a78bfa", desc: "Intentionally drop low-priority messages when overwhelmed. Better to drop some than lose all.", code: "# Priority-based shed\nif overloaded and msg.priority < 5:\n    metrics.increment('dropped')\n    return  # Skip it" },
        { icon: "📢", title: "Consumer Feedback", color: "#34d399", desc: "Consumer signals producer to slow down via reactive streams protocol (TCP back-pressure, gRPC flow control).", code: "# Reactive streams\nstream.request(n=10)  # Pull-based\n# Producer sends max 10 items" },
      ].map(({ icon, title, color, desc, code }) => (
        <div key={title} style={{ background: `${color}08`, border: `1px solid ${color}28`, borderRadius: "0.7rem", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.1rem" }}>{icon}</span>
            <strong style={{ color, fontSize: "0.88rem" }}>{title}</strong>
          </div>
          <p style={{ color: "#9ca3af", fontSize: "0.82rem", lineHeight: 1.6, margin: "0 0 0.6rem" }}>{desc}</p>
          <CodeBlock language="python" code={code} />
        </div>
      ))}
    </div>
    <Callout type="warning">Unbounded queues are dangerous. Always set a <strong>max queue size</strong>. An unbounded queue under load will consume all available memory and crash your entire service, not just the queue.</Callout>
  </section>
);

const InterviewSection = () => (
  <section>
    <SH title="Interview Deep Dive" icon="🎤" subtitle="How messaging systems appear in system design interviews" />
    {[
      {
        q: "When would you use a message queue vs pub/sub?",
        approach: [
          "Queue: each message processed by ONE consumer (task distribution, job queues)",
          "Pub/Sub: each message processed by MULTIPLE subscribers (event fanout, broadcasting)",
          "Queue example: order processing — only one worker should charge the card",
          "Pub/Sub example: user signup — email, analytics, onboarding ALL need to react",
          "Ask: 'Does every subscriber need the event, or just one worker?'",
        ],
        tradeoff: "Queues provide load balancing across consumers. Pub/Sub provides fanout to independent subscribers. Often combined: SNS (pub/sub) → multiple SQS queues (per subscriber with own processing)."
      },
      {
        q: "How do you handle duplicate messages in an async system?",
        approach: [
          "Acknowledge the problem: at-least-once delivery means duplicates are inevitable",
          "Idempotency key: unique ID per message, check DB before processing",
          "Database constraint: unique index as the final guard (INSERT ON CONFLICT DO NOTHING)",
          "Deduplication window: SQS FIFO 5-min dedup, Kafka producer dedup by sequence",
          "Design consumers to be naturally idempotent: SET rather than INCREMENT",
        ],
        tradeoff: "DB-level idempotency (unique constraint) is the most reliable but adds a DB read per message. For high-throughput systems, use in-memory dedup with a small time window + DB constraint as backup."
      },
      {
        q: "How would you design a reliable notification system for 100M users?",
        approach: [
          "Event published to Kafka topic 'notification.created'",
          "Consumer groups per channel: push, email, SMS — each scales independently",
          "At-least-once delivery with idempotent consumers (dedup by notification_id)",
          "DLQ for failed deliveries + retry with exponential backoff",
          "Rate limiting per user (no spam), per channel (SMS costs money)",
          "Delivery receipt tracking — mark as sent only when provider confirms",
        ],
        tradeoff: "Push notifications can lose messages if user device is offline → store undelivered in DB, deliver on reconnect. Email is async but expensive — batch where possible. SMS is expensive — use only for critical alerts."
      },
    ].map(({ q, approach, tradeoff }) => (
      <div key={q} style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "0.75rem", padding: "1.25rem", marginBottom: "1rem" }}>
        <div style={{ color: "#fbbf24", fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.95rem" }}>❓ {q}</div>
        <div style={{ color: "#a78bfa", fontWeight: 600, fontSize: "0.82rem", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>📋 Answer Approach</div>
        <ul style={{ margin: "0 0 0.75rem", paddingLeft: "1.3rem", color: "#d1d5db", fontSize: "0.88rem", lineHeight: 1.8 }}>
          {approach.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
        <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "0.5rem", padding: "0.75rem" }}>
          <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: "0.82rem" }}>⚖️ Trade-off: </span>
          <span style={{ color: "#d1d5db", fontSize: "0.87rem" }}>{tradeoff}</span>
        </div>
      </div>
    ))}
    <InfoBox title="Interview Signals That Impress" accent="#34d399">
      <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.85 }}>
        <li>Proactively mention <strong>idempotency</strong> — shows you understand async pitfalls</li>
        <li>Bring up <strong>DLQ and retry strategy</strong> — shows operational maturity</li>
        <li>Discuss <strong>monitoring</strong>: queue depth, DLQ depth, consumer lag metrics</li>
        <li>Mention <strong>ordering guarantees</strong> — Kafka partitions guarantee order per key</li>
        <li>Ask clarifying questions: "Do we need exactly-once or is at-least-once acceptable?"</li>
      </ul>
    </InfoBox>
  </section>
);

const CommonMistakes = () => (
  <section>
    <SH title="Common Mistakes" icon="⛔" subtitle="What separates junior from senior distributed systems engineers" />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "0.75rem" }}>
      {[
        { icon: "🔁", title: "Ignoring duplicate messages", color: "#f87171", desc: "Assuming at-least-once = exactly-once. In any async system with retries, duplicates will happen. Every consumer must handle them gracefully with idempotency." },
        { icon: "🚫", title: "Not handling processing failures", color: "#fb923c", desc: "No retry logic, no DLQ, no alerting on failures. A single bad message crashes the consumer, and it retries forever blocking the entire queue." },
        { icon: "📦", title: "Overusing queues for everything", color: "#fbbf24", desc: "Adding a queue between services that need real-time responses adds latency and complexity with no benefit. Auth, payment verification, and user-facing reads should stay synchronous." },
        { icon: "⏱️", title: "Not considering end-to-end latency", color: "#a78bfa", desc: "A queue adds latency. 'Async email' is fine — 'async fraud check before payment completes' is not. Always ask: can the user wait for this?" },
        { icon: "📊", title: "No consumer lag monitoring", color: "#38bdf8", desc: "Consumer lag (how far behind consumers are) is the most critical metric. A growing lag means consumers can't keep up — a backlog disaster is forming silently." },
        { icon: "🔑", title: "Missing message ordering requirements", color: "#34d399", desc: "Standard queues don't guarantee order. If 'account created' must process before 'account verified', you need FIFO queue or Kafka with a consistent partition key." },
      ].map(({ icon, title, color, desc }) => (
        <div key={title} style={{ background: `${color}08`, border: `1px solid ${color}30`, borderRadius: "0.7rem", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>{icon}</span>
            <strong style={{ color, fontSize: "0.88rem" }}>{title}</strong>
          </div>
          <p style={{ color: "#9ca3af", fontSize: "0.83rem", margin: 0, lineHeight: 1.65 }}>{desc}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── TOC ─────────────────────────────────────────────────────────────────────

const navSections = [
  { id: "intro", label: "Async Systems", icon: "⚡" },
  { id: "queues", label: "Message Queues", icon: "📬" },
  { id: "pubsub", label: "Pub/Sub", icon: "📡" },
  { id: "streams", label: "Event Streaming", icon: "🌊" },
  { id: "delivery", label: "Delivery Guarantees", icon: "🛡️" },
  { id: "idempotency", label: "Idempotency", icon: "🔑" },
  { id: "dlq", label: "Dead Letter Queues", icon: "💀" },
  { id: "backpressure", label: "Backpressure", icon: "🌡️" },
  { id: "interview", label: "Interview", icon: "🎤" },
  { id: "mistakes", label: "Mistakes", icon: "⛔" },
];

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function MessagingPage() {
  const [active, setActive] = useState("intro");

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); setActive(id); }
  };

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", background: "#060610", minHeight: "100vh", color: "#e2e8f0", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=Fira+Code:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a0a14; } ::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.3); border-radius: 3px; }
        section { scroll-margin-top: 80px; }
      `}</style>

      {/* Sidebar */}
      <aside style={{ width: "220px", flexShrink: 0, background: "#08080f", borderRight: "1px solid rgba(167,139,250,0.12)", padding: "2rem 0", position: "sticky", top: 0, height: "100vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ background: "rgba(167,139,250,0.15)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontSize: "0.75rem" }}>⚡</span>
            <span style={{ color: "#a78bfa", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Messaging</span>
          </div>
        </div>
        <nav style={{ flex: 1 }}>
          {navSections.map(({ id, label, icon }) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              width: "100%", textAlign: "left", padding: "0.6rem 1.25rem",
              background: active === id ? "rgba(167,139,250,0.12)" : "none",
              border: "none", borderLeft: `2px solid ${active === id ? "#a78bfa" : "transparent"}`,
              color: active === id ? "#c4b5fd" : "#6b7280", cursor: "pointer",
              fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem",
              transition: "all 0.15s", fontFamily: "inherit"
            }}>
              <span style={{ fontSize: "0.85rem" }}>{icon}</span> {label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(167,139,250,0.1)", marginTop: "auto" }}>
          <div style={{ fontSize: "0.72rem", color: "#4b5563", lineHeight: 1.6 }}>System Design<br /><span style={{ color: "#6d28d9" }}>HLD · Foundations</span></div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto", padding: "2.5rem 2.5rem 4rem" }}>
        {/* Hero */}
        <div style={{
          background: "linear-gradient(135deg,rgba(109,40,217,0.2) 0%,rgba(56,189,248,0.07) 60%,rgba(6,6,16,0) 100%)",
          border: "1px solid rgba(167,139,250,0.2)", borderRadius: "1rem",
          padding: "2rem 2.5rem", marginBottom: "2.5rem", position: "relative", overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", background: "radial-gradient(circle,rgba(56,189,248,0.1) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "2rem" }}>⚡</span>
            <h1 style={{
              margin: 0, fontSize: "2rem", fontWeight: 800,
              background: "linear-gradient(90deg,#a78bfa 0%,#38bdf8 60%,#818cf8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              fontFamily: "'Syne',sans-serif", letterSpacing: "-1px"
            }}>Messaging & Async Processing</h1>
          </div>
          <p style={{ margin: "0 0 1rem", color: "#9ca3af", fontSize: "0.95rem", maxWidth: "640px", lineHeight: 1.7 }}>
            From message queues to Kafka event streams — the complete guide to building decoupled, resilient, scalable async systems. Interview-ready, beginner to advanced.
          </p>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {["Beginner → Advanced", "Interview-Ready", "Diagrams Included", "Code Examples", "Real-World Systems"].map(tag => (
              <span key={tag} style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)", color: "#c4b5fd", borderRadius: "999px", padding: "0.25rem 0.75rem", fontSize: "0.75rem", fontWeight: 600 }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Content sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          <div id="intro"><Introduction /></div>
          <div id="queues"><MessageQueues /></div>
          <div id="pubsub"><PubSub /></div>
          <div id="streams"><EventStreams /></div>
          <div id="delivery"><DeliveryGuarantees /></div>
          <div id="idempotency"><Idempotency /></div>
          <div id="dlq"><DLQ /></div>
          <div id="backpressure"><Backpressure /></div>
          <div id="interview"><InterviewSection /></div>
          <div id="mistakes"><CommonMistakes /></div>
        </div>

        <div style={{ marginTop: "3rem", padding: "1.5rem", textAlign: "center", borderTop: "1px solid rgba(167,139,250,0.1)", color: "#4b5563", fontSize: "0.83rem" }}>
          System Design · HLD Foundations · Messaging & Async Processing — <span style={{ color: "#6d28d9" }}>Whizan</span>
        </div>
      </main>
    </div>
  );
}
