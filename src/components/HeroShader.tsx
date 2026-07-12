"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    _heroProjectData?: unknown;
    CoreRenderer?: {
      init: () => Promise<void>;
      destroy?: () => void;
    };
  }
}

async function loadScript(src: string) {
  const cacheKey = `__loaded_${src}`;
  if ((window as unknown as Record<string, boolean>)[cacheKey]) return;
  const res = await fetch(src, { credentials: "omit" });
  if (!res.ok) throw new Error(`fetch ${src} -> ${res.status}`);
  const text = await res.text();
  // Execute in global scope so it can assign to window.* like a normal <script>.
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  new Function(text).call(window);
  (window as unknown as Record<string, boolean>)[cacheKey] = true;
}

export default function HeroShader({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let blobUrl: string | null = null;

    (async () => {
      try {
        await loadScript("/vendor/core-renderer.js");
        await loadScript("/vendor/hero-project.js");
        if (cancelled) return;

        const projectData = window._heroProjectData;
        const container = containerRef.current;
        if (!projectData || !container || !window.CoreRenderer) return;

        const blob = new Blob([JSON.stringify(projectData)], { type: "application/json" });
        blobUrl = URL.createObjectURL(blob);
        container.setAttribute("data-cr-project-src", blobUrl);

        await window.CoreRenderer.init();
        if (blobUrl) URL.revokeObjectURL(blobUrl);

        if (!cancelled) {
          // wait for renderer to paint a few frames before fading in
          setTimeout(() => {
            if (!cancelled) setReady(true);
          }, 250);
        }

        // Nudge a mousemove so any mouse-tracking layers initialize.
        window.dispatchEvent(
          new MouseEvent("mousemove", {
            clientX: window.innerWidth / 2,
            clientY: window.innerHeight / 2,
            bubbles: true,
          }),
        );
      } catch (err) {
        console.error("[HeroShader] init failed", err);
      }
    })();

    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      if (window.CoreRenderer && window.CoreRenderer.destroy) {
        try {
          window.CoreRenderer.destroy();
        } catch (err) {
          console.error("[HeroShader] destroy failed", err);
        }
      }
    };
  }, []);

  return (
    <div
      id="hero-canvas"
      ref={containerRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        overflow: "hidden",
        opacity: ready ? 1 : 0,
        transform: ready ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 1.4s cubic-bezier(0.22, 1, 0.36, 1), transform 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: "opacity, transform",
      }}
    />
  );
}
