"use client";

import { useEffect, useState, type MouseEvent } from "react";

type Step = {
  id: string;
  next: string | null;
  label: string;
};

/** Guia: texto aponta o próximo passo da página */
const STEPS_A: Step[] = [
  { id: "hero", next: "dor", label: "Onde a venda pode se perder" },
  { id: "dor", next: "metodo", label: "Como a análise é feita" },
  { id: "metodo", next: "ia", label: "Ver análise nas IAs" },
  { id: "ia", next: "como", label: "Entender os 30 dias" },
  { id: "como", next: "depois", label: "Ver o que está incluído" },
  { id: "depois", next: "garantia", label: "Ver nosso compromisso" },
  { id: "garantia", next: "preco", label: "Ver o investimento" },
  { id: "preco", next: "interesse", label: "Quero uma leitura do meu caso" },
  { id: "interesse", next: null, label: "Conversar sobre meu caso" },
  { id: "faq", next: null, label: "Conversar sobre meu caso" },
];

const STEPS_B: Step[] = [
  { id: "hero", next: "dor", label: "Onde a venda pode se perder" },
  { id: "dor", next: "metodo", label: "Como a análise é feita" },
  { id: "metodo", next: "ia", label: "Ver análise nas IAs" },
  { id: "ia", next: "como", label: "Entender a entrega" },
  { id: "como", next: "depois", label: "O que você recebe" },
  { id: "depois", next: "preco", label: "Ver o investimento" },
  { id: "preco", next: "interesse", label: "Quero analisar meu caso" },
  { id: "interesse", next: null, label: "Conversar sobre meu caso" },
  { id: "faq", next: null, label: "Conversar sobre meu caso" },
];

type Props = {
  /** Destino final (WhatsApp). Se vazio, fica em #interesse */
  finalHref: string;
  hideGarantia?: boolean;
};

export default function PresencaStickyGuide({
  finalHref,
  hideGarantia = false,
}: Props) {
  const STEPS = hideGarantia ? STEPS_B : STEPS_A;
  const [step, setStep] = useState<Step>(STEPS[0]!);

  useEffect(() => {
    const els = STEPS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => !!el,
    );
    if (!els.length) return;

    const pick = () => {
      const y = window.scrollY + Math.min(160, window.innerHeight * 0.28);
      let currentId = els[0]!.id;
      for (const el of els) {
        if (el.offsetTop <= y) currentId = el.id;
      }
      const found = STEPS.find((s) => s.id === currentId) ?? STEPS[0]!;
      setStep(found);
    };

    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, [hideGarantia]);

  const isFinal = !step.next;
  const href = isFinal ? finalHref || "#interesse" : `#${step.next}`;

  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (isFinal && finalHref && !finalHref.startsWith("#")) return; // WhatsApp
    e.preventDefault();
    const targetId = step.next ?? "interesse";
    const el = document.getElementById(targetId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      id="cta-sticky"
      className="pointer-events-none fixed bottom-4 left-4 right-4 z-40 flex justify-center pb-[env(safe-area-inset-bottom)]"
    >
      <a
        id="cta-sticky-btn"
        href={href}
        onClick={onClick}
        className="pointer-events-auto rounded-full px-5 py-3 text-base font-bold text-white shadow-[0_8px_28px_rgba(234,88,12,0.35)] transition-[transform,box-shadow] duration-200 hover:scale-[1.02]"
        style={{
          background: "linear-gradient(180deg, #f97316, #c2410c)",
        }}
        target={isFinal && finalHref.startsWith("http") ? "_blank" : undefined}
        rel={isFinal && finalHref.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {step.label}
      </a>
    </div>
  );
}
