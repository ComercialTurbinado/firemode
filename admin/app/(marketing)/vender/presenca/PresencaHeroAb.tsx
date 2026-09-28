"use client";

import { WaitlistHero } from "@/components/ui/waitlist-hero";
import {
  isPresencaAbId,
  pickRandomPresencaAb,
  PRESENCA_AB_STORAGE_KEY,
  PRESENCA_AB_VARIANTS,
  type PresencaAbId,
} from "@/lib/vender-presenca-ab";
import { PRESENCA_B_HERO } from "@/lib/vender-presenca-lp-b";
import { useEffect, useState } from "react";

type Props = {
  whatsappUrl: string | null;
  /** a = controle · b = teste (esteira, sem garantia) */
  lpVariant?: "a" | "b";
};

function resolveAbFromUrl(): PresencaAbId | null {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search).get("ab");
  return isPresencaAbId(q) ? q : null;
}

function resolveOrAssignAb(): PresencaAbId {
  const fromUrl = resolveAbFromUrl();
  if (fromUrl) {
    try {
      localStorage.setItem(PRESENCA_AB_STORAGE_KEY, fromUrl);
    } catch {
      /* ignore */
    }
    return fromUrl;
  }
  try {
    const saved = localStorage.getItem(PRESENCA_AB_STORAGE_KEY);
    if (isPresencaAbId(saved)) return saved;
  } catch {
    /* ignore */
  }
  const picked = pickRandomPresencaAb();
  try {
    localStorage.setItem(PRESENCA_AB_STORAGE_KEY, picked);
  } catch {
    /* ignore */
  }
  return picked;
}

export default function PresencaHeroAb({
  whatsappUrl,
  lpVariant = "a",
}: Props) {
  const [ab, setAb] = useState<PresencaAbId | null>(null);
  const isB = lpVariant === "b";

  useEffect(() => {
    setAb(resolveOrAssignAb());
  }, []);

  // Evita flash da variante errada no SSR (bg transparente p/ ColorBends fixo)
  if (!ab) {
    return <div className="w-full min-h-[100svh] bg-transparent" aria-hidden />;
  }

  const v = PRESENCA_AB_VARIANTS[ab];

  return (
    <WaitlistHero
      title={v.title}
      subtitle={isB ? PRESENCA_B_HERO.subtitulo : v.subtitle}
      ctaLabel={isB ? PRESENCA_B_HERO.cta : "Quero saber o que o cliente vê"}
      successLabel="Abrindo o WhatsApp"
      placeholder="site.com.br ou @instagram"
      field="presence"
      whatsappUrl={whatsappUrl}
      abVariant={isB ? `b-${ab}` : ab}
    />
  );
}
