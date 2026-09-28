"use client";

import EspecialistaBloco from "./EspecialistaBloco";
import type { EspecialistaBloco as EspecialistaData } from "@/lib/especialista";
import { TermoLabel } from "./TermoHint";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/AdminForm";

export type AutoridadeBuscaData = {
  empresa?: string;
  site?: string | null;
  fonte?: string;
  query?: string;
  erro?: string | null;
  atualizado_em?: string;
  organicos?: {
    posicao?: number;
    titulo?: string;
    link?: string;
    snippet?: string;
    classificacao?: string | null;
    sitelinks?: { titulo?: string; link?: string }[];
  }[];
  knowledge_graph?: {
    titulo?: string;
    tipo?: string;
    descricao?: string;
    website?: string;
    imagem?: string;
  } | null;
  people_also_ask?: string[];
  buscas_relacionadas?: string[];
  checklist?: { id: string; ok: boolean; label: string; detalhe: string; peso?: string }[];
  score?: { ok?: number; total?: number };
  nota_interna?: {
    nota?: number;
    faixa?: string;
    breakdown?: Record<string, number>;
    calculado_em?: string;
  };
  historico_notas?: { em?: string; nota?: number; faixa?: string }[];
  resumo?: string;
  prioridade?: string;
  melhorias_rapidas?: {
    titulo: string;
    porque?: string;
    como?: string;
    esforco?: string;
    impacto?: string;
    categoria?: string;
    checklist_id?: string;
    evidencia?: string;
    fonte?: string;
  }[];
  especialista?: EspecialistaData | null;
};

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

function notaColor(nota?: number) {
  if (nota == null) return "var(--fm-muted)";
  if (nota >= 80) return "var(--fm-green)";
  if (nota >= 65) return "#84cc16";
  if (nota >= 45) return "#eab308";
  return "var(--fm-red)";
}

function txt(value: unknown, fallback = "—"): string {
  if (value == null || value === "") return fallback;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

const CLASS_LABEL: Record<string, string> = {
  site: "site",
  rede_social: "rede",
  wikipedia: "wiki",
  terceiro: "terceiro",
};

export default function AutoridadeBuscaPanel({
  analiseId,
  initial,
}: {
  analiseId: string;
  initial: AutoridadeBuscaData | null | undefined;
}) {
  const router = useRouter();
  const [data, setData] = useState<AutoridadeBuscaData | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function atualizar() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/conteudo/autoridade-busca/atualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analise_web_id: analiseId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao atualizar autoridade de busca");
      setData((json.autoridade_busca as AutoridadeBuscaData) ?? null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  const nota = data?.nota_interna?.nota;
  const temAuditoria = !!data && (!!data.checklist?.length || data.nota_interna != null || !!data.erro);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
        <SectionTitle sub="O que o Google mostra ao buscar o nome da empresa: Knowledge Graph, posição do site e controle da SERP de marca.">
          Autoridade de busca
        </SectionTitle>
        <button
          type="button"
          onClick={atualizar}
          disabled={loading}
          style={{
            flexShrink: 0, padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: loading ? "var(--fm-overlay)" : "var(--fm-accent)",
            color: loading ? "var(--fm-muted)" : "#fff",
            border: "none", cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Atualizando…" : temAuditoria ? "Atualizar Busca" : "Auditar Busca"}
        </button>
      </div>

      {erro && (
        <p style={{
          fontSize: 12, color: "var(--fm-red)", marginBottom: 12,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: 8, padding: "8px 12px",
        }}>
          {erro}
        </p>
      )}

      {!temAuditoria ? (
        <p style={{ color: "var(--fm-muted)", fontSize: 13 }}>
          Ainda sem auditoria de marca nesta análise. Clique em <b>Auditar Busca</b> para consultar a SERP real.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            {nota != null && (
              <span style={{
                fontSize: 18, fontWeight: 800, fontVariantNumeric: "tabular-nums",
                color: notaColor(nota), letterSpacing: "-0.02em",
              }}>
                {nota}
                <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 6, color: "var(--fm-muted)" }}>
                  nota interna · {data.nota_interna?.faixa}
                </span>
              </span>
            )}
            {data.score && (
              <span style={{ fontSize: 12, color: "var(--fm-muted)", fontVariantNumeric: "tabular-nums" }}>
                checklist {data.score.ok ?? 0}/{data.score.total ?? 0}
              </span>
            )}
            {data.query && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                background: "var(--fm-hover)", color: "var(--fm-muted)",
              }}>
                query “{data.query}”
              </span>
            )}
            {data.atualizado_em && (
              <span style={{ fontSize: 11, color: "var(--fm-muted)" }}>
                atualizado {new Date(data.atualizado_em).toLocaleString("pt-BR")}
              </span>
            )}
          </div>

          {data.nota_interna?.breakdown && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(data.nota_interna.breakdown).map(([k, v]) => (
                <span key={k} style={{
                  fontSize: 11, color: "var(--fm-muted)", background: "var(--fm-inset)",
                  border: "1px solid var(--fm-border)", borderRadius: 6, padding: "3px 8px",
                }}>
                  {k.replace("_", " ")}: <b style={{ color: "var(--fm-text)" }}>{v}</b>
                </span>
              ))}
            </div>
          )}

          {data.resumo && <p style={{ fontSize: 13, lineHeight: 1.55 }}>{txt(data.resumo, "")}</p>}
          {data.erro && <p style={{ fontSize: 12, color: "var(--fm-red)" }}>{txt(data.erro, "")}</p>}

          {data.knowledge_graph && (
            <div style={{
              padding: 14, background: "var(--fm-inset)", borderRadius: 8,
              border: "1px solid var(--fm-border)",
            }}>
              <p style={{
                fontWeight: 600, fontSize: 11, color: "var(--fm-muted)",
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
                display: "flex", alignItems: "center",
              }}>
                <TermoLabel glossKey="knowledge graph">Knowledge Graph</TermoLabel>
              </p>
              <p style={{ fontSize: 14, fontWeight: 700 }}>{txt(data.knowledge_graph.titulo)}</p>
              <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 4 }}>
                {[data.knowledge_graph.tipo, data.knowledge_graph.website].filter(Boolean).join(" · ")}
              </p>
              {data.knowledge_graph.descricao && (
                <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{data.knowledge_graph.descricao}</p>
              )}
            </div>
          )}

          {!!data.organicos?.length && (
            <div>
              <Label>Orgânicos (SERP de marca)</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {data.organicos.slice(0, 8).map((o, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", gap: 10, alignItems: "flex-start",
                      fontSize: 13, padding: "8px 10px",
                      background: "var(--fm-inset)", borderRadius: 8,
                      border: "1px solid var(--fm-border)",
                    }}
                  >
                    <span style={{
                      fontWeight: 800, fontVariantNumeric: "tabular-nums",
                      color: "var(--fm-muted)", width: 22, flexShrink: 0,
                    }}>
                      {o.posicao ?? i + 1}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <p style={{ fontWeight: 600 }}>{txt(o.titulo)}</p>
                        {o.classificacao && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                            padding: "2px 6px", borderRadius: 12,
                            background: o.classificacao === "site" ? "rgba(21,128,61,0.12)"
                              : o.classificacao === "rede_social" ? "rgba(37,99,235,0.12)" : "var(--fm-hover)",
                            color: o.classificacao === "site" ? "var(--fm-green)"
                              : o.classificacao === "rede_social" ? "#3b82f6" : "var(--fm-muted)",
                          }}>
                            {CLASS_LABEL[o.classificacao] || o.classificacao}
                          </span>
                        )}
                      </div>
                      {o.link && (
                        <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 2, wordBreak: "break-all" }}>
                          {o.link}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!data.checklist?.length && (
            <div>
              <Label>Checklist de marca</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {data.checklist.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex", gap: 10, alignItems: "flex-start",
                      fontSize: 13, padding: "8px 10px",
                      background: "var(--fm-inset)", borderRadius: 8,
                      border: "1px solid var(--fm-border)",
                    }}
                  >
                    <span style={{
                      color: c.ok ? "var(--fm-green)" : "var(--fm-red)",
                      fontWeight: 700, flexShrink: 0, width: 14,
                    }}>
                      {c.ok ? "✓" : "✕"}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 600 }}>{txt(c.label)}</p>
                      <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 2 }}>{txt(c.detalhe, "")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!data?.especialista && (
            <EspecialistaBloco data={data.especialista} />
          )}

          {!!data.melhorias_rapidas?.length && (
            <div>
              <Label>Melhorias rápidas</Label>
              <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 4, marginBottom: 0 }}>
                Só gaps do checklist ainda ✕ — cruzado com GMB / Tech SEO / redes já auditados.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {data.melhorias_rapidas.map((m, i) => (
                  <div
                    key={m.checklist_id || i}
                    style={{
                      padding: "12px 14px", background: "var(--fm-inset)", borderRadius: 8,
                      border: "1px solid var(--fm-border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                      <p style={{ fontWeight: 700, fontSize: 13 }}>{i + 1}. {txt(m.titulo)}</p>
                      <span style={{ fontSize: 10, color: "var(--fm-muted)", flexShrink: 0, textTransform: "uppercase" }}>
                        {[
                          m.checklist_id && `#${m.checklist_id}`,
                          m.impacto && `impacto ${txt(m.impacto, "")}`,
                          m.esforco && `esforço ${txt(m.esforco, "")}`,
                        ].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    {m.porque && <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 4 }}>{txt(m.porque, "")}</p>}
                    {m.evidencia && (
                      <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 4, fontStyle: "italic" }}>
                        {txt(m.evidencia, "")}
                      </p>
                    )}
                    {m.como && <p style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{txt(m.como, "")}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {temAuditoria && data && !data.erro && !(data.melhorias_rapidas?.length) && (data.score?.ok === data.score?.total) && (
            <p style={{ fontSize: 13, color: "var(--fm-green)" }}>
              Checklist de marca ok — sem melhorias rápidas pendentes nesta frente.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
