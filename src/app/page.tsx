"use client";

import { ArrowRight } from "lucide-react";
import HeroShader from "@/components/HeroShader";
import HeroNavbar from "@/components/HeroNavbar";
import PromptInput from "@/components/PromptInput";
import SectionTrustedBy from "@/components/SectionTrustedBy";

export default function Page() {
  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-x-hidden">
      <HeroNavbar />
      <div className="relative w-full overflow-hidden" style={{ height: "100vh" }}>
        <HeroShader />
        <div className="absolute inset-0 flex items-center justify-center px-4 pointer-events-none">
          <div
            className="pointer-events-auto w-full flex flex-col items-center"
            style={{ fontFamily: '"Outfit", sans-serif' }}
          >
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "6px 16px 6px 6px",
                borderRadius: 999,
                background: "rgba(15,15,15,0.6)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                color: "#fff",
                fontSize: 14,
                textDecoration: "none",
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  background: "linear-gradient(135deg, #ff3700 0%, #ffae00 100%)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 999,
                }}
              >
                New
              </span>
              <span style={{ color: "rgba(255,255,255,0.92)", fontWeight: 400 }}>
                Xeus Playground v1.0 – Deploy agents in 60s
              </span>
              <ArrowRight size={16} color="rgba(255,255,255,0.85)" />
            </a>
            <h1
              style={{
                fontSize: "clamp(3.5rem, 8vw, 5.8rem)",
                fontWeight: 900,
                letterSpacing: "0.04em",
                lineHeight: 1,
                marginBottom: 16,
                textAlign: "center",
                fontFamily: 'var(--font-geist-pixel-square)',
                color: "#ffffff",
              }}
            >
              Xeus
            </h1>
            <h2
              style={{
                fontSize: "clamp(1.6rem, 3.6vw, 2.6rem)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
                marginTop: 12,
                marginBottom: 16,
                textAlign: "center",
                fontFamily: '"Orbitron", sans-serif',
                color: "#ffffff",
              }}
            >
              Build something{" "}
              <span className="gradient-text-animate" style={{ display: "inline-block", fontFamily: 'var(--font-geist-pixel-square)', letterSpacing: "0.01em" }}>
                Autonomous
              </span>
            </h2>
            <p
              style={{
                fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)",
                color: "rgba(255, 255, 255, 0.65)",
                marginTop: 0,
                marginBottom: 36,
                textAlign: "center",
                fontFamily: '"Outfit", sans-serif',
                letterSpacing: "-0.01em",
              }}
            >
              Write, test, and deploy on-chain agents in your browser
            </p>
            <PromptInput />
          </div>
        </div>
      </div>
      <SectionTrustedBy />
    </div>
  );
}
