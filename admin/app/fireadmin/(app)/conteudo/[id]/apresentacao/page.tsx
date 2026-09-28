import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { buildScorecard } from "@/lib/presenca-scorecard";
import { enriquecerComChapeus, ordenarPorFluxoAnalise } from "@/lib/seis-chapeus";
import { buildAchados, resumoOverview, enrichCanaisComPlano } from "@/lib/apresentacao-presenca";
import type { PlanoImpactoData } from "../ImpactoPanel";
import type { PercepcaoValorData } from "../PercepcaoPanel";
import type { PosicionamentoData } from "../PosicionamentoPanel";
import type { GmbData } from "../GmbPanel";
import type { TechSeoData } from "../TechSeoPanel";
import type { AiVisibilityData } from "../AiVisibilityPanel";
import type { AutoridadeBuscaData } from "../AutoridadeBuscaPanel";
import type { MetaAdsData } from "../MetaAdsPanel";
import type { YoutubeData } from "../YoutubePanel";
import type { InstagramData } from "../InstagramPanel";
import type { TiktokData } from "../TiktokPanel";
import type { BlogData } from "../BlogPanel";
import type { AudienciaIdealData } from "../AudienciaPanel";
import { extrairReputacao } from "@/lib/apresentacao-reputacao";
import { extrairEvolucao } from "@/lib/apresentacao-evolucao";
import { extrairProximaExecucao } from "@/lib/apresentacao-proxima-execucao";
import { extrairTeseTopo } from "@/lib/apresentacao-tese";
import { extrairMidiaComparativo } from "@/lib/apresentacao-midia-comparativo";
import type { ScorecardDelta, ScorecardSnapshot } from "@/lib/presenca-scorecard-delta";
import { asDisplayText } from "@/lib/text-field";
import { slimPresencaForUi } from "@/lib/presenca-slim";
import { loadPresencaMerged } from "@/lib/presenca-store";
import ApresentacaoLP from "../ApresentacaoLP";

export const dynamic = "force-dynamic";

function fmt(date?: string | null) {
  if (!date) return null;
  try {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return null;
  }
}

export default async function ApresentacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: analise } = await supabase
    .from("analises_web")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!analise) notFound();

  const { data: concorrentesWeb } = await supabase
    .from("concorrentes_web")
    .select("dominio, nome, tipo, aparicoes, ranqueia_para, fonte, status, fora_da_serp, porque")
    .eq("analise_web_id", id)
    .order("aparicoes", { ascending: false });

  const { data: pecasDb } = await supabase
    .from("pecas_conteudo")
    .select("id, tipo, status, titulo, plataforma, angulo, cunho, etapa_funil")
    .eq("analise_ref", id)
    .order("criado_em", { ascending: false })
    .limit(24);

  const diag = (analise.diagnostico ?? {}) as Record<string, unknown>;
  const presencaMerged = await loadPresencaMerged(
    supabase,
    id,
    (analise.presenca ?? {}) as Record<string, unknown>,
  );
  const urlsInternasCount = Array.isArray(presencaMerged.urls_internas)
    ? presencaMerged.urls_internas.length
    : typeof (presencaMerged.urls_internas as { count?: number } | undefined)?.count === "number"
      ? Number((presencaMerged.urls_internas as { count: number }).count)
      : 0;
  const presenca = slimPresencaForUi(presencaMerged) as {
    redes_sociais?: { rede: string; perfil?: string; url?: string }[];
    blog?: BlogData | null;
    google_meu_negocio?: GmbData | null;
    tech_seo?: TechSeoData | null;
    ai_visibility?: AiVisibilityData | null;
    autoridade_busca?: AutoridadeBuscaData | null;
    meta_ads?: MetaAdsData | null;
    youtube?: YoutubeData | null;
    instagram?: InstagramData | null;
    tiktok?: TiktokData | null;
    plano_impacto?: PlanoImpactoData | null;
    percepcao_valor?: PercepcaoValorData | null;
    posicionamento?: PosicionamentoData | null;
    audiencia_ideal?: AudienciaIdealData | null;
    urls_internas?: unknown[];
    _urls_internas_count?: number;
    scorecard_delta?: ScorecardDelta | null;
    scorecard_historico?: ScorecardSnapshot[] | null;
    scorecard_atual?: ScorecardSnapshot | null;
    midia_comparativo?: Record<string, unknown> | null;
  };

  let radarIg: {
    id?: string;
    handle?: string | null;
    seguidores?: number | null;
    taxa_engajamento?: number | null;
    qtd_posts?: number | null;
    status?: string | null;
    criado_em?: string | null;
  } | null = null;

  if (analise.cliente_handle) {
    const { data: radar } = await supabase
      .from("analises")
      .select("id, handle_auditado, seguidores, taxa_engajamento, qtd_posts, status_auditoria, criado_em")
      .eq("cliente_handle", analise.cliente_handle)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (radar) {
      radarIg = {
        id: radar.id,
        handle: radar.handle_auditado,
        seguidores: radar.seguidores,
        taxa_engajamento: radar.taxa_engajamento != null ? Number(radar.taxa_engajamento) : null,
        qtd_posts: radar.qtd_posts,
        status: radar.status_auditoria,
        criado_em: radar.criado_em,
      };
    }
  }

  const scorecard = buildScorecard({
    url: analise.url,
    redes: presenca.redes_sociais,
    blog: presenca.blog
      ? {
          tem_blog: presenca.blog.tem_blog,
          posts_encontrados: presenca.blog.posts_encontrados,
          url: presenca.blog.url ?? undefined,
        }
      : null,
    urlsInternasCount: presenca._urls_internas_count ?? urlsInternasCount,
    gmb: presenca.google_meu_negocio,
    techSeo: presenca.tech_seo,
    autoridadeBusca: presenca.autoridade_busca,
    metaAds: presenca.meta_ads,
    youtube: presenca.youtube,
    instagram: presenca.instagram,
    tiktok: presenca.tiktok,
    aiVisibility: presenca.ai_visibility,
    radarIg,
    clienteHandle: analise.cliente_handle,
  });

  const achadosRaw = buildAchados({
    tech_seo: presenca.tech_seo as never,
    google_meu_negocio: (presenca.google_meu_negocio as never) ?? null,
    autoridade_busca: (presenca.autoridade_busca as never) ?? null,
    ai_visibility: (presenca.ai_visibility as never) ?? null,
    meta_ads: (presenca.meta_ads as never) ?? null,
    instagram: (presenca.instagram as never) ?? null,
    tiktok: (presenca.tiktok as never) ?? null,
    youtube: (presenca.youtube as never) ?? null,
    blog: (presenca.blog as never) ?? null,
    percepcao_valor: (presenca.percepcao_valor as never) ?? null,
    radar_ig: radarIg,
  });

  const plano = presenca.plano_impacto ?? null;
  const insightsEnriched = enrichCanaisComPlano(achadosRaw.canais, plano);
  // Slides na ordem canônica da análise (Site→Busca→GMB→…→Percepção)
  const canaisOrdenados = ordenarPorFluxoAnalise(insightsEnriched);
  const canaisInsights = enriquecerComChapeus(canaisOrdenados, {
    percepcaoTom: presenca.percepcao_valor?.tom_visual_e_verbal ?? null,
    percepcaoGaps: (presenca.percepcao_valor?.o_que_corrigir || []).filter(Boolean) as string[],
  });
  const achados = { ...achadosRaw, canais: canaisInsights };
  const overview = resumoOverview(achados);
  const empresa =
    (diag.empresa as string) ||
    analise.dominio ||
    analise.url ||
    "Empresa";

  // Mídia real analisada — é a prova de que olhamos as contas, não um genérico.
  const igCliente = (presenca.instagram as unknown as {
    cliente?: { handle?: string; midia?: Record<string, unknown>[]; posts?: Record<string, unknown>[]; reels?: Record<string, unknown>[] };
  } | null)?.cliente;
  const ytRaw = presenca.youtube as unknown as {
    canal?: { handle?: string };
    videos?: Record<string, unknown>[];
  } | null;
  const ttRaw = presenca.tiktok as unknown as {
    perfil?: { handle?: string };
    videos?: Record<string, unknown>[];
  } | null;

  // Transcrições + análises cacheadas vivem em percepcao_valor.evidencias
  // (e às vezes no item da midia). Indexa por id e por code (IG usa code).
  const evid = (presenca.percepcao_valor as unknown as {
    evidencias?: {
      youtube_videos?: Record<string, unknown>[];
      instagram_videos?: Record<string, unknown>[];
      tiktok_videos?: Record<string, unknown>[];
    };
  } | null)?.evidencias;
  const transcricaoPorId = new Map<string, string>();
  const analisePorId = new Map<string, Record<string, unknown>>();
  const indexarEvid = (v: Record<string, unknown>) => {
    const keys = [v.id, v.code].filter(Boolean).map(String);
    for (const k of keys) {
      if (v.transcricao) transcricaoPorId.set(k, String(v.transcricao));
      if (v.analise_estrutura && typeof v.analise_estrutura === "object") {
        analisePorId.set(k, v.analise_estrutura as Record<string, unknown>);
      }
    }
  };
  for (const arr of [evid?.youtube_videos, evid?.instagram_videos, evid?.tiktok_videos]) {
    for (const v of arr ?? []) indexarEvid(v);
  }
  const transc = (...ids: (string | undefined | null)[]) => {
    for (const id of ids) {
      if (id && transcricaoPorId.has(String(id))) return transcricaoPorId.get(String(id))!;
    }
    return null;
  };
  const analiseCached = (...ids: (string | undefined | null)[]) => {
    for (const id of ids) {
      if (!id) continue;
      const fromMap = analisePorId.get(String(id));
      if (fromMap) return fromMap;
    }
    return null;
  };
  const midiaId = (x: Record<string, unknown>) =>
    String(x.id ?? x.code ?? "");

  const midia = {
    // midia = posts + reels consolidados (com thumbnail, likes e plays). Antes eu
    // pegava só .posts (1 item) e perdia os 12 reels — o grosso do conteúdo.
    instagram: ((igCliente?.midia ?? igCliente?.posts) ?? []).slice(0, 16).map((x) => {
      // IG: preferir code (shortcode do Reel) — é o que o webhook e as evidências usam.
      const code = x.code != null ? String(x.code) : null;
      const id = code || midiaId(x);
      const cached =
        (x.analise_estrutura as Record<string, unknown> | undefined) ??
        analiseCached(id, code, x.id != null ? String(x.id) : null);
      return {
        id,
        url:
          (x.url as string) ||
          (code ? `https://www.instagram.com/reel/${code}/` : undefined),
        legenda: (x.caption as string) ?? null,
        thumbnail: (x.thumbnail as string) ?? null,
        likes: (x.likes as number) ?? null,
        comentarios: (x.comments as number) ?? null,
        views: (x.plays as number) ?? null,
        tipo: (x.tipo as string) ?? null,
        transcricao: transc(id, code, x.id != null ? String(x.id) : null),
        analise: cached,
        rede: "instagram" as const,
      };
    }),
    youtube: (ytRaw?.videos ?? []).slice(0, 12).map((x) => {
      const id = midiaId(x);
      const cached =
        (x.analise_estrutura as Record<string, unknown> | undefined) ??
        analiseCached(id);
      return {
        id,
        url: x.url as string,
        titulo: (x.titulo as string) ?? null,
        thumbnail: (x.thumbnail as string) ?? null,
        views: (x.views as number) ?? null,
        tipo: (x.tipo as string) ?? null,
        transcricao: transc(id),
        analise: cached,
        rede: "youtube" as const,
      };
    }),
    tiktok: (ttRaw?.videos ?? []).slice(0, 12).map((x) => {
      const id = midiaId(x);
      const cached =
        (x.analise_estrutura as Record<string, unknown> | undefined) ??
        analiseCached(id);
      return {
        id,
        url: x.url as string,
        titulo: (x.titulo as string) ?? (x.descricao as string) ?? null,
        thumbnail: ((x.cover as string) ?? (x.thumbnail as string)) ?? null,
        views: (x.views as number) ?? (x.play_count as number) ?? null,
        likes: (x.likes as number) ?? null,
        transcricao: transc(id),
        analise: cached,
        rede: "tiktok" as const,
      };
    }),
    handles: {
      instagram: igCliente?.handle ?? null,
      youtube: ytRaw?.canal?.handle ?? null,
      tiktok: ttRaw?.perfil?.handle ?? null,
    },
  };

  // Concorrentes: diretos da SERP (tabela) + do Instagram (dados de engajamento).
  const igConcorrentes = (presenca.instagram as unknown as {
    concorrentes?: { handle?: string; nome?: string; engajamento?: { eng_proxy?: number }; perfil?: { seguidores?: number } }[];
    cliente?: { handle?: string; engajamento?: { eng_proxy?: number }; perfil?: { seguidores?: number } };
  } | null);
  const logoEmpresa =
    (presenca.instagram as unknown as { cliente?: { perfil?: { avatar?: string } } } | null)?.cliente?.perfil?.avatar ??
    (presenca.youtube as unknown as { canal?: { thumbnail?: string } } | null)?.canal?.thumbnail ??
    null;

  type EspFreq = {
    atual?: string | null;
    ideal?: string | null;
    justificativa?: string | null;
    cadencia_sugerida?: string | null;
  };

  type PerRaw = {
    ritmo?: string;
    detalhe?: string;
    leitura?: string;
    n_com_data?: number;
    posts_30d?: number;
    posts_7d?: number;
    posts_por_dia?: number;
    posts_por_semana?: number;
    span_dias?: number;
    periodo_inicio?: string;
    periodo_fim?: string;
    amostra_n?: number;
    ultimo_dias?: number;
    intervalo_mediano_dias?: number;
  };

  function stampsFromMidia(
    itens: Record<string, unknown>[] | undefined,
    campo: "taken_at" | "create_time" = "taken_at",
  ) {
    const out: number[] = [];
    for (const it of itens ?? []) {
      if (it.fixado) continue;
      const raw = it[campo] ?? it.taken_at;
      if (raw == null || typeof raw === "boolean") continue;
      const n = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isFinite(n) || n <= 0) continue;
      out.push(n > 10_000_000_000 ? Math.floor(n / 1000) : Math.floor(n));
    }
    if (!out.length) return [];
    const newest = Math.max(...out);
    const win = out.filter((ts) => newest - ts <= 35 * 86400);
    return win.length ? win : [newest];
  }

  function cadenciaFromStamps(stamps: number[], nFixados = 0) {
    if (!stamps.length) return null;
    const newest = Math.max(...stamps);
    const oldest = Math.min(...stamps);
    const dNew = new Date(newest * 1000);
    const dOld = new Date(oldest * 1000);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const spanDias = Math.max(
      1,
      Math.floor((Date.UTC(dNew.getUTCFullYear(), dNew.getUTCMonth(), dNew.getUTCDate())
        - Date.UTC(dOld.getUTCFullYear(), dOld.getUTCMonth(), dOld.getUTCDate())) / 86400000) + 1,
    );
    const n = stamps.length;
    const postsPorDia = Math.round((n / spanDias) * 100) / 100;
    const postsPorSemana = Math.round(postsPorDia * 7 * 100) / 100;
    let leitura =
      `No período (${spanDias} dias) tiveram ${n} peça(s) — ~${postsPorDia}/dia (~${postsPorSemana}/sem).`;
    if (nFixados > 0) leitura += ` ${nFixados} fixado(s) fora da conta.`;
    return {
      nComData: n,
      spanDias,
      periodoInicio: iso(dOld),
      periodoFim: iso(dNew),
      postsPorDia,
      postsPorSemana,
      leitura,
    };
  }

  /** Leitura leve de dias/horários (sem grade) — amostra, não verdade absoluta. */
  function timingFromStamps(stamps: number[]) {
    if (stamps.length < 2) return null;
    const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
    const FAIXAS = [
      { label: "manhã (6–12h)", ini: 6, fim: 12 },
      { label: "tarde (12–18h)", ini: 12, fim: 18 },
      { label: "noite (18–24h)", ini: 18, fim: 24 },
      { label: "madrugada (0–6h)", ini: 0, fim: 6 },
    ];
    const WD: Record<string, number> = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };
    const porDia = Array.from({ length: 7 }, () => 0);
    const porFaixa = Array.from({ length: FAIXAS.length }, () => 0);
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      weekday: "short",
      hour: "numeric",
      hourCycle: "h23",
    });
    for (const ts of stamps) {
      const parts = fmt.formatToParts(new Date(ts * 1000));
      const wd = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
      const hr = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
      porDia[WD[wd] ?? 0] += 1;
      const fi = FAIXAS.findIndex((f) => hr >= f.ini && hr < f.fim);
      if (fi >= 0) porFaixa[fi] += 1;
    }
    const diasAtivos = porDia
      .map((n, i) => ({ n, label: DIAS[i] }))
      .filter((d) => d.n > 0)
      .sort((a, b) => b.n - a.n);
    const picoDia = diasAtivos[0];
    let picoFi = 0;
    for (let i = 1; i < porFaixa.length; i++) if (porFaixa[i] > porFaixa[picoFi]) picoFi = i;
    const uteis = porDia[1] + porDia[2] + porDia[3] + porDia[4] + porDia[5];
    const fds = porDia[0] + porDia[6];
    let veredito: string;
    if (diasAtivos.length >= 4) {
      veredito = "Boa dispersão na semana — o algoritmo gosta de constância, não de um único dia.";
    } else if (diasAtivos.length <= 2 && stamps.length >= 5) {
      veredito = "Muito concentrado em poucos dias; espalhar a semana costuma estabilizar alcance.";
    } else if (fds > uteis && uteis > 0) {
      veredito = "Pesa no fim de semana; para serviço B2B, dias úteis (ter–qui) costumam converter melhor.";
    } else if (picoFi === 2) {
      veredito = "Noite (18–24h) é faixa forte no Brasil para consumo de Reels/TikTok — alinhado com o hábito.";
    } else if (picoFi === 1) {
      veredito = "Tarde (12–18h) costuma funcionar bem para pausa de almoço/trabalho — razoável.";
    } else {
      veredito = "Padrão ainda pouco definido na amostra; o que mais importa é não sumir por semanas.";
    }
    const diasTxt = diasAtivos.slice(0, 3).map((d) => d.label).join(", ");
    return (
      `Na amostra, aparece mais em ${diasTxt}` +
      (picoDia ? ` (pico: ${picoDia.label})` : "") +
      `, sobretudo de ${FAIXAS[picoFi].label}. ${veredito}`
    );
  }

  const PLAYBOOK: Record<string, { ideal: string; pratica: string }> = {
    instagram: {
      ideal: "3–5 Reels/semana com ritmo estável (melhor que 10 num dia e sumir)",
      pratica:
        "No Instagram orgânico para serviço, Reels carregam alcance. O algoritmo premia aparição regular: "
        + "sumir 2–3 semanas e voltar em rajada costuma piorar distribuição. "
        + "Terça–quinta e janelas de almoço/noite (Brasília) são referências comuns — use como hipótese, não regra.",
    },
    tiktok: {
      ideal: "4–7 vídeos/semana na fase de crescimento (qualidade mínima sustentável)",
      pratica:
        "TikTok é descoberta: precisa de volume testável de ganchos, sem cair em post diário vazio. "
        + "Séries e formatos repetíveis batem trend aleatório. Horário importa menos que frequência + retenção nos 3s.",
    },
    youtube: {
      ideal: "1 longo/semana ou 3–5 Shorts/semana — o que o time sustenta 90 dias",
      pratica:
        "YouTube treina o inscrito a voltar. Intervalo mediano >21 dias esfria o canal. "
        + "Shorts sustentam descoberta entre longs; título/thumb e CTA para site/WhatsApp fecham o ciclo.",
    },
  };

  function ritmoLabel(r?: string | null) {
    if (!r || r === "desconhecido") return "sem leitura";
    return r;
  }

  function julgamentoRitmo(ritmo?: string | null, idealPlay?: string) {
    if (ritmo === "ativo" || ritmo === "regular") {
      return `Ritmo ${ritmo}: dentro do aceitável. Meta de referência: ${idealPlay}.`;
    }
    if (ritmo === "irregular") {
      return `Ritmo irregular: tem publicação, mas com buracos. Meta de referência: ${idealPlay}.`;
    }
    if (ritmo === "parado") {
      return `Ritmo parado ou muito frio. Meta de referência: ${idealPlay}.`;
    }
    return `Ainda sem cadência clara nos dados. Meta de referência: ${idealPlay}.`;
  }

  function montarRede(opts: {
    id: string;
    label: string;
    per?: PerRaw | null;
    stamps?: number[];
    nFixados?: number;
    esp?: EspFreq | null;
    rivais?: {
      handle: string | null;
      ritmo?: string | null;
      volume?: string | null;
      timing?: string | null;
    }[];
    auditado: boolean;
  }) {
    const book = PLAYBOOK[opts.id];
    const cad = cadenciaFromStamps(opts.stamps ?? [], opts.nFixados ?? 0);
    const ritmo = opts.per?.ritmo ?? null;
    const volume =
      cad?.leitura
      ?? (opts.per?.posts_por_semana != null
        ? `~${opts.per.posts_por_semana}/semana` + (opts.per.detalhe ? ` · ${opts.per.detalhe}` : "")
        : (opts.per?.detalhe ?? opts.per?.leitura ?? null));
    const timing = timingFromStamps(opts.stamps ?? []);
    const esp = opts.esp;
    const ideal = esp?.ideal || book?.ideal || "definir cadência realista ao time";
    const fazendo = [
      esp?.atual ? `Especialista vê hoje: ${esp.atual}.` : null,
      volume,
      julgamentoRitmo(ritmo, ideal),
    ].filter(Boolean).join(" ");
    const melhorar = [
      esp?.justificativa,
      esp?.cadencia_sugerida ? `Próximo passo: ${esp.cadencia_sugerida}` : null,
      !esp?.cadencia_sugerida && ritmo && !["ativo", "regular"].includes(ritmo)
        ? `Subir para ${ideal}, com calendário fixo (mesmo que comece menor) e revisar em 30 dias.`
        : null,
      ritmo && ["ativo", "regular"].includes(ritmo)
        ? "Manter o ritmo e melhorar formato/gancho — frequência já não é o gargalo principal."
        : null,
    ].filter(Boolean).join(" ") || `Ajustar cadência em direção a: ${ideal}.`;

    return {
      id: opts.id,
      label: opts.label,
      ritmo: ritmoLabel(ritmo),
      ritmoRaw: ritmo,
      volume: volume,
      ideal,
      pratica: book?.pratica ?? "",
      fazendo,
      melhorar,
      timing,
      rivais: (opts.rivais ?? []).filter((r) => r.handle),
      auditado: opts.auditado,
    };
  }

  const igPer = (presenca.instagram as unknown as { cliente?: { periodicidade?: PerRaw } } | null)
    ?.cliente?.periodicidade;
  const igEsp = (presenca.instagram as unknown as { especialista?: { frequencia?: EspFreq } } | null)
    ?.especialista?.frequencia;
  const igCliMidia = (igCliente?.midia ?? [
    ...(igCliente?.posts ?? []),
    ...(igCliente?.reels ?? []),
  ]) as Record<string, unknown>[];
  const igStamps = stampsFromMidia(igCliMidia);
  const igFixados = igCliMidia.filter((m) => m.fixado).length;

  const igRivais = ((presenca.instagram as unknown as {
    concorrentes?: {
      handle?: string;
      midia?: Record<string, unknown>[];
      posts?: Record<string, unknown>[];
      reels?: Record<string, unknown>[];
      periodicidade?: PerRaw;
    }[];
  } | null)?.concorrentes ?? []).map((c) => {
    const mid = (c.midia ?? [...(c.posts ?? []), ...(c.reels ?? [])]) as Record<string, unknown>[];
    const st = stampsFromMidia(mid);
    const cad = cadenciaFromStamps(st);
    return {
      handle: c.handle ?? null,
      ritmo: c.periodicidade?.ritmo ?? null,
      volume: cad?.leitura ?? c.periodicidade?.detalhe ?? null,
      timing: timingFromStamps(st),
    };
  });

  const ttPer = (presenca.tiktok as unknown as {
    metricas?: { periodicidade?: PerRaw };
    especialista?: { frequencia?: EspFreq };
    videos?: Record<string, unknown>[];
    concorrentes?: {
      handle?: string;
      metricas?: { periodicidade?: PerRaw };
      videos?: Record<string, unknown>[];
    }[];
  } | null);
  const ttStamps = stampsFromMidia(ttPer?.videos, "create_time");
  const ttRivais = (ttPer?.concorrentes ?? []).map((c) => ({
    handle: c.handle ?? null,
    ritmo: c.metricas?.periodicidade?.ritmo ?? null,
    volume: c.metricas?.periodicidade?.detalhe
      ?? (c.metricas?.periodicidade?.posts_por_semana != null
        ? `~${c.metricas.periodicidade.posts_por_semana}/sem`
        : null),
    timing: timingFromStamps(stampsFromMidia(c.videos, "create_time")),
  }));

  const ytPer = (presenca.youtube as unknown as {
    metricas?: { videos?: { periodicidade?: PerRaw } };
    especialista?: { frequencia?: EspFreq };
  } | null);

  const redesFreq = [
    montarRede({
      id: "instagram",
      label: "Instagram",
      per: igPer,
      stamps: igStamps,
      nFixados: igFixados,
      esp: igEsp,
      rivais: igRivais,
      auditado: !!(igPer || igStamps.length),
    }),
    montarRede({
      id: "tiktok",
      label: "TikTok",
      per: ttPer?.metricas?.periodicidade,
      stamps: ttStamps,
      esp: ttPer?.especialista?.frequencia,
      rivais: ttRivais,
      auditado: !!(ttPer?.metricas?.periodicidade || ttStamps.length),
    }),
    montarRede({
      id: "youtube",
      label: "YouTube",
      per: ytPer?.metricas?.videos?.periodicidade,
      esp: ytPer?.especialista?.frequencia,
      rivais: [],
      auditado: !!ytPer?.metricas?.videos?.periodicidade,
    }),
  ];

  const igCad = cadenciaFromStamps(igStamps, igFixados);

  const frequencia = {
    redes: redesFreq,
    cliente: igPer || igStamps.length
      ? {
          ritmo: igPer?.ritmo ?? null,
          detalhe: igCad?.leitura ?? igPer?.detalhe ?? null,
          leitura: igCad?.leitura ?? null,
          posts30d: igPer?.posts_30d ?? null,
          postsPorDia: igCad?.postsPorDia ?? igPer?.posts_por_dia ?? null,
          nComData: igCad?.nComData ?? igPer?.n_com_data ?? null,
        }
      : null,
    rivais: igRivais,
  };

  const concorrentes = {
    diretos: (() => {
      const norm = (s: string) =>
        s
          .normalize("NFD")
          .replace(/\p{M}/gu, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, " ")
          .trim();

      type Direto = {
        dominio: string;
        nome: string | null;
        aparicoes: number;
        ranqueiaPara: string[];
        fonte?: string[];
        status?: string | null;
        porque?: string | null;
      };

      const byKey = new Map<string, Direto>();

      for (const c of concorrentesWeb ?? []) {
        if (c.tipo !== "concorrente") continue;
        const row = c as typeof c & {
          fonte?: string[] | null;
          status?: string | null;
          porque?: string | null;
        };
        if (row.status === "rejeitado") continue;
        const nome = (row.nome as string) || (row.dominio as string) || "";
        const dominio = (row.dominio as string) || "";
        // placeholder ia:slug → não exibir como domínio real
        const dominioVisivel =
          !dominio || dominio.startsWith("ia:") || dominio.startsWith("ads:")
            ? ""
            : dominio;
        const key = norm(nome || dominioVisivel);
        if (!key) continue;
        byKey.set(key, {
          dominio: dominioVisivel,
          nome: (row.nome as string) ?? null,
          aparicoes: (row.aparicoes as number) ?? 0,
          ranqueiaPara: (row.ranqueia_para as string[]) ?? [],
          fonte: Array.isArray(row.fonte) ? row.fonte : undefined,
          status: row.status ?? null,
          porque: row.porque ?? null,
        });
      }

      // Fallback / merge: rivais citados na auditoria de IA (mesmo sem sync)
      const aiConc =
        (presenca.ai_visibility as AiVisibilityData | null | undefined)?.concorrentes_citados ??
        [];
      for (const c of aiConc) {
        const nome = (c.nome || "").trim();
        if (!nome) continue;
        const key = norm(nome);
        if (!key) continue;
        const hit = byKey.get(key);
        if (hit) {
          const fontes = new Set([...(hit.fonte || []), "ia"]);
          hit.fonte = [...fontes];
          if (!hit.porque) {
            hit.porque = `Citado em respostas de IA (${c.aparicoes || 1}×)`;
          }
        } else {
          byKey.set(key, {
            dominio: c.dominio || "",
            nome,
            aparicoes: 0,
            ranqueiaPara: [],
            fonte: ["ia"],
            status: "sugerido",
            porque: `Citado em respostas de IA (${c.aparicoes || 1}×)`,
          });
        }
      }

      return [...byKey.values()].sort((a, b) => {
        const score = (x: Direto) =>
          (x.aparicoes || 0) * 10 + (x.fonte?.includes("ia") ? 3 : 0) + (x.fonte?.includes("ads") ? 2 : 0);
        return score(b) - score(a);
      });
    })(),
    portais: (concorrentesWeb ?? []).filter((c) => c.tipo === "portal").map((c) => (c.nome ?? c.dominio) as string),
    instagram: {
      cliente: igConcorrentes?.cliente
        ? { handle: igConcorrentes.cliente.handle ?? null,
            engajamento: igConcorrentes.cliente.engajamento?.eng_proxy ?? null,
            seguidores: igConcorrentes.cliente.perfil?.seguidores ?? null }
        : null,
      rivais: (igConcorrentes?.concorrentes ?? []).map((c) => ({
        handle: c.handle ?? null,
        nome: c.nome ?? null,
        engajamento: c.engajamento?.eng_proxy ?? null,
        seguidores: c.perfil?.seguidores ?? null,
      })),
    },
  };

  const pos = (presenca as { posicionamento?: PosicionamentoData | null }).posicionamento ?? null;
  const posicionamento = pos && !pos.erro
    ? {
        resumo: pos.resumo ?? null,
        cliente: pos.cliente
          ? {
              instagram_bio: pos.cliente.instagram_bio ?? null,
              site_title: pos.cliente.site_title ?? null,
              angulo: pos.cliente.angulo ?? null,
              leitura: pos.cliente.leitura ?? null,
            }
          : null,
        concorrentes: (pos.concorrentes || []).map((c) => ({
          nome: c.nome,
          angulo: c.angulo ?? null,
          instagram_bio: c.instagram_bio ?? null,
          diferenca_vs_cliente: c.diferenca_vs_cliente ?? null,
          forca_copy: c.forca_copy ?? null,
        })),
        matriz: pos.matriz
          ? {
              gap_cliente: pos.matriz.gap_cliente ?? null,
              oportunidade: pos.matriz.oportunidade ?? null,
              promessas: pos.matriz.promessas ?? [],
              ctas_dominantes: pos.matriz.ctas_dominantes ?? [],
            }
          : undefined,
        recomendacoes: pos.recomendacoes ?? undefined,
      }
    : null;

  const reputacao = extrairReputacao(presenca.google_meu_negocio);

  const audienciaRaw = presenca.audiencia_ideal;
  const audiencia = audienciaRaw && !audienciaRaw.erro && (audienciaRaw.resumo || audienciaRaw.ideais?.length)
    ? {
        resumo: audienciaRaw.resumo ?? null,
        icp_declarado: audienciaRaw.icp_declarado ?? null,
        icp_real: audienciaRaw.icp_real_inferido ?? null,
        gap: audienciaRaw.gap_declarado_vs_real ?? null,
        ideais: (audienciaRaw.ideais ?? []).slice(0, 3).map((p) => ({
          nome: p.nome_persona ?? null,
          por_que: p.por_que_ideal ?? null,
          dores: (p.dores ?? []).slice(0, 4),
          o_que_converte: (p.o_que_converte ?? []).slice(0, 3),
          como_falar: asDisplayText(
            p.como_falar?.tom
              ?? p.como_falar?.exemplo_mensagem
              ?? p.como_falar
              ?? null,
          ) || null,
        })),
        evitar: (audienciaRaw.evitar ?? []).slice(0, 3).map((p) => ({
          nome: p.nome_persona ?? null,
          porque: p.porque_evitar ?? null,
          como_filtrar: p.como_filtrar ?? null,
        })),
        pilares: (audienciaRaw.implicacoes_conteudo?.pilares_priorizar ?? []).slice(0, 5),
        ctas: (audienciaRaw.implicacoes_conteudo?.ctas_recomendados ?? []).slice(0, 4),
      }
    : null;

  const evolucao = extrairEvolucao({
    delta: presenca.scorecard_delta ?? null,
    historico: Array.isArray(presenca.scorecard_historico) ? presenca.scorecard_historico : null,
    atual: presenca.scorecard_atual ?? {
      em: new Date().toISOString(),
      geral: scorecard.geral,
      canais: Object.fromEntries(
        scorecard.canais
          .filter((c) => c.nota != null)
          .map((c) => [c.id, c.nota as number]),
      ),
    },
  });

  const proximaExecucao = extrairProximaExecucao({
    movimentos: plano?.movimentos ?? null,
    canaisScore: scorecard.canais,
    canaisInsights: achados.canais,
    percepcao: (() => {
      const p = presenca.percepcao_valor as PercepcaoValorData | null | undefined;
      if (!p) return null;
      return {
        o_que_reforcar: (p.o_que_reforcar ?? []).filter(Boolean) as string[],
        o_que_corrigir: (p.o_que_corrigir ?? []).filter(Boolean) as string[],
        pitch_agencia: p.pitch_agencia ?? null,
      };
    })(),
    pecas: (pecasDb ?? []).map((p) => ({
      id: p.id,
      tipo: p.tipo,
      status: p.status,
      titulo: p.titulo,
      plataforma: p.plataforma,
      angulo: p.angulo,
      cunho: p.cunho,
      etapa_funil: p.etapa_funil,
    })),
    frequenciaRedes: frequencia.redes,
  });

  const teseTopo = extrairTeseTopo({
    tese: plano?.tese ?? null,
    gancho: plano?.narrativa_comercial?.gancho_reuniao ?? null,
    situacao: plano?.diagnostico_executivo?.situacao ?? null,
    movimentos: plano?.movimentos ?? null,
    concorrenteTopo:
      concorrentes.diretos[0]?.nome
      || concorrentes.diretos[0]?.dominio
      || concorrentes.instagram.rivais[0]?.nome
      || concorrentes.instagram.rivais[0]?.handle
      || null,
    criticos: overview.criticos ?? null,
  });

  const midiaComparativo = extrairMidiaComparativo(
    (presenca.midia_comparativo as Record<string, unknown> | null | undefined)
    ?? null,
  );

  return (
    <ApresentacaoLP
      data={{
        analiseId: id,
        empresa,
        url: analise.url,
        nicho: (diag.nicho as string) || null,
        oferta: (diag.oferta as string) || null,
        geradoEm: fmt(plano?.atualizado_em || plano?.gerado_em || analise.criado_em),
        scoreGeral: scorecard.geral,
        canaisScore: scorecard.canais,
        overview,
        canaisInsights: achados.canais,
        acertos: achados.acertos,
        erros: achados.erros,
        evolucao,
        proximaExecucao,
        teseTopo,
        midiaComparativo,
        plano,
        percepcao: (() => {
          const p = presenca.percepcao_valor as PercepcaoValorData | null | undefined;
          if (!p) return null;
          return {
            produto_declarado: p.produto_declarado ?? null,
            produto_percebido: p.produto_percebido ?? null,
            percepcao_real_marca: p.percepcao_real_marca ?? null,
            tom_visual_e_verbal: p.tom_visual_e_verbal ?? null,
            percepcao_em_ia: p.percepcao_em_ia ?? null,
            ia_cita_marca: p.ia_cita_marca ?? null,
            o_que_reforcar: p.o_que_reforcar ?? [],
            o_que_corrigir: p.o_que_corrigir ?? [],
            pitch_agencia: p.pitch_agencia ?? null,
          };
        })(),
        posicionamento,
        reputacao,
        audiencia,
        midia,
        concorrentes,
        logo: logoEmpresa,
        frequencia,
      }}
    />
  );
}
