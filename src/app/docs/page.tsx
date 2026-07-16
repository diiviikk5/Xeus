"use client";

import { useState } from "react";
import HeroNavbar from "@/components/HeroNavbar";
import { Terminal, Shield, Cpu, Code2, Play, ExternalLink, Copy, Check, Info } from "lucide-react";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<string>("intro");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sections = [
    { id: "intro", label: "Getting Started" },
    { id: "templates", label: "Starter Templates" },
    { id: "plugins", label: "Custom Plugins" },
    { id: "scaffold", label: "AI Scaffolding" },
    { id: "embeds", label: "Embed & Host" },
  ];

  return (
    <div className="min-h-screen bg-black text-neutral-300 font-sans relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />

      <HeroNavbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 flex flex-col md:flex-row gap-10">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0 md:sticky md:top-24 h-fit space-y-6">
          <div className="border border-neutral-900 bg-neutral-950/60 backdrop-blur-md rounded-xl p-4 space-y-1">
            <h3 
              className="text-[10px] tracking-widest text-orange-500 font-bold uppercase font-mono px-3 mb-3"
              style={{ fontFamily: '"Orbitron", sans-serif' }}
            >
              Documentation
            </h3>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all duration-150 flex items-center justify-between ${
                  activeSection === section.id
                    ? "bg-orange-500/10 text-orange-400 border-l-2 border-orange-500 font-semibold"
                    : "text-neutral-400 hover:bg-neutral-900/50 hover:text-white"
                }`}
              >
                <span>{section.label}</span>
                {activeSection === section.id && (
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
                )}
              </button>
            ))}
          </div>

          <div className="border border-neutral-900 bg-neutral-950/40 backdrop-blur-md rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-orange-500 font-bold font-mono uppercase">
              <Shield size={12} />
              <span>Sandbox Mode</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed font-mono">
              All tools run on Solana Devnet. Private keys are never saved on the server.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 bg-neutral-950/30 border border-neutral-900/60 rounded-2xl p-6 md:p-8 backdrop-blur-md">
          {activeSection === "intro" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-[10px] text-orange-500 font-bold uppercase font-mono tracking-wider">
                  01 . Overview
                </div>
                <h1 
                  className="text-2xl md:text-3xl font-extrabold text-white"
                  style={{ fontFamily: '"Orbitron", sans-serif' }}
                >
                  Welcome to Xeus
                </h1>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Xeus is a browser-native IDE designed specifically to accelerate the development, testing, and deployment of Solana AI agents. Powered by `@solana/web3.js` and the Vercel AI SDK, Xeus connects LLMs directly to the blockchain.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 border border-neutral-900 bg-neutral-950/60 rounded-xl space-y-2">
                  <Code2 size={20} className="text-orange-500" />
                  <h4 className="text-xs font-bold text-white font-mono uppercase">Browser Monaco IDE</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">Autocompletes types, formats JSON configurations, and compiles TypeScript.</p>
                </div>
                <div className="p-4 border border-neutral-900 bg-neutral-950/60 rounded-xl space-y-2">
                  <Terminal size={20} className="text-orange-500" />
                  <h4 className="text-xs font-bold text-white font-mono uppercase">On-Chain Executor</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">Spins up real, ephemeral developer wallets and requests automatic token faucets.</p>
                </div>
                <div className="p-4 border border-neutral-900 bg-neutral-950/60 rounded-xl space-y-2">
                  <Cpu size={20} className="text-orange-500" />
                  <h4 className="text-xs font-bold text-white font-mono uppercase">AI Scaffolding</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">Converts English goals into complete, syntactically-valid agent files in one click.</p>
                </div>
              </div>

              <div className="border border-orange-500/20 bg-orange-500/5 rounded-xl p-4 flex gap-3 items-start">
                <Info size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-white font-mono uppercase">Quickstart Note</h5>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    To start, navigate to the <a href="/playground" className="text-orange-500 underline">Playground</a>, choose a starter template from the sidebar explorer, configure your OpenAI key inside the settings panel or the `.env` editor, and run your agent instantly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "templates" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-[10px] text-orange-500 font-bold uppercase font-mono tracking-wider">
                  02 . Configuration
                </div>
                <h1 
                  className="text-2xl md:text-3xl font-extrabold text-white"
                  style={{ fontFamily: '"Orbitron", sans-serif' }}
                >
                  Starter Templates
                </h1>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Xeus ships with pre-configured templates mapping to common Web3 agent workflows. You can select them directly in the File Explorer panel:
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="border border-neutral-900 rounded-xl p-4 bg-neutral-950/40 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white font-mono uppercase">1. Solana Scout</span>
                    <span className="text-[9px] bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded font-mono uppercase">Default</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Performs basic blockchain actions: requests faucets, transfers SOL, checks token balances, and mints custom tokens.
                  </p>
                </div>

                <div className="border border-neutral-900 rounded-xl p-4 bg-neutral-950/40 space-y-2">
                  <span className="text-xs font-bold text-white font-mono uppercase">2. Arbitrage Sniper</span>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Scans decentralized exchange pools (like Jupiter or Raydium) to identify pricing mismatches, and automates multi-hop trades.
                  </p>
                </div>

                <div className="border border-neutral-900 rounded-xl p-4 bg-neutral-950/40 space-y-2">
                  <span className="text-xs font-bold text-white font-mono uppercase">3. NFT Creator</span>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Uses Metaplex wrappers to upload metadata, mint Bubblegum compressed NFTs (cNFTs), and verifies collection groups.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "plugins" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-[10px] text-orange-500 font-bold uppercase font-mono tracking-wider">
                  03 . Customization
                </div>
                <h1 
                  className="text-2xl md:text-3xl font-extrabold text-white"
                  style={{ fontFamily: '"Orbitron", sans-serif' }}
                >
                  Custom Plugins & Tools
                </h1>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  To teach your agent new capabilities (like querying price feeds or interacting with your own smart contracts), register a new tool in <code className="text-orange-400 font-mono">src/app/api/chat/route.ts</code>.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white font-mono uppercase">Code Implementation:</h3>
                <div className="relative">
                  <button
                    onClick={() => handleCopy(`const myCustomActionSchema = z.object({
  recipient: z.string().describe("The base58 address of the recipient."),
  amountSOL: z.number().describe("The amount of SOL to transfer."),
});

const myEscrowTool = tool({
  description: "Initialize an escrow account and transfer SOL.",
  parameters: myCustomActionSchema,
  execute: async ({ recipient, amountSOL }) => {
    // Add custom web3.js transaction instructions here
    return { status: "success", txSignature: "..." };
  }
} as any);`, "code-plugin")}
                    className="absolute right-3 top-3 p-1.5 rounded-lg bg-black border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
                  >
                    {copiedText === "code-plugin" ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  </button>
                  <pre className="bg-neutral-950 p-4 border border-neutral-900 rounded-xl overflow-x-auto text-[11px] font-mono text-neutral-300 leading-relaxed">
{`const myCustomActionSchema = z.object({
  recipient: z.string().describe("The base58 address of the recipient."),
  amountSOL: z.number().describe("The amount of SOL to transfer."),
});

const myEscrowTool = tool({
  description: "Initialize an escrow account and transfer SOL.",
  parameters: myCustomActionSchema,
  execute: async ({ recipient, amountSOL }) => {
    // Add custom web3.js transaction instructions here
    return { status: "success", txSignature: "..." };
  }
} as any);`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeSection === "scaffold" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-[10px] text-orange-500 font-bold uppercase font-mono tracking-wider">
                  04 . Automation
                </div>
                <h1 
                  className="text-2xl md:text-3xl font-extrabold text-white"
                  style={{ fontFamily: '"Orbitron", sans-serif' }}
                >
                  AI Scaffold Mode
                </h1>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Scaffold Mode lets you program the agent without writing TypeScript. 
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white font-mono uppercase">How it works:</h4>
                <ol className="list-decimal list-inside text-xs text-neutral-400 space-y-2 leading-relaxed">
                  <li>Click the <span className="text-orange-400 font-semibold font-mono">AI Scaffold</span> button in the Monaco Editor Toolbar.</li>
                  <li>Type your agent requirements in plain English (e.g., *"automatically buy 100 USDC worth of SOL whenever my balance drops below 2 SOL"*).</li>
                  <li>The compiler contacts the \`/api/scaffold\` backend to translate your requirements into a valid TypeScript setup.</li>
                  <li>The code is immediately injected into your editor workspace.</li>
                </ol>
              </div>
            </div>
          )}

          {activeSection === "embeds" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-[10px] text-orange-500 font-bold uppercase font-mono tracking-wider">
                  05 . Distribution
                </div>
                <h1 
                  className="text-2xl md:text-3xl font-extrabold text-white"
                  style={{ fontFamily: '"Orbitron", sans-serif' }}
                >
                  Deploy & Iframe Embeds
                </h1>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Once your agent works in the playground workspace, deploy it on-chain to make it publicly accessible.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white font-mono uppercase">Iframe Embed Code Snippet:</h4>
                  <div className="relative">
                    <button
                      onClick={() => handleCopy('<iframe src="https://xeus.sh/agent/your-agent-id" style="width: 100%; height: 600px; border: 1px solid rgba(255, 55, 0, 0.12); border-radius: 12px; background: black;" allow="clipboard-write"></iframe>', "code-embed")}
                      className="absolute right-3 top-3 p-1.5 rounded-lg bg-black border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
                    >
                      {copiedText === "code-embed" ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                    </button>
                    <pre className="bg-neutral-950 p-4 border border-neutral-900 rounded-xl overflow-x-auto text-[11px] font-mono text-neutral-300 leading-relaxed">
{`<iframe
  src="https://xeus.sh/agent/your-agent-id"
  style="width: 100%; height: 600px; border: 1px solid rgba(255, 55, 0, 0.12); border-radius: 12px; background: black;"
  allow="clipboard-write">
</iframe>`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
