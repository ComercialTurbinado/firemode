"use client";

import GlassSurface from "@/components/ui/glass-surface";
import { useEffect, useState } from "react";

const NAV = [
  { id: "hero", label: "Início" },
  { id: "video", label: "Vídeo" },
  { id: "dor", label: "Problema" },
  { id: "garantia", label: "Garantia" },
  { id: "como", label: "Como funciona" },
  { id: "faq", label: "FAQ" },
  { id: "interesse", label: "Diagnóstico", cta: true },
] as const;

export default function PresencaMenubar() {
  const [active, setActive] = useState<string>("hero");

  useEffect(() => {
    const sections = NAV.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => !!el,
    );
    if (!sections.length) return;

    const pick = () => {
      const y = window.scrollY + Math.min(140, window.innerHeight * 0.22);
      let current = sections[0]!.id;
      for (const el of sections) {
        if (el.offsetTop <= y) current = el.id;
      }
      setActive(current);
    };

    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, []);

  function goTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  }

  return (
    <header className="lp-menubar" aria-label="Navegação da página">
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={999}
        backgroundOpacity={0.18}
        saturation={1.35}
        brightness={48}
        blur={10}
        displace={0.4}
        distortionScale={-120}
        className="lp-menubar__glass"
      >
        <nav className="lp-menubar__nav">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`lp-menubar__link${"cta" in item && item.cta ? " lp-menubar__cta" : ""}${
                active === item.id ? " is-active" : ""
              }`}
              aria-current={active === item.id ? "true" : undefined}
              onClick={() => goTo(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </GlassSurface>
    </header>
  );
}
