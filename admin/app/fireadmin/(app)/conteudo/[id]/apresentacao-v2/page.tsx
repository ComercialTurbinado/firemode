import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { buildScorecard } from "@/lib/presenca-scorecard";
import { extrairReputacao } from "@/lib/apresentacao-reputacao";
import { buildAchados, enrichCanaisComPlano } from "@/lib/apresentacao-presenca";
import { buildRelatorioV2 } from "@/lib/relatorio-v2";
import type { PlanoImpactoData } from "../ImpactoPanel";
import type { GmbData } from "../GmbPanel";
import type { TechSeoData } from "../TechSeoPanel";
import type { AiVisibilityData } from "../AiVisibilityPanel";
import type { AutoridadeBuscaData } from "../AutoridadeBuscaPanel";
import type { MetaAdsData } from "../MetaAdsPanel";
import type { YoutubeData } from "../YoutubePanel";
import type { InstagramData } from "../InstagramPanel";
import type { TiktokData } from "../TiktokPanel";
import type { BlogData } from "../BlogPanel";
import { slimPresencaForUi } from "@/lib/presenca-slim";
import { loadPresencaMerged } from "@/lib/presenca-store";
import ReportV2 from "./ReportV2";

export const dynamic = "force-dynamic";

type PresencaV2 = {
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
  percepcao_valor?: Record<string, unknown> | null;
  radar_ig?: Record<string, unknown> | null;
  urls_internas?: unknown[];
  _urls_internas_count?: number;
};

function isInvalidLlmsTxt(tech: TechSeoData | null | undefined) {
  const llms = tech?.ai_prep?.llms_txt;
  if (!llms?.ok) return false;
  const sample = String(llms.sample || "").trim().toLowerCase();
  return sample.startsWith("<!doctype")
    || sample.startsWith("<html")
    || Number(llms.bytes || 0) > 200_000;
}

export default async function ApresentacaoV2Page({
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

  const [{ data: concorrentes }, { data: pecas }] = await Promise.all([
    supabase
      .from("concorrentes_web")
      .select("dominio,nome,tipo,aparicoes,status")
      .eq("analise_web_id", id)
      .order("aparicoes", { ascending: false }),
    supabase
      .from("pecas_conteudo")
      .select("titulo,plataforma,etapa_funil,status,angulo,criado_em")
      .eq("analise_ref", id)
      .order("criado_em", { ascending: false })
      .limit(24),
  ]);

  const diagnostico = (analise.diagnostico || {}) as Record<string, unknown>;
  const presencaMerged = await loadPresencaMerged(
    supabase,
    id,
    (analise.presenca || {}) as Record<string, unknown>,
  );
  const urlsInternasCount = Array.isArray(presencaMerged.urls_internas)
    ? (presencaMerged.urls_internas as unknown[]).length
    : typeof (presencaMerged.urls_internas as { count?: number } | undefined)?.count === "number"
      ? Number((presencaMerged.urls_internas as { count: number }).count)
      : 0;
  const presenca = slimPresencaForUi(presencaMerged) as PresencaV2;
  const metaAds = presenca.meta_ads;
  const metaAdsActive = Boolean(
    Number(metaAds?.ads_ativos || 0) > 0
    || Number(metaAds?.ads_cliente_count || 0) > 0
    || (metaAds?.ads_cliente?.length || 0) > 0,
  );

  const scorecard = buildScorecard({
    url: analise.url,
    redes: presenca.redes_sociais,
    blog: presenca.blog
      ? {
          tem_blog: presenca.blog.tem_blog,
          posts_encontrados: presenca.blog.posts_encontrados,
          url: presenca.blog.url || undefined,
        }
      : null,
    urlsInternasCount: Number(presenca._urls_internas_count ?? urlsInternasCount),
    gmb: presenca.google_meu_negocio,
    techSeo: presenca.tech_seo,
    autoridadeBusca: presenca.autoridade_busca,
    metaAds: presenca.meta_ads,
    youtube: presenca.youtube,
    instagram: presenca.instagram,
    tiktok: presenca.tiktok,
    aiVisibility: presenca.ai_visibility,
    clienteHandle: analise.cliente_handle,
  });

  const reputationCollectionError = Boolean(
    presenca.google_meu_negocio?.reclame_aqui?.erro
    || presenca.google_meu_negocio?.reclame_aqui?.pagina_ok === false,
  );
  const qualityNotes: string[] = [];
  if (reputationCollectionError) qualityNotes.push("Reclame Aqui precisa de nova coleta antes da publicação.");
  if (isInvalidLlmsTxt(presenca.tech_seo)) qualityNotes.push("llms.txt retornou HTML ou tamanho incompatível e foi desconsiderado.");

  const company = String(
    diagnostico.empresa
    || analise.dominio
    || analise.url
    || "Empresa",
  );

  const rawFindings = buildAchados({
    tech_seo: presenca.tech_seo as never,
    google_meu_negocio: presenca.google_meu_negocio as never,
    autoridade_busca: presenca.autoridade_busca as never,
    ai_visibility: presenca.ai_visibility as never,
    meta_ads: presenca.meta_ads as never,
    instagram: presenca.instagram as never,
    tiktok: presenca.tiktok as never,
    youtube: presenca.youtube as never,
    blog: presenca.blog as never,
    percepcao_valor: presenca.percepcao_valor as never,
    radar_ig: presenca.radar_ig as never,
  });
  const channelInsights = enrichCanaisComPlano(
    rawFindings.canais,
    presenca.plano_impacto || null,
  );

  const report = buildRelatorioV2({
    id,
    company,
    url: analise.url,
    niche: typeof diagnostico.nicho === "string" ? diagnostico.nicho : null,
    generatedAt: presenca.plano_impacto?.atualizado_em
      || presenca.plano_impacto?.gerado_em
      || analise.criado_em,
    scoreOverall: scorecard.geral,
    channels: scorecard.canais,
    plan: presenca.plano_impacto || null,
    reputation: extrairReputacao(presenca.google_meu_negocio),
    reputationCollectionError,
    metaAdsActive,
    competitors: concorrentes || [],
    content: pecas || [],
    qualityNotes,
    channelInsights,
  });

  return <ReportV2 data={report} />;
}
