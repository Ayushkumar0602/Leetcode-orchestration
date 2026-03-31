import { useState } from "react";

// ─── Shared UI Primitives ────────────────────────────────────────────────────

const SH = ({ icon, title, subtitle }) => (
  <div style={{
    marginBottom: "2rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid rgba(167,139,250,0.2)"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
      {icon && <span style={{ fontSize: "1.4rem" }}>{icon}</span>}
      <h2 style={{
        margin: 0,
        fontSize: "1.55rem",
        fontWeight: 700,
        background: "linear-gradient(90deg, #a78bfa, #c4b5fd)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontFamily: "'Sora', sans-serif",
        letterSpacing: "-0.01em"
      }}>{title}</h2>
    </div>
    {subtitle && (
      <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.875rem", paddingLeft: icon ? "2rem" : "0" }}>
        {subtitle}
      </p>
    )}
  </div>
);

const InfoBox = ({ title, children, accent = "#a78bfa" }) => (
  <div style={{
    background: "rgba(167,139,250,0.06)",
    border: `1px solid ${accent}33`,
    borderLeft: `3px solid ${accent}`,
    borderRadius: "10px",
    padding: "1.1rem 1.3rem",
    marginBottom: "1rem"
  }}>
    {title && <div style={{ fontWeight: 700, color: accent, marginBottom: "0.4rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</div>}
    <div style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.7 }}>{children}</div>
  </div>
);

const Callout = ({ type = "tip", children }) => {
  const config = {
    tip: { icon: "💡", color: "#34d399", label: "TIP" },
    warning: { icon: "⚠️", color: "#fbbf24", label: "WARNING" },
    note: { icon: "📝", color: "#60a5fa", label: "NOTE" },
    danger: { icon: "🚨", color: "#f87171", label: "DANGER" },
    interview: { icon: "🎯", color: "#a78bfa", label: "INTERVIEW TIP" },
  };
  const c = config[type] || config.tip;
  return (
    <div style={{
      background: `${c.color}0d`,
      border: `1px solid ${c.color}33`,
      borderLeft: `3px solid ${c.color}`,
      borderRadius: "8px",
      padding: "0.9rem 1.1rem",
      marginBottom: "1rem",
      display: "flex",
      gap: "0.7rem",
      alignItems: "flex-start"
    }}>
      <span style={{ fontSize: "1rem", marginTop: "0.05rem" }}>{c.icon}</span>
      <div>
        <span style={{ fontWeight: 700, color: c.color, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.25rem" }}>{c.label}</span>
        <div style={{ color: "#cbd5e1", fontSize: "0.875rem", lineHeight: 1.65 }}>{children}</div>
      </div>
    </div>
  );
};

const CodeBlock = ({ code, lang = "text" }) => (
  <div style={{
    background: "#0d1117",
    border: "1px solid rgba(167,139,250,0.15)",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "1rem"
  }}>
    <div style={{
      background: "rgba(167,139,250,0.08)",
      padding: "0.4rem 1rem",
      fontSize: "0.72rem",
      color: "#a78bfa",
      fontFamily: "monospace",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      borderBottom: "1px solid rgba(167,139,250,0.1)"
    }}>{lang}</div>
    <pre style={{ margin: 0, padding: "1rem 1.2rem", overflowX: "auto" }}>
      <code style={{ color: "#e2e8f0", fontSize: "0.83rem", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", lineHeight: 1.7 }}>
        {code}
      </code>
    </pre>
  </div>
);

const Table = ({ headers, rows }) => (
  <div style={{ overflowX: "auto", marginBottom: "1.2rem", borderRadius: "10px", border: "1px solid rgba(167,139,250,0.15)" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
      <thead>
        <tr style={{ background: "rgba(167,139,250,0.12)" }}>
          {headers.map((h, i) => (
            <th key={i} style={{
              padding: "0.75rem 1rem",
              textAlign: "left",
              color: "#a78bfa",
              fontWeight: 700,
              fontFamily: "'Sora', sans-serif",
              fontSize: "0.78rem",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              borderBottom: "1px solid rgba(167,139,250,0.2)"
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{
            background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
            transition: "background 0.15s"
          }}>
            {row.map((cell, j) => (
              <td key={j} style={{
                padding: "0.7rem 1rem",
                color: j === 0 ? "#e2e8f0" : "#94a3b8",
                fontWeight: j === 0 ? 600 : 400,
                borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                lineHeight: 1.5
              }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Diagram Components ──────────────────────────────────────────────────────

const ClientServerDiagram = () => (
  <div style={{
    background: "#0d1117",
    border: "1px solid rgba(167,139,250,0.2)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.2rem",
    overflowX: "auto"
  }}>
    <div style={{ fontSize: "0.72rem", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2rem", fontFamily: "monospace" }}>Client → Server → DB Flow</div>
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap", minWidth: "500px" }}>
      {[
        { label: "Client", sub: "Browser / App", color: "#60a5fa" },
        null,
        { label: "API Gateway", sub: "Auth + Rate Limit", color: "#a78bfa" },
        null,
        { label: "Server", sub: "Business Logic", color: "#34d399" },
        null,
        { label: "Database", sub: "PostgreSQL / Redis", color: "#fbbf24" }
      ].map((node, i) =>
        node === null ? (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <div style={{ color: "#475569", fontSize: "1.2rem" }}>→</div>
            <div style={{ color: "#475569", fontSize: "0.6rem" }}>HTTP/TCP</div>
          </div>
        ) : (
          <div key={i} style={{
            background: `${node.color}15`,
            border: `1px solid ${node.color}44`,
            borderRadius: "8px",
            padding: "0.6rem 0.9rem",
            textAlign: "center",
            minWidth: "90px"
          }}>
            <div style={{ color: node.color, fontWeight: 700, fontSize: "0.82rem" }}>{node.label}</div>
            <div style={{ color: "#64748b", fontSize: "0.68rem", marginTop: "2px" }}>{node.sub}</div>
          </div>
        )
      )}
    </div>
  </div>
);

const HTTPLifecycleDiagram = () => {
  const steps = [
    { step: "1", label: "DNS Lookup", desc: "Resolve domain → IP", color: "#60a5fa" },
    { step: "2", label: "TCP Handshake", desc: "SYN → SYN-ACK → ACK", color: "#a78bfa" },
    { step: "3", label: "TLS Handshake", desc: "Certificate + Key exchange (HTTPS)", color: "#c4b5fd" },
    { step: "4", label: "HTTP Request", desc: "GET /api/data HTTP/1.1", color: "#34d399" },
    { step: "5", label: "Server Processing", desc: "Auth → Logic → DB Query", color: "#fbbf24" },
    { step: "6", label: "HTTP Response", desc: "200 OK + JSON body", color: "#f472b6" },
    { step: "7", label: "Connection Close / Keep-Alive", desc: "Reuse or teardown", color: "#94a3b8" },
  ];
  return (
    <div style={{ background: "#0d1117", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.2rem" }}>
      <div style={{ fontSize: "0.72rem", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2rem", fontFamily: "monospace" }}>HTTP Request Lifecycle</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "50%",
              background: `${s.color}22`, border: `1px solid ${s.color}66`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: s.color, fontSize: "0.7rem", fontWeight: 700, flexShrink: 0
            }}>{s.step}</div>
            {i < steps.length - 1 && (
              <div style={{ position: "absolute", left: "calc(1.5rem + 12px)", marginTop: "24px", width: "1px", height: "0.5rem", background: "#334155" }} />
            )}
            <div>
              <span style={{ color: s.color, fontWeight: 600, fontSize: "0.82rem" }}>{s.label}</span>
              <span style={{ color: "#64748b", fontSize: "0.78rem", marginLeft: "0.5rem" }}>— {s.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WebSocketDiagram = () => (
  <div style={{ background: "#0d1117", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.2rem" }}>
    <div style={{ fontSize: "0.72rem", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2rem", fontFamily: "monospace" }}>WebSocket vs HTTP Connection Model</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
      <div>
        <div style={{ color: "#f87171", fontWeight: 700, fontSize: "0.8rem", marginBottom: "0.6rem" }}>HTTP (Request-Response)</div>
        {["Client → Request →", "← Response ← Server", "(Connection Closed)", "Client → Request →", "← Response ← Server", "(Connection Closed)"].map((l, i) => (
          <div key={i} style={{ color: i % 3 === 2 ? "#475569" : i % 2 === 0 ? "#60a5fa" : "#34d399", fontSize: "0.78rem", fontFamily: "monospace", lineHeight: "1.8" }}>{l}</div>
        ))}
      </div>
      <div>
        <div style={{ color: "#34d399", fontWeight: 700, fontSize: "0.8rem", marginBottom: "0.6rem" }}>WebSocket (Persistent)</div>
        {["Client ⟷ Handshake ⟷ Server", "Client → msg1 →", "← msg2 ← Server", "Client → msg3 →", "← msg4 ← Server", "(Persistent Channel)"].map((l, i) => (
          <div key={i} style={{ color: i === 0 ? "#a78bfa" : i % 2 === 1 ? "#60a5fa" : "#34d399", fontSize: "0.78rem", fontFamily: "monospace", lineHeight: "1.8" }}>{l}</div>
        ))}
      </div>
    </div>
  </div>
);

const LoadBalancerDiagram = () => (
  <div style={{ background: "#0d1117", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.2rem" }}>
    <div style={{ fontSize: "0.72rem", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2rem", fontFamily: "monospace" }}>Load Balancer Distribution</div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap" }}>
      <div style={{ background: "#60a5fa15", border: "1px solid #60a5fa44", borderRadius: "8px", padding: "0.8rem 1.2rem", textAlign: "center" }}>
        <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: "0.85rem" }}>Clients</div>
        <div style={{ color: "#64748b", fontSize: "0.7rem" }}>N requests</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
        <div style={{ color: "#475569", fontSize: "1.1rem" }}>→</div>
      </div>
      <div style={{ background: "#a78bfa15", border: "2px solid #a78bfa55", borderRadius: "8px", padding: "0.8rem 1.2rem", textAlign: "center", boxShadow: "0 0 16px #a78bfa22" }}>
        <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.85rem" }}>Load Balancer</div>
        <div style={{ color: "#64748b", fontSize: "0.7rem" }}>Route / Health Check</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {["Server 1", "Server 2", "Server 3"].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ color: "#475569", fontSize: "0.9rem" }}>→</div>
            <div style={{ background: "#34d39915", border: "1px solid #34d39944", borderRadius: "6px", padding: "0.4rem 0.8rem", color: "#34d399", fontSize: "0.78rem", fontWeight: 600 }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ConsistentHashingDiagram = () => {
  const nodes = [
    { label: "S1", angle: 0, color: "#60a5fa" },
    { label: "S2", angle: 120, color: "#a78bfa" },
    { label: "S3", angle: 240, color: "#34d399" },
  ];
  const keys = [
    { label: "K1", angle: 40, color: "#fbbf24" },
    { label: "K2", angle: 150, color: "#f472b6" },
    { label: "K3", angle: 280, color: "#fb923c" },
  ];
  const r = 70, cx = 100, cy = 100;
  return (
    <div style={{ background: "#0d1117", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.2rem" }}>
      <div style={{ fontSize: "0.72rem", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem", fontFamily: "monospace" }}>Consistent Hashing Ring</div>
      <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
        <svg viewBox="0 0 200 200" width="180" height="180">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="2" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#a78bfa22" strokeWidth="16" />
          {nodes.map((n, i) => {
            const rad = (n.angle - 90) * Math.PI / 180;
            const x = cx + r * Math.cos(rad), y = cy + r * Math.sin(rad);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={10} fill={`${n.color}22`} stroke={n.color} strokeWidth="1.5" />
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill={n.color} fontSize="7" fontWeight="bold">{n.label}</text>
              </g>
            );
          })}
          {keys.map((k, i) => {
            const rad = (k.angle - 90) * Math.PI / 180;
            const x = cx + r * Math.cos(rad), y = cy + r * Math.sin(rad);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={6} fill={`${k.color}33`} stroke={k.color} strokeWidth="1" strokeDasharray="2,1" />
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill={k.color} fontSize="5.5">{k.label}</text>
              </g>
            );
          })}
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="8">Hash Ring</text>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#94a3b8", fontSize: "0.82rem", lineHeight: 1.8 }}>
            <div style={{ color: "#a78bfa", fontWeight: 700, marginBottom: "0.4rem" }}>How it works:</div>
            <div>• Servers (S1,S2,S3) are placed on a virtual ring</div>
            <div>• Keys are hashed to positions on the ring</div>
            <div>• Each key maps to the next server clockwise</div>
            <div>• Adding/removing a server only remaps a small fraction of keys</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RESTvsGraphQLDiagram = () => (
  <div style={{ background: "#0d1117", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.2rem" }}>
    <div style={{ fontSize: "0.72rem", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem", fontFamily: "monospace" }}>REST vs GraphQL Request Flow</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
      <div>
        <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.6rem" }}>REST — Multiple Trips</div>
        {[
          "GET /users/123",
          "← { id, name, email, address, ... }",
          "GET /users/123/posts",
          "← [{ id, title, body, tags, ... }]",
          "GET /users/123/followers",
          "← [{ id, name, ... }]",
        ].map((l, i) => (
          <div key={i} style={{ color: i % 2 === 0 ? "#60a5fa" : "#94a3b8", fontSize: "0.73rem", fontFamily: "monospace", lineHeight: "1.9" }}>{l}</div>
        ))}
        <div style={{ color: "#f87171", fontSize: "0.72rem", marginTop: "0.4rem" }}>⚠ 3 round trips, overfetching</div>
      </div>
      <div>
        <div style={{ color: "#34d399", fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.6rem" }}>GraphQL — Single Trip</div>
        <div style={{ color: "#34d399", fontSize: "0.73rem", fontFamily: "monospace", lineHeight: "1.9" }}>
          POST /graphql<br />
          query {'{'}<br />
          &nbsp; user(id: 123) {'{'}<br />
          &nbsp;&nbsp; name<br />
          &nbsp;&nbsp; posts {'{'} title {'}'}<br />
          &nbsp;&nbsp; followers {'{'} name {'}'}<br />
          &nbsp; {'}'}<br />
          {'}'}
        </div>
        <div style={{ color: "#34d399", fontSize: "0.72rem", marginTop: "0.4rem" }}>✓ 1 round trip, exact data</div>
      </div>
    </div>
  </div>
);

// ─── Section Components ──────────────────────────────────────────────────────

const Section = ({ children, id }) => (
  <section id={id} style={{ marginBottom: "3rem" }}>{children}</section>
);

const Badge = ({ children, color = "#a78bfa" }) => (
  <span style={{
    background: `${color}18`, border: `1px solid ${color}44`, color,
    borderRadius: "4px", padding: "0.15rem 0.5rem", fontSize: "0.72rem",
    fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.04em", marginRight: "0.3rem"
  }}>{children}</span>
);

const TwoCol = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
    {children}
  </div>
);

const Card = ({ title, icon, color = "#a78bfa", children }) => (
  <div style={{
    background: "rgba(255,255,255,0.025)",
    border: `1px solid ${color}33`,
    borderRadius: "12px",
    padding: "1.2rem"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
      {icon && <span style={{ fontSize: "1.1rem" }}>{icon}</span>}
      <span style={{ fontWeight: 700, color, fontSize: "0.95rem" }}>{title}</span>
    </div>
    <div style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.7 }}>{children}</div>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function NetworkingCommunication() {
  const [activeTab, setActiveTab] = useState("rest");

  return (
    <div style={{
      fontFamily: "'Sora', 'Inter', sans-serif",
      background: "#080b14",
      color: "#e2e8f0",
      minHeight: "100vh",
      padding: "2rem",
      maxWidth: "900px",
      margin: "0 auto",
      lineHeight: 1.6
    }}>
      {/* Page Header */}
      <div style={{
        marginBottom: "3rem",
        padding: "2rem",
        background: "linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(96,165,250,0.04) 100%)",
        borderRadius: "16px",
        border: "1px solid rgba(167,139,250,0.15)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "200px", height: "200px",
          background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#a78bfa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            System Design › HLD › Networking
          </span>
        </div>
        <h1 style={{
          margin: "0 0 0.6rem",
          fontSize: "2.2rem",
          fontWeight: 800,
          background: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.2
        }}>Networking & Communication</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", maxWidth: "600px" }}>
          Deep dive into protocols, APIs, real-time communication, and load balancing — from fundamentals to interview-ready concepts.
        </p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["HTTP/HTTPS", "REST · GraphQL · gRPC", "WebSockets", "TCP vs UDP", "API Gateway", "Load Balancing"].map(t => (
            <span key={t} style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "20px", padding: "0.25rem 0.75rem", fontSize: "0.75rem", color: "#c4b5fd" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Section 1: Introduction ── */}
      <Section id="intro">
        <SH icon="🌐" title="Introduction to Networking in System Design" subtitle="Why protocols and communication patterns are the backbone of distributed systems" />
        <InfoBox title="Core Idea">
          In distributed systems, components running on different machines must communicate reliably. The choice of protocol, communication pattern, and transport layer directly impacts <strong style={{ color: "#a78bfa" }}>latency, scalability, reliability, and developer experience</strong>.
        </InfoBox>
        <ClientServerDiagram />
        <TwoCol>
          <Card icon="🖥️" title="Client-Server Model" color="#60a5fa">
            The most common pattern. A <strong style={{ color: "#e2e8f0" }}>client</strong> initiates requests; a <strong style={{ color: "#e2e8f0" }}>server</strong> processes and responds. This separation enables independent scaling and maintenance.
          </Card>
          <Card icon="⚙️" title="Why Protocols Matter" color="#a78bfa">
            Protocols define the <strong style={{ color: "#e2e8f0" }}>language</strong> two systems speak. Choosing the wrong one means wasted bandwidth, increased latency, complex debugging, or broken real-time guarantees.
          </Card>
        </TwoCol>
        <Callout type="interview">
          Interviewers often start with "How would clients talk to your backend?" — know when to pick REST, WebSockets, or gRPC before the deep dive.
        </Callout>
      </Section>

      {/* ── Section 2: HTTP/HTTPS ── */}
      <Section id="http">
        <SH icon="🔒" title="HTTP / HTTPS" subtitle="The foundation of data communication on the web" />
        <InfoBox title="What is HTTP?">
          <strong>HTTP (HyperText Transfer Protocol)</strong> is an <em>application-layer</em> protocol built on TCP. It follows a simple <strong style={{ color: "#a78bfa" }}>request-response</strong> cycle — the client sends a request, the server responds, and the connection is typically closed (or reused with Keep-Alive).
        </InfoBox>
        <HTTPLifecycleDiagram />
        <TwoCol>
          <Card icon="📦" title="Stateless Nature" color="#fbbf24">
            Each HTTP request is independent. The server does <strong style={{ color: "#e2e8f0" }}>not remember</strong> previous interactions. State is managed externally via cookies, sessions, or tokens (JWT). This enables horizontal scaling.
          </Card>
          <Card icon="🔐" title="HTTPS & TLS" color="#34d399">
            HTTPS wraps HTTP in <strong style={{ color: "#e2e8f0" }}>TLS (Transport Layer Security)</strong>. It provides: <em>Encryption</em> (data unreadable in transit), <em>Authentication</em> (server identity via certificate), and <em>Integrity</em> (data not tampered).
          </Card>
        </TwoCol>
        <CodeBlock lang="HTTP — Request & Response" code={`// HTTP Request
GET /api/users/123 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGci...
Accept: application/json

// HTTP Response
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=3600

{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com"
}`} />
        <Table
          headers={["Method", "Purpose", "Idempotent", "Body"]}
          rows={[
            ["GET", "Retrieve a resource", "✅ Yes", "❌ No"],
            ["POST", "Create a resource", "❌ No", "✅ Yes"],
            ["PUT", "Replace a resource", "✅ Yes", "✅ Yes"],
            ["PATCH", "Partial update", "❌ No", "✅ Yes"],
            ["DELETE", "Remove a resource", "✅ Yes", "❌ No"],
          ]}
        />
        <Callout type="tip">
          <strong>HTTP/2</strong> introduced multiplexing (multiple requests on one TCP connection), header compression, and server push. <strong>HTTP/3</strong> uses QUIC (UDP-based) for even lower latency — critical for mobile networks.
        </Callout>
        <Callout type="note">
          Idempotency matters in distributed systems. Network failures mean requests might be retried — only idempotent operations are safe to retry without side effects.
        </Callout>
      </Section>

      {/* ── Section 3: REST vs GraphQL vs gRPC ── */}
      <Section id="api-styles">
        <SH icon="⚡" title="REST vs GraphQL vs gRPC" subtitle="Three API paradigms — choose based on your use case" />
        <RESTvsGraphQLDiagram />

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.2rem", background: "#0d1117", borderRadius: "10px", padding: "4px", border: "1px solid rgba(167,139,250,0.15)" }}>
          {[
            { id: "rest", label: "REST", color: "#60a5fa" },
            { id: "graphql", label: "GraphQL", color: "#f472b6" },
            { id: "grpc", label: "gRPC", color: "#34d399" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "0.5rem",
                border: "none",
                borderRadius: "7px",
                background: activeTab === tab.id ? `${tab.color}18` : "transparent",
                color: activeTab === tab.id ? tab.color : "#64748b",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.85rem",
                fontFamily: "'Sora', sans-serif",
                outline: activeTab === tab.id ? `1px solid ${tab.color}44` : "none",
                transition: "all 0.15s"
              }}
            >{tab.label}</button>
          ))}
        </div>

        {activeTab === "rest" && (
          <div>
            <InfoBox title="REST — Representational State Transfer" accent="#60a5fa">
              REST is an <strong>architectural style</strong> (not a protocol) that uses standard HTTP methods to operate on resources identified by URLs. It is stateless, cacheable, and the most widely adopted API style.
            </InfoBox>
            <CodeBlock lang="REST API Design" code={`// Resource-based URLs
GET    /users          → list users
GET    /users/:id      → get user
POST   /users          → create user
PUT    /users/:id      → update user
DELETE /users/:id      → delete user

// Nested resources
GET /users/:id/posts   → get user's posts

// Filtering & pagination
GET /posts?tag=nodejs&page=2&limit=20`} />
            <TwoCol>
              <Card icon="✅" title="REST Pros" color="#34d399">
                Simple and universally understood · Uses standard HTTP (caching, browser support) · Stateless = easy horizontal scaling · Wide tooling support
              </Card>
              <Card icon="⚠️" title="REST Cons" color="#f87171">
                Overfetching (getting more data than needed) · Underfetching (needing multiple requests) · No strict schema enforcement · Versioning is complex
              </Card>
            </TwoCol>
          </div>
        )}

        {activeTab === "graphql" && (
          <div>
            <InfoBox title="GraphQL — Query Language for APIs" accent="#f472b6">
              GraphQL lets clients <strong>request exactly the data they need</strong> in a single request. Facebook created it to solve mobile performance problems caused by REST overfetching.
            </InfoBox>
            <CodeBlock lang="GraphQL Query vs Mutation" code={`# Query — fetch specific fields only
query GetUserProfile($id: ID!) {
  user(id: $id) {
    name
    email
    posts(last: 5) {
      title
      publishedAt
    }
    # followers count only — not full objects
    followersCount
  }
}

# Mutation — write operation
mutation UpdateBio($id: ID!, $bio: String!) {
  updateUser(id: $id, bio: $bio) {
    id
    bio
    updatedAt
  }
}`} />
            <TwoCol>
              <Card icon="✅" title="GraphQL Pros" color="#34d399">
                No overfetching/underfetching · Single endpoint · Strongly typed schema · Introspection and auto-docs · Great for complex frontends
              </Card>
              <Card icon="⚠️" title="GraphQL Cons" color="#f87171">
                Complex caching (no GET requests) · N+1 query problem (requires DataLoader) · Overkill for simple CRUD · Steeper learning curve · Security risks with unbounded queries
              </Card>
            </TwoCol>
            <Callout type="warning">
              The N+1 problem: querying a list of 100 users where each user has posts can trigger 101 DB queries. Use <strong>DataLoader</strong> to batch and cache these.
            </Callout>
          </div>
        )}

        {activeTab === "grpc" && (
          <div>
            <InfoBox title="gRPC — Google Remote Procedure Call" accent="#34d399">
              gRPC uses <strong>Protocol Buffers (protobuf)</strong> as its IDL and serialization format, and runs over HTTP/2. It's designed for <strong>high-performance, low-latency</strong> service-to-service communication.
            </InfoBox>
            <CodeBlock lang="gRPC — .proto Definition" code={`// Define your service contract in .proto
syntax = "proto3";

service UserService {
  rpc GetUser (UserRequest) returns (UserResponse);
  rpc StreamUpdates (UserRequest) returns (stream UserEvent);
}

message UserRequest {
  int32 id = 1;
}

message UserResponse {
  int32 id = 1;
  string name = 2;
  string email = 3;
}

// Generated code handles serialization/deserialization
// in any supported language (Go, Java, Python, etc.)`} />
            <TwoCol>
              <Card icon="✅" title="gRPC Pros" color="#34d399">
                ~5-10x faster than REST+JSON (binary protobuf) · Streaming support (client, server, bidirectional) · Strongly typed contracts · HTTP/2 multiplexing · Code generation
              </Card>
              <Card icon="⚠️" title="gRPC Cons" color="#f87171">
                Not human-readable (binary) · Limited browser support (requires grpc-web proxy) · Requires proto schema management · Harder to debug with curl/Postman
              </Card>
            </TwoCol>
          </div>
        )}

        <Table
          headers={["Feature", "REST", "GraphQL", "gRPC"]}
          rows={[
            ["Protocol", "HTTP/1.1+", "HTTP", "HTTP/2"],
            ["Data Format", "JSON/XML", "JSON", "Protobuf (binary)"],
            ["Performance", "Medium", "Medium", "🔥 High"],
            ["Flexibility", "Low-Medium", "🔥 Very High", "Low"],
            ["Browser Support", "✅ Full", "✅ Full", "⚠️ Via proxy"],
            ["Schema", "Optional (OpenAPI)", "Required (SDL)", "Required (.proto)"],
            ["Streaming", "❌ No", "✅ Subscriptions", "✅ Native"],
            ["Best For", "Public APIs, CRUD", "Complex frontends, mobile", "Microservices, internal RPC"],
            ["Caching", "✅ Easy (HTTP)", "⚠️ Complex", "⚠️ Manual"],
          ]}
        />
      </Section>

      {/* ── Section 4: WebSockets & Long Polling ── */}
      <Section id="realtime">
        <SH icon="⚡" title="WebSockets & Real-Time Communication" subtitle="When request-response isn't enough — persistent, bidirectional channels" />
        <WebSocketDiagram />
        <TwoCol>
          <Card icon="🔌" title="WebSockets" color="#34d399">
            Establishes a <strong style={{ color: "#e2e8f0" }}>persistent, full-duplex TCP connection</strong>. After an HTTP upgrade handshake, either side can push data at any time — no polling needed.
            <br /><br />
            <Badge color="#34d399">Use for</Badge> chat, live scores, collaborative editing, trading dashboards
          </Card>
          <Card icon="🔄" title="Long Polling" color="#fbbf24">
            Client makes an HTTP request; server <strong style={{ color: "#e2e8f0" }}>holds it open</strong> until data is available, then responds. Client immediately makes a new request. Simulates real-time over HTTP.
            <br /><br />
            <Badge color="#fbbf24">Use for</Badge> simple notifications, fallback for no WebSocket support
          </Card>
        </TwoCol>
        <CodeBlock lang="WebSocket — Client Side (JavaScript)" code={`const ws = new WebSocket("wss://chat.example.com/room/42");

ws.onopen = () => {
  console.log("Connected!");
  ws.send(JSON.stringify({ type: "join", userId: "alice" }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  renderMessage(message); // render in UI
};

ws.onerror = (err) => console.error("WS Error:", err);

// Server can push at any time — no polling!
// ws.send() from server side triggers ws.onmessage here`} />
        <Table
          headers={["Strategy", "Connection", "Latency", "Server Load", "Complexity", "Best For"]}
          rows={[
            ["Short Polling", "New HTTP each interval", "High (delays)", "High (many requests)", "Low", "Simple, infrequent updates"],
            ["Long Polling", "HTTP held open", "Medium", "Medium", "Medium", "Compatibility fallback"],
            ["WebSockets", "Persistent TCP", "🔥 Very Low", "Low (one connection)", "Medium", "Chat, live data, gaming"],
            ["Server-Sent Events", "HTTP stream (one-way)", "Low", "Low", "Low", "Feeds, notifications (server→client only)"],
          ]}
        />
        <Callout type="interview">
          If asked "How would you build a chat app?" — answer: WebSockets for real-time messaging, with a fallback to long polling. Mention handling reconnection logic, heartbeats, and horizontal scaling via pub/sub (Redis).
        </Callout>
        <Callout type="warning">
          WebSockets are stateful — they break horizontal scaling. Use a <strong>pub/sub system (Redis Pub/Sub, Kafka)</strong> so any server instance can receive and forward messages to the right WebSocket connection.
        </Callout>
      </Section>

      {/* ── Section 5: TCP vs UDP ── */}
      <Section id="transport">
        <SH icon="🔗" title="TCP vs UDP" subtitle="Transport layer protocols — reliability vs speed trade-offs" />
        <TwoCol>
          <Card icon="✅" title="TCP — Transmission Control Protocol" color="#60a5fa">
            <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem" }}>
              <li>Connection-oriented (3-way handshake)</li>
              <li>Guaranteed delivery (ACKs + retransmission)</li>
              <li>Ordered packets</li>
              <li>Flow control & congestion control</li>
              <li>Slower due to overhead</li>
            </ul>
          </Card>
          <Card icon="⚡" title="UDP — User Datagram Protocol" color="#f472b6">
            <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem" }}>
              <li>Connectionless — no handshake</li>
              <li>No delivery guarantee (fire and forget)</li>
              <li>No ordering — packets may arrive out of order</li>
              <li>No congestion control</li>
              <li>Much faster, lower overhead</li>
            </ul>
          </Card>
        </TwoCol>
        <CodeBlock lang="TCP 3-Way Handshake" code={`Client                       Server
  |                             |
  |------- SYN (seq=x) -------->|   Step 1: Client wants to connect
  |                             |
  |<-- SYN-ACK (seq=y, ack=x+1)|   Step 2: Server acknowledges
  |                             |
  |------- ACK (ack=y+1) ------>|   Step 3: Client confirms
  |                             |
  |<===== Data Transfer =======>|   Connection established!
  |                             |`} />
        <Table
          headers={["Property", "TCP", "UDP"]}
          rows={[
            ["Connection", "Connection-oriented", "Connectionless"],
            ["Reliability", "✅ Guaranteed delivery", "❌ Best effort"],
            ["Order", "✅ Guaranteed", "❌ Not guaranteed"],
            ["Speed", "Slower (overhead)", "🔥 Faster"],
            ["Error Checking", "✅ Built-in", "⚠️ Checksum only"],
            ["Use Cases", "HTTP, email, file transfer, DBs", "DNS, video streaming, gaming, VoIP"],
            ["Header Size", "20-60 bytes", "8 bytes"],
          ]}
        />
        <Callout type="note">
          <strong>HTTP/3</strong> uses QUIC, which is built on UDP but implements its own reliability, ordering, and congestion control. It achieves TCP-level reliability with UDP-level speed improvements, especially for high-latency mobile connections.
        </Callout>
        <Callout type="interview">
          Common question: "Why use UDP for video streaming?" Answer: A dropped video frame is better shown as a glitch than paused video. Latency matters more than perfect reliability — UDP lets you keep streaming without waiting for retransmission.
        </Callout>
      </Section>

      {/* ── Section 6: API Gateway ── */}
      <Section id="api-gateway">
        <SH icon="🚪" title="API Gateway" subtitle="The single entry point for all client-backend communication" />
        <InfoBox title="What is an API Gateway?">
          An API Gateway is a server that acts as the <strong>single entry point</strong> for all clients. It handles cross-cutting concerns centrally so individual microservices don't have to. Think of it as a <strong style={{ color: "#a78bfa" }}>reverse proxy on steroids</strong>.
        </InfoBox>
        <div style={{
          background: "#0d1117", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.2rem"
        }}>
          <div style={{ fontSize: "0.72rem", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2rem", fontFamily: "monospace" }}>API Gateway in Microservices</div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ background: "#60a5fa15", border: "1px solid #60a5fa44", borderRadius: "8px", padding: "0.8rem 1.2rem", textAlign: "center" }}>
              <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: "0.85rem" }}>Clients</div>
              <div style={{ color: "#64748b", fontSize: "0.68rem" }}>Web · Mobile · 3rd Party</div>
            </div>
            <div style={{ color: "#475569", fontSize: "1.2rem", alignSelf: "center" }}>→</div>
            <div style={{ background: "#a78bfa15", border: "2px solid #a78bfa55", borderRadius: "10px", padding: "1rem 1.2rem", minWidth: "160px", boxShadow: "0 0 20px #a78bfa15" }}>
              <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.5rem" }}>API Gateway</div>
              {["🔐 Auth / JWT Validation", "🚦 Rate Limiting", "🔀 Request Routing", "📊 Logging & Metrics", "🔄 Protocol Translation", "📦 Response Caching"].map((f, i) => (
                <div key={i} style={{ color: "#94a3b8", fontSize: "0.72rem", lineHeight: "1.8" }}>{f}</div>
              ))}
            </div>
            <div style={{ color: "#475569", fontSize: "1.2rem", alignSelf: "center" }}>→</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                ["User Service", "#60a5fa"],
                ["Order Service", "#34d399"],
                ["Payment Service", "#fbbf24"],
                ["Notification Svc", "#f472b6"]
              ].map(([name, color]) => (
                <div key={name} style={{ background: `${color}15`, border: `1px solid ${color}44`, borderRadius: "6px", padding: "0.4rem 0.8rem", color, fontSize: "0.78rem", fontWeight: 600 }}>{name}</div>
              ))}
            </div>
          </div>
        </div>
        <TwoCol>
          <Card icon="🚦" title="Rate Limiting" color="#fbbf24">
            Limits how many requests a client can make per second/minute. Prevents abuse (DDoS, scraping) and ensures fair usage. Algorithms: <strong style={{ color: "#e2e8f0" }}>Token Bucket, Leaky Bucket, Sliding Window</strong>.
          </Card>
          <Card icon="🔐" title="Authentication" color="#f472b6">
            Validates JWT tokens, API keys, or OAuth tokens centrally. Services behind the gateway can trust that requests are authenticated — removing that concern from each microservice.
          </Card>
        </TwoCol>
        <Callout type="tip">
          Popular API Gateways: <strong>AWS API Gateway</strong>, <strong>Kong</strong>, <strong>NGINX</strong>, <strong>Traefik</strong>. In interviews, mentioning that your gateway handles auth + rate limiting + routing shows strong architectural thinking.
        </Callout>
      </Section>

      {/* ── Section 7: Load Balancing ── */}
      <Section id="load-balancing">
        <SH icon="⚖️" title="Load Balancing" subtitle="Distribute traffic across servers to ensure availability and performance" />
        <LoadBalancerDiagram />
        <InfoBox title="Why Load Balancing?">
          A single server has finite CPU, memory, and network capacity. Load balancers <strong>distribute incoming traffic</strong> across multiple server instances to prevent any single server from becoming a bottleneck or point of failure.
        </InfoBox>
        <TwoCol>
          <Card icon="🔄" title="Round Robin" color="#60a5fa">
            Requests are distributed sequentially across servers. Server 1 → Server 2 → Server 3 → Server 1... Simple and effective when all servers have similar capacity and request cost.
            <br /><br />
            <Badge color="#60a5fa">Best for</Badge> Homogeneous servers, stateless services
          </Card>
          <Card icon="📊" title="Least Connections" color="#34d399">
            Routes new requests to the server with the <strong style={{ color: "#e2e8f0" }}>fewest active connections</strong>. Smarter than round robin when requests have variable processing time (some take 1ms, others 5s).
            <br /><br />
            <Badge color="#34d399">Best for</Badge> Long-lived connections, variable workloads
          </Card>
        </TwoCol>
        <ConsistentHashingDiagram />
        <InfoBox title="Consistent Hashing — Why It Matters" accent="#a78bfa">
          Traditional hashing: <code style={{ color: "#a78bfa" }}>server = hash(key) % N</code>. Problem: adding/removing a server remaps <em>almost all</em> keys — cache misses everywhere.
          <br /><br />
          Consistent hashing places servers on a virtual ring. Adding/removing a server only remaps keys that were <strong>adjacent on the ring</strong> — typically <code style={{ color: "#a78bfa" }}>1/N</code> of all keys. Used heavily in <strong>distributed caches (Memcached, Redis Cluster)</strong> and <strong>CDNs</strong>.
        </InfoBox>
        <Table
          headers={["Algorithm", "How It Works", "Best Use Case", "Pros", "Cons"]}
          rows={[
            ["Round Robin", "Cycle through servers equally", "Stateless apps, equal server specs", "Simple, even distribution", "Ignores server load"],
            ["Weighted Round Robin", "More requests to higher-capacity servers", "Heterogeneous server fleets", "Accounts for capacity differences", "Static weights need manual tuning"],
            ["Least Connections", "Route to server with fewest active connections", "Variable-length requests", "Dynamic, handles slow requests well", "Requires connection tracking overhead"],
            ["IP Hash", "hash(client IP) → same server", "Session persistence (sticky sessions)", "Client always hits same server", "Uneven distribution, breaks if server removed"],
            ["Consistent Hashing", "Virtual ring — hash server and key", "Distributed caches, sharding", "Minimal remapping on node change", "More complex implementation"],
            ["Random", "Pick random server", "Simple scenarios", "Very simple", "No guarantees on distribution"],
          ]}
        />
        <Callout type="interview">
          When designing a URL shortener or cache layer, say: "I'd use consistent hashing to distribute keys across cache nodes. This way, when we add capacity, we only invalidate ~1/N of cached entries instead of everything."
        </Callout>
        <Callout type="note">
          <strong>Layer 4 vs Layer 7 Load Balancing:</strong> L4 (TCP/UDP) routes based on IP/port — fast but blind to content. L7 (HTTP/HTTPS) routes based on URL path, headers, cookies — smarter but more overhead. Nginx and HAProxy can do both.
        </Callout>
      </Section>

      {/* ── Interview Section ── */}
      <Section id="interviews">
        <SH icon="🎯" title="How Networking is Asked in Interviews" subtitle="Common questions, answer frameworks, and key trade-offs" />
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            {
              q: "Difference between TCP and UDP?",
              approach: "Start with the trade-off: reliability vs speed. TCP guarantees delivery (ACK, retransmission, ordering) at the cost of overhead and latency. UDP is connectionless — no handshake, no guarantee, but minimal latency.",
              tradeoff: "HTTP/email/databases use TCP. Video streaming/gaming/DNS use UDP. HTTP/3 (QUIC) bridges both."
            },
            {
              q: "When would you use WebSockets vs REST?",
              approach: "REST is request-response — client initiates, server responds. Use REST for standard CRUD. WebSockets are for bidirectional, low-latency, real-time scenarios where the server also needs to push data.",
              tradeoff: "WebSockets are stateful — harder to scale horizontally. Pair with Redis Pub/Sub for multi-server setups."
            },
            {
              q: "How does a load balancer work? What algorithm would you use?",
              approach: "Describe the problem (single server overload), then the solution (distribute traffic). Pick an algorithm based on the scenario — Round Robin for stateless services, Consistent Hashing for caches, Least Connections for variable workloads.",
              tradeoff: "Sticky sessions (IP hash) break even distribution. Health checks ensure traffic isn't routed to failed servers."
            },
            {
              q: "What's the difference between REST, GraphQL, and gRPC?",
              approach: "REST: standard, cacheable, resource-based. GraphQL: flexible queries, one endpoint, solves overfetching. gRPC: high performance binary, best for internal microservices.",
              tradeoff: "GraphQL adds complexity (N+1, caching). gRPC sacrifices human-readability and browser support for speed."
            },
            {
              q: "Design a real-time chat system",
              approach: "WebSockets for persistent connections. API Gateway for auth/routing. Redis Pub/Sub so messages sent to any server instance reach the right WebSocket. Message persistence in a DB. Fan-out on write for group messages.",
              tradeoff: "Presence detection requires heartbeats. At-scale, consider separating the connection layer (Socket.IO) from the message layer."
            },
          ].map((item, i) => (
            <div key={i} style={{
              background: "rgba(167,139,250,0.04)",
              border: "1px solid rgba(167,139,250,0.15)",
              borderRadius: "12px",
              padding: "1.2rem 1.4rem",
              position: "relative"
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem" }}>
                <div style={{
                  background: "#a78bfa22", border: "1px solid #a78bfa44", borderRadius: "6px",
                  padding: "0.2rem 0.5rem", color: "#a78bfa", fontWeight: 700, fontSize: "0.75rem",
                  flexShrink: 0, marginTop: "0.1rem"
                }}>Q{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#e2e8f0", fontWeight: 700, marginBottom: "0.6rem", fontSize: "0.95rem" }}>
                    "{item.q}"
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.65, marginBottom: "0.5rem" }}>
                    <strong style={{ color: "#60a5fa" }}>Approach:</strong> {item.approach}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.82rem", background: "#fbbf2408", border: "1px solid #fbbf2422", borderRadius: "6px", padding: "0.4rem 0.7rem" }}>
                    <strong style={{ color: "#fbbf24" }}>⚖️ Trade-off:</strong> {item.tradeoff}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Common Mistakes ── */}
      <Section id="mistakes">
        <SH icon="⚠️" title="Common Mistakes to Avoid" subtitle="What interviewers are watching out for" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.9rem" }}>
          {[
            {
              icon: "❌",
              title: "Using REST for real-time systems",
              desc: "REST polling every second to check for updates is wasteful. Use WebSockets or SSE for push-based real-time updates."
            },
            {
              icon: "❌",
              title: "Ignoring latency in protocol choice",
              desc: "gRPC is ~5-10x faster than REST+JSON for internal services. Ignoring this at scale means leaving significant performance on the table."
            },
            {
              icon: "❌",
              title: "Overusing GraphQL",
              desc: "GraphQL is powerful but overkill for simple CRUD APIs. It adds N+1 query risk, complex caching, and a steeper learning curve."
            },
            {
              icon: "❌",
              title: "Not accounting for WebSocket scaling",
              desc: "WebSockets are stateful. Using sticky sessions without pub/sub means your service can't scale horizontally."
            },
            {
              icon: "❌",
              title: "Ignoring protocol overhead",
              desc: "HTTP/JSON is verbose. For high-throughput internal systems, binary protocols (protobuf/gRPC) can reduce payload size by 3-10x."
            },
            {
              icon: "❌",
              title: "Assuming TCP is always better than UDP",
              desc: "TCP's retransmission causes latency spikes under packet loss. For video/gaming, a dropped frame is better than buffering for retransmission."
            },
          ].map((m, i) => (
            <div key={i} style={{
              background: "#f8717108",
              border: "1px solid #f8717133",
              borderRadius: "10px",
              padding: "1rem"
            }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                <span>{m.icon}</span>
                <span style={{ color: "#f87171", fontWeight: 700, fontSize: "0.85rem" }}>{m.title}</span>
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.82rem", lineHeight: 1.6, paddingLeft: "1.3rem" }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Quick Reference ── */}
      <Section id="quick-ref">
        <SH icon="📋" title="Quick Reference" subtitle="Protocol decision tree for your next interview" />
        <CodeBlock lang="Decision Framework" code={`When choosing a communication protocol:

1. Is it real-time / bidirectional?
   YES → WebSockets (or SSE if server→client only)
   NO  → continue...

2. Is it internal service-to-service (microservices)?
   YES → gRPC (high performance, strong typing)
   NO  → continue...

3. Do clients need flexible data fetching (mobile/complex frontend)?
   YES → GraphQL (avoid overfetching)
   NO  → continue...

4. Standard CRUD API / public API?
   → REST (universally understood, cacheable, simple)

Transport layer:
  Need reliability?  → TCP (HTTP, databases, email)
  Need raw speed?    → UDP (video, gaming, DNS, QUIC/HTTP3)

Load balancing algorithm:
  Stateless + equal servers?     → Round Robin
  Variable request cost?         → Least Connections
  Distributed cache / sharding?  → Consistent Hashing
  Need session persistence?      → IP Hash (sticky sessions)`} />
        <Callout type="tip">
          Print this decision tree mentally before every system design interview. The interviewer will inevitably ask "why did you choose X?" — having a clear framework shows senior-level thinking.
        </Callout>
      </Section>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid rgba(167,139,250,0.1)",
        paddingTop: "1.5rem",
        marginTop: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.5rem"
      }}>
        <div style={{ color: "#334155", fontSize: "0.8rem" }}>Networking & Communication · System Design Prep</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["HTTP", "WebSockets", "TCP/UDP", "Load Balancing"].map(tag => (
            <span key={tag} style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: "4px", padding: "0.15rem 0.5rem", color: "#64748b", fontSize: "0.7rem" }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
