"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { usePlayground } from "@/hooks/usePlayground";
import { useEffect, useRef, useState } from "react";
import { Send, Play, Terminal, ExternalLink, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPanel() {
  const { isRunning, setIsRunning, files, addConsoleLog } = usePlayground();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const {
    messages,
    status,
    sendMessage,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        code: files["agent.ts"]?.content || "",
      },
    }),
    onFinish: (message: any) => {
      addConsoleLog(`Agent execution completed. Final response: "${message.content.slice(0, 30)}..."`);
    },
    onError: (err: any) => {
      addConsoleLog(`[ERROR] Agent execution failed: ${err.message}`);
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartAgent = () => {
    setIsRunning(true);
    addConsoleLog("Compiling agent.ts...");
    setTimeout(() => {
      addConsoleLog("Initializing SolanaAgentKit runtime on Devnet...");
      setTimeout(() => {
        addConsoleLog("Playground Devnet Wallet: 9xK8...q9wP (Loaded 2.0 SOL)");
        addConsoleLog("Agent active and listening for prompts.");
      }, 500);
    }, 400);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    addConsoleLog(`User prompt sent: "${input}"`);
    addConsoleLog("Agent received message, starting execution flow.");
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div
      className="w-full h-full bg-black border-l flex flex-col overflow-hidden"
      style={{ borderColor: "rgba(255, 55, 0, 0.12)" }}
    >
      {/* Panel Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: "rgba(255, 55, 0, 0.08)" }}
      >
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-neutral-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400" style={{ fontFamily: '"Orbitron", sans-serif' }}>
            Live Agent Sandbox
          </span>
        </div>
        {isRunning && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-green-500 uppercase tracking-wider" style={{ fontFamily: '"Orbitron", sans-serif' }}>
              Active
            </span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {!isRunning ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 animate-pulse">
              <Play size={20} fill="currentColor" className="translate-x-[1px]" />
            </div>
            <div className="max-w-md">
              <h3 className="text-sm font-semibold text-white mb-2" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                Agent Sandbox Offline
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed" style={{ fontFamily: '"Outfit", sans-serif' }}>
                Your code is configured but not running yet. Start the agent sandbox to open a real-time transaction channel.
              </p>
            </div>
            <button
              onClick={handleStartAgent}
              className="px-5 py-2.5 rounded-lg text-xs font-semibold text-black bg-orange-500 hover:bg-orange-600 transition-all duration-200 shadow-[0_4px_14px_rgba(255,85,0,0.3)]"
              style={{ fontFamily: '"Orbitron", sans-serif' }}
            >
              Start Agent Sandbox
            </button>
          </div>
        ) : (
          <>
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
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed`}
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
                          className="w-72 bg-neutral-950 border rounded-xl p-3 text-xs space-y-2 mt-1 shadow-md"
                          style={{ borderColor: "rgba(255, 55, 0, 0.15)" }}
                        >
                          <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: "rgba(255, 55, 0, 0.08)" }}>
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck size={13} className="text-orange-500" />
                              <span className="font-semibold text-neutral-300" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                                {tc.function.name === "swap" ? "Jupiter Swap" : "Solana Action"}
                              </span>
                            </div>
                            <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                              Success
                            </span>
                          </div>
                          <div className="space-y-1 text-neutral-400 font-mono text-[10px]">
                            {Object.entries(args).map(([k, v]) => (
                              <div key={k} className="flex justify-between">
                                <span className="text-neutral-500">{k}:</span>
                                <span>{String(v)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: "rgba(255, 55, 0, 0.08)" }}>
                            <span className="text-[9px] text-neutral-500 font-mono">
                              Tx: 4d2z...k8wP
                            </span>
                            <a
                              href="https://explorer.solana.com/?cluster=devnet"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-orange-500 flex items-center gap-1 hover:underline"
                            >
                              <span>Solana Explorer</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isLoading && (
              <div className="flex items-center gap-2 text-neutral-500 text-xs py-2 px-3">
                <Loader2 size={12} className="animate-spin text-orange-500" />
                <span style={{ fontFamily: '"Outfit", sans-serif' }}>Agent thinking...</span>
              </div>
            )}
          </>
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
            onChange={handleInputChange}
            disabled={!isRunning || isLoading}
            placeholder={
              isRunning
                ? "Ask your agent to trade, mint, or check balance..."
                : "Sandbox offline. Run code to activate input..."
            }
            className="flex-1 bg-neutral-900 border text-sm rounded-xl px-4 py-2 text-white placeholder-neutral-500 focus:outline-none transition-all duration-200"
            style={{
              fontFamily: '"Outfit", sans-serif',
              borderColor: isRunning ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.03)",
            }}
          />
          <button
            type="submit"
            disabled={!isRunning || isLoading || !input.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: isRunning ? "linear-gradient(135deg, #ff3700 0%, #ffae00 100%)" : "rgba(255, 255, 255, 0.05)",
              color: isRunning ? "#000" : "#444",
            }}
          >
            <Send size={14} className={isRunning ? "text-black" : "text-neutral-500"} />
          </button>
        </form>
      </div>
    </div>
  );
}
