/** Agrega TODAS as auditorias de presença — acertos e gaps sem truncar. */

import type { EspecialistaBloco } from "./especialista";

export type Achado = {
  canal: string;
  canalLabel: string;
  ok: boolean;
  label: string;
  detalhe?: string;
  esforco?: string;
  impacto?: string;
  origem: "checklist" | "melhoria" | "gap" | "forte" | "percepcao" | "oportunidade" | "pendente";
};

/** Ação executável: “o que fazer no Site / Instagram / …” */
export type AcaoCanal = {
  titulo: string;
  como?: string;
  porque?: string;
  esforco?: string;
  impacto?: string;
  prazo?: string;
  fonte: "melhoria" | "checklist" | "plano" | "gap" | "percepcao" | "config" | "oportunidade";
};

export type CanalInsight = {
  id: string;
  label: string;
  nota: number | null;
  faixa?: string | null;
  resumo?: string | null;
  prioridade?: string | null;
  status: "auditado" | "pendente" | "parcial";
  listaAcertos: Achado[];
  listaErros: Achado[];
  /** Playbook do canal — o que fazer agora */
  oQueFazer: AcaoCanal[];
  extras?: string[];
  href?: string | null;
  /** Especialista do canal: comportamento · conteúdo · frequência */
  especialista?: EspecialistaBloco | null;
  /** PageSpeed Insights (só Site / Tech SEO) */
  pagespeed?: {
    ok?: boolean;
    erro?: string | null;
    performance_mobile?: number | null;
    performance_desktop?: number | null;
    mobile?: {
      scores?: {
        performance?: number | null;
        accessibility?: number | null;
        best_practices?: number | null;
        seo?: number | null;
      };
      metrics?: Record<string, { display?: string; score?: number | null } | undefined>;
      field_data?: { overall?: string } | null;
    };
  } | null;
  /** Seis Chapéus (preenchido na apresentação / impacto) */
  chapeus?: import("./seis-chapeus").RelatorioChapeus;
};

type ChecklistItem = {
  id?: string;
  ok?: boolean;
  label?: string;
  detalhe?: string;
  peso?: string;
};

type Melhoria = {
  titulo?: string;
  porque?: string;
  como?: string;
  esforco?: string;
  impacto?: string;
};

/** Bloco genérico + campos extras das redes */
export type BlocoCanal = {
  checklist?: ChecklistItem[];
  melhorias_rapidas?: Melhoria[];
  resumo?: string;
  prioridade?: string;
  nota_interna?: { nota?: number; faixa?: string } | null;
  score?: { ok?: number; total?: number } | null;
  erro?: string | null;
  gap_vs_concorrentes?: string | null;
  angulos_para_copiar?: string[];
  angulos_do_cliente?: string[];
  angulos_tendencia?: string[];
  configuracoes_sugeridas?: string[];
  encontrado?: boolean;
  especialista?: EspecialistaBloco | null;
  pagespeed?: CanalInsight["pagespeed"];
  /** Visibilidade em IA — prompts monitorados */
  prompts?: {
    id?: string;
    prompt?: string;
    share_of_answer?: number;
    engines?: { engine?: string; citado?: boolean; trecho?: string | null; concorrentes?: string[] }[];
  }[];
  /** Marcas citadas nas respostas de IA (agregado) */
  concorrentes_citados?: { nome?: string; aparicoes?: number; dominio?: string }[];
};

export type PresencaBlocos = {
  tech_seo?: BlocoCanal | null;
  ai_visibility?: BlocoCanal | null;
  google_meu_negocio?: BlocoCanal | null;
  autoridade_busca?: BlocoCanal | null;
  meta_ads?: BlocoCanal | null;
  instagram?: BlocoCanal | null;
  tiktok?: BlocoCanal | null;
  youtube?: BlocoCanal | null;
  blog?: {
    tem_blog?: boolean;
    posts_encontrados?: number;
    url?: string | null;
    cobertura?: string | null;
    qualidade?: {
      resumo?: string;
      seo?: {
        nota?: number;
        faixa?: string;
        o_que_funciona?: string[];
        o_que_falta?: string[];
        checklist_padrao?: { item: string; obrigatorio?: boolean }[];
      };
      tom?: { personalidade?: string };
      pontos_fortes?: string[];
      gaps_conteudo?: { gap?: string; impacto?: string; como_corrigir?: string }[];
      oportunidades_tema?: string[];
      especialista?: EspecialistaBloco | null;
    } | null;
  } | null;
  percepcao_valor?: {
    gaps?: { gap?: string; evidencia?: string; severidade?: string; risco_ou_oportunidade?: string }[];
    o_que_reforcar?: string[];
    o_que_corrigir?: string[];
    percepcao_real_marca?: string | null;
    proposta_valor_percebida?: string | null;
    produto_declarado?: string | null;
    produto_percebido?: string | null;
    tom_visual_e_verbal?: string | null;
    percepcao_em_ia?: string | null;
    ia_cita_marca?: string | null;
  } | null;
  radar_ig?: {
    handle?: string | null;
    seguidores?: number | null;
    taxa_engajamento?: number | null;
    qtd_posts?: number | null;
    status?: string | null;
  } | null;
};

const CANAIS: { id: string; label: string; key: keyof PresencaBlocos }[] = [
  // Ordem canônica: base → busca → IA → local → conteúdo → ads → redes → percepção → radar
  { id: "site", label: "Site / Tech SEO", key: "tech_seo" },
  { id: "busca", label: "Autoridade de busca", key: "autoridade_busca" },
  { id: "ia", label: "Visibilidade em IA", key: "ai_visibility" },
  { id: "gmb", label: "Google Meu Negócio", key: "google_meu_negocio" },
  { id: "blog", label: "Blog", key: "blog" },
  { id: "ads", label: "Meta Ads", key: "meta_ads" },
  { id: "instagram", label: "Instagram", key: "instagram" },
  { id: "tiktok", label: "TikTok", key: "tiktok" },
  { id: "youtube", label: "YouTube", key: "youtube" },
  { id: "percepcao", label: "Percepção de valor", key: "percepcao_valor" },
  { id: "radar", label: "Radar Instagram", key: "radar_ig" },
];

function notaDe(bloco?: BlocoCanal | null): number | null {
  if (!bloco) return null;
  if (bloco.nota_interna?.nota != null) return Math.round(Number(bloco.nota_interna.nota));
  if (bloco.score?.total) {
    return Math.round((100 * (bloco.score.ok ?? 0)) / bloco.score.total);
  }
  return null;
}

function rankImpacto(impacto?: string): number {
  const k = String(impacto || "").toLowerCase();
  if (k === "alto" || k === "critica" || k === "crítica") return 0;
  if (k === "medio" || k === "médio") return 1;
  if (k === "baixo") return 2;
  return 3;
}

function pushUnique(list: Achado[], item: Achado) {
  if (isFalhaNossaOuFaltando(item)) return;
  const key = `${item.ok}|${item.label.trim().toLowerCase()}|${item.origem}`;
  if (list.some((x) => `${x.ok}|${x.label.trim().toLowerCase()}|${x.origem}` === key)) return;
  list.push(item);
}

function pushAcao(list: AcaoCanal[], item: AcaoCanal) {
  const key = item.titulo.trim().toLowerCase();
  if (!key) return;
  if (isFalhaNossaOuFaltando({
    label: item.titulo,
    detalhe: [item.como, item.porque].filter(Boolean).join(" "),
    ok: false,
  })) return;
  if (list.some((x) => x.titulo.trim().toLowerCase() === key)) return;
  list.push(item);
}

/** Falha nossa (API/config) ou auditoria ainda não feita — não entra na análise do cliente. */
function isFalhaNossaOuFaltando(item: {
  id?: string;
  label?: string;
  detalhe?: string;
  ok?: boolean;
  origem?: string;
}): boolean {
  if (item.origem === "pendente") return true;
  if (item.ok) return false;
  const blob = `${item.id || ""} ${item.label || ""} ${item.detalhe || ""}`.toLowerCase();
  const patterns = [
    "configure",
    "rapidapi",
    "meta_adlib",
    "serper",
    "api_key",
    "api key",
    "fonte de ads configurada",
    "fonte configurada",
    "auditoria pendente",
    "ainda sem auditoria",
    "ainda sem análise",
    "ainda sem analise",
    "use auditar",
    "sem auditoria",
    "rodar auditoria",
    "rodar percepção",
    "rodar percepcao",
    "não vinculado",
    "nao vinculado",
    "faltando chave",
    "ausente — configure",
    "ausente - configure",
    "erro:",
    "http 4",
    "http 5",
    "falha ao",
    "não consegui acessar",
    "nao consegui acessar",
  ];
  if (patterns.some((p) => blob.includes(p))) return true;
  const idsNossos = new Set(["fonte", "api", "config", "token"]);
  if (item.id && idsNossos.has(item.id) && item.ok === false) return true;
  return false;
}

function checklistCliente(checklist: ChecklistItem[] | undefined): ChecklistItem[] {
  return (checklist || []).filter((c) => !isFalhaNossaOuFaltando({
    id: c.id,
    label: c.label,
    detalhe: c.detalhe,
    ok: c.ok,
  }));
}

function blocoSoErroNosso(bloco: BlocoCanal): boolean {
  const erro = (bloco.erro || "").toLowerCase();
  if (!erro) return false;
  const temChecklistUtil = checklistCliente(bloco.checklist).length > 0;
  const temNota = bloco.nota_interna?.nota != null;
  if (temChecklistUtil || temNota) return false;
  return isFalhaNossaOuFaltando({ label: erro, detalhe: erro, ok: false });
}

function extrairBlocoPadrao(
  meta: { id: string; label: string },
  bloco: BlocoCanal,
): { acertos: Achado[]; erros: Achado[]; extras: string[]; acoes: AcaoCanal[] } {
  const acertos: Achado[] = [];
  const erros: Achado[] = [];
  const extras: string[] = [];
  const acoes: AcaoCanal[] = [];

  for (const c of checklistCliente(bloco.checklist)) {
    if (!c?.label) continue;
    const item: Achado = {
      canal: meta.id,
      canalLabel: meta.label,
      ok: !!c.ok,
      label: c.label,
      detalhe: c.detalhe || undefined,
      origem: "checklist",
    };
    if (c.ok) {
      pushUnique(acertos, item);
    } else {
      pushUnique(erros, item);
      // Só vira ação se não houver melhoria_rapida cobrindo o mesmo tema
      const jaTemMelhoria = (bloco.melhorias_rapidas || []).some((m) => {
        if (!m?.titulo) return false;
        const a = m.titulo.toLowerCase();
        const b = c.label!.toLowerCase();
        return a.includes(b.slice(0, 20)) || b.includes(a.slice(0, 20));
      });
      if (!jaTemMelhoria) {
        pushAcao(acoes, {
          titulo: `Corrigir: ${c.label}`,
          como: c.detalhe || `Resolver o item “${c.label}” no ${meta.label}`,
          porque: "Item do checklist em falha",
          fonte: "checklist",
        });
      }
    }
  }

  for (const m of bloco.melhorias_rapidas || []) {
    if (!m?.titulo) continue;
    // Melhorias vão só para “o que fazer” — não duplicar em “o que está travando”
    pushAcao(acoes, {
      titulo: m.titulo,
      como: m.como || undefined,
      porque: m.porque || undefined,
      esforco: m.esforco,
      impacto: m.impacto,
      fonte: "melhoria",
    });
  }

  if (bloco.gap_vs_concorrentes) {
    pushUnique(erros, {
      canal: meta.id,
      canalLabel: meta.label,
      ok: false,
      label: "Gap vs concorrentes",
      detalhe: bloco.gap_vs_concorrentes,
      impacto: "alto",
      origem: "gap",
    });
    pushAcao(acoes, {
      titulo: "Fechar gap vs concorrentes",
      como: bloco.gap_vs_concorrentes,
      porque: "Concorrentes estão à frente neste canal",
      impacto: "alto",
      fonte: "gap",
    });
  }

  for (const a of bloco.angulos_do_cliente || []) {
    if (!a) continue;
    pushUnique(acertos, {
      canal: meta.id,
      canalLabel: meta.label,
      ok: true,
      label: a,
      origem: "forte",
    });
  }

  for (const a of bloco.angulos_para_copiar || []) {
    if (!a) continue;
    pushUnique(erros, {
      canal: meta.id,
      canalLabel: meta.label,
      ok: false,
      label: `Oportunidade de ângulo: ${a}`,
      impacto: "medio",
      origem: "oportunidade",
    });
    pushAcao(acoes, {
      titulo: `Produzir conteúdo: ${a}`,
      como: `Criar peça/reel no ${meta.label} com este ângulo (já validado em concorrentes)`,
      impacto: "medio",
      fonte: "oportunidade",
    });
  }

  for (const a of bloco.angulos_tendencia || []) {
    if (!a) continue;
    extras.push(`Tendência: ${a}`);
    pushUnique(erros, {
      canal: meta.id,
      canalLabel: meta.label,
      ok: false,
      label: `Tendência a explorar: ${a}`,
      origem: "oportunidade",
    });
    pushAcao(acoes, {
      titulo: `Testar tendência: ${a}`,
      como: `Adaptar a tendência ao tom da marca e publicar no ${meta.label}`,
      fonte: "oportunidade",
    });
  }

  for (const cfg of bloco.configuracoes_sugeridas || []) {
    if (!cfg) continue;
    pushUnique(erros, {
      canal: meta.id,
      canalLabel: meta.label,
      ok: false,
      label: cfg,
      origem: "melhoria",
    });
    pushAcao(acoes, {
      titulo: cfg,
      como: `Aplicar esta configuração em ${meta.label}`,
      fonte: "config",
    });
  }

  for (const p of bloco.prompts || []) {
    if (!p?.prompt) continue;
    const eng = p.engines?.[0];
    const citado = !!eng?.citado;
    const item: Achado = {
      canal: meta.id,
      canalLabel: meta.label,
      ok: citado,
      label: citado ? `Citado: “${p.prompt}”` : `Não citado: “${p.prompt}”`,
      detalhe: eng?.trecho
        || (p.share_of_answer != null ? `share ~${p.share_of_answer}%` : undefined),
      origem: citado ? "forte" : "gap",
      impacto: citado ? undefined : "alto",
    };
    if (citado) pushUnique(acertos, item);
    else pushUnique(erros, item);
    extras.push(`${citado ? "✓" : "✕"} ${p.prompt}`);
  }

  const citados = bloco.concorrentes_citados;
  if (citados?.length) {
    const nomes = citados
      .map((c) => c.nome)
      .filter(Boolean)
      .slice(0, 6) as string[];
    if (nomes.length) {
      pushUnique(erros, {
        canal: meta.id,
        canalLabel: meta.label,
        ok: false,
        label: `Quem a IA cita no seu lugar: ${nomes.join(" · ")}`,
        detalhe: "Marcas que aparecem nas respostas dos prompts monitorados",
        origem: "gap",
        impacto: "alto",
      });
      extras.push(`Rivais na IA: ${nomes.join(", ")}`);
    }
  }

  return { acertos, erros, extras, acoes };
}

function extrairBlog(blog: NonNullable<PresencaBlocos["blog"]>): CanalInsight {
  const acertos: Achado[] = [];
  const erros: Achado[] = [];
  const extras: string[] = [];
  const acoes: AcaoCanal[] = [];
  const q = blog.qualidade;

  if (blog.tem_blog) {
    pushUnique(acertos, {
      canal: "blog",
      canalLabel: "Blog",
      ok: true,
      label: `Blog ativo${blog.posts_encontrados != null ? ` · ${blog.posts_encontrados} posts` : ""}`,
      detalhe: blog.url ?? undefined,
      origem: "checklist",
    });
  } else {
    pushUnique(erros, {
      canal: "blog",
      canalLabel: "Blog",
      ok: false,
      label: "Sem blog / conteúdo editorial detectado",
      origem: "checklist",
    });
    pushAcao(acoes, {
      titulo: "Criar ou reativar o blog",
      como: "Definir CMS, categorias e cadência mínima (ex.: 2–4 posts/mês alinhados às keywords)",
      porque: "Sem hub editorial a marca perde autoridade e SEO de cauda longa",
      impacto: "alto",
      fonte: "checklist",
    });
  }

  if (blog.cobertura) extras.push(`Cobertura: ${blog.cobertura}`);
  if (q?.tom?.personalidade) extras.push(`Tom: ${q.tom.personalidade}`);
  if (q?.resumo) extras.push(q.resumo);

  for (const t of q?.pontos_fortes || []) {
    if (!t) continue;
    pushUnique(acertos, { canal: "blog", canalLabel: "Blog", ok: true, label: t, origem: "forte" });
  }
  for (const t of q?.seo?.o_que_funciona || []) {
    if (!t) continue;
    pushUnique(acertos, { canal: "blog", canalLabel: "Blog", ok: true, label: t, origem: "forte" });
  }
  for (const t of q?.seo?.o_que_falta || []) {
    if (!t) continue;
    pushUnique(erros, { canal: "blog", canalLabel: "Blog", ok: false, label: t, origem: "gap", impacto: "medio" });
    pushAcao(acoes, { titulo: t, como: "Incluir no próximo ciclo editorial / template de post", fonte: "gap" });
  }
  for (const g of q?.gaps_conteudo || []) {
    if (!g?.gap) continue;
    pushUnique(erros, {
      canal: "blog", canalLabel: "Blog", ok: false, label: g.gap,
      detalhe: [g.impacto, g.como_corrigir].filter(Boolean).join(" · ") || undefined, origem: "gap",
    });
    pushAcao(acoes, {
      titulo: g.gap, como: g.como_corrigir || "Corrigir no próximo lote de posts", porque: g.impacto, fonte: "gap",
    });
  }
  for (const c of q?.seo?.checklist_padrao || []) {
    if (!c?.item) continue;
    extras.push(`${c.obrigatorio ? "[obrig.] " : ""}${c.item}`);
  }
  for (const t of q?.oportunidades_tema || []) {
    if (!t) continue;
    pushUnique(erros, {
      canal: "blog", canalLabel: "Blog", ok: false, label: `Tema oportunidade: ${t}`, origem: "oportunidade",
    });
    pushAcao(acoes, {
      titulo: `Publicar sobre: ${t}`,
      como: "Brief + SEO on-page + linkagem interna para páginas comerciais",
      fonte: "oportunidade",
    });
  }

  const temDados = !!blog.tem_blog || !!q || (blog.posts_encontrados ?? 0) > 0;
  return {
    id: "blog",
    label: "Blog",
    nota: q?.seo?.nota != null ? Math.round(Number(q.seo.nota)) : null,
    faixa: q?.seo?.faixa ?? null,
    resumo: q?.resumo
      || (blog.tem_blog ? `Blog${blog.url ? ` · ${blog.url}` : ""}` : temDados ? "Sem blog detectado" : "Auditoria pendente"),
    status: temDados ? "auditado" : "pendente",
    listaAcertos: acertos,
    listaErros: erros,
    oQueFazer: acoes,
    extras,
    href: blog.url ?? null,
    especialista: q?.especialista ?? null,
  };
}

function extrairPercepcao(perc: NonNullable<PresencaBlocos["percepcao_valor"]>): CanalInsight {
  const acertos: Achado[] = [];
  const erros: Achado[] = [];
  const extras: string[] = [];
  const acoes: AcaoCanal[] = [];

  if (perc.percepcao_real_marca) extras.push(perc.percepcao_real_marca);
  if (perc.tom_visual_e_verbal) extras.push(`Tom: ${perc.tom_visual_e_verbal}`);
  if (perc.percepcao_em_ia) extras.push(`IA: ${perc.percepcao_em_ia}`);
  if (perc.ia_cita_marca) extras.push(`IA cita marca: ${perc.ia_cita_marca}`);
  if (perc.produto_declarado && perc.produto_percebido) {
    extras.push(`Declarado: ${perc.produto_declarado} · Percebido: ${perc.produto_percebido}`);
  }

  if (perc.percepcao_em_ia || perc.ia_cita_marca) {
    const cita = String(perc.ia_cita_marca || "").toLowerCase();
    const okIa = cita === "sim" || cita === "parcial";
    pushUnique(okIa ? acertos : erros, {
      canal: "percepcao",
      canalLabel: "Percepção de valor",
      ok: okIa,
      label: perc.percepcao_em_ia
        ? `Percepção em IA: ${perc.percepcao_em_ia}`
        : `Citação em IA: ${perc.ia_cita_marca}`,
      detalhe: perc.ia_cita_marca ? `status: ${perc.ia_cita_marca}` : undefined,
      origem: "percepcao",
      impacto: okIa ? undefined : "alto",
    });
  }

  for (const t of perc.o_que_reforcar || []) {
    if (!t) continue;
    pushUnique(acertos, {
      canal: "percepcao", canalLabel: "Percepção de valor", ok: true, label: t, origem: "percepcao",
    });
    pushAcao(acoes, {
      titulo: `Reforçar: ${t}`,
      como: "Manter e amplificar em site, ads e redes (mensagem consistente)",
      fonte: "percepcao",
    });
  }

  for (const t of perc.o_que_corrigir || []) {
    if (!t) continue;
    pushUnique(erros, {
      canal: "percepcao", canalLabel: "Percepção de valor", ok: false, label: t, impacto: "alto", origem: "percepcao",
    });
    pushAcao(acoes, {
      titulo: `Corrigir percepção: ${t}`,
      como: "Reescrever bio, criativos, landing e roteiros para alinhar o que o público entende vs. a oferta",
      impacto: "alto",
      fonte: "percepcao",
    });
  }

  for (const g of perc.gaps || []) {
    if (!g?.gap) continue;
    pushUnique(erros, {
      canal: "percepcao", canalLabel: "Percepção de valor", ok: false, label: g.gap,
      detalhe: [g.evidencia, g.risco_ou_oportunidade].filter(Boolean).join(" · ") || undefined,
      impacto: g.severidade || "alto", origem: "percepcao",
    });
    pushAcao(acoes, {
      titulo: g.gap,
      como: g.risco_ou_oportunidade || "Fechar o gap de mensagem no próximo ciclo de conteúdo",
      porque: g.evidencia,
      impacto: g.severidade || "alto",
      fonte: "percepcao",
    });
  }

  return {
    id: "percepcao",
    label: "Percepção de valor",
    nota: null,
    resumo: perc.percepcao_real_marca || perc.proposta_valor_percebida || "Percepção analisada",
    status: "auditado",
    listaAcertos: acertos,
    listaErros: erros,
    oQueFazer: acoes,
    extras,
  };
}

function extrairRadar(radar: NonNullable<PresencaBlocos["radar_ig"]>): CanalInsight {
  const acertos: Achado[] = [];
  const erros: Achado[] = [];
  const acoes: AcaoCanal[] = [];
  if (radar.handle) {
    pushUnique(acertos, {
      canal: "radar",
      canalLabel: "Radar Instagram",
      ok: true,
      label: `Relatório Radar @${radar.handle}`,
      detalhe: [
        radar.seguidores != null ? `${radar.seguidores} seguidores` : null,
        radar.taxa_engajamento != null ? `eng. ${radar.taxa_engajamento}%` : null,
        radar.qtd_posts != null ? `${radar.qtd_posts} posts` : null,
        radar.status ? `status ${radar.status}` : null,
      ].filter(Boolean).join(" · ") || undefined,
      origem: "forte",
    });
    pushAcao(acoes, {
      titulo: "Usar insights do Radar no calendário IG",
      como: "Cruzar engajamento e posts do Radar com o playbook de Instagram desta apresentação",
      fonte: "plano",
    });
  } else {
    pushUnique(erros, {
      canal: "radar",
      canalLabel: "Radar Instagram",
      ok: false,
      label: "Radar IG não vinculado a esta análise",
      origem: "pendente",
    });
    pushAcao(acoes, {
      titulo: "Vincular cliente_handle e rodar Radar Espião",
      como: "Associar o handle IG na análise web e gerar o relatório Radar",
      fonte: "checklist",
    });
  }
  return {
    id: "radar",
    label: "Radar Instagram",
    nota: null,
    resumo: radar.handle ? `@${radar.handle}` : "Não vinculado",
    status: radar.handle ? "auditado" : "pendente",
    listaAcertos: acertos,
    listaErros: erros,
    oQueFazer: acoes,
  };
}

export function buildAchados(presenca: PresencaBlocos): {
  acertos: Achado[];
  erros: Achado[];
  canais: CanalInsight[];
} {
  const canais: CanalInsight[] = [];
  const acertos: Achado[] = [];
  const erros: Achado[] = [];

  for (const meta of CANAIS) {
    if (meta.key === "blog") {
      // Sem auditoria = não mostrar (não é gap do cliente)
      if (!presenca.blog) continue;
      const c = extrairBlog(presenca.blog);
      if (c.status === "pendente") continue;
      canais.push(c);
      acertos.push(...c.listaAcertos);
      erros.push(...c.listaErros);
      continue;
    }

    if (meta.key === "percepcao_valor") {
      if (!presenca.percepcao_valor) continue;
      const c = extrairPercepcao(presenca.percepcao_valor);
      if (c.status === "pendente") continue;
      canais.push(c);
      acertos.push(...c.listaAcertos);
      erros.push(...c.listaErros);
      continue;
    }

    if (meta.key === "radar_ig") {
      // Só mostra se houver relatório vinculado
      if (!presenca.radar_ig?.handle) continue;
      const c = extrairRadar(presenca.radar_ig);
      canais.push(c);
      acertos.push(...c.listaAcertos);
      erros.push(...c.listaErros);
      continue;
    }

    const bloco = presenca[meta.key] as BlocoCanal | null | undefined;
    // Faltando ou só erro nosso → some da análise
    if (!bloco) continue;
    if (blocoSoErroNosso(bloco)) continue;

    const { acertos: ca, erros: ce, extras, acoes } = extrairBlocoPadrao(meta, bloco);
    // Sem sinal útil do cliente → não inventa slide vazio
    if (ca.length === 0 && ce.length === 0 && bloco.nota_interna?.nota == null && !bloco.resumo) {
      continue;
    }

    const resumoCliente = bloco.resumo
      || (bloco.erro && !isFalhaNossaOuFaltando({ label: bloco.erro, ok: false })
        ? bloco.erro
        : null);

    const insight: CanalInsight = {
      id: meta.id,
      label: meta.label,
      nota: notaDe(bloco),
      faixa: bloco.nota_interna?.faixa ?? null,
      resumo: resumoCliente,
      prioridade: bloco.prioridade ?? null,
      status: "auditado",
      listaAcertos: ca,
      listaErros: ce,
      oQueFazer: acoes,
      extras,
      especialista: bloco.especialista ?? null,
      pagespeed: meta.id === "site" ? (bloco.pagespeed ?? null) : null,
    };
    canais.push(insight);
    acertos.push(...ca);
    erros.push(...ce);
  }

  erros.sort((a, b) => rankImpacto(a.impacto) - rankImpacto(b.impacto));

  return {
    acertos: acertos.filter((a) => !isFalhaNossaOuFaltando(a)),
    erros: erros.filter((e) => !isFalhaNossaOuFaltando(e)),
    canais,
  };
}

/** Normaliza nomes de canal do plano LLM → id interno */
export function normalizeCanalId(raw?: string | null): string | null {
  if (!raw) return null;
  const s = String(raw).toLowerCase().trim();
  if (["site", "tech", "tech_seo", "seo", "tech-seo", "website"].includes(s)) return "site";
  if (["gmb", "google", "google_meu_negocio", "maps", "local"].includes(s)) return "gmb";
  if (["busca", "brand", "autoridade", "serp", "marca"].includes(s)) return "busca";
  if (
    ["ia", "llm", "ai", "ai_visibility", "chatgpt", "gemini", "perplexity"].includes(s)
    || (s.includes("visibilidade") && (s.includes("ia") || s.includes("llm") || s.includes("chatgpt")))
  ) return "ia";
  if (["ads", "meta", "meta_ads", "facebook", "anuncios", "anúncios"].includes(s)) return "ads";
  if (["instagram", "ig", "insta"].includes(s)) return "instagram";
  if (["tiktok", "tt"].includes(s)) return "tiktok";
  if (["youtube", "yt"].includes(s)) return "youtube";
  if (["blog", "conteudo", "conteúdo"].includes(s)) return "blog";
  if (["percepcao", "percepção", "marca_percepcao"].includes(s)) return "percepcao";
  if (["radar"].includes(s)) return "radar";
  return null;
}

type PlanoLite = {
  diretrizes_agora?: { titulo?: string; porque?: string; como?: string; canal?: string; esforco?: string; impacto?: string }[];
  estrategia_360?: {
    plays?: { acao?: string; canal?: string; prazo?: string; dono?: string; impacto_esperado?: string }[];
  }[];
  movimentos?: {
    titulo?: string;
    acao_principal?: string;
    canal?: string;
    canais_cruzados?: string[];
    prazo_sugerido?: string;
    esforco?: string;
    impacto?: string;
    playbook?: string[];
  }[];
};

/** Mescla ações do plano de impacto nos canais (Site, IG, TikTok…). */
export function enrichCanaisComPlano(canais: CanalInsight[], plano: PlanoLite | null | undefined): CanalInsight[] {
  if (!plano) return canais;
  const byId = new Map(canais.map((c) => [c.id, { ...c, oQueFazer: [...(c.oQueFazer || [])] }]));

  for (const d of plano.diretrizes_agora || []) {
    const id = normalizeCanalId(d.canal);
    if (!id || !d.titulo) continue;
    const canal = byId.get(id);
    if (!canal) continue;
    pushAcao(canal.oQueFazer, {
      titulo: d.titulo,
      como: d.como,
      porque: d.porque,
      esforco: d.esforco,
      impacto: d.impacto,
      prazo: "7d",
      fonte: "plano",
    });
  }

  for (const e of plano.estrategia_360 || []) {
    for (const p of e.plays || []) {
      const id = normalizeCanalId(p.canal);
      if (!id || !p.acao) continue;
      const canal = byId.get(id);
      if (!canal) continue;
      pushAcao(canal.oQueFazer, {
        titulo: p.acao,
        como: p.dono ? `Dono: ${p.dono}` : undefined,
        prazo: p.prazo,
        impacto: p.impacto_esperado,
        fonte: "plano",
      });
    }
  }

  for (const m of plano.movimentos || []) {
    const ids = new Set<string>();
    const main = normalizeCanalId(m.canal);
    if (main) ids.add(main);
    for (const x of m.canais_cruzados || []) {
      const n = normalizeCanalId(x);
      if (n) ids.add(n);
    }
    for (const id of ids) {
      const canal = byId.get(id);
      if (!canal) continue;
      const titulo = m.acao_principal || m.titulo;
      if (!titulo) continue;
      pushAcao(canal.oQueFazer, {
        titulo,
        como: (m.playbook || []).filter(Boolean).join(" → ") || undefined,
        prazo: m.prazo_sugerido,
        esforco: m.esforco,
        impacto: m.impacto,
        fonte: "plano",
      });
    }
  }

  return Array.from(byId.values());
}

export function resumoOverview(achados: { acertos: Achado[]; erros: Achado[]; canais: CanalInsight[] }) {
  const comNota = achados.canais.filter((c) => c.nota != null);
  const media =
    comNota.length > 0
      ? Math.round(comNota.reduce((s, c) => s + (c.nota as number), 0) / comNota.length)
      : null;
  const criticos = achados.canais.filter((c) => c.nota != null && (c.nota as number) < 50);
  const fortes = achados.canais.filter((c) => c.nota != null && (c.nota as number) >= 75);
  return {
    media,
    canaisAuditados: achados.canais.filter((c) => c.status === "auditado").length,
    canaisPendentes: achados.canais.filter((c) => c.status === "pendente").length,
    totalAcertos: achados.acertos.length,
    totalErros: achados.erros.filter((e) => e.origem !== "pendente").length,
    criticos: criticos.map((c) => c.label),
    fortes: fortes.map((c) => c.label),
  };
}

export function groupByCanal(items: Achado[]): { canal: string; label: string; items: Achado[] }[] {
  const map = new Map<string, { canal: string; label: string; items: Achado[] }>();
  for (const it of items) {
    const cur = map.get(it.canal) || { canal: it.canal, label: it.canalLabel, items: [] };
    cur.items.push(it);
    map.set(it.canal, cur);
  }
  return Array.from(map.values());
}
