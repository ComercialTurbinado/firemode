/** Diff de scorecard entre duas fotos (melhorou / piorou / mudou). */

export type ScorecardCanalDelta = {
  id: string;
  antes?: number;
  depois?: number;
  delta?: number;
};

export type ScorecardDelta = {
  em?: string;
  geral_antes?: number | null;
  geral_depois?: number | null;
  geral_delta?: number | null;
  melhorou?: ScorecardCanalDelta[];
  piorou?: ScorecardCanalDelta[];
  igual?: ScorecardCanalDelta[];
  novo?: ScorecardCanalDelta[];
  sumiu?: ScorecardCanalDelta[];
  resumo?: {
    melhorou?: number;
    piorou?: number;
    igual?: number;
    novo?: number;
    sumiu?: number;
  };
};

export type ScorecardSnapshot = {
  em?: string;
  geral?: number | null;
  canais?: Record<string, number>;
  delta?: ScorecardDelta;
};

const LABEL: Record<string, string> = {
  site: "Site",
  busca: "Busca",
  gmb: "GMB",
  ads: "Ads",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  reviews: "Reviews",
  ia: "IA / LLM",
};

export function labelCanalScore(id: string) {
  return LABEL[id] || id;
}

/** Canais de presença sem auditoria útil — dispara refresh automático. */
export function canaisPresencaFaltando(presenca: Record<string, unknown> | null | undefined): string[] {
  const p = presenca ?? {};
  const faltam: string[] = [];

  const checks: [string, unknown][] = [
    ["tech_seo", p.tech_seo],
    ["google_meu_negocio", p.google_meu_negocio],
    ["autoridade_busca", p.autoridade_busca],
    ["meta_ads", p.meta_ads],
    ["youtube", p.youtube],
    ["instagram", p.instagram],
    ["tiktok", p.tiktok],
    ["ai_visibility", p.ai_visibility],
    ["posicionamento", p.posicionamento],
    ["audiencia_ideal", p.audiencia_ideal],
    ["percepcao_valor", p.percepcao_valor],
    ["plano_impacto", p.plano_impacto],
  ];

  for (const [key, bloco] of checks) {
    if (!bloco || typeof bloco !== "object") {
      faltam.push(key);
      continue;
    }
    const b = bloco as Record<string, unknown>;
    if (b.erro) {
      faltam.push(key);
      continue;
    }
    if (
      key === "posicionamento"
      || key === "audiencia_ideal"
      || key === "percepcao_valor"
      || key === "plano_impacto"
    ) {
      if (!b.atualizado_em && !b.gerado_em) faltam.push(key);
      continue;
    }
    const ni = b.nota_interna as { nota?: number } | undefined;
    if (ni?.nota == null && !b.atualizado_em) faltam.push(key);
  }

  const blog = p.blog as { tem_blog?: boolean; qualidade?: Record<string, unknown> } | undefined;
  if (blog?.tem_blog) {
    const q = blog.qualidade;
    if (!q || (!q.atualizado_em && !q.prompt_escrita)) faltam.push("blog.qualidade");
  }

  return faltam;
}
