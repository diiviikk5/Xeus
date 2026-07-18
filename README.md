# Xeus — The Solana Playground for AI Agents

Xeus is a browser-native IDE for building, testing, and deploying Solana AI agents with zero local setup. You open a tab, write TypeScript agent logic (or describe it in English), hit **Run**, and your agent executes real Devnet transactions in a live chat panel.

"Solana Agent Kit gives you the engine. Xeus gives you the test track."

<img width="1919" height="946" alt="Xeus Playground" src="https://github.com/user-attachments/assets/db8b5a84-58f2-464e-8768-48d5404c7c67" />

---

## 🚀 Key Features

* **Zero-Configuration Monaco Editor**: Write TypeScript agent code directly in the browser with auto-completion and full syntax highlighting.
* **Bring Your Own Key (BYOK)**: Supports settings for **OpenAI**, **Anthropic Claude**, and **Google Gemini** out-of-the-box. Dynamic model resolution evaluates inputs on the fly.
* **Auto-Provider Key Detection**: Dynamic runner pages automatically detect key providers from user-pasted headers (e.g. `sk-ant-` ➔ Anthropic, `AIzaSy` ➔ Gemini, otherwise OpenAI) for zero-setup execution.
* **Solana Devnet Faucet & Integration**: Generate a real ephemeral Devnet wallet inside the editor, request airdrops with a single click, and run live transaction queries.
* **Edge Agent Deployments**: Instantly bundle and package your agent config, saving it to dynamic Edge routes at `/agent/[id]` with full iframe embed snippet support.
* **AI Scaffolder**: Describe your agent logic in natural language and have the AI generate your `agent.ts` configuration code instantly.

---

## 🛠️ On-Chain Agent Capabilities

The playground comes equipped with actual Solana Devnet tools including:
1. **Get Balance**: Query the current SOL balance of any address on Devnet.
2. **Request Faucet**: Claim testnet SOL tokens directly into the playground keypair.
3. **Transfer SOL**: Cast real SOL transfers to other addresses.
4. **Swap Tokens**: Execute Jupiter protocol swaps on Devnet.
5. **Mint NFT**: Generate and mint Metaplex bubblegum compressed NFTs (cNFTs).

---

## ⚡ Tech Stack

* **Framework**: Next.js (App Router)
* **Editor**: Monaco Editor (`@monaco-editor/react`)
* **AI Chat**: Vercel AI SDK (`ai`, `@ai-sdk/react`)
* **On-Chain**: `@solana/web3.js` & `solana-agent-kit`
* **UI States**: Zustand
* **Animations**: Framer Motion
* **Theme**: Cyberpunk Orange-Black with local Geist Pixel & Orbitron fonts

---

## 🔬 Proof of Agentic Engineering

This entire codebase was created and verified by **Antigravity** (an agentic AI coding assistant developed by Google DeepMind) in a continuous pairing session.

* The full progressive build log is included in [gemini-session.jsonl](./gemini-session.jsonl).
* Our grant application details are available in [xeus-grant-application.md](./xeus-grant-application.md).

---

## 📦 Getting Started

To run Xeus locally:

1. Clone this repository:
   ```bash
   git clone https://github.com/diiviikk5/Xeus.git
   cd Xeus
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to launch the landing page and start building!
