"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Editor from "@monaco-editor/react";
import { Send, ArrowLeft, Terminal, ShieldCheck, Loader2, Play, ExternalLink, Code2, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface DeployedAgentClientProps {
  agent: {
    id: string;
    name: string;
    code: string;
    config: any;
    deployedAt: string;
  };
}

export default function DeployedAgentClient({ agent }: DeployedAgentClientProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "code">("chat");
  const [walletInfo, setWalletInfo] = useState({ publicKey: "Loading...", balance: 0 });
  const [logs, setLogs] = useState<string[]>([
    `[system] Deployed agent "${agent.name}" loaded.`,
    `[system] Connecting to Solana Devnet...`,
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState("");

  // Add a console log helper
  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Load wallet on mount
  useEffect(() => {
    async function loadWallet() {
      try {
        const res = await fetch("/api/wallet");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setWalletInfo({ publicKey: data.publicKey, balance: data.balance });
        addLog(`Devnet wallet active: ${data.publicKey.slice(0, 6)}... (${data.balance.toFixed(2)} SOL)`);
      } catch (err: any) {
        addLog(`[ERROR] Failed to load Devnet wallet: ${err.message}`);
      }
    }
    loadWallet();
  }, []);

  const {
    messages,
    status,
    sendMessage,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        code: agent.code,
        env: "", // Env can be empty or resolved on server
      },
    }),
    onFinish: (message: any) => {
      addLog(`Agent execution completed. Response: "${message.content.slice(0, 30)}..."`);
    },
    onError: (err: any) => {
      addLog(`[ERROR] Agent execution failed: ${err.message}`);
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    addLog(`User prompt: "${input}"`);
    addLog("Agent starting execution flow...");
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="w-full h-screen bg-black text-white flex flex-col overflow-hidden select-none selection:bg-orange-500/20">
      {/* Header */}
      <header
        className="h-14 w-full px-6 flex items-center justify-between border-b flex-shrink-0"
        style={{ borderColor: "rgba(255, 55, 0, 0.12)", background: "rgba(10, 10, 10, 0.8)" }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/playground"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors duration-150"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            <ArrowLeft size={14} />
            <span>Playground</span>
          </Link>
          <div className="w-[1px] h-4 bg-neutral-800" />
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-semibold tracking-wider font-mono"
              style={{
                background: "linear-gradient(135deg, #ff3700 0%, #ffae00 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {agent.name}
            </span>
            <span className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-500 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest font-mono">
              Live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[9px] text-neutral-500">Agent Wallet Balance</span>
            <span className="text-xs text-neutral-300 font-semibold">{walletInfo.balance.toFixed(2)} SOL</span>
          </div>
          <Link
            href="/playground"
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-black bg-orange-500 hover:bg-orange-600 transition-all duration-200"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            Remix Code
          </Link>
        </div>
      </header>

      {/* Workspace Split */}
      <div className="flex-1 w-full flex overflow-hidden min-h-0">
        {/* Left Panel: Code Viewer */}
        <div className="flex-1 h-full flex flex-col min-w-0 border-r" style={{ borderColor: "rgba(255, 55, 0, 0.12)" }}>
          <div className="h-10 bg-neutral-950 border-b flex items-center justify-between px-4" style={{ borderColor: "rgba(255, 55, 0, 0.08)" }}>
            <div className="flex items-center gap-2">
              <Code2 size={13} className="text-orange-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                agent.ts (Read-Only)
              </span>
            </div>
            <span className="text-[9px] font-mono text-neutral-500">
              Deployed {new Date(agent.deployedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex-1 min-h-0 bg-black">
            <Editor
              height="100%"
              width="100%"
              language="typescript"
              value={agent.code}
              theme="vs-dark"
              options={{
                readOnly: true,
                fontSize: 13,
                fontFamily: '"Geist Mono", monospace',
                minimap: { enabled: false },
                lineNumbers: "on",
                padding: { top: 12, bottom: 12 },
                domReadOnly: true,
              }}
              onMount={(editor, monaco) => {
                monaco.editor.defineTheme("xeus-cyberpunk-deployed", {
                  base: "vs-dark",
                  inherit: true,
                  rules: [
                    { token: "", foreground: "E0E0E0", background: "000000" },
                    { token: "comment", foreground: "7F7F7F", fontStyle: "italic" },
                    { token: "keyword", foreground: "FF5500", fontStyle: "bold" },
                    { token: "string", foreground: "FDCF58" },
                    { token: "number", foreground: "FF9E00" },
                    { token: "type", foreground: "00F3FF" },
                    { token: "class", foreground: "00F3FF" },
                    { token: "function", foreground: "FFAE00" },
                    { token: "variable", foreground: "FFFFFF" },
                  ],
                  colors: {
                    "editor.background": "#000000",
                    "editor.foreground": "#E0E0E0",
                    "editor.lineHighlightBackground": "#0D0803",
                    "editor.lineHighlightBorder": "#221100",
                    "editor.selectionBackground": "#3D1D00",
                    "editorCursor.foreground": "#FF5500",
                    "editorLineNumber.foreground": "#555555",
                    "editorLineNumber.activeForeground": "#FF5500",
                  },
                });
                monaco.editor.setTheme("xeus-cyberpunk-deployed");
              }}
            />
          </div>

          {/* Mini Console Logs */}
          <div className="h-40 bg-black border-t flex flex-col overflow-hidden" style={{ borderColor: "rgba(255, 55, 0, 0.08)" }}>
            <div className="h-8 bg-neutral-950 px-4 flex items-center border-b" style={{ borderColor: "rgba(255, 55, 0, 0.05)" }}>
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
                Agent Console Output
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] space-y-1 text-orange-500/80 scrollbar-thin select-text">
              {logs.map((log, index) => (
                <div key={index} className="leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Active Chat Panel */}
        <div className="w-full md:w-[450px] flex-shrink-0 flex flex-col bg-neutral-950">
          {/* Panel Header */}
          <div
            className="px-4 py-3 border-b flex items-center justify-between bg-black"
            style={{ borderColor: "rgba(255, 55, 0, 0.08)" }}
          >
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-neutral-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                Converse with {agent.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-semibold text-green-500 uppercase tracking-wider font-mono">
                Active Sandbox
              </span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-black">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                  <Sparkles size={16} className="animate-pulse" />
                </div>
                <div className="max-w-xs">
                  <h3 className="text-xs font-semibold text-white mb-1 font-mono">
                    Agent Ready
                  </h3>
                  <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">
                    Ask this agent to execute transactions, check balances, or query Devnet using its compiled instructions.
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((m: any) => {
                  const isUser = m.role === "user";
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1.5`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed`}
                        style={{
                          fontFamily: '"Outfit", sans-serif',
                          background: isUser ? "rgba(255, 85, 0, 0.08)" : "#0f0f11",
                          border: isUser
                            ? "1px solid rgba(255, 85, 0, 0.2)"
                            : "1px solid rgba(255, 255, 255, 0.05)",
                          color: isUser ? "#ffffff" : "rgba(255, 255, 255, 0.9)",
                        }}
                      >
                        {m.content}
                      </div>

                      {/* Render tool executions */}
                      {m.toolCalls && m.toolCalls.map((tc: any) => {
                        const args = JSON.parse(tc.function.arguments);
                        return (
                          <div
                            key={tc.id}
                            className="w-72 bg-neutral-950 border rounded-xl p-3 text-[10px] space-y-2 mt-1 shadow-md"
                            style={{ borderColor: "rgba(255, 55, 0, 0.15)" }}
                          >
                            <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: "rgba(255, 55, 0, 0.08)" }}>
                              <div className="flex items-center gap-1.5">
                                <ShieldCheck size={12} className="text-orange-500" />
                                <span className="font-semibold text-neutral-300 font-mono">
                                  {tc.function.name === "swap" ? "Jupiter Swap" : "Solana Action"}
                                </span>
                              </div>
                              <span className="text-[9px] text-neutral-500 uppercase font-semibold">
                                Success
                              </span>
                            </div>
                            <div className="space-y-0.5 text-neutral-400 font-mono text-[9px]">
                              {Object.entries(args).map(([k, v]) => (
                                <div key={k} className="flex justify-between">
                                  <span className="text-neutral-500">{k}:</span>
                                  <span>{String(v)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: "rgba(255, 55, 0, 0.08)" }}>
                              <span className="text-[8px] text-neutral-500 font-mono">
                                Tx: 4d2z...k8wP
                              </span>
                              <a
                                href="https://explorer.solana.com/?cluster=devnet"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] text-orange-500 flex items-center gap-1 hover:underline"
                              >
                                <span>Solana Explorer</span>
                                <ExternalLink size={9} />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-neutral-500 text-xs py-2 px-3">
                <Loader2 size={12} className="animate-spin text-orange-500" />
                <span className="font-mono text-[11px]">Agent thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div
            className="p-3 border-t bg-black"
            style={{ borderColor: "rgba(255, 55, 0, 0.08)" }}
          >
            <form onSubmit={onSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder={`Ask ${agent.name} to do something...`}
                className="flex-1 bg-neutral-900 border text-xs rounded-xl px-4 py-2 text-white placeholder-neutral-500 focus:outline-none transition-all duration-200"
                style={{
                  fontFamily: '"Outfit", sans-serif',
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #ff3700 0%, #ffae00 100%)",
                  color: "#000",
                }}
              >
                <Send size={14} className="text-black" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
