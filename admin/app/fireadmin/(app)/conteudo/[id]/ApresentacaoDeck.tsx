"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PlanoImpactoData } from "./ImpactoPanel";
import type { PercepcaoValorData } from "./PercepcaoPanel";
import type { CanalScore } from "@/lib/presenca-scorecard";
import type { Achado, CanalInsight } from "@/lib/apresentacao-presenca";
import type { RelatorioChapeus } from "@/lib/seis-chapeus";
import { montarChapeus } from "@/lib/seis-chapeus";
import EspecialistaBloco from "./EspecialistaBloco";
import PagespeedPresenca from "./PagespeedPresenca";
import { TextoComGlossario } from "./TermoHint";
import {
  errosSemAcoes,
  montarPlano71530,
  textoTravando,
  textoVisaoPosAjuste,
  totalAcoesPlano,
} from "@/lib/canal-diagnostico";

export type ApresentacaoPayload = {
  analiseId: string;
  empresa: string;
  url: string;
  nicho?: string | null;
  oferta?: string | null;
  geradoEm?: string | null;
  scoreGeral: number | null;
  canaisScore: CanalScore[];
  overview: {
    media: number | null;
    canaisAuditados: number;
    canaisPendentes: number;
    totalAcertos: number;
    totalErros: number;
    criticos: string[];
    fortes: string[];
  };
  canaisInsights: CanalInsight[];
  acertos: Achado[];
  erros: Achado[];
  plano: PlanoImpactoData | null;
  percepcao: PercepcaoValorData | null;
};

/** Sempre mostrar tudo — nunca truncar conteúdo da apresentação. */


function notaColor(n?: number | null) {
  if (n == null) return "var(--fm-muted)";
  if (n >= 75) return "var(--fm-green)";
  if (n >= 50) return "#eab308";
  return "var(--fm-red)";
}

function horizonte(h?: string) {
  if (!h) return "—";
  return `${String(h).replace(/d$/i, "")}d`;
}

function PillarLabel(p?: string) {
  const map: Record<string, string> = {
    posicionamento_e_oferta: "Posicionamento",
    demanda_e_midia: "Demanda & mídia",
    conteudo_e_narrativa: "Conteúdo",
    descoberta_organica: "Orgânico",
    confianca_local_e_prova: "Confiança local",
    operacao_e_ritmo: "Operação",
  };
  return (p && map[p]) || p || "Pilar";
}

const CANAL_VISUAL: Record<string, { nome: string; cor: string; fundo: string }> = {
  site: { nome: "SITE / TECH SEO", cor: "#3b82f6", fundo: "rgba(59,130,246,0.12)" },
  blog: { nome: "BLOG", cor: "#8b5cf6", fundo: "rgba(139,92,246,0.12)" },
  gmb: { nome: "GOOGLE MEU NEGÓCIO", cor: "#22c55e", fundo: "rgba(34,197,94,0.12)" },
  busca: { nome: "AUTORIDADE DE BUSCA", cor: "#06b6d4", fundo: "rgba(6,182,212,0.12)" },
  ia: { nome: "VISIBILIDADE EM IA", cor: "#a78bfa", fundo: "rgba(167,139,250,0.14)" },
  ads: { nome: "META ADS", cor: "#ec4899", fundo: "rgba(236,72,153,0.12)" },
  instagram: { nome: "INSTAGRAM", cor: "#e1306c", fundo: "rgba(225,48,108,0.14)" },
  tiktok: { nome: "TIKTOK", cor: "#14b8a6", fundo: "rgba(20,184,166,0.14)" },
  youtube: { nome: "YOUTUBE", cor: "#ef4444", fundo: "rgba(239,68,68,0.14)" },
  percepcao: { nome: "PERCEPÇÃO", cor: "#f59e0b", fundo: "rgba(245,158,11,0.14)" },
  radar: { nome: "RADAR IG", cor: "#a855f7", fundo: "rgba(168,85,247,0.14)" },
};

function canalVisual(id: string, label: string) {
  return CANAL_VISUAL[id] || { nome: label.toUpperCase(), cor: "var(--fm-accent)", fundo: "var(--fm-accent-soft)" };
}

type SlideDef = { id: string; title: string; render: () => React.ReactNode };

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      height: "100%", width: "100%", minHeight: "100%",
      overflow: "auto",
      display: "flex", flexDirection: "column", gap: 14,
      boxSizing: "border-box",
    }}>
      {children}
    </div>
  );
}

function Title({ kicker, children, right }: { kicker: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
      <div>
        <p style={eyebrow}>{kicker}</p>
        <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em", marginTop: 4, lineHeight: 1.2 }}>
          {children}
        </h2>
      </div>
      {right}
    </div>
  );
}

function Row({ ok, text }: { ok?: boolean; text: string }) {
  return (
    <div style={{
      display: "flex", gap: 8, alignItems: "flex-start",
      padding: "4px 0 0",
    }}>
      {ok != null ? (
        <span style={{
          flexShrink: 0, fontSize: 13, fontWeight: 800, width: 16,
          color: ok ? "var(--fm-green)" : "var(--fm-red)",
        }}>
          {ok ? "✓" : "✗"}
        </span>
      ) : null}
      <p style={{ fontSize: 14, lineHeight: 1.45, fontWeight: 550 }}>{text}</p>
    </div>
  );
}

function Col({
  title,
  color,
  total,
  children,
}: {
  title: string;
  color: string;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      minWidth: 0, minHeight: 0, overflow: "auto",
      display: "flex", flexDirection: "column",
      padding: "12px 14px",
      borderRadius: 12,
      border: "1px solid var(--fm-border)",
      background: "var(--fm-surface)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, flexShrink: 0 }}>
        <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color }}>{title}</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--fm-muted)" }}>{total}</p>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

/** Um slide por canal — Seis Chapéus (azul/branco no topo; amarelo/preto/verde nas colunas). */
function CanalSlide({ canal }: { canal: CanalInsight }) {
  const v = canalVisual(canal.id, canal.label);
  const hats: RelatorioChapeus = canal.chapeus || montarChapeus(canal);
  const acertos = canal.listaAcertos;
  const acoes = canal.oQueFazer || [];
  const gaps = errosSemAcoes(
    canal.listaErros.filter((e) => e.origem !== "pendente"),
    acoes,
  );
  const vermelho = hats.vermelho.intuicoes;
  const travando = textoTravando(canal);
  const visao = textoVisaoPosAjuste(canal);
  const plano = montarPlano71530(acoes, canal.especialista);
  const planoFlat = [...plano.d7, ...plano.d15, ...plano.d30];
  const nPlano = totalAcoesPlano(plano);

  return (
    <Frame>
      <div style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 18px",
        borderRadius: 12,
        background: v.fundo,
        border: `2px solid ${v.cor}`,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: "0.12em", color: v.cor }}>{v.nome}</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--fm-muted)", marginTop: 6, letterSpacing: "0.04em" }}>
            <TextoComGlossario text={hats.azul.pergunta} />
          </p>
          <div style={{ fontSize: 14, color: "var(--fm-text)", marginTop: 4, lineHeight: 1.45 }}>
            <TextoComGlossario text={hats.azul.proposito} />
          </div>
          {hats.azul.proximo_foco ? (
            <div style={{ fontSize: 13, color: "var(--fm-muted)", marginTop: 6, lineHeight: 1.4 }}>
              Próximo foco: <TextoComGlossario text={hats.azul.proximo_foco} />
            </div>
          ) : null}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: 40, fontWeight: 800, color: notaColor(canal.nota), lineHeight: 1 }}>
            {canal.nota != null ? canal.nota : "—"}
          </p>
          <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 2 }}>
            {acertos.length}✓ · {nPlano} ações
          </p>
        </div>
      </div>

      {hats.branco.fatos.length > 0 ? (
        <div style={{
          flexShrink: 0,
          display: "flex", flexWrap: "wrap", gap: 6,
          padding: "8px 10px",
          borderRadius: 10,
          border: "1px solid var(--fm-border)",
          background: "var(--fm-inset)",
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--fm-muted)", letterSpacing: "0.06em", marginRight: 4 }}>
            FATOS
          </span>
          {hats.branco.fatos.slice(0, 8).map((f, i) => (
            <span key={i} style={{
              fontSize: 12, padding: "3px 8px", borderRadius: 6,
              background: "var(--fm-surface)", border: "1px solid var(--fm-border)",
              color: "var(--fm-text)", maxWidth: "100%",
            }}>
              {f}
            </span>
          ))}
        </div>
      ) : null}

      {vermelho.length > 0 ? (
        <div style={{
          flexShrink: 0,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid rgba(239,68,68,0.25)",
          background: "rgba(239,68,68,0.06)",
        }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", color: "#ef4444", marginBottom: 6 }}>
            Percepção / tom
          </p>
          {vermelho.map((t, i) => (
            <p key={i} style={{ fontSize: 13, lineHeight: 1.4, marginTop: i ? 4 : 0 }}>{t}</p>
          ))}
        </div>
      ) : null}

      {canal.especialista ? (
        <div style={{ flexShrink: 0 }}>
          <EspecialistaBloco data={canal.especialista} compact />
        </div>
      ) : null}

      {canal.id === "site" && canal.pagespeed ? (
        <div style={{ flexShrink: 0 }}>
          <PagespeedPresenca data={canal.pagespeed} compact />
        </div>
      ) : null}

      {travando ? (
        <div style={{
          flexShrink: 0, padding: "10px 12px", borderRadius: 10,
          border: "1px solid rgba(234,179,8,0.35)", background: "rgba(234,179,8,0.08)",
        }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", color: "#eab308", marginBottom: 6 }}>
            O que está travando
          </p>
          <TextoComGlossario text={travando} as="p" style={{ fontSize: 13, lineHeight: 1.5 }} />
        </div>
      ) : null}

      <div style={{
        flex: 1, minHeight: 0,
        display: "grid",
        gridTemplateColumns: "1fr 1.2fr",
        gap: 12,
      }}>
        <Col title="Acertos" color="var(--fm-green)" total={acertos.length}>
          {acertos.map((x, i) => (
            <div key={i} style={{ padding: "6px 0", borderBottom: "1px solid var(--fm-border)" }}>
              <Row ok text={x.label} />
              {x.detalhe ? (
                <p style={{ fontSize: 12, color: "var(--fm-muted)", margin: "2px 0 0 24px", lineHeight: 1.4 }}>{x.detalhe}</p>
              ) : null}
            </div>
          ))}
          {acertos.length === 0 ? <p style={{ fontSize: 13, color: "var(--fm-muted)" }}>—</p> : null}
          {gaps.length > 0 ? (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", marginBottom: 4 }}>Sinais (sem repetir o plano)</p>
              {gaps.slice(0, 4).map((x, i) => (
                <p key={i} style={{ fontSize: 12, color: "var(--fm-muted)", lineHeight: 1.4, marginTop: 4 }}>· {x.label}</p>
              ))}
            </div>
          ) : null}
        </Col>
        <Col title="Plano 7 / 15 / 30" color="var(--fm-accent)" total={nPlano}>
          {planoFlat.map((x, i) => (
            <div key={i} style={{
              display: "flex", gap: 8, padding: "6px 0",
              borderBottom: "1px solid var(--fm-border)",
            }}>
              <span style={{
                flexShrink: 0, fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4,
                background: "var(--fm-accent-soft)", color: "var(--fm-accent)", height: "fit-content",
              }}>
                {x.prazoPlano}d
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 650, lineHeight: 1.4 }}>{x.titulo}</p>
                {x.como ? (
                  <p style={{ fontSize: 12, marginTop: 2, lineHeight: 1.4, color: "var(--fm-muted)" }}>{x.como}</p>
                ) : null}
              </div>
            </div>
          ))}
          {nPlano === 0 ? <p style={{ fontSize: 13, color: "var(--fm-muted)" }}>Sem ações</p> : null}
        </Col>
      </div>

      {visao ? (
        <div style={{
          flexShrink: 0, padding: "10px 12px", borderRadius: 10,
          border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)",
        }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", color: "var(--fm-green)", marginBottom: 6 }}>
            O que pode acontecer ajustando
          </p>
          <TextoComGlossario text={visao} as="p" style={{ fontSize: 13, lineHeight: 1.5 }} />
        </div>
      ) : null}
    </Frame>
  );
}

export default function ApresentacaoDeck({ data }: { data: ApresentacaoPayload }) {
  const [idx, setIdx] = useState(0);
  const plano = data.plano;
  const dx = plano?.diagnostico_executivo;
  const narr = plano?.narrativa_comercial;
  const perc = data.percepcao;

  const slides: SlideDef[] = useMemo(() => {
    const out: SlideDef[] = [];

    // 1. Capa
    out.push({
      id: "capa",
      title: "Capa",
      render: () => (
        <Frame>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
            <p style={eyebrow}>Firemode · Presença digital</p>
            <h1 style={{ fontSize: "clamp(54px, 7.5vw, 84px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
              {data.empresa}
            </h1>
            <p style={{ fontSize: 18, color: "var(--fm-muted)", maxWidth: 640 }}>
              Scorecard · Seis Chapéus por canal · plano 360°
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {data.scoreGeral != null ? <span style={pill}>Nota {data.scoreGeral}</span> : null}
              <span style={{ ...pill, color: "var(--fm-green)" }}>{data.overview.totalAcertos} acertos</span>
              <span style={{ ...pill, color: "var(--fm-red)" }}>{data.overview.totalErros} gaps</span>
              {data.nicho ? <span style={pill}>{data.nicho}</span> : null}
            </div>
            <p style={{ fontSize: 14, color: "var(--fm-accent)" }}>{data.url}</p>
          </div>
        </Frame>
      ),
    });

    // 2. Scorecard
    out.push({
      id: "scorecard",
      title: "Scorecard",
      render: () => (
        <Frame>
          <Title kicker="Visão geral" right={
            <p style={{ fontSize: 14, color: "var(--fm-muted)" }}>
              Fortes: {data.overview.fortes.join(", ") || "—"} · Críticos: {data.overview.criticos.join(", ") || "—"}
            </p>
          }>
            Scorecard
          </Title>
          <div style={{
            flex: 1, minHeight: 0,
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gridTemplateRows: `repeat(${Math.max(1, Math.ceil(data.canaisScore.length / 3))}, minmax(0, 1fr))`,
            gap: 10,
          }}>
            {data.canaisScore.map((c) => (
              <div key={c.id} style={{
                ...box,
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gridTemplateRows: "auto 1fr",
                columnGap: 12,
                rowGap: 4,
                alignContent: "start",
                minHeight: 0,
                overflow: "auto",
                padding: "10px 12px",
              }}>
                <p style={{
                  fontSize: 20, fontWeight: 700, color: "var(--fm-muted)",
                  textTransform: "uppercase", letterSpacing: "0.04em",
                  gridColumn: "1 / -1",
                }}>
                  {c.label}
                </p>
                <p style={{
                  fontSize: 36, fontWeight: 800, color: notaColor(c.nota),
                  lineHeight: 1, fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.03em", alignSelf: "center",
                }}>
                  {c.nota != null ? c.nota : "—"}
                </p>
                <p style={{
                  fontSize: 13, color: "var(--fm-muted)", lineHeight: 1.4,
                  alignSelf: "center",
                }}>
                  {c.detalhe}
                </p>
              </div>
            ))}
          </div>
        </Frame>
      ),
    });

    // 3. Diagnóstico
    out.push({
      id: "diagnostico",
      title: "Diagnóstico",
      render: () => (
        <Frame>
          <Title kicker="CEO + CMO">Diagnóstico executivo</Title>
          <p style={{ fontSize: 18, lineHeight: 1.45, fontWeight: 550, flexShrink: 0 }}>
            {plano?.tese || "Gere o plano de impacto para preencher este slide."}
          </p>
          <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ ...box, overflow: "auto" }}>
              <p style={{ ...eyebrow, color: "var(--fm-red)", marginBottom: 10 }}>Travas</p>
              {(dx?.travas || []).map((t, i) => <Row key={i} ok={false} text={t} />)}
            </div>
            <div style={{ ...box, overflow: "auto" }}>
              <p style={{ ...eyebrow, color: "var(--fm-green)", marginBottom: 10 }}>Alavancas</p>
              {(dx?.alavancas || []).map((t, i) => <Row key={i} ok text={t} />)}
            </div>
          </div>
          {dx?.percepcao_vs_oferta ? (
            <p style={{ fontSize: 14, color: "var(--fm-muted)", flexShrink: 0 }}>
              <strong style={{ color: "var(--fm-text)" }}>Percepção × oferta:</strong> {dx.percepcao_vs_oferta}
            </p>
          ) : null}
        </Frame>
      ),
    });

    // 4. Um slide por canal (tudo junto)
    for (const canal of data.canaisInsights) {
      const v = canalVisual(canal.id, canal.label);
      out.push({
        id: `canal-${canal.id}`,
        title: v.nome,
        render: () => <CanalSlide canal={canal} />,
      });
    }

    // 5. Percepção (+ IA)
    out.push({
      id: "percepcao",
      title: "Percepção",
      render: () => (
        <Frame>
          <Title kicker="Marca">Percepção de valor · site × feed × IA</Title>
          {!perc ? (
            <p style={{ color: "var(--fm-muted)", fontSize: 16 }}>Rode a análise de percepção.</p>
          ) : (
            <>
              <div style={{ flexShrink: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={box}>
                  <p style={eyebrow}>Declarado</p>
                  <p style={{ fontSize: 16, marginTop: 8, lineHeight: 1.4 }}>{perc.produto_declarado || "—"}</p>
                </div>
                <div style={box}>
                  <p style={eyebrow}>Percebido</p>
                  <p style={{ fontSize: 16, marginTop: 8, lineHeight: 1.4 }}>{perc.produto_percebido || "—"}</p>
                </div>
              </div>
              {(perc.percepcao_em_ia || perc.ia_cita_marca) ? (
                <div style={{
                  ...box,
                  flexShrink: 0,
                  borderColor: "color-mix(in srgb, #a78bfa 40%, var(--fm-border))",
                  background: "color-mix(in srgb, #a78bfa 8%, transparent)",
                }}>
                  <p style={{ ...eyebrow, color: "#a78bfa" }}>
                    Como a IA vê
                    {perc.ia_cita_marca ? ` · cita: ${perc.ia_cita_marca}` : ""}
                  </p>
                  <p style={{ fontSize: 15, marginTop: 8, lineHeight: 1.45 }}>
                    {perc.percepcao_em_ia || "—"}
                  </p>
                </div>
              ) : null}
              <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Col title="Reforçar" color="var(--fm-green)" total={(perc.o_que_reforcar || []).length}>
                  {(perc.o_que_reforcar || []).map((t, i) => <Row key={i} ok text={t} />)}
                </Col>
                <Col title="Corrigir" color="var(--fm-red)" total={(perc.o_que_corrigir || []).length}>
                  {(perc.o_que_corrigir || []).map((t, i) => <Row key={i} ok={false} text={t} />)}
                </Col>
              </div>
            </>
          )}
        </Frame>
      ),
    });

    // 6. 3 movimentos + estratégia / 30-60-90 (um slide)
    out.push({
      id: "plano",
      title: "Plano 360°",
      render: () => (
        <Frame>
          <Title kicker="Execução">3 movimentos · 30 / 60 / 90</Title>
          <div style={{
            flex: 1, minHeight: 0, overflow: "auto",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {(plano?.movimentos || []).map((m, i) => (
                <div key={i} style={{ ...box, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--fm-muted)" }}>
                      {String(m.ordem ?? i + 1).padStart(2, "0")}
                    </span>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      color: m.tipo === "risco" ? "var(--fm-red)" : "var(--fm-green)",
                    }}>
                      {m.tipo === "risco" ? "→ risco" : "→ receita"}
                    </span>
                  </div>
                  <p style={{ fontWeight: 750, fontSize: 16, lineHeight: 1.35 }}>{m.titulo}</p>
                  {m.gap ? (
                    <p style={{ fontSize: 12, color: "var(--fm-muted)", lineHeight: 1.45 }}>{m.gap}</p>
                  ) : null}
                  {m.acao_principal ? (
                    <p style={{ fontSize: 13, lineHeight: 1.45 }}>
                      <strong>Fazer:</strong> {m.acao_principal}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 10 }}>
              <div style={{ ...box, display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ ...eyebrow, flexShrink: 0 }}>Pilares</p>
                {(plano?.estrategia_360 || []).map((e, i) => (
                  <div key={i} style={{ borderBottom: "1px solid var(--fm-border)", paddingBottom: 6 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: "var(--fm-accent)", letterSpacing: "0.06em" }}>
                      {PillarLabel(e.pilar).toUpperCase()}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{e.titulo}</p>
                    {(e.plays || []).length > 0 ? (
                      <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 12, lineHeight: 1.45, color: "var(--fm-muted)" }}>
                        {(e.plays || []).map((p, j) => (
                          <li key={j}>
                            {[p.acao, p.canal, p.prazo, p.impacto_esperado].filter(Boolean).join(" · ")}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(plano?.plano_acao || []).map((b, i) => (
                  <div key={i} style={box}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: "var(--fm-accent)" }}>
                      {horizonte(b.horizonte).toUpperCase()} {b.categoria ? `· ${b.categoria}` : ""}
                    </p>
                    <p style={{ fontWeight: 700, fontSize: 14, marginTop: 3 }}>{b.titulo}</p>
                    <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 12, lineHeight: 1.45 }}>
                      {(Array.isArray(b.acoes) ? b.acoes : []).map((a, j) => (
                        <li key={j}>{a}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Frame>
      ),
    });

    // 7. Fechamento
    out.push({
      id: "fechamento",
      title: "Próximos caminhos",
      render: () => (
        <Frame>
          <Title kicker="Fechamento">Próximos caminhos</Title>
          <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
            <div style={{ ...box, overflow: "auto" }}>
              <p style={{ ...eyebrow, marginBottom: 8 }}>Fazer agora</p>
              {(plano?.diretrizes_agora || []).map((d, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid var(--fm-border)" }}>
                  <p style={{ fontSize: 15, fontWeight: 650 }}>{d.titulo}</p>
                  {d.como ? (
                    <p style={{ fontSize: 13, color: "var(--fm-muted)", marginTop: 2, lineHeight: 1.45 }}>
                      {d.como}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
              <div style={{ ...box, flex: 1, overflow: "auto" }}>
                <p style={{ ...eyebrow, color: "var(--fm-yellow)", marginBottom: 8 }}>Não fazer agora</p>
                {(plano?.nao_fazer_agora || []).map((x, i) => (
                  <Row key={i} ok={false} text={x} />
                ))}
              </div>
              {plano?.oferta_agencia || narr?.gancho_reuniao ? (
                <div style={box}>
                  {plano?.oferta_agencia ? (
                    <>
                      <p style={eyebrow}>Oferta</p>
                      <p style={{ fontSize: 14, marginTop: 6, lineHeight: 1.4 }}>{plano.oferta_agencia}</p>
                    </>
                  ) : null}
                  {narr?.gancho_reuniao ? (
                    <p style={{ fontSize: 13, marginTop: 10, color: "var(--fm-muted)" }}>
                      <strong style={{ color: "var(--fm-text)" }}>Gancho:</strong> {narr.gancho_reuniao}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </Frame>
      ),
    });

    return out;
  }, [data, plano, dx, narr, perc]);

  const total = slides.length;
  const go = useCallback((n: number) => {
    setIdx(Math.max(0, Math.min(total - 1, n)));
  }, [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        setIdx((i) => Math.min(total - 1, i + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Home") setIdx(0);
      else if (e.key === "End") setIdx(total - 1);
      else if (e.key === "Escape") {
        window.location.href = `/fireadmin/conteudo/${data.analiseId}`;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total, data.analiseId]);

  const slide = slides[idx];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 80,
      background: "var(--fm-bg, #0f1218)", color: "var(--fm-text)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 24px", borderBottom: "1px solid var(--fm-border)",
        background: "var(--fm-surface)", flexShrink: 0, height: 48,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <Link href={`/fireadmin/conteudo/${data.analiseId}`} style={{ color: "var(--fm-muted)", fontSize: 13, textDecoration: "none" }}>
            ← Sair
          </Link>
          <span style={{ fontSize: 13, fontWeight: 650 }}>
            {data.empresa}
          </span>
          <span style={{ fontSize: 12, color: "var(--fm-muted)", whiteSpace: "nowrap" }}>
            {idx + 1}/{total} · {slide?.title}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" onClick={() => window.print()} style={btn}>PDF</button>
          <button type="button" onClick={() => go(idx - 1)} disabled={idx === 0} style={btn}>←</button>
          <button type="button" onClick={() => go(idx + 1)} disabled={idx === total - 1} style={btn}>→</button>
        </div>
      </header>

      <div style={{
        flex: 1,
        minHeight: 0,
        display: "grid",
        placeItems: "center",
        containerType: "size",
        padding: "12px 16px",
        background: "var(--fm-bg, #0f1218)",
      }}>
        {/* Palco 16:9 — letterbox se a janela for mais alta/estreita */}
        <div
          className="apresentacao-stage"
          style={{
            aspectRatio: "16 / 9",
            width: "min(100%, calc(100cqh * 16 / 9))",
            maxWidth: "100%",
            maxHeight: "100%",
            boxSizing: "border-box",
            padding: "18px 24px 14px",
            borderRadius: 16,
            border: "1px solid var(--fm-border)",
            background: "var(--fm-surface)",
            overflow: "auto",
            boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
          }}
        >
          {slide?.render()}
        </div>
      </div>

      <style>{`
        @supports not (width: 1cqh) {
          .apresentacao-stage {
            width: min(100%, calc((100vh - 110px) * 16 / 9)) !important;
            height: auto !important;
            max-height: calc(100vh - 110px) !important;
          }
        }
        @media print {
          .apresentacao-stage {
            width: 100% !important;
            max-height: none !important;
            aspect-ratio: 16 / 9;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      <nav style={{
        display: "flex", gap: 4, justifyContent: "center", flexWrap: "nowrap",
        padding: "8px 12px 12px", borderTop: "1px solid var(--fm-border)",
        background: "var(--fm-surface)", flexShrink: 0, overflowX: "auto",
      }}>
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => go(i)}
            title={s.title}
            style={{
              flexShrink: 0,
              width: i === idx ? 18 : 7,
              height: 7,
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              background: i === idx ? "var(--fm-accent)" : "var(--fm-border)",
            }}
          />
        ))}
      </nav>
    </div>
  );
}

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--fm-muted)",
};

const box: React.CSSProperties = {
  padding: 14,
  borderRadius: 12,
  border: "1px solid var(--fm-border)",
  background: "var(--fm-surface)",
  boxSizing: "border-box",
};

const pill: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 650,
  padding: "7px 12px",
  borderRadius: 8,
  border: "1px solid var(--fm-border)",
  background: "var(--fm-inset)",
};

const btn: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid var(--fm-border)",
  background: "var(--fm-inset)",
  color: "var(--fm-text)",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
