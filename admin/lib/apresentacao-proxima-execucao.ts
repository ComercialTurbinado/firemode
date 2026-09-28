/** Próxima execução: 1 canal dominante + até 3 peças (trilha / sugeridas). */

import { normalizeCanalId } from "./apresentacao-presenca";

export type PecaTrilhaLite = {
  id?: string;
  tipo?: string | null;
  status?: string | null;
  titulo?: string | null;
  plataforma?: string | null;
  angulo?: string | null;
  cunho?: string | null;
  etapa_funil?: string | null;
};

export type ProximaPecaLP = {
  titulo: string;
  tipo: string;
  angulo?: string | null;
  status?: string | null;
  origem: "gerada" | "sugerida";
  plataforma?: string | null;
};

export type ProximaExecucaoLP = {
  canal: { id: string; label: string; nota: number | null };
  porque: string;
  movimento: { titulo: string | null; acao: string | null } | null;
  pecas: ProximaPecaLP[];
  ritmoSugerido: string | null;
};

const LABEL: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  blog: "Blog",
  ads: "Ads",
  gmb: "Google Meu Negócio",
  site: "Site",
  busca: "Busca",
  ia: "IA / LLM",
};

/** Canais onde a execução de conteúdo faz sentido na venda. */
const CANAIS_CONTEUDO = new Set(["instagram", "tiktok", "youtube", "blog", "ads"]);

const TIPO_POR_CANAL: Record<string, string> = {
  instagram: "video",
  tiktok: "video",
  youtube: "video",
  blog: "artigo",
  ads: "ad",
  gmb: "post",
  site: "artigo",
};

const RITMO_DEFAULT: Record<string, string> = {
  instagram: "4 Reels / semana no canal dominante",
  tiktok: "5 vídeos / semana no canal dominante",
  youtube: "2 vídeos ou Shorts / semana",
  blog: "2 artigos / mês + reaproveitamento em rede",
  ads: "1 criativo novo / semana + teste de ângulo",
};

function labelCanal(id: string) {
  return LABEL[id] || id;
}

function tipoPecaParaCanal(canalId: string) {
  return TIPO_POR_CANAL[canalId] || "post";
}

function plataformaMatch(canalId: string, plataforma?: string | null, tipo?: string | null): boolean {
  const p = (plataforma || "").toLowerCase();
  const t = (tipo || "").toLowerCase();
  if (canalId === "instagram") return /insta|ig|reel|feed/.test(p) || t === "post" || t === "video";
  if (canalId === "tiktok") return /tiktok|tt/.test(p) || t === "video";
  if (canalId === "youtube") return /youtube|yt|short/.test(p) || t === "video";
  if (canalId === "blog") return t === "artigo" || /blog|seo/.test(p);
  if (canalId === "ads") return t === "ad" || /ads|meta|facebook/.test(p);
  return true;
}

function uniqTitulos(pecas: ProximaPecaLP[], max = 3): ProximaPecaLP[] {
  const seen = new Set<string>();
  const out: ProximaPecaLP[] = [];
  for (const p of pecas) {
    const k = p.titulo.trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(p);
    if (out.length >= max) break;
  }
  return out;
}

type MovimentoLite = {
  ordem?: number;
  titulo?: string;
  acao_principal?: string;
  canal?: string;
  canais_cruzados?: string[];
  playbook?: string[];
};

type CanalScoreLite = { id?: string; label?: string; nota: number | null; status?: string };
type CanalInsightLite = {
  id: string;
  label: string;
  nota: number | null;
  prioridade?: string | null;
  oQueFazer?: { titulo: string; como?: string }[];
};

function escolherCanalDominante(opts: {
  movimentos?: MovimentoLite[] | null;
  canaisScore?: CanalScoreLite[] | null;
  canaisInsights?: CanalInsightLite[] | null;
}): { id: string; label: string; nota: number | null; porque: string; movimento: MovimentoLite | null } {
  const movs = [...(opts.movimentos || [])].sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99));
  const scores = opts.canaisScore || [];
  const insights = opts.canaisInsights || [];

  const notaDe = (id: string) =>
    scores.find((c) => c.id === id)?.nota
    ?? insights.find((c) => c.id === id)?.nota
    ?? null;

  for (const m of movs) {
    const main = normalizeCanalId(m.canal);
    const cruzados = (m.canais_cruzados || [])
      .map((x) => normalizeCanalId(x))
      .filter((x): x is string => Boolean(x));
    const candidatos = [main, ...cruzados].filter((x): x is string => Boolean(x));
    const conteudo = candidatos.find((id) => CANAIS_CONTEUDO.has(id));
    if (conteudo) {
      return {
        id: conteudo,
        label: labelCanal(conteudo),
        nota: notaDe(conteudo),
        porque: m.titulo
          ? `Movimento #1 do plano aponta ${labelCanal(conteudo)}: ${m.titulo}`
          : `Prioridade do plano de impacto: ${labelCanal(conteudo)}`,
        movimento: m,
      };
    }
    // Movimento em canal “infra” (site/busca/gmb): ainda assim escolhe rede com pior nota para executar conteúdo
    if (main && !CANAIS_CONTEUDO.has(main)) {
      break;
    }
  }

  const conteudoScores = scores
    .filter((c) => c.id && CANAIS_CONTEUDO.has(c.id) && c.nota != null)
    .sort((a, b) => (a.nota as number) - (b.nota as number));
  if (conteudoScores[0]?.id) {
    const id = conteudoScores[0].id!;
    return {
      id,
      label: labelCanal(id),
      nota: conteudoScores[0].nota,
      porque: `Menor nota entre canais de conteúdo (${conteudoScores[0].nota}) — maior retorno de arrumar primeiro.`,
      movimento: movs[0] ?? null,
    };
  }

  const prio = insights.find(
    (c) => CANAIS_CONTEUDO.has(c.id) && c.prioridade === "alta",
  );
  if (prio) {
    return {
      id: prio.id,
      label: prio.label || labelCanal(prio.id),
      nota: prio.nota,
      porque: `${prio.label} marcado como prioridade alta no diagnóstico.`,
      movimento: movs[0] ?? null,
    };
  }

  // Fallback comercial: Instagram
  return {
    id: "instagram",
    label: "Instagram",
    nota: notaDe("instagram"),
    porque: "Padrão Operar: um canal dominante — Instagram Reels, até o kickoff definir outro.",
    movimento: movs[0] ?? null,
  };
}

function sugerirPecas(opts: {
  canalId: string;
  movimento: MovimentoLite | null;
  percepcao?: {
    o_que_reforcar?: string[];
    o_que_corrigir?: string[];
    pitch_agencia?: string | null;
  } | null;
  canalInsight?: CanalInsightLite | null;
  pecasExistentes?: PecaTrilhaLite[] | null;
}): ProximaPecaLP[] {
  const tipo = tipoPecaParaCanal(opts.canalId);
  const out: ProximaPecaLP[] = [];

  const geradas = (opts.pecasExistentes || [])
    .filter((p) => plataformaMatch(opts.canalId, p.plataforma, p.tipo))
    .filter((p) => p.titulo?.trim());

  // Prefere peças ainda não publicadas / em rascunho
  const ordenadas = [...geradas].sort((a, b) => {
    const rank = (s?: string | null) => {
      const x = (s || "").toLowerCase();
      if (x.includes("rascunho") || x.includes("draft") || x.includes("gerad")) return 0;
      if (x.includes("aprov")) return 1;
      if (x.includes("publi")) return 3;
      return 2;
    };
    return rank(a.status) - rank(b.status);
  });

  for (const p of ordenadas) {
    out.push({
      titulo: p.titulo!.trim(),
      tipo: p.tipo || tipo,
      angulo: p.angulo || p.cunho || null,
      status: p.status || null,
      origem: "gerada",
      plataforma: p.plataforma || opts.canalId,
    });
  }

  const sugeridas: ProximaPecaLP[] = [];

  if (opts.movimento?.acao_principal?.trim()) {
    sugeridas.push({
      titulo: opts.movimento.acao_principal.trim(),
      tipo,
      angulo: opts.movimento.titulo || null,
      origem: "sugerida",
      plataforma: opts.canalId,
    });
  }

  for (const step of opts.movimento?.playbook || []) {
    if (!step?.trim()) continue;
    sugeridas.push({
      titulo: step.trim(),
      tipo,
      angulo: "playbook do movimento",
      origem: "sugerida",
      plataforma: opts.canalId,
    });
  }

  for (const t of opts.percepcao?.o_que_corrigir || []) {
    if (!t?.trim()) continue;
    sugeridas.push({
      titulo: `Corrigir na peça: ${t.trim()}`,
      tipo,
      angulo: "percepção · corrigir",
      origem: "sugerida",
      plataforma: opts.canalId,
    });
  }

  for (const t of opts.percepcao?.o_que_reforcar || []) {
    if (!t?.trim()) continue;
    sugeridas.push({
      titulo: `Reforçar: ${t.trim()}`,
      tipo,
      angulo: "percepção · reforçar",
      origem: "sugerida",
      plataforma: opts.canalId,
    });
  }

  for (const a of opts.canalInsight?.oQueFazer || []) {
    if (!a.titulo?.trim()) continue;
    sugeridas.push({
      titulo: a.titulo.trim(),
      tipo,
      angulo: a.como || "diagnóstico do canal",
      origem: "sugerida",
      plataforma: opts.canalId,
    });
  }

  // Se não há peças geradas, completa com sugeridas; se há, completa até 3
  return uniqTitulos([...out, ...sugeridas], 3);
}

export function extrairProximaExecucao(opts: {
  movimentos?: MovimentoLite[] | null;
  canaisScore?: CanalScoreLite[] | null;
  canaisInsights?: CanalInsightLite[] | null;
  percepcao?: {
    o_que_reforcar?: string[];
    o_que_corrigir?: string[];
    pitch_agencia?: string | null;
  } | null;
  pecas?: PecaTrilhaLite[] | null;
  frequenciaRede?: { ritmo?: string | null; volume?: string | null } | null;
  frequenciaRedes?: { id: string; ritmo?: string | null; volume?: string | null; fazendo?: string | null }[] | null;
}): ProximaExecucaoLP | null {
  const temSinal =
    (opts.movimentos?.length ?? 0) > 0
    || (opts.pecas?.length ?? 0) > 0
    || (opts.percepcao?.o_que_corrigir?.length ?? 0) > 0
    || (opts.percepcao?.o_que_reforcar?.length ?? 0) > 0
    || (opts.canaisInsights?.some((c) => (c.oQueFazer?.length ?? 0) > 0) ?? false);

  if (!temSinal) return null;

  const escolhido = escolherCanalDominante({
    movimentos: opts.movimentos,
    canaisScore: opts.canaisScore,
    canaisInsights: opts.canaisInsights,
  });

  const insight = (opts.canaisInsights || []).find((c) => c.id === escolhido.id) ?? null;
  const pecas = sugerirPecas({
    canalId: escolhido.id,
    movimento: escolhido.movimento,
    percepcao: opts.percepcao,
    canalInsight: insight,
    pecasExistentes: opts.pecas,
  });

  if (!pecas.length && !escolhido.movimento) return null;

  const ritmoFreq =
    opts.frequenciaRede?.ritmo
    || opts.frequenciaRede?.volume
    || (() => {
      const r = (opts.frequenciaRedes || []).find((x) => x.id === escolhido.id);
      return r?.fazendo || r?.ritmo || r?.volume || null;
    })();
  const ritmoSugerido = ritmoFreq
    ? `Hoje: ${ritmoFreq} — meta Operar: ${RITMO_DEFAULT[escolhido.id] || "ritmo semanal fixo"}`
    : RITMO_DEFAULT[escolhido.id] || null;

  return {
    canal: {
      id: escolhido.id,
      label: escolhido.label,
      nota: escolhido.nota,
    },
    porque: escolhido.porque,
    movimento: escolhido.movimento
      ? {
          titulo: escolhido.movimento.titulo ?? null,
          acao: escolhido.movimento.acao_principal ?? null,
        }
      : null,
    pecas,
    ritmoSugerido,
  };
}
