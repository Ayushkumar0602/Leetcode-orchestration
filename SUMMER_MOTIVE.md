<div align="center">

# 🌙 Summer — The Brain Behind Whizan AI

### *Most AI assistants answer questions. Summer grows between them.*

<br/>

[![Built on Gemini](https://img.shields.io/badge/Powered%20By-Google%20Gemini-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)
[![Architecture](https://img.shields.io/badge/Architecture-Self--Evolving-blueviolet?style=for-the-badge)](https://github.com)
[![Status](https://img.shields.io/badge/Status-Active%20Build-brightgreen?style=for-the-badge&logo=github)](https://github.com)
[![Platform](https://img.shields.io/badge/Platform-Whizan%20AI-FF6B35?style=for-the-badge)](https://github.com)

<br/>

> **"I didn't want to build another chatbot wrapper.**
> **I wanted to build something that learns — really learns — from every conversation it has."**

</div>

---

## 🎯 The Motive

When I started building **Whizan AI**, the goal was straightforward: an intelligent technical interview coach powered by AI. Adaptive interviews. Real-time feedback. Smart scoring. That part works.

But the more I used it, the more I noticed the same gap in every AI product I encountered:

> **The AI is brilliant in the moment. But it doesn't remember. It doesn't grow. It doesn't improve.**

Every session starts from zero. Every mistake gets repeated. The AI that helped you yesterday has no memory of yesterday.

That bothered me. Not as a technical complaint — but as a *product philosophy* question:

**What if your AI coach actually got better at coaching you, specifically, over time?**

That question became **Summer** — and specifically, its **Self-Evolving Architecture**.

---

## 🧠 What Summer Is

Summer is the AI layer that runs inside Whizan AI. It's not a feature — it's the operating system.

It does what every AI assistant does: processes context, calls Gemini, generates responses, manages memory. But it has one capability that separates it from every other assistant I've seen built:

**It evolves between your sessions — autonomously, without you lifting a finger.**

When you disconnect, a background process called the **Cortex Engine** wakes up. It reads everything that went wrong in your sessions. It finds the gaps. It generates new capabilities to fill them. And when you come back, it tells you what it learned while you were away.

---

## ✅ What's Built Today

### Inside Whizan AI, Summer Powers:

| Capability | What It Does | Status |
|---|---|---|
| 🎙️ **Adaptive AI Interviews** | 6-phase state-machine interviews with Socratic hints | ✅ Live |
| 💻 **7-Language Code Execution** | Native compile + execute in browser across Python, JS, C++, Java, Go, Rust, C | ✅ Live |
| 📚 **1,000+ Problem Library** | DSA problems tagged by company, topic, difficulty | ✅ Live |
| 📊 **AI Evaluation Reports** | 6-dimension skill scoring + hire/no-hire recommendation | ✅ Live |
| 🏛️ **System Design Training** | HLD + LLD modules with interactive whiteboard | ✅ Live |
| 📄 **Resume Intelligence** | Gemini Vision PDF parsing + GitHub README analysis | ✅ Live |
| 🤖 **Jarvis (AI Coach)** | Context-aware assistant with RAG over knowledge base | ✅ Live |
| 🎤 **Voice Interviewer** | 6 AI voice personalities with video sync (Sarvam AI TTS) | ✅ Live |
| 💼 **Autonomous Job Applier** | Playwright-based browser agent that applies to jobs for you | ✅ Live |
| 📱 **Push Notifications** | FCM-powered smart reminders and achievement alerts | ✅ Live |
| 💰 **Subscription Engine** | Razorpay + Spark/Blaze plans with email automation | ✅ Live |

### The Knowledge Graph (Summer's Memory)

Every conversation goes into Summer's long-term memory — not just chat logs, but a structured **knowledge graph** with:

- **Session diary** — what happened, what you asked, what failed
- **Procedural memory** — patterns in your behavior and corrections
- **Embeddings-based search** — semantic retrieval across your entire history
- **Entity resolution** — deduplicating concepts across sessions
- **Decay scoring** — important memories stay, stale ones fade
- **Multi-device sync** — everything synced across devices via Supabase

This is the foundation that makes everything below possible.

---

## 🚧 What's Being Built Now — The Cortex Engine

The Self-Evolving Architecture is Summer's next capability. It is **not** a new product — it is a new module that plugs directly into Summer's existing architecture at 8 precise integration points.

The core idea:

```
You disconnect from Whizan AI
          │
          ▼  [60-second cooldown — confirming you're done]
          │
          ▼
  ┌────────────────────────────────┐
  │     CORTEX ENGINE WAKES UP     │
  │  (runs only when you're idle)  │
  └────────────┬───────────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
  Memory    Gap        Skill
  Cleanup   Detection  Forge
  
  "Pruning 3 stale nodes..."
  "Found: 2 capability gaps"  
  "Generated: docker-skill.js"
  "Validated: ✅ AST clean"
  "Hot-loaded into runtime"
               │
               ▼
  You reconnect. Summer greets you:
  ─────────────────────────────────────
  "Sir, while you were away, I noticed
   I kept struggling with Docker-related 
   questions — so I taught myself Docker 
   best practices. Want to test it?"
  ─────────────────────────────────────
```

### The Cortex Module Breakdown

```
src/cortex/
├── 🔄 cortex-engine.js        ← Master idle-loop (awake/sleep lifecycle)
├── 🔍 gap-detector.js         ← Mines session diary + anti-pattern memory
├── ⚒️  skill-forge.js          ← Generates new skill files from detected gaps
├── 🧹 memory-consolidator.js  ← Dedup, prune decayed nodes, reconnect islands
├── 🌐 knowledge-harvester.js  ← Proactive web research (opt-in, Phase 4)
├── 📔 self-reflector.js       ← Daily evolution journal entry
├── 📋 staging-registry.js     ← Beta skill lifecycle: staged → active → promoted
├── 🛡️  sandbox-validator.js   ← AST static analysis — rejects any executable code
└── 📜 evolution-log.js        ← Append-only audit trail of every Cortex action
```

### Build Phases

#### ✅ Architecture & Design — *Complete*
- Full audit of 50+ source files
- 8 integration points mapped (zero architectural overhaul needed)
- 5-pillar security model designed
- All module interfaces specified

#### 🔄 Phase 1 — The Heartbeat *(Active)*
> No LLM calls. No risk. Just the idle loop + memory housekeeping.
- `cortex-engine.js` — idle detection, client connect/disconnect wiring
- `memory-consolidator.js` — entity dedup, decay pruning
- `evolution-log.js` — append-only JSONL audit trail
- Event bus + daemon wiring

**Milestone:** `[CortexEngine] AWAKE. Running cycle 1/12...` in daemon logs after disconnect.

#### 🔜 Phase 2 — The Mind's Eye *(~1 week)*
> Read-only analysis. Sees problems. Doesn't solve them yet.
- `gap-detector.js` — LLM analysis of diary + procedural memory
- `self-reflector.js` — daily evolution journal
- New graph node types: `CapabilityGap`, `EvolutionJournal`

**Milestone:** `Found 2 capability gaps: docker_commands, calendar_sync` in logs.

#### 🔜 Phase 3 — The Forge *(~2 weeks)*
> First auto-generated skills. Context-only strings, zero executable code.
- `skill-forge.js` — structured Gemini output → skill file
- `sandbox-validator.js` — AST gate: reject any `require()`, `eval`, function
- `hotReloadSkill()` added to skill-loader
- Pending notification: "I taught myself X"

**Milestone:** Summer generates a skill while you sleep and tells you when you wake up.

---

## 🔮 Future Enhancements

### Near-Term (Phases 4–6)

| Enhancement | What It Means |
|---|---|
| **🌐 Knowledge Harvester** | Summer proactively researches topics from your knowledge graph before you even ask. Opt-in only. |
| **⏰ Temporal Intelligence** | Learns *when* you think best — "You're sharpest on deep work Tuesdays 9–11am" — and adapts accordingly |
| **🪟 Evolution UI** | A live "Summer's Mind" tab in Whizan: watch gaps found, skills staged, journal entries form in real time |
| **🏆 Skill Promotion System** | Generated skills auto-promote after 3 successful uses with 0 errors. Manual review for anything higher. |
| **📡 Cross-Device Evolution** | Cortex-generated skills and evolution state synced via Supabase — evolve on laptop, benefit on mobile |

### Longer Vision

| Capability | Description |
|---|---|
| **Tier 2: Tool Declarations** | Summer proposes new tool *schemas* — you approve, it wires up the handler. AI designs its own API surface. |
| **Tier 3: Plugin Generation** | Full plugin generation with sandboxed Worker Thread execution — community trust level, no API key access |
| **Interviewer Personalization** | Cortex learns your interviewer's patterns from your session history and adapts the AI interviewer's behavior |
| **Self-Improving Evaluation** | Evaluation rubrics improve based on feedback — Summer notices when its scores don't match your satisfaction |
| **Collaborative Evolution** | Opt-in: evolved capabilities (anonymized) shared across Whizan users — community intelligence |

---

## 🔐 Why This Isn't Dangerous

Self-modifying AI raises real concerns. Here's how every risk is addressed:

### Generated Code Never Touches the Main Process

| What Cortex Generates | Execution? | Access? |
|---|---|---|
| Tier 1 Skill (context string) | ❌ It's just text injected into a prompt | Nothing |
| Tier 2 Tool Schema (future) | ❌ Metadata only — execution is hand-written | Nothing |
| Tier 3 Plugin (future) | ✅ Worker Thread | Sandboxed — OS env only, zero API keys |

### The 5 Guardrails

1. **Write Boundaries** — Cortex writes only to `src/skills/` and `plugins/.staging/`. Zero access to core, orchestration, or tools.
2. **AST Validation** — Every generated file parsed before load. Auto-rejected if it contains `require()`, `import`, `eval`, `Function()`, `fs`, `net`, `http`, or any function body.
3. **Cost Governor** — Hard cap: 3 LLM calls/cycle, 15/session, 100K tokens/day. Estimated cost: <$0.01 per idle session.
4. **Staging Registry** — All Cortex capabilities enter staging. Auto-promote after 3 uses + 0 errors. Auto-demote after 2 errors.
5. **Kill Switch** — `--no-cortex` flag, `CORTEX_ENABLED=false` env var, instant pause on any client connection, clean teardown on shutdown.

---

## 📊 State of the Build (June 2026)

```
Core Whizan AI Platform        ██████████ 100%  Live & serving users
Summer Knowledge Graph         ██████████ 100%  Persistent, multi-device
Self-Evolving Architecture:
  ↳ Architecture Design        ██████████ 100%  All 50+ files audited
  ↳ Security Model             ██████████ 100%  5-pillar threat model done
  ↳ Phase 1 (Heartbeat)        ████░░░░░░  40%  Active development
  ↳ Phase 2 (Mind's Eye)       ░░░░░░░░░░   0%  Next sprint
  ↳ Phase 3 (The Forge)        ░░░░░░░░░░   0%  Planned
```

**New modules planned:** 8 files (`src/cortex/`)  
**Existing files touched:** 8 files, ~60 lines of additions  
**Architecture style:** Plugin-in — zero core modifications  
**LLM cost per idle session:** < $0.01 (Gemini 2.0 Flash)  
**CPU impact during user session:** 0% (Cortex pauses instantly on connect)

---

## 💡 The Bigger Thought

Most AI products are built to be *used*.

Summer is built to *learn from being used*.

That's a different philosophy — and it requires a different architecture. Not a bigger model. Not more prompts. A system that watches, reflects, and quietly improves itself in the background, the way a good mentor does between sessions.

> **The goal isn't AGI. The goal is *your* AI — shaped by your workflows, your mistakes, your patterns — and getting better at serving you every single day.**

I'm building this in the open, documenting every decision, every integration point, every security tradeoff. Because I think this architectural pattern — **Idle-Time Self-Evolution** — is something the industry needs to talk about more.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19.2 + Vite |
| Backend | Node.js + Express (Render) |
| LLM | Google Gemini 2.0 Flash (`@google/genai`) |
| Voice | Sarvam AI TTS with MediaSource streaming |
| Database | Firebase Firestore + Realtime DB |
| Knowledge Graph | Custom JSON graph + embedding-based search |
| Vector Store | Supabase pgvector |
| Code Execution | Native compilation (gcc, javac, etc.) — no Docker |
| Payments | Razorpay |
| Cortex Validation | Node.js `vm` + AST parsing (acorn) |
| Evolution Persistence | JSON Lines audit log + Supabase sync |

---

## 🤝 Let's Talk

I'm building this fully in the open.

If you're working on:
- 🧠 Long-term memory for AI systems
- 🔄 Self-improving / continuously learning agents
- 🔐 Security models for autonomous AI code generation
- 🏗️ AI system architecture at the infrastructure level

**I want to hear your perspective.** Connect with me on LinkedIn.

---

<div align="center">

**Whizan AI** → The interview platform.  
**Summer** → The brain that grows.  
**Cortex Engine** → The part that evolves overnight.

*Full technical deep-dive: [`SELF_EVOLVING_ARCHITECTURE.md`](./SELF_EVOLVING_ARCHITECTURE.md)*

<br/>

*Built with the conviction that AI should compound, not reset.*

</div>
