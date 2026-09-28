/** Monta narrativa + plano 7/15/30 do diagnóstico por canal (apresentação). */

import type { EspecialistaBloco } from "./especialista";

export type PrazoPlano = "7" | "15" | "30";

/** Shape mínimo usado na narrativa/plano (LP pode omitir `fonte`). */
export type AcaoCanalLite = {
  titulo: string;
  como?: string;
  porque?: string;
  esforco?: string;
  impacto?: string;
  prazo?: string;
  fonte?: string;
};

export type AcaoComPrazo = AcaoCanalLite & { prazoPlano: PrazoPlano };

export type Plano71530 = {
  d7: AcaoComPrazo[];
  d15: AcaoComPrazo[];
  d30: AcaoComPrazo[];
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^corrigir:\s*/i, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Similaridade frouxa: um contém o outro ou overlap alto de tokens. */
export function mesmoTema(a: string, b: string): boolean {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= 12 && nb.length >= 12 && (na.includes(nb) || nb.includes(na))) return true;
  const ta = new Set(na.split(" ").filter((t) => t.length > 3));
  const tb = new Set(nb.split(" ").filter((t) => t.length > 3));
  if (ta.size === 0 || tb.size === 0) return false;
  let hit = 0;
  for (const t of ta) if (tb.has(t)) hit += 1;
  const ratio = hit / Math.min(ta.size, tb.size);
  return ratio >= 0.7 && hit >= 2;
}

/** Remove gaps que só repetem o título/tema de uma ação. */
export function errosSemAcoes(
  erros: Array<{ label?: string; detalhe?: string }>,
  acoes: AcaoCanalLite[],
): Array<{ label?: string; detalhe?: string }> {
  return erros.filter((e) => {
    const label = e.label || "";
    return !acoes.some(
      (a) => mesmoTema(label, a.titulo) || (a.titulo && mesmoTema(label, a.titulo.replace(/^Corrigir:\s*/i, ""))),
    );
  });
}

function rankAcao(a: AcaoCanalLite): number {
  const imp = { alto: 0, medio: 1, médio: 1, baixo: 2 }[String(a.impacto || "").toLowerCase()] ?? 3;
  const esf = { baixo: 0, medio: 1, médio: 1, alto: 2 }[String(a.esforco || "").toLowerCase()] ?? 2;
  return imp * 10 + esf;
}

/** Classifica prazo: quick wins em 7d, médios em 15d, estruturais em 30d. */
export function classificarPrazo(a: AcaoCanalLite): PrazoPlano {
  if (a.prazo) {
    const p = a.prazo.toLowerCase();
    if (/\b7\b|semana|urgente|agora|imediato/.test(p)) return "7";
    if (/\b15\b|quinzen|2\s*sem/.test(p)) return "15";
    if (/\b30\b|m[eê]s/.test(p)) return "30";
  }
  const imp = String(a.impacto || "").toLowerCase();
  const esf = String(a.esforco || "").toLowerCase();
  if ((imp === "alto" || !imp) && (esf === "baixo" || esf === "")) return "7";
  if (imp === "alto" && esf === "medio") return "15";
  if (imp === "alto" && esf === "médio") return "15";
  if (imp === "medio" || imp === "médio") return esf === "alto" ? "30" : "15";
  if (esf === "alto") return "30";
  return "15";
}

export function montarPlano71530(
  acoes: AcaoCanalLite[],
  especialista?: EspecialistaBloco | null,
): Plano71530 {
  const doEsp = especialista?.plano_7_15_30;
  if (doEsp && (doEsp.d7?.length || doEsp.d15?.length || doEsp.d30?.length)) {
    const map = (
      arr: { titulo?: string | null; como?: string | null }[] | undefined,
      prazo: PrazoPlano,
    ): AcaoComPrazo[] =>
      (arr || [])
        .filter((x) => x?.titulo)
        .map((x) => ({
          titulo: x.titulo!,
          como: x.como ?? undefined,
          fonte: "plano" as const,
          prazo: prazo === "7" ? "7 dias" : prazo === "15" ? "15 dias" : "30 dias",
          prazoPlano: prazo,
        }));
    return {
      d7: map(doEsp.d7, "7"),
      d15: map(doEsp.d15, "15"),
      d30: map(doEsp.d30, "30"),
    };
  }

  const sorted = [...acoes].sort((a, b) => rankAcao(a) - rankAcao(b));
  const d7: AcaoComPrazo[] = [];
  const d15: AcaoComPrazo[] = [];
  const d30: AcaoComPrazo[] = [];
  const caps = { "7": 4, "15": 4, "30": 5 };

  for (const a of sorted) {
    let p = classificarPrazo(a);
    // balanceia se o balde encheu
    if (p === "7" && d7.length >= caps["7"]) p = "15";
    if (p === "15" && d15.length >= caps["15"]) p = "30";
    if (p === "30" && d30.length >= caps["30"]) continue;
    const item: AcaoComPrazo = {
      ...a,
      prazo: p === "7" ? "7 dias" : p === "15" ? "15 dias" : "30 dias",
      prazoPlano: p,
    };
    if (p === "7") d7.push(item);
    else if (p === "15") d15.push(item);
    else d30.push(item);
  }

  return { d7, d15, d30 };
}

type CanalDiagInput = {
  id?: string;
  label?: string;
  nota?: number | null;
  resumo?: string | null;
  /** Aceita Achado completo ou shape leve da LP (só label/detalhe). */
  listaErros?: Array<{ label?: string; detalhe?: string }>;
  oQueFazer?: AcaoCanalLite[];
  especialista?: EspecialistaBloco | null;
};

/** Narrativa natural do que trava — sem virar lista de tarefas. */
export function textoTravando(canal: CanalDiagInput): string | null {
  const esp = canal.especialista;
  if (esp?.travando?.trim()) return esp.travando.trim();

  const bits: string[] = [];
  if (esp?.resumo_especialista) bits.push(esp.resumo_especialista.trim());
  if (esp?.comportamento?.diagnostico) bits.push(esp.comportamento.diagnostico.trim());
  if (esp?.conteudo?.diagnostico) bits.push(esp.conteudo.diagnostico.trim());
  if (esp?.frequencia?.atual && esp.frequencia.atual !== "desconhecido") {
    bits.push(
      `No ritmo, hoje está em “${esp.frequencia.atual}”` +
        (esp.frequencia.ideal ? `; o ideal para este estágio seria ${esp.frequencia.ideal}.` : "."),
    );
  }

  const unicos = errosSemAcoes(canal.listaErros || [], canal.oQueFazer || []).slice(0, 3);
  if (unicos.length && bits.length < 2) {
    const frases = unicos.map((e) => {
      if (e.detalhe && e.detalhe.length > 20) return e.detalhe;
      return e.label;
    });
    bits.push(`O que mais trava agora: ${frases.join("; ")}.`);
  }

  if (bits.length) return bits.join(" ");

  if (canal.resumo) return canal.resumo;
  return null;
}

/** Melhor mundo realista depois das correções. */
export function textoVisaoPosAjuste(canal: CanalDiagInput): string | null {
  const esp = canal.especialista;
  if (esp?.visao_pos_ajuste?.trim()) return esp.visao_pos_ajuste.trim();

  if (canal.id === "ia") {
    const top = (canal.oQueFazer || []).slice(0, 2).map((a) => a.titulo.toLowerCase());
    if (top.length) {
      return (
        `Com ${top.join(" e ")}, a marca deixa de ser invisível nas respostas de ChatGPT/Gemini/Perplexity ` +
        `e passa a ser citada quando o cliente pergunta no nicho — o canal de descoberta que mais cresce fora do Google.`
      );
    }
    if (canal.nota != null && canal.nota < 70) {
      return (
        "Ajustando llms.txt, crawlers e prova pública, a IA para de recomendar só o concorrente " +
        "e passa a descrever a oferta com a mesma clareza do site — percepção e citação alinhadas."
      );
    }
  }

  const partes: string[] = [];
  if (esp?.comportamento?.recomendacao) {
    partes.push(`Com a jornada ajustada (${esp.comportamento.recomendacao}), a conversão deixa de depender de “sorte” no clique.`);
  }
  if (esp?.conteudo?.recomendacao) {
    partes.push(`A linha editorial (${esp.conteudo.recomendacao}) passa a reforçar a oferta certa, não só presença.`);
  }
  if (esp?.frequencia?.ideal) {
    partes.push(`Mantendo ${esp.frequencia.ideal}, o canal deixa de sumir entre um pico e outro.`);
  }

  const top = (canal.oQueFazer || []).slice(0, 2);
  if (!partes.length && top.length) {
    const nota = canal.nota != null ? `A nota de ${canal.nota}` : "O canal";
    partes.push(
      `${nota} sobe de forma realista quando ${top.map((a) => a.titulo.toLowerCase()).join(" e ")} estiver(em) feito(s) — sem milagre, com constância.`,
    );
  }

  if (partes.length) return partes.join(" ");
  if (canal.nota != null && canal.nota < 70) {
    return `Com as correções do plano, é realista tirar este canal da zona crítica e chegar a uma presença estável o bastante para gerar demanda e confiança — não perfeição de ranking da noite para o dia.`;
  }
  return null;
}

export function totalAcoesPlano(p: Plano71530): number {
  return p.d7.length + p.d15.length + p.d30.length;
}
