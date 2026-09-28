/** Extrai bloco de reputação (GMB + NPS + Reclame Aqui + voz do cliente) para a LP. */

import type { GmbData } from "@/app/fireadmin/(app)/conteudo/[id]/GmbPanel";

export type ReputacaoLP = {
  nota_gmb: number | null;
  faixa_gmb: string | null;
  resumo: string | null;
  perfil: {
    nome: string | null;
    endereco: string | null;
    telefone: string | null;
    website: string | null;
    avaliacao: number | null;
    total_avaliacoes: number | null;
    categoria: string | null;
  } | null;
  multiplos: boolean;
  alerta_multiplos: string | null;
  suspeitos_count: number;
  filiais_count: number;
  total_perfis: number;
  perfis: {
    nome: string | null;
    endereco: string | null;
    papel: string | null;
    avaliacao: number | null;
    total_avaliacoes: number | null;
    escolhido: boolean;
    website: string | null;
  }[];
  nps: {
    nps: number | null;
    faixa: string | null;
    amostra: number | null;
    pct_promotores: number | null;
    pct_neutros: number | null;
    pct_detratores: number | null;
    temas: { tema: string; mencoes: number; polaridade: string }[];
    sintese_voz: string | null;
  } | null;
  avaliacoes: {
    autor: string | null;
    nota: number | null;
    texto: string | null;
    data: string | null;
  }[];
  analise_mensagens: {
    sintese: string | null;
    dores: string[];
    elogios: string[];
    citacoes: { texto: string; fonte: string | null; polaridade: string | null }[];
    prioridade: string | null;
    alerta: string | null;
  } | null;
  reclame_aqui: {
    encontrado: boolean;
    url: string | null;
    titulo: string | null;
    snippet: string | null;
    texto_pagina: string | null;
    metricas: {
      nota: number | null;
      taxa_resposta: number | null;
      taxa_resolucao: number | null;
      voltaria: number | null;
      selo: string | null;
      total_reclamacoes: number | null;
    };
    reclamacoes: {
      titulo: string | null;
      texto: string | null;
      status: string | null;
      url: string | null;
    }[];
  } | null;
};

function autorTxt(autor: unknown): string | null {
  if (typeof autor === "string" && autor.trim()) return autor.trim();
  if (autor && typeof autor === "object" && "name" in autor) {
    const n = (autor as { name?: unknown }).name;
    if (typeof n === "string" && n.trim()) return n.trim();
  }
  return null;
}

/** Monta payload enxuto para a apresentação (sem texto completo do RA / IDs internos). */
export function extrairReputacao(gmb: GmbData | null | undefined): ReputacaoLP | null {
  if (!gmb) return null;
  const temSinal =
    gmb.encontrado
    || gmb.nps?.nps != null
    || gmb.reclame_aqui
    || gmb.analise_mensagens?.ok
    || (gmb.avaliacoes?.length ?? 0) > 0
    || (gmb.perfis_encontrados?.length ?? 0) > 0;
  if (!temSinal) return null;

  const perfisSrc = gmb.perfis_encontrados?.length
    ? gmb.perfis_encontrados
    : gmb.candidatos ?? [];

  const msgs = gmb.analise_mensagens?.ok ? gmb.analise_mensagens : null;
  const ra = gmb.reclame_aqui ?? null;
  const nps = gmb.nps?.nps != null ? gmb.nps : null;

  return {
    nota_gmb: gmb.nota_interna?.nota ?? null,
    faixa_gmb: gmb.nota_interna?.faixa ?? null,
    resumo: typeof gmb.resumo === "string" ? gmb.resumo : null,
    perfil: gmb.perfil
      ? {
          nome: gmb.perfil.nome ?? null,
          endereco: gmb.perfil.endereco ?? null,
          telefone: gmb.perfil.telefone ?? null,
          website: gmb.perfil.website ?? null,
          avaliacao: gmb.perfil.avaliacao ?? null,
          total_avaliacoes: gmb.perfil.total_avaliacoes ?? null,
          categoria: gmb.perfil.categoria ?? null,
        }
      : null,
    multiplos: Boolean(gmb.multiplos),
    alerta_multiplos: gmb.alerta_multiplos ?? null,
    suspeitos_count: gmb.suspeitos_count ?? 0,
    filiais_count: gmb.filiais_count ?? 0,
    total_perfis: gmb.total_perfis ?? perfisSrc.length,
    perfis: perfisSrc.slice(0, 12).map((p) => ({
      nome: p.nome ?? null,
      endereco: p.endereco ?? null,
      papel: p.papel ?? null,
      avaliacao: p.avaliacao ?? null,
      total_avaliacoes: p.total_avaliacoes ?? null,
      escolhido: Boolean(
        p.escolhido
        || (gmb.place_id_fixado
          && (p.place_id === gmb.place_id_fixado || p.cid === gmb.place_id_fixado)),
      ),
      website: p.website ?? null,
    })),
    nps: nps
      ? {
          nps: nps.nps ?? null,
          faixa: nps.faixa ?? null,
          amostra: nps.amostra ?? null,
          pct_promotores: nps.pct_promotores ?? null,
          pct_neutros: nps.pct_neutros ?? null,
          pct_detratores: nps.pct_detratores ?? null,
          temas: (nps.temas ?? []).slice(0, 6).map((t) => ({
            tema: t.tema,
            mencoes: t.mencoes,
            polaridade: t.polaridade,
          })),
          sintese_voz: nps.sintese_voz ?? null,
        }
      : null,
    avaliacoes: (gmb.avaliacoes ?? []).slice(0, 6).map((a) => ({
      autor: autorTxt(a.autor),
      nota: a.nota ?? null,
      texto: typeof a.texto === "string" ? a.texto.slice(0, 320) : null,
      data: typeof a.data === "string" ? a.data : null,
    })),
    analise_mensagens: msgs
      ? {
          sintese: msgs.sintese ?? null,
          dores: (msgs.dores_recorrentes ?? []).slice(0, 5),
          elogios: (msgs.elogios_recorrentes ?? []).slice(0, 5),
          citacoes: (msgs.citacoes ?? []).slice(0, 5).map((c) => ({
            texto: (c.texto || "").slice(0, 280),
            fonte: c.fonte ?? null,
            polaridade: c.polaridade ?? null,
          })).filter((c) => c.texto),
          prioridade: msgs.prioridade_acao ?? null,
          alerta: msgs.alerta_reputacao ?? null,
        }
      : null,
    reclame_aqui: ra
      ? {
          encontrado: Boolean(ra.encontrado),
          url: ra.url ?? null,
          titulo: ra.titulo_serp ?? null,
          // SERP snippet é curto e vem com "..." — preferir texto lido da página
          snippet: ra.snippet_serp ?? null,
          texto_pagina: (
            ra.texto_resumo
            || (typeof ra.texto_completo === "string" ? ra.texto_completo.slice(0, 6000) : null)
            || null
          ),
          metricas: {
            nota: ra.metricas?.nota ?? null,
            taxa_resposta: ra.metricas?.taxa_resposta ?? null,
            taxa_resolucao: ra.metricas?.taxa_resolucao ?? null,
            voltaria: ra.metricas?.voltaria_fazer_negocio ?? null,
            selo: ra.metricas?.selo_ou_status ?? null,
            total_reclamacoes: ra.metricas?.total_reclamacoes ?? null,
          },
          reclamacoes: (ra.reclamacoes ?? []).slice(0, 6).map((r) => ({
            titulo: r.titulo ?? null,
            texto: (r.texto_completo || r.texto || "") || null,
            status: r.status ?? null,
            url: r.url ?? null,
          })),
        }
      : null,
  };
}
