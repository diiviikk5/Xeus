"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type NavItem = { label: string; description?: string; external?: boolean };
type NavColumn = { heading: string; items: NavItem[]; groups?: NavItem[][] };
type Announcement = {
  eyebrow: string;
  image: string;
  title: string;
  ctaLabel: string;
};
type NavLink = {
  label: string;
  active?: boolean;
  dropdown?: boolean;
  columns?: NavColumn[];
  extra?: NavColumn;
  announcement?: Announcement;
};

const navLinks: NavLink[] = [
  {
    label: "Platform",
    dropdown: true,
    columns: [
      {
        heading: "Who is it for?",
        items: [
          { label: "Solana Developers", description: "Write, test, and run agents in TypeScript." },
          { label: "AI Engineers", description: "Deploy agentic systems to mainnet/devnet." },
          { label: "Product Leaders", description: "Scaffold Solana agent logic in plain English." },
          { label: "Hackathon Teams", description: "Fork agent templates and launch in minutes." },
          { label: "Ecosystem Protocols", description: "Integrate custom action plugins set." },
          { label: "Security Researchers", description: "Simulate and verify agent transaction guardrails." },
        ],
      },
    ],
    extra: {
      heading: "Core Modules",
      items: [
        { label: "Monaco IDE", description: "Solana-aware browser editor." },
        { label: "Devnet Wallet", description: "Auto-faucet and wallet sandbox." },
      ],
    },
  },
  {
    label: "Resources",
    dropdown: true,
    columns: [
      {
        heading: "Learn & Build",
        items: [],
        groups: [
          [
            { label: "Agent Kit Docs", description: "Under the hood of Solana Agent Kit." },
            { label: "Templates", description: "DCA, NFT, and Swap preset configs." },
            { label: "Guides", description: "Master custom plugin creation." },
          ],
          [
            { label: "GitHub", description: "100% open-source codebase." },
            { label: "Examples", description: "Interactive agent walkthroughs." },
          ],
        ],
      },
    ],
    announcement: {
      eyebrow: "Announcement",
      image: "/vendor/announcement.jpg",
      title: "Introducing Xeus: The Open-Source Solana Playground for AI Agents",
      ctaLabel: "Read the docs",
    },
  },
  { label: "Ecosystem" },
  { label: "Templates" },
  { label: "Docs" },
  { label: "GitHub" },
];

const ARROW_SRC = "/vendor/arrow-right.svg";

const ArrowButton = ({ children }: { children: React.ReactNode }) => (
  <Link
    href="/playground"
    className="group relative inline-flex items-center justify-center overflow-hidden"
    style={{
      height: 38,
      padding: "12px 18px",
      gap: 10,
      borderRadius: 9,
      border: "1px solid rgba(255,255,255,0.15)",
      background: "linear-gradient(135deg, #ff3700 0%, #ffae00 100%)",
      color: "#ffffff",
      fontFamily: 'var(--font-geist-pixel-square)',
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 4px 14px 0 rgba(255,55,0,0.35)",
      transition: "all 0.3s ease",
      textDecoration: "none",
    }}
  >
    <style>{`
      .group:hover {
        box-shadow: 0 6px 20px 0 rgba(255,55,0,0.5), 0 0 0 1px rgba(255,255,255,0.3) !important;
        transform: translateY(-1px);
      }
      .group:active {
        transform: translateY(0);
      }
    `}</style>
    <span style={{ zIndex: 2 }}>{children}</span>
    <span style={{ position: "relative", width: 14, height: 14, overflow: "hidden", display: "inline-block", zIndex: 2, filter: "brightness(0) invert(1)" }}>
      <img
        src={ARROW_SRC}
        width={14}
        height={14}
        alt=""
        className="absolute inset-0 translate-x-0 group-hover:translate-x-[150%]"
        style={{ transition: "transform 500ms cubic-bezier(0.65,0,0.35,1)" }}
      />
      <img
        src={ARROW_SRC}
        width={14}
        height={14}
        alt=""
        className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-0"
        style={{ transition: "transform 500ms cubic-bezier(0.65,0,0.35,1)" }}
      />
    </span>
  </Link>
);

const HeroNavbar = () => {
  const router = useRouter();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const currentDropdownLink = navLinks.find((l) => l.label === activeDropdown) as
    | (NavLink & { columns: NavColumn[]; extra?: NavColumn; announcement?: Announcement })
    | undefined;
  const platformLink = navLinks.find((l) => l.label === "Platform") as NavLink & {
    columns: NavColumn[];
    extra: NavColumn;
  };
  void platformLink;

  return (
    <>
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          pointerEvents: "none",
          backdropFilter: aboutOpen ? "blur(8px)" : "blur(0px)",
          WebkitBackdropFilter: aboutOpen ? "blur(8px)" : "blur(0px)",
          background: aboutOpen ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0)",
          transition:
            "backdrop-filter 280ms ease, -webkit-backdrop-filter 280ms ease, background 280ms ease",
        }}
      />

      <nav
        className="fixed top-0 left-0 right-0 z-50 grid items-center hero-nav"
        style={{
          gridTemplateColumns: "1fr auto 1fr",
          background: "rgba(10, 10, 10, 0.65)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "0 clamp(1rem, 3vw, 2rem)",
          height: 70,
          fontFamily: '"Outfit", sans-serif',
        }}
      >
        <style>{`
          @media (max-width: 1024px) {
            .hero-nav-links { display: none !important; }
            .hero-nav { grid-template-columns: 1fr 1fr !important; }
          }
          @media (max-width: 600px) {
            .hero-nav-contact { display: none !important; }
          }
          .about-panel { opacity: 0; pointer-events: none; transition: opacity 220ms ease; }
          .about-panel[data-open="true"] { opacity: 1; pointer-events: auto; }
          .about-panel-inner {
            opacity: 0;
            transform: translateY(-12px);
            transition: opacity 320ms ease, transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
          }
          .about-panel[data-open="true"] .about-panel-inner {
            opacity: 1;
            transform: translateY(0);
            transition-delay: 80ms;
          }
          .about-item {
            color: rgba(255,255,255,0.92);
            font-family: "Outfit", sans-serif;
            font-size: 15px;
            font-weight: 600;
            background: transparent;
            border: none;
            padding: 10px 0;
            cursor: pointer;
            text-align: left;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
            transition: color 180ms ease;
            break-inside: avoid;
          }
          .about-item:hover { color: #fff; }
          .about-item-desc {
            color: rgba(255,255,255,0.55);
            font-size: 13px;
            font-weight: 400;
          }
          .about-heading {
            color: rgba(255,255,255,0.45);
            font-family: "Outfit", sans-serif;
            font-size: 12px;
            font-weight: 500;
            margin-bottom: 14px;
            letter-spacing: 0.02em;
          }
          /* Text logo hover transition */
          .logo-text-link {
            transition: opacity 0.25s ease;
          }
          .logo-text-link:hover {
            opacity: 0.85;
          }
        `}</style>

        <div className="flex items-center">
          <a
            href="/"
            className="logo-text-link"
            aria-label="Xeus"
            style={{
              fontFamily: 'var(--font-geist-pixel-square)',
              fontSize: "1.45rem",
              fontWeight: 900,
              letterSpacing: "0.06em",
              color: "#ffffff",
              textDecoration: "none",
              background: "linear-gradient(135deg, #ffffff 60%, rgba(255,255,255,0.70) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Xeus
          </a>
        </div>

        <div
          className="flex items-center justify-center hero-nav-links"
          style={{ gap: 4, position: "relative" }}
        >
          {navLinks.map((link) => {
            const hasDropdown = !!link.dropdown;
            const isOpen = hasDropdown && activeDropdown === link.label;
            const highlighted = link.active || isOpen;
            return (
              <button
                key={link.label}
                className="flex items-center transition-colors duration-200"
                style={{
                  gap: 4,
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  padding: "6px 14px",
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  color: highlighted ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.65)",
                }}
                onClick={() => {
                  if (link.label === "Docs") {
                    router.push("/docs");
                  } else if (link.label === "Templates") {
                    router.push("/templates");
                  } else if (link.label === "Ecosystem") {
                    router.push("/ecosystem");
                  } else if (link.label === "GitHub") {
                    window.open("https://github.com/diiviikk5/Xeus", "_blank");
                  }
                }}
                onMouseEnter={(e) => {
                  if (hasDropdown) {
                    setActiveDropdown(link.label);
                    setAboutOpen(true);
                  } else {
                    setActiveDropdown(null);
                    setAboutOpen(false);
                  }
                  if (!link.active) e.currentTarget.style.color = "rgba(255,255,255,0.95)";
                }}
                onMouseLeave={(e) => {
                  if (!link.active && !isOpen)
                    e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                }}
              >
                {link.label}
                {link.dropdown && (
                  <ChevronDown
                    size={11}
                    color="rgba(255,255,255,0.65)"
                    style={{
                      transition: "transform 220ms ease",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-end" style={{ gap: "1rem" }}>
          <ArrowButton>Open Xeus</ArrowButton>
        </div>
      </nav>

      <div
        className="about-panel"
        data-open={aboutOpen}
        onMouseEnter={() => setAboutOpen(true)}
        onMouseLeave={() => {
          setAboutOpen(false);
          setActiveDropdown(null);
        }}
        style={{
          position: "fixed",
          top: 70,
          left: 0,
          right: 0,
          background: "rgba(15,15,15,0.85)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          padding: "32px 0 40px",
          zIndex: 60,
        }}
      >
        <div
          className="about-panel-inner"
          style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}
        >
          {currentDropdownLink && (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 64 }}>
              {currentDropdownLink.columns.map((col) => (
                <div key={col.heading} style={{ display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.08)", paddingRight: 32 }}>
                  <div className="about-heading">{col.heading}</div>
                  {col.groups ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
                      {col.groups.map((group, gi) => (
                        <div key={gi} style={{ display: "flex", flexDirection: "column" }}>
                          {group.map((it) => (
                            <button
                              key={it.label}
                              className="about-item"
                              style={{ width: "100%" }}
                              onClick={() => {
                                setAboutOpen(false);
                                setActiveDropdown(null);
                                if (it.label === "Agent Kit Docs" || it.label === "Guides" || it.label === "Examples") {
                                  router.push("/docs");
                                } else if (it.label === "Templates") {
                                  router.push("/templates");
                                } else if (it.label === "GitHub") {
                                  window.open("https://github.com/diiviikk5/Xeus", "_blank");
                                }
                              }}
                            >
                              <span>{it.label}</span>
                              {it.description && <span className="about-item-desc">{it.description}</span>}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ columnCount: 2, columnGap: 48 }}>
                      {col.items.map((it) => (
                        <button
                          key={it.label}
                          className="about-item"
                          style={{ width: "100%" }}
                          onClick={() => {
                            setAboutOpen(false);
                            setActiveDropdown(null);
                            if (it.label === "Solana Developers" || it.label === "AI Engineers" || it.label === "Product Leaders" || it.label === "Hackathon Teams" || it.label === "Ecosystem Protocols" || it.label === "Security Researchers") {
                              router.push("/playground");
                            }
                          }}
                        >
                          <span>{it.label}</span>
                          {it.description && <span className="about-item-desc">{it.description}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {currentDropdownLink.announcement ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div className="about-heading">{currentDropdownLink.announcement.eyebrow}</div>
                  <button
                    className="about-item"
                    style={{ padding: 0, gap: 14, alignItems: "stretch" }}
                    onClick={() => {
                      setAboutOpen(false);
                      setActiveDropdown(null);
                      router.push("/docs");
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "16 / 9",
                        borderRadius: 10,
                        overflow: "hidden",
                        background:
                          "linear-gradient(135deg, #2a1530 0%, #1a1a1a 60%, #2a1a2a 100%)",
                      }}
                    >
                      <img
                        src={currentDropdownLink.announcement.image}
                        alt=""
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>
                      {currentDropdownLink.announcement.title}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: "rgba(255,255,255,0.85)",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {currentDropdownLink.announcement.ctaLabel}
                      <span style={{ transform: "translateY(-1px)" }}>›</span>
                    </span>
                  </button>
                </div>
              ) : currentDropdownLink.extra ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div className="about-heading">{currentDropdownLink.extra.heading}</div>
                  {currentDropdownLink.extra.items.map((it) => (
                    <button
                      key={it.label}
                      className="about-item"
                      onClick={() => {
                        setAboutOpen(false);
                        setActiveDropdown(null);
                        if (it.label === "Monaco IDE" || it.label === "Devnet Wallet") {
                          router.push("/playground");
                        }
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {it.label}
                        {it.external && <span style={{ transform: "translateY(-1px)" }}>↗</span>}
                      </span>
                      {it.description && <span className="about-item-desc">{it.description}</span>}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HeroNavbar;
