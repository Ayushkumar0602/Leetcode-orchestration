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

// ─── Base UI Primitives ───────────────────────────────────────────────────────
const SH = ({ tag = "Section", title, subtitle, icon }) => (
  <div style={{ marginBottom: 32 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <span style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
        color: T.purpleDim, background: "#1e1535", border: `1px solid ${T.borderAccent}`,
        borderRadius: 4, padding: "3px 10px", textTransform: "uppercase"
      }}>{tag}</span>
      {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
    </div>
    <h2 style={{
      fontSize: 26, fontWeight: 800, color: T.textPrimary, margin: 0,
      letterSpacing: "-0.02em", lineHeight: 1.2,
      background: `linear-gradient(135deg, ${T.textPrimary}, ${T.purple})`,
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
    }}>{title}</h2>
    {subtitle && <p style={{ color: T.textSecondary, margin: "8px 0 0", fontSize: 14, lineHeight: 1.6 }}>{subtitle}</p>}
  </div>
);

const InfoBox = ({ title, children, accent = T.purple }) => (
  <div style={{
    background: T.bgSection, border: `1px solid ${T.border}`,
    borderLeft: `3px solid ${accent}`, borderRadius: 10,
    padding: "16px 20px", marginBottom: 16
  }}>
    {title && <div style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{title}</div>}
    <div style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.75 }}>{children}</div>
  </div>
);

const Callout = ({ type = "note", children }) => {
  const config = {
    tip: { icon: "💡", label: "Pro Tip", color: T.green, bg: "#0d1f14" },
    warning: { icon: "⚠️", label: "Warning", color: T.yellow, bg: "#1a160a" },
    note: { icon: "📌", label: "Note", color: T.cyan, bg: "#081518" },
    danger: { icon: "🔥", label: "Interview!", color: T.red, bg: "#1a0d0d" },
    insight: { icon: "🧠", label: "Insight", color: T.purple, bg: "#110f1f" },
  };
  const c = config[type] || config.note;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.color}33`,
      borderRadius: 10, padding: "14px 18px", marginBottom: 16,
      display: "flex", gap: 12, alignItems: "flex-start"
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
    borderRadius: 10, overflow: "hidden", marginBottom: 16
  }}>
    <div style={{
      background: "#0e0c1c", borderBottom: `1px solid ${T.border}`,
      padding: "8px 16px", display: "flex", alignItems: "center", gap: 8
    }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f87171" }} />
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fbbf24" }} />
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4ade80" }} />
      <span style={{ marginLeft: 8, fontSize: 11, color: T.textMuted, fontFamily: "monospace" }}>{lang}</span>
    </div>
    <pre style={{
      margin: 0, padding: "16px 20px", fontFamily: "'Fira Code', 'Cascadia Code', monospace",
      fontSize: 13, lineHeight: 1.7, color: "#c4b5fd", overflowX: "auto", whiteSpace: "pre-wrap"
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
              whiteSpace: "nowrap"
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} style={{ background: ri % 2 === 0 ? T.bgSection : T.bgCard }}>
            {row.map((cell, ci) => (
              <td key={ci} style={{
                padding: "11px 16px", color: ci === 0 ? T.textPrimary : T.textSecondary,
                fontWeight: ci === 0 ? 600 : 400,
                borderBottom: ri < rows.length - 1 ? `1px solid ${T.border}` : "none",
                lineHeight: 1.5
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
    letterSpacing: "0.06em"
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

// ─── ASCII Diagrams ───────────────────────────────────────────────────────────
const DiagramBox = ({ title, diagram }) => (
  <div style={{
    background: T.bgCode, border: `1px solid ${T.borderAccent}`,
    borderRadius: 12, overflow: "hidden", marginBottom: 20
  }}>
    <div style={{
      background: "#0e0b1e", borderBottom: `1px solid ${T.borderAccent}`,
      padding: "10px 18px", display: "flex", alignItems: "center", gap: 8
    }}>
      <span style={{ fontSize: 14 }}>🗺️</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: T.purple }}>{title}</span>
    </div>
    <pre style={{
      margin: 0, padding: "20px 24px", fontFamily: "'Fira Code', monospace",
      fontSize: 12.5, lineHeight: 1.65, color: "#a78bfa", overflowX: "auto"
    }}>{diagram}</pre>
  </div>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const Card = ({ children, glow }) => (
  <div style={{
    background: T.bgCard, border: `1px solid ${T.border}`,
    borderRadius: 14, padding: "28px 30px", marginBottom: 24,
    boxShadow: glow ? `0 0 30px ${T.purpleGlow}22` : "none",
    position: "relative", overflow: "hidden"
  }}>
    {glow && <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 2,
      background: `linear-gradient(90deg, transparent, ${T.purple}, transparent)`, opacity: 0.6
    }} />}
    {children}
  </div>
);

const H3 = ({ children, icon }) => (
  <h3 style={{
    fontSize: 17, fontWeight: 700, color: T.textPrimary,
    marginTop: 24, marginBottom: 12, display: "flex", alignItems: "center", gap: 8
  }}>
    {icon && <span>{icon}</span>}{children}
  </h3>
);

const P = ({ children }) => (
  <p style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>{children}</p>
);

// ─── Interview Q&A ────────────────────────────────────────────────────────────
const InterviewQ = ({ q, strategy, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: T.bgSection, border: `1px solid ${open ? T.borderAccent : T.border}`,
      borderRadius: 10, marginBottom: 12, overflow: "hidden",
      transition: "border-color 0.2s"
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        padding: "14px 18px", display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: 12, textAlign: "left"
      }}>
        <span style={{ color: T.textPrimary, fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>
          <span style={{ color: T.purple, marginRight: 8 }}>Q.</span>{q}
        </span>
        <span style={{ color: T.purple, fontSize: 16, flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 18px 16px", borderTop: `1px solid ${T.border}` }}>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.cyan, letterSpacing: "0.1em", marginBottom: 8 }}>📋 ANSWER STRATEGY</div>
            <div style={{ color: "#86e0ee", fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{strategy}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.green, letterSpacing: "0.1em", marginBottom: 8 }}>💬 SAMPLE ANSWER</div>
            <div style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.8 }}>{answer}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SystemArchitecturePatterns() {
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { id: "overview", label: "Introduction", icon: "🏗️" },
    { id: "monolith", label: "Monolithic", icon: "🧱" },
    { id: "layered", label: "Layered", icon: "📚" },
    { id: "microservices", label: "Microservices", icon: "🔬" },
    { id: "eventdriven", label: "Event-Driven", icon: "⚡" },
    { id: "serverless", label: "Serverless", icon: "☁️" },
    { id: "hexagonal", label: "Hexagonal", icon: "⬡" },
    { id: "soa", label: "SOA", icon: "🔗" },
    { id: "comparison", label: "Comparison", icon: "📊" },
    { id: "interview", label: "Interview Prep", icon: "🎯" },
    { id: "mistakes", label: "Common Mistakes", icon: "⚠️" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside style={{
        width: 220, flexShrink: 0, background: T.bgCard,
        borderRight: `1px solid ${T.border}`, padding: "24px 0",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto"
      }}>
        <div style={{ padding: "0 18px 20px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>System Design</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.purple }}>Architecture Patterns</div>
        </div>
        <nav style={{ padding: "12px 10px" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", background: activeTab === item.id ? "#1e1535" : "none",
              border: activeTab === item.id ? `1px solid ${T.borderAccent}` : "1px solid transparent",
              borderRadius: 8, padding: "9px 12px", cursor: "pointer",
              color: activeTab === item.id ? T.purple : T.textSecondary,
              fontSize: 13, fontWeight: activeTab === item.id ? 600 : 400,
              textAlign: "left", marginBottom: 3, transition: "all 0.15s"
            }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: "40px 48px", maxWidth: 900, margin: "0 auto", overflowY: "auto" }}>

        {/* ── INTRODUCTION ──────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div>
            <SH tag="Chapter 1" title="System Architecture Patterns" icon="🏗️"
              subtitle="The foundational blueprints that define how large-scale systems are structured, scaled, and maintained." />

            <Card glow>
              <H3 icon="📖">What Are Architecture Patterns?</H3>
              <P>Architecture patterns are <strong style={{ color: T.purple }}>reusable solutions to commonly occurring problems</strong> in software architecture. They define the high-level structure of a system — how components are organized, how they communicate, and how responsibilities are distributed.</P>
              <P>Think of architecture patterns like city planning blueprints. Just as a city can be planned as a grid (structured, predictable), radial (centralized hubs), or organic (emergent, distributed) — software systems can follow different structural philosophies that determine how well they scale, evolve, and survive.</P>

              <Callout type="insight">
                Architecture is not about code — it's about <strong>decisions</strong>. The choices you make at the architecture level are the hardest to reverse later. Getting this wrong at scale costs millions of dollars and months of re-engineering.
              </Callout>

              <H3 icon="🔬">Architecture vs Design vs Implementation</H3>
              <Table
                headers={["Level", "Scope", "Examples", "Who Decides"]}
                rows={[
                  ["Architecture", "System-level structure & patterns", "Monolith vs Microservices, event-driven vs request-response", "Architect / Tech Lead"],
                  ["Design", "Component-level structure & interactions", "Class diagrams, API design, data models", "Senior Engineers"],
                  ["Implementation", "Code-level decisions", "Which library, code style, algorithms", "Developers"],
                ]}
              />

              <InfoBox title="Why It Matters in Interviews" accent={T.cyan}>
                When interviewers ask you to design a system, they're testing whether you understand <em>tradeoffs</em>. Choosing the right architecture pattern — and more importantly, explaining <em>why</em> — is what separates strong candidates from weak ones. There is never one perfect answer.
              </InfoBox>

              <H3 icon="🗺️">Pattern Overview Map</H3>
              <DiagramBox title="Architecture Patterns Overview" diagram={`
Architecture Patterns
│
├── 🧱 Monolithic ──────── Single deployable unit, all-in-one
│
├── 📚 Layered ─────────── Horizontal tiers (UI → Logic → Data)
│
├── 🔬 Microservices ────── Independent, deployable services
│
├── ⚡ Event-Driven ──────── Async producers & consumers via events
│
├── ☁️  Serverless ──────── Functions-as-a-Service, no infra mgmt
│
├── ⬡  Hexagonal ────────── Ports & Adapters, inside-out design
│
└── 🔗 SOA ──────────────── Enterprise services via shared protocols`}
              />
            </Card>
          </div>
        )}

        {/* ── MONOLITHIC ────────────────────────────────────────────────── */}
        {activeTab === "monolith" && (
          <div>
            <SH tag="Pattern 1" title="Monolithic Architecture" icon="🧱"
              subtitle="The classic: one codebase, one deployment, one database. Simple to start, hard to scale." />

            <Card>
              <H3 icon="📌">Definition</H3>
              <P>A monolithic architecture is a system where <strong style={{ color: T.purple }}>all components are part of a single, unified codebase</strong> and deployed as one unit. The UI, business logic, and database access layer all live together.</P>
              <P>Analogy: A monolith is like a Swiss Army knife — everything you need in one package. It's great for everyday use, but if the scissors break, you can't just swap them out without replacing the whole thing.</P>

              <DiagramBox title="Monolithic Architecture" diagram={`
┌──────────────────────────────────────────────────────┐
│                    MONOLITH                          │
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐ │
│  │  UI Layer  │  │  API Layer │  │  Business Logic│ │
│  │ (Frontend) │  │ (REST/MVC) │  │   (Services)   │ │
│  └─────┬──────┘  └─────┬──────┘  └───────┬────────┘ │
│        │               │                  │          │
│  ┌─────▼───────────────▼──────────────────▼────────┐ │
│  │              Data Access Layer (ORM)             │ │
│  └────────────────────────┬─────────────────────────┘ │
└───────────────────────────┼──────────────────────────┘
                            │
                  ┌─────────▼──────────┐
                  │   Single Database  │
                  │  (PostgreSQL/MySQL) │
                  └────────────────────┘`}
              />

              <ProCon
                pros={[
                  "Simple to develop and understand early on",
                  "Easy local development and debugging",
                  "Single deployment pipeline — one CI/CD process",
                  "Low operational overhead (no service mesh, no distributed tracing needed)",
                  "Transactions are simple — no distributed transaction complexity",
                ]}
                cons={[
                  "Hard to scale — must scale the entire app even for one bottleneck",
                  "Tight coupling — changes in one area can break another",
                  "Deployments become risky and slow as codebase grows",
                  "Technology lock-in — entire app must use same language/framework",
                  "Long startup times and large memory footprint",
                  "Team size bottleneck — multiple teams stepping on each other",
                ]}
              />

              <Callout type="tip">
                Start with a monolith. Many successful systems (Shopify, Stack Overflow, Basecamp) remained monolithic for years. Extract microservices only when you hit <em>specific pain points</em> — not by default.
              </Callout>

              <H3 icon="🎯">When to Use</H3>
              <InfoBox accent={T.green}>
                <strong>Good fit for:</strong> Early-stage startups, internal tools, small teams (&lt;10 engineers), MVPs, applications with low-to-medium traffic. When you need to move fast and validate your product idea before worrying about scale.
              </InfoBox>

              <H3 icon="🏢">Real-World Examples</H3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {["Shopify (early)", "GitHub (early)", "Twitter (started as monolith)", "Stack Overflow (still mostly monolith)", "Basecamp"].map(e => (
                  <Badge key={e} label={e} color={T.purple} />
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── LAYERED ───────────────────────────────────────────────────── */}
        {activeTab === "layered" && (
          <div>
            <SH tag="Pattern 2" title="Layered Architecture" icon="📚"
              subtitle="Organize code into horizontal layers where each layer has a specific responsibility and only communicates with adjacent layers." />

            <Card>
              <H3 icon="📌">Core Concept</H3>
              <P>Layered (N-Tier) architecture <strong style={{ color: T.purple }}>organizes a system into horizontal layers</strong>, where each layer serves a distinct role. Each layer can only communicate with the layer directly below it — enforcing separation of concerns.</P>

              <DiagramBox title="4-Layer Architecture" diagram={`
┌─────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER  (Layer 1)              │
│   UI Components, REST Controllers, GraphQL Resolvers    │
│   → Handles: HTTP requests, input validation, response  │
└─────────────────────────┬───────────────────────────────┘
                          │  calls
┌─────────────────────────▼───────────────────────────────┐
│              BUSINESS LOGIC LAYER  (Layer 2)            │
│   Services, Use Cases, Domain Logic, Validation Rules   │
│   → Handles: Core computation, workflows, rules         │
└─────────────────────────┬───────────────────────────────┘
                          │  calls
┌─────────────────────────▼───────────────────────────────┐
│              PERSISTENCE LAYER  (Layer 3)               │
│   Repositories, DAOs, Query Builders, Caching           │
│   → Handles: Data fetching, storage abstractions        │
└─────────────────────────┬───────────────────────────────┘
                          │  calls
┌─────────────────────────▼───────────────────────────────┐
│              DATABASE LAYER  (Layer 4)                  │
│         PostgreSQL / MongoDB / Redis / ElasticSearch    │
└─────────────────────────────────────────────────────────┘`}
              />

              <H3 icon="🧩">Each Layer Explained</H3>
              {[
                { name: "Presentation Layer", color: T.cyan, desc: "The outermost layer. Handles HTTP/gRPC requests, authentication tokens, response serialization. In REST APIs, this is your controllers and middleware. In web apps, this is your HTML/React views." },
                { name: "Business Logic Layer", color: T.purple, desc: "The core of your application. Contains domain rules, workflows, and computations. This layer should be completely independent — no HTTP, no SQL. Just pure business logic." },
                { name: "Data Access / Persistence Layer", color: T.yellow, desc: "Abstracts database access. Uses the Repository pattern to decouple business logic from storage specifics. Switching from PostgreSQL to MongoDB should only touch this layer." },
                { name: "Database Layer", color: T.green, desc: "The actual storage engines: relational databases, caches, search indexes, file systems. This layer is never directly called by business logic." },
              ].map(l => (
                <InfoBox key={l.name} title={l.name} accent={l.color}>
                  {l.desc}
                </InfoBox>
              ))}

              <ProCon
                pros={[
                  "Clear separation of concerns — easy to reason about",
                  "Testability: business logic can be unit tested without a database",
                  "Familiar pattern — most developers understand it immediately",
                  "Easy to swap implementations (e.g., MySQL → PostgreSQL)",
                ]}
                cons={[
                  "Sinkhole anti-pattern: requests that pass through all layers with zero transformation waste compute",
                  "Can lead to anemic domain models if logic bleeds into controllers",
                  "Doesn't handle complex orchestration across multiple bounded contexts well",
                  "Performance overhead of passing through each layer",
                ]}
              />

              <Callout type="warning">
                The most common mistake with layered architecture is letting business logic leak into controllers or SQL queries sneak into service methods. Enforce strict boundaries or the layering becomes meaningless.
              </Callout>
            </Card>
          </div>
        )}

        {/* ── MICROSERVICES ─────────────────────────────────────────────── */}
        {activeTab === "microservices" && (
          <div>
            <SH tag="Pattern 3" title="Microservices Architecture" icon="🔬"
              subtitle="Decompose your system into small, independently deployable services that each own a single business capability." />

            <Card>
              <H3 icon="📌">Core Concept</H3>
              <P>Microservices architecture structures an application as a <strong style={{ color: T.purple }}>collection of small, autonomous services</strong>. Each service is independently deployable, runs its own process, owns its own database, and communicates via lightweight APIs.</P>
              <P>Analogy: Microservices are like a restaurant with specialized chefs. The sushi chef only makes sushi, the grill chef only grills. Each can be replaced or scaled independently. The kitchen runs faster — but coordinating 20 chefs is harder than one chef doing everything.</P>

              <DiagramBox title="Microservices System Design" diagram={`
                        ┌─────────────────┐
                        │   API Gateway   │
                        │  (Auth, Routing)│
                        └────────┬────────┘
             ┌──────────┬────────┴────────┬──────────┐
             │          │                 │          │
    ┌────────▼──┐  ┌────▼─────┐  ┌───────▼──┐  ┌───▼──────┐
    │  User     │  │ Product  │  │  Order   │  │ Payment  │
    │ Service   │  │ Service  │  │ Service  │  │ Service  │
    └────────┬──┘  └────┬─────┘  └────┬─────┘  └───┬──────┘
             │          │             │              │
          ┌──▼──┐     ┌─▼──┐       ┌──▼──┐       ┌──▼──┐
          │ DB  │     │ DB │       │ DB  │       │ DB  │
          └─────┘     └────┘       └─────┘       └─────┘

Service Communication:
  Sync:  REST or gRPC (request/response)
  Async: Kafka / RabbitMQ (events)`}
              />

              <H3 icon="🔌">Service Communication Patterns</H3>
              <Table
                headers={["Communication", "Protocol", "When to Use", "Tradeoff"]}
                rows={[
                  ["Synchronous", "REST (HTTP/JSON)", "Real-time responses needed (auth, payment)", "Tight coupling, availability dependency"],
                  ["Synchronous", "gRPC (HTTP/2 + Protobuf)", "High-performance, internal service calls", "Harder to debug, Protobuf schema coupling"],
                  ["Asynchronous", "Kafka (event streaming)", "Event sourcing, high-throughput pipelines", "Eventual consistency, complex debugging"],
                  ["Asynchronous", "RabbitMQ (message queue)", "Task queues, work distribution", "Less durable than Kafka, no replay"],
                  ["Asynchronous", "GraphQL Federation", "Unified API across services for clients", "Complex setup, N+1 problems"],
                ]}
              />

              <ProCon
                pros={[
                  "Independent scaling: scale only the service that's under load",
                  "Technology freedom: each service can use different language/DB",
                  "Independent deployment: deploy one service without touching others",
                  "Fault isolation: one service failure doesn't crash the whole system",
                  "Team autonomy: teams own their services end-to-end",
                ]}
                cons={[
                  "Distributed systems complexity (network failures, partial failures)",
                  "Data consistency is hard — no ACID transactions across services",
                  "Service discovery, load balancing, and circuit breakers add overhead",
                  "Debugging is painful — distributed tracing required (Jaeger, Zipkin)",
                  "Significant DevOps investment: Kubernetes, CI/CD per service, monitoring",
                  "Latency overhead from inter-service HTTP/RPC calls",
                ]}
              />

              <Callout type="danger">
                Classic interview question: "When would you choose microservices over a monolith?" The answer is NOT "always." Microservices are justified when teams are large (&gt;50 engineers), when you have distinct scaling requirements per component, or when different parts need different technology stacks.
              </Callout>

              <H3 icon="🏢">Real-World Examples</H3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {["Netflix (700+ services)", "Amazon (thousands of services)", "Uber (domain-driven services)", "Airbnb", "Spotify (Squads model)"].map(e => (
                  <Badge key={e} label={e} color={T.cyan} />
                ))}
              </div>

              <CodeBlock lang="yaml (docker-compose excerpt)">{`# Example: 3 microservices running independently
services:
  user-service:
    image: user-service:latest
    ports: ["3001:3001"]
    environment:
      DB_URL: postgres://user-db/users

  order-service:
    image: order-service:latest
    ports: ["3002:3002"]
    depends_on: [kafka]
    environment:
      KAFKA_BROKER: kafka:9092

  payment-service:
    image: payment-service:latest
    ports: ["3003:3003"]
    environment:
      STRIPE_KEY: \${STRIPE_KEY}`}</CodeBlock>
            </Card>
          </div>
        )}

        {/* ── EVENT-DRIVEN ──────────────────────────────────────────────── */}
        {activeTab === "eventdriven" && (
          <div>
            <SH tag="Pattern 4" title="Event-Driven Architecture" icon="⚡"
              subtitle="Components communicate by producing and consuming events asynchronously — decoupling producers from consumers entirely." />

            <Card>
              <H3 icon="📌">Core Concept</H3>
              <P>In event-driven architecture, services communicate by <strong style={{ color: T.purple }}>publishing events to a shared message bus</strong>. Producers emit events without knowing who consumes them. Consumers subscribe to events without knowing who produced them.</P>
              <P>Analogy: Think of it like a newspaper. The journalist (producer) writes and publishes an article. They don't know who will read it. Thousands of subscribers (consumers) independently read and react to the same article. Adding a new subscriber doesn't change the journalist's workflow at all.</P>

              <DiagramBox title="Event-Driven Flow (Kafka)" diagram={`
  ORDER PLACED EVENT FLOW:

  ┌──────────────┐     publish      ┌─────────────────────────────────┐
  │  Order API   │  ──────────────► │     Kafka Topic: order.placed   │
  │  (Producer)  │                  │                                 │
  └──────────────┘                  │  Partition 0: [evt1][evt2][...] │
                                    │  Partition 1: [evt3][evt4][...] │
                                    └──────────────┬──────────────────┘
                           ┌─────────────┬─────────┴────────┬──────────────┐
                     subscribe       subscribe           subscribe      subscribe
                           │             │                   │              │
              ┌────────────▼──┐  ┌───────▼──────┐  ┌────────▼────┐  ┌─────▼────────┐
              │ Inventory Svc │  │ Notification │  │  Analytics  │  │  Billing Svc │
              │ (Consumer)    │  │   Service    │  │   Service   │  │  (Consumer)  │
              └───────────────┘  └──────────────┘  └─────────────┘  └──────────────┘
              Updates stock       Sends email        Records metrics   Charges customer`}
              />

              <H3 icon="🔧">Key Components</H3>
              {[
                { name: "Events", color: T.purple, desc: "Immutable facts about something that happened. e.g., OrderPlaced, UserSignedUp, PaymentFailed. Events are past-tense and represent state changes." },
                { name: "Producers (Publishers)", color: T.cyan, desc: "Services that detect state changes and publish events to a broker. Producers are completely unaware of consumers — total decoupling." },
                { name: "Message Broker", color: T.yellow, desc: "The central nervous system: Kafka for durable, high-throughput streams; RabbitMQ for task queues. Brokers store events, manage offsets, and route messages." },
                { name: "Consumers (Subscribers)", color: T.green, desc: "Services that listen to specific event types and react. Multiple consumers can process the same event independently (fan-out pattern)." },
                { name: "Event Streams", color: T.orange, desc: "Ordered, append-only logs of events (Kafka). Unlike queues (consumed-and-deleted), streams persist events and allow any consumer to replay from any offset." },
              ].map(c => <InfoBox key={c.name} title={c.name} accent={c.color}>{c.desc}</InfoBox>)}

              <ProCon
                pros={[
                  "Complete decoupling — producers and consumers evolve independently",
                  "High scalability — consumers can be scaled independently",
                  "Resilience — events are durable; consumers can process even if temporarily offline",
                  "Event replay — reprocess historical data for new features or bug fixes",
                  "Audit trail — full history of all state changes",
                ]}
                cons={[
                  "Eventual consistency — systems converge to correct state, not immediately",
                  "Complex debugging — no single request trace, requires distributed tracing",
                  "Ordering guarantees are hard (within a Kafka partition only, not globally)",
                  "Duplicate events — consumers must be idempotent",
                  "Schema evolution is tricky (consumer must handle multiple event versions)",
                ]}
              />

              <Callout type="insight">
                Kafka retains events for days/weeks (configurable). This means you can add a new consumer service and have it process all historical events from day one — you can bootstrap an entirely new microservice from the event log. This is the power of event sourcing.
              </Callout>

              <H3 icon="🏢">Real-World Use Cases</H3>
              <Table
                headers={["Company", "Use Case", "Technology"]}
                rows={[
                  ["LinkedIn", "Activity feeds, notifications, analytics", "Apache Kafka (they built it)"],
                  ["Uber", "Driver location updates, trip events, surge pricing", "Kafka + custom routing"],
                  ["Netflix", "User activity streaming, recommendation engine updates", "Kafka + Flink"],
                  ["Shopify", "Order processing pipeline, inventory updates", "Kafka"],
                  ["Airbnb", "Booking events, messaging, fraud detection", "Kafka"],
                ]}
              />
            </Card>
          </div>
        )}

        {/* ── SERVERLESS ────────────────────────────────────────────────── */}
        {activeTab === "serverless" && (
          <div>
            <SH tag="Pattern 5" title="Serverless Architecture" icon="☁️"
              subtitle="Run application logic without managing servers. Pay only for what you execute. Scale to zero or to millions automatically." />

            <Card>
              <H3 icon="📌">Core Concept</H3>
              <P>Serverless (Functions-as-a-Service / FaaS) lets you write <strong style={{ color: T.purple }}>individual functions that execute in response to events</strong>. The cloud provider handles provisioning, scaling, and infrastructure entirely. You only write and deploy code.</P>
              <P>Analogy: Serverless is like renting a taxi vs owning a car. You don't maintain the vehicle, pay for gas when idle, or worry about the engine. You pay only for the ride you take — and there are always taxis available, whether you need one or a thousand simultaneously.</P>

              <DiagramBox title="Serverless Architecture Flow" diagram={`
  Triggers          Functions               Storage / Services
  ─────────         ─────────               ──────────────────

  HTTP Request  →  ┌─────────────┐
                   │  Function A  │  →  DynamoDB / RDS
  S3 Event      →  │  (Node.js)  │
                   └─────────────┘
  Cron Schedule →  ┌─────────────┐
                   │  Function B  │  →  S3 / Storage
  Queue Message →  │  (Python)   │
                   └─────────────┘
  DB Event      →  ┌─────────────┐
                   │  Function C  │  →  SES / SNS / Slack
  Auth Event    →  │  (Go)       │
                   └─────────────┘

  ☁️  Cloud Provider manages: servers, OS, runtime, scaling, availability`}
              />

              <H3 icon="🔧">FaaS Providers Comparison</H3>
              <Table
                headers={["Provider", "Service", "Max Duration", "Cold Start", "Best For"]}
                rows={[
                  ["AWS", "Lambda", "15 min", "100ms–1s", "General purpose, deep AWS integration"],
                  ["Google Cloud", "Cloud Functions / Cloud Run", "60 min (Run)", "Minimal (Run)", "Event-driven, container-based workloads"],
                  ["Azure", "Azure Functions", "10 min", "500ms–2s", "Microsoft ecosystem, enterprise"],
                  ["Cloudflare", "Workers", "30s CPU limit", "~0ms", "Edge computing, ultra-low latency"],
                  ["Vercel", "Edge Functions", "25s", "~0ms", "Frontend-adjacent APIs, SSR"],
                ]}
              />

              <ProCon
                pros={[
                  "Zero server management — focus purely on business logic",
                  "Automatic scaling from 0 to millions of requests instantly",
                  "Pay-per-execution pricing — zero cost when idle (unlike always-on servers)",
                  "Built-in high availability — provider handles redundancy",
                  "Rapid deployment — deploy a function in seconds",
                ]}
                cons={[
                  "Cold starts — first invocation after idle period has latency (50ms–2s)",
                  "Vendor lock-in — tied to AWS Lambda APIs, event formats, limits",
                  "Execution time limits — not suitable for long-running processes",
                  "Debugging is harder — no persistent environment, ephemeral logs",
                  "Stateless by nature — must externalize all state to DB/cache",
                  "Cost explodes at high constant traffic vs always-on servers",
                ]}
              />

              <Callout type="warning">
                Serverless is not always cheaper. At constant high traffic (&gt;100k req/min sustained), EC2 or ECS can be significantly cheaper than Lambda. Serverless shines for sporadic, unpredictable, or bursty workloads.
              </Callout>

              <Callout type="tip">
                Use Provisioned Concurrency (AWS Lambda) to eliminate cold starts for latency-sensitive functions. This pre-warms function containers, removing the cold start penalty at the cost of some always-on pricing.
              </Callout>

              <H3 icon="🏢">Real-World Use Cases</H3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {["Image resizing on S3 upload", "Webhook handlers", "Scheduled jobs (cron)", "API backends for mobile apps", "CI/CD pipeline steps", "IoT data processing", "Chatbot backends"].map(e => (
                  <Badge key={e} label={e} color={T.orange} />
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── HEXAGONAL ─────────────────────────────────────────────────── */}
        {activeTab === "hexagonal" && (
          <div>
            <SH tag="Pattern 6" title="Hexagonal / Clean Architecture" icon="⬡"
              subtitle="Design your core domain in complete isolation from infrastructure. Dependency flows inward — never outward from the core." />

            <Card>
              <H3 icon="📌">Core Concept</H3>
              <P>Hexagonal architecture (also called Ports & Adapters, popularized by Alistair Cockburn) places the <strong style={{ color: T.purple }}>domain at the center</strong>. All external concerns — HTTP, databases, queues, UIs — are adapters that plug into the domain via ports (interfaces).</P>
              <P>Clean Architecture (Robert C. Martin) formalizes this into concentric rings where <strong style={{ color: T.purple }}>dependencies always point inward</strong>. The innermost ring (entities/domain) knows nothing about the outer rings.</P>

              <DiagramBox title="Hexagonal Architecture (Ports & Adapters)" diagram={`
                ┌─────────────────────────────────────────────────────────┐
                │                  ADAPTERS (Outside)                     │
                │   HTTP REST │ gRPC │ CLI │ Message Queue │ GraphQL      │
                └────────────────────────┬────────────────────────────────┘
                                         │  (via Ports / Interfaces)
                ┌────────────────────────▼────────────────────────────────┐
                │                    APPLICATION CORE                     │
                │  ┌─────────────────────────────────────────────────┐   │
                │  │                 DOMAIN ENTITIES                  │   │
                │  │    (Business Rules, Pure Logic, No I/O)         │   │
                │  └─────────────────────────────────────────────────┘   │
                │  ┌─────────────────────────────────────────────────┐   │
                │  │              USE CASES / SERVICES                │   │
                │  │    (Orchestrates domain to fulfill use cases)    │   │
                │  └─────────────────────────────────────────────────┘   │
                └────────────────────────┬────────────────────────────────┘
                                         │  (via Ports / Interfaces)
                ┌────────────────────────▼────────────────────────────────┐
                │                 ADAPTERS (Infrastructure)               │
                │   PostgreSQL │ MongoDB │ S3 │ Redis │ SMTP │ Stripe     │
                └─────────────────────────────────────────────────────────┘`}
              />

              <H3 icon="🔑">Core Principles</H3>
              {[
                { name: "Ports (Interfaces)", color: T.purple, desc: "Abstract contracts defined by the domain that describe what capabilities it needs. e.g., UserRepository (for storage) or EmailSender (for notifications). The domain defines ports; adapters implement them." },
                { name: "Adapters (Implementations)", color: T.cyan, desc: "Concrete implementations of ports. PostgresUserRepository implements UserRepository. SendgridEmailSender implements EmailSender. Adapters are swappable without touching domain code." },
                { name: "Dependency Inversion Principle", color: T.yellow, desc: "High-level modules (domain) should not depend on low-level modules (database). Both should depend on abstractions (ports/interfaces). This is the foundation of the entire pattern." },
                { name: "Testability", color: T.green, desc: "Because the domain has zero dependencies on infrastructure, you can test all business logic with in-memory fakes. No database needed for 95% of your tests — blazing fast test suites." },
              ].map(c => <InfoBox key={c.name} title={c.name} accent={c.color}>{c.desc}</InfoBox>)}

              <CodeBlock lang="typescript (Clean Architecture example)">{`// DOMAIN LAYER - Pure business logic, zero dependencies
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

class User {
  constructor(public id: string, public email: string) {}
  changeEmail(newEmail: string): void {
    if (!newEmail.includes('@')) throw new Error('Invalid email');
    this.email = newEmail;
  }
}

// USE CASE - Orchestrates domain
class ChangeUserEmailUseCase {
  constructor(private userRepo: UserRepository) {}  // Depends on PORT, not Postgres
  
  async execute(userId: string, newEmail: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');
    user.changeEmail(newEmail);
    await this.userRepo.save(user);
  }
}

// ADAPTER - Infrastructure implementation (only this knows about Postgres)
class PostgresUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const row = await db.query('SELECT * FROM users WHERE id=$1', [id]);
    return row ? new User(row.id, row.email) : null;
  }
}`}</CodeBlock>

              <Callout type="insight">
                The real power: to switch from PostgreSQL to MongoDB, you write a new adapter and swap it in. The domain and all use cases are completely untouched. To run 1000 unit tests in 2 seconds, use an in-memory repository adapter — no database connection needed.
              </Callout>
            </Card>
          </div>
        )}

        {/* ── SOA ───────────────────────────────────────────────────────── */}
        {activeTab === "soa" && (
          <div>
            <SH tag="Pattern 7" title="Service-Oriented Architecture (SOA)" icon="🔗"
              subtitle="Enterprise pattern where services communicate via standardized protocols over a shared backbone — the precursor to microservices." />

            <Card>
              <H3 icon="📌">Definition</H3>
              <P>SOA is an <strong style={{ color: T.purple }}>enterprise integration style</strong> where large business functions are exposed as reusable services. These services communicate via standardized protocols (SOAP, WSDL, ESB) over a centralized Enterprise Service Bus (ESB).</P>
              <P>Analogy: SOA is like a large corporation's inter-department communication system — all departments (services) route requests through a central switchboard (ESB) with strict standardized communication formats (SOAP envelopes).</P>

              <DiagramBox title="SOA vs Microservices Architecture" diagram={`
  SOA PATTERN:                          MICROSERVICES PATTERN:
  ─────────────                         ─────────────────────

  ┌──────────┐ ┌──────────┐            ┌──────────┐ ┌──────────┐
  │Service A │ │Service B │            │Service A │ │Service B │
  └────┬─────┘ └────┬─────┘            └────┬─────┘ └────┬─────┘
       │             │                       │             │
  ┌────▼─────────────▼────┐                  │ direct API  │
  │   Enterprise Service  │           ┌──────▼─────────────▼──┐
  │      Bus (ESB)        │           │    API Gateway /       │
  │  (transforms, routes) │           │    Service Mesh        │
  └────┬─────────────┬────┘           └──────┬─────────────┬──┘
       │             │                        │             │
  ┌────▼─────┐ ┌─────▼────┐           ┌──────▼──┐ ┌───────▼─┐
  │Service C │ │Service D │           │Service C│ │Service D│
  └──────────┘ └──────────┘           └─────────┘ └─────────┘

  Shared ESB is single point            Smart endpoints,
  of failure & bottleneck               dumb pipes`}
              />

              <H3 icon="🔄">SOA vs Microservices: Key Differences</H3>
              <Table
                headers={["Dimension", "SOA", "Microservices"]}
                rows={[
                  ["Communication", "SOAP/WSDL over ESB (heavy)", "REST/gRPC/events (lightweight)"],
                  ["Granularity", "Coarse-grained (large services)", "Fine-grained (small, focused)"],
                  ["Data", "Shared enterprise data model/DB", "Each service owns its DB"],
                  ["Governance", "Centralized (ESB controls flow)", "Decentralized (teams own services)"],
                  ["Deployment", "Often deployed together", "Fully independent deployments"],
                  ["Team Size", "Works for large enterprise orgs", "Requires DevOps maturity per team"],
                  ["Typical Use", "Legacy enterprise integration", "Cloud-native, greenfield systems"],
                  ["Complexity", "ESB is a complex bottleneck", "Complexity distributed to teams"],
                ]}
              />

              <Callout type="note">
                SOA emerged in the early 2000s for enterprise systems (banks, telecoms). While largely superseded by microservices for new systems, many Fortune 500 companies still run SOA architectures. Understanding SOA is important for modernization/migration interviews.
              </Callout>

              <InfoBox title="When SOA Still Makes Sense" accent={T.yellow}>
                SOA remains relevant when: integrating legacy enterprise systems that predate APIs, when standardization across disparate teams is critical, when the organization mandates centralized governance, or when working within existing SAP/Oracle ecosystem constraints.
              </InfoBox>
            </Card>
          </div>
        )}

        {/* ── COMPARISON ────────────────────────────────────────────────── */}
        {activeTab === "comparison" && (
          <div>
            <SH tag="Reference" title="Architecture Patterns Comparison" icon="📊"
              subtitle="Complete side-by-side comparison of all major patterns across key dimensions." />

            <Card glow>
              <H3 icon="📊">Master Comparison Table</H3>
              <Table
                headers={["Pattern", "Scalability", "Complexity", "Deployment", "Best For", "Avoid When"]}
                rows={[
                  ["🧱 Monolith", "Vertical only", "Low", "Single unit, simple", "MVPs, small teams, startups", "Team &gt;50, distinct scaling needs"],
                  ["📚 Layered", "Moderate", "Low-Medium", "Single or multi-tier", "Enterprise apps, CRUD systems", "Need high scalability per layer"],
                  ["🔬 Microservices", "Horizontal (per service)", "Very High", "Independent per service", "Large teams, different scale needs", "Small teams, early products"],
                  ["⚡ Event-Driven", "Very High", "High", "Producers/consumers independently", "Real-time, async, audit trails", "Simple CRUD, strict consistency"],
                  ["☁️ Serverless", "Infinite (auto)", "Medium", "Function-level, instant", "Sporadic traffic, event processing", "Long-running, constant high load"],
                  ["⬡ Hexagonal", "Depends on infra", "Medium", "Any deployment strategy", "Maintainability, testability focus", "Tiny throwaway scripts"],
                  ["🔗 SOA", "Moderate (ESB limits)", "High", "Enterprise deployment", "Legacy integration, enterprise", "New greenfield systems"],
                ]}
              />

              <H3 icon="⚡">Decision Framework</H3>
              <DiagramBox title="Architecture Selection Decision Tree" diagram={`
  START: What is your primary constraint?
  │
  ├── 🚀 Speed to market / MVP?
  │    └──► Monolith (simplest, fastest to ship)
  │
  ├── 📈 Different components scale very differently?
  │    └──► Microservices (independent scaling)
  │
  ├── ⚡ High throughput async workflows / real-time?
  │    └──► Event-Driven (Kafka-based pipeline)
  │
  ├── 💰 Unpredictable or sporadic traffic?
  │    └──► Serverless (pay per use, auto-scale to zero)
  │
  ├── 🔧 Maintainability / legacy integration first?
  │    └──► Hexagonal / Clean Architecture
  │
  └── 🏢 Integrating existing enterprise systems?
       └──► SOA (existing ESB ecosystem)`}
              />

              <H3 icon="📏">Scalability Spectrum</H3>
              <DiagramBox title="Scalability vs Complexity Tradeoff" diagram={`
  Scalability
  ▲
  │  Serverless ☁️ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ Event-Driven ⚡
  │
  │                     Microservices 🔬
  │
  │                  SOA 🔗
  │
  │         Layered 📚
  │
  │  Monolith 🧱
  │
  └─────────────────────────────────────────────────────►  Complexity`}
              />

              <H3 icon="🎯">Interview Cheat Sheet</H3>
              <InfoBox title="Key Tradeoffs to Always Mention" accent={T.purple}>
                <strong>Monolith → Microservices:</strong> You gain independent scaling and deployment, but you take on distributed systems complexity, eventual consistency, and DevOps overhead.<br /><br />
                <strong>REST → Event-Driven:</strong> You gain decoupling and scalability, but you lose immediate consistency and gain debugging complexity.<br /><br />
                <strong>EC2 → Serverless:</strong> You gain zero ops burden and auto-scale, but you get cold starts, time limits, and vendor lock-in.<br /><br />
                <strong>Big Ball of Mud → Clean Arch:</strong> You gain testability and maintainability, but you pay an upfront cost in structure and ceremony.
              </InfoBox>
            </Card>
          </div>
        )}

        {/* ── INTERVIEW ─────────────────────────────────────────────────── */}
        {activeTab === "interview" && (
          <div>
            <SH tag="Interview Prep" title="How Architecture is Tested in Interviews" icon="🎯"
              subtitle="Master the strategy for answering architecture questions. Know what interviewers are actually evaluating." />

            <Card glow>
              <Callout type="danger">
                Architecture questions in interviews are not about getting the "right answer" — they're about demonstrating that you understand tradeoffs, can think at scale, and can justify your decisions under constraints. Show your thinking, not just conclusions.
              </Callout>

              <H3 icon="🗺️">Interview Answer Framework</H3>
              <InfoBox title="The STAR-T Method for Architecture Questions" accent={T.purple}>
                <strong>S</strong>cope — Clarify requirements (scale, read/write ratio, consistency needs)<br />
                <strong>T</strong>radeoffs — Name the key tradeoffs of your chosen pattern explicitly<br />
                <strong>A</strong>rchitecture — Draw the high-level diagram, name components<br />
                <strong>R</strong>efinement — Handle edge cases (failures, bottlenecks, hot spots)<br />
                <strong>T</strong>ech choices — Justify specific technologies (Kafka over RabbitMQ, PostgreSQL over MongoDB)
              </InfoBox>

              <H3 icon="❓">Common Interview Questions (Click to Expand)</H3>

              <InterviewQ
                q="When would you choose microservices over a monolith?"
                strategy="Start with: 'It depends on the scale and team structure.' Then walk through the 3 key factors: team size, independent scaling needs, and tech stack diversity. Never say microservices is always better."
                answer="I'd choose microservices when three conditions are met: First, the engineering team is large enough (50+ engineers) that a monolith creates merge conflicts and deployment bottlenecks. Second, different components genuinely have different scaling requirements — for example, a video transcoding service needs GPU machines while the user auth service needs none. Third, the organization has DevOps maturity to manage service meshes, distributed tracing, and independent CI/CD pipelines. Before these conditions are met, I'd start with a modular monolith and extract services only when specific pain points arise, not speculatively."
              />

              <InterviewQ
                q="Design a notification system for 10 million users using event-driven architecture"
                strategy="Use the pattern: trigger → event → broker → consumers. Explain the fan-out problem (millions of users) and why async is mandatory. Discuss Kafka partitioning, consumer groups, and at-least-once delivery."
                answer="The core is a Kafka pipeline. When an event occurs (e.g., a new like), the service publishes a 'like.created' event to a Kafka topic. A Notification Processor service consumes this, looks up user preferences, and routes to channel-specific workers: email, push, SMS. For 10M users, we'd fan out asynchronously — the processor publishes to per-channel topics (notifications.email, notifications.push). Email workers batch 1000 emails per Lambda invocation. Push notification workers use APNs/FCM batch APIs. We use Kafka consumer groups for horizontal scaling. For deduplication, we use Redis with event ID as key. For user timezone preferences, we use a scheduled delivery queue with delayed processing."
              />

              <InterviewQ
                q="What's the difference between SOA and Microservices?"
                strategy="Key distinction: SOA uses a shared ESB and coarse-grained services; Microservices uses direct communication (smart endpoints, dumb pipes) and fine-grained services. SOA = centralized, Microservices = decentralized."
                answer="Both decompose applications into services, but the philosophy differs fundamentally. SOA centers around an Enterprise Service Bus that handles routing, transformation, and orchestration — the ESB is the brain. This creates a central bottleneck and single point of failure. Microservices reject the central bus in favor of smart endpoints and dumb pipes — services communicate directly via REST/gRPC or async events, and each service is responsible for its own logic. SOA also typically shares a data model and database, while microservices each own their data store. In practice, microservices are more granular, more independently deployable, and more suitable for cloud-native development."
              />

              <InterviewQ
                q="How would you migrate a monolith to microservices?"
                strategy="The Strangler Fig Pattern is the canonical answer. Never recommend a big-bang rewrite. Discuss incremental extraction, database decomposition, and the dual-write period."
                answer="I'd use the Strangler Fig pattern — incrementally replace parts of the monolith rather than a risky big-bang rewrite. Step 1: identify bounded contexts (natural service boundaries) within the monolith. Step 2: extract the highest-value or most pain-causing service first (often the one with the most deployment conflicts). Step 3: during transition, use an API gateway to route traffic — new requests go to the microservice, old requests still hit the monolith. Step 4: implement database decomposition — the extracted service gets its own database, with a dual-write period while you migrate data. Step 5: retire the monolith code path once the service is stable. This can take months per service, and that's expected and healthy."
              />

              <InterviewQ
                q="What are the challenges of event-driven architecture and how would you address them?"
                strategy="Don't just praise event-driven. Show maturity by discussing the real challenges: eventual consistency, idempotency, event ordering, schema evolution, and debugging. Each challenge has a known solution."
                answer="Three major challenges: First, eventual consistency — consumers may process events out of order or be temporarily behind. Solution: design consumers to be idempotent (processing the same event twice has the same effect as once) and use optimistic locking in the database. Second, event ordering — Kafka only guarantees order within a partition, not globally. Solution: use a single partition per entity (e.g., one partition per user ID using consistent hashing). Third, schema evolution — producers change event formats, breaking consumers. Solution: use a Schema Registry (Confluent) with backward-compatible evolution rules. For debugging, use distributed tracing with correlation IDs embedded in event headers (Jaeger/Zipkin)."
              />
            </Card>
          </div>
        )}

        {/* ── MISTAKES ──────────────────────────────────────────────────── */}
        {activeTab === "mistakes" && (
          <div>
            <SH tag="Anti-Patterns" title="Common Architecture Mistakes" icon="⚠️"
              subtitle="The costly mistakes that engineers make — and how to avoid them." />

            <Card>
              {[
                {
                  title: "Premature Microservices",
                  icon: "🔥",
                  type: "danger",
                  mistake: "Breaking a new application into microservices from day one because 'Netflix does it.'",
                  consequence: "You end up with the complexity of distributed systems without the scale that justifies them. 5-person team managing 20 services, each with its own pipeline, monitoring, and database.",
                  fix: "Start with a monolith. Extract services when you have concrete pain: specific scaling bottlenecks, team ownership conflicts, or technology mismatch. Let scale justify the complexity."
                },
                {
                  title: "Ignoring Communication Overhead",
                  icon: "📡",
                  type: "warning",
                  mistake: "Designing microservices that make synchronous HTTP calls to 5-6 other services per request.",
                  consequence: "A single user request that was 5ms in a monolith now takes 200ms due to network latency across service hops. If any service is slow or down, the whole request fails.",
                  fix: "Minimize synchronous call chains. Use async events for non-critical flows. Implement circuit breakers (Hystrix, Resilience4j). Apply the BFF (Backend for Frontend) pattern to aggregate data at the edge."
                },
                {
                  title: "Architecture Without Scale Requirements",
                  icon: "📏",
                  type: "warning",
                  mistake: "Choosing architecture based on trend rather than actual requirements. 'We'll do event-driven because Kafka is modern.'",
                  consequence: "Over-engineered systems that cost 10x more to operate and take 3x longer to develop, for requirements that a simple CRUD app could handle.",
                  fix: "Always start with numbers: expected RPS, read/write ratio, data volume, team size. Let requirements drive architecture, not the reverse."
                },
                {
                  title: "Distributed Monolith",
                  icon: "💀",
                  type: "danger",
                  mistake: "Splitting code into services but keeping a shared database or tight synchronous dependencies between all services.",
                  consequence: "You have all the complexity of microservices (network calls, distributed debugging, service discovery) with none of the benefits (independent scaling, independent deployment). The worst of both worlds.",
                  fix: "If services share a database, they're not microservices — they're a distributed monolith. Each service must own its data. Use events for cross-service data synchronization."
                },
                {
                  title: "Event Sourcing Everywhere",
                  icon: "📦",
                  type: "warning",
                  mistake: "Using event sourcing and CQRS for simple CRUD applications because it sounds sophisticated.",
                  consequence: "Massively complex codebase, eventual consistency headaches, and debugging nightmares for a simple blog or CRUD API that needed none of this.",
                  fix: "Event sourcing shines for audit trails, financial systems, and collaborative editing. For most apps, a simple database with timestamps is sufficient. Reserve event sourcing for where replay and history are genuine requirements."
                },
                {
                  title: "Ignoring the Fallacies of Distributed Computing",
                  icon: "🌐",
                  type: "note",
                  mistake: "Assuming that network calls are reliable, fast, and instantaneous — just like in-process function calls.",
                  consequence: "Systems that don't handle timeouts, partial failures, network partitions, or slow responses — leading to cascading failures.",
                  fix: "Embrace the 8 fallacies of distributed computing. Design for failure: timeouts on every external call, retries with exponential backoff, circuit breakers, bulkheads, and graceful degradation."
                },
              ].map((m, i) => (
                <div key={i} style={{
                  background: T.bgSection, border: `1px solid ${T.border}`,
                  borderRadius: 12, padding: "20px", marginBottom: 16
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>{m.title}</span>
                    <Badge label={m.type === "danger" ? "Critical" : "Warning"} color={m.type === "danger" ? T.red : T.yellow} />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.red, letterSpacing: "0.08em", marginBottom: 5 }}>❌ THE MISTAKE</div>
                    <div style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>{m.mistake}</div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.orange, letterSpacing: "0.08em", marginBottom: 5 }}>💥 CONSEQUENCE</div>
                    <div style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>{m.consequence}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.green, letterSpacing: "0.08em", marginBottom: 5 }}>✅ THE FIX</div>
                    <div style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>{m.fix}</div>
                  </div>
                </div>
              ))}

              <Callout type="insight">
                The engineers who avoid these mistakes are the ones who ask "why" before "what." Why do we need microservices? Why Kafka over a simple queue? Why event-driven over REST? The answer reveals whether the complexity is justified.
              </Callout>
            </Card>
          </div>
        )}

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <div style={{
          marginTop: 40, paddingTop: 24, borderTop: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ color: T.textMuted, fontSize: 12 }}>System Design · Architecture Patterns</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Monolith", "Microservices", "Event-Driven", "Serverless"].map(t => (
              <Badge key={t} label={t} color={T.textMuted} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
