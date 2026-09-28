/** Scorecard de presença — notas 0–100 por canal a partir dos dados já existentes. */

export type CanalStatus = "ok" | "atencao" | "critico" | "pendente" | "em_breve";

export type CanalScore = {
  id: string;
  label: string;
  nota: number | null;
  status: CanalStatus;
  detalhe: string;
  href?: string | null;
};

export type ScorecardInput = {
  url?: string | null;
  redes?: { rede: string; perfil?: string; url?: string }[];
  blog?: { tem_blog?: boolean; posts_encontrados?: number; url?: string | null } | null;
  urlsInternasCount?: number;
  gmb?: {
    encontrado?: boolean;
    nota_interna?: { nota?: number; faixa?: string } | null;
    score?: { ok?: number; total?: number } | null;
    perfil?: { avaliacao?: number; total_avaliacoes?: number } | null;
    nps?: { nps?: number | null; faixa?: string | null; amostra?: number } | null;
    reclame_aqui?: {
      encontrado?: boolean;
      metricas?: {
        nota?: number;
        taxa_resposta?: number;
        taxa_resolucao?: number;
        voltaria_fazer_negocio?: number;
        total_reclamacoes?: number;
      } | null;
      total_reclamacoes_lidas?: number | null;
    } | null;
    analise_mensagens?: { ok?: boolean; alerta_reputacao?: string | null } | null;
  } | null;
  techSeo?: {
    nota_interna?: { nota?: number; faixa?: string } | null;
    score?: { ok?: number; total?: number } | null;
    erro?: string | null;
  } | null;
  autoridadeBusca?: {
    nota_interna?: { nota?: number; faixa?: string } | null;
    score?: { ok?: number; total?: number } | null;
    query?: string | null;
    erro?: string | null;
  } | null;
  metaAds?: {
    nota_interna?: { nota?: number; faixa?: string } | null;
    score?: { ok?: number; total?: number } | null;
    ads_cliente_count?: number;
    ads_ativos?: number;
    erro?: string | null;
  } | null;
  youtube?: {
    nota_interna?: { nota?: number; faixa?: string } | null;
    score?: { ok?: number; total?: number } | null;
    canal?: { handle?: string; nome?: string; inscritos?: number | null; url?: string | null } | null;
    link_site?: { handle?: string | null; url?: string | null } | null;
    erro?: string | null;
  } | null;
  tiktok?: {
    nota_interna?: { nota?: number; faixa?: string } | null;
    score?: { ok?: number; total?: number } | null;
    perfil?: { handle?: string; nome?: string; seguidores?: number | null; url?: string | null } | null;
    link_site?: { handle?: string | null; url?: string | null } | null;
    gap_vs_concorrentes?: string | null;
    erro?: string | null;
  } | null;
  instagram?: {
    nota_interna?: { nota?: number; faixa?: string } | null;
    score?: { ok?: number; total?: number } | null;
    cliente?: {
      handle?: string | null;
      perfil?: { username?: string; seguidores?: number | null } | null;
      periodicidade?: { ritmo?: string; detalhe?: string } | null;
    } | null;
    comparativo?: { papel?: string; handle?: string | null; ritmo?: string | null }[];
    gap_vs_concorrentes?: string | null;
    erro?: string | null;
  } | null;
  aiVisibility?: {
    nota_interna?: { nota?: number; faixa?: string } | null;
    score?: { ok?: number; total?: number } | null;
    fonte?: string | null;
    erro?: string | null;
    prompts?: { id?: string; share_of_answer?: number }[];
  } | null;
  radarIg?: {
    id?: string;
    handle?: string | null;
    seguidores?: number | null;
    taxa_engajamento?: number | null;
    qtd_posts?: number | null;
    status?: string | null;
    criado_em?: string | null;
  } | null;
  concorrentesCount?: number;
  radarBackendUrl?: string | null;
  clienteHandle?: string | null;
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function statusDeNota(nota: number | null, pendente?: boolean, emBreve?: boolean): CanalStatus {
  if (emBreve) return "em_breve";
  if (pendente || nota == null) return "pendente";
  if (nota >= 75) return "ok";
  if (nota >= 50) return "atencao";
  return "critico";
}

function scoreSite(input: ScorecardInput): CanalScore {
  const t = input.techSeo;
  if (t?.nota_interna?.nota != null) {
    const n = clamp(Number(t.nota_interna.nota));
    return {
      id: "site",
      label: "Site",
      nota: n,
      status: statusDeNota(n),
      detalhe: t.nota_interna.faixa
        ? `tech/SEO · ${t.nota_interna.faixa}`
        : "tech/SEO on-page",
      href: input.url ?? null,
    };
  }
  if (t?.score?.total) {
    const n = clamp((100 * (t.score.ok ?? 0)) / t.score.total);
    return {
      id: "site",
      label: "Site",
      nota: n,
      status: statusDeNota(n),
      detalhe: `checklist tech ${t.score.ok}/${t.score.total}`,
      href: input.url ?? null,
    };
  }

  const https = !!input.url?.startsWith("https");
  const blog = !!input.blog?.tem_blog;
  const posts = input.blog?.posts_encontrados ?? 0;
  const redes = input.redes?.length ?? 0;
  const urls = input.urlsInternasCount ?? 0;

  let nota = 0;
  const bits: string[] = [];
  if (https) { nota += 20; bits.push("HTTPS"); } else bits.push("sem HTTPS");
  if (blog) { nota += 25; bits.push("blog"); } else bits.push("sem blog");
  if (posts > 0) { nota += Math.min(20, 8 + posts); bits.push(`${posts} posts`); }
  if (redes > 0) { nota += Math.min(20, 10 + redes * 4); bits.push(`${redes} rede(s)`); } else bits.push("sem redes no site");
  if (urls >= 8) { nota += 15; bits.push("site rico"); }
  else if (urls >= 3) { nota += 8; }

  return {
    id: "site",
    label: "Site",
    nota: clamp(nota),
    status: statusDeNota(clamp(nota)),
    detalhe: bits.join(" · ") + " · sem auditoria tech",
    href: input.url ?? null,
  };
}

function scoreGmb(input: ScorecardInput): CanalScore {
  const g = input.gmb;
  if (!g) {
    return {
      id: "gmb", label: "Google Meu Negócio", nota: null,
      status: "pendente", detalhe: "Sem auditoria — use Auditar GMB",
    };
  }
  if (g.nota_interna?.nota != null) {
    const n = clamp(Number(g.nota_interna.nota));
    return {
      id: "gmb", label: "Google Meu Negócio", nota: n,
      status: statusDeNota(n),
      detalhe: g.nota_interna.faixa ? `nota interna · ${g.nota_interna.faixa}` : "nota interna Firemode",
    };
  }
  if (g.score?.total) {
    const n = clamp((100 * (g.score.ok ?? 0)) / g.score.total);
    return {
      id: "gmb", label: "Google Meu Negócio", nota: n,
      status: statusDeNota(n),
      detalhe: `checklist ${g.score.ok}/${g.score.total}`,
    };
  }
  if (g.encontrado === false) {
    return {
      id: "gmb", label: "Google Meu Negócio", nota: 10,
      status: "critico", detalhe: "Perfil não encontrado",
    };
  }
  return {
    id: "gmb", label: "Google Meu Negócio", nota: null,
    status: "pendente", detalhe: "Dados incompletos",
  };
}

function scoreInstagram(input: ScorecardInput): CanalScore {
  const igLink = input.redes?.find((r) => r.rede?.toLowerCase().includes("instagram"));
  const snap = input.instagram;
  const r = input.radarIg;
  const href = input.radarBackendUrl && input.clienteHandle
    ? `${input.radarBackendUrl.replace(/\/$/, "")}/dashboard?handle=${input.clienteHandle}`
    : igLink?.url ?? null;

  // Preferência: auditoria Content Machine (cliente + concorrentes SERP)
  if (snap?.nota_interna?.nota != null) {
    const n = clamp(Number(snap.nota_interna.nota));
    const handle = snap.cliente?.handle || snap.cliente?.perfil?.username || igLink?.perfil;
    const ritmo = snap.cliente?.periodicidade?.ritmo;
    const bits = [
      handle ? `@${handle}` : "IG",
      ritmo ? `ritmo ${ritmo}` : null,
      snap.nota_interna.faixa || null,
    ].filter(Boolean);
    return {
      id: "instagram", label: "Instagram", nota: n,
      status: statusDeNota(n),
      detalhe: bits.join(" · ") + " · vs SERP",
      href,
    };
  }

  if (!r) {
    if (igLink) {
      return {
        id: "instagram", label: "Instagram", nota: 25,
        status: "atencao",
        detalhe: `Link no site (@${igLink.perfil || "—"}) · sem auditoria IG / Radar`,
        href,
      };
    }
    return {
      id: "instagram", label: "Instagram", nota: 0,
      status: "critico", detalhe: "Não detectado", href: null,
    };
  }

  let nota = 35;
  const bits: string[] = [`@${r.handle || "ig"}`];
  const seg = Number(r.seguidores ?? 0);
  const eng = Number(r.taxa_engajamento ?? 0);
  const posts = Number(r.qtd_posts ?? 0);

  if (seg >= 5000) nota += 25;
  else if (seg >= 1000) nota += 18;
  else if (seg >= 300) nota += 10;
  else nota += 4;
  bits.push(`${seg.toLocaleString("pt-BR")} seguidores`);

  if (eng >= 5) nota += 25;
  else if (eng >= 2) nota += 18;
  else if (eng >= 0.8) nota += 10;
  else nota += 4;
  bits.push(`${eng}% eng.`);

  if (posts >= 40) nota += 15;
  else if (posts >= 15) nota += 10;
  else if (posts >= 5) nota += 5;
  bits.push(`${posts} posts`);

  const n = clamp(nota);
  return {
    id: "instagram", label: "Instagram", nota: n,
    status: statusDeNota(n),
    detalhe: bits.join(" · ") + " · Radar",
    href,
  };
}

function scoreRedeDetectada(
  id: string,
  label: string,
  input: ScorecardInput,
  aliases: string[],
): CanalScore {
  const hit = input.redes?.find((r) => aliases.some((a) => r.rede?.toLowerCase().includes(a)));
  if (hit) {
    return {
      id, label, nota: 30, status: "atencao",
      detalhe: `Detectado no site (@${hit.perfil || "—"}) · auditoria completa em breve`,
      href: hit.url ?? null,
    };
  }
  return {
    id, label, nota: 0, status: "critico",
    detalhe: "Não detectado no site", href: null,
  };
}

function scoreBusca(input: ScorecardInput): CanalScore {
  const a = input.autoridadeBusca;
  if (a?.nota_interna?.nota != null) {
    const n = clamp(Number(a.nota_interna.nota));
    return {
      id: "busca",
      label: "Busca",
      nota: n,
      status: statusDeNota(n),
      detalhe: a.nota_interna.faixa
        ? `marca · ${a.nota_interna.faixa}${a.query ? ` · “${a.query}”` : ""}`
        : "autoridade de marca na SERP",
    };
  }
  if (a?.score?.total) {
    const n = clamp((100 * (a.score.ok ?? 0)) / a.score.total);
    return {
      id: "busca",
      label: "Busca",
      nota: n,
      status: statusDeNota(n),
      detalhe: `checklist marca ${a.score.ok}/${a.score.total}`,
    };
  }

  const n = input.concorrentesCount ?? 0;
  if (n <= 0) {
    return {
      id: "busca", label: "Busca", nota: null,
      status: "pendente",
      detalhe: "Sem auditoria — use Auditar Busca",
    };
  }
  const nota = clamp(40 + Math.min(25, n * 4));
  return {
    id: "busca", label: "Busca", nota,
    status: "atencao",
    detalhe: `${n} concorrente(s) mapeado(s) · sem auditoria de marca`,
  };
}

function scoreAds(input: ScorecardInput): CanalScore {
  const a = input.metaAds;
  if (a?.nota_interna?.nota != null) {
    const n = clamp(Number(a.nota_interna.nota));
    const qtd = a.ads_cliente_count ?? 0;
    const ativos = a.ads_ativos ?? 0;
    return {
      id: "ads",
      label: "Ads",
      nota: n,
      status: statusDeNota(n),
      detalhe: a.nota_interna.faixa
        ? `Meta · ${a.nota_interna.faixa} · ${qtd} ads (${ativos} ativos)`
        : `Meta Ad Library · ${qtd} ads`,
    };
  }
  if (a?.score?.total) {
    const n = clamp((100 * (a.score.ok ?? 0)) / a.score.total);
    return {
      id: "ads",
      label: "Ads",
      nota: n,
      status: statusDeNota(n),
      detalhe: `checklist ads ${a.score.ok}/${a.score.total}`,
    };
  }
  if (a?.erro) {
    return {
      id: "ads", label: "Ads", nota: null,
      status: "pendente",
      detalhe: "Configure META_ADLIB_TOKEN ou Auditar Ads",
    };
  }
  return {
    id: "ads", label: "Ads", nota: null,
    status: "pendente",
    detalhe: "Sem auditoria — use Auditar Ads",
  };
}

function scoreYoutube(input: ScorecardInput): CanalScore {
  const y = input.youtube;
  const hit = input.redes?.find((r) =>
    ["youtube", "youtu"].some((a) => r.rede?.toLowerCase().includes(a)),
  );
  const href = y?.canal?.url ?? hit?.url ?? null;

  if (y?.nota_interna?.nota != null) {
    const n = clamp(Number(y.nota_interna.nota));
    const handle = y.canal?.handle ? `@${y.canal.handle}` : "canal";
    const subs = y.canal?.inscritos != null
      ? `${Number(y.canal.inscritos).toLocaleString("pt-BR")} insc.`
      : null;
    return {
      id: "youtube",
      label: "YouTube",
      nota: n,
      status: statusDeNota(n),
      detalhe: [handle, subs, y.nota_interna.faixa].filter(Boolean).join(" · "),
      href,
    };
  }
  if (y?.score?.total) {
    const n = clamp((100 * (y.score.ok ?? 0)) / y.score.total);
    return {
      id: "youtube", label: "YouTube", nota: n,
      status: statusDeNota(n),
      detalhe: `checklist ${y.score.ok}/${y.score.total}`,
      href,
    };
  }
  if (y?.erro) {
    return {
      id: "youtube", label: "YouTube", nota: null,
      status: "pendente",
      detalhe: "Configure RAPIDAPI_KEY ou Auditar YouTube",
      href,
    };
  }
  // fallback: só link no site (comportamento antigo)
  return scoreRedeDetectada("youtube", "YouTube", input, ["youtube", "youtu"]);
}

function scoreTiktok(input: ScorecardInput): CanalScore {
  const t = input.tiktok;
  const hit = input.redes?.find((r) =>
    ["tiktok"].some((a) => r.rede?.toLowerCase().includes(a) || r.url?.toLowerCase().includes(a)),
  );
  const href = t?.perfil?.url ?? hit?.url ?? null;

  if (t?.nota_interna?.nota != null) {
    const n = clamp(Number(t.nota_interna.nota));
    const handle = t.perfil?.handle ? `@${t.perfil.handle}` : "perfil";
    const seg = t.perfil?.seguidores != null
      ? `${Number(t.perfil.seguidores).toLocaleString("pt-BR")} seg.`
      : null;
    return {
      id: "tiktok",
      label: "TikTok",
      nota: n,
      status: statusDeNota(n),
      detalhe: [handle, seg, t.nota_interna.faixa, t.gap_vs_concorrentes ? "gap vs conc." : null]
        .filter(Boolean)
        .join(" · "),
      href,
    };
  }
  if (t?.score?.total) {
    const n = clamp((100 * (t.score.ok ?? 0)) / t.score.total);
    return {
      id: "tiktok", label: "TikTok", nota: n,
      status: statusDeNota(n),
      detalhe: `checklist ${t.score.ok}/${t.score.total}`,
      href,
    };
  }
  if (t?.erro) {
    return {
      id: "tiktok", label: "TikTok", nota: null,
      status: "pendente",
      detalhe: "Configure RAPIDAPI_KEY ou Auditar TikTok",
      href,
    };
  }
  return scoreRedeDetectada("tiktok", "TikTok", input, ["tiktok"]);
}

function scoreReviews(input: ScorecardInput): CanalScore {
  const p = input.gmb?.perfil;
  const nps = input.gmb?.nps;
  const ra = input.gmb?.reclame_aqui;
  const alerta = input.gmb?.analise_mensagens?.alerta_reputacao;

  if (!p || (p.avaliacao == null && p.total_avaliacoes == null)) {
    if (ra?.encontrado) {
      const m = ra.metricas || {};
      let n = 45;
      if (m.nota != null) n = (Number(m.nota) / 10) * 70;
      if (m.taxa_resolucao != null) n += Math.min(20, Number(m.taxa_resolucao) / 5);
      if (alerta) n = Math.min(n, 40);
      const nota = clamp(n);
      return {
        id: "reviews", label: "Reviews", nota,
        status: statusDeNota(nota),
        detalhe: `Reclame Aqui${m.nota != null ? ` · nota ${m.nota}` : ""}`,
        href: "#gmb",
      };
    }
    return {
      id: "reviews", label: "Reviews", nota: null,
      status: input.gmb ? "atencao" : "pendente",
      detalhe: input.gmb ? "Sem dados de avaliação no GMB" : "Depende do GMB",
      href: "#gmb",
    };
  }

  const rating = Number(p.avaliacao ?? 0);
  const total = Number(p.total_avaliacoes ?? 0);
  let nota = (rating / 5) * 55;
  if (total >= 50) nota += 20;
  else if (total >= 20) nota += 15;
  else if (total >= 5) nota += 8;
  else if (total >= 1) nota += 3;

  // NPS (escala -100..100) → até +15
  if (nps?.nps != null) {
    nota += Math.max(0, Math.min(15, (Number(nps.nps) + 100) / 200 * 15));
  }

  // RA: nota/resolução até +15; alerta puxa para baixo
  if (ra?.encontrado && ra.metricas) {
    const m = ra.metricas;
    if (m.nota != null) nota += Math.min(8, (Number(m.nota) / 10) * 8);
    if (m.taxa_resolucao != null) nota += Math.min(7, Number(m.taxa_resolucao) / 100 * 7);
  }
  if (alerta) nota = Math.min(nota, 55);

  const n = clamp(nota);
  const bits: string[] = [];
  if (rating) bits.push(`${rating}★`);
  if (total) bits.push(`${total} Google`);
  if (nps?.nps != null) bits.push(`NPS ${nps.nps > 0 ? "+" : ""}${nps.nps}`);
  if (ra?.encontrado) bits.push("RA");
  return {
    id: "reviews", label: "Reviews", nota: n,
    status: statusDeNota(n),
    detalhe: bits.join(" · ") || "Reviews",
    href: "#gmb",
  };
}

function scoreIa(input: ScorecardInput): CanalScore {
  const a = input.aiVisibility;
  if (a?.nota_interna?.nota != null) {
    const n = clamp(Number(a.nota_interna.nota));
    const qtd = a.prompts?.length ?? 0;
    return {
      id: "ia",
      label: "IA / LLM",
      nota: n,
      status: statusDeNota(n),
      detalhe: a.nota_interna.faixa
        ? `LLM · ${a.nota_interna.faixa}${qtd ? ` · ${qtd} prompts` : ""}`
        : `visibilidade em IA${qtd ? ` · ${qtd} prompts` : ""}`,
    };
  }
  if (a?.score?.total) {
    const n = clamp((100 * (a.score.ok ?? 0)) / a.score.total);
    return {
      id: "ia",
      label: "IA / LLM",
      nota: n,
      status: statusDeNota(n),
      detalhe: `checklist IA ${a.score.ok}/${a.score.total}`,
    };
  }
  if (a?.erro) {
    return {
      id: "ia", label: "IA / LLM", nota: null,
      status: "pendente",
      detalhe: "Falha na auditoria — tente Auditar IA",
    };
  }
  return {
    id: "ia", label: "IA / LLM", nota: null,
    status: "pendente",
    detalhe: "Sem auditoria — use Auditar IA",
  };
}

export function sortCanaisPorNotaAsc<T extends { nota?: number | null; label?: string; id?: string }>(
  canais: T[],
): T[] {
  /** Piores primeiro; sem nota (pendente) sobe junto com o crítico. */
  return [...canais].sort((a, b) => {
    const na = a.nota == null ? -1 : a.nota;
    const nb = b.nota == null ? -1 : b.nota;
    if (na !== nb) return na - nb;
    return String(a.label || a.id || "").localeCompare(String(b.label || b.id || ""), "pt-BR");
  });
}

export function buildScorecard(input: ScorecardInput): {
  geral: number | null;
  canais: CanalScore[];
} {
  const canais: CanalScore[] = sortCanaisPorNotaAsc([
    scoreSite(input),
    scoreBusca(input),
    scoreGmb(input),
    scoreAds(input),
    scoreInstagram(input),
    scoreTiktok(input),
    scoreYoutube(input),
    scoreReviews(input),
    scoreIa(input),
  ]).filter((c) => {
    // Só entra o que foi auditado de verdade — pendente / em breve / erro nosso some
    if (c.status === "pendente" || c.status === "em_breve") return false;
    if (c.nota == null) return false;
    const d = (c.detalhe || "").toLowerCase();
    if (
      d.includes("configure")
      || d.includes("rapidapi")
      || d.includes("meta_adlib")
      || d.includes("sem auditoria")
      || d.includes("use auditar")
    ) return false;
    return true;
  });

  const comNota = canais.filter((c) => c.nota != null);
  const geral = comNota.length
    ? clamp(comNota.reduce((s, c) => s + (c.nota ?? 0), 0) / comNota.length)
    : null;

  return { geral, canais };
}
