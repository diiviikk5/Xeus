"use client";

import { usePlayground } from "@/hooks/usePlayground";
import { Play, Square, Coins, Rocket, ShieldAlert, Sparkles, Loader2, X, Settings } from "lucide-react";
import { useState } from "react";

export default function EditorToolbar() {
  const { isRunning, setIsRunning, wallet, setWallet, addConsoleLog, files, setFileContent } = usePlayground();
  const [isFunding, setIsFunding] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isScaffoldOpen, setIsScaffoldOpen] = useState(false);
  const [scaffoldPrompt, setScaffoldPrompt] = useState("");
  const [isScaffolding, setIsScaffolding] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(
    typeof window !== "undefined" ? localStorage.getItem("openai_api_key") || "" : ""
  );

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("openai_api_key", apiKeyInput);
      addConsoleLog("OpenAI API Key updated in sandbox storage.");
    }
    setIsSettingsOpen(false);
  };

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

  const handleDeployAgent = async () => {
    if (isDeploying) return;
    setIsDeploying(true);
    addConsoleLog("Packaging agent bundle...");
    
    try {
      const codeContent = files["agent.ts"]?.content || "";
      const nameMatch = codeContent.match(/name:\s*"([^"]+)"/) || 
                        codeContent.match(/name:\s*'([^']+)'/);
      const agentName = nameMatch ? nameMatch[1] : "Solana Scout";

      addConsoleLog(`Deploying agent "${agentName}" to edge containers...`);

      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeContent,
          name: agentName,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      addConsoleLog(`Agent live at: http://localhost:3000${data.url}`);
      setIsDeploying(false);
      alert(`Deployment Complete!\n\nYour agent is live at:\nhttp://localhost:3000${data.url}`);
    } catch (err: any) {
      addConsoleLog(`[ERROR] Deployment failed: ${err.message}`);
      setIsDeploying(false);
    }
  };

  const handleScaffoldSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scaffoldPrompt.trim() || isScaffolding) return;
    setIsScaffolding(true);
    addConsoleLog("Generating agent scaffold code via AI...");

    try {
      const res = await fetch("/api/scaffold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: scaffoldPrompt,
          env: (files[".env"]?.content || "") + (typeof window !== "undefined" ? `\nOPENAI_API_KEY=${(localStorage.getItem("openai_api_key") || "").trim()}` : ""),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setFileContent("agent.ts", data.code);
      addConsoleLog("Successfully scaffolded agent.ts config code using AI!");
      setIsScaffoldOpen(false);
      setScaffoldPrompt("");
    } catch (err: any) {
      addConsoleLog(`[ERROR] AI Scaffolding failed: ${err.message}`);
      alert(`AI Scaffolding Error:\n${err.message}`);
    } finally {
      setIsScaffolding(false);
    }
  };

  return (
    <>
      <div
        className="h-12 w-full bg-black border-b flex items-center justify-between px-4 select-none"
        style={{ borderColor: "rgba(255, 55, 0, 0.12)" }}
      >
        {/* File Tab */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400" style={{ fontFamily: '"Orbitron", sans-serif' }}>
            Workspace IDE
          </span>
          
          {/* AI Scaffold Button */}
          <button
            onClick={() => setIsScaffoldOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-900 border text-[11px] font-semibold text-neutral-400 hover:text-white transition-all duration-150 ml-4 hover:border-orange-500/30"
            style={{
              borderColor: "rgba(255, 255, 255, 0.08)",
              fontFamily: '"Orbitron", sans-serif',
            }}
          >
            <Sparkles size={11} className="text-orange-500" />
            <span>AI Scaffold</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-900 border text-[11px] font-semibold text-neutral-400 hover:text-white transition-all duration-150 ml-2 hover:border-orange-500/30"
            style={{
              borderColor: "rgba(255, 255, 255, 0.08)",
              fontFamily: '"Orbitron", sans-serif',
            }}
          >
            <Settings size={11} className="text-orange-500" />
            <span>Settings</span>
          </button>
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

      {/* AI Scaffold Modal */}
      {isScaffoldOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-lg bg-black border rounded-xl overflow-hidden shadow-2xl flex flex-col"
            style={{ borderColor: "rgba(255, 55, 0, 0.15)" }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-neutral-950" style={{ borderColor: "rgba(255, 55, 0, 0.08)" }}>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-orange-500 animate-pulse" />
                <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-200" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                  AI Agent Scaffold
                </h3>
              </div>
              <button
                onClick={() => setIsScaffoldOpen(false)}
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleScaffoldSubmit} className="p-6 space-y-4 flex-1 flex flex-col">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono tracking-wider">
                  Describe Your Agent
                </label>
                <p className="text-[11px] text-neutral-500 leading-normal font-sans">
                  Explain what on-chain actions your agent should perform. Our AI will translate it into a fully configured TypeScript agent workspace.
                </p>
              </div>

              <textarea
                value={scaffoldPrompt}
                onChange={(e) => setScaffoldPrompt(e.target.value)}
                placeholder="e.g. An agent named 'DeFi Oracle' that checks my SOL balance and automatically swaps 0.1 SOL for USDC if the balance is above 2.0 SOL."
                disabled={isScaffolding}
                rows={4}
                className="w-full bg-neutral-900 border rounded-xl p-3 text-xs text-white placeholder-neutral-600 focus:outline-none transition-all duration-200 font-sans leading-relaxed flex-1 resize-none"
                style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScaffoldOpen(false)}
                  disabled={isScaffolding}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                  style={{ fontFamily: '"Orbitron", sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScaffolding || !scaffoldPrompt.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-black bg-orange-500 hover:bg-orange-600 disabled:opacity-40 transition-all duration-200"
                  style={{ fontFamily: '"Orbitron", sans-serif' }}
                >
                  {isScaffolding ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      <span>Generate Agent</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-black border rounded-xl overflow-hidden shadow-2xl flex flex-col"
            style={{ borderColor: "rgba(255, 55, 0, 0.15)" }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-neutral-950" style={{ borderColor: "rgba(255, 55, 0, 0.08)" }}>
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-orange-500" />
                <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-200" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                  Workspace Settings
                </h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono tracking-wider">
                  OpenAI API Key (sk-...)
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Enter your OpenAI API key"
                  className="w-full bg-neutral-900 border rounded-lg px-3 py-2 text-xs text-neutral-300 font-mono focus:outline-none focus:border-orange-500/50"
                  style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
                />
                <p className="text-[9px] text-neutral-500 font-mono leading-relaxed">
                  Your key is stored locally in your browser and used only to run your agent in the sandbox chat. It is never saved on any database.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-neutral-400 hover:text-white bg-transparent border-neutral-800 transition-colors"
                  style={{ fontFamily: '"Orbitron", sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-black bg-orange-500 hover:bg-orange-600 transition-colors"
                  style={{ fontFamily: '"Orbitron", sans-serif' }}
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
