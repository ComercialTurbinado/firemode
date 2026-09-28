"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Reveal, Medidor, BarrasCanais, GradeMidia, Contador, type ItemMidia } from "./LPKit";
import { TextoComGlossario } from "./TermoHint";
import PagespeedPresenca from "./PagespeedPresenca";
import type { PagespeedLite } from "./PagespeedPresenca";
import {
  montarPlano71530,
  textoTravando,
  textoVisaoPosAjuste,
  totalAcoesPlano,
  type AcaoComPrazo,
  type Plano71530,
} from "@/lib/canal-diagnostico";
import { useApresentacaoInteresses } from "./useApresentacaoInteresses";
import { BotaoQueroResolver, StickyInteressesBar, CtaPropostaFinal } from "./ApresentacaoCta";
import BotaoSalvarPdf from "./BotaoSalvarPdf";
import { evidenciaDoMovimento } from "@/lib/apresentacao-plano-evidencia";
import {
  corDelta,
  fmtDelta,
  labelCanalScore,
  type EvolucaoLP,
} from "@/lib/apresentacao-evolucao";
import type { ProximaExecucaoLP } from "@/lib/apresentacao-proxima-execucao";
import type { MidiaComparativoLP, PecaAnalisadaLP } from "@/lib/apresentacao-midia-comparativo";
import { asDisplayText } from "@/lib/text-field";

type CanalLike = { id?: string; label: string; nota: number | null; status?: string; detalhe?: string };
type AchadoLike = { canalLabel?: string; label: string; detalhe?: string; impacto?: string; esforco?: string };
type AcaoCanal = { titulo: string; como?: string; porque?: string; esforco?: string; impacto?: string; prazo?: string };
type CanalInsight = {
  id: string; label: string; nota: number | null; faixa?: string | null;
  resumo?: string | null; prioridade?: string | null;
  status: "auditado" | "pendente" | "parcial";
  listaAcertos: AchadoLike[]; listaErros: AchadoLike[]; oQueFazer: AcaoCanal[];
  pagespeed?: PagespeedLite | null;
  especialista?: import("@/lib/especialista").EspecialistaBloco | null;
};

export type LPData = {
  analiseId?: string;
  empresa: string;
  url: string;
  nicho?: string | null;
  oferta?: string | null;
  geradoEm?: string | null;
  scoreGeral: number | null;
  canaisScore: CanalLike[];
  overview: {
    media: number | null;
    canaisAuditados: number;
    canaisPendentes: number;
    totalAcertos: number;
    totalErros: number;
    criticos: string[];
    fortes?: string[];
  };
  acertos: AchadoLike[];
  erros: AchadoLike[];
  /** Diagnóstico rico por canal: nota + acertos + erros + o que fazer. */
  canaisInsights?: CanalInsight[];
  /** Percepção de valor (declarado × feed × IA). */
  percepcao?: {
    produto_declarado?: string | null;
    produto_percebido?: string | null;
    percepcao_real_marca?: string | null;
    tom_visual_e_verbal?: string | null;
    percepcao_em_ia?: string | null;
    ia_cita_marca?: string | null;
    o_que_reforcar?: string[];
    o_que_corrigir?: string[];
    pitch_agencia?: string | null;
  } | null;
  /** Frase-tese âncora no topo (do plano de impacto). */
  teseTopo?: string | null;
  plano?: {
    tese?: string;
    movimentos?: {
      ordem?: number;
      titulo?: string;
      gap?: string;
      evidencia?: string;
      consequencia?: string;
      acao_principal?: string;
      kpi?: string;
      esforco?: string;
      impacto?: string;
      canal?: string;
      canais_cruzados?: string[];
    }[];
  } | null;
  midia: {
    instagram: ItemMidia[];
    youtube: ItemMidia[];
    tiktok: ItemMidia[];
    handles?: { instagram?: string | null; youtube?: string | null; tiktok?: string | null };
  };
  concorrentes?: {
    diretos: {
      dominio: string;
      nome: string | null;
      aparicoes: number;
      ranqueiaPara: string[];
      fonte?: string[];
      status?: string | null;
      porque?: string | null;
    }[];
    portais: string[];
    instagram: {
      cliente: { handle: string | null; engajamento: number | null; seguidores: number | null } | null;
      rivais: { handle: string | null; nome: string | null; engajamento: number | null; seguidores: number | null }[];
    };
  };
  posicionamento?: {
    resumo?: string | null;
    cliente?: {
      instagram_bio?: string | null;
      site_title?: string | null;
      angulo?: string | null;
      leitura?: string | null;
    } | null;
    concorrentes?: {
      nome?: string;
      angulo?: string | null;
      instagram_bio?: string | null;
      diferenca_vs_cliente?: string | null;
      forca_copy?: string | null;
    }[];
    matriz?: {
      gap_cliente?: string | null;
      oportunidade?: string | null;
      promessas?: string[];
      ctas_dominantes?: string[];
    };
    recomendacoes?: {
      bio_instagram?: { atual?: string | null; sugerida?: string | null; porque?: string | null };
      headline_site?: { atual?: string | null; sugerida?: string | null; porque?: string | null };
      cta_principal?: { atual?: string | null; sugerida?: string | null; porque?: string | null };
    };
  } | null;
  /** Reputação: GMB + NPS + Reclame Aqui + voz do cliente. */
  reputacao?: import("@/lib/apresentacao-reputacao").ReputacaoLP | null;
  /** Evolução do scorecard (delta + janelas 7/15/30) quando houver histórico. */
  evolucao?: EvolucaoLP | null;
  /** Ponte diagnóstico → conteúdo: canal dominante + próximas peças. */
  proximaExecucao?: ProximaExecucaoLP | null;
  /** Conteúdo analisado (transcrição+legenda) cliente × rivais. */
  midiaComparativo?: MidiaComparativoLP | null;
  /** Audiência ideal (ICP personas). */
  audiencia?: {
    resumo?: string | null;
    icp_declarado?: string | null;
    icp_real?: string | null;
    gap?: string | null;
    ideais?: {
      nome?: string | null;
      por_que?: string | null;
      dores?: string[];
      o_que_converte?: string[];
      como_falar?: string | null;
    }[];
    evitar?: {
      nome?: string | null;
      porque?: string | null;
      como_filtrar?: string | null;
    }[];
    pilares?: string[];
    ctas?: string[];
  } | null;
  logo?: string | null;
  frequencia?: {
    redes?: RedeFreq[];
    cliente: {
      ritmo: string | null;
      detalhe: string | null;
      posts30d: number | null;
      posts7d?: number | null;
      postsPorDia?: number | null;
      postsPorSemana?: number | null;
      spanDias?: number | null;
      periodoInicio?: string | null;
      periodoFim?: string | null;
      amostraN?: number | null;
      nComData?: number | null;
      leitura?: string | null;
    } | null;
    rivais: {
      handle: string | null;
      ritmo?: string | null;
      volume?: string | null;
      timing?: string | null;
      detalhe?: string | null;
      posts30d?: number | null;
    }[];
  };
};

type RedeFreq = {
  id: string;
  label: string;
  ritmo: string;
  ritmoRaw?: string | null;
  volume: string | null;
  ideal: string;
  pratica: string;
  fazendo: string;
  melhorar: string;
  timing: string | null;
  rivais: {
    handle: string | null;
    ritmo?: string | null;
    volume?: string | null;
    timing?: string | null;
  }[];
  auditado: boolean;
};

/* ---------------------------------------------------------------- blocos */

const Secao = ({
  id, tag, titulo, sub, children,
}: {
  id?: string; tag?: string; titulo: string; sub?: string; children: React.ReactNode;
}) => (
  <section id={id} style={{ padding: "56px 0", borderTop: "1px solid var(--fm-border)" }}>
    <Reveal>
      {tag ? (
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "var(--fm-accent)", marginBottom: 10,
        }}>
          {tag}
        </p>
      ) : null}
      <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
        {titulo}
      </h2>
      {sub ? (
        <p style={{ color: "var(--fm-muted)", fontSize: 15, marginTop: 10, maxWidth: 640, lineHeight: 1.6 }}>
          {sub}
        </p>
      ) : null}
    </Reveal>
    <div style={{ marginTop: 28 }}>{children}</div>
  </section>
);

const Metrica = ({ valor, label, cor }: { valor: number; label: string; cor?: string }) => (
  <div style={{
    background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
    borderRadius: 12, padding: "18px 20px", flex: "1 1 140px",
  }}>
    <p style={{ fontSize: 30, fontWeight: 800, color: cor ?? "var(--fm-text)", lineHeight: 1 }}>
      <Contador para={valor} />
    </p>
    <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 6 }}>{label}</p>
  </div>
);

/* ---------------------------------------------------------------- LP */

export default function ApresentacaoLP({ data }: { data: LPData }) {
  const { overview, midia } = data;
  const nota = data.scoreGeral ?? overview.media ?? 0;
  const criticos = overview.criticos ?? [];
  const temMidia = midia.instagram.length + midia.youtube.length + midia.tiktok.length > 0;
  const [videoAberto, setVideoAberto] = useState<ItemMidia | null>(null);
  const interesses = useApresentacaoInteresses(data.analiseId);

  const todosCanais = (data.canaisInsights || [])
    .filter((c) => c.status !== "pendente")
    .map((c) => ({ id: c.id, label: c.label }));

  function scrollProposta() {
    document.getElementById("proposta")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ?print=1 → abre diálogo de salvar PDF com o visual da LP
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("print") !== "1") return;
    const prevTitle = document.title;
    if (data.empresa) {
      document.title = `${data.empresa} — Presença Digital · Firemode`;
    }
    document.documentElement.classList.add("fm-printing");
    const t = window.setTimeout(() => {
      window.print();
      document.documentElement.classList.remove("fm-printing");
      document.title = prevTitle;
      const url = new URL(window.location.href);
      url.searchParams.delete("print");
      window.history.replaceState({}, "", url.pathname + url.hash);
    }, 900);
    return () => window.clearTimeout(t);
  }, [data.empresa]);

  return (
    <div
      className="fm-print-root"
      style={{
      maxWidth: 900,
      margin: "0 auto",
      padding: interesses.marcados.length ? "0 20px 110px" : "0 20px 80px",
    }}>

      {/* ---------------------------------------------------- capa */}
      <header style={{ padding: "64px 0 8px" }}>
        <Reveal y={16}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}>
            <p style={{ fontSize: 12, color: "var(--fm-muted)", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
              Diagnóstico de presença digital
            </p>
            <BotaoSalvarPdf analiseId={data.analiseId} empresa={data.empresa} variant="ghost" />
          </div>
          <h1 style={{
            fontSize: 46, fontWeight: 800, letterSpacing: "-0.035em",
            lineHeight: 1.05, marginTop: 12,
          }}>
            {data.empresa}
          </h1>
          {data.teseTopo ? (
            <p style={{
              fontSize: 18, fontWeight: 550, lineHeight: 1.45,
              marginTop: 18, maxWidth: 640,
              color: "var(--fm-text)",
              borderLeft: "3px solid var(--fm-accent)",
              paddingLeft: 14,
            }}>
              {data.teseTopo}
            </p>
          ) : null}
          <p style={{ color: "var(--fm-muted)", fontSize: 14, marginTop: data.teseTopo ? 16 : 12 }}>
            <a href={data.url} target="_blank" rel="noopener noreferrer"
               style={{ color: "var(--fm-accent)", textDecoration: "none" }}>
              {data.url} ↗
            </a>
            {data.nicho ? ` · ${data.nicho}` : ""}
            {data.geradoEm ? ` · ${data.geradoEm}` : ""}
          </p>
        </Reveal>
      </header>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm 10mm;
          }
          html.fm-printing,
          html.fm-printing body {
            background: var(--fm-bg, #fff) !important;
          }
          .fm-no-print {
            display: none !important;
          }
          /* Layout admin → página limpa */
          .flex.min-h-screen {
            display: block !important;
          }
          main {
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            width: 100% !important;
          }
          /* Framer: tudo revelado no PDF */
          .fm-reveal {
            opacity: 1 !important;
            transform: none !important;
          }
          .fm-medidor-arco {
            stroke-dashoffset: var(--fm-medidor-final, 0) !important;
          }
          .fm-barra {
            width: var(--fm-barra-w, 50%) !important;
          }
          /* Evita cortes feios */
          .fm-print-root {
            max-width: 100% !important;
            padding: 0 8px 24px !important;
          }
          a {
            color: inherit !important;
            text-decoration: none !important;
          }
        }
      `}</style>

      {/* ---------------------------------------------------- onde estamos */}
      <Secao
        id="onde-estamos"
        tag="Onde estamos"
        titulo="O retrato de hoje, medido — não achismo"
        sub={`Auditamos ${overview.canaisAuditados} canais da ${data.empresa} com dados públicos e reais: site, busca, Google, redes, anúncios e o que a IA responde. Cada nota saiu de verificação — não de opinião.`}
      >
        <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
          <Reveal>
            <Medidor nota={nota} label="presença geral" />
          </Reveal>
          <div style={{ flex: "1 1 320px", display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Metrica valor={overview.canaisAuditados} label="canais auditados" />
            <Metrica valor={overview.totalAcertos} label="pontos que já funcionam" cor="var(--fm-green)" />
            <Metrica valor={overview.totalErros} label="pontos a corrigir" cor="var(--fm-yellow)" />
            <Metrica valor={criticos.length} label="canais críticos" cor="var(--fm-red)" />
          </div>
        </div>

        {criticos.length > 0 && (
          <Reveal delay={0.15}>
            <div style={{
              marginTop: 24, padding: "16px 20px", borderRadius: 12,
              background: "var(--fm-surface)", borderLeft: "3px solid var(--fm-red)",
            }}>
              <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                <b>Atenção imediata:</b> {criticos.join(" · ")} — são os canais onde
                a distância para os concorrentes é maior e o retorno de arrumar é mais rápido.
              </p>
            </div>
          </Reveal>
        )}
      </Secao>

      {/* ---------------------------------------------------- o que veremos */}
      <Secao
        id="caminho"
        tag="O que você vai ver"
        titulo="O caminho desta análise"
        sub="Do retrato à prova, da rivalidade à mensagem, da evidência ao plano — e o que fechar primeiro."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {([
            {
              n: "01",
              t: "Retrato medido",
              d: "Nota geral e canais críticos — o mapa antes da opinião.",
              href: "#onde-estamos",
              show: true,
            },
            {
              n: "01b",
              t: "Evolução",
              d: "O que subiu ou caiu desde a última medição (7 / 15 / 30 dias).",
              href: "#evolucao",
              show: Boolean(data.evolucao),
            },
            {
              n: "02",
              t: "Prova e reputação",
              d: "GMB, NPS, Reclame Aqui e a voz real do cliente.",
              href: "#reputacao",
              show: Boolean(data.reputacao),
            },
            {
              n: "03",
              t: "Quem disputa você",
              d: "Rivais no Google, IA, ads e engajamento nas redes.",
              href: "#concorrentes",
              show: Boolean(data.concorrentes?.diretos.length || data.concorrentes?.instagram.rivais.length),
            },
            {
              n: "04",
              t: "Mensagem e audiência",
              d: "O que a marca diz hoje × para quem deveria falar.",
              href: data.posicionamento ? "#posicionamento" : "#audiencia",
              show: Boolean(data.posicionamento || data.audiencia),
            },
            {
              n: "05",
              t: "Evidência viva",
              d: "Canais, ritmo, posts/vídeos reais e percepção de valor.",
              href: data.midiaComparativo ? "#conteudo-vs-rivais" : "#diagnostico",
              show: Boolean(
                data.canaisInsights?.some((c) => c.status !== "pendente")
                || temMidia
                || data.percepcao
                || data.midiaComparativo,
              ),
            },
            {
              n: "06",
              t: "Plano e próximo passo",
              d: "Três movimentos prioritários e o que resolver primeiro.",
              href: data.plano?.movimentos?.length ? "#plano" : "#proposta",
              show: true,
            },
            {
              n: "07",
              t: "Próxima execução",
              d: "1 canal dominante e as próximas peças da trilha.",
              href: "#execucao",
              show: Boolean(data.proximaExecucao),
            },
          ] as const).filter((p) => p.show).map((p, i) => (
            <Reveal key={p.href + p.t} delay={i * 0.08}>
              <a
                href={p.href}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(p.href.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                style={{
                  display: "block", height: "100%", textDecoration: "none", color: "inherit",
                  background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                  borderRadius: 12, padding: "18px 16px",
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 800, color: "var(--fm-accent)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p style={{ fontWeight: 700, fontSize: 14, marginTop: 8 }}>{p.t}</p>
                <p style={{ fontSize: 12.5, color: "var(--fm-muted)", marginTop: 6, lineHeight: 1.55 }}>{p.d}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </Secao>

      {/* ---------------------------------------------------- canais */}
      <Secao
        id="canais"
        tag="Diagnóstico"
        titulo="Nota por canal"
        sub="Quanto mais curta a barra, maior a oportunidade parada ali."
      >
        <Reveal>
          <div style={{
            background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
            borderRadius: 12, padding: "24px 20px",
          }}>
            <BarrasCanais itens={data.canaisScore.map((c) => ({ label: c.label, nota: c.nota }))} />
          </div>
        </Reveal>
      </Secao>

      {/* ---------------------------------------------------- evolução scorecard */}
      {data.evolucao ? (
        <SecaoEvolucao data={data.evolucao} />
      ) : null}

      {/* ---------------------------------------------------- reputação / GMB / RA / NPS */}
      {data.reputacao ? (
        <SecaoReputacao data={data.reputacao} />
      ) : null}

      {/* ---------------------------------------------------- concorrentes */}
      {(data.concorrentes?.diretos.length || data.concorrentes?.instagram.rivais.length) ? (
        <Secao
          id="concorrentes"
          tag="A concorrência"
          titulo="Quem disputa seus clientes — e onde"
          sub="Estas empresas disputam seus clientes no Google, nas respostas de IA e nos anúncios. Saber quem são — e como a mensagem de cada uma se compara à sua — é o mapa antes da copy."
        >
          {data.concorrentes.diretos.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {data.concorrentes.diretos.map((c, i) => (
                <Reveal key={`${c.nome ?? c.dominio}-${i}`} delay={i * 0.08}>
                  <div style={{
                    background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                    borderRadius: 12, padding: "14px 18px",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap",
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{c.nome ?? c.dominio}</p>
                      {c.dominio ? (
                        <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 2 }}>{c.dominio}</p>
                      ) : c.porque ? (
                        <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 2 }}>{c.porque}</p>
                      ) : null}
                      {c.ranqueiaPara.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                          {c.ranqueiaPara.slice(0, 3).map((k, j) => (
                            <span key={j} style={{
                              fontSize: 11, background: "var(--fm-inset, #0d0d0d)",
                              border: "1px solid var(--fm-border)", padding: "2px 9px", borderRadius: 20,
                            }}>{k}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                      {c.aparicoes > 0 && (
                        <span style={{
                          fontSize: 12, fontWeight: 700, color: "var(--fm-red)",
                          background: "color-mix(in srgb, var(--fm-red) 12%, transparent)",
                          padding: "4px 12px", borderRadius: 20, whiteSpace: "nowrap",
                        }}>
                          ranqueia em {c.aparicoes} {c.aparicoes === 1 ? "busca" : "buscas"}
                        </span>
                      )}
                      {c.fonte?.includes("ia") ? (
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: "#a78bfa",
                          background: "color-mix(in srgb, #a78bfa 12%, transparent)",
                          padding: "4px 10px", borderRadius: 20,
                        }}>
                          citado na IA
                        </span>
                      ) : null}
                      {c.fonte?.includes("ads") ? (
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: "#ec4899",
                          background: "color-mix(in srgb, #ec4899 12%, transparent)",
                          padding: "4px 10px", borderRadius: 20,
                        }}>
                          anuncia
                        </span>
                      ) : null}
                      {c.fonte?.includes("serp") && c.aparicoes === 0 ? (
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: "var(--fm-muted)",
                          padding: "4px 10px", borderRadius: 20,
                        }}>
                          SERP
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Reveal>
              ))}
              {data.concorrentes.portais.length > 0 && (
                <Reveal>
                  <p style={{ fontSize: 12, color: "var(--fm-muted)" }}>
                    Também aparecem (portais, não concorrentes diretos): {data.concorrentes.portais.join(" · ")}
                  </p>
                </Reveal>
              )}
            </div>
          )}

          {/* comparativo de engajamento no Instagram — onde o gráfico brilha */}
          {data.concorrentes.instagram.cliente && data.concorrentes.instagram.rivais.length > 0 && (
            <Reveal>
              <div style={{
                background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                borderRadius: 12, padding: "20px",
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
                  Engajamento no Instagram vs. concorrentes
                </p>
                <BarrasEngajamento
                  cliente={data.concorrentes.instagram.cliente}
                  rivais={data.concorrentes.instagram.rivais}
                />
              </div>
            </Reveal>
          )}
        </Secao>
      ) : null}

      {/* ---------------------------------------------------- posicionamento copy */}
      {data.posicionamento && (data.posicionamento.resumo || data.posicionamento.recomendacoes) ? (
        <Secao
          id="posicionamento"
          tag="Posicionamento"
          titulo="Bio, headlines e CTAs — quem está na frente e o que mudar"
          sub="Não é só quem ranqueia. É o que cada marca promete na bio, no title do site e nos anúncios — e a copy pronta pra você ocupar o espaço."
        >
          {data.posicionamento.resumo ? (
            <Reveal>
              <p style={{
                fontSize: 16, lineHeight: 1.55, fontWeight: 550, marginBottom: 20,
                padding: "16px 18px",
                background: "var(--fm-surface)", border: "1px solid var(--fm-border)", borderRadius: 12,
              }}>
                {data.posicionamento.resumo}
              </p>
            </Reveal>
          ) : null}

          {(data.posicionamento.matriz?.gap_cliente || data.posicionamento.matriz?.oportunidade) ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <Reveal>
                <div style={{
                  background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                  borderRadius: 12, padding: "16px 18px",
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-red)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Seu gap de mensagem
                  </p>
                  <p style={{ fontSize: 14, marginTop: 8, lineHeight: 1.55 }}>
                    {data.posicionamento.matriz?.gap_cliente || "—"}
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.06}>
                <div style={{
                  background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                  borderRadius: 12, padding: "16px 18px",
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-green)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Oportunidade
                  </p>
                  <p style={{ fontSize: 14, marginTop: 8, lineHeight: 1.55 }}>
                    {data.posicionamento.matriz?.oportunidade || "—"}
                  </p>
                </div>
              </Reveal>
            </div>
          ) : null}

          {!!data.posicionamento.concorrentes?.length && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Ângulo de cada rival
              </p>
              {data.posicionamento.concorrentes.map((c, i) => (
                <Reveal key={c.nome || i} delay={Math.min(i * 0.05, 0.25)}>
                  <div style={{
                    background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                    borderRadius: 12, padding: "14px 18px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{c.nome}</p>
                      {c.angulo ? (
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: "var(--fm-accent)",
                          background: "var(--fm-accent-soft)", padding: "2px 10px", borderRadius: 20,
                        }}>
                          {c.angulo}
                        </span>
                      ) : null}
                    </div>
                    {c.instagram_bio ? (
                      <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 6, lineHeight: 1.45 }}>
                        Bio: {c.instagram_bio}
                      </p>
                    ) : null}
                    {c.diferenca_vs_cliente ? (
                      <p style={{ fontSize: 13.5, marginTop: 8, lineHeight: 1.5 }}>{c.diferenca_vs_cliente}</p>
                    ) : null}
                    {c.forca_copy ? (
                      <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 6 }}>Força deles: {c.forca_copy}</p>
                    ) : null}
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          {data.posicionamento.recomendacoes && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                Copy sugerida pra você
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {([
                  ["bio_instagram", "Bio do Instagram"],
                  ["headline_site", "Headline / title do site"],
                  ["cta_principal", "CTA principal"],
                ] as const).map(([key, label], i) => {
                  const r = data.posicionamento?.recomendacoes?.[key];
                  if (!r?.sugerida) return null;
                  return (
                    <Reveal key={key} delay={i * 0.06}>
                      <div style={{
                        background: "color-mix(in srgb, var(--fm-green) 6%, var(--fm-surface))",
                        border: "1px solid color-mix(in srgb, var(--fm-green) 30%, var(--fm-border))",
                        borderRadius: 12, padding: "16px 18px",
                      }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-green)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {label}
                        </p>
                        {r.atual ? (
                          <p style={{
                            fontSize: 12, color: "var(--fm-muted)", marginTop: 8, lineHeight: 1.45,
                            textDecoration: "line-through",
                          }}>
                            {r.atual}
                          </p>
                        ) : null}
                        <p style={{ fontSize: 16, fontWeight: 650, marginTop: 8, lineHeight: 1.45 }}>
                          {r.sugerida}
                        </p>
                        {r.porque ? (
                          <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 8, lineHeight: 1.45 }}>{r.porque}</p>
                        ) : null}
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          )}
        </Secao>
      ) : null}

      {/* ---------------------------------------------------- audiência / ICP */}
      {data.audiencia ? (
        <SecaoAudiencia data={data.audiencia} />
      ) : null}

      {/* ---------------------------------------------------- diagnóstico por canal */}
      {data.canaisInsights && data.canaisInsights.length > 0 && (
        <Secao
          id="diagnostico"
          tag="Diagnóstico canal a canal"
          titulo="O que está acontecendo em cada frente"
          sub="Para cada canal: a nota, o que já funciona, o que trava e — o mais importante — exatamente o que fazer para corrigir."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {data.canaisInsights
              .filter((c) => c.status !== "pendente")
              .map((c, i) => (
                <Reveal key={c.id} delay={Math.min(i * 0.05, 0.3)}>
                  <CanalDetalhe
                    canal={c}
                    marcado={interesses.ids.has(c.id)}
                    onToggleResolver={() => void interesses.toggle({ id: c.id, label: c.label })}
                    loadingToggle={interesses.loading}
                    reputacao={c.id === "gmb" ? data.reputacao ?? null : null}
                  />
                </Reveal>
              ))}
          </div>
        </Secao>
      )}

      {/* ---------------------------------------------------- frequência */}
      {(data.frequencia?.redes?.some((r) => r.auditado) || data.frequencia?.cliente) && (
        <Secao
          id="frequencia"
          tag="Ritmo de publicação"
          titulo="Com que frequência você posta — e eles"
          sub="Overview das redes auditadas: o que a prática recomenda, o que vocês estão fazendo, o que melhorar — e um olhar leve nos dias/horários da amostra (sem fingir precisão de calendário)."
        >
          <Reveal>
            <FrequenciaBloco frequencia={data.frequencia!} />
          </Reveal>
        </Secao>
      )}

      {/* ---------------------------------------------------- mídia analisada */}
      {temMidia && (
        <Secao
          id="midia"
          tag="Peça a peça"
          titulo="O que já foi publicado — acertou, errou e o que muda"
          sub="Clique em cada peça para ver a leitura: o que funcionou, o que ficou fraco e o que ajustar na estratégia dos próximos conteúdos. Não é checklist técnico — é o que muda o jogo comercial."
        >
          {midia.instagram.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <Reveal>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                  Instagram
                  {midia.handles?.instagram ? (
                    <span style={{ color: "var(--fm-muted)", fontWeight: 400 }}> · @{midia.handles.instagram}</span>
                  ) : null}
                  <span style={{ color: "var(--fm-muted)", fontWeight: 400 }}> · {midia.instagram.length} peças</span>
                </p>
              </Reveal>
              <GradeMidia itens={midia.instagram} vertical logo={data.logo} empresa={data.empresa} aoClicar={setVideoAberto} />
            </div>
          )}

          {midia.youtube.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <Reveal>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                  YouTube
                  {midia.handles?.youtube ? (
                    <span style={{ color: "var(--fm-muted)", fontWeight: 400 }}> · @{midia.handles.youtube}</span>
                  ) : null}
                  <span style={{ color: "var(--fm-muted)", fontWeight: 400 }}> · {midia.youtube.length} vídeos</span>
                </p>
              </Reveal>
              <GradeMidia itens={midia.youtube} logo={data.logo} empresa={data.empresa} aoClicar={setVideoAberto} />
            </div>
          )}

          {midia.tiktok.length > 0 && (
            <div>
              <Reveal>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                  TikTok
                  {midia.handles?.tiktok ? (
                    <span style={{ color: "var(--fm-muted)", fontWeight: 400 }}> · @{midia.handles.tiktok}</span>
                  ) : null}
                  <span style={{ color: "var(--fm-muted)", fontWeight: 400 }}> · {midia.tiktok.length} vídeos</span>
                </p>
              </Reveal>
              <GradeMidia itens={midia.tiktok} vertical logo={data.logo} empresa={data.empresa} aoClicar={setVideoAberto} />
            </div>
          )}
        </Secao>
      )}

      {/* ---------------------------------------------------- conteúdo vs rivais */}
      {data.midiaComparativo ? (
        <SecaoMidiaComparativo
          data={data.midiaComparativo}
          onAbrir={(p) => {
            setVideoAberto({
              id: p.id,
              titulo: p.caption || p.resumo || null,
              legenda: p.caption || null,
              thumbnail: p.thumbnail || null,
              url: p.url || undefined,
              likes: p.likes ?? null,
              views: p.plays ?? null,
              tipo: p.tipo || "video",
              transcricao: p.transcricao || null,
              analise: p.analise
                ? {
                    resumo: p.analise.resumo || undefined,
                    acertou: p.analise.acertou,
                    errou: p.analise.errou,
                    gancho: p.analise.gancho || undefined,
                    cta: p.analise.cta || undefined,
                  }
                : null,
              rede: (p.rede === "tiktok" || p.rede === "youtube" || p.rede === "instagram")
                ? p.rede
                : undefined,
            });
          }}
        />
      ) : null}

      {/* ---------------------------------------------------- percepção + IA */}
      {data.percepcao && (data.percepcao.produto_declarado || data.percepcao.percepcao_real_marca || data.percepcao.percepcao_em_ia) ? (
        <Secao
          id="percepcao"
          tag="Percepção de valor"
          titulo="O que o site promete × o que o feed e a IA passam"
          sub="Três espelhos da marca: o declarado no site, o percebido no conteúdo e o que ChatGPT / Gemini / Perplexity tendem a responder."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Reveal>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
              }}>
                <div style={{
                  background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                  borderRadius: 12, padding: "16px 18px",
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Declarado
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 650, marginTop: 8, lineHeight: 1.5 }}>
                    {data.percepcao.produto_declarado || "—"}
                  </p>
                </div>
                <div style={{
                  background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                  borderRadius: 12, padding: "16px 18px",
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Percebido (feed)
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 650, marginTop: 8, lineHeight: 1.5 }}>
                    {data.percepcao.produto_percebido || "—"}
                  </p>
                </div>
              </div>
            </Reveal>

            {(data.percepcao.percepcao_real_marca || data.percepcao.percepcao_em_ia) ? (
              <Reveal delay={0.06}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: data.percepcao.percepcao_em_ia ? "1fr 1fr" : "1fr",
                  gap: 12,
                }}>
                  {data.percepcao.percepcao_real_marca ? (
                    <div style={{
                      background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                      borderRadius: 12, padding: "16px 18px",
                    }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Sensação real da marca
                      </p>
                      <p style={{ fontSize: 14, marginTop: 8, lineHeight: 1.55 }}>
                        {data.percepcao.percepcao_real_marca}
                      </p>
                    </div>
                  ) : null}
                  {data.percepcao.percepcao_em_ia ? (
                    <div style={{
                      background: "color-mix(in srgb, #a78bfa 8%, var(--fm-surface))",
                      border: "1px solid color-mix(in srgb, #a78bfa 35%, var(--fm-border))",
                      borderRadius: 12, padding: "16px 18px",
                    }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Como a IA vê
                        {data.percepcao.ia_cita_marca ? ` · cita: ${data.percepcao.ia_cita_marca}` : ""}
                      </p>
                      <p style={{ fontSize: 14, marginTop: 8, lineHeight: 1.55 }}>
                        {data.percepcao.percepcao_em_ia}
                      </p>
                    </div>
                  ) : null}
                </div>
              </Reveal>
            ) : null}

            {(data.percepcao.o_que_reforcar?.length || data.percepcao.o_que_corrigir?.length) ? (
              <Reveal delay={0.1}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <BlocoAcertoMelhoria
                    titulo="Reforçar"
                    tom="ok"
                    itens={data.percepcao.o_que_reforcar || []}
                  />
                  <BlocoAcertoMelhoria
                    titulo="Corrigir"
                    tom="warn"
                    itens={data.percepcao.o_que_corrigir || []}
                  />
                </div>
              </Reveal>
            ) : null}
          </div>
        </Secao>
      ) : null}

      {/* ---------------------------------------------------- para onde vamos */}
      <Secao
        id="plano"
        tag="Para onde vamos"
        titulo="O que muda depois dos ajustes"
        sub={
          data.teseTopo
            ? "A tese no topo vira movimento: o que fazer primeiro, com evidência e KPI."
            : (data.plano?.tese
              ?? "Corrigidos os pontos críticos, a empresa passa a ser encontrada nas buscas que hoje entregam clientes aos concorrentes — e o conteúdo deixa de ser esforço solto para virar ativo que compõe.")
        }
      >
        {data.plano?.movimentos?.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.plano.movimentos.slice(0, 5).map((p, i) => {
              const evidencia = evidenciaDoMovimento(p, {
                reputacao: data.reputacao,
                canaisScore: data.canaisScore,
              });
              return (
                <Reveal key={i} delay={i * 0.08}>
                  <div style={{
                    background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                    borderRadius: 12, padding: "16px 20px",
                    display: "flex", gap: 16, alignItems: "flex-start",
                  }}>
                    <span style={{
                      fontSize: 13, fontWeight: 800, color: "var(--fm-accent)",
                      background: "var(--fm-accent-soft)", borderRadius: 8,
                      width: 30, height: 30, display: "grid", placeItems: "center", flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{p.titulo}</p>
                      {evidencia ? (
                        <p style={{
                          fontSize: 12.5, marginTop: 8, lineHeight: 1.5,
                          padding: "8px 12px", borderRadius: 8,
                          background: "color-mix(in srgb, var(--fm-yellow) 10%, transparent)",
                          borderLeft: "3px solid var(--fm-yellow)",
                          color: "var(--fm-text)",
                        }}>
                          <span style={{
                            fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                            letterSpacing: "0.06em", color: "var(--fm-yellow)", marginRight: 6,
                          }}>
                            Evidência
                          </span>
                          {evidencia}
                        </p>
                      ) : null}
                      {p.consequencia || p.gap ? (
                        <p style={{ fontSize: 12.5, color: "var(--fm-muted)", marginTop: 8, lineHeight: 1.55 }}>
                          {p.consequencia || p.gap}
                        </p>
                      ) : null}
                      {p.acao_principal ? (
                        <p style={{ fontSize: 12.5, marginTop: 6, lineHeight: 1.55 }}>
                          <b>Ação:</b> {p.acao_principal}
                        </p>
                      ) : null}
                      <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {p.canal ? <Pill>{p.canal}</Pill> : null}
                        {p.impacto ? <Pill>impacto {p.impacto}</Pill> : null}
                        {p.esforco ? <Pill>esforço {p.esforco}</Pill> : null}
                        {p.kpi ? <Pill>KPI: {p.kpi}</Pill> : null}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <Reveal>
            <p style={{ fontSize: 13, color: "var(--fm-muted)" }}>
              O plano de prioridades ainda não foi gerado para esta análise.
            </p>
          </Reveal>
        )}
      </Secao>

      {/* ---------------------------------------------------- próxima execução */}
      {data.proximaExecucao ? (
        <SecaoProximaExecucao data={data.proximaExecucao} />
      ) : null}

      {/* ---------------------------------------------------- proposta / CTA */}
      <Secao
        id="proposta"
        tag="Fechar"
        titulo="Do diagnóstico à execução"
        sub="Marque o que quer resolver ao longo da apresentação. No final, a gente monta a proposta com o que você escolheu — ou o pacote completo."
      >
        <Reveal>
          <CtaPropostaFinal
            empresa={data.empresa}
            marcados={interesses.marcados}
            todosCanais={todosCanais}
            onPedir={(modo) =>
              interesses.pedirProposta({
                modo,
                empresa: data.empresa,
                canaisFallback: todosCanais,
              })
            }
          />
        </Reveal>
      </Secao>

      {/* popup de análise do vídeo (transcrição + legenda + leitura sob demanda) */}
      {videoAberto && (
        <VideoModal
          item={videoAberto}
          analiseId={data.analiseId ?? ""}
          onClose={() => setVideoAberto(null)}
        />
      )}

      <StickyInteressesBar
        marcados={interesses.marcados}
        onVerProposta={scrollProposta}
      />
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 11, padding: "2px 9px", borderRadius: 20,
      border: "1px solid var(--fm-border)", color: "var(--fm-muted)",
    }}>
      {children}
    </span>
  );
}

function corNota(n: number | null) {
  if (n == null) return "var(--fm-muted)";
  if (n >= 80) return "#22c55e";
  if (n >= 60) return "#84cc16";
  if (n >= 40) return "#eab308";
  return "#ef4444";
}

/* ------------------------------------------------------------ frequência */

function corRitmo(ritmo?: string | null) {
  const r = (ritmo || "").toLowerCase();
  if (r === "ativo") return "var(--fm-green)";
  if (r === "regular") return "var(--fm-accent)";
  if (r === "irregular") return "var(--fm-yellow)";
  if (r === "parado") return "var(--fm-red)";
  return "var(--fm-muted)";
}

function FrequenciaBloco({ frequencia }: {
  frequencia: NonNullable<LPData["frequencia"]>;
}) {
  const redes = (frequencia.redes ?? []).filter((r) => r.auditado);
  const fallback = !redes.length && frequencia.cliente;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Overview */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 10,
      }}>
        {(redes.length
          ? redes
          : [{
              id: "instagram",
              label: "Instagram",
              ritmo: frequencia.cliente?.ritmo || "sem leitura",
              ritmoRaw: frequencia.cliente?.ritmo,
              volume: frequencia.cliente?.leitura || frequencia.cliente?.detalhe,
              ideal: "",
              pratica: "",
              fazendo: "",
              melhorar: "",
              timing: null,
              rivais: [],
              auditado: true,
            } as RedeFreq]
        ).map((r) => (
          <div
            key={r.id}
            style={{
              background: "var(--fm-surface)",
              border: "1px solid var(--fm-border)",
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <p style={{ fontSize: 12, color: "var(--fm-muted)", fontWeight: 600 }}>{r.label}</p>
            <p style={{
              fontSize: 18, fontWeight: 800, marginTop: 6, textTransform: "capitalize",
              color: corRitmo(r.ritmoRaw || r.ritmo),
            }}>
              {r.ritmo}
            </p>
            {r.volume ? (
              <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 8, lineHeight: 1.45 }}>
                {r.volume.length > 90 ? `${r.volume.slice(0, 87)}…` : r.volume}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "var(--fm-muted)", lineHeight: 1.5 }}>
        Dias e horários abaixo são leitura <b style={{ color: "var(--fm-text)", fontWeight: 600 }}>por cima</b> da amostra
        (não um calendário editorial oficial). O que manda é constância vs concorrentes e vs a meta da rede.
      </p>

      {/* Análise por rede */}
      {redes.map((r) => (
        <div
          key={`det-${r.id}`}
          style={{
            background: "var(--fm-surface)",
            border: "1px solid var(--fm-border)",
            borderRadius: 12,
            padding: "20px 18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{r.label}</h3>
            <span style={{
              fontSize: 12, fontWeight: 700, textTransform: "capitalize",
              color: corRitmo(r.ritmoRaw || r.ritmo),
            }}>
              {r.ritmo}
            </span>
          </div>

          {r.pratica ? (
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fm-muted)" }}>
                Melhores práticas
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>{r.pratica}</p>
              <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
                <b>Meta de referência:</b> {r.ideal}
              </p>
            </div>
          ) : null}

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
            marginTop: 16,
          }}>
            <div style={{
              padding: "12px 14px", borderRadius: 10,
              background: "color-mix(in srgb, var(--fm-accent) 8%, transparent)",
              borderLeft: "3px solid var(--fm-accent)",
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-accent)", marginBottom: 6 }}>O que estão fazendo</p>
              <p style={{ fontSize: 13, lineHeight: 1.55 }}>{r.fazendo || "Sem dados suficientes."}</p>
            </div>
            <div style={{
              padding: "12px 14px", borderRadius: 10,
              background: "color-mix(in srgb, var(--fm-yellow) 10%, transparent)",
              borderLeft: "3px solid var(--fm-yellow)",
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-yellow)", marginBottom: 6 }}>O que pode melhorar</p>
              <p style={{ fontSize: 13, lineHeight: 1.55 }}>{r.melhorar || "Manter e medir."}</p>
            </div>
          </div>

          {r.timing ? (
            <p style={{ fontSize: 13, lineHeight: 1.55, marginTop: 14, color: "var(--fm-text)" }}>
              <b>Dias e horários (amostra):</b> {r.timing}
            </p>
          ) : (
            <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 14 }}>
              Sem datas suficientes na amostra para comentar dias/horários.
            </p>
          )}

          {r.rivais.length > 0 ? (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--fm-border)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fm-muted)", marginBottom: 10 }}>
                Concorrentes nesta rede
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {r.rivais.slice(0, 5).map((riv, i) => (
                  <div key={i} style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: "var(--fm-inset)",
                    border: "1px solid var(--fm-border)",
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>
                      @{riv.handle}
                      {riv.ritmo ? (
                        <span style={{
                          marginLeft: 8, fontWeight: 600, fontSize: 12, textTransform: "capitalize",
                          color: corRitmo(riv.ritmo),
                        }}>
                          {riv.ritmo}
                        </span>
                      ) : null}
                    </p>
                    {riv.volume ? (
                      <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 4, lineHeight: 1.45 }}>{riv.volume}</p>
                    ) : null}
                    {riv.timing ? (
                      <p style={{ fontSize: 12, marginTop: 6, lineHeight: 1.45 }}>{riv.timing}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ))}

      {fallback && !redes.length ? (
        <div style={{
          padding: "14px 16px", borderRadius: 10,
          background: "color-mix(in srgb, var(--fm-accent) 8%, transparent)",
          borderLeft: "3px solid var(--fm-accent)",
          fontSize: 14, lineHeight: 1.6,
        }}>
          {frequencia.cliente?.leitura || frequencia.cliente?.detalhe || "Sem dados de frequência."}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------ modal de vídeo */

type AnaliseVideo = {
  resumo?: string | null;
  acertou?: string[];
  errou?: string[];
  estrategia?: { leitura?: string | null; proximos?: string[] } | null;
  gancho?: { nota?: number; leitura?: string };
  estrutura?: { acertos?: string[]; melhorias?: string[] };
  legenda?: { acertos?: string[]; melhorias?: string[] };
  cta?: string | null;
};

function asAnalise(raw: unknown): AnaliseVideo | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as AnaliseVideo;
}

function VideoModal({ item, analiseId, onClose }: {
  item: ItemMidia; analiseId: string; onClose: () => void;
}) {
  const [analise, setAnalise] = useState<AnaliseVideo | null>(() => asAnalise(item.analise));
  const [carregando, setCarregando] = useState(!item.analise);
  const [statusMsg, setStatusMsg] = useState(
    item.analise ? "" : item.transcricao ? "Analisando a peça…" : "Transcrevendo o áudio via webhook…",
  );
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (item.analise) {
      setAnalise(asAnalise(item.analise));
      setCarregando(false);
      return;
    }
    if (!analiseId || !item.id) {
      setErro("Peça sem identificador para analisar.");
      setCarregando(false);
      return;
    }
    if (!item.transcricao) {
      setStatusMsg("Transcrevendo o áudio via webhook…");
    }
    fetch("/api/conteudo/analisar-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analise_web_id: analiseId,
        video_id: item.id,
        url: item.url || undefined,
        legenda: item.legenda || undefined,
        titulo: item.titulo || undefined,
        rede: item.rede || undefined,
        views: item.views ?? undefined,
        likes: item.likes ?? undefined,
        transcricao: item.transcricao || undefined,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.erro) setErro(typeof d.erro === "string" ? d.erro : JSON.stringify(d.erro));
        else setAnalise(asAnalise(d.analise) ?? null);
      })
      .catch((e) => setErro(String(e)))
      .finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const acertou =
    analise?.acertou?.length
      ? analise.acertou
      : [
          ...(analise?.estrutura?.acertos ?? []),
          ...(analise?.legenda?.acertos ?? []),
        ];
  const errou =
    analise?.errou?.length
      ? analise.errou
      : [
          ...(analise?.estrutura?.melhorias ?? []),
          ...(analise?.legenda?.melhorias ?? []),
        ];

  return (
    <div
      onClick={onClose}
      style={{
        minHeight: "100vh", position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center",
        justifyContent: "center", padding: 20,
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        style={{
          background: "var(--fm-bg, #0a0a0a)", border: "1px solid var(--fm-border)",
          borderRadius: 16, maxWidth: 720, width: "100%", maxHeight: "88vh",
          overflow: "auto", padding: 24,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16 }}>{item.titulo || item.legenda?.slice(0, 80) || "Peça analisada"}</p>
            <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 12, color: "var(--fm-muted)", flexWrap: "wrap" }}>
              {item.rede ? <span style={{ textTransform: "capitalize" }}>{item.rede}</span> : null}
              {item.views != null ? <span>{item.views} views</span> : null}
              {item.likes != null ? <span>{item.likes} likes</span> : null}
              {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--fm-accent)", textDecoration: "none" }}>ver original ↗</a> : null}
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "var(--fm-muted)", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {item.transcricao ? (
          <details style={{ marginBottom: 16 }}>
            <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--fm-muted)" }}>
              Transcrição do áudio
            </summary>
            <p style={{ fontSize: 13, lineHeight: 1.6, marginTop: 10, color: "var(--fm-muted)", whiteSpace: "pre-wrap" }}>
              {item.transcricao}
            </p>
          </details>
        ) : null}

        {item.legenda ? (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Legenda</p>
            <p style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{item.legenda}</p>
          </div>
        ) : null}

        <div style={{ borderTop: "1px solid var(--fm-border)", paddingTop: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Análise da peça
          </p>
          {carregando ? (
            <p style={{ fontSize: 13, color: "var(--fm-muted)" }}>
              {statusMsg || "Analisando…"}
              <span style={{ display: "block", marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                Pode levar até ~2 min na primeira vez (transcrição + leitura).
              </span>
            </p>
          ) : erro ? (
            <p style={{ fontSize: 13, color: "var(--fm-yellow)" }}>Não foi possível analisar: {erro}</p>
          ) : analise ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 13, lineHeight: 1.55 }}>
              {analise.resumo ? <p style={{ fontSize: 14, fontWeight: 500 }}>{analise.resumo}</p> : null}

              {analise.gancho?.leitura ? (
                <div style={{
                  padding: "12px 14px", borderRadius: 10,
                  background: "var(--fm-inset)", border: "1px solid var(--fm-border)",
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                    Gancho{typeof analise.gancho.nota === "number" ? ` · ${analise.gancho.nota}/10` : ""}
                  </p>
                  <p>{analise.gancho.leitura}</p>
                </div>
              ) : null}

              <BlocoAcertoMelhoria
                titulo="O que acertou"
                itens={acertou}
                tom="ok"
              />
              <BlocoAcertoMelhoria
                titulo="O que errou / ficou fraco"
                itens={errou}
                tom="warn"
              />

              {(analise.estrategia?.leitura || analise.estrategia?.proximos?.length) ? (
                <div style={{
                  padding: "14px 16px", borderRadius: 10,
                  background: "color-mix(in srgb, var(--fm-accent) 10%, transparent)",
                  borderLeft: "3px solid var(--fm-accent)",
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    Como melhorar na estratégia
                  </p>
                  {analise.estrategia?.leitura ? (
                    <p style={{ marginBottom: analise.estrategia.proximos?.length ? 10 : 0 }}>
                      {analise.estrategia.leitura}
                    </p>
                  ) : null}
                  {(analise.estrategia?.proximos ?? []).map((p, i) => (
                    <p key={i} style={{ marginBottom: 4 }}>
                      <span style={{ color: "var(--fm-accent)", marginRight: 6 }}>→</span>{p}
                    </p>
                  ))}
                </div>
              ) : null}

              {analise.cta ? (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>CTA</p>
                  <p>{analise.cta}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--fm-muted)" }}>Sem análise disponível.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function BlocoAcertoMelhoria({ titulo, itens, tom }: {
  titulo: string;
  itens?: string[];
  tom: "ok" | "warn";
}) {
  if (!itens?.length) return null;
  const cor = tom === "ok" ? "var(--fm-green)" : "var(--fm-yellow)";
  const mark = tom === "ok" ? "✓" : "✗";
  return (
    <div>
      <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: cor }}>{titulo}</p>
      {itens.map((a, i) => (
        <p key={i} style={{ marginBottom: 4 }}>
          <span style={{ color: cor, marginRight: 6 }}>{mark}</span>{a}
        </p>
      ))}
    </div>
  );
}

/** Ponte diagnóstico → conteúdo: canal dominante + próximas peças. */
function SecaoProximaExecucao({ data }: { data: NonNullable<LPData["proximaExecucao"]> }) {
  const tipoLabel = (t: string) => {
    const x = t.toLowerCase();
    if (x === "video" || x === "vídeo") return "Vídeo / Reel";
    if (x === "post") return "Post";
    if (x === "artigo") return "Artigo";
    if (x === "ad") return "Anúncio";
    return t;
  };

  return (
    <Secao
      id="execucao"
      tag="Próxima execução"
      titulo={`Começar por ${data.canal.label} — e estas peças`}
      sub="Um canal dominante (não todas as redes). As três próximas peças amarram o diagnóstico à trilha de conteúdo."
    >
      <Reveal>
        <div style={{
          background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
          borderRadius: 12, padding: "18px 20px", marginBottom: 16,
          display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start",
        }}>
          <div style={{
            flexShrink: 0, width: 56, height: 56, borderRadius: 12,
            background: "color-mix(in srgb, var(--fm-accent) 14%, transparent)",
            display: "grid", placeItems: "center",
          }}>
            <span style={{
              fontSize: 18, fontWeight: 800, color: "var(--fm-accent)",
              fontVariantNumeric: "tabular-nums",
            }}>
              {data.canal.nota != null ? Math.round(data.canal.nota) : "—"}
            </span>
          </div>
          <div style={{ flex: "1 1 240px", minWidth: 0 }}>
            <p style={{ fontWeight: 800, fontSize: 16 }}>{data.canal.label}</p>
            <p style={{ fontSize: 13, color: "var(--fm-muted)", marginTop: 6, lineHeight: 1.55 }}>
              {data.porque}
            </p>
            {data.movimento?.titulo ? (
              <p style={{ fontSize: 12.5, marginTop: 8, lineHeight: 1.5 }}>
                <b>Movimento:</b> {data.movimento.titulo}
                {data.movimento.acao ? ` — ${data.movimento.acao}` : ""}
              </p>
            ) : null}
            {data.ritmoSugerido ? (
              <p style={{ fontSize: 12, color: "var(--fm-accent)", marginTop: 8, lineHeight: 1.45 }}>
                {data.ritmoSugerido}
              </p>
            ) : null}
          </div>
        </div>
      </Reveal>

      {data.pecas.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}>
          {data.pecas.map((p, i) => (
            <Reveal key={`${p.titulo}-${i}`} delay={i * 0.06}>
              <div style={{
                background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                borderRadius: 12, padding: "16px 18px", height: "100%",
              }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                    color: "var(--fm-accent)",
                    background: "color-mix(in srgb, var(--fm-accent) 12%, transparent)",
                    padding: "2px 8px", borderRadius: 20,
                  }}>
                    {String(i + 1).padStart(2, "0")} · {tipoLabel(p.tipo)}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                    color: p.origem === "gerada" ? "var(--fm-green)" : "var(--fm-muted)",
                    border: "1px solid var(--fm-border)",
                    padding: "2px 8px", borderRadius: 20,
                  }}>
                    {p.origem === "gerada" ? "na trilha" : "sugerida"}
                  </span>
                </div>
                <p style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.4 }}>{p.titulo}</p>
                {p.angulo ? (
                  <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 8, lineHeight: 1.45 }}>
                    {p.angulo}
                  </p>
                ) : null}
                {p.status ? (
                  <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 8 }}>
                    status: {p.status}
                  </p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal>
          <p style={{ fontSize: 13, color: "var(--fm-muted)" }}>
            Canal definido. Gere o primeiro lote na trilha de conteúdo do admin para listar as peças aqui.
          </p>
        </Reveal>
      )}
    </Secao>
  );
}

/** Conteúdo analisado: cliente × rivais (transcrição + legenda). */
function SecaoMidiaComparativo({
  data,
  onAbrir,
}: {
  data: NonNullable<LPData["midiaComparativo"]>;
  onAbrir: (p: PecaAnalisadaLP) => void;
}) {
  return (
    <Secao
      id="conteudo-vs-rivais"
      tag="Conteúdo vs rivais"
      titulo="O que o feed diz — e o que o rival faz melhor"
      sub="Amostra da auditoria: transcrição + legenda de cada peça, leitura comercial e gap frente aos concorrentes."
    >
      {data.redes.map((rede, ri) => (
        <div key={rede.id} style={{ marginBottom: ri < data.redes.length - 1 ? 36 : 0 }}>
          <Reveal>
            <p style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>
              {rede.label}
              {rede.amostra?.com_analise != null ? (
                <span style={{ color: "var(--fm-muted)", fontWeight: 400, fontSize: 12 }}>
                  {" "}· {rede.amostra.com_analise} analisadas
                  {rede.amostra.com_transcricao != null
                    ? ` · ${rede.amostra.com_transcricao} com áudio`
                    : ""}
                </span>
              ) : null}
            </p>
          </Reveal>

          {rede.resumo?.leitura ? (
            <Reveal delay={0.04}>
              <div style={{
                background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                borderRadius: 12, padding: "14px 16px", marginBottom: 14,
                borderLeft: "3px solid var(--fm-accent)",
              }}>
                <p style={{ fontSize: 13.5, lineHeight: 1.55 }}>{rede.resumo.leitura}</p>
                {rede.resumo.proxima_peca ? (
                  <p style={{ fontSize: 12.5, marginTop: 8, color: "var(--fm-accent)" }}>
                    Próxima peça: {rede.resumo.proxima_peca}
                  </p>
                ) : null}
              </div>
            </Reveal>
          ) : null}

          {(rede.resumo?.cliente_faz?.length || rede.resumo?.rival_vence?.length || rede.resumo?.gaps?.length) ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 10,
              marginBottom: 16,
            }}>
              {!!rede.resumo?.cliente_faz?.length && (
                <Reveal>
                  <BlocoAcertoMelhoria titulo="Cliente acerta" tom="ok" itens={rede.resumo.cliente_faz} />
                </Reveal>
              )}
              {!!rede.resumo?.rival_vence?.length && (
                <Reveal delay={0.04}>
                  <BlocoAcertoMelhoria titulo="Rival vence" tom="warn" itens={rede.resumo.rival_vence} />
                </Reveal>
              )}
              {!!rede.resumo?.gaps?.length && (
                <Reveal delay={0.08}>
                  <BlocoAcertoMelhoria titulo="Gaps" tom="warn" itens={rede.resumo.gaps} />
                </Reveal>
              )}
            </div>
          ) : null}

          {rede.cliente.length > 0 ? (
            <div style={{ marginBottom: 18 }}>
              <p style={{
                fontSize: 11, fontWeight: 700, color: "var(--fm-muted)",
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10,
              }}>
                Suas peças analisadas
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 10,
              }}>
                {rede.cliente.map((p, i) => (
                  <PecaAnalisadaCard key={p.id + i} peca={p} onAbrir={onAbrir} delay={i * 0.04} />
                ))}
              </div>
            </div>
          ) : null}

          {rede.rivais.map((rv, i) => (
            <div key={rv.handle || i} style={{ marginBottom: 14 }}>
              <p style={{
                fontSize: 11, fontWeight: 700, color: "var(--fm-yellow)",
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10,
              }}>
                Rival {rv.nome || (rv.handle ? `@${rv.handle}` : `#${i + 1}`)}
                {rv.handle && rv.nome ? ` · @${rv.handle}` : ""}
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 10,
              }}>
                {rv.pecas.map((p, j) => (
                  <PecaAnalisadaCard key={p.id + j} peca={p} rival onAbrir={onAbrir} delay={j * 0.04} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </Secao>
  );
}

function PecaAnalisadaCard({
  peca,
  rival,
  onAbrir,
  delay = 0,
}: {
  peca: PecaAnalisadaLP;
  rival?: boolean;
  onAbrir: (p: PecaAnalisadaLP) => void;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <button
        type="button"
        onClick={() => onAbrir(peca)}
        style={{
          display: "block", width: "100%", textAlign: "left", cursor: "pointer",
          background: "var(--fm-surface)",
          border: `1px solid ${rival ? "color-mix(in srgb, var(--fm-yellow) 40%, var(--fm-border))" : "var(--fm-border)"}`,
          borderRadius: 12, padding: "14px 16px", color: "inherit",
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {peca.intencao ? (
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
              color: "var(--fm-accent)",
              background: "color-mix(in srgb, var(--fm-accent) 12%, transparent)",
              padding: "2px 8px", borderRadius: 20,
            }}>
              {peca.intencao}
            </span>
          ) : null}
          {peca.transcricao ? (
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
              color: "var(--fm-green)", border: "1px solid var(--fm-border)",
              padding: "2px 8px", borderRadius: 20,
            }}>
              com áudio
            </span>
          ) : (
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
              color: "var(--fm-muted)", border: "1px solid var(--fm-border)",
              padding: "2px 8px", borderRadius: 20,
            }}>
              só legenda
            </span>
          )}
        </div>
        <p style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.4 }}>
          {peca.resumo || peca.caption?.slice(0, 120) || "Peça analisada"}
        </p>
        {peca.analise?.errou?.[0] ? (
          <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 8, lineHeight: 1.45 }}>
            Fraco: {peca.analise.errou[0]}
          </p>
        ) : peca.analise?.acertou?.[0] ? (
          <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 8, lineHeight: 1.45 }}>
            Forte: {peca.analise.acertou[0]}
          </p>
        ) : null}
        <p style={{ fontSize: 11, color: "var(--fm-accent)", marginTop: 10 }}>Ver análise completa →</p>
      </button>
    </Reveal>
  );
}

/** Evolução do scorecard: última verificação + janelas 7/15/30. */
function SecaoEvolucao({ data }: { data: NonNullable<LPData["evolucao"]> }) {
  const d = data.recente;
  const fmtData = (em?: string | null) => {
    if (!em) return null;
    try {
      return new Date(em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    } catch {
      return null;
    }
  };

  return (
    <Secao
      id="evolucao"
      tag="Evolução"
      titulo="Antes → depois: o que mudou no scorecard"
      sub="Comparativo com a última medição e, quando o histórico permite, o delta em 7, 15 e 30 dias — a história que vende retainer."
    >
      {/* Delta geral + janelas */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        {d && d.geral_delta != null ? (
          <Reveal>
            <div style={{
              background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
              borderRadius: 12, padding: "18px 20px", minWidth: 160,
            }}>
              <p style={{
                fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em",
                color: corDelta(d.geral_delta), fontVariantNumeric: "tabular-nums",
              }}>
                {fmtDelta(d.geral_delta)}
              </p>
              <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 4 }}>
                vs última verificação
              </p>
              <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
                {d.geral_antes ?? "—"} → {d.geral_depois ?? "—"}
                {d.em ? ` · ${fmtData(d.em)}` : ""}
              </p>
            </div>
          </Reveal>
        ) : null}

        {data.janelas.map((j, i) => (
          <Reveal key={j.dias} delay={0.05 * (i + 1)}>
            <div style={{
              background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
              borderRadius: 12, padding: "18px 20px", minWidth: 140,
            }}>
              <p style={{
                fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em",
                color: corDelta(j.geral_delta), fontVariantNumeric: "tabular-nums",
              }}>
                {fmtDelta(j.geral_delta)}
              </p>
              <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 4 }}>
                em {j.label}
              </p>
              <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
                {j.geral_antes ?? "—"} → {j.geral_depois ?? "—"}
                {j.em_antes ? ` · base ${fmtData(j.em_antes)}` : ""}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Melhorou / piorou */}
      {d && ((d.melhorou?.length ?? 0) > 0 || (d.piorou?.length ?? 0) > 0) ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}>
          {(d.melhorou?.length ?? 0) > 0 ? (
            <Reveal>
              <div style={{
                background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                borderRadius: 12, padding: "16px 18px",
              }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: "var(--fm-green)",
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10,
                }}>
                  Subiu ({d.melhorou!.length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {d.melhorou!.map((r) => (
                    <div key={r.id} style={{
                      display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13,
                    }}>
                      <span>{labelCanalScore(r.id)}</span>
                      <span style={{ color: corDelta(r.delta), fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                        {r.antes} → {r.depois} ({fmtDelta(r.delta)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ) : null}
          {(d.piorou?.length ?? 0) > 0 ? (
            <Reveal delay={0.05}>
              <div style={{
                background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                borderRadius: 12, padding: "16px 18px",
              }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: "var(--fm-red)",
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10,
                }}>
                  Caiu ({d.piorou!.length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {d.piorou!.map((r) => (
                    <div key={r.id} style={{
                      display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13,
                    }}>
                      <span>{labelCanalScore(r.id)}</span>
                      <span style={{ color: corDelta(r.delta), fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                        {r.antes} → {r.depois} ({fmtDelta(r.delta)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ) : null}
        </div>
      ) : null}

      {/* Timeline */}
      {data.timeline.length >= 2 ? (
        <Reveal delay={0.1}>
          <div style={{
            background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
            borderRadius: 12, padding: "16px 18px",
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: "var(--fm-muted)",
              textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12,
            }}>
              Linha do tempo · {data.fotos} fotos
            </p>
            <div style={{
              display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 10,
            }}>
              {data.timeline.map((p, i) => {
                const max = Math.max(...data.timeline.map((t) => t.geral), 1);
                const h = Math.max(8, Math.round((p.geral / max) * 56));
                const prev = i > 0 ? data.timeline[i - 1].geral : null;
                const dd = prev != null ? p.geral - prev : null;
                return (
                  <div key={`${p.em}-${i}`} style={{ textAlign: "center", minWidth: 48 }}>
                    <div style={{
                      height: 56, display: "flex", alignItems: "flex-end", justifyContent: "center",
                    }}>
                      <div style={{
                        width: 28, height: h, borderRadius: 6,
                        background: dd != null && dd < 0
                          ? "color-mix(in srgb, var(--fm-red) 55%, var(--fm-border))"
                          : "color-mix(in srgb, var(--fm-accent) 55%, var(--fm-border))",
                      }} />
                    </div>
                    <p style={{
                      fontSize: 13, fontWeight: 700, marginTop: 6,
                      fontVariantNumeric: "tabular-nums",
                      color: corDelta(dd),
                    }}>
                      {p.geral}
                    </p>
                    <p style={{ fontSize: 10, color: "var(--fm-muted)", marginTop: 2 }}>
                      {fmtData(p.em) || "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      ) : null}
    </Secao>
  );
}

/** Reputação pública: GMB + NPS + Reclame Aqui + voz do cliente. */
function SecaoReputacao({ data }: { data: NonNullable<LPData["reputacao"]> }) {
  const papelLabel: Record<string, string> = {
    oficial: "oficial",
    filial: "filial",
    suspeito: "suspeito",
    rival: "rival",
    fraco: "fraco",
  };
  const npsCor = (n: number) =>
    n >= 50 ? "var(--fm-green)" : n >= 0 ? "var(--fm-yellow)" : "var(--fm-red)";

  return (
    <Secao
      id="reputacao"
      tag="Reputação e prova social"
      titulo="O que o mercado diz quando alguém pesquisa a marca"
      sub="Google Meu Negócio, avaliações, NPS estimado e Reclame Aqui — a voz real do cliente, não só a nota do canal."
    >
      {/* Perfil + nota */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        {data.nota_gmb != null && (
          <Reveal>
            <div style={{
              background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
              borderRadius: 12, padding: "18px 20px", minWidth: 140,
            }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: corNota(data.nota_gmb) }}>{data.nota_gmb}</p>
              <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 4 }}>
                nota GMB{data.faixa_gmb ? ` · ${data.faixa_gmb}` : ""}
              </p>
            </div>
          </Reveal>
        )}
        {data.perfil?.avaliacao != null && (
          <Reveal delay={0.05}>
            <div style={{
              background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
              borderRadius: 12, padding: "18px 20px", minWidth: 140,
            }}>
              <p style={{ fontSize: 28, fontWeight: 800 }}>{data.perfil.avaliacao}★</p>
              <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 4 }}>
                {data.perfil.total_avaliacoes != null
                  ? `${data.perfil.total_avaliacoes} avaliações Google`
                  : "no Google"}
              </p>
            </div>
          </Reveal>
        )}
        {data.nps?.nps != null && (
          <Reveal delay={0.1}>
            <div style={{
              background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
              borderRadius: 12, padding: "18px 20px", minWidth: 140,
            }}>
              <p style={{
                fontSize: 28, fontWeight: 800,
                color: npsCor(data.nps.nps),
              }}>
                {data.nps.nps > 0 ? `+${data.nps.nps}` : data.nps.nps}
              </p>
              <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 4 }}>
                NPS{data.nps.faixa ? ` · ${data.nps.faixa}` : ""}
                {data.nps.amostra != null ? ` · amostra ${data.nps.amostra}` : ""}
              </p>
            </div>
          </Reveal>
        )}
        {data.reclame_aqui?.encontrado && data.reclame_aqui.metricas.nota != null && (
          <Reveal delay={0.15}>
            <div style={{
              background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
              borderRadius: 12, padding: "18px 20px", minWidth: 140,
            }}>
              <p style={{ fontSize: 28, fontWeight: 800 }}>{data.reclame_aqui.metricas.nota}</p>
              <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 4 }}>nota Reclame Aqui</p>
            </div>
          </Reveal>
        )}
      </div>

      {data.perfil && (
        <Reveal>
          <div style={{
            background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
            borderRadius: 12, padding: "16px 18px", marginBottom: 16,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Perfil no Google
            </p>
            <p style={{ fontWeight: 700, fontSize: 15, marginTop: 6 }}>{data.perfil.nome || "—"}</p>
            <p style={{ fontSize: 13, color: "var(--fm-muted)", marginTop: 4, lineHeight: 1.45 }}>
              {[data.perfil.categoria, data.perfil.endereco, data.perfil.telefone]
                .filter(Boolean).join(" · ")}
            </p>
            {data.resumo ? (
              <p style={{ fontSize: 13.5, marginTop: 10, lineHeight: 1.55 }}>{data.resumo}</p>
            ) : null}
          </div>
        </Reveal>
      )}

      {(data.alerta_multiplos || data.multiplos || data.perfis.length > 1) && (
        <Reveal>
          <div style={{
            padding: "14px 16px", borderRadius: 12, marginBottom: 16,
            background: "color-mix(in srgb, var(--fm-yellow) 10%, transparent)",
            borderLeft: "3px solid var(--fm-yellow)",
          }}>
            <p style={{ fontSize: 13, lineHeight: 1.55 }}>
              <b>Atenção a listagens:</b>{" "}
              {data.alerta_multiplos
                || `${data.total_perfis || data.perfis.length} perfis encontrados na busca da marca.`}
              {data.suspeitos_count > 0 ? ` · ${data.suspeitos_count} suspeito(s)` : ""}
              {data.filiais_count > 0 ? ` · ${data.filiais_count} filial(is)` : ""}
            </p>
            {data.perfis.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: data.perfis.length > 1
                  ? "repeat(auto-fill, minmax(240px, 1fr))"
                  : "1fr",
                gap: 8,
                marginTop: 12,
              }}>
                {data.perfis.slice(0, 6).map((p, i) => (
                  <div key={i} style={{
                    fontSize: 12, padding: "8px 10px", borderRadius: 8,
                    background: p.escolhido
                      ? "color-mix(in srgb, var(--fm-green) 10%, transparent)"
                      : "var(--fm-inset, #0d0d0d)",
                    border: `1px solid ${p.escolhido ? "color-mix(in srgb, var(--fm-green) 35%, transparent)" : "var(--fm-border)"}`,
                  }}>
                    <span style={{ fontWeight: 700 }}>{p.nome || "—"}</span>
                    {p.papel ? (
                      <span style={{ color: "var(--fm-muted)" }}> · {papelLabel[p.papel] || p.papel}</span>
                    ) : null}
                    {p.escolhido ? (
                      <span style={{ color: "var(--fm-green)", fontWeight: 700 }}> · em uso</span>
                    ) : null}
                    {p.avaliacao != null ? (
                      <span style={{ color: "var(--fm-muted)" }}> · {p.avaliacao}★</span>
                    ) : null}
                    {p.endereco ? (
                      <p style={{ color: "var(--fm-muted)", marginTop: 2 }}>{p.endereco}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      )}

      {data.nps && (data.nps.pct_promotores != null || data.nps.temas.length > 0) && (
        <Reveal>
          <div style={{
            background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
            borderRadius: 12, padding: "16px 18px", marginBottom: 16,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              NPS a partir das avaliações
            </p>
            {(data.nps.pct_promotores != null || data.nps.pct_detratores != null) && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 10,
                marginTop: 12,
              }}>
                {[
                  { label: "Promotores", pct: data.nps.pct_promotores, cor: "var(--fm-green)" },
                  { label: "Neutros", pct: data.nps.pct_neutros, cor: "var(--fm-muted)" },
                  { label: "Detratores", pct: data.nps.pct_detratores, cor: "var(--fm-red)" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: `1px solid color-mix(in srgb, ${item.cor} 28%, var(--fm-border))`,
                      background: `color-mix(in srgb, ${item.cor} 10%, transparent)`,
                      textAlign: "center",
                    }}
                  >
                    <p style={{
                      fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em",
                      color: item.cor, fontVariantNumeric: "tabular-nums", lineHeight: 1,
                    }}>
                      {item.pct ?? "—"}{item.pct != null ? "%" : ""}
                    </p>
                    <p style={{
                      fontSize: 11, fontWeight: 700, marginTop: 6,
                      textTransform: "uppercase", letterSpacing: "0.05em",
                      color: "var(--fm-text)",
                    }}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {data.nps.sintese_voz ? (
              <p style={{ fontSize: 13.5, marginTop: 10, lineHeight: 1.55 }}>{data.nps.sintese_voz}</p>
            ) : null}
            {data.nps.temas.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {data.nps.temas.map((t, i) => (
                  <span key={i} style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 20,
                    border: "1px solid var(--fm-border)",
                    color: t.polaridade === "negativo" ? "var(--fm-red)" : "var(--fm-muted)",
                  }}>
                    {t.tema} ({t.mencoes})
                  </span>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      )}

      {data.analise_mensagens && (
        <Reveal>
          <div style={{
            background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
            borderRadius: 12, padding: "16px 18px", marginBottom: 16,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Voz do cliente (GMB + Reclame Aqui)
            </p>
            {data.analise_mensagens.alerta ? (
              <p style={{
                fontSize: 13, marginTop: 10, padding: "10px 12px", borderRadius: 8, lineHeight: 1.5,
                background: "color-mix(in srgb, var(--fm-red) 10%, transparent)",
                color: "var(--fm-red)",
              }}>
                {data.analise_mensagens.alerta}
              </p>
            ) : null}
            {data.analise_mensagens.sintese ? (
              <p style={{ fontSize: 14, marginTop: 10, lineHeight: 1.6 }}>{data.analise_mensagens.sintese}</p>
            ) : null}
            {data.analise_mensagens.prioridade ? (
              <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 8 }}>
                Prioridade: {data.analise_mensagens.prioridade}
              </p>
            ) : null}
            <div style={{
              display: "grid", gap: 14, marginTop: 14,
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            }}>
              {data.analise_mensagens.dores.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--fm-red)", marginBottom: 6 }}>Dores</p>
                  {data.analise_mensagens.dores.map((d, i) => (
                    <p key={i} style={{ fontSize: 13, marginBottom: 4, lineHeight: 1.45 }}>· {d}</p>
                  ))}
                </div>
              )}
              {data.analise_mensagens.elogios.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--fm-green)", marginBottom: 6 }}>Elogios</p>
                  {data.analise_mensagens.elogios.map((d, i) => (
                    <p key={i} style={{ fontSize: 13, marginBottom: 4, lineHeight: 1.45 }}>· {d}</p>
                  ))}
                </div>
              )}
            </div>
            {data.analise_mensagens.citacoes.length > 0 && (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {data.analise_mensagens.citacoes.map((c, i) => (
                  <blockquote key={i} style={{
                    margin: 0, padding: "10px 12px",
                    borderLeft: "3px solid var(--fm-border)",
                    fontSize: 13, color: "var(--fm-muted)", lineHeight: 1.5,
                  }}>
                    “{c.texto}”
                    {(c.fonte || c.polaridade) && (
                      <span style={{ display: "block", fontSize: 10, marginTop: 4 }}>
                        {[c.fonte, c.polaridade].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </blockquote>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      )}

      {data.reclame_aqui && (
        <Reveal>
          <div style={{
            background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
            borderRadius: 12, padding: "16px 18px", marginBottom: 16,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Reclame Aqui
            </p>
            {!data.reclame_aqui.encontrado ? (
              <p style={{ fontSize: 13, color: "var(--fm-muted)", marginTop: 8 }}>
                Não encontramos página no Reclame Aqui para esta marca.
              </p>
            ) : (
              <>
                {data.reclame_aqui.url && (
                  <a
                    href={data.reclame_aqui.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-block", marginTop: 8, fontSize: 13, fontWeight: 600, color: "var(--fm-accent)" }}
                  >
                    {data.reclame_aqui.titulo || "Abrir no Reclame Aqui"} ↗
                  </a>
                )}
                {(data.reclame_aqui.texto_pagina || data.reclame_aqui.snippet) && (
                  <p style={{
                    fontSize: 13, color: "var(--fm-muted)", marginTop: 8, lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                  }}>
                    {data.reclame_aqui.texto_pagina || data.reclame_aqui.snippet}
                  </p>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {data.reclame_aqui.metricas.taxa_resposta != null && (
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, border: "1px solid var(--fm-border)" }}>
                      resposta {data.reclame_aqui.metricas.taxa_resposta}%
                    </span>
                  )}
                  {data.reclame_aqui.metricas.taxa_resolucao != null && (
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, border: "1px solid var(--fm-border)" }}>
                      resolução {data.reclame_aqui.metricas.taxa_resolucao}%
                    </span>
                  )}
                  {data.reclame_aqui.metricas.voltaria != null && (
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, border: "1px solid var(--fm-border)" }}>
                      voltaria {data.reclame_aqui.metricas.voltaria}%
                    </span>
                  )}
                  {data.reclame_aqui.metricas.selo && (
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, border: "1px solid var(--fm-border)" }}>
                      {data.reclame_aqui.metricas.selo}
                    </span>
                  )}
                </div>
                {data.reclame_aqui.reclamacoes.length > 0 && (
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--fm-muted)" }}>Reclamações lidas</p>
                    {data.reclame_aqui.reclamacoes.map((r, i) => (
                      <div key={i} style={{
                        padding: "10px 12px", borderRadius: 8,
                        border: "1px solid var(--fm-border)", background: "var(--fm-inset, #0d0d0d)",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <p style={{ fontWeight: 600, fontSize: 13 }}>{r.titulo || `Reclamação ${i + 1}`}</p>
                          {r.status && (
                            <span style={{ fontSize: 10, color: "var(--fm-muted)", flexShrink: 0 }}>{r.status}</span>
                          )}
                        </div>
                        {r.texto && (
                          <p style={{
                            fontSize: 12, color: "var(--fm-muted)", marginTop: 6, lineHeight: 1.5,
                            whiteSpace: "pre-wrap",
                          }}>
                            {r.texto}
                          </p>
                        )}
                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "inline-block", marginTop: 6, fontSize: 11, color: "var(--fm-accent)" }}
                          >
                            Abrir no RA ↗
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </Reveal>
      )}

      {data.avaliacoes.length > 0 && (
        <Reveal>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              Avaliações recentes no Google
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.avaliacoes.map((a, i) => (
                <div key={i} style={{
                  background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                  borderRadius: 10, padding: "12px 14px",
                }}>
                  <p style={{ fontWeight: 600, fontSize: 13 }}>
                    {a.autor || "Cliente"}{a.nota != null ? ` · ${a.nota}★` : ""}
                    {a.data ? (
                      <span style={{ fontWeight: 400, color: "var(--fm-muted)", fontSize: 11 }}> · {a.data}</span>
                    ) : null}
                  </p>
                  {a.texto && (
                    <p style={{ fontSize: 13, color: "var(--fm-muted)", marginTop: 4, lineHeight: 1.5 }}>{a.texto}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </Secao>
  );
}

function SecaoAudiencia({ data }: { data: NonNullable<LPData["audiencia"]> }) {
  return (
    <Secao
      id="audiencia"
      tag="Audiência ideal"
      titulo="Para quem falar — e quem evitar"
      sub="Personas com maior chance de comprar e os perfis que drenam esforço sem retorno."
    >
      {data.resumo && (
        <Reveal>
          <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 18 }}>{data.resumo}</p>
        </Reveal>
      )}

      {(data.icp_declarado || data.icp_real || data.gap) && (
        <div style={{
          display: "grid", gap: 12, marginBottom: 20,
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        }}>
          {data.icp_declarado && (
            <Reveal>
              <div style={{
                background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                borderRadius: 12, padding: "14px 16px",
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase" }}>
                  ICP declarado
                </p>
                <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{data.icp_declarado}</p>
              </div>
            </Reveal>
          )}
          {data.icp_real && (
            <Reveal delay={0.05}>
              <div style={{
                background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                borderRadius: 12, padding: "14px 16px",
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase" }}>
                  ICP inferido
                </p>
                <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{data.icp_real}</p>
              </div>
            </Reveal>
          )}
          {data.gap && (
            <Reveal delay={0.1}>
              <div style={{
                background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                borderRadius: 12, padding: "14px 16px",
                borderLeft: "3px solid var(--fm-yellow)",
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-yellow)", textTransform: "uppercase" }}>
                  Gap
                </p>
                <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{data.gap}</p>
              </div>
            </Reveal>
          )}
        </div>
      )}

      {!!data.ideais?.length && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--fm-green)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Personas ideais
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.ideais.map((p, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div style={{
                  background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                  borderRadius: 12, padding: "14px 16px",
                }}>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{p.nome || `Persona ${i + 1}`}</p>
                  {p.por_que && (
                    <p style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{p.por_que}</p>
                  )}
                  {!!p.dores?.length && (
                    <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 8 }}>
                      Dores: {p.dores.join(" · ")}
                    </p>
                  )}
                  {!!p.o_que_converte?.length && (
                    <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 4 }}>
                      Converte: {p.o_que_converte.join(" · ")}
                    </p>
                  )}
                  {asDisplayText(p.como_falar) && (
                    <p style={{ fontSize: 12, color: "var(--fm-accent)", marginTop: 6, whiteSpace: "pre-wrap" }}>
                      Tom: {asDisplayText(p.como_falar)}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {!!data.evitar?.length && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--fm-red)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Evitar
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.evitar.map((p, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div style={{
                  background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
                  borderRadius: 12, padding: "12px 14px",
                }}>
                  <p style={{ fontWeight: 700, fontSize: 13 }}>{p.nome || `Perfil ${i + 1}`}</p>
                  {p.porque && (
                    <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 4, lineHeight: 1.45 }}>{p.porque}</p>
                  )}
                  {p.como_filtrar && (
                    <p style={{ fontSize: 12, marginTop: 4 }}>Filtrar: {p.como_filtrar}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {(!!data.pilares?.length || !!data.ctas?.length) && (
        <Reveal>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(data.pilares || []).map((p, i) => (
              <span key={`p-${i}`} style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 20,
                background: "color-mix(in srgb, var(--fm-accent) 12%, transparent)",
                color: "var(--fm-accent)", fontWeight: 600,
              }}>
                {p}
              </span>
            ))}
            {(data.ctas || []).map((c, i) => (
              <span key={`c-${i}`} style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 20,
                border: "1px solid var(--fm-border)", color: "var(--fm-muted)",
              }}>
                CTA: {c}
              </span>
            ))}
          </div>
        </Reveal>
      )}
    </Secao>
  );
}

/** Teaser curto para o canal GMB quando a prova social já está em #reputacao. */
function teaserReputacao(r: NonNullable<LPData["reputacao"]>): string {
  const bits: string[] = [];
  if (r.perfil?.avaliacao != null) {
    bits.push(
      r.perfil.total_avaliacoes != null
        ? `${r.perfil.avaliacao}★ · ${r.perfil.total_avaliacoes} reviews`
        : `${r.perfil.avaliacao}★ Google`,
    );
  }
  if (r.nps?.nps != null) {
    bits.push(`NPS ${r.nps.nps > 0 ? `+${r.nps.nps}` : r.nps.nps}`);
  }
  if (r.reclame_aqui?.encontrado && r.reclame_aqui.metricas.nota != null) {
    bits.push(`RA ${r.reclame_aqui.metricas.nota}`);
  }
  if (r.multiplos || (r.total_perfis ?? 0) > 1) {
    bits.push("múltiplas listagens");
  }
  if (bits.length) return bits.join(" · ");
  if (r.resumo?.trim()) {
    const t = r.resumo.trim();
    return t.length > 140 ? `${t.slice(0, 137)}…` : t;
  }
  return "Prova social e voz do cliente";
}

/** Um canal, expansível: resumo + o que fazer sempre visível; detalhe ao abrir. */
function CanalDetalhe({
  canal,
  marcado,
  onToggleResolver,
  loadingToggle,
  reputacao,
}: {
  canal: CanalInsight;
  marcado?: boolean;
  onToggleResolver?: () => void;
  loadingToggle?: boolean;
  /** Quando GMB já tem seção #reputacao, evita repetir NPS/RA/voz aqui. */
  reputacao?: LPData["reputacao"] | null;
}) {
  const [aberto, setAberto] = useState(false);
  const cor = corNota(canal.nota);
  const acoes = canal.oQueFazer ?? [];
  const dedupeReputacao = Boolean(reputacao && canal.id === "gmb");
  const travando = dedupeReputacao ? null : textoTravando(canal);
  const visao = textoVisaoPosAjuste(canal);
  const plano = montarPlano71530(acoes, canal.especialista);
  const nPlano = totalAcoesPlano(plano);
  const resumoHeader = dedupeReputacao && reputacao
    ? teaserReputacao(reputacao)
    : canal.resumo;

  return (
    <div style={{ background: "var(--fm-surface)", border: "1px solid var(--fm-border)", borderRadius: 12 }}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setAberto((v) => !v);
          }
        }}
        style={{
          width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
          padding: "18px 20px", color: "inherit", display: "flex", alignItems: "center", gap: 16,
        }}
      >
        <div style={{
          flexShrink: 0, width: 52, height: 52, borderRadius: 12,
          background: `color-mix(in srgb, ${cor} 14%, transparent)`,
          display: "grid", placeItems: "center",
        }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: cor }}>
            {canal.nota != null ? Math.round(canal.nota) : "—"}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <p style={{ fontWeight: 700, fontSize: 15 }}>{canal.label}</p>
            {marcado ? (
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                color: "var(--fm-accent)", background: "color-mix(in srgb, var(--fm-accent) 12%, transparent)",
                padding: "2px 8px", borderRadius: 20,
              }}>
                marcado
              </span>
            ) : null}
            {canal.prioridade === "alta" && (
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                color: "var(--fm-red)", background: "color-mix(in srgb, var(--fm-red) 12%, transparent)",
                padding: "2px 8px", borderRadius: 20,
              }}>
                prioridade
              </span>
            )}
            {dedupeReputacao ? (
              <a
                href="#reputacao"
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                  color: "var(--fm-accent)", textDecoration: "none",
                  border: "1px solid color-mix(in srgb, var(--fm-accent) 35%, var(--fm-border))",
                  padding: "2px 8px", borderRadius: 20,
                }}
              >
                detalhe em Reputação ↑
              </a>
            ) : null}
          </div>
          {resumoHeader ? (
            <TextoComGlossario
              text={resumoHeader}
              as="p"
              style={{ fontSize: 13, color: "var(--fm-muted)", marginTop: 3, lineHeight: 1.5 }}
            />
          ) : null}
        </div>
        <span style={{ flexShrink: 0, fontSize: 12, color: "var(--fm-muted)" }}>
          {nPlano > 0 ? `${nPlano} ${nPlano === 1 ? "ação" : "ações"}` : ""} {aberto ? "▲" : "▼"}
        </span>
      </div>

      {aberto && (
        <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
          {(canal.id === "site" || canal.label.toLowerCase().includes("site")) && canal.pagespeed ? (
            <PagespeedPresenca data={canal.pagespeed} />
          ) : null}

          {dedupeReputacao ? (
            <a
              href="#reputacao"
              style={{
                display: "block",
                padding: "14px 16px",
                borderRadius: 10,
                border: "1px solid color-mix(in srgb, var(--fm-accent) 35%, var(--fm-border))",
                background: "color-mix(in srgb, var(--fm-accent) 8%, transparent)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <p style={{
                fontSize: 11, fontWeight: 700, color: "var(--fm-accent)",
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
              }}>
                Detalhe em Reputação ↑
              </p>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--fm-text)" }}>
                NPS, Reclame Aqui, avaliações e voz do cliente já estão na seção Reputação —
                aqui só o plano de correção do canal.
              </p>
              {reputacao ? (
                <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 8, lineHeight: 1.4 }}>
                  {teaserReputacao(reputacao)}
                </p>
              ) : null}
            </a>
          ) : null}

          {travando ? (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-yellow)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                O que está travando
              </p>
              <TextoComGlossario
                text={travando}
                as="p"
                style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--fm-text)" }}
              />
            </div>
          ) : null}

          {nPlano > 0 ? (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                O que fazer
              </p>
              <p style={{ fontSize: 12, color: "var(--fm-muted)", marginBottom: 12, lineHeight: 1.4 }}>
                Plano para 7 / 15 / 30 dias — prazos realistas para PME.
              </p>
              <PlanoPrazoBloco plano={plano} />
            </div>
          ) : null}

          {visao ? (
            <div style={{
              padding: "14px 16px",
              borderRadius: 10,
              border: "1px solid color-mix(in srgb, var(--fm-green) 35%, var(--fm-border))",
              background: "color-mix(in srgb, var(--fm-green) 8%, transparent)",
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-green)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                O que pode acontecer ajustando
              </p>
              <TextoComGlossario
                text={visao}
                as="p"
                style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--fm-text)" }}
              />
            </div>
          ) : null}

          {onToggleResolver ? (
            <BotaoQueroResolver
              marcado={!!marcado}
              loading={loadingToggle}
              onToggle={onToggleResolver}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function PlanoPrazoBloco({ plano }: { plano: Plano71530 }) {
  const faixas: { key: keyof Plano71530; label: string; cor: string }[] = [
    { key: "d7", label: "7 dias", cor: "var(--fm-accent)" },
    { key: "d15", label: "15 dias", cor: "#eab308" },
    { key: "d30", label: "30 dias", cor: "var(--fm-muted)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {faixas.map(({ key, label, cor }) => {
        const items = plano[key];
        if (!items.length) return null;
        return (
          <div key={key}>
            <p style={{
              fontSize: 12, fontWeight: 700, color: cor, marginBottom: 8,
              letterSpacing: "0.04em",
            }}>
              Até {label}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((a, i) => (
                <AcaoPrazoCard key={i} a={a} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AcaoPrazoCard({ a }: { a: AcaoComPrazo }) {
  return (
    <div style={{
      background: "var(--fm-inset, #0d0d0d)", borderRadius: 8, padding: "10px 14px",
      borderLeft: "2px solid var(--fm-accent)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <TextoComGlossario text={a.titulo} as="p" style={{ fontSize: 13, fontWeight: 600, flex: 1 }} />
        <Pill>{a.prazo || `${a.prazoPlano} dias`}</Pill>
      </div>
      {a.como ? (
        <TextoComGlossario
          text={a.como}
          as="p"
          style={{ fontSize: 12.5, color: "var(--fm-muted)", marginTop: 4, lineHeight: 1.5 }}
        />
      ) : null}
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        {a.impacto ? <Pill>impacto {a.impacto}</Pill> : null}
        {a.esforco ? <Pill>esforço {a.esforco}</Pill> : null}
      </div>
    </div>
  );
}

type Perfil = { handle: string | null; nome?: string | null; engajamento: number | null; seguidores: number | null };

/** Comparativo cliente vs concorrentes. O cliente destacado — rival acima dele = atenção. */
function BarrasEngajamento({ cliente, rivais }: { cliente: Perfil; rivais: Perfil[] }) {
  const linhas: (Perfil & { eu: boolean })[] = [
    { ...cliente, eu: true },
    ...rivais.map((r) => ({ ...r, eu: false })),
  ].filter((l) => l.engajamento != null);
  if (!linhas.length) return null;

  const max = Math.max(...linhas.map((l) => l.engajamento as number), 0.01);
  const engCliente = cliente.engajamento;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {linhas.map((l, i) => {
        const eng = l.engajamento as number;
        const pct = (eng / max) * 100;
        const acimaDoCliente = !l.eu && engCliente != null && eng > engCliente;
        const corBarra = l.eu
          ? "var(--fm-accent)"
          : acimaDoCliente
            ? "var(--fm-yellow)"
            : "var(--fm-border)";
        const corTexto = l.eu
          ? "var(--fm-accent)"
          : acimaDoCliente
            ? "var(--fm-yellow)"
            : "var(--fm-muted)";

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: acimaDoCliente ? "6px 8px" : 0,
              margin: acimaDoCliente ? "0 -8px" : 0,
              borderRadius: acimaDoCliente ? 8 : 0,
              background: acimaDoCliente
                ? "color-mix(in srgb, var(--fm-yellow) 10%, transparent)"
                : "transparent",
              border: acimaDoCliente
                ? "1px solid color-mix(in srgb, var(--fm-yellow) 30%, transparent)"
                : "1px solid transparent",
            }}
          >
            <span style={{
              width: 130, fontSize: 12, textAlign: "right", flexShrink: 0,
              fontWeight: l.eu || acimaDoCliente ? 700 : 400,
              color: corTexto,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {l.eu ? "Você" : `@${l.handle ?? l.nome ?? "concorrente"}`}
              {acimaDoCliente ? " ↑" : ""}
            </span>
            <div style={{ flex: 1, height: 12, background: "var(--fm-inset, #0d0d0d)", borderRadius: 20, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.max(3, pct)}%` }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: "easeOut" }}
                style={{ height: "100%", borderRadius: 20, background: corBarra }}
              />
            </div>
            <span style={{
              width: 52, fontSize: 12, fontWeight: 700, textAlign: "right", flexShrink: 0,
              color: corTexto, fontVariantNumeric: "tabular-nums",
            }}>
              {eng.toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
