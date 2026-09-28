"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/AdminForm";

export type MovimentoImpacto = {
  ordem?: number;
  titulo?: string;
  gap?: string;
  evidencia?: string;
  consequencia?: string;
  tipo?: "receita" | "risco" | string;
  canal?: string;
  canais_cruzados?: string[];
  acao_principal?: string;
  playbook?: string[];
  kpi?: string;
  esforco?: string;
  impacto?: string;
  prazo_sugerido?: string;
  investimento_sugerido?: string;
};

export type DiretrizImpacto = {
  titulo?: string;
  porque?: string;
  como?: string;
  canal?: string;
  esforco?: string;
  impacto?: string;
};

export type BlocoPlanoAcao = {
  horizonte?: string;
  titulo?: string;
  categoria?: string;
  hipotese?: string;
  acoes?: string[] | string;
  dono_sugerido?: string;
  resultado_esperado?: string;
  kpi?: string;
};

export type MetaImpacto = {
  horizonte?: string;
  indicador?: string;
  baseline?: string;
  meta?: string;
  como_medir?: string;
  canal?: string;
};

export type Play360 = {
  acao?: string;
  canal?: string;
  prazo?: string;
  dono?: string;
  impacto_esperado?: string;
};

export type Pilar360 = {
  pilar?: string;
  titulo?: string;
  por_que_agora?: string;
  plays?: Play360[];
};

export type DiagnosticoExecutivo = {
  situacao?: string;
  travas?: string[];
  alavancas?: string[];
  percepcao_vs_oferta?: string;
};

export type NarrativaComercial = {
  gancho_reuniao?: string;
  espelho?: string;
  pedido_de_compra?: string;
  objecao_provavel?: string;
};

export type PlanoImpactoData = {
  tese?: string;
  diagnostico_executivo?: DiagnosticoExecutivo | null;
  movimentos?: MovimentoImpacto[];
  estrategia_360?: Pilar360[];
  diretrizes_agora?: DiretrizImpacto[];
  plano_acao?: BlocoPlanoAcao[];
  metas?: MetaImpacto[];
  narrativa_comercial?: NarrativaComercial | null;
  nao_fazer_agora?: string[];
  oferta_agencia?: string | null;
  aviso?: string | null;
  gerado_em?: string;
  atualizado_em?: string;
  _fonte?: string;
  snapshot?: {
    nota_media_canais?: number | null;
    empresa?: string | null;
    nicho?: string | null;
    tem_percepcao?: boolean;
  };
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontWeight: 600, fontSize: 11, color: "var(--fm-muted)",
    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
  }}>
    {children}
  </p>
);

function fmtData(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return null;
  }
}

function acoesLista(acoes: BlocoPlanoAcao["acoes"]): string[] {
  if (Array.isArray(acoes)) return acoes.filter(Boolean).map(String);
  if (typeof acoes === "string" && acoes.trim()) return [acoes];
  return [];
}

function pillTipo(tipo?: string) {
  const receita = tipo === "receita";
  return {
    bg: receita ? "rgba(21,128,61,0.12)" : "rgba(220,38,38,0.12)",
    color: receita ? "var(--fm-green)" : "var(--fm-red)",
    label: receita ? "→ receita" : "→ risco",
  };
}

function horizonteLabel(h?: string) {
  if (!h) return "—";
  const m = String(h).replace(/d$/i, "");
  if (m === "7") return "7 dias";
  if (m === "30") return "30 dias";
  if (m === "60") return "60 dias";
  if (m === "90") return "90 dias";
  return h;
}

function pilarLabel(p?: string) {
  const map: Record<string, string> = {
    posicionamento_e_oferta: "Posicionamento & oferta",
    demanda_e_midia: "Demanda & mídia",
    conteudo_e_narrativa: "Conteúdo & narrativa",
    descoberta_organica: "Descoberta orgânica",
    confianca_local_e_prova: "Confiança local & prova",
    operacao_e_ritmo: "Operação & ritmo",
  };
  return (p && map[p]) || p || "Pilar";
}

export default function ImpactoPanel({
  analiseId,
  initial,
}: {
  analiseId: string;
  initial: PlanoImpactoData | null | undefined;
}) {
  const router = useRouter();
  const [plano, setPlano] = useState<PlanoImpactoData | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/conteudo/impacto/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analise_web_id: analiseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao gerar plano de impacto");
      setPlano((data.plano_impacto as PlanoImpactoData) ?? null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar plano");
    } finally {
      setLoading(false);
    }
  }

  const movimentos = (plano?.movimentos ?? []).slice(0, 3);
  const diretrizes = plano?.diretrizes_agora ?? [];
  const blocos = plano?.plano_acao ?? [];
  const metas = plano?.metas ?? [];
  const dx = plano?.diagnostico_executivo;
  const e360 = plano?.estrategia_360 ?? [];
  const narr = plano?.narrativa_comercial;
  const naoFazer = plano?.nao_fazer_agora ?? [];
  const atualizado = fmtData(plano?.atualizado_em || plano?.gerado_em);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ fontWeight: 700, fontSize: 14 }}>Plano de impacto 360°</h2>
            <a
              href={`/fireadmin/conteudo/${analiseId}/apresentacao`}
              style={{ fontSize: 12, color: "var(--fm-accent)", textDecoration: "none", fontWeight: 600 }}
            >
              Ver como apresentação →
            </a>
          </div>
          <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 4 }}>
            Visão CEO + CMO · diagnóstico · movimentos · estratégia por pilar · 30/60/90 · pitch
          </p>
          {atualizado ? (
            <p style={{ color: "var(--fm-muted)", fontSize: 11, marginTop: 4 }}>
              Gerado {atualizado}
              {plano?._fonte ? ` · ${plano._fonte}` : ""}
              {plano?.snapshot?.nota_media_canais != null
                ? ` · média canais ${plano.snapshot.nota_media_canais}`
                : ""}
              {plano?.snapshot?.tem_percepcao ? " · com percepção" : ""}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={gerar}
          disabled={loading}
          style={{
            flexShrink: 0,
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid var(--fm-border)",
            background: loading ? "var(--fm-inset)" : "var(--fm-accent)",
            color: loading ? "var(--fm-muted)" : "#fff",
            fontWeight: 650,
            fontSize: 13,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Gerando…" : plano ? "Regenerar plano" : "Gerar plano"}
        </button>
      </div>

      {erro ? (
        <p style={{ color: "var(--fm-red)", fontSize: 13, marginBottom: 14 }}>{erro}</p>
      ) : null}

      {!plano ? (
        <p style={{ color: "var(--fm-muted)", fontSize: 13, lineHeight: 1.55 }}>
          Ainda sem plano. Gere depois de SEO, GMB, redes, ads e percepção — o motor cruza
          todos os dados como CEO/CMO e monta plays concretos (não checklist genérico).
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {plano.tese ? (
            <div style={{
              padding: "12px 14px",
              background: "var(--fm-inset)",
              borderRadius: 10,
              border: "1px solid var(--fm-border)",
            }}>
              <Label>Tese executiva</Label>
              <p style={{ fontSize: 14, lineHeight: 1.55, fontWeight: 550 }}>{plano.tese}</p>
            </div>
          ) : null}

          {plano.aviso ? (
            <p style={{ fontSize: 12, color: "var(--fm-yellow)" }}>{plano.aviso}</p>
          ) : null}

          {dx && (dx.situacao || (dx.travas && dx.travas.length) || dx.percepcao_vs_oferta) ? (
            <div>
              <Label>Diagnóstico executivo</Label>
              <div style={{
                padding: 14,
                borderRadius: 10,
                border: "1px solid var(--fm-border)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}>
                {dx.situacao ? (
                  <p style={{ fontSize: 13, lineHeight: 1.5 }}>{dx.situacao}</p>
                ) : null}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="impacto-dx">
                  {(dx.travas?.length ?? 0) > 0 ? (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-red)", marginBottom: 6 }}>Travas</p>
                      <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                        {dx.travas!.map((t, i) => (
                          <li key={i} style={{ fontSize: 12, lineHeight: 1.45 }}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {(dx.alavancas?.length ?? 0) > 0 ? (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-green)", marginBottom: 6 }}>Alavancas</p>
                      <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                        {dx.alavancas!.map((t, i) => (
                          <li key={i} style={{ fontSize: 12, lineHeight: 1.45 }}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
                {dx.percepcao_vs_oferta ? (
                  <p style={{ fontSize: 12, lineHeight: 1.5, color: "var(--fm-muted)" }}>
                    <strong style={{ color: "var(--fm-text)", fontWeight: 650 }}>Percepção × oferta:</strong>{" "}
                    {dx.percepcao_vs_oferta}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* 3 movimentos */}
          <div>
            <Label>3 movimentos de alavancagem</Label>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
            }}
              className="impacto-movs"
            >
              {movimentos.map((m, i) => {
                const pill = pillTipo(m.tipo);
                const playbook = (m.playbook ?? []).filter(Boolean);
                return (
                  <div
                    key={i}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      border: "1px solid var(--fm-border)",
                      background: "var(--fm-surface)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      minHeight: 0,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: "var(--fm-muted)",
                        letterSpacing: "0.06em",
                      }}>
                        {String(m.ordem ?? i + 1).padStart(2, "0")}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 650, padding: "2px 8px", borderRadius: 20,
                        background: pill.bg, color: pill.color,
                      }}>
                        {pill.label}
                      </span>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.35 }}>{m.titulo}</p>
                    {m.gap ? (
                      <p style={{ fontSize: 12, color: "var(--fm-muted)", lineHeight: 1.45 }}>
                        <strong style={{ color: "var(--fm-text)", fontWeight: 600 }}>Gap:</strong> {m.gap}
                      </p>
                    ) : null}
                    {m.evidencia ? (
                      <p style={{ fontSize: 11, color: "var(--fm-muted)", lineHeight: 1.4 }}>
                        Evidência: {m.evidencia}
                      </p>
                    ) : null}
                    {m.consequencia ? (
                      <p style={{ fontSize: 13, lineHeight: 1.45, fontWeight: 550 }}>{m.consequencia}</p>
                    ) : null}
                    {m.acao_principal ? (
                      <p style={{ fontSize: 12, lineHeight: 1.45 }}>
                        <strong style={{ fontWeight: 650 }}>Fazer:</strong> {m.acao_principal}
                      </p>
                    ) : null}
                    {playbook.length > 0 ? (
                      <ol style={{ margin: 0, paddingLeft: 16, fontSize: 11, lineHeight: 1.4, color: "var(--fm-muted)" }}>
                        {playbook.map((p, j) => <li key={j}>{p}</li>)}
                      </ol>
                    ) : null}
                    {m.kpi ? (
                      <p style={{ fontSize: 11, lineHeight: 1.4, marginTop: "auto" }}>
                        <strong style={{ fontWeight: 650 }}>KPI:</strong> {m.kpi}
                      </p>
                    ) : null}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                      {m.canal ? <span style={chipStyle}>{m.canal}</span> : null}
                      {(m.canais_cruzados ?? []).filter((c) => c && c !== m.canal).map((c) => (
                        <span key={c} style={chipStyle}>{c}</span>
                      ))}
                      {m.prazo_sugerido ? (
                        <span style={chipStyle}>{horizonteLabel(m.prazo_sugerido)}</span>
                      ) : null}
                      {m.esforco ? <span style={chipStyle}>esforço {m.esforco}</span> : null}
                      {m.investimento_sugerido ? (
                        <span style={chipStyle}>invest. {m.investimento_sugerido}</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estratégia 360 */}
          {e360.length > 0 ? (
            <div>
              <Label>Estratégia 360°</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {e360.map((e, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      border: "1px solid var(--fm-border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-accent)", letterSpacing: "0.04em" }}>
                          {pilarLabel(e.pilar).toUpperCase()}
                        </p>
                        <p style={{ fontWeight: 700, fontSize: 13, marginTop: 4 }}>{e.titulo}</p>
                      </div>
                    </div>
                    {e.por_que_agora ? (
                      <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 6, lineHeight: 1.45 }}>
                        {e.por_que_agora}
                      </p>
                    ) : null}
                    {(e.plays?.length ?? 0) > 0 ? (
                      <ul style={{ margin: "10px 0 0", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                        {e.plays!.map((p, j) => (
                          <li key={j} style={{ fontSize: 12, lineHeight: 1.45 }}>
                            {p.acao}
                            <span style={{ color: "var(--fm-muted)" }}>
                              {[p.canal, p.prazo ? horizonteLabel(p.prazo) : null, p.dono]
                                .filter(Boolean)
                                .map((x) => ` · ${x}`)
                                .join("")}
                            </span>
                            {p.impacto_esperado ? (
                              <span style={{ color: "var(--fm-muted)" }}> → {p.impacto_esperado}</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Diretrizes agora */}
          {diretrizes.length > 0 ? (
            <div>
              <Label>Fazer agora (7 dias)</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {diretrizes.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--fm-border)",
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: 8,
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 650, fontSize: 13 }}>{d.titulo}</p>
                      {d.porque ? (
                        <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 3, lineHeight: 1.4 }}>{d.porque}</p>
                      ) : null}
                      {d.como ? (
                        <p style={{ fontSize: 12, marginTop: 4, lineHeight: 1.45 }}>
                          <strong style={{ fontWeight: 650 }}>Como:</strong> {d.como}
                        </p>
                      ) : null}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      {d.canal ? <span style={chipStyle}>{d.canal}</span> : null}
                      {d.esforco ? <span style={chipStyle}>{d.esforco}</span> : null}
                      {d.impacto ? <span style={chipStyle}>impacto {d.impacto}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Plano 30/60/90 */}
          {blocos.length > 0 ? (
            <div>
              <Label>Roadmap 30 / 60 / 90</Label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }} className="impacto-plano">
                {blocos.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      border: "1px solid var(--fm-border)",
                      background: "var(--fm-inset)",
                    }}
                  >
                    <p style={{
                      fontSize: 11, fontWeight: 700, color: "var(--fm-accent)",
                      letterSpacing: "0.04em", marginBottom: 6,
                    }}>
                      {horizonteLabel(b.horizonte).toUpperCase()}
                      {b.categoria ? ` · ${b.categoria}` : ""}
                    </p>
                    <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{b.titulo}</p>
                    {b.hipotese ? (
                      <p style={{ fontSize: 11, color: "var(--fm-muted)", marginBottom: 8, lineHeight: 1.4 }}>
                        Hipótese: {b.hipotese}
                      </p>
                    ) : null}
                    <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                      {acoesLista(b.acoes).map((a, j) => (
                        <li key={j} style={{ fontSize: 12, lineHeight: 1.45 }}>{a}</li>
                      ))}
                    </ul>
                    {b.resultado_esperado ? (
                      <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 10, lineHeight: 1.4 }}>
                        Resultado: {b.resultado_esperado}
                      </p>
                    ) : null}
                    {b.kpi ? (
                      <p style={{ fontSize: 11, marginTop: 4, lineHeight: 1.4 }}>KPI: {b.kpi}</p>
                    ) : null}
                    {b.dono_sugerido ? (
                      <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 6 }}>
                        Dono: {b.dono_sugerido}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Metas */}
          {metas.length > 0 ? (
            <div>
              <Label>Metas honestas</Label>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "var(--fm-muted)" }}>
                      <th style={thStyle}>Prazo</th>
                      <th style={thStyle}>Indicador</th>
                      <th style={thStyle}>Baseline</th>
                      <th style={thStyle}>Meta</th>
                      <th style={thStyle}>Como medir</th>
                      <th style={thStyle}>Canal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metas.map((m, i) => (
                      <tr key={i} style={{ borderTop: "1px solid var(--fm-border)" }}>
                        <td style={tdStyle}>{horizonteLabel(m.horizonte)}</td>
                        <td style={tdStyle}>{m.indicador}</td>
                        <td style={tdStyle}>{m.baseline || "—"}</td>
                        <td style={{ ...tdStyle, fontWeight: 550 }}>{m.meta}</td>
                        <td style={tdStyle}>{m.como_medir}</td>
                        <td style={tdStyle}>{m.canal || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {narr && (narr.gancho_reuniao || narr.pedido_de_compra) ? (
            <div>
              <Label>Narrativa comercial (reunião)</Label>
              <div style={{
                padding: 14,
                borderRadius: 10,
                border: "1px solid var(--fm-border)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}>
                {narr.gancho_reuniao ? (
                  <p style={{ fontSize: 13, lineHeight: 1.5 }}>
                    <strong style={{ fontWeight: 650 }}>Gancho:</strong> {narr.gancho_reuniao}
                  </p>
                ) : null}
                {narr.espelho ? (
                  <p style={{ fontSize: 12, lineHeight: 1.45, color: "var(--fm-muted)" }}>
                    <strong style={{ color: "var(--fm-text)", fontWeight: 650 }}>Espelho:</strong> {narr.espelho}
                  </p>
                ) : null}
                {narr.pedido_de_compra ? (
                  <p style={{ fontSize: 13, lineHeight: 1.45 }}>
                    <strong style={{ fontWeight: 650 }}>Pedido:</strong> {narr.pedido_de_compra}
                  </p>
                ) : null}
                {narr.objecao_provavel ? (
                  <p style={{ fontSize: 12, lineHeight: 1.45, color: "var(--fm-muted)" }}>
                    <strong style={{ color: "var(--fm-text)", fontWeight: 650 }}>Objeção:</strong> {narr.objecao_provavel}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {naoFazer.length > 0 ? (
            <div>
              <Label>Não fazer agora</Label>
              <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                {naoFazer.map((x, i) => (
                  <li key={i} style={{ fontSize: 12, lineHeight: 1.45, color: "var(--fm-muted)" }}>{x}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {plano.oferta_agencia ? (
            <div style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px dashed var(--fm-border)",
            }}>
              <Label>Oferta à agência</Label>
              <p style={{ fontSize: 13, lineHeight: 1.5 }}>{plano.oferta_agencia}</p>
            </div>
          ) : null}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .impacto-movs, .impacto-plano, .impacto-dx {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </Card>
  );
}

const chipStyle: React.CSSProperties = {
  fontSize: 11,
  padding: "2px 8px",
  borderRadius: 20,
  background: "var(--fm-inset)",
  border: "1px solid var(--fm-border)",
  color: "var(--fm-muted)",
  whiteSpace: "nowrap",
};

const thStyle: React.CSSProperties = {
  padding: "8px 10px 8px 0",
  fontWeight: 600,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 10px 10px 0",
  verticalAlign: "top",
  lineHeight: 1.4,
};
