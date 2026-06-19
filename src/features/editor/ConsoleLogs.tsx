"use client";

import { usePlayground } from "@/hooks/usePlayground";
import { useEffect, useRef } from "react";
import { Terminal, Trash2 } from "lucide-react";

export default function ConsoleLogs() {
  const { consoleLogs, clearConsoleLogs } = usePlayground();
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleLogs]);

  return (
    <div
      className="h-44 w-full bg-black border-t flex flex-col overflow-hidden select-none"
      style={{ borderColor: "rgba(255, 55, 0, 0.12)" }}
    >
      {/* Console Header */}
      <div
        className="px-4 py-2 border-b flex items-center justify-between flex-shrink-0"
        style={{ borderColor: "rgba(255, 55, 0, 0.08)", background: "#050505" }}
      >
        <div className="flex items-center gap-2 text-neutral-400">
          <Terminal size={12} />
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: '"Orbitron", sans-serif' }}>
            Console Logs
          </span>
        </div>
        <button
          onClick={clearConsoleLogs}
          className="text-neutral-500 hover:text-white p-1 rounded transition-colors duration-150"
          aria-label="Clear console"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Logs Scroll Container */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] text-neutral-400 space-y-1 bg-black select-text selection:bg-orange-500/20">
        {consoleLogs.length === 0 ? (
          <div className="text-neutral-600 italic">No output logs.</div>
        ) : (
          consoleLogs.map((log, idx) => {
            const isError = log.includes("[ERROR]");
            const isXeus = log.includes("[xeus]");
            return (
              <div
                key={idx}
                className="whitespace-pre-wrap leading-relaxed"
                style={{
                  color: isError ? "#ef4444" : isXeus ? "#ff5500" : "rgba(255,255,255,0.7)",
                }}
              >
                {log}
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
