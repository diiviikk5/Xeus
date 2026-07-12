"use client";

import { usePlayground } from "@/hooks/usePlayground";
import { Play, Square, Coins, Rocket, ShieldAlert, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";

export default function EditorToolbar() {
  const { isRunning, setIsRunning, wallet, setWallet, addConsoleLog } = usePlayground();
  const [isFunding, setIsFunding] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleRunToggle = async () => {
    if (isRunning) {
      setIsRunning(false);
      addConsoleLog("Agent sandbox terminated.");
    } else {
      setIsRunning(true);
      addConsoleLog("Compiling agent.ts...");
      try {
        const res = await fetch("/api/wallet");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        setWallet({ publicKey: data.publicKey, balance: data.balance, loading: false });
        addConsoleLog(`Initializing SolanaAgentKit runtime on Devnet...`);
        addConsoleLog(`Devnet wallet active: ${data.publicKey} (${data.balance.toFixed(2)} SOL)`);
        addConsoleLog("Agent successfully loaded.");
      } catch (err: any) {
        addConsoleLog(`[ERROR] Failed to initialize Devnet wallet: ${err.message}`);
        setIsRunning(false);
      }
    }
  };

  const handleRequestFaucet = async () => {
    if (!isRunning || isFunding) return;
    setIsFunding(true);
    addConsoleLog("Requesting 1.0 SOL from Solana Devnet faucet...");
    try {
      const res = await fetch("/api/wallet", { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setWallet({ balance: data.balance });
      addConsoleLog(`Airdrop successful! Wallet balance updated: ${data.balance.toFixed(2)} SOL.`);
    } catch (err: any) {
      addConsoleLog(`[ERROR] Faucet request failed: ${err.message}`);
    } finally {
      setIsFunding(false);
    }
  };

  const handleDeployAgent = () => {
    if (isDeploying) return;
    setIsDeploying(true);
    addConsoleLog("Packaging agent bundle...");
    setTimeout(() => {
      addConsoleLog("Uploading to Vercel Serverless Edge container...");
      setTimeout(() => {
        addConsoleLog("Agent successfully deployed at: https://xeus.sh/agent/scout-99");
        setIsDeploying(false);
        alert("Deployment Complete!\n\nYour agent is live at: https://xeus.sh/agent/scout-99");
      }, 1000);
    }, 800);
  };

  return (
    <div
      className="h-12 w-full bg-black border-b flex items-center justify-between px-4 select-none"
      style={{ borderColor: "rgba(255, 55, 0, 0.12)" }}
    >
      {/* File Tab */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400" style={{ fontFamily: '"Orbitron", sans-serif' }}>
          Workspace IDE
        </span>
      </div>

      {/* Editor Actions */}
      <div className="flex items-center gap-4">
        {/* Wallet Faucet Indicator */}
        {isRunning && (
          <div className="flex items-center gap-3 border-r pr-4" style={{ borderColor: "rgba(255,55,0,0.12)" }}>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-neutral-500 font-mono">Devnet Wallet</span>
              <span className="text-xs font-semibold text-neutral-300 font-mono">{wallet.balance.toFixed(1)} SOL</span>
            </div>
            <button
              onClick={handleRequestFaucet}
              disabled={isFunding}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-900 border text-[11px] font-semibold text-neutral-400 hover:text-white transition-all duration-150"
              style={{
                borderColor: "rgba(255, 255, 255, 0.08)",
                fontFamily: '"Orbitron", sans-serif',
              }}
            >
              {isFunding ? (
                <Loader2 size={12} className="animate-spin text-orange-500" />
              ) : (
                <Coins size={12} className="text-orange-500" />
              )}
              <span>Faucet</span>
            </button>
          </div>
        )}

        {/* Run/Stop Buttons */}
        <button
          onClick={handleRunToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
          style={{
            background: isRunning ? "rgba(239, 68, 68, 0.1)" : "rgba(255, 85, 0, 0.1)",
            border: isRunning ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(255, 85, 0, 0.3)",
            color: isRunning ? "#ef4444" : "#ff5500",
            fontFamily: '"Orbitron", sans-serif',
          }}
        >
          {isRunning ? (
            <>
              <Square size={11} fill="currentColor" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play size={11} fill="currentColor" className="translate-x-[0.5px]" />
              <span>Run</span>
            </>
          )}
        </button>

        {/* Deploy Button */}
        <button
          onClick={handleDeployAgent}
          disabled={!isRunning || isDeploying}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isRunning ? "linear-gradient(135deg, #ff3700 0%, #ffae00 100%)" : "rgba(255, 255, 255, 0.05)",
            color: isRunning ? "#000" : "#555",
            fontFamily: '"Orbitron", sans-serif',
          }}
        >
          {isDeploying ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Rocket size={11} />
          )}
          <span>Deploy</span>
        </button>
      </div>
    </div>
  );
}
