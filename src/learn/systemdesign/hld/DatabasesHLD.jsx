import { useState } from "react";

// ─── Shared UI Primitives ────────────────────────────────────────────────────

const SH = ({ icon, title, subtitle }) => (
  <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "1px solid rgba(167,139,250,0.2)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
      {icon && <span style={{ fontSize: "1.4rem" }}>{icon}</span>}
      <h2 style={{
        margin: 0, fontSize: "1.55rem", fontWeight: 700,
        background: "linear-gradient(90deg, #a78bfa, #c4b5fd)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        fontFamily: "'Sora', sans-serif", letterSpacing: "-0.01em"
      }}>{title}</h2>
    </div>
    {subtitle && <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.875rem", paddingLeft: icon ? "2rem" : "0" }}>{subtitle}</p>}
  </div>
);

const InfoBox = ({ title, children, accent = "#a78bfa" }) => (
  <div style={{
    background: "rgba(167,139,250,0.06)", border: `1px solid ${accent}33`,
    borderLeft: `3px solid ${accent}`, borderRadius: "10px",
    padding: "1.1rem 1.3rem", marginBottom: "1rem"
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
      background: `${c.color}0d`, border: `1px solid ${c.color}33`,
      borderLeft: `3px solid ${c.color}`, borderRadius: "8px",
      padding: "0.9rem 1.1rem", marginBottom: "1rem",
      display: "flex", gap: "0.7rem", alignItems: "flex-start"
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
    background: "#0d1117", border: "1px solid rgba(167,139,250,0.15)",
    borderRadius: "10px", overflow: "hidden", marginBottom: "1rem"
  }}>
    <div style={{
      background: "rgba(167,139,250,0.08)", padding: "0.4rem 1rem",
      fontSize: "0.72rem", color: "#a78bfa", fontFamily: "monospace",
      textTransform: "uppercase", letterSpacing: "0.1em",
      borderBottom: "1px solid rgba(167,139,250,0.1)"
    }}>{lang}</div>
    <pre style={{ margin: 0, padding: "1rem 1.2rem", overflowX: "auto" }}>
      <code style={{ color: "#e2e8f0", fontSize: "0.83rem", fontFamily: "'JetBrains Mono','Fira Code',monospace", lineHeight: 1.7 }}>
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
              padding: "0.75rem 1rem", textAlign: "left", color: "#a78bfa",
              fontWeight: 700, fontFamily: "'Sora',sans-serif", fontSize: "0.78rem",
              textTransform: "uppercase", letterSpacing: "0.07em",
              borderBottom: "1px solid rgba(167,139,250,0.2)"
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
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

// ─── Layout Helpers ──────────────────────────────────────────────────────────

const Section = ({ children, id }) => (
  <section id={id} style={{ marginBottom: "3rem" }}>{children}</section>
);

const TwoCol = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1rem", marginBottom: "1rem" }}>
    {children}
  </div>
);

const Card = ({ title, icon, color = "#a78bfa", children }) => (
  <div style={{
    background: "rgba(255,255,255,0.025)", border: `1px solid ${color}33`,
    borderRadius: "12px", padding: "1.2rem"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
      {icon && <span style={{ fontSize: "1.1rem" }}>{icon}</span>}
      <span style={{ fontWeight: 700, color, fontSize: "0.95rem" }}>{title}</span>
    </div>
    <div style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.7 }}>{children}</div>
  </div>
);

const Badge = ({ children, color = "#a78bfa" }) => (
  <span style={{
    background: `${color}18`, border: `1px solid ${color}44`, color,
    borderRadius: "4px", padding: "0.15rem 0.5rem", fontSize: "0.72rem",
    fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.04em", marginRight: "0.3rem"
  }}>{children}</span>
);

const DBBadge = ({ name, color }) => (
  <span style={{
    display: "inline-block", background: `${color}15`,
    border: `1px solid ${color}44`, borderRadius: "6px",
    padding: "0.2rem 0.6rem", fontSize: "0.75rem",
    color, fontWeight: 700, marginRight: "0.4rem", marginBottom: "0.3rem"
  }}>{name}</span>
);

// ─── Diagrams ────────────────────────────────────────────────────────────────

const SQLvsNoSQLDiagram = () => (
  <div style={{ background: "#0d1117", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.2rem" }}>
    <div style={{ fontSize: "0.72rem", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2rem", fontFamily: "monospace" }}>SQL vs NoSQL — Structure Comparison</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
      <div>
        <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.7rem" }}>SQL — Rigid Schema (Table)</div>
        <div style={{ background: "#0a1628", border: "1px solid #60a5fa33", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ background: "#60a5fa18", padding: "0.4rem 0.8rem", borderBottom: "1px solid #60a5fa33", display: "flex", gap: "1.5rem" }}>
            {["id", "name", "email", "age"].map(c => <span key={c} style={{ color: "#60a5fa", fontSize: "0.72rem", fontWeight: 700, fontFamily: "monospace" }}>{c}</span>)}
          </div>
          {[
            ["1", "Alice", "alice@x.com", "28"],
            ["2", "Bob", "bob@x.com", "34"],
            ["3", "Carol", "carol@x.com", "22"],
          ].map((row, i) => (
            <div key={i} style={{ padding: "0.35rem 0.8rem", borderBottom: i < 2 ? "1px solid #1e293b" : "none", display: "flex", gap: "1.5rem" }}>
              {row.map((cell, j) => <span key={j} style={{ color: j === 0 ? "#a78bfa" : "#94a3b8", fontSize: "0.72rem", fontFamily: "monospace", minWidth: j === 0 ? "10px" : "60px" }}>{cell}</span>)}
            </div>
          ))}
        </div>
        <div style={{ color: "#475569", fontSize: "0.7rem", marginTop: "0.5rem" }}>Every row MUST have all columns — strict schema</div>
      </div>
      <div>
        <div style={{ color: "#34d399", fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.7rem" }}>NoSQL — Flexible Schema (Documents)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            { id: 1, name: "Alice", email: "alice@x.com", age: 28, tags: ["admin"] },
            { id: 2, name: "Bob", phone: "+1-555-0100" },
            { id: 3, name: "Carol", email: "carol@x.com", address: { city: "NYC" } },
          ].map((doc, i) => (
            <div key={i} style={{ background: "#0a1628", border: "1px solid #34d39933", borderRadius: "6px", padding: "0.5rem 0.8rem" }}>
              <span style={{ color: "#34d399", fontSize: "0.7rem", fontFamily: "monospace" }}>
                {`{ id:${doc.id}, name:"${doc.name}"${doc.email ? `, email:"${doc.email}"` : ""}${doc.phone ? `, phone:"${doc.phone}"` : ""}${doc.tags ? `, tags:["admin"]` : ""}${doc.address ? `, address:{city:"NYC"}` : ""} }`}
              </span>
            </div>
          ))}
        </div>
        <div style={{ color: "#475569", fontSize: "0.7rem", marginTop: "0.5rem" }}>Each document can have different fields — no fixed schema</div>
      </div>
    </div>
  </div>
);

const CAPDiagram = () => {
  const systems = [
    { label: "MySQL\nPostgreSQL", pos: [50, 18], color: "#60a5fa", type: "CP" },
    { label: "Cassandra\nDynamoDB", pos: [18, 75], color: "#34d399", type: "AP" },
    { label: "Zookeeper\nHBase", pos: [82, 75], color: "#a78bfa", type: "CP" },
  ];
  return (
    <div style={{ background: "#0d1117", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.2rem" }}>
      <div style={{ fontSize: "0.72rem", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem", fontFamily: "monospace" }}>CAP Theorem Triangle</div>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center" }}>
        <svg viewBox="0 0 220 200" width="200" height="185" style={{ flexShrink: 0 }}>
          {/* Triangle */}
          <polygon points="110,20 20,170 200,170" fill="none" stroke="#334155" strokeWidth="1.5" />
          {/* Gradient fills */}
          <polygon points="110,20 20,170 200,170" fill="url(#capGrad)" opacity="0.07" />
          <defs>
            <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
          {/* Vertices */}
          <circle cx="110" cy="20" r="22" fill="#60a5fa15" stroke="#60a5fa55" strokeWidth="1.5" />
          <text x="110" y="16" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="bold">CONSISTENCY</text>
          <text x="110" y="26" textAnchor="middle" fill="#60a5fa" fontSize="6.5">Strong C</text>

          <circle cx="20" cy="170" r="22" fill="#34d39915" stroke="#34d39955" strokeWidth="1.5" />
          <text x="20" y="166" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold">AVAILABILITY</text>
          <text x="20" y="176" textAnchor="middle" fill="#34d399" fontSize="6.5">Always On</text>

          <circle cx="200" cy="170" r="22" fill="#a78bfa15" stroke="#a78bfa55" strokeWidth="1.5" />
          <text x="200" y="166" textAnchor="middle" fill="#a78bfa" fontSize="8" fontWeight="bold">PARTITION</text>
          <text x="200" y="176" textAnchor="middle" fill="#a78bfa" fontSize="6.5">Tolerance</text>

          {/* Edge labels */}
          <text x="60" y="88" textAnchor="middle" fill="#f87171" fontSize="7.5" fontStyle="italic">CP Systems</text>
          <text x="160" y="88" textAnchor="middle" fill="#fbbf24" fontSize="7.5" fontStyle="italic">AP Systems</text>
          <text x="110" y="185" textAnchor="middle" fill="#64748b" fontSize="7" fontStyle="italic">CA (not partition-tolerant)</text>

          {/* Center note */}
          <text x="110" y="105" textAnchor="middle" fill="#475569" fontSize="7">Pick only 2</text>
          <text x="110" y="116" textAnchor="middle" fill="#475569" fontSize="7">of the 3</text>
        </svg>
        <div style={{ flex: 1, minWidth: "180px" }}>
          {[
            { type: "CP", color: "#f87171", title: "CP Systems", desc: "Consistent + Partition Tolerant. Returns error if can't guarantee consistency.", ex: "HBase, Zookeeper, MongoDB (default)" },
            { type: "AP", color: "#34d399", title: "AP Systems", desc: "Available + Partition Tolerant. Returns possibly stale data — eventually consistent.", ex: "Cassandra, DynamoDB, CouchDB" },
            { type: "CA", color: "#64748b", title: "CA Systems", desc: "Only in single-node systems. Practically impossible in distributed systems.", ex: "Traditional RDBMS (single node)" },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: "0.7rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
                <span style={{ background: `${s.color}20`, border: `1px solid ${s.color}55`, borderRadius: "4px", padding: "0.1rem 0.4rem", color: s.color, fontSize: "0.7rem", fontWeight: 700 }}>{s.type}</span>
                <span style={{ color: s.color, fontWeight: 700, fontSize: "0.82rem" }}>{s.title}</span>
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.78rem", lineHeight: 1.5, paddingLeft: "0.3rem" }}>{s.desc}</div>
              <div style={{ color: "#475569", fontSize: "0.72rem", paddingLeft: "0.3rem" }}>e.g. {s.ex}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LeaderFollowerDiagram = () => (
  <div style={{ background: "#0d1117", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.2rem" }}>
    <div style={{ fontSize: "0.72rem", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2rem", fontFamily: "monospace" }}>Leader–Follower Replication</div>
    <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
      {/* Writes */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
        <div style={{ background: "#f8717115", border: "1px solid #f8717144", borderRadius: "8px", padding: "0.5rem 1rem", color: "#f87171", fontWeight: 700, fontSize: "0.8rem" }}>App (Writes)</div>
        <div style={{ color: "#475569", fontSize: "0.9rem" }}>↓</div>
        <div style={{ color: "#475569", fontSize: "0.68rem" }}>WRITE only</div>
      </div>
      {/* Leader */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
        <div style={{ background: "#a78bfa18", border: "2px solid #a78bfa66", borderRadius: "10px", padding: "0.8rem 1.2rem", textAlign: "center", boxShadow: "0 0 20px #a78bfa15" }}>
          <div style={{ color: "#a78bfa", fontWeight: 800, fontSize: "0.9rem" }}>👑 Leader</div>
          <div style={{ color: "#64748b", fontSize: "0.68rem" }}>Primary / Write node</div>
          <div style={{ color: "#64748b", fontSize: "0.68rem" }}>Full data copy</div>
        </div>
        <div style={{ display: "flex", gap: "2rem" }}>
          {["→ Replication log →", "→ Replication log →"].map((t, i) => (
            <div key={i} style={{ color: "#334155", fontSize: "0.62rem", textAlign: "center" }}>{t}</div>
          ))}
        </div>
      </div>
      {/* Followers */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {["Follower 1 (Replica)", "Follower 2 (Replica)", "Follower 3 (Replica)"].map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ color: "#334155", fontSize: "0.8rem" }}>←</div>
            <div style={{ background: "#34d39915", border: "1px solid #34d39944", borderRadius: "6px", padding: "0.4rem 0.8rem", color: "#34d399", fontSize: "0.78rem", fontWeight: 600 }}>{f}</div>
          </div>
        ))}
        <div style={{ background: "#60a5fa15", border: "1px solid #60a5fa33", borderRadius: "6px", padding: "0.4rem 0.8rem", marginTop: "0.2rem" }}>
          <div style={{ color: "#60a5fa", fontSize: "0.72rem", fontWeight: 700 }}>App (Reads) → any follower</div>
        </div>
      </div>
    </div>
    <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <span style={{ background: "#34d39910", border: "1px solid #34d39933", borderRadius: "6px", padding: "0.25rem 0.6rem", color: "#34d399", fontSize: "0.72rem" }}>✓ Scales reads horizontally</span>
      <span style={{ background: "#fbbf2410", border: "1px solid #fbbf2433", borderRadius: "6px", padding: "0.25rem 0.6rem", color: "#fbbf24", fontSize: "0.72rem" }}>⚠ Replication lag possible</span>
      <span style={{ background: "#f8717110", border: "1px solid #f8717133", borderRadius: "6px", padding: "0.25rem 0.6rem", color: "#f87171", fontSize: "0.72rem" }}>✗ Write bottleneck on leader</span>
    </div>
  </div>
);

const MultiLeaderDiagram = () => (
  <div style={{ background: "#0d1117", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.2rem" }}>
    <div style={{ fontSize: "0.72rem", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2rem", fontFamily: "monospace" }}>Multi-Leader Replication (Multi-Region)</div>
    <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
      {[
        { region: "US-East", color: "#60a5fa" },
        { region: "EU-West", color: "#a78bfa" },
        { region: "AP-South", color: "#34d399" },
      ].map((r, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ background: `${r.color}15`, border: `2px solid ${r.color}55`, borderRadius: "10px", padding: "0.7rem 1rem", textAlign: "center" }}>
            <div style={{ color: r.color, fontWeight: 800, fontSize: "0.82rem" }}>👑 Leader</div>
            <div style={{ color: "#64748b", fontSize: "0.65rem" }}>{r.region}</div>
            <div style={{ color: "#64748b", fontSize: "0.65rem" }}>Read + Write</div>
          </div>
          {i < 2 && <div style={{ position: "absolute", marginLeft: "120px", color: "#334155", fontSize: "0.7rem", marginTop: "15px" }}>⟷ async sync</div>}
        </div>
      ))}
    </div>
    <div style={{ textAlign: "center", marginTop: "0.8rem" }}>
      <span style={{ color: "#475569", fontSize: "0.75rem" }}>All leaders replicate to each other asynchronously</span>
    </div>
    <div style={{ marginTop: "0.8rem", background: "#fbbf2408", border: "1px solid #fbbf2422", borderRadius: "8px", padding: "0.6rem 0.9rem" }}>
      <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: "0.78rem" }}>⚠ Conflict Resolution needed:</span>
      <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}> Last-Write-Wins (LWW), CRDTs, or application-level merge logic when two leaders accept conflicting writes simultaneously.</span>
    </div>
  </div>
);

const DBTypesOverview = () => {
  const types = [
    { icon: "🗃️", label: "Relational", ex: "PostgreSQL, MySQL", color: "#60a5fa", desc: "Tables + JOINs + ACID" },
    { icon: "🔑", label: "Key-Value", ex: "Redis, DynamoDB", color: "#34d399", desc: "Hash map at scale" },
    { icon: "📄", label: "Document", ex: "MongoDB, Firestore", color: "#a78bfa", desc: "JSON documents" },
    { icon: "📊", label: "Columnar", ex: "Cassandra, BigTable", color: "#fbbf24", desc: "Wide rows, fast scans" },
    { icon: "📈", label: "Time-Series", ex: "InfluxDB, Timescale", color: "#f472b6", desc: "Time-indexed metrics" },
    { icon: "🕸️", label: "Graph", ex: "Neo4j, TigerGraph", color: "#fb923c", desc: "Nodes + Edges" },
  ];
  return (
    <div style={{ background: "#0d1117", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.2rem" }}>
      <div style={{ fontSize: "0.72rem", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2rem", fontFamily: "monospace" }}>Database Types Landscape</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.8rem" }}>
        {types.map((t, i) => (
          <div key={i} style={{
            background: `${t.color}0a`, border: `1px solid ${t.color}33`,
            borderRadius: "10px", padding: "0.9rem 0.8rem", textAlign: "center"
          }}>
            <div style={{ fontSize: "1.4rem", marginBottom: "0.4rem" }}>{t.icon}</div>
            <div style={{ color: t.color, fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.2rem" }}>{t.label}</div>
            <div style={{ color: "#64748b", fontSize: "0.68rem", marginBottom: "0.3rem" }}>{t.desc}</div>
            <div style={{ color: "#475569", fontSize: "0.66rem", fontFamily: "monospace" }}>{t.ex}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReadReplicaFlowDiagram = () => (
  <div style={{ background: "#0d1117", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.2rem" }}>
    <div style={{ fontSize: "0.72rem", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2rem", fontFamily: "monospace" }}>Read Replica Traffic Flow</div>
    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap", justifyContent: "center" }}>
      <div style={{ background: "#60a5fa15", border: "1px solid #60a5fa44", borderRadius: "8px", padding: "0.6rem 1rem", textAlign: "center" }}>
        <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: "0.82rem" }}>Application</div>
        <div style={{ color: "#64748b", fontSize: "0.68rem" }}>All requests</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <span style={{ color: "#f87171", fontSize: "0.7rem" }}>Write →</span>
          <div style={{ background: "#a78bfa18", border: "2px solid #a78bfa55", borderRadius: "8px", padding: "0.5rem 0.8rem", textAlign: "center" }}>
            <div style={{ color: "#a78bfa", fontWeight: 800, fontSize: "0.8rem" }}>Primary DB</div>
            <div style={{ color: "#64748b", fontSize: "0.65rem" }}>Writes only</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", paddingLeft: "3.5rem" }}>
          <span style={{ color: "#475569", fontSize: "0.65rem" }}>async replication ↓</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingLeft: "2rem" }}>
          {["Read Replica A", "Read Replica B"].map((r, i) => (
            <div key={i} style={{ background: "#34d39915", border: "1px solid #34d39944", borderRadius: "6px", padding: "0.4rem 0.6rem", textAlign: "center" }}>
              <div style={{ color: "#34d399", fontSize: "0.72rem", fontWeight: 700 }}>{r}</div>
            </div>
          ))}
          <span style={{ color: "#34d399", fontSize: "0.7rem" }}>← Reads</span>
        </div>
      </div>
    </div>
    <div style={{ marginTop: "0.8rem", color: "#475569", fontSize: "0.75rem", textAlign: "center" }}>
      Replication lag: writes to primary may take milliseconds to appear on replicas
    </div>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DatabasesHLD() {
  const [activeTab, setActiveTab] = useState("acid");

  return (
    <div style={{
      fontFamily: "'Sora','Inter',sans-serif",
      background: "#080b14", color: "#e2e8f0",
      minHeight: "100vh", padding: "2rem",
      maxWidth: "900px", margin: "0 auto", lineHeight: 1.6
    }}>

      {/* Page Header */}
      <div style={{
        marginBottom: "3rem", padding: "2rem",
        background: "linear-gradient(135deg,rgba(167,139,250,0.08) 0%,rgba(52,211,153,0.04) 100%)",
        borderRadius: "16px", border: "1px solid rgba(167,139,250,0.15)",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", background: "radial-gradient(circle,rgba(167,139,250,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#a78bfa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>System Design › HLD › Databases</span>
        </div>
        <h1 style={{
          margin: "0 0 0.6rem", fontSize: "2.2rem", fontWeight: 800,
          background: "linear-gradient(135deg,#a78bfa 0%,#34d399 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2
        }}>Databases (HLD View)</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", maxWidth: "620px" }}>
          From SQL vs NoSQL fundamentals to CAP theorem, replication strategies, and when to pick each database type — built for interview success.
        </p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["SQL vs NoSQL", "CAP Theorem", "ACID vs BASE", "Replication", "Sharding", "DB Types"].map(t => (
            <span key={t} style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "20px", padding: "0.25rem 0.75rem", fontSize: "0.75rem", color: "#c4b5fd" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Section 1: Introduction ── */}
      <Section id="intro">
        <SH icon="🗄️" title="Introduction to Databases in System Design" subtitle="Why your database choice can make or break your architecture" />
        <InfoBox title="Why Databases Matter">
          Every piece of data in a distributed system must be <strong style={{ color: "#a78bfa" }}>stored, retrieved, and kept consistent</strong>. The wrong database choice leads to: unbounded query times, impossible-to-scale writes, complex migrations, or data loss. The right choice is determined by your <strong style={{ color: "#a78bfa" }}>workload, consistency needs, and scale requirements</strong>.
        </InfoBox>
        <DBTypesOverview />
        <TwoCol>
          <Card icon="⚡" title="OLTP — Online Transaction Processing" color="#60a5fa">
            High-volume, short, fast queries. Reads and writes individual records. Powers user-facing apps — logins, orders, payments.
            <br /><br />
            <Badge color="#60a5fa">Examples</Badge> e-commerce checkout, banking, auth systems
          </Card>
          <Card icon="📊" title="OLAP — Online Analytical Processing" color="#f472b6">
            Complex aggregations over huge datasets. Long-running queries. Powers dashboards, BI tools, ML pipelines.
            <br /><br />
            <Badge color="#f472b6">Examples</Badge> Redshift, BigQuery, Snowflake, ClickHouse
          </Card>
        </TwoCol>
        <Callout type="interview">
          When asked "what database would you use?" always clarify: Is this OLTP or OLAP? Read-heavy or write-heavy? Does it need strong consistency? These three questions narrow your answer immediately.
        </Callout>
      </Section>

      {/* ── Section 2: SQL vs NoSQL ── */}
      <Section id="sql-nosql">
        <SH icon="🆚" title="SQL vs NoSQL" subtitle="The foundational choice in every system design interview" />
        <SQLvsNoSQLDiagram />
        <TwoCol>
          <Card icon="🗃️" title="SQL (Relational)" color="#60a5fa">
            <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem" }}>
              <li>Structured, predefined schema</li>
              <li>Tables with rows and columns</li>
              <li>ACID transactions guaranteed</li>
              <li>Powerful JOINs across tables</li>
              <li>Strong consistency</li>
              <li>Vertical scaling (primarily)</li>
              <li>Best for: relational data, complex queries</li>
            </ul>
          </Card>
          <Card icon="🌊" title="NoSQL (Non-Relational)" color="#34d399">
            <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem" }}>
              <li>Flexible / schema-less design</li>
              <li>Multiple models: document, key-value, graph</li>
              <li>Eventual consistency (usually)</li>
              <li>No JOINs — denormalized data</li>
              <li>Horizontal scaling built-in</li>
              <li>Best for: high write throughput, unstructured data</li>
            </ul>
          </Card>
        </TwoCol>
        <Table
          headers={["Property", "SQL", "NoSQL"]}
          rows={[
            ["Schema", "Rigid, predefined", "Flexible, dynamic"],
            ["Scalability", "Vertical (scale-up)", "Horizontal (scale-out)"],
            ["Consistency", "Strong (ACID)", "Eventual (BASE)"],
            ["Query Language", "Standardized SQL", "DB-specific APIs"],
            ["Relationships", "JOINs (normalized)", "Embedded/denormalized"],
            ["Transactions", "✅ Full ACID", "⚠️ Limited (improving)"],
            ["Write Throughput", "Medium", "🔥 Very High"],
            ["Use Cases", "Banking, ERP, CMS, e-commerce", "Social media, IoT, real-time, caching"],
            ["Examples", "PostgreSQL, MySQL, SQLite", "MongoDB, Cassandra, Redis, DynamoDB"],
          ]}
        />
        <Callout type="tip">
          Modern databases blur the line. PostgreSQL supports JSONB (document-like). MongoDB added multi-document ACID transactions. DynamoDB supports transactions. Always evaluate the specific DB, not just the category.
        </Callout>
      </Section>

      {/* ── Section 3: CAP Theorem ── */}
      <Section id="cap">
        <SH icon="📐" title="CAP Theorem" subtitle="Every distributed database can guarantee at most 2 of 3 properties" />
        <InfoBox title="The Core Insight">
          In the presence of a <strong style={{ color: "#a78bfa" }}>network partition</strong> (nodes can't communicate), you must choose between <strong style={{ color: "#60a5fa" }}>Consistency</strong> (all nodes return the same data) and <strong style={{ color: "#34d399" }}>Availability</strong> (every request gets a response). Partition tolerance is non-negotiable in real distributed systems.
        </InfoBox>
        <CAPDiagram />
        <TwoCol>
          <Card icon="🔒" title="CP — Consistency + Partition Tolerance" color="#f87171">
            Returns an error if it can't guarantee consistent data. The system goes "offline" rather than return stale data.
            <br /><br />
            <strong style={{ color: "#e2e8f0" }}>Real-world:</strong> Banking — you'd rather get an error than see wrong balance.
            <br /><br />
            <Badge color="#f87171">Systems</Badge> HBase, Zookeeper, MongoDB (default config)
          </Card>
          <Card icon="🌐" title="AP — Availability + Partition Tolerance" color="#34d399">
            Returns data (possibly stale) even during network partitions. Never returns an error — but data may lag.
            <br /><br />
            <strong style={{ color: "#e2e8f0" }}>Real-world:</strong> Social media — seeing a 2-second-old tweet is fine.
            <br /><br />
            <Badge color="#34d399">Systems</Badge> Cassandra, DynamoDB, CouchDB, Riak
          </Card>
        </TwoCol>
        <Callout type="warning">
          CAP is often misunderstood. The choice between C and A only matters <em>during a partition</em>. Under normal operation, well-designed distributed systems can provide both. The real trade-off is: what happens when things go wrong?
        </Callout>
        <Callout type="interview">
          A great CAP answer: "Partition tolerance is required in any real distributed system. So the real question is: during a partition, do I need consistency or availability? For financial transactions — CP. For user feeds — AP."
        </Callout>
      </Section>

      {/* ── Section 4: ACID vs BASE ── */}
      <Section id="acid-base">
        <SH icon="⚗️" title="ACID vs BASE" subtitle="Two consistency models — transactional guarantees vs scalable flexibility" />

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.2rem", background: "#0d1117", borderRadius: "10px", padding: "4px", border: "1px solid rgba(167,139,250,0.15)" }}>
          {[
            { id: "acid", label: "ACID", color: "#60a5fa" },
            { id: "base", label: "BASE", color: "#34d399" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: "0.5rem", border: "none", borderRadius: "7px",
              background: activeTab === tab.id ? `${tab.color}18` : "transparent",
              color: activeTab === tab.id ? tab.color : "#64748b",
              fontWeight: 700, cursor: "pointer", fontSize: "0.85rem",
              fontFamily: "'Sora',sans-serif",
              outline: activeTab === tab.id ? `1px solid ${tab.color}44` : "none",
              transition: "all 0.15s"
            }}>{tab.label}</button>
          ))}
        </div>

        {activeTab === "acid" && (
          <div>
            <InfoBox title="ACID — The Gold Standard of Transactions" accent="#60a5fa">
              ACID guarantees that database transactions are processed reliably. It's what makes SQL databases trusted for financial, healthcare, and critical systems.
            </InfoBox>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "0.9rem", marginBottom: "1rem" }}>
              {[
                { letter: "A", word: "Atomicity", color: "#60a5fa", desc: "All-or-nothing. Either the entire transaction succeeds, or none of it does. No partial updates.", ex: "Transfer $100: debit AND credit both succeed, or neither does." },
                { letter: "C", word: "Consistency", color: "#a78bfa", desc: "Transaction brings DB from one valid state to another. All constraints (foreign keys, unique, etc.) are preserved.", ex: "Account balance can never go below zero if constraint exists." },
                { letter: "I", word: "Isolation", color: "#34d399", desc: "Concurrent transactions don't interfere with each other. Each sees a consistent snapshot.", ex: "Two users buying the last ticket — only one succeeds." },
                { letter: "D", word: "Durability", color: "#fbbf24", desc: "Once committed, a transaction persists even if the system crashes. Written to disk / WAL.", ex: "Your order confirmation survives a server restart." },
              ].map((p, i) => (
                <div key={i} style={{ background: `${p.color}0a`, border: `1px solid ${p.color}33`, borderRadius: "10px", padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <div style={{ background: `${p.color}22`, border: `1px solid ${p.color}55`, borderRadius: "6px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", color: p.color, fontWeight: 900, fontSize: "1rem" }}>{p.letter}</div>
                    <span style={{ color: p.color, fontWeight: 700, fontSize: "0.85rem" }}>{p.word}</span>
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.55, marginBottom: "0.4rem" }}>{p.desc}</div>
                  <div style={{ color: "#475569", fontSize: "0.72rem", fontStyle: "italic" }}>"{p.ex}"</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "base" && (
          <div>
            <InfoBox title="BASE — Optimized for Scale and Availability" accent="#34d399">
              BASE sacrifices strict consistency for availability and performance. Used by NoSQL systems designed for massive horizontal scale.
            </InfoBox>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "0.9rem", marginBottom: "1rem" }}>
              {[
                { letter: "BA", word: "Basically Available", color: "#34d399", desc: "The system guarantees availability (every request gets a response) even during partial failures.", ex: "Amazon's shopping cart still works during DB partition — it might show old data." },
                { letter: "S", word: "Soft State", color: "#a78bfa", desc: "The state of the system may change over time, even without new input, as data propagates asynchronously.", ex: "A follower count may be slightly different across replicas for a few milliseconds." },
                { letter: "E", word: "Eventual Consistency", color: "#fbbf24", desc: "Given no new updates, all replicas will eventually converge to the same value. Not immediate.", ex: "Your tweet eventually appears consistently for all followers worldwide." },
              ].map((p, i) => (
                <div key={i} style={{ background: `${p.color}0a`, border: `1px solid ${p.color}33`, borderRadius: "10px", padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <div style={{ background: `${p.color}22`, border: `1px solid ${p.color}55`, borderRadius: "6px", padding: "0 8px", height: "28px", display: "flex", alignItems: "center", color: p.color, fontWeight: 900, fontSize: "0.75rem" }}>{p.letter}</div>
                    <span style={{ color: p.color, fontWeight: 700, fontSize: "0.85rem" }}>{p.word}</span>
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.55, marginBottom: "0.4rem" }}>{p.desc}</div>
                  <div style={{ color: "#475569", fontSize: "0.72rem", fontStyle: "italic" }}>"{p.ex}"</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Table
          headers={["Property", "ACID", "BASE"]}
          rows={[
            ["Consistency model", "Strong (immediate)", "Eventual"],
            ["Availability", "May sacrifice availability", "Always available"],
            ["Partition handling", "Return error", "Return stale data"],
            ["Performance", "Lower (locking, sync)", "🔥 Higher (async)"],
            ["Complexity", "Higher (transaction mgmt)", "Lower (simpler writes)"],
            ["Typical DB", "PostgreSQL, MySQL, Oracle", "Cassandra, DynamoDB, Riak"],
            ["Best for", "Financial, medical, critical data", "Social, IoT, analytics, caching"],
          ]}
        />
      </Section>

      {/* ── Section 5: OLTP vs OLAP ── */}
      <Section id="oltp-olap">
        <SH icon="📊" title="OLTP vs OLAP" subtitle="Two fundamentally different workload patterns requiring different architectures" />
        <TwoCol>
          <Card icon="⚡" title="OLTP — Online Transaction Processing" color="#60a5fa">
            Short, fast queries on individual rows. High concurrency (thousands of users writing simultaneously). Data is normalized to avoid duplication.
            <br /><br />
            <strong style={{ color: "#e2e8f0" }}>Query example:</strong>
            <br />
            <code style={{ color: "#a78bfa", fontSize: "0.78rem" }}>SELECT * FROM orders WHERE id = 12345</code>
            <br /><br />
            <Badge color="#60a5fa">DBs</Badge> PostgreSQL · MySQL · Oracle · SQL Server
          </Card>
          <Card icon="📈" title="OLAP — Online Analytical Processing" color="#f472b6">
            Complex aggregations over billions of rows. Few concurrent users but enormous queries. Columnar storage for fast aggregations. Data is denormalized (star/snowflake schema).
            <br /><br />
            <strong style={{ color: "#e2e8f0" }}>Query example:</strong>
            <br />
            <code style={{ color: "#a78bfa", fontSize: "0.78rem" }}>SELECT region, SUM(revenue) FROM sales GROUP BY region</code>
            <br /><br />
            <Badge color="#f472b6">DBs</Badge> Redshift · BigQuery · Snowflake · ClickHouse
          </Card>
        </TwoCol>
        <Table
          headers={["Property", "OLTP", "OLAP"]}
          rows={[
            ["Query type", "Simple, point lookups", "Complex aggregations"],
            ["Data volume", "GB to TB", "TB to PB"],
            ["Concurrency", "Thousands of users", "Tens of analysts"],
            ["Query time", "Milliseconds", "Seconds to minutes"],
            ["Operations", "INSERT/UPDATE/DELETE heavy", "SELECT heavy"],
            ["Storage model", "Row-oriented", "Columnar"],
            ["Schema", "Normalized (3NF)", "Denormalized (star schema)"],
            ["Freshness", "Real-time", "Often delayed (ETL pipeline)"],
          ]}
        />
        <Callout type="note">
          In modern architectures, OLTP and OLAP are separated. The OLTP database handles production traffic; an ETL/ELT pipeline (Kafka, Spark, Airflow) syncs data to a data warehouse (BigQuery, Snowflake) for analytics — avoiding OLAP queries from slowing down production.
        </Callout>
      </Section>

      {/* ── Section 6 & 7: Read Replicas & Leader-Follower ── */}
      <Section id="replication">
        <SH icon="📡" title="Read Replicas & Leader–Follower Architecture" subtitle="Scale your reads horizontally while keeping a single source of truth" />
        <ReadReplicaFlowDiagram />
        <InfoBox title="What are Read Replicas?">
          Read replicas are <strong>copies of your primary database</strong> that receive replicated data asynchronously. All writes go to the primary (leader); reads can be distributed across replicas. This pattern is essential when <strong style={{ color: "#a78bfa" }}>80-90% of your traffic is reads</strong> — the common case for most apps.
        </InfoBox>
        <LeaderFollowerDiagram />
        <TwoCol>
          <Card icon="✅" title="Leader-Follower Pros" color="#34d399">
            <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem" }}>
              <li>Simple mental model — one truth</li>
              <li>Scales read throughput linearly</li>
              <li>Replicas serve as hot standbys</li>
              <li>Can use replicas for analytics</li>
              <li>Failover: promote follower to leader</li>
            </ul>
          </Card>
          <Card icon="⚠️" title="Leader-Follower Cons" color="#fbbf24">
            <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem" }}>
              <li>Write bottleneck at leader</li>
              <li>Replication lag (milliseconds to seconds)</li>
              <li>"Read-your-own-writes" problem</li>
              <li>Failover adds complexity</li>
              <li>All write capacity limited to one node</li>
            </ul>
          </Card>
        </TwoCol>
        <CodeBlock lang="Read-Your-Own-Writes Problem" code={`// Problem:
// 1. User updates their profile → writes to PRIMARY
// 2. User immediately reads profile → reads from REPLICA
// 3. Replication lag: replica still has OLD data
// 4. User sees their old profile → confusing!

// Solutions:
// Option A: Read from primary after writes by same user
//   if (isCurrentUserData) { readFrom(PRIMARY) }
//   else { readFrom(REPLICA) }

// Option B: Route user's reads to primary for 1s after write
//   if (timeSinceLastWrite < 1000ms) { readFrom(PRIMARY) }

// Option C: Synchronous replication (kills write performance)

// Option D: "Sticky sessions" — user always reads same replica`} />
        <Callout type="warning">
          Replication lag is not just milliseconds at scale. During high write load, replicas can lag by seconds or more. Design your application to tolerate stale reads, or explicitly route sensitive reads to the primary.
        </Callout>
      </Section>

      {/* ── Section 8: Multi-Leader ── */}
      <Section id="multi-leader">
        <SH icon="👑" title="Multi-Leader Replication" subtitle="Multiple write nodes for geo-distributed, high-availability write architectures" />
        <MultiLeaderDiagram />
        <InfoBox title="When to Use Multi-Leader">
          Multi-leader is used when you need <strong>write availability across multiple data centers / regions</strong>. Each region has a leader that accepts writes locally (low latency), and asynchronously replicates to other leaders.
        </InfoBox>
        <TwoCol>
          <Card icon="✅" title="Multi-Leader Pros" color="#34d399">
            Low-latency writes in each region · No single write bottleneck · Continues operating if one DC fails · Great for offline-first apps (e.g. Google Docs)
          </Card>
          <Card icon="⚠️" title="Multi-Leader Cons" color="#f87171">
            Write conflicts are hard · Complex conflict resolution logic · "Last-Write-Wins" can lose data · Much harder to reason about consistency
          </Card>
        </TwoCol>
        <CodeBlock lang="Conflict Scenarios" code={`// Scenario: Two users edit the same document title simultaneously

// Leader A (US-East): title changed to "Draft 2024"
// Leader B (EU-West): title changed to "Final Report"
// → Both accept the write locally → CONFLICT on sync

// Resolution strategies:
// 1. Last-Write-Wins (LWW): higher timestamp wins
//    Risk: can silently discard writes

// 2. CRDTs (Conflict-free Replicated Data Types)
//    Mathematically mergeable structures (counters, sets)
//    Used in: collaborative editors, shopping carts

// 3. Application-level merge
//    Expose conflict to user: "Both versions exist, pick one"
//    Used in: Git, Google Docs

// 4. Operational Transformation (OT)
//    Transform operations to be compatible — used in real-time collab`} />
      </Section>

      {/* ── Section 9: Eventual Consistency ── */}
      <Section id="eventual-consistency">
        <SH icon="🌊" title="Eventual Consistency" subtitle="The key to scalable distributed systems — and its practical implications" />
        <InfoBox title="What is Eventual Consistency?">
          Given <strong>no new updates</strong>, all replicas of a data item will <strong>eventually converge to the same value</strong>. The system does not guarantee that reads after a write will immediately see the new value — but they will, eventually.
        </InfoBox>
        <TwoCol>
          <Card icon="✅" title="Where It Works Well" color="#34d399">
            Social media feeds · Product catalog · DNS resolution · Shopping cart (add-to-cart) · User preference sync across devices · Analytics counters
          </Card>
          <Card icon="❌" title="Where It Fails Badly" color="#f87171">
            Bank transfers · Inventory management (last item in stock) · Ticket/seat booking systems · Medical records · Authentication/authorization decisions
          </Card>
        </TwoCol>
        <Callout type="interview">
          Amazon's Dynamo paper introduced eventual consistency to the mainstream. The insight: for shopping carts, showing a slightly stale cart is better than showing an error. The cost of unavailability (lost sale) exceeds the cost of temporary inconsistency.
        </Callout>
      </Section>

      {/* ── Section 10–15: Database Types ── */}
      <Section id="db-types">
        <SH icon="🗂️" title="Database Types Deep Dive" subtitle="Choosing the right tool for each job" />

        {/* Relational */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
            <span style={{ fontSize: "1.2rem" }}>🗃️</span>
            <span style={{ color: "#60a5fa", fontWeight: 700, fontSize: "1.05rem" }}>Relational Databases</span>
            <DBBadge name="PostgreSQL" color="#60a5fa" />
            <DBBadge name="MySQL" color="#60a5fa" />
          </div>
          <InfoBox accent="#60a5fa">
            The workhorse of the industry. Tables, schemas, JOINs, foreign keys, full ACID transactions. PostgreSQL is the go-to recommendation for most greenfield projects — it's not just relational, it supports JSONB, full-text search, window functions, and CTEs.
          </InfoBox>
          <Callout type="tip">Use when: data is relational, schema is stable, you need complex queries or transactions. PostgreSQL over MySQL for new projects — better standards compliance, richer feature set.</Callout>
        </div>

        {/* Key-Value */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
            <span style={{ fontSize: "1.2rem" }}>🔑</span>
            <span style={{ color: "#34d399", fontWeight: 700, fontSize: "1.05rem" }}>Key-Value Stores</span>
            <DBBadge name="Redis" color="#34d399" />
            <DBBadge name="DynamoDB" color="#34d399" />
            <DBBadge name="Memcached" color="#34d399" />
          </div>
          <InfoBox accent="#34d399">
            Hash map at distributed scale. O(1) reads and writes by key. Redis lives in-memory (microsecond latency) — used for caching, sessions, pub/sub, rate limiting. DynamoDB is managed, persistent, infinitely scalable.
          </InfoBox>
          <CodeBlock lang="Redis — Common Patterns" code={`// 1. Cache-aside pattern
const cached = await redis.get(\`user:\${id}\`);
if (cached) return JSON.parse(cached);
const user = await db.query("SELECT * FROM users WHERE id = ?", [id]);
await redis.setex(\`user:\${id}\`, 3600, JSON.stringify(user)); // TTL: 1hr
return user;

// 2. Rate limiting (sliding window)
const key = \`rate:\${userId}:\${Math.floor(Date.now() / 60000)}\`;
const count = await redis.incr(key);
if (count === 1) await redis.expire(key, 60);
if (count > 100) throw new Error("Rate limit exceeded");

// 3. Session storage
await redis.setex(\`session:\${token}\`, 86400, JSON.stringify(sessionData));`} />
          <Callout type="interview">Redis is the most commonly mentioned database in system design interviews — know when to use it: caching, sessions, pub/sub, leaderboards, distributed locks, rate limiting.</Callout>
        </div>

        {/* Document */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
            <span style={{ fontSize: "1.2rem" }}>📄</span>
            <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "1.05rem" }}>Document Stores</span>
            <DBBadge name="MongoDB" color="#a78bfa" />
            <DBBadge name="Firestore" color="#a78bfa" />
            <DBBadge name="CouchDB" color="#a78bfa" />
          </div>
          <InfoBox accent="#a78bfa">
            Store JSON-like documents with flexible schemas. No JOINs — related data is embedded in a single document. Excellent for <strong>hierarchical data</strong> and cases where the object structure maps directly to documents (catalogs, user profiles, CMS content).
          </InfoBox>
          <Callout type="warning">Avoid MongoDB for highly relational data requiring complex multi-collection JOINs — the $lookup operator is slow. If you're JOINing everything, you probably want SQL.</Callout>
        </div>

        {/* Columnar */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
            <span style={{ fontSize: "1.2rem" }}>📊</span>
            <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: "1.05rem" }}>Columnar / Wide-Column Databases</span>
            <DBBadge name="Cassandra" color="#fbbf24" />
            <DBBadge name="HBase" color="#fbbf24" />
            <DBBadge name="Bigtable" color="#fbbf24" />
          </div>
          <InfoBox accent="#fbbf24">
            Stores data by column families rather than rows. Designed for <strong>massive write throughput and time-series-like access patterns</strong>. Cassandra uses consistent hashing + leaderless replication — no single point of failure. The data model is query-driven: you design tables around your queries.
          </InfoBox>
          <CodeBlock lang="Cassandra Data Model — Query-Driven Design" code={`-- Design table around query: "get messages for a conversation"
CREATE TABLE messages (
  conversation_id UUID,
  created_at      TIMESTAMP,
  message_id      UUID,
  sender_id       UUID,
  body            TEXT,
  PRIMARY KEY ((conversation_id), created_at, message_id)
) WITH CLUSTERING ORDER BY (created_at DESC);

-- ✓ Fast: SELECT * FROM messages WHERE conversation_id = ?
-- ✗ Slow: SELECT * WHERE sender_id = ?  (no partition key = full scan)
-- Model your data around your access patterns, NOT normalization!`} />
        </div>

        {/* Time-Series */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
            <span style={{ fontSize: "1.2rem" }}>📈</span>
            <span style={{ color: "#f472b6", fontWeight: 700, fontSize: "1.05rem" }}>Time-Series Databases</span>
            <DBBadge name="InfluxDB" color="#f472b6" />
            <DBBadge name="TimescaleDB" color="#f472b6" />
            <DBBadge name="Prometheus" color="#f472b6" />
          </div>
          <InfoBox accent="#f472b6">
            Optimized for <strong>time-stamped data points</strong>: metrics, monitoring, IoT sensor data, financial tick data. Features automatic data downsampling (keep 1-min averages, discard raw data after 30 days), fast time-range queries, and efficient compression of sequential numeric data.
          </InfoBox>
          <TwoCol>
            <Card icon="📡" title="Use Cases" color="#f472b6">
              Infrastructure metrics (CPU, memory, disk) · Application performance monitoring (APM) · IoT sensor data · Stock/crypto price ticks · User behavior analytics over time
            </Card>
            <Card icon="⚡" title="Why Not SQL?" color="#fbbf24">
              A general DB with 10M rows/min of metrics will degrade quickly. TSDB uses columnar compression (time-series are repetitive), pre-built aggregation, and automatic retention policies — 10-100x more efficient.
            </Card>
          </TwoCol>
        </div>

        {/* Graph */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
            <span style={{ fontSize: "1.2rem" }}>🕸️</span>
            <span style={{ color: "#fb923c", fontWeight: 700, fontSize: "1.05rem" }}>Graph Databases</span>
            <DBBadge name="Neo4j" color="#fb923c" />
            <DBBadge name="TigerGraph" color="#fb923c" />
            <DBBadge name="Amazon Neptune" color="#fb923c" />
          </div>
          <InfoBox accent="#fb923c">
            Store data as <strong>nodes (entities) and edges (relationships)</strong>. Optimized for traversing deeply connected data. SQL JOINs become exponentially slow for multi-hop graph traversals — graph DBs excel here.
          </InfoBox>
          <CodeBlock lang="Cypher (Neo4j) — Graph Query Language" code={`// Find all friends-of-friends of Alice who like "System Design"
MATCH (alice:User {name: "Alice"})
      -[:FRIENDS_WITH*2]->
      (fof:User)
      -[:LIKES]->
      (topic:Topic {name: "System Design"})
WHERE NOT (alice)-[:FRIENDS_WITH]->(fof)
RETURN fof.name, COUNT(*) as mutual_friends
ORDER BY mutual_friends DESC
LIMIT 10

// This multi-hop traversal is O(k) in graph DB
// vs O(n^2) with SQL JOINs across millions of rows`} />
          <Callout type="tip">Use graph databases for: social networks (friend recommendations), fraud detection (suspicious transaction networks), knowledge graphs, identity & access management (role hierarchies).</Callout>
        </div>

        <Table
          headers={["DB Type", "Best For", "Avoid When", "Top Options"]}
          rows={[
            ["Relational", "Complex queries, transactions, relational data", "Unstructured data, massive scale writes", "PostgreSQL, MySQL"],
            ["Key-Value", "Caching, sessions, rate limiting, counters", "Complex queries, relationships", "Redis, DynamoDB"],
            ["Document", "Hierarchical data, flexible schemas, catalogs", "Heavy relational queries, JOINs", "MongoDB, Firestore"],
            ["Columnar", "High write throughput, IoT, activity logs", "Complex queries, ad-hoc analytics", "Cassandra, HBase"],
            ["Time-Series", "Metrics, monitoring, sensor data", "Complex relational queries", "InfluxDB, Prometheus"],
            ["Graph", "Social graphs, recommendations, fraud", "Simple flat data, few relationships", "Neo4j, Neptune"],
          ]}
        />
      </Section>

      {/* ── Interview Section ── */}
      <Section id="interviews">
        <SH icon="🎯" title="How Databases Are Asked in Interviews" subtitle="Patterns, frameworks, and model answers" />
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            {
              q: "SQL vs NoSQL — which would you use for X?",
              approach: "Always ask clarifying questions first: What's the read/write ratio? Does the data have a fixed schema? Do we need ACID transactions? What scale are we targeting? Then map answers to the SQL/NoSQL spectrum.",
              tradeoff: "SQL: relational integrity + complex queries + ACID. NoSQL: horizontal scale + flexibility + eventual consistency. There's no universal winner."
            },
            {
              q: "Explain the CAP theorem",
              approach: "Start: 'In any distributed system, you can guarantee at most 2 of: Consistency, Availability, Partition Tolerance. Since network partitions are unavoidable, the real choice is C vs A during a partition.' Then give CP (banking) vs AP (social media) examples.",
              tradeoff: "CAP only applies during partitions. PACELC extends it: even without partitions, you trade off latency vs consistency."
            },
            {
              q: "How would you design the database layer for Twitter?",
              approach: "Segment by data type: User profiles → PostgreSQL (relational, consistent). Tweets → Cassandra (time-series, high write throughput). Follow graph → Graph DB or adjacency list in Redis. Hot tweet cache → Redis. Media → Object storage (S3).",
              tradeoff: "No single DB fits all. Each service/data type gets the right tool. Denormalize aggressively for read performance at scale."
            },
            {
              q: "How does database replication work?",
              approach: "Cover the three models: (1) Leader-Follower — single write node, replicas for reads. (2) Multi-Leader — multiple write nodes, conflict resolution needed. (3) Leaderless (Dynamo-style) — any node accepts writes, quorum reads/writes.",
              tradeoff: "Leader-Follower: simple but write bottleneck + replication lag. Multi-Leader: write availability but conflict complexity. Leaderless: highest availability but hardest to reason about."
            },
            {
              q: "When would you use Redis vs a relational DB?",
              approach: "Redis for: sub-millisecond latency needs, ephemeral data (sessions, cache), counters, pub/sub, rate limiting. Relational for: persistent data, complex queries, foreign key integrity, transactions.",
              tradeoff: "Redis is in-memory — data can be lost on crash (configure AOF/RDB for persistence). Not a primary store replacement, but a perfect cache and auxiliary data structure server."
            },
          ].map((item, i) => (
            <div key={i} style={{ background: "rgba(167,139,250,0.04)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: "12px", padding: "1.2rem 1.4rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.8rem" }}>
                <div style={{ background: "#a78bfa22", border: "1px solid #a78bfa44", borderRadius: "6px", padding: "0.2rem 0.5rem", color: "#a78bfa", fontWeight: 700, fontSize: "0.75rem", flexShrink: 0, marginTop: "0.1rem" }}>Q{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#e2e8f0", fontWeight: 700, marginBottom: "0.6rem", fontSize: "0.95rem" }}>"{item.q}"</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.65, marginBottom: "0.5rem" }}>
                    <strong style={{ color: "#60a5fa" }}>Approach: </strong>{item.approach}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.82rem", background: "#fbbf2408", border: "1px solid #fbbf2422", borderRadius: "6px", padding: "0.4rem 0.7rem" }}>
                    <strong style={{ color: "#fbbf24" }}>⚖️ Trade-off: </strong>{item.tradeoff}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Common Mistakes ── */}
      <Section id="mistakes">
        <SH icon="⚠️" title="Common Mistakes to Avoid" subtitle="Pitfalls that signal junior thinking in system design interviews" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "0.9rem" }}>
          {[
            { title: "Defaulting to SQL for everything", desc: "SQL is great, but using it for massive write workloads (IoT, event streams, logs) will cause it to buckle. Know when to reach for Cassandra or a TSDB." },
            { title: "Ignoring replication lag", desc: "Read-your-own-writes failures are a real production bug. Always design for the possibility that a replica hasn't caught up yet." },
            { title: "Misunderstanding CAP theorem", desc: "Saying 'we need all three — CAP isn't real' shows a lack of understanding. Network partitions happen. The question is what you do when they do." },
            { title: "Overusing NoSQL because it's modern", desc: "NoSQL doesn't mean better. Many apps have naturally relational, schema-stable data. Using MongoDB for a financial ledger is an anti-pattern." },
            { title: "Not considering read/write ratio", desc: "Most apps are 90%+ reads. Design for that: read replicas, CDN caching, materialized views. Optimizing writes when reads are the bottleneck is wasted effort." },
            { title: "One database for everything", desc: "Large-scale systems use polyglot persistence — Redis for cache, PostgreSQL for OLTP, Cassandra for time-series, Neo4j for graph. Match the tool to the data type." },
          ].map((m, i) => (
            <div key={i} style={{ background: "#f8717108", border: "1px solid #f8717133", borderRadius: "10px", padding: "1rem" }}>
              <div style={{ color: "#f87171", fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.4rem" }}>❌ {m.title}</div>
              <div style={{ color: "#94a3b8", fontSize: "0.82rem", lineHeight: 1.6 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Quick Reference ── */}
      <Section id="quickref">
        <SH icon="📋" title="Quick Reference" subtitle="Decision framework for your next interview" />
        <CodeBlock lang="Database Selection Decision Tree" code={`Given a new component to store data:

1. Is it time-stamped metrics / monitoring / IoT data?
   YES → Time-Series DB (InfluxDB, Prometheus, TimescaleDB)

2. Is it a graph — entities with complex relationships?
   YES → Graph DB (Neo4j) or adjacency list in Redis

3. Is it ephemeral / cache / session / rate-limiting?
   YES → Redis (in-memory key-value)

4. Is it high write throughput > 100k writes/sec, or global multi-region?
   YES → Cassandra / DynamoDB (leaderless / multi-leader NoSQL)

5. Is the schema flexible / hierarchical / deeply nested JSON?
   YES → Document Store (MongoDB, Firestore)

6. Does it need ACID transactions or complex JOINs?
   YES → Relational DB (PostgreSQL, MySQL)

   DEFAULT: If unsure → PostgreSQL (handles most cases well)

Replication:
  Read-heavy? → Add read replicas (Leader-Follower)
  Multi-region writes? → Multi-Leader (+ conflict resolution)
  Maximum availability? → Leaderless (Dynamo-style, quorum reads/writes)

Consistency:
  Financial / critical data? → ACID (CP systems)
  Social / analytics / scale? → BASE (AP systems, eventual consistency)`} />
        <Callout type="interview">
          The best database answers in interviews show <em>why</em> you're choosing something, not just <em>what</em>. State your assumptions, name the trade-offs, and show you know what you're giving up. That's senior-level thinking.
        </Callout>
      </Section>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(167,139,250,0.1)", paddingTop: "1.5rem", marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ color: "#334155", fontSize: "0.8rem" }}>Databases (HLD View) · System Design Prep</div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["SQL", "NoSQL", "CAP", "ACID", "Replication"].map(tag => (
            <span key={tag} style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: "4px", padding: "0.15rem 0.5rem", color: "#64748b", fontSize: "0.7rem" }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
