"use client";

import { TermoLabel } from "./TermoHint";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/AdminForm";

export type AiVisibilityData = {
  atualizado_em?: string;
  erro?: string | null;
  fonte?: string | null;
  resumo?: string | null;
  ai_prep?: {
    llms_txt?: { ok?: boolean; detalhe?: string; quality_ok?: boolean };
    bots_ok?: boolean;
    bots_blocked?: string[];
  };
  nota_interna?: {
    nota?: number;
    faixa?: string;
    breakdown?: Record<string, number>;
    calculado_em?: string;
  };
  entidade?: {
    resumo?: string | null;
    publico?: string | null;
    temas?: string[];
  };
  prompts?: {
    id: string;
    prompt: string;
    tema?: string;
    share_of_answer?: number;
    engines?: {
      engine: string;
      citado?: boolean;
      posicao?: number | null;
      trecho?: string | null;
      concorrentes?: string[];
    }[];
  }[];
  concorrentes_citados?: { nome: string; aparicoes: number; dominio?: string }[];
  checklist?: { id: string; ok: boolean; label: string; detalhe: string }[];
  score?: { ok?: number; total?: number };
  melhorias_rapidas?: {
    titulo: string;
    porque?: string;
    como?: string;
    esforco?: string;
    impacto?: string;
  }[];
};

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

export default function AiVisibilityPanel({
  analiseId,
  initial,
}: {
  analiseId: string;
  initial: AiVisibilityData | null | undefined;
}) {
  const router = useRouter();
  const [data, setData] = useState<AiVisibilityData | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function atualizar() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/conteudo/ai-visibility/atualizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analise_web_id: analiseId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao atualizar visibilidade em IA");
      setData((json.ai_visibility as AiVisibilityData) ?? null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  const nota = data?.nota_interna?.nota;
  const tem = !!data && (data.nota_interna != null || !!data.prompts?.length || !!data.erro);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 14 }}>
            <TermoLabel glossKey="visibilidade em ia">Visibilidade em IA</TermoLabel>
          </h2>
          <p style={{ color: "var(--fm-muted)", fontSize: 12, marginTop: 4 }}>
            O que ChatGPT / Gemini / Perplexity tendem a responder sobre a marca — e se o site está
            pronto para ser citado.
          </p>
        </div>
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
          {loading ? "Atualizando…" : tem ? "Atualizar IA" : "Auditar IA"}
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

      {!tem ? (
        <p style={{ color: "var(--fm-muted)", fontSize: 13 }}>
          Ainda sem auditoria de IA. Ideal rodar Tech/SEO antes (llms.txt + bots) e depois{" "}
          <b>Auditar IA</b>.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            {nota != null && (
              <span style={{
                fontSize: 18, fontWeight: 800, fontVariantNumeric: "tabular-nums",
                color: notaColor(nota),
              }}>
                {nota}
                <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 6, color: "var(--fm-muted)" }}>
                  · {data.nota_interna?.faixa}
                </span>
              </span>
            )}
            {data.fonte && (
              <span style={{ fontSize: 11, color: "var(--fm-muted)" }}>fonte: {data.fonte}</span>
            )}
            {data.atualizado_em && (
              <span style={{ fontSize: 11, color: "var(--fm-muted)" }}>
                {new Date(data.atualizado_em).toLocaleString("pt-BR")}
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
                  {k.replace(/_/g, " ")}: <b style={{ color: "var(--fm-text)" }}>{v}</b>
                </span>
              ))}
            </div>
          )}

          {data.resumo && <p style={{ fontSize: 13, lineHeight: 1.55 }}>{data.resumo}</p>}

          {data.entidade?.resumo && (
            <div style={{
              padding: 12, background: "var(--fm-inset)", borderRadius: 8,
              border: "1px solid var(--fm-border)",
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                O que a IA entende
              </p>
              <p style={{ fontSize: 13, marginTop: 6, lineHeight: 1.55 }}>{data.entidade.resumo}</p>
            </div>
          )}

          {!!data.checklist?.length && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.checklist.map((c) => (
                <div key={c.id} style={{
                  display: "flex", gap: 10, fontSize: 13, padding: "8px 10px",
                  background: "var(--fm-inset)", borderRadius: 8, border: "1px solid var(--fm-border)",
                }}>
                  <span style={{ color: c.ok ? "var(--fm-green)" : "var(--fm-red)", fontWeight: 700 }}>
                    {c.ok ? "✓" : "✕"}
                  </span>
                  <div>
                    <p style={{ fontWeight: 600 }}>{c.label}</p>
                    <p style={{ fontSize: 11, color: "var(--fm-muted)" }}>{c.detalhe}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!!data.prompts?.length && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Prompts monitorados
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.prompts.map((p) => {
                  const eng = p.engines?.[0];
                  return (
                    <div key={p.id} style={{
                      padding: "12px 14px", background: "var(--fm-inset)", borderRadius: 8,
                      border: "1px solid var(--fm-border)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <p style={{ fontWeight: 650, fontSize: 13 }}>&ldquo;{p.prompt}&rdquo;</p>
                        <span style={{
                          fontSize: 11, fontWeight: 700, flexShrink: 0,
                          color: eng?.citado ? "var(--fm-green)" : "var(--fm-red)",
                        }}>
                          {eng?.citado ? "citado" : "não citado"}
                          {p.share_of_answer != null ? ` · ${p.share_of_answer}%` : ""}
                        </span>
                      </div>
                      {eng?.trecho && (
                        <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 6, lineHeight: 1.45 }}>
                          {eng.trecho}
                        </p>
                      )}
                      {!!eng?.concorrentes?.length && (
                        <p style={{ fontSize: 11, color: "var(--fm-muted)", marginTop: 6 }}>
                          Concorrentes na resposta: {eng.concorrentes.join(" · ")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!!data.melhorias_rapidas?.length && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--fm-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Melhorias para a IA te citar
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.melhorias_rapidas.map((m, i) => (
                  <div key={i} style={{
                    padding: "12px 14px", background: "var(--fm-inset)", borderRadius: 8,
                    border: "1px solid var(--fm-border)",
                  }}>
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{i + 1}. {m.titulo}</p>
                    {m.porque && <p style={{ fontSize: 12, color: "var(--fm-muted)", marginTop: 4 }}>{m.porque}</p>}
                    {m.como && <p style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{m.como}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
