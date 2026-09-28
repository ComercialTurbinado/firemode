/** Trilha lógica antes de criar conteúdo — análises → percepção → gerar. */

export type TrilhaItem = {
  id: string;
  label: string;
  ok: boolean;
  obrigatorio: boolean;
  detalhe?: string;
  href?: string; // âncora #na página
};

export type TrilhaConteudo = {
  pronto: boolean;
  itens: TrilhaItem[];
  faltantes: string[];
  avisos: string[];
};

type PresencaLite = {
  tech_seo?: { nota_interna?: { nota?: number } | null; score?: { total?: number } | null } | null;
  google_meu_negocio?: { nota_interna?: { nota?: number } | null; encontrado?: boolean } | null;
  autoridade_busca?: { nota_interna?: { nota?: number } | null } | null;
  meta_ads?: { nota_interna?: { nota?: number } | null; ads_cliente_count?: number } | null;
  instagram?: {
    nota_interna?: { nota?: number } | null;
    cliente?: {
      handle?: string | null;
      perfil?: { username?: string | null } | null;
    } | null;
  } | null;
  youtube?: {
    nota_interna?: { nota?: number } | null;
    canal?: { id?: string | null } | null;
    videos?: unknown[] | null;
  } | null;
  tiktok?: {
    nota_interna?: { nota?: number } | null;
    perfil?: { handle?: string | null } | null;
  } | null;
  blog?: {
    qualidade?: { prompt_escrita?: string | null; tom?: unknown } | null;
    tem_blog?: boolean;
    url?: string | null;
  } | null;
  plano_impacto?: { atualizado_em?: string; movimentos?: unknown[] } | null;
  percepcao_valor?: {
    atualizado_em?: string;
    gerado_em?: string;
    gaps?: unknown[];
    o_que_reforcar?: unknown[];
    o_que_corrigir?: unknown[];
    percepcao_real_marca?: string | null;
  } | null;
};

function temNota(bloco: { nota_interna?: { nota?: number } | null; score?: { total?: number } | null } | null | undefined) {
  if (!bloco) return false;
  if (bloco.nota_interna?.nota != null) return true;
  if (bloco.score?.total) return true;
  return false;
}

export function buildTrilhaConteudo(
  diagnostico: Record<string, unknown> | null | undefined,
  presenca: PresencaLite | null | undefined,
): TrilhaConteudo {
  const p = presenca ?? {};
  const diag = diagnostico ?? {};
  const temDiag = Boolean(diag.oferta || diag.empresa);

  const ig = p.instagram;
  const yt = p.youtube;
  const tt = p.tiktok;
  const temRede = Boolean(
    temNota(ig)
    || ig?.cliente?.handle
    || ig?.cliente?.perfil?.username
    || temNota(yt)
    || yt?.canal?.id
    || (Array.isArray(yt?.videos) && yt!.videos!.length > 0)
    || temNota(tt)
    || tt?.perfil?.handle,
  );

  const perc = p.percepcao_valor;
  const temPerc = Boolean(
    perc?.atualizado_em
    || perc?.gerado_em
    || (Array.isArray(perc?.gaps) && perc!.gaps!.length > 0)
    || perc?.percepcao_real_marca,
  );

  const itens: TrilhaItem[] = [
    {
      id: "diagnostico",
      label: "Diagnóstico do site",
      ok: temDiag,
      obrigatorio: true,
      detalhe: temDiag ? String(diag.empresa || diag.oferta || "ok") : "Rode a análise web",
      href: "#site",
    },
    {
      id: "tech_seo",
      label: "Tech SEO",
      ok: temNota(p.tech_seo),
      obrigatorio: true,
      detalhe: temNota(p.tech_seo) ? `nota ${p.tech_seo?.nota_interna?.nota ?? "checklist"}` : "Atualizar Tech SEO",
      href: "#tech-seo",
    },
    {
      id: "redes",
      label: "Rede social (IG / YT / TikTok)",
      ok: temRede,
      obrigatorio: true,
      detalhe: temRede ? "mídia disponível" : "Auditar Instagram ou YouTube",
      href: "#instagram",
    },
    {
      id: "percepcao",
      label: "Percepção de valor",
      ok: temPerc,
      obrigatorio: true,
      detalhe: temPerc
        ? `${(perc?.gaps || []).length} gaps · reforçar/corrigir`
        : "Obrigatório antes de criar conteúdo",
      href: "#percepcao",
    },
    {
      id: "gmb",
      label: "Google Meu Negócio",
      ok: temNota(p.google_meu_negocio) || p.google_meu_negocio?.encontrado === false,
      obrigatorio: false,
      detalhe: "Recomendado (local)",
      href: "#gmb",
    },
    {
      id: "busca",
      label: "Autoridade de busca",
      ok: temNota(p.autoridade_busca),
      obrigatorio: false,
      detalhe: "Recomendado",
      href: "#busca",
    },
    {
      id: "ads",
      label: "Meta Ads",
      ok: temNota(p.meta_ads) || (p.meta_ads?.ads_cliente_count != null),
      obrigatorio: false,
      detalhe: "Recomendado",
      href: "#ads",
    },
    {
      id: "blog_qualidade",
      label: "Qualidade do blog",
      ok: Boolean(p.blog?.qualidade?.prompt_escrita || p.blog?.qualidade?.tom),
      obrigatorio: false,
      detalhe: "Refina tom de voz",
      href: "#blog",
    },
    {
      id: "impacto",
      label: "Plano de impacto",
      ok: Boolean(p.plano_impacto?.atualizado_em || (p.plano_impacto?.movimentos || []).length),
      obrigatorio: false,
      detalhe: "Alinha prioridade comercial",
      href: "#impacto",
    },
  ];

  const faltantes = itens.filter((i) => i.obrigatorio && !i.ok).map((i) => i.label);
  const avisos = itens.filter((i) => !i.obrigatorio && !i.ok).map((i) => i.label);

  return {
    pronto: faltantes.length === 0,
    itens,
    faltantes,
    avisos,
  };
}
