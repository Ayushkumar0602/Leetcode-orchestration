
<div align="center">

# 🧠 Summer — Self-Evolving AI Architecture

### *An AI assistant that learns, reflects, and improves itself — autonomously, while you sleep.*

[![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=for-the-badge&logo=github)](https://github.com)
[![Architecture](https://img.shields.io/badge/Architecture-Self--Evolving-blueviolet?style=for-the-badge&logo=googlegemini)](https://github.com)
[![Phase](https://img.shields.io/badge/Phase-1%20of%206-orange?style=for-the-badge)](https://github.com)
[![AI Engine](https://img.shields.io/badge/LLM-Google%20Gemini-4285F4?style=for-the-badge&logo=google)](https://github.com)

<br/>

> **"What if your AI assistant didn't just respond to you — but *grew* between conversations?"**

</div>

---

## 🚀 The Idea — In One Sentence

Summer is a personal AI assistant with a **Cortex Engine** — a background brain that activates the moment you're idle, analyzes everything that went wrong in your past sessions, and **autonomously generates new capabilities** to fix those gaps before your next conversation.

---

## 🌟 Why This Is Different

Most AI assistants are static. You train them with prompts, they forget by next session, and they make the same mistakes every day.

**Summer is different.** It introduces a novel architectural pattern I call **Idle-Time Self-Evolution:**

| Trait | Traditional AI | Summer (Cortex Engine) |
|---|---|---|
| Learning | Frozen at training cutoff | Evolves between every session |
| Failures | Repeated indefinitely | Detected, analyzed, and patched |
| Capabilities | Fixed by the vendor | Self-generated, tiered, and audited |
| Memory | Context-window-bound | Persistent knowledge graph with decay + pruning |
| Downtime | Wasted | Active self-improvement cycles |

---

## 🏗️ Architecture Overview

Summer's architecture is built in layers. The **Cortex Engine** is a new autonomous subsystem that plugs into 8 exact integration points of the existing system — without breaking a single existing component.

```
┌─────────────────────────────────────────────────────────┐
│                    SUMMER BRAIN                          │
│                                                         │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────┐  │
│  │  Event Bus  │◄──►│ Brain Bridge │◄──►│ WebSocket  │  │
│  │ (Singleton) │    │  LiveSession │    │   Server   │  │
│  └──────┬──────┘    └──────┬───────┘    └────────────┘  │
│         │                  │                             │
│  ┌──────▼──────────────────▼───────────────────────┐    │
│  │              KNOWLEDGE LAYER                     │    │
│  │  Graph Store │ Graph Search │ Session Diary      │    │
│  │  Embeddings  │ Proc. Memory │ Context Injector   │    │
│  └──────────────────────────┬────────────────────── ┘    │
│                             │                            │
│  ┌──────────────────────────▼────────────────────────┐  │
│  │         🆕  CORTEX ENGINE  (Self-Evolution)        │  │
│  │                                                    │  │
│  │   Gap Detector → Skill Forge → Memory Consolidator│  │
│  │   Self-Reflector → Knowledge Harvester → Audit Log│  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### The Cortex Module Map (`src/cortex/`)

```
src/cortex/
├── 🔄 cortex-engine.js          ← Master idle-loop controller
├── 🔍 gap-detector.js           ← Mines failures from diary + memory
├── ⚒️  skill-forge.js            ← Auto-generates new skill files
├── 🧹 memory-consolidator.js    ← Graph dedup, decay pruning, pattern mining
├── 🌐 knowledge-harvester.js    ← Proactive web research (Phase 4, opt-in)
├── 📔 self-reflector.js         ← Daily meta-analysis + evolution journal
├── 📋 staging-registry.js       ← Beta skill lifecycle tracking
├── 🛡️  sandbox-validator.js      ← AST static analysis on all generated code
└── 📜 evolution-log.js          ← Append-only, tamper-evident audit trail
```

---

## ⚡ How It Works — The Idle Cycle

```
User disconnects
      │
      ▼
  [60s cooldown]       ← Ensures you're truly done for the session
      │
      ▼
  CORTEX AWAKE         ← Up to 12 cycles, 5 mins apart (~1 hr max)
      │
      ├── Cycle 1:  Memory Consolidation
      │              └─ Dedup entities, prune decayed nodes, connect islands
      │
      ├── Cycle 2:  Gap Detection
      │              └─ Analyze diary + anti-pattern memory → find failures
      │
      ├── Cycle 3:  Skill Forge
      │              └─ Generate Tier 1 skill → validate → hot-load
      │
      └── Cycle N:  Self-Reflection
                     └─ Write EvolutionJournal → queue user notification
User reconnects
      │
      ▼
 "Sir, while you were away, I noticed I kept struggling with Docker
  commands — so I taught myself Docker best practices."
```

---

## 🔐 Security Architecture — The 5 Pillars

Self-modifying AI is dangerous if done carelessly. Here's how every risk is neutralized:

### 1. 🧱 Tiered Capability System
Generated capabilities are **never executable code in the main process.**

| Tier | What It Is | Can Execute? | Auto-Promoted? |
|---|---|---|---|
| **Tier 1** *(live)* | Context-injection string | ❌ Just text | ✅ After 3 uses, 0 errors |
| **Tier 2** *(planned)* | Tool declaration schema | ❌ Metadata only | 🔜 Manual review |
| **Tier 3** *(future)* | Plugin (Worker Thread) | ✅ Sandboxed | 🔜 Manual review |

### 2. 🚧 Write-Boundary Enforcement
The Cortex can **only** write to:
- `src/skills/` — new context strings
- `plugins/.staging/` — staged plugins (not yet active)

It has **zero access** to `src/core/`, `src/orchestration/`, `src/main/`, `src/tools/`.

### 3. 🔬 Static AST Validation (sandbox-validator.js)
Every generated file is parsed as an AST before being loaded.  
**Instant rejection** if the code contains: `require()`, `import`, `eval`, `Function()`, `child_process`, `fs`, `net`, `http`, or any function declaration.

### 4. 💰 Cost Governor
```javascript
const COST_LIMITS = {
    maxLlmCallsPerCycle:   3,       // Per 5-minute cycle
    maxLlmCallsPerWake:   15,       // Per idle session (~1 hour max)
    maxTokensPerDay:  100_000,      // ~$0.01/day on Gemini Flash
    lowPowerThreshold: 10_000,      // Below this → no LLM, maintenance only
};
```

### 5. 🔴 Multi-Layer Kill Switch
```
--no-cortex flag        → Never starts
CORTEX_ENABLED=false    → Never starts
Client connects         → Instant pause (same event loop tick)
cortex.stop()           → Clean teardown on any SIGINT/SIGTERM
```

---

## 📅 Build Roadmap

### ✅ Phase 1 — The Heartbeat *(In Progress)*
> Zero LLM calls. Zero risk. Just setting the foundation.

- [x] Architecture design & full codebase audit
- [x] Integration point mapping (8 touch points)
- [ ] `cortex-engine.js` — idle detection loop
- [ ] `memory-consolidator.js` — graph dedup + decay pruning
- [ ] `evolution-log.js` — append-only audit trail
- [ ] Event Bus + Paths + Daemon wiring

**Goal:** Watch logs print `[CortexEngine] AWAKE. Running cycle 1/12...` after you disconnect.

---

### 🔜 Phase 2 — The Mind's Eye *(~1 week)*
> Read-only LLM analysis. Detects problems, doesn't solve them yet.

- [ ] `gap-detector.js` — mine session diary + procedural memory for failures
- [ ] `self-reflector.js` — daily evolution journal entry
- [ ] `staging-registry.js` — lifecycle tracking
- [ ] New graph node types: `CapabilityGap`, `EvolutionJournal`

**Goal:** After real sessions, see `Found 2 capability gaps: docker_commands, calendar_sync`.

---

### 🔜 Phase 3 — The Forge *(~2 weeks)*
> First auto-generated skills. Context-only, zero executable code.

- [ ] `skill-forge.js` — structured JSON output → skill file
- [ ] `sandbox-validator.js` — AST validation gate
- [ ] `skill-loader.js` — add `hotReloadSkill()` + `removeSkill()`
- [ ] Pending notification integration ("I taught myself X")

**Goal:** Summer generates a new skill while you sleep, and tells you about it when you wake up.

---

### 🔮 Phase 4 — The Harvester *(Opt-in Only)*
> Proactive knowledge gathering. Summer researches topics before you even ask.

- [ ] `knowledge-harvester.js` — web research for stale high-importance nodes
- [ ] New graph node type: `HarvestedKnowledge`
- [ ] Opt-in configuration gate

---

### 🔮 Phase 5 — Temporal Intelligence
> Summer learns *when* you think best, not just *what* you think.

- [ ] Temporal pattern extraction from diary timestamps + emotion tags
- [ ] Context injection: "You're most focused on deep work Tuesdays, 9-11am"
- [ ] New graph node type: `TemporalPattern`

---

### 🔮 Phase 6 — Evolution UI
> A live window into Summer's mind — watch it grow in real time.

- [ ] New "Evolution" tab in Memory UI
- [ ] Live view: gaps found, skills staged, journal entries
- [ ] Skill promotion/demotion controls
- [ ] Evolution audit log viewer

---

## 🧩 System Integration Points

The Cortex plugs into the existing architecture at **8 exact points** — no architecture overhaul required:

| # | Where | File | What Cortex Does |
|---|---|---|---|
| 1 | Idle Detection | `client-registry.js` | Listen for `CLIENT_DISCONNECTED`, check `count() === 0` |
| 2 | Gap Mining | `session-diary.js` | Read `loadDiary()` for recent session failures |
| 3 | Gap Mining | `procedural-memory.js` | Read `getProceduralMemories({ subtype: 'anti_pattern' })` |
| 4 | Skill Hot-Load | `skill-loader.js` | Call new `hotReloadSkill()` after generation |
| 5 | Plugin Staging | `plugin-registry.js` | Write to `plugins/.staging/`, call `reloadPlugins()` |
| 6 | Knowledge Storage | `graph-store.js` | Use `mergeGraph()` + `saveGraph()` for new node types |
| 7 | Event Bus | `event-bus.js` | New events: `CORTEX_AWAKE`, `CORTEX_SLEEP`, `CORTEX_CYCLE_DONE` |
| 8 | User Notifications | `pending-notifications.js` | Queue evolution summaries for next session |

---

## 📊 Current State (June 2026)

```
Architecture Status:  ██████████ 100%  Complete design
Codebase Audit:       ██████████ 100%  All 50+ files mapped
Security Design:      ██████████ 100%  5-pillar threat model done
Phase 1 Code:         ████░░░░░░  40%  In active development
Phase 2 Code:         ░░░░░░░░░░   0%  Planned
Phase 3 Code:         ░░░░░░░░░░   0%  Planned
```

**Lines of architecture planned:** ~2,400  
**Existing codebase touch points:** 8 files, ~60 lines of additions  
**New modules:** 8 files in `src/cortex/`  
**LLM cost per idle session:** < $0.01 (Gemini Flash)  
**Max CPU impact on user session:** 0% (Cortex pauses instantly on connect)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (Electron + headless daemon mode) |
| LLM | Google Gemini 2.0 Flash (via `@google/genai`) |
| Knowledge Graph | Custom JSON graph with embedding-based search |
| Transport | WebSocket (custom binary protocol) |
| IPC | Electron IPC + custom EventBus singleton |
| Code Validation | Node.js `vm` module + AST parsing (acorn) |
| Persistence | JSON Lines audit log + Supabase sync |
| Multi-device | Supabase real-time graph sync |

---

## 💡 The Bigger Vision

This architecture is a step toward something more profound:

> **An AI that doesn't just know about the world — but knows about *you*, learns from *your failures*, and permanently improves itself to serve *your specific context*.**

Most AI products today are one-size-fits-all. Summer is building toward being the AI that is uniquely shaped by one person — adapted to their workflows, their language, their patterns, their preferences — and continuously refining that shape every time they step away.

**The goal isn't AGI. The goal is *your* AI.**

---

## 🤝 Connect & Collaborate

I'm building this in public and documenting every architectural decision.

If you're working on:
- 🧠 Long-term memory for AI assistants
- 🔄 Self-improving / meta-learning AI systems  
- 🔐 Security architectures for autonomous AI agents
- 🏗️ AI system design at the infra level

**Let's talk.**

---

<div align="center">

*Built with obsessive attention to architecture detail.*  
*Every integration point mapped. Every security boundary hardened. Every byte accounted for.*

**Follow along as Summer learns to grow.**

</div>
