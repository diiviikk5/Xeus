"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const LOGO_BASE = "/vendor/";
const LOGOS = [
  "solana.svg",
  "phantom.svg",
  "jupiter.svg",
  "metaplex.svg",
  "helius.svg",
];

const useIsMobile = () => {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
};

const SectionTrustedBy = () => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const innerRefs = useRef<HTMLDivElement[]>([]);
  const slotRefs = useRef<HTMLDivElement[]>([]);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const setWidthRef = useRef(0);

  // Repeat the logos to ensure a continuous strip wider than the viewport
  const REPEATS = 6;
  const strip = Array.from({ length: REPEATS }).flatMap((_, r) =>
    LOGOS.map((file, i) => ({ file, key: `${r}-${i}-${file}`, idx: r * LOGOS.length + i })),
  );

  // Measure one logical "set" width from the unscaled slot widths so the loop
  // distance stays constant regardless of per-item transforms.
  const measure = () => {
    const slots = slotRefs.current;
    if (!slots.length) return;
    const perSet = LOGOS.length;
    let w = 0;
    for (let i = 0; i < perSet; i++) {
      const s = slots[i];
      if (!s) return;
      const r = s.getBoundingClientRect();
      w += r.width;
    }
    // include one gap per item (flex gap is between items)
    const gap = isMobile ? 56 : 88;
    w += gap * perSet;
    setWidthRef.current = w;
  };

  useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const speed = isMobile ? 55 : 80; // px/s

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!pausedRef.current) offsetRef.current += speed * dt;

      const container = containerRef.current;
      const track = trackRef.current;
      const setWidth = setWidthRef.current;
      if (!container || !track) {
        raf = requestAnimationFrame(tick);
        return;
      }
      // seamless wrap using measured set width (stable, never glitches)
      if (setWidth > 0) {
        offsetRef.current = ((offsetRef.current % setWidth) + setWidth) % setWidth;
      }
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;

      const cw = container.clientWidth;
      const cx = cw / 2;
      const cLeft = container.getBoundingClientRect().left;
      const slots = slotRefs.current;
      const inners = innerRefs.current;

      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const inner = inners[i];
        if (!slot || !inner) continue;
        const r = slot.getBoundingClientRect();
        const elCenter = r.left + r.width / 2 - cLeft;
        // normalized position across viewport: -1 (left) .. 1 (right)
        const t = (elCenter - cx) / (cx || 1);
        const ct = Math.max(-1.3, Math.min(1.3, t));
        // smooth bell — modern orbit-like depth curve
        const bulge = Math.cos(Math.max(-1, Math.min(1, ct)) * (Math.PI / 2));
        // subtle orbit: gentle rotateY + tiny y arc
        const rotY = -ct * 26; // deg
        const yArc = (1 - bulge) * -8; // lift edges slightly
        const tz = bulge * 140;
        const scale = 0.72 + bulge * 0.5; // 0.72 .. 1.22
        const edge = Math.max(0, 1 - Math.pow(Math.abs(ct), 1.5));
        const opacity = edge * (0.5 + bulge * 0.5);
        const blur = (1 - bulge) * 1.4;

        inner.style.transform =
          `translateY(${yArc}px) translateZ(${tz}px) rotateY(${rotY}deg) scale(${scale})`;
        inner.style.opacity = String(opacity);
        inner.style.filter = `brightness(0) invert(1) blur(${blur}px)`;
      }
      innerRefs.current = inners;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isMobile]);

  return (
    <section
      style={{
        background: "#000000",
        color: "#fff",
        padding: "60px 24px",
        width: "100%",
        borderTop: "1px solid rgba(255, 55, 0, 0.12)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
        >
          <h2
            style={{
              fontFamily: '"Orbitron", sans-serif',
              fontWeight: 900,
              fontSize: "0.85rem",
              lineHeight: 1.4,
              color: "#ff3700",
              letterSpacing: "0.15em",
              textAlign: "center",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Integrations
          </h2>
          <p
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 400,
              fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
              color: "rgba(255,255,255,0.65)",
              textAlign: "center",
              maxWidth: 600,
              margin: "6px 0 0 0",
            }}
          >
            Powering on-chain AI agents with the best Solana protocols
          </p>
        </motion.div>

        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: "100%",
            height: isMobile ? 110 : 140,
            position: "relative",
            overflow: "hidden",
            perspective: "1200px",
            perspectiveOrigin: "50% 50%",
            maskImage:
              "linear-gradient(90deg, transparent 0%, #000 20%, #000 80%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, #000 20%, #000 80%, transparent 100%)",
          }}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          <div
            ref={trackRef}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 56 : 88,
              width: "max-content",
              height: "100%",
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            {strip.map(({ file, key, idx }) => (
              <div
                key={key}
                ref={(el) => { if (el) slotRefs.current[idx] = el; }}
                style={{
                  flex: "0 0 auto",
                  height: isMobile ? 28 : 38,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transformStyle: "preserve-3d",
                  pointerEvents: "none",
                }}
              >
                <div
                  ref={(el) => { if (el) innerRefs.current[idx] = el; }}
                  style={{
                    transformStyle: "preserve-3d",
                    willChange: "transform, opacity, filter",
                    transformOrigin: "center center",
                  }}
                >
                  <img
                    src={LOGO_BASE + file}
                    alt=""
                    draggable={false}
                    style={{
                      height: isMobile ? 28 : 38,
                      width: "auto",
                      display: "block",
                      userSelect: "none",
                    }}
                    onLoad={measure}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SectionTrustedBy;
