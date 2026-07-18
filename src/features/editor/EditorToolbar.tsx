"use client";

import { usePlayground } from "@/hooks/usePlayground";
import { Play, Square, Coins, Rocket, ShieldAlert, Sparkles, Loader2, X, Settings } from "lucide-react";
import { useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

export default function EditorToolbar() {
  const { isRunning, setIsRunning, wallet, setWallet, addConsoleLog, files, setFileContent } = usePlayground();
  const [isFunding, setIsFunding] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isScaffoldOpen, setIsScaffoldOpen] = useState(false);
  const [scaffoldPrompt, setScaffoldPrompt] = useState("");
  const [isScaffolding, setIsScaffolding] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [providerInput, setProviderInput] = useState(
    typeof window !== "undefined" ? localStorage.getItem("ai_provider") || "openai" : "openai"
  );
  const [apiKeyInput, setApiKeyInput] = useState(
    typeof window !== "undefined" ? localStorage.getItem("ai_api_key") || localStorage.getItem("openai_api_key") || "" : ""
  );
  const [modelInput, setModelInput] = useState(
    typeof window !== "undefined" ? localStorage.getItem("ai_model") || "gpt-4o" : "gpt-4o"
  );
  const [solanaPrivateKeyInput, setSolanaPrivateKeyInput] = useState(
    typeof window !== "undefined" ? localStorage.getItem("solana_private_key") || "" : ""
  );
  const [solanaRpcUrlInput, setSolanaRpcUrlInput] = useState(
    typeof window !== "undefined" ? localStorage.getItem("solana_rpc_url") || "https://api.devnet.solana.com" : "https://api.devnet.solana.com"
  );
  const [phantomKey, setPhantomKey] = useState<string | null>(null);
  const [isConnectingPhantom, setIsConnectingPhantom] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);

  const handleConnectPhantom = async () => {
    setIsWalletMenuOpen(false);
    if (typeof window === "undefined") return;
    const provider = (window as any).solana;
    if (!provider || !provider.isPhantom) {
      addConsoleLog("[WARNING] Phantom extension not detected. Opening download page...");
      window.open("https://phantom.app/", "_blank");
      return;
    }
    setIsConnectingPhantom(true);
    addConsoleLog("Requesting Phantom Wallet connection...");
    try {
      const resp = await provider.connect();
      const pubKey = resp.publicKey.toString();
      setPhantomKey(pubKey);
      addConsoleLog(`Phantom Wallet successfully connected: ${pubKey}`);

      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const bal = await connection.getBalance(resp.publicKey);
      addConsoleLog(`Phantom Account Balance: ${(bal / 1_000_000_000).toFixed(2)} SOL (Devnet)`);
    } catch (err: any) {
      addConsoleLog(`[ERROR] Phantom connection rejected: ${err.message}`);
    } finally {
      setIsConnectingPhantom(false);
    }
  };

  const handleConnectSolflare = async () => {
    setIsWalletMenuOpen(false);
    if (typeof window === "undefined") return;
    const provider = (window as any).solflare;
    if (!provider) {
      addConsoleLog("[WARNING] Solflare extension not detected. Opening download page...");
      window.open("https://solflare.com/", "_blank");
      return;
    }
    setIsConnectingPhantom(true);
    addConsoleLog("Connecting to Solflare Wallet extension...");
    try {
      await provider.connect();
      const pubKey = provider.publicKey.toString();
      setPhantomKey(pubKey);
      addConsoleLog(`Solflare Wallet connected: ${pubKey}`);

      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const bal = await connection.getBalance(provider.publicKey);
      addConsoleLog(`Connected wallet balance: ${(bal / 1_000_000_000).toFixed(2)} SOL (Devnet)`);
    } catch (err: any) {
      addConsoleLog(`[ERROR] Solflare connection rejected: ${err.message}`);
    } finally {
      setIsConnectingPhantom(false);
    }
  };

  const handleConnectPlayground = async () => {
    setIsWalletMenuOpen(false);
    setIsConnectingPhantom(true);
    addConsoleLog("Connecting to Playground Wallet...");
    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPhantomKey(data.publicKey);
      setWallet({ publicKey: data.publicKey, balance: data.balance, loading: false });
      addConsoleLog(`Connected to Playground Wallet: ${data.publicKey} (${data.balance.toFixed(2)} SOL)`);
    } catch (err: any) {
      addConsoleLog(`[ERROR] Failed to load playground wallet: ${err.message}`);
    } finally {
      setIsConnectingPhantom(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("ai_provider", providerInput);
      localStorage.setItem("ai_api_key", apiKeyInput);
      localStorage.setItem("ai_model", modelInput);
      localStorage.setItem("solana_private_key", solanaPrivateKeyInput);
      localStorage.setItem("solana_rpc_url", solanaRpcUrlInput);
      addConsoleLog(`Workspace Settings saved: ${providerInput} (${modelInput}) & custom wallet configuration active.`);
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
        const privateKey = localStorage.getItem("solana_private_key") || "";
        const rpcUrl = localStorage.getItem("solana_rpc_url") || "https://api.devnet.solana.com";
        const queryParams = new URLSearchParams();
        if (privateKey) queryParams.set("privateKey", privateKey);
        if (rpcUrl) queryParams.set("rpcUrl", rpcUrl);

        const res = await fetch(`/api/wallet?${queryParams.toString()}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        setWallet({ publicKey: data.publicKey, balance: data.balance, loading: false });
        addConsoleLog(`Initializing SolanaAgentKit runtime on custom node: ${rpcUrl}...`);
        addConsoleLog(`Wallet active: ${data.publicKey} (${data.balance.toFixed(2)} SOL)`);
        addConsoleLog("Agent successfully loaded.");
      } catch (err: any) {
        addConsoleLog(`[ERROR] Failed to initialize wallet: ${err.message}`);
        setIsRunning(false);
      }
    }
  };

  const handleRequestFaucet = async () => {
    if (!isRunning || isFunding) return;
    setIsFunding(true);
    addConsoleLog("Requesting 1.0 SOL from Solana Devnet faucet...");
    try {
      const privateKey = localStorage.getItem("solana_private_key") || "";
      const rpcUrl = localStorage.getItem("solana_rpc_url") || "https://api.devnet.solana.com";
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privateKey, rpcUrl })
      });
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

          {/* Wallet Connection Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                if (phantomKey) {
                  setPhantomKey(null);
                  addConsoleLog("Wallet disconnected.");
                } else {
                  setIsWalletMenuOpen(!isWalletMenuOpen);
                }
              }}
              disabled={isConnectingPhantom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border cursor-pointer hover:border-orange-500/35"
              style={{
                background: phantomKey ? "rgba(74, 222, 128, 0.05)" : "rgba(255, 255, 255, 0.02)",
                borderColor: phantomKey ? "rgba(74, 222, 128, 0.25)" : "rgba(255, 255, 255, 0.06)",
                color: phantomKey ? "#4ade80" : "#a3a3a3",
                fontFamily: '"Orbitron", sans-serif',
              }}
            >
              {isConnectingPhantom ? (
                <Loader2 size={11} className="animate-spin text-orange-500" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: phantomKey ? "#4ade80" : "#6b7280" }} />
              )}
              <span>{phantomKey ? `${phantomKey.slice(0, 4)}...${phantomKey.slice(-4)}` : "Connect Wallet"}</span>
            </button>

            {isWalletMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-neutral-950 border rounded-lg p-2 shadow-xl z-50 flex flex-col gap-1.5 animate-in slide-in-from-top-1 duration-150"
                style={{ borderColor: "rgba(255, 55, 0, 0.18)" }}
              >
                <div className="px-2 py-1 text-[9px] uppercase tracking-wider font-bold text-neutral-500 font-mono">
                  Select Wallet
                </div>
                <button
                  onClick={handleConnectPhantom}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white rounded hover:bg-neutral-900 transition-colors flex items-center gap-2 cursor-pointer"
                  style={{ fontFamily: '"Outfit", sans-serif' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Phantom Wallet
                </button>
                <button
                  onClick={handleConnectSolflare}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white rounded hover:bg-neutral-900 transition-colors flex items-center gap-2 cursor-pointer"
                  style={{ fontFamily: '"Outfit", sans-serif' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  Solflare Wallet
                </button>
                <button
                  onClick={handleConnectPlayground}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white rounded hover:bg-neutral-900 transition-colors flex items-center gap-2 cursor-pointer"
                  style={{ fontFamily: '"Outfit", sans-serif' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Playground Wallet
                </button>
              </div>
            )}
          </div>

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
      )}
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
              {/* Provider Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono tracking-wider">
                  AI Provider
                </label>
                <select
                  value={providerInput}
                  onChange={(e) => {
                    setProviderInput(e.target.value);
                    if (e.target.value === "openai") setModelInput("gpt-4o");
                    else if (e.target.value === "anthropic") setModelInput("claude-3-5-sonnet-20241022");
                    else if (e.target.value === "google") setModelInput("gemini-2.5-flash");
                  }}
                  className="w-full bg-neutral-900 border rounded-lg px-3 py-2 text-xs text-neutral-300 font-mono focus:outline-none focus:border-orange-500/50"
                  style={{ borderColor: "rgba(255, 255, 255, 0.08)", background: "#0a0a0a" }}
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="google">Google Gemini</option>
                </select>
              </div>

              {/* API Key */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono tracking-wider">
                  API Key ({providerInput === "openai" ? "sk-..." : providerInput === "anthropic" ? "sk-ant-..." : "AIzaSy..."})
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={`Enter your ${providerInput} API key`}
                  className="w-full bg-neutral-900 border rounded-lg px-3 py-2 text-xs text-neutral-300 font-mono focus:outline-none focus:border-orange-500/50"
                  style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
                />
              </div>

              {/* Model Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono tracking-wider">
                  Model Name
                </label>
                <input
                  type="text"
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  placeholder="e.g. gpt-4o"
                  className="w-full bg-neutral-900 border rounded-lg px-3 py-2 text-xs text-neutral-300 font-mono focus:outline-none focus:border-orange-500/50"
                  style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
                />
                <p className="text-[9px] text-neutral-500 font-mono leading-relaxed">
                  Your API key and preferences are stored locally in your browser. They are never sent to our servers except to run requests against your chosen AI model.
                </p>
              </div>

              {/* Solana Custom Wallet Configuration */}
              <div className="border-t border-neutral-900 pt-3 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono tracking-wider flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-orange-500" />
                    Solana Private Key (Base58)
                  </label>
                  <input
                    type="password"
                    value={solanaPrivateKeyInput}
                    onChange={(e) => setSolanaPrivateKeyInput(e.target.value)}
                    placeholder="Leaves empty to use default playground wallet"
                    className="w-full bg-neutral-900 border rounded-lg px-3 py-2 text-xs text-neutral-300 font-mono focus:outline-none focus:border-orange-500/50"
                    style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono tracking-wider flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-orange-500" />
                    Solana RPC URL
                  </label>
                  <input
                    type="text"
                    value={solanaRpcUrlInput}
                    onChange={(e) => setSolanaRpcUrlInput(e.target.value)}
                    placeholder="https://api.devnet.solana.com"
                    className="w-full bg-neutral-900 border rounded-lg px-3 py-2 text-xs text-neutral-300 font-mono focus:outline-none focus:border-orange-500/50"
                    style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
                  />
                </div>
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
