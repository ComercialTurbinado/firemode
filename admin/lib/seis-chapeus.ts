/** Seis Chapéus do Pensamento (Edward de Bono) — relatório por canal.

Não são 6 chamadas de LLM: mapeamos o que já existe na auditoria
para cada modo de raciocínio, e o chapéu azul fecha o propósito do canal.
A síntese geral (azul do board) fica no Plano de Impacto.
*/

import type { AcaoCanal, Achado, CanalInsight } from "./apresentacao-presenca";

/** Ordem canônica da análise (chão objetivo → prova → demanda → redes → narrativa). */
export const ORDEM_ANALISE = [
  "site",
  "busca",
  "ia",
  "gmb",
  "blog",
  "ads",
  "instagram",
  "tiktok",
  "youtube",
  "percepcao",
  "radar",
] as const;

export type CanalAnaliseId = (typeof ORDEM_ANALISE)[number];

export type ChapeuBranco = {
  /** Fatos objetivos — nota, checklist ok, métricas */
  fatos: string[];
  nota: number | null;
  faixa?: string | null;
};

export type ChapeuVermelho = {
  /** Intuição / tom / percepção (só quando houver sinal) */
  intuicoes: string[];
};

export type ChapeuAmarelo = {
  /** Benefícios / acertos a reforçar */
  beneficios: string[];
};

export type ChapeuPreto = {
  /** Riscos / gaps reais do cliente */
  riscos: string[];
};

export type ChapeuVerde = {
  /** Alternativas / o que fazer */
  ideias: { titulo: string; como?: string; porque?: string }[];
};

export type ChapeuAzul = {
  /** Processo: pra que serve este canal na análise */
  proposito: string;
  pergunta: string;
  proximo_foco?: string;
};

export type RelatorioChapeus = {
  canal_id: string;
  canal_label: string;
  azul: ChapeuAzul;
  branco: ChapeuBranco;
  vermelho: ChapeuVermelho;
  amarelo: ChapeuAmarelo;
  preto: ChapeuPreto;
  verde: ChapeuVerde;
};

const PROPOSITO: Record<string, { proposito: string; pergunta: string }> = {
  site: {
    proposito: "Base técnica e persuasiva da presença — sem isso, o resto vazamento.",
    pergunta: "O site sustenta confiança, indexação e conversão?",
  },
  busca: {
    proposito: "Como o Google trata a marca pelo próprio nome (autoridade / Knowledge).",
    pergunta: "A marca é encontrada e reconhecida na SERP?",
  },
  ia: {
    proposito: "O que ChatGPT / Gemini / Perplexity tendem a responder — e se o site está pronto pra ser citado.",
    pergunta: "A marca aparece nas respostas de IA ou o concorrente leva a citação?",
  },
  gmb: {
    proposito: "Confiança local e prova social no Maps.",
    pergunta: "O perfil local está completo, ativo e com reviews saudáveis?",
  },
  blog: {
    proposito: "Autoridade de conteúdo e captura de intenção orgânica.",
    pergunta: "Há ritmo e qualidade editorial alinhados ao nicho?",
  },
  ads: {
    proposito: "Sinal de demanda paga e mensagem comercial em mídia.",
    pergunta: "Há anúncios reais, ativos e com ângulo coerente?",
  },
  instagram: {
    proposito: "Prova social e narrativa visual no feed/Reels.",
    pergunta: "Frequência, posicionamento e gap vs concorrentes SERP?",
  },
  tiktok: {
    proposito: "Alcance curto e ângulos de descoberta.",
    pergunta: "Conta ativa com ritmo e oportunidade vs mercado?",
  },
  youtube: {
    proposito: "Profundidade e educação (YMYL quando couber).",
    pergunta: "Canal existe, cresce e sustenta autoridade?",
  },
  percepcao: {
    proposito: "Chapéu vermelho ampliado — declarado × percebido.",
    pergunta: "O que o cliente sente vs o que a marca promete?",
  },
  radar: {
    proposito: "Relatório profundo de IG (Radar) cruzado com a operação.",
    pergunta: "Há insights de engajamento utilizáveis no calendário?",
  },
};

function labelAchado(a: Achado): string {
  return a.detalhe ? `${a.label} — ${a.detalhe}` : a.label;
}

/**
 * Monta o relatório dos 6 chapéus a partir do insight já auditado.
 * Determinístico — zero LLM extra por canal.
 */
export function montarChapeus(
  canal: CanalInsight,
  opts?: {
    percepcaoTom?: string | null;
    percepcaoGaps?: string[];
  },
): RelatorioChapeus {
  const meta = PROPOSITO[canal.id] || {
    proposito: `Auditoria de ${canal.label}.`,
    pergunta: `O que este canal revela sobre a presença?`,
  };

  const fatos: string[] = [];
  if (canal.nota != null) {
    fatos.push(`Nota interna ${canal.nota}${canal.faixa ? ` (${canal.faixa})` : ""}`);
  }
  if (canal.resumo) fatos.push(canal.resumo);
  if (canal.prioridade) fatos.push(`Prioridade: ${canal.prioridade}`);
  for (const a of canal.listaAcertos.slice(0, 8)) {
    fatos.push(`OK: ${a.label}${a.detalhe ? ` (${a.detalhe})` : ""}`);
  }
  const checklistFalhas = canal.listaErros.filter((e) => e.origem === "checklist");
  for (const e of checklistFalhas.slice(0, 6)) {
    fatos.push(`Checklist: ${e.label}${e.detalhe ? ` — ${e.detalhe}` : ""}`);
  }

  const intuicoes: string[] = [];
  if (canal.id === "percepcao") {
    for (const e of canal.listaErros) intuicoes.push(labelAchado(e));
    for (const a of canal.listaAcertos) intuicoes.push(labelAchado(a));
  } else if (opts?.percepcaoTom && ["instagram", "tiktok", "youtube", "ads", "site"].includes(canal.id)) {
    intuicoes.push(opts.percepcaoTom);
  }
  if (opts?.percepcaoGaps?.length && canal.id === "percepcao") {
    for (const g of opts.percepcaoGaps) intuicoes.push(g);
  }

  const beneficios = canal.listaAcertos.map((a) => labelAchado(a));
  const riscos = canal.listaErros
    .filter((e) => e.origem !== "pendente")
    .map((e) => labelAchado(e));

  const ideias = canal.oQueFazer.map((a: AcaoCanal) => ({
    titulo: a.titulo,
    como: a.como,
    porque: a.porque,
  }));

  const piorRisco = riscos[0];
  const proximo_foco = ideias[0]?.titulo
    || (piorRisco ? `Mitigar: ${piorRisco}` : undefined);

  return {
    canal_id: canal.id,
    canal_label: canal.label,
    azul: {
      proposito: meta.proposito,
      pergunta: meta.pergunta,
      proximo_foco,
    },
    branco: {
      fatos,
      nota: canal.nota,
      faixa: canal.faixa,
    },
    vermelho: { intuicoes },
    amarelo: { beneficios },
    preto: { riscos },
    verde: { ideias },
  };
}

export function enriquecerComChapeus(
  canais: CanalInsight[],
  opts?: {
    percepcaoTom?: string | null;
    percepcaoGaps?: string[];
  },
): (CanalInsight & { chapeus: RelatorioChapeus })[] {
  return canais.map((c) => ({
    ...c,
    chapeus: montarChapeus(c, opts),
  }));
}

export function ordenarPorFluxoAnalise<T extends { id: string }>(items: T[]): T[] {
  const rank = new Map<string, number>(ORDEM_ANALISE.map((id, i) => [id, i]));
  return [...items].sort((a, b) => {
    const ra = rank.get(a.id) ?? 1000;
    const rb = rank.get(b.id) ?? 1000;
    if (ra !== rb) return ra - rb;
    return a.id.localeCompare(b.id);
  });
}

/** Payload compacto para o Plano de Impacto (chapéu azul geral). */
export function snapshotChapeusParaImpacto(
  canais: (CanalInsight & { chapeus?: RelatorioChapeus })[],
): Record<string, unknown>[] {
  return ordenarPorFluxoAnalise(canais).map((c) => {
    const h = c.chapeus || montarChapeus(c);
    return {
      canal: h.canal_id,
      label: h.canal_label,
      nota: h.branco.nota,
      azul: h.azul,
      branco_resumo: h.branco.fatos.slice(0, 6),
      amarelo: h.amarelo.beneficios.slice(0, 5),
      preto: h.preto.riscos.slice(0, 5),
      verde: h.verde.ideias.slice(0, 5).map((i) => i.titulo),
      vermelho: h.vermelho.intuicoes.slice(0, 4),
    };
  });
}
