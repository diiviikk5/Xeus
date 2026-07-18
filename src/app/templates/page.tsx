"use client";

import HeroNavbar from "@/components/HeroNavbar";
import { ArrowRight, Layers, Cpu, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";

const templates = [
  {
    id: "scout",
    name: "Solana Scout",
    description: "Ideal for basic on-chain diagnostics. Checks token balances, executes simple SOL transfers, requests Devnet testnet faucet funding, and mints custom SPL tokens.",
    plugins: ["token", "defi", "nft"],
    model: "gpt-4o",
    allowedActions: ["balance", "trade", "transfer", "mint"],
    codeSnippet: `// agent.ts
export const config = {
  name: "Solana Scout",
  model: "gpt-4o",
  plugins: ["token", "defi", "nft"],
  systemPrompt: "You are a helpful Solana scout agent...",
  constraints: { maxTxSOL: 0.5 }
};`
  },
  {
    id: "arbitrage",
    name: "Arbitrage Sniper",
    description: "Scan Jupiter and Raydium decentralized liquidity pools for price variations. Automates Jupiter mock swaps to exploit arbitrage windows in real-time.",
    plugins: ["defi", "jupiter"],
    model: "gpt-4o",
    allowedActions: ["trade", "swap"],
    codeSnippet: `// agent.ts
export const config = {
  name: "Arbitrage Sniper",
  model: "gpt-4o",
  plugins: ["defi", "jupiter"],
  systemPrompt: "You are an automated sniper agent...",
  constraints: { maxTxSOL: 2.0, minProfitUSDC: 0.1 }
};`
  },
  {
    id: "nftCreator",
    name: "NFT Creator",
    description: "Mint Bubblegum compressed NFTs (cNFTs), uploads metadata structure, registers master collections, and configures creator royalties on-chain.",
    plugins: ["nft", "bubblegum"],
    model: "gpt-4o",
    allowedActions: ["mint"],
    codeSnippet: `// agent.ts
export const config = {
  name: "NFT Creator",
  model: "gpt-4o",
  plugins: ["nft", "bubblegum"],
  systemPrompt: "You are an NFT Creator agent...",
  constraints: { maxTxSOL: 0.1 }
};`
  },
  {
    id: "daoMonitor",
    name: "DAO Voter",
    description: "Governance proposal tracker. Automatically scans active DAO proposals, details voter metrics, and casts vote transactions based on custom criteria.",
    plugins: ["governance"],
    model: "gpt-4o-mini",
    allowedActions: ["balance", "vote"],
    codeSnippet: `// agent.ts
export const config = {
  name: "DAO Voter",
  model: "gpt-4o-mini",
  plugins: ["governance"],
  systemPrompt: "You are a DAO Governance Monitor...",
  constraints: { maxTxSOL: 0.05 }
};`
  },
  {
    id: "tokenLaunch",
    name: "Token Launcher",
    description: "Launch new SPL tokens on Solana Devnet. Configures total supply, token decimals, initializes associated token accounts, and mints initial tokens.",
    plugins: ["token"],
    model: "gpt-4o",
    allowedActions: ["mint", "deploy"],
    codeSnippet: `// agent.ts
export const config = {
  name: "Token Launcher",
  model: "gpt-4o",
  plugins: ["token"],
  systemPrompt: "You are an SPL Token Launch agent...",
  constraints: { maxTxSOL: 0.1 }
};`
  }
];

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-black text-neutral-300 font-sans relative overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <HeroNavbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-bold text-orange-500 font-mono uppercase tracking-wider">
            <Layers size={11} />
            <span>Workspace presets</span>
          </div>
          <h1 
            className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            Agent Templates
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed font-mono">
            Deploy preset Solana agent configurations designed for specific DeFi, NFT, and Governance workflows in one click.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {templates.map((tpl) => (
            <div 
              key={tpl.id}
              className="border border-neutral-900 bg-neutral-950/60 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between hover:border-orange-500/30 transition-all duration-300 group shadow-lg"
            >
              <div className="space-y-4">
                {/* Info Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 
                      className="text-lg font-bold text-white group-hover:text-orange-500 transition-colors"
                      style={{ fontFamily: '"Orbitron", sans-serif' }}
                    >
                      {tpl.name}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {tpl.plugins.map((pl) => (
                        <span 
                          key={pl} 
                          className="text-[9px] bg-neutral-900 text-neutral-400 border border-neutral-800 px-1.5 py-0.5 rounded font-mono"
                        >
                          #{pl}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">
                    Model: {tpl.model}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-400 leading-relaxed font-mono min-h-[50px]">
                  {tpl.description}
                </p>

                {/* Code Preview */}
                <div className="bg-black border border-neutral-900 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-[10px] font-mono text-neutral-400 leading-relaxed">
                    {tpl.codeSnippet}
                  </pre>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <Link
                  href={`/playground?template=${tpl.id}`}
                  className="w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 text-white bg-neutral-950 hover:bg-neutral-900 border-neutral-800 hover:border-orange-500/40"
                  style={{ fontFamily: '"Orbitron", sans-serif' }}
                >
                  <span>Open in Playground</span>
                  <ArrowRight size={13} className="text-orange-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
