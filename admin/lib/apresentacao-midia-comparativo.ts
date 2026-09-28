/** Extrai bloco midia_comparativo (cliente × rivais) para a LP. */

export type PecaAnalisadaLP = {
  id: string;
  code?: string | null;
  url?: string | null;
  thumbnail?: string | null;
  tipo?: string | null;
  papel: "cliente" | "concorrente" | string;
  autor_handle?: string | null;
  autor_nome?: string | null;
  rede?: string | null;
  caption?: string | null;
  likes?: number | null;
  plays?: number | null;
  intencao?: string | null;
  transcricao?: string | null;
  resumo?: string | null;
  analise?: {
    resumo?: string | null;
    acertou?: string[];
    errou?: string[];
    gancho?: { nota?: number; leitura?: string } | null;
    cta?: string | null;
  } | null;
};

export type RivalMidiaLP = {
  handle?: string | null;
  nome?: string | null;
  engajamento?: number | null;
  pecas: PecaAnalisadaLP[];
};

export type RedeMidiaComparativoLP = {
  id: string;
  label: string;
  cliente: PecaAnalisadaLP[];
  rivais: RivalMidiaLP[];
  resumo: {
    leitura?: string | null;
    cliente_faz?: string[];
    rival_vence?: string[];
    gaps?: string[];
    proxima_peca?: string | null;
  } | null;
  amostra?: {
    cliente?: number;
    rivais?: number;
    com_transcricao?: number;
    com_analise?: number;
  } | null;
};

export type MidiaComparativoLP = {
  atualizado_em?: string | null;
  redes: RedeMidiaComparativoLP[];
};

const LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};

function pecaLite(p: Record<string, unknown>): PecaAnalisadaLP | null {
  const id = String(p.id || p.code || "");
  if (!id && !p.resumo && !p.analise_estrutura) return null;
  const ae = (p.analise_estrutura && typeof p.analise_estrutura === "object")
    ? (p.analise_estrutura as Record<string, unknown>)
    : null;
  return {
    id: id || String(p.url || Math.random()),
    code: (p.code as string) || null,
    url: (p.url as string) || null,
    thumbnail: (p.thumbnail as string) || null,
    tipo: (p.tipo as string) || null,
    papel: (p.papel as string) || "cliente",
    autor_handle: (p.autor_handle as string) || null,
    autor_nome: (p.autor_nome as string) || null,
    rede: (p.rede as string) || null,
    caption: (p.caption as string) || null,
    likes: typeof p.likes === "number" ? p.likes : null,
    plays: typeof p.plays === "number" ? p.plays : null,
    intencao: (p.intencao as string) || null,
    transcricao: (p.transcricao as string) || null,
    resumo: (p.resumo as string) || (ae?.resumo as string) || null,
    analise: ae
      ? {
          resumo: (ae.resumo as string) || null,
          acertou: Array.isArray(ae.acertou) ? (ae.acertou as string[]).slice(0, 3) : [],
          errou: Array.isArray(ae.errou) ? (ae.errou as string[]).slice(0, 3) : [],
          gancho: (ae.gancho && typeof ae.gancho === "object")
            ? {
                nota: typeof (ae.gancho as { nota?: number }).nota === "number"
                  ? (ae.gancho as { nota: number }).nota
                  : undefined,
                leitura: (ae.gancho as { leitura?: string }).leitura || undefined,
              }
            : null,
          cta: (ae.cta as string) || null,
        }
      : null,
  };
}

export function extrairMidiaComparativo(
  bloco: Record<string, unknown> | null | undefined,
): MidiaComparativoLP | null {
  if (!bloco || typeof bloco !== "object") return null;
  const redesRaw = (bloco.redes && typeof bloco.redes === "object")
    ? (bloco.redes as Record<string, unknown>)
    : {};

  const redes: RedeMidiaComparativoLP[] = [];
  for (const [id, raw] of Object.entries(redesRaw)) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const cliente = (Array.isArray(r.cliente) ? r.cliente : [])
      .map((p) => (p && typeof p === "object" ? pecaLite(p as Record<string, unknown>) : null))
      .filter(Boolean) as PecaAnalisadaLP[];
    const rivais: RivalMidiaLP[] = (Array.isArray(r.rivais) ? r.rivais : [])
      .map((rv) => {
        if (!rv || typeof rv !== "object") return null;
        const x = rv as Record<string, unknown>;
        const pecas = (Array.isArray(x.pecas) ? x.pecas : [])
          .map((p) => (p && typeof p === "object" ? pecaLite(p as Record<string, unknown>) : null))
          .filter(Boolean) as PecaAnalisadaLP[];
        if (!pecas.length && !x.handle) return null;
        return {
          handle: (x.handle as string) || null,
          nome: (x.nome as string) || null,
          engajamento: typeof x.engajamento === "number" ? x.engajamento : null,
          pecas,
        };
      })
      .filter(Boolean) as RivalMidiaLP[];

    if (!cliente.length && !rivais.length) continue;

    const resumoRaw = (r.resumo && typeof r.resumo === "object")
      ? (r.resumo as Record<string, unknown>)
      : null;

    redes.push({
      id,
      label: LABELS[id] || id,
      cliente,
      rivais,
      resumo: resumoRaw
        ? {
            leitura: (resumoRaw.leitura as string) || null,
            cliente_faz: Array.isArray(resumoRaw.cliente_faz)
              ? (resumoRaw.cliente_faz as string[]).slice(0, 4)
              : [],
            rival_vence: Array.isArray(resumoRaw.rival_vence)
              ? (resumoRaw.rival_vence as string[]).slice(0, 4)
              : [],
            gaps: Array.isArray(resumoRaw.gaps) ? (resumoRaw.gaps as string[]).slice(0, 4) : [],
            proxima_peca: (resumoRaw.proxima_peca as string) || null,
          }
        : null,
      amostra: (r.amostra && typeof r.amostra === "object")
        ? (r.amostra as RedeMidiaComparativoLP["amostra"])
        : null,
    });
  }

  if (!redes.length) return null;
  return {
    atualizado_em: (bloco.atualizado_em as string) || null,
    redes,
  };
}
