import { useState } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg: "#08070f",
  bgCard: "#0f0e1a",
  bgSection: "#13111f",
  bgCode: "#0a0914",
  border: "#1e1b30",
  borderAccent: "#3d2f6e",
  purple: "#a78bfa",
  purpleDim: "#7c5cbf",
  purpleGlow: "#6d28d9",
  pink: "#f472b6",
  cyan: "#22d3ee",
  green: "#4ade80",
  yellow: "#fbbf24",
  orange: "#fb923c",
  red: "#f87171",
  textPrimary: "#e2e1f0",
  textSecondary: "#9691b8",
  textMuted: "#5c5880",
};

// ─── Reusable UI Components ───────────────────────────────────────────────────

const SH = ({ tag = "Section", title, subtitle, icon }) => (
  <div style={{ marginBottom: 32 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <span style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
        color: T.purpleDim, background: "#1e1535", border: `1px solid ${T.borderAccent}`,
        borderRadius: 4, padding: "3px 10px", textTransform: "uppercase",
      }}>{tag}</span>
      {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
    </div>
    <h2 style={{
      fontSize: 26, fontWeight: 800, color: T.textPrimary, margin: 0,
      letterSpacing: "-0.02em", lineHeight: 1.2,
      background: `linear-gradient(135deg, ${T.textPrimary}, ${T.purple})`,
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    }}>{title}</h2>
    {subtitle && <p style={{ color: T.textSecondary, margin: "8px 0 0", fontSize: 14, lineHeight: 1.6 }}>{subtitle}</p>}
  </div>
);

const InfoBox = ({ title, children, accent = T.purple }) => (
  <div style={{
    background: T.bgSection, border: `1px solid ${T.border}`,
    borderLeft: `3px solid ${accent}`, borderRadius: 10,
    padding: "16px 20px", marginBottom: 16,
  }}>
    {title && <div style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{title}</div>}
    <div style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.75 }}>{children}</div>
  </div>
);

const Callout = ({ type = "note", children }) => {
  const cfg = {
    tip: { icon: "💡", label: "Pro Tip", color: T.green, bg: "#0d1f14" },
    warning: { icon: "⚠️", label: "Warning", color: T.yellow, bg: "#1a160a" },
    note: { icon: "📌", label: "Note", color: T.cyan, bg: "#081518" },
    danger: { icon: "🔥", label: "Interview!", color: T.red, bg: "#1a0d0d" },
    insight: { icon: "🧠", label: "Insight", color: T.purple, bg: "#110f1f" },
  };
  const c = cfg[type] || cfg.note;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.color}33`,
      borderRadius: 10, padding: "14px 18px", marginBottom: 16,
      display: "flex", gap: 12, alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 16, marginTop: 1 }}>{c.icon}</span>
      <div>
        <span style={{ fontSize: 11, fontWeight: 700, color: c.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{c.label}: </span>
        <span style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.7 }}>{children}</span>
      </div>
    </div>
  );
};

const CodeBlock = ({ children, lang = "text" }) => (
  <div style={{
    background: T.bgCode, border: `1px solid ${T.border}`,
    borderRadius: 10, overflow: "hidden", marginBottom: 16,
  }}>
    <div style={{
      background: "#0e0c1c", borderBottom: `1px solid ${T.border}`,
      padding: "8px 16px", display: "flex", alignItems: "center", gap: 8,
    }}>
      {["#f87171", "#fbbf24", "#4ade80"].map((col, i) => (
        <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: col }} />
      ))}
      <span style={{ marginLeft: 8, fontSize: 11, color: T.textMuted, fontFamily: "monospace" }}>{lang}</span>
    </div>
    <pre style={{
      margin: 0, padding: "16px 20px",
      fontFamily: "'Fira Code','Cascadia Code',monospace",
      fontSize: 13, lineHeight: 1.7, color: "#c4b5fd",
      overflowX: "auto", whiteSpace: "pre-wrap",
    }}>{children}</pre>
  </div>
);

const Table = ({ headers, rows }) => (
  <div style={{ overflowX: "auto", marginBottom: 20, borderRadius: 10, border: `1px solid ${T.border}` }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#0e0c1f" }}>
          {headers.map((h, i) => (
            <th key={i} style={{
              padding: "12px 16px", textAlign: "left", color: T.purple,
              fontWeight: 700, fontSize: 12, letterSpacing: "0.08em",
              textTransform: "uppercase", borderBottom: `1px solid ${T.borderAccent}`,
              whiteSpace: "nowrap",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} style={{ background: ri % 2 === 0 ? T.bgSection : T.bgCard }}>
            {row.map((cell, ci) => (
              <td key={ci} style={{
                padding: "11px 16px",
                color: ci === 0 ? T.textPrimary : T.textSecondary,
                fontWeight: ci === 0 ? 600 : 400,
                borderBottom: ri < rows.length - 1 ? `1px solid ${T.border}` : "none",
                lineHeight: 1.5,
              }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Badge = ({ label, color = T.purple }) => (
  <span style={{
    display: "inline-block", fontSize: 11, fontWeight: 700,
    color, background: `${color}18`, border: `1px solid ${color}44`,
    borderRadius: 5, padding: "2px 8px", marginRight: 6, marginBottom: 4,
    letterSpacing: "0.06em",
  }}>{label}</span>
);

const ProCon = ({ pros, cons }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
    <div style={{ background: "#0d1f14", border: "1px solid #4ade8033", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.green, letterSpacing: "0.08em", marginBottom: 10 }}>✅ ADVANTAGES</div>
      {pros.map((p, i) => <div key={i} style={{ color: T.textSecondary, fontSize: 13, marginBottom: 6, display: "flex", gap: 8 }}><span style={{ color: T.green }}>+</span>{p}</div>)}
    </div>
    <div style={{ background: "#1a0d0d", border: "1px solid #f8717133", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.red, letterSpacing: "0.08em", marginBottom: 10 }}>❌ DISADVANTAGES</div>
      {cons.map((c, i) => <div key={i} style={{ color: T.textSecondary, fontSize: 13, marginBottom: 6, display: "flex", gap: 8 }}><span style={{ color: T.red }}>−</span>{c}</div>)}
    </div>
  </div>
);

const DiagramBox = ({ title, diagram }) => (
  <div style={{
    background: T.bgCode, border: `1px solid ${T.borderAccent}`,
    borderRadius: 12, overflow: "hidden", marginBottom: 20,
  }}>
    <div style={{
      background: "#0e0b1e", borderBottom: `1px solid ${T.borderAccent}`,
      padding: "10px 18px", display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ fontSize: 14 }}>🗺️</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: T.purple }}>{title}</span>
    </div>
    <pre style={{
      margin: 0, padding: "20px 24px", fontFamily: "'Fira Code',monospace",
      fontSize: 12.5, lineHeight: 1.65, color: "#a78bfa", overflowX: "auto",
    }}>{diagram}</pre>
  </div>
);

const Card = ({ children, glow }) => (
  <div style={{
    background: T.bgCard, border: `1px solid ${T.border}`,
    borderRadius: 14, padding: "28px 30px", marginBottom: 24,
    boxShadow: glow ? `0 0 30px ${T.purpleGlow}22` : "none",
    position: "relative", overflow: "hidden",
  }}>
    {glow && (
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${T.purple}, transparent)`, opacity: 0.6,
      }} />
    )}
    {children}
  </div>
);

const H3 = ({ children, icon }) => (
  <h3 style={{
    fontSize: 17, fontWeight: 700, color: T.textPrimary,
    marginTop: 24, marginBottom: 12, display: "flex", alignItems: "center", gap: 8,
  }}>
    {icon && <span>{icon}</span>}{children}
  </h3>
);

const P = ({ children }) => (
  <p style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>{children}</p>
);

const InterviewQ = ({ q, strategy, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: T.bgSection, border: `1px solid ${open ? T.borderAccent : T.border}`,
      borderRadius: 10, marginBottom: 12, overflow: "hidden", transition: "border-color 0.2s",
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        padding: "14px 18px", display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: 12, textAlign: "left",
      }}>
        <span style={{ color: T.textPrimary, fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>
          <span style={{ color: T.purple, marginRight: 8 }}>Q.</span>{q}
        </span>
        <span style={{ color: T.purple, fontSize: 16, flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 18px 16px", borderTop: `1px solid ${T.border}` }}>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.cyan, letterSpacing: "0.1em", marginBottom: 6 }}>📋 ANSWER STRATEGY</div>
            <div style={{ color: "#86e0ee", fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{strategy}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.green, letterSpacing: "0.1em", marginBottom: 6 }}>💬 SAMPLE ANSWER</div>
            <div style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.8 }}>{answer}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV = [
  { id: "intro", label: "Introduction", icon: "📈" },
  { id: "vertical", label: "Vertical Scaling", icon: "⬆️" },
  { id: "horizontal", label: "Horizontal Scaling", icon: "↔️" },
  { id: "autoscaling", label: "Auto Scaling", icon: "⚙️" },
  { id: "stateless", label: "Stateless vs Stateful", icon: "🔄" },
  { id: "sharding", label: "Sharding", icon: "🧱" },
  { id: "shardtypes", label: "Sharding Types", icon: "🔀" },
  { id: "pitfalls", label: "Partitioning Pitfalls", icon: "⚠️" },
  { id: "interview", label: "Interview Prep", icon: "🎯" },
  { id: "mistakes", label: "Common Mistakes", icon: "🚫" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ScalabilityStrategies() {
  const [active, setActive] = useState("intro");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 230, flexShrink: 0, background: T.bgCard,
        borderRight: `1px solid ${T.border}`, padding: "24px 0",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        <div style={{ padding: "0 18px 20px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>System Design</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.purple }}>Scalability Strategies</div>
        </div>
        <nav style={{ padding: "12px 10px" }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              background: active === item.id ? "#1e1535" : "none",
              border: active === item.id ? `1px solid ${T.borderAccent}` : "1px solid transparent",
              borderRadius: 8, padding: "9px 12px", cursor: "pointer",
              color: active === item.id ? T.purple : T.textSecondary,
              fontSize: 13, fontWeight: active === item.id ? 600 : 400,
              textAlign: "left", marginBottom: 3, transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Content ── */}
      <main style={{ flex: 1, padding: "40px 48px", maxWidth: 900, margin: "0 auto", overflowY: "auto" }}>

        {/* ══════════════════════════════════════════════════════════════
            INTRODUCTION
        ══════════════════════════════════════════════════════════════ */}
        {active === "intro" && (
          <div>
            <SH tag="Chapter 1" icon="📈" title="Introduction to Scalability"
              subtitle="Scalability is the ability of a system to handle growing load without sacrificing performance, reliability, or cost-efficiency." />

            <Card glow>
              <H3 icon="📖">What Is Scalability?</H3>
              <P>Scalability is a system's capacity to <strong style={{ color: T.purple }}>increase its throughput under increased load</strong> when given more resources. A scalable system handles 1,000 users and 10,000,000 users using the same architecture — just with more resources provisioned.</P>
              <P>Analogy: Think of a restaurant. A non-scalable restaurant has one kitchen and one chef — it can serve 30 people. A scalable restaurant opens new branches (horizontal) or expands the kitchen (vertical). The most scalable model is a franchise: replicate the entire unit as demand grows.</P>

              <Callout type="insight">
                Scalability is not about being fast — it's about being <strong>consistently fast as load increases</strong>. A system that handles 100 RPS at 50ms and still handles 100,000 RPS at 55ms is far more scalable than one that goes from 50ms to 5,000ms under load.
              </Callout>

              <H3 icon="🔍">Why Scalability Is Critical</H3>
              <Table
                headers={["Scenario", "What Happens Without Scalability", "Impact"]}
                rows={[
                  ["Viral product launch", "Servers crash under unexpected spike", "Revenue loss, brand damage"],
                  ["Scheduled peak (Black Friday)", "Slow response times, timeouts", "Abandoned carts, SLA breach"],
                  ["Database data growth", "Queries degrade from ms to seconds", "Poor UX, cascading failures"],
                  ["Geographic expansion", "High latency for distant users", "User churn in new markets"],
                  ["Feature growth", "Single service handles too many concerns", "Developer velocity collapse"],
                ]}
              />

              <H3 icon="🗂️">Types of Scaling Problems</H3>
              {[
                { title: "Traffic Scaling", color: T.cyan, desc: "Your API receives more requests per second than your servers can process. Root cause: CPU saturation or connection pool exhaustion. Solution: horizontal scaling + load balancing." },
                { title: "Data Scaling", color: T.purple, desc: "Your database grows to hundreds of GBs or TBs. Queries slow down. Indexes no longer fit in memory. Solution: sharding, read replicas, archival strategies." },
                { title: "Compute Scaling", color: T.orange, desc: "CPU-intensive workloads (ML inference, video encoding, data processing) can't complete fast enough. Solution: specialized compute scaling (GPUs, worker pools, batch queues)." },
                { title: "Geographic Scaling", color: T.green, desc: "Users in Tokyo experience 300ms latency because your servers are in Virginia. Solution: multi-region deployment, CDN, edge computing." },
              ].map(c => <InfoBox key={c.title} title={c.title} accent={c.color}>{c.desc}</InfoBox>)}

              <DiagramBox title="Scaling Problems & Solutions Map" diagram={`
  ┌─────────────────────────────────────────────────────────────────┐
  │                    SCALING DIMENSIONS                           │
  ├────────────────┬────────────────┬──────────────┬───────────────┤
  │   TRAFFIC      │     DATA       │   COMPUTE    │  GEOGRAPHIC   │
  │                │                │              │               │
  │ High RPS       │ DB size growth │ CPU-heavy    │ Global users  │
  │ Spike loads    │ Slow queries   │ jobs         │ High latency  │
  │                │                │              │               │
  │ → Horizontal   │ → Sharding     │ → Worker     │ → Multi-      │
  │   scaling      │   Partitioning │   pools      │   region      │
  │ → Load balance │   Read replicas│   GPU fleet  │   CDN / Edge  │
  └────────────────┴────────────────┴──────────────┴───────────────┘`} />
            </Card>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            VERTICAL SCALING
        ══════════════════════════════════════════════════════════════ */}
        {active === "vertical" && (
          <div>
            <SH tag="Strategy 1" icon="⬆️" title="Vertical Scaling (Scale Up)"
              subtitle="Make the single machine bigger. More CPU cores, more RAM, faster NVMe storage — until you hit the hardware ceiling." />
            <Card>
              <H3 icon="📌">Definition</H3>
              <P>Vertical scaling (scale-up) means <strong style={{ color: T.purple }}>increasing the resources of a single server</strong> — upgrading from a 4-core/16GB instance to a 64-core/512GB instance. No code changes, no architecture redesign: just bigger hardware.</P>
              <P>Analogy: Vertical scaling is hiring a superhero instead of a team. One incredibly powerful individual handles everything — no coordination needed. But even superheroes have limits, and when they're sick (hardware failure), everything stops.</P>

              <DiagramBox title="Vertical vs Horizontal Scaling" diagram={`
  BEFORE SCALING           VERTICAL (Scale Up)       HORIZONTAL (Scale Out)
  ─────────────           ───────────────────        ──────────────────────

  ┌──────────┐            ┌──────────────────┐       ┌──────┐ ┌──────┐ ┌──────┐
  │ Server   │            │  BIGGER Server   │       │ Srv1 │ │ Srv2 │ │ Srv3 │
  │ 4 CPU    │   ──────►  │  64 CPU          │       │ 4CPU │ │ 4CPU │ │ 4CPU │
  │ 16 GB    │            │  512 GB RAM      │       │16 GB │ │16 GB │ │16 GB │
  │ 500 GB   │            │  10 TB NVMe      │       └──┬───┘ └──┬───┘ └──┬───┘
  └──────────┘            └──────────────────┘          └────────┼────────┘
                                                                  │
                                                           ┌──────▼──────┐
                                                           │ Load Balancer│
                                                           └─────────────┘`} />

              <H3 icon="🔧">When Vertical Scaling Is Applied</H3>
              <Table
                headers={["Resource", "When to Scale Up", "Typical Upgrade"]}
                rows={[
                  ["CPU", "High request processing, computation bottleneck", "4 cores → 32 cores → 96 cores"],
                  ["RAM", "Large in-memory datasets, caching, JVM heap pressure", "16 GB → 128 GB → 1 TB"],
                  ["Storage I/O", "Slow DB queries, high disk throughput needs", "HDD → SSD → NVMe RAID"],
                  ["Network", "High data transfer between components", "1 Gbps → 10 Gbps → 25 Gbps"],
                  ["GPU", "ML inference, video processing", "CPU → T4 GPU → A100 cluster"],
                ]}
              />

              <ProCon
                pros={[
                  "Zero code changes — works with any existing architecture",
                  "No distributed systems complexity (networking, consensus, failover)",
                  "Simpler operations — one machine to monitor, patch, and manage",
                  "No data partitioning headaches — single consistent data store",
                  "Low latency — in-process function calls, no network hops",
                ]}
                cons={[
                  "Hard ceiling — even the largest AWS instance (u-24tb1.metal) has limits",
                  "Single Point of Failure (SPOF) — one machine failure = total outage",
                  "Expensive at the top — the largest instances cost 100x more than mid-tier",
                  "Downtime during upgrades — often requires instance stop/restart",
                  "Doesn't improve fault tolerance or geographic distribution",
                ]}
              />

              <Callout type="tip">
                Vertical scaling is your <strong>first move</strong> when you hit a bottleneck. It's fast, requires no code changes, and buys you time to design a proper horizontal solution. Always profile first — you may find the bottleneck is an inefficient query, not raw CPU.
              </Callout>

              <H3 icon="🏢">Real-World Use Cases</H3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {["Database servers (PostgreSQL/Oracle)", "In-memory caches (Redis standalone)", "Single-threaded workloads", "Legacy monoliths that can't be distributed", "ML model training"].map(e => <Badge key={e} label={e} color={T.purple} />)}
              </div>

              <InfoBox title="AWS Instance Vertical Scaling Example" accent={T.cyan}>
                <strong>t3.micro</strong> → 2 vCPU, 1 GB RAM, $0.01/hr<br />
                <strong>m5.4xlarge</strong> → 16 vCPU, 64 GB RAM, $0.77/hr<br />
                <strong>m5.24xlarge</strong> → 96 vCPU, 384 GB RAM, $4.61/hr<br />
                <strong>u-24tb1.metal</strong> → 448 vCPU, 24 TB RAM, $218/hr<br /><br />
                The jump from mid-tier to the extreme high-memory instance is 47x the cost for ~6x the vCPUs. The cost curve for vertical scaling is highly non-linear.
              </InfoBox>
            </Card>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            HORIZONTAL SCALING
        ══════════════════════════════════════════════════════════════ */}
        {active === "horizontal" && (
          <div>
            <SH tag="Strategy 2" icon="↔️" title="Horizontal Scaling (Scale Out)"
              subtitle="Add more machines, not bigger machines. Distribute load across a fleet of commodity servers." />
            <Card>
              <H3 icon="📌">Definition</H3>
              <P>Horizontal scaling means <strong style={{ color: T.purple }}>adding more instances of the same service</strong>, distributing load across them via a load balancer. Each server does the same job; the load balancer routes traffic to the least-loaded one.</P>
              <P>Analogy: Instead of hiring one superhero, you hire an army of regular humans. Each is limited, but together they can handle any load — and losing one soldier doesn't end the mission.</P>

              <DiagramBox title="Horizontal Scaling with Load Balancer" diagram={`
                              ┌──────────────────────────┐
             Users ──────────► │      LOAD BALANCER       │
                              │  (Round-robin / L7 / WRR)│
                              └────┬──────┬──────┬───────┘
                                   │      │      │
                          ┌────────▼┐  ┌──▼─────┐  ┌▼────────┐
                          │App Srv 1│  │App Srv 2│  │App Srv 3│
                          │ 4 CPU   │  │ 4 CPU   │  │ 4 CPU   │
                          │ 16 GB   │  │ 16 GB   │  │ 16 GB   │
                          └────┬────┘  └────┬────┘  └────┬────┘
                               └────────────┼────────────┘
                                            │
                                  ┌─────────▼─────────┐
                                  │  Shared Database   │
                                  │  (or DB cluster)   │
                                  └───────────────────┘

  Auto Scaling Group: 3 instances (min) → 50 instances (max) based on CPU/RPS`} />

              <H3 icon="⚖️">Load Balancing Strategies</H3>
              <Table
                headers={["Algorithm", "How It Works", "Best For", "Limitation"]}
                rows={[
                  ["Round Robin", "Rotate requests across servers sequentially", "Uniform request sizes", "Ignores server load/capacity"],
                  ["Weighted Round Robin", "Servers with higher capacity get more traffic", "Mixed instance types", "Static weights need manual tuning"],
                  ["Least Connections", "Route to server with fewest active connections", "Varying request durations", "Doesn't account for request weight"],
                  ["IP Hash", "Same client IP always hits same server", "Session affinity needs", "Defeats horizontal scaling for state"],
                  ["L7 Content-Based", "Route by URL path, header, or content", "Microservices routing", "More compute overhead at LB"],
                ]}
              />

              <ProCon
                pros={[
                  "Theoretically unlimited scale — add as many nodes as needed",
                  "Fault tolerant — losing one node doesn't cause downtime",
                  "Cost efficient — use commodity hardware, not expensive big machines",
                  "Zero-downtime deployments — rolling deploy across nodes",
                  "Geographic distribution — place nodes close to users",
                ]}
                cons={[
                  "Requires stateless services (session state must move to shared store)",
                  "Load balancer becomes a potential bottleneck itself",
                  "Data consistency across nodes is complex (distributed transactions)",
                  "More infrastructure to manage (service discovery, health checks)",
                  "Network latency between components that were co-located",
                ]}
              />

              <Callout type="warning">
                Horizontal scaling only works if your service is <strong>stateless</strong>. If your application stores session data in memory, user A's request on Server 1 and user A's next request on Server 3 will cause a broken experience. State must move to Redis, a database, or a distributed cache.
              </Callout>

              <H3 icon="🏢">Real-World Examples</H3>
              <Table
                headers={["Company", "Scale", "Approach"]}
                rows={[
                  ["Google Search", "Billions of queries/day", "Thousands of commodity servers, custom load balancing (Maglev)"],
                  ["Netflix", "~200M+ streams at peak", "AWS Auto Scaling Groups, Eureka service discovery"],
                  ["Cloudflare", "~57M HTTP requests/sec", "200+ PoPs globally, Anycast routing"],
                  ["Facebook", "3B+ users", "Custom load balancers (Proxygen), regional data centers"],
                ]}
              />
            </Card>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            AUTO SCALING
        ══════════════════════════════════════════════════════════════ */}
        {active === "autoscaling" && (
          <div>
            <SH tag="Strategy 3" icon="⚙️" title="Auto Scaling"
              subtitle="Dynamically adjust the number of running instances based on real-time metrics — scale out during peaks, scale in during troughs." />
            <Card>
              <H3 icon="📌">Definition</H3>
              <P>Auto scaling monitors system metrics (CPU, memory, RPS, queue depth) and <strong style={{ color: T.purple }}>automatically provisions or terminates instances</strong> to match current demand. It's horizontal scaling on autopilot.</P>

              <DiagramBox title="Auto Scaling Timeline" diagram={`
  Instances
  Running
     │
  10 │                          ████████████
     │                        ██            ██
   7 │                      ██                ██
     │           ███████████                    ███
   4 │  █████████                                   █████████
   3 │──────────────────────────────────────────────────────►  time
     │  Min=3           Scale-out         Scale-in    Min=3
     │  (baseline)      triggers fire     triggers    (idle)
     │
     │  ← Steady State →← Traffic Spike →← Cool down →

  Triggers: CPU > 70% for 2min → add 2 instances
            CPU < 30% for 5min → remove 1 instance (with cooldown)`} />

              <H3 icon="🎛️">Types of Auto Scaling</H3>
              {[
                {
                  title: "Threshold-Based (Reactive) Scaling",
                  color: T.cyan,
                  desc: "Scale when a metric crosses a threshold. E.g., add one server when average CPU > 70% for 2 minutes. Simple, predictable, but reactive — you're always slightly behind the load. Use cooldown periods (300s) to prevent oscillation (thrashing).",
                },
                {
                  title: "Predictive (Proactive) Scaling",
                  color: T.purple,
                  desc: "Use historical patterns and ML to forecast upcoming load and pre-warm capacity before traffic arrives. AWS Predictive Scaling, for example, learns your traffic curve over 14 days and schedules scaling events ahead of time — eliminating the cold-start penalty.",
                },
                {
                  title: "Scheduled Scaling",
                  color: T.green,
                  desc: "Pre-define scaling actions for known traffic patterns. E.g., 'Every Friday at 8 PM, scale to 20 instances' for a media platform. Predictable, zero-latency scaling for periodic load patterns.",
                },
                {
                  title: "Queue-Depth Scaling",
                  color: T.orange,
                  desc: "Scale workers based on the number of unprocessed messages in a queue (SQS, Kafka). As the queue grows, add workers. As it drains, remove them. Perfect for async, batch-processing workloads.",
                },
              ].map(c => <InfoBox key={c.title} title={c.title} accent={c.color}>{c.desc}</InfoBox>)}

              <H3 icon="💰">Cost Efficiency Analysis</H3>
              <Table
                headers={["Scenario", "Fixed Provisioning", "Auto Scaling", "Savings"]}
                rows={[
                  ["E-commerce (9-5 peak)", "30 servers 24/7", "8–30 servers dynamically", "~65% cost reduction"],
                  ["Media streaming (evening peak)", "100 servers 24/7", "20–100 servers", "~70% cost reduction"],
                  ["Batch processing jobs", "20 servers idle overnight", "0 servers idle, 50 at runtime", "~80% cost reduction"],
                  ["Even/constant load", "10 servers", "10 servers", "~0% — no benefit here"],
                ]}
              />

              <Callout type="tip">
                Set your <strong>minimum instance count</strong> to handle your baseline traffic without scaling lag, and configure <strong>warm-up periods</strong> so new instances are traffic-ready before the load balancer sends them requests. A naive auto-scaler that provisions cold instances immediately will still briefly overload existing ones.
              </Callout>

              <CodeBlock lang="yaml (AWS Auto Scaling Policy)">{`# Threshold-based scale-out policy
ScaleOutPolicy:
  PolicyType: StepScaling
  MetricAggregationType: Average
  StepAdjustments:
    - MetricIntervalLowerBound: 0
      MetricIntervalUpperBound: 20
      ScalingAdjustment: 2     # CPU 70–90%: add 2 instances
    - MetricIntervalLowerBound: 20
      ScalingAdjustment: 5     # CPU > 90%: add 5 instances (emergency)
  Cooldown: 300                # Wait 5 min before next scale action

# Scale-in policy (conservative)
ScaleInPolicy:
  PolicyType: SimpleScaling
  ScalingAdjustment: -1        # Remove 1 instance at a time
  Cooldown: 600                # Wait 10 min (protect against thrashing)`}</CodeBlock>
            </Card>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            STATELESS VS STATEFUL
        ══════════════════════════════════════════════════════════════ */}
        {active === "stateless" && (
          <div>
            <SH tag="Strategy 4" icon="🔄" title="Stateless vs Stateful Services"
              subtitle="The single most important architectural decision for horizontal scalability. Stateless services scale trivially. Stateful services require careful engineering." />
            <Card>
              <H3 icon="📌">The Core Distinction</H3>
              <P>A <strong style={{ color: T.green }}>stateless service</strong> does not retain any information between requests. Every request carries all the data needed to process it. Any instance can handle any request — making load balancing trivial.</P>
              <P>A <strong style={{ color: T.red }}>stateful service</strong> remembers data from previous interactions. The server has memory of the client — a session, a connection, a partial computation. This state ties the client to a specific server instance.</P>

              <DiagramBox title="Stateless vs Stateful Architecture" diagram={`
  STATELESS SERVICE                      STATEFUL SERVICE
  ─────────────────                      ────────────────

  Client A ──►│              │           Client A ─────────────► Server 1
  Client B ──►│ Load Balancer│           Client B ─────────────► Server 1
  Client C ──►│              │           Client C ─────────────► Server 2
              └──┬──┬──┬─────┘           (sticky sessions / IP hash)
                 │  │  │
            ┌────▼─┐┌▼────┐┌▼────┐       Problem: Server 1 crash →
            │ Srv1 ││ Srv2 ││ Srv3 │               Client A & B lose state
            └──────┘└──────┘└──────┘
         All servers identical,           STATEFUL → STATELESS SOLUTION:
         any can serve any request         Move state to external store

                                           Client A ──► Any Server ──► Redis
                                                                    └──► Session DB`} />

              <H3 icon="🔑">Making Stateful Services Scalable</H3>
              {[
                { title: "Externalize Session State", color: T.purple, desc: "Move HTTP sessions from in-memory to Redis or Memcached. Any server can read any session. Enables true horizontal scaling. Tools: Redis Sessions (express-session + connect-redis), Spring Session, Django cache sessions." },
                { title: "JWT for Authentication", color: T.cyan, desc: "Instead of server-side sessions, issue signed JWT tokens to clients. The token carries all claims (user ID, roles, expiry). Servers verify the signature cryptographically — zero DB lookup, zero shared state needed between servers." },
                { title: "Sticky Sessions (Last Resort)", color: T.yellow, desc: "Configure the load balancer to route a client to the same server consistently (via cookie or IP hash). Avoids state migration but defeats fault tolerance. If the server dies, the session is lost anyway." },
                { title: "Database-Backed State", color: T.green, desc: "Store all state in a shared database. Works but adds DB load per request. Mitigate with a read-through cache (Redis) so state lookups hit cache first." },
              ].map(c => <InfoBox key={c.title} title={c.title} accent={c.color}>{c.desc}</InfoBox>)}

              <H3 icon="📊">Comparison Table</H3>
              <Table
                headers={["Dimension", "Stateless", "Stateful"]}
                rows={[
                  ["Scalability", "Trivial — any server serves any request", "Complex — state must follow client or be centralized"],
                  ["Fault Tolerance", "High — server death loses nothing", "Lower — server death can lose in-progress state"],
                  ["Load Balancing", "Any algorithm works (Round Robin)", "Requires sticky sessions or external state store"],
                  ["Horizontal Scaling", "Instant — spin up identical copies", "Requires state migration or shared persistence"],
                  ["Complexity", "Low — simple request/response model", "High — session management, distributed state"],
                  ["Examples", "REST APIs, Lambda functions, static sites", "WebSocket servers, game sessions, video calls"],
                  ["State Location", "Client-side (JWT, cookies) or DB", "Server memory or attached storage"],
                ]}
              />

              <Callout type="danger">
                In interviews, when designing any system, explicitly state: <strong>"I'll make the application tier stateless by storing sessions in Redis."</strong> This single statement signals architectural maturity and immediately enables horizontal scaling in your design.
              </Callout>

              <CodeBlock lang="javascript (Stateless JWT auth pattern)">{`// Stateless: server validates JWT cryptographically — no DB call
app.use('/api', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    // Verification only needs the secret — no session lookup
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;  // { userId, role, exp }
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Any of 50 horizontally-scaled servers can run this
// without knowing about any other server's sessions`}</CodeBlock>
            </Card>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SHARDING
        ══════════════════════════════════════════════════════════════ */}
        {active === "sharding" && (
          <div>
            <SH tag="Strategy 5" icon="🧱" title="Database Sharding"
              subtitle="Partition your data horizontally across multiple database instances, each owning a subset of the total dataset." />
            <Card>
              <H3 icon="📌">What Is Sharding and Why Do We Need It?</H3>
              <P>Sharding is the practice of <strong style={{ color: T.purple }}>splitting a large dataset across multiple database nodes</strong> (shards), where each shard holds a distinct horizontal partition of the data. Instead of one database with 10TB, you have 10 databases each with 1TB.</P>
              <P>Analogy: Imagine a library with 10 million books. One librarian can't manage all of them. So you split by genre — one librarian handles Science Fiction, another handles History. Each specialist manages their smaller collection faster, and you can add more librarians (shards) as the library grows.</P>

              <DiagramBox title="Sharded Database Architecture" diagram={`
  Application Layer
  ─────────────────
  ┌─────────────────────────────────┐
  │         Application Server      │
  │  (Shard Router / Client Library)│
  └──────────┬──────────────────────┘
             │  "Which shard holds user_id=12345?"
             │
  ┌──────────▼──────────────────────────────────────────────────┐
  │                    SHARD ROUTER                              │
  │    shard_key → shard mapping (config / consistent hashing)  │
  └──────┬──────────────┬──────────────┬───────────────────┬────┘
         │              │              │                   │
  ┌──────▼──┐    ┌──────▼──┐    ┌──────▼──┐        ┌──────▼──┐
  │ Shard 0 │    │ Shard 1 │    │ Shard 2 │  ...   │ Shard N │
  │Users    │    │Users    │    │Users    │        │Users    │
  │0–24M    │    │25M–49M  │    │50M–74M  │        │75M–100M │
  └─────────┘    └─────────┘    └─────────┘        └─────────┘

  Each shard = independent DB instance with its own storage, CPU, connections`} />

              <H3 icon="🎯">When to Shard</H3>
              <Table
                headers={["Signal", "Threshold", "Action"]}
                rows={[
                  ["Single DB size", "> 1–2 TB", "Evaluate read replicas first, then shard"],
                  ["Read query time", "Consistently > 100ms with indexes", "Add read replicas"],
                  ["Write throughput", "Hitting write master's IOPS limit", "Shard writes (primary motivation)"],
                  ["Connection count", "Approaching max_connections limit", "PgBouncer pooling, then shard"],
                  ["Index size", "Indexes don't fit in RAM", "Shard or archive cold data"],
                ]}
              />

              <Callout type="warning">
                Sharding is a <strong>last resort</strong>, not a first step. Before sharding, exhaust: query optimization, better indexing, read replicas (for read-heavy), connection pooling, caching layers (Redis), and vertical scaling. Sharding adds enormous operational complexity.
              </Callout>

              <H3 icon="🔑">Choosing Your Shard Key</H3>
              <P>The shard key is the most critical decision. A bad shard key causes hotspots — all traffic concentrating on one shard while others idle.</P>
              {[
                { title: "High Cardinality", color: T.green, desc: "Shard key must have enough unique values to distribute data evenly. user_id (millions of values) ✅. country_code (only ~200 values) ❌ — you'd end up with a massive USA shard." },
                { title: "Write Distribution", color: T.cyan, desc: "Keys should not be monotonically increasing (auto-increment IDs with range sharding) — all new writes hit the last shard. Use UUIDs or hash the key to distribute writes evenly." },
                { title: "Query Locality", color: T.purple, desc: "Queries should ideally hit one shard. If most queries filter by tenant_id, shard by tenant_id. Cross-shard queries (scatter-gather) are expensive and should be the exception, not the rule." },
              ].map(c => <InfoBox key={c.title} title={c.title} accent={c.color}>{c.desc}</InfoBox>)}
            </Card>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SHARDING TYPES
        ══════════════════════════════════════════════════════════════ */}
        {active === "shardtypes" && (
          <div>
            <SH tag="Strategy 5b" icon="🔀" title="Types of Sharding"
              subtitle="Range-based, hash-based, and geo-based — each with distinct distribution characteristics and query implications." />
            <Card>

              <H3 icon="1️⃣">Range-Based Sharding</H3>
              <P>Data is partitioned into contiguous ranges of the shard key. E.g., users 1–1M → Shard A, 1M–2M → Shard B.</P>
              <DiagramBox title="Range-Based Sharding" diagram={`
  Shard Key: user_id

  user_id 1       → 1,000,000  : ┌────────┐
  user_id 1M+1    → 2,000,000  : │Shard A │  (Users signed up earliest)
  user_id 2M+1    → 3,000,000  : └────────┘
                                  ┌────────┐
                                  │Shard B │
                                  └────────┘
                                  ┌────────┐
                                  │Shard C │  (Users signed up recently)
                                  └────────┘

  Range queries: "Get users 500K–600K" → hits Shard A only ✅ (efficient)
  Write hotspot: New signups always go to the LAST shard        ❌ (problem)`} />
              <InfoBox title="Range Sharding — When to Use" accent={T.cyan}>
                <strong>✅ Good for:</strong> Time-series data (partition by month), data with natural ranges, queries that read contiguous ranges (reports for a date range).<br />
                <strong>❌ Avoid when:</strong> New data is always appended to one end (monotonic keys cause write hotspots on the last shard).
              </InfoBox>

              <H3 icon="2️⃣">Hash-Based Sharding</H3>
              <P>Apply a hash function to the shard key. The hash output determines the destination shard. Distributes writes evenly but destroys range query efficiency.</P>
              <DiagramBox title="Hash-Based Sharding" diagram={`
  shard = hash(user_id) % num_shards

  user_id=1001  → hash(1001) % 4 = 1  → Shard 1
  user_id=1002  → hash(1002) % 4 = 3  → Shard 3
  user_id=1003  → hash(1003) % 4 = 0  → Shard 0
  user_id=1004  → hash(1004) % 4 = 2  → Shard 2
  user_id=1005  → hash(1005) % 4 = 1  → Shard 1

  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
  │Shard 0 │  │Shard 1 │  │Shard 2 │  │Shard 3 │
  │~25% of │  │~25% of │  │~25% of │  │~25% of │
  │  data  │  │  data  │  │  data  │  │  data  │
  └────────┘  └────────┘  └────────┘  └────────┘

  ✅ Even distribution    ❌ Range queries hit ALL shards (scatter-gather)`} />

              <Callout type="insight">
                Hash-based sharding's biggest weakness: if you add a new shard (change num_shards from 4 to 5), <strong>every existing record maps to a different shard</strong>. A full data migration is required. <strong>Consistent Hashing</strong> solves this by only remapping 1/N of keys when adding a shard.
              </Callout>

              <H3 icon="3️⃣">Geo-Based (Geographic) Sharding</H3>
              <P>Route data to a shard based on the user's or data's geographic location. Primarily used to satisfy data residency laws and reduce latency.</P>
              <DiagramBox title="Geo-Based Sharding" diagram={`
  ┌──────────────────────────────────────────────────────┐
  │                 GLOBAL SHARD ROUTER                  │
  │        (resolves user region from IP / profile)      │
  └────────┬──────────────┬───────────────┬──────────────┘
           │              │               │
  ┌────────▼─────┐  ┌─────▼────────┐  ┌──▼───────────┐
  │  US Shard    │  │  EU Shard    │  │  APAC Shard  │
  │  (us-east-1) │  │ (eu-west-1)  │  │ (ap-south-1) │
  │              │  │              │  │              │
  │  US Users    │  │  EU Users    │  │  APAC Users  │
  │  US Data     │  │  GDPR data   │  │  Local data  │
  └──────────────┘  └──────────────┘  └──────────────┘

  Use cases: GDPR compliance, data sovereignty, latency reduction`} />

              <H3 icon="📊">Sharding Types Comparison</H3>
              <Table
                headers={["Type", "Distribution", "Range Queries", "Rebalancing", "Best For"]}
                rows={[
                  ["Range-Based", "Uneven (hotspot risk)", "Efficient (single shard)", "Easy (split range)", "Time-series, ordered data"],
                  ["Hash-Based", "Even (by design)", "Scatter-gather (all shards)", "Expensive (rehash all)", "Write-heavy, even distribution needed"],
                  ["Consistent Hash", "Even + minimal remapping", "Scatter-gather", "Remap ~1/N keys only", "Dynamic sharding, cloud-native"],
                  ["Geo-Based", "By region (may be uneven)", "Per-region efficient", "Moderate", "GDPR, latency, data sovereignty"],
                  ["Directory-Based", "Configurable", "Depends on config", "Very easy (update table)", "Flexible, but lookup table is SPOF"],
                ]}
              />
            </Card>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PITFALLS
        ══════════════════════════════════════════════════════════════ */}
        {active === "pitfalls" && (
          <div>
            <SH tag="Deep Dive" icon="⚠️" title="Partitioning Pitfalls"
              subtitle="The hard problems that emerge after sharding. Understanding these separates senior engineers from juniors in interviews." />
            <Card>
              {[
                {
                  title: "Hotspots",
                  icon: "🔥",
                  color: T.red,
                  problem: "One shard receives disproportionately more traffic than others. A celebrity's user_id shard gets 1000x the reads. A trending product's shard gets 1000x the writes.",
                  deepdive: "Hotspots occur when your shard key doesn't distribute load evenly. A user-based shard might be even in storage but a celebrity account generates 10 million reads per hour to a single shard.",
                  solution: "For read hotspots: use a read-through cache (Redis) in front of the hot shard. For write hotspots: add a suffix to the key (user_id + random(0-10)) to distribute writes — trade aggregation complexity for write distribution. Re-evaluate your shard key.",
                },
                {
                  title: "Uneven Distribution",
                  icon: "⚖️",
                  color: T.yellow,
                  problem: "Shards accumulate different amounts of data over time. Range sharding often produces huge 'old' shards and tiny 'new' shards as data grows non-uniformly.",
                  deepdive: "If you shard users by signup date range, your earliest shard has 5TB (all the old, active accounts with historical data) while the newest shard has 100GB. The old shard is a constant bottleneck.",
                  solution: "Use consistent hashing to prevent this. Alternatively, implement shard splitting — when a shard exceeds a size threshold, automatically split it into two shards. MongoDB and Cassandra do this automatically.",
                },
                {
                  title: "Rebalancing Issues",
                  icon: "🔄",
                  color: T.orange,
                  problem: "As data grows, you need to add shards. With naive hash sharding (shard = hash(key) % N), adding shard N+1 invalidates nearly all existing key-to-shard mappings.",
                  deepdive: "If you have 4 shards and add a 5th: hash(key) % 4 vs hash(key) % 5 gives different results for ~80% of keys. You'd need to move 80% of all data to new shards — during which the system is degraded.",
                  solution: "Consistent hashing solves this: only ~1/N of keys need remapping when adding a shard. Libraries: Rendezvous hashing, Ketama (Memcached), jump consistent hash. Systems: Redis Cluster uses 16,384 hash slots mapped to nodes — adding a node only moves a proportional share.",
                },
                {
                  title: "Cross-Shard Queries (Scatter-Gather)",
                  icon: "🌐",
                  color: T.cyan,
                  problem: "Queries that don't include the shard key must be broadcast to ALL shards, each runs the query locally, and results are merged by the coordinator. This is O(N) in the number of shards.",
                  deepdive: "'Find all users who purchased in the last 24 hours' — if sharded by user_id, this query hits every shard. With 100 shards, you do 100 parallel queries and merge the results. Latency = slowest shard's response time.",
                  solution: "Design your data model around your access patterns. If you frequently query by multiple dimensions, consider: (1) secondary index on a separate lookup table, (2) denormalize data into a query-optimized store (Elasticsearch, ClickHouse), (3) CQRS with a pre-built read model. Accept that cross-shard queries are slow and reserve them for background/async jobs.",
                },
                {
                  title: "Distributed Transactions",
                  icon: "🔒",
                  color: T.pink,
                  problem: "Operations that span multiple shards cannot use simple ACID transactions. A bank transfer between users on different shards (debit shard A, credit shard B) risks partial failure — money disappearing or doubling.",
                  deepdive: "Two-Phase Commit (2PC) is the classical solution but is blocking — if the coordinator crashes between prepare and commit, shards may lock indefinitely. This is why most sharded systems avoid cross-shard transactions at all.",
                  solution: "Use the Saga pattern: a sequence of local transactions per shard, with compensating transactions for rollback. Or redesign data model so related entities share the same shard (shard by account_id for banking, not by user_id). Use idempotency keys for retries.",
                },
              ].map((p, i) => (
                <div key={i} style={{
                  background: T.bgSection, border: `1px solid ${p.color}33`,
                  borderLeft: `3px solid ${p.color}`, borderRadius: 12, padding: "20px", marginBottom: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>{p.icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>{p.title}</span>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.red, letterSpacing: "0.08em", marginBottom: 4 }}>❌ THE PROBLEM</div>
                    <div style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>{p.problem}</div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.yellow, letterSpacing: "0.08em", marginBottom: 4 }}>🔬 DEEP DIVE</div>
                    <div style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>{p.deepdive}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.green, letterSpacing: "0.08em", marginBottom: 4 }}>✅ THE SOLUTION</div>
                    <div style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>{p.solution}</div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            INTERVIEW
        ══════════════════════════════════════════════════════════════ */}
        {active === "interview" && (
          <div>
            <SH tag="Interview Prep" icon="🎯" title="Scalability in System Design Interviews"
              subtitle="How interviewers test scalability knowledge — and exactly how to answer." />
            <Card glow>
              <Callout type="danger">
                Scalability is tested in <strong>every</strong> system design interview. Interviewers don't expect a perfect answer — they expect you to demonstrate <em>structured thinking about tradeoffs</em>. Show that you know the levers, know the costs, and can choose wisely given constraints.
              </Callout>

              <H3 icon="🗺️">The Scalability Answer Framework</H3>
              <InfoBox title="SCALE Framework for Interviews" accent={T.purple}>
                <strong>S</strong>tart with requirements — Clarify current scale, expected growth, read/write ratio<br />
                <strong>C</strong>ache aggressively — Identify what can be cached (CDN, Redis, in-memory)<br />
                <strong>A</strong>synchronize where possible — Queue non-critical work (email, analytics)<br />
                <strong>L</strong>oad balance stateless services — Make app tier stateless first<br />
                <strong>E</strong>xternalize data — Shard when DB is the bottleneck; replicate for reads
              </InfoBox>

              <H3 icon="❓">Common Questions (Click to Expand)</H3>

              <InterviewQ
                q="How would you scale a system from 1,000 to 1,000,000 users?"
                strategy="Walk through scaling milestones in order. Don't jump to sharding immediately — show the progression: single server → vertical → horizontal → caching → sharding. Each step has a trigger."
                answer="I'd scale in phases. Phase 1 (1K → 10K users): vertical scale the database, add Redis cache for hot data, move static assets to a CDN — most apps can reach 50K users with a single well-tuned server. Phase 2 (10K → 100K): make the application tier stateless (JWT auth, Redis sessions), add 3–5 app servers behind a load balancer, add a read replica for the database. Auto-scale the app tier. Phase 3 (100K → 1M): introduce a message queue (SQS/Kafka) for async workloads (email, analytics), consider database sharding if write throughput is the bottleneck, add a search layer (Elasticsearch) if search queries are expensive. At each phase, I'd profile before adding complexity — the bottleneck dictates the solution."
              />

              <InterviewQ
                q="When would you use database sharding versus read replicas?"
                strategy="Key insight: read replicas solve read bottlenecks; sharding solves write bottlenecks and storage size limits. Show you understand the distinction."
                answer="I'd choose read replicas first, since they're far simpler. If 80% of my queries are reads, I can add 3 read replicas and route all SELECTs to them — the primary only handles writes. This scales reads linearly with the number of replicas and requires no data migration. I'd move to sharding only when: (1) write throughput saturates the primary's IOPS capacity, (2) the dataset exceeds what one machine can hold with reasonable query performance, or (3) replication lag becomes unacceptable for the use case. Sharding is a 10x complexity multiplier — I defer it as long as possible through caching, replicas, archival, and indexing optimization."
              />

              <InterviewQ
                q="How would you handle a sudden 10x traffic spike?"
                strategy="Cover both immediate mitigation and long-term prevention. Show you think in layers: CDN, caching, application tier, database protection."
                answer="Immediate response: If the CDN cache-hit rate is high, most traffic never reaches origin servers — spikes are absorbed. If not, load shedding at the API gateway (rate limiting, circuit breakers) protects backends from being overwhelmed. For the application tier, auto-scaling policies should activate within 2–3 minutes, adding instances. For the database, I'd prioritize cache warming (Redis) to reduce DB load, enable connection pooling (PgBouncer) to prevent connection exhaustion, and flag non-critical write paths to fail gracefully. Long-term: implement predictive auto-scaling, chaos engineering to validate the spike behavior, and graceful degradation (serve stale data from cache rather than erroring when DB is slow)."
              />

              <InterviewQ
                q="Stateless vs stateful — explain the trade-offs for a session management system"
                strategy="Compare JWT (stateless) vs server-side sessions (stateful) with concrete tradeoffs. Don't just say 'JWT is better' — know when server-side sessions win."
                answer="JWT (stateless): the token carries all claims. Servers verify the signature with no DB roundtrip — scales to any number of servers trivially. The downside: you cannot invalidate a JWT before expiry without maintaining a token blacklist (which reintroduces statefulness). Great for microservices where services need to verify identity without calling an auth service. Server-side sessions (stateful via Redis): a session ID cookie maps to a Redis hash. Logout instantly invalidates the session. Full control over session lifecycle. Scales horizontally when all servers share the same Redis cluster. The extra Redis roundtrip adds ~1–2ms latency. For high-security applications (banking, admin panels) where instant revocation is critical, Redis sessions are the right choice despite the overhead."
              />

              <InterviewQ
                q="Design a sharding strategy for a multi-tenant SaaS database with 10,000 tenants"
                strategy="This is a geo+tenant sharding scenario. Discuss shard key selection, isolation requirements, and the tradeoff between shared vs dedicated shards."
                answer="I'd use tenant_id as the shard key with a directory-based approach: a 'shard map' table maps tenant_id → shard_id. Small tenants (90% of them, 10% of traffic) share shards — perhaps 1,000 small tenants per shard. Large enterprise tenants get dedicated shards for isolation and performance predictability. This is the 'database-per-tenant' model for large tenants and 'shared database' for small ones. The directory approach lets us move a tenant to a dedicated shard on upgrade without changing the shard key algorithm — just update the mapping table. I'd cache the shard map in Redis (TTL: 1 hour) to avoid a lookup on every request. For GDPR compliance, I'd use geo-based sharding at the top level (EU tenants → EU region, US tenants → US region) before tenant-level routing."
              />
            </Card>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            MISTAKES
        ══════════════════════════════════════════════════════════════ */}
        {active === "mistakes" && (
          <div>
            <SH tag="Anti-Patterns" icon="🚫" title="Common Scalability Mistakes"
              subtitle="The costly errors engineers make — and the correct mental models to replace them." />
            <Card>
              {[
                {
                  title: "Over-Scaling Too Early",
                  icon: "🏗️", color: T.red,
                  mistake: "Building a Kafka pipeline, 10 microservices, and a sharded database for an app with 50 users, because 'it needs to scale.'",
                  consequence: "Massive development time wasted on distributed systems complexity. Debugging Kafka consumer groups and shard routing for an app that gets 5 requests per minute. The product fails before it ever needs to scale.",
                  fix: "Follow the YAGNI principle: You Aren't Gonna Need It. Start with a monolith and a single database. Add scaling infrastructure when you hit measurable bottlenecks, not when you imagine them. 99% of apps will never need sharding.",
                },
                {
                  title: "Ignoring State Management in Horizontal Scaling",
                  icon: "🔓", color: T.orange,
                  mistake: "Spinning up 10 app servers behind a load balancer without realizing user sessions are stored in each server's memory. Users randomly get logged out when routed to a different server.",
                  consequence: "Intermittent, hard-to-reproduce auth bugs. Users experience random logouts. Customer support overwhelmed. Naive fix (sticky sessions) breaks fault tolerance.",
                  fix: "Before adding your second application server, externalize ALL state: sessions to Redis, uploaded files to S3, background job state to a queue. The rule: every application server must be interchangeable and disposable.",
                },
                {
                  title: "Poor Shard Key Selection",
                  icon: "🎯", color: T.yellow,
                  mistake: "Sharding by timestamp or auto-incrementing ID (range sharding) in a write-heavy system. All new writes go to the last shard. The rest idle.",
                  consequence: "One shard at 100% CPU/IOPS while 9 shards sit at 5% utilization. You've sharded 10 nodes but get the write capacity of 1.",
                  fix: "Hash the shard key to distribute writes evenly. For IDs: use UUID v4 or ULID (which sorts chronologically but distributes evenly in hash space). Never shard by a monotonically increasing key with range sharding in write-heavy systems.",
                },
                {
                  title: "Not Handling Data Consistency After Sharding",
                  icon: "🔀", color: T.pink,
                  mistake: "Implementing sharding and then writing cross-shard JOIN queries in application code — fetching data from 5 shards and joining in memory for every API request.",
                  consequence: "API latency explodes. The 'scatter-gather' pattern across 50 shards means 50 parallel DB queries per request. One slow shard makes every response slow.",
                  fix: "Design data access around shard boundaries. Denormalize data so related entities live on the same shard. Use CQRS with a separate read model (Elasticsearch, ClickHouse) for complex queries that span shard boundaries.",
                },
                {
                  title: "Cache Invalidation Neglect",
                  icon: "💾", color: T.cyan,
                  mistake: "Adding Redis caching for performance but using TTL-only invalidation with 1-hour expiry. Users see stale product prices, outdated profile photos, and old inventory counts for up to an hour after updates.",
                  consequence: "Data freshness SLA violations. Users making decisions on stale data. Support tickets about 'wrong prices' or 'items showing in stock when sold out.'",
                  fix: "Use event-driven cache invalidation: when data changes in the DB, publish an invalidation event that deletes the Redis key immediately. Fall back to TTL as a safety net, not as the primary mechanism. The cache-aside pattern with write-through invalidation is the gold standard.",
                },
                {
                  title: "Forgetting the Database When Scaling the Application",
                  icon: "🗃️", color: T.purple,
                  mistake: "Horizontally scaling from 3 to 30 application servers but leaving a single primary database instance unchanged. Each of 30 servers opens 100 connections = 3,000 connections against a Postgres that can handle 200.",
                  consequence: "Database connection exhaustion. 'FATAL: remaining connection slots are reserved for non-replication superuser connections.' The app tier scales but the DB becomes the bottleneck.",
                  fix: "PgBouncer or RDS Proxy acts as a connection pool in front of the DB, multiplexing thousands of app connections into a smaller pool of real DB connections. Add read replicas before you hit write limits. Profile: is the bottleneck reads, writes, or connections?",
                },
              ].map((m, i) => (
                <div key={i} style={{
                  background: T.bgSection, border: `1px solid ${T.border}`,
                  borderLeft: `3px solid ${m.color}`, borderRadius: 12,
                  padding: "20px", marginBottom: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>{m.title}</span>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.red, letterSpacing: "0.08em" }}>❌ MISTAKE: </span>
                    <span style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>{m.mistake}</span>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.orange, letterSpacing: "0.08em" }}>💥 CONSEQUENCE: </span>
                    <span style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>{m.consequence}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.green, letterSpacing: "0.08em" }}>✅ FIX: </span>
                    <span style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>{m.fix}</span>
                  </div>
                </div>
              ))}

              <Callout type="insight">
                The engineers who ace scalability interviews are the ones who've <em>seen these failures</em> — or thought deeply enough about tradeoffs to predict them. Memorize the failure mode for each strategy, not just the happy path.
              </Callout>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 40, paddingTop: 24, borderTop: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ color: T.textMuted, fontSize: 12 }}>System Design · Scalability Strategies</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Vertical", "Horizontal", "Auto Scale", "Sharding", "Stateless"].map(t => (
              <Badge key={t} label={t} color={T.textMuted} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
