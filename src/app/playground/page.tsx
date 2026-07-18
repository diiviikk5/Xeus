"use client";

import { useEffect } from "react";
import { usePlayground } from "@/hooks/usePlayground";
import FileExplorer from "@/features/editor/FileExplorer";
import EditorToolbar from "@/features/editor/EditorToolbar";
import CodeEditor from "@/features/editor/CodeEditor";
import ConsoleLogs from "@/features/editor/ConsoleLogs";
import ChatPanel from "@/features/chat/ChatPanel";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PlaygroundPage() {
  const { loadTemplate } = usePlayground();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const template = params.get("template");
      if (template === "scout" || template === "arbitrage" || template === "nftCreator" || template === "daoMonitor" || template === "tokenLaunch") {
        loadTemplate(template as any);
      }
    }
  }, [loadTemplate]);

  return (
    <div className="w-full h-screen bg-black text-white flex flex-col overflow-hidden select-none selection:bg-orange-500/20">
      {/* Playground Header */}
      <header
        className="h-14 w-full px-4 flex items-center justify-between border-b flex-shrink-0"
        style={{ borderColor: "rgba(255, 55, 0, 0.12)", background: "rgba(10, 10, 10, 0.8)" }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors duration-150"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            <ArrowLeft size={14} />
            <span>Exit IDE</span>
          </Link>
          <div className="w-[1px] h-4 bg-neutral-800" />
          <span
            className="text-sm font-semibold tracking-wider"
            style={{
              fontFamily: 'var(--font-geist-pixel-square)',
              background: "linear-gradient(135deg, #ff3700 0%, #ffae00 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Xeus Playground
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-500" style={{ fontFamily: '"Outfit", sans-serif' }}>
          <span>Solana Devnet</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        </div>
      </header>

      {/* Main Workspace Split */}
      <div className="flex-1 w-full flex overflow-hidden min-h-0">
        {/* Left: File Explorer */}
        <FileExplorer />

        {/* Center: Editor + Console */}
        <div className="flex-1 h-full flex flex-col min-w-0">
          <EditorToolbar />
          <div className="flex-1 min-h-0">
            <CodeEditor />
          </div>
          <ConsoleLogs />
        </div>

        {/* Right: Live Chat Sandbox */}
        <div className="w-96 h-full flex-shrink-0">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}
