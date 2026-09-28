/** Amara cada movimento do plano a uma evidência concreta da presença. */

import type { ReputacaoLP } from "./apresentacao-reputacao";

export type MovimentoParaEvidencia = {
  titulo?: string;
  gap?: string;
  evidencia?: string;
  canal?: string;
  canais_cruzados?: string[];
  consequencia?: string;
};

export type CanalNota = {
  id?: string;
  label: string;
  nota: number | null;
};

const CANAL_ALIASES: Record<string, string[]> = {
  gmb: ["gmb", "google", "maps", "meu negocio", "local", "reviews", "reputacao", "avaliacao"],
  reviews: ["review", "nps", "reclame", "ra", "reputacao", "avaliacao"],
  site: ["site", "tech", "seo", "on-page", "https"],
  busca: ["busca", "serp", "autoridade", "knowledge", "google organico"],
  ia: ["ia", "llm", "chatgpt", "gemini", "visibilidade"],
  ads: ["ads", "meta", "anuncio", "midia paga"],
  instagram: ["instagram", "ig", "reel"],
  tiktok: ["tiktok", "tt"],
  youtube: ["youtube", "yt", "shorts"],
  blog: ["blog", "conteudo", "artigo"],
  percepcao: ["percepcao", "feed", "tom"],
};

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchCanalId(canal: string | undefined | null): string | null {
  if (!canal) return null;
  const n = norm(canal);
  for (const [id, aliases] of Object.entries(CANAL_ALIASES)) {
    if (aliases.some((a) => n.includes(a)) || n === id) return id;
  }
  return null;
}

function evidenciaReputacao(rep: ReputacaoLP | null | undefined): string | null {
  if (!rep) return null;
  if (rep.analise_mensagens?.alerta) {
    return `Alerta de reputação: ${rep.analise_mensagens.alerta.slice(0, 160)}`;
  }
  if (rep.analise_mensagens?.dores?.[0]) {
    return `Voz do cliente (dor): “${rep.analise_mensagens.dores[0].slice(0, 120)}”`;
  }
  if (rep.nps?.nps != null) {
    const det = rep.nps.pct_detratores != null ? ` · ${rep.nps.pct_detratores}% detratores` : "";
    return `NPS ${rep.nps.nps > 0 ? "+" : ""}${rep.nps.nps}${rep.nps.faixa ? ` (${rep.nps.faixa})` : ""}${det}`;
  }
  if (rep.reclame_aqui?.encontrado) {
    const m = rep.reclame_aqui.metricas;
    const bits = [
      m.nota != null ? `nota RA ${m.nota}` : null,
      m.taxa_resolucao != null ? `resolução ${m.taxa_resolucao}%` : null,
    ].filter(Boolean);
    if (bits.length) return bits.join(" · ");
    if (rep.reclame_aqui.reclamacoes[0]?.titulo) {
      return `Reclame Aqui: ${rep.reclame_aqui.reclamacoes[0].titulo.slice(0, 100)}`;
    }
  }
  if (rep.perfil?.avaliacao != null) {
    return `Google ${rep.perfil.avaliacao}★` +
      (rep.perfil.total_avaliacoes != null ? ` · ${rep.perfil.total_avaliacoes} avaliações` : "");
  }
  if (rep.multiplos || (rep.total_perfis ?? 0) > 1) {
    return `${rep.total_perfis || rep.perfis.length} listagens GMB na busca` +
      (rep.suspeitos_count ? ` · ${rep.suspeitos_count} suspeito(s)` : "");
  }
  return null;
}

function evidenciaCanal(
  canalRaw: string | undefined,
  canais: CanalNota[],
): string | null {
  const id = matchCanalId(canalRaw);
  if (!id) return null;
  const c = canais.find((x) => x.id === id || norm(x.label).includes(id));
  if (!c) {
    // tenta por label solta
    const byLabel = canais.find((x) => norm(x.label).includes(norm(canalRaw || "")));
    if (byLabel?.nota != null) return `${byLabel.label}: nota ${Math.round(byLabel.nota)}`;
    return null;
  }
  if (c.nota != null) return `${c.label}: nota ${Math.round(c.nota)}`;
  return `${c.label}: auditado`;
}

/**
 * Usa evidencia do LLM se existir e for útil; senão sintetiza a partir
 * de reputação / scorecard / canal do movimento.
 */
export function evidenciaDoMovimento(
  m: MovimentoParaEvidencia,
  opts: {
    reputacao?: ReputacaoLP | null;
    canaisScore?: CanalNota[];
  },
): string | null {
  const ja = (m.evidencia || "").trim();
  // Evita evidência genérica inútil do fallback do CM
  const generica = /^canal\s/i.test(ja) && ja.length < 40;
  if (ja && !generica) return ja;

  const canalId = matchCanalId(m.canal) || matchCanalId(m.titulo) || matchCanalId(m.gap);
  const blob = norm(`${m.titulo || ""} ${m.gap || ""} ${m.canal || ""}`);

  const querRep =
    canalId === "gmb"
    || canalId === "reviews"
    || /nps|reclame|review|reput|avaliac|gmb|maps|local/.test(blob);

  if (querRep) {
    const e = evidenciaReputacao(opts.reputacao);
    if (e) return e;
  }

  const fromCanal = evidenciaCanal(m.canal, opts.canaisScore || []);
  if (fromCanal) return fromCanal;

  // cruza canais_cruzados
  for (const c of m.canais_cruzados || []) {
    const e = evidenciaCanal(c, opts.canaisScore || []);
    if (e) return e;
  }

  // última tentativa: reputação se o gap fala de confiança
  if (/confian|prova|cliente|lead|convers/.test(blob)) {
    const e = evidenciaReputacao(opts.reputacao);
    if (e) return e;
  }

  if (ja) return ja;
  return null;
}
