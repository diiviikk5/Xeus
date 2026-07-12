# Superteam Agentic Engineering Grant Application

## Project
**Xeus: Browser-Native IDE for Solana AI Agents**

Xeus is a browser-native IDE and testing playground for Solana AI agents, with zero local developer setup. Open a tab, write TypeScript agent logic (or describe it in English), and watch your agent execute real Devnet transactions in an interactive chat panel.
Our Solana direction is to make Xeus the default prototyping and validation sandbox for Solana-native agents (powered by Solana Agent Kit, ElizaOS, or MCP tools), where runs are interactive and setup friction is eliminated.

## Problem
Agent developers and hackathon builders currently face a high setup friction:
- To start building a Solana AI agent, you must install Node.js, npm, TypeScript, clone code templates, configure `.env` variables, and configure OpenAI/Helius RPC endpoints.
- This creates a 45-minute setup loop before a single Devnet transaction is executed.
- While libraries like Solana Agent Kit (SAK) solve the code layer, and `solana.new` handles scaffolds, there is no browser-native sandbox where you can immediately write, run, and share agents.

## Solution
Xeus provides:
- A browser-native workbench and live editor space.
- Zero-setup interactive agent playground with:
  - Monaco editor with live TypeScript syntax support.
  - Live AI chat panel powered by **Vercel AI SDK v6** (`streamText` + tool calls).
  - Automated Devnet Wallet API with on-demand keypair generation and SOL airdrops.
  - Built-in Solana tools mapped to LLM execution paths: `getBalance`, `requestFaucet`, `transferSOL`, `swapTokens`, `mintNFT`.

## Why this fits Agentic Engineering
This is core developer tooling for agent builders:
- Speeds up the prototyping, testing, and debugging loop for developers and hackathon participants.
- Reduces local environment complexity, letting builders focus strictly on agent prompt engineering, tool design, and execution logic.
- Creates a shareable link architecture so agents can be deployed and played with instantly.

## Existing progress (already built)
- Workbench Workspace:
  - Monaco editor with live TypeScript syntax support and cyberpunk styling.
  - Chat panel integrated with Vercel AI SDK v6 for real-time agent responses.
  - Devnet Wallet API supporting automated wallet creation, Devnet balance checks, and airdrops.
- Built-in On-chain Tools:
  - Simulated and real-faucet Solana Devnet bindings.
  - Real-time swaps simulated through Jupiter price quotes.
- Landing Page:
  - Premium WebGL-styled cybersecurity landing page.
- AI Session Transcripts:
  - Transcripts exported as proof of progressive agentic engineering.
  - 4 clean commits pushed to GitHub.

## solana.new usage
We are using `solana.new` as the recommended Solana CLI setup path:
`curl -fsSL https://www.solana.new/setup.sh | bash`
We also use `solana.new` skill templates to provision our workspace with Solana Agent templates.

## What grant support unlocks
We are requesting the standard **200 USDG grant** to sustain development velocity and upscale Xeus.

This directly supports:
- **Official SAK Integration**: Replacing custom tool bindings with the official `@solana/agent-kit` package as the on-chain execution core.
- **Hosted Agent Runways**: A deployment pipeline allowing users to host their agents at `xeus.sh/agent/[id]` with a public testing panel.
- **Template Gallery**: 5 pre-made agent flows following the `solana.new` `SKILL.md` format.
- **AI-scaffold Mode**: Translating English descriptions of agent behavior directly into TypeScript agent configurations.

## Team execution style
We ship incrementally with small validated commits, with Next.js build checks for each slice, and we keep a developer-first product scope aligned to real agent teams.
