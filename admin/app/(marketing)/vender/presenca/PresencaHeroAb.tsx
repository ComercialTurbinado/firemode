"use client";

import { WaitlistHero } from "@/components/ui/waitlist-hero";
import {
  isPresencaAbId,
  pickRandomPresencaAb,
  PRESENCA_AB_FORM_FOOTER,
  PRESENCA_AB_STORAGE_KEY,
  PRESENCA_AB_VARIANTS,
  type PresencaAbId,
} from "@/lib/vender-presenca-ab";
import { useEffect, useState } from "react";

type Props = { whatsappUrl: string | null };

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

export default function PresencaHeroAb({ whatsappUrl }: Props) {
  const [ab, setAb] = useState<PresencaAbId | null>(null);

  useEffect(() => {
    setAb(resolveOrAssignAb());
  }, []);

  // Evita flash da variante errada no SSR
  if (!ab) {
    return (
      <div className="w-full min-h-[100svh] bg-[#09090b]" aria-hidden />
    );
  }

  const v = PRESENCA_AB_VARIANTS[ab];

  return (
    <WaitlistHero
      eyebrow="Diagnóstico"
      title={v.title}
      subtitle={v.subtitle}
      ctaLabel="Quero o diagnóstico"
      successLabel="Abrindo o WhatsApp"
      placeholder="site.com.br ou @instagram"
      field="presence"
      whatsappUrl={whatsappUrl}
      abVariant={ab}
      formFooter={PRESENCA_AB_FORM_FOOTER}
    />
  );
}
