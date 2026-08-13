/** Variantes A/B do hero — LP /vender/presenca */

export type PresencaAbId = "2" | "3" | "7" | "8";

export type PresencaAbVariant = {
  id: PresencaAbId;
  title: string;
  subtitle: string;
};

/** Subline curto abaixo do título (todas as variantes A/B). */
export const PRESENCA_AB_SUBLINE = "Manda o site ou o Instagram. A gente te mostra.";

/** Texto abaixo do formulário: curto, claro, desejo. */
export const PRESENCA_AB_FORM_FOOTER =
  "Antes de gastar mais em post, descubra se o cliente te acha.\n\n" +
  "Tem site? A gente olha tudo. Só Instagram? Olhamos a rede — e se falta site.";

export const PRESENCA_AB_VARIANTS: Record<PresencaAbId, PresencaAbVariant> = {
  "2": {
    id: "2",
    title: "O cliente te vê… ou passa reto?",
    subtitle: PRESENCA_AB_SUBLINE,
  },
  "3": {
    id: "3",
    title: "Você posta. Mas te encontram?",
    subtitle: PRESENCA_AB_SUBLINE,
  },
  "7": {
    id: "7",
    title: "Sumiu na internet?",
    subtitle: PRESENCA_AB_SUBLINE,
  },
  "8": {
    id: "8",
    title: "Algo está te escondendo.",
    subtitle: PRESENCA_AB_SUBLINE,
  },
};

export const PRESENCA_AB_IDS = Object.keys(PRESENCA_AB_VARIANTS) as PresencaAbId[];

export const PRESENCA_AB_STORAGE_KEY = "fm_vender_presenca_ab";

export function isPresencaAbId(v: string | null | undefined): v is PresencaAbId {
  return v === "2" || v === "3" || v === "7" || v === "8";
}

export function pickRandomPresencaAb(): PresencaAbId {
  const i = Math.floor(Math.random() * PRESENCA_AB_IDS.length);
  return PRESENCA_AB_IDS[i]!;
}
