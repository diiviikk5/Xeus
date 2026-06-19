"use client";

import { usePlayground } from "@/hooks/usePlayground";
import { FileCode, Settings } from "lucide-react";

export default function FileExplorer() {
  const { files, activeFileName, setActiveFile } = usePlayground();

  return (
    <div
      className="w-48 h-full bg-black border-r flex flex-col select-none"
      style={{ borderColor: "rgba(255, 55, 0, 0.12)" }}
    >
      <div
        className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 border-b flex items-center gap-2"
        style={{ borderColor: "rgba(255, 55, 0, 0.08)", fontFamily: '"Orbitron", sans-serif' }}
      >
        <span>Files</span>
      </div>
      <div className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {Object.keys(files).map((name) => {
          const isActive = name === activeFileName;
          return (
            <button
              key={name}
              onClick={() => setActiveFile(name)}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all duration-150 text-left group"
              style={{
                fontFamily: '"Outfit", sans-serif',
                background: isActive ? "rgba(255, 55, 0, 0.06)" : "transparent",
                color: isActive ? "#ff5500" : "rgba(255, 255, 255, 0.65)",
                borderLeft: isActive ? "2px solid #ff5500" : "2px solid transparent",
              }}
            >
              <FileCode
                size={14}
                className="transition-colors duration-150"
                style={{
                  color: isActive ? "#ff5500" : "rgba(255, 255, 255, 0.4)",
                }}
              />
              <span className="truncate group-hover:text-white transition-colors duration-150">
                {name}
              </span>
            </button>
          );
        })}
      </div>
      <div
        className="p-3 border-t flex items-center gap-2 text-xs text-neutral-500"
        style={{ borderColor: "rgba(255, 55, 0, 0.08)", fontFamily: '"Outfit", sans-serif' }}
      >
        <Settings size={12} />
        <span>v1.0.0 Devnet</span>
      </div>
    </div>
  );
}
