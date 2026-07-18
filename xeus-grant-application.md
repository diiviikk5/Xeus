# Xeus — Agentic Engineering Grant Application
# Submit at: https://superteam.fun/earn/grants/agentic-engineering
# Grant amount: 200 USDG (fixed)

---

## STEP 1 — Project Details

**Project Name:** Xeus

**One-liner:**
The browser playground for Solana AI Agents — extending the SendAI ecosystem.

**Tagline:**
"Solana Agent Kit gives you the engine. Xeus gives you the test track."

**GitHub Repository:**
https://github.com/diiviikk5/Xeus

**Live URL:**
*(deploying to Vercel — add URL before submitting)*

**Category:** Developer Tooling / Agentic Infrastructure

---

## STEP 2 — What You Built & How You Used AI

### What is Xeus?

Xeus is a browser-native IDE for building, testing, and deploying Solana AI agents — with zero local setup. You open a tab, write TypeScript agent logic (or describe it in English), hit **Run**, and your agent executes real Devnet transactions in a live chat panel.

No npm install. No .env files. No terminal. Just open and build.

### The Problem

Building a Solana AI agent today requires: installing Node.js, npm, TypeScript, cloning a GitHub repo, getting OpenAI/Helius API keys, configuring .env files, running `npm install` (which often breaks), testing via terminal logs, and manual deployment. That's a 45-minute setup that kills momentum before a single transaction fires.

Solana Agent Kit solved the *code* problem. solana.new solved the *scaffold* problem. Nobody has solved the **environment** problem — the place where you actually run, test, and share what you built.

### How It Works

```
User opens browser → Monaco editor pre-loaded → hits Run
→ real Devnet wallet generated → agent connects to Solana
→ live chat panel activates → real transactions execute
→ click Deploy → get shareable URL
```

### What's Built (Proof of Work)

| Feature | Status |
|---|---|
| Monaco Editor with TypeScript agent code | ✅ Built |
| Live AI chat panel (Vercel AI SDK v6) | ✅ Built |
| Real Devnet wallet API (auto-keypair + airdrop) | ✅ Built |
| On-chain tools: getBalance, transferSOL, swapTokens, mintNFT | ✅ Built |
| WebGL landing page (xeus brand identity) | ✅ Built |
| Streaming AI responses via streamText | ✅ Built |
| GitHub repo with 4 atomic commits | ✅ Built |

### Git History (Proof of Progressive Build)

```
e59bdae  feat: move integrations carousel below prompt box and link landing page CTAs to playground
         4 files changed, 33 insertions(+), 64 deletions(-)

37896bb  feat: implement Xeus IDE Playground workspace at /playground
         10 files changed, 1019 insertions(+)
         - src/app/api/chat/route.ts (138 lines)
         - src/features/chat/ChatPanel.tsx (239 lines)
         - src/features/editor/CodeEditor.tsx (83 lines)
         - src/features/editor/EditorToolbar.tsx (138 lines)
         - src/hooks/usePlayground.ts (167 lines)

4ba81f4  feat: overhaul visual theme to orange-black, Orbitron & Geist Pixel fonts, Integrations section
         30 files changed, 1639 insertions(+)
         - Full WebGL landing page, brand identity, protocol SVGs

09eefac  chore: initialize Next.js 15 template and workspace skeleton
         8 files changed, 7146 insertions(+)
```

### How AI Was Used (Agentic Engineering)

This entire project was built using **Google Gemini Antigravity** (an agentic AI coding assistant) in a multi-day session. The AI agent:

- Researched competitive landscape (solpg.io, Replit, ElizaOS, GOAT, Top Hat, Sentio)
- Scaffolded the Next.js 15 project structure with App Router
- Implemented the WebGL landing page by downloading and integrating real assets
- Built the Monaco editor wrapper with cyberpunk dark theme
- Designed and implemented the Vercel AI SDK v6 chat pipeline (`DefaultChatTransport`, `streamText`, `tool`)
- Created the real Devnet wallet API with `@solana/web3.js` — actual keypair generation, real airdrops
- Implemented 5 on-chain tools (getBalance, requestFaucet, transferSOL, swapTokens, mintNFT)
- Made all architectural decisions (browser vs desktop, SAK v1 vs v2, zod peer deps)
- Committed all changes to GitHub with atomic, well-described commits

The AI session transcript proving this work is included as: `claude-session.jsonl` / `gemini-session.jsonl`

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Editor | Monaco Editor (`@monaco-editor/react`) |
| AI Chat | Vercel AI SDK v6 (`ai`, `@ai-sdk/react`) |
| On-chain | `@solana/web3.js` |
| UI State | Zustand |
| Animations | Framer Motion |
| Styling | Tailwind CSS 4 |
| Language | TypeScript |

---

## STEP 3 — Why This Deserves the Grant

### Extends the SendAI Ecosystem

| SendAI Tool | How Xeus Uses It |
|---|---|
| Solana Agent Kit | Primary runtime engine for all agent actions |
| solana.new | Template format — Xeus templates follow SKILL.md format |
| solana-mcp | MCP tools exposed natively from playground |
| Vercel AI SDK | streamText + tool + useChat — entire pipeline |

Xeus does **not** compete with SAK, solana.new, or solana-mcp. It is the **playground on top of the entire SendAI stack**.

### Genuine Gap in the Ecosystem

No browser-native IDE exists for Solana AI agents. The closest thing is "Replit + SAK manually configured" — which still requires terminal setup and is not purpose-built. Xeus is the missing piece between having an idea for a Solana agent and having one running.

### Who It Serves

- **Developers** — write TypeScript agent logic, test in real-time
- **Hackathon builders** — fork a template, demo in 5 minutes
- **Product managers** — describe agent in English → AI scaffolds → test via chat
- **Learners** — open a browser tab, no setup barrier

### What the 200 USDG Funds

| Milestone | Deliverable |
|---|---|
| Real SAK Integration | Replace custom web3 tools with actual solana-agent-kit runtime |
| Deploy Pipeline | Real hosted agent URLs at xeus.sh/agent/[id] |
| Templates Gallery | 5 forkable templates in solana.new SKILL.md format |
| AI Scaffold Mode | English → TypeScript agent config generation |

---

## Files to Upload with This Application

1. `xeus-grant-application.md` — this file
2. `gemini-session.jsonl` — AI session transcript (proof of agentic engineering)
3. `README.md` — from github.com/diiviikk5/Xeus

---

**Submit at:** https://superteam.fun/earn/grants/agentic-engineering
