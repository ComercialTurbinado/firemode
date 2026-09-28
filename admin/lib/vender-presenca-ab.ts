/** Oferta do Sprint — LP /vender/presenca (preço só na seção #preco) */

export const PRESENCA_PRECO = 3900;
export const PRESENCA_PRECO_LABEL = "R$ 3.900";
export const PRESENCA_VALOR_ANCORA_LABEL = "R$ 4.900";
export const PRESENCA_PRAZO_ENTREGA =
  "diagnóstico em até 7 dias e Sprint concluído em 30 dias";
export const PRESENCA_AGENCIA_PRAZO = "3 a 6 semanas";
export const PRESENCA_AGENCIA_FAIXA = "R$ 2.500 ou mais";

/** Variantes A/B do hero — LP /vender/presenca */

export type PresencaAbId = "2" | "3" | "7" | "8";

export type PresencaAbVariant = {
  id: PresencaAbId;
  title: string;
  subtitle: string;
};

export const PRESENCA_AB_SUBLINE =
  "Refazemos o caminho que um possível cliente percorre: busca, perfil, site e contato. Assim fica mais fácil descobrir onde ele desiste ou escolhe outra empresa.\n\n" +
  "Envie seu site ou Instagram. A primeira leitura não exige senha nem compromisso.";

export const PRESENCA_AB_FORM_FOOTER =
  "Primeiro mostramos o que está atrapalhando a decisão do cliente. Se houver algo relevante para corrigir, você recebe uma proposta com prazo, responsabilidade e forma de medir.\n\n" +
  "Se você só tem Instagram, começamos por ele. Não precisamos entrar na sua conta.";

export const PRESENCA_AB_VARIANTS: Record<PresencaAbId, PresencaAbVariant> = {
  "2": {
    id: "2",
    title: "Sua empresa é melhor do que parece na internet?",
    subtitle: PRESENCA_AB_SUBLINE,
  },
  "3": {
    id: "3",
    title: "Seu concorrente parece mais preparado do que você?",
    subtitle: PRESENCA_AB_SUBLINE,
  },
  "7": {
    id: "7",
    title: "Você pode estar perdendo a venda antes da conversa.",
    subtitle: PRESENCA_AB_SUBLINE,
  },
  "8": {
    id: "8",
    title: "O cliente procura. Sua empresa entra na comparação?",
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
