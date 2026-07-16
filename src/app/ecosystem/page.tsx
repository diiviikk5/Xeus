"use client";

import HeroNavbar from "@/components/HeroNavbar";
import { Cpu, Terminal, ShieldCheck, Zap, Sparkles, ExternalLink } from "lucide-react";

const integrations = [
  {
    name: "Solana Web3.js",
    category: "Core Protocol",
    description: "Full RPC interactions, system program transfers, Devnet faucet request, transaction builders, and devnet account balances checks.",
    status: "Active",
    icon: Terminal
  },
  {
    name: "Jupiter DEX API",
    category: "DeFi Routing",
    description: "Accesses Jupiter aggregator routing engine for price feed queries, slippage adjustments, and instant token swap signatures.",
    status: "Active",
    icon: Zap
  },
  {
    name: "Metaplex & Bubblegum",
    category: "NFTs",
    description: "Autonomously mints compressed NFTs (cNFTs), creates token collections, sets royalties, and checks holder metadata.",
    status: "Active",
    icon: Cpu
  },
  {
    name: "SPL Token Protocol",
    category: "Token Management",
    description: "Initializes new token mint accounts on-chain, establishes Associated Token Accounts (ATAs), and mints supply volumes.",
    status: "Active",
    icon: ShieldCheck
  },
  {
    name: "Pyth Network Oracles",
    category: "Oracles",
    description: "Fetches low-latency real-time asset pricing directly from decentralized oracle price feeds.",
    status: "Supported",
    icon: Sparkles
  },
  {
    name: "Orca & Raydium Pools",
    category: "Liquidity",
    description: "Scan concentrated liquidity market makers (CLMMs) to perform swaps or run pool yield-farming simulations.",
    status: "Supported",
    icon: Zap
  }
];

export default function EcosystemPage() {
  return (
    <div className="min-h-screen bg-black text-neutral-300 font-sans relative overflow-x-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <HeroNavbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-bold text-orange-500 font-mono uppercase tracking-wider">
            <Zap size={11} className="animate-pulse" />
            <span>Plugin Integrations</span>
          </div>
          <h1 
            className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            Xeus Ecosystem
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed font-mono">
            Supported Solana programs and Web3 developer APIs integrated directly inside the agent execution sandbox.
          </p>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {integrations.map((it) => {
            const Icon = it.icon;
            return (
              <div 
                key={it.name}
                className="border border-neutral-900 bg-neutral-950/40 backdrop-blur-md rounded-xl p-5 hover:border-orange-500/20 hover:bg-neutral-900/10 transition-all duration-300 flex flex-col justify-between group shadow-lg"
              >
                <div className="space-y-4">
                  {/* Category and Status */}
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-neutral-500 uppercase tracking-wider">{it.category}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                      it.status === "Active" 
                        ? "bg-green-500/10 text-green-400 border-green-500/20" 
                        : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${it.status === "Active" ? "bg-green-500" : "bg-orange-500"}`} />
                      <span>{it.status}</span>
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-black transition-colors duration-300">
                      <Icon size={16} />
                    </div>
                    <h3 
                      className="font-bold text-white text-sm tracking-wide"
                      style={{ fontFamily: '"Orbitron", sans-serif' }}
                    >
                      {it.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                    {it.description}
                  </p>
                </div>

                <div className="pt-4 flex justify-end">
                  <a 
                    href="/playground" 
                    className="text-[10px] font-bold text-neutral-400 hover:text-white transition-colors flex items-center gap-1 font-mono uppercase"
                  >
                    <span>Test Plugin</span>
                    <ExternalLink size={10} className="text-orange-500" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
