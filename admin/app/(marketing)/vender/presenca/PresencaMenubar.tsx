"use client";

import GlassSurface from "@/components/ui/glass-surface";
import { useEffect, useState } from "react";

const NAV_ALL = [
  { id: "hero", label: "Início" },
  { id: "dor", label: "Problema" },
  { id: "metodo", label: "Método" },
  { id: "conteudo", label: "Peça" },
  { id: "ia", label: "IA" },
  { id: "como", label: "Como" },
  { id: "depois", label: "Entrega" },
  { id: "garantia", label: "Garantia" },
  { id: "preco", label: "Investimento" },
  { id: "interesse", label: "Começar", cta: true },
] as const;

type Props = { hideGarantia?: boolean };

export default function PresencaMenubar({ hideGarantia = false }: Props) {
  const NAV = hideGarantia
    ? NAV_ALL.filter((item) => item.id !== "garantia")
    : NAV_ALL;
  const [active, setActive] = useState<string>("hero");
  const [light, setLight] = useState(false);

  useEffect(() => {
    const root = document.getElementById("lp-presenca");
    if (!root) return;

    const sync = () => setLight(root.dataset.light === "1");
    sync();

    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ["data-light"] });
    return () => mo.disconnect();
  }, []);

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
  }, [hideGarantia]);

  function goTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  }

  return (
    <header className="lp-menubar" aria-label="Navegação da página">
      {/* Desktop — glass horizontal */}
      <div className="lp-menubar__desktop">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={999}
          backgroundOpacity={light ? 0.78 : 0.18}
          saturation={light ? 1.15 : 1.35}
          brightness={light ? 92 : 48}
          blur={light ? 12 : 10}
          displace={0.4}
          distortionScale={-120}
          className={`lp-menubar__glass${light ? " lp-menubar__glass--light" : ""}`}
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
      </div>

      {/* Mobile — burger 100% CSS (:target) */}
      <div className="lp-menubar__mobile">
        <a
          href="#lp-mobile-nav"
          className="lp-menubar__burger"
          aria-label="Abrir menu"
        >
          <span />
          <span />
          <span />
        </a>
      </div>

      <nav id="lp-mobile-nav" className="lp-menubar__drawer" aria-label="Menu mobile">
        <a href="#!" className="lp-menubar__drawer-backdrop" aria-label="Fechar menu" />
        <div className="lp-menubar__drawer-panel">
          <a href="#!" className="lp-menubar__drawer-close" aria-label="Fechar">
            ×
          </a>
          <ul className="lp-menubar__drawer-list">
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`lp-menubar__drawer-link${
                    "cta" in item && item.cta ? " lp-menubar__drawer-link--cta" : ""
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
