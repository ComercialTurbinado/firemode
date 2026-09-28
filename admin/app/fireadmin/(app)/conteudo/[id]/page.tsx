import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase";
import { Card } from "@/components/AdminForm";
import { sortCanaisPorNotaAsc, type CanalScore, type CanalStatus } from "@/lib/presenca-scorecard";
import { buildTrilhaConteudo } from "@/lib/trilha-conteudo";
import { asDisplayText } from "@/lib/text-field";
import { slimPecaForUi, slimPresencaFlags } from "@/lib/presenca-slim";
import type { ScorecardDelta, ScorecardSnapshot } from "@/lib/presenca-scorecard-delta";
import LazyPresencaCanal from "./LazyPresencaCanal";
import PecasTabs from "./PecasTabs";
import GmbPanel from "./GmbPanel";
import TechSeoPanel from "./TechSeoPanel";
import AiVisibilityPanel from "./AiVisibilityPanel";
import AutoridadeBuscaPanel from "./AutoridadeBuscaPanel";
import MetaAdsPanel from "./MetaAdsPanel";
import YoutubePanel from "./YoutubePanel";
import InstagramPanel from "./InstagramPanel";
import TiktokPanel from "./TiktokPanel";
import BlogPanel from "./BlogPanel";
import ApresentacaoInteressesPanel from "./ApresentacaoInteressesPanel";
import ConcorrentesEditor from "./ConcorrentesEditor";
import ScorecardPresenca from "./ScorecardPresenca";
import ScorecardDeltaPanel from "./ScorecardDeltaPanel";
import AutoPresencaFill from "./AutoPresencaFill";
import PosicionamentoPanel from "./PosicionamentoPanel";
import AudienciaPanel from "./AudienciaPanel";
import ImpactoPanel from "./ImpactoPanel";
import PercepcaoPanel from "./PercepcaoPanel";
import PresencaPipelineButton from "./PresencaPipelineButton";

export const dynamic = "force-dynamic";

const SCORE_LABEL: Record<string, string> = {
  site: "Site",
  busca: "Busca",
  gmb: "GMB",
  ads: "Ads",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  reviews: "Reviews",
  ia: "IA / LLM",
};

function statusDeNota(n: number | null | undefined): CanalStatus {
  if (n == null) return "pendente";
  if (n >= 75) return "ok";
  if (n >= 50) return "atencao";
  return "critico";
}

function scorecardFromMeta(
  meta: Record<string, unknown>,
  opts?: { radarBackendUrl?: string | null; clienteHandle?: string | null },
): { geral: number | null; canais: CanalScore[] } {
  const snap = meta.scorecard_atual as
    | { geral?: number | null; canais?: Record<string, number | null> }
    | null
    | undefined;
  if (!snap?.canais || typeof snap.canais !== "object") {
    return { geral: null, canais: [] };
  }
  const canais: CanalScore[] = sortCanaisPorNotaAsc(
    Object.entries(snap.canais).map(([id, nota]) => ({
      id,
      label: SCORE_LABEL[id] || id,
      nota: typeof nota === "number" ? nota : null,
      status: statusDeNota(typeof nota === "number" ? nota : null),
      detalhe: "snapshot da última auditoria",
      href:
        id === "instagram" && opts?.clienteHandle && opts.radarBackendUrl
          ? `${opts.radarBackendUrl.replace(/\/$/, "")}/analises?handle=${opts.clienteHandle}`
          : null,
    })),
  ).filter((c) => c.nota != null);
  return {
    geral: typeof snap.geral === "number" ? snap.geral : null,
    canais,
  };
}

function fmt(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontWeight: 600, fontSize: 11, color: "var(--fm-muted)",
    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
  }}>
    {children}
  </p>
);

const SectionTitle = ({ children, sub }: { children: React.ReactNode; sub?: string }) => (
  <div style={{ marginBottom: 14 }}>
    <h2 style={{ fontWeight: 700, fontSize: 14 }}>{children}</h2>
    {sub ? <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 4 }}>{sub}</p> : null}
  </div>
);

export default async function AnaliseWebDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: analise }, { data: concorrentes }, { data: pautas }, { data: pecas }] =
    await Promise.all([
      supabase.from("analises_web").select("*").eq("id", id).maybeSingle(),
      supabase.from("concorrentes_web").select("*").eq("analise_web_id", id).order("aparicoes", { ascending: false }),
      supabase.from("pautas_seo").select("*").eq("analise_web_id", id).order("prioridade"),
      supabase
        .from("pecas_conteudo")
        .select(
          "id, tipo, status, titulo, palavra_chave, plataforma, angulo, cunho, etapa_funil, artigo_ref, lote_id, validacao, payload, criado_em",
        )
        .eq("analise_ref", id)
        .order("criado_em"),
    ]);

  if (!analise) notFound();

  const pecasSlim = (pecas ?? []).map((p) => slimPecaForUi(p));

  const diag = (analise.diagnostico ?? {}) as Record<string, unknown>;
  // Só meta leve — payloads completos vêm sob demanda via LazyPresencaCanal
  const meta = (analise.presenca ?? {}) as Record<string, unknown>;
  const urlsStub = meta.urls_internas as { count?: number; _canal?: boolean } | unknown[] | undefined;
  const urlsInternasCount = Array.isArray(urlsStub)
    ? urlsStub.length
    : typeof urlsStub?.count === "number"
      ? urlsStub.count
      : 0;
  const blogStub = meta.blog as {
    tem_blog?: boolean;
    posts_encontrados?: number;
    url?: string;
    cobertura?: string;
    qualidade?: { seo?: { nota?: number; faixa?: string }; amostra_n?: number; tom?: { personalidade?: unknown } };
  } | null;

  const diretos = (concorrentes ?? []).filter((c) => c.tipo === "concorrente");
  const portais = (concorrentes ?? []).filter((c) => c.tipo === "portal");

  const scorecard = scorecardFromMeta(meta, {
    radarBackendUrl: process.env.RADAR_BACKEND_URL ?? null,
    clienteHandle: analise.cliente_handle,
  });

  const camposDiag = (["nicho", "oferta", "publico_alvo", "tom_de_voz"] as const)
    .map((k) => ({
      key: k,
      label: k.replace(/_/g, " "),
      value: asDisplayText(diag[k]),
    }))
    .filter((c) => c.value);

  // Trilha usa só stubs/meta — painéis carregam o detalhe depois
  const trilha = buildTrilhaConteudo(diag as Record<string, unknown>, {
    tech_seo: meta.tech_seo as never,
    google_meu_negocio: meta.google_meu_negocio as never,
    autoridade_busca: meta.autoridade_busca as never,
    meta_ads: meta.meta_ads as never,
    instagram: meta.instagram as never,
    youtube: meta.youtube as never,
    tiktok: meta.tiktok as never,
    blog: blogStub as never,
    plano_impacto: meta.plano_impacto as never,
    percepcao_valor: meta.percepcao_valor as never,
  });

  const uso = (analise.etapas as {
    uso?: {
      custo_usd?: number;
      custo_llm_usd?: number;
      custo_apis_usd?: number;
      tokens_total?: number;
      por_modelo?: Record<string, { custo_usd: number }>;
      apis?: {
        consultas?: number;
        custo_usd?: number;
        por_provedor?: Record<string, { consultas?: number; custo_usd?: number }>;
        precos?: { rapidapi_por_consulta?: number; rapidapi_ref?: string };
      };
    };
  } | null)?.uso;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1100 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <Link href="/fireadmin/conteudo" style={{ color: "var(--fm-muted)", fontSize: 13, textDecoration: "none" }}>
            ← Conteúdo
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 8 }}>
            {(diag.empresa as string) ?? analise.dominio ?? analise.url}
          </h1>
          <p style={{ color: "var(--fm-muted)", marginTop: 4, fontSize: 13 }}>
            <a href={analise.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--fm-accent)", textDecoration: "none" }}>
              {analise.url} ↗
            </a>
            {analise.cliente_handle ? ` · cliente @${analise.cliente_handle}` : ""} · {fmt(analise.criado_em)}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link
              href={`/fireadmin/conteudo/${id}/apresentacao-v2`}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid color-mix(in srgb, var(--fm-accent) 45%, var(--fm-border))",
                background: "var(--fm-accent-soft)",
                color: "var(--fm-accent)",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              Testar relatório V2
            </Link>
            <Link
              href={`/fireadmin/conteudo/${id}/apresentacao`}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid var(--fm-border)",
                background: "var(--fm-accent)",
                color: "#fff",
                fontWeight: 650,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              Abrir apresentação
            </Link>
            <Link
              href={`/fireadmin/conteudo/${id}/apresentacao?print=1`}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid var(--fm-border)",
                background: "var(--fm-surface)",
                color: "var(--fm-text)",
                fontWeight: 650,
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              Salvar PDF
            </Link>
          </div>
          <PresencaPipelineButton
            analiseId={id}
            url={analise.url}
            clienteHandle={analise.cliente_handle}
          />
        </div>
      </div>

      <AutoPresencaFill
        analiseId={id}
        presenca={slimPresencaFlags(meta)}
      />

      <div id="scorecard" style={{ scrollMarginTop: 24 }}>
        <ScorecardPresenca geral={scorecard.geral} canais={scorecard.canais} />
      </div>

      <div id="evolucao" style={{ scrollMarginTop: 24 }}>
        <ScorecardDeltaPanel
          delta={(meta.scorecard_delta as ScorecardDelta | null) ?? null}
          historico={(meta.scorecard_historico as ScorecardSnapshot[] | null) ?? null}
        />
      </div>

      {/* 1. Negócio e base do site */}
      <div id="site" className="conteudo-dash" style={{ scrollMarginTop: 24 }}>
        {/* Diagnóstico — coluna esquerda, span 2 rows */}
        <Card className="conteudo-dash-diag" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <SectionTitle>Diagnóstico</SectionTitle>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            flex: 1,
          }}>
            {camposDiag.map((c) => (
              <div key={c.key} style={{ minWidth: 0 }}>
                <Label>{c.label}</Label>
                <p style={{ fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{c.value}</p>
              </div>
            ))}
            {Array.isArray(diag.palavras_chave) && (
              <div style={{ gridColumn: "1 / -1" }}>
                <Label>Palavras-chave</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(diag.palavras_chave as string[]).map((k, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 12, background: "var(--fm-inset)", border: "1px solid var(--fm-border)",
                        padding: "2px 9px", borderRadius: 20,
                      }}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Custo — canto superior direito */}
        <Card style={{ display: "flex", flexDirection: "column" }}>
          <SectionTitle>Custo de geração</SectionTitle>
          {uso ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{
                  background: "var(--fm-inset)", borderRadius: 8, padding: "12px 14px",
                  border: "1px solid var(--fm-border)",
                }}>
                  <p style={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                    US$ {uso.custo_usd?.toFixed(4)}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 4 }}>custo total</p>
                </div>
                <div style={{
                  background: "var(--fm-inset)", borderRadius: 8, padding: "12px 14px",
                  border: "1px solid var(--fm-border)",
                }}>
                  <p style={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                    {uso.tokens_total?.toLocaleString("pt-BR") ?? "—"}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 4 }}>tokens</p>
                </div>
              </div>
              {uso.por_modelo && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Label>Por modelo</Label>
                  {Object.entries(uso.por_modelo).map(([m, v]) => (
                    <div
                      key={m}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        fontSize: 12, padding: "6px 0",
                        borderBottom: "1px solid var(--fm-border)",
                      }}
                    >
                      <span style={{ color: "var(--fm-muted)" }}>{m}</span>
                      <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                        US$ {v.custo_usd.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {(uso.custo_llm_usd != null || uso.custo_apis_usd != null || uso.apis) && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Label>Quebra</Label>
                  {uso.custo_llm_usd != null && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "var(--fm-muted)" }}>LLM</span>
                      <span style={{ fontWeight: 600 }}>US$ {uso.custo_llm_usd.toFixed(4)}</span>
                    </div>
                  )}
                  {uso.custo_apis_usd != null && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "var(--fm-muted)" }}>
                        APIs{uso.apis?.consultas != null ? ` (${uso.apis.consultas} consultas)` : ""}
                      </span>
                      <span style={{ fontWeight: 600 }}>US$ {uso.custo_apis_usd.toFixed(4)}</span>
                    </div>
                  )}
                  {uso.apis?.por_provedor && Object.entries(uso.apis.por_provedor).map(([p, v]) => (
                    <div key={p} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, paddingLeft: 8 }}>
                      <span style={{ color: "var(--fm-muted)" }}>{p} · {v.consultas ?? 0}×</span>
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>US$ {(v.custo_usd ?? 0).toFixed(4)}</span>
                    </div>
                  ))}
                  {uso.apis?.precos?.rapidapi_ref && (
                    <p style={{ fontSize: 10, color: "var(--fm-muted)", marginTop: 4 }}>
                      RapidAPI: {uso.apis.precos.rapidapi_ref}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: "var(--fm-muted)", fontSize: 13 }}>Sem dados de custo.</p>
          )}
        </Card>

        {/* Presença — canto inferior direito */}
        <Card style={{ display: "flex", flexDirection: "column" }}>
          <SectionTitle>Presença digital</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, flex: 1 }}>
            <div>
              <Label>Redes sociais</Label>
              {Array.isArray(meta.redes_sociais) && (meta.redes_sociais as { rede: string; perfil?: string }[]).length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(meta.redes_sociais as { rede: string; perfil?: string }[]).map((r, i) => (
                    <p key={i} style={{ fontSize: 13 }}>
                      <b>{r.rede}</b>
                      {r.perfil ? <span style={{ color: "var(--fm-muted)" }}> @{r.perfil}</span> : null}
                    </p>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--fm-muted)", fontSize: 13 }}>nenhuma detectada</p>
              )}
            </div>
            <div>
              <Label>Blog</Label>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>
                {blogStub?.tem_blog ? (
                  <>
                    Sim · {(blogStub.posts_encontrados ?? 0).toLocaleString("pt-BR")} posts
                    {urlsInternasCount > 0 ? (
                      <span style={{ color: "var(--fm-muted)" }}> · {urlsInternasCount} URLs</span>
                    ) : null}
                    {blogStub.url ? (
                      <span style={{ display: "block", color: "var(--fm-muted)", fontSize: 12, marginTop: 4, wordBreak: "break-all" }}>
                        {blogStub.url}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span style={{ color: "var(--fm-muted)" }}>não encontrado</span>
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Canais — carregados sob demanda (presenca_canais) */}
      <div id="tech-seo" style={{ scrollMarginTop: 24 }}>
        <LazyPresencaCanal analiseId={id} chave="tech_seo" Panel={TechSeoPanel} />
      </div>
      <div id="busca" style={{ scrollMarginTop: 24 }}>
        <LazyPresencaCanal analiseId={id} chave="autoridade_busca" Panel={AutoridadeBuscaPanel} />
      </div>
      <div id="ia" style={{ scrollMarginTop: 24 }}>
        <LazyPresencaCanal analiseId={id} chave="ai_visibility" Panel={AiVisibilityPanel} />
      </div>
      <div id="gmb" style={{ scrollMarginTop: 24 }}>
        <LazyPresencaCanal analiseId={id} chave="google_meu_negocio" Panel={GmbPanel} />
      </div>
      <div id="blog" style={{ scrollMarginTop: 24 }}>
        <LazyPresencaCanal analiseId={id} chave="blog" Panel={BlogPanel} />
      </div>
      <div id="ads" style={{ scrollMarginTop: 24 }}>
        <LazyPresencaCanal analiseId={id} chave="meta_ads" Panel={MetaAdsPanel} />
      </div>
      <div id="instagram" style={{ scrollMarginTop: 24 }}>
        <LazyPresencaCanal analiseId={id} chave="instagram" Panel={InstagramPanel} />
      </div>
      <div id="tiktok" style={{ scrollMarginTop: 24 }}>
        <LazyPresencaCanal analiseId={id} chave="tiktok" Panel={TiktokPanel} />
      </div>
      <div id="youtube" style={{ scrollMarginTop: 24 }}>
        <LazyPresencaCanal analiseId={id} chave="youtube" Panel={YoutubePanel} />
      </div>

      {/* 3. Mercado e mensagem */}
      <div id="concorrentes" style={{ scrollMarginTop: 24 }}>
        <Card>
          <SectionTitle sub="SERP + sugestões de IA e Meta Ads. Confirme rivais pra usar no IG, TikTok, Ads e posicionamento.">
            Concorrentes
          </SectionTitle>
          <ConcorrentesEditor
            analiseId={id}
            iniciais={diretos.map((c) => {
              const row = c as typeof c & {
                fonte?: string[] | null;
                status?: string | null;
                porque?: string | null;
                meta_extra?: {
                  aparicoes_ia?: number;
                  aparicoes_ads?: number;
                  page_name?: string;
                } | null;
              };
              return {
                id: row.id,
                nome: row.nome,
                dominio: row.dominio,
                aparicoes: row.aparicoes,
                tipo: row.tipo,
                fora_da_serp: row.fora_da_serp,
                fonte: row.fonte ?? null,
                status: row.status ?? null,
                porque: row.porque ?? null,
                meta_extra: row.meta_extra ?? null,
              };
            })}
          />
          {portais.length > 0 && (
            <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 14 }}>
              Portais (não concorrentes): {portais.map((p) => p.nome ?? p.dominio).join(", ")}
            </p>
          )}
        </Card>
      </div>

      <div id="posicionamento" style={{ scrollMarginTop: 24 }}>
        <LazyPresencaCanal analiseId={id} chave="posicionamento" Panel={PosicionamentoPanel} />
      </div>

      <div id="audiencia" style={{ scrollMarginTop: 24 }}>
        <LazyPresencaCanal analiseId={id} chave="audiencia_ideal" Panel={AudienciaPanel} />
      </div>

      <div id="percepcao" style={{ scrollMarginTop: 24 }}>
        <LazyPresencaCanal analiseId={id} chave="percepcao_valor" Panel={PercepcaoPanel} />
      </div>

      {/* 4. Síntese e execução */}
      <div id="impacto" style={{ scrollMarginTop: 24 }}>
        <LazyPresencaCanal analiseId={id} chave="plano_impacto" Panel={ImpactoPanel} />
      </div>

      <div id="interesses-apresentacao" style={{ scrollMarginTop: 24 }}>
        <ApresentacaoInteressesPanel analiseId={id} />
      </div>

      {/* Conteúdo por tipo */}
      <div id="pecas" style={{ scrollMarginTop: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Conteúdo gerado</h2>
        <Suspense fallback={<div style={{ color: "var(--fm-muted)", fontSize: 13 }}>Carregando…</div>}>
          <PecasTabs
            analiseId={id}
            clienteHandle={analise.cliente_handle}
            trilha={trilha}
            pecas={pecasSlim.map((p) => ({
              id: p.id,
              tipo: p.tipo,
              status: p.status,
              titulo: p.titulo,
              palavra_chave: p.palavra_chave,
              plataforma: p.plataforma,
              angulo: p.angulo,
              cunho: p.cunho ?? null,
              etapa_funil: p.etapa_funil ?? null,
              artigo_ref: p.artigo_ref ?? null,
              lote_id: p.lote_id ?? null,
              payload: (p.payload ?? {}) as Record<string, unknown>,
              validacao: p.validacao as { aprovado?: boolean; resumo?: string; palavras?: number } | null,
            }))}
            pautas={(pautas ?? []).map((p) => ({
              id: p.id,
              titulo: p.titulo,
              palavra_chave: p.palavra_chave,
              intencao: p.intencao,
              dificuldade: p.dificuldade,
              prioridade: p.prioridade,
              lacuna: p.lacuna,
              status: p.status,
              cliente_handle: p.cliente_handle,
            }))}
          />
        </Suspense>
      </div>

      {/* Responsivo: empilha no mobile */}
      <style>{`
        .conteudo-dash {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(280px, 1fr);
          grid-template-rows: auto auto;
          gap: 16px;
          align-items: stretch;
        }
        .conteudo-dash-diag {
          grid-row: 1 / 3;
        }
        @media (max-width: 800px) {
          .conteudo-dash {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
          }
          .conteudo-dash-diag {
            grid-row: auto;
          }
        }
      `}</style>
    </div>
  );
}
